'use client'

import { useEffect, useMemo } from 'react'
import { Edit, Trash2, Archive } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableColumn, AdminTableAction } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'
import { estudoSchema, type EstudoFormData } from '@/lib/validations/admin'
import { toast } from 'sonner'

/**
 * Página de gerenciamento de estudos bíblicos
 *
 * Permite criar, editar, arquivar e excluir estudos bíblicos.
 * Cada estudo contém referência bíblica (livro, capítulo, versículo),
 * texto do versículo, conteúdo do estudo e categoria.
 *
 * @see {@link file://../../../hooks/useAdminCRUD.ts} Hook de CRUD utilizado
 * @see {@link file://../../../lib/supabase/browser.ts} Cliente Supabase utilizado
 * @see {@link file://../../../middleware.ts} Middleware que protege esta rota
 */

/**
 * Representa um estudo bíblico
 */
interface Estudo {
  id: string
  titulo: string
  livro: string
  referencia: string
  texto_versiculo: string
  conteudo: string
  categoria: string
  data_estudo: string
  arquivado: boolean
  created_at: string
}

const LIVROS_BIBLIA = [
  'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio',
  'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel',
  '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras',
  'Neemias', 'Ester', 'Jó', 'Salmos', 'Provérbios',
  'Eclesiastes', 'Cantares', 'Isaías', 'Jeremias', 'Lamentações',
  'Ezequiel', 'Daniel', 'Oséias', 'Joel', 'Amós',
  'Obadias', 'Jonas', 'Miquéias', 'Naum', 'Habacuque',
  'Sofonias', 'Ageu', 'Zacarias', 'Malaquias',
  'Mateus', 'Marcos', 'Lucas', 'João', 'Atos',
  'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios',
  'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses',
  '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom', 'Hebreus',
  'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João',
  '3 João', 'Judas', 'Apocalipse'
]

const initialFormData = {
  titulo: '',
  livro: '',
  referencia: '',
  texto_versiculo: '',
  conteudo: '',
  categoria: '',
  data_estudo: new Date().toISOString().split('T')[0],
}

export default function EstudosPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const {
    items: estudos,
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
  } = useAdminCRUD<Estudo>({
    tableName: 'estudos',
    orderBy: { column: 'data_estudo', ascending: false },
    initialFormData,
  })

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<EstudoFormData>({
    resolver: zodResolver(estudoSchema),
    defaultValues: initialFormData,
  })

  // Preencher formulário ao editar
  useEffect(() => {
    if (editingItem) {
      setValue('titulo', editingItem.titulo)
      setValue('livro', editingItem.livro)
      setValue('referencia', editingItem.referencia)
      setValue('texto_versiculo', editingItem.texto_versiculo)
      setValue('conteudo', editingItem.conteudo)
      setValue('categoria', editingItem.categoria)
      setValue('data_estudo', editingItem.data_estudo)
    } else {
      reset(initialFormData)
    }
  }, [editingItem, setValue, reset])

  const onSubmit = async (data: EstudoFormData) => {
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

  const handleArchive = async (id: string, arquivado: boolean) => {
    const { error } = await supabase
      .from('estudos')
      .update({ arquivado: !arquivado })
      .eq('id', id)

    if (error) {
      logger.error('Erro ao arquivar estudo', error)
      toast.error('Erro ao arquivar estudo: ' + error.message)
    } else {
      toast.success(arquivado ? 'Estudo desarquivado com sucesso!' : 'Estudo arquivado com sucesso!')
      await fetchItems()
    }
  }

  const columns: AdminTableColumn<Estudo>[] = [
    {
      header: 'Título',
      width: '30%',
      accessor: (estudo) => (
        <div className="text-sm font-medium text-gray-900 truncate" title={estudo.titulo}>
          {estudo.titulo}
        </div>
      ),
    },
    {
      header: 'Versículo',
      width: '20%',
      accessor: (estudo) => (
        <div className="text-sm text-gray-500 truncate" title={`${estudo.livro} ${estudo.referencia}`}>
          {estudo.livro} {estudo.referencia}
        </div>
      ),
    },
    {
      header: 'Categoria',
      width: '15%',
      accessor: (estudo) => (
        <div className="text-sm text-gray-500 truncate" title={estudo.categoria}>
          {estudo.categoria}
        </div>
      ),
    },
    {
      header: 'Data',
      width: '100px',
      accessor: (estudo) => {
        const [ano, mes, dia] = estudo.data_estudo.split('-')
        return (
          <div className="text-sm text-gray-500">
            {`${dia}/${mes}/${ano}`}
          </div>
        )
      },
    },
    {
      header: 'Status',
      width: '100px',
      accessor: (estudo) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            estudo.arquivado
              ? 'bg-gray-100 text-gray-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {estudo.arquivado ? 'Arquivado' : 'Ativo'}
        </span>
      ),
    },
  ]

  const actions: AdminTableAction<Estudo>[] = [
    {
      icon: <Edit size={18} />,
      onClick: openEditModal,
      className: 'text-blue-600 hover:text-blue-900',
      ariaLabel: 'Editar estudo',
    },
    {
      icon: <Archive size={18} />,
      onClick: (estudo) => handleArchive(estudo.id, estudo.arquivado),
      className: 'text-yellow-600 hover:text-yellow-900',
      ariaLabel: 'Arquivar/Desarquivar estudo',
    },
    {
      icon: <Trash2 size={18} />,
      onClick: (estudo) =>
        handleDelete(estudo.id, 'Tem certeza que deseja deletar este estudo?'),
      className: 'text-red-600 hover:text-red-900',
      ariaLabel: 'Deletar estudo',
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
        title="Estudos Bíblicos"
        description="Gerencie os estudos bíblicos"
        buttonLabel="Novo Estudo"
        onButtonClick={openCreateModal}
      />

      <AdminTable
        columns={columns}
        data={estudos}
        actions={actions}
        emptyMessage="Nenhum estudo cadastrado"
      />

      <AdminModal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingItem ? 'Editar Estudo' : 'Novo Estudo'}
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
              htmlFor="livro"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
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
            {errors.livro && (
              <p className="text-sm text-red-500 mt-1">{errors.livro.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="referencia"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Capítulo e Versículo
            </label>
            <input
              id="referencia"
              type="text"
              placeholder="Ex: 3:16 ou 3:16-17"
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
            <label
              htmlFor="texto_versiculo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Texto do Versículo
            </label>
            <textarea
              id="texto_versiculo"
              {...register('texto_versiculo')}
              rows={4}
              placeholder="Digite o texto completo do versículo"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                errors.texto_versiculo ? 'border-red-500' : ''
              }`}
            />
            {errors.texto_versiculo && (
              <p className="text-sm text-red-500 mt-1">{errors.texto_versiculo.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="conteudo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Conteúdo
            </label>
            <textarea
              id="conteudo"
              {...register('conteudo')}
              rows={8}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                errors.conteudo ? 'border-red-500' : ''
              }`}
            />
            {errors.conteudo && (
              <p className="text-sm text-red-500 mt-1">{errors.conteudo.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="categoria"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Categoria
            </label>
            <input
              id="categoria"
              type="text"
              {...register('categoria')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.categoria ? 'border-red-500' : ''
              }`}
            />
            {errors.categoria && (
              <p className="text-sm text-red-500 mt-1">{errors.categoria.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="data_estudo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Data
            </label>
            <input
              id="data_estudo"
              type="date"
              {...register('data_estudo')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.data_estudo ? 'border-red-500' : ''
              }`}
            />
            {errors.data_estudo && (
              <p className="text-sm text-red-500 mt-1">{errors.data_estudo.message}</p>
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
                  : 'Criar'}
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
