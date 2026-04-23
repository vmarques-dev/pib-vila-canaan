'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IMaskInput } from 'react-imask'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import {
  configuracoesSchema,
  type ConfiguracoesFormData,
} from '@/lib/validations/admin'

/**
 * Componente de campo de formulário com suporte a erros
 */
interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
  hint?: string
}

function FormField({ label, htmlFor, error, children, hint }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Página de configurações gerais da igreja
 *
 * Permite editar informações básicas exibidas no site público:
 * nome, endereço, telefone, email, missão e visão da igreja.
 * Os dados são persistidos na tabela 'informacoes_igreja'.
 *
 * Implementa validações enterprise-level:
 * - Validação de formato de telefone brasileiro com máscara
 * - Validação rigorosa de email com bloqueio de domínios descartáveis
 * - Feedback visual em tempo real de erros de validação
 * - Sanitização automática de inputs
 *
 * @see {@link file://../../../lib/validations/admin.ts} Schema de validação
 * @see {@link file://../../../lib/supabase/browser.ts} Cliente Supabase utilizado
 * @see {@link file://../../../middleware.ts} Middleware que protege esta rota
 */
export default function ConfiguracoesPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [loading, setLoading] = useState(true)
  const [configId, setConfigId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ConfiguracoesFormData>({
    resolver: zodResolver(configuracoesSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: '',
      endereco: '',
      telefone: '',
      email: '',
      missao: '',
      visao: '',
    },
  })

  const fetchConfiguracoes = useCallback(async () => {
    const { data, error } = await supabase
      .from('informacoes_igreja')
      .select('*')
      .single()

    if (error) {
      logger.error('Erro ao buscar configurações', error)
    } else if (data) {
      setConfigId(data.id)
      reset({
        nome: data.nome || '',
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        email: data.email || '',
        missao: data.missao || '',
        visao: data.visao || '',
      })
    }
    setLoading(false)
  }, [supabase, reset])

  useEffect(() => {
    fetchConfiguracoes()
  }, [fetchConfiguracoes])

  const onSubmit = async (formData: ConfiguracoesFormData) => {
    try {
      if (configId) {
        const { error } = await supabase
          .from('informacoes_igreja')
          .update(formData)
          .eq('id', configId)

        if (error) {
          logger.error('Erro ao atualizar configurações', error)
          toast.error('Erro ao atualizar configurações: ' + error.message)
          return
        }

        toast.success('Configurações atualizadas com sucesso!')
        reset(formData)
      } else {
        const { data, error } = await supabase
          .from('informacoes_igreja')
          .insert([formData])
          .select()
          .single()

        if (error) {
          logger.error('Erro ao criar configurações', error)
          toast.error('Erro ao criar configurações: ' + error.message)
          return
        }

        setConfigId(data.id)
        toast.success('Configurações criadas com sucesso!')
        reset(formData)
      }
    } catch (error) {
      logger.error('Erro ao salvar configurações', error)
      toast.error('Erro ao salvar configurações')
    }
  }

  const inputClassName = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
      hasError
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500'
    }`

  const textareaClassName = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors ${
      hasError
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500'
    }`

  if (loading) {
    return (
      <main className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </main>
    )
  }

  return (
    <main className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">
          Configure as informações da igreja exibidas no site
        </p>
      </header>

      <div className="bg-white rounded-lg shadow p-8 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            label="Nome da Igreja"
            htmlFor="nome"
            error={errors.nome?.message}
          >
            <input
              id="nome"
              type="text"
              {...register('nome')}
              className={inputClassName(!!errors.nome)}
              placeholder="Ex: Igreja Batista Central"
            />
          </FormField>

          <FormField
            label="Endereço"
            htmlFor="endereco"
            error={errors.endereco?.message}
            hint="Inclua rua, número, bairro, cidade e CEP"
          >
            <input
              id="endereco"
              type="text"
              {...register('endereco')}
              className={inputClassName(!!errors.endereco)}
              placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo/SP - CEP 01234-567"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Telefone"
              htmlFor="telefone"
              error={errors.telefone?.message}
              hint="Formato: (XX) XXXXX-XXXX"
            >
              <Controller
                name="telefone"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <IMaskInput
                    id="telefone"
                    mask={[
                      { mask: '(00) 0000-0000' },
                      { mask: '(00) 00000-0000' },
                    ]}
                    value={value}
                    onAccept={(val) => onChange(val)}
                    onBlur={onBlur}
                    inputRef={ref}
                    className={inputClassName(!!errors.telefone)}
                    placeholder="(21) 99999-9999"
                  />
                )}
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="email"
              error={errors.email?.message}
            >
              <input
                id="email"
                type="email"
                {...register('email')}
                className={inputClassName(!!errors.email)}
                placeholder="contato@igreja.com.br"
              />
            </FormField>
          </div>

          <FormField
            label="Missão"
            htmlFor="missao"
            error={errors.missao?.message}
            hint="Descreva a missão da igreja (mín. 20 caracteres)"
          >
            <textarea
              id="missao"
              {...register('missao')}
              rows={4}
              className={textareaClassName(!!errors.missao)}
              placeholder="Descreva a missão da igreja..."
            />
          </FormField>

          <FormField
            label="Visão"
            htmlFor="visao"
            error={errors.visao?.message}
            hint="Descreva a visão da igreja (mín. 20 caracteres)"
          >
            <textarea
              id="visao"
              {...register('visao')}
              rows={4}
              className={textareaClassName(!!errors.visao)}
              placeholder="Descreva a visão da igreja..."
            />
          </FormField>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Salvar configurações"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Salvar Configurações
                </>
              )}
            </button>

            {!isDirty && !isSubmitting && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 size={16} />
                Salvo
              </span>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
