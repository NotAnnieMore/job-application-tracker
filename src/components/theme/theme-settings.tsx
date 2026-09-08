"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { useTheme } from "@/components/theme/theme-provider";

export function ThemeSettings() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("Theme");
  const dark = theme === "dark";

  return (
    <section className="flex min-w-0 flex-col justify-between gap-4 p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {dark ? (
            <Moon aria-hidden="true" className="size-4.5" />
          ) : (
            <Sun aria-hidden="true" className="size-4.5" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-950">{t("title")}</h3>
          <p className="mt-0.5 text-sm leading-5 text-slate-500">
            {t("description")}
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        onClick={toggleTheme}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <span>
          <span className="block text-sm font-semibold text-slate-900">
            {t("darkMode")}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            {dark ? t("active") : t("inactive")}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            dark ? "bg-blue-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`theme-switch-thumb absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${
              dark ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
      </button>
    </section>
  );
}
