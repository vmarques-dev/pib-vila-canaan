'use client'

import { Evento } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventoModalProps {
  evento: Evento | null
  isOpen: boolean
  onClose: () => void
}

export default function EventoModal({ evento, isOpen, onClose }: EventoModalProps) {
  if (!evento) return null

  const handleInscricao = () => {
    // Substitua o número abaixo pelo WhatsApp real da igreja
    const whatsappNumber = '5521999999999'
    const mensagem = `Olá! Gostaria de me inscrever no evento: ${evento.titulo}`
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0">
        {/* Título escondido visualmente mas acessível para leitores de tela */}
        <DialogHeader className="sr-only">
          <DialogTitle>{evento.titulo}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Imagem do evento - Topo */}
          {evento.imagem_url && (
            <div className="w-full h-64 md:h-80 overflow-hidden bg-gray-100">
              <img
                src={evento.imagem_url}
                alt={evento.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Conteúdo - Abaixo da imagem */}
          <div className="p-6 md:p-8 space-y-6 bg-white">
            {/* Título */}
            <h2 className="text-3xl md:text-4xl font-bold text-blue-700">
              {evento.titulo}
            </h2>

            {/* Informações do evento */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-700 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Data</p>
                  <p className="text-gray-600">
                    {format(parseISO(evento.data_inicio), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                    {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                      <> até {format(parseISO(evento.data_fim), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-700 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Horário</p>
                  <p className="text-gray-600">{evento.horario}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-700 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Local</p>
                  <p className="text-gray-600">{evento.local}</p>
                </div>
              </div>
            </div>

            {/* Divisor */}
            <div className="border-t border-gray-200"></div>

            {/* Descrição */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sobre o Evento</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {evento.descricao}
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {!evento.concluido && (
                <Button
                  onClick={handleInscricao}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-base py-6"
                >
                  Fazer Inscrição
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className={`${evento.concluido ? 'flex-1' : 'sm:w-auto'} px-8 text-base py-6`}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
