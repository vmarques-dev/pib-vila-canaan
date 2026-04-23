'use client'

import { useEffect, useState, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { CheckCircle2, HeartHandshake } from 'lucide-react'
import { toast } from 'sonner'
import type { PedidoOracao } from '@/lib/types/database'

interface PedidoComAdorador extends PedidoOracao {
  adoradores: { nome: string; email: string } | null
}

export default function OracaoAdminPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [pedidos, setPedidos] = useState<PedidoComAdorador[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'abertos' | 'respondidos'>('abertos')

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from('pedidos_oracao')
      .select('*, adoradores(nome, email)')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Erro ao buscar pedidos.')
    } else {
      setPedidos((data as PedidoComAdorador[]) ?? [])
    }
    setLoading(false)
  }

  const handleResponder = async (pedido: PedidoComAdorador) => {
    const { error } = await supabase
      .from('pedidos_oracao')
      .update({ respondido: !pedido.respondido })
      .eq('id', pedido.id)

    if (error) {
      toast.error('Erro ao atualizar pedido.')
    } else {
      toast.success(pedido.respondido ? 'Pedido reaberto.' : 'Pedido marcado como respondido.')
      await fetchPedidos()
    }
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === 'abertos') return !p.respondido
    if (filtro === 'respondidos') return p.respondido
    return true
  })

  const totalAbertos = pedidos.filter((p) => !p.respondido).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos de Oração</h1>
          <p className="text-gray-600 mt-1">
            {totalAbertos} pedido{totalAbertos !== 1 ? 's' : ''} em aberto
          </p>
        </div>
      </header>

      <div className="flex gap-2 mb-6">
        {(['abertos', 'respondidos', 'todos'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filtro === f
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'abertos' ? 'Em aberto' : f === 'respondidos' ? 'Respondidos' : 'Todos'}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <HeartHandshake size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <li
              key={pedido.id}
              className={`bg-white rounded-xl shadow p-6 flex items-start gap-4 ${
                pedido.respondido ? 'opacity-70' : ''
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {pedido.respondido
                  ? <CheckCircle2 size={22} className="text-green-500" />
                  : <HeartHandshake size={22} className="text-rose-500" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {pedido.adoradores?.nome ?? 'Membro desconhecido'}
                  </p>
                  <span className="text-xs text-gray-400">·</span>
                  <p className="text-xs text-gray-400">{pedido.adoradores?.email}</p>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{pedido.descricao}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => handleResponder(pedido)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  pedido.respondido
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {pedido.respondido ? 'Reabrir' : 'Marcar respondido'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
