import { useState, useEffect, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

/**
 * Opções de configuração do hook useAdminCRUD
 */
interface UseAdminCRUDOptions<T> {
  tableName: string
  orderBy?: {
    column: string
    ascending?: boolean
  }
  initialFormData: Partial<T>
}

/**
 * Retorno do hook useAdminCRUD
 */
interface UseAdminCRUDReturn<T> {
  /** Lista de itens carregados da tabela */
  items: T[]
  /** Indica se está carregando dados */
  loading: boolean
  /** Controla visibilidade do modal de criação/edição */
  showModal: boolean
  /** Item sendo editado ou null se criando novo */
  editingItem: T | null
  /** Dados do formulário atual */
  formData: Partial<T>

  /** Define visibilidade do modal */
  setShowModal: (show: boolean) => void
  /** Define item em edição */
  setEditingItem: (item: T | null) => void
  /** Define dados do formulário */
  setFormData: (data: Partial<T>) => void

  /** Recarrega itens da tabela */
  fetchItems: () => Promise<void>
  /** Cria novo item */
  handleCreate: (data: Partial<T>) => Promise<boolean>
  /** Atualiza item existente */
  handleUpdate: (id: string, data: Partial<T>) => Promise<boolean>
  /** Deleta item */
  handleDelete: (id: string, confirmMessage?: string) => Promise<boolean>

  /** Abre modal para criar novo item */
  openCreateModal: () => void
  /** Abre modal para editar item existente */
  openEditModal: (item: T) => void
  /** Fecha modal e limpa estado */
  closeModal: () => void
}

/**
 * Hook genérico para operações CRUD no painel administrativo
 *
 * Gerencia estado de listagem, criação, edição e exclusão de itens
 * de qualquer tabela do Supabase. A proteção de rotas é delegada
 * ao middleware server-side, evitando verificações redundantes.
 *
 * @template T - Tipo do item (deve ter propriedade 'id')
 * @param options - Configurações do hook
 * @returns Estado e funções para operações CRUD
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   loading,
 *   handleCreate,
 *   openCreateModal,
 * } = useAdminCRUD<Evento>({
 *   tableName: 'eventos',
 *   orderBy: { column: 'data_inicio', ascending: false },
 *   initialFormData: { titulo: '', descricao: '' },
 * })
 * ```
 *
 * @see {@link file://../middleware.ts} Middleware que protege rotas /admin/*
 */
export function useAdminCRUD<T extends { id: string }>({
  tableName,
  orderBy = { column: 'created_at', ascending: false },
  initialFormData,
}: UseAdminCRUDOptions<T>): UseAdminCRUDReturn<T> {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<Partial<T>>(initialFormData)

  useEffect(() => {
    fetchItems()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy.column, { ascending: orderBy.ascending })

    if (error) {
      logger.error(`Erro ao buscar ${tableName}`, error)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleCreate = async (data: Partial<T>): Promise<boolean> => {
    const { error } = await supabase
      .from(tableName)
      .insert([data])

    if (error) {
      logger.error(`Erro ao criar ${tableName}`, error)
      toast.error(`Erro ao criar: ${error.message}`)
      return false
    }

    toast.success('Item criado com sucesso!')
    closeModal()
    await fetchItems()

    // Notificar dashboard para atualizar
    window.dispatchEvent(new Event('admin-stats-update'))

    return true
  }

  const handleUpdate = async (id: string, data: Partial<T>): Promise<boolean> => {
    const { error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)

    if (error) {
      logger.error(`Erro ao atualizar ${tableName}`, error)
      toast.error(`Erro ao atualizar: ${error.message}`)
      return false
    }

    toast.success('Item atualizado com sucesso!')
    closeModal()
    await fetchItems()
    return true
  }

  const handleDelete = async (
    id: string,
    confirmMessage = 'Tem certeza que deseja deletar este item?'
  ): Promise<boolean> => {
    // Permite pular confirmação se já foi feita externamente (ex: ConfirmDialog)
    if (confirmMessage && !confirm(confirmMessage)) return false

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) {
      logger.error(`Erro ao deletar ${tableName}`, error)
      toast.error(`Erro ao deletar: ${error.message}`)
      return false
    }

    toast.success('Item deletado com sucesso!')
    await fetchItems()

    // Notificar dashboard para atualizar
    window.dispatchEvent(new Event('admin-stats-update'))

    return true
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData(initialFormData)
    setShowModal(true)
  }

  const openEditModal = (item: T) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData(initialFormData)
  }

  return {
    items,
    loading,
    showModal,
    editingItem,
    formData,
    setShowModal,
    setEditingItem,
    setFormData,
    fetchItems,
    handleCreate,
    handleUpdate,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal,
  }
}
