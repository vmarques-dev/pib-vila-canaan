'use client'

import { useEffect, useState, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Save } from 'lucide-react'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

/**
 * Dados de configuração da igreja
 */
interface Configuracoes {
  id: string
  nome: string
  endereco: string
  telefone: string
  email: string
  missao: string
  visao: string
}

/**
 * Página de configurações gerais da igreja
 *
 * Permite editar informações básicas exibidas no site público:
 * nome, endereço, telefone, email, missão e visão da igreja.
 * Os dados são persistidos na tabela 'informacoes_igreja'.
 *
 * @see {@link file://../../../lib/supabase/browser.ts} Cliente Supabase utilizado
 * @see {@link file://../../../middleware.ts} Middleware que protege esta rota
 */
export default function ConfiguracoesPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    missao: '',
    visao: '',
  })

  useEffect(() => {
    // Middleware já protege a rota, apenas carregar configurações
    fetchConfiguracoes()
  }, [])

  const fetchConfiguracoes = async () => {
    const { data, error } = await supabase
      .from('informacoes_igreja')
      .select('*')
      .single()

    if (error) {
      logger.error('Erro ao buscar configurações', error)
    } else if (data) {
      setConfigId(data.id)
      setFormData({
        nome: data.nome || '',
        endereco: data.endereco || '',
        telefone: data.telefone || '',
        email: data.email || '',
        missao: data.missao || '',
        visao: data.visao || '',
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (configId) {
        const { error } = await supabase
          .from('informacoes_igreja')
          .update(formData)
          .eq('id', configId)

        if (error) {
          logger.error('Erro ao atualizar configurações', error)
          toast.error('Erro ao atualizar configurações: ' + error.message)
        } else {
          toast.success('Configurações atualizadas com sucesso!')
        }
      } else {
        const { data, error } = await supabase
          .from('informacoes_igreja')
          .insert([formData])
          .select()
          .single()

        if (error) {
          logger.error('Erro ao criar configurações', error)
          toast.error('Erro ao criar configurações: ' + error.message)
        } else {
          setConfigId(data.id)
          toast.success('Configurações criadas com sucesso!')
        }
      }
    } catch (error) {
      logger.error('Erro ao salvar configurações', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <div>Carregando...</div>
      </main>
    )
  }

  return (
    <main className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Configure as informações da igreja</p>
      </header>

      <div className="bg-white rounded-lg shadow p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome da Igreja
            </label>
            <input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="endereco"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Endereço
            </label>
            <input
              id="endereco"
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Telefone
              </label>
              <input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="missao"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Missão
            </label>
            <textarea
              id="missao"
              value={formData.missao}
              onChange={(e) => setFormData({ ...formData, missao: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="visao"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Visão
            </label>
            <textarea
              id="visao"
              value={formData.visao}
              onChange={(e) => setFormData({ ...formData, visao: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Salvar configurações"
            >
              <Save size={20} />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
