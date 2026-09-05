import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  Cookie,
  Database,
  ExternalLink,
  Scale,
  ServerCog,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { AppLogo } from "@/components/shared/app-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonClassName } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Privacy.metadata");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/privacidade",
    },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");

  const sections = [
    {
      icon: ShieldCheck,
      title: t("controller.title"),
      paragraphs: [t("controller.description"), t("controller.contact")],
    },
    {
      icon: Database,
      title: t("data.title"),
      paragraphs: [t("data.intro")],
      items: [
        t("data.account"),
        t("data.jobSearch"),
        t("data.technical"),
        t("data.imports"),
      ],
    },
    {
      icon: Workflow,
      title: t("purposes.title"),
      paragraphs: [t("purposes.description"), t("purposes.noProfiling")],
    },
    {
      icon: ServerCog,
      title: t("providers.title"),
      paragraphs: [t("providers.intro")],
      items: [
        t("providers.supabase"),
        t("providers.vercel"),
        t("providers.ovh"),
        t("providers.optionalServices"),
      ],
    },
    {
      icon: Cookie,
      title: t("storage.title"),
      paragraphs: [t("storage.description"), t("storage.analytics")],
    },
    {
      icon: Clock3,
      title: t("retention.title"),
      paragraphs: [t("retention.description"), t("retention.backups")],
    },
    {
      icon: Scale,
      title: t("rights.title"),
      paragraphs: [t("rights.description"), t("rights.accountDeletion")],
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex h-18 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <AppLogo />
            <span className="hidden truncate text-sm font-bold text-slate-950 sm:block">
              Job Application Tracker
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("backToApp")}
        </Link>

        <section className="mt-8 rounded-2xl bg-blue-600 px-5 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <p className="text-sm font-semibold tracking-wide text-blue-100 uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
            {t("introduction")}
          </p>
          <p className="mt-5 text-sm font-medium text-white">
            {t("lastUpdated")}
          </p>
        </section>

        <div className="mt-6 space-y-4">
          {sections.map(({ icon: Icon, title, paragraphs, items }) => (
            <section
              key={title}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-7"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {items ? (
                      <ul className="list-disc space-y-2 pl-5 marker:text-blue-600">
                        {items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/60 px-5 py-6 sm:px-7">
          <h2 className="font-bold text-slate-950">{t("authority.title")}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
            {t("authority.description")}
          </p>
          <a
            href="https://www.cnpd.pt/cidadaos/direitos/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            {t("authority.link")}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </section>

        <div className="mt-8 flex justify-center">
          <Link href="/" className={buttonClassName({ variant: "secondary" })}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t("backToApp")}
          </Link>
        </div>
      </div>
    </main>
  );
}
