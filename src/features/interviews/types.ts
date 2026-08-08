import type {
  InterviewFormatValue,
  InterviewStatusValue,
} from "@/types/database.types";

export type InterviewField =
  | "applicationId"
  | "recruiterId"
  | "interviewType"
  | "scheduledAtLocal"
  | "status"
  | "format"
  | "durationMinutes"
  | "locationOrUrl"
  | "participants"
  | "preparation"
  | "feedback"
  | "result";

export type InterviewActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<InterviewField, string>>;
};

export type InterviewFormValues = {
  applicationId: string;
  recruiterId: string;
  interviewType: string;
  scheduledAtLocal: string;
  timezoneOffset: string;
  status: InterviewStatusValue;
  format: InterviewFormatValue;
  durationMinutes: string;
  locationOrUrl: string;
  participants: string;
  preparation: string;
  feedback: string;
  result: string;
};

export type InterviewApplicationOption = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string;
  primaryRecruiterId: string;
  interviewPreparation: string;
  questionsForCompany: string;
};

export type InterviewRecruiterOption = {
  id: string;
  name: string;
  companyId: string;
};

export type InterviewListItem = {
  id: string;
  applicationId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
  recruiterName: string;
  interviewType: string;
  scheduledAt: string;
  status: InterviewStatusValue;
  format: InterviewFormatValue;
  durationMinutes: number;
  locationOrUrl: string;
  isUpcoming: boolean;
};

export type InterviewListFilters = {
  status?: InterviewStatusValue;
  applicationId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type InterviewDetails = InterviewFormValues & {
  id: string;
};

export const initialInterviewActionState: InterviewActionState = {
  status: "idle",
};

export const emptyInterviewFormValues: InterviewFormValues = {
  applicationId: "",
  recruiterId: "",
  interviewType: "Entrevista inicial",
  scheduledAtLocal: "",
  timezoneOffset: "0",
  status: "scheduled",
  format: "video",
  durationMinutes: "60",
  locationOrUrl: "",
  participants: "",
  preparation: "",
  feedback: "",
  result: "",
};
