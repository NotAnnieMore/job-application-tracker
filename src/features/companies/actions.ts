"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CompanyActionState } from "@/features/companies/types";
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
