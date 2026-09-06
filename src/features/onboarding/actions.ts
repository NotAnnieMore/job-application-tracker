"use server";

import { CURRENT_ONBOARDING_VERSION } from "@/features/onboarding/config";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboardingAction(): Promise<{
  success: boolean;
}> {
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ onboarding_version: CURRENT_ONBOARDING_VERSION })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  return { success: !error && Boolean(data) };
}
