-- Atualizar estrutura da tabela eventos
-- Adicionar campo concluido e ajustar estrutura

-- Adicionar coluna 'horario' se não existir
ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS horario TEXT;

-- Adicionar coluna 'concluido' se não existir
ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS concluido BOOLEAN DEFAULT false;

-- Tornar data_fim opcional (já deveria ser, mas garantindo)
ALTER TABLE eventos
ALTER COLUMN data_fim DROP NOT NULL;

-- Atualizar eventos existentes sem horário para ter um valor padrão
UPDATE eventos
SET horario = '19:00'
WHERE horario IS NULL OR horario = '';

-- Comentários para documentação
COMMENT ON COLUMN eventos.horario IS 'Horário do evento (ex: 19h às 21h)';
COMMENT ON COLUMN eventos.concluido IS 'Indica se o evento foi concluído (imagem será excluída ao marcar como concluído)';
COMMENT ON COLUMN eventos.data_fim IS 'Data de fim do evento (opcional para eventos de um dia)';

-- Criar índice para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_eventos_concluido ON eventos(concluido);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio);
