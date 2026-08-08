import type { WorkModeValue } from "@/types/database.types";

export type CompanyField =
  "name" | "website" | "location" | "industry" | "workMode" | "notes";

export type CompanyActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<CompanyField, string>>;
};

export type CompanyFormValues = {
  name: string;
  website: string;
  location: string;
  industry: string;
  workMode: WorkModeValue | "";
  notes: string;
};

export type CompanyListItem = CompanyFormValues & {
  id: string;
  applicationCount: number;
};

export type CompanyDetails = CompanyFormValues & {
  id: string;
};

export const initialCompanyActionState: CompanyActionState = {
  status: "idle",
};

export const emptyCompanyFormValues: CompanyFormValues = {
  name: "",
  website: "",
  location: "",
  industry: "",
  workMode: "",
  notes: "",
};
