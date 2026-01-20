'use client'

import { useEffect, useCallback } from 'react'
import { AlertTriangle, Trash2, Info, X } from 'lucide-react'

/**
 * Variantes visuais do diálogo de confirmação
 */
type ConfirmDialogVariant = 'danger' | 'warning' | 'info'

/**
 * Props do componente ConfirmDialog
 */
interface ConfirmDialogProps {
  /** Controla a visibilidade do diálogo */
  isOpen: boolean
  /** Callback executado ao fechar o diálogo (cancelar) */
  onClose: () => void
  /** Callback executado ao confirmar a ação */
  onConfirm: () => void
  /** Título do diálogo */
  title: string
  /** Mensagem descritiva da ação */
  message: string
  /** Texto do botão de confirmação */
  confirmText?: string
  /** Texto do botão de cancelamento */
  cancelText?: string
  /** Variante visual do diálogo */
  variant?: ConfirmDialogVariant
  /** Indica se a ação está em andamento */
  isLoading?: boolean
}

/**
 * Configurações visuais para cada variante
 */
const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    confirmBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
}

/**
 * Diálogo de confirmação estilizado para o painel administrativo
 *
 * Substitui o alert/confirm nativo do browser por um modal estilizado
 * e acessível. Suporta diferentes variantes visuais para diferentes
 * tipos de ação (exclusão, aviso, informação).
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Excluir versículo"
 *   message="Tem certeza que deseja excluir este versículo? Esta ação não pode ser desfeita."
 *   variant="danger"
 *   confirmText="Excluir"
 * />
 * ```
 *
 * @see {@link file://./AdminModal.tsx} Modal genérico do admin
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  /**
   * Fecha o diálogo ao pressionar Escape
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose()
      }
    },
    [onClose, isLoading]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="confirm-dialog-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Dialog container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full p-1 transition-colors"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Fechar diálogo"
          >
            <X size={20} />
          </button>

          <div className="p-6">
            {/* Icon and content */}
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg}`}
              >
                <Icon className={config.iconColor} size={24} aria-hidden="true" />
              </div>

              <div className="flex-1 pt-1">
                <h3
                  id="confirm-dialog-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmBg}`}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Aguarde...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
