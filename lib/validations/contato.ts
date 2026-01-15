import { z } from 'zod'

/**
 * Schema de validação para o formulário de contato
 * Garante que todos os dados estão sanitizados e válidos antes do envio
 */
export const contatoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
    .trim(),

  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .trim(),

  telefone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato: (99) 99999-9999')
    .optional()
    .or(z.literal('')),

  assunto: z
    .string()
    .min(3, 'Assunto deve ter no mínimo 3 caracteres')
    .max(200, 'Assunto muito longo')
    .trim(),

  mensagem: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(1000, 'Mensagem muito longa')
    .trim(),
})

export type ContatoFormData = z.infer<typeof contatoSchema>
