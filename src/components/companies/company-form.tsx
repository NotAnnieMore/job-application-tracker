"use client";

import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import type {
  CompanyActionState,
  CompanyFormValues,
} from "@/features/companies/types";
import { initialCompanyActionState } from "@/features/companies/types";

type CompanyFormAction = (
  state: CompanyActionState,
  formData: FormData,
) => Promise<CompanyActionState>;

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

export function CompanyForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: CompanyFormAction;
  initialValues: CompanyFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialCompanyActionState);

  return (
    <form action={formAction} className="space-y-6">
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
            <h2 className="font-bold text-slate-950">Informação da empresa</h2>
            <p className="mt-1 text-sm text-slate-500">
              Apenas o nome é obrigatório. Podes completar o restante mais
              tarde.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Nome"
            htmlFor="company-name"
            required
            error={state.fieldErrors?.name}
          >
            <input
              id="company-name"
              name="name"
              type="text"
              autoComplete="organization"
              defaultValue={initialValues.name}
              placeholder="Ex.: Motiva"
              className={fieldClassName}
              maxLength={160}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={
                state.fieldErrors?.name ? "company-name-error" : undefined
              }
              required
            />
          </FormField>
          <FormField
            label="Website"
            htmlFor="company-website"
            hint="Podes escrever apenas o domínio, por exemplo empresa.pt."
            error={state.fieldErrors?.website}
          >
            <input
              id="company-website"
              name="website"
              type="text"
              inputMode="url"
              autoComplete="url"
              defaultValue={initialValues.website}
              placeholder="empresa.pt"
              className={fieldClassName}
              maxLength={500}
              aria-invalid={Boolean(state.fieldErrors?.website)}
              aria-describedby={
                state.fieldErrors?.website
                  ? "company-website-error"
                  : "company-website-hint"
              }
            />
          </FormField>
          <FormField
            label="Localização"
            htmlFor="company-location"
            error={state.fieldErrors?.location}
          >
            <input
              id="company-location"
              name="location"
              type="text"
              defaultValue={initialValues.location}
              placeholder="Ex.: Lisboa, Portugal"
              className={fieldClassName}
              maxLength={160}
              aria-invalid={Boolean(state.fieldErrors?.location)}
              aria-describedby={
                state.fieldErrors?.location
                  ? "company-location-error"
                  : undefined
              }
            />
          </FormField>
          <FormField
            label="Setor"
            htmlFor="company-industry"
            error={state.fieldErrors?.industry}
          >
            <input
              id="company-industry"
              name="industry"
              type="text"
              defaultValue={initialValues.industry}
              placeholder="Ex.: Tecnologias de informação"
              className={fieldClassName}
              maxLength={160}
              aria-invalid={Boolean(state.fieldErrors?.industry)}
              aria-describedby={
                state.fieldErrors?.industry
                  ? "company-industry-error"
                  : undefined
              }
            />
          </FormField>
          <FormField
            label="Modalidade habitual"
            htmlFor="company-work-mode"
            error={state.fieldErrors?.workMode}
          >
            <select
              id="company-work-mode"
              name="workMode"
              defaultValue={initialValues.workMode}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.workMode)}
              aria-describedby={
                state.fieldErrors?.workMode
                  ? "company-work-mode-error"
                  : undefined
              }
            >
              <option value="">Sem modalidade definida</option>
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
              <option value="onsite">Presencial</option>
            </select>
          </FormField>
          <div className="md:col-span-2">
            <FormField
              label="Notas"
              htmlFor="company-notes"
              hint="Informação útil sobre cultura, produtos ou contexto da empresa."
              error={state.fieldErrors?.notes}
            >
              <textarea
                id="company-notes"
                name="notes"
                rows={5}
                defaultValue={initialValues.notes}
                placeholder="Contexto relevante sobre a empresa..."
                className={textareaClassName}
                maxLength={4000}
                aria-invalid={Boolean(state.fieldErrors?.notes)}
                aria-describedby={
                  state.fieldErrors?.notes
                    ? "company-notes-error"
                    : "company-notes-hint"
                }
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/empresas"
          className={buttonClassName({ variant: "secondary" })}
        >
          Cancelar
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
