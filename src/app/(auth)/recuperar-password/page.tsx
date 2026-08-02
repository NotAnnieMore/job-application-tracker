import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordResetForm } from "@/components/auth/password-reset-form";

export default function RecoverPasswordPage() {
  return (
    <AuthShell
      title="Recuperar palavra-passe"
      description="Indica o teu email para receberes uma ligação segura de recuperação."
    >
      <PasswordResetForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Voltar ao início de sessão
        </Link>
      </p>
    </AuthShell>
  );
}
