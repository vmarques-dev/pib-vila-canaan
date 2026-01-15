'use client'

import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { VersiculoDestaque } from '@/types'

interface VersiculoSectionProps {
  versiculo: VersiculoDestaque | null
}

export default function VersiculoSection({ versiculo }: VersiculoSectionProps) {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Versículo da Semana
          </h2>
          {versiculo && versiculo.texto?.trim() ? (
            <>
              <blockquote className="text-2xl md:text-3xl text-gray-800 font-serif italic mb-4 leading-relaxed">
                "{versiculo.texto}"
              </blockquote>
              <p className="text-lg md:text-xl text-blue-700 font-semibold">
                {versiculo.livro} {versiculo.referencia}
              </p>
            </>
          ) : (
            <p className="text-xl text-gray-500 italic">
              Nenhum versículo em destaque no momento
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
