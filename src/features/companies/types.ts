import type { WorkModeValue } from "@/types/database.types";

export type CompanyField =
  | "name"
  | "website"
  | "logoUrl"
  | "location"
  | "industry"
  | "workMode"
  | "notes";

export type CompanyActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<CompanyField, string>>;
};

export type CompanyFormValues = {
  name: string;
  website: string;
  logoUrl: string;
  location: string;
  industry: string;
  workMode: WorkModeValue | "";
  notes: string;
};

export type CompanyListItem = CompanyFormValues & {
  id: string;
  applicationCount: number;
  recruiterCount: number;
};

export type CompanyDetails = CompanyFormValues & {
  id: string;
};

export type CompanyWithoutLogo = {
  id: string;
  name: string;
  website: string;
};

export type CompanyLogoSelection = {
  companyId: string;
  logoUrl: string;
  website: string;
};

export type BulkCompanyLogoActionResult = {
  status: "success" | "error";
  message: string;
  updatedIds: string[];
};

export const initialCompanyActionState: CompanyActionState = {
  status: "idle",
};

export const emptyCompanyFormValues: CompanyFormValues = {
  name: "",
  website: "",
  logoUrl: "",
  location: "",
  industry: "",
  workMode: "",
  notes: "",
};
