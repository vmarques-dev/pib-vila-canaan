import { z } from 'zod'

const telefoneBrasileiroRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

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

const validarDominioEmail = (email: string): boolean => {
  const dominio = email.split('@')[1]?.toLowerCase()
  return !dominiosDescartaveis.includes(dominio)
}

export const cadastroSchema = z
  .object({
    nome: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos')
      .transform((val) => val.trim()),

    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .max(255, 'Email deve ter no máximo 255 caracteres')
      .regex(emailRegex, 'Formato de email inválido')
      .refine(validarDominioEmail, 'Domínio de email não permitido')
      .transform((val) => val.toLowerCase().trim()),

    telefone: z
      .string()
      .optional()
      .refine(
        (val) => !val || val === '' || telefoneBrasileiroRegex.test(val),
        'Formato inválido. Use: (XX) XXXXX-XXXX'
      ),

    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),

    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export type CadastroFormData = z.infer<typeof cadastroSchema>
