import type { RecruiterActionState } from "@/features/recruiters/types";
import { isValidUuid } from "@/lib/validation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const phonePattern = /^[+\d\s()./-]+$/u;

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLinkedInUrl(value: string) {
  if (!value) return { linkedinUrl: "" };
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLocaleLowerCase("en-US");

    if (
      url.protocol !== "https:" ||
      (hostname !== "linkedin.com" && !hostname.endsWith(".linkedin.com"))
    ) {
      return {
        linkedinUrl: "",
        error: "Introduz um endereço válido do LinkedIn.",
      };
    }

    return { linkedinUrl: url.toString() };
  } catch {
    return {
      linkedinUrl: "",
      error: "Introduz um endereço válido do LinkedIn.",
    };
  }
}

export function validateRecruiterForm(formData: FormData) {
  const companyId = readText(formData, "companyId");
  const name = readText(formData, "name");
  const email = readText(formData, "email").toLocaleLowerCase("en-US");
  const phone = readText(formData, "phone");
  const jobTitle = readText(formData, "jobTitle");
  const rawLinkedinUrl = readText(formData, "linkedinUrl");
  const notes = readText(formData, "notes");
  const fieldErrors: NonNullable<RecruiterActionState["fieldErrors"]> = {};

  if (companyId && !isValidUuid(companyId)) {
    fieldErrors.companyId = "Seleciona uma empresa válida.";
  }

  if (!name) {
    fieldErrors.name = "Introduz o nome do contacto.";
  } else if (name.length > 160) {
    fieldErrors.name = "O nome pode ter no máximo 160 caracteres.";
  }

  if (email.length > 254) {
    fieldErrors.email = "O email pode ter no máximo 254 caracteres.";
  } else if (email && !emailPattern.test(email)) {
    fieldErrors.email = "Introduz um email válido.";
  }

  if (phone.length > 50) {
    fieldErrors.phone = "O telefone pode ter no máximo 50 caracteres.";
  } else if (phone && !phonePattern.test(phone)) {
    fieldErrors.phone = "Introduz um número de telefone válido.";
  }

  if (jobTitle.length > 160) {
    fieldErrors.jobTitle = "O cargo pode ter no máximo 160 caracteres.";
  }

  const { linkedinUrl, error: linkedinError } =
    normalizeLinkedInUrl(rawLinkedinUrl);
  if (rawLinkedinUrl.length > 500) {
    fieldErrors.linkedinUrl = "O endereço pode ter no máximo 500 caracteres.";
  } else if (linkedinError) {
    fieldErrors.linkedinUrl = linkedinError;
  }

  if (notes.length > 4000) {
    fieldErrors.notes = "As notas podem ter no máximo 4000 caracteres.";
  }

  return {
    values: {
      company_id: companyId || null,
      name,
      email: email || null,
      phone: phone || null,
      job_title: jobTitle || null,
      linkedin_url: linkedinUrl || null,
      notes: notes || null,
    },
    fieldErrors,
  };
}

export function hasRecruiterFieldErrors(
  fieldErrors: NonNullable<RecruiterActionState["fieldErrors"]>,
) {
  return Object.keys(fieldErrors).length > 0;
}

export function isValidRecruiterId(value: string) {
  return isValidUuid(value);
}
