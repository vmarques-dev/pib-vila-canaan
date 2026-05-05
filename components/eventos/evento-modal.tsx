'use client'

import { useState, useEffect, useMemo } from 'react'
import { Evento } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, CheckCircle2, Loader2, LogIn, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate, formatHorario } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { toast } from 'sonner'

type RegistrationState = 'idle' | 'submitting' | 'registered'

interface AdoradorProfile {
  id: string
  nome: string
  email: string
  telefone?: string | null
}

interface EventoModalProps {
  evento: Evento | null
  isOpen: boolean
  onClose: () => void
}

export default function EventoModal({ evento, isOpen, onClose }: EventoModalProps) {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [regState, setRegState] = useState<RegistrationState>('idle')
  const [adoradorProfile, setAdoradorProfile] = useState<AdoradorProfile | null>(null)

  const checkAdoradorStatus = async () => {
    if (!user || !evento) return

    const { data: adorador } = await supabase
      .from('adoradores')
      .select('id, nome, email, telefone')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adorador) return

    setAdoradorProfile(adorador)

    const { data: existing } = await supabase
      .from('inscricoes')
      .select('id')
      .eq('evento_id', evento.id)
      .eq('adorador_id', adorador.id)
      .maybeSingle()

    if (existing) {
      setRegState('registered')
    }
  }

  useEffect(() => {
    if (!isOpen || !evento) return

    setRegState('idle')
    setAdoradorProfile(null)

    if (user && !evento.concluido) {
      checkAdoradorStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, evento?.id, user])

  const handleLoginRedirect = () => {
    onClose()
    router.push('/login/adorador')
  }

  const handleAdoradorRegister = async () => {
    if (!evento || !adoradorProfile) return

    setRegState('submitting')

    const { error } = await supabase.from('inscricoes').insert({
      evento_id: evento.id,
      adorador_id: adoradorProfile.id,
      nome: adoradorProfile.nome,
      email: adoradorProfile.email,
      telefone: adoradorProfile.telefone ?? null,
    })

    if (error) {
      if (error.code === '23505') {
        setRegState('registered')
        toast.info('Você já está inscrito neste evento.')
      } else {
        setRegState('idle')
        toast.error('Erro ao realizar inscrição. Tente novamente.')
      }
    } else {
      setRegState('registered')
      toast.success('Inscrição confirmada com sucesso!')
    }
  }

  if (!evento) return null

  const renderRegistration = () => {
    if (evento.concluido) return null

    if (regState === 'registered') {
      return (
        <Button
          disabled
          className="w-full bg-green-600 text-white text-base py-6 opacity-100 cursor-not-allowed"
        >
          <CheckCircle2 className="mr-2" size={18} />
          Inscrição realizada!
        </Button>
      )
    }

    if (isAdmin) {
      return (
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <ShieldAlert className="text-gray-500 shrink-0 mt-0.5" size={20} />
          <p className="text-gray-600 text-sm">
            Administradores não realizam inscrições por este canal.
          </p>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <LogIn className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <p className="text-amber-800 text-sm">
              Para se inscrever neste evento, você precisa estar logado no Canal do Adorador.
            </p>
          </div>
          <Button
            onClick={handleLoginRedirect}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white text-base py-6"
          >
            <LogIn className="mr-2" size={18} />
            Fazer Login
          </Button>
        </div>
      )
    }

    if (adoradorProfile) {
      return (
        <div className="space-y-3">
          <div className="px-4 py-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            Inscrição como: <strong>{adoradorProfile.nome}</strong> ({adoradorProfile.email})
          </div>
          <Button
            onClick={handleAdoradorRegister}
            disabled={regState === 'submitting'}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white text-base py-6"
          >
            {regState === 'submitting' ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Inscrevendo...
              </>
            ) : (
              'Confirmar Inscrição'
            )}
          </Button>
        </div>
      )
    }

    return (
      <Button
        onClick={handleAdoradorRegister}
        disabled={regState === 'submitting'}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white text-base py-6"
      >
        {regState === 'submitting' ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={18} />
            Inscrevendo...
          </>
        ) : (
          'Fazer Inscrição'
        )}
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{evento.titulo}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[90vh]">
          {evento.imagem_url && (
            <div className="w-full h-64 md:h-80 overflow-hidden bg-gray-100">
              <img
                src={evento.imagem_url}
                alt={evento.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8 space-y-6 bg-white">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-700">{evento.titulo}</h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-700 flex-shrink-0" />
                  <p className="font-semibold text-gray-900">Data</p>
                </div>
                <p className="text-gray-600 ml-8">
                  {format(parseLocalDate(evento.data_inicio), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                  {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                    <>
                      {' '}
                      até{' '}
                      {format(parseLocalDate(evento.data_fim), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </>
                  )}
                </p>
              </div>

              {formatHorario(evento.horario_inicio, evento.horario_fim) && (
                <div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-700 flex-shrink-0" />
                    <p className="font-semibold text-gray-900">Horário</p>
                  </div>
                  <p className="text-gray-600 ml-8">
                    {formatHorario(evento.horario_inicio, evento.horario_fim)}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-700 flex-shrink-0" />
                  <p className="font-semibold text-gray-900">Local</p>
                </div>
                <p className="text-gray-600 ml-8">{evento.local}</p>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sobre o Evento</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {evento.descricao}
              </p>
            </div>

            {!evento.concluido && <div className="pt-2">{renderRegistration()}</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
