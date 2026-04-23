'use client'

import { motion } from 'framer-motion'

export default function HistoriaSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Nossa História</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              A PIB Vila Canaan nasceu do desejo de levar o evangelho e servir à comunidade local.
              Somos uma igreja que acredita na transformação através do amor de Cristo.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Com anos de história, temos visto Deus agir poderosamente na vida de muitas pessoas,
              restaurando famílias e trazendo esperança para todos que nos visitam.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nossa jornada é marcada pela fidelidade a Deus e pelo compromisso com a comunidade,
              sempre buscando ser sal e luz no mundo.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
