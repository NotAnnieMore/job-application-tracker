"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { InterviewActionState } from "@/features/interviews/types";
import {
  hasInterviewFieldErrors,
  isValidInterviewId,
  validateInterviewForm,
} from "@/features/interviews/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const interviewsPath = "/entrevistas";

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
  revalidatePath("/dashboard");
  revalidatePath("/candidaturas");
  revalidatePath("/candidaturas/[applicationId]", "page");
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

  revalidateInterviewPages();
  redirect(
    returnToApplication
      ? `/candidaturas/${values.application_id}?aviso=entrevista-atualizada`
      : `${interviewsPath}?aviso=entrevista-atualizada`,
  );
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
