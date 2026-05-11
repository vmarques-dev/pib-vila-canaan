import { createSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { Evento } from '@/types'
import EventosHero from '@/components/eventos/eventos-hero'
import EventosGrid from '@/components/eventos/eventos-grid'

async function getProximosEventos(): Promise<Evento[]> {
  const supabase = createSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('concluido', false)
      .gte('data_inicio', new Date().toISOString())
      .order('data_inicio', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error('Erro ao buscar próximos eventos', error)
    return []
  }
}

async function getEventosAnteriores(): Promise<Evento[]> {
  const supabase = createSupabaseClient()
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('concluido', true)
      .order('data_inicio', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    logger.error('Erro ao buscar eventos anteriores', error)
    return []
  }
}

export default async function EventosPage() {
  const proximosEventos = await getProximosEventos()
  const eventosAnteriores = await getEventosAnteriores()

  return (
    <main className="min-h-screen">
      <EventosHero />
      <EventosGrid proximosEventos={proximosEventos} eventosAnteriores={eventosAnteriores} />
    </main>
  )
}
