import { Badge } from "@/components/ui/badge";
import {
  actionPriorityLabels,
  actionStatusLabels,
} from "@/features/actions/constants";
import type {
  ActionPriorityValue,
  ActionStatusValue,
} from "@/types/database.types";

const statusVariants: Record<ActionStatusValue, "blue" | "green" | "neutral"> =
  {
    pending: "blue",
    completed: "green",
    cancelled: "neutral",
  };

const priorityVariants: Record<
  ActionPriorityValue,
  "neutral" | "amber" | "red"
> = {
  low: "neutral",
  medium: "amber",
  high: "red",
};

export function ActionStatusBadge({ status }: { status: ActionStatusValue }) {
  return (
    <Badge variant={statusVariants[status]}>{actionStatusLabels[status]}</Badge>
  );
}

export function ActionPriorityBadge({
  priority,
}: {
  priority: ActionPriorityValue;
}) {
  return (
    <Badge variant={priorityVariants[priority]}>
      Prioridade {actionPriorityLabels[priority].toLocaleLowerCase("pt-PT")}
    </Badge>
  );
}
