import type { ActionActionState } from "@/features/actions/types";
import type {
  ActionPriorityValue,
  ActionStatusValue,
} from "@/types/database.types";
import { isValidUuid } from "@/lib/validation";

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

export function validateActionForm(formData: FormData) {
  const applicationId = readText(formData, "applicationId");
  const description = readText(formData, "description");
  const dueDate = readText(formData, "dueDate");
  const status = readText(formData, "status") as ActionStatusValue;
  const priority = readText(formData, "priority") as ActionPriorityValue;
  const fieldErrors: NonNullable<ActionActionState["fieldErrors"]> = {};

  if (!isValidUuid(applicationId)) {
    fieldErrors.applicationId = "Seleciona uma candidatura válida.";
  }
  if (!description) {
    fieldErrors.description = "Descreve a tarefa a realizar.";
  } else if (description.length > 500) {
    fieldErrors.description = "A descrição pode ter no máximo 500 caracteres.";
  }
  if (dueDate && !isValidDate(dueDate)) {
    fieldErrors.dueDate = "Indica uma data válida.";
  }
  if (!actionStatuses.has(status)) {
    fieldErrors.status = "Seleciona um estado válido.";
  }
  if (!actionPriorities.has(priority)) {
    fieldErrors.priority = "Seleciona uma prioridade válida.";
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
