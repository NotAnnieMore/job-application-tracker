const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidNoteId(value: string) {
  return uuidPattern.test(value);
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
