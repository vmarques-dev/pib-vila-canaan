import { supabase } from '@/lib/supabase/client'
import { Estudo } from '@/types'
import EstudosHero from '@/components/estudos/estudos-hero'
import EstudosComFiltro from '@/components/estudos/estudos-com-filtro'

async function getEstudoAtual(): Promise<Estudo | null> {
  const { data, error } = await supabase
    .from('estudos')
    .select('*')
    .eq('arquivado', false)
    .order('data_estudo', { ascending: false })
    .limit(1)
    .maybeSingle() // Não gera erro se não encontrar

  // Só loga erro real (problema de conexão, etc)
  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar estudo:', error)
  }

  return data
}

async function getEstudosAnteriores(): Promise<Estudo[]> {
  try {
    const { data, error } = await supabase
      .from('estudos')
      .select('*')
      .eq('arquivado', true)
      .order('data_estudo', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar estudos anteriores:', error)
    return []
  }
}

export default async function EstudosPage() {
  const estudoAtual = await getEstudoAtual()
  const estudosAnteriores = await getEstudosAnteriores()

  return (
    <main className="min-h-screen">
      <EstudosHero />
      <EstudosComFiltro
        estudoAtual={estudoAtual}
        estudosAnteriores={estudosAnteriores}
      />
    </main>
  )
}
