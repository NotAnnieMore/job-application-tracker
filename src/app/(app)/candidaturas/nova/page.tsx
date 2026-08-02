import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { DemoNotice } from "@/components/shared/demo-notice";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";

export default function NewApplicationPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/candidaturas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar às candidaturas
      </Link>
      <PageHeader
        title="Nova candidatura"
        description="Regista a vaga, a empresa e o ponto atual do processo."
      />
      <DemoNotice>
        Este formulário define a experiência da Fase 2. O botão Guardar será
        ligado ao Supabase depois de criarmos o modelo de dados.
      </DemoNotice>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">Oportunidade</h2>
              <p className="mt-1 text-sm text-slate-500">
                Informação principal sobre a vaga.
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <FormField label="Título da vaga" htmlFor="role" required>
              <input
                id="role"
                name="role"
                placeholder="Ex.: Frontend Developer"
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Empresa" htmlFor="company" required>
              <input
                id="company"
                name="company"
                placeholder="Pesquisar ou criar empresa"
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Localização" htmlFor="location">
              <input
                id="location"
                name="location"
                placeholder="Ex.: Lisboa"
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Modalidade" htmlFor="work-mode">
              <select
                id="work-mode"
                name="workMode"
                defaultValue=""
                className={fieldClassName}
              >
                <option value="" disabled>
                  Selecionar modalidade
                </option>
                <option>Remoto</option>
                <option>Híbrido</option>
                <option>Presencial</option>
              </select>
            </FormField>
            <FormField label="URL da vaga" htmlFor="job-url">
              <input
                id="job-url"
                name="jobUrl"
                type="url"
                placeholder="https://..."
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Tipo de contrato" htmlFor="contract-type">
              <select
                id="contract-type"
                name="contractType"
                defaultValue=""
                className={fieldClassName}
              >
                <option value="" disabled>
                  Selecionar tipo
                </option>
                <option>Contrato sem termo</option>
                <option>Contrato a termo</option>
                <option>Prestação de serviços</option>
                <option>Estágio</option>
              </select>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">Candidatura</h2>
              <p className="mt-1 text-sm text-slate-500">
                Estado, datas e acompanhamento.
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <FormField label="Estado" htmlFor="status" required>
              <select
                id="status"
                name="status"
                defaultValue="Candidatura enviada"
                className={fieldClassName}
              >
                <option>Interessado</option>
                <option>Candidatura enviada</option>
                <option>Entrevista agendada</option>
                <option>Entrevista concluída</option>
                <option>A aguardar resposta</option>
                <option>Proposta recebida</option>
                <option>Rejeitada</option>
                <option>Retirada</option>
              </select>
            </FormField>
            <FormField label="Data" htmlFor="application-date" required>
              <input
                id="application-date"
                name="applicationDate"
                type="date"
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Fonte" htmlFor="source">
              <input
                id="source"
                name="source"
                placeholder="Ex.: LinkedIn"
                className={fieldClassName}
              />
            </FormField>
            <FormField label="Recrutador" htmlFor="recruiter">
              <input
                id="recruiter"
                name="recruiter"
                placeholder="Pesquisar ou criar recrutador"
                className={fieldClassName}
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Notas" htmlFor="notes">
                <textarea
                  id="notes"
                  name="notes"
                  rows={5}
                  placeholder="Condições, tecnologias, contexto ou informação relevante..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/candidaturas"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <Button disabled title="Disponível depois do modelo de dados">
            <Save aria-hidden="true" className="size-4" />
            Guardar candidatura
          </Button>
        </div>
      </form>
    </div>
  );
}
