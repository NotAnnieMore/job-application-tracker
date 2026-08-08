import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Filter,
  MapPin,
  Pencil,
  Plus,
  UserRound,
  Video,
} from "lucide-react";
import Link from "next/link";

import { AutoSubmitSelect } from "@/components/applications/auto-submit-select";
import { CompanyLogo } from "@/components/companies/company-logo";
import { InterviewStatusBadge } from "@/components/interviews/interview-status-badge";
import {
  ActiveFilters,
  type ActiveFilter,
} from "@/components/shared/active-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  interviewFormatLabels,
  interviewStatusOptions,
} from "@/features/interviews/constants";
import {
  formatInterviewDay,
  formatInterviewMonth,
  formatInterviewTime,
} from "@/features/interviews/date";
import {
  getInterviewApplicationOptions,
  getInterviews,
} from "@/features/interviews/data";
import type { InterviewListItem } from "@/features/interviews/types";
import type { InterviewStatusValue } from "@/types/database.types";

const notices: Record<string, string> = {
  "entrevista-criada": "Entrevista criada com sucesso.",
  "entrevista-atualizada": "Entrevista atualizada com sucesso.",
  "entrevista-eliminada": "Entrevista eliminada com sucesso.",
};

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function validStatus(value: string): value is InterviewStatusValue {
  return interviewStatusOptions.some((option) => option.value === value);
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function isExternalLocation(value: string) {
  return /^https:\/\//iu.test(value);
}

function InterviewCard({ interview }: { interview: InterviewListItem }) {
  return (
    <Card className="transition hover:shadow-md">
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <span className="text-xl leading-none font-bold text-slate-950">
            {formatInterviewDay(interview.scheduledAt)}
          </span>
          <span className="mt-1 text-[10px] font-bold tracking-wide text-slate-500">
            {formatInterviewMonth(interview.scheduledAt)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-slate-950">
              {interview.interviewType}
            </h2>
            <InterviewStatusBadge status={interview.status} />
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <CompanyLogo
              name={interview.companyName}
              logoUrl={interview.companyLogoUrl}
              size="sm"
            />
            <p className="min-w-0 text-sm font-medium text-slate-700">
              <span className="block truncate">{interview.title}</span>
              <span className="block truncate text-xs font-normal text-slate-500">
                {interview.companyName}
              </span>
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4" />
              {formatInterviewTime(interview.scheduledAt)} ·{" "}
              {interview.durationMinutes} min
            </span>
            <span className="flex items-center gap-2">
              <Video aria-hidden="true" className="size-4" />
              {interviewFormatLabels[interview.format]}
            </span>
            {interview.recruiterName ? (
              <span className="flex items-center gap-2">
                <UserRound aria-hidden="true" className="size-4" />
                {interview.recruiterName}
              </span>
            ) : null}
            {interview.locationOrUrl ? (
              isExternalLocation(interview.locationOrUrl) ? (
                <a
                  href={interview.locationOrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
                  Abrir ligação
                </a>
              ) : (
                <span className="flex items-center gap-2">
                  <MapPin aria-hidden="true" className="size-4" />
                  {interview.locationOrUrl}
                </span>
              )
            ) : null}
          </div>
        </div>

        <Link
          href={`/entrevistas/${interview.id}/editar`}
          className={buttonClassName({ variant: "secondary", size: "sm" })}
        >
          <Pencil aria-hidden="true" className="size-4" />
          Preparar
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawStatus = singleValue(params.estado);
  const status = validStatus(rawStatus) ? rawStatus : undefined;
  const applicationId = singleValue(params.candidatura);
  const rawDateFrom = singleValue(params.desde);
  const rawDateTo = singleValue(params.ate);
  const dateFrom = validDate(rawDateFrom) ? rawDateFrom : undefined;
  const dateTo = validDate(rawDateTo) ? rawDateTo : undefined;
  const [interviews, applications] = await Promise.all([
    getInterviews({
      status,
      applicationId: applicationId || undefined,
      dateFrom,
      dateTo,
    }),
    getInterviewApplicationOptions(),
  ]);
  const notice = notices[singleValue(params.aviso)];
  const upcoming = interviews.filter((interview) => interview.isUpcoming);
  const history = interviews.filter((interview) => !interview.isUpcoming);
  const activeFilters: ActiveFilter[] = [
    ...(status
      ? [
          {
            label: "Estado",
            value:
              interviewStatusOptions.find((option) => option.value === status)
                ?.label ?? status,
          },
        ]
      : []),
    ...(applicationId
      ? [
          {
            label: "Candidatura",
            value:
              applications.find(
                (application) => application.id === applicationId,
              )?.title ?? "Desconhecida",
          },
        ]
      : []),
    ...(dateFrom ? [{ label: "Desde", value: formatDate(dateFrom) }] : []),
    ...(dateTo ? [{ label: "Até", value: formatDate(dateTo) }] : []),
  ];
  const hasFilters = activeFilters.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrevistas"
        description="Prepara, acompanha e regista o resultado de todas as conversas."
        action={
          <Link href="/entrevistas/nova" className={buttonClassName()}>
            <Plus aria-hidden="true" className="size-4" />
            Nova entrevista
          </Link>
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

      <Card>
        <form
          action="/entrevistas"
          method="get"
          className="grid items-end gap-3 p-4 md:grid-cols-2 xl:grid-cols-[12rem_minmax(16rem,1fr)_12rem_12rem_auto]"
        >
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <AutoSubmitSelect
              name="estado"
              defaultValue={status ?? ""}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">Todos os estados</option>
              {interviewStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="sr-only">Filtrar por candidatura</span>
            <AutoSubmitSelect
              name="candidatura"
              defaultValue={applicationId}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">Todas as candidaturas</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.companyName} — {application.title}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Entrevistas desde
            </span>
            <input
              name="desde"
              type="date"
              defaultValue={dateFrom ?? ""}
              max={dateTo}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Entrevistas até
            </span>
            <input
              name="ate"
              type="date"
              defaultValue={dateTo ?? ""}
              min={dateFrom}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <button type="submit" className={buttonClassName({ size: "sm" })}>
            <Filter aria-hidden="true" className="size-4" />
            Aplicar datas
          </button>
        </form>
      </Card>

      <ActiveFilters filters={activeFilters} clearHref="/entrevistas" />

      {interviews.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={
            hasFilters
              ? "Nenhuma entrevista encontrada"
              : "Ainda não existem entrevistas"
          }
          description={
            hasFilters
              ? "Altera ou limpa os filtros para voltares a ver todas as entrevistas."
              : "Agenda a primeira entrevista para preparares cada etapa num único lugar."
          }
          actionLabel={hasFilters ? "Limpar filtros" : "Agendar entrevista"}
          actionHref={hasFilters ? "/entrevistas" : "/entrevistas/nova"}
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Próximas entrevistas
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ordenadas pela data mais próxima.
                </p>
              </div>
              {upcoming.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </section>
          ) : null}

          {history.length > 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Histórico</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Entrevistas anteriores, concluídas ou canceladas.
                </p>
              </div>
              {history.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
