# Security Documentation - PIB Vila Canaan

This document describes the security practices and mechanisms implemented in the project.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication and Authorization](#authentication-and-authorization)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Data Validation](#data-validation)
5. [Credential Protection](#credential-protection)
6. [Safe Logging](#safe-logging)
7. [Rate Limiting](#rate-limiting)
8. [Deploy and Rollback](#deploy-and-rollback)
9. [Security Checklist](#security-checklist)
10. [Reporting Vulnerabilities](#reporting-vulnerabilities)

---

## Overview

The project implements multiple layers of security to protect user data and ensure that only authorized administrators can access the admin panel.

**Security Principles**:

- ✅ **Defense in Depth** — multiple layers of protection
- ✅ **Least Privilege** — users only get the permissions they need
- ✅ **Fail Secure** — when something goes wrong, the system denies access
- ✅ **Separation of Concerns** — security never depends on a single point

---

## Authentication and Authorization

### Server-Side Middleware

**File**: `middleware.ts`

All `/admin/*` routes are protected by Next.js middleware running on the server. The snippet below is **simplified for clarity** — see
[`middleware.ts`](../middleware.ts) for the full implementation, which also
covers `/adorador/*`, the emergency feature flag, and error handling:

```typescript
export async function middleware(req: NextRequest) {
  const { supabase, response } = createMiddlewareClient(req)

  // getUser() revalidates the JWT with the Supabase Auth server on
  // every request — it does not just trust the cookie like getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (req.nextUrl.pathname.startsWith('/admin')) {
    // 1. Check for an authenticated user
    if (!user) {
      return NextResponse.redirect(new URL('/login/admin', req.url))
    }

    // 2. Check for role='admin' in user_metadata
    if (user.user_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 3. Check that the user is active in the usuarios_admin table
    const { data: admin } = await supabase
      .from('usuarios_admin')
      .select('ativo')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!admin || !admin.ativo) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return response
}
```

**Protections**:

- ✅ **Server-side** — cannot be bypassed via DevTools
- ✅ **Triple verification** — session + role + table
- ✅ **Automatic sign-out** — clears the session if not authorized

### usuarios_admin Table

**File**: `supabase/migrations/001_create_usuarios_admin.sql`

Controls which users have access to the admin panel:

```sql
CREATE TABLE usuarios_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Managing Admins**:

```sql
-- Add a new admin
INSERT INTO usuarios_admin (user_id, ativo)
SELECT id, true FROM auth.users WHERE email = 'admin@example.com';

-- Disable an admin (without deleting)
UPDATE usuarios_admin SET ativo = false WHERE user_id = 'user-uuid';

-- Re-enable an admin
UPDATE usuarios_admin SET ativo = true WHERE user_id = 'user-uuid';

-- List every admin
SELECT ua.*, u.email, u.user_metadata->'role' as role
FROM usuarios_admin ua
JOIN auth.users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC;
```

---

## Row Level Security (RLS)

### Storage — `eventos` Bucket

**File**: `supabase/migrations/002_fix_storage_rls.sql`

Only active admins can upload/delete images:

```sql
-- Public read access (site images)
CREATE POLICY "Public read access for eventos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'eventos');

-- Upload restricted to active admins
CREATE POLICY "Active admins can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'eventos'
    AND auth.uid() IN (
      SELECT user_id FROM usuarios_admin WHERE ativo = true
    )
  );
```

**Validation**:

- ✅ Regular authenticated user → upload FAILS (403 Forbidden)
- ✅ Active admin → upload SUCCEEDS
- ✅ Inactive admin → upload FAILS (403 Forbidden)

### Main Tables

Every table has RLS enabled with table-specific policies:

- **eventos**: admin can CRUD, public can SELECT
- **estudos**: admin can CRUD, public can SELECT
- **galeria**: admin can CRUD, public can SELECT
- **equipe_pastoral**: admin can CRUD, public can SELECT
- **usuarios_admin**: each user only sees their own row

---

## Data Validation

### Zod Schemas

**File**: `lib/validations/contato.ts` (and others)

Every API endpoint and form validates input through Zod:

```typescript
export const contatoSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
    .trim(),

  email: z.string().email('Email inválido').max(255, 'Email muito longo').toLowerCase().trim(),

  mensagem: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(1000, 'Mensagem muito longa')
    .trim(),
})
```

> User-facing validation messages are kept in Portuguese because they are
> rendered to the end user; the surrounding code and documentation are in
> English.

**Protections**:

- ✅ **Automatic sanitization** — `trim()`, `toLowerCase()`
- ✅ **Format validation** — regex, email, URL
- ✅ **Size limits** — prevents DoS
- ✅ **Descriptive messages** — without exposing internals

### HTML Sanitization

**File**: `app/api/contato/route.ts`

All data sent in the contact email is escaped:

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

**Protects against**: XSS (Cross-Site Scripting)

---

## Credential Protection

### Environment Variables

**File**: `.env.local` (NOT committed to Git)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=re_your-resend-key
```

**Protections**:

- ✅ `.env.local` listed in `.gitignore`
- ✅ Only `NEXT_PUBLIC_*` variables are exposed to the browser
- ✅ Private keys live exclusively on the server
- ✅ `.env.local.example` ships placeholders only

**⚠️ IMPORTANT**:

- ❌ NEVER commit `.env.local` to Git
- ❌ NEVER expose `RESEND_API_KEY` on the client
- ✅ Rotate keys if accidentally leaked

---

## Safe Logging

**File**: `lib/logger.ts`

Centralized logger with three levels (`info`, `warn`, `error`). `info` and
`warn` are emitted only in development; `error` is always emitted, in any
environment. Error details are extracted via `extractErrorMessage`, which
understands `Error`, Supabase `PostgrestError` (whose `.message` is
non-enumerable), and any plain object with a `message` property.

```typescript
class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development'

  error(message: string, error?: unknown, context?: LogContext): void {
    const detail = extractErrorMessage(error ?? '')
    console.error(`[ERROR] ${message}${detail ? ': ' + detail : ''}`, error, context ?? '')
    // TODO: forward to an external service in production (e.g. Sentry)
  }
}
```

Integration with an external error-tracking service (Sentry, Datadog, …)
is on the roadmap — replace the `TODO` blocks with the chosen SDK's calls.

**What NOT to log**:

- ❌ User emails
- ❌ Passwords (obvious, but worth stating)
- ❌ Auth tokens
- ❌ User IDs (only in critical-error contexts)
- ❌ User roles
- ❌ Personal data

**What to log**:

- ✅ Authentication errors (without sensitive details)
- ✅ Unauthorized-access attempts
- ✅ CRUD operations (without personal data)
- ✅ File uploads (without contents)

---

## Rate Limiting

### Contact API

**File**: [`app/api/contato/route.ts`](../app/api/contato/route.ts)

Limits are read from `RATE_LIMIT_CONFIG.CONTATO` (currently 3 requests
per hour per IP). The snippet below is **simplified for clarity** — see
the source for the full implementation, including additional client-IP
headers and the disable-via-feature-flag path:

```typescript
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const now = Date.now()
  const limit = requestCounts.get(ip)

  if (limit && limit.resetTime > now) {
    if (limit.count >= RATE_LIMIT_CONFIG.CONTATO.MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em 1 hora.' },
        { status: 429 }
      )
    }
    limit.count++
  } else {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.CONTATO.WINDOW_MS,
    })
  }
}
```

> ⚠️ The current store is a per-process `Map`, which does not survive
> serverless cold starts. Migrating to a shared store (Upstash Redis or
> Vercel KV) is tracked as a pre-production blocker.

**Protects against**: spam, abuse, brute-force attempts

---

## Deploy and Rollback

### Feature Flags

Two environment variables enable a fast rollback without a redeploy. Each
is read directly via `process.env` in the file where it takes effect.
Neither variable carries the `NEXT_PUBLIC_` prefix on purpose: both are
read only on the server, so keeping them out of the prefix means their
values are never inlined into the client bundle.

| Variable              | File                       | Default | Effect when `false`                                    |
| --------------------- | -------------------------- | ------- | ------------------------------------------------------ |
| `USE_MIDDLEWARE_AUTH` | `middleware.ts`            | `true`  | Full bypass of `/admin/*` and `/adorador/*` protection |
| `USE_RATE_LIMITING`   | `app/api/contato/route.ts` | `true`  | Disables the 3 req/h IP limit                          |

**Emergency rollback procedure**:

1. Open Vercel Dashboard → Settings → Environment Variables
2. Set the relevant flag to `false`
3. Wait for the automatic redeploy (~2 minutes)

⚠️ Never leave `USE_MIDDLEWARE_AUTH=false` in production for long — admin-route
protection is fully disabled.

> Older deployments may still have `NEXT_PUBLIC_USE_MIDDLEWARE_AUTH` and
> `NEXT_PUBLIC_USE_RATE_LIMITING` configured. Those names are no longer
> read by the code; remove them from your environment to avoid confusion.

---

## Security Checklist

### Before Deploying to Production

- [ ] Migrations executed on Supabase
- [ ] `usuarios_admin` table seeded with at least one admin
- [ ] RLS policies enabled on every table
- [ ] Restrictive Storage policies applied
- [ ] `.env.local` NOT committed
- [ ] Feature flags configured correctly
- [ ] Middleware tested (blocks non-admins)
- [ ] Rate limiting tested
- [ ] Logs do not leak sensitive data
- [ ] README up to date
- [ ] Rollback plan documented

### Routine Audits

**Monthly**:

- [ ] Review active users in `usuarios_admin`
- [ ] Inspect logs for unauthorized-access attempts
- [ ] Rotate API keys (if needed)

**Quarterly**:

- [ ] Update dependencies (`npm audit fix`)
- [ ] Review RLS policies
- [ ] Test the rollback procedure

**Annually**:

- [ ] Full security audit
- [ ] Review all documentation
- [ ] Train the team on security practices

---

## Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **DO NOT open a public issue** on GitHub.
2. Open a private security advisory at
   [github.com/vmarques-dev/pib-vila-canaan/security/advisories/new](https://github.com/vmarques-dev/pib-vila-canaan/security/advisories/new).
3. Include:
   - A detailed description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - A suggested fix (if you have one)

We will respond within 48 hours and keep you informed about the progress.

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Zod Documentation](https://zod.dev/)

---

**Last updated**: May 2026
**Version**: 2.2
**Owner**: Development team
