# Documentação de Segurança - PIB Vila Canaan

Este documento descreve as práticas e mecanismos de segurança implementados no projeto.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Validação de Dados](#validação-de-dados)
5. [Proteção de Credenciais](#proteção-de-credenciais)
6. [Logging Seguro](#logging-seguro)
7. [Rate Limiting](#rate-limiting)
8. [Deploy e Rollback](#deploy-e-rollback)
9. [Checklist de Segurança](#checklist-de-segurança)
10. [Contato para Vulnerabilidades](#contato-para-vulnerabilidades)

---

## Visão Geral

O projeto implementa múltiplas camadas de segurança para proteger dados dos usuários e garantir que apenas administradores autorizados tenham acesso ao painel admin.

**Princípios de Segurança**:
- ✅ **Defense in Depth** - Múltiplas camadas de proteção
- ✅ **Least Privilege** - Usuários têm apenas permissões necessárias
- ✅ **Fail Secure** - Em caso de falha, sistema nega acesso
- ✅ **Separation of Concerns** - Segurança não depende de um único ponto

---

## Autenticação e Autorização

### Middleware Server-Side

**Arquivo**: `middleware.ts`

Todas as rotas `/admin/*` são protegidas por middleware Next.js que roda no servidor:

```typescript
export async function middleware(req: NextRequest) {
  const { supabase, response } = createMiddlewareClient(req)
  const { data: { session } } = await supabase.auth.getSession()

  if (req.nextUrl.pathname.startsWith('/admin')) {
    // 1. Verifica sessão ativa
    if (!session) {
      return NextResponse.redirect(new URL('/login/admin', req.url))
    }

    // 2. Verifica role='admin' no user_metadata
    if (session.user.user_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 3. Verifica se está ativo na tabela usuarios_admin
    const { data: admin } = await supabase
      .from('usuarios_admin')
      .select('ativo')
      .eq('user_id', session.user.id)
      .single()

    if (!admin || !admin.ativo) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return response
}
```

**Proteções**:
- ✅ **Server-side** - Não pode ser bypassado via DevTools
- ✅ **Tripla verificação** - Sessão + Role + Tabela
- ✅ **Logout automático** - Remove sessão se não autorizado

### Tabela usuarios_admin

**Arquivo**: `supabase/migrations/001_create_usuarios_admin.sql`

Controla quais usuários têm acesso ao painel admin:

```sql
CREATE TABLE usuarios_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Como Gerenciar Admins**:

```sql
-- Adicionar novo admin
INSERT INTO usuarios_admin (user_id, ativo)
SELECT id, true FROM auth.users WHERE email = 'admin@exemplo.com';

-- Desabilitar admin (sem deletar)
UPDATE usuarios_admin SET ativo = false WHERE user_id = 'uuid-do-usuario';

-- Reabilitar admin
UPDATE usuarios_admin SET ativo = true WHERE user_id = 'uuid-do-usuario';

-- Listar todos os admins
SELECT ua.*, u.email, u.user_metadata->'role' as role
FROM usuarios_admin ua
JOIN auth.users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC;
```

---

## Row Level Security (RLS)

### Storage - Bucket 'eventos'

**Arquivo**: `supabase/migrations/002_fix_storage_rls.sql`

Apenas admins ativos podem fazer upload/delete de imagens:

```sql
-- Leitura pública (imagens do site)
CREATE POLICY "Leitura pública de eventos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'eventos');

-- Upload apenas para admins ativos
CREATE POLICY "Apenas admins ativos podem fazer upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'eventos'
    AND auth.uid() IN (
      SELECT user_id FROM usuarios_admin WHERE ativo = true
    )
  );
```

**Validação**:
- ✅ Usuário comum autenticado → Upload FALHA (403 Forbidden)
- ✅ Admin ativo → Upload FUNCIONA
- ✅ Admin inativo → Upload FALHA (403 Forbidden)

### Tabelas Principais

Todas as tabelas têm RLS habilitado com policies específicas:

- **eventos**: Admin pode CRUD, público pode SELECT
- **estudos**: Admin pode CRUD, público pode SELECT
- **galeria**: Admin pode CRUD, público pode SELECT
- **equipe_pastoral**: Admin pode CRUD, público pode SELECT
- **usuarios_admin**: Usuário vê apenas próprio registro

---

## Validação de Dados

### Schemas Zod

**Arquivo**: `lib/validations/contato.ts` (e outros)

Todas as APIs e formulários validam dados com Zod:

```typescript
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

  mensagem: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(1000, 'Mensagem muito longa')
    .trim(),
})
```

**Proteções**:
- ✅ **Sanitização automática** - trim(), toLowerCase()
- ✅ **Validação de formato** - regex, email, URL
- ✅ **Limites de tamanho** - previne DoS
- ✅ **Mensagens descritivas** - sem expor detalhes internos

### Sanitização HTML

**Arquivo**: `app/api/contato/route.ts`

Todos os dados enviados por email são escapados:

```typescript
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
```

**Proteção contra**: XSS (Cross-Site Scripting)

---

## Proteção de Credenciais

### Variáveis de Ambiente

**Arquivo**: `.env.local` (NÃO commitado no Git)

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
RESEND_API_KEY=re_sua-chave-resend
```

**Proteções**:
- ✅ `.env.local` no `.gitignore`
- ✅ Apenas `NEXT_PUBLIC_*` são expostas ao browser
- ✅ Keys privadas apenas no servidor
- ✅ `.env.local.example` com placeholders

**⚠️ IMPORTANTE**:
- ❌ NUNCA commitar `.env.local` no Git
- ❌ NUNCA expor `RESEND_API_KEY` no cliente
- ✅ Rotacionar keys se expostas acidentalmente

---

## Logging Seguro

**Arquivo**: `lib/logger.ts`

Logger personalizado que não expõe dados sensíveis:

```typescript
class Logger {
  error(message: string, error?: Error, context?: LogContext): void {
    const fullContext = {
      ...context,
      errorMessage: error?.message,
      stack: error?.stack,
      // NÃO inclui: email, user_id, role, tokens
    }

    console.error(this.formatMessage('ERROR', message, fullContext))
  }
}
```

**O que NÃO logar**:
- ❌ Emails de usuários
- ❌ Senhas (óbvio, mas reforçando)
- ❌ Tokens de autenticação
- ❌ User IDs (apenas em contexto de erro crítico)
- ❌ Roles de usuário
- ❌ Dados pessoais

**O que logar**:
- ✅ Erros de autenticação (sem detalhes sensíveis)
- ✅ Tentativas de acesso não autorizado
- ✅ Operações CRUD (sem dados pessoais)
- ✅ Uploads de arquivo (sem conteúdo)

---

## Rate Limiting

### API de Contato

**Arquivo**: `app/api/contato/route.ts`

Limite de 3 requests por hora por IP:

```typescript
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const limit = requestCounts.get(ip)

  if (limit && limit.resetTime > now) {
    if (limit.count >= 3) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em 1 hora.' },
        { status: 429 }
      )
    }
    limit.count++
  } else {
    requestCounts.set(ip, { count: 1, resetTime: now + 3600000 })
  }
}
```

**Proteção contra**: Spam, abuso, tentativas de força bruta

---

## Deploy e Rollback

### Feature Flags

Duas variáveis de ambiente permitem rollback rápido sem redeploy. Cada uma é
lida diretamente via `process.env` no arquivo onde tem efeito.

| Variável | Arquivo | Default | Efeito quando `false` |
|---|---|---|---|
| `NEXT_PUBLIC_USE_MIDDLEWARE_AUTH` | `middleware.ts` | `true` | Bypass total da proteção de `/admin/*` e `/adorador/*` |
| `NEXT_PUBLIC_USE_RATE_LIMITING` | `app/api/contato/route.ts` | `true` | Desativa o limite de 3 req/h por IP |

**Como fazer rollback de emergência**:
1. Acessar Vercel Dashboard → Settings → Environment Variables
2. Mudar a flag relevante para `false`
3. Aguardar redeploy automático (~2 minutos)

⚠️ Nunca manter `NEXT_PUBLIC_USE_MIDDLEWARE_AUTH=false` em produção por tempo
prolongado — a proteção de rotas admin fica totalmente desligada.

---

## Checklist de Segurança

### Antes de Deploy em Produção

- [ ] Migrations executadas no Supabase
- [ ] Tabela `usuarios_admin` populada com pelo menos 1 admin
- [ ] RLS policies habilitadas em todas as tabelas
- [ ] Storage policies restritivas aplicadas
- [ ] `.env.local` NÃO commitado
- [ ] Feature flags configuradas corretamente
- [ ] Middleware testado (bloqueia não-admins)
- [ ] Rate limiting testado
- [ ] Logs não expõem dados sensíveis
- [ ] README atualizado
- [ ] Plano de rollback documentado

### Auditoria Regular

**Mensal**:
- [ ] Revisar usuários ativos em `usuarios_admin`
- [ ] Verificar logs de tentativas de acesso não autorizado
- [ ] Rotacionar API keys (se necessário)

**Trimestral**:
- [ ] Atualizar dependências (`npm audit fix`)
- [ ] Revisar RLS policies
- [ ] Testar procedimento de rollback

**Anual**:
- [ ] Audit completo de segurança
- [ ] Revisão de toda documentação
- [ ] Treinamento de equipe sobre práticas de segurança

---

## Contato para Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança, por favor:

1. **NÃO abra uma issue pública** no GitHub
2. Envie email para: [seu-email-de-seguranca@exemplo.com]
3. Inclua:
   - Descrição detalhada da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se tiver)

Responderemos em até 48 horas e manteremos você informado sobre o progresso.

---

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Zod Documentation](https://zod.dev/)

---

**Última atualização**: Janeiro 2026
**Versão**: 2.0
**Responsável**: Equipe de Desenvolvimento
