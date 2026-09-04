"use client";

import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
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
  const t = useTranslations("Enums.taskStatus");

  return <Badge variant={statusVariants[status]}>{t(status)}</Badge>;
}

export function ActionPriorityBadge({
  priority,
}: {
  priority: ActionPriorityValue;
}) {
  const locale = useLocale();
  const t = useTranslations("Enums");

  return (
    <Badge variant={priorityVariants[priority]}>
      {t("taskPriorityLabel", {
        priority: t(`taskPriority.${priority}`).toLocaleLowerCase(locale),
      })}
    </Badge>
  );
}
