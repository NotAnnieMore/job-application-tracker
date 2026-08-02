import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormField, fieldClassName } from "@/components/ui/form-field";

export default function LoginPage() {
  return (
    <AuthShell
      title="Bem-vindo de volta"
      description="Inicia sessão para continuares a acompanhar as tuas candidaturas."
    >
      <form className="space-y-5">
        <FormField label="Email" htmlFor="login-email" required>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nome@exemplo.pt"
            className={fieldClassName}
          />
        </FormField>
        <FormField label="Palavra-passe" htmlFor="login-password" required>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="A tua palavra-passe"
            className={fieldClassName}
          />
        </FormField>
        <div className="flex justify-end">
          <span className="text-sm font-semibold text-blue-600">
            Recuperar palavra-passe
          </span>
        </div>
        <Button className="w-full" disabled title="Disponível na Fase 4">
          Iniciar sessão
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Ainda não tens conta?{" "}
        <Link
          href="/registo"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Criar conta
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-slate-400">
        O login ficará funcional na fase de autenticação.
      </p>
    </AuthShell>
  );
}
