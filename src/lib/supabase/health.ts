import "server-only";

import { getSupabaseConfig } from "@/lib/supabase/config";

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

export async function checkSupabaseHealth() {
  const { url, publishableKey } = getSupabaseConfig();

  const response = await fetch(`${url}/auth/v1/health`, {
    cache: "no-store",
    headers: {
      apikey: publishableKey,
    },
    signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
  });

  return response.ok;
}
