import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { logger } from '@/lib/logger'

export async function middleware(req: NextRequest) {
  // Feature flag: allows bypassing the middleware for an emergency rollback
  const useMiddlewareAuth = process.env.NEXT_PUBLIC_USE_MIDDLEWARE_AUTH !== 'false' // Default true

  if (!useMiddlewareAuth) {
    logger.warn('Middleware auth DESABILITADO via feature flag')
    return NextResponse.next()
  }

  const { supabase, response } = createMiddlewareClient(req)

  // Use getUser() rather than getSession(): getUser() revalidates the
  // JWT against the Supabase Auth server on every request, while
  // getSession() only reads the cookie locally and would accept a
  // forged or stale token. The extra round trip is the cost of trust.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /admin/* routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login/admin', req.url))
    }

    if (user.user_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }

    const { data: admin, error: adminError } = await supabase
      .from('usuarios_admin')
      .select('ativo')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError || !admin || !admin.ativo) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protect /adorador/* routes
  if (req.nextUrl.pathname.startsWith('/adorador')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login/adorador', req.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/adorador/:path*'],
}
