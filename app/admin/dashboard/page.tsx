'use client'

import { useEffect, useState, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'
import { parseLocalDate, formatHorario } from '@/lib/utils'
import Link from 'next/link'
import type { Evento, Estudo } from '@/lib/types/database'

/**
 * Statistics shown on the dashboard.
 *
 * Eventos and estudos expose a breakdown so the admin can see at a
 * glance how much work is pending vs already wrapped up. The split
 * uses the table's own boolean flags — `eventos.concluido` and
 * `estudos.arquivado` — without inferring state from dates.
 */
interface Stats {
  eventos: {
    total: number
    emAberto: number
    concluidos: number
  }
  estudos: {
    total: number
    emAberto: number
    arquivados: number
  }
  fotos: number
}

interface InscricaoRecente {
  id: string
  nome: string
  email: string
  created_at: string
  eventos: { titulo: string } | null
}

/**
 * Main page of the admin panel.
 *
 * Displays high-level statistics and operational summaries: upcoming
 * events, recent studies, and the latest registrations.
 *
 * @see {@link file://../../../lib/supabase/browser.ts} Supabase client used here
 * @see {@link file://../../../middleware.ts} Middleware protecting this route
 */
export default function DashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    eventos: { total: 0, emAberto: 0, concluidos: 0 },
    estudos: { total: 0, emAberto: 0, arquivados: 0 },
    fotos: 0,
  })
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([])
  const [inscricoesCount, setInscricoesCount] = useState<Record<string, number>>({})
  const [estudosRecentes, setEstudosRecentes] = useState<Estudo[]>([])
  const [inscricoesRecentes, setInscricoesRecentes] = useState<InscricaoRecente[]>([])

  const fetchStats = async () => {
    try {
      // Counts are fetched in parallel via head-only `count: exact`
      // queries so we never pull the row payloads into the client.
      const [
        eventosTotalRes,
        eventosEmAbertoRes,
        eventosConcluidosRes,
        estudosTotalRes,
        estudosEmAbertoRes,
        estudosArquivadosRes,
        fotosRes,
      ] = await Promise.all([
        supabase.from('eventos').select('*', { count: 'exact', head: true }),
        supabase.from('eventos').select('*', { count: 'exact', head: true }).eq('concluido', false),
        supabase.from('eventos').select('*', { count: 'exact', head: true }).eq('concluido', true),
        supabase.from('estudos').select('*', { count: 'exact', head: true }),
        supabase.from('estudos').select('*', { count: 'exact', head: true }).eq('arquivado', false),
        supabase.from('estudos').select('*', { count: 'exact', head: true }).eq('arquivado', true),
        supabase.from('galeria').select('*', { count: 'exact', head: true }),
      ])

      if (eventosTotalRes.error)
        logger.error('Erro ao buscar total de eventos', eventosTotalRes.error)
      if (eventosEmAbertoRes.error)
        logger.error('Erro ao buscar eventos em aberto', eventosEmAbertoRes.error)
      if (eventosConcluidosRes.error)
        logger.error('Erro ao buscar eventos concluídos', eventosConcluidosRes.error)
      if (estudosTotalRes.error)
        logger.error('Erro ao buscar total de estudos', estudosTotalRes.error)
      if (estudosEmAbertoRes.error)
        logger.error('Erro ao buscar estudos em aberto', estudosEmAbertoRes.error)
      if (estudosArquivadosRes.error)
        logger.error('Erro ao buscar estudos arquivados', estudosArquivadosRes.error)
      if (fotosRes.error) logger.error('Erro ao buscar fotos', fotosRes.error)

      setStats({
        eventos: {
          total: eventosTotalRes.count ?? 0,
          emAberto: eventosEmAbertoRes.count ?? 0,
          concluidos: eventosConcluidosRes.count ?? 0,
        },
        estudos: {
          total: estudosTotalRes.count ?? 0,
          emAberto: estudosEmAbertoRes.count ?? 0,
          arquivados: estudosArquivadosRes.count ?? 0,
        },
        fotos: fotosRes.count ?? 0,
      })
    } catch (error) {
      logger.error('Erro ao buscar estatísticas', error)
    }
  }

  const fetchSummaries = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0]

      const [eventosRes, estudosRes, inscricoesRes, countRes] = await Promise.all([
        supabase
          .from('eventos')
          .select('*')
          .eq('concluido', false)
          .gte('data_inicio', hoje)
          .order('data_inicio', { ascending: true })
          .limit(5),
        supabase
          .from('estudos')
          .select('*')
          .eq('arquivado', false)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('inscricoes')
          .select('id, nome, email, created_at, eventos(titulo)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('inscricoes').select('evento_id'),
      ])

      setProximosEventos(eventosRes.data ?? [])
      setEstudosRecentes(estudosRes.data ?? [])
      setInscricoesRecentes((inscricoesRes.data as unknown as InscricaoRecente[]) ?? [])

      if (countRes.data) {
        const counts = countRes.data.reduce<Record<string, number>>((acc, row) => {
          acc[row.evento_id] = (acc[row.evento_id] ?? 0) + 1
          return acc
        }, {})
        setInscricoesCount(counts)
      }
    } catch (error) {
      logger.error('Erro ao buscar resumos', error)
    }
  }

  const fetchAll = async () => {
    await Promise.all([fetchStats(), fetchSummaries()])
  }

  useEffect(() => {
    fetchAll().then(() => setLoading(false))

    const handleStatsUpdate = () => {
      fetchAll()
    }
    window.addEventListener('admin-stats-update', handleStatsUpdate)
    return () => window.removeEventListener('admin-stats-update', handleStatsUpdate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao painel administrativo</p>
      </header>

      {/* Statistics cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="Estatísticas">
        <article className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Eventos</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.eventos.total}</p>
          <dl className="text-sm text-gray-600 mt-3 space-y-1">
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Em aberto</dt>
              <dd>
                <span className="font-semibold text-gray-900">{stats.eventos.emAberto}</span> em
                aberto
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Concluídos</dt>
              <dd>
                <span className="font-semibold text-gray-900">{stats.eventos.concluidos}</span>{' '}
                concluídos
              </dd>
            </div>
          </dl>
        </article>

        <article className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Estudos</h2>
          <p className="text-3xl font-bold text-green-600">{stats.estudos.total}</p>
          <dl className="text-sm text-gray-600 mt-3 space-y-1">
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Em aberto</dt>
              <dd>
                <span className="font-semibold text-gray-900">{stats.estudos.emAberto}</span> em
                aberto
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Arquivados</dt>
              <dd>
                <span className="font-semibold text-gray-900">{stats.estudos.arquivados}</span>{' '}
                arquivados
              </dd>
            </div>
          </dl>
        </article>

        <article className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Fotos</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.fotos}</p>
          <p className="text-sm text-gray-600 mt-2">fotos na galeria</p>
        </article>
      </section>

      {/* Operational summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Próximos Eventos</h2>
            <Link href="/admin/eventos" className="text-sm text-blue-600 hover:underline">
              Gerenciar
            </Link>
          </div>
          {proximosEventos.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum evento agendado.</p>
          ) : (
            <ul className="space-y-3">
              {proximosEventos.map((evento) => {
                const horario = formatHorario(evento.horario_inicio, evento.horario_fim)
                return (
                  <li key={evento.id} className="flex gap-3 items-start">
                    <div className="bg-blue-50 text-blue-700 rounded-lg p-2 text-center min-w-[52px]">
                      <p className="text-xs font-medium leading-none">
                        {parseLocalDate(evento.data_inicio).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{evento.titulo}</p>
                      <p className="text-xs text-gray-500">
                        {[horario, evento.local].filter(Boolean).join(' — ')}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {inscricoesCount[evento.id] ?? 0} inscrito
                      {(inscricoesCount[evento.id] ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Recent registrations */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Inscrições Recentes</h2>
            <Link href="/admin/eventos" className="text-sm text-blue-600 hover:underline">
              Ver eventos
            </Link>
          </div>
          {inscricoesRecentes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma inscrição ainda.</p>
          ) : (
            <ul className="space-y-3">
              {inscricoesRecentes.map((inscricao) => (
                <li key={inscricao.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{inscricao.nome}</p>
                    <p className="text-xs text-gray-500 truncate">{inscricao.email}</p>
                    {inscricao.eventos?.titulo && (
                      <p className="text-xs text-blue-600 truncate">{inscricao.eventos.titulo}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent studies */}
        <section className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Estudos Recentes</h2>
            <Link href="/admin/estudos" className="text-sm text-blue-600 hover:underline">
              Gerenciar
            </Link>
          </div>
          {estudosRecentes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum estudo publicado.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {estudosRecentes.map((estudo) => (
                <li key={estudo.id} className="border border-gray-100 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">
                    {estudo.categoria}
                  </p>
                  <p className="font-medium text-gray-800 text-sm">{estudo.titulo}</p>
                  <p className="text-xs text-gray-500 mt-1">{estudo.referencia}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
