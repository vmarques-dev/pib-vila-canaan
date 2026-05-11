-- =============================================================================
-- Migration 005: Drop unused `missao` and `visao` columns
-- =============================================================================
-- The /sobre page renders Mission, Vision and Values via hard-coded text in
-- components/sobre/missao-visao-section.tsx. The matching columns on
-- informacoes_igreja were edited through /admin/configuracoes but never read
-- anywhere on the public site, leaving the admin form acting on dead data.
--
-- Since the product decision is to keep those institutional texts hard-coded,
-- the columns no longer have a purpose. This migration removes them along
-- with their COMMENT metadata.
--
-- Destructive: any text previously stored in informacoes_igreja.missao or
-- informacoes_igreja.visao will be lost. The data was never displayed to
-- end users, so the loss is purely cosmetic from the product's standpoint.
-- =============================================================================

ALTER TABLE informacoes_igreja
    DROP COLUMN IF EXISTS missao,
    DROP COLUMN IF EXISTS visao;
