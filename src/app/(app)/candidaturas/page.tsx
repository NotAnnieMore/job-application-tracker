import { Filter, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { ApplicationQuickStatusForm } from "@/components/applications/application-quick-status-form";
import { AutoSubmitSelect } from "@/components/applications/auto-submit-select";
import { ApplicationLinkFeedback } from "@/components/applications/application-link-feedback";
import { CompanyLogo } from "@/components/companies/company-logo";
import {
  ActiveFilters,
  type ActiveFilter,
} from "@/components/shared/active-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  applicationStatusOptions,
  workModeOptions,
} from "@/features/applications/constants";
import {
  getApplications,
  getCompanyOptions,
  getRecruiterOptions,
} from "@/features/applications/data";
import type { ApplicationListFilters } from "@/features/applications/types";
import type { AppLocale } from "@/i18n/config";
import { isValidUuid } from "@/lib/validation";
import type {
  ApplicationStatusValue,
  WorkModeValue,
} from "@/types/database.types";

const statusValues = new Set(
  applicationStatusOptions.map((option) => option.value),
);
const workModeValues = new Set(workModeOptions.map((option) => option.value));

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function formatDate(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Applications");
  const enums = await getTranslations("Enums");
  const common = await getTranslations("Common");
  const query = singleValue(params.q).slice(0, 100);
  const rawStatus = singleValue(params.status);
  const rawCompanyId = singleValue(params.empresa);
  const rawRecruiterId = singleValue(params.recrutador);
  const companyId = isValidUuid(rawCompanyId) ? rawCompanyId : "";
  const recruiterId = isValidUuid(rawRecruiterId) ? rawRecruiterId : "";
  const rawWorkMode = singleValue(params.modalidade);
  const rawDateFrom = singleValue(params.desde);
  const rawDateTo = singleValue(params.ate);
  const rawSort = singleValue(params.ordem);
  const status = statusValues.has(rawStatus as ApplicationStatusValue)
    ? (rawStatus as ApplicationStatusValue)
    : undefined;
  const workMode = workModeValues.has(rawWorkMode as WorkModeValue)
    ? (rawWorkMode as WorkModeValue)
    : undefined;
  const sort: ApplicationListFilters["sort"] = [
    "newest",
    "oldest",
    "follow_up",
  ].includes(rawSort)
    ? (rawSort as ApplicationListFilters["sort"])
    : "newest";
  const dateFrom = validDate(rawDateFrom) ? rawDateFrom : undefined;
  const dateTo = validDate(rawDateTo) ? rawDateTo : undefined;
  const filters: ApplicationListFilters = {
    query: query || undefined,
    status,
    companyId: companyId || undefined,
    recruiterId: recruiterId || undefined,
    workMode,
    dateFrom,
    dateTo,
    sort,
  };
  const [applications, companies, recruiters] = await Promise.all([
    getApplications(filters),
    getCompanyOptions(),
    getRecruiterOptions(),
  ]);
  const noticeKey = singleValue(params.estado);
  const notice =
    noticeKey === "candidatura-criada"
      ? t("created")
      : noticeKey === "candidatura-atualizada"
        ? t("updated")
        : noticeKey === "candidatura-eliminada"
          ? t("deleted")
          : undefined;
  const activeFilters: ActiveFilter[] = [
    ...(query ? [{ label: t("filterLabels.search"), value: query }] : []),
    ...(status
      ? [
          {
            label: t("filterLabels.status"),
            value: enums(`applicationStatus.${status}`),
          },
        ]
      : []),
    ...(companyId
      ? [
          {
            label: t("filterLabels.company"),
            value:
              companies.find((company) => company.id === companyId)?.name ??
              common("unknownCompany"),
          },
        ]
      : []),
    ...(recruiterId
      ? [
          {
            label: t("filterLabels.recruiter"),
            value:
              recruiters.find((recruiter) => recruiter.id === recruiterId)
                ?.name ?? common("unknownRecruiter"),
          },
        ]
      : []),
    ...(workMode
      ? [
          {
            label: t("filterLabels.workMode"),
            value: enums(`workMode.${workMode}`),
          },
        ]
      : []),
    ...(dateFrom
      ? [
          {
            label: t("filterLabels.from"),
            value: formatDate(dateFrom, locale),
          },
        ]
      : []),
    ...(dateTo
      ? [
          {
            label: t("filterLabels.to"),
            value: formatDate(dateTo, locale),
          },
        ]
      : []),
    ...(rawSort
      ? [
          {
            label: t("filterLabels.sort"),
            value:
              sort === "oldest"
                ? t("filterLabels.oldest")
                : sort === "follow_up"
                  ? t("filterLabels.followUp")
                  : t("filterLabels.newest"),
          },
        ]
      : []),
  ];
  const hasFilters = activeFilters.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Link href="/candidaturas/nova" className={buttonClassName()}>
            <Plus aria-hidden="true" className="size-4" />
            {t("new")}
          </Link>
        }
      />

      <SuccessToast message={notice} />

      <Card>
        <form
          action="/candidaturas"
          method="get"
          className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <label className="relative min-w-0 md:col-span-2">
            <span className="sr-only">{t("search")}</span>
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-10 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <label>
            <span className="sr-only">{t("filterStatus")}</span>
            <AutoSubmitSelect
              name="status"
              defaultValue={status ?? ""}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">{t("allStatuses")}</option>
              {applicationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {enums(`applicationStatus.${option.value}`)}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="sr-only">{t("filterRecruiter")}</span>
            <AutoSubmitSelect
              name="recrutador"
              defaultValue={recruiterId}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">{t("allRecruiters")}</option>
              {recruiters.map((recruiter) => (
                <option key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="sr-only">{t("filterCompany")}</span>
            <AutoSubmitSelect
              name="empresa"
              defaultValue={companyId}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">{t("allCompanies")}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="sr-only">{t("filterWorkMode")}</span>
            <AutoSubmitSelect
              name="modalidade"
              defaultValue={workMode ?? ""}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">{t("allWorkModes")}</option>
              {workModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {enums(`workMode.${option.value}`)}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              {t("from")}
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
              {t("to")}
            </span>
            <input
              name="ate"
              type="date"
              defaultValue={dateTo ?? ""}
              min={dateFrom}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <label>
            <span className="sr-only">{t("sort")}</span>
            <AutoSubmitSelect
              name="ordem"
              defaultValue={sort}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="newest">{t("newestFirst")}</option>
              <option value="oldest">{t("oldestFirst")}</option>
              <option value="follow_up">{t("nextFollowUp")}</option>
            </AutoSubmitSelect>
          </label>
          <button
            type="submit"
            className={buttonClassName({ size: "sm", className: "self-end" })}
          >
            <Filter aria-hidden="true" className="size-4" />
            {t("applySearch")}
          </button>
        </form>
      </Card>

      <ActiveFilters filters={activeFilters} clearHref="/candidaturas" />

      {applications.length === 0 ? (
        <EmptyState
          icon={Search}
          title={hasFilters ? t("emptyFiltered") : t("empty")}
          description={
            hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
          }
          actionLabel={hasFilters ? t("clearFilters") : t("createFirst")}
          actionHref={hasFilters ? "/candidaturas" : "/candidaturas/nova"}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">{t("caption")}</caption>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3">{t("table.role")}</th>
                  <th className="px-4 py-3">{t("table.company")}</th>
                  <th className="px-4 py-3">{t("table.status")}</th>
                  <th className="px-4 py-3">{t("table.date")}</th>
                  <th className="px-4 py-3">{t("table.nextTask")}</th>
                  <th className="w-12 px-3 py-3">
                    <span className="sr-only">{t("table.options")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="group transition-colors hover:bg-blue-50/60"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/candidaturas/${application.id}`}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-md font-semibold text-slate-950 transition group-hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-px"
                      >
                        <span className="truncate">{application.title}</span>
                        <ApplicationLinkFeedback />
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
                        <span>
                          {application.companyName}
                          {application.recruiterName ? (
                            <span className="mt-0.5 block text-xs font-normal text-slate-500">
                              {application.recruiterName}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <ApplicationQuickStatusForm
                        applicationId={application.id}
                        status={application.status}
                        className="max-w-48"
                      />
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(application.applicationDate, locale)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-700">
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
                        href={`/candidaturas/${application.id}/editar`}
                        aria-label={t("editApplication", {
                          title: application.title,
                        })}
                        className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {applications.map((application) => (
              <article
                key={application.id}
                className="p-4 transition-colors hover:bg-blue-50/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/candidaturas/${application.id}`}
                    aria-label={t("openApplication", {
                      title: application.title,
                    })}
                    className="group flex min-w-0 flex-1 gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-px"
                  >
                    <span className="shrink-0">
                      <CompanyLogo
                        name={application.companyName}
                        logoUrl={application.companyLogoUrl}
                        size="sm"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-950 transition-colors group-hover:text-blue-700">
                        <span className="truncate">{application.title}</span>
                        <ApplicationLinkFeedback />
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {application.companyName}
                      </span>
                    </span>
                  </Link>
                  <ApplicationQuickStatusForm
                    applicationId={application.id}
                    status={application.status}
                    className="max-w-40 shrink-0"
                  />
                </div>
                <Link
                  href={`/candidaturas/${application.id}`}
                  aria-label={t("viewApplication", {
                    title: application.title,
                  })}
                  className="mt-4 flex items-end justify-between gap-3 rounded-lg text-xs text-slate-500 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-px"
                >
                  <span>{formatDate(application.applicationDate, locale)}</span>
                  <span className="text-right">
                    {application.nextActionSummary || t("noNextTask")}
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
