'use client'

import { useEffect, useMemo, useCallback, useState } from 'react'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableColumn, AdminTableAction } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'
import { versiculoDestaqueSchema, type VersiculoDestaqueFormData } from '@/lib/validations/admin'
import { toast } from 'sonner'

/**
 * Represents a featured verse.
 */
interface VersiculoDestaque {
  id: string
  livro: string
  referencia: string
  texto: string
  ativo: boolean
  created_at: string
}

const LIVROS_BIBLIA = [
  'Gênesis',
  'Êxodo',
  'Levítico',
  'Números',
  'Deuteronômio',
  'Josué',
  'Juízes',
  'Rute',
  '1 Samuel',
  '2 Samuel',
  '1 Reis',
  '2 Reis',
  '1 Crônicas',
  '2 Crônicas',
  'Esdras',
  'Neemias',
  'Ester',
  'Jó',
  'Salmos',
  'Provérbios',
  'Eclesiastes',
  'Cantares',
  'Isaías',
  'Jeremias',
  'Lamentações',
  'Ezequiel',
  'Daniel',
  'Oséias',
  'Joel',
  'Amós',
  'Obadias',
  'Jonas',
  'Miquéias',
  'Naum',
  'Habacuque',
  'Sofonias',
  'Ageu',
  'Zacarias',
  'Malaquias',
  'Mateus',
  'Marcos',
  'Lucas',
  'João',
  'Atos',
  'Romanos',
  '1 Coríntios',
  '2 Coríntios',
  'Gálatas',
  'Efésios',
  'Filipenses',
  'Colossenses',
  '1 Tessalonicenses',
  '2 Tessalonicenses',
  '1 Timóteo',
  '2 Timóteo',
  'Tito',
  'Filemom',
  'Hebreus',
  'Tiago',
  '1 Pedro',
  '2 Pedro',
  '1 João',
  '2 João',
  '3 João',
  'Judas',
  'Apocalipse',
]

const initialFormData = {
  livro: '',
  referencia: '',
  texto: '',
  ativo: false,
}

/**
 * Featured-verse management page.
 *
 * Allows creating, editing, toggling, and deleting featured verses.
 * Only one verse can be active at a time — activating one
 * automatically deactivates the others.
 *
 * @see {@link file://../../../lib/supabase/browser.ts} Supabase client used here
 */
export default function VersiculoDestaquePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  // State for the deletion confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<VersiculoDestaque | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    items: versiculos,
    loading,
    showModal,
    editingItem,
    handleCreate,
    handleUpdate,
    fetchItems,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useAdminCRUD<VersiculoDestaque>({
    tableName: 'versiculo_destaque',
    orderBy: { column: 'created_at', ascending: false },
    initialFormData,
  })

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<VersiculoDestaqueFormData>({
    resolver: zodResolver(versiculoDestaqueSchema),
    defaultValues: initialFormData,
  })

  /**
   * Deactivates every other active verse except the given one.
   *
   * First checks whether any active verses exist before trying to
   * deactivate them. If none are active (or none exist), does nothing.
   *
   * @param excludeId - Optional verse ID to exclude from deactivation
   * @returns Object with success (true/false) and an error message if any
   */
  const deactivateOtherVerses = useCallback(
    async (excludeId?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        // First, check whether any active verses exist
        let query = supabase.from('versiculo_destaque').select('id').eq('ativo', true)

        // If an ID is provided, exclude it from the query
        if (excludeId) {
          query = query.neq('id', excludeId)
        }

        const { data: activeVerses, error: selectError } = await query

        if (selectError) {
          logger.error('Erro ao verificar versículos ativos', selectError)
          return { success: false, error: 'Erro ao verificar versículos ativos' }
        }

        // If there are no active verses to deactivate, return success
        if (!activeVerses || activeVerses.length === 0) {
          return { success: true }
        }

        // Deactivate the active verses we found
        const idsToDeactivate = activeVerses.map((v) => v.id)
        const { error: updateError } = await supabase
          .from('versiculo_destaque')
          .update({ ativo: false })
          .in('id', idsToDeactivate)

        if (updateError) {
          logger.error('Erro ao desativar versículos', updateError)
          return { success: false, error: 'Erro ao desativar outros versículos' }
        }

        return { success: true }
      } catch (error) {
        logger.error('Erro inesperado ao desativar versículos', error)
        return { success: false, error: 'Erro inesperado ao desativar versículos' }
      }
    },
    [supabase]
  )

  // Populate the form when editing
  useEffect(() => {
    if (editingItem) {
      setValue('livro', editingItem.livro)
      setValue('referencia', editingItem.referencia)
      setValue('texto', editingItem.texto)
      setValue('ativo', editingItem.ativo)
    } else {
      reset(initialFormData)
    }
  }, [editingItem, setValue, reset])

  /**
   * Handles the create/edit form submission.
   *
   * When activating a verse, deactivates the others first.
   */
  const onSubmit = async (data: VersiculoDestaqueFormData) => {
    // If activating, deactivate every other verse first
    if (data.ativo) {
      const { success, error } = await deactivateOtherVerses(editingItem?.id)
      if (!success) {
        toast.error(error || 'Erro ao desativar outros versículos')
        return
      }
    }

    if (editingItem) {
      await handleUpdate(editingItem.id, data)
    } else {
      await handleCreate(data)
    }

    reset(initialFormData)
  }

  const handleModalClose = () => {
    closeModal()
    reset(initialFormData)
  }

  /**
   * Opens the deletion confirmation dialog.
   *
   * @param versiculo - Verse to be deleted
   */
  const openDeleteDialog = (versiculo: VersiculoDestaque) => {
    setItemToDelete(versiculo)
    setShowDeleteDialog(true)
  }

  /**
   * Closes the deletion confirmation dialog.
   */
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false)
    setItemToDelete(null)
  }

  /**
   * Confirms and executes the verse deletion.
   */
  const confirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)

    try {
      const { error } = await supabase.from('versiculo_destaque').delete().eq('id', itemToDelete.id)

      if (error) {
        logger.error('Erro ao excluir versículo', error)
        toast.error('Erro ao excluir versículo: ' + error.message)
      } else {
        toast.success('Versículo excluído com sucesso!')
        await fetchItems()
      }
    } catch (error) {
      logger.error('Erro inesperado ao excluir versículo', error)
      toast.error('Erro inesperado ao excluir versículo')
    } finally {
      setIsDeleting(false)
      closeDeleteDialog()
    }
  }

  /**
   * Toggles a verse's active/inactive state.
   *
   * When activating, deactivates every other verse first.
   *
   * @param id - Verse ID
   * @param currentlyActive - Current state (true = active, false = inactive)
   */
  const handleToggleAtivo = async (id: string, currentlyActive: boolean) => {
    if (!currentlyActive) {
      // Activating: deactivate every other verse first
      const { success, error } = await deactivateOtherVerses(id)
      if (!success) {
        toast.error(error || 'Erro ao desativar outros versículos')
        return
      }

      // Activate the selected one
      const { error: activateError } = await supabase
        .from('versiculo_destaque')
        .update({ ativo: true })
        .eq('id', id)

      if (activateError) {
        logger.error('Erro ao ativar versículo', activateError)
        toast.error('Erro ao ativar versículo: ' + activateError.message)
      } else {
        toast.success('Versículo ativado!')
        await fetchItems()
      }
    } else {
      // Deactivating
      const { error } = await supabase
        .from('versiculo_destaque')
        .update({ ativo: false })
        .eq('id', id)

      if (error) {
        logger.error('Erro ao desativar versículo', error)
        toast.error('Erro ao desativar versículo: ' + error.message)
      } else {
        toast.success('Versículo desativado!')
        await fetchItems()
      }
    }
  }

  const columns: AdminTableColumn<VersiculoDestaque>[] = [
    {
      header: 'Referência',
      width: '180px',
      accessor: (versiculo) => (
        <div
          className="text-sm font-medium text-gray-900 truncate"
          title={`${versiculo.livro} ${versiculo.referencia}`}
        >
          {versiculo.livro} {versiculo.referencia}
        </div>
      ),
    },
    {
      header: 'Texto',
      width: '50%',
      accessor: (versiculo) => (
        <div className="text-sm text-gray-500 truncate" title={versiculo.texto}>
          {versiculo.texto}
        </div>
      ),
    },
    {
      header: 'Status',
      width: '100px',
      headerClassName:
        'px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider',
      cellClassName: 'px-4 py-4 text-center',
      accessor: (versiculo) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            versiculo.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {versiculo.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ]

  const actions: AdminTableAction<VersiculoDestaque>[] = [
    {
      icon: <Edit size={18} />,
      onClick: openEditModal,
      className: 'text-blue-600 hover:text-blue-900',
      ariaLabel: 'Editar versículo',
    },
    {
      icon: (versiculo) => (versiculo.ativo ? <Eye size={18} /> : <EyeOff size={18} />),
      onClick: (versiculo) => handleToggleAtivo(versiculo.id, versiculo.ativo),
      className: 'text-blue-600 hover:text-blue-900',
      ariaLabel: 'Ativar/Desativar versículo',
    },
    {
      icon: <Trash2 size={18} />,
      onClick: openDeleteDialog,
      className: 'text-red-600 hover:text-red-900',
      ariaLabel: 'Deletar versículo',
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
        title="Versículo da Semana"
        description="Gerencie o versículo em destaque"
        buttonLabel="Adicionar Versículo"
        onButtonClick={openCreateModal}
      />

      <AdminTable
        columns={columns}
        data={versiculos}
        actions={actions}
        emptyMessage="Nenhum versículo cadastrado"
      />

      <AdminModal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingItem ? 'Editar Versículo' : 'Novo Versículo'}
      >
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="livro" className="block text-sm font-medium text-gray-700 mb-2">
              Livro
            </label>
            <select
              id="livro"
              {...register('livro')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.livro ? 'border-red-500' : ''
              }`}
            >
              <option value="">Selecione o livro</option>
              {LIVROS_BIBLIA.map((livro) => (
                <option key={livro} value={livro}>
                  {livro}
                </option>
              ))}
            </select>
            {errors.livro && <p className="text-sm text-red-500 mt-1">{errors.livro.message}</p>}
          </div>

          <div>
            <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-2">
              Capítulo e Versículo
            </label>
            <input
              id="referencia"
              type="text"
              placeholder="Ex: 3:16"
              {...register('referencia')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.referencia ? 'border-red-500' : ''
              }`}
            />
            {errors.referencia && (
              <p className="text-sm text-red-500 mt-1">{errors.referencia.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="texto" className="block text-sm font-medium text-gray-700 mb-2">
              Texto do Versículo
            </label>
            <textarea
              id="texto"
              {...register('texto')}
              rows={6}
              placeholder="Digite o texto completo do versículo"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                errors.texto ? 'border-red-500' : ''
              }`}
            />
            {errors.texto && <p className="text-sm text-red-500 mt-1">{errors.texto.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="ativo"
              type="checkbox"
              {...register('ativo')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
              Ativar versículo (desativa todos os outros automaticamente)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : editingItem ? 'Atualizar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Excluir versículo"
        message={
          itemToDelete
            ? `Tem certeza que deseja excluir o versículo "${itemToDelete.livro} ${itemToDelete.referencia}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </main>
  )
}
