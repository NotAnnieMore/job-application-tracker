import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Gift,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  nextActions,
  recentActivity,
  recentApplications,
  statusSummary,
  upcomingInterviews,
} from "@/features/dashboard/mock-data";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total de candidaturas",
    value: "28",
    change: "+5 desde o mês passado",
    icon: FileText,
    iconClass: "bg-blue-50 text-blue-600",
    changeClass: "text-emerald-600",
  },
  {
    label: "Entrevistas agendadas",
    value: "4",
    change: "+2 desde o mês passado",
    icon: CalendarDays,
    iconClass: "bg-emerald-50 text-emerald-600",
    changeClass: "text-emerald-600",
  },
  {
    label: "Follow-ups em atraso",
    value: "3",
    change: "+1 desde ontem",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-600",
    changeClass: "text-amber-600",
  },
  {
    label: "Propostas recebidas",
    value: "1",
    change: "Igual ao mês passado",
    icon: Gift,
    iconClass: "bg-purple-50 text-purple-600",
    changeClass: "text-slate-500",
  },
];

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

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Acompanha o progresso e as próximas prioridades da tua procura de emprego."
        action={
          <Link
            href="/candidaturas/nova"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Plus aria-hidden="true" className="size-4" />
            Nova candidatura
          </Link>
        }
      />

      <div className="flex items-center gap-2">
        <Badge variant="blue">Dados de demonstração</Badge>
        <span className="text-xs text-slate-500">
          Serão substituídos por dados do Supabase nas próximas fases.
        </span>
      </div>

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
                  <p
                    className={cn("mt-1 text-xs font-medium", stat.changeClass)}
                  >
                    {stat.change}
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
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((application) => (
                  <tr
                    key={application.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {application.role}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 font-medium text-slate-700">
                        <span
                          className={cn(
                            "flex size-7 items-center justify-center rounded-lg text-[10px] font-bold text-white",
                            application.companyColor,
                          )}
                        >
                          {application.companyInitial}
                        </span>
                        {application.company}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationStatusBadge status={application.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {application.applicationDate}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">
                        {application.nextAction}
                      </p>
                      {application.actionDate ? (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {application.actionDate}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Ações para ${application.role}`}
                      >
                        <MoreHorizontal aria-hidden="true" className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {recentApplications.map((application) => (
              <article key={application.id} className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {application.role}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {application.company}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={application.status} />
                </div>
                <div className="flex justify-between gap-4 text-xs text-slate-500">
                  <span>{application.applicationDate}</span>
                  <span>{application.nextAction}</span>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Próximas entrevistas</h2>
            <SectionLink href="/entrevistas" />
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center gap-3 px-5 py-4"
              >
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-base font-bold leading-none text-slate-950">
                    {interview.day}
                  </span>
                  <span className="mt-1 text-[9px] font-bold tracking-wide text-slate-500">
                    {interview.month}
                  </span>
                </div>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
                    interview.companyColor,
                  )}
                >
                  {interview.companyInitial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {interview.role}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {interview.company}
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {interview.time}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-slate-400"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">
              Candidaturas por estado
            </h2>
            <SectionLink href="/dashboard" label="Ver relatório" />
          </CardHeader>
          <CardContent className="space-y-4">
            {statusSummary.map((status) => (
              <div key={status.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">
                    {status.label}
                  </span>
                  <span className="font-bold text-slate-900">
                    {status.value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full", status.color)}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Próximas ações</h2>
            <SectionLink href="/acoes" />
          </CardHeader>
          <CardContent className="space-y-1 p-3">
            {nextActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start gap-3 rounded-xl px-2 py-3 hover:bg-slate-50"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                    action.completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white",
                  )}
                >
                  {action.completed ? (
                    <Check aria-hidden="true" className="size-3" />
                  ) : null}
                </span>
                <p
                  className={cn(
                    "min-w-0 flex-1 text-sm font-medium",
                    action.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-700",
                  )}
                >
                  {action.label}
                </p>
                <span
                  className={cn(
                    "shrink-0 text-xs font-semibold",
                    action.urgent
                      ? "text-red-600"
                      : action.completed
                        ? "text-emerald-600"
                        : "text-slate-500",
                  )}
                >
                  {action.date}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-slate-950">Atividade recente</h2>
          </CardHeader>
          <CardContent className="space-y-5">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    activity.type === "interview"
                      ? "bg-emerald-50 text-emerald-600"
                      : activity.type === "follow-up"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600",
                  )}
                >
                  {activity.type === "interview" ? (
                    <CalendarDays aria-hidden="true" className="size-4" />
                  ) : activity.type === "follow-up" ? (
                    <CircleDollarSign aria-hidden="true" className="size-4" />
                  ) : (
                    <FileText aria-hidden="true" className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {activity.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {activity.detail}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {activity.relativeTime}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
