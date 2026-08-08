import type {
  ActionPriorityValue,
  ActionStatusValue,
} from "@/types/database.types";

export type ActionField =
  "applicationId" | "description" | "dueDate" | "status" | "priority";

export type ActionActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ActionField, string>>;
};

export type ActionFormValues = {
  applicationId: string;
  description: string;
  dueDate: string;
  status: ActionStatusValue;
  priority: ActionPriorityValue;
};

export type ActionApplicationOption = {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
};

export type ActionTiming = "overdue" | "today" | "upcoming" | "no_date";
export type ActionDueFilter = ActionTiming;

export type ActionListItem = {
  id: string;
  applicationId: string;
  description: string;
  dueDate: string;
  status: ActionStatusValue;
  priority: ActionPriorityValue;
  completedAt: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
  timing: ActionTiming;
  updatedAt: string;
};

export type ActionListFilters = {
  status?: ActionStatusValue;
  priority?: ActionPriorityValue;
  applicationId?: string;
  timing?: ActionDueFilter;
  dueFrom?: string;
  dueTo?: string;
};

export type ActionListData = {
  items: ActionListItem[];
  today: string;
  summary: {
    pending: number;
    overdue: number;
    dueToday: number;
    completed: number;
  };
};

export type ActionDetails = ActionFormValues & {
  id: string;
};

export const initialActionActionState: ActionActionState = {
  status: "idle",
};

export const emptyActionFormValues: ActionFormValues = {
  applicationId: "",
  description: "",
  dueDate: "",
  status: "pending",
  priority: "medium",
};
