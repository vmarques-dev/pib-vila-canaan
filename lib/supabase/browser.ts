/**
 * Supabase client for use in the browser (Client Components).
 *
 * This client uses @supabase/ssr to manage cookies automatically,
 * keeping the auth session in sync across:
 * - Client Components (browser)
 * - Server Components
 * - Middleware
 *
 * IMPORTANT: prefer this client over `@/lib/supabase/client` for auth
 * operations in Client Components ('use client').
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useMemo } from 'react'
 * import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
 *
 * export default function MyComponent() {
 *   const supabase = useMemo(() => createSupabaseBrowserClient(), [])
 *   // ...
 * }
 * ```
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client instance optimized for the browser.
 *
 * `createBrowserClient` from @supabase/ssr internally reuses the
 * instance (singleton pattern), so it's safe to call this function
 * multiple times.
 *
 * @returns Supabase client instance configured for the browser
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
