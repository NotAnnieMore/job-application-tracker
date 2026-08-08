import type {
  InterviewFormatValue,
  InterviewStatusValue,
} from "@/types/database.types";

export const interviewStatusOptions: Array<{
  value: InterviewStatusValue;
  label: string;
}> = [
  { value: "scheduled", label: "Agendada" },
  { value: "completed", label: "Concluída" },
  { value: "cancelled", label: "Cancelada" },
];

export const interviewStatusLabels = Object.fromEntries(
  interviewStatusOptions.map((option) => [option.value, option.label]),
) as Record<InterviewStatusValue, string>;

export const interviewFormatOptions: Array<{
  value: InterviewFormatValue;
  label: string;
}> = [
  { value: "video", label: "Videochamada" },
  { value: "phone", label: "Telefone" },
  { value: "onsite", label: "Presencial" },
  { value: "other", label: "Outro" },
];

export const interviewFormatLabels = Object.fromEntries(
  interviewFormatOptions.map((option) => [option.value, option.label]),
) as Record<InterviewFormatValue, string>;

export const commonInterviewTypes = [
  "Entrevista inicial",
  "Entrevista de RH",
  "Entrevista técnica",
  "Live coding",
  "Entrevista com manager",
  "Entrevista de cultura",
  "Entrevista final",
];
