import { SlidersHorizontal, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FontSizeSettings } from "@/components/accessibility/font-size-settings";
import { LanguageSettings } from "@/components/i18n/language-settings";
import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { ThemeSettings } from "@/components/theme/theme-settings";
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
  const preferences = await getTranslations("Settings.preferences");
  const privacy = await getTranslations("Settings.privacy");
  const status = (await searchParams).estado;
  const notice =
    status === "perfil-atualizado" ? t("profileUpdated") : undefined;

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} description={t("description")} />
      <SuccessToast message={notice} />

      <Card>
        <CardHeader className="px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <SlidersHorizontal aria-hidden="true" className="size-4.5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-950">
                {preferences("title")}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {preferences("description")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid divide-y divide-slate-100 p-0 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <LanguageSettings />
          <ThemeSettings />
          <FontSizeSettings />
        </CardContent>
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <ProfileForm
          key={`${user.fullName}-${user.avatarUrl}`}
          fullName={user.fullName}
          email={user.email}
          avatarUrl={user.avatarUrl}
        />

        <Card>
          <CardHeader className="px-4 py-3.5">
            <div>
              <h2 className="font-bold text-slate-950">{privacy("title")}</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {privacy("description")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <ShieldCheck aria-hidden="true" className="size-4.5" />
              </span>
              <p className="min-w-0 text-sm leading-6 text-slate-600">
                {privacy("summary")}
              </p>
            </div>
            <Link
              href="/privacidade"
              className={buttonClassName({
                variant: "secondary",
                size: "sm",
                className: "mt-4 w-full",
              })}
            >
              {privacy("open")}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
