"use server";

import { redirect } from "next/navigation";

import type { AuthActionState } from "@/features/auth/types";
import {
  hasFieldErrors,
  validateEmailPassword,
  validatePasswordUpdate,
  validateRegistration,
  validateResetRequest,
} from "@/features/auth/validation";
import { getSiteUrl } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";

function validationError(
  fieldErrors: NonNullable<AuthActionState["fieldErrors"]>,
): AuthActionState {
  return {
    status: "error",
    message: "Revê os campos assinalados.",
    fieldErrors,
  };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { email, password, fieldErrors } = validateEmailPassword(formData);

  if (hasFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message: "Email ou palavra-passe incorretos.",
    };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { name, email, password, fieldErrors } = validateRegistration(formData);

  if (hasFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        "Não foi possível criar a conta. Confirma os dados e tenta novamente.",
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    status: "success",
    message:
      "Conta criada. Consulta o teu email e confirma o endereço antes de iniciares sessão.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { email, fieldErrors } = validateResetRequest(formData);

  if (hasFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/atualizar-password`,
  });

  return {
    status: "success",
    message:
      "Se existir uma conta com esse email, receberás uma ligação para alterar a palavra-passe.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { password, fieldErrors } = validatePasswordUpdate(formData);

  if (hasFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return {
      status: "error",
      message: "A ligação expirou. Pede uma nova recuperação de palavra-passe.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível atualizar a palavra-passe. Tenta novamente.",
    };
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect("/login?estado=password-atualizada");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
