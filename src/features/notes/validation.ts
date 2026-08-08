import { isValidUuid } from "@/lib/validation";

export function isValidNoteId(value: string) {
  return isValidUuid(value);
}

export function validateNoteForm(formData: FormData) {
  const content = formData.get("content")?.toString().trim() ?? "";
  let error: string | undefined;

  if (!content) {
    error = "Escreve o conteúdo da nota.";
  } else if (content.length > 5000) {
    error = "A nota não pode ultrapassar 5000 caracteres.";
  }

  return { content, error };
}
