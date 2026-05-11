/**
 * Supabase client using the service-role key.
 *
 * BYPASSES Row Level Security entirely. Must ONLY be used inside
 * server-only code (API routes, Server Actions) AFTER the request
 * has been authenticated and authorized at the application layer.
 *
 * NEVER import this from Client Components or any module that ships
 * to the browser. The service-role key has full administrative access
 * to the database; leaking it is catastrophic.
 *
 * @see https://supabase.com/docs/guides/api/api-keys
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client authenticated with the service-role key.
 *
 * The client is configured to never persist or refresh sessions —
 * it operates as a stateless administrative caller for a single
 * server-side invocation.
 *
 * @throws Error when `SUPABASE_SERVICE_ROLE_KEY` or
 *         `NEXT_PUBLIC_SUPABASE_URL` is missing from the environment.
 *
 * @example
 * ```ts
 * // app/api/upload/route.ts
 * const admin = createSupabaseAdminClient()
 * await admin.storage.from('eventos').upload(path, buffer)
 * ```
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin configuration: ' +
        'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are both required'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
