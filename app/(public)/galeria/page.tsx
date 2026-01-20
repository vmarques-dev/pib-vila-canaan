import { supabase } from '@/lib/supabase/client'
import { Galeria } from '@/types'
import GaleriaHero from '@/components/galeria/galeria-hero'
import GaleriaGrid from '@/components/galeria/galeria-grid'

async function getFotos(): Promise<Galeria[]> {
  try {
    const { data, error } = await supabase
      .from('galeria')
      .select('*')
      .order('ordem', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar fotos:', error)
    return []
  }
}

export default async function GaleriaPage() {
  const fotos = await getFotos()

  return (
    <main className="min-h-screen">
      <GaleriaHero />
      <GaleriaGrid fotos={fotos} />
    </main>
  )
}
