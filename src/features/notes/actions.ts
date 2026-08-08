"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isValidApplicationId } from "@/features/applications/validation";
import type { NoteActionState } from "@/features/notes/types";
import { isValidNoteId, validateNoteForm } from "@/features/notes/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function detailPath(applicationId: string) {
  return `/candidaturas/${applicationId}`;
}

function validationError(message: string): NoteActionState {
  return {
    status: "error",
    message: "Revê o campo assinalado.",
    fieldErrors: { content: message },
  };
}

function saveError(): NoteActionState {
  return {
    status: "error",
    message: "Não foi possível guardar a nota. Tenta novamente.",
  };
}

async function applicationBelongsToUser(applicationId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function createNoteAction(
  applicationId: string,
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  void _previousState;

  if (!isValidApplicationId(applicationId)) {
    return { status: "error", message: "A candidatura indicada não é válida." };
  }

  const { content, error: contentError } = validateNoteForm(formData);
  if (contentError) return validationError(contentError);

  const user = await requireCurrentUser();
  if (!(await applicationBelongsToUser(applicationId, user.id))) {
    return {
      status: "error",
      message: "A candidatura já não está disponível.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    application_id: applicationId,
    content,
  });

  if (error) return saveError();
  revalidatePath(detailPath(applicationId));
  redirect(`${detailPath(applicationId)}?aviso=nota-criada#notas`);
}

export async function updateNoteAction(
  applicationId: string,
  noteId: string,
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  void _previousState;

  if (!isValidApplicationId(applicationId) || !isValidNoteId(noteId)) {
    return { status: "error", message: "A nota indicada não é válida." };
  }

  const { content, error: contentError } = validateNoteForm(formData);
  if (contentError) return validationError(contentError);

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .update({ content })
    .eq("id", noteId)
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return saveError();
  if (!data) {
    return { status: "error", message: "A nota já não está disponível." };
  }

  revalidatePath(detailPath(applicationId));
  redirect(`${detailPath(applicationId)}?aviso=nota-atualizada#notas`);
}

export async function deleteNoteAction(
  applicationId: string,
  noteId: string,
  _previousState: NoteActionState,
  _formData: FormData,
): Promise<NoteActionState> {
  void _previousState;
  void _formData;

  if (!isValidApplicationId(applicationId) || !isValidNoteId(noteId)) {
    return { status: "error", message: "A nota indicada não é válida." };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("application_id", applicationId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: "Não foi possível eliminar a nota. Tenta novamente.",
    };
  }
  if (!data) {
    return { status: "error", message: "A nota já não está disponível." };
  }

  revalidatePath(detailPath(applicationId));
  redirect(`${detailPath(applicationId)}?aviso=nota-eliminada#notas`);
}
