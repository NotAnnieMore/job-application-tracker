import type { CompanyActionState } from "@/features/companies/types";
import type { WorkModeValue } from "@/types/database.types";

const workModes = new Set<WorkModeValue>(["onsite", "hybrid", "remote"]);

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeWebsite(value: string) {
  if (!value) return { website: "" };

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);

    if (!url.hostname || !["http:", "https:"].includes(url.protocol)) {
      return { website: "", error: "Introduz um endereço web válido." };
    }

    return { website: url.toString() };
  } catch {
    return { website: "", error: "Introduz um endereço web válido." };
  }
}

function normalizeLogoUrl(value: string) {
  if (!value) return { logoUrl: "" };

  try {
    const url = new URL(value);

    if (!url.hostname || url.protocol !== "https:") {
      return {
        logoUrl: "",
        error: "O endereço do logótipo tem de começar por https://.",
      };
    }

    return { logoUrl: url.toString() };
  } catch {
    return { logoUrl: "", error: "Introduz um endereço de imagem válido." };
  }
}

export function validateCompanyForm(formData: FormData) {
  const name = readText(formData, "name");
  const rawWebsite = readText(formData, "website");
  const rawLogoUrl = readText(formData, "logoUrl");
  const location = readText(formData, "location");
  const industry = readText(formData, "industry");
  const rawWorkMode = readText(formData, "workMode");
  const notes = readText(formData, "notes");
  const fieldErrors: NonNullable<CompanyActionState["fieldErrors"]> = {};

  if (!name) {
    fieldErrors.name = "Introduz o nome da empresa.";
  } else if (name.length > 160) {
    fieldErrors.name = "O nome pode ter no máximo 160 caracteres.";
  }

  const { website, error: websiteError } = normalizeWebsite(rawWebsite);
  if (rawWebsite.length > 500) {
    fieldErrors.website = "O endereço pode ter no máximo 500 caracteres.";
  } else if (websiteError) {
    fieldErrors.website = websiteError;
  }

  const { logoUrl, error: logoUrlError } = normalizeLogoUrl(rawLogoUrl);
  if (rawLogoUrl.length > 1000) {
    fieldErrors.logoUrl = "O endereço pode ter no máximo 1000 caracteres.";
  } else if (logoUrlError) {
    fieldErrors.logoUrl = logoUrlError;
  }

  if (location.length > 160) {
    fieldErrors.location = "A localização pode ter no máximo 160 caracteres.";
  }

  if (industry.length > 160) {
    fieldErrors.industry = "O setor pode ter no máximo 160 caracteres.";
  }

  if (notes.length > 4000) {
    fieldErrors.notes = "As notas podem ter no máximo 4000 caracteres.";
  }

  let workMode: WorkModeValue | null = null;
  if (rawWorkMode) {
    if (workModes.has(rawWorkMode as WorkModeValue)) {
      workMode = rawWorkMode as WorkModeValue;
    } else {
      fieldErrors.workMode = "Seleciona uma modalidade válida.";
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
