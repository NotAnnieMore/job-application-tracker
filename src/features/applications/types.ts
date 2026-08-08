import type {
  ApplicationStatusValue,
  WorkModeValue,
} from "@/types/database.types";

export type ApplicationField =
  | "companyId"
  | "title"
  | "location"
  | "workMode"
  | "employmentType"
  | "salaryMin"
  | "salaryMax"
  | "currency"
  | "jobUrl"
  | "skills"
  | "opportunitySummary"
  | "status"
  | "applicationDate"
  | "source"
  | "expectedSalary"
  | "summaryNotes"
  | "nextActionSummary"
  | "followUpDate"
  | "interviewPreparation"
  | "questionsForCompany";

export type ApplicationActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ApplicationField, string>>;
};

export type ApplicationFormValues = {
  companyId: string;
  title: string;
  location: string;
  workMode: WorkModeValue | "";
  employmentType: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  jobUrl: string;
  skills: string;
  opportunitySummary: string;
  status: ApplicationStatusValue;
  applicationDate: string;
  source: string;
  expectedSalary: string;
  summaryNotes: string;
  nextActionSummary: string;
  followUpDate: string;
  interviewPreparation: string;
  questionsForCompany: string;
};

export type CompanyOption = {
  id: string;
  name: string;
};

export type ApplicationListItem = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string;
  status: ApplicationStatusValue;
  applicationDate: string;
  location: string;
  workMode: WorkModeValue | null;
  nextActionSummary: string;
  followUpDate: string;
  recruiterName: string;
};

export type ApplicationListFilters = {
  query?: string;
  status?: ApplicationStatusValue;
  companyId?: string;
  workMode?: WorkModeValue;
  sort?: "newest" | "oldest" | "follow_up";
};

export type ApplicationDetails = ApplicationFormValues & {
  id: string;
};

export const initialApplicationActionState: ApplicationActionState = {
  status: "idle",
};

export function createEmptyApplicationFormValues(): ApplicationFormValues {
  return {
    companyId: "",
    title: "",
    location: "",
    workMode: "",
    employmentType: "",
    salaryMin: "",
    salaryMax: "",
    currency: "EUR",
    jobUrl: "",
    skills: "",
    opportunitySummary: "",
    status: "applied",
    applicationDate: new Date().toISOString().slice(0, 10),
    source: "LinkedIn",
    expectedSalary: "",
    summaryNotes: "",
    nextActionSummary: "",
    followUpDate: "",
    interviewPreparation: "",
    questionsForCompany: "",
  };
}
