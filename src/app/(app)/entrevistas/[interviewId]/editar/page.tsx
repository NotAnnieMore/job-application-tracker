import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteInterviewForm } from "@/components/interviews/delete-interview-form";
import { InterviewForm } from "@/components/interviews/interview-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateInterviewAction } from "@/features/interviews/actions";
import {
  getInterviewApplicationOptions,
  getInterviewById,
  getInterviewRecruiterOptions,
} from "@/features/interviews/data";

export default async function EditInterviewPage({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) {
  const { interviewId } = await params;
  const [interview, applications, recruiters] = await Promise.all([
    getInterviewById(interviewId),
    getInterviewApplicationOptions(),
    getInterviewRecruiterOptions(),
  ]);

  if (!interview) notFound();
  const action = updateInterviewAction.bind(null, interview.id);

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
        title={`Preparar ${interview.interviewType}`}
        description="Atualiza o agendamento, a preparação e o resultado desta etapa."
      />
      <InterviewForm
        action={action}
        applications={applications}
        recruiters={recruiters}
        initialValues={interview}
        submitLabel="Guardar alterações"
      />

      <Card className="border-red-200">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">Eliminar entrevista</h2>
            <p className="mt-1 text-sm text-slate-500">
              A candidatura e os restantes dados do processo serão mantidos.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <DeleteInterviewForm
            interviewId={interview.id}
            interviewType={interview.interviewType}
          />
        </CardContent>
      </Card>
    </div>
  );
}
