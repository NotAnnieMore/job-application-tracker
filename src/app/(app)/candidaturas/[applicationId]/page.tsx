import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  Globe2,
  ListPlus,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ActionPriorityBadge,
  ActionStatusBadge,
} from "@/components/actions/action-badges";
import { ActionQuickStatusForm } from "@/components/actions/action-quick-status-form";
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { CompanyLogo } from "@/components/companies/company-logo";
import { InterviewStatusBadge } from "@/components/interviews/interview-status-badge";
import { NoteCreateForm } from "@/components/notes/note-create-form";
import { NoteItem } from "@/components/notes/note-item";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getActions } from "@/features/actions/data";
import { formatActionDate } from "@/features/actions/date";
import { workModeLabels } from "@/features/applications/constants";
import { getApplicationById } from "@/features/applications/data";
import { isValidApplicationId } from "@/features/applications/validation";
import { interviewFormatLabels } from "@/features/interviews/constants";
import { getInterviews } from "@/features/interviews/data";
import { formatInterviewDateTime } from "@/features/interviews/date";
import { getApplicationNotes } from "@/features/notes/data";

const notices: Record<string, string> = {
  "nota-criada": "Nota adicionada com sucesso.",
  "nota-atualizada": "Nota atualizada com sucesso.",
  "nota-eliminada": "Nota eliminada com sucesso.",
};

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatMoney(value: string, currency: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";

  try {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("pt-PT")} ${currency}`;
  }
}

function salaryRange(minimum: string, maximum: string, currency: string) {
  if (minimum && maximum) {
    return `${formatMoney(minimum, currency)} – ${formatMoney(maximum, currency)}`;
  }
  if (minimum) return `A partir de ${formatMoney(minimum, currency)}`;
  if (maximum) return `Até ${formatMoney(maximum, currency)}`;
  return "Por definir";
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-700">
          {value || "Por definir"}
        </p>
      </div>
    </div>
  );
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ applicationId }, query] = await Promise.all([params, searchParams]);

  if (!isValidApplicationId(applicationId)) notFound();

  const [application, interviews, actionsData, notes] = await Promise.all([
    getApplicationById(applicationId),
    getInterviews({ applicationId }),
    getActions({ applicationId }),
    getApplicationNotes(applicationId),
  ]);

  if (!application) notFound();

  const notice = notices[singleValue(query.aviso)];
  const skills = application.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

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
        title={application.title}
        description={`${application.companyName} · candidatura de ${formatDate(application.applicationDate)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/candidaturas/${application.id}/editar`}
              className={buttonClassName({ variant: "secondary" })}
            >
              <Pencil aria-hidden="true" className="size-4" />
              Editar
            </Link>
            <Link
              href={`/acoes/nova?candidatura=${application.id}`}
              className={buttonClassName({ variant: "secondary" })}
            >
              <ListPlus aria-hidden="true" className="size-4" />
              Nova ação
            </Link>
            <Link
              href={`/entrevistas/nova?candidatura=${application.id}`}
              className={buttonClassName()}
            >
              <CalendarDays aria-hidden="true" className="size-4" />
              Agendar entrevista
            </Link>
          </div>
        }
      />

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <Card>
          <CardHeader>
            <div className="flex min-w-0 items-center gap-3">
              <CompanyLogo
                name={application.companyName}
                logoUrl={application.companyLogoUrl}
                size="md"
              />
              <div className="min-w-0">
                <h2 className="truncate font-bold text-slate-950">
                  {application.companyName}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Resumo da candidatura
                </p>
              </div>
            </div>
            <ApplicationStatusBadge status={application.status} />
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <DetailItem
              icon={CalendarDays}
              label="Data da candidatura"
              value={formatDate(application.applicationDate)}
            />
            <DetailItem
              icon={BriefcaseBusiness}
              label="Origem"
              value={application.source}
            />
            <DetailItem
              icon={MapPin}
              label="Local e modalidade"
              value={[
                application.location,
                application.workMode
                  ? workModeLabels[application.workMode]
                  : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            />
            <DetailItem
              icon={BriefcaseBusiness}
              label="Tipo de contrato"
              value={application.employmentType}
            />
            <DetailItem
              icon={CircleDollarSign}
              label="Intervalo da vaga"
              value={salaryRange(
                application.salaryMin,
                application.salaryMax,
                application.currency,
              )}
            />
            <DetailItem
              icon={CircleDollarSign}
              label="Salário esperado"
              value={
                application.expectedSalary
                  ? formatMoney(
                      application.expectedSalary,
                      application.currency,
                    )
                  : ""
              }
            />
            {application.followUpDate ? (
              <DetailItem
                icon={CalendarDays}
                label="Próximo follow-up"
                value={formatDate(application.followUpDate)}
              />
            ) : null}
            {application.nextActionSummary ? (
              <DetailItem
                icon={ListPlus}
                label="Próxima ação"
                value={application.nextActionSummary}
              />
            ) : null}
          </CardContent>
          {application.companyWebsite || application.jobUrl ? (
            <div className="flex flex-wrap gap-3 border-t border-slate-100 px-5 py-4">
              {application.companyWebsite ? (
                <a
                  href={application.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Globe2 aria-hidden="true" className="size-4" />
                  Website da empresa
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              ) : null}
              {application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  <BriefcaseBusiness aria-hidden="true" className="size-4" />
                  Abrir vaga original
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              ) : null}
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">Contacto principal</h2>
              <p className="mt-1 text-sm text-slate-500">
                Recrutador associado à candidatura
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {application.recruiterName ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound aria-hidden="true" className="size-5" />
                  </span>
                  <p className="font-semibold text-slate-950">
                    {application.recruiterName}
                  </p>
                </div>
                {application.recruiterEmail ? (
                  <a
                    href={`mailto:${application.recruiterEmail}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <Mail aria-hidden="true" className="size-4" />
                    {application.recruiterEmail}
                  </a>
                ) : null}
                {application.recruiterPhone ? (
                  <a
                    href={`tel:${application.recruiterPhone}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    {application.recruiterPhone}
                  </a>
                ) : null}
                {application.recruiterLinkedinUrl ? (
                  <a
                    href={application.recruiterLinkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Abrir LinkedIn
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="py-4 text-center">
                <UserRound
                  aria-hidden="true"
                  className="mx-auto size-8 text-slate-300"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Ainda não existe um recrutador associado.
                </p>
                <Link
                  href={`/candidaturas/${application.id}/editar`}
                  className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Associar contacto
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(application.opportunitySummary ||
        application.summaryNotes ||
        skills.length > 0) && (
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">Vaga e contexto</h2>
              <p className="mt-1 text-sm text-slate-500">
                Informação guardada sobre a oportunidade
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            {application.opportunitySummary ? (
              <section>
                <h3 className="text-sm font-semibold text-slate-950">
                  Resumo da vaga
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {application.opportunitySummary}
                </p>
              </section>
            ) : null}
            {application.summaryNotes ? (
              <section>
                <h3 className="text-sm font-semibold text-slate-950">
                  Notas gerais
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {application.summaryNotes}
                </p>
              </section>
            ) : null}
            {skills.length > 0 ? (
              <section className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-slate-950">
                  Tecnologias e competências
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">
              Preparação para entrevistas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Guião pessoal e perguntas preparadas para esta empresa
            </p>
          </div>
          <Link
            href={`/candidaturas/${application.id}/editar`}
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Editar preparação
          </Link>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl bg-blue-50/70 p-4">
            <h3 className="text-sm font-bold text-blue-950">
              Guião sobre mim e o CV
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900/75">
              {application.interviewPreparation ||
                "Ainda não adicionaste um guião de preparação."}
            </p>
          </section>
          <section className="rounded-xl bg-violet-50/70 p-4">
            <h3 className="text-sm font-bold text-violet-950">
              Perguntas para a empresa
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-violet-900/75">
              {application.questionsForCompany ||
                "Ainda não adicionaste perguntas para a empresa."}
            </p>
          </section>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">Entrevistas</h2>
              <p className="mt-1 text-sm text-slate-500">
                {interviews.length} entrevista(s) associada(s)
              </p>
            </div>
            <Link
              href={`/entrevistas/nova?candidatura=${application.id}`}
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              <Plus aria-hidden="true" className="size-4" />
              Agendar
            </Link>
          </CardHeader>
          <CardContent>
            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.map((interview) => (
                  <article
                    key={interview.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/entrevistas/${interview.id}/editar`}
                          className="font-semibold text-slate-950 hover:text-blue-700"
                        >
                          {interview.interviewType}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatInterviewDateTime(interview.scheduledAt)} ·{" "}
                          {interviewFormatLabels[interview.format]}
                        </p>
                      </div>
                      <InterviewStatusBadge status={interview.status} />
                    </div>
                  </article>
                ))}
                <Link
                  href={`/entrevistas?candidatura=${application.id}`}
                  className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Ver na página de entrevistas
                </Link>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Ainda não existem entrevistas associadas.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">Ações</h2>
              <p className="mt-1 text-sm text-slate-500">
                {actionsData.items.length} tarefa(s) associada(s)
              </p>
            </div>
            <Link
              href={`/acoes/nova?candidatura=${application.id}`}
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              <Plus aria-hidden="true" className="size-4" />
              Criar
            </Link>
          </CardHeader>
          <CardContent>
            {actionsData.items.length > 0 ? (
              <div className="space-y-3">
                {actionsData.items.map((action) => (
                  <article
                    key={action.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/acoes/${action.id}/editar`}
                          className="font-semibold text-slate-950 hover:text-blue-700"
                        >
                          {action.description}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <ActionStatusBadge status={action.status} />
                          <ActionPriorityBadge priority={action.priority} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {action.dueDate
                            ? `Prazo: ${formatActionDate(action.dueDate)}`
                            : "Sem data limite"}
                        </p>
                      </div>
                      <ActionQuickStatusForm
                        actionId={action.id}
                        status={action.status}
                      />
                    </div>
                  </article>
                ))}
                <Link
                  href={`/acoes?candidatura=${application.id}`}
                  className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Ver na página de ações
                </Link>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Ainda não existem ações associadas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card id="notas" className="scroll-mt-6">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">Histórico de notas</h2>
            <p className="mt-1 text-sm text-slate-500">
              {notes.length} nota(s) guardada(s) nesta candidatura
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <NoteCreateForm applicationId={application.id} />
          {notes.length > 0 ? (
            <div className="space-y-3 border-t border-slate-100 pt-5">
              {notes.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
              Ainda não existem notas. Usa o campo acima para criar a primeira.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
