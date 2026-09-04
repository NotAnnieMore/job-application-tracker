import type messages from "../../../messages/en-GB.json";
import type { ActionActionState } from "@/features/actions/types";
import type {
  ActionPriorityValue,
  ActionStatusValue,
} from "@/types/database.types";
import { isValidUuid } from "@/lib/validation";

type ValidationTranslator = (
  key: keyof typeof messages.TaskValidation,
) => string;

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/u;
const actionStatuses = new Set<ActionStatusValue>([
  "pending",
  "completed",
  "cancelled",
]);
const actionPriorities = new Set<ActionPriorityValue>([
  "low",
  "medium",
  "high",
]);

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function isValidDate(value: string) {
  const match = datePattern.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() + 1 === Number(month) &&
    date.getUTCDate() === Number(day)
  );
}

export function validateActionForm(
  formData: FormData,
  t: ValidationTranslator,
) {
  const applicationId = readText(formData, "applicationId");
  const description = readText(formData, "description");
  const dueDate = readText(formData, "dueDate");
  const status = readText(formData, "status") as ActionStatusValue;
  const priority = readText(formData, "priority") as ActionPriorityValue;
  const fieldErrors: NonNullable<ActionActionState["fieldErrors"]> = {};

  if (!isValidUuid(applicationId)) {
    fieldErrors.applicationId = t("invalidApplication");
  }
  if (!description) {
    fieldErrors.description = t("requiredDescription");
  } else if (description.length > 500) {
    fieldErrors.description = t("descriptionLength");
  }
  if (dueDate && !isValidDate(dueDate)) {
    fieldErrors.dueDate = t("invalidDate");
  }
  if (!actionStatuses.has(status)) {
    fieldErrors.status = t("invalidStatus");
  }
  if (!actionPriorities.has(priority)) {
    fieldErrors.priority = t("invalidPriority");
  }

  return {
    values: {
      application_id: applicationId,
      description,
      due_date: dueDate || null,
      status,
      priority,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    },
    fieldErrors,
  };
}

export function hasActionFieldErrors(
  fieldErrors: NonNullable<ActionActionState["fieldErrors"]>,
) {
  return Object.keys(fieldErrors).length > 0;
}

export function isValidActionId(value: string) {
  return isValidUuid(value);
}
