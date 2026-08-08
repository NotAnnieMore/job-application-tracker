import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import type { CurrentUser } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    return null;
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "Sem email";
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_path, updated_at")
    .eq("id", userId)
    .maybeSingle();

  const avatarUrl = profile?.avatar_path
    ? `${supabase.storage.from("avatars").getPublicUrl(profile.avatar_path).data.publicUrl}?v=${encodeURIComponent(profile.updated_at)}`
    : "";

  return {
    id: userId,
    email,
    fullName: profile?.full_name ?? email.split("@")[0] ?? "Utilizador",
    avatarUrl,
  };
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
