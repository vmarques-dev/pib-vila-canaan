-- =============================================
-- PIB VILA CANAAN - DATABASE SCHEMA COMPLETO
-- Generated: 2026-01-19
-- PostgreSQL/Supabase
-- =============================================
--
-- Este script cria toda a estrutura de banco de dados necessária
-- para o sistema PIB Vila Canaan no Supabase.
--
-- ORDEM DE EXECUÇÃO:
-- 1. Funções auxiliares
-- 2. Tabelas (ordem de dependência)
-- 3. Índices
-- 4. Triggers
-- 5. RLS Policies
-- 6. Storage Buckets
-- =============================================

-- =============================================
-- SEÇÃO 1: DROP TABLES (ambiente de desenvolvimento)
-- =============================================
-- ATENÇÃO: Use apenas em desenvolvimento!
-- Em produção, use migrations incrementais.

DROP TABLE IF EXISTS contatos CASCADE;
DROP TABLE IF EXISTS galeria CASCADE;
DROP TABLE IF EXISTS equipe_pastoral CASCADE;
DROP TABLE IF EXISTS estudos CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS versiculo_destaque CASCADE;
DROP TABLE IF EXISTS informacoes_igreja CASCADE;
DROP TABLE IF EXISTS adoradores CASCADE;
DROP TABLE IF EXISTS usuarios_admin CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_usuarios_admin_updated_at() CASCADE;

-- =============================================
-- SEÇÃO 2: FUNÇÕES AUXILIARES
-- =============================================

-- Função genérica para atualizar coluna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS
  'Função trigger para atualizar automaticamente a coluna updated_at em qualquer tabela';

-- =============================================
-- SEÇÃO 3: TABELAS
-- =============================================

-- ---------------------------------------------
-- 3.1 USUARIOS_ADMIN
-- Controle de acesso de administradores
-- ---------------------------------------------
CREATE TABLE usuarios_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key para auth.users (tabela gerenciada pelo Supabase)
    CONSTRAINT fk_usuarios_admin_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

COMMENT ON TABLE usuarios_admin IS
  'Controle de acesso de administradores do sistema. Usuários nesta tabela com ativo=true têm acesso ao painel admin.';
COMMENT ON COLUMN usuarios_admin.user_id IS
  'Referência ao usuário na tabela auth.users. Deve ter role=admin no user_metadata.';
COMMENT ON COLUMN usuarios_admin.ativo IS
  'Flag para ativar/desativar admin sem deletar o registro. Desabilitar = bloquear acesso imediatamente.';

-- ---------------------------------------------
-- 3.2 ADORADORES
-- Membros da igreja (perfis de usuários)
-- ---------------------------------------------
CREATE TABLE adoradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign key opcional para auth.users
    CONSTRAINT fk_adoradores_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    -- Constraints de validação
    CONSTRAINT chk_adoradores_nome_length CHECK (char_length(nome) >= 3),
    CONSTRAINT chk_adoradores_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE adoradores IS
  'Perfis dos membros da igreja. Pode ou não estar vinculado a um usuário autenticado.';
COMMENT ON COLUMN adoradores.user_id IS
  'Referência opcional ao usuário auth.users. Permite perfil sem conta de login.';
COMMENT ON COLUMN adoradores.telefone IS
  'Telefone no formato (99) 99999-9999 ou similar.';

-- ---------------------------------------------
-- 3.3 INFORMACOES_IGREJA
-- Configurações e dados da igreja
-- ---------------------------------------------
CREATE TABLE informacoes_igreja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL DEFAULT 'PIB Vila Canaan',
    endereco TEXT NOT NULL,
    telefone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    horarios TEXT,
    missao TEXT,
    visao TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints de validação
    CONSTRAINT chk_informacoes_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE informacoes_igreja IS
  'Informações gerais da igreja: contato, endereço, redes sociais e textos institucionais.';
COMMENT ON COLUMN informacoes_igreja.horarios IS
  'Horários de funcionamento e cultos da igreja.';
COMMENT ON COLUMN informacoes_igreja.missao IS
  'Declaração de missão da igreja.';
COMMENT ON COLUMN informacoes_igreja.visao IS
  'Declaração de visão da igreja.';

-- ---------------------------------------------
-- 3.4 VERSICULO_DESTAQUE
-- Versículo em destaque na página inicial
-- ---------------------------------------------
CREATE TABLE versiculo_destaque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    livro TEXT NOT NULL DEFAULT '',
    referencia TEXT NOT NULL DEFAULT '',
    texto TEXT NOT NULL DEFAULT '',
    ativo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints de validação
    CONSTRAINT chk_versiculo_referencia_length CHECK (char_length(referencia) <= 20),
    CONSTRAINT chk_versiculo_texto_length CHECK (char_length(texto) <= 1000)
);

COMMENT ON TABLE versiculo_destaque IS
  'Versículos bíblicos em destaque para exibição na página inicial. Apenas um pode estar ativo por vez.';
COMMENT ON COLUMN versiculo_destaque.livro IS
  'Nome do livro bíblico (ex: João, Gênesis, Salmos).';
COMMENT ON COLUMN versiculo_destaque.referencia IS
  'Capítulo e versículo (ex: 3:16, 23:1-3).';
COMMENT ON COLUMN versiculo_destaque.texto IS
  'Texto completo do versículo bíblico.';
COMMENT ON COLUMN versiculo_destaque.ativo IS
  'Apenas um versículo deve estar ativo. Ao ativar um, os outros devem ser desativados.';

-- ---------------------------------------------
-- 3.5 EVENTOS
-- Eventos e programações da igreja
-- ---------------------------------------------
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    horario TEXT,
    local TEXT NOT NULL,
    imagem_url TEXT,
    concluido BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints de validação
    CONSTRAINT chk_eventos_titulo_length CHECK (char_length(titulo) >= 3 AND char_length(titulo) <= 200),
    CONSTRAINT chk_eventos_descricao_length CHECK (char_length(descricao) >= 10 AND char_length(descricao) <= 1000),
    CONSTRAINT chk_eventos_local_length CHECK (char_length(local) >= 3 AND char_length(local) <= 200),
    CONSTRAINT chk_eventos_datas CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

COMMENT ON TABLE eventos IS
  'Eventos e programações da igreja. Imagens são armazenadas no bucket "eventos" do Storage.';
COMMENT ON COLUMN eventos.horario IS
  'Horário do evento (ex: 19h às 21h, 09:00).';
COMMENT ON COLUMN eventos.concluido IS
  'Indica se o evento foi concluído. Quando marcado, a imagem pode ser excluída para liberar espaço.';
COMMENT ON COLUMN eventos.imagem_url IS
  'URL da imagem do evento no Supabase Storage (bucket: eventos).';
COMMENT ON COLUMN eventos.data_fim IS
  'Data de término para eventos de múltiplos dias (opcional).';

-- ---------------------------------------------
-- 3.6 ESTUDOS
-- Estudos bíblicos e devocionais
-- ---------------------------------------------
CREATE TABLE estudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    livro TEXT,
    referencia TEXT,
    texto_versiculo TEXT,
    conteudo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    data_estudo DATE NOT NULL,
    arquivado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints de validação
    CONSTRAINT chk_estudos_titulo_length CHECK (char_length(titulo) >= 3 AND char_length(titulo) <= 200),
    CONSTRAINT chk_estudos_conteudo_length CHECK (char_length(conteudo) >= 10 AND char_length(conteudo) <= 10000),
    CONSTRAINT chk_estudos_referencia_length CHECK (referencia IS NULL OR char_length(referencia) <= 20),
    CONSTRAINT chk_estudos_texto_versiculo_length CHECK (texto_versiculo IS NULL OR char_length(texto_versiculo) <= 1000)
);

COMMENT ON TABLE estudos IS
  'Estudos bíblicos e devocionais da igreja. Podem ser arquivados ao invés de deletados.';
COMMENT ON COLUMN estudos.livro IS
  'Nome do livro bíblico base do estudo (ex: João, Romanos).';
COMMENT ON COLUMN estudos.referencia IS
  'Capítulo e versículo da passagem (ex: 3:16-17).';
COMMENT ON COLUMN estudos.texto_versiculo IS
  'Texto completo do versículo ou passagem bíblica.';
COMMENT ON COLUMN estudos.categoria IS
  'Categoria do estudo (ex: Devocional, Estudo Temático, Série).';
COMMENT ON COLUMN estudos.arquivado IS
  'Soft delete: arquiva o estudo sem excluí-lo permanentemente.';

-- ---------------------------------------------
-- 3.7 EQUIPE_PASTORAL
-- Membros da equipe pastoral/liderança
-- ---------------------------------------------
CREATE TABLE equipe_pastoral (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    foto_url TEXT,
    descricao TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints de validação
    CONSTRAINT chk_equipe_nome_length CHECK (char_length(nome) >= 3 AND char_length(nome) <= 100),
    CONSTRAINT chk_equipe_cargo_length CHECK (char_length(cargo) >= 3 AND char_length(cargo) <= 100),
    CONSTRAINT chk_equipe_descricao_length CHECK (char_length(descricao) >= 10 AND char_length(descricao) <= 1000)
);

COMMENT ON TABLE equipe_pastoral IS
  'Membros da equipe pastoral e liderança da igreja para exibição no site.';
COMMENT ON COLUMN equipe_pastoral.cargo IS
  'Cargo ou função na igreja (ex: Pastor, Diácono, Líder de Louvor).';
COMMENT ON COLUMN equipe_pastoral.ordem IS
  'Ordem de exibição na página da equipe. Menor número = aparece primeiro.';
COMMENT ON COLUMN equipe_pastoral.ativo IS
  'Permite ocultar membro temporariamente sem excluir.';

-- ---------------------------------------------
-- 3.8 GALERIA
-- Galeria de fotos da igreja
-- ---------------------------------------------

-- Criar tipo ENUM para categorias da galeria
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_galeria') THEN
        CREATE TYPE categoria_galeria AS ENUM ('Cultos', 'Jovens', 'Eventos Especiais', 'Infantil');
    END IF;
END $$;

CREATE TABLE galeria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    categoria categoria_galeria NOT NULL,
    url TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints de validação
    CONSTRAINT chk_galeria_titulo_length CHECK (char_length(titulo) >= 3 AND char_length(titulo) <= 100),
    CONSTRAINT chk_galeria_descricao_length CHECK (descricao IS NULL OR char_length(descricao) <= 500)
);

COMMENT ON TABLE galeria IS
  'Galeria de fotos da igreja organizadas por categoria.';
COMMENT ON COLUMN galeria.categoria IS
  'Categoria da foto: Cultos, Jovens, Eventos Especiais, Infantil.';
COMMENT ON COLUMN galeria.url IS
  'URL da imagem (pode ser do Supabase Storage ou URL externa).';
COMMENT ON COLUMN galeria.ordem IS
  'Ordem de exibição dentro da categoria. Menor número = aparece primeiro.';

-- ---------------------------------------------
-- 3.9 CONTATOS
-- Mensagens de contato recebidas
-- ---------------------------------------------
CREATE TABLE contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    assunto TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT false,
    respondido BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints de validação
    CONSTRAINT chk_contatos_nome_length CHECK (char_length(nome) >= 3 AND char_length(nome) <= 100),
    CONSTRAINT chk_contatos_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_contatos_assunto_length CHECK (char_length(assunto) >= 3 AND char_length(assunto) <= 200),
    CONSTRAINT chk_contatos_mensagem_length CHECK (char_length(mensagem) >= 10 AND char_length(mensagem) <= 1000)
);

COMMENT ON TABLE contatos IS
  'Mensagens de contato enviadas pelos visitantes do site.';
COMMENT ON COLUMN contatos.telefone IS
  'Telefone de contato no formato (99) 99999-9999 (opcional).';
COMMENT ON COLUMN contatos.lido IS
  'Indica se a mensagem foi visualizada pelo admin.';
COMMENT ON COLUMN contatos.respondido IS
  'Indica se a mensagem foi respondida.';

-- =============================================
-- SEÇÃO 4: ÍNDICES
-- =============================================

-- Índices para usuarios_admin
CREATE INDEX idx_usuarios_admin_user_id ON usuarios_admin(user_id);
CREATE INDEX idx_usuarios_admin_ativo ON usuarios_admin(ativo);

-- Índices para adoradores
CREATE INDEX idx_adoradores_user_id ON adoradores(user_id);
CREATE INDEX idx_adoradores_email ON adoradores(email);

-- Índices para eventos
CREATE INDEX idx_eventos_concluido ON eventos(concluido);
CREATE INDEX idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX idx_eventos_data_inicio_concluido ON eventos(data_inicio, concluido);

-- Índices para estudos
CREATE INDEX idx_estudos_data_estudo ON estudos(data_estudo);
CREATE INDEX idx_estudos_arquivado ON estudos(arquivado);
CREATE INDEX idx_estudos_categoria ON estudos(categoria);
CREATE INDEX idx_estudos_data_arquivado ON estudos(data_estudo, arquivado);

-- Índices para versiculo_destaque
CREATE INDEX idx_versiculo_destaque_ativo ON versiculo_destaque(ativo);

-- Índices para equipe_pastoral
CREATE INDEX idx_equipe_pastoral_ativo ON equipe_pastoral(ativo);
CREATE INDEX idx_equipe_pastoral_ordem ON equipe_pastoral(ordem);

-- Índices para galeria
CREATE INDEX idx_galeria_categoria ON galeria(categoria);
CREATE INDEX idx_galeria_ordem ON galeria(ordem);

-- Índices para contatos
CREATE INDEX idx_contatos_created_at ON contatos(created_at DESC);
CREATE INDEX idx_contatos_lido ON contatos(lido);
CREATE INDEX idx_contatos_respondido ON contatos(respondido);

-- =============================================
-- SEÇÃO 5: TRIGGERS
-- =============================================

-- Trigger para usuarios_admin
CREATE TRIGGER tr_usuarios_admin_updated_at
    BEFORE UPDATE ON usuarios_admin
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para adoradores
CREATE TRIGGER tr_adoradores_updated_at
    BEFORE UPDATE ON adoradores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para informacoes_igreja
CREATE TRIGGER tr_informacoes_igreja_updated_at
    BEFORE UPDATE ON informacoes_igreja
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEÇÃO 6: ROW LEVEL SECURITY (RLS)
-- =============================================

-- ---------------------------------------------
-- 6.1 RLS para USUARIOS_ADMIN
-- ---------------------------------------------
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Admins podem ver apenas o próprio registro
CREATE POLICY "usuarios_admin_select_own"
    ON usuarios_admin FOR SELECT
    USING (auth.uid() = user_id AND ativo = true);

-- Nenhuma policy para INSERT/UPDATE/DELETE via cliente
-- Essas operações devem ser feitas apenas via SQL direto no Supabase Studio

-- ---------------------------------------------
-- 6.2 RLS para ADORADORES
-- ---------------------------------------------
ALTER TABLE adoradores ENABLE ROW LEVEL SECURITY;

-- Adoradores podem ver próprio perfil
CREATE POLICY "adoradores_select_own"
    ON adoradores FOR SELECT
    USING (auth.uid() = user_id);

-- Adoradores podem atualizar próprio perfil
CREATE POLICY "adoradores_update_own"
    ON adoradores FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os adoradores
CREATE POLICY "adoradores_select_admin"
    ON adoradores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Admins podem inserir adoradores
CREATE POLICY "adoradores_insert_admin"
    ON adoradores FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Admins podem atualizar adoradores
CREATE POLICY "adoradores_update_admin"
    ON adoradores FOR UPDATE
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

-- Admins podem deletar adoradores
CREATE POLICY "adoradores_delete_admin"
    ON adoradores FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Usuários podem criar próprio registro
CREATE POLICY "adoradores_insert_own"
    ON adoradores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------
-- 6.3 RLS para INFORMACOES_IGREJA
-- ---------------------------------------------
ALTER TABLE informacoes_igreja ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "informacoes_igreja_select_public"
    ON informacoes_igreja FOR SELECT
    TO public
    USING (true);

-- Apenas admins podem modificar
CREATE POLICY "informacoes_igreja_all_admin"
    ON informacoes_igreja FOR ALL
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

-- ---------------------------------------------
-- 6.4 RLS para VERSICULO_DESTAQUE
-- ---------------------------------------------
ALTER TABLE versiculo_destaque ENABLE ROW LEVEL SECURITY;

-- Leitura pública de todos os versículos
-- O controle de exibição é feito pelo campo "ativo"
CREATE POLICY "versiculo_destaque_select_public"
    ON versiculo_destaque FOR SELECT
    TO public
    USING (true);

-- Apenas admins podem modificar
CREATE POLICY "versiculo_destaque_all_admin"
    ON versiculo_destaque FOR ALL
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

-- ---------------------------------------------
-- 6.5 RLS para EVENTOS
-- ---------------------------------------------
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Leitura pública (eventos não concluídos ou todos para admins)
CREATE POLICY "eventos_select_public"
    ON eventos FOR SELECT
    TO public
    USING (true);

-- Apenas admins podem inserir
CREATE POLICY "eventos_insert_admin"
    ON eventos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Apenas admins podem atualizar
CREATE POLICY "eventos_update_admin"
    ON eventos FOR UPDATE
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

-- Apenas admins podem deletar
CREATE POLICY "eventos_delete_admin"
    ON eventos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- ---------------------------------------------
-- 6.6 RLS para ESTUDOS
-- ---------------------------------------------
ALTER TABLE estudos ENABLE ROW LEVEL SECURITY;

-- Leitura pública (estudos não arquivados)
CREATE POLICY "estudos_select_public"
    ON estudos FOR SELECT
    TO public
    USING (arquivado = false);

-- Admins podem ver todos (incluindo arquivados)
CREATE POLICY "estudos_select_admin"
    ON estudos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Apenas admins podem inserir
CREATE POLICY "estudos_insert_admin"
    ON estudos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Apenas admins podem atualizar
CREATE POLICY "estudos_update_admin"
    ON estudos FOR UPDATE
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

-- Apenas admins podem deletar
CREATE POLICY "estudos_delete_admin"
    ON estudos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- ---------------------------------------------
-- 6.7 RLS para EQUIPE_PASTORAL
-- ---------------------------------------------
ALTER TABLE equipe_pastoral ENABLE ROW LEVEL SECURITY;

-- Leitura pública (apenas membros ativos)
CREATE POLICY "equipe_pastoral_select_public"
    ON equipe_pastoral FOR SELECT
    TO public
    USING (ativo = true);

-- Admins podem ver todos
CREATE POLICY "equipe_pastoral_select_admin"
    ON equipe_pastoral FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Apenas admins podem inserir
CREATE POLICY "equipe_pastoral_insert_admin"
    ON equipe_pastoral FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Apenas admins podem atualizar
CREATE POLICY "equipe_pastoral_update_admin"
    ON equipe_pastoral FOR UPDATE
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

-- Apenas admins podem deletar
CREATE POLICY "equipe_pastoral_delete_admin"
    ON equipe_pastoral FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- ---------------------------------------------
-- 6.8 RLS para GALERIA
-- ---------------------------------------------
ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "galeria_select_public"
    ON galeria FOR SELECT
    TO public
    USING (true);

-- Apenas admins podem inserir
CREATE POLICY "galeria_insert_admin"
    ON galeria FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Apenas admins podem atualizar
CREATE POLICY "galeria_update_admin"
    ON galeria FOR UPDATE
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

-- Apenas admins podem deletar
CREATE POLICY "galeria_delete_admin"
    ON galeria FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- ---------------------------------------------
-- 6.9 RLS para CONTATOS
-- ---------------------------------------------
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode enviar mensagem de contato
CREATE POLICY "contatos_insert_public"
    ON contatos FOR INSERT
    TO public
    WITH CHECK (true);

-- Apenas admins podem ver mensagens
CREATE POLICY "contatos_select_admin"
    ON contatos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- Apenas admins podem atualizar (marcar como lido/respondido)
CREATE POLICY "contatos_update_admin"
    ON contatos FOR UPDATE
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

-- Apenas admins podem deletar
CREATE POLICY "contatos_delete_admin"
    ON contatos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_admin
            WHERE user_id = auth.uid() AND ativo = true
        )
    );

-- =============================================
-- SEÇÃO 7: STORAGE BUCKETS
-- =============================================

-- Criar bucket para imagens de eventos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'eventos',
    'eventos',
    true,
    5242880,  -- 5MB limite
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Criar bucket para fotos da equipe pastoral
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'equipe',
    'equipe',
    true,
    2097152,  -- 2MB limite
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Criar bucket para galeria de fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'galeria',
    'galeria',
    true,
    10485760,  -- 10MB limite
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- =============================================
-- SEÇÃO 8: STORAGE RLS POLICIES
-- =============================================

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Leitura pública de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Apenas admins ativos podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Apenas admins ativos podem deletar" ON storage.objects;
DROP POLICY IF EXISTS "Apenas admins ativos podem atualizar" ON storage.objects;

-- 8.1 LEITURA PÚBLICA (imagens do site são públicas)
CREATE POLICY "storage_select_public"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id IN ('eventos', 'equipe', 'galeria'));

-- 8.2 UPLOAD: Apenas admins ativos
CREATE POLICY "storage_insert_admin"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN ('eventos', 'equipe', 'galeria')
        AND auth.uid() IN (
            SELECT user_id FROM usuarios_admin WHERE ativo = true
        )
    );

-- 8.3 DELETE: Apenas admins ativos
CREATE POLICY "storage_delete_admin"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id IN ('eventos', 'equipe', 'galeria')
        AND auth.uid() IN (
            SELECT user_id FROM usuarios_admin WHERE ativo = true
        )
    );

-- 8.4 UPDATE: Apenas admins ativos
CREATE POLICY "storage_update_admin"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id IN ('eventos', 'equipe', 'galeria')
        AND auth.uid() IN (
            SELECT user_id FROM usuarios_admin WHERE ativo = true
        )
    )
    WITH CHECK (
        bucket_id IN ('eventos', 'equipe', 'galeria')
        AND auth.uid() IN (
            SELECT user_id FROM usuarios_admin WHERE ativo = true
        )
    );

-- =============================================
-- SEÇÃO 9: DADOS INICIAIS (SEED)
-- =============================================

-- Inserir informações da igreja (registro padrão)
INSERT INTO informacoes_igreja (
    nome,
    endereco,
    telefone,
    whatsapp,
    email,
    horarios,
    missao,
    visao
) VALUES (
    'PIB Vila Canaan',
    'Endereço da Igreja',
    '(00) 0000-0000',
    '(00) 00000-0000',
    'contato@pibvilacanaan.com.br',
    'Domingos: 09h e 18h | Quartas: 19h30',
    'Glorificar a Deus e fazer discípulos de todas as nações.',
    'Ser uma igreja relevante na comunidade, transformando vidas através do Evangelho.'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- SEÇÃO 10: COMANDOS ÚTEIS (REFERÊNCIA)
-- =============================================

-- Para adicionar um novo admin manualmente:
-- INSERT INTO usuarios_admin (user_id, ativo)
-- SELECT id, true FROM auth.users WHERE email = 'admin@exemplo.com';

-- Para desabilitar um admin:
-- UPDATE usuarios_admin SET ativo = false WHERE user_id = 'uuid-do-usuario';

-- Para verificar admins ativos:
-- SELECT ua.*, u.email
-- FROM usuarios_admin ua
-- JOIN auth.users u ON ua.user_id = u.id
-- WHERE ua.ativo = true;

-- Para verificar policies de uma tabela:
-- SELECT * FROM pg_policies WHERE tablename = 'nome_tabela';

-- =============================================
-- FIM DO SCRIPT
-- =============================================
