import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordResetForm } from "@/components/auth/password-reset-form";

export default async function RecoverPasswordPage() {
  const t = await getTranslations("Auth.recoverPage");
  const auth = await getTranslations("Auth");

  return (
    <AuthShell title={t("title")} description={t("description")}>
      <PasswordResetForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          {auth("backToLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
