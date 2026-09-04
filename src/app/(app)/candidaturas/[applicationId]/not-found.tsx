import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { buttonClassName } from "@/components/ui/button";

export default async function ApplicationNotFound() {
  const t = await getTranslations("ApplicationDetail");
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <title>{t("notFoundMetadata")}</title>
      <h1 className="text-xl font-bold text-slate-950">{t("notFound")}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {t("notFoundDescription")}
      </p>
      <Link
        href="/candidaturas"
        className={buttonClassName({ className: "mt-6" })}
      >
        {t("back")}
      </Link>
    </div>
  );
}
