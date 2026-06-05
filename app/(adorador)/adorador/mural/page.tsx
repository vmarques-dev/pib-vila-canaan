'use client'

import { useEffect, useState, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Bell } from 'lucide-react'
import type { Aviso } from '@/lib/types/database'

export default function MuralAvisosPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAvisos() {
      const { data } = await supabase
        .from('avisos')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      setAvisos(data ?? [])
      setLoading(false)
    }
    fetchAvisos()
  }, [])

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
        <h1 className="text-3xl font-bold text-gray-900">Mural de Avisos</h1>
        <p className="text-gray-600 mt-1">Comunicados da liderança para os membros</p>
      </header>

      {avisos.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Bell size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum aviso no momento.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {avisos.map((aviso) => (
            <li key={aviso.id} className="bg-white rounded-xl shadow p-6">
              {/* Icon and title share a row centered to each other; the
                  body and date sit below it, spanning the card width. */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <Bell size={18} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{aviso.titulo}</h2>
              </div>
              <p className="text-gray-600 mt-3 whitespace-pre-wrap">{aviso.conteudo}</p>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(aviso.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
