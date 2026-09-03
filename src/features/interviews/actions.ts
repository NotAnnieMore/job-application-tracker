"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { interviewStatusOptions } from "@/features/interviews/constants";
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

function validationError(
  fieldErrors: NonNullable<InterviewActionState["fieldErrors"]>,
): InterviewActionState {
  return {
    status: "error",
    message: "Revê os campos assinalados.",
    fieldErrors,
  };
}

function saveError(): InterviewActionState {
  return {
    status: "error",
    message: "Não foi possível guardar a entrevista. Tenta novamente.",
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
  const { values, fieldErrors } = validateInterviewForm(formData);
  if (hasInterviewFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  const companyId = await getApplicationCompany(values.application_id, user.id);
  if (!companyId) {
    return validationError({
      applicationId: "Seleciona uma candidatura disponível.",
    });
  }
  if (!(await recruiterIsCompatible(values.recruiter_id, companyId, user.id))) {
    return validationError({
      recruiterId: "Seleciona um contacto disponível para esta empresa.",
    });
  }

  const supabase = await createClient();
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
  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: "A entrevista indicada não é válida." };
  }

  const { values, fieldErrors } = validateInterviewForm(formData);
  if (hasInterviewFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  const companyId = await getApplicationCompany(values.application_id, user.id);
  if (!companyId) {
    return validationError({
      applicationId: "Seleciona uma candidatura disponível.",
    });
  }
  if (!(await recruiterIsCompatible(values.recruiter_id, companyId, user.id))) {
    return validationError({
      recruiterId: "Seleciona um contacto disponível para esta empresa.",
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
    return { status: "error", message: "A entrevista já não está disponível." };
  }

  if (
    values.status === "completed" &&
    !(await markApplicationAsAwaitingResponse(values.application_id, user.id))
  ) {
    revalidateInterviewPages();
    return {
      status: "error",
      message:
        "A entrevista ficou concluída, mas não foi possível atualizar a candidatura. Tenta guardar novamente.",
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
  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: "A entrevista indicada não é válida." };
  }
  if (!quickStatusValues.has(rawStatus)) {
    return { status: "error", message: "Seleciona um estado válido." };
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
      message: "Não foi possível atualizar o estado. Tenta novamente.",
    };
  }

  if (
    rawStatus === "completed" &&
    !(await markApplicationAsAwaitingResponse(data.application_id, user.id))
  ) {
    revalidateInterviewPages();
    return {
      status: "warning",
      message:
        "A entrevista ficou concluída, mas não foi possível atualizar a candidatura. Altera-a manualmente para “A aguardar resposta” ou tenta novamente.",
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
  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: "A entrevista indicada não é válida." };
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
      message: "O guião pode ter no máximo 10 000 caracteres.",
    };
  }
  if (questionsForCompany.length > 10_000) {
    return {
      status: "error",
      message: "As perguntas podem ter no máximo 10 000 caracteres.",
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
      message: "Não foi possível guardar o guião. Tenta novamente.",
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
      message: "Não foi possível guardar o guião. Tenta novamente.",
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
  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: "A entrevista indicada não é válida." };
  }
  const feedback = typeof rawFeedback === "string" ? rawFeedback.trim() : "";
  const result = typeof rawResult === "string" ? rawResult.trim() : "";
  if (feedback.length > 10_000) {
    return {
      status: "error",
      message: "O feedback pode ter no máximo 10 000 caracteres.",
    };
  }
  if (result.length > 4_000) {
    return {
      status: "error",
      message: "O resultado pode ter no máximo 4 000 caracteres.",
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
      message: "Não foi possível guardar as notas. Tenta novamente.",
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
  void _previousState;
  void _formData;

  if (!isValidInterviewId(interviewId)) {
    return { status: "error", message: "A entrevista indicada não é válida." };
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
      message: "Não foi possível eliminar a entrevista. Tenta novamente.",
    };
  }
  if (!data) {
    return { status: "error", message: "A entrevista já não está disponível." };
  }

  revalidateInterviewPages();
  redirect(
    returnToApplication
      ? `/candidaturas/${data.application_id}?aviso=entrevista-eliminada`
      : `${interviewsPath}?aviso=entrevista-eliminada`,
  );
}
