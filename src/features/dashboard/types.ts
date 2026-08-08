import type {
  ApplicationStatusValue,
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

export type DashboardFollowUp = {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
  followUpDate: string;
  nextActionSummary: string;
  timing: "overdue" | "today" | "upcoming";
};

export type DashboardStatusSummary = {
  status: ApplicationStatusValue;
  label: string;
  value: number;
  percentage: number;
};

export type DashboardData = {
  today: string;
  stats: {
    totalApplications: number;
    applicationsLast30Days: number;
    activeApplications: number;
    interviewApplications: number;
    overdueFollowUps: number;
    upcomingFollowUps: number;
    totalCompanies: number;
    companiesWithApplications: number;
  };
  recentApplications: DashboardApplication[];
  followUps: DashboardFollowUp[];
  statusSummary: DashboardStatusSummary[];
};
