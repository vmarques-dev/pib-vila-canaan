'use client'

export const dynamic = 'force-dynamic'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { IMaskInput } from 'react-imask'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { cadastroSchema, type CadastroFormData } from '@/lib/validations/auth'

export default function CadastroPage() {
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
  })

  const passwordValue = watch('password', '')

  const passwordStrength = (() => {
    if (!passwordValue) return null
    let score = 0
    if (passwordValue.length >= 8) score++
    if (/[A-Z]/.test(passwordValue)) score++
    if (/[0-9]/.test(passwordValue)) score++
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++
    if (score <= 1) return { label: 'Fraca', color: 'bg-red-500', text: 'text-red-500', bars: 1 }
    if (score === 2)
      return { label: 'Média', color: 'bg-yellow-500', text: 'text-yellow-500', bars: 2 }
    return { label: 'Forte', color: 'bg-green-500', text: 'text-green-500', bars: 3 }
  })()

  const onSubmit = async (data: CadastroFormData) => {
    // `nome`, `role` and `telefone` are stored in user_metadata so the
    // `handle_new_adorador` database trigger can create the matching
    // `adoradores` row automatically (see migration 006). The trigger is
    // the source of truth — the client no longer inserts the profile
    // itself, which is what previously left worshipers orphaned.
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome: data.nome,
          role: 'adorador',
          telefone: data.telefone || null,
        },
      },
    })

    if (signUpError) {
      if (signUpError.status === 429) {
        toast.error('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      } else {
        toast.error('Erro ao criar conta. Verifique os dados e tente novamente.')
      }
      return
    }

    if (authData.user) {
      toast.success('Cadastro realizado! Você receberá um email de confirmação.')
      router.push('/login/adorador')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <Link
          href="/login/adorador"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro</h1>
          <p className="text-gray-600 text-sm">Crie sua conta para ter acesso à plataforma</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo *
            </label>
            <input
              id="nome"
              type="text"
              {...register('nome')}
              placeholder="Seu nome completo"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.nome ? 'border-red-500' : 'border-gray-300'
              } ${isSubmitting ? 'bg-gray-100' : ''}`}
            />
            {errors.nome && <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="seu@email.com"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } ${isSubmitting ? 'bg-gray-100' : ''}`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <IMaskInput
              id="telefone"
              mask="(00) 00000-0000"
              placeholder="(00) 00000-0000"
              disabled={isSubmitting}
              onAccept={(value: string) => setValue('telefone', value, { shouldValidate: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.telefone ? 'border-red-500' : 'border-gray-300'
              } ${isSubmitting ? 'bg-gray-100' : ''}`}
            />
            {errors.telefone && (
              <p className="text-sm text-red-500 mt-1">{errors.telefone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Mínimo 8 caracteres"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } ${isSubmitting ? 'bg-gray-100' : ''}`}
            />
            {passwordStrength && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        bar <= passwordStrength.bars ? passwordStrength.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${passwordStrength.text}`}>
                  Senha {passwordStrength.label}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar senha *
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Digite a senha novamente"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } ${isSubmitting ? 'bg-gray-100' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
            Já tem conta?{' '}
            <Link href="/login/adorador" className="text-blue-600 hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
