'use client'

import { useState, useMemo, useEffect } from 'react'
import { Edit, Trash2, Eye, EyeOff, Users } from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableColumn, AdminTableAction } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { EventoForm } from '@/components/admin/eventos/EventoForm'
import { type EventoFormData } from '@/lib/validations/admin'
import { type Evento, type Inscricao } from '@/lib/types'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { uploadImage, deleteImage, optimizeImage } from '@/lib/services/storage.service'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

/**
 * Events management page.
 *
 * Allows admins to create, edit, complete, and delete church events.
 * Supports image upload with automatic optimization. When an event is
 * marked as completed, its image is deleted to save storage.
 *
 * @see {@link file://../../../hooks/useAdminCRUD.ts} CRUD hook used here
 * @see {@link file://../../../lib/supabase/browser.ts} Supabase client used here
 * @see {@link file://../../../middleware.ts} Middleware protecting this route
 */

const initialFormData = {
  titulo: '',
  descricao: '',
  data_inicio: '',
  data_fim: '',
  horario_inicio: '',
  horario_fim: '',
  local: '',
}

export default function EventosPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // State for confirmation dialogs
  const [confirmConcluir, setConfirmConcluir] = useState<Evento | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Evento | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Registrations
  const [inscricoesCount, setInscricoesCount] = useState<Record<string, number>>({})
  const [viewInscricoes, setViewInscricoes] = useState<Evento | null>(null)
  const [inscricoesList, setInscricoesList] = useState<Inscricao[]>([])
  const [loadingInscricoes, setLoadingInscricoes] = useState(false)

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

  useEffect(() => {
    if (eventos.length === 0) return

    supabase
      .from('inscricoes')
      .select('evento_id')
      .then(({ data }) => {
        if (!data) return
        const counts = data.reduce<Record<string, number>>((acc, row) => {
          acc[row.evento_id] = (acc[row.evento_id] ?? 0) + 1
          return acc
        }, {})
        setInscricoesCount(counts)
      })
  }, [eventos])

  const handleViewInscricoes = async (evento: Evento) => {
    setViewInscricoes(evento)
    setLoadingInscricoes(true)
    const { data } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('evento_id', evento.id)
      .order('created_at', { ascending: true })
    setInscricoesList(data ?? [])
    setLoadingInscricoes(false)
  }

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

      // Upload an image when a file is present
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
        horario_inicio: data.horario_inicio?.trim() || undefined,
        horario_fim: data.horario_fim?.trim() || undefined,
        imagem_url: finalImageUrl || undefined,
      }

      if (editingItem) {
        // Delete the old image when replacing it
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
      width: '180px',
      accessor: (evento) => {
        const inicio = format(parseLocalDate(evento.data_inicio), 'dd/MM/yyyy')
        const fim = evento.data_fim ? format(parseLocalDate(evento.data_fim), 'dd/MM/yyyy') : null
        const texto = fim ? `${inicio} - ${fim}` : inicio
        return (
          <div className="text-sm text-gray-500 truncate" title={texto}>
            {texto}
          </div>
        )
      },
    },
    {
      header: 'Horário',
      width: '140px',
      accessor: (evento) => {
        const horario = evento.horario_inicio
          ? evento.horario_fim
            ? `${evento.horario_inicio} às ${evento.horario_fim}`
            : evento.horario_inicio
          : '—'
        return (
          <div className="text-sm text-gray-500 truncate" title={horario}>
            {horario}
          </div>
        )
      },
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
      header: 'Inscrições',
      width: '100px',
      headerClassName:
        'px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider',
      cellClassName: 'px-4 py-4 text-center',
      accessor: (evento) => (
        <span className="text-sm font-medium text-gray-700">{inscricoesCount[evento.id] ?? 0}</span>
      ),
    },
    {
      header: 'Status',
      width: '100px',
      headerClassName:
        'px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider',
      cellClassName: 'px-4 py-4 text-center',
      accessor: (evento) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            evento.concluido ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
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
      icon: (evento) => (evento.concluido ? <EyeOff size={18} /> : <Eye size={18} />),
      onClick: handleConcluirEvento,
      className: 'text-blue-600 hover:text-blue-900',
      ariaLabel: 'Concluir evento',
    },
    {
      icon: <Users size={18} />,
      onClick: handleViewInscricoes,
      className: 'text-blue-600 hover:text-blue-900',
      ariaLabel: 'Ver inscritos',
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
        message={`Deseja marcar "${confirmConcluir?.titulo}" como concluído?`}
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

      <AdminModal
        isOpen={!!viewInscricoes}
        onClose={() => setViewInscricoes(null)}
        title={`Inscritos — ${viewInscricoes?.titulo ?? ''}`}
        maxWidth="lg"
      >
        {loadingInscricoes ? (
          <p className="text-sm text-gray-500">Carregando inscrições...</p>
        ) : inscricoesList.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma inscrição para este evento.</p>
        ) : (
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
            {inscricoesList.map((inscricao, index) => (
              <li
                key={inscricao.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6 text-right">{index + 1}.</span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{inscricao.nome}</p>
                    <p className="text-xs text-gray-500">{inscricao.email}</p>
                    {inscricao.telefone && (
                      <p className="text-xs text-gray-500">{inscricao.telefone}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 shrink-0 ml-4">
                  {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-gray-400 mt-4">
          Total: {inscricoesList.length} inscrito{inscricoesList.length !== 1 ? 's' : ''}
        </p>
      </AdminModal>
    </main>
  )
}
