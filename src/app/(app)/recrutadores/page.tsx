import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Link2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { AutoSubmitSelect } from "@/components/applications/auto-submit-select";
import { CompanyLogo } from "@/components/companies/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getRecruiterCompanyOptions,
  getRecruiters,
} from "@/features/recruiters/data";
import { isValidUuid } from "@/lib/validation";

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function recruiterInitials(name: string, locale: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase(locale))
      .join("") || "?"
  );
}

export default async function RecruitersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations("Recruiters");
  const notices: Record<string, string> = {
    "contacto-criado": t("created"),
    "contacto-atualizado": t("updated"),
    "contacto-eliminado": t("deleted"),
  };
  const params = await searchParams;
  const query = singleValue(params.q).slice(0, 100);
  const rawCompanyId = singleValue(params.empresa);
  const companyId = isValidUuid(rawCompanyId) ? rawCompanyId : "";
  const [recruiters, companies] = await Promise.all([
    getRecruiters({
      query: query || undefined,
      companyId: companyId || undefined,
    }),
    getRecruiterCompanyOptions(),
  ]);
  const notice = notices[singleValue(params.estado)];
  const hasFilters = Boolean(query || companyId);

  return (
    <div className="space-y-6">
      <div className="space-y-6" data-tour="recruiters">
        <PageHeader
          title={t("title")}
          description={t("description")}
          action={
            <Link href="/recrutadores/novo" className={buttonClassName()}>
              <Plus aria-hidden="true" className="size-4" />
              {t("new")}
            </Link>
          }
        />

        <SuccessToast message={notice} />

        <Card>
          <form
            action="/recrutadores"
            method="get"
            className="grid gap-3 p-4 md:grid-cols-[minmax(15rem,1fr)_16rem_auto]"
          >
            <label className="relative min-w-0">
              <span className="sr-only">{t("searchContacts")}</span>
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
            <div className="flex gap-2">
              <button
                type="submit"
                className={buttonClassName({ size: "sm", className: "flex-1" })}
              >
                <Search aria-hidden="true" className="size-4" />
                {t("search")}
              </button>
              {hasFilters ? (
                <Link
                  href="/recrutadores"
                  aria-label={t("clearFilters")}
                  title={t("clearFilters")}
                  className={buttonClassName({
                    variant: "secondary",
                    size: "icon",
                  })}
                >
                  <X aria-hidden="true" className="size-4" />
                </Link>
              ) : null}
            </div>
          </form>
        </Card>
      </div>

      {recruiters.length === 0 ? (
        <EmptyState
          icon={hasFilters ? Search : Users}
          title={hasFilters ? t("emptyFiltered") : t("empty")}
          description={
            hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
          }
          actionLabel={hasFilters ? t("clearFilters") : t("addContact")}
          actionHref={hasFilters ? "/recrutadores" : "/recrutadores/novo"}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recruiters.map((recruiter) => (
            <Card key={recruiter.id} className="transition hover:shadow-md">
              <CardContent>
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xs font-bold text-white">
                    {recruiterInitials(recruiter.name, locale)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-slate-950">
                      {recruiter.name}
                    </h2>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {recruiter.jobTitle || t("noJobTitle")}
                    </p>
                  </div>
                  <Link
                    href={`/recrutadores/${recruiter.id}/editar`}
                    aria-label={t("editName", { name: recruiter.name })}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Link>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  {recruiter.companyName ? (
                    <Link
                      href={`/recrutadores?empresa=${recruiter.companyId}`}
                      className="flex items-center gap-2 font-medium text-slate-700 hover:text-blue-700"
                    >
                      <CompanyLogo
                        name={recruiter.companyName}
                        logoUrl={recruiter.companyLogoUrl}
                        size="sm"
                      />
                      <span className="truncate">{recruiter.companyName}</span>
                    </Link>
                  ) : (
                    <p className="flex items-center gap-2">
                      <Building2
                        aria-hidden="true"
                        className="size-4 text-slate-400"
                      />
                      {t("noCompany")}
                    </p>
                  )}
                  {recruiter.email ? (
                    <a
                      href={`mailto:${recruiter.email}`}
                      className="flex items-center gap-2 truncate hover:text-blue-700"
                    >
                      <Mail
                        aria-hidden="true"
                        className="size-4 shrink-0 text-slate-400"
                      />
                      <span className="truncate">{recruiter.email}</span>
                    </a>
                  ) : null}
                  {recruiter.phone ? (
                    <a
                      href={`tel:${recruiter.phone}`}
                      className="flex items-center gap-2 hover:text-blue-700"
                    >
                      <Phone
                        aria-hidden="true"
                        className="size-4 text-slate-400"
                      />
                      {recruiter.phone}
                    </a>
                  ) : null}
                  {recruiter.linkedinUrl ? (
                    <a
                      href={recruiter.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Link2 aria-hidden="true" className="size-4" />
                      {t("openLinkedin")}
                      <ExternalLink aria-hidden="true" className="size-3.5" />
                    </a>
                  ) : null}
                  <Link
                    href={`/candidaturas?q=${encodeURIComponent(recruiter.name)}`}
                    className="flex items-center gap-2 hover:text-blue-700"
                  >
                    <BriefcaseBusiness
                      aria-hidden="true"
                      className="size-4 text-slate-400"
                    />
                    {t("applicationCount", {
                      count: recruiter.applicationCount,
                    })}
                  </Link>
                </div>

                {recruiter.notes ? (
                  <p className="mt-4 line-clamp-3 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
                    {recruiter.notes}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
