import type messages from "../../../messages/en-GB.json";
type ValidationTranslator = (
  key: keyof typeof messages.ApplicationValidation,
  values?: Record<string, string | number>,
) => string;
import type {
  ApplicationActionState,
  ApplicationField,
} from "@/features/applications/types";
import { applicationStatusOptions } from "@/features/applications/constants";
import type {
  ApplicationStatusValue,
  ApplicationTransactionArgs,
  WorkModeValue,
} from "@/types/database.types";
import { isValidUuid } from "@/lib/validation";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const statusValues = new Set<ApplicationStatusValue>(
  applicationStatusOptions.map((option) => option.value),
);
const workModeValues = new Set<WorkModeValue>(["onsite", "hybrid", "remote"]);

function readText(formData: FormData, field: ApplicationField) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(
  value: string,
  maxLength: number,
  field: ApplicationField,
  label: string,
  errors: NonNullable<ApplicationActionState["fieldErrors"]>,
  t: ValidationTranslator,
) {
  if (value.length > maxLength) {
    errors[field] = t("textLength", { label, maxLength });
  }
  return value || null;
}

function parseOptionalNumber(
  value: string,
  field: ApplicationField,
  label: string,
  errors: NonNullable<ApplicationActionState["fieldErrors"]>,
  t: ValidationTranslator,
) {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));

  if (!Number.isFinite(parsed) || parsed < 0) {
    errors[field] = t("positiveNumber", { label });
    return null;
  }

  return parsed;
}

function isValidDate(value: string) {
  if (!datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function normalizeUrl(
  value: string,
  field: ApplicationField,
  errors: NonNullable<ApplicationActionState["fieldErrors"]>,
  t: ValidationTranslator,
) {
  if (!value) return null;
  if (value.length > 1000) {
    errors[field] = t("urlLength");
    return null;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (!url.hostname || !["http:", "https:"].includes(url.protocol)) {
      errors[field] = t("invalidUrl");
      return null;
    }
    return url.toString();
  } catch {
    errors[field] = t("invalidUrl");
    return null;
  }
}

export function validateApplicationForm(
  formData: FormData,
  t: ValidationTranslator,
) {
  const fieldErrors: NonNullable<ApplicationActionState["fieldErrors"]> = {};
  const companyId = readText(formData, "companyId");
  const primaryRecruiterId = readText(formData, "primaryRecruiterId");
  const title = readText(formData, "title");
  const location = readText(formData, "location");
  const rawWorkMode = readText(formData, "workMode");
  const employmentType = readText(formData, "employmentType");
  const rawSalaryMin = readText(formData, "salaryMin");
  const rawSalaryMax = readText(formData, "salaryMax");
  const currency = readText(formData, "currency").toUpperCase();
  const jobUrl = readText(formData, "jobUrl");
  const rawSkills = readText(formData, "skills");
  const opportunitySummary = readText(formData, "opportunitySummary");
  const rawStatus = readText(formData, "status");
  const applicationDate = readText(formData, "applicationDate");
  const source = readText(formData, "source");
  const rawExpectedSalary = readText(formData, "expectedSalary");
  const summaryNotes = readText(formData, "summaryNotes");
  const nextActionSummary = readText(formData, "nextActionSummary");
  const followUpDate = readText(formData, "followUpDate");
  const interviewPreparation = readText(formData, "interviewPreparation");
  const questionsForCompany = readText(formData, "questionsForCompany");

  if (!isValidUuid(companyId)) {
    fieldErrors.companyId = t("invalidCompany");
  }

  if (primaryRecruiterId && !isValidUuid(primaryRecruiterId)) {
    fieldErrors.primaryRecruiterId = t("invalidRecruiter");
  }

  if (!title) {
    fieldErrors.title = t("requiredTitle");
  } else if (title.length > 200) {
    fieldErrors.title = t("titleLength");
  }

  let workMode: WorkModeValue | null = null;
  if (rawWorkMode) {
    if (workModeValues.has(rawWorkMode as WorkModeValue)) {
      workMode = rawWorkMode as WorkModeValue;
    } else {
      fieldErrors.workMode = t("invalidWorkMode");
    }
  }

  const salaryMin = parseOptionalNumber(
    rawSalaryMin,
    "salaryMin",
    t("salaryMin"),
    fieldErrors,
    t,
  );
  const salaryMax = parseOptionalNumber(
    rawSalaryMax,
    "salaryMax",
    t("salaryMax"),
    fieldErrors,
    t,
  );

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    fieldErrors.salaryMax = t("salaryRange");
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    fieldErrors.currency = t("invalidCurrency");
  }

  const skills = Array.from(
    new Set(
      rawSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  );
  if (skills.length > 30 || skills.some((skill) => skill.length > 80)) {
    fieldErrors.skills = t("skillsLength");
  }

  let status: ApplicationStatusValue = "applied";
  if (statusValues.has(rawStatus as ApplicationStatusValue)) {
    status = rawStatus as ApplicationStatusValue;
  } else {
    fieldErrors.status = t("invalidStatus");
  }

  if (!isValidDate(applicationDate)) {
    fieldErrors.applicationDate = t("invalidDate");
  }

  if (followUpDate && !isValidDate(followUpDate)) {
    fieldErrors.followUpDate = t("invalidDate");
  }

  const expectedSalary = parseOptionalNumber(
    rawExpectedSalary,
    "expectedSalary",
    t("expectedSalary"),
    fieldErrors,
    t,
  );

  const values: ApplicationTransactionArgs = {
    p_company_id: companyId,
    p_primary_recruiter_id: primaryRecruiterId || null,
    p_title: title,
    p_location: optionalText(
      location,
      160,
      "location",
      t("location"),
      fieldErrors,
      t,
    ),
    p_work_mode: workMode,
    p_employment_type: optionalText(
      employmentType,
      120,
      "employmentType",
      t("employmentType"),
      fieldErrors,
      t,
    ),
    p_salary_min: salaryMin,
    p_salary_max: salaryMax,
    p_currency: currency,
    p_job_url: normalizeUrl(jobUrl, "jobUrl", fieldErrors, t),
    p_skills: skills,
    p_opportunity_summary: optionalText(
      opportunitySummary,
      5000,
      "opportunitySummary",
      t("opportunitySummary"),
      fieldErrors,
      t,
    ),
    p_status: status,
    p_application_date: applicationDate,
    p_source: optionalText(source, 120, "source", t("source"), fieldErrors, t),
    p_expected_salary: expectedSalary,
    p_summary_notes: optionalText(
      summaryNotes,
      5000,
      "summaryNotes",
      t("summaryNotes"),
      fieldErrors,
      t,
    ),
    p_next_action_summary: optionalText(
      nextActionSummary,
      240,
      "nextActionSummary",
      t("nextActionSummary"),
      fieldErrors,
      t,
    ),
    p_follow_up_date: followUpDate || null,
    p_interview_preparation: optionalText(
      interviewPreparation,
      10000,
      "interviewPreparation",
      t("interviewPreparation"),
      fieldErrors,
      t,
    ),
    p_questions_for_company: optionalText(
      questionsForCompany,
      10000,
      "questionsForCompany",
      t("questionsForCompany"),
      fieldErrors,
      t,
    ),
  };

  return { values, fieldErrors };
}

export function hasApplicationFieldErrors(
  fieldErrors: NonNullable<ApplicationActionState["fieldErrors"]>,
) {
  return Object.keys(fieldErrors).length > 0;
}

export function isValidApplicationId(value: string) {
  return isValidUuid(value);
}
