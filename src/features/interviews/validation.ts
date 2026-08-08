import type { InterviewActionState } from "@/features/interviews/types";
import type {
  InterviewFormatValue,
  InterviewStatusValue,
} from "@/types/database.types";
import { isValidUuid } from "@/lib/validation";

const localDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/u;
const interviewStatuses = new Set<InterviewStatusValue>([
  "scheduled",
  "completed",
  "cancelled",
]);
const interviewFormats = new Set<InterviewFormatValue>([
  "video",
  "phone",
  "onsite",
  "other",
]);

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function parseScheduledAt(value: string, rawOffset: string) {
  const match = localDateTimePattern.exec(value);
  const offset = Number(rawOffset);
  if (!match || !Number.isInteger(offset) || Math.abs(offset) > 840)
    return null;

  const [, year, month, day, hour, minute] = match;
  const localAsUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  const validationDate = new Date(localAsUtc);
  if (
    validationDate.getUTCFullYear() !== Number(year) ||
    validationDate.getUTCMonth() + 1 !== Number(month) ||
    validationDate.getUTCDate() !== Number(day) ||
    validationDate.getUTCHours() !== Number(hour) ||
    validationDate.getUTCMinutes() !== Number(minute)
  ) {
    return null;
  }

  return new Date(localAsUtc + offset * 60_000).toISOString();
}

export function validateInterviewForm(formData: FormData) {
  const applicationId = readText(formData, "applicationId");
  const recruiterId = readText(formData, "recruiterId");
  const interviewType = readText(formData, "interviewType");
  const scheduledAtLocal = readText(formData, "scheduledAtLocal");
  const timezoneOffset = readText(formData, "timezoneOffset");
  const rawStatus = readText(formData, "status") as InterviewStatusValue;
  const rawFormat = readText(formData, "format") as InterviewFormatValue;
  const rawDuration = readText(formData, "durationMinutes");
  const locationOrUrl = readText(formData, "locationOrUrl");
  const rawParticipants = readText(formData, "participants");
  const preparation = readText(formData, "preparation");
  const feedback = readText(formData, "feedback");
  const result = readText(formData, "result");
  const fieldErrors: NonNullable<InterviewActionState["fieldErrors"]> = {};

  if (!isValidUuid(applicationId)) {
    fieldErrors.applicationId = "Seleciona uma candidatura válida.";
  }
  if (recruiterId && !isValidUuid(recruiterId)) {
    fieldErrors.recruiterId = "Seleciona um contacto válido.";
  }
  if (!interviewType) {
    fieldErrors.interviewType = "Indica o tipo de entrevista.";
  } else if (interviewType.length > 120) {
    fieldErrors.interviewType = "O tipo pode ter no máximo 120 caracteres.";
  }

  const scheduledAt = parseScheduledAt(scheduledAtLocal, timezoneOffset);
  if (!scheduledAt) {
    fieldErrors.scheduledAtLocal = "Indica uma data e hora válidas.";
  }
  if (!interviewStatuses.has(rawStatus)) {
    fieldErrors.status = "Seleciona um estado válido.";
  }
  if (!interviewFormats.has(rawFormat)) {
    fieldErrors.format = "Seleciona um formato válido.";
  }

  const durationMinutes = Number(rawDuration);
  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 5 ||
    durationMinutes > 480
  ) {
    fieldErrors.durationMinutes = "Indica uma duração entre 5 e 480 minutos.";
  }
  if (locationOrUrl.length > 1000) {
    fieldErrors.locationOrUrl =
      "O local ou ligação pode ter no máximo 1000 caracteres.";
  }

  const participants = rawParticipants
    .split(/[\n,;]+/u)
    .map((participant) => participant.trim())
    .filter(Boolean);
  if (
    participants.length > 20 ||
    participants.some((item) => item.length > 160)
  ) {
    fieldErrors.participants =
      "Indica no máximo 20 participantes, com 160 caracteres por nome.";
  }
  if (preparation.length > 10_000) {
    fieldErrors.preparation =
      "A preparação pode ter no máximo 10 000 caracteres.";
  }
  if (feedback.length > 10_000) {
    fieldErrors.feedback = "O feedback pode ter no máximo 10 000 caracteres.";
  }
  if (result.length > 4_000) {
    fieldErrors.result = "O resultado pode ter no máximo 4 000 caracteres.";
  }

  return {
    values: {
      application_id: applicationId,
      recruiter_id: recruiterId || null,
      interview_type: interviewType,
      scheduled_at: scheduledAt ?? "",
      status: rawStatus,
      format: rawFormat,
      duration_minutes: durationMinutes,
      location_or_url: locationOrUrl || null,
      participants,
      preparation: preparation || null,
      feedback: feedback || null,
      result: result || null,
    },
    fieldErrors,
  };
}

export function hasInterviewFieldErrors(
  fieldErrors: NonNullable<InterviewActionState["fieldErrors"]>,
) {
  return Object.keys(fieldErrors).length > 0;
}

export function isValidInterviewId(value: string) {
  return isValidUuid(value);
}
