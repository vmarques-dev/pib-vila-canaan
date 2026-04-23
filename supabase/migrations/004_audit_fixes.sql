-- =============================================
-- PIB VILA CANAAN — MIGRATION 004
-- Correções identificadas na auditoria do banco
-- Data: 2026-04-22
-- =============================================


-- =============================================
-- #1, #2, #3 — Timestamps nullable
-- avisos.created_at, avisos.updated_at,
-- pedidos_oracao.created_at
-- =============================================

-- Corrigir eventuais nulos antes de setar NOT NULL
UPDATE avisos SET created_at = NOW() WHERE created_at IS NULL;
UPDATE avisos SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE pedidos_oracao SET created_at = NOW() WHERE created_at IS NULL;

ALTER TABLE avisos
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE pedidos_oracao
    ALTER COLUMN created_at SET NOT NULL;


-- =============================================
-- #4 — versiculo_destaque sem CHECK constraints
-- =============================================

ALTER TABLE versiculo_destaque
    DROP CONSTRAINT IF EXISTS chk_versiculo_referencia_length,
    DROP CONSTRAINT IF EXISTS chk_versiculo_texto_length;

ALTER TABLE versiculo_destaque
    ADD CONSTRAINT chk_versiculo_referencia_length
        CHECK (char_length(referencia) <= 20),
    ADD CONSTRAINT chk_versiculo_texto_length
        CHECK (char_length(texto) <= 1000);


-- =============================================
-- #5 — avisos sem CHECK de tamanho
-- =============================================

ALTER TABLE avisos
    DROP CONSTRAINT IF EXISTS chk_avisos_titulo_length,
    DROP CONSTRAINT IF EXISTS chk_avisos_conteudo_length;

ALTER TABLE avisos
    ADD CONSTRAINT chk_avisos_titulo_length
        CHECK (char_length(titulo) >= 1 AND char_length(titulo) <= 200),
    ADD CONSTRAINT chk_avisos_conteudo_length
        CHECK (char_length(conteudo) >= 1 AND char_length(conteudo) <= 5000);


-- =============================================
-- #6 — pedidos_oracao sem CHECK de tamanho
-- =============================================

ALTER TABLE pedidos_oracao
    DROP CONSTRAINT IF EXISTS chk_pedidos_descricao_length;

ALTER TABLE pedidos_oracao
    ADD CONSTRAINT chk_pedidos_descricao_length
        CHECK (char_length(descricao) >= 10 AND char_length(descricao) <= 2000);


-- =============================================
-- #7 — informacoes_igreja sem unicidade
-- Padrão singleton: coluna boolean sempre TRUE
-- com UNIQUE impede mais de uma linha
-- =============================================

-- Remover duplicatas caso existam (mantém a mais recente)
DELETE FROM informacoes_igreja
WHERE id NOT IN (
    SELECT id FROM informacoes_igreja ORDER BY created_at DESC LIMIT 1
);

ALTER TABLE informacoes_igreja
    DROP CONSTRAINT IF EXISTS chk_informacoes_singleton,
    DROP CONSTRAINT IF EXISTS informacoes_igreja_singleton_key;

ALTER TABLE informacoes_igreja
    ADD COLUMN IF NOT EXISTS singleton BOOLEAN NOT NULL DEFAULT TRUE,
    ADD CONSTRAINT chk_informacoes_singleton
        CHECK (singleton = TRUE),
    ADD CONSTRAINT informacoes_igreja_singleton_key
        UNIQUE (singleton);


-- =============================================
-- #8–#11 — Índices ausentes
-- =============================================

CREATE INDEX idx_avisos_ativo
    ON avisos(ativo);

CREATE INDEX idx_inscricoes_adorador_id
    ON inscricoes(adorador_id);

CREATE INDEX idx_pedidos_oracao_adorador_id
    ON pedidos_oracao(adorador_id);

CREATE INDEX idx_pedidos_oracao_respondido
    ON pedidos_oracao(respondido);


-- =============================================
-- #12, #13 — Índices redundantes
-- UNIQUE constraints já criam índice implicitamente
-- =============================================

DROP INDEX IF EXISTS idx_adoradores_user_id;
DROP INDEX IF EXISTS idx_usuarios_admin_user_id;


-- =============================================
-- #14 — Nomenclatura do trigger de avisos
-- =============================================

DROP TRIGGER IF EXISTS update_avisos_updated_at ON avisos;

CREATE TRIGGER tr_avisos_updated_at
    BEFORE UPDATE ON avisos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =============================================
-- #15 — Policy SELECT duplicada em informacoes_igreja
-- =============================================

DROP POLICY IF EXISTS "informacoes_igreja_public_read" ON informacoes_igreja;


-- =============================================
-- #16 + #18 — avisos: auth.role() depreciado
-- e nomenclatura inconsistente
-- =============================================

DROP POLICY IF EXISTS "Membros podem ler avisos ativos" ON avisos;
DROP POLICY IF EXISTS "Admins podem gerenciar avisos" ON avisos;

CREATE POLICY "avisos_select_membros"
    ON avisos FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL AND ativo = true);

CREATE POLICY "avisos_all_admin"
    ON avisos FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );


-- =============================================
-- #17 — estudos_select_admin redundante
-- estudos_select_public TO public USING (true)
-- já cobre todos os roles incluindo admins
-- =============================================

DROP POLICY IF EXISTS "estudos_select_admin" ON estudos;


-- =============================================
-- #18 — Nomenclatura inconsistente em policies
-- inscricoes e pedidos_oracao
-- =============================================

-- inscricoes
DROP POLICY IF EXISTS "Qualquer pessoa pode se inscrever" ON inscricoes;
DROP POLICY IF EXISTS "Adoradores podem ver suas inscricoes" ON inscricoes;
DROP POLICY IF EXISTS "Admins podem ver todas as inscricoes" ON inscricoes;
DROP POLICY IF EXISTS "Admins podem excluir inscricoes" ON inscricoes;

CREATE POLICY "inscricoes_insert_public"
    ON inscricoes FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "inscricoes_select_adorador"
    ON inscricoes FOR SELECT
    USING (
        adorador_id IN (
            SELECT id FROM adoradores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "inscricoes_select_admin"
    ON inscricoes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

CREATE POLICY "inscricoes_delete_admin"
    ON inscricoes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- pedidos_oracao
DROP POLICY IF EXISTS "Membros podem ver próprios pedidos" ON pedidos_oracao;
DROP POLICY IF EXISTS "Membros podem criar pedidos" ON pedidos_oracao;
DROP POLICY IF EXISTS "Membros podem deletar próprios pedidos" ON pedidos_oracao;
DROP POLICY IF EXISTS "Admins podem gerenciar pedidos de oração" ON pedidos_oracao;

CREATE POLICY "pedidos_oracao_select_proprio"
    ON pedidos_oracao FOR SELECT
    USING (
        adorador_id IN (
            SELECT id FROM adoradores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "pedidos_oracao_insert_proprio"
    ON pedidos_oracao FOR INSERT
    WITH CHECK (
        adorador_id IN (
            SELECT id FROM adoradores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "pedidos_oracao_delete_proprio"
    ON pedidos_oracao FOR DELETE
    USING (
        adorador_id IN (
            SELECT id FROM adoradores WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "pedidos_oracao_all_admin"
    ON pedidos_oracao FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );


-- =============================================
-- #19 — handle_new_adorador: criar perfil apenas
-- para usuários com role 'adorador', protegendo
-- criação de admins via Supabase Studio
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_adorador()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Criar perfil de adorador apenas para usuários com role 'adorador'.
    -- Admins criados via Supabase Studio não têm esse role no metadata
    -- e não devem receber perfil de adorador.
    IF (NEW.raw_user_meta_data->>'role') = 'adorador' THEN
        INSERT INTO public.adoradores (user_id, nome, email, telefone)
        VALUES (
            NEW.id,
            COALESCE(
                NULLIF(TRIM(NEW.raw_user_meta_data->>'nome'), ''),
                'Usuário'
            ),
            NEW.email,
            NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'telefone', '')), '')
        );
    END IF;
    RETURN NEW;
END;
$$;
