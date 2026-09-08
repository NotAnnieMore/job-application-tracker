"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export function LanguageSettings() {
  const t = useTranslations("Settings.language");

  return (
    <section className="flex min-w-0 flex-col justify-between gap-4 p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Languages aria-hidden="true" className="size-4.5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-950">{t("title")}</h3>
          <p className="mt-0.5 text-sm leading-5 text-slate-500">
            {t("description")}
          </p>
        </div>
      </div>
      <LanguageSwitcher className="justify-end" />
    </section>
  );
}
