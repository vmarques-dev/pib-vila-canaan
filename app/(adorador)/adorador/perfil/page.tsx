'use client'

import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IMaskInput } from 'react-imask'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { User, Lock } from 'lucide-react'
import type { Adorador } from '@/lib/types/database'

const perfilSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
})

const senhaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Informe sua senha atual'),
    novaSenha: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
    confirmarSenha: z.string(),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: 'As senhas não conferem',
    path: ['confirmarSenha'],
  })

type PerfilForm = z.infer<typeof perfilSchema>
type SenhaForm = z.infer<typeof senhaSchema>

export default function PerfilPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [adorador, setAdorador] = useState<Adorador | null>(null)
  const [loadingPerfil, setLoadingPerfil] = useState(false)
  const [loadingSenha, setLoadingSenha] = useState(false)
  const [telefone, setTelefone] = useState('')

  const perfilForm = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
  })

  const senhaForm = useForm<SenhaForm>({
    resolver: zodResolver(senhaSchema),
  })

  useEffect(() => {
    async function fetchAdorador() {
      if (!user) return
      const { data } = await supabase
        .from('adoradores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setAdorador(data)
        setTelefone(data.telefone ?? '')
        perfilForm.reset({ nome: data.nome })
      }
    }
    fetchAdorador()
  }, [user])

  const handleSalvarPerfil = async (values: PerfilForm) => {
    if (!adorador) return
    setLoadingPerfil(true)
    try {
      const { error } = await supabase
        .from('adoradores')
        .update({ nome: values.nome, telefone: telefone || null })
        .eq('id', adorador.id)

      if (error) throw error

      await supabase.auth.updateUser({ data: { nome: values.nome } })
      toast.success('Perfil atualizado com sucesso!')
    } catch {
      toast.error('Erro ao salvar perfil.')
    } finally {
      setLoadingPerfil(false)
    }
  }

  const handleAlterarSenha = async (values: SenhaForm) => {
    if (!user?.email) return
    setLoadingSenha(true)
    try {
      // Re-authenticate before changing the password. Supabase has no
      // dedicated "verify my password" call, so we sign in again with
      // the current email + the typed current password. On success the
      // existing session is simply refreshed; on failure the password
      // is wrong and we abort before touching anything.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.senhaAtual,
      })

      if (reauthError) {
        senhaForm.setError('senhaAtual', { message: 'Senha atual incorreta.' })
        setLoadingSenha(false)
        return
      }

      const { error } = await supabase.auth.updateUser({ password: values.novaSenha })
      if (error) throw error

      toast.success('Senha alterada com sucesso!')
      senhaForm.reset()
    } catch {
      toast.error('Erro ao alterar senha.')
    } finally {
      setLoadingSenha(false)
    }
  }

  return (
    <main className="p-6 lg:p-8 max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
      </header>

      <section className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Dados Pessoais</h2>
        </div>

        <form onSubmit={perfilForm.handleSubmit(handleSalvarPerfil)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              {...perfilForm.register('nome')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                perfilForm.formState.errors.nome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {perfilForm.formState.errors.nome && (
              <p className="text-sm text-red-500 mt-1">
                {perfilForm.formState.errors.nome.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <IMaskInput
              id="telefone"
              mask="(00) 00000-0000"
              value={telefone}
              onAccept={(val) => setTelefone(val)}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loadingPerfil}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {loadingPerfil ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Alterar Senha</h2>
        </div>

        <form onSubmit={senhaForm.handleSubmit(handleAlterarSenha)} className="space-y-4">
          <div>
            <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700 mb-2">
              Senha atual
            </label>
            <input
              id="senhaAtual"
              type="password"
              autoComplete="current-password"
              {...senhaForm.register('senhaAtual')}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                senhaForm.formState.errors.senhaAtual ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {senhaForm.formState.errors.senhaAtual && (
              <p className="text-sm text-red-500 mt-1">
                {senhaForm.formState.errors.senhaAtual.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-2">
              Nova senha
            </label>
            <input
              id="novaSenha"
              type="password"
              autoComplete="new-password"
              {...senhaForm.register('novaSenha')}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                senhaForm.formState.errors.novaSenha ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {senhaForm.formState.errors.novaSenha && (
              <p className="text-sm text-red-500 mt-1">
                {senhaForm.formState.errors.novaSenha.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmarSenha"
              type="password"
              autoComplete="new-password"
              {...senhaForm.register('confirmarSenha')}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                senhaForm.formState.errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {senhaForm.formState.errors.confirmarSenha && (
              <p className="text-sm text-red-500 mt-1">
                {senhaForm.formState.errors.confirmarSenha.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loadingSenha}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {loadingSenha ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </section>
    </main>
  )
}
