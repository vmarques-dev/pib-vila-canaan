import { z } from 'zod'

/**
 * Validation schema for Bible studies.
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
 * Validation schema for events.
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
  horario_inicio: z.string().optional().or(z.literal('')),
  horario_fim: z.string().optional().or(z.literal('')),
  local: z
    .string()
    .min(3, 'Local deve ter no mínimo 3 caracteres')
    .max(200, 'Local deve ter no máximo 200 caracteres'),
})

export type EventoFormData = z.infer<typeof eventoSchema>

/**
 * Validation schema for the photo gallery.
 * The URL is optional when a file upload is provided instead.
 */
export const galeriaSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  url: z.string().url('URL da imagem inválida').or(z.literal('')).optional(),
  categoria: z.enum(['Cultos', 'Jovens', 'Eventos Especiais', 'Infantil'], {
    error: 'Selecione uma categoria',
  }),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
})

export type GaleriaFormData = z.infer<typeof galeriaSchema>

/**
 * Validation schema for the pastoral team.
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
  foto_url: z.string().url('URL da foto inválida').or(z.literal('')).optional(),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
})

export type EquipePastoralFormData = z.infer<typeof equipePastoralSchema>

/**
 * Validation schema for the featured verse.
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
  ativo: z.boolean(),
})

export type VersiculoDestaqueFormData = z.infer<typeof versiculoDestaqueSchema>

/**
 * Regex for validating Brazilian phone numbers.
 * Supports formats: (XX) XXXXX-XXXX (mobile) and (XX) XXXX-XXXX (landline).
 */
const telefoneBrasileiroRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/

/**
 * Strict regex for email validation.
 * More rigorous than Zod's default — it:
 * - validates allowed characters in the local-part
 * - validates the domain format
 * - rejects malformed generic domains
 */
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

/**
 * List of commonly used disposable / throwaway email domains.
 * Used to block sign-ups from untrusted addresses.
 */
const dominiosDescartaveis = [
  'tempmail.com',
  'throwaway.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'fakeinbox.com',
  'trashmail.com',
  'yopmail.com',
  'getnada.com',
  'temp-mail.org',
]

/**
 * Validates that the email domain is not disposable.
 */
const validarDominioEmail = (email: string): boolean => {
  const dominio = email.split('@')[1]?.toLowerCase()
  return !dominiosDescartaveis.includes(dominio)
}

/**
 * Validation schema for church-wide settings.
 * Implements enterprise-grade validation with:
 * - Brazilian phone-format validation
 * - Strict email validation that blocks disposable domains
 * - Automatic input sanitization (trim, lowercase for email)
 * - Descriptive error messages (kept in Portuguese for end users)
 */
export const configuracoesSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .regex(
      /^[a-zA-ZÀ-ÿ0-9\s.,'-]+$/,
      'Nome contém caracteres inválidos'
    )
    .transform((val) => val.trim()),

  endereco: z
    .string()
    .min(10, 'Endereço deve ser mais detalhado (mínimo 10 caracteres)')
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .transform((val) => val.trim()),

  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(
      telefoneBrasileiroRegex,
      'Formato inválido. Use: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX'
    ),

  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .regex(emailRegex, 'Formato de email inválido')
    .refine(validarDominioEmail, 'Domínio de email não permitido')
    .transform((val) => val.toLowerCase().trim()),

  missao: z
    .string()
    .min(20, 'Missão deve ter no mínimo 20 caracteres')
    .max(2000, 'Missão deve ter no máximo 2000 caracteres')
    .transform((val) => val.trim()),

  visao: z
    .string()
    .min(20, 'Visão deve ter no mínimo 20 caracteres')
    .max(2000, 'Visão deve ter no máximo 2000 caracteres')
    .transform((val) => val.trim()),
})

export type ConfiguracoesFormData = z.infer<typeof configuracoesSchema>
