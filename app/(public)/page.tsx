import { supabase } from '@/lib/supabase/client'
import { VersiculoDestaque, Evento } from '@/types'
import HeroSection from '@/components/home/hero-section'
import VersiculoSection from '@/components/home/versiculo-section'
import EventosSection from '@/components/home/eventos-section'
import MinisteriosSection from '@/components/home/ministerios-section'
import CTASection from '@/components/home/cta-section'

export const revalidate = 3600

async function getVersiculoDestaque(): Promise<VersiculoDestaque | null> {
  try {
    const { data, error } = await supabase
      .from('versiculo_destaque')
      .select('*')
      .eq('ativo', true)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar versículo:', error)
    return null
  }
}

async function getProximosEventos(): Promise<Evento[]> {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('concluido', false)
      .gte('data_inicio', new Date().toISOString())
      .order('data_inicio', { ascending: true })
      .limit(3)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    return []
  }
}

export default async function Home() {
  const versiculo = await getVersiculoDestaque()
  const eventos = await getProximosEventos()

  return (
    <main className="min-h-screen">
      <HeroSection />
      <VersiculoSection versiculo={versiculo} />
      <EventosSection eventos={eventos} />
      <MinisteriosSection />
      <CTASection />
    </main>
  )
}
