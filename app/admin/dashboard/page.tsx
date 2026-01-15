'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { logger } from '@/lib/logger'
import { useAuth } from '@/lib/hooks/useAuth'

interface Stats {
  eventos: number
  estudos: number
  fotos: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    eventos: 0,
    estudos: 0,
    fotos: 0,
  })

  useEffect(() => {
    // Middleware já protege a rota, apenas carregar stats
    fetchStats().then(() => setLoading(false))

    // Listener para atualizar stats quando houver mudanças
    const handleStatsUpdate = () => {
      fetchStats()
    }

    window.addEventListener('admin-stats-update', handleStatsUpdate)

    return () => {
      window.removeEventListener('admin-stats-update', handleStatsUpdate)
    }
  }, [])

  const fetchStats = async () => {
    try {
      // Buscar eventos
      const { count: eventosCount, error: eventosError } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })

      if (eventosError) {
        logger.error('Erro ao buscar eventos', eventosError)
      }

      // Buscar estudos
      const { count: estudosCount, error: estudosError } = await supabase
        .from('estudos')
        .select('*', { count: 'exact', head: true })

      if (estudosError) {
        logger.error('Erro ao buscar estudos', estudosError)
      }

      // Buscar fotos
      const { count: fotosCount, error: fotosError } = await supabase
        .from('galeria')
        .select('*', { count: 'exact', head: true })

      if (fotosError) {
        logger.error('Erro ao buscar fotos', fotosError)
      }

      // Atualizar stats
      setStats({
        eventos: eventosCount || 0,
        estudos: estudosCount || 0,
        fotos: fotosCount || 0,
      })

      logger.info('Stats carregadas', {
        eventos: eventosCount || 0,
        estudos: estudosCount || 0,
        fotos: fotosCount || 0,
      })
    } catch (error) {
      logger.error('Erro ao buscar estatísticas', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login/admin')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo ao painel administrativo</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
            aria-label="Sair do painel administrativo"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="Estatísticas">
        <article className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Eventos</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.eventos}</p>
          <p className="text-sm text-gray-600 mt-2">eventos cadastrados</p>
        </article>

        <article className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Estudos</h2>
          <p className="text-3xl font-bold text-green-600">{stats.estudos}</p>
          <p className="text-sm text-gray-600 mt-2">estudos publicados</p>
        </article>

        <article className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Fotos</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.fotos}</p>
          <p className="text-sm text-gray-600 mt-2">fotos na galeria</p>
        </article>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Painel Administrativo</h2>
        <p className="text-gray-600">
          Utilize o menu lateral para navegar entre as diferentes seções do painel.
        </p>
      </section>
    </main>
  )
}
