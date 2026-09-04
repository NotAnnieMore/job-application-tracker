import { getTranslations } from "next-intl/server";
import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("Errors");
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <title>{t("notFoundTitle")}</title>
      <div className="max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FileQuestion aria-hidden="true" className="size-7" />
        </span>
        <p className="mt-5 text-sm font-bold text-blue-600">{t("code404")}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          {t("notFoundHeading")}
        </h1>
        <p className="mt-3 leading-7 text-slate-500">
          {t("notFoundDescription")}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("backToDashboard")}
        </Link>
      </div>
    </main>
  );
}
