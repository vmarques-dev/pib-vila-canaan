'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Estudo } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'

interface EstudoDestaqueProps {
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

export default function EstudoDestaque({ estudos }: EstudoDestaqueProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [mostrarModal, setMostrarModal] = useState(false)

  // TODO(phase-4): replace this effect with a render-time reset comparing previous
  // `estudos` length via useRef, or remount via `key={estudos.length}`.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(0)
  }, [estudos])

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
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Estudo Atual</h2>
          <p className="text-gray-600">Nosso estudo mais recente</p>
        </motion.div>

        {/* Navigation area */}
        <div className="relative flex items-center gap-4">
          {/* Left arrow */}
          <button
            onClick={goPrev}
            disabled={total <= 1}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none shadow-sm"
            aria-label="Estudo anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Animated card */}
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
                        {format(parseLocalDate(estudo.data_estudo), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 font-semibold mb-3 text-lg">
                      {estudo.livro} {estudo.referencia}
                    </p>
                    <p className="text-gray-600 italic">&ldquo;{estudo.texto_versiculo}&rdquo;</p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right arrow */}
          <button
            onClick={goNext}
            disabled={total <= 1}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none shadow-sm"
            aria-label="Próximo estudo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Position indicator */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            {estudos.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1)
                  setCurrentIndex(i)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === currentIndex ? 'bg-blue-600 w-4' : 'bg-blue-200 hover:bg-blue-400'
                }`}
                aria-label={`Ir para estudo ${i + 1}`}
              />
            ))}
          </div>
        )}
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
                <p className="text-gray-600 italic mt-2 mb-3">
                  &ldquo;{estudo.texto_versiculo}&rdquo;
                </p>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(parseLocalDate(estudo.data_estudo), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
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
