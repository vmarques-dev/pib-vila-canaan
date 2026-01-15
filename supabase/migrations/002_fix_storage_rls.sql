-- Migration 002: Corrigir RLS Policies do Storage
-- PROBLEMA: As policies atuais permitem que QUALQUER usuário autenticado faça upload/delete/update
-- SOLUÇÃO: Restringir para apenas admins ativos (verificados na tabela usuarios_admin)

-- Remover policies permissivas existentes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update" ON storage.objects;

-- Também remover policies antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem fazer upload de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem excluir imagens" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar imagens" ON storage.objects;

-- ================================================================================
-- NOVAS POLICIES RESTRITIVAS
-- ================================================================================

-- 1. LEITURA PÚBLICA (imagens do site são públicas)
CREATE POLICY "Leitura pública de eventos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'eventos');

-- 2. UPLOAD: Apenas admins ativos
CREATE POLICY "Apenas admins ativos podem fazer upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'eventos'
    AND auth.uid() IN (
      SELECT user_id
      FROM usuarios_admin
      WHERE ativo = true
    )
  );

-- 3. DELETE: Apenas admins ativos
CREATE POLICY "Apenas admins ativos podem deletar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'eventos'
    AND auth.uid() IN (
      SELECT user_id
      FROM usuarios_admin
      WHERE ativo = true
    )
  );

-- 4. UPDATE: Apenas admins ativos
CREATE POLICY "Apenas admins ativos podem atualizar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'eventos'
    AND auth.uid() IN (
      SELECT user_id
      FROM usuarios_admin
      WHERE ativo = true
    )
  )
  WITH CHECK (
    bucket_id = 'eventos'
    AND auth.uid() IN (
      SELECT user_id
      FROM usuarios_admin
      WHERE ativo = true
    )
  );

-- Comentários para documentação
COMMENT ON POLICY "Leitura pública de eventos" ON storage.objects IS
  'Permite que qualquer pessoa visualize imagens do bucket eventos (imagens do site são públicas).';

COMMENT ON POLICY "Apenas admins ativos podem fazer upload" ON storage.objects IS
  'Apenas usuários presentes na tabela usuarios_admin com ativo=true podem fazer upload de imagens.';

COMMENT ON POLICY "Apenas admins ativos podem deletar" ON storage.objects IS
  'Apenas usuários presentes na tabela usuarios_admin com ativo=true podem deletar imagens.';

COMMENT ON POLICY "Apenas admins ativos podem atualizar" ON storage.objects IS
  'Apenas usuários presentes na tabela usuarios_admin com ativo=true podem atualizar metadados de imagens.';

-- ================================================================================
-- TESTES PARA VALIDAÇÃO
-- ================================================================================

-- Execute esses comandos após a migration para validar:

-- 1. Verificar que as policies antigas foram removidas:
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 2. Verificar que as novas policies existem (deve retornar 4 policies):
-- SELECT policyname, cmd, roles FROM pg_policies
-- WHERE tablename = 'objects'
--   AND schemaname = 'storage'
--   AND policyname LIKE '%admin%';

-- 3. Testar como usuário comum (NÃO admin):
--    - Tentar fazer upload → Deve FALHAR com erro 403
--    - Visualizar imagem → Deve FUNCIONAR

-- 4. Testar como admin ativo:
--    - Fazer upload → Deve FUNCIONAR
--    - Deletar imagem → Deve FUNCIONAR
--    - Visualizar imagem → Deve FUNCIONAR

-- 5. Testar admin INATIVO (ativo=false):
--    - Fazer upload → Deve FALHAR com erro 403

-- ================================================================================
-- ROLLBACK (se necessário)
-- ================================================================================

-- Para reverter para policies permissivas anteriores (NÃO recomendado):
-- DROP POLICY IF EXISTS "Leitura pública de eventos" ON storage.objects;
-- DROP POLICY IF EXISTS "Apenas admins ativos podem fazer upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Apenas admins ativos podem deletar" ON storage.objects;
-- DROP POLICY IF EXISTS "Apenas admins ativos podem atualizar" ON storage.objects;
--
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'eventos');
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'eventos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admins can delete" ON storage.objects FOR DELETE USING (bucket_id = 'eventos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admins can update" ON storage.objects FOR UPDATE USING (bucket_id = 'eventos' AND auth.role() = 'authenticated') WITH CHECK (bucket_id = 'eventos' AND auth.role() = 'authenticated');
