import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Inbox,
  ListChecks,
  MessageSquare,
  Percent,
  Plus,
  Video,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ActionPriorityBadge } from "@/components/actions/action-badges";
import { CompanyLogo } from "@/components/companies/company-logo";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { workModeLabels } from "@/features/applications/constants";
import { formatActionDate } from "@/features/actions/date";
import { getDashboardData } from "@/features/dashboard/data";
import type {
  DashboardActivityKind,
  DashboardFollowUp,
} from "@/features/dashboard/types";
import { interviewFormatLabels } from "@/features/interviews/constants";
import { formatInterviewDateTime } from "@/features/interviews/date";
import { cn } from "@/lib/utils";
import type { ApplicationStatusValue } from "@/types/database.types";

const statusBarClasses: Record<ApplicationStatusValue, string> = {
  interested: "bg-slate-400",
  applied: "bg-blue-500",
  interview_scheduled: "bg-violet-500",
  interview_completed: "bg-purple-500",
  awaiting_response: "bg-amber-400",
  offer_received: "bg-emerald-500",
  rejected: "bg-red-500",
  withdrawn: "bg-slate-600",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function dayDifference(left: string, right: string) {
  const leftDate = new Date(`${left}T00:00:00Z`).getTime();
  const rightDate = new Date(`${right}T00:00:00Z`).getTime();
  return Math.round((leftDate - rightDate) / 86_400_000);
}

function followUpLabel(followUp: DashboardFollowUp, today: string) {
  const difference = dayDifference(followUp.followUpDate, today);

  if (difference === 0) return "Hoje";
  if (difference === 1) return "Amanhã";
  if (difference < 0) {
    const days = Math.abs(difference);
    return `Em atraso há ${days} dia${days === 1 ? "" : "s"}`;
  }

  return formatDate(followUp.followUpDate);
}

function formatActivityTime(value: string) {
  const differenceMinutes = Math.max(
    0,
    Math.round((Date.now() - Date.parse(value)) / 60_000),
  );

  if (differenceMinutes < 1) return "Agora";
  if (differenceMinutes < 60) return `Há ${differenceMinutes} min`;

  const differenceHours = Math.round(differenceMinutes / 60);
  if (differenceHours < 24) return `Há ${differenceHours} h`;

  const differenceDays = Math.round(differenceHours / 24);
  if (differenceDays < 7) {
    return `Há ${differenceDays} dia${differenceDays === 1 ? "" : "s"}`;
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Lisbon",
  }).format(new Date(value));
}

const activityIcons: Record<
  DashboardActivityKind,
  { icon: typeof FileText; className: string }
> = {
  application: { icon: FileText, className: "bg-blue-50 text-blue-600" },
  note: { icon: MessageSquare, className: "bg-cyan-50 text-cyan-700" },
  interview: { icon: CalendarDays, className: "bg-violet-50 text-violet-600" },
  action: { icon: ListChecks, className: "bg-amber-50 text-amber-700" },
};

function SectionLink({
  href,
  label = "Ver todas",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      {label}
      <ArrowRight aria-hidden="true" className="size-3.5" />
    </Link>
  );
}

export async function DashboardPage() {
  const data = await getDashboardData();
  const stats = [
    {
      label: "Total de candidaturas",
      value: data.stats.totalApplications,
      detail: `${data.stats.applicationsLast30Days} nos últimos 30 dias`,
      icon: FileText,
      iconClass: "bg-blue-50 text-blue-600",
      href: "/candidaturas",
    },
    {
      label: "Candidaturas ativas",
      value: data.stats.activeApplications,
      detail: `${data.stats.interviewApplications} em fase de entrevista`,
      icon: BriefcaseBusiness,
      iconClass: "bg-violet-50 text-violet-600",
      href: "/candidaturas",
    },
    {
      label: "Próximas entrevistas",
      value: data.stats.upcomingInterviews,
      detail: "Agendadas para os próximos dias",
      icon: CalendarDays,
      iconClass: "bg-purple-50 text-purple-600",
      href: "/entrevistas?estado=scheduled",
    },
    {
      label: "Ações em atraso",
      value: data.stats.overdueActions,
      detail: `${data.stats.upcomingActions} até aos próximos 7 dias`,
      icon: ListChecks,
      iconClass:
        data.stats.overdueActions > 0
          ? "bg-amber-50 text-amber-600"
          : "bg-emerald-50 text-emerald-600",
      href: "/acoes?estado=pending",
    },
    {
      label: "Taxa de resposta",
      value: `${data.stats.responseRate}%`,
      detail: `${data.stats.respondedApplications} de ${data.stats.sentApplications} enviadas`,
      icon: Percent,
      iconClass: "bg-indigo-50 text-indigo-600",
      href: "/candidaturas",
    },
    {
      label: "Propostas recebidas",
      value: data.stats.offersReceived,
      detail: "Processos com proposta",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
      href: "/candidaturas?status=offer_received",
    },
    {
      label: "Rejeições",
      value: data.stats.rejections,
      detail: "Processos terminados",
      icon: XCircle,
      iconClass: "bg-red-50 text-red-600",
      href: "/candidaturas?status=rejected",
    },
    {
      label: "Empresas",
      value: data.stats.totalCompanies,
      detail: `${data.stats.companiesWithApplications} com candidatura`,
      icon: Building2,
      iconClass: "bg-cyan-50 text-cyan-700",
      href: "/empresas",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Acompanha o progresso e as próximas prioridades da tua procura de emprego."
        action={
          <Link href="/candidaturas/nova" className={buttonClassName()}>
            <Plus aria-hidden="true" className="size-4" />
            Nova candidatura
          </Link>
        }
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md">
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-2xl",
                      stat.iconClass,
                    )}
                  >
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {stat.detail}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <h2 className="font-bold text-slate-950">Candidaturas recentes</h2>
            <SectionLink href="/candidaturas" />
          </CardHeader>

          {data.recentApplications.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Inbox aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-slate-900">
                Ainda não existem candidaturas
              </p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                Quando adicionares a primeira candidatura, o progresso aparece
                aqui automaticamente.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Lista das candidaturas mais recentes
                  </caption>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                      <th className="px-5 py-3">Vaga</th>
                      <th className="px-4 py-3">Empresa</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Próxima ação</th>
                      <th className="w-12 px-3 py-3">
                        <span className="sr-only">Abrir</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentApplications.map((application) => (
                      <tr
                        key={application.id}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href="/candidaturas"
                            className="font-semibold text-slate-950 hover:text-blue-700"
                          >
                            {application.title}
                          </Link>
                          {application.location || application.workMode ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {[
                                application.location,
                                application.workMode
                                  ? workModeLabels[application.workMode]
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-2.5 font-medium text-slate-700">
                            <CompanyLogo
                              name={application.companyName}
                              logoUrl={application.companyLogoUrl}
                              size="sm"
                            />
                            <span className="max-w-36 truncate">
                              {application.companyName}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <ApplicationStatusBadge status={application.status} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                          {formatDate(application.applicationDate)}
                        </td>
                        <td className="px-4 py-4">
                          <p className="max-w-44 truncate font-medium text-slate-700">
                            {application.nextActionSummary ||
                              "Sem próxima ação"}
                          </p>
                          {application.followUpDate ? (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatDate(application.followUpDate)}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-4">
                          <Link
                            href="/candidaturas"
                            aria-label={`Abrir candidatura a ${application.title}`}
                            className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            <ChevronRight
                              aria-hidden="true"
                              className="size-4"
                            />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {data.recentApplications.map((application) => (
                  <article key={application.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <CompanyLogo
                        name={application.companyName}
                        logoUrl={application.companyLogoUrl}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href="/candidaturas"
                          className="font-semibold text-slate-950 hover:text-blue-700"
                        >
                          {application.title}
                        </Link>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {application.companyName}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={application.status} />
                    </div>
                    <div className="mt-4 flex justify-between gap-4 text-xs text-slate-500">
                      <span>{formatDate(application.applicationDate)}</span>
                      <span className="truncate text-right">
                        {application.nextActionSummary || "Sem próxima ação"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="font-bold text-slate-950">Follow-ups</h2>
            <SectionLink
              href="/candidaturas?ordem=follow_up"
              label="Ordenar todos"
            />
          </CardHeader>
          {data.followUps.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CalendarClock aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-slate-900">
                Nenhum follow-up pendente
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                As datas definidas nas candidaturas irão aparecer aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.followUps.map((followUp) => (
                <Link
                  key={followUp.id}
                  href="/candidaturas"
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
                >
                  <CompanyLogo
                    name={followUp.companyName}
                    logoUrl={followUp.companyLogoUrl}
                    size="md"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-950">
                      {followUp.nextActionSummary || "Rever candidatura"}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {followUp.title} · {followUp.companyName}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-semibold",
                      followUp.timing === "overdue"
                        ? "text-red-600"
                        : followUp.timing === "today"
                          ? "text-amber-600"
                          : "text-slate-500",
                    )}
                  >
                    {followUpLabel(followUp, data.today)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <h2 className="font-bold text-slate-950">Ações pendentes</h2>
            <SectionLink href="/acoes" />
          </CardHeader>
          {data.pendingActions.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ListChecks aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-slate-900">
                Nenhuma ação pendente
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                As tarefas das candidaturas irão aparecer aqui.
              </p>
            </div>
          ) : (
            <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
              {data.pendingActions.map((action) => (
                <Link
                  key={action.id}
                  href="/acoes"
                  className="flex items-center gap-3 p-5 transition hover:bg-slate-50"
                >
                  <CompanyLogo
                    name={action.companyName}
                    logoUrl={action.companyLogoUrl}
                    size="md"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-950">
                      {action.description}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {action.title} · {action.companyName}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <ActionPriorityBadge priority={action.priority} />
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          action.timing === "overdue"
                            ? "text-red-600"
                            : action.timing === "today"
                              ? "text-amber-600"
                              : "text-slate-500",
                        )}
                      >
                        {action.dueDate
                          ? action.timing === "today"
                            ? "Hoje"
                            : action.timing === "overdue"
                              ? `Em atraso · ${formatActionDate(action.dueDate)}`
                              : formatActionDate(action.dueDate)
                          : "Sem prazo"}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-slate-400"
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <h2 className="font-bold text-slate-950">Próximas entrevistas</h2>
            <SectionLink href="/entrevistas" />
          </CardHeader>
          {data.upcomingInterviews.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-slate-900">
                Nenhuma entrevista agendada
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                As próximas conversas irão aparecer aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
              {data.upcomingInterviews.map((interview) => (
                <Link
                  key={interview.id}
                  href="/entrevistas"
                  className="flex items-center gap-3 p-5 transition hover:bg-slate-50"
                >
                  <CompanyLogo
                    name={interview.companyName}
                    logoUrl={interview.companyLogoUrl}
                    size="md"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-950">
                      {interview.interviewType}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {interview.title} · {interview.companyName}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-violet-700">
                      <span>
                        {formatInterviewDateTime(interview.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video aria-hidden="true" className="size-3.5" />
                        {interviewFormatLabels[interview.format]}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-slate-400"
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">
                Evolução das candidaturas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Registos efetuados nos últimos seis meses
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 aria-hidden="true" className="size-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label={`Gráfico de candidaturas nos últimos seis meses: ${data.applicationTrend
                .map((point) => `${point.label}, ${point.value}`)
                .join("; ")}`}
              className="flex h-56 items-end gap-2 sm:gap-4"
            >
              {data.applicationTrend.map((point) => (
                <div
                  key={point.key}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <span className="mb-2 text-sm font-bold text-slate-700">
                    {point.value}
                  </span>
                  <div className="flex h-40 w-full items-end rounded-xl bg-slate-50 px-1.5 pt-2">
                    <div
                      className={cn(
                        "w-full rounded-lg bg-blue-500 transition-all",
                        point.value === 0 && "bg-slate-200",
                      )}
                      style={{
                        height:
                          point.value === 0
                            ? "2px"
                            : `${Math.max(point.percentage, 8)}%`,
                      }}
                    />
                  </div>
                  <span className="mt-2 text-[11px] font-bold tracking-wide text-slate-500">
                    {point.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">Atividade recente</h2>
              <p className="mt-1 text-sm text-slate-500">
                Alterações mais recentes no teu acompanhamento
              </p>
            </div>
            <Activity aria-hidden="true" className="size-5 text-slate-400" />
          </CardHeader>
          {data.recentActivity.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <Activity aria-hidden="true" className="size-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                A atividade aparece quando começares a atualizar candidaturas.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentActivity.map((activity) => {
                const config = activityIcons[activity.kind];
                const Icon = config.icon;

                return (
                  <Link
                    key={activity.id}
                    href={activity.href}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        config.className,
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">
                        {activity.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {activity.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] font-medium text-slate-400">
                      {formatActivityTime(activity.occurredAt)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">
              Candidaturas por estado
            </h2>
            <SectionLink href="/candidaturas" label="Abrir candidaturas" />
          </CardHeader>
          <CardContent>
            {data.statusSummary.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                A distribuição aparece depois da primeira candidatura.
              </p>
            ) : (
              <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                {data.statusSummary.map((status) => (
                  <div key={status.status}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-600">
                        {status.label}
                      </span>
                      <span className="font-bold text-slate-900">
                        {status.value}
                        <span className="ml-1 font-normal text-slate-400">
                          ({status.percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          statusBarClasses[status.status],
                        )}
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Acesso rápido</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/candidaturas/nova"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
            >
              <Plus aria-hidden="true" className="size-4" />
              Registar candidatura
              <ChevronRight
                aria-hidden="true"
                className="ml-auto size-4 text-slate-400"
              />
            </Link>
            <Link
              href="/acoes/nova"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
            >
              <ListChecks aria-hidden="true" className="size-4" />
              Criar ação
              <ChevronRight
                aria-hidden="true"
                className="ml-auto size-4 text-slate-400"
              />
            </Link>
            <Link
              href="/entrevistas/nova"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
            >
              <CalendarDays aria-hidden="true" className="size-4" />
              Agendar entrevista
              <ChevronRight
                aria-hidden="true"
                className="ml-auto size-4 text-slate-400"
              />
            </Link>
            <Link
              href="/candidaturas?ordem=follow_up"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
            >
              <CalendarClock aria-hidden="true" className="size-4" />
              Consultar follow-ups
              <ChevronRight
                aria-hidden="true"
                className="ml-auto size-4 text-slate-400"
              />
            </Link>
            <Link
              href="/empresas"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
            >
              <Building2 aria-hidden="true" className="size-4" />
              Consultar empresas
              <ChevronRight
                aria-hidden="true"
                className="ml-auto size-4 text-slate-400"
              />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
