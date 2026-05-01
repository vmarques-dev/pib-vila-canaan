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

  const { data: { session } } = await supabase.auth.getSession()

  // Protect /admin/* routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login/admin', req.url))
    }

    if (session.user.user_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }

    const { data: admin, error: adminError } = await supabase
      .from('usuarios_admin')
      .select('ativo')
      .eq('user_id', session.user.id)
      .single()

    if (adminError || !admin || !admin.ativo) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protect /adorador/* routes
  if (req.nextUrl.pathname.startsWith('/adorador')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login/adorador', req.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/adorador/:path*']
}

