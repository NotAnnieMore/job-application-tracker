"use client";

import { ExternalLink, LoaderCircle, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { QuickCompanyModal } from "@/components/companies/quick-company-modal";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import {
  applicationStatusOptions,
  workModeOptions,
} from "@/features/applications/constants";
import type {
  ApplicationActionState,
  ApplicationFormValues,
  CompanyOption,
  RecruiterOption,
} from "@/features/applications/types";
import { initialApplicationActionState } from "@/features/applications/types";

type ApplicationFormAction = (
  state: ApplicationActionState,
  formData: FormData,
) => Promise<ApplicationActionState>;

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Save aria-hidden="true" className="size-4" />
      )}
      {pending ? "A guardar..." : label}
    </Button>
  );
}

export function ApplicationForm({
  action,
  companies,
  recruiters,
  initialValues,
  submitLabel,
  cancelHref = "/candidaturas",
}: {
  action: ApplicationFormAction;
  companies: CompanyOption[];
  recruiters: RecruiterOption[];
  initialValues: ApplicationFormValues;
  submitLabel: string;
  cancelHref?: string;
}) {
  const [state, formAction] = useActionState(
    action,
    initialApplicationActionState,
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    initialValues.companyId,
  );
  const [companyOptions, setCompanyOptions] = useState(companies);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(
    initialValues.primaryRecruiterId,
  );
  const availableRecruiters = recruiters.filter(
    (recruiter) =>
      !recruiter.companyId || recruiter.companyId === selectedCompanyId,
  );

  function changeCompany(companyId: string) {
    setSelectedCompanyId(companyId);
    const selectedRecruiter = recruiters.find(
      (recruiter) => recruiter.id === selectedRecruiterId,
    );

    if (
      selectedRecruiter?.companyId &&
      selectedRecruiter.companyId !== companyId
    ) {
      setSelectedRecruiterId("");
    }
  }

  function addCompany(company: CompanyOption) {
    setCompanyOptions((current) =>
      [...current.filter((option) => option.id !== company.id), company].sort(
        (left, right) => left.name.localeCompare(right.name, "pt-PT"),
      ),
    );
    changeCompany(company.id);
    setCompanyModalOpen(false);
  }

  return (
    <form action={formAction} className="space-y-6">
      {companyModalOpen ? (
        <QuickCompanyModal
          onClose={() => setCompanyModalOpen(false)}
          onCreated={addCompany}
        />
      ) : null}
      {state.message ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.message}
        </p>
      ) : null}

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
          <FormField
            label="Título da vaga"
            htmlFor="application-title"
            required
            error={state.fieldErrors?.title}
          >
            <input
              id="application-title"
              name="title"
              type="text"
              defaultValue={initialValues.title}
              placeholder="Ex.: Application Support Engineer"
              className={fieldClassName}
              maxLength={200}
              aria-invalid={Boolean(state.fieldErrors?.title)}
              aria-describedby={
                state.fieldErrors?.title ? "application-title-error" : undefined
              }
              required
            />
          </FormField>
          <FormField
            label="Empresa"
            htmlFor="application-company"
            required
            hint="Se não aparecer, cria-a aqui sem perder os dados da candidatura."
            error={state.fieldErrors?.companyId}
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                id="application-company"
                name="companyId"
                value={selectedCompanyId}
                onChange={(event) => changeCompany(event.target.value)}
                className={fieldClassName}
                aria-invalid={Boolean(state.fieldErrors?.companyId)}
                aria-describedby={
                  state.fieldErrors?.companyId
                    ? "application-company-error"
                    : "application-company-hint"
                }
                required
              >
                <option value="" disabled>
                  Selecionar empresa
                </option>
                {companyOptions.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                onClick={() => setCompanyModalOpen(true)}
              >
                <Plus aria-hidden="true" className="size-4" />
                Criar empresa
              </Button>
            </div>
          </FormField>
          <FormField
            label="Localização"
            htmlFor="application-location"
            error={state.fieldErrors?.location}
          >
            <input
              id="application-location"
              name="location"
              type="text"
              defaultValue={initialValues.location}
              placeholder="Ex.: Lisboa e Região"
              className={fieldClassName}
              maxLength={160}
              aria-invalid={Boolean(state.fieldErrors?.location)}
              aria-describedby={
                state.fieldErrors?.location
                  ? "application-location-error"
                  : undefined
              }
            />
          </FormField>
          <FormField
            label="Modalidade"
            htmlFor="application-work-mode"
            error={state.fieldErrors?.workMode}
          >
            <select
              id="application-work-mode"
              name="workMode"
              defaultValue={initialValues.workMode}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.workMode)}
              aria-describedby={
                state.fieldErrors?.workMode
                  ? "application-work-mode-error"
                  : undefined
              }
            >
              <option value="">Sem modalidade definida</option>
              {workModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="URL da vaga"
            htmlFor="application-job-url"
            error={state.fieldErrors?.jobUrl}
          >
            <input
              id="application-job-url"
              name="jobUrl"
              type="text"
              inputMode="url"
              defaultValue={initialValues.jobUrl}
              placeholder="linkedin.com/jobs/view/..."
              className={fieldClassName}
              maxLength={1000}
              aria-invalid={Boolean(state.fieldErrors?.jobUrl)}
              aria-describedby={
                state.fieldErrors?.jobUrl
                  ? "application-job-url-error"
                  : undefined
              }
            />
          </FormField>
          <FormField
            label="Tipo de contrato"
            htmlFor="application-employment-type"
            error={state.fieldErrors?.employmentType}
          >
            <select
              id="application-employment-type"
              name="employmentType"
              defaultValue={initialValues.employmentType}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.employmentType)}
              aria-describedby={
                state.fieldErrors?.employmentType
                  ? "application-employment-type-error"
                  : undefined
              }
            >
              <option value="">Sem tipo definido</option>
              <option value="Contrato sem termo">Contrato sem termo</option>
              <option value="Contrato a termo">Contrato a termo</option>
              <option value="Prestação de serviços">
                Prestação de serviços
              </option>
              <option value="Estágio">Estágio</option>
              <option value="Trainee">Trainee</option>
            </select>
          </FormField>
          <FormField
            label="Salário mínimo"
            htmlFor="application-salary-min"
            error={state.fieldErrors?.salaryMin}
          >
            <input
              id="application-salary-min"
              name="salaryMin"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              defaultValue={initialValues.salaryMin}
              placeholder="0"
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.salaryMin)}
              aria-describedby={
                state.fieldErrors?.salaryMin
                  ? "application-salary-min-error"
                  : undefined
              }
            />
          </FormField>
          <div className="grid grid-cols-[1fr_6rem] gap-2">
            <FormField
              label="Salário máximo"
              htmlFor="application-salary-max"
              error={state.fieldErrors?.salaryMax}
            >
              <input
                id="application-salary-max"
                name="salaryMax"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                defaultValue={initialValues.salaryMax}
                placeholder="0"
                className={fieldClassName}
                aria-invalid={Boolean(state.fieldErrors?.salaryMax)}
                aria-describedby={
                  state.fieldErrors?.salaryMax
                    ? "application-salary-max-error"
                    : undefined
                }
              />
            </FormField>
            <FormField
              label="Moeda"
              htmlFor="application-currency"
              error={state.fieldErrors?.currency}
            >
              <input
                id="application-currency"
                name="currency"
                type="text"
                defaultValue={initialValues.currency}
                className={fieldClassName}
                maxLength={3}
                aria-invalid={Boolean(state.fieldErrors?.currency)}
                aria-describedby={
                  state.fieldErrors?.currency
                    ? "application-currency-error"
                    : undefined
                }
              />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField
              label="Competências"
              htmlFor="application-skills"
              hint="Separa as competências com vírgulas."
              error={state.fieldErrors?.skills}
            >
              <input
                id="application-skills"
                name="skills"
                type="text"
                defaultValue={initialValues.skills}
                placeholder="Java, SQL, ServiceNow"
                className={fieldClassName}
                aria-invalid={Boolean(state.fieldErrors?.skills)}
                aria-describedby={
                  state.fieldErrors?.skills
                    ? "application-skills-error"
                    : "application-skills-hint"
                }
              />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField
              label="Resumo da vaga"
              htmlFor="application-opportunity-summary"
              error={state.fieldErrors?.opportunitySummary}
            >
              <textarea
                id="application-opportunity-summary"
                name="opportunitySummary"
                rows={4}
                defaultValue={initialValues.opportunitySummary}
                placeholder="Responsabilidades, requisitos ou condições importantes..."
                className={textareaClassName}
                maxLength={5000}
                aria-invalid={Boolean(state.fieldErrors?.opportunitySummary)}
                aria-describedby={
                  state.fieldErrors?.opportunitySummary
                    ? "application-opportunity-summary-error"
                    : undefined
                }
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">Candidatura</h2>
            <p className="mt-1 text-sm text-slate-500">
              Estado, datas e acompanhamento do processo.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Estado"
            htmlFor="application-status"
            required
            error={state.fieldErrors?.status}
          >
            <select
              id="application-status"
              name="status"
              defaultValue={initialValues.status}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.status)}
              aria-describedby={
                state.fieldErrors?.status
                  ? "application-status-error"
                  : undefined
              }
              required
            >
              {applicationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Data da candidatura"
            htmlFor="application-date"
            required
            error={state.fieldErrors?.applicationDate}
          >
            <input
              id="application-date"
              name="applicationDate"
              type="date"
              defaultValue={initialValues.applicationDate}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.applicationDate)}
              aria-describedby={
                state.fieldErrors?.applicationDate
                  ? "application-date-error"
                  : undefined
              }
              required
            />
          </FormField>
          <FormField
            label="Fonte"
            htmlFor="application-source"
            error={state.fieldErrors?.source}
          >
            <input
              id="application-source"
              name="source"
              type="text"
              defaultValue={initialValues.source}
              placeholder="Ex.: LinkedIn"
              className={fieldClassName}
              maxLength={120}
              aria-invalid={Boolean(state.fieldErrors?.source)}
              aria-describedby={
                state.fieldErrors?.source
                  ? "application-source-error"
                  : undefined
              }
            />
          </FormField>
          <FormField
            label="Salário esperado"
            htmlFor="application-expected-salary"
            error={state.fieldErrors?.expectedSalary}
          >
            <input
              id="application-expected-salary"
              name="expectedSalary"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              defaultValue={initialValues.expectedSalary}
              placeholder="0"
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.expectedSalary)}
              aria-describedby={
                state.fieldErrors?.expectedSalary
                  ? "application-expected-salary-error"
                  : undefined
              }
            />
          </FormField>
          <FormField
            label="Recrutador principal"
            htmlFor="application-recruiter"
            hint="Opcional. São mostrados os contactos sem empresa ou associados à empresa escolhida."
            error={state.fieldErrors?.primaryRecruiterId}
          >
            <div className="flex gap-2">
              <select
                id="application-recruiter"
                name="primaryRecruiterId"
                value={selectedRecruiterId}
                onChange={(event) => setSelectedRecruiterId(event.target.value)}
                className={fieldClassName}
                aria-invalid={Boolean(state.fieldErrors?.primaryRecruiterId)}
                aria-describedby={
                  state.fieldErrors?.primaryRecruiterId
                    ? "application-recruiter-error"
                    : "application-recruiter-hint"
                }
              >
                <option value="">Sem recrutador principal</option>
                {availableRecruiters.map((recruiter) => (
                  <option key={recruiter.id} value={recruiter.id}>
                    {recruiter.name}
                    {recruiter.companyId ? "" : " · Sem empresa"}
                  </option>
                ))}
              </select>
              <Link
                href={
                  selectedCompanyId
                    ? `/recrutadores/novo?empresa=${selectedCompanyId}`
                    : "/recrutadores/novo"
                }
                target="_blank"
                aria-label="Criar contacto num novo separador"
                title="Criar contacto num novo separador"
                className={buttonClassName({
                  variant: "secondary",
                  size: "icon",
                })}
              >
                <ExternalLink aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </FormField>
          <FormField
            label="Próxima tarefa"
            htmlFor="application-next-action"
            error={state.fieldErrors?.nextActionSummary}
          >
            <input
              id="application-next-action"
              name="nextActionSummary"
              type="text"
              defaultValue={initialValues.nextActionSummary}
              placeholder="Ex.: Enviar follow-up"
              className={fieldClassName}
              maxLength={240}
              aria-invalid={Boolean(state.fieldErrors?.nextActionSummary)}
              aria-describedby={
                state.fieldErrors?.nextActionSummary
                  ? "application-next-action-error"
                  : undefined
              }
            />
          </FormField>
          <FormField
            label="Data de follow-up"
            htmlFor="application-follow-up"
            error={state.fieldErrors?.followUpDate}
          >
            <input
              id="application-follow-up"
              name="followUpDate"
              type="date"
              defaultValue={initialValues.followUpDate}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.followUpDate)}
              aria-describedby={
                state.fieldErrors?.followUpDate
                  ? "application-follow-up-error"
                  : undefined
              }
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField
              label="Notas"
              htmlFor="application-notes"
              error={state.fieldErrors?.summaryNotes}
            >
              <textarea
                id="application-notes"
                name="summaryNotes"
                rows={5}
                defaultValue={initialValues.summaryNotes}
                placeholder="Estado do anúncio, atividade da empresa ou outro contexto..."
                className={textareaClassName}
                maxLength={5000}
                aria-invalid={Boolean(state.fieldErrors?.summaryNotes)}
                aria-describedby={
                  state.fieldErrors?.summaryNotes
                    ? "application-notes-error"
                    : undefined
                }
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">
              Preparação para entrevistas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Deixa respostas e perguntas preparadas antes de serem necessárias.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-2">
          <FormField
            label="Guião pessoal e CV"
            htmlFor="application-interview-preparation"
            hint="Questões comuns sobre ti, exemplos e pontos do CV a destacar."
            error={state.fieldErrors?.interviewPreparation}
          >
            <textarea
              id="application-interview-preparation"
              name="interviewPreparation"
              rows={9}
              defaultValue={initialValues.interviewPreparation}
              placeholder="Fala-me sobre ti...&#10;Porque estás interessado nesta vaga?..."
              className={textareaClassName}
              maxLength={10000}
              aria-invalid={Boolean(state.fieldErrors?.interviewPreparation)}
              aria-describedby={
                state.fieldErrors?.interviewPreparation
                  ? "application-interview-preparation-error"
                  : "application-interview-preparation-hint"
              }
            />
          </FormField>
          <FormField
            label="Perguntas para a empresa"
            htmlFor="application-company-questions"
            hint="Perguntas sobre equipa, função, desafios, cultura ou próximos passos."
            error={state.fieldErrors?.questionsForCompany}
          >
            <textarea
              id="application-company-questions"
              name="questionsForCompany"
              rows={9}
              defaultValue={initialValues.questionsForCompany}
              placeholder="Como é medido o sucesso nesta função?..."
              className={textareaClassName}
              maxLength={10000}
              aria-invalid={Boolean(state.fieldErrors?.questionsForCompany)}
              aria-describedby={
                state.fieldErrors?.questionsForCompany
                  ? "application-company-questions-error"
                  : "application-company-questions-hint"
              }
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className={buttonClassName({ variant: "secondary" })}
        >
          Cancelar
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
