"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
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
  const t = useTranslations("Enums.interviewStatus");

  return <Badge variant={variants[status]}>{t(status)}</Badge>;
}
