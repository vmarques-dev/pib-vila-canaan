'use client'

import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { STORAGE_CONFIG } from '@/lib/constants/config'

interface ImageUploadProps {
  /** Unique input ID (accessibility) */
  inputId: string
  /** Field label */
  label: string
  /** Selected file */
  imageFile: File | null
  /** Preview URL (can come from the file or an existing URL) */
  imagePreview: string | null
  /** Current image URL of the item being edited */
  currentImageUrl?: string
  /** Callback fired when a file is selected */
  onFileChange: (file: File | null) => void
  /** Callback fired when the URL is edited manually */
  onUrlChange?: (url: string) => void
  /** URL value (for the controlled input) */
  urlValue?: string
  /** Validation error */
  error?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Placeholder for the URL field */
  urlPlaceholder?: string
  /** Whether to show the URL field */
  showUrlInput?: boolean
  /** Helper text */
  helperText?: string
}

/**
 * Reusable image-upload component for the admin panel.
 *
 * Supports two input modes:
 * 1. Local file upload (with a visual drop target)
 * 2. External URL (optional)
 *
 * @example
 * ```tsx
 * <ImageUpload
 *   inputId="foto"
 *   label="Foto do Membro"
 *   imageFile={imageFile}
 *   imagePreview={imagePreview}
 *   onFileChange={handleFileChange}
 *   showUrlInput={true}
 *   urlValue={urlValue}
 *   onUrlChange={setUrlValue}
 * />
 * ```
 */
export function ImageUpload({
  inputId,
  label,
  imageFile,
  imagePreview,
  currentImageUrl,
  onFileChange,
  onUrlChange,
  urlValue = '',
  error,
  disabled = false,
  urlPlaceholder = 'Cole a URL de uma imagem',
  showUrlInput = true,
  helperText,
}: ImageUploadProps) {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onFileChange(file)
  }

  const handleClearFile = () => {
    onFileChange(null)
    // Clear the file input
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.value = ''
    }
  }

  const displayPreview = imagePreview || currentImageUrl
  const allowedTypes = STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.join(',')
  const maxSizeMB = STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* File upload */}
      <div className="relative">
        <label
          htmlFor={inputId}
          className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg transition ${
            disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : imageFile
                ? 'border-blue-500 bg-blue-50 cursor-pointer'
                : 'border-gray-300 hover:border-blue-500 cursor-pointer'
          }`}
        >
          <Upload size={20} className={imageFile ? 'text-blue-600' : 'text-gray-500'} />
          <span className={`text-sm ${imageFile ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
            {imageFile ? imageFile.name : `Escolher arquivo (até ${maxSizeMB}MB)`}
          </span>
        </label>
        <input
          id={inputId}
          type="file"
          accept={allowedTypes}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          aria-describedby={error ? `${inputId}-error` : undefined}
        />

        {/* Clear-selected-file button */}
        {imageFile && !disabled && (
          <button
            type="button"
            onClick={handleClearFile}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            aria-label="Remover arquivo selecionado"
          >
            <X size={16} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Helper text */}
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}

      {/* OR divider */}
      {showUrlInput && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-xs text-gray-500 uppercase">ou</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Image URL */}
          <div>
            <input
              id={`${inputId}_url`}
              type="url"
              placeholder={urlPlaceholder}
              value={urlValue}
              onChange={(e) => onUrlChange?.(e.target.value)}
              disabled={disabled || !!imageFile}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${imageFile || disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            {imageFile && (
              <p className="text-xs text-gray-500 mt-1">Remova o arquivo para usar uma URL</p>
            )}
          </div>
        </>
      )}

      {/* Validation error */}
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      {/* Image preview */}
      {displayPreview && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={14} className="text-gray-500" />
            <p className="text-xs text-gray-500">Preview:</p>
          </div>
          <div className="relative w-full aspect-video rounded-lg border border-gray-300 overflow-hidden bg-gray-100">
            <img
              src={displayPreview}
              alt="Preview da imagem"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement?.classList.add('flex', 'items-center', 'justify-center')
                const errorText = document.createElement('span')
                errorText.className = 'text-sm text-gray-500'
                errorText.textContent = 'Erro ao carregar imagem'
                target.parentElement?.appendChild(errorText)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
