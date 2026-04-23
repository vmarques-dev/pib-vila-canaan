-- Tabela de adoradores (membros da igreja)
CREATE TABLE IF NOT EXISTS adoradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE adoradores ENABLE ROW LEVEL SECURITY;

-- Adoradores podem ver próprio perfil
CREATE POLICY "Adoradores podem ver próprio perfil"
  ON adoradores FOR SELECT
  USING (auth.uid() = user_id);

-- Adoradores podem atualizar próprio perfil
CREATE POLICY "Adoradores podem atualizar próprio perfil"
  ON adoradores FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins podem ver todos os adoradores
CREATE POLICY "Admins podem ver todos adoradores"
  ON adoradores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins podem inserir adoradores
CREATE POLICY "Admins podem inserir adoradores"
  ON adoradores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Qualquer usuário autenticado pode inserir seu próprio registro
CREATE POLICY "Usuários podem criar próprio registro"
  ON adoradores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_adoradores_updated_at BEFORE UPDATE ON adoradores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
