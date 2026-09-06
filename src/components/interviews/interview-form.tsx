"use client";

import { ExternalLink, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { CompanyLogo } from "@/components/companies/company-logo";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField, fieldClassName } from "@/components/ui/form-field";
import {
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
  const t = useTranslations("InterviewForm");

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
  headerTitle,
  headerDescription,
}: {
  action: InterviewFormAction;
  applications: InterviewApplicationOption[];
  recruiters: InterviewRecruiterOption[];
  initialValues: InterviewFormValues;
  submitLabel: string;
  cancelHref?: string;
  headerTitle?: string;
  headerDescription?: string;
}) {
  const t = useTranslations("InterviewForm");
  const tStatus = useTranslations("Enums.interviewStatus");
  const tFormat = useTranslations("Enums.interviewFormat");
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
  const interviewTypes = Array.from(
    new Set([
      initialValues.interviewType,
      t("types.initial"),
      t("types.hr"),
      t("types.technical"),
      t("types.coding"),
      t("types.manager"),
      t("types.culture"),
      t("types.final"),
    ]),
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
      <input
        type="hidden"
        name="preparation"
        value={initialValues.preparation}
      />

      {headerTitle ? (
        <PageHeader
          title={headerTitle}
          description={headerDescription}
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href={cancelHref}
                className={buttonClassName({ variant: "secondary" })}
              >
                {t("cancel")}
              </Link>
              <SubmitButton label={submitLabel} />
            </div>
          }
        />
      ) : (
        <div className="flex justify-end">
          <SubmitButton label={submitLabel} />
        </div>
      )}

      {state.message ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {state.message}
        </p>
      ) : null}

      <Card data-tour="interview-form">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("scheduling")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("schedulingDescription")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField
              label={t("application")}
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
                <option value="">{t("selectApplication")}</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.companyName} — {application.title}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField
            label={t("interviewType")}
            htmlFor="interview-type"
            required
            hint={t("interviewTypeHint")}
            error={state.fieldErrors?.interviewType}
          >
            <select
              id="interview-type"
              name="interviewType"
              defaultValue={initialValues.interviewType}
              className={fieldClassName}
              required
            >
              {interviewTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t("dateAndTime")}
            htmlFor="interview-scheduled-at"
            required
            hint={t("dateAndTimeHint")}
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
            label={t("status")}
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
                  {tStatus(option.value)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t("format")}
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
                  {tFormat(option.value)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={t("expectedDuration")}
            htmlFor="interview-duration"
            hint={t("inMinutes")}
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
            label={t("locationOrLink")}
            htmlFor="interview-location"
            hint={t("locationOrLinkHint")}
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
            label={t("mainContact")}
            htmlFor="interview-recruiter"
            hint={t("mainContactHint")}
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
              <option value="">{t("noContact")}</option>
              {availableRecruiters.map((recruiter) => (
                <option key={recruiter.id} value={recruiter.id}>
                  {recruiter.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label={t("participants")}
              htmlFor="interview-participants"
              hint={t("participantsHint")}
              error={state.fieldErrors?.participants}
            >
              <textarea
                id="interview-participants"
                name="participants"
                rows={3}
                defaultValue={initialValues.participants}
                placeholder={t("participantsPlaceholder")}
                className={textareaClassName}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("preparation")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("preparationDescription")}
            </p>
          </div>
          {selectedApplication ? (
            <Link
              href={`/candidaturas/${selectedApplication.id}/editar`}
              target="_blank"
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              {t("editScript")}
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
              label={t("personalScript")}
              content={selectedApplication?.interviewPreparation ?? ""}
              emptyText={t("personalScriptEmpty")}
            />
            <PreparationBlock
              label={t("companyQuestions")}
              content={selectedApplication?.questionsForCompany ?? ""}
              emptyText={t("companyQuestionsEmpty")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("afterInterview")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("afterInterviewDescription")}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-2">
          <FormField
            label={t("feedbackAndNotes")}
            htmlFor="interview-feedback"
            error={state.fieldErrors?.feedback}
          >
            <textarea
              id="interview-feedback"
              name="feedback"
              rows={7}
              defaultValue={initialValues.feedback}
              placeholder={t("feedbackPlaceholder")}
              className={textareaClassName}
              maxLength={10000}
            />
          </FormField>
          <FormField
            label={t("result")}
            htmlFor="interview-result"
            hint={t("resultHint")}
            error={state.fieldErrors?.result}
          >
            <textarea
              id="interview-result"
              name="result"
              rows={7}
              defaultValue={initialValues.result}
              placeholder={t("resultPlaceholder")}
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
          {t("cancel")}
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
