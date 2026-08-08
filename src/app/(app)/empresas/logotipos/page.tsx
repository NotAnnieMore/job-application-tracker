import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { CompanyLogoBatchManager } from "@/components/companies/company-logo-batch-manager";
import { PageHeader } from "@/components/shared/page-header";
import { getCompaniesWithoutLogo } from "@/features/companies/data";

export default async function CompanyLogosPage() {
  const companies = await getCompaniesWithoutLogo();

  return (
    <div className="space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar às empresas
      </Link>
      <PageHeader
        title="Completar logótipos"
        description="Pesquisa sugestões em lote e confirma apenas as correspondências corretas."
      />
      <CompanyLogoBatchManager companies={companies} />
    </div>
  );
}
