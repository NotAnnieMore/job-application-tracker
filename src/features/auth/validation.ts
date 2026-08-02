import type { AuthActionState } from "@/features/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function validateEmailPassword(formData: FormData) {
  const email = textValue(formData, "email").toLowerCase();
  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    fieldErrors.email = "Introduz um endereço de email válido.";
  }

  if (!password) {
    fieldErrors.password = "Introduz a tua palavra-passe.";
  }

  return { email, password, fieldErrors };
}

export function validateRegistration(formData: FormData) {
  const name = textValue(formData, "name");
  const { email, password, fieldErrors } = validateEmailPassword(formData);
  const confirmPasswordValue = formData.get("confirmPassword");
  const confirmPassword =
    typeof confirmPasswordValue === "string" ? confirmPasswordValue : "";

  if (name.length < 2 || name.length > 120) {
    fieldErrors.name = "O nome deve ter entre 2 e 120 caracteres.";
  }

  if (password.length < 12 || password.length > 128) {
    fieldErrors.password = "Usa entre 12 e 128 caracteres.";
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "As palavras-passe não coincidem.";
  }

  return { name, email, password, fieldErrors };
}

export function validatePasswordUpdate(formData: FormData) {
  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const confirmPassword =
    typeof confirmPasswordValue === "string" ? confirmPasswordValue : "";
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (password.length < 12 || password.length > 128) {
    fieldErrors.password = "Usa entre 12 e 128 caracteres.";
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "As palavras-passe não coincidem.";
  }

  return { password, fieldErrors };
}

export function validateResetRequest(formData: FormData) {
  const email = textValue(formData, "email").toLowerCase();
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    fieldErrors.email = "Introduz um endereço de email válido.";
  }

  return { email, fieldErrors };
}

export function hasFieldErrors(
  errors: AuthActionState["fieldErrors"],
): errors is NonNullable<AuthActionState["fieldErrors"]> {
  return Boolean(errors && Object.keys(errors).length > 0);
}
