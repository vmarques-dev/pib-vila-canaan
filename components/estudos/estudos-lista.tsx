'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Estudo } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'

interface EstudosListaProps {
  estudos: Estudo[]
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
}

export default function EstudosLista({ estudos }: EstudosListaProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [estudoSelecionado, setEstudoSelecionado] = useState<Estudo | null>(null)

  useEffect(() => {
    setCurrentIndex(0)
  }, [estudos])

  if (estudos.length === 0) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">Nenhum estudo anterior disponível no momento.</p>
        </div>
      </section>
    )
  }

  const total = estudos.length
  const safeIndex = Math.min(currentIndex, total - 1)
  const estudo = estudos[safeIndex]

  const goNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % total)
  }

  const goPrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Estudos Anteriores
          </h2>
          <p className="text-gray-600">Reveja nossos estudos passados</p>
        </motion.div>

        {/* Área de navegação */}
        <div className="relative flex items-center gap-4">
          {/* Seta esquerda */}
          <button
            onClick={goPrev}
            disabled={total <= 1}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none shadow-sm"
            aria-label="Estudo anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Card com animação */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={estudo.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                    <p className="text-blue-600 font-semibold mb-2">
                      {estudo.livro} {estudo.referencia}
                    </p>
                    <p className="text-gray-600 italic">"{estudo.texto_versiculo}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Seta direita */}
          <button
            onClick={goNext}
            disabled={total <= 1}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none shadow-sm"
            aria-label="Próximo estudo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Indicador de posição */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            {estudos.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i) }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === currentIndex ? 'bg-gray-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para estudo ${i + 1}`}
              />
            ))}
          </div>
        )}
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
                <h2 className="text-3xl font-bold text-gray-900">{estudoSelecionado.titulo}</h2>
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
