# Supabase Migrations - PIB Vila Canaan

This directory contains the SQL migrations for the Supabase database.

## How to Run Migrations

### Via Supabase Studio (Recommended)

1. Open the [Supabase Studio](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the side menu
4. Open the desired migration file from this directory
5. Copy the SQL contents
6. Paste them into the SQL Editor
7. Click **Run** to execute

### Execution Order

The migrations are split into two phases. Run all the named ones first
(phase 1, created before the numbered convention), then the numbered ones
(phase 2, in prefix order).

**Phase 1 — Named migrations (approximate order of creation):**

1. `adoradores.sql` — Creates the `adoradores` table (Worshiper Channel)
2. `canal_adorador.sql` — Creates the `avisos` table (announcement board for members)
3. `update_versiculo_destaque.sql` — Updates the featured-verse table
4. `update_eventos_table.sql` — Refactors the `eventos` table structure
5. `evento_horario_split.sql` — Splits the `horario` column into `horario_inicio` and `horario_fim`
6. `inscricoes.sql` — Creates the event-registration table
7. `create_eventos_bucket.sql` — Creates the Storage bucket for event images
8. `fix_eventos_bucket_policies.sql` — Initial bucket policies (superseded by `002_fix_storage_rls.sql`; kept for traceability)
9. `update_estudos_structure.sql` — Refactors the `estudos` table structure

**Phase 2 — Numbered migrations (run in prefix order):**

10. `001_create_usuarios_admin.sql` — Creates the admin-control table
11. `002_fix_storage_rls.sql` — Restrictive Storage RLS (active admins only)
12. `003_simplify_versiculo_destaque.sql` — Removes period scheduling from the featured-verse table
13. `004_audit_fixes.sql` — Fixes identified during a database audit
14. `005_drop_missao_visao_columns.sql` — Drops the unused `missao` and `visao` columns from `informacoes_igreja`
15. `006_auto_create_adorador_profile.sql` — Trigger that auto-creates an `adoradores` row on adorador signup, plus a backfill for existing orphans
16. `007_adorador_cancel_inscricao.sql` — Adds a DELETE policy so worshipers can cancel their own event registrations

## Migration 001: usuarios_admin Table

### ⚠️ REQUIRED ACTION AFTER RUNNING THE MIGRATION

After running `001_create_usuarios_admin.sql`, you MUST seed the table
with at least one admin user:

```sql
-- Replace 'youremail@example.com' with the real admin user's email
INSERT INTO usuarios_admin (user_id, ativo)
SELECT id, true
FROM auth.users
WHERE email = 'youremail@example.com';
```

### Verify the admin was created

```sql
SELECT ua.*, u.email
FROM usuarios_admin ua
JOIN auth.users u ON ua.user_id = u.id;
```

### Useful Commands

```sql
-- Add a new admin
INSERT INTO usuarios_admin (user_id, ativo)
SELECT id, true FROM auth.users WHERE email = 'new-admin@example.com';

-- Disable an admin (without deleting)
UPDATE usuarios_admin SET ativo = false WHERE user_id = 'user-uuid';

-- Re-enable an admin
UPDATE usuarios_admin SET ativo = true WHERE user_id = 'user-uuid';

-- List all admins
SELECT ua.*, u.email, u.user_metadata->'role' as role
FROM usuarios_admin ua
JOIN auth.users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC;
```

## Migration 002: Storage RLS Policies

### ⚠️ DEPENDENCY: Run AFTER migration 001

Migration 002 depends on the `usuarios_admin` table created in migration 001.

### What it does

- Removes the permissive policies on the `eventos` bucket (any authenticated user could upload)
- Creates restrictive policies: only active admins can INSERT / UPDATE / DELETE
- Keeps public read access (site images are public)

### Validation

After running, test it:

```sql
-- 1. Check the created policies (should return 4)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%admin%';

-- 2. Inspect policy details
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
```

### Manual tests

1. **As a regular user** (non-admin):
   - ❌ Upload must FAIL (403 Forbidden)
   - ✅ Viewing images must WORK

2. **As an active admin**:
   - ✅ Upload must WORK
   - ✅ Delete must WORK
   - ✅ Viewing must WORK

3. **As an inactive admin** (`ativo = false`):
   - ❌ Upload must FAIL (403 Forbidden)

## Security Checklist

Before deploying to production, verify:

- [ ] `001_create_usuarios_admin.sql` executed
- [ ] At least one active admin seeded in the table
- [ ] RLS enabled on the `usuarios_admin` table
- [ ] Storage policies fixed (migration 002)
- [ ] Next.js middleware working (route protection tested)
- [ ] Admin login tested end-to-end
- [ ] Image upload tested (admins only)

## Rollback

If you need to revert migration 001:

```sql
-- CAUTION: this drops the table and all its data
DROP TABLE IF EXISTS usuarios_admin CASCADE;
DROP FUNCTION IF EXISTS update_usuarios_admin_updated_at() CASCADE;
```
