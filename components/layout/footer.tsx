import Link from 'next/link'
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { InformacoesIgreja } from '@/types'

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

export default async function Footer() {
  const info = await getInformacoesIgreja()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-8">
        <div className="flex flex-wrap gap-12 justify-center items-start">
          {/* About */}
          <div className="w-64">
            <div className="flex items-start space-x-2 mb-[0.7rem]">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center -mt-[0.475rem]">
                <span className="text-white font-bold text-xl">PIB</span>
              </div>
              <span className="font-bold text-lg text-white">Vila Canaan</span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 -mt-[1px]">
              Uma igreja que ama a Deus e serve às pessoas.
            </p>
            <div className="flex space-x-4">
              {info?.facebook_url && (
                <a
                  href={info.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {info?.instagram_url && (
                <a
                  href={info.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {info?.youtube_url && (
                <a
                  href={info.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-48">
            <h3 className="text-lg font-bold text-white mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="text-gray-300 hover:text-white transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/estudos" className="text-gray-300 hover:text-white transition-colors">
                  Estudos Bíblicos
                </Link>
              </li>
              <li>
                <Link href="/galeria" className="text-gray-300 hover:text-white transition-colors">
                  Galeria
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="w-64">
            <h3 className="text-lg font-bold text-white mb-4">Contato</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">
                  {info?.endereco || 'Rua da Igreja, 123\nVila Canaan - Cidade/UF'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">{info?.telefone || '(00) 0000-0000'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">{info?.email || 'contato@pibvilacanaa.com.br'}</span>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="w-80">
            <h3 className="text-lg font-bold text-white mb-4">Localização</h3>
            <div className="w-full h-48 rounded-lg overflow-hidden shadow-xl">
              <iframe
                src="https://maps.google.com/maps?q=Rua+4+Lote+11+Vila+Canaan+Duque+de+Caxias+RJ&output=embed&z=16"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da PIB Vila Canaan"
              />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} PIB Vila Canaan. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
