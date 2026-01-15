-- Criar bucket para armazenar imagens de eventos
INSERT INTO storage.buckets (id, name, public)
VALUES ('eventos', 'eventos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao bucket eventos
-- Permitir leitura pública (qualquer pessoa pode ver as imagens)
CREATE POLICY "Permitir leitura pública de imagens de eventos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'eventos');

-- Permitir upload apenas para admins autenticados
CREATE POLICY "Admins podem fazer upload de imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'eventos'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Permitir que admins excluam imagens
CREATE POLICY "Admins podem excluir imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'eventos'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Permitir que admins atualizem imagens
CREATE POLICY "Admins podem atualizar imagens"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'eventos'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  )
);
