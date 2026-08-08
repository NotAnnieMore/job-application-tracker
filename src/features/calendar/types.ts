import type { ActionPriorityValue } from "@/types/database.types";

export type AgendaItemKind = "interview" | "follow_up" | "action";
export type AgendaPeriod = "all" | "overdue" | "today" | "next_7" | "next_30";
export type AgendaTiming = "overdue" | "today" | "upcoming";

export type AgendaFilters = {
  kind?: AgendaItemKind;
  period?: AgendaPeriod;
};

export type AgendaItem = {
  id: string;
  kind: AgendaItemKind;
  applicationId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
  description: string;
  date: string;
  scheduledAt: string;
  priority?: ActionPriorityValue;
  timing: AgendaTiming;
  href: string;
};

export type AgendaData = {
  today: string;
  items: AgendaItem[];
  summary: {
    overdue: number;
    today: number;
    nextSevenDays: number;
    unscheduledActions: number;
  };
};
