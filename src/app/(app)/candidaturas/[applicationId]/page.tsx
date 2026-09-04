import { canCreateInterview } from "@/features/interviews/eligibility";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  Globe2,
  ListPlus,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import {
  ActionPriorityBadge,
  ActionStatusBadge,
} from "@/components/actions/action-badges";
import { ActionQuickStatusForm } from "@/components/actions/action-quick-status-form";
import { ApplicationQuickStatusForm } from "@/components/applications/application-quick-status-form";
import { CompanyLogo } from "@/components/companies/company-logo";
import { InterviewStatusBadge } from "@/components/interviews/interview-status-badge";
import { NoteCreateForm } from "@/components/notes/note-create-form";
import { NoteItem } from "@/components/notes/note-item";
import { PageHeader } from "@/components/shared/page-header";
import { SuccessToast } from "@/components/shared/success-toast";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getActions } from "@/features/actions/data";
import { formatActionDate } from "@/features/actions/date";
import { getApplicationById } from "@/features/applications/data";
import { isValidApplicationId } from "@/features/applications/validation";
import { getInterviews } from "@/features/interviews/data";
import { formatInterviewDateTime } from "@/features/interviews/date";
import { getApplicationNotes } from "@/features/notes/data";

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatMoney(value: string, currency: string, locale: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

function salaryRange(
  minimum: string,
  maximum: string,
  currency: string,
  locale: string,
  from: string,
  upTo: string,
  notDefined: string,
) {
  if (minimum && maximum) {
    return `${formatMoney(minimum, currency, locale)} – ${formatMoney(maximum, currency, locale)}`;
  }
  if (minimum) return `${from} ${formatMoney(minimum, currency, locale)}`;
  if (maximum) return `${upTo} ${formatMoney(maximum, currency, locale)}`;
  return notDefined;
}

function DetailItem({
  icon: Icon,
  label,
  value,
  fallback,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
  fallback: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-700">
          {value || fallback}
        </p>
      </div>
    </div>
  );
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ applicationId }, query] = await Promise.all([params, searchParams]);
  const [locale, t, tWorkMode, tFormat, tEmployment] = await Promise.all([
    getLocale(),
    getTranslations("ApplicationDetail"),
    getTranslations("Enums.workMode"),
    getTranslations("Enums.interviewFormat"),
    getTranslations("ApplicationForm.employment"),
  ]);

  if (!isValidApplicationId(applicationId)) notFound();

  const [application, interviews, actionsData, notes] = await Promise.all([
    getApplicationById(applicationId),
    getInterviews({ applicationId }),
    getActions({ applicationId }),
    getApplicationNotes(applicationId),
  ]);

  if (!application) notFound();

  const noticeKey = singleValue(query.aviso);
  const noticeMap: Record<string, string> = {
    "candidatura-atualizada": t("notices.applicationUpdated"),
    "entrevista-atualizada": t("notices.interviewUpdated"),
    "entrevista-eliminada": t("notices.interviewDeleted"),
    "acao-atualizada": t("notices.taskUpdated"),
    "acao-eliminada": t("notices.taskDeleted"),
    "nota-criada": t("notices.noteCreated"),
    "nota-atualizada": t("notices.noteUpdated"),
    "nota-eliminada": t("notices.noteDeleted"),
  };
  const notice = noticeMap[noticeKey];
  const skills = application.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <Link
        href="/candidaturas"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("back")}
      </Link>

      <PageHeader
        title={application.title}
        description={t("applicationOf", {
          company: application.companyName,
          date: formatDate(application.applicationDate, locale),
        })}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/candidaturas/${application.id}/editar`}
              className={buttonClassName({ variant: "secondary" })}
            >
              <Pencil aria-hidden="true" className="size-4" />
              {t("edit")}
            </Link>
            <Link
              href={`/acoes/nova?candidatura=${application.id}`}
              className={buttonClassName({ variant: "secondary" })}
            >
              <ListPlus aria-hidden="true" className="size-4" />
              {t("newTask")}
            </Link>
            {canCreateInterview(application.status) ? (
              <Link
                href={`/entrevistas/nova?candidatura=${application.id}`}
                className={buttonClassName()}
              >
                <CalendarDays aria-hidden="true" className="size-4" />
                {t("scheduleInterview")}
              </Link>
            ) : null}
          </div>
        }
      />

      <SuccessToast message={notice} queryParam="aviso" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <Card>
          <CardHeader>
            <div className="flex min-w-0 items-center gap-3">
              <CompanyLogo
                name={application.companyName}
                logoUrl={application.companyLogoUrl}
                size="md"
              />
              <div className="min-w-0">
                <h2 className="truncate font-bold text-slate-950">
                  {application.companyName}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">{t("summary")}</p>
              </div>
            </div>
            <ApplicationQuickStatusForm
              applicationId={application.id}
              status={application.status}
              className="max-w-48"
            />
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <DetailItem
              icon={CalendarDays}
              label={t("applicationDate")}
              value={formatDate(application.applicationDate, locale)}
              fallback={t("notDefined")}
            />
            <DetailItem
              icon={BriefcaseBusiness}
              label={t("source")}
              value={application.source}
              fallback={t("notDefined")}
            />
            <DetailItem
              icon={MapPin}
              label={t("locationAndWorkMode")}
              value={[
                application.location,
                application.workMode ? tWorkMode(application.workMode) : "",
              ]
                .filter(Boolean)
                .join(" · ")}
              fallback={t("notDefined")}
            />
            <DetailItem
              icon={BriefcaseBusiness}
              label={t("employmentType")}
              value={
                application.employmentType === "Contrato sem termo"
                  ? tEmployment("permanent")
                  : application.employmentType === "Contrato a termo"
                    ? tEmployment("fixedTerm")
                    : application.employmentType === "Prestação de serviços"
                      ? tEmployment("contractor")
                      : application.employmentType === "Estágio"
                        ? tEmployment("internship")
                        : application.employmentType === "Trainee"
                          ? tEmployment("trainee")
                          : application.employmentType
              }
              fallback={t("notDefined")}
            />
            <DetailItem
              icon={CircleDollarSign}
              label={t("jobSalaryRange")}
              value={salaryRange(
                application.salaryMin,
                application.salaryMax,
                application.currency,
                locale,
                t("fromAmount"),
                t("upToAmount"),
                t("notDefined"),
              )}
              fallback={t("notDefined")}
            />
            <DetailItem
              icon={CircleDollarSign}
              label={t("expectedSalary")}
              value={
                application.expectedSalary
                  ? formatMoney(
                      application.expectedSalary,
                      application.currency,
                      locale,
                    )
                  : ""
              }
              fallback={t("notDefined")}
            />
            {application.followUpDate ? (
              <DetailItem
                icon={CalendarDays}
                label={t("nextFollowUp")}
                value={formatDate(application.followUpDate, locale)}
                fallback={t("notDefined")}
              />
            ) : null}
            {application.nextActionSummary ? (
              <DetailItem
                icon={ListPlus}
                label={t("nextTask")}
                value={application.nextActionSummary}
                fallback={t("notDefined")}
              />
            ) : null}
          </CardContent>
          {application.companyWebsite || application.jobUrl ? (
            <div className="flex flex-wrap gap-3 border-t border-slate-100 px-5 py-4">
              {application.companyWebsite ? (
                <a
                  href={application.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Globe2 aria-hidden="true" className="size-4" />
                  {t("companyWebsite")}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              ) : null}
              {application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  <BriefcaseBusiness aria-hidden="true" className="size-4" />
                  {t("openOriginalJob")}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              ) : null}
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">{t("mainContact")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("mainContactDescription")}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {application.recruiterName ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound aria-hidden="true" className="size-5" />
                  </span>
                  <p className="font-semibold text-slate-950">
                    {application.recruiterName}
                  </p>
                </div>
                {application.recruiterEmail ? (
                  <a
                    href={`mailto:${application.recruiterEmail}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <Mail aria-hidden="true" className="size-4" />
                    {application.recruiterEmail}
                  </a>
                ) : null}
                {application.recruiterPhone ? (
                  <a
                    href={`tel:${application.recruiterPhone}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    {application.recruiterPhone}
                  </a>
                ) : null}
                {application.recruiterLinkedinUrl ? (
                  <a
                    href={application.recruiterLinkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {t("openLinkedin")}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="py-4 text-center">
                <UserRound
                  aria-hidden="true"
                  className="mx-auto size-8 text-slate-300"
                />
                <p className="mt-3 text-sm text-slate-500">
                  {t("noRecruiter")}
                </p>
                <Link
                  href={`/candidaturas/${application.id}/editar`}
                  className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  {t("linkContact")}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(application.opportunitySummary ||
        application.summaryNotes ||
        skills.length > 0) && (
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">{t("jobAndContext")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("jobAndContextDescription")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            {application.opportunitySummary ? (
              <section>
                <h3 className="text-sm font-semibold text-slate-950">
                  {t("jobSummary")}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {application.opportunitySummary}
                </p>
              </section>
            ) : null}
            {application.summaryNotes ? (
              <section>
                <h3 className="text-sm font-semibold text-slate-950">
                  {t("generalNotes")}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {application.summaryNotes}
                </p>
              </section>
            ) : null}
            {skills.length > 0 ? (
              <section className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-slate-950">
                  {t("skills")}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("preparation")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("preparationDescription")}
            </p>
          </div>
          <Link
            href={`/candidaturas/${application.id}/editar`}
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            <Pencil aria-hidden="true" className="size-4" />
            {t("editPreparation")}
          </Link>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl bg-blue-50/70 p-4">
            <h3 className="text-sm font-bold text-blue-950">
              {t("personalScript")}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900/75">
              {application.interviewPreparation || t("personalScriptEmpty")}
            </p>
          </section>
          <section className="rounded-xl bg-violet-50/70 p-4">
            <h3 className="text-sm font-bold text-violet-950">
              {t("companyQuestions")}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-violet-900/75">
              {application.questionsForCompany || t("companyQuestionsEmpty")}
            </p>
          </section>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">{t("interviews")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("interviewCount", { count: interviews.length })}
              </p>
            </div>
            {canCreateInterview(application.status) ? (
              <Link
                href={`/entrevistas/nova?candidatura=${application.id}`}
                className={buttonClassName({
                  variant: "secondary",
                  size: "sm",
                })}
              >
                <Plus aria-hidden="true" className="size-4" />
                {t("schedule")}
              </Link>
            ) : null}
          </CardHeader>
          <CardContent>
            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.map((interview) => (
                  <article
                    key={interview.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/entrevistas/${interview.id}?regressar=candidatura`}
                          className="font-semibold text-slate-950 hover:text-blue-700"
                        >
                          {interview.interviewType}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatInterviewDateTime(
                            interview.scheduledAt,
                            locale,
                          )}{" "}
                          · {tFormat(interview.format)}
                        </p>
                      </div>
                      <InterviewStatusBadge status={interview.status} />
                    </div>
                  </article>
                ))}
                <Link
                  href={`/entrevistas?candidatura=${application.id}`}
                  className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  {t("viewInterviews")}
                </Link>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                {t("noInterviews")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-bold text-slate-950">{t("tasks")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("taskCount", { count: actionsData.items.length })}
              </p>
            </div>
            <Link
              href={`/acoes/nova?candidatura=${application.id}`}
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              <Plus aria-hidden="true" className="size-4" />
              {t("create")}
            </Link>
          </CardHeader>
          <CardContent>
            {actionsData.items.length > 0 ? (
              <div className="space-y-3">
                {actionsData.items.map((action) => (
                  <article
                    key={action.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/acoes/${action.id}/editar?regressar=candidatura`}
                          className="font-semibold text-slate-950 hover:text-blue-700"
                        >
                          {action.description}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <ActionStatusBadge status={action.status} />
                          <ActionPriorityBadge priority={action.priority} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {action.dueDate
                            ? t("deadline", {
                                date: formatActionDate(action.dueDate, locale),
                              })
                            : t("noDeadline")}
                        </p>
                      </div>
                      <ActionQuickStatusForm
                        actionId={action.id}
                        status={action.status}
                      />
                    </div>
                  </article>
                ))}
                <Link
                  href={`/acoes?candidatura=${application.id}`}
                  className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  {t("viewTasks")}
                </Link>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                {t("noTasks")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card id="notas" className="scroll-mt-6">
        <CardHeader>
          <div>
            <h2 className="font-bold text-slate-950">{t("noteHistory")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("noteCount", { count: notes.length })}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <NoteCreateForm applicationId={application.id} />
          {notes.length > 0 ? (
            <div className="space-y-3 border-t border-slate-100 pt-5">
              {notes.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
              {t("noNotes")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
