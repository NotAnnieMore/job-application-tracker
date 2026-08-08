import { Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export default function RecruiterNotFound() {
  return (
    <>
      <title>Contacto não encontrado | Job Application Tracker</title>
      <EmptyState
        icon={Users}
        title="Contacto não encontrado"
        description="Este contacto não existe ou já foi eliminado."
        actionLabel="Voltar aos contactos"
        actionHref="/recrutadores"
        headingLevel="h1"
      />
    </>
  );
}
