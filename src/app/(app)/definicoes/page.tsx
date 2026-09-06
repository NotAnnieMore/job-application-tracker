import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/components/profile/profile-form";
import { LanguageSettings } from "@/components/i18n/language-settings";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { ThemeSettings } from "@/components/theme/theme-settings";
import { FontSizeSettings } from "@/components/accessibility/font-size-settings";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>;
}) {
  const user = await requireCurrentUser();
  const t = await getTranslations("Settings");
  const privacy = await getTranslations("Settings.privacy");
  const status = (await searchParams).estado;
  const notice =
    status === "perfil-atualizado" ? t("profileUpdated") : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <SuccessToast message={notice} />
      <LanguageSettings />
      <ThemeSettings />
      <FontSizeSettings />
      <ProfileForm
        key={`${user.fullName}-${user.avatarUrl}`}
        fullName={user.fullName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{privacy("title")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {privacy("description")}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </span>
              <span className="text-sm text-slate-600">
                {privacy("summary")}
              </span>
            </span>
            <Link
              href="/privacidade"
              className={buttonClassName({
                variant: "secondary",
                className: "shrink-0",
              })}
            >
              {privacy("open")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
