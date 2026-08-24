import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { getSupabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"

/** Returns null when Supabase env vars aren't configured yet — callers should
 *  treat that as "auth/history is unavailable" rather than throwing. */
export async function createClient() {
  const env = getSupabaseEnv()
  if (!env) return null

  const cookieStore = await cookies()

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component render — middleware refreshes the
          // session on the next request, so this can be safely ignored.
        }
      },
    },
  })
}
