'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IMaskInput } from 'react-imask'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contatoSchema, type ContatoFormData } from '@/lib/validations/contato'

export default function ContatoForm() {
  const [loading, setLoading] = useState(false)
  const [mensagemStatus, setMensagemStatus] = useState<{
    tipo: 'sucesso' | 'erro' | null
    texto: string
  }>({ tipo: null, texto: '' })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
  })

  const onSubmit = async (data: ContatoFormData) => {
    setLoading(true)
    setMensagemStatus({ tipo: null, texto: '' })

    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar mensagem')
      }

      setMensagemStatus({
        tipo: 'sucesso',
        texto: 'Mensagem enviada com sucesso! Retornaremos em breve.',
      })
      reset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar mensagem. Tente novamente.'
      setMensagemStatus({
        tipo: 'erro',
        texto: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Envie uma Mensagem</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nome completo *
              </label>
              <input
                {...register('nome')}
                id="nome"
                type="text"
                placeholder="João Silva"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.nome ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.nome.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                E-mail *
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="joao@email.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Telefone com máscara */}
            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Telefone (opcional)
              </label>
              <IMaskInput
                {...register('telefone')}
                id="telefone"
                mask="(00) 00000-0000"
                placeholder="(21) 99999-9999"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.telefone ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.telefone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.telefone.message}
                </p>
              )}
            </div>

            {/* Mensagem */}
            <div>
              <label
                htmlFor="mensagem"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mensagem *
              </label>
              <textarea
                {...register('mensagem')}
                id="mensagem"
                rows={6}
                placeholder="Digite sua mensagem..."
                className={`w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.mensagem ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.mensagem && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.mensagem.message}
                </p>
              )}
            </div>

            {/* Mensagem de status */}
            {mensagemStatus.tipo && (
              <div
                className={`p-4 rounded-lg ${
                  mensagemStatus.tipo === 'sucesso'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {mensagemStatus.texto}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar Mensagem'
              )}
            </button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
