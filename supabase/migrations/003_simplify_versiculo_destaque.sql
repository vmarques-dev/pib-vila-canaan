-- Migration 003: Simplificar tabela versiculo_destaque
-- ================================================================================
--
-- OBJETIVO:
-- Remover a funcionalidade de agendamento por período (data_inicio/data_fim)
-- da tabela versiculo_destaque, simplificando o sistema para apenas
-- ativação/desativação manual.
--
-- JUSTIFICATIVA:
-- A funcionalidade de agendamento por período adiciona complexidade desnecessária
-- ao sistema. Na prática, a equipe utiliza apenas a ativação/desativação manual
-- dos versículos, tornando os campos de data redundantes.
--
-- ALTERAÇÕES:
-- 1. Reverter RLS policy para versão simples (sem filtro de datas)
-- 2. Remover constraint de validação de datas
-- 3. Remover colunas data_inicio e data_fim
--
-- ================================================================================

-- -----------------------------------------------------------------------------
-- 1. REVERTER RLS POLICY
-- -----------------------------------------------------------------------------
-- Remove a policy com filtro de datas e recria a versão simples

DROP POLICY IF EXISTS "versiculo_destaque_select_public" ON versiculo_destaque;

CREATE POLICY "versiculo_destaque_select_public"
    ON versiculo_destaque FOR SELECT
    TO public
    USING (true);

COMMENT ON POLICY "versiculo_destaque_select_public" ON versiculo_destaque IS
    'Permite leitura pública de todos os versículos. '
    'O controle de exibição é feito pelo campo "ativo".';

-- -----------------------------------------------------------------------------
-- 2. REMOVER CONSTRAINT DE VALIDAÇÃO DE DATAS
-- -----------------------------------------------------------------------------

ALTER TABLE versiculo_destaque
    DROP CONSTRAINT IF EXISTS chk_versiculo_datas;

-- -----------------------------------------------------------------------------
-- 3. REMOVER COLUNAS DE DATA
-- -----------------------------------------------------------------------------

ALTER TABLE versiculo_destaque
    DROP COLUMN IF EXISTS data_inicio,
    DROP COLUMN IF EXISTS data_fim;

-- ================================================================================
-- VALIDAÇÃO PÓS-MIGRATION
-- ================================================================================
--
-- Execute para verificar que as colunas foram removidas:
--
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'versiculo_destaque'
-- ORDER BY ordinal_position;
--
-- Resultado esperado: id, livro, referencia, texto, ativo, created_at
--
-- ================================================================================
-- ROLLBACK (se necessário)
-- ================================================================================
--
-- Para reverter esta migration:
--
-- ALTER TABLE versiculo_destaque
--     ADD COLUMN data_inicio DATE,
--     ADD COLUMN data_fim DATE;
--
-- ALTER TABLE versiculo_destaque
--     ADD CONSTRAINT chk_versiculo_datas
--     CHECK (data_fim IS NULL OR data_inicio IS NULL OR data_fim >= data_inicio);
--
-- ================================================================================
