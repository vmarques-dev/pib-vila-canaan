# Migrations Supabase - PIB Vila Canaan

Este diretório contém as migrations SQL para o banco de dados Supabase.

## Como Executar Migrations

### Via Supabase Studio (Recomendado)

1. Acesse o [Supabase Studio](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue para **SQL Editor** no menu lateral
4. Abra o arquivo de migration desejado deste diretório
5. Copie o conteúdo SQL
6. Cole no SQL Editor
7. Clique em **Run** para executar

### Ordem de Execução

As migrations estão divididas em duas fases. Execute todas as nomeadas
(fase 1, criadas antes da convenção numerada) e depois as numeradas
(fase 2, em ordem de prefixo).

**Fase 1 — Migrations nomeadas (ordem aproximada de criação):**

1. `adoradores.sql` — Cria tabela `adoradores` (Canal do Adorador)
2. `canal_adorador.sql` — Cria tabela `avisos` (mural de avisos para membros)
3. `update_versiculo_destaque.sql` — Atualiza tabela de versículos em destaque
4. `update_eventos_table.sql` — Refatora estrutura da tabela `eventos`
5. `evento_horario_split.sql` — Divide a coluna `horario` em `horario_inicio` e `horario_fim`
6. `inscricoes.sql` — Cria tabela de inscrições em eventos
7. `create_eventos_bucket.sql` — Cria bucket de Storage para imagens de eventos
8. `fix_eventos_bucket_policies.sql` — Policies iniciais do bucket (substituídas pela `002_fix_storage_rls.sql`; mantida no histórico para rastreabilidade)
9. `update_estudos_structure.sql` — Refatora estrutura da tabela `estudos`

**Fase 2 — Migrations numeradas (executar na ordem do prefixo):**

10. `001_create_usuarios_admin.sql` — Cria tabela de controle de admins
11. `002_fix_storage_rls.sql` — RLS restritivo do Storage (apenas admins ativos)
12. `003_simplify_versiculo_destaque.sql` — Remove agendamento por período da tabela versiculo_destaque
13. `004_audit_fixes.sql` — Correções identificadas em auditoria do banco

## Migration 001: Tabela usuarios_admin

### ⚠️ AÇÃO NECESSÁRIA APÓS EXECUTAR A MIGRATION

Após executar `001_create_usuarios_admin.sql`, você DEVE popular a tabela com pelo menos um usuário admin:

```sql
-- Substitua 'seuemail@exemplo.com' pelo email do usuário admin real
INSERT INTO usuarios_admin (user_id, ativo)
SELECT id, true
FROM auth.users
WHERE email = 'seuemail@exemplo.com';
```

### Verificar se o admin foi criado

```sql
SELECT ua.*, u.email
FROM usuarios_admin ua
JOIN auth.users u ON ua.user_id = u.id;
```

### Comandos Úteis

```sql
-- Adicionar novo admin
INSERT INTO usuarios_admin (user_id, ativo)
SELECT id, true FROM auth.users WHERE email = 'novo-admin@exemplo.com';

-- Desabilitar admin (sem deletar)
UPDATE usuarios_admin SET ativo = false WHERE user_id = 'uuid-do-usuario';

-- Reabilitar admin
UPDATE usuarios_admin SET ativo = true WHERE user_id = 'uuid-do-usuario';

-- Listar todos os admins
SELECT ua.*, u.email, u.user_metadata->'role' as role
FROM usuarios_admin ua
JOIN auth.users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC;
```

## Migration 002: RLS Policies do Storage

### ⚠️ DEPENDÊNCIA: Executar APÓS migration 001

A migration 002 depende da tabela `usuarios_admin` criada na migration 001.

### O que faz

- Remove policies permissivas do bucket 'eventos' (qualquer autenticado podia fazer upload)
- Cria policies restritivas: apenas admins ativos podem INSERT/UPDATE/DELETE
- Mantém leitura pública (imagens do site são públicas)

### Validação

Após executar, testar:

```sql
-- 1. Verificar policies criadas (deve retornar 4)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%admin%';

-- 2. Ver detalhes das policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
```

### Testes manuais

1. **Como usuário comum** (não admin):
   - ❌ Upload deve FALHAR (403 Forbidden)
   - ✅ Visualizar imagens deve FUNCIONAR

2. **Como admin ativo**:
   - ✅ Upload deve FUNCIONAR
   - ✅ Delete deve FUNCIONAR
   - ✅ Visualizar deve FUNCIONAR

3. **Como admin inativo** (ativo=false):
   - ❌ Upload deve FALHAR (403 Forbidden)

## Checklist de Segurança

Antes de fazer deploy em produção, verifique:

- [ ] Migration 001_create_usuarios_admin.sql executada
- [ ] Pelo menos um admin ativo populado na tabela
- [ ] RLS habilitado na tabela usuarios_admin
- [ ] Policies do Storage corrigidas (migration 002)
- [ ] Middleware Next.js funcionando (testa proteção de rotas)
- [ ] Login admin testado end-to-end
- [ ] Upload de imagem testado (apenas admin consegue)

## Rollback

Se precisar reverter a migration 001:

```sql
-- CUIDADO: Isso apaga a tabela e todos os dados
DROP TABLE IF EXISTS usuarios_admin CASCADE;
DROP FUNCTION IF EXISTS update_usuarios_admin_updated_at() CASCADE;
```

