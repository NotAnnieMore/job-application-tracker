import { Building2, Globe2, MapPin, Plus } from "lucide-react";

import { DemoNotice } from "@/components/shared/demo-notice";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const companies = [
  {
    name: "Coverflex",
    sector: "Tecnologia financeira",
    location: "Lisboa · Híbrido",
    applications: 2,
  },
  {
    name: "Feedzai",
    sector: "Prevenção de fraude",
    location: "Coimbra · Híbrido",
    applications: 1,
  },
  {
    name: "Sword Health",
    sector: "Tecnologia de saúde",
    location: "Porto · Remoto",
    applications: 1,
  },
];

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresas"
        description="Mantém o contexto das empresas associado às tuas oportunidades."
        action={
          <Button>
            <Plus aria-hidden="true" className="size-4" />
            Nova empresa
          </Button>
        }
      />
      <DemoNotice />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <Card
            key={company.name}
            className="transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent>
              <div className="flex items-start gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">{company.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {company.sector}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <MapPin
                    aria-hidden="true"
                    className="size-4 text-slate-400"
                  />
                  {company.location}
                </p>
                <p className="flex items-center gap-2">
                  <Globe2
                    aria-hidden="true"
                    className="size-4 text-slate-400"
                  />
                  {company.applications} candidatura(s)
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
