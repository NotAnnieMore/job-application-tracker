import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database.types";

export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();

  return createBrowserClient<Database>(url, publishableKey);
}
