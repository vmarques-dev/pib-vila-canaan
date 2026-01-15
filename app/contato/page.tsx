import { supabase } from '@/lib/supabase/client'
import { InformacoesIgreja } from '@/types'
import ContatoHero from '@/components/contato/contato-hero'
import ContatoInfo from '@/components/contato/contato-info'
import ContatoForm from '@/components/contato/contato-form'

async function getInformacoesIgreja(): Promise<InformacoesIgreja | null> {
  try {
    const { data, error } = await supabase
      .from('informacoes_igreja')
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar informações:', error)
    return null
  }
}

export default async function ContatoPage() {
  const info = await getInformacoesIgreja()

  return (
    <main className="min-h-screen">
      <ContatoHero />
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <ContatoInfo info={info} />
            <ContatoForm />
          </div>
        </div>
      </section>
    </main>
  )
}
