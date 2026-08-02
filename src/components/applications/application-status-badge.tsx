import { Badge } from "@/components/ui/badge";

export type ApplicationStatus =
  | "Interessado"
  | "Candidatura enviada"
  | "Entrevista agendada"
  | "Entrevista concluída"
  | "A aguardar resposta"
  | "Proposta recebida"
  | "Rejeitada"
  | "Retirada";

const statusVariants = {
  Interessado: "neutral",
  "Candidatura enviada": "blue",
  "Entrevista agendada": "purple",
  "Entrevista concluída": "purple",
  "A aguardar resposta": "amber",
  "Proposta recebida": "green",
  Rejeitada: "red",
  Retirada: "neutral",
} as const;

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  return <Badge variant={statusVariants[status]}>{status}</Badge>;
}
