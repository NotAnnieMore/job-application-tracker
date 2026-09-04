import type messages from "../../../messages/en-GB.json";
type ValidationTranslator = (
  key: keyof typeof messages.NoteValidation,
  values?: Record<string, string | number>,
) => string;
import { isValidUuid } from "@/lib/validation";

export function isValidNoteId(value: string) {
  return isValidUuid(value);
}

export function validateNoteForm(formData: FormData, t: ValidationTranslator) {
  const content = formData.get("content")?.toString().trim() ?? "";
  let error: string | undefined;

  if (!content) {
    error = t("requiredContent");
  } else if (content.length > 5000) {
    error = t("contentLength");
  }

  return { content, error };
}
