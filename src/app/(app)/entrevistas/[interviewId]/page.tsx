import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CompanyLogo } from "@/components/companies/company-logo";
import { InterviewOutcomeEditor } from "@/components/interviews/interview-outcome-editor";
import { InterviewStatusBadge } from "@/components/interviews/interview-status-badge";
import { InterviewPreparationEditor } from "@/components/interviews/interview-preparation-editor";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { interviewFormatLabels } from "@/features/interviews/constants";
import { formatInterviewDateTime } from "@/features/interviews/date";
import { getInterviewById } from "@/features/interviews/data";

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function isExternalLocation(value: string) {
  return /^https:\/\//iu.test(value);
}

function TextSection({
  title,
  value,
  emptyText,
}: {
  title: string;
  value: string;
  emptyText: string;
}) {
  return (
    <section className="min-w-0">
      <h3 className="text-sm font-bold text-slate-950">{title}</h3>
      {value ? (
        <div className="mt-3 break-words whitespace-pre-wrap text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
          {value}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  );
}

export default async function InterviewDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ interviewId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ interviewId }, query] = await Promise.all([params, searchParams]);
  const interview = await getInterviewById(interviewId);
  if (!interview) notFound();

  const returnToApplication = singleValue(query.regressar) === "candidatura";
  const backHref = returnToApplication
    ? `/candidaturas/${interview.applicationId}`
    : "/entrevistas";
  const editHref = returnToApplication
    ? `/entrevistas/${interview.id}/editar?regressar=candidatura`
    : `/entrevistas/${interview.id}/editar`;
  const notice =
    singleValue(query.aviso) === "entrevista-atualizada"
      ? "Entrevista atualizada com sucesso."
      : undefined;

  return (
    <div className="min-w-0 space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {returnToApplication ? "Voltar à candidatura" : "Voltar às entrevistas"}
      </Link>

      <PageHeader
        title={interview.interviewType}
        description={`${interview.companyName} · ${interview.applicationTitle}`}
        action={
          <Link href={editHref} className={buttonClassName()}>
            <Pencil aria-hidden="true" className="size-4" />
            Editar entrevista
          </Link>
        }
      />
      <SuccessToast message={notice} queryParam="aviso" />

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <Card className="min-w-0">
            <CardHeader className="flex-wrap items-start">
              <div className="flex max-w-full min-w-0 items-center gap-3">
                <CompanyLogo
                  name={interview.companyName}
                  logoUrl={interview.companyLogoUrl}
                  size="lg"
                />
                <div className="min-w-0">
                  <h2 className="break-words font-bold text-slate-950 [overflow-wrap:anywhere] sm:truncate">
                    {interview.companyName}
                  </h2>
                  <Link
                    href={`/candidaturas/${interview.applicationId}`}
                    className="mt-1 block break-words text-sm font-medium text-blue-600 [overflow-wrap:anywhere] hover:text-blue-700 sm:truncate"
                  >
                    {interview.applicationTitle}
                  </Link>
                </div>
              </div>
              <InterviewStatusBadge status={interview.status} />
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="flex gap-3">
                <CalendarDays
                  className="mt-0.5 size-5 text-slate-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                    Data e hora
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-slate-800 [overflow-wrap:anywhere]">
                    {formatInterviewDateTime(interview.scheduledAt)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock3
                  className="mt-0.5 size-5 text-slate-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                    Duração
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {interview.durationMinutes} minutos
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Video
                  className="mt-0.5 size-5 text-slate-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                    Formato
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {interviewFormatLabels[interview.format]}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin
                  className="mt-0.5 size-5 text-slate-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                    Local ou ligação
                  </p>
                  {interview.locationOrUrl ? (
                    isExternalLocation(interview.locationOrUrl) ? (
                      <a
                        href={interview.locationOrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Abrir ligação
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                      </a>
                    ) : (
                      <p className="mt-1 break-words text-sm font-medium text-slate-800 [overflow-wrap:anywhere]">
                        {interview.locationOrUrl}
                      </p>
                    )
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">Por definir</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex-wrap items-start">
              <div className="min-w-0">
                <h2 className="font-bold text-slate-950">Preparação</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Guião e perguntas para levares para a conversa.
                </p>
              </div>
              <InterviewPreparationEditor
                interviewId={interview.id}
                initialApplicationPreparation={interview.applicationPreparation}
                initialQuestionsForCompany={interview.questionsForCompany}
              />
            </CardHeader>
            <CardContent className="space-y-7">
              <TextSection
                title="Guião desta entrevista"
                value={interview.preparation}
                emptyText="Ainda não existe um guião específico para esta entrevista."
              />
              <TextSection
                title="Guião pessoal e CV"
                value={interview.applicationPreparation}
                emptyText="Ainda não existe preparação geral guardada na candidatura."
              />
              <TextSection
                title="Perguntas para a empresa"
                value={interview.questionsForCompany}
                emptyText="Ainda não existem perguntas guardadas."
              />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex-wrap items-start">
              <div className="min-w-0">
                <h2 className="font-bold text-slate-950">Resultado e notas</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Registo feito depois da entrevista.
                </p>
              </div>
              <InterviewOutcomeEditor
                interviewId={interview.id}
                initialFeedback={interview.feedback}
                initialResult={interview.result}
              />
            </CardHeader>
            <CardContent className="space-y-7">
              <TextSection
                title="Feedback e notas"
                value={interview.feedback}
                emptyText="Ainda não existe feedback registado."
              />
              <TextSection
                title="Resultado"
                value={interview.result}
                emptyText="Ainda não existe um resultado registado."
              />
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-6">
          <Card className="min-w-0">
            <CardHeader>
              <h2 className="font-bold text-slate-950">Pessoas</h2>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-3">
                <UserRound
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-slate-400"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                    Recrutador
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-slate-800 [overflow-wrap:anywhere]">
                    {interview.recruiterName || "Por definir"}
                  </p>
                </div>
              </div>
              {interview.recruiterEmail ? (
                <a
                  href={`mailto:${interview.recruiterEmail}`}
                  className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Mail aria-hidden="true" className="size-5 text-slate-400" />
                  <span className="min-w-0 break-all">
                    {interview.recruiterEmail}
                  </span>
                </a>
              ) : null}
              {interview.recruiterPhone ? (
                <a
                  href={`tel:${interview.recruiterPhone}`}
                  className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Phone aria-hidden="true" className="size-5 text-slate-400" />
                  <span className="min-w-0 break-all">
                    {interview.recruiterPhone}
                  </span>
                </a>
              ) : null}
              <div className="flex gap-3">
                <UsersRound
                  aria-hidden="true"
                  className="mt-0.5 size-5 text-slate-400"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                    Participantes
                  </p>
                  <p className="mt-1 break-words whitespace-pre-wrap text-sm text-slate-700 [overflow-wrap:anywhere]">
                    {interview.participants || "Por definir"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardContent className="space-y-3">
              <Link
                href={`/candidaturas/${interview.applicationId}`}
                className={buttonClassName({
                  variant: "secondary",
                  className: "w-full",
                })}
              >
                <BriefcaseBusiness aria-hidden="true" className="size-4" />
                Abrir candidatura
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
