import { Filter, Pencil, Plus, Search, X } from "lucide-react";
import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { AutoSubmitSelect } from "@/components/applications/auto-submit-select";
import { CompanyLogo } from "@/components/companies/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  applicationStatusOptions,
  workModeLabels,
  workModeOptions,
} from "@/features/applications/constants";
import {
  getApplications,
  getCompanyOptions,
} from "@/features/applications/data";
import type { ApplicationListFilters } from "@/features/applications/types";
import type {
  ApplicationStatusValue,
  WorkModeValue,
} from "@/types/database.types";

const notices: Record<string, string> = {
  "candidatura-criada": "Candidatura criada com sucesso.",
  "candidatura-atualizada": "Candidatura atualizada com sucesso.",
  "candidatura-eliminada": "Candidatura eliminada com sucesso.",
};

const statusValues = new Set(
  applicationStatusOptions.map((option) => option.value),
);
const workModeValues = new Set(workModeOptions.map((option) => option.value));

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

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = singleValue(params.q).slice(0, 100);
  const rawStatus = singleValue(params.status);
  const rawCompanyId = singleValue(params.empresa);
  const rawWorkMode = singleValue(params.modalidade);
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
  const filters: ApplicationListFilters = {
    query: query || undefined,
    status,
    companyId: rawCompanyId || undefined,
    workMode,
    sort,
  };
  const [applications, companies] = await Promise.all([
    getApplications(filters),
    getCompanyOptions(),
  ]);
  const noticeKey = singleValue(params.estado);
  const notice = notices[noticeKey];
  const hasFilters = Boolean(
    query || status || rawCompanyId || workMode || rawSort,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidaturas"
        description="Consulta e organiza todas as oportunidades que estás a acompanhar."
        action={
          <Link href="/candidaturas/nova" className={buttonClassName()}>
            <Plus aria-hidden="true" className="size-4" />
            Nova candidatura
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
          action="/candidaturas"
          method="get"
          className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_12rem_12rem_11rem_auto]"
        >
          <label className="relative min-w-0">
            <span className="sr-only">Pesquisar candidaturas</span>
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Pesquisar vaga, empresa ou recrutador..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-10 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <AutoSubmitSelect
              name="status"
              defaultValue={status ?? ""}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">Todos os estados</option>
              {applicationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="sr-only">Filtrar por empresa</span>
            <AutoSubmitSelect
              name="empresa"
              defaultValue={rawCompanyId}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">Todas as empresas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <label>
            <span className="sr-only">Filtrar por modalidade</span>
            <AutoSubmitSelect
              name="modalidade"
              defaultValue={workMode ?? ""}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">Todas as modalidades</option>
              {workModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AutoSubmitSelect>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className={buttonClassName({ size: "sm", className: "flex-1" })}
            >
              <Filter aria-hidden="true" className="size-4" />
              Aplicar
            </button>
            {hasFilters ? (
              <Link
                href="/candidaturas"
                aria-label="Limpar filtros"
                title="Limpar filtros"
                className={buttonClassName({
                  variant: "secondary",
                  size: "icon",
                })}
              >
                <X aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
          </div>
          <label className="md:col-span-2 xl:col-span-1 xl:col-start-4">
            <span className="sr-only">Ordenar candidaturas</span>
            <AutoSubmitSelect
              name="ordem"
              defaultValue={sort}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
            >
              <option value="newest">Mais recentes primeiro</option>
              <option value="oldest">Mais antigas primeiro</option>
              <option value="follow_up">Próximo follow-up</option>
            </AutoSubmitSelect>
          </label>
        </form>
      </Card>

      {applications.length === 0 ? (
        <EmptyState
          icon={Search}
          title={
            hasFilters
              ? "Nenhuma candidatura encontrada"
              : "Ainda não tens candidaturas"
          }
          description={
            hasFilters
              ? "Altera ou limpa os filtros para voltares a ver todas as candidaturas."
              : "Cria a primeira candidatura para começares a acompanhar o processo."
          }
          actionLabel={
            hasFilters ? "Limpar filtros" : "Criar primeira candidatura"
          }
          actionHref={hasFilters ? "/candidaturas" : "/candidaturas/nova"}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Candidaturas guardadas</caption>
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
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-slate-50/60">
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
                      <ApplicationStatusBadge status={application.status} />
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(application.applicationDate)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-700">
                        {application.nextActionSummary || "Sem próxima ação"}
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
                        aria-label={`Editar candidatura a ${application.title}`}
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
              <article key={application.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <CompanyLogo
                      name={application.companyName}
                      logoUrl={application.companyLogoUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/candidaturas/${application.id}/editar`}
                        className="font-semibold text-slate-950 hover:text-blue-700"
                      >
                        {application.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.companyName}
                      </p>
                    </div>
                  </div>
                  <ApplicationStatusBadge status={application.status} />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3 text-xs text-slate-500">
                  <span>{formatDate(application.applicationDate)}</span>
                  <span className="text-right">
                    {application.nextActionSummary || "Sem próxima ação"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
