'use client'

import { Upload } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { EventoFormData } from '@/lib/validations/admin'

interface EventoImageUploadProps {
  register: UseFormRegister<EventoFormData>
  errors: FieldErrors<EventoFormData>
  imageFile: File | null
  imagePreview: string | null
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function EventoImageUpload({
  register,
  errors,
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

      {/* OU */}
      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-xs text-gray-500 uppercase">ou</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* URL da Imagem */}
      <div>
        <input
          id="imagem_url"
          type="url"
          placeholder="Cole a URL de uma imagem"
          {...register('imagem_url')}
          disabled={!!imageFile}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            errors.imagem_url ? 'border-red-500' : ''
          } ${imageFile ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {errors.imagem_url && (
          <p className="text-sm text-red-500 mt-1">{errors.imagem_url.message}</p>
        )}
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
