import type { ProfileActionState } from "@/features/profile/types";

export const avatarMaxSize = 2 * 1024 * 1024;
export const avatarMimeTypes = ["image/jpeg", "image/png", "image/webp"];

export function validateProfileForm(formData: FormData) {
  const fieldErrors: NonNullable<ProfileActionState["fieldErrors"]> = {};
  const nameValue = formData.get("name");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const avatarValue = formData.get("avatar");
  const avatar =
    avatarValue instanceof File && avatarValue.size > 0 ? avatarValue : null;

  if (!name) {
    fieldErrors.name = "Indica o teu nome.";
  } else if (name.length > 120) {
    fieldErrors.name = "O nome pode ter no máximo 120 caracteres.";
  }

  if (avatar && !avatarMimeTypes.includes(avatar.type)) {
    fieldErrors.avatar = "Escolhe uma imagem JPG, PNG ou WebP.";
  } else if (avatar && avatar.size > avatarMaxSize) {
    fieldErrors.avatar = "A imagem não pode ultrapassar 2 MB.";
  }

  return {
    values: {
      name,
      avatar,
      removeAvatar: formData.get("removeAvatar") === "true",
    },
    fieldErrors,
  };
}

export function hasProfileFieldErrors(
  errors: NonNullable<ProfileActionState["fieldErrors"]>,
) {
  return Object.values(errors).some(Boolean);
}

export async function avatarMatchesMimeType(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  return (
    (file.type === "image/jpeg" && isJpeg) ||
    (file.type === "image/png" && isPng) ||
    (file.type === "image/webp" && isWebp)
  );
}
