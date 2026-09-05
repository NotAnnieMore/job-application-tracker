import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { AppLogo } from "@/components/shared/app-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";

export async function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations("Auth");
  const privacy = await getTranslations("Privacy");

  return (
    <main className="relative grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.85fr)]">
      <title>{`${title} | Job Application Tracker`}</title>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-sm font-bold">
          <AppLogo />
          Job Application Tracker
        </Link>
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-wide text-blue-300 uppercase">
            {t("tagline")}
          </p>
          <p className="mt-5 text-4xl leading-tight font-bold tracking-tight">
            {t("hero")}
          </p>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            {t("supportingText")}
          </p>
        </div>
        <p className="text-xs text-slate-500">{t("privacy")}</p>
      </section>

      <section className="flex min-w-0 items-center justify-center px-6 pt-24 pb-6 sm:px-10 sm:pb-10 lg:pt-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 flex items-center gap-3 font-bold text-slate-950 lg:hidden"
          >
            <AppLogo />
            Job Application Tracker
          </Link>
          <Badge variant="blue">{t("privateArea")}</Badge>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-2 leading-7 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-slate-500">
            <Link
              href="/privacidade"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              {privacy("linkLabel")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
