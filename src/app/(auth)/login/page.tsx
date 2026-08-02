import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import type { AuthActionState } from "@/features/auth/types";

function stateFromQuery(value: string | string[] | undefined): AuthActionState {
  if (value === "password-atualizada") {
    return {
      status: "success",
      message: "Palavra-passe atualizada. Já podes iniciar sessão.",
    };
  }

  if (value === "confirmacao-invalida") {
    return {
      status: "error",
      message:
        "A ligação de confirmação é inválida ou expirou. Tenta iniciar sessão ou pede uma nova recuperação.",
    };
  }

  return { status: "idle" };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>;
}) {
  const { estado } = await searchParams;

  return (
    <AuthShell
      title="Bem-vindo de volta"
      description="Inicia sessão para continuares a acompanhar as tuas candidaturas."
    >
      <LoginForm initialState={stateFromQuery(estado)} />
      <p className="mt-6 text-center text-sm text-slate-500">
        Ainda não tens conta?{" "}
        <Link
          href="/registo"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
