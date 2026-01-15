'use client'

import { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminModal } from '@/components/admin/AdminModal'
import { galeriaSchema, type GaleriaFormData } from '@/lib/validations/admin'

interface Foto {
  id: string
  titulo: string
  url: string
  descricao: string
  categoria: 'Cultos' | 'Jovens' | 'Eventos Especiais' | 'Infantil'
  created_at: string
}

const initialFormData: GaleriaFormData = {
  titulo: '',
  url: '',
  descricao: '',
  categoria: 'Cultos',
}

export default function GaleriaPage() {
  const {
    items: fotos,
    loading,
    showModal,
    editingItem,
    handleCreate,
    handleDelete,
    openCreateModal,
    closeModal,
  } = useAdminCRUD<Foto>({
    tableName: 'galeria',
    orderBy: { column: 'created_at', ascending: false },
    initialFormData,
  })

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<GaleriaFormData>({
    resolver: zodResolver(galeriaSchema),
    defaultValues: initialFormData,
  })

  // Preencher formulário ao editar (galeria não tem edição, só adição)
  useEffect(() => {
    if (editingItem) {
      setValue('titulo', editingItem.titulo)
      setValue('url', editingItem.url)
      setValue('descricao', editingItem.descricao || '')
      setValue('categoria', editingItem.categoria)
    } else {
      reset(initialFormData)
    }
  }, [editingItem, setValue, reset])

  const onSubmit = async (data: GaleriaFormData) => {
    await handleCreate(data)
    reset(initialFormData)
  }

  const handleModalClose = () => {
    closeModal()
    reset(initialFormData)
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
        title="Galeria de Fotos"
        description="Gerencie as fotos da galeria"
        buttonLabel="Nova Foto"
        onButtonClick={openCreateModal}
      />

      {fotos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Nenhuma foto cadastrada
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          role="list"
          aria-label="Galeria de fotos"
        >
          {fotos.map((foto) => (
            <article
              key={foto.id}
              className="bg-white rounded-lg shadow overflow-hidden group"
              role="listitem"
            >
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={foto.url}
                  alt={foto.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{foto.titulo}</h3>
                {foto.descricao && (
                  <p className="text-sm text-gray-600 mb-3">{foto.descricao}</p>
                )}
                <button
                  onClick={() =>
                    handleDelete(foto.id, 'Tem certeza que deseja deletar esta foto?')
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                  aria-label={`Deletar foto ${foto.titulo}`}
                >
                  <Trash2 size={16} />
                  Deletar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminModal
        isOpen={showModal}
        onClose={handleModalClose}
        title="Nova Foto"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="titulo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título
            </label>
            <input
              id="titulo"
              type="text"
              {...register('titulo')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.titulo ? 'border-red-500' : ''
              }`}
            />
            {errors.titulo && (
              <p className="text-sm text-red-500 mt-1">{errors.titulo.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL da Foto
            </label>
            <input
              id="url"
              type="url"
              {...register('url')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.url ? 'border-red-500' : ''
              }`}
              placeholder="https://exemplo.com/foto.jpg"
            />
            {errors.url && (
              <p className="text-sm text-red-500 mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="categoria"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Categoria
            </label>
            <select
              id="categoria"
              {...register('categoria')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.categoria ? 'border-red-500' : ''
              }`}
            >
              <option value="Cultos">Cultos</option>
              <option value="Jovens">Jovens</option>
              <option value="Eventos Especiais">Eventos Especiais</option>
              <option value="Infantil">Infantil</option>
            </select>
            {errors.categoria && (
              <p className="text-sm text-red-500 mt-1">{errors.categoria.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="descricao"
              {...register('descricao')}
              rows={3}
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : 'Adicionar'}
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
    </main>
  )
}
