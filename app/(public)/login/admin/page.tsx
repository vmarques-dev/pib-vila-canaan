'use client'

import { useState, FormEvent, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { logger } from '@/lib/logger'

/**
 * Página de login para administradores
 *
 * Implementa autenticação com verificação em três camadas:
 * 1. Credenciais válidas (email/senha)
 * 2. Role 'admin' no user_metadata do Supabase Auth
 * 3. Registro ativo na tabela usuarios_admin
 *
 * Após autenticação bem-sucedida, redireciona para /admin/dashboard.
 * Em caso de falha em qualquer camada, exibe mensagem de erro apropriada
 * e realiza logout para limpar sessão parcial.
 *
 * @see {@link file://../../../../lib/supabase/browser.ts} Cliente Supabase utilizado
 * @see {@link file://../../../../middleware.ts} Middleware que protege rotas /admin/*
 */
export default function LoginAdminPage() {
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Processa o envio do formulário de login
   *
   * Executa as três verificações de segurança em sequência.
   * Se todas passarem, atualiza os cookies via router.refresh()
   * e redireciona para o dashboard administrativo.
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
        logger.error('Falha no login admin', signInError, { context: 'admin-auth' })
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      if (data.user) {
        // Verificação 1: Tem role admin?
        if (data.user.user_metadata?.role !== 'admin') {
          logger.error('Tentativa de login sem role admin', null, { context: 'admin-auth' })
          setError('Usuário não é administrador')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        // Verificação 2: Está na tabela usuarios_admin?
        const { data: admin, error: adminError } = await supabase
          .from('usuarios_admin')
          .select('id, ativo')
          .eq('user_id', data.user.id)
          .single()

        if (adminError || !admin) {
          logger.error('Admin não encontrado na tabela usuarios_admin', adminError, { context: 'admin-auth' })
          setError('Usuário não cadastrado como administrador')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        // Verificação 3: Está ativo?
        if (!admin.ativo) {
          logger.error('Tentativa de login com admin inativo', null, { context: 'admin-auth' })
          setError('Usuário administrador inativo')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        router.refresh()
        router.push('/admin/dashboard')
      }
    } catch (err) {
      logger.error('Erro inesperado no login admin', err as Error, { context: 'admin-auth' })
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Acesse o painel administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="admin@example.com"
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
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
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
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
