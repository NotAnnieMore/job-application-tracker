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
import { getLocale, getTranslations } from "next-intl/server";

import { AutoSubmitSelect } from "@/components/applications/auto-submit-select";
import { CompanyLogo } from "@/components/companies/company-logo";
import { InterviewQuickStatusForm } from "@/components/interviews/interview-quick-status-form";
import {
  ActiveFilters,
  type ActiveFilter,
} from "@/components/shared/active-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { interviewStatusOptions } from "@/features/interviews/constants";
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
import { isValidUuid } from "@/lib/validation";
import type { InterviewStatusValue } from "@/types/database.types";

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

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function isExternalLocation(value: string) {
  return /^https:\/\//iu.test(value);
}

async function InterviewCard({ interview }: { interview: InterviewListItem }) {
  const [locale, t, tFormat] = await Promise.all([
    getLocale(),
    getTranslations("Interviews"),
    getTranslations("Enums.interviewFormat"),
  ]);

  return (
    <Card className="group relative transition hover:border-blue-200 hover:shadow-md">
      <Link
        href={`/entrevistas/${interview.id}`}
        className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        aria-label={t("viewSummaryFor", { type: interview.interviewType })}
      >
        <span className="sr-only">{t("viewSummary")}</span>
      </Link>
      <CardContent className="pointer-events-none flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <span className="text-xl leading-none font-bold text-slate-950">
            {formatInterviewDay(interview.scheduledAt, locale)}
          </span>
          <span className="mt-1 text-[calc(0.625rem*var(--app-font-scale))] font-bold tracking-wide text-slate-500">
            {formatInterviewMonth(interview.scheduledAt, locale)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-slate-950 transition group-hover:text-blue-700">
              {interview.interviewType}
            </h2>
            <InterviewQuickStatusForm
              interviewId={interview.id}
              status={interview.status}
              className="pointer-events-auto relative z-10 w-32"
            />
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
              {formatInterviewTime(interview.scheduledAt, locale)} ·{" "}
              {t("minutesShort", { count: interview.durationMinutes })}
            </span>
            <span className="flex items-center gap-2">
              <Video aria-hidden="true" className="size-4" />
              {tFormat(interview.format)}
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
                  className="pointer-events-auto relative z-10 flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
                  {t("openLink")}
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
          className={buttonClassName({
            variant: "secondary",
            size: "sm",
            className: "pointer-events-auto relative z-10",
          })}
        >
          <Pencil aria-hidden="true" className="size-4" />
          {t("edit")}
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
  const [locale, t, tStatus] = await Promise.all([
    getLocale(),
    getTranslations("Interviews"),
    getTranslations("Enums.interviewStatus"),
  ]);
  const rawStatus = singleValue(params.estado);
  const status = validStatus(rawStatus) ? rawStatus : undefined;
  const rawApplicationId = singleValue(params.candidatura);
  const applicationId = isValidUuid(rawApplicationId) ? rawApplicationId : "";
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
  const noticeKey = singleValue(params.aviso);
  const notice =
    noticeKey === "entrevista-criada"
      ? t("created")
      : noticeKey === "entrevista-atualizada"
        ? t("updated")
        : noticeKey === "entrevista-eliminada"
          ? t("deleted")
          : undefined;
  const upcoming = interviews.filter((interview) => interview.isUpcoming);
  const history = interviews.filter((interview) => !interview.isUpcoming);
  const activeFilters: ActiveFilter[] = [
    ...(status
      ? [
          {
            label: t("status"),
            value: tStatus(status),
          },
        ]
      : []),
    ...(applicationId
      ? [
          {
            label: t("application"),
            value:
              applications.find(
                (application) => application.id === applicationId,
              )?.title ?? t("unknown"),
          },
        ]
      : []),
    ...(dateFrom
      ? [{ label: t("from"), value: formatDate(dateFrom, locale) }]
      : []),
    ...(dateTo ? [{ label: t("to"), value: formatDate(dateTo, locale) }] : []),
  ];
  const hasFilters = activeFilters.length > 0;

  return (
    <div className="space-y-6">
      <div data-tour="interviews-header">
        <PageHeader
          title={t("title")}
          description={t("description")}
          action={
            <Link href="/entrevistas/nova" className={buttonClassName()}>
              <Plus aria-hidden="true" className="size-4" />
              {t("new")}
            </Link>
          }
        />
      </div>

      <SuccessToast message={notice} queryParam="aviso" />

      <Card>
        <form
          action="/entrevistas"
          method="get"
          className="grid items-end gap-3 p-4 md:grid-cols-2 xl:grid-cols-[12rem_minmax(16rem,1fr)_12rem_12rem_auto]"
        >
          <label>
            <span className="sr-only">{t("filterStatus")}</span>
            <AutoSubmitSelect
              name="estado"
              defaultValue={status ?? ""}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">{t("allStatuses")}</option>
              {interviewStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {tStatus(option.value)}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="sr-only">{t("filterApplication")}</span>
            <AutoSubmitSelect
              name="candidatura"
              defaultValue={applicationId}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">{t("allApplications")}</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.companyName} — {application.title}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              {t("interviewsFrom")}
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
              {t("interviewsTo")}
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
            {t("applyDates")}
          </button>
        </form>
      </Card>

      <ActiveFilters filters={activeFilters} clearHref="/entrevistas" />

      {interviews.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={hasFilters ? t("emptyFiltered") : t("empty")}
          description={
            hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
          }
          actionLabel={hasFilters ? t("clearFilters") : t("scheduleInterview")}
          actionHref={hasFilters ? "/entrevistas" : "/entrevistas/nova"}
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {t("upcoming")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("upcomingDescription")}
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
                <h2 className="text-lg font-bold text-slate-950">
                  {t("history")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("historyDescription")}
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
