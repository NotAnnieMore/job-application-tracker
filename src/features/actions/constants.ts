import type {
  ActionPriorityValue,
  ActionStatusValue,
} from "@/types/database.types";

export const actionStatusOptions: Array<{
  value: ActionStatusValue;
  label: string;
}> = [
  { value: "pending", label: "Pendente" },
  { value: "completed", label: "Concluída" },
  { value: "cancelled", label: "Cancelada" },
];

export const actionStatusLabels = Object.fromEntries(
  actionStatusOptions.map((option) => [option.value, option.label]),
) as Record<ActionStatusValue, string>;

export const actionPriorityOptions: Array<{
  value: ActionPriorityValue;
  label: string;
}> = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

export const actionPriorityLabels = Object.fromEntries(
  actionPriorityOptions.map((option) => [option.value, option.label]),
) as Record<ActionPriorityValue, string>;
