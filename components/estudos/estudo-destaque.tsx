'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Estudo } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EstudoDestaqueProps {
  estudo: Estudo
}

export default function EstudoDestaque({ estudo }: EstudoDestaqueProps) {
  const [mostrarModal, setMostrarModal] = useState(false)
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Estudo Atual
          </h2>
          <p className="text-gray-600">Nosso estudo mais recente</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card
            className="shadow-lg border-2 border-blue-200 cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => setMostrarModal(true)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Em Destaque
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {estudo.categoria}
                </span>
              </div>
              <CardTitle className="text-3xl mb-3">{estudo.titulo}</CardTitle>
              <CardDescription className="flex flex-wrap gap-4 text-base">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(parseISO(estudo.data_estudo + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-blue-600 font-semibold mb-3 text-lg">
                {estudo.livro} {estudo.referencia}
              </p>
              <p className="text-gray-600 italic">"{estudo.texto_versiculo}"</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setMostrarModal(false)}
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
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Em Destaque
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {estudo.categoria}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{estudo.titulo}</h2>
                <p className="text-blue-600 font-semibold mt-2 text-lg">
                  {estudo.livro} {estudo.referencia}
                </p>
                <p className="text-gray-600 italic mt-2 mb-3">"{estudo.texto_versiculo}"</p>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(parseISO(estudo.data_estudo + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {estudo.conteudo}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  )
}
