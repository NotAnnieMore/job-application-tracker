import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function AgendaLoading() {
  return (
    <PageSkeleton
      title="Agenda"
      description="Entrevistas, follow-ups e tarefas reunidos numa vista cronológica."
    />
  );
}
