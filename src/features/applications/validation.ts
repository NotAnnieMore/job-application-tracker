import type {
  ApplicationActionState,
  ApplicationField,
} from "@/features/applications/types";
import type {
  ApplicationStatusValue,
  ApplicationTransactionArgs,
  WorkModeValue,
} from "@/types/database.types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const statusValues = new Set<ApplicationStatusValue>([
  "interested",
  "applied",
  "interview_scheduled",
  "interview_completed",
  "awaiting_response",
  "offer_received",
  "rejected",
  "withdrawn",
]);
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
) {
  if (value.length > maxLength) {
    errors[field] = `${label} pode ter no máximo ${maxLength} caracteres.`;
  }
  return value || null;
}

function parseOptionalNumber(
  value: string,
  field: ApplicationField,
  label: string,
  errors: NonNullable<ApplicationActionState["fieldErrors"]>,
) {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));

  if (!Number.isFinite(parsed) || parsed < 0) {
    errors[field] = `${label} deve ser um valor positivo.`;
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
) {
  if (!value) return null;
  if (value.length > 1000) {
    errors[field] = "O endereço pode ter no máximo 1000 caracteres.";
    return null;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (!url.hostname || !["http:", "https:"].includes(url.protocol)) {
      errors[field] = "Introduz um endereço web válido.";
      return null;
    }
    return url.toString();
  } catch {
    errors[field] = "Introduz um endereço web válido.";
    return null;
  }
}

export function validateApplicationForm(formData: FormData) {
  const fieldErrors: NonNullable<ApplicationActionState["fieldErrors"]> = {};
  const companyId = readText(formData, "companyId");
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

  if (!uuidPattern.test(companyId)) {
    fieldErrors.companyId = "Seleciona uma empresa válida.";
  }

  if (!title) {
    fieldErrors.title = "Introduz o título da vaga.";
  } else if (title.length > 200) {
    fieldErrors.title = "O título pode ter no máximo 200 caracteres.";
  }

  let workMode: WorkModeValue | null = null;
  if (rawWorkMode) {
    if (workModeValues.has(rawWorkMode as WorkModeValue)) {
      workMode = rawWorkMode as WorkModeValue;
    } else {
      fieldErrors.workMode = "Seleciona uma modalidade válida.";
    }
  }

  const salaryMin = parseOptionalNumber(
    rawSalaryMin,
    "salaryMin",
    "O salário mínimo",
    fieldErrors,
  );
  const salaryMax = parseOptionalNumber(
    rawSalaryMax,
    "salaryMax",
    "O salário máximo",
    fieldErrors,
  );

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    fieldErrors.salaryMax =
      "O salário máximo deve ser igual ou superior ao mínimo.";
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    fieldErrors.currency = "Usa um código de moeda com três letras, como EUR.";
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
    fieldErrors.skills =
      "Usa no máximo 30 competências, com até 80 caracteres cada.";
  }

  let status: ApplicationStatusValue = "applied";
  if (statusValues.has(rawStatus as ApplicationStatusValue)) {
    status = rawStatus as ApplicationStatusValue;
  } else {
    fieldErrors.status = "Seleciona um estado válido.";
  }

  if (!isValidDate(applicationDate)) {
    fieldErrors.applicationDate = "Introduz uma data válida.";
  }

  if (followUpDate && !isValidDate(followUpDate)) {
    fieldErrors.followUpDate = "Introduz uma data válida.";
  }

  const expectedSalary = parseOptionalNumber(
    rawExpectedSalary,
    "expectedSalary",
    "O salário esperado",
    fieldErrors,
  );

  const values: ApplicationTransactionArgs = {
    p_company_id: companyId,
    p_title: title,
    p_location: optionalText(
      location,
      160,
      "location",
      "A localização",
      fieldErrors,
    ),
    p_work_mode: workMode,
    p_employment_type: optionalText(
      employmentType,
      120,
      "employmentType",
      "O tipo de contrato",
      fieldErrors,
    ),
    p_salary_min: salaryMin,
    p_salary_max: salaryMax,
    p_currency: currency,
    p_job_url: normalizeUrl(jobUrl, "jobUrl", fieldErrors),
    p_skills: skills,
    p_opportunity_summary: optionalText(
      opportunitySummary,
      5000,
      "opportunitySummary",
      "O resumo da vaga",
      fieldErrors,
    ),
    p_status: status,
    p_application_date: applicationDate,
    p_source: optionalText(source, 120, "source", "A fonte", fieldErrors),
    p_expected_salary: expectedSalary,
    p_summary_notes: optionalText(
      summaryNotes,
      5000,
      "summaryNotes",
      "As notas",
      fieldErrors,
    ),
    p_next_action_summary: optionalText(
      nextActionSummary,
      240,
      "nextActionSummary",
      "A próxima ação",
      fieldErrors,
    ),
    p_follow_up_date: followUpDate || null,
    p_interview_preparation: optionalText(
      interviewPreparation,
      10000,
      "interviewPreparation",
      "O guião de preparação",
      fieldErrors,
    ),
    p_questions_for_company: optionalText(
      questionsForCompany,
      10000,
      "questionsForCompany",
      "As perguntas para a empresa",
      fieldErrors,
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
  return uuidPattern.test(value);
}
