'use client'

import { useEffect, useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminModal } from '@/components/admin/AdminModal'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { equipePastoralSchema, type EquipePastoralFormData } from '@/lib/validations/admin'
import { uploadImage, deleteImage, optimizeImage } from '@/lib/services/storage.service'
import { STORAGE_CONFIG } from '@/lib/constants/config'
import { logger } from '@/lib/logger'

interface Membro {
  id: string
  nome: string
  cargo: string
  foto_url: string
  descricao: string
  created_at: string
}

const initialFormData: EquipePastoralFormData = {
  nome: '',
  cargo: '',
  foto_url: '',
  descricao: '',
}

/**
 * Página de gerenciamento da equipe pastoral
 *
 * Permite criar, editar e excluir membros da equipe pastoral.
 * Suporta upload de fotos com otimização automática.
 */
export default function EquipePage() {
  // Estados para upload de imagem
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Estado para diálogo de confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<Membro | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    items: membros,
    loading,
    showModal,
    editingItem,
    handleCreate,
    handleUpdate,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useAdminCRUD<Membro>({
    tableName: 'equipe_pastoral',
    orderBy: { column: 'created_at', ascending: true },
    initialFormData,
  })

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EquipePastoralFormData>({
    resolver: zodResolver(equipePastoralSchema),
    defaultValues: initialFormData,
  })

  const fotoUrlValue = watch('foto_url')

  // Preencher formulário ao editar
  useEffect(() => {
    if (editingItem) {
      setValue('nome', editingItem.nome)
      setValue('cargo', editingItem.cargo)
      setValue('foto_url', editingItem.foto_url || '')
      setValue('descricao', editingItem.descricao)
      // Se há uma foto existente, mostrar preview
      if (editingItem.foto_url) {
        setImagePreview(editingItem.foto_url)
      }
    } else {
      reset(initialFormData)
      setImageFile(null)
      setImagePreview(null)
    }
  }, [editingItem, setValue, reset])

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file)
    if (file) {
      // Criar preview do arquivo
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      // Limpar campo de URL quando arquivo é selecionado
      setValue('foto_url', '')
    } else {
      // Se remover arquivo, restaurar preview da URL existente
      setImagePreview(editingItem?.foto_url || null)
    }
  }

  const handleUrlChange = (url: string) => {
    setValue('foto_url', url)
    if (url && !imageFile) {
      setImagePreview(url)
    } else if (!url && !imageFile) {
      setImagePreview(editingItem?.foto_url || null)
    }
  }

  const onSubmit = async (data: EquipePastoralFormData) => {
    try {
      let finalImageUrl = data.foto_url || ''

      // Upload de imagem se houver arquivo selecionado
      if (imageFile) {
        setUploadingImage(true)
        toast.info('Otimizando e enviando foto...')

        const optimizedFile = await optimizeImage(imageFile, 800, 0.85)
        const uploadedUrl = await uploadImage(
          optimizedFile,
          STORAGE_CONFIG.BUCKETS.EQUIPE
        )

        if (!uploadedUrl) {
          toast.error('Erro ao fazer upload da foto')
          setUploadingImage(false)
          return
        }

        finalImageUrl = uploadedUrl
        setUploadingImage(false)
      }

      const dataToSubmit = {
        ...data,
        foto_url: finalImageUrl || undefined,
      }

      if (editingItem) {
        // Deletar foto antiga se estiver trocando por uma nova
        if (editingItem.foto_url && imageFile) {
          await deleteImage(editingItem.foto_url, STORAGE_CONFIG.BUCKETS.EQUIPE)
        }
        await handleUpdate(editingItem.id, dataToSubmit)
      } else {
        await handleCreate(dataToSubmit)
      }

      handleModalClose()
    } catch (error) {
      logger.error('Erro ao salvar membro', error)
      toast.error('Erro ao salvar membro da equipe')
      setUploadingImage(false)
    }
  }

  const handleModalClose = () => {
    closeModal()
    reset(initialFormData)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleDeleteMembro = (membro: Membro) => {
    setConfirmDelete(membro)
  }

  const executeDeleteMembro = async () => {
    if (!confirmDelete) return

    setIsProcessing(true)
    try {
      // Excluir foto do storage se existir
      if (confirmDelete.foto_url) {
        await deleteImage(confirmDelete.foto_url, STORAGE_CONFIG.BUCKETS.EQUIPE)
      }
      await handleDelete(confirmDelete.id, '')
    } finally {
      setIsProcessing(false)
      setConfirmDelete(null)
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
      <AdminPageHeader
        title="Equipe Pastoral"
        description="Gerencie os membros da equipe pastoral"
        buttonLabel="Novo Membro"
        onButtonClick={openCreateModal}
      />

      {membros.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Nenhum membro cadastrado
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Equipe pastoral"
        >
          {membros.map((membro) => (
            <article
              key={membro.id}
              className="bg-white rounded-lg shadow overflow-hidden"
              role="listitem"
            >
              <div className="aspect-square relative bg-gray-100">
                {membro.foto_url ? (
                  <Image
                    src={membro.foto_url}
                    alt={membro.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-6xl text-gray-400">
                      {membro.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{membro.nome}</h3>
                <p className="text-blue-600 font-medium mb-3">{membro.cargo}</p>
                {membro.descricao && (
                  <p className="text-sm text-gray-600 mb-4">{membro.descricao}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(membro)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                    aria-label={`Editar ${membro.nome}`}
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteMembro(membro)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                    aria-label={`Deletar ${membro.nome}`}
                  >
                    <Trash2 size={16} />
                    Deletar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingItem ? 'Editar Membro' : 'Novo Membro'}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome
            </label>
            <input
              id="nome"
              type="text"
              {...register('nome')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.nome ? 'border-red-500' : ''
              }`}
            />
            {errors.nome && (
              <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="cargo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cargo
            </label>
            <input
              id="cargo"
              type="text"
              {...register('cargo')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.cargo ? 'border-red-500' : ''
              }`}
              placeholder="Ex: Pastor, Líder de Jovens, etc."
            />
            {errors.cargo && (
              <p className="text-sm text-red-500 mt-1">{errors.cargo.message}</p>
            )}
          </div>

          {/* Componente de Upload de Imagem */}
          <ImageUpload
            inputId="foto_membro"
            label="Foto do Membro (opcional)"
            imageFile={imageFile}
            imagePreview={imagePreview}
            currentImageUrl={editingItem?.foto_url}
            onFileChange={handleImageFileChange}
            onUrlChange={handleUrlChange}
            urlValue={fotoUrlValue || ''}
            error={errors.foto_url?.message}
            disabled={isSubmitting || uploadingImage}
            urlPlaceholder="https://exemplo.com/foto.jpg"
            showUrlInput={true}
            helperText="Formatos aceitos: JPG, PNG, WebP. Tamanho máximo: 5MB"
          />

          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              {...register('descricao')}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                errors.descricao ? 'border-red-500' : ''
              }`}
            />
            {errors.descricao && (
              <p className="text-sm text-red-500 mt-1">{errors.descricao.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage
                ? 'Enviando foto...'
                : isSubmitting
                  ? 'Salvando...'
                  : editingItem
                    ? 'Atualizar'
                    : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isSubmitting || uploadingImage}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDeleteMembro}
        title="Excluir membro"
        message={`Tem certeza que deseja excluir "${confirmDelete?.nome}" da equipe pastoral? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isProcessing}
      />
    </main>
  )
}
