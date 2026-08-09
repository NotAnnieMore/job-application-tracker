import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/actions/action-form";
import { DeleteActionForm } from "@/components/actions/delete-action-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateActionAction } from "@/features/actions/actions";
import {
  getActionApplicationOptions,
  getActionById,
} from "@/features/actions/data";

export default async function EditActionPage({
  params,
  searchParams,
}: {
  params: Promise<{ actionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ actionId }, query] = await Promise.all([params, searchParams]);
  const [actionDetails, applications] = await Promise.all([
    getActionById(actionId),
    getActionApplicationOptions(),
  ]);

  if (!actionDetails) notFound();
  const returnToApplication = query.regressar === "candidatura";
  const returnHref = returnToApplication
    ? `/candidaturas/${actionDetails.applicationId}`
    : "/acoes";
  const action = updateActionAction.bind(
    null,
    actionDetails.id,
    returnToApplication,
  );

  return (
    <div className="space-y-6">
      <Link
        href={returnHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {returnToApplication ? "Voltar à candidatura" : "Voltar às tarefas"}
      </Link>
      <PageHeader
        title="Editar tarefa"
        description="Atualiza a tarefa, o prazo, a prioridade ou o estado."
      />
      <ActionForm
        action={action}
        applications={applications}
        initialValues={actionDetails}
        submitLabel="Guardar alterações"
        cancelHref={returnHref}
      />

      <Card className="border-red-200">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">Eliminar tarefa</h2>
            <p className="mt-1 text-sm text-slate-500">
              A candidatura e os restantes dados do processo serão mantidos.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <DeleteActionForm
            actionId={actionDetails.id}
            description={actionDetails.description}
            returnToApplication={returnToApplication}
          />
        </CardContent>
      </Card>
    </div>
  );
}
