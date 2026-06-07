-- =============================================================================
-- Migration 007: Let worshipers cancel their own event registrations
-- =============================================================================
-- The `inscricoes` table already lets an adorador SELECT their own rows, but
-- DELETE was restricted to admins. The new "Meus Eventos" page in the
-- worshiper channel needs to let a worshiper cancel a registration they made
-- themselves.
--
-- Add a DELETE policy scoped to the authenticated worshiper's own
-- registrations. Admin and insert policies are unchanged.
-- =============================================================================

DROP POLICY IF EXISTS "Adoradores podem cancelar suas inscricoes" ON inscricoes;

CREATE POLICY "Adoradores podem cancelar suas inscricoes" ON inscricoes
    FOR DELETE
    USING (
        adorador_id IN (
            SELECT id FROM adoradores WHERE user_id = auth.uid()
        )
    );
