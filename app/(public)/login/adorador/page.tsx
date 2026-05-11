'use client'

export const dynamic = 'force-dynamic'

import { useState, FormEvent, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Worshiper (church-member) login page.
 *
 * Implements simple email/password authentication for registered
 * members. Unlike the admin login, no extra role or table-membership
 * checks are required.
 *
 * On successful authentication, redirects to the home page (/). Also
 * offers links to password recovery and new-member sign-up.
 *
 * @see {@link file://../../../../lib/supabase/browser.ts} Supabase client used here
 * @see {@link file://../admin/page.tsx} Admin login (with additional checks)
 */
export default function LoginAdoradorPage() {
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Handles the login form submission.
   *
   * Authenticates the user via Supabase Auth; on success, refreshes
   * cookies through `router.refresh()` and redirects to the home page.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      if (data.user) {
        const nome = data.user.user_metadata?.nome
        toast.success(`Seja bem-vindo${nome ? `, ${nome}` : ''}!`)
        router.refresh()
        router.push('/adorador/dashboard')
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Área do Membro</h1>
          <p className="text-gray-600 text-sm">Faça login para acessar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center space-y-2 pt-4 border-t border-gray-200">
            <Link
              href="/esqueci-senha"
              className="text-sm text-gray-600 hover:text-blue-600 hover:underline block"
            >
              Esqueci minha senha
            </Link>
            <p className="text-sm text-gray-600">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-blue-600 hover:underline font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
