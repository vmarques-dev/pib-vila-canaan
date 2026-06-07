'use client'

import { useEffect, useState, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { Calendar, MapPin, Clock, CheckCircle2, X, CalendarOff } from 'lucide-react'
import { parseLocalDate, formatHorario } from '@/lib/utils'
import type { Evento } from '@/lib/types/database'

/**
 * One registration the worshiper made, with the joined event data.
 * `eventos` comes back as an object because `inscricoes.evento_id` is a
 * single foreign key.
 */
interface MinhaInscricao {
  id: string
  created_at: string
  eventos: Evento | null
}

/**
 * "Meus Eventos" — the events the logged-in worshiper is registered for.
 *
 * Reads the worshiper's own `inscricoes` (RLS already scopes the select to
 * the current user) joined with the event, then splits them into upcoming
 * and past. A registration can be cancelled, which deletes the inscricao
 * row (allowed by the policy added in migration 007).
 */
export default function MeusEventosPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [inscricoes, setInscricoes] = useState<MinhaInscricao[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)
  const [cancelandoId, setCancelandoId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInscricoes() {
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

      const { data } = await supabase
        .from('inscricoes')
        .select('id, created_at, eventos(*)')
        .eq('adorador_id', adorador.id)
        .order('created_at', { ascending: false })

      setInscricoes((data as unknown as MinhaInscricao[]) ?? [])
      setLoading(false)
    }
    fetchInscricoes()
  }, [user])

  const handleCancelar = async (inscricaoId: string) => {
    setCancelandoId(inscricaoId)
    const { error } = await supabase.from('inscricoes').delete().eq('id', inscricaoId)

    if (error) {
      toast.error('Erro ao cancelar inscrição. Tente novamente.')
      setCancelandoId(null)
      return
    }

    toast.success('Inscrição cancelada.')
    setInscricoes((prev) => prev.filter((i) => i.id !== inscricaoId))
    setConfirmandoId(null)
    setCancelandoId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  // Split into upcoming vs past. An event is "past" once it is marked as
  // completed or its end date (falling back to the start date) is before
  // today; everything else is "upcoming".
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const comEvento = inscricoes.filter((i) => i.eventos)

  const proximos = comEvento.filter((i) => {
    const ev = i.eventos!
    if (ev.concluido) return false
    const ref = parseLocalDate(ev.data_fim || ev.data_inicio)
    return ref >= hoje
  })

  const anteriores = comEvento.filter((i) => !proximos.includes(i))

  const renderInscricao = (inscricao: MinhaInscricao, passado: boolean) => {
    const evento = inscricao.eventos!
    const horario = formatHorario(evento.horario_inicio, evento.horario_fim)
    const confirmando = confirmandoId === inscricao.id
    const cancelando = cancelandoId === inscricao.id

    return (
      <li key={inscricao.id} className="bg-white rounded-xl shadow p-5">
        {/* Date box, title and action share a row centered to each other;
            the event details sit below, spanning the card width. */}
        <div className="flex items-center gap-4">
          <div
            className={`rounded-lg p-2 text-center min-w-[56px] ${
              passado ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <p className="text-xs font-medium leading-none">
              {parseLocalDate(evento.data_inicio).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </p>
          </div>

          <p className="flex-1 min-w-0 font-semibold text-gray-900">{evento.titulo}</p>

          {passado ? (
            <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
              <CheckCircle2 size={14} />
              Realizado
            </span>
          ) : confirmando ? (
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => handleCancelar(inscricao.id)}
                disabled={cancelando}
                className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition disabled:opacity-50"
              >
                {cancelando ? 'Cancelando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setConfirmandoId(null)}
                disabled={cancelando}
                className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900 transition"
              >
                Voltar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmandoId(inscricao.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition shrink-0"
              aria-label="Cancelar inscrição"
            >
              <X size={14} />
              Cancelar
            </button>
          )}
        </div>

        <div className="mt-3 space-y-0.5 text-sm text-gray-500">
          <p className="flex items-center gap-1.5">
            <Calendar size={14} />
            {parseLocalDate(evento.data_inicio).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          {horario && (
            <p className="flex items-center gap-1.5">
              <Clock size={14} />
              {horario}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <MapPin size={14} />
            {evento.local}
          </p>
        </div>
      </li>
    )
  }

  return (
    <main className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meus Eventos</h1>
        <p className="text-gray-600 mt-1">Eventos em que você está inscrito</p>
      </header>

      {comEvento.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <CalendarOff size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Você ainda não está inscrito em nenhum evento.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {proximos.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                Próximos ({proximos.length})
              </h2>
              <ul className="space-y-3">{proximos.map((i) => renderInscricao(i, false))}</ul>
            </section>
          )}

          {anteriores.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                Anteriores ({anteriores.length})
              </h2>
              <ul className="space-y-3">{anteriores.map((i) => renderInscricao(i, true))}</ul>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
