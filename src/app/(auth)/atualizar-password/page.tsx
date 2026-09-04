import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { getTranslations } from "next-intl/server";

export default async function UpdatePasswordPage() {
  const t = await getTranslations("Auth.updatePage");

  return (
    <AuthShell title={t("title")} description={t("description")}>
      <UpdatePasswordForm />
    </AuthShell>
  );
}
