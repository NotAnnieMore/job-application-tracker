import type messages from "../../../messages/en-GB.json";
import type { CompanyActionState } from "@/features/companies/types";
import type { WorkModeValue } from "@/types/database.types";

type ValidationTranslator = (
  key: keyof typeof messages.CompanyValidation,
) => string;

const workModes = new Set<WorkModeValue>(["onsite", "hybrid", "remote"]);

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeWebsite(value: string, t: ValidationTranslator) {
  if (!value) return { website: "" };

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);

    if (!url.hostname || !["http:", "https:"].includes(url.protocol)) {
      return { website: "", error: t("invalidWebsite") };
    }

    return { website: url.toString() };
  } catch {
    return { website: "", error: t("invalidWebsite") };
  }
}

function normalizeLogoUrl(value: string, t: ValidationTranslator) {
  if (!value) return { logoUrl: "" };

  try {
    const url = new URL(value);

    if (!url.hostname || url.protocol !== "https:") {
      return {
        logoUrl: "",
        error: t("httpsLogo"),
      };
    }

    return { logoUrl: url.toString() };
  } catch {
    return { logoUrl: "", error: t("invalidLogo") };
  }
}

export function validateCompanyForm(
  formData: FormData,
  t: ValidationTranslator,
) {
  const name = readText(formData, "name");
  const rawWebsite = readText(formData, "website");
  const rawLogoUrl = readText(formData, "logoUrl");
  const location = readText(formData, "location");
  const industry = readText(formData, "industry");
  const rawWorkMode = readText(formData, "workMode");
  const notes = readText(formData, "notes");
  const fieldErrors: NonNullable<CompanyActionState["fieldErrors"]> = {};

  if (!name) {
    fieldErrors.name = t("requiredName");
  } else if (name.length > 160) {
    fieldErrors.name = t("nameLength");
  }

  const { website, error: websiteError } = normalizeWebsite(rawWebsite, t);
  if (rawWebsite.length > 500) {
    fieldErrors.website = t("websiteLength");
  } else if (websiteError) {
    fieldErrors.website = websiteError;
  }

  const { logoUrl, error: logoUrlError } = normalizeLogoUrl(rawLogoUrl, t);
  if (rawLogoUrl.length > 1000) {
    fieldErrors.logoUrl = t("logoLength");
  } else if (logoUrlError) {
    fieldErrors.logoUrl = logoUrlError;
  }

  if (location.length > 160) {
    fieldErrors.location = t("locationLength");
  }

  if (industry.length > 160) {
    fieldErrors.industry = t("industryLength");
  }

  if (notes.length > 4000) {
    fieldErrors.notes = t("notesLength");
  }

  let workMode: WorkModeValue | null = null;
  if (rawWorkMode) {
    if (workModes.has(rawWorkMode as WorkModeValue)) {
      workMode = rawWorkMode as WorkModeValue;
    } else {
      fieldErrors.workMode = t("invalidWorkMode");
    }
  }

  return {
    values: {
      name,
      website: website || null,
      logo_url: logoUrl || null,
      location: location || null,
      industry: industry || null,
      work_mode: workMode,
      notes: notes || null,
    },
    fieldErrors,
  };
}

export function hasCompanyFieldErrors(
  fieldErrors: NonNullable<CompanyActionState["fieldErrors"]>,
) {
  return Object.keys(fieldErrors).length > 0;
}
