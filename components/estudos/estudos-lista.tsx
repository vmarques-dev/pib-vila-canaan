'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Estudo } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'

interface EstudosListaProps {
  estudos: Estudo[]
}

export default function EstudosLista({ estudos }: EstudosListaProps) {
  const [estudoSelecionado, setEstudoSelecionado] = useState<Estudo | null>(null)
  if (estudos.length === 0) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">Nenhum estudo anterior disponível no momento.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Estudos Anteriores
          </h2>
          <p className="text-gray-600">Reveja nossos estudos passados</p>
        </motion.div>

        <div className="space-y-6">
          {estudos.map((estudo, index) => (
            <motion.div
              key={estudo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card
                className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => setEstudoSelecionado(estudo)}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{estudo.titulo}</CardTitle>
                  <CardDescription className="flex flex-wrap gap-4 text-base">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(parseLocalDate(estudo.data_estudo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {estudo.categoria}
                    </span>
                  </div>
                  <p className="text-blue-600 font-semibold mb-2">
                    {estudo.livro} {estudo.referencia}
                  </p>
                  <p className="text-gray-600 italic">"{estudo.texto_versiculo}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {estudoSelecionado && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEstudoSelecionado(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {estudoSelecionado.categoria}
                </span>
                <h2 className="text-3xl font-bold mt-4 text-gray-900">{estudoSelecionado.titulo}</h2>
                <p className="text-blue-600 font-semibold mt-2 text-lg">
                  {estudoSelecionado.livro} {estudoSelecionado.referencia}
                </p>
                <p className="text-gray-600 italic mt-2 mb-3">"{estudoSelecionado.texto_versiculo}"</p>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(parseLocalDate(estudoSelecionado.data_estudo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <button
                onClick={() => setEstudoSelecionado(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {estudoSelecionado.conteudo}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  )
}
