'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Estudo } from '@/types'
import EstudoDestaque from './estudo-destaque'
import EstudosLista from './estudos-lista'

interface EstudosComFiltroProps {
  estudosAtivos: Estudo[]
  estudosAnteriores: Estudo[]
}

const categorias = ['Todas', 'EBD', 'Culto', 'Jovens', 'Infantil', 'Pregação']

export default function EstudosComFiltro({ estudosAtivos, estudosAnteriores }: EstudosComFiltroProps) {
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas')

  // Filtrar apenas estudos anteriores pela categoria
  const estudosFiltrados = estudosAnteriores.filter((estudo) => {
    if (categoriaFiltro === 'Todas') return true
    return estudo.categoria === categoriaFiltro
  })

  return (
    <>
      {/* Estudos Ativos — sempre exibidos, independente do filtro */}
      {estudosAtivos.length > 0 && <EstudoDestaque estudos={estudosAtivos} />}

      {/* Filtros */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center mb-8"
          >
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  categoriaFiltro === cat
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lista de Estudos Filtrados */}
      <EstudosLista estudos={estudosFiltrados} />
    </>
  )
}
