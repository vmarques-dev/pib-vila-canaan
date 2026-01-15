'use client'

import { useEffect } from 'react'
import { Edit, Trash2, CheckCircle, Circle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAdminCRUD } from '@/hooks/useAdminCRUD'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminTable, AdminTableColumn, AdminTableAction } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { versiculoDestaqueSchema, type VersiculoDestaqueFormData } from '@/lib/validations/admin'
import { toast } from 'sonner'

interface VersiculoDestaque {
  id: string
  livro: string
  referencia: string
  texto: string
  data_inicio?: string
  data_fim?: string
  ativo: boolean
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
  livro: '',
  referencia: '',
  texto: '',
  data_inicio: '',
  data_fim: '',
  ativo: false,
}

export default function VersiculoDestaquePage() {
  const {
    items: versiculos,
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
    watch,
  } = useForm<VersiculoDestaqueFormData>({
    resolver: zodResolver(versiculoDestaqueSchema),
    defaultValues: initialFormData,
  })

  // Preencher formulário ao editar
  useEffect(() => {
    if (editingItem) {
      setValue('livro', editingItem.livro)
      setValue('referencia', editingItem.referencia)
      setValue('texto', editingItem.texto)
      setValue('data_inicio', editingItem.data_inicio || '')
      setValue('data_fim', editingItem.data_fim || '')
      setValue('ativo', editingItem.ativo)
    } else {
      reset(initialFormData)
    }
  }, [editingItem, setValue, reset])

  const onSubmit = async (data: VersiculoDestaqueFormData) => {
    // Se está ativando, desativar todos os outros primeiro
    if (data.ativo) {
      const { error: deactivateError } = await supabase
        .from('versiculo_destaque')
        .update({ ativo: false })
        .neq('id', editingItem?.id || '')

      if (deactivateError) {
        logger.error('Erro ao desativar outros versículos', deactivateError)
        toast.error('Erro ao desativar outros versículos')
        return
      }
    }

    // Converter strings vazias para undefined nas datas
    const dataToSubmit = {
      ...data,
      data_inicio: data.data_inicio?.trim() || undefined,
      data_fim: data.data_fim?.trim() || undefined,
    }

    if (editingItem) {
      await handleUpdate(editingItem.id, dataToSubmit)
    } else {
      await handleCreate(dataToSubmit)
    }

    reset(initialFormData)
  }

  const handleModalClose = () => {
    closeModal()
    reset(initialFormData)
  }

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    if (!ativo) {
      // Ativando: desativar todos os outros primeiro
      const { error: deactivateError } = await supabase
        .from('versiculo_destaque')
        .update({ ativo: false })
        .neq('id', id)

      if (deactivateError) {
        logger.error('Erro ao desativar outros versículos', deactivateError)
        toast.error('Erro ao desativar outros versículos')
        return
      }

      // Ativar o selecionado
      const { error } = await supabase
        .from('versiculo_destaque')
        .update({ ativo: true })
        .eq('id', id)

      if (error) {
        logger.error('Erro ao ativar versículo', error)
        toast.error('Erro ao ativar versículo: ' + error.message)
      } else {
        toast.success('Versículo ativado! Outros foram desativados.')
        await fetchItems()
      }
    } else {
      // Desativando
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
      accessor: (versiculo) => (
        <div className="text-sm font-medium text-gray-900">
          {versiculo.livro} {versiculo.referencia}
        </div>
      ),
    },
    {
      header: 'Texto',
      accessor: (versiculo) => (
        <div className="text-sm text-gray-500 max-w-md truncate">
          {versiculo.texto.length > 80
            ? versiculo.texto.substring(0, 80) + '...'
            : versiculo.texto}
        </div>
      ),
    },
    {
      header: 'Período',
      accessor: (versiculo) => {
        if (!versiculo.data_inicio && !versiculo.data_fim) {
          return <div className="text-sm text-gray-500">-</div>
        }

        const formatDate = (dateStr: string) => {
          const [ano, mes, dia] = dateStr.split('-')
          return `${dia}/${mes}/${ano}`
        }

        return (
          <div className="text-sm text-gray-500">
            {versiculo.data_inicio && formatDate(versiculo.data_inicio)}
            {versiculo.data_inicio && versiculo.data_fim && ' - '}
            {versiculo.data_fim && formatDate(versiculo.data_fim)}
          </div>
        )
      },
    },
    {
      header: 'Status',
      accessor: (versiculo) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            versiculo.ativo
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
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
      icon: versiculo => versiculo.ativo ? <CheckCircle size={18} /> : <Circle size={18} />,
      onClick: (versiculo) => handleToggleAtivo(versiculo.id, versiculo.ativo),
      className: 'text-yellow-600 hover:text-yellow-900',
      ariaLabel: 'Ativar/Desativar versículo',
    },
    {
      icon: <Trash2 size={18} />,
      onClick: (versiculo) =>
        handleDelete(versiculo.id, 'Tem certeza que deseja deletar este versículo?'),
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
            <label
              htmlFor="texto"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
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
            {errors.texto && (
              <p className="text-sm text-red-500 mt-1">{errors.texto.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="data_inicio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Data Início (opcional)
              </label>
              <input
                id="data_inicio"
                type="date"
                {...register('data_inicio')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.data_inicio ? 'border-red-500' : ''
                }`}
              />
              {errors.data_inicio && (
                <p className="text-sm text-red-500 mt-1">{errors.data_inicio.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="data_fim"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Data Fim (opcional)
              </label>
              <input
                id="data_fim"
                type="date"
                {...register('data_fim')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.data_fim ? 'border-red-500' : ''
                }`}
              />
              {errors.data_fim && (
                <p className="text-sm text-red-500 mt-1">{errors.data_fim.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="ativo"
              type="checkbox"
              {...register('ativo')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="ativo"
              className="text-sm font-medium text-gray-700"
            >
              Ativar versículo (desativa todos os outros automaticamente)
            </label>
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
