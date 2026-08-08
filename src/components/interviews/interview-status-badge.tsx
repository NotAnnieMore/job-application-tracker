import { Badge } from "@/components/ui/badge";
import { interviewStatusLabels } from "@/features/interviews/constants";
import type { InterviewStatusValue } from "@/types/database.types";

const variants: Record<InterviewStatusValue, "blue" | "green" | "neutral"> = {
  scheduled: "blue",
  completed: "green",
  cancelled: "neutral",
};

export function InterviewStatusBadge({
  status,
}: {
  status: InterviewStatusValue;
}) {
  return (
    <Badge variant={variants[status]}>{interviewStatusLabels[status]}</Badge>
  );
}
