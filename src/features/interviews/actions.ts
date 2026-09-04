"use server";
import { getTranslations } from "next-intl/server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { interviewStatusOptions } from "@/features/interviews/constants";
import { canCreateInterview } from "@/features/interviews/eligibility";
import type {
  InterviewActionState,
  InterviewPreparationActionState,
  InterviewStatusActionState,
} from "@/features/interviews/types";
import {
  hasInterviewFieldErrors,
  isValidInterviewId,
  validateInterviewForm,
} from "@/features/interviews/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type {
  ApplicationStatusValue,
  InterviewStatusValue,
} from "@/types/database.types";

const interviewsPath = "/entrevistas";
const quickStatusValues = new Set(
  interviewStatusOptions.map((option) => option.value),
);
const applicationStatusesAwaitingInterviewResult: ApplicationStatusValue[] = [
  "interested",
  "applied",
  "interview_scheduled",
  "interview_completed",
  "awaiting_response",
];

async function validationError(
  fieldErrors: NonNullable<InterviewActionState["fieldErrors"]>,
): Promise<InterviewActionState> {
  const t = await getTranslations("InterviewActions");
  return {
    status: "error",
    message: t("reviewFields"),
    fieldErrors,
  };
}

async function saveError(): Promise<InterviewActionState> {
  const t = await getTranslations("InterviewActions");
  return {
    status: "error",
    message: t("saveFailed"),
  };
}

function revalidateInterviewPages() {
  revalidatePath(interviewsPath);
  revalidatePath("/entrevistas/[interviewId]", "page");
  revalidatePath("/dashboard");
  revalidatePath("/candidaturas");
  revalidatePath("/candidaturas/[applicationId]", "page");
}

async function markApplicationAsAwaitingResponse(
  applicationId: string,
  userId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({ status: "awaiting_response" })
    .eq("id", applicationId)
    .eq("user_id", userId)
    .in("status", applicationStatusesAwaitingInterviewResult);

  return !error;
}

async function getApplicationCompany(applicationId: string, userId: string) {
  const supabase = await createClient();
  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("opportunity_id")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (applicationError || !application) return null;

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .select("company_id")
    .eq("id", application.opportunity_id)
    .eq("user_id", userId)
    .maybeSingle();

  return opportunityError ? null : (opportunity?.company_id ?? null);
}

async function recruiterIsCompatible(
  recruiterId: string | null,
  companyId: string,
  userId: string,
) {
  if (!recruiterId) return true;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recruiters")
    .select("company_id")
    .eq("id", recruiterId)
    .eq("user_id", userId)
    .maybeSingle();

  return (
    !error &&
    Boolean(data) &&
    (!data?.company_id || data.company_id === companyId)
  );
}

export async function createInterviewAction(
  _previousState: InterviewActionState,
  formData: FormData,
): Promise<InterviewActionState> {
  const t = await getTranslations("InterviewActions");
  const { values, fieldErrors } = validateInterviewForm(
    formData,
    await getTranslations("InterviewValidation"),
  );
  if (hasInterviewFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  const supabase = await createClient();
  // Recheck at submission: the application may have changed since the form opened.
  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id, status")
    .eq("id", values.application_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (applicationError || !application) {
    return validationError({ applicationId: t("availableApplication") });
  }
  if (!canCreateInterview(application.status)) {
    return validationError({ applicationId: t("ineligibleApplication") });
  }
  const companyId = await getApplicationCompany(values.application_id, user.id);
  if (!companyId) {
    return validationError({
      applicationId: t("availableApplication"),
    });
  }
  if (!(await recruiterIsCompatible(values.recruiter_id, companyId, user.id))) {
    return validationError({
      recruiterId: t("availableRecruiter"),
    });
  }

  const { error } = await supabase.from("interviews").insert({
    user_id: user.id,
    ...values,
  });

  if (error) return saveError();
  revalidateInterviewPages();
  redirect(`${interviewsPath}?aviso=entrevista-criada`);
}

export async function updateInterviewAction(
  interviewId: string,
  returnToApplication: boolean,
  _previousState: InterviewActionState,
  formData: FormData,
): Promise<InterviewActionState> {
  const t = await getTranslations("InterviewActions");
  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: t("invalidInterview") };
  }

  const { values, fieldErrors } = validateInterviewForm(
    formData,
    await getTranslations("InterviewValidation"),
  );
  if (hasInterviewFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  const companyId = await getApplicationCompany(values.application_id, user.id);
  if (!companyId) {
    return validationError({
      applicationId: t("availableApplication"),
    });
  }
  if (!(await recruiterIsCompatible(values.recruiter_id, companyId, user.id))) {
    return validationError({
      recruiterId: t("availableRecruiter"),
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .update(values)
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return saveError();
  if (!data) {
    return { status: "error", message: t("unavailable") };
  }

  if (
    values.status === "completed" &&
    !(await markApplicationAsAwaitingResponse(values.application_id, user.id))
  ) {
    revalidateInterviewPages();
    return {
      status: "error",
      message: t("applicationUpdateFailed"),
    };
  }

  revalidateInterviewPages();
  const returnQuery = returnToApplication ? "&regressar=candidatura" : "";
  redirect(
    `${interviewsPath}/${interviewId}?aviso=entrevista-atualizada${returnQuery}`,
  );
}

export async function updateInterviewStatusAction(
  interviewId: string,
  rawStatus: InterviewStatusValue,
): Promise<InterviewStatusActionState> {
  const t = await getTranslations("InterviewActions");
  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: t("invalidInterview") };
  }
  if (!quickStatusValues.has(rawStatus)) {
    return { status: "error", message: t("invalidStatus") };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .update({ status: rawStatus })
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .select("id, application_id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message: t("updateFailed"),
    };
  }

  if (
    rawStatus === "completed" &&
    !(await markApplicationAsAwaitingResponse(data.application_id, user.id))
  ) {
    revalidateInterviewPages();
    return {
      status: "warning",
      message: t("applicationUpdateWarning"),
    };
  }

  revalidateInterviewPages();
  revalidatePath(`${interviewsPath}/${interviewId}`);
  return { status: "success" };
}

export async function updateInterviewApplicationPreparationAction(
  interviewId: string,
  rawApplicationPreparation: string,
  rawQuestionsForCompany: string,
): Promise<InterviewPreparationActionState> {
  const t = await getTranslations("InterviewActions");
  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: t("invalidInterview") };
  }
  const applicationPreparation =
    typeof rawApplicationPreparation === "string"
      ? rawApplicationPreparation.trim()
      : "";
  const questionsForCompany =
    typeof rawQuestionsForCompany === "string"
      ? rawQuestionsForCompany.trim()
      : "";
  if (applicationPreparation.length > 10_000) {
    return {
      status: "error",
      message: t("preparationLength"),
    };
  }
  if (questionsForCompany.length > 10_000) {
    return {
      status: "error",
      message: t("questionsLength"),
    };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data: interview, error: interviewError } = await supabase
    .from("interviews")
    .select("application_id")
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (interviewError || !interview) {
    return {
      status: "error",
      message: t("preparationSaveFailed"),
    };
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .update({
      interview_preparation: applicationPreparation || null,
      questions_for_company: questionsForCompany || null,
    })
    .eq("id", interview.application_id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (applicationError || !application) {
    return {
      status: "error",
      message: t("preparationSaveFailed"),
    };
  }

  revalidatePath(`${interviewsPath}/${interviewId}`);
  revalidatePath(`/candidaturas/${application.id}`);
  return { status: "success" };
}

export async function updateInterviewOutcomeAction(
  interviewId: string,
  rawFeedback: string,
  rawResult: string,
): Promise<InterviewPreparationActionState> {
  const t = await getTranslations("InterviewActions");
  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: t("invalidInterview") };
  }
  const feedback = typeof rawFeedback === "string" ? rawFeedback.trim() : "";
  const result = typeof rawResult === "string" ? rawResult.trim() : "";
  if (feedback.length > 10_000) {
    return {
      status: "error",
      message: t("feedbackLength"),
    };
  }
  if (result.length > 4_000) {
    return {
      status: "error",
      message: t("resultLength"),
    };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .update({ feedback: feedback || null, result: result || null })
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message: t("notesSaveFailed"),
    };
  }

  revalidatePath(`${interviewsPath}/${interviewId}`);
  revalidatePath(interviewsPath);
  return { status: "success" };
}

export async function deleteInterviewAction(
  interviewId: string,
  returnToApplication: boolean,
  _previousState: InterviewActionState,
  _formData: FormData,
): Promise<InterviewActionState> {
  const t = await getTranslations("InterviewActions");
  void _previousState;
  void _formData;

  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: t("invalidInterview") };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .select("id, application_id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: t("deleteFailed"),
    };
  }
  if (!data) {
    return { status: "error", message: t("unavailable") };
  }

  revalidateInterviewPages();
  redirect(
    returnToApplication
      ? `/candidaturas/${data.application_id}?aviso=entrevista-eliminada`
      : `${interviewsPath}?aviso=entrevista-eliminada`,
  );
}
