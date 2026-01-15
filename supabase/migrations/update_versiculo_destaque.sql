-- Atualizar estrutura da tabela versiculo_destaque
-- Adicionar novas colunas necessárias

-- Adicionar coluna 'livro' se não existir
ALTER TABLE versiculo_destaque
ADD COLUMN IF NOT EXISTS livro TEXT;

-- Adicionar coluna 'texto' se não existir
ALTER TABLE versiculo_destaque
ADD COLUMN IF NOT EXISTS texto TEXT;

-- Adicionar colunas de data se não existirem
ALTER TABLE versiculo_destaque
ADD COLUMN IF NOT EXISTS data_inicio DATE;

ALTER TABLE versiculo_destaque
ADD COLUMN IF NOT EXISTS data_fim DATE;

-- Migrar dados existentes: copiar conteúdo de 'versiculo' para 'texto' (se a coluna versiculo existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'versiculo_destaque'
    AND column_name = 'versiculo'
  ) THEN
    UPDATE versiculo_destaque
    SET texto = versiculo
    WHERE texto IS NULL OR texto = '';
  END IF;
END $$;

-- Remover a coluna antiga 'versiculo' se existir
ALTER TABLE versiculo_destaque
DROP COLUMN IF EXISTS versiculo;

-- Garantir que as colunas essenciais não sejam nulas
ALTER TABLE versiculo_destaque
ALTER COLUMN livro SET DEFAULT '',
ALTER COLUMN texto SET DEFAULT '',
ALTER COLUMN referencia SET DEFAULT '';

-- Comentários para documentação
COMMENT ON COLUMN versiculo_destaque.livro IS 'Nome do livro bíblico (ex: João, Gênesis)';
COMMENT ON COLUMN versiculo_destaque.referencia IS 'Capítulo e versículo (ex: 3:16)';
COMMENT ON COLUMN versiculo_destaque.texto IS 'Texto completo do versículo';
COMMENT ON COLUMN versiculo_destaque.data_inicio IS 'Data de início de exibição (opcional)';
COMMENT ON COLUMN versiculo_destaque.data_fim IS 'Data de fim de exibição (opcional)';
