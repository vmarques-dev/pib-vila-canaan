import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as crudService from '@/lib/services/crud.service'

export interface UseCRUDOptions<T> {
  tableName: string
  orderBy?: { column: keyof T; ascending: boolean }
}

/**
 * Hook para operações CRUD genéricas
 * Mais simples e testável que useAdminCRUD
 */
export function useCRUD<T extends { id: string }>(options: UseCRUDOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await crudService.fetchItems<T>(options)

    if (error) {
      toast.error(`Erro ao carregar dados: ${error.message}`)
      setItems([])
    } else {
      setItems(data || [])
    }

    setLoading(false)
  }, [options])

  const handleCreate = async (data: Partial<T>): Promise<boolean> => {
    const { data: created, error } = await crudService.createItem<T>(
      options.tableName,
      data
    )

    if (error) {
      toast.error(`Erro ao criar: ${error.message}`)
      return false
    }

    toast.success('Criado com sucesso!')
    await fetchItems()

    // Notificar outras partes do app (ex: dashboard stats)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('admin-stats-update'))
    }

    return true
  }

  const handleUpdate = async (
    id: string,
    data: Partial<T>
  ): Promise<boolean> => {
    const { error } = await crudService.updateItem<T>(
      options.tableName,
      id,
      data
    )

    if (error) {
      toast.error(`Erro ao atualizar: ${error.message}`)
      return false
    }

    toast.success('Atualizado com sucesso!')
    await fetchItems()
    return true
  }

  const handleDelete = async (
    id: string,
    confirmMessage = 'Tem certeza que deseja deletar este item?'
  ): Promise<boolean> => {
    // Permite pular confirmação se já foi feita externamente (ex: ConfirmDialog)
    if (confirmMessage && !confirm(confirmMessage)) {
      return false
    }

    const { error } = await crudService.deleteItem(options.tableName, id)

    if (error) {
      toast.error(`Erro ao deletar: ${error.message}`)
      return false
    }

    toast.success('Deletado com sucesso!')
    await fetchItems()

    // Notificar outras partes do app (ex: dashboard stats)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('admin-stats-update'))
    }

    return true
  }

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return {
    items,
    loading,
    fetchItems,
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}
