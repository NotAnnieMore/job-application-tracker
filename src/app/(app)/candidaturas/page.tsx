import { Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { DemoNotice } from "@/components/shared/demo-notice";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { recentApplications } from "@/features/dashboard/mock-data";
import { cn } from "@/lib/utils";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidaturas"
        description="Consulta e organiza todas as oportunidades que estás a acompanhar."
        action={
          <Link
            href="/candidaturas/nova"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Plus aria-hidden="true" className="size-4" />
            Nova candidatura
          </Link>
        }
      />
      <DemoNotice />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Pesquisar candidaturas</span>
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Pesquisar por vaga ou empresa..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-10 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
            />
          </label>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Filter aria-hidden="true" className="size-4" />
            Filtros
          </button>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Candidaturas de demonstração</caption>
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
                <tr key={application.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-semibold text-slate-950">
                    {application.role}
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2.5 font-medium text-slate-700">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg text-[10px] font-bold text-white",
                          application.companyColor,
                        )}
                      >
                        {application.companyInitial}
                      </span>
                      {application.company}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ApplicationStatusBadge status={application.status} />
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {application.applicationDate}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-700">
                      {application.nextAction}
                    </p>
                    {application.actionDate ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {application.actionDate}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
            <article key={application.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    {application.role}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {application.company}
                  </p>
                </div>
                <ApplicationStatusBadge status={application.status} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{application.applicationDate}</span>
                <span>{application.nextAction}</span>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
