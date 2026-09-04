"use server";

import { getTranslations } from "next-intl/server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { RecruiterActionState } from "@/features/recruiters/types";
import {
  hasRecruiterFieldErrors,
  isValidRecruiterId,
  validateRecruiterForm,
} from "@/features/recruiters/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const recruitersPath = "/recrutadores";

async function validationError(
  fieldErrors: NonNullable<RecruiterActionState["fieldErrors"]>,
): Promise<RecruiterActionState> {
  const t = await getTranslations("RecruiterActions");
  return {
    status: "error",
    message: t("reviewFields"),
    fieldErrors,
  };
}

async function saveError(): Promise<RecruiterActionState> {
  const t = await getTranslations("RecruiterActions");
  return {
    status: "error",
    message: t("saveFailed"),
  };
}

function revalidateRecruiterPages() {
  revalidatePath(recruitersPath);
  revalidatePath("/candidaturas");
  revalidatePath("/empresas");
  revalidatePath("/dashboard");
}

async function companyBelongsToUser(companyId: string | null, userId: string) {
  if (!companyId) return true;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && Boolean(data);
}

async function companyChangeIsCompatible(
  recruiterId: string,
  companyId: string | null,
  userId: string,
) {
  if (!companyId) return true;
  const supabase = await createClient();
  const [applicationsResult, opportunitiesResult] = await Promise.all([
    supabase
      .from("applications")
      .select("opportunity_id")
      .eq("user_id", userId)
      .eq("primary_recruiter_id", recruiterId),
    supabase
      .from("opportunities")
      .select("id, company_id")
      .eq("user_id", userId),
  ]);

  if (applicationsResult.error || opportunitiesResult.error) return false;
  const companyByOpportunity = new Map(
    opportunitiesResult.data.map((opportunity) => [
      opportunity.id,
      opportunity.company_id,
    ]),
  );

  return applicationsResult.data.every(
    (application) =>
      companyByOpportunity.get(application.opportunity_id) === companyId,
  );
}

export async function createRecruiterAction(
  _previousState: RecruiterActionState,
  formData: FormData,
): Promise<RecruiterActionState> {
  const t = await getTranslations("RecruiterActions");
  const { values, fieldErrors } = validateRecruiterForm(
    formData,
    await getTranslations("RecruiterValidation"),
  );
  if (hasRecruiterFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  if (!(await companyBelongsToUser(values.company_id, user.id))) {
    return validationError({ companyId: t("availableCompany") });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("recruiters").insert({
    user_id: user.id,
    ...values,
  });

  if (error) return saveError();
  revalidateRecruiterPages();
  redirect(`${recruitersPath}?estado=contacto-criado`);
}

export async function updateRecruiterAction(
  recruiterId: string,
  _previousState: RecruiterActionState,
  formData: FormData,
): Promise<RecruiterActionState> {
  const t = await getTranslations("RecruiterActions");
  if (!isValidRecruiterId(recruiterId)) {
    return { status: "error", message: t("invalidContact") };
  }

  const { values, fieldErrors } = validateRecruiterForm(
    formData,
    await getTranslations("RecruiterValidation"),
  );
  if (hasRecruiterFieldErrors(fieldErrors)) return validationError(fieldErrors);

  const user = await requireCurrentUser();
  if (!(await companyBelongsToUser(values.company_id, user.id))) {
    return validationError({ companyId: t("availableCompany") });
  }
  if (
    !(await companyChangeIsCompatible(recruiterId, values.company_id, user.id))
  ) {
    return validationError({
      companyId: t("incompatibleCompany"),
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recruiters")
    .update(values)
    .eq("id", recruiterId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return saveError();
  if (!data) {
    return { status: "error", message: t("unavailable") };
  }

  revalidateRecruiterPages();
  redirect(`${recruitersPath}?estado=contacto-atualizado`);
}

export async function deleteRecruiterAction(
  recruiterId: string,
  _previousState: RecruiterActionState,
  _formData: FormData,
): Promise<RecruiterActionState> {
  const t = await getTranslations("RecruiterActions");
  void _previousState;
  void _formData;

  if (!isValidRecruiterId(recruiterId)) {
    return { status: "error", message: t("invalidContact") };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recruiters")
    .delete()
    .eq("id", recruiterId)
    .eq("user_id", user.id)
    .select("id")
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

  revalidateRecruiterPages();
  redirect(`${recruitersPath}?estado=contacto-eliminado`);
}
