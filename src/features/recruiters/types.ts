export type RecruiterField =
  | "companyId"
  | "name"
  | "email"
  | "phone"
  | "jobTitle"
  | "linkedinUrl"
  | "notes";

export type RecruiterActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<RecruiterField, string>>;
};

export type RecruiterFormValues = {
  companyId: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  linkedinUrl: string;
  notes: string;
};

export type RecruiterCompanyOption = {
  id: string;
  name: string;
};

export type RecruiterListItem = RecruiterFormValues & {
  id: string;
  companyName: string;
  companyLogoUrl: string;
  applicationCount: number;
};

export type RecruiterDetails = RecruiterFormValues & {
  id: string;
};

export type RecruiterListFilters = {
  query?: string;
  companyId?: string;
};

export const initialRecruiterActionState: RecruiterActionState = {
  status: "idle",
};

export const emptyRecruiterFormValues: RecruiterFormValues = {
  companyId: "",
  name: "",
  email: "",
  phone: "",
  jobTitle: "",
  linkedinUrl: "",
  notes: "",
};
