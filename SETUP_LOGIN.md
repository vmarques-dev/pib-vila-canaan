# Setup do Sistema de Login Dual

## 📋 Visão Geral

Este projeto implementa um sistema de autenticação simples com dois canais:
- **Canal do Adorador**: Para membros da igreja acessarem a plataforma
- **Canal do Administrador**: Para administradores gerenciarem o sistema

## 🚀 Configuração do Banco de Dados

### Passo 1: Executar a Migration no Supabase

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase/migrations/adoradores.sql`
6. Clique em **Run** para executar

### Passo 2: Criar um Usuário Administrador

Execute o seguinte SQL no **SQL Editor** do Supabase para criar um usuário admin de teste:

```sql
-- Criar usuário admin
-- IMPORTANTE: Altere o email e senha para valores seguros em produção

-- 1. Primeiro, crie o usuário através do painel do Supabase:
--    Authentication > Users > Add User
--    Email: admin@example.com
--    Password: SuaSenhaSegura123
--
-- 2. Depois que o usuário for criado, atualize os metadados:

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';
```

## 📱 Fluxos de Uso

### Fluxo do Adorador (Membro)

1. **Cadastro**
   - Acessa `/cadastro`
   - Preenche:
     - Nome completo
     - Email
     - Telefone (opcional)
     - Senha
     - Confirmar senha
   - Sistema cria conta e envia email de confirmação

2. **Login**
   - Acessa `/login`
   - Clica em "Canal do Adorador"
   - Preenche email e senha
   - Redireciona para `/` (home)

### Fluxo do Administrador

1. Usuário acessa `/login`
2. Clica em "Canal do Administrador"
3. Preenche email e senha
4. Sistema valida se é admin
5. Redireciona para `/admin/dashboard`

### Recuperação de Senha

1. Acessa `/esqueci-senha`
2. Digita email
3. Recebe link de recuperação por email
4. Cria nova senha

## 🔒 Segurança

- **RLS (Row Level Security)**: Habilitado na tabela `adoradores`
- **Policies**:
  - Adoradores só veem/editam próprio perfil
  - Admins podem ver todos os adoradores
  - Usuários podem criar próprio registro ao se cadastrar
- **Proteção de rotas**: AdminGuard verifica autenticação e permissões
- **Senhas**: Mínimo 6 caracteres, gerenciadas pelo Supabase Auth

## 🛠️ Estrutura de Arquivos

```
app/
├── login/
│   ├── page.tsx                 # Escolha de canal
│   ├── adorador/
│   │   └── page.tsx            # Login do membro
│   └── admin/
│       └── page.tsx            # Login do admin
├── cadastro/
│   └── page.tsx                # Cadastro simples
└── esqueci-senha/
    └── page.tsx                # Recuperação de senha

components/
├── auth/
│   └── AdminGuard.tsx          # Proteção de rotas admin
└── layout/
    └── navbar.tsx              # Com Login/Sair

lib/
└── hooks/
    └── useAuth.ts              # Hook de autenticação

supabase/
└── migrations/
    └── adoradores.sql          # Schema da tabela
```

## 📊 Schema da Tabela Adoradores

```sql
adoradores (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🧪 Testando

### Testar Cadastro e Login de Adorador

1. Acesse `/cadastro`
2. Preencha o formulário
3. Confirme email (verificar inbox)
4. Faça login em `/login/adorador`
5. Verifique navbar atualizada com botão "Sair"

### Testar Login de Admin

1. Use o usuário admin criado no Supabase
2. Acesse `/login/admin`
3. Verifique acesso ao dashboard
4. Navbar deve mostrar "Dashboard" + "Sair"

### Testar Proteção de Rotas

1. Tentar acessar `/admin/dashboard` sem estar logado
   - Deve redirecionar para `/login/admin`
2. Logar como adorador e tentar acessar `/admin/dashboard`
   - Deve redirecionar para `/` (home)

## ⚙️ Variáveis de Ambiente

Certifique-se de ter estas variáveis no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 🎯 Funcionalidades Implementadas

- ✅ Login dual (Adorador/Admin)
- ✅ Cadastro de membros
- ✅ Recuperação de senha
- ✅ Proteção de rotas
- ✅ RLS no banco de dados
- ✅ Navbar dinâmica (Login/Sair)
- ✅ Hook useAuth para gerenciar estado
- ✅ Validação de senhas
- ✅ Mensagens de erro amigáveis

## 📝 Próximos Passos

- [ ] Implementar verificação de email obrigatória
- [ ] Adicionar 2FA para admins
- [ ] Criar área do adorador com funcionalidades específicas
- [ ] Implementar auditoria de acessos
- [ ] Adicionar avatar/foto de perfil
- [ ] Sistema de permissões mais granular

## 🆘 Troubleshooting

### Erro: "Adorador não encontrado"
- Verifique se a tabela `adoradores` foi criada
- Verifique se o RLS está habilitado
- Confirme que o cadastro foi concluído com sucesso

### Erro: "Acesso negado" ao tentar acessar admin
- Verifique se o `raw_user_meta_data.role` está como "admin"
- Confirme que o email/senha estão corretos

### Navbar não atualiza após login
- Verifique se o `useAuth` hook está funcionando
- Abra o console e veja se há erros
- Tente fazer refresh da página

### Email de confirmação não chega
- Verifique configurações de email no Supabase
- Configure SMTP ou use serviço de email
- Em desenvolvimento, desative confirmação de email

## 🔄 Diferenças da Versão Anterior

Esta versão foi **simplificada** para remover complexidade desnecessária:

### REMOVIDO:
- ❌ Campos de estado/cidade/unimed
- ❌ Validação dupla de localização
- ❌ Lógica complexa de beneficiário
- ❌ Termos relacionados à Unimed

### MANTIDO:
- ✅ Sistema dual (Adorador/Admin)
- ✅ Autenticação com Supabase
- ✅ Proteção de rotas
- ✅ Cadastro e login simples
