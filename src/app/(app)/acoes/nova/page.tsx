import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

import { ActionForm } from "@/components/actions/action-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { createActionAction } from "@/features/actions/actions";
import { getActionApplicationOptions } from "@/features/actions/data";
import { emptyActionFormValues } from "@/features/actions/types";

export default async function NewActionPage({
  searchParams,
}: {
  searchParams: Promise<{ candidatura?: string | string[] }>;
}) {
  const applications = await getActionApplicationOptions();
  const applicationParam = (await searchParams).candidatura;
  const applicationId =
    typeof applicationParam === "string" &&
    applications.some((application) => application.id === applicationParam)
      ? applicationParam
      : "";

  return (
    <div className="space-y-6">
      <Link
        href="/acoes"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar às tarefas
      </Link>
      <PageHeader
        title="Nova tarefa"
        description="Regista uma tarefa concreta e o respetivo prazo."
      />
      {applications.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Cria primeiro uma candidatura"
          description="Cada tarefa precisa de estar associada a uma candidatura existente."
          actionLabel="Criar candidatura"
          actionHref="/candidaturas/nova"
        />
      ) : (
        <ActionForm
          action={createActionAction}
          applications={applications}
          initialValues={{ ...emptyActionFormValues, applicationId }}
          submitLabel="Guardar tarefa"
        />
      )}
    </div>
  );
}
