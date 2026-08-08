"use client";

import { ExternalLink, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { CompanyLogo } from "@/components/companies/company-logo";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import {
  commonInterviewTypes,
  interviewFormatOptions,
  interviewStatusOptions,
} from "@/features/interviews/constants";
import type {
  InterviewActionState,
  InterviewApplicationOption,
  InterviewFormValues,
  InterviewRecruiterOption,
} from "@/features/interviews/types";
import { initialInterviewActionState } from "@/features/interviews/types";

type InterviewFormAction = (
  state: InterviewActionState,
  formData: FormData,
) => Promise<InterviewActionState>;

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

function PreparationBlock({
  label,
  content,
  emptyText,
}: {
  label: string;
  content: string;
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {content || emptyText}
      </p>
    </div>
  );
}

export function InterviewForm({
  action,
  applications,
  recruiters,
  initialValues,
  submitLabel,
  cancelHref = "/entrevistas",
}: {
  action: InterviewFormAction;
  applications: InterviewApplicationOption[];
  recruiters: InterviewRecruiterOption[];
  initialValues: InterviewFormValues;
  submitLabel: string;
  cancelHref?: string;
}) {
  const [state, formAction] = useActionState(
    action,
    initialInterviewActionState,
  );
  const [applicationId, setApplicationId] = useState(
    initialValues.applicationId,
  );
  const [recruiterId, setRecruiterId] = useState(initialValues.recruiterId);
  const [timezoneOffset, setTimezoneOffset] = useState(
    initialValues.timezoneOffset,
  );
  const selectedApplication = applications.find(
    (application) => application.id === applicationId,
  );
  const availableRecruiters = useMemo(
    () =>
      recruiters.filter(
        (recruiter) =>
          !recruiter.companyId ||
          recruiter.companyId === selectedApplication?.companyId,
      ),
    [recruiters, selectedApplication?.companyId],
  );

  function chooseApplication(nextApplicationId: string) {
    setApplicationId(nextApplicationId);
    const nextApplication = applications.find(
      (application) => application.id === nextApplicationId,
    );
    const currentRecruiterIsCompatible = recruiters.some(
      (recruiter) =>
        recruiter.id === recruiterId &&
        (!recruiter.companyId ||
          recruiter.companyId === nextApplication?.companyId),
    );

    if (!currentRecruiterIsCompatible) {
      const primaryRecruiterIsCompatible = recruiters.some(
        (recruiter) =>
          recruiter.id === nextApplication?.primaryRecruiterId &&
          (!recruiter.companyId ||
            recruiter.companyId === nextApplication.companyId),
      );
      setRecruiterId(
        primaryRecruiterIsCompatible
          ? (nextApplication?.primaryRecruiterId ?? "")
          : "",
      );
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="timezoneOffset" value={timezoneOffset} />

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
            <h2 className="font-bold text-slate-950">Agendamento</h2>
            <p className="mt-1 text-sm text-slate-500">
              Liga a entrevista ao processo e regista quando e como irá
              acontecer.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField
              label="Candidatura"
              htmlFor="interview-application"
              required
              error={state.fieldErrors?.applicationId}
            >
              <select
                id="interview-application"
                name="applicationId"
                value={applicationId}
                onChange={(event) => chooseApplication(event.target.value)}
                className={fieldClassName}
                aria-invalid={Boolean(state.fieldErrors?.applicationId)}
                required
              >
                <option value="">Seleciona uma candidatura</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.companyName} — {application.title}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField
            label="Tipo de entrevista"
            htmlFor="interview-type"
            required
            hint="Podes escolher uma sugestão ou escrever outro tipo."
            error={state.fieldErrors?.interviewType}
          >
            <input
              id="interview-type"
              name="interviewType"
              type="text"
              list="interview-types"
              defaultValue={initialValues.interviewType}
              className={fieldClassName}
              maxLength={120}
              required
            />
            <datalist id="interview-types">
              {commonInterviewTypes.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </FormField>

          <FormField
            label="Data e hora"
            htmlFor="interview-scheduled-at"
            required
            hint="A hora é guardada com o fuso horário do teu dispositivo."
            error={state.fieldErrors?.scheduledAtLocal}
          >
            <input
              id="interview-scheduled-at"
              name="scheduledAtLocal"
              type="datetime-local"
              defaultValue={initialValues.scheduledAtLocal}
              onChange={(event) => {
                const date = new Date(event.target.value);
                if (!Number.isNaN(date.getTime())) {
                  setTimezoneOffset(date.getTimezoneOffset().toString());
                }
              }}
              className={fieldClassName}
              required
            />
          </FormField>

          <FormField
            label="Estado"
            htmlFor="interview-status"
            required
            error={state.fieldErrors?.status}
          >
            <select
              id="interview-status"
              name="status"
              defaultValue={initialValues.status}
              className={fieldClassName}
              required
            >
              {interviewStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Formato"
            htmlFor="interview-format"
            required
            error={state.fieldErrors?.format}
          >
            <select
              id="interview-format"
              name="format"
              defaultValue={initialValues.format}
              className={fieldClassName}
              required
            >
              {interviewFormatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Duração prevista"
            htmlFor="interview-duration"
            hint="Em minutos."
            error={state.fieldErrors?.durationMinutes}
          >
            <input
              id="interview-duration"
              name="durationMinutes"
              type="number"
              min={5}
              max={480}
              step={5}
              defaultValue={initialValues.durationMinutes}
              className={fieldClassName}
              required
            />
          </FormField>

          <FormField
            label="Local ou ligação"
            htmlFor="interview-location"
            hint="Ex.: Microsoft Teams, endereço ou número de telefone."
            error={state.fieldErrors?.locationOrUrl}
          >
            <input
              id="interview-location"
              name="locationOrUrl"
              type="text"
              defaultValue={initialValues.locationOrUrl}
              placeholder="https://teams.microsoft.com/..."
              className={fieldClassName}
              maxLength={1000}
            />
          </FormField>

          <FormField
            label="Contacto principal"
            htmlFor="interview-recruiter"
            hint="São apresentados os contactos compatíveis com a empresa."
            error={state.fieldErrors?.recruiterId}
          >
            <select
              id="interview-recruiter"
              name="recruiterId"
              value={recruiterId}
              onChange={(event) => setRecruiterId(event.target.value)}
              className={fieldClassName}
              disabled={!selectedApplication}
            >
              <option value="">Sem contacto associado</option>
              {availableRecruiters.map((recruiter) => (
                <option key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label="Participantes"
              htmlFor="interview-participants"
              hint="Separa os nomes por vírgulas ou linhas."
              error={state.fieldErrors?.participants}
            >
              <textarea
                id="interview-participants"
                name="participants"
                rows={3}
                defaultValue={initialValues.participants}
                placeholder="Ana Silva&#10;João Costa"
                className={textareaClassName}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">Preparação</h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulta o guião geral da candidatura e acrescenta notas
              específicas desta conversa.
            </p>
          </div>
          {selectedApplication ? (
            <Link
              href={`/candidaturas/${selectedApplication.id}/editar`}
              target="_blank"
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              Editar guião
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </Link>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          {selectedApplication ? (
            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <CompanyLogo
                name={selectedApplication.companyName}
                logoUrl={selectedApplication.companyLogoUrl}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">
                  {selectedApplication.title}
                </p>
                <p className="truncate text-sm text-slate-600">
                  {selectedApplication.companyName}
                </p>
              </div>
            </div>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <PreparationBlock
              label="Guião pessoal e CV"
              content={selectedApplication?.interviewPreparation ?? ""}
              emptyText="Ainda não adicionaste um guião nesta candidatura."
            />
            <PreparationBlock
              label="Perguntas para a empresa"
              content={selectedApplication?.questionsForCompany ?? ""}
              emptyText="Ainda não adicionaste perguntas para esta empresa."
            />
          </div>
          <FormField
            label="Preparação específica desta entrevista"
            htmlFor="interview-preparation"
            hint="Tópicos técnicos, exemplos, nomes ou pontos a confirmar nesta etapa."
            error={state.fieldErrors?.preparation}
          >
            <textarea
              id="interview-preparation"
              name="preparation"
              rows={7}
              defaultValue={initialValues.preparation}
              placeholder="Pontos específicos a preparar..."
              className={textareaClassName}
              maxLength={10000}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">Depois da entrevista</h2>
            <p className="mt-1 text-sm text-slate-500">
              Guarda o que correu bem, o que aprendeste e o resultado desta
              etapa.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-2">
          <FormField
            label="Feedback e notas"
            htmlFor="interview-feedback"
            error={state.fieldErrors?.feedback}
          >
            <textarea
              id="interview-feedback"
              name="feedback"
              rows={7}
              defaultValue={initialValues.feedback}
              placeholder="Questões feitas, respostas, pontos fortes e aspetos a melhorar..."
              className={textareaClassName}
              maxLength={10000}
            />
          </FormField>
          <FormField
            label="Resultado"
            htmlFor="interview-result"
            hint="Ex.: passei à etapa seguinte, aguardo resposta ou processo terminado."
            error={state.fieldErrors?.result}
          >
            <textarea
              id="interview-result"
              name="result"
              rows={7}
              defaultValue={initialValues.result}
              placeholder="Resultado e próximos passos..."
              className={textareaClassName}
              maxLength={4000}
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
