'use client'

import { useState, useMemo } from 'react'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableColumn, AdminTableAction } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import type { Aviso } from '@/lib/types/database'

const initialFormData = { titulo: '', conteudo: '', ativo: true }

export default function AvisosPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [formTitulo, setFormTitulo] = useState('')
  const [formConteudo, setFormConteudo] = useState('')
  const [formAtivo, setFormAtivo] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Aviso | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    items: avisos,
    loading,
    showModal,
    editingItem,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal,
    fetchItems,
  } = useAdminCRUD<Aviso>({
    tableName: 'avisos',
    orderBy: { column: 'created_at', ascending: false },
    initialFormData,
  })

  const handleOpenCreate = () => {
    setFormTitulo('')
    setFormConteudo('')
    setFormAtivo(true)
    openCreateModal()
  }

  const handleOpenEdit = (aviso: Aviso) => {
    setFormTitulo(aviso.titulo)
    setFormConteudo(aviso.conteudo)
    setFormAtivo(aviso.ativo)
    openEditModal(aviso)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitulo.trim() || !formConteudo.trim()) {
      toast.error('Preencha todos os campos.')
      return
    }
    setSaving(true)
    try {
      const payload = { titulo: formTitulo.trim(), conteudo: formConteudo.trim(), ativo: formAtivo }

      if (editingItem) {
        const { error } = await supabase.from('avisos').update(payload).eq('id', editingItem.id)
        if (error) throw error
        toast.success('Aviso atualizado!')
      } else {
        const { error } = await supabase.from('avisos').insert(payload)
        if (error) throw error
        toast.success('Aviso criado!')
      }

      closeModal()
      await fetchItems()
    } catch {
      toast.error('Erro ao salvar aviso.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleAtivo = async (aviso: Aviso) => {
    const { error } = await supabase
      .from('avisos')
      .update({ ativo: !aviso.ativo })
      .eq('id', aviso.id)

    if (error) {
      toast.error('Erro ao atualizar aviso.')
    } else {
      toast.success(aviso.ativo ? 'Aviso desativado.' : 'Aviso ativado.')
      await fetchItems()
    }
  }

  const executeDelete = async () => {
    if (!confirmDelete) return
    setIsProcessing(true)
    try {
      await handleDelete(confirmDelete.id, '')
    } finally {
      setIsProcessing(false)
      setConfirmDelete(null)
    }
  }

  const columns: AdminTableColumn<Aviso>[] = [
    {
      header: 'Título',
      width: '50%',
      accessor: (aviso) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{aviso.titulo}</div>
          <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">{aviso.conteudo}</div>
        </div>
      ),
    },
    {
      header: 'Data',
      width: '120px',
      accessor: (aviso) => (
        <div className="text-sm text-gray-500">
          {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
        </div>
      ),
    },
    {
      header: 'Status',
      width: '110px',
      headerClassName:
        'px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider',
      cellClassName: 'px-4 py-4 text-center',
      accessor: (aviso) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            aviso.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {aviso.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ]

  const actions: AdminTableAction<Aviso>[] = [
    {
      icon: <Edit size={18} />,
      onClick: handleOpenEdit,
      className: 'text-blue-600 hover:text-blue-900',
      ariaLabel: 'Editar aviso',
    },
    {
      icon: (aviso) => (aviso.ativo ? <Eye size={18} /> : <EyeOff size={18} />),
      onClick: handleToggleAtivo,
      className: 'text-blue-600 hover:text-blue-900',
      ariaLabel: 'Ativar/Desativar aviso',
    },
    {
      icon: <Trash2 size={18} />,
      onClick: setConfirmDelete,
      className: 'text-red-600 hover:text-red-900',
      ariaLabel: 'Excluir aviso',
    },
  ]

  if (loading) {
    return (
      <main className="p-8">
        <div>Carregando...</div>
      </main>
    )
  }

  return (
    <main className="p-8">
      <AdminPageHeader
        title="Mural de Avisos"
        description="Gerencie os avisos exibidos no Canal do Adorador"
        buttonLabel="Novo Aviso"
        onButtonClick={handleOpenCreate}
      />

      <AdminTable
        columns={columns}
        data={avisos}
        actions={actions}
        emptyMessage="Nenhum aviso cadastrado"
      />

      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={editingItem ? 'Editar Aviso' : 'Novo Aviso'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input
              type="text"
              value={formTitulo}
              onChange={(e) => setFormTitulo(e.target.value)}
              placeholder="Título do aviso"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
            <textarea
              rows={5}
              value={formConteudo}
              onChange={(e) => setFormConteudo(e.target.value)}
              placeholder="Texto do aviso..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="ativo"
              type="checkbox"
              checked={formAtivo}
              onChange={(e) => setFormAtivo(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
              Aviso ativo (visível para membros)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Excluir aviso"
        message={`Tem certeza que deseja excluir o aviso "${confirmDelete?.titulo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isProcessing}
      />
    </main>
  )
}
