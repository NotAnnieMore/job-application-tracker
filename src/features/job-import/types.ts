import type { WorkModeValue } from "@/types/database.types";

export type ImportedJobData = {
  jobUrl: string;
  title: string;
  companyName: string;
  companyWebsite: string;
  companyLogoUrl: string;
  location: string;
  workMode: WorkModeValue | "";
  employmentType: string;
  description: string;
  source: string;
};

export type JobImportResponse = {
  data?: ImportedJobData;
  message?: string;
  warnings?: string[];
};
