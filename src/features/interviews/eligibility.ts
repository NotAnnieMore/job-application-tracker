import type { ApplicationStatusValue } from "@/types/database.types";

export const interviewCreationStatuses: ApplicationStatusValue[] = [
  "applied",
  "awaiting_response",
];

export function canCreateInterview(status: ApplicationStatusValue) {
  return interviewCreationStatuses.includes(status);
}
