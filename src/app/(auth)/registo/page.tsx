import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("Auth.registerPage");
  const auth = await getTranslations("Auth");

  return (
    <AuthShell title={t("title")} description={t("description")}>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          {auth("login")}
        </Link>
      </p>
    </AuthShell>
  );
}
