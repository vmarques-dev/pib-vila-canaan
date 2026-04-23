-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem fazer upload de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem excluir imagens" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar imagens" ON storage.objects;

-- Criar políticas corrigidas para o bucket eventos

-- 1. Permitir leitura pública (qualquer pessoa pode ver as imagens)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'eventos');

-- 2. Permitir upload para usuários autenticados (admin)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'eventos'
  AND auth.role() = 'authenticated'
);

-- 3. Permitir que admins excluam suas próprias imagens ou qualquer imagem (se for admin)
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'eventos'
  AND auth.role() = 'authenticated'
);

-- 4. Permitir que admins atualizem imagens
CREATE POLICY "Admins can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'eventos'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'eventos'
  AND auth.role() = 'authenticated'
);
