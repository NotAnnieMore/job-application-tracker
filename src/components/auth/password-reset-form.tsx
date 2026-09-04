"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { requestPasswordResetAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/types";

export function PasswordResetForm() {
  const t = useTranslations("Auth");
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />
      <FormField
        label={t("email")}
        htmlFor="reset-email"
        required
        error={state.fieldErrors?.email}
      >
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          className={fieldClassName}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "reset-email-error" : undefined
          }
          required
        />
      </FormField>
      <AuthSubmitButton label={t("sendRecovery")} pendingLabel={t("sending")} />
    </form>
  );
}
