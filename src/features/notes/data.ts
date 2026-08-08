import "server-only";

import type { ApplicationNote } from "@/features/notes/types";
import { isValidApplicationId } from "@/features/applications/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function getApplicationNotes(
  applicationId: string,
): Promise<ApplicationNote[]> {
  if (!isValidApplicationId(applicationId)) return [];

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("id, application_id, content, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível consultar as notas da candidatura.");
  }

  return data.map((note) => ({
    id: note.id,
    applicationId: note.application_id,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  }));
}
