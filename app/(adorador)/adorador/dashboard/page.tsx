'use client'

import { useEffect, useState, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { useAuth } from '@/lib/hooks/useAuth'
import { Calendar, BookOpen, Bell, HeartHandshake } from 'lucide-react'
import Link from 'next/link'
import { parseLocalDate, formatHorario } from '@/lib/utils'
import type { Evento, Estudo, Aviso } from '@/lib/types/database'

export default function AdoradorDashboardPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [loading, setLoading] = useState(true)
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([])
  const [ultimosEstudos, setUltimosEstudos] = useState<Estudo[]>([])
  const [ultimosAvisos, setUltimosAvisos] = useState<Aviso[]>([])
  const [totalPedidos, setTotalPedidos] = useState(0)

  const nome = user?.user_metadata?.nome as string | undefined

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      const { data: adorador } = await supabase
        .from('adoradores')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const adId = adorador?.id ?? null
      const hoje = new Date().toISOString().split('T')[0]

      const [eventosRes, estudosRes, avisosRes] = await Promise.all([
        supabase
          .from('eventos')
          .select('*')
          .gte('data_inicio', hoje)
          .eq('concluido', false)
          .order('data_inicio', { ascending: true })
          .limit(3),
        supabase
          .from('estudos')
          .select('*')
          .eq('arquivado', false)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('avisos')
          .select('*')
          .eq('ativo', true)
          .order('created_at', { ascending: false })
          .limit(3),
      ])

      setProximosEventos(eventosRes.data ?? [])
      setUltimosEstudos(estudosRes.data ?? [])
      setUltimosAvisos(avisosRes.data ?? [])

      if (adId) {
        const { count } = await supabase
          .from('pedidos_oracao')
          .select('*', { count: 'exact', head: true })
          .eq('adorador_id', adId)
          .eq('respondido', false)

        setTotalPedidos(count ?? 0)
      }

      setLoading(false)
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Olá{nome ? `, ${nome}` : ''}!</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao Canal do Adorador</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/adorador/mural"
          className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
        >
          <Bell className="text-blue-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{ultimosAvisos.length}</p>
          <p className="text-sm text-gray-500 mt-1">Avisos recentes</p>
        </Link>
        <Link
          href="/adorador/oracao"
          className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
        >
          <HeartHandshake className="text-rose-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{totalPedidos}</p>
          <p className="text-sm text-gray-500 mt-1">Pedidos em aberto</p>
        </Link>
        <Link href="/eventos" className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
          <Calendar className="text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{proximosEventos.length}</p>
          <p className="text-sm text-gray-500 mt-1">Próximos eventos</p>
        </Link>
        <Link href="/estudos" className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
          <BookOpen className="text-purple-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-gray-900">{ultimosEstudos.length}</p>
          <p className="text-sm text-gray-500 mt-1">Estudos disponíveis</p>
        </Link>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Últimos Avisos</h2>
            <Link href="/adorador/mural" className="text-sm text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          {ultimosAvisos.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum aviso no momento.</p>
          ) : (
            <ul className="space-y-3">
              {ultimosAvisos.map((aviso) => (
                <li key={aviso.id} className="border-l-4 border-blue-400 pl-3">
                  <p className="font-medium text-gray-800 text-sm">{aviso.titulo}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{aviso.conteudo}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Próximos Eventos</h2>
            <Link href="/eventos" className="text-sm text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          {proximosEventos.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum evento programado.</p>
          ) : (
            <ul className="space-y-3">
              {proximosEventos.map((evento) => (
                <li key={evento.id} className="flex gap-3 items-start">
                  <div className="bg-blue-50 text-blue-700 rounded-lg p-2 text-center min-w-[48px]">
                    <p className="text-xs font-medium leading-none">
                      {parseLocalDate(evento.data_inicio).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{evento.titulo}</p>
                    <p className="text-xs text-gray-500">
                      {[formatHorario(evento.horario_inicio, evento.horario_fim), evento.local]
                        .filter(Boolean)
                        .join(' — ')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Estudos Recentes</h2>
            <Link href="/estudos" className="text-sm text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          {ultimosEstudos.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum estudo publicado.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ultimosEstudos.map((estudo) => (
                <li key={estudo.id} className="border border-gray-100 rounded-lg p-4">
                  <p className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-1">
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
