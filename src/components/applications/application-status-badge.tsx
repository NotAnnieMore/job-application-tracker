"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
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
  const t = useTranslations("Enums.applicationStatus");

  return <Badge variant={statusVariants[status]}>{t(status)}</Badge>;
}
