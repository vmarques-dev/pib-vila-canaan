'use client'

import { Upload } from 'lucide-react'

interface EventoImageUploadProps {
  imageFile: File | null
  imagePreview: string | null
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function EventoImageUpload({
  imageFile,
  imagePreview,
  onImageFileChange,
}: EventoImageUploadProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Imagem do Evento
      </label>

      {/* Upload de Arquivo */}
      <div>
        <label
          htmlFor="image_file"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
        >
          <Upload size={20} className="text-gray-500" />
          <span className="text-sm text-gray-600">
            {imageFile ? imageFile.name : 'Escolher arquivo (até 5MB)'}
          </span>
        </label>
        <input
          id="image_file"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={onImageFileChange}
          className="hidden"
        />
      </div>

      {/* Preview da Imagem */}
      {imagePreview && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
        </div>
      )}
    </div>
  )
}
