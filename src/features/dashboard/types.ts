import type {
  ActionPriorityValue,
  ApplicationStatusValue,
  InterviewFormatValue,
  WorkModeValue,
} from "@/types/database.types";

export type DashboardApplication = {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
  status: ApplicationStatusValue;
  applicationDate: string;
  location: string;
  workMode: WorkModeValue | null;
  nextActionSummary: string;
  followUpDate: string;
};

export type DashboardStatusSummary = {
  status: ApplicationStatusValue;
  label: string;
  value: number;
  percentage: number;
};

export type DashboardInterview = {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
  interviewType: string;
  scheduledAt: string;
  format: InterviewFormatValue;
};

export type DashboardAction = {
  id: string;
  description: string;
  dueDate: string;
  priority: ActionPriorityValue;
  timing: "overdue" | "today" | "upcoming" | "no_date";
  title: string;
  companyName: string;
  companyLogoUrl: string;
};

export type DashboardTrendPoint = {
  key: string;
  label: string;
  value: number;
  percentage: number;
};

export type DashboardActivityKind =
  "application" | "note" | "interview" | "action";

export type DashboardActivity = {
  id: string;
  kind: DashboardActivityKind;
  label: string;
  description: string;
  occurredAt: string;
  href: string;
};

export type DashboardData = {
  stats: {
    totalApplications: number;
    applicationsLast30Days: number;
    activeApplications: number;
    interviewApplications: number;
    overdueActions: number;
    upcomingActions: number;
    upcomingInterviews: number;
    offersReceived: number;
    rejections: number;
    responseRate: number;
    respondedApplications: number;
    sentApplications: number;
    totalCompanies: number;
    companiesWithApplications: number;
  };
  recentApplications: DashboardApplication[];
  pendingActions: DashboardAction[];
  upcomingInterviews: DashboardInterview[];
  statusSummary: DashboardStatusSummary[];
  applicationTrend: DashboardTrendPoint[];
  recentActivity: DashboardActivity[];
};
