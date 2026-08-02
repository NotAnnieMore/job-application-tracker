"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { loginAction } from "@/features/auth/actions";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/features/auth/types";

export function LoginForm({
  initialState = initialAuthActionState,
}: {
  initialState?: AuthActionState;
}) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />
      <FormField
        label="Email"
        htmlFor="login-email"
        required
        error={state.fieldErrors?.email}
      >
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@exemplo.pt"
          className={fieldClassName}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "login-email-error" : undefined
          }
          required
        />
      </FormField>
      <FormField
        label="Palavra-passe"
        htmlFor="login-password"
        required
        error={state.fieldErrors?.password}
      >
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="A tua palavra-passe"
          className={fieldClassName}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "login-password-error" : undefined
          }
          required
        />
      </FormField>
      <div className="flex justify-end">
        <Link
          href="/recuperar-password"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Recuperar palavra-passe
        </Link>
      </div>
      <AuthSubmitButton
        label="Iniciar sessão"
        pendingLabel="A iniciar sessão..."
      />
    </form>
  );
}
