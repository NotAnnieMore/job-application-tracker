import { CalendarX2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export default function InterviewNotFound() {
  return (
    <EmptyState
      icon={CalendarX2}
      title="Entrevista não encontrada"
      description="Esta entrevista não existe ou já foi eliminada."
      actionLabel="Voltar às entrevistas"
      actionHref="/entrevistas"
    />
  );
}
