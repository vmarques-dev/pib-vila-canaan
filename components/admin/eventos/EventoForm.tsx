'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventoSchema, type EventoFormData } from '@/lib/validations/admin'
import { EventoImageUpload } from './EventoImageUpload'
import { type Evento } from '@/lib/types'
import { useEffect } from 'react'

interface EventoFormProps {
  editingItem: Evento | null
  onSubmit: (data: EventoFormData) => Promise<void>
  onCancel: () => void
  imageFile: File | null
  imagePreview: string | null
  uploadingImage: boolean
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function EventoForm({
  editingItem,
  onSubmit,
  onCancel,
  imageFile,
  imagePreview,
  uploadingImage,
  onImageFileChange,
}: EventoFormProps) {
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
  })

  // Preencher formulário ao editar
  useEffect(() => {
    if (editingItem) {
      setValue('titulo', editingItem.titulo)
      setValue('descricao', editingItem.descricao)
      setValue('data_inicio', editingItem.data_inicio)
      setValue('data_fim', editingItem.data_fim || '')
      setValue('horario', editingItem.horario)
      setValue('local', editingItem.local)
    } else {
      reset()
    }
  }, [editingItem, setValue, reset])

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="titulo"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Título
        </label>
        <input
          id="titulo"
          type="text"
          {...register('titulo')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            errors.titulo ? 'border-red-500' : ''
          }`}
        />
        {errors.titulo && (
          <p className="text-sm text-red-500 mt-1">{errors.titulo.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="descricao"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Descrição
        </label>
        <textarea
          id="descricao"
          {...register('descricao')}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
            errors.descricao ? 'border-red-500' : ''
          }`}
        />
        {errors.descricao && (
          <p className="text-sm text-red-500 mt-1">{errors.descricao.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="data_inicio"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Data de Início
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
            Data de Fim (opcional)
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

      <div>
        <label
          htmlFor="horario"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Horário
        </label>
        <input
          id="horario"
          type="text"
          placeholder="Ex: 19h às 21h"
          {...register('horario')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            errors.horario ? 'border-red-500' : ''
          }`}
        />
        {errors.horario && (
          <p className="text-sm text-red-500 mt-1">{errors.horario.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="local"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Local
        </label>
        <input
          id="local"
          type="text"
          {...register('local')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
            errors.local ? 'border-red-500' : ''
          }`}
        />
        {errors.local && (
          <p className="text-sm text-red-500 mt-1">{errors.local.message}</p>
        )}
      </div>

      <EventoImageUpload
        imageFile={imageFile}
        imagePreview={imagePreview}
        onImageFileChange={onImageFileChange}
      />

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || uploadingImage}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadingImage
            ? 'Enviando imagem...'
            : isSubmitting
            ? 'Salvando...'
            : editingItem
              ? 'Atualizar'
              : 'Criar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || uploadingImage}
          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
