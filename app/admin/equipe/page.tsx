'use client'

import { useEffect } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminModal } from '@/components/admin/AdminModal'
import { equipePastoralSchema, type EquipePastoralFormData } from '@/lib/validations/admin'

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

export default function EquipePage() {
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
  } = useForm<EquipePastoralFormData>({
    resolver: zodResolver(equipePastoralSchema),
    defaultValues: initialFormData,
  })

  // Preencher formulário ao editar
  useEffect(() => {
    if (editingItem) {
      setValue('nome', editingItem.nome)
      setValue('cargo', editingItem.cargo)
      setValue('foto_url', editingItem.foto_url || '')
      setValue('descricao', editingItem.descricao)
    } else {
      reset(initialFormData)
    }
  }, [editingItem, setValue, reset])

  const onSubmit = async (data: EquipePastoralFormData) => {
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
                <Image
                  src={membro.foto_url}
                  alt={membro.nome}
                  fill
                  className="object-cover"
                />
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
                    onClick={() =>
                      handleDelete(membro.id, 'Tem certeza que deseja remover este membro?')
                    }
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

          <div>
            <label
              htmlFor="foto_url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL da Foto (opcional)
            </label>
            <input
              id="foto_url"
              type="url"
              {...register('foto_url')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.foto_url ? 'border-red-500' : ''
              }`}
              placeholder="https://exemplo.com/foto.jpg"
            />
            {errors.foto_url && (
              <p className="text-sm text-red-500 mt-1">{errors.foto_url.message}</p>
            )}
          </div>

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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Salvando...'
                : editingItem
                  ? 'Atualizar'
                  : 'Adicionar'}
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
