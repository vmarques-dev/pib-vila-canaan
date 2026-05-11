'use client'

import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { HeartHandshake, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import type { PedidoOracao } from '@/lib/types/database'

const pedidoSchema = z.object({
  descricao: z.string().min(10, 'Descreva seu pedido com ao menos 10 caracteres'),
})

type PedidoForm = z.infer<typeof pedidoSchema>

export default function PedidosOracaoPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([])
  const [adoradorId, setAdoradorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PedidoForm>({
    resolver: zodResolver(pedidoSchema),
  })

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      const { data: adorador } = await supabase
        .from('adoradores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!adorador) {
        setLoading(false)
        return
      }

      setAdoradorId(adorador.id)
      await fetchPedidos(adorador.id)
      setLoading(false)
    }
    fetchData()
  }, [user])

  const fetchPedidos = async (adId: string) => {
    const { data } = await supabase
      .from('pedidos_oracao')
      .select('*')
      .eq('adorador_id', adId)
      .order('created_at', { ascending: false })

    setPedidos(data ?? [])
  }

  const handleSubmitPedido = async (values: PedidoForm) => {
    if (!adoradorId) return
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('pedidos_oracao')
        .insert({ adorador_id: adoradorId, descricao: values.descricao })

      if (error) throw error

      toast.success('Pedido de oração enviado!')
      reset()
      setShowForm(false)
      await fetchPedidos(adoradorId)
    } catch {
      toast.error('Erro ao enviar pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletar = async (id: string) => {
    const { error } = await supabase.from('pedidos_oracao').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao remover pedido.')
    } else {
      toast.success('Pedido removido.')
      setPedidos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  const pedidosAbertos = pedidos.filter((p) => !p.respondido)
  const pedidosRespondidos = pedidos.filter((p) => p.respondido)

  return (
    <main className="p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos de Oração</h1>
          <p className="text-gray-600 mt-1">Compartilhe seus pedidos com a liderança</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
        >
          <Plus size={18} />
          Novo pedido
        </button>
      </header>

      {showForm && (
        <section className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo Pedido de Oração</h2>
          <form onSubmit={handleSubmit(handleSubmitPedido)} className="space-y-4">
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
                Descreva seu pedido
              </label>
              <textarea
                id="descricao"
                rows={4}
                {...register('descricao')}
                placeholder="Compartilhe seu pedido de oração..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                  errors.descricao ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descricao && (
                <p className="text-sm text-red-500 mt-1">{errors.descricao.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar pedido'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  reset()
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {pedidosAbertos.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Em oração ({pedidosAbertos.length})
          </h2>
          <ul className="space-y-3">
            {pedidosAbertos.map((pedido) => (
              <li key={pedido.id} className="bg-white rounded-xl shadow p-5 flex items-start gap-4">
                <HeartHandshake size={20} className="text-rose-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-800 whitespace-pre-wrap">{pedido.descricao}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletar(pedido.id)}
                  className="text-gray-400 hover:text-red-500 transition shrink-0"
                  aria-label="Remover pedido"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pedidosRespondidos.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Respondidos ({pedidosRespondidos.length})
          </h2>
          <ul className="space-y-3">
            {pedidosRespondidos.map((pedido) => (
              <li
                key={pedido.id}
                className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-start gap-4"
              >
                <CheckCircle2 size={20} className="text-green-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-700 whitespace-pre-wrap">{pedido.descricao}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pedidos.length === 0 && !showForm && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <HeartHandshake size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Você ainda não tem pedidos de oração.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm"
          >
            Fazer meu primeiro pedido
          </button>
        </div>
      )}
    </main>
  )
}
