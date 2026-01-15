'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Heart, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-700 to-blue-800 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Faça Parte da Nossa Família
          </h2>
          <p className="text-xl text-blue-50 mb-10">
            Juntos, podemos crescer na fé, servir à comunidade e glorificar a Deus
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Heart,
                title: 'Comunhão',
                description: 'Relacionamentos genuínos e amor fraternal',
              },
              {
                icon: BookOpen,
                title: 'Ensino',
                description: 'Crescimento através da Palavra de Deus',
              },
              {
                icon: Users,
                title: 'Serviço',
                description: 'Transformando vidas através do amor',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
              >
                <item.icon className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-blue-50">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contato">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-3 border-2 border-transparent"
              >
                Entre em Contato
              </Button>
            </Link>
            <Link href="/sobre">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3"
              >
                Saiba Mais
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
