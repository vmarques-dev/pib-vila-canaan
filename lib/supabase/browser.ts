/**
 * Cliente Supabase para uso no Browser (Client Components)
 *
 * Este cliente utiliza @supabase/ssr para gerenciar cookies automaticamente,
 * garantindo que a sessão de autenticação seja sincronizada entre:
 * - Client Components (browser)
 * - Server Components
 * - Middleware
 *
 * IMPORTANTE: Use este cliente em vez de `@/lib/supabase/client` para
 * operações de autenticação em Client Components ('use client').
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
 * Cria uma instância do cliente Supabase otimizada para o browser.
 *
 * O `createBrowserClient` do @supabase/ssr gerencia internamente
 * a reutilização da instância (singleton pattern), então é seguro
 * chamar esta função múltiplas vezes.
 *
 * @returns Instância do cliente Supabase configurada para o browser
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
