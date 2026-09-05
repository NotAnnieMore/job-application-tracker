"use client";

import { Languages, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { setLocaleAction } from "@/i18n/actions";
import { locales, type AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  expanded = false,
  className,
}: {
  expanded?: boolean;
  className?: string;
}) {
  const currentLocale = useLocale() as AppLocale;
  const t = useTranslations("LocaleSwitcher");
  const [pendingLocale, setPendingLocale] = useState<AppLocale | null>(null);
  const changingLocale =
    pendingLocale !== null && pendingLocale !== currentLocale;

  async function changeLocale(locale: AppLocale) {
    if (locale === currentLocale || changingLocale) return;

    setPendingLocale(locale);

    try {
      await setLocaleAction(locale);
    } catch {
      setPendingLocale(null);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        expanded &&
          "w-full flex-col items-start sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {expanded ? (
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
            <Languages aria-hidden="true" className="size-5" />
          </span>
          <span className="min-w-0 break-words">
            <span className="block text-sm font-semibold text-slate-900">
              {t("title")}
            </span>
            <span className="mt-0.5 block text-sm text-slate-500">
              {t("description")}
            </span>
          </span>
        </span>
      ) : null}

      <div
        role="group"
        aria-label={t("ariaLabel")}
        className="flex shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-1"
      >
        {locales.map((locale) => {
          const selected = locale === currentLocale;
          const shortLabel = locale === "pt-PT" ? "PT" : "EN";

          return (
            <button
              key={locale}
              type="button"
              aria-pressed={selected}
              aria-label={t(locale === "pt-PT" ? "portuguese" : "english")}
              title={t(locale === "pt-PT" ? "portuguese" : "english")}
              disabled={changingLocale}
              onClick={() => void changeLocale(locale)}
              className={cn(
                "flex h-8 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                selected
                  ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              {changingLocale && pendingLocale === locale ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-3.5 animate-spin"
                />
              ) : (
                shortLabel
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
