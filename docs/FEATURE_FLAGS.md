# Feature Flags - Guia de Uso e Rollback

Este documento explica como usar as feature flags para ativar/desativar funcionalidades e fazer rollback rápido em caso de problemas.

## 📋 Feature Flags Disponíveis

### 1. `NEXT_PUBLIC_USE_MIDDLEWARE_AUTH` (Crítica)

**O que controla**: Middleware server-side que protege rotas `/admin/*`

**Valores**:
- `true` - Middleware ativo (RECOMENDADO em produção)
- `false` - Bypass do middleware (apenas emergência)

**Localização**: `middleware.ts`

**Impacto**:
- ✅ Habilitada: Rotas admin protegidas server-side (não bypassável)
- ⚠️ Desabilitada: REMOVE PROTEÇÃO DE SEGURANÇA das rotas admin

**Quando desabilitar**:
- ❌ NUNCA em produção (exceto emergência extrema)
- ✅ Apenas para debug local se necessário

---

### 2. `NEXT_PUBLIC_USE_RATE_LIMITING`

**O que controla**: Rate limiting na API de contato (3 requests/hora por IP)

**Valores**:
- `true` - Rate limiting ativo (RECOMENDADO)
- `false` - Sem limite de requisições

**Localização**: `app/api/contato/route.ts`

**Impacto**:
- ✅ Habilitada: Proteção contra spam e abuso
- ⚠️ Desabilitada: Vulnerável a spam

**Quando desabilitar**:
- Durante testes de carga
- Debug de problemas de envio de email
- Temporariamente se usuários legítimos forem bloqueados incorretamente

---

### 3. `NEXT_PUBLIC_DEBUG_MODE`

**O que controla**: Logs adicionais para debug (não expõe dados sensíveis)

**Valores**:
- `true` - Logs extras habilitados
- `false` - Apenas logs críticos (RECOMENDADO em produção)

**Localização**: `lib/constants/features.ts`

**Impacto**:
- ✅ Habilitada: Mais informações para debug
- ⚠️ Desabilitada: Menos ruído nos logs

**Quando habilitar**:
- Durante investigação de bugs
- Quando precisar entender fluxo de execução
- Debug local de desenvolvimento

---

## 🚀 Plano de Ativação (Deploy Gradual)

### Fase 1: Deploy Inicial (Feature Flags DESABILITADAS)

```env
# .env.local ou Vercel Environment Variables
NEXT_PUBLIC_USE_MIDDLEWARE_AUTH=false
NEXT_PUBLIC_USE_RATE_LIMITING=true
NEXT_PUBLIC_DEBUG_MODE=false
```

**Ações**:
1. Deploy da aplicação com flags desabilitadas
2. Executar migrations no Supabase:
   - `001_create_usuarios_admin.sql`
   - `002_fix_storage_rls.sql`
3. Popular tabela `usuarios_admin` com admin existente
4. Validar que site está acessível

**Tempo**: 5-10 minutos

---

### Fase 2: Testes Manuais em Produção

**Ações**:
1. Testar login admin (`/login/admin`)
2. Testar criação de evento com upload de imagem
3. Testar formulário de contato
4. Verificar logs no Vercel/Supabase

**Validação**:
- [ ] Login admin funciona
- [ ] Upload de imagem funciona
- [ ] Formulário de contato funciona
- [ ] Nenhum erro crítico nos logs

**Tempo**: 10 minutos

---

### Fase 3: Ativar Middleware (CRÍTICO)

```env
# Mudar no Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_USE_MIDDLEWARE_AUTH=true  # ← ATIVAR
```

**Ações**:
1. Atualizar variável de ambiente no Vercel
2. Fazer redeploy (ou aguardar revalidação automática)
3. **MONITORAR LOGS POR 5 MINUTOS**
4. Testar manualmente:
   - [ ] `/admin/dashboard` sem login → redireciona para `/login/admin`
   - [ ] Login admin → funciona
   - [ ] Usuário não-admin → não consegue acessar admin

**Critério de sucesso**:
- Taxa de erros < 1%
- Nenhum admin legítimo bloqueado
- Redirecionamentos funcionando

**Se > 5% de falhas → ROLLBACK IMEDIATO**:
```env
NEXT_PUBLIC_USE_MIDDLEWARE_AUTH=false
```

**Tempo**: 15 minutos + 5 minutos de monitoramento

---

### Fase 4: Monitoramento Contínuo (48h)

**Ações**:
1. Monitorar logs por 48 horas
2. Verificar métricas:
   - Tentativas de acesso não autorizado bloqueadas
   - Uploads de imagem (apenas admins)
   - Erros 5xx
3. Coletar feedback dos admins

**Métricas de sucesso**:
- Zero falsos positivos (admins bloqueados incorretamente)
- Zero bypasses de segurança
- Logs limpos (sem dados sensíveis expostos)

---

## 🔄 Como Fazer Rollback

### Rollback Rápido (Sem Redeploy)

**Cenário**: Middleware está causando problemas em produção

**Passos**:
1. Acessar Vercel Dashboard
2. Settings > Environment Variables
3. Mudar `NEXT_PUBLIC_USE_MIDDLEWARE_AUTH` para `false`
4. Clicar em "Save" (redeploy automático)
5. Aguardar 30-60 segundos
6. Validar que site voltou ao normal

**Tempo de rollback**: ~2 minutos

---

### Rollback Completo (Com Código)

**Cenário**: Precisa reverter mudanças de código também

**Passos**:
1. Desabilitar feature flags no Vercel:
   ```env
   NEXT_PUBLIC_USE_MIDDLEWARE_AUTH=false
   NEXT_PUBLIC_USE_RATE_LIMITING=false
   ```

2. Reverter commit Git:
   ```bash
   git revert HEAD
   git push origin dev
   ```

3. Executar rollback das migrations (se necessário):
   ```sql
   -- Remover tabela usuarios_admin (CUIDADO!)
   DROP TABLE IF EXISTS usuarios_admin CASCADE;

   -- Restaurar policies antigas do Storage
   -- (Ver comentário de rollback em 002_fix_storage_rls.sql)
   ```

**Tempo de rollback**: ~5 minutos

---

## 📊 Checklist de Validação Pré-Deploy

Antes de fazer deploy em produção, verificar:

- [ ] Feature flags configuradas no `.env.local`
- [ ] Migrations testadas em ambiente de staging
- [ ] Tabela `usuarios_admin` populada com pelo menos 1 admin
- [ ] Plano de rollback revisado e entendido
- [ ] Logs monitorados e prontos (Vercel, Supabase)
- [ ] Horário de deploy: fora de pico (madrugada/fim de semana)
- [ ] Pessoa de plantão disponível para monitorar

---

## 🆘 Troubleshooting

### Problema: Admin não consegue fazer login

**Diagnóstico**:
1. Verificar se usuário está na tabela `usuarios_admin`:
   ```sql
   SELECT * FROM usuarios_admin WHERE user_id = 'uuid-do-usuario';
   ```

2. Verificar se `ativo = true`

3. Verificar se `role = 'admin'` no user_metadata

**Solução**:
- Se não está na tabela → inserir manualmente
- Se `ativo = false` → atualizar para `true`
- Se role incorreta → atualizar via Supabase Auth

### Problema: Rate limiting bloqueando usuários legítimos

**Diagnóstico**:
- Verificar logs: `logger.warn('Rate limit excedido', { ip, ... })`
- Confirmar se IP é legítimo

**Solução temporária**:
```env
NEXT_PUBLIC_USE_RATE_LIMITING=false
```

**Solução permanente**:
- Aumentar limite de 3 para 5 requests/hora
- Implementar whitelist de IPs confiáveis

### Problema: Middleware está causando loops de redirect

**Diagnóstico**:
- Verificar logs do middleware
- Checar se rota `/login/admin` está sendo protegida (não deveria)

**Solução imediata**:
```env
NEXT_PUBLIC_USE_MIDDLEWARE_AUTH=false
```

**Solução permanente**:
- Corrigir matcher no `middleware.ts` para excluir `/login/*`

---

## 📚 Referências

- **Código**: `lib/constants/features.ts`
- **Middleware**: `middleware.ts`
- **API Contato**: `app/api/contato/route.ts`
- **Plano Geral**: `C:\Users\vmarques\.claude\plans\stateful-dreaming-spindle.md`

---

## 🔒 Segurança

**IMPORTANTE**:
- ❌ NUNCA desabilitar `USE_MIDDLEWARE_AUTH` em produção por tempo prolongado
- ❌ NUNCA commitar `.env.local` no Git
- ✅ SEMPRE testar mudanças em staging primeiro
- ✅ SEMPRE ter plano de rollback antes de deploy
- ✅ SEMPRE monitorar logs após ativar feature critical

---

**Última atualização**: Janeiro 2025
