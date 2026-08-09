import { ArrowLeft, CalendarPlus, ListPlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/applications/application-form";
import { DeleteApplicationForm } from "@/components/applications/delete-application-form";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateApplicationAction } from "@/features/applications/actions";
import {
  getApplicationById,
  getCompanyOptions,
  getRecruiterOptions,
} from "@/features/applications/data";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const [application, companies, recruiters] = await Promise.all([
    getApplicationById(applicationId),
    getCompanyOptions(),
    getRecruiterOptions(),
  ]);

  if (!application) notFound();

  const action = updateApplicationAction.bind(null, application.id);
  const detailHref = `/candidaturas/${application.id}`;

  return (
    <div className="space-y-6">
      <Link
        href={detailHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar à candidatura
      </Link>
      <PageHeader
        title={`Editar ${application.title}`}
        description="Atualiza a vaga, o estado e a preparação desta candidatura."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/acoes/nova?candidatura=${application.id}`}
              className={buttonClassName({ variant: "secondary" })}
            >
              <ListPlus aria-hidden="true" className="size-4" />
              Nova tarefa
            </Link>
            <Link
              href={`/entrevistas/nova?candidatura=${application.id}`}
              className={buttonClassName({ variant: "secondary" })}
            >
              <CalendarPlus aria-hidden="true" className="size-4" />
              Agendar entrevista
            </Link>
          </div>
        }
      />
      <ApplicationForm
        action={action}
        companies={companies}
        recruiters={recruiters}
        initialValues={application}
        submitLabel="Guardar alterações"
        cancelHref={detailHref}
      />

      <Card className="border-red-200">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">Eliminar candidatura</h2>
            <p className="mt-1 text-sm text-slate-500">
              A vaga e todos os dados dependentes desta candidatura também serão
              eliminados.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <DeleteApplicationForm
            applicationId={application.id}
            title={application.title}
          />
        </CardContent>
      </Card>
    </div>
  );
}
