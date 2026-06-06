-- =============================================================================
-- Migration 006: Auto-create adorador profile on signup
-- =============================================================================
-- The /cadastro flow called supabase.auth.signUp() but never inserted the
-- matching row into `adoradores`. Worshipers could log in but had no profile,
-- so prayer requests, the profile page, and event registrations all failed
-- silently (they look up the adorador by user_id and find nothing).
--
-- This migration makes the database the source of truth: whenever a new
-- auth.users row is created with role = 'adorador' in its metadata, a trigger
-- creates the corresponding `adoradores` row automatically. The app can no
-- longer leave a worshiper orphaned, regardless of where the signup comes
-- from (web form today, a mobile app tomorrow, manual admin creation, etc.).
--
-- Admins are intentionally excluded: only users whose metadata role is
-- exactly 'adorador' get a profile, so admin accounts never become
-- worshipers by accident.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Trigger function
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER so it can insert into `adoradores` regardless of the RLS
-- policies that gate normal client writes. The NOT EXISTS guard makes the
-- function idempotent and independent of any unique constraint on user_id.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_adorador()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'role' = 'adorador' THEN
        INSERT INTO public.adoradores (user_id, nome, email, telefone)
        SELECT
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'nome', ''),
            NEW.email,
            NULLIF(NEW.raw_user_meta_data->>'telefone', '')
        WHERE NOT EXISTS (
            SELECT 1 FROM public.adoradores WHERE user_id = NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_adorador() IS
    'Creates an adoradores row when a new auth.users row has role = adorador.';

-- -----------------------------------------------------------------------------
-- 2. Trigger
-- -----------------------------------------------------------------------------
-- Dropped first so re-running the migration is safe.
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created_adorador ON auth.users;

CREATE TRIGGER on_auth_user_created_adorador
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_adorador();

-- -----------------------------------------------------------------------------
-- 3. Backfill existing orphans
-- -----------------------------------------------------------------------------
-- Any user who already signed up as an adorador before this migration and
-- never got a profile (the bug) gets one now. `telefone` is taken from
-- metadata when present; for users who signed up before the app started
-- storing it there, it stays NULL (the original value was lost at signup).
-- -----------------------------------------------------------------------------
INSERT INTO public.adoradores (user_id, nome, email, telefone)
SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'nome', ''),
    u.email,
    NULLIF(u.raw_user_meta_data->>'telefone', '')
FROM auth.users u
LEFT JOIN public.adoradores a ON a.user_id = u.id
WHERE u.raw_user_meta_data->>'role' = 'adorador'
  AND a.id IS NULL;
