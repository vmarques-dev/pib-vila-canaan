'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EquipePastoral } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { User } from 'lucide-react'

interface EquipeSectionProps {
  equipe: EquipePastoral[]
}

export default function EquipeSection({ equipe }: EquipeSectionProps) {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossa Liderança</h2>
          <p className="text-xl text-gray-600">
            Uma equipe dedicada a servir e cuidar do rebanho com amor e sabedoria
          </p>
        </motion.div>

        {equipe.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {equipe.map((membro, index) => (
              <motion.div
                key={membro.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  {/* Decorative top stripe */}
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400" />
                  <CardContent className="pt-8 pb-8 flex flex-col items-center flex-1">
                    {/* Photo */}
                    <div className="mb-5">
                      {membro.foto_url ? (
                        <div className="relative w-28 h-28 mx-auto">
                          <Image
                            src={membro.foto_url}
                            alt={membro.nome}
                            fill
                            className="rounded-full object-cover border-4 border-blue-100 shadow-md"
                            sizes="112px"
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-full mx-auto bg-blue-100 flex items-center justify-center border-4 border-blue-200 shadow-md">
                          <User className="h-14 w-14 text-blue-700" />
                        </div>
                      )}
                    </div>

                    {/* Name and role */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">
                      {membro.nome}
                    </h3>
                    <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full border border-blue-200 mb-4">
                      {membro.cargo}
                    </span>

                    {/* Divider */}
                    {membro.descricao && (
                      <>
                        <div className="w-10 border-t-2 border-blue-200 mb-4" />
                        <p className="text-sm text-gray-600 text-center leading-relaxed">
                          {membro.descricao}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">Informações da equipe em breve!</div>
        )}
      </div>
    </section>
  )
}
