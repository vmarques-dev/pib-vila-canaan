'use client'

import { motion } from 'framer-motion'
import { Heart, Eye, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MissaoVisaoSection() {
  const items = [
    {
      icon: Heart,
      title: 'Missão',
      description:
        'Proclamar o evangelho de Jesus Cristo, fazer discípulos e servir à comunidade com amor e excelência.',
    },
    {
      icon: Eye,
      title: 'Visão',
      description:
        'Ser uma igreja relevante, transformadora e que impacta vidas através do poder do evangelho.',
    },
    {
      icon: Target,
      title: 'Valores',
      description:
        'Adoração genuína, comunhão verdadeira, ensino bíblico, evangelização e serviço ao próximo.',
    },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="h-full shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <item.icon className="h-8 w-8 text-blue-700" />
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
