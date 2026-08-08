"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ApplicationActionState } from "@/features/applications/types";
import {
  hasApplicationFieldErrors,
  isValidApplicationId,
  validateApplicationForm,
} from "@/features/applications/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const applicationsPath = "/candidaturas";

function validationError(
  fieldErrors: NonNullable<ApplicationActionState["fieldErrors"]>,
): ApplicationActionState {
  return {
    status: "error",
    message: "Revê os campos assinalados.",
    fieldErrors,
  };
}

async function companyBelongsToUser(companyId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && Boolean(data);
}

async function recruiterIsAvailable(
  recruiterId: string | null,
  companyId: string,
  userId: string,
) {
  if (!recruiterId) return true;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recruiters")
    .select("id, company_id")
    .eq("id", recruiterId)
    .eq("user_id", userId)
    .maybeSingle();

  return (
    !error &&
    Boolean(data) &&
    (!data?.company_id || data.company_id === companyId)
  );
}

function saveError(): ApplicationActionState {
  return {
    status: "error",
    message: "Não foi possível guardar a candidatura. Tenta novamente.",
  };
}

function revalidateApplicationPages() {
  revalidatePath(applicationsPath);
  revalidatePath("/candidaturas/[applicationId]", "page");
  revalidatePath("/empresas");
  revalidatePath("/dashboard");
}

export async function createApplicationAction(
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const { values, fieldErrors } = validateApplicationForm(formData);
  if (hasApplicationFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const user = await requireCurrentUser();
  if (!(await companyBelongsToUser(values.p_company_id, user.id))) {
    return validationError({ companyId: "Seleciona uma empresa disponível." });
  }
  if (
    !(await recruiterIsAvailable(
      values.p_primary_recruiter_id,
      values.p_company_id,
      user.id,
    ))
  ) {
    return validationError({
      primaryRecruiterId:
        "Seleciona um recrutador sem empresa ou associado a esta empresa.",
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc(
    "create_application_with_opportunity",
    values,
  );

  if (error) return saveError();

  revalidateApplicationPages();
  redirect(`${applicationsPath}?estado=candidatura-criada`);
}

export async function updateApplicationAction(
  applicationId: string,
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  if (!isValidApplicationId(applicationId)) {
    return { status: "error", message: "A candidatura indicada não é válida." };
  }

  const { values, fieldErrors } = validateApplicationForm(formData);
  if (hasApplicationFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const user = await requireCurrentUser();
  if (!(await companyBelongsToUser(values.p_company_id, user.id))) {
    return validationError({ companyId: "Seleciona uma empresa disponível." });
  }
  if (
    !(await recruiterIsAvailable(
      values.p_primary_recruiter_id,
      values.p_company_id,
      user.id,
    ))
  ) {
    return validationError({
      primaryRecruiterId:
        "Seleciona um recrutador sem empresa ou associado a esta empresa.",
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "update_application_with_opportunity",
    { p_application_id: applicationId, ...values },
  );

  if (error) return saveError();
  if (!data) {
    return {
      status: "error",
      message: "A candidatura já não está disponível.",
    };
  }

  revalidateApplicationPages();
  redirect(`${applicationsPath}/${applicationId}?aviso=candidatura-atualizada`);
}

export async function deleteApplicationAction(
  applicationId: string,
  _previousState: ApplicationActionState,
  _formData: FormData,
): Promise<ApplicationActionState> {
  void _previousState;
  void _formData;

  if (!isValidApplicationId(applicationId)) {
    return { status: "error", message: "A candidatura indicada não é válida." };
  }

  await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "delete_application_with_opportunity",
    { p_application_id: applicationId },
  );

  if (error) {
    return {
      status: "error",
      message: "Não foi possível eliminar a candidatura. Tenta novamente.",
    };
  }
  if (!data) {
    return {
      status: "error",
      message: "A candidatura já não está disponível.",
    };
  }

  revalidateApplicationPages();
  redirect(`${applicationsPath}?estado=candidatura-eliminada`);
}
