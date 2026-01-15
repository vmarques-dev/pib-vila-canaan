import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { STORAGE_CONFIG } from '@/lib/constants/config'

/**
 * Faz upload de uma imagem para o bucket do Supabase Storage
 * @param file - Arquivo a ser enviado
 * @param bucket - Nome do bucket
 * @param folder - Pasta dentro do bucket (opcional)
 * @returns URL pública da imagem ou null em caso de erro
 */
export async function uploadImage(
  file: File,
  bucket: string = STORAGE_CONFIG.BUCKETS.EVENTOS,
  folder?: string
): Promise<string | null> {
  try {
    // Validar tipo de arquivo
    if (!STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      logger.error('Tipo de arquivo não permitido', new Error(file.type))
      throw new Error('Apenas imagens JPG, PNG e WebP são permitidas')
    }

    // Validar tamanho
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      logger.error('Arquivo muito grande', new Error(`${file.size} bytes`))
      throw new Error('A imagem deve ter no máximo 5MB')
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${extension}`

    // Definir caminho completo
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Fazer upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      logger.error('Erro ao fazer upload', error)
      throw error
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    logger.info('Upload realizado com sucesso', { path: data.path, url: publicUrl })
    return publicUrl
  } catch (error) {
    logger.error('Erro no processo de upload', error)
    return null
  }
}

/**
 * Exclui uma imagem do bucket do Supabase Storage
 * @param imageUrl - URL da imagem a ser excluída
 * @param bucket - Nome do bucket
 * @returns true se excluiu com sucesso, false caso contrário
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = STORAGE_CONFIG.BUCKETS.EVENTOS
): Promise<boolean> {
  try {
    if (!imageUrl || imageUrl.trim() === '') {
      return true // Nada para excluir
    }

    // Extrair o caminho do arquivo da URL
    // URL formato: https://[project].supabase.co/storage/v1/object/public/eventos/path/to/file.jpg
    const urlParts = imageUrl.split(`/${bucket}/`)
    if (urlParts.length < 2) {
      logger.warn('URL inválida para exclusão', { url: imageUrl })
      return false
    }

    const filePath = urlParts[1]

    // Excluir arquivo
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

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
 * Otimiza uma imagem redimensionando e comprimindo antes do upload
 * @param file - Arquivo a ser otimizado
 * @param maxWidth - Largura máxima em pixels
 * @param quality - Qualidade da compressão (0-1)
 * @returns Arquivo otimizado
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

        // Redimensionar se necessário
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
