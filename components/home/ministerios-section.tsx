'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

export default function MinisteriosSection() {
  const ministerios = [
    { name: 'Jovens', emoji: '🙌', descricao: 'Ministério voltado para jovens' },
    { name: 'Crianças', emoji: '👶', descricao: 'Educação cristã infantil' },
    { name: 'Mulheres', emoji: '👩', descricao: 'Encontros e estudos femininos' },
    { name: 'Homens', emoji: '👨', descricao: 'Fortalecimento masculino' },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nossos Ministérios
          </h2>
          <p className="text-xl text-gray-600">
            Encontre seu lugar para servir e crescer
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ministerios.map((ministerio, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-blue-200 h-full">
                <CardContent className="pt-8 pb-6">
                  <div className="text-6xl mb-4">{ministerio.emoji}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {ministerio.name}
                  </h3>
                  <p className="text-sm text-gray-600">{ministerio.descricao}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
