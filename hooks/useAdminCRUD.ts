import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

interface UseAdminCRUDOptions<T> {
  tableName: string
  orderBy?: {
    column: string
    ascending?: boolean
  }
  initialFormData: Partial<T>
}

interface UseAdminCRUDReturn<T> {
  // Estado
  items: T[]
  loading: boolean
  showModal: boolean
  editingItem: T | null
  formData: Partial<T>

  // Funções de estado
  setShowModal: (show: boolean) => void
  setEditingItem: (item: T | null) => void
  setFormData: (data: Partial<T>) => void

  // Funções CRUD
  fetchItems: () => Promise<void>
  handleCreate: (data: Partial<T>) => Promise<boolean>
  handleUpdate: (id: string, data: Partial<T>) => Promise<boolean>
  handleDelete: (id: string, confirmMessage?: string) => Promise<boolean>

  // Funções auxiliares
  openCreateModal: () => void
  openEditModal: (item: T) => void
  closeModal: () => void
}

export function useAdminCRUD<T extends { id: string }>({
  tableName,
  orderBy = { column: 'created_at', ascending: false },
  initialFormData,
}: UseAdminCRUDOptions<T>): UseAdminCRUDReturn<T> {
  const router = useRouter()
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<Partial<T>>(initialFormData)

  // Verifica autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login/admin')
      }
    }
    checkAuth()
  }, [router])

  // Busca inicial
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
    if (!confirm(confirmMessage)) return false

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
