import { ListX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export default function ActionNotFound() {
  return (
    <>
      <title>Ação não encontrada | Job Application Tracker</title>
      <EmptyState
        icon={ListX}
        title="Ação não encontrada"
        description="Esta ação não existe ou já foi eliminada."
        actionLabel="Voltar às ações"
        actionHref="/acoes"
        headingLevel="h1"
      />
    </>
  );
}
