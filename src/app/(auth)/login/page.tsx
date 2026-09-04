import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import type { AuthActionState } from "@/features/auth/types";

function stateFromQuery(
  value: string | string[] | undefined,
  messages: { passwordUpdated: string; invalidConfirmation: string },
): AuthActionState {
  if (value === "password-atualizada") {
    return {
      status: "success",
      message: messages.passwordUpdated,
    };
  }

  if (value === "confirmacao-invalida") {
    return {
      status: "error",
      message: messages.invalidConfirmation,
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
  const t = await getTranslations("Auth.loginPage");
  const auth = await getTranslations("Auth");

  return (
    <AuthShell title={t("title")} description={t("description")}>
      <LoginForm
        initialState={stateFromQuery(estado, {
          passwordUpdated: t("passwordUpdated"),
          invalidConfirmation: t("invalidConfirmation"),
        })}
      />
      <p className="mt-6 text-center text-sm text-slate-500">
        {t("noAccount")}{" "}
        <Link
          href="/registo"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          {auth("createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}
