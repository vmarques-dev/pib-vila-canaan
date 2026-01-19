'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Evento } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import EventoModal from './evento-modal'

interface EventosGridProps {
  proximosEventos: Evento[]
  eventosAnteriores: Evento[]
}

export default function EventosGrid({ proximosEventos, eventosAnteriores }: EventosGridProps) {
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = (evento: Evento) => {
    setSelectedEvento(evento)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedEvento(null), 200)
  }

  const renderEventCard = (evento: Evento, index: number, isAnterior: boolean = false) => (
    <motion.div
      key={evento.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <Card
        className={`h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer ${
          isAnterior ? 'opacity-75' : ''
        }`}
        onClick={() => handleOpenModal(evento)}
      >
        {evento.imagem_url && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={evento.imagem_url}
              alt={evento.titulo}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl text-blue-700">{evento.titulo}</CardTitle>
          <CardDescription className="space-y-2 text-base">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(evento.data_inicio), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {evento.horario}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {evento.local}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full bg-blue-700 hover:bg-blue-800"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal(evento)
            }}
          >
            Saiba Mais
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <>
      {/* Próximos Eventos */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Próximos Eventos
          </h2>
          {proximosEventos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proximosEventos.map((evento, index) => renderEventCard(evento, index))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg">
              <p className="text-lg text-gray-500">
                Nenhum evento agendado no momento.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Volte em breve para conferir novos eventos!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Eventos Anteriores */}
      {eventosAnteriores.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Eventos Anteriores
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosAnteriores.map((evento, index) => renderEventCard(evento, index, true))}
            </div>
          </div>
        </section>
      )}

      {/* Modal de detalhes do evento */}
      <EventoModal
        evento={selectedEvento}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
