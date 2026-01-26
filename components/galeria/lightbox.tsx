'use client'

import { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Galeria } from '@/types'

interface LightboxProps {
  fotos: Galeria[]
  fotoAtual: Galeria | null
  onClose: () => void
  onNavigate: (foto: Galeria) => void
}

export function Lightbox({ fotos, fotoAtual, onClose, onNavigate }: LightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const currentIndex = fotoAtual ? fotos.findIndex((f) => f.id === fotoAtual.id) : -1
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < fotos.length - 1

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setImageLoaded(false)
      setIsZoomed(false)
      onNavigate(fotos[currentIndex - 1])
    }
  }, [hasPrevious, currentIndex, fotos, onNavigate])

  const goToNext = useCallback(() => {
    if (hasNext) {
      setImageLoaded(false)
      setIsZoomed(false)
      onNavigate(fotos[currentIndex + 1])
    }
  }, [hasNext, currentIndex, fotos, onNavigate])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    },
    [onClose, goToPrevious, goToNext]
  )

  useEffect(() => {
    if (fotoAtual) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fotoAtual, handleKeyDown])

  useEffect(() => {
    setImageLoaded(false)
  }, [fotoAtual?.id])

  if (!fotoAtual) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label={`Visualização de ${fotoAtual.titulo}`}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-4">
            <span className="text-white/70 text-sm font-medium tabular-nums">
              {currentIndex + 1} / {fotos.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={isZoomed ? 'Reduzir zoom' : 'Aumentar zoom'}
            >
              {isZoomed ? (
                <ZoomOut className="w-5 h-5 text-white" />
              ) : (
                <ZoomIn className="w-5 h-5 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation - Previous */}
        {hasPrevious && (
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </button>
        )}

        {/* Navigation - Next */}
        {hasNext && (
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </button>
        )}

        {/* Image Container */}
        <motion.div
          key={fotoAtual.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`relative z-[5] w-full h-full flex items-center justify-center p-4 md:p-20 pt-20 pb-32 ${
            isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <div
            className={`relative w-full h-full transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
            <Image
              src={fotoAtual.url}
              alt={fotoAtual.titulo}
              fill
              sizes="100vw"
              className={`object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              priority
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </motion.div>

        {/* Footer - Photo Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8"
        >
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-3 py-1 mb-2 text-xs font-medium text-white/90 bg-white/20 rounded-full backdrop-blur-sm">
              {fotoAtual.categoria}
            </span>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">
              {fotoAtual.titulo}
            </h2>
            {fotoAtual.descricao && (
              <p className="text-white/70 text-sm md:text-base max-w-2xl">
                {fotoAtual.descricao}
              </p>
            )}
          </div>
        </motion.div>

        {/* Thumbnail Navigation */}
        <div className="absolute bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 z-10 hidden md:flex gap-2 p-2 bg-black/40 rounded-lg backdrop-blur-sm max-w-[90vw] overflow-x-auto">
          {fotos.map((foto, index) => (
            <button
              key={foto.id}
              onClick={() => {
                setImageLoaded(false)
                setIsZoomed(false)
                onNavigate(foto)
              }}
              className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                foto.id === fotoAtual.id
                  ? 'ring-2 ring-white scale-110'
                  : 'opacity-50 hover:opacity-100'
              }`}
              aria-label={`Ir para foto ${index + 1}: ${foto.titulo}`}
            >
              <Image
                src={foto.url}
                alt={foto.titulo}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
