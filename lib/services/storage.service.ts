import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'
import { STORAGE_CONFIG } from '@/lib/constants/config'

const MAX_FILE_SIZE_MB = Math.round(STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024))

/**
 * Maps an HTTP status returned by `/api/upload` to a user-facing
 * Portuguese message. Falls back to a generic message for unexpected
 * statuses so the user always sees *something*.
 */
function messageForUploadStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Arquivo inválido. Verifique o conteúdo e tente novamente.'
    case 401:
      return 'Sua sessão expirou. Faça login novamente.'
    case 403:
      return 'Você não tem permissão para enviar arquivos.'
    case 413:
      return `Arquivo muito grande. O tamanho máximo é ${MAX_FILE_SIZE_MB} MB.`
    case 415:
      return 'Arquivo inválido. Use apenas imagens JPEG, PNG ou WebP.'
    default:
      return 'Erro ao enviar o arquivo. Tente novamente em instantes.'
  }
}

/**
 * Uploads an image by delegating to the `/api/upload` server route.
 *
 * The server is the source of truth for type validation: it inspects
 * the actual bytes (magic numbers) and rejects anything that is not a
 * real JPEG/PNG/WebP, regardless of what the browser reported. The
 * checks done here are fail-fast UX optimizations only.
 *
 * On any failure (client-side check, server rejection, or network),
 * shows a user-facing toast in Portuguese and logs the technical
 * detail for the developer.
 *
 * @param file - File to upload
 * @param bucket - Bucket name
 * @param folder - Optional folder inside the bucket
 * @returns Public image URL, or null on error
 */
export async function uploadImage(
  file: File,
  bucket: string = STORAGE_CONFIG.BUCKETS.EVENTOS,
  folder?: string
): Promise<string | null> {
  try {
    // Fail fast on obvious problems before paying the round trip
    if (file.size === 0) {
      toast.error('O arquivo selecionado está vazio.')
      logger.error('Empty file rejected before upload', new Error('size=0'))
      return null
    }
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      toast.error(`Arquivo muito grande. O tamanho máximo é ${MAX_FILE_SIZE_MB} MB.`)
      logger.error('File too large to upload', new Error(`${file.size} bytes`))
      return null
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    if (folder) {
      formData.append('folder', folder)
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      toast.error(messageForUploadStatus(response.status))
      logger.error(
        'Upload rejected by server',
        new Error(payload.error ?? `HTTP ${response.status}`)
      )
      return null
    }

    const { url, path } = await response.json()
    logger.info('Upload completed', { path, url })
    return url as string
  } catch (error) {
    toast.error('Não foi possível enviar o arquivo. Verifique sua conexão e tente novamente.')
    logger.error('Upload request failed', error)
    return null
  }
}

/**
 * Deletes an image from a Supabase Storage bucket.
 *
 * Uses the SSR Supabase client so the user's auth session is
 * available — RLS policies require it.
 *
 * @param imageUrl - URL of the image to delete
 * @param bucket - Bucket name
 * @returns true on success, false otherwise
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = STORAGE_CONFIG.BUCKETS.EVENTOS
): Promise<boolean> {
  try {
    if (!imageUrl || imageUrl.trim() === '') {
      return true // Nothing to delete
    }

    // Extract the file path from the URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/eventos/path/to/file.jpg
    const urlParts = imageUrl.split(`/${bucket}/`)
    if (urlParts.length < 2) {
      logger.warn('URL inválida para exclusão', { url: imageUrl })
      return false
    }

    const filePath = urlParts[1]

    // Client with the auth session
    const supabase = createSupabaseBrowserClient()

    // Delete the file
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      logger.error('Erro ao excluir imagem', error)
      throw error
    }

    logger.info('Imagem excluída com sucesso', { path: filePath })
    return true
  } catch (error) {
    logger.error('Erro no processo de exclusão', error)
    return false
  }
}

/**
 * Optimizes an image by resizing and compressing it before upload.
 * @param file - File to optimize
 * @param maxWidth - Maximum width in pixels
 * @param quality - Compression quality (0–1)
 * @returns Optimized file
 */
export async function optimizeImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Resize when necessary
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Erro ao criar contexto do canvas'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro ao criar blob'))
              return
            }

            const optimizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })

            resolve(optimizedFile)
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('Erro ao carregar imagem'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}
