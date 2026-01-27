'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Evento } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import EventoModal from '@/components/eventos/evento-modal'

interface EventosSectionProps {
  eventos: Evento[]
}

export default function EventosSection({ eventos }: EventosSectionProps) {
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

  return (
    <>
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Próximos Eventos
            </h2>
            <p className="text-xl text-gray-600">
              Participe dos nossos encontros e fortaleça sua fé
            </p>
          </motion.div>

          {eventos.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {eventos.map((evento, index) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card
                    className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer"
                    onClick={() => handleOpenModal(evento)}
                  >
                    {evento.imagem_url && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                        <Image
                          src={evento.imagem_url}
                          alt={evento.titulo}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl text-blue-700">{evento.titulo}</CardTitle>
                      <CardDescription className="space-y-2 text-base">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(evento.data_inicio), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {evento.horario}
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
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
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              Nenhum evento agendado no momento. Volte em breve!
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mt-10"
          >
            <Link href="/eventos">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800">
                Ver Todos os Eventos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Modal de detalhes do evento */}
      <EventoModal
        evento={selectedEvento}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
