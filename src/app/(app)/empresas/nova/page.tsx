import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { CompanyForm } from "@/components/companies/company-form";
import { PageHeader } from "@/components/shared/page-header";
import { createCompanyAction } from "@/features/companies/actions";
import { emptyCompanyFormValues } from "@/features/companies/types";

export default function NewCompanyPage() {
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
        title="Nova empresa"
        description="Regista o contexto base antes de associares vagas e contactos."
      />
      <CompanyForm
        action={createCompanyAction}
        initialValues={emptyCompanyFormValues}
        submitLabel="Guardar empresa"
      />
    </div>
  );
}
