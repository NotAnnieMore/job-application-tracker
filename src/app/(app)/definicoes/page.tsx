import { ProfileForm } from "@/components/profile/profile-form";
import { LanguageSettings } from "@/components/i18n/language-settings";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { ThemeSettings } from "@/components/theme/theme-settings";
import { requireCurrentUser } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>;
}) {
  const user = await requireCurrentUser();
  const t = await getTranslations("Settings");
  const status = (await searchParams).estado;
  const notice =
    status === "perfil-atualizado" ? t("profileUpdated") : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <SuccessToast message={notice} />
      <LanguageSettings />
      <ThemeSettings />
      <ProfileForm
        key={`${user.fullName}-${user.avatarUrl}`}
        fullName={user.fullName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}
