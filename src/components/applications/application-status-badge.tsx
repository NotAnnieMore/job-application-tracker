import { Badge } from "@/components/ui/badge";
import { applicationStatusLabels } from "@/features/applications/constants";
import type { ApplicationStatusValue } from "@/types/database.types";

const statusVariants = {
  interested: "neutral",
  applied: "blue",
  interview_scheduled: "purple",
  interview_completed: "amber",
  awaiting_response: "amber",
  offer_received: "green",
  rejected: "red",
  withdrawn: "neutral",
} as const;

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatusValue;
}) {
  return (
    <Badge variant={statusVariants[status]}>
      {applicationStatusLabels[status]}
    </Badge>
  );
}
