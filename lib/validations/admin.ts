import { z } from 'zod'

/**
 * Schema de validação para estudos bíblicos
 */
export const estudoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  livro: z
    .string()
    .min(1, 'Selecione o livro')
    .max(50, 'Nome do livro muito longo'),
  referencia: z
    .string()
    .min(1, 'Informe capítulo e versículo')
    .max(20, 'Referência muito longa'),
  texto_versiculo: z
    .string()
    .min(10, 'Texto do versículo muito curto')
    .max(1000, 'Texto do versículo deve ter no máximo 1000 caracteres'),
  conteudo: z
    .string()
    .min(10, 'Conteúdo deve ter no mínimo 10 caracteres')
    .max(10000, 'Conteúdo muito longo'),
  categoria: z
    .string()
    .min(1, 'Selecione uma categoria')
    .max(100, 'Categoria muito longa'),
  data_estudo: z.string().min(1, 'Data é obrigatória'),
})

export type EstudoFormData = z.infer<typeof estudoSchema>

/**
 * Schema de validação para eventos
 */
export const eventoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().optional().or(z.literal('')),
  horario: z
    .string()
    .min(1, 'Horário é obrigatório')
    .max(50, 'Horário muito longo'),
  local: z
    .string()
    .min(3, 'Local deve ter no mínimo 3 caracteres')
    .max(200, 'Local deve ter no máximo 200 caracteres'),
  imagem_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      'URL da imagem inválida'
    ),
})

export type EventoFormData = z.infer<typeof eventoSchema>

/**
 * Schema de validação para galeria de fotos
 */
export const galeriaSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  url: z.string().url('URL da imagem inválida'),
  categoria: z.enum(['Cultos', 'Jovens', 'Eventos Especiais', 'Infantil']),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
})

export type GaleriaFormData = z.infer<typeof galeriaSchema>

/**
 * Schema de validação para equipe pastoral
 */
export const equipePastoralSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cargo: z
    .string()
    .min(3, 'Cargo deve ter no mínimo 3 caracteres')
    .max(100, 'Cargo deve ter no máximo 100 caracteres'),
  foto_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      'URL da foto inválida'
    ),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
})

export type EquipePastoralFormData = z.infer<typeof equipePastoralSchema>

/**
 * Schema de validação para versículo destaque
 */
export const versiculoDestaqueSchema = z.object({
  livro: z
    .string()
    .min(1, 'Selecione o livro')
    .max(50, 'Nome do livro muito longo'),
  referencia: z
    .string()
    .min(1, 'Informe capítulo e versículo')
    .max(20, 'Referência muito longa'),
  texto: z
    .string()
    .min(10, 'Texto muito curto')
    .max(1000, 'Texto deve ter no máximo 1000 caracteres'),
  data_inicio: z.string().optional().or(z.literal('')),
  data_fim: z.string().optional().or(z.literal('')),
  ativo: z.boolean(),
})

export type VersiculoDestaqueFormData = z.infer<typeof versiculoDestaqueSchema>
