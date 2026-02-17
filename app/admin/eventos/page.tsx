'use client'

import { useState, useMemo } from 'react'
import { Edit, Trash2, CheckCircle } from 'lucide-react'
import { parseISO, format } from 'date-fns'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableColumn, AdminTableAction } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { EventoForm } from '@/components/admin/eventos/EventoForm'
import { type EventoFormData } from '@/lib/validations/admin'
import { type Evento } from '@/lib/types'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { uploadImage, deleteImage, optimizeImage } from '@/lib/services/storage.service'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

/**
 * Página de gerenciamento de eventos
 *
 * Permite criar, editar, concluir e excluir eventos da igreja.
 * Suporta upload de imagens com otimização automática.
 * Ao concluir um evento, a imagem é excluída para economizar espaço.
 *
 * @see {@link file://../../../hooks/useAdminCRUD.ts} Hook de CRUD utilizado
 * @see {@link file://../../../lib/supabase/browser.ts} Cliente Supabase utilizado
 * @see {@link file://../../../middleware.ts} Middleware que protege esta rota
 */

const initialFormData = {
  titulo: '',
  descricao: '',
  data_inicio: '',
  data_fim: '',
  horario: '',
  local: '',
}

export default function EventosPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Estados para diálogos de confirmação
  const [confirmConcluir, setConfirmConcluir] = useState<Evento | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Evento | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    items: eventos,
    loading,
    showModal,
    editingItem,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchItems,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useAdminCRUD<Evento>({
    tableName: 'eventos',
    orderBy: { column: 'data_inicio', ascending: false },
    initialFormData,
  })

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: EventoFormData) => {
    try {
      let finalImageUrl = ''

      // Upload de imagem se houver arquivo
      if (imageFile) {
        setUploadingImage(true)
        toast.info('Otimizando e enviando imagem...')

        const optimizedFile = await optimizeImage(imageFile)
        const uploadedUrl = await uploadImage(optimizedFile, 'eventos')

        if (!uploadedUrl) {
          toast.error('Erro ao fazer upload da imagem')
          setUploadingImage(false)
          return
        }

        finalImageUrl = uploadedUrl
        setUploadingImage(false)
      }

      const dataToSubmit = {
        ...data,
        data_fim: data.data_fim?.trim() || undefined,
        imagem_url: finalImageUrl || undefined,
      }

      if (editingItem) {
        // Deletar imagem antiga se estiver trocando
        if (editingItem.imagem_url && imageFile) {
          await deleteImage(editingItem.imagem_url, 'eventos')
        }
        await handleUpdate(editingItem.id, dataToSubmit)
      } else {
        await handleCreate(dataToSubmit)
      }

      handleModalClose()
    } catch (error) {
      logger.error('Erro ao salvar evento', error)
      toast.error('Erro ao salvar evento')
      setUploadingImage(false)
    }
  }

  const handleModalClose = () => {
    closeModal()
    setImageFile(null)
    setImagePreview(null)
  }

  const handleConcluirEvento = (evento: Evento) => {
    if (evento.concluido) {
      toast.info('Este evento já está concluído')
      return
    }
    setConfirmConcluir(evento)
  }

  const executeConcluirEvento = async () => {
    if (!confirmConcluir) return

    setIsProcessing(true)
    try {
      if (confirmConcluir.imagem_url) {
        const deleted = await deleteImage(confirmConcluir.imagem_url, 'eventos')
        if (!deleted) {
          logger.warn('Não foi possível excluir a imagem', {
            url: confirmConcluir.imagem_url,
          })
        }
      }

      const { error } = await supabase
        .from('eventos')
        .update({
          concluido: true,
          imagem_url: null,
        })
        .eq('id', confirmConcluir.id)

      if (error) {
        logger.error('Erro ao concluir evento', error)
        toast.error('Erro ao concluir evento: ' + error.message)
      } else {
        toast.success('Evento concluído com sucesso!')
        await fetchItems()
      }
    } catch (error) {
      logger.error('Erro ao concluir evento', error)
      toast.error('Erro ao concluir evento')
    } finally {
      setIsProcessing(false)
      setConfirmConcluir(null)
    }
  }

  const handleDeleteEvento = (evento: Evento) => {
    setConfirmDelete(evento)
  }

  const executeDeleteEvento = async () => {
    if (!confirmDelete) return

    setIsProcessing(true)
    try {
      if (confirmDelete.imagem_url) {
        await deleteImage(confirmDelete.imagem_url, 'eventos')
      }
      await handleDelete(confirmDelete.id, '')
    } finally {
      setIsProcessing(false)
      setConfirmDelete(null)
    }
  }

  const columns: AdminTableColumn<Evento>[] = [
    {
      header: 'Título',
      width: '25%',
      accessor: (evento) => (
        <div className="text-sm font-medium text-gray-900 truncate" title={evento.titulo}>
          {evento.titulo}
        </div>
      ),
    },
    {
      header: 'Data',
      width: '100px',
      accessor: (evento) => (
        <div className="text-sm text-gray-500">
          {format(parseISO(evento.data_inicio), 'dd/MM/yyyy')}
        </div>
      ),
    },
    {
      header: 'Horário',
      width: '120px',
      accessor: (evento) => (
        <div className="text-sm text-gray-500 truncate" title={evento.horario}>
          {evento.horario}
        </div>
      ),
    },
    {
      header: 'Local',
      width: '25%',
      accessor: (evento) => (
        <div className="text-sm text-gray-500 truncate" title={evento.local}>
          {evento.local}
        </div>
      ),
    },
    {
      header: 'Status',
      width: '100px',
      accessor: (evento) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            evento.concluido
              ? 'bg-gray-100 text-gray-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {evento.concluido ? 'Concluído' : 'Ativo'}
        </span>
      ),
    },
  ]

  const actions: AdminTableAction<Evento>[] = [
    {
      icon: <Edit size={18} />,
      onClick: openEditModal,
      className: 'text-blue-600 hover:text-blue-900',
      ariaLabel: 'Editar evento',
    },
    {
      icon: (evento) =>
        evento.concluido ? (
          <CheckCircle size={18} className="opacity-50" />
        ) : (
          <CheckCircle size={18} />
        ),
      onClick: handleConcluirEvento,
      className: 'text-green-600 hover:text-green-900',
      ariaLabel: 'Concluir evento',
    },
    {
      icon: <Trash2 size={18} />,
      onClick: handleDeleteEvento,
      className: 'text-red-600 hover:text-red-900',
      ariaLabel: 'Deletar evento',
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
        title="Eventos"
        description="Gerencie os eventos da igreja"
        buttonLabel="Novo Evento"
        onButtonClick={openCreateModal}
      />

      <AdminTable
        columns={columns}
        data={eventos}
        actions={actions}
        emptyMessage="Nenhum evento cadastrado"
      />

      <AdminModal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingItem ? 'Editar Evento' : 'Novo Evento'}
      >
        <EventoForm
          editingItem={editingItem}
          onSubmit={onSubmit}
          onCancel={handleModalClose}
          imageFile={imageFile}
          imagePreview={imagePreview}
          uploadingImage={uploadingImage}
          onImageFileChange={handleImageFileChange}
        />
      </AdminModal>

      <ConfirmDialog
        isOpen={!!confirmConcluir}
        onClose={() => setConfirmConcluir(null)}
        onConfirm={executeConcluirEvento}
        title="Concluir evento"
        message={
          confirmConcluir?.imagem_url
            ? `Deseja marcar "${confirmConcluir?.titulo}" como concluído? A imagem do evento será excluída automaticamente para economizar espaço de armazenamento.`
            : `Deseja marcar "${confirmConcluir?.titulo}" como concluído?`
        }
        confirmText="Concluir"
        cancelText="Cancelar"
        variant="success"
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDeleteEvento}
        title="Excluir evento"
        message={`Tem certeza que deseja excluir o evento "${confirmDelete?.titulo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isProcessing}
      />
    </main>
  )
}
