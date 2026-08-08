"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  BulkCompanyLogoActionResult,
  CompanyActionState,
  CompanyLogoSelection,
} from "@/features/companies/types";
import {
  hasCompanyFieldErrors,
  validateCompanyForm,
} from "@/features/companies/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const companiesPath = "/empresas";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validationError(
  fieldErrors: NonNullable<CompanyActionState["fieldErrors"]>,
): CompanyActionState {
  return {
    status: "error",
    message: "Revê os campos assinalados.",
    fieldErrors,
  };
}

function databaseError(code?: string): CompanyActionState {
  if (code === "23505") {
    return {
      status: "error",
      message: "Já existe uma empresa com esse nome.",
      fieldErrors: {
        name: "Usa um nome diferente ou edita a empresa existente.",
      },
    };
  }

  return {
    status: "error",
    message: "Não foi possível guardar a empresa. Tenta novamente.",
  };
}

export async function createCompanyAction(
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const { values, fieldErrors } = validateCompanyForm(formData);

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

export async function updateCompanyAction(
  companyId: string,
  _previousState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  if (!uuidPattern.test(companyId)) {
    return { status: "error", message: "A empresa indicada não é válida." };
  }

  const { values, fieldErrors } = validateCompanyForm(formData);

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
    return { status: "error", message: "A empresa já não está disponível." };
  }

  revalidatePath(companiesPath);
  redirect(`${companiesPath}?estado=empresa-atualizada`);
}

export async function deleteCompanyAction(
  companyId: string,
  _previousState: CompanyActionState,
  _formData: FormData,
): Promise<CompanyActionState> {
  void _previousState;
  void _formData;

  if (!uuidPattern.test(companyId)) {
    return { status: "error", message: "A empresa indicada não é válida." };
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
      message:
        "Esta empresa tem vagas associadas. Remove ou transfere essas vagas antes de a eliminar.",
    };
  }

  if (error) {
    return {
      status: "error",
      message: "Não foi possível eliminar a empresa. Tenta novamente.",
    };
  }

  if (!data) {
    return { status: "error", message: "A empresa já não está disponível." };
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
  if (!Array.isArray(selections) || selections.length === 0) {
    return {
      status: "error",
      message: "Seleciona pelo menos um logótipo para guardar.",
      updatedIds: [],
    };
  }

  if (selections.length > 50) {
    return {
      status: "error",
      message: "Só é possível guardar 50 logótipos de cada vez.",
      updatedIds: [],
    };
  }

  const normalizedSelections = selections.flatMap((selection) => {
    if (!selection || !uuidPattern.test(selection.companyId)) return [];

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
      message: "Uma das sugestões recebidas não é válida. Volta a pesquisá-la.",
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
      message: "Não foi possível confirmar todas as empresas selecionadas.",
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
          ? `${updatedIds.length} logótipo(s) guardado(s), mas alguns falharam. Tenta novamente.`
          : "Não foi possível guardar os logótipos. Tenta novamente.",
      updatedIds,
    };
  }

  return {
    status: "success",
    message: `${updatedIds.length} logótipo(s) guardado(s) com sucesso.`,
    updatedIds,
  };
}
