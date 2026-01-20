import { supabase } from '@/lib/supabase/client'
import { EquipePastoral } from '@/types'
import SobreHero from '@/components/sobre/sobre-hero'
import HistoriaSection from '@/components/sobre/historia-section'
import MissaoVisaoSection from '@/components/sobre/missao-visao-section'
import EquipeSection from '@/components/sobre/equipe-section'

async function getEquipePastoral(): Promise<EquipePastoral[]> {
  try {
    const { data, error } = await supabase
      .from('equipe_pastoral')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar equipe pastoral:', error)
    return []
  }
}

export default async function SobrePage() {
  const equipe = await getEquipePastoral()

  return (
    <main className="min-h-screen">
      <SobreHero />
      <HistoriaSection />
      <MissaoVisaoSection />
      <EquipeSection equipe={equipe} />
    </main>
  )
}
