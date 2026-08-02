import { Plus, Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export default function RecruitersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recrutadores"
        description="Guarda os contactos envolvidos em cada processo."
        action={
          <Button>
            <Plus aria-hidden="true" className="size-4" />
            Novo recrutador
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        title="Ainda não existem recrutadores"
        description="Quando adicionares um contacto, poderás associá-lo a uma empresa e às respetivas candidaturas."
        actionLabel="Adicionar recrutador"
      />
    </div>
  );
}
