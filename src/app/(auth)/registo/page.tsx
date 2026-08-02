import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormField, fieldClassName } from "@/components/ui/form-field";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Criar a tua conta"
      description="Começa a organizar oportunidades e próximos passos num único lugar."
    >
      <form className="space-y-5">
        <FormField label="Nome" htmlFor="register-name" required>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="O teu nome"
            className={fieldClassName}
          />
        </FormField>
        <FormField label="Email" htmlFor="register-email" required>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nome@exemplo.pt"
            className={fieldClassName}
          />
        </FormField>
        <FormField
          label="Palavra-passe"
          htmlFor="register-password"
          required
          hint="Usa pelo menos 12 caracteres."
        >
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Criar palavra-passe"
            className={fieldClassName}
          />
        </FormField>
        <Button className="w-full" disabled title="Disponível na Fase 4">
          Criar conta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Já tens conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Iniciar sessão
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-slate-400">
        O registo ficará funcional na fase de autenticação.
      </p>
    </AuthShell>
  );
}
