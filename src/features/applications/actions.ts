"use server";
import { getTranslations } from "next-intl/server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { applicationStatusOptions } from "@/features/applications/constants";
import type { ApplicationActionState } from "@/features/applications/types";
import {
  hasApplicationFieldErrors,
  isValidApplicationId,
  validateApplicationForm,
} from "@/features/applications/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatusValue } from "@/types/database.types";

const applicationsPath = "/candidaturas";
const quickStatusValues = new Set(
  applicationStatusOptions.map((option) => option.value),
);

async function validationError(
  fieldErrors: NonNullable<ApplicationActionState["fieldErrors"]>,
): Promise<ApplicationActionState> {
  const t = await getTranslations("ApplicationActions");
  return {
    status: "error",
    message: t("reviewFields"),
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

async function saveError(): Promise<ApplicationActionState> {
  const t = await getTranslations("ApplicationActions");
  return {
    status: "error",
    message: t("saveFailed"),
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
  const t = await getTranslations("ApplicationActions");
  const { values, fieldErrors } = validateApplicationForm(
    formData,
    await getTranslations("ApplicationValidation"),
  );
  if (hasApplicationFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const user = await requireCurrentUser();
  if (!(await companyBelongsToUser(values.p_company_id, user.id))) {
    return validationError({ companyId: t("availableCompany") });
  }
  if (
    !(await recruiterIsAvailable(
      values.p_primary_recruiter_id,
      values.p_company_id,
      user.id,
    ))
  ) {
    return validationError({
      primaryRecruiterId: t("availableRecruiter"),
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
  const t = await getTranslations("ApplicationActions");
  if (!isValidApplicationId(applicationId)) {
    return { status: "error", message: t("invalidApplication") };
  }

  const { values, fieldErrors } = validateApplicationForm(
    formData,
    await getTranslations("ApplicationValidation"),
  );
  if (hasApplicationFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const user = await requireCurrentUser();
  if (!(await companyBelongsToUser(values.p_company_id, user.id))) {
    return validationError({ companyId: t("availableCompany") });
  }
  if (
    !(await recruiterIsAvailable(
      values.p_primary_recruiter_id,
      values.p_company_id,
      user.id,
    ))
  ) {
    return validationError({
      primaryRecruiterId: t("availableRecruiter"),
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
      message: t("unavailable"),
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
  const t = await getTranslations("ApplicationActions");
  void _previousState;
  void _formData;

  if (!isValidApplicationId(applicationId)) {
    return { status: "error", message: t("invalidApplication") };
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
      message: t("deleteFailed"),
    };
  }
  if (!data) {
    return {
      status: "error",
      message: t("unavailable"),
    };
  }

  revalidateApplicationPages();
  redirect(`${applicationsPath}?estado=candidatura-eliminada`);
}

export async function updateApplicationStatusAction(
  applicationId: string,
  rawStatus: ApplicationStatusValue,
): Promise<ApplicationActionState> {
  const t = await getTranslations("ApplicationActions");
  if (!isValidApplicationId(applicationId)) {
    return { status: "error", message: t("invalidApplication") };
  }

  if (!quickStatusValues.has(rawStatus)) {
    return { status: "error", message: t("invalidStatus") };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status: rawStatus })
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message: t("updateFailed"),
    };
  }

  revalidateApplicationPages();
  revalidatePath(`${applicationsPath}/${applicationId}`);
  return { status: "idle" };
}
