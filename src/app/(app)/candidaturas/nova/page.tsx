import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

import { ApplicationForm } from "@/components/applications/application-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { createApplicationAction } from "@/features/applications/actions";
import {
  getCompanyOptions,
  getRecruiterOptions,
} from "@/features/applications/data";
import { createEmptyApplicationFormValues } from "@/features/applications/types";

export default async function NewApplicationPage() {
  const [companies, recruiters] = await Promise.all([
    getCompanyOptions(),
    getRecruiterOptions(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/candidaturas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar às candidaturas
      </Link>
      <PageHeader
        title="Nova candidatura"
        description="Regista a vaga, a empresa e o ponto atual do processo."
      />
      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Cria primeiro uma empresa"
          description="Todas as vagas precisam de uma empresa. Depois regressa para criares a candidatura."
          actionLabel="Criar empresa"
          actionHref="/empresas/nova"
        />
      ) : (
        <ApplicationForm
          action={createApplicationAction}
          companies={companies}
          recruiters={recruiters}
          initialValues={createEmptyApplicationFormValues()}
          submitLabel="Guardar candidatura"
        />
      )}
    </div>
  );
}
