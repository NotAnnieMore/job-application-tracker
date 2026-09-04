import type messages from "../../../messages/en-GB.json";
import type { RecruiterActionState } from "@/features/recruiters/types";
import { isValidUuid } from "@/lib/validation";

type ValidationTranslator = (
  key: keyof typeof messages.RecruiterValidation,
) => string;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const phonePattern = /^[+\d\s()./-]+$/u;

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLinkedInUrl(value: string, t: ValidationTranslator) {
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
        error: t("invalidLinkedin"),
      };
    }

    return { linkedinUrl: url.toString() };
  } catch {
    return {
      linkedinUrl: "",
      error: t("invalidLinkedin"),
    };
  }
}

export function validateRecruiterForm(
  formData: FormData,
  t: ValidationTranslator,
) {
  const companyId = readText(formData, "companyId");
  const name = readText(formData, "name");
  const email = readText(formData, "email").toLocaleLowerCase("en-US");
  const phone = readText(formData, "phone");
  const jobTitle = readText(formData, "jobTitle");
  const rawLinkedinUrl = readText(formData, "linkedinUrl");
  const notes = readText(formData, "notes");
  const fieldErrors: NonNullable<RecruiterActionState["fieldErrors"]> = {};

  if (companyId && !isValidUuid(companyId)) {
    fieldErrors.companyId = t("invalidCompany");
  }

  if (!name) {
    fieldErrors.name = t("requiredName");
  } else if (name.length > 160) {
    fieldErrors.name = t("nameLength");
  }

  if (email.length > 254) {
    fieldErrors.email = t("emailLength");
  } else if (email && !emailPattern.test(email)) {
    fieldErrors.email = t("invalidEmail");
  }

  if (phone.length > 50) {
    fieldErrors.phone = t("phoneLength");
  } else if (phone && !phonePattern.test(phone)) {
    fieldErrors.phone = t("invalidPhone");
  }

  if (jobTitle.length > 160) {
    fieldErrors.jobTitle = t("jobTitleLength");
  }

  const { linkedinUrl, error: linkedinError } = normalizeLinkedInUrl(
    rawLinkedinUrl,
    t,
  );
  if (rawLinkedinUrl.length > 500) {
    fieldErrors.linkedinUrl = t("linkedinLength");
  } else if (linkedinError) {
    fieldErrors.linkedinUrl = linkedinError;
  }

  if (notes.length > 4000) {
    fieldErrors.notes = t("notesLength");
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
