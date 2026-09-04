"use client";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function LanguageSettings() {
  const t = useTranslations("Settings.language");

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="font-bold text-slate-950">{t("title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <LanguageSwitcher expanded />
        </div>
      </CardContent>
    </Card>
  );
}
