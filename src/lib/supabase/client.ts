import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"

/** Returns null when Supabase env vars aren't configured yet — callers should
 *  treat that as "auth/history is unavailable" rather than throwing. */
export function createClient() {
  const env = getSupabaseEnv()
  if (!env) return null
  return createBrowserClient<Database>(env.url, env.anonKey)
}
