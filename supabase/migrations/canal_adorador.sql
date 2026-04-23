-- Tabela de avisos da igreja (para membros)
CREATE TABLE IF NOT EXISTS avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;

-- Membros autenticados podem ler avisos ativos
CREATE POLICY "Membros podem ler avisos ativos"
  ON avisos FOR SELECT
  USING (auth.role() = 'authenticated' AND ativo = true);

-- Admins podem fazer tudo
CREATE POLICY "Admins podem gerenciar avisos"
  ON avisos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE user_id = auth.uid() AND ativo = true
    )
  );

CREATE TRIGGER update_avisos_updated_at BEFORE UPDATE ON avisos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Tabela de pedidos de oração
CREATE TABLE IF NOT EXISTS pedidos_oracao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adorador_id UUID REFERENCES adoradores(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  respondido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE pedidos_oracao ENABLE ROW LEVEL SECURITY;

-- Membros podem criar e ver os próprios pedidos
CREATE POLICY "Membros podem ver próprios pedidos"
  ON pedidos_oracao FOR SELECT
  USING (
    adorador_id IN (
      SELECT id FROM adoradores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Membros podem criar pedidos"
  ON pedidos_oracao FOR INSERT
  WITH CHECK (
    adorador_id IN (
      SELECT id FROM adoradores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Membros podem deletar próprios pedidos"
  ON pedidos_oracao FOR DELETE
  USING (
    adorador_id IN (
      SELECT id FROM adoradores WHERE user_id = auth.uid()
    )
  );

-- Admins podem ver e atualizar todos os pedidos
CREATE POLICY "Admins podem gerenciar pedidos de oração"
  ON pedidos_oracao FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE user_id = auth.uid() AND ativo = true
    )
  );
