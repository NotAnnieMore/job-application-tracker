import { getTranslations } from "next-intl/server";
import { Building2 } from "lucide-react";
import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function CompanyNotFound() {
  const t = await getTranslations("Companies");
  return (
    <Card className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
      <title>{t("notFoundMetadata")}</title>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Building2 aria-hidden="true" className="size-6" />
      </span>
      <h1 className="mt-4 text-xl font-bold text-slate-950">{t("notFound")}</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {t("notFoundDescription")}
      </p>
      <Link href="/empresas" className={buttonClassName({ className: "mt-5" })}>
        {t("back")}
      </Link>
    </Card>
  );
}
