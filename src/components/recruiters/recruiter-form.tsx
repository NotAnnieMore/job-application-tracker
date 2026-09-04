"use client";

import { useTranslations } from "next-intl";

import { LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import type {
  RecruiterActionState,
  RecruiterCompanyOption,
  RecruiterFormValues,
} from "@/features/recruiters/types";
import { initialRecruiterActionState } from "@/features/recruiters/types";

type RecruiterFormAction = (
  state: RecruiterActionState,
  formData: FormData,
) => Promise<RecruiterActionState>;

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

function SubmitButton({ label }: { label: string }) {
  const t = useTranslations("RecruiterForm");
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Save aria-hidden="true" className="size-4" />
      )}
      {pending ? t("saving") : label}
    </Button>
  );
}

export function RecruiterForm({
  action,
  companies,
  initialValues,
  submitLabel,
}: {
  action: RecruiterFormAction;
  companies: RecruiterCompanyOption[];
  initialValues: RecruiterFormValues;
  submitLabel: string;
}) {
  const t = useTranslations("RecruiterForm");
  const [state, formAction] = useActionState(
    action,
    initialRecruiterActionState,
  );

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
            <h2 className="font-bold text-slate-950">{t("information")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField
            label={t("name")}
            htmlFor="recruiter-name"
            required
            error={state.fieldErrors?.name}
          >
            <input
              id="recruiter-name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={initialValues.name}
              placeholder={t("namePlaceholder")}
              className={fieldClassName}
              maxLength={160}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={
                state.fieldErrors?.name ? "recruiter-name-error" : undefined
              }
              required
            />
          </FormField>
          <FormField
            label={t("company")}
            htmlFor="recruiter-company"
            hint={t("companyHint")}
            error={state.fieldErrors?.companyId}
          >
            <select
              id="recruiter-company"
              name="companyId"
              defaultValue={initialValues.companyId}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.companyId)}
              aria-describedby={
                state.fieldErrors?.companyId
                  ? "recruiter-company-error"
                  : "recruiter-company-hint"
              }
            >
              <option value="">{t("noCompany")}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label={t("jobTitle")}
            htmlFor="recruiter-job-title"
            error={state.fieldErrors?.jobTitle}
          >
            <input
              id="recruiter-job-title"
              name="jobTitle"
              type="text"
              autoComplete="organization-title"
              defaultValue={initialValues.jobTitle}
              placeholder={t("jobTitlePlaceholder")}
              className={fieldClassName}
              maxLength={160}
              aria-invalid={Boolean(state.fieldErrors?.jobTitle)}
              aria-describedby={
                state.fieldErrors?.jobTitle
                  ? "recruiter-job-title-error"
                  : undefined
              }
            />
          </FormField>
          <FormField
            label={t("email")}
            htmlFor="recruiter-email"
            error={state.fieldErrors?.email}
          >
            <input
              id="recruiter-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={initialValues.email}
              placeholder={t("emailPlaceholder")}
              className={fieldClassName}
              maxLength={254}
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={
                state.fieldErrors?.email ? "recruiter-email-error" : undefined
              }
            />
          </FormField>
          <FormField
            label={t("phone")}
            htmlFor="recruiter-phone"
            error={state.fieldErrors?.phone}
          >
            <input
              id="recruiter-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={initialValues.phone}
              placeholder="+351 912 345 678"
              className={fieldClassName}
              maxLength={50}
              aria-invalid={Boolean(state.fieldErrors?.phone)}
              aria-describedby={
                state.fieldErrors?.phone ? "recruiter-phone-error" : undefined
              }
            />
          </FormField>
          <FormField
            label={t("linkedin")}
            htmlFor="recruiter-linkedin"
            hint={t("linkedinHint")}
            error={state.fieldErrors?.linkedinUrl}
          >
            <input
              id="recruiter-linkedin"
              name="linkedinUrl"
              type="text"
              inputMode="url"
              defaultValue={initialValues.linkedinUrl}
              placeholder={t("linkedinPlaceholder")}
              className={fieldClassName}
              maxLength={500}
              aria-invalid={Boolean(state.fieldErrors?.linkedinUrl)}
              aria-describedby={
                state.fieldErrors?.linkedinUrl
                  ? "recruiter-linkedin-error"
                  : "recruiter-linkedin-hint"
              }
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField
              label={t("notes")}
              htmlFor="recruiter-notes"
              hint={t("notesHint")}
              error={state.fieldErrors?.notes}
            >
              <textarea
                id="recruiter-notes"
                name="notes"
                rows={6}
                defaultValue={initialValues.notes}
                placeholder={t("notesPlaceholder")}
                className={textareaClassName}
                maxLength={4000}
                aria-invalid={Boolean(state.fieldErrors?.notes)}
                aria-describedby={
                  state.fieldErrors?.notes
                    ? "recruiter-notes-error"
                    : "recruiter-notes-hint"
                }
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/recrutadores"
          className={buttonClassName({ variant: "secondary" })}
        >
          {t("cancel")}
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
