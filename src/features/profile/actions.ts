"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ProfileActionState } from "@/features/profile/types";
import {
  avatarMatchesMimeType,
  hasProfileFieldErrors,
  validateProfileForm,
} from "@/features/profile/validation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const { values, fieldErrors } = validateProfileForm(formData);

  if (hasProfileFieldErrors(fieldErrors)) {
    return {
      status: "error",
      message: "Revê os campos assinalados.",
      fieldErrors,
    };
  }

  if (values.avatar && !(await avatarMatchesMimeType(values.avatar))) {
    return {
      status: "error",
      message: "Revê os campos assinalados.",
      fieldErrors: {
        avatar: "O ficheiro não corresponde a uma imagem válida.",
      },
    };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const avatarPath = `${user.id}/avatar`;
  let nextAvatarPath: string | null | undefined;

  if (values.avatar) {
    const { error } = await supabase.storage
      .from("avatars")
      .upload(avatarPath, await values.avatar.arrayBuffer(), {
        cacheControl: "3600",
        contentType: values.avatar.type,
        upsert: true,
      });

    if (error) {
      return {
        status: "error",
        message: "Não foi possível guardar a fotografia. Tenta novamente.",
      };
    }

    nextAvatarPath = avatarPath;
  } else if (values.removeAvatar) {
    const { error } = await supabase.storage
      .from("avatars")
      .remove([avatarPath]);

    if (error) {
      return {
        status: "error",
        message: "Não foi possível remover a fotografia. Tenta novamente.",
      };
    }

    nextAvatarPath = null;
  }

  const profileValues =
    nextAvatarPath === undefined
      ? { full_name: values.name }
      : { full_name: values.name, avatar_path: nextAvatarPath };
  const { data, error } = await supabase
    .from("profiles")
    .update(profileValues)
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message: "Não foi possível guardar o perfil. Tenta novamente.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/definicoes?estado=perfil-atualizado");
}
