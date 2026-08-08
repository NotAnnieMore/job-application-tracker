import type {
  ApplicationStatusValue,
  WorkModeValue,
} from "@/types/database.types";

export const applicationStatusOptions: Array<{
  value: ApplicationStatusValue;
  label: string;
}> = [
  { value: "interested", label: "Interessado" },
  { value: "applied", label: "Candidatura enviada" },
  { value: "interview_scheduled", label: "Entrevista agendada" },
  { value: "interview_completed", label: "Entrevista concluída" },
  { value: "awaiting_response", label: "A aguardar resposta" },
  { value: "offer_received", label: "Proposta recebida" },
  { value: "rejected", label: "Rejeitada" },
  { value: "withdrawn", label: "Retirada" },
];

export const applicationStatusLabels = Object.fromEntries(
  applicationStatusOptions.map(({ value, label }) => [value, label]),
) as Record<ApplicationStatusValue, string>;

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
