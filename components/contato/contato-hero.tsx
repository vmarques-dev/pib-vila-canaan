'use client'

import { motion } from 'framer-motion'

export default function ContatoHero() {
  return (
    <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Contato</h1>
        <p className="text-xl text-blue-50">
          Estamos aqui para ajudar você
        </p>
      </motion.div>
    </section>
  )
}
