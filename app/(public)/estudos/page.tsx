import { createSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { Estudo } from '@/types'
import EstudosHero from '@/components/estudos/estudos-hero'
import EstudosComFiltro from '@/components/estudos/estudos-com-filtro'

export const dynamic = 'force-dynamic'

async function getEstudosAtivos(): Promise<Estudo[]> {
  const supabase = createSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('estudos')
      .select('*')
      .eq('arquivado', false)
      .order('data_estudo', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error('Erro ao buscar estudos ativos', error)
    return []
  }
}

async function getEstudosAnteriores(): Promise<Estudo[]> {
  const supabase = createSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('estudos')
      .select('*')
      .eq('arquivado', true)
      .order('data_estudo', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error('Erro ao buscar estudos anteriores', error)
    return []
  }
}

export default async function EstudosPage() {
  const estudosAtivos = await getEstudosAtivos()
  const estudosAnteriores = await getEstudosAnteriores()

  return (
    <main className="min-h-screen">
      <EstudosHero />
      <EstudosComFiltro
        estudosAtivos={estudosAtivos}
        estudosAnteriores={estudosAnteriores}
      />
    </main>
  )
}
