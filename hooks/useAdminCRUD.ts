import { useState, useEffect, useMemo, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger, extractErrorMessage } from '@/lib/logger'
import { toast } from 'sonner'

/**
 * Configuration options for the useAdminCRUD hook.
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
 * Return value of the useAdminCRUD hook.
 */
interface UseAdminCRUDReturn<T> {
  /** Items loaded from the table */
  items: T[]
  /** Whether data is currently loading */
  loading: boolean
  /** Controls visibility of the create/edit modal */
  showModal: boolean
  /** Item being edited, or null when creating a new one */
  editingItem: T | null
  /** Current form data */
  formData: Partial<T>

  /** Sets modal visibility */
  setShowModal: (show: boolean) => void
  /** Sets the item being edited */
  setEditingItem: (item: T | null) => void
  /** Sets the form data */
  setFormData: (data: Partial<T>) => void

  /** Refetches items from the table */
  fetchItems: () => Promise<void>
  /** Creates a new item */
  handleCreate: (data: Partial<T>) => Promise<boolean>
  /** Updates an existing item */
  handleUpdate: (id: string, data: Partial<T>) => Promise<boolean>
  /** Deletes an item */
  handleDelete: (id: string, confirmMessage?: string) => Promise<boolean>

  /** Opens the modal to create a new item */
  openCreateModal: () => void
  /** Opens the modal to edit an existing item */
  openEditModal: (item: T) => void
  /** Closes the modal and clears state */
  closeModal: () => void
}

/**
 * Generic hook for CRUD operations in the admin panel.
 *
 * Manages list / create / update / delete state for any Supabase
 * table. Route protection is delegated to the server-side middleware,
 * so redundant client-side checks are avoided.
 *
 * @template T - Item type (must have an 'id' property)
 * @param options - Hook configuration
 * @returns State and functions for the CRUD operations
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
 * @see {@link file://../middleware.ts} Middleware protecting /admin/* routes
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

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy.column, { ascending: orderBy.ascending })

    if (error) {
      logger.error(`Erro ao buscar ${tableName}`, error)
      toast.error(`Erro ao carregar dados: ${extractErrorMessage(error)}`)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }, [supabase, tableName, orderBy.column, orderBy.ascending])

  // TODO(phase-4): migrate this hook to TanStack Query / SWR; current pattern
  // calls setState in an effect to load initial data, which the new
  // react-hooks rule discourages. Suppression is acceptable here because the
  // entire data layer is being replaced in phase 4.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems()
  }, [fetchItems])

  const handleCreate = async (data: Partial<T>): Promise<boolean> => {
    const { error } = await supabase.from(tableName).insert([data])

    if (error) {
      logger.error(`Erro ao criar ${tableName}`, error)
      toast.error(`Erro ao criar: ${extractErrorMessage(error)}`)
      return false
    }

    toast.success('Item criado com sucesso!')
    closeModal()
    await fetchItems()
    window.dispatchEvent(new Event('admin-stats-update'))
    return true
  }

  const handleUpdate = async (id: string, data: Partial<T>): Promise<boolean> => {
    const { error } = await supabase.from(tableName).update(data).eq('id', id)

    if (error) {
      logger.error(`Erro ao atualizar ${tableName}`, error)
      toast.error(`Erro ao atualizar: ${extractErrorMessage(error)}`)
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
    // Allows skipping confirmation when it was already handled externally
    // (e.g. by ConfirmDialog) — pass an empty string to bypass.
    if (confirmMessage && !confirm(confirmMessage)) return false

    const { error } = await supabase.from(tableName).delete().eq('id', id)

    if (error) {
      logger.error(`Erro ao deletar ${tableName}`, error)
      toast.error(`Erro ao deletar: ${extractErrorMessage(error)}`)
      return false
    }

    toast.success('Item deletado com sucesso!')
    await fetchItems()
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
