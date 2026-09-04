"use server";

import { getTranslations } from "next-intl/server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  BulkCompanyLogoActionResult,
  CompanyActionState,
  CompanyLogoSelection,
  QuickCompanyActionState,
} from "@/features/companies/types";
import {
  hasCompanyFieldErrors,
  validateCompanyForm,
} from "@/features/companies/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/validation";

const companiesPath = "/empresas";

async function validationError(
  fieldErrors: NonNullable<CompanyActionState["fieldErrors"]>,
): Promise<CompanyActionState> {
  const t = await getTranslations("CompanyActions");
  return {
    status: "error",
    message: t("reviewFields"),
    fieldErrors,
  };
}

async function databaseError(code?: string): Promise<CompanyActionState> {
  const t = await getTranslations("CompanyActions");
  if (code === "23505") {
    return {
      status: "error",
      message: t("duplicateName"),
      fieldErrors: {
        name: t("differentName"),
      },
    };
  }

  return {
    status: "error",
    message: t("saveFailed"),
  };
}

export async function createCompanyAction(
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const { values, fieldErrors } = validateCompanyForm(
    formData,
    await getTranslations("CompanyValidation"),
  );

  if (hasCompanyFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase.from("companies").insert({
    user_id: user.id,
    ...values,
  });

  if (error) return databaseError(error.code);

  revalidatePath(companiesPath);
  redirect(`${companiesPath}?estado=empresa-criada`);
}

export async function createQuickCompanyAction(
  _previousState: QuickCompanyActionState,
  formData: FormData,
): Promise<QuickCompanyActionState> {
  const { values, fieldErrors } = validateCompanyForm(
    formData,
    await getTranslations("CompanyValidation"),
  );

  if (hasCompanyFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({
      user_id: user.id,
      ...values,
    })
    .select("id, name")
    .single();

  if (error || !data) return databaseError(error?.code);

  revalidatePath(companiesPath);
  revalidatePath("/candidaturas");

  return {
    status: "success",
    company: data,
  };
}

export async function updateCompanyAction(
  companyId: string,
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const t = await getTranslations("CompanyActions");
  if (!isValidUuid(companyId)) {
    return { status: "error", message: t("invalidCompany") };
  }

  const { values, fieldErrors } = validateCompanyForm(
    formData,
    await getTranslations("CompanyValidation"),
  );

  if (hasCompanyFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .update(values)
    .eq("id", companyId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return databaseError(error.code);
  if (!data) {
    return { status: "error", message: t("unavailable") };
  }

  revalidatePath(companiesPath);
  redirect(`${companiesPath}?estado=empresa-atualizada`);
}

export async function deleteCompanyAction(
  companyId: string,
  _previousState: CompanyActionState,
  _formData: FormData,
): Promise<CompanyActionState> {
  const t = await getTranslations("CompanyActions");
  void _previousState;
  void _formData;

  if (!isValidUuid(companyId)) {
    return { status: "error", message: t("invalidCompany") };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    return {
      status: "error",
      message: t("hasJobs"),
    };
  }

  if (error) {
    return {
      status: "error",
      message: t("deleteFailed"),
    };
  }

  if (!data) {
    return { status: "error", message: t("unavailable") };
  }

  revalidatePath(companiesPath);
  redirect(`${companiesPath}?estado=empresa-eliminada`);
}

function normalizeHttpsUrl(value: string, maxLength: number) {
  if (!value || value.length > maxLength) return null;

  try {
    const url = new URL(value);
    if (!url.hostname || url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function updateCompanyLogosAction(
  selections: CompanyLogoSelection[],
): Promise<BulkCompanyLogoActionResult> {
  const t = await getTranslations("CompanyActions");
  if (!Array.isArray(selections) || selections.length === 0) {
    return {
      status: "error",
      message: t("selectLogo"),
      updatedIds: [],
    };
  }

  if (selections.length > 50) {
    return {
      status: "error",
      message: t("batchLimit"),
      updatedIds: [],
    };
  }

  const normalizedSelections = selections.flatMap((selection) => {
    if (!selection || !isValidUuid(selection.companyId)) return [];

    const logoUrl = normalizeHttpsUrl(selection.logoUrl, 1000);
    const website = normalizeHttpsUrl(selection.website, 500);
    if (!logoUrl || !website) return [];

    return [{ companyId: selection.companyId, logoUrl, website }];
  });
  const uniqueIds = new Set(
    normalizedSelections.map((selection) => selection.companyId),
  );

  if (
    normalizedSelections.length !== selections.length ||
    uniqueIds.size !== selections.length
  ) {
    return {
      status: "error",
      message: t("invalidSuggestion"),
      updatedIds: [],
    };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data: ownedCompanies, error: lookupError } = await supabase
    .from("companies")
    .select("id, website")
    .eq("user_id", user.id)
    .in("id", Array.from(uniqueIds));

  if (lookupError || ownedCompanies.length !== selections.length) {
    return {
      status: "error",
      message: t("confirmCompaniesFailed"),
      updatedIds: [],
    };
  }

  const ownedCompanyById = new Map(
    ownedCompanies.map((company) => [company.id, company]),
  );
  const updates = await Promise.all(
    normalizedSelections.map(async (selection) => {
      const company = ownedCompanyById.get(selection.companyId);
      if (!company) return { id: selection.companyId, saved: false };

      const values = company.website
        ? { logo_url: selection.logoUrl }
        : { logo_url: selection.logoUrl, website: selection.website };
      const { data, error } = await supabase
        .from("companies")
        .update(values)
        .eq("id", selection.companyId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      return { id: selection.companyId, saved: Boolean(data) && !error };
    }),
  );
  const updatedIds = updates
    .filter((update) => update.saved)
    .map((update) => update.id);

  revalidatePath(companiesPath);
  revalidatePath("/empresas/logotipos");
  revalidatePath("/candidaturas");

  if (updatedIds.length !== selections.length) {
    return {
      status: "error",
      message:
        updatedIds.length > 0
          ? t("partialSave", { count: updatedIds.length })
          : t("saveLogosFailed"),
      updatedIds,
    };
  }

  return {
    status: "success",
    message: t("logosSaved", { count: updatedIds.length }),
    updatedIds,
  };
}
