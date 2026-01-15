-- Criar tabela usuarios_admin
-- Esta tabela controla quais usuários têm acesso ao painel administrativo
-- Depende de auth.users (tabela gerenciada pelo Supabase Auth)

CREATE TABLE IF NOT EXISTS usuarios_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_user_id ON usuarios_admin(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_ativo ON usuarios_admin(ativo);

-- Habilitar Row Level Security (RLS)
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins podem ver apenas o próprio registro
CREATE POLICY "Admins podem ver próprio registro"
  ON usuarios_admin FOR SELECT
  USING (
    auth.uid() = user_id
    AND ativo = true
  );

-- Nenhuma policy para INSERT/UPDATE/DELETE via cliente
-- Essas operações devem ser feitas apenas via SQL direto no Supabase Studio
-- ou por super admins via funções RPC protegidas

-- Comentários para documentação
COMMENT ON TABLE usuarios_admin IS 'Controle de acesso de administradores do sistema. Usuários nesta tabela com ativo=true têm acesso ao painel admin.';
COMMENT ON COLUMN usuarios_admin.user_id IS 'Referência ao usuário na tabela auth.users. Deve ter role=admin no user_metadata.';
COMMENT ON COLUMN usuarios_admin.ativo IS 'Flag para ativar/desativar admin sem deletar o registro. Desabilitar admin = bloquear acesso imediatamente.';
COMMENT ON COLUMN usuarios_admin.created_at IS 'Data de criação do registro.';
COMMENT ON COLUMN usuarios_admin.updated_at IS 'Data da última atualização do registro.';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_usuarios_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para chamar a função acima
CREATE TRIGGER usuarios_admin_updated_at
  BEFORE UPDATE ON usuarios_admin
  FOR EACH ROW
  EXECUTE FUNCTION update_usuarios_admin_updated_at();

-- IMPORTANTE: Popular tabela com admin existente
-- Execute este comando manualmente no Supabase Studio SQL Editor
-- Substitua 'admin@exemplo.com' pelo email do admin real do sistema

-- EXEMPLO (NÃO executará automaticamente, é comentado intencionalmente):
-- INSERT INTO usuarios_admin (user_id, ativo)
-- SELECT id, true
-- FROM auth.users
-- WHERE email = 'admin@exemplo.com';

-- Para verificar se a tabela foi criada corretamente:
-- SELECT * FROM usuarios_admin;

-- Para adicionar um novo admin manualmente:
-- INSERT INTO usuarios_admin (user_id, ativo)
-- SELECT id, true FROM auth.users WHERE email = 'novo-admin@exemplo.com';

-- Para desabilitar um admin (sem deletar):
-- UPDATE usuarios_admin SET ativo = false WHERE user_id = 'uuid-do-usuario';

-- Para reabilitar um admin:
-- UPDATE usuarios_admin SET ativo = true WHERE user_id = 'uuid-do-usuario';
