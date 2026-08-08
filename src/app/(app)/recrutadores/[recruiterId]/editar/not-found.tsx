import { Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export default function RecruiterNotFound() {
  return (
    <EmptyState
      icon={Users}
      title="Contacto não encontrado"
      description="Este contacto não existe ou já foi eliminado."
      actionLabel="Voltar aos contactos"
      actionHref="/recrutadores"
    />
  );
}
