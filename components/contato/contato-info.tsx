'use client'

import { motion } from 'framer-motion'
import { InformacoesIgreja } from '@/types'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

interface ContatoInfoProps {
  info: InformacoesIgreja | null
}

export default function ContatoInfo({ info }: ContatoInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Informações de Contato
      </h2>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Endereço</h3>
          </div>
          <p className="text-gray-600 whitespace-pre-line ml-16">
            {info?.endereco || 'Rua da Igreja, 123\nVila Canaan - Cidade/UF\nCEP: 00000-000'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Telefone</h3>
          </div>
          <div className="ml-16">
            <p className="text-gray-600">{info?.telefone || '(00) 0000-0000'}</p>
            {info?.whatsapp && (
              <p className="text-gray-600">WhatsApp: {info.whatsapp}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">E-mail</h3>
          </div>
          <p className="text-gray-600 ml-16">
            {info?.email || 'contato@pibvilacanaa.com.br'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Horários</h3>
          </div>
          <p className="text-gray-600 whitespace-pre-line ml-16">
            {info?.horarios || 'Domingos: 9h (EBD), 10h e 18h (Cultos)\nQuartas: 19h30 (Oração)'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
