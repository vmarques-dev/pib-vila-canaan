import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { contatoSchema } from '@/lib/validations/contato'
import { logger } from '@/lib/logger'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Rate limiting simples por IP
 * Em produção, considerar usar Upstash Redis ou Vercel KV
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: Request) {
  try {
    // Feature flag: rate limiting
    const useRateLimiting = process.env.NEXT_PUBLIC_USE_RATE_LIMITING !== 'false' // Default true

    // Rate limiting por IP (3 requests por hora)
    if (useRateLimiting) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const now = Date.now()
      const limit = requestCounts.get(ip)

      if (limit && limit.resetTime > now) {
        if (limit.count >= 3) {
          logger.warn('Rate limit excedido', { ip, context: 'contato-api' })
          return NextResponse.json(
            { error: 'Muitas requisições. Tente novamente em 1 hora.' },
            { status: 429 }
          )
        }
        limit.count++
      } else {
        requestCounts.set(ip, { count: 1, resetTime: now + 3600000 }) // 1 hora
      }
    }

    // Validar com Zod
    const body = await request.json()
    const validation = contatoSchema.safeParse(body)

    if (!validation.success) {
      logger.warn('Validação falhou no contato', { errors: validation.error.format(), context: 'contato-api' })
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { nome, email, assunto, mensagem } = validation.data

    const { data, error } = await resend.emails.send({
      from: 'PIB Vila Canaan <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'contato@pibvilacanaan.com.br',
      replyTo: email,
      subject: `Contato do site - ${escapeHtml(assunto)}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
    }
    .field {
      margin-bottom: 20px;
    }
    .label {
      font-weight: bold;
      color: #1d4ed8;
      display: block;
      margin-bottom: 5px;
    }
    .value {
      background: white;
      padding: 12px;
      border-radius: 5px;
      border-left: 3px solid #1d4ed8;
    }
    .footer {
      background: #1f2937;
      color: #9ca3af;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      border-radius: 0 0 10px 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">Nova Mensagem de Contato</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">PIB Vila Canaan</p>
  </div>

  <div class="content">
    <div class="field">
      <span class="label">Nome:</span>
      <div class="value">${escapeHtml(nome)}</div>
    </div>

    <div class="field">
      <span class="label">Email:</span>
      <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(email)}</a></div>
    </div>

    <div class="field">
      <span class="label">Assunto:</span>
      <div class="value">${escapeHtml(assunto)}</div>
    </div>

    <div class="field">
      <span class="label">Mensagem:</span>
      <div class="value" style="white-space: pre-wrap;">${escapeHtml(mensagem)}</div>
    </div>
  </div>

  <div class="footer">
    <p style="margin: 0;">Esta mensagem foi enviada através do formulário de contato do site</p>
    <p style="margin: 5px 0 0 0;">PIB Vila Canaan - Uma igreja que ama a Deus e serve às pessoas</p>
  </div>
</body>
</html>
`,
    })

    if (error) {
      logger.error('Erro ao enviar email via Resend', error, { context: 'contato-api' })
      return NextResponse.json(
        { error: 'Erro ao enviar mensagem. Tente novamente.' },
        { status: 500 }
      )
    }

    logger.info('Email de contato enviado', { email, assunto, context: 'contato-api' })
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    logger.error('Erro inesperado na API de contato', error as Error, { context: 'contato-api' })
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
