-- =============================================================================
-- Migration 009: Expand gallery photo categories
-- =============================================================================
-- The gallery `categoria` column is backed by the `categoria_galeria` enum,
-- which only had: Cultos, Jovens, Eventos Especiais, Infantil. That left no
-- home for common church photos (the building itself, baptisms, the Lord's
-- Supper, missions/outreach), so this migration:
--
--   1. Renames 'Eventos Especiais' to the broader 'Eventos'.
--   2. Adds: 'Nossa Igreja', 'Batismos', 'Santa Ceia', 'Missões e Ação Social'.
--
-- RENAME VALUE relabels the value in place, so existing rows that were
-- 'Eventos Especiais' automatically read as 'Eventos' — no data migration
-- needed. The display order in the UI is driven by the GALERIA_CATEGORIAS
-- constant in the app, not by the enum order, so appending the new values is
-- fine.
--
-- The whole script is idempotent: the rename is guarded and the additions use
-- IF NOT EXISTS, so re-running it is a no-op.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Rename 'Eventos Especiais' -> 'Eventos' (guarded for re-runs).
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'categoria_galeria'
          AND e.enumlabel = 'Eventos Especiais'
    ) THEN
        ALTER TYPE categoria_galeria RENAME VALUE 'Eventos Especiais' TO 'Eventos';
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Add the new categories (idempotent).
-- -----------------------------------------------------------------------------
ALTER TYPE categoria_galeria ADD VALUE IF NOT EXISTS 'Nossa Igreja';
ALTER TYPE categoria_galeria ADD VALUE IF NOT EXISTS 'Batismos';
ALTER TYPE categoria_galeria ADD VALUE IF NOT EXISTS 'Santa Ceia';
ALTER TYPE categoria_galeria ADD VALUE IF NOT EXISTS 'Missões e Ação Social';
