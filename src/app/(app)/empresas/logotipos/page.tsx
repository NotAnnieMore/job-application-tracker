import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { CompanyLogoBatchManager } from "@/components/companies/company-logo-batch-manager";
import { PageHeader } from "@/components/shared/page-header";
import { getCompaniesWithoutLogo } from "@/features/companies/data";

export default async function CompanyLogosPage() {
  const t = await getTranslations("Companies");
  const companies = await getCompaniesWithoutLogo();

  return (
    <div className="space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>
      <PageHeader
        title={t("completeLogos")}
        description={t("logosDescription")}
      />
      <CompanyLogoBatchManager companies={companies} />
    </div>
  );
}
