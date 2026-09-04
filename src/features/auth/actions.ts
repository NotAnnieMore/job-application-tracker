"use server";
import { getTranslations } from "next-intl/server";

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

async function validationError(
  fieldErrors: NonNullable<AuthActionState["fieldErrors"]>,
): Promise<AuthActionState> {
  const t = await getTranslations("AuthActions");
  return {
    status: "error",
    message: t("reviewFields"),
    fieldErrors,
  };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("AuthActions");
  const { email, password, fieldErrors } = validateEmailPassword(
    formData,
    await getTranslations("AuthValidation"),
  );

  if (hasFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message: t("invalidCredentials"),
    };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("AuthActions");
  const { name, email, password, fieldErrors } = validateRegistration(
    formData,
    await getTranslations("AuthValidation"),
  );

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
      message: t("registerFailed"),
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    status: "success",
    message: t("registered"),
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("AuthActions");
  const { email, fieldErrors } = validateResetRequest(
    formData,
    await getTranslations("AuthValidation"),
  );

  if (hasFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/atualizar-password`,
  });

  return {
    status: "success",
    message: t("resetRequested"),
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("AuthActions");
  const { password, fieldErrors } = validatePasswordUpdate(
    formData,
    await getTranslations("AuthValidation"),
  );

  if (hasFieldErrors(fieldErrors)) {
    return validationError(fieldErrors);
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return {
      status: "error",
      message: t("expiredLink"),
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      status: "error",
      message: t("updateFailed"),
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
