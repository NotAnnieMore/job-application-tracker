"use client";
import { useTranslations } from "next-intl";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("Errors");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
      <title>{t("errorTitle")}</title>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-slate-950">
        {t("pageHeading")}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {t("pageDescription")}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button onClick={unstable_retry}>{t("retry")}</Button>
        <Link
          href="/dashboard"
          className={buttonClassName({ variant: "secondary" })}
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </Card>
  );
}
