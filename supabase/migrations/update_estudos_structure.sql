-- Atualizar estrutura da tabela estudos
-- Separar campo versículo em livro, referência e texto

-- Adicionar novas colunas
ALTER TABLE estudos
ADD COLUMN IF NOT EXISTS livro TEXT;

ALTER TABLE estudos
ADD COLUMN IF NOT EXISTS referencia TEXT;

ALTER TABLE estudos
ADD COLUMN IF NOT EXISTS texto_versiculo TEXT;

-- Migrar dados existentes
-- Copiar o conteúdo do campo 'versiculo' para 'referencia' (temporário)
UPDATE estudos
SET referencia = versiculo
WHERE (referencia IS NULL OR referencia = '') AND versiculo IS NOT NULL;

-- Remover a coluna antiga 'versiculo' após migração
-- NOTA: Execute esta linha apenas após confirmar que os dados foram migrados corretamente
-- ALTER TABLE estudos DROP COLUMN IF EXISTS versiculo;

-- Comentários para documentação
COMMENT ON COLUMN estudos.livro IS 'Nome do livro bíblico (ex: João, Gênesis)';
COMMENT ON COLUMN estudos.referencia IS 'Capítulo e versículo (ex: 3:16 ou 3:16-17)';
COMMENT ON COLUMN estudos.texto_versiculo IS 'Texto completo do versículo bíblico';
