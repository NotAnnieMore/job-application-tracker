"use client";

import {
  ChevronDown,
  ExternalLink,
  FileSearch,
  LoaderCircle,
  Plus,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { QuickCompanyModal } from "@/components/companies/quick-company-modal";
import { JobImportModal } from "@/components/applications/job-import-modal";
import { PageHeader } from "@/components/shared/page-header";
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
import type { ImportedJobData } from "@/features/job-import/types";
import type { WorkModeValue } from "@/types/database.types";
import { cn } from "@/lib/utils";

type ApplicationFormAction = (
  state: ApplicationActionState,
  formData: FormData,
) => Promise<ApplicationActionState>;

const advancedApplicationFields = [
  "salaryMin",
  "salaryMax",
  "currency",
  "skills",
  "status",
  "applicationDate",
  "source",
  "expectedSalary",
  "primaryRecruiterId",
  "nextActionSummary",
  "followUpDate",
  "summaryNotes",
  "interviewPreparation",
  "questionsForCompany",
] as const;

const textareaClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

function formatLocalDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations("ApplicationForm");

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

export function ApplicationForm({
  action,
  companies,
  recruiters,
  initialValues,
  submitLabel,
  cancelHref = "/candidaturas",
  useBrowserDateDefault = false,
  startWithJobImport = false,
  progressiveDisclosure = false,
  headerTitle,
  headerDescription,
}: {
  action: ApplicationFormAction;
  companies: CompanyOption[];
  recruiters: RecruiterOption[];
  initialValues: ApplicationFormValues;
  submitLabel: string;
  cancelHref?: string;
  useBrowserDateDefault?: boolean;
  startWithJobImport?: boolean;
  progressiveDisclosure?: boolean;
  headerTitle?: string;
  headerDescription?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("ApplicationForm");
  const enums = useTranslations("Enums");
  const [state, formAction] = useActionState(
    action,
    initialApplicationActionState,
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    initialValues.companyId,
  );
  const [companyOptions, setCompanyOptions] = useState(companies);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [jobImportOpen, setJobImportOpen] = useState(false);
  const [jobImportInitialUrl, setJobImportInitialUrl] = useState(
    initialValues.jobUrl,
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [companyInitialValues, setCompanyInitialValues] = useState<{
    name?: string;
    website?: string;
    logoUrl?: string;
    location?: string;
    workMode?: WorkModeValue | "";
  }>();
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(
    initialValues.primaryRecruiterId,
  );
  const applicationDateRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const workModeRef = useRef<HTMLSelectElement>(null);
  const jobUrlRef = useRef<HTMLInputElement>(null);
  const employmentTypeRef = useRef<HTMLSelectElement>(null);
  const opportunitySummaryRef = useRef<HTMLTextAreaElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (useBrowserDateDefault && applicationDateRef.current) {
      applicationDateRef.current.value = formatLocalDateForInput(new Date());
    }
  }, [useBrowserDateDefault]);

  useEffect(() => {
    if (!startWithJobImport) return;
    const timeout = window.setTimeout(() => setJobImportOpen(true), 0);
    return () => window.clearTimeout(timeout);
  }, [startWithJobImport]);

  const showAdvancedDetails =
    advancedOpen ||
    (progressiveDisclosure &&
      advancedApplicationFields.some((field) => state.fieldErrors?.[field]));

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
        (left, right) => left.name.localeCompare(right.name, locale),
      ),
    );
    changeCompany(company.id);
    setCompanyModalOpen(false);
    setCompanyInitialValues(undefined);
  }

  function applyImportedJob(data: ImportedJobData) {
    if (titleRef.current) titleRef.current.value = data.title;
    if (locationRef.current) locationRef.current.value = data.location;
    if (workModeRef.current) workModeRef.current.value = data.workMode;
    if (jobUrlRef.current) jobUrlRef.current.value = data.jobUrl;
    if (employmentTypeRef.current) {
      const hasOption = Array.from(employmentTypeRef.current.options).some(
        (option) => option.value === data.employmentType,
      );
      employmentTypeRef.current.value = hasOption ? data.employmentType : "";
    }
    if (opportunitySummaryRef.current) {
      opportunitySummaryRef.current.value = data.description;
    }
    if (sourceRef.current && data.source) sourceRef.current.value = data.source;

    const existingCompany = companyOptions.find(
      (company) =>
        company.name.localeCompare(data.companyName, locale, {
          sensitivity: "base",
        }) === 0,
    );
    if (existingCompany) {
      changeCompany(existingCompany.id);
    } else {
      setCompanyInitialValues({
        name: data.companyName,
        website: data.companyWebsite,
        logoUrl: data.companyLogoUrl,
        location: data.location,
        workMode: data.workMode,
      });
      setCompanyModalOpen(true);
    }
    setJobImportOpen(false);
  }

  return (
    <form action={formAction} className="space-y-6">
      {companyModalOpen ? (
        <QuickCompanyModal
          initialValues={companyInitialValues}
          onClose={() => {
            setCompanyModalOpen(false);
            setCompanyInitialValues(undefined);
          }}
          onCreated={addCompany}
        />
      ) : null}
      {jobImportOpen ? (
        <JobImportModal
          initialUrl={jobImportInitialUrl}
          onApply={applyImportedJob}
          onClose={() => setJobImportOpen(false)}
        />
      ) : null}

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

      <Card data-tour="application-form">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("opportunity")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("opportunityDescription")}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="shrink-0 sm:h-9 sm:w-auto sm:rounded-lg sm:px-3 sm:text-sm"
            aria-label={t("importJob")}
            title={t("importJob")}
            onClick={() => {
              setJobImportInitialUrl(
                jobUrlRef.current?.value ?? initialValues.jobUrl,
              );
              setJobImportOpen(true);
            }}
          >
            <FileSearch aria-hidden="true" className="size-4" />
            <span className="sr-only sm:not-sr-only">{t("importJob")}</span>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField
            label={t("jobTitle")}
            htmlFor="application-title"
            required
            error={state.fieldErrors?.title}
          >
            <input
              id="application-title"
              name="title"
              type="text"
              ref={titleRef}
              defaultValue={initialValues.title}
              placeholder={t("jobTitlePlaceholder")}
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
            label={t("company")}
            htmlFor="application-company"
            required
            hint={t("companyHint")}
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
                  {t("selectCompany")}
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
                {t("createCompany")}
              </Button>
            </div>
          </FormField>
          <FormField
            label={t("location")}
            htmlFor="application-location"
            error={state.fieldErrors?.location}
          >
            <input
              id="application-location"
              name="location"
              type="text"
              ref={locationRef}
              defaultValue={initialValues.location}
              placeholder={t("locationPlaceholder")}
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
            label={t("workMode")}
            htmlFor="application-work-mode"
            error={state.fieldErrors?.workMode}
          >
            <select
              id="application-work-mode"
              name="workMode"
              ref={workModeRef}
              defaultValue={initialValues.workMode}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.workMode)}
              aria-describedby={
                state.fieldErrors?.workMode
                  ? "application-work-mode-error"
                  : undefined
              }
            >
              <option value="">{t("noWorkMode")}</option>
              {workModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {enums(`workMode.${option.value}`)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label={t("employmentType")}
            htmlFor="application-employment-type"
            error={state.fieldErrors?.employmentType}
          >
            <select
              id="application-employment-type"
              name="employmentType"
              ref={employmentTypeRef}
              defaultValue={initialValues.employmentType}
              className={fieldClassName}
              aria-invalid={Boolean(state.fieldErrors?.employmentType)}
              aria-describedby={
                state.fieldErrors?.employmentType
                  ? "application-employment-type-error"
                  : undefined
              }
            >
              <option value="">{t("noEmploymentType")}</option>
              <option value="Contrato sem termo">
                {t("employment.permanent")}
              </option>
              <option value="Contrato a termo">
                {t("employment.fixedTerm")}
              </option>
              <option value="Prestação de serviços">
                {t("employment.contractor")}
              </option>
              <option value="Estágio">{t("employment.internship")}</option>
              <option value="Trainee">{t("employment.trainee")}</option>
            </select>
          </FormField>
          <FormField
            label={t("jobUrl")}
            htmlFor="application-job-url"
            error={state.fieldErrors?.jobUrl}
          >
            <input
              id="application-job-url"
              name="jobUrl"
              type="text"
              ref={jobUrlRef}
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
            label={t("minimumSalary")}
            htmlFor="application-salary-min"
            error={state.fieldErrors?.salaryMin}
            className={cn(
              progressiveDisclosure && "order-3",
              progressiveDisclosure && !showAdvancedDetails && "hidden",
            )}
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
          <div
            className={cn(
              "grid grid-cols-[1fr_6rem] gap-2",
              progressiveDisclosure && "order-3",
              progressiveDisclosure && !showAdvancedDetails && "hidden",
            )}
          >
            <FormField
              label={t("maximumSalary")}
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
              label={t("currency")}
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
          <div
            className={cn(
              "md:col-span-2",
              progressiveDisclosure && "order-3",
              progressiveDisclosure && !showAdvancedDetails && "hidden",
            )}
          >
            <FormField
              label={t("skills")}
              htmlFor="application-skills"
              hint={t("skillsHint")}
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
              label={t("jobSummary")}
              htmlFor="application-opportunity-summary"
              error={state.fieldErrors?.opportunitySummary}
            >
              <textarea
                id="application-opportunity-summary"
                name="opportunitySummary"
                ref={opportunitySummaryRef}
                rows={4}
                defaultValue={initialValues.opportunitySummary}
                placeholder={t("jobSummaryPlaceholder")}
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
          {progressiveDisclosure ? (
            <div className="order-2 md:col-span-2">
              <button
                type="button"
                aria-expanded={showAdvancedDetails}
                aria-controls="application-more-details"
                onClick={() => setAdvancedOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800">
                    {showAdvancedDetails
                      ? t("hideMoreDetails")
                      : t("moreDetails")}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    {t("moreDetailsDescription")}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 text-slate-500 transition-transform",
                    showAdvancedDetails && "rotate-180",
                  )}
                />
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div
        id={progressiveDisclosure ? "application-more-details" : undefined}
        className={cn(
          "space-y-6",
          progressiveDisclosure && !showAdvancedDetails && "hidden",
        )}
      >
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">{t("application")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("applicationDescription")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <FormField
              label={t("status")}
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
                    {enums(`applicationStatus.${option.value}`)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label={t("applicationDate")}
              htmlFor="application-date"
              required
              error={state.fieldErrors?.applicationDate}
            >
              <input
                id="application-date"
                name="applicationDate"
                type="date"
                ref={applicationDateRef}
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
              label={t("source")}
              htmlFor="application-source"
              error={state.fieldErrors?.source}
            >
              <input
                id="application-source"
                name="source"
                type="text"
                ref={sourceRef}
                defaultValue={initialValues.source}
                placeholder={t("sourcePlaceholder")}
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
              label={t("expectedSalary")}
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
              label={t("primaryRecruiter")}
              htmlFor="application-recruiter"
              hint={t("primaryRecruiterHint")}
              error={state.fieldErrors?.primaryRecruiterId}
            >
              <div className="flex gap-2">
                <select
                  id="application-recruiter"
                  name="primaryRecruiterId"
                  value={selectedRecruiterId}
                  onChange={(event) =>
                    setSelectedRecruiterId(event.target.value)
                  }
                  className={fieldClassName}
                  aria-invalid={Boolean(state.fieldErrors?.primaryRecruiterId)}
                  aria-describedby={
                    state.fieldErrors?.primaryRecruiterId
                      ? "application-recruiter-error"
                      : "application-recruiter-hint"
                  }
                >
                  <option value="">{t("noPrimaryRecruiter")}</option>
                  {availableRecruiters.map((recruiter) => (
                    <option key={recruiter.id} value={recruiter.id}>
                      {recruiter.name}
                      {recruiter.companyId ? "" : ` · ${t("withoutCompany")}`}
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
                  aria-label={t("createContactNewTab")}
                  title={t("createContactNewTab")}
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
              label={t("nextTask")}
              htmlFor="application-next-action"
              error={state.fieldErrors?.nextActionSummary}
            >
              <input
                id="application-next-action"
                name="nextActionSummary"
                type="text"
                defaultValue={initialValues.nextActionSummary}
                placeholder={t("nextTaskPlaceholder")}
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
              label={t("followUpDate")}
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
                label={t("notes")}
                htmlFor="application-notes"
                error={state.fieldErrors?.summaryNotes}
              >
                <textarea
                  id="application-notes"
                  name="summaryNotes"
                  rows={5}
                  defaultValue={initialValues.summaryNotes}
                  placeholder={t("notesPlaceholder")}
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
                {t("interviewPreparation")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("interviewPreparationDescription")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-2">
            <FormField
              label={t("personalScript")}
              htmlFor="application-interview-preparation"
              hint={t("personalScriptHint")}
              error={state.fieldErrors?.interviewPreparation}
            >
              <textarea
                id="application-interview-preparation"
                name="interviewPreparation"
                rows={9}
                defaultValue={initialValues.interviewPreparation}
                placeholder={t("personalScriptPlaceholder")}
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
              label={t("companyQuestions")}
              htmlFor="application-company-questions"
              hint={t("companyQuestionsHint")}
              error={state.fieldErrors?.questionsForCompany}
            >
              <textarea
                id="application-company-questions"
                name="questionsForCompany"
                rows={9}
                defaultValue={initialValues.questionsForCompany}
                placeholder={t("companyQuestionsPlaceholder")}
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
      </div>

      {!progressiveDisclosure || showAdvancedDetails ? (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={cancelHref}
            className={buttonClassName({ variant: "secondary" })}
          >
            {t("cancel")}
          </Link>
          <SubmitButton label={submitLabel} />
        </div>
      ) : null}
    </form>
  );
}
