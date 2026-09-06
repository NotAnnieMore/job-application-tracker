import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  FileText,
  FileSearch,
  Inbox,
  ListChecks,
  MessageSquare,
  Percent,
  Plus,
  Video,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ActionPriorityBadge } from "@/components/actions/action-badges";
import { CompanyLogo } from "@/components/companies/company-logo";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatActionDate } from "@/features/actions/date";
import { getDashboardData } from "@/features/dashboard/data";
import type { DashboardActivityKind } from "@/features/dashboard/types";
import { formatInterviewDateTime } from "@/features/interviews/date";
import type { AppLocale } from "@/i18n/config";
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

function formatDate(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function activityTimeParts(value: string) {
  const differenceMinutes = Math.max(
    0,
    Math.round((Date.now() - Date.parse(value)) / 60_000),
  );

  if (differenceMinutes < 1) return { unit: "now" as const, count: 0 };
  if (differenceMinutes < 60) {
    return { unit: "minutes" as const, count: differenceMinutes };
  }

  const differenceHours = Math.round(differenceMinutes / 60);
  if (differenceHours < 24) {
    return { unit: "hours" as const, count: differenceHours };
  }

  const differenceDays = Math.round(differenceHours / 24);
  if (differenceDays < 7) {
    return { unit: "days" as const, count: differenceDays };
  }

  return { unit: "date" as const, count: 0 };
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

function SectionLink({ href, label }: { href: string; label: string }) {
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

const quickAccessItems = [
  {
    labelKey: "application",
    href: "/candidaturas/nova",
    icon: Plus,
  },
  { labelKey: "task", href: "/acoes/nova", icon: ListChecks },
  {
    labelKey: "interview",
    href: "/entrevistas/nova",
    icon: CalendarDays,
  },
  { labelKey: "calendar", href: "/agenda", icon: CalendarRange },
  { labelKey: "companies", href: "/empresas", icon: Building2 },
] as const;

async function QuickAccessCard() {
  const t = await getTranslations("Dashboard");

  return (
    <Card>
      <CardHeader>
        <h2 className="font-bold text-slate-950">{t("quickAccess")}</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
            >
              <Icon aria-hidden="true" className="size-4" />
              {t(`quick.${item.labelKey}`)}
              <ChevronRight
                aria-hidden="true"
                className="ml-auto size-4 text-slate-400"
              />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

export async function DashboardPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Dashboard");
  const enums = await getTranslations("Enums");
  const data = await getDashboardData(locale);
  const stats = [
    {
      label: t("stats.totalApplications"),
      value: data.stats.totalApplications,
      detail: t("stats.last30Days", {
        count: data.stats.applicationsLast30Days,
      }),
      icon: FileText,
      iconClass: "bg-blue-50 text-blue-600",
      href: "/candidaturas",
    },
    {
      label: t("stats.activeApplications"),
      value: data.stats.activeApplications,
      detail: t("stats.interviewStage", {
        count: data.stats.interviewApplications,
      }),
      icon: BriefcaseBusiness,
      iconClass: "bg-violet-50 text-violet-600",
      href: "/candidaturas",
    },
    {
      label: t("stats.upcomingInterviews"),
      value: data.stats.upcomingInterviews,
      detail: t("stats.scheduledSoon"),
      icon: CalendarDays,
      iconClass: "bg-purple-50 text-purple-600",
      href: "/entrevistas?estado=scheduled",
    },
    {
      label: t("stats.overdueTasks"),
      value: data.stats.overdueActions,
      detail: t("stats.upcomingTasks", {
        count: data.stats.upcomingActions,
      }),
      icon: ListChecks,
      iconClass:
        data.stats.overdueActions > 0
          ? "bg-amber-50 text-amber-600"
          : "bg-emerald-50 text-emerald-600",
      href: "/acoes?estado=pending",
    },
    {
      label: t("stats.responseRate"),
      value: `${data.stats.responseRate}%`,
      detail: t("stats.responses", {
        responded: data.stats.respondedApplications,
        sent: data.stats.sentApplications,
      }),
      icon: Percent,
      iconClass: "bg-indigo-50 text-indigo-600",
      href: "/candidaturas",
    },
    {
      label: t("stats.offers"),
      value: data.stats.offersReceived,
      detail: t("stats.offerProcesses"),
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
      href: "/candidaturas?status=offer_received",
    },
    {
      label: t("stats.rejections"),
      value: data.stats.rejections,
      detail: t("stats.finishedProcesses"),
      icon: XCircle,
      iconClass: "bg-red-50 text-red-600",
      href: "/candidaturas?status=rejected",
    },
    {
      label: t("stats.companies"),
      value: data.stats.totalCompanies,
      detail: t("stats.companiesWithApplication", {
        count: data.stats.companiesWithApplications,
      }),
      icon: Building2,
      iconClass: "bg-cyan-50 text-cyan-700",
      href: "/empresas",
    },
  ];

  return (
    <div className="space-y-6">
      <div data-tour="dashboard-overview">
        <PageHeader
          title={t("title")}
          description={t("description")}
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href="/candidaturas/nova?importar=vaga"
                className={buttonClassName({ variant: "secondary" })}
              >
                <FileSearch aria-hidden="true" className="size-4" />
                {t("importJob")}
              </Link>
              <Link
                href="/candidaturas/nova"
                className={buttonClassName()}
                data-tour="add-application"
              >
                <Plus aria-hidden="true" className="size-4" />
                {t("newApplication")}
              </Link>
            </div>
          }
        />
      </div>

      <section
        data-tour="statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label={t("summary")}
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
            <h2 className="font-bold text-slate-950">
              {t("recentApplications")}
            </h2>
            <SectionLink href="/candidaturas" label={t("viewAll")} />
          </CardHeader>

          {data.recentApplications.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Inbox aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-slate-900">
                {t("noApplications")}
              </p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {t("noApplicationsDescription")}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    {t("recentApplicationsCaption")}
                  </caption>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                      <th className="px-5 py-3">{t("table.role")}</th>
                      <th className="px-4 py-3">{t("table.company")}</th>
                      <th className="px-4 py-3">{t("table.status")}</th>
                      <th className="px-4 py-3">{t("table.date")}</th>
                      <th className="px-4 py-3">{t("table.nextTask")}</th>
                      <th className="w-12 px-3 py-3">
                        <span className="sr-only">{t("table.open")}</span>
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
                                  ? enums(`workMode.${application.workMode}`)
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
                          {formatDate(application.applicationDate, locale)}
                        </td>
                        <td className="px-4 py-4">
                          <p className="max-w-44 truncate font-medium text-slate-700">
                            {application.nextActionSummary || t("noNextTask")}
                          </p>
                          {application.followUpDate ? (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatDate(application.followUpDate, locale)}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-4">
                          <Link
                            href="/candidaturas"
                            aria-label={t("openApplication", {
                              title: application.title,
                            })}
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
                      <span>
                        {formatDate(application.applicationDate, locale)}
                      </span>
                      <span className="truncate text-right">
                        {application.nextActionSummary || t("noNextTask")}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </Card>

        <QuickAccessCard />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <h2 className="font-bold text-slate-950">{t("pendingTasks")}</h2>
            <SectionLink href="/acoes" label={t("viewAll")} />
          </CardHeader>
          {data.pendingActions.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ListChecks aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-slate-900">
                {t("noPendingTasks")}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t("noPendingTasksDescription")}
              </p>
            </div>
          ) : (
            <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
              {data.pendingActions.map((action) => (
                <Link
                  key={action.id}
                  href="/acoes"
                  className="flex items-start gap-3 p-4 transition hover:bg-slate-50 sm:p-5"
                >
                  <CompanyLogo
                    name={action.companyName}
                    logoUrl={action.companyLogoUrl}
                    size="md"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm leading-5 font-semibold text-slate-950">
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
                            ? t("today")
                            : action.timing === "overdue"
                              ? t("overdue", {
                                  date: formatActionDate(
                                    action.dueDate,
                                    locale,
                                  ),
                                })
                              : formatActionDate(action.dueDate, locale)
                          : t("noDeadline")}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-slate-400"
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <h2 className="font-bold text-slate-950">
              {t("upcomingInterviews")}
            </h2>
            <SectionLink href="/entrevistas" label={t("viewAll")} />
          </CardHeader>
          {data.upcomingInterviews.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <p className="mt-3 font-semibold text-slate-900">
                {t("noInterviews")}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t("noInterviewsDescription")}
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
                        {formatInterviewDateTime(interview.scheduledAt, locale)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video aria-hidden="true" className="size-3.5" />
                        {enums(`interviewFormat.${interview.format}`)}
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
              <h2 className="font-bold text-slate-950">{t("trend")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("trendDescription")}
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 aria-hidden="true" className="size-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label={t("trendAria", {
                points: data.applicationTrend
                  .map((point) => `${point.label}, ${point.value}`)
                  .join("; "),
              })}
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
                  <span className="mt-2 text-[calc(0.6875rem*var(--app-font-scale))] font-bold tracking-wide text-slate-500">
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
              <h2 className="font-bold text-slate-950">
                {t("recentActivity")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("recentActivityDescription")}
              </p>
            </div>
            <Activity aria-hidden="true" className="size-5 text-slate-400" />
          </CardHeader>
          {data.recentActivity.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <Activity aria-hidden="true" className="size-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">{t("noActivity")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentActivity.map((activity) => {
                const config = activityIcons[activity.kind];
                const Icon = config.icon;
                const time = activityTimeParts(activity.occurredAt);
                const timeLabel =
                  time.unit === "now"
                    ? t("now")
                    : time.unit === "minutes"
                      ? t("minutesAgo", { count: time.count })
                      : time.unit === "hours"
                        ? t("hoursAgo", { count: time.count })
                        : time.unit === "days"
                          ? t("daysAgo", { count: time.count })
                          : new Intl.DateTimeFormat(locale, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              timeZone: "Europe/Lisbon",
                            }).format(new Date(activity.occurredAt));

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
                        {t(`activity.${activity.kind}.${activity.change}`)}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {activity.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-[calc(0.6875rem*var(--app-font-scale))] font-medium text-slate-400">
                      {timeLabel}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <h2 className="font-bold text-slate-950">
              {t("applicationsByStatus")}
            </h2>
            <SectionLink href="/candidaturas" label={t("openApplications")} />
          </CardHeader>
          <CardContent>
            {data.statusSummary.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {t("noStatusDistribution")}
              </p>
            ) : (
              <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                {data.statusSummary.map((status) => (
                  <div key={status.status}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-600">
                        {enums(`applicationStatus.${status.status}`)}
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
      </div>
    </div>
  );
}
