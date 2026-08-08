import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

import { InterviewForm } from "@/components/interviews/interview-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { createInterviewAction } from "@/features/interviews/actions";
import {
  getInterviewApplicationOptions,
  getInterviewRecruiterOptions,
} from "@/features/interviews/data";
import { emptyInterviewFormValues } from "@/features/interviews/types";

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ candidatura?: string | string[] }>;
}) {
  const [applications, recruiters] = await Promise.all([
    getInterviewApplicationOptions(),
    getInterviewRecruiterOptions(),
  ]);
  const applicationParam = (await searchParams).candidatura;
  const applicationId =
    typeof applicationParam === "string" &&
    applications.some((application) => application.id === applicationParam)
      ? applicationParam
      : "";
  const selectedApplication = applications.find(
    (application) => application.id === applicationId,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/entrevistas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar às entrevistas
      </Link>
      <PageHeader
        title="Nova entrevista"
        description="Agenda a conversa e reúne toda a preparação necessária."
      />
      {applications.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Cria primeiro uma candidatura"
          description="Cada entrevista precisa de estar associada a uma candidatura existente."
          actionLabel="Criar candidatura"
          actionHref="/candidaturas/nova"
        />
      ) : (
        <InterviewForm
          action={createInterviewAction}
          applications={applications}
          recruiters={recruiters}
          initialValues={{
            ...emptyInterviewFormValues,
            applicationId,
            recruiterId: selectedApplication?.primaryRecruiterId ?? "",
          }}
          submitLabel="Guardar entrevista"
        />
      )}
    </div>
  );
}
