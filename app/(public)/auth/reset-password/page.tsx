'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'

/**
 * Password-reset landing page.
 *
 * Receives the user after they click the recovery link in the email.
 * The Supabase JS SDK picks up the recovery token from the URL hash
 * automatically (`detectSessionInUrl: true`, which is the default in
 * `createBrowserClient`), so by the time the React tree mounts the
 * temporary recovery session is already in place.
 *
 * Possible states:
 *
 * - `loading` — waiting for Supabase to confirm the recovery session
 * - `error`   — the link expired, was already used, or no session is
 *               available; user is invited back to `/esqueci-senha`
 * - `ready`   — recovery session is valid; show the new-password form
 * - `success` — password was updated; brief flash before redirecting
 *               to the login page
 *
 * After the password is successfully updated we sign the user out so
 * that the new credentials are required on the next sign-in.
 */
type Status = 'loading' | 'ready' | 'error' | 'success'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    /**
     * Supabase returns error context in two places when the recovery
     * link is no longer valid: a query string and a URL fragment.
     * We inspect both to surface a clear message to the user.
     */
    function extractErrorFromUrl(): { code: string | null; description: string | null } {
      const search = new URLSearchParams(window.location.search)
      const hash = window.location.hash.startsWith('#')
        ? new URLSearchParams(window.location.hash.slice(1))
        : new URLSearchParams()

      const code = search.get('error_code') ?? hash.get('error_code')
      const description = search.get('error_description') ?? hash.get('error_description')

      return { code, description }
    }

    const { code, description } = extractErrorFromUrl()

    if (code) {
      const message =
        code === 'otp_expired'
          ? 'Este link expirou. Solicite um novo link de recuperação.'
          : 'Link de recuperação inválido. Solicite um novo link.'
      logger.warn('Password recovery landing with error', { code, description })
      // TODO(phase-4): rework this state setup using TanStack Query / SWR or
      // a useState lazy initializer once the data-layer migration lands. This
      // synchronous setState lives here because the URL hash is only readable
      // on the client and we want a single mount to drive the whole flow.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMessage(message)

      setStatus('error')
      return
    }

    /**
     * The recovery session usually arrives via a `PASSWORD_RECOVERY`
     * event fired by `onAuthStateChange`. We also check the current
     * session synchronously so direct access without a fresh hash
     * still resolves to a clear "invalid access" state.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setStatus('ready')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('ready')
      } else {
        // The user landed here without a valid recovery session.
        // Could be direct access, a reload that wiped the URL hash,
        // or a malformed link.
        setStatus((current) => {
          if (current === 'loading') {
            setErrorMessage(
              'Acesso inválido. Use o link enviado por e-mail para redefinir sua senha.'
            )
            return 'error'
          }
          return current
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }

    if (password !== confirmPassword) {
      setFormError('As senhas não conferem.')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      logger.error('Failed to update password during recovery', error, {
        context: 'reset-password',
      })
      setFormError('Não foi possível redefinir a senha. Tente novamente.')
      setSubmitting(false)
      return
    }

    setStatus('success')
    toast.success('Senha redefinida com sucesso!')

    // Drop the recovery session so the new password is required on
    // the next sign-in.
    await supabase.auth.signOut()
    router.push('/login/adorador')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <Link
          href="/login/adorador"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para o login
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nova senha</h1>
        </div>

        {status === 'loading' && (
          <div className="mt-8 flex flex-col items-center gap-3 py-8" aria-live="polite">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-sm text-gray-600">Validando seu link de recuperação...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 space-y-4">
            <div
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>

            <Link
              href="/esqueci-senha"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Solicitar novo link
            </Link>
          </div>
        )}

        {status === 'ready' && (
          <>
            <p className="text-gray-600 mt-2 mb-8">
              Escolha uma nova senha para o seu acesso ao Canal do Adorador.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                  required
                  disabled={submitting}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmar nova senha
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  disabled={submitting}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                />
              </div>

              {formError && (
                <div
                  className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
            </form>
          </>
        )}

        {status === 'success' && (
          <div
            className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
            aria-live="polite"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">
              Senha redefinida com sucesso! Redirecionando para o login...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
