"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { updatePasswordAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/types";

export function UpdatePasswordForm() {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(
    updatePasswordAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />
      <FormField
        label={t("newPassword")}
        htmlFor="new-password"
        required
        hint={t("newPasswordHint")}
        error={state.fieldErrors?.password}
      >
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={fieldClassName}
          minLength={12}
          maxLength={128}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password
              ? "new-password-error"
              : "new-password-hint"
          }
          required
        />
      </FormField>
      <FormField
        label={t("confirmNewPassword")}
        htmlFor="confirm-new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      >
        <input
          id="confirm-new-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={fieldClassName}
          minLength={12}
          maxLength={128}
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby={
            state.fieldErrors?.confirmPassword
              ? "confirm-new-password-error"
              : undefined
          }
          required
        />
      </FormField>
      <AuthSubmitButton
        label={t("saveNewPassword")}
        pendingLabel={t("saving")}
      />
    </form>
  );
}
