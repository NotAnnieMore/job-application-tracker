import type {
  ApplicationStatusValue,
  WorkModeValue,
} from "@/types/database.types";

export const applicationStatusOptions: Array<{
  value: ApplicationStatusValue;
  label: string;
}> = [
  { value: "applied", label: "Candidatura enviada" },
  { value: "interview_scheduled", label: "Entrevista agendada" },
  { value: "awaiting_response", label: "A aguardar resposta" },
  { value: "offer_received", label: "Proposta recebida" },
  { value: "rejected", label: "Rejeitada" },
  { value: "withdrawn", label: "Retirada" },
];

export const applicationStatusLabels: Record<ApplicationStatusValue, string> = {
  interested: "Candidatura enviada",
  applied: "Candidatura enviada",
  interview_scheduled: "Entrevista agendada",
  interview_completed: "A aguardar resposta",
  awaiting_response: "A aguardar resposta",
  offer_received: "Proposta recebida",
  rejected: "Rejeitada",
  withdrawn: "Retirada",
};

export function normalizeApplicationStatus(
  status: ApplicationStatusValue,
): ApplicationStatusValue {
  if (status === "interested") return "applied";
  if (status === "interview_completed") return "awaiting_response";
  return status;
}

export const workModeOptions: Array<{
  value: WorkModeValue;
  label: string;
}> = [
  { value: "remote", label: "Remoto" },
  { value: "hybrid", label: "Híbrido" },
  { value: "onsite", label: "Presencial" },
];

export const workModeLabels = Object.fromEntries(
  workModeOptions.map(({ value, label }) => [value, label]),
) as Record<WorkModeValue, string>;
