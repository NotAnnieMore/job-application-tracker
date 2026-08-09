import { ListX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export default function ActionNotFound() {
  return (
    <>
      <title>Tarefa não encontrada | Job Application Tracker</title>
      <EmptyState
        icon={ListX}
        title="Tarefa não encontrada"
        description="Esta tarefa não existe ou já foi eliminada."
        actionLabel="Voltar às tarefas"
        actionHref="/acoes"
        headingLevel="h1"
      />
    </>
  );
}
