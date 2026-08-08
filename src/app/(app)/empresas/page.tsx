import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Globe2,
  MapPin,
  Pencil,
  Plus,
  Users,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";

import { CompanyLogo } from "@/components/companies/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCompanies } from "@/features/companies/data";
import type { WorkModeValue } from "@/types/database.types";

const workModeLabels: Record<WorkModeValue, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
};

const notices: Record<string, string> = {
  "empresa-criada": "Empresa criada com sucesso.",
  "empresa-atualizada": "Empresa atualizada com sucesso.",
  "empresa-eliminada": "Empresa eliminada com sucesso.",
};

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string | string[] }>;
}) {
  const companies = await getCompanies();
  const status = (await searchParams).estado;
  const notice = typeof status === "string" ? notices[status] : undefined;
  const missingLogoCount = companies.filter(
    (company) => !company.logoUrl,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresas"
        description="Mantém o contexto das empresas associado às tuas oportunidades."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            {missingLogoCount > 0 ? (
              <Link
                href="/empresas/logotipos"
                className={buttonClassName({ variant: "secondary" })}
              >
                <WandSparkles aria-hidden="true" className="size-4" />
                Completar logótipos ({missingLogoCount})
              </Link>
            ) : null}
            <Link href="/empresas/nova" className={buttonClassName()}>
              <Plus aria-hidden="true" className="size-4" />
              Nova empresa
            </Link>
          </div>
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

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Ainda não tens empresas"
          description="Cria a primeira empresa para começares a associar vagas, recrutadores e candidaturas."
          actionLabel="Criar primeira empresa"
          actionHref="/empresas/nova"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.id} className="transition hover:shadow-md">
              <CardContent>
                <div className="flex items-start gap-3">
                  <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-slate-950">
                      {company.name}
                    </h2>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {company.industry || "Setor por definir"}
                    </p>
                  </div>
                  <Link
                    href={`/empresas/${company.id}/editar`}
                    aria-label={`Editar ${company.name}`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Link>
                </div>
                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin
                      aria-hidden="true"
                      className="size-4 text-slate-400"
                    />
                    {company.location || "Localização por definir"}
                    {company.workMode
                      ? ` · ${workModeLabels[company.workMode]}`
                      : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <BriefcaseBusiness
                      aria-hidden="true"
                      className="size-4 text-slate-400"
                    />
                    {company.applicationCount} candidatura(s)
                  </p>
                  <Link
                    href={`/recrutadores?empresa=${company.id}`}
                    className="flex items-center gap-2 hover:text-blue-700"
                  >
                    <Users
                      aria-hidden="true"
                      className="size-4 text-slate-400"
                    />
                    {company.recruiterCount} contacto(s)
                  </Link>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Globe2 aria-hidden="true" className="size-4" />
                      Visitar website
                      <ExternalLink aria-hidden="true" className="size-3.5" />
                    </a>
                  ) : null}
                </div>
                {company.notes ? (
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
                    {company.notes}
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
