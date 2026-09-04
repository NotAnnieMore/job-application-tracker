import type messages from "../../../messages/en-GB.json";
type ValidationTranslator = (
  key: keyof typeof messages.AuthValidation,
  values?: Record<string, string | number>,
) => string;
import type { AuthActionState } from "@/features/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function validateEmailPassword(
  formData: FormData,
  t: ValidationTranslator,
) {
  const email = textValue(formData, "email").toLowerCase();
  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    fieldErrors.email = t("invalidEmail");
  }

  if (!password) {
    fieldErrors.password = t("requiredPassword");
  }

  return { email, password, fieldErrors };
}

export function validateRegistration(
  formData: FormData,
  t: ValidationTranslator,
) {
  const name = textValue(formData, "name");
  const { email, password, fieldErrors } = validateEmailPassword(formData, t);
  const confirmPasswordValue = formData.get("confirmPassword");
  const confirmPassword =
    typeof confirmPasswordValue === "string" ? confirmPasswordValue : "";

  if (name.length < 2 || name.length > 120) {
    fieldErrors.name = t("nameLength");
  }

  if (password.length < 12 || password.length > 128) {
    fieldErrors.password = t("passwordLength");
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = t("passwordMismatch");
  }

  return { name, email, password, fieldErrors };
}

export function validatePasswordUpdate(
  formData: FormData,
  t: ValidationTranslator,
) {
  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const confirmPassword =
    typeof confirmPasswordValue === "string" ? confirmPasswordValue : "";
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (password.length < 12 || password.length > 128) {
    fieldErrors.password = t("passwordLength");
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = t("passwordMismatch");
  }

  return { password, fieldErrors };
}

export function validateResetRequest(
  formData: FormData,
  t: ValidationTranslator,
) {
  const email = textValue(formData, "email").toLowerCase();
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    fieldErrors.email = t("invalidEmail");
  }

  return { email, fieldErrors };
}

export function hasFieldErrors(
  errors: AuthActionState["fieldErrors"],
): errors is NonNullable<AuthActionState["fieldErrors"]> {
  return Boolean(errors && Object.keys(errors).length > 0);
}
