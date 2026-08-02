"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import { registerAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/types";

export function RegisterForm() {
  const [state, formAction] = useActionState(
    registerAction,
    initialAuthActionState,
  );

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <AuthFormMessage state={state} />
        <Link
          href="/login"
          className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Voltar ao início de sessão
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />
      <FormField
        label="Nome"
        htmlFor="register-name"
        required
        error={state.fieldErrors?.name}
      >
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="O teu nome"
          className={fieldClassName}
          minLength={2}
          maxLength={120}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={
            state.fieldErrors?.name ? "register-name-error" : undefined
          }
          required
        />
      </FormField>
      <FormField
        label="Email"
        htmlFor="register-email"
        required
        error={state.fieldErrors?.email}
      >
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@exemplo.pt"
          className={fieldClassName}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "register-email-error" : undefined
          }
          required
        />
      </FormField>
      <FormField
        label="Palavra-passe"
        htmlFor="register-password"
        required
        hint="Usa entre 12 e 128 caracteres. Uma frase longa é uma boa opção."
        error={state.fieldErrors?.password}
      >
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Criar palavra-passe"
          className={fieldClassName}
          minLength={12}
          maxLength={128}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password
              ? "register-password-error"
              : "register-password-hint"
          }
          required
        />
      </FormField>
      <FormField
        label="Confirmar palavra-passe"
        htmlFor="register-confirm-password"
        required
        error={state.fieldErrors?.confirmPassword}
      >
        <input
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repetir palavra-passe"
          className={fieldClassName}
          minLength={12}
          maxLength={128}
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby={
            state.fieldErrors?.confirmPassword
              ? "register-confirm-password-error"
              : undefined
          }
          required
        />
      </FormField>
      <AuthSubmitButton label="Criar conta" pendingLabel="A criar conta..." />
    </form>
  );
}
