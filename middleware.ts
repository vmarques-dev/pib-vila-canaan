import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  // Feature flag: permite bypass do middleware para rollback de emergência
  const useMiddlewareAuth = process.env.NEXT_PUBLIC_USE_MIDDLEWARE_AUTH !== 'false' // Default true

  if (!useMiddlewareAuth) {
    console.warn('⚠️ Middleware auth DESABILITADO via feature flag')
    return NextResponse.next()
  }

  const { supabase, response } = createMiddlewareClient(req)

  const { data: { session } } = await supabase.auth.getSession()

  // Proteger rotas /admin/*
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Se não tem sessão, redirecionar para login
    if (!session) {
      return NextResponse.redirect(new URL('/login/admin', req.url))
    }

    // Verificar role='admin' no user_metadata
    if (session.user.user_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Verificar se está ativo na tabela usuarios_admin
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

  return response
}

export const config = {
  matcher: ['/admin/:path*']
}

