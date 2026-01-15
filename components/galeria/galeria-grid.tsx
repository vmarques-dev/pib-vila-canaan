'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Galeria } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface GaleriaGridProps {
  fotos: Galeria[]
}

const categorias = ['Todas', 'Cultos', 'Jovens', 'Eventos Especiais', 'Infantil']

export default function GaleriaGrid({ fotos }: GaleriaGridProps) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas')
  const [fotoSelecionada, setFotoSelecionada] = useState<Galeria | null>(null)

  const fotosFiltradas =
    categoriaAtiva === 'Todas'
      ? fotos
      : fotos.filter((foto) => foto.categoria === categoriaAtiva)

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categorias.map((categoria) => (
            <Button
              key={categoria}
              onClick={() => setCategoriaAtiva(categoria)}
              variant={categoriaAtiva === categoria ? 'default' : 'outline'}
              className={
                categoriaAtiva === categoria
                  ? 'bg-blue-700 hover:bg-blue-800'
                  : 'border-2 border-blue-700 text-blue-700 hover:bg-blue-50'
              }
            >
              {categoria}
            </Button>
          ))}
        </div>

        {/* Grid de Fotos */}
        {fotosFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {fotosFiltradas.map((foto, index) => (
              <motion.div
                key={foto.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group cursor-pointer"
                onClick={() => setFotoSelecionada(foto)}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={foto.url}
                    alt={foto.titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <p className="text-white p-4 font-semibold">{foto.titulo}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">
              Nenhuma foto encontrada nesta categoria.
            </p>
          </div>
        )}

        {/* Modal */}
        <Dialog open={!!fotoSelecionada} onOpenChange={() => setFotoSelecionada(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{fotoSelecionada?.titulo}</DialogTitle>
            </DialogHeader>
            {fotoSelecionada && (
              <div className="relative aspect-video w-full">
                <Image
                  src={fotoSelecionada.url}
                  alt={fotoSelecionada.titulo}
                  fill
                  sizes="(max-width: 896px) 100vw, 896px"
                  className="object-contain rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
