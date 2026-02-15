'use client'

import Link from 'next/link'
import { User, Shield } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Acesse sua Área
          </h1>
          <p className="text-gray-600">
            Escolha o canal de acesso adequado
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative">
          {/* Canal do Adorador */}
          <Link href="/login/adorador">
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <User className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Canal do Adorador</h2>
                <p className="text-gray-600">
                  Acesse para acompanhar eventos, estudos bíblicos, galeria e novidades da igreja
                </p>
                <div className="pt-4">
                  <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors">
                    Acessar →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Divisória vertical - apenas desktop */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-px bg-gray-300" />

          {/* Canal do Administrador */}
          <Link href="/login/admin">
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-500 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <Shield className="w-10 h-10 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Canal do Administrador</h2>
                <p className="text-gray-600">
                  Acesse o painel administrativo completo com todas as funcionalidades
                </p>
                <div className="pt-4">
                  <span className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg group-hover:bg-green-700 transition-colors">
                    Acessar →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Precisa de ajuda? <Link href="/contato" className="text-blue-600 hover:underline">Entre em contato</Link></p>
        </div>
      </div>
    </div>
  )
}
