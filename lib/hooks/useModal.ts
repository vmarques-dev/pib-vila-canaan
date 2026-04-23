import { useState } from 'react'

/**
 * Hook para gerenciar estado de modais CRUD
 */
export function useModal<T>() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)

  const openCreate = () => {
    setEditingItem(null)
    setIsOpen(true)
  }

  const openEdit = (item: T) => {
    setEditingItem(item)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setEditingItem(null)
  }

  return {
    isOpen,
    editingItem,
    openCreate,
    openEdit,
    close,
    setIsOpen,
    setEditingItem,
  }
}
