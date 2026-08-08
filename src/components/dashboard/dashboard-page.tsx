import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarClock,
  ChevronRight,
  Clock3,
  FileText,
  Inbox,
  Plus,
  Video,
} from "lucide-react";
import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { CompanyLogo } from "@/components/companies/company-logo";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { workModeLabels } from "@/features/applications/constants";
import { getDashboardData } from "@/features/dashboard/data";
import type { DashboardFollowUp } from "@/features/dashboard/types";
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
    },
    {
      label: "Candidaturas ativas",
      value: data.stats.activeApplications,
      detail: `${data.stats.interviewApplications} em fase de entrevista`,
      icon: BriefcaseBusiness,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      label: "Follow-ups em atraso",
      value: data.stats.overdueFollowUps,
      detail: `${data.stats.upcomingFollowUps} até aos próximos 7 dias`,
      icon: Clock3,
      iconClass:
        data.stats.overdueFollowUps > 0
          ? "bg-amber-50 text-amber-600"
          : "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Empresas",
      value: data.stats.totalCompanies,
      detail: `${data.stats.companiesWithApplications} com candidatura`,
      icon: Building2,
      iconClass: "bg-cyan-50 text-cyan-700",
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
            <Card key={stat.label} className="p-5">
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
                            href={`/candidaturas/${application.id}/editar`}
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
                            href={`/candidaturas/${application.id}/editar`}
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
                          href={`/candidaturas/${application.id}/editar`}
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
                  href={`/candidaturas/${followUp.id}/editar`}
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
                  href={`/entrevistas/${interview.id}/editar`}
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
