# PIB Vila Canaan - Site Oficial

Site oficial da Igreja Batista em Vila Canaan, desenvolvido com as melhores práticas de desenvolvimento web moderno.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router e Server Components
- **TypeScript** - Tipagem estática para código mais seguro
- **Tailwind CSS** - Estilização utility-first responsiva
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **Framer Motion** - Animações fluidas e performáticas
- **Supabase** - Backend, banco de dados, autenticação e storage
- **Resend** - Envio de emails transacionais
- **React Hook Form + Zod** - Validação de formulários enterprise
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas
- **Sonner** - Notificações toast

## 📁 Estrutura do Projeto

```
pib-vila-canaan/
├── app/
│   ├── (public)/                 # Páginas públicas do site
│   │   ├── page.tsx              # Página inicial
│   │   ├── sobre/                # Sobre a igreja e equipe pastoral
│   │   ├── estudos/              # Estudos bíblicos
│   │   ├── eventos/              # Calendário de eventos
│   │   ├── galeria/              # Galeria de fotos
│   │   ├── contato/              # Formulário de contato
│   │   ├── login/                # Login (admin e adorador)
│   │   └── cadastro/             # Cadastro de adoradores
│   ├── (adorador)/               # Área restrita — Canal do Adorador
│   │   └── adorador/
│   │       ├── dashboard/        # Painel do membro
│   │       ├── mural/            # Mural de avisos
│   │       ├── oracao/           # Pedidos de oração
│   │       └── perfil/           # Perfil do adorador
│   ├── admin/                    # Painel administrativo (protegido)
│   │   ├── dashboard/            # Visão geral e estatísticas
│   │   ├── eventos/              # CRUD de eventos
│   │   ├── estudos/              # CRUD de estudos bíblicos
│   │   ├── galeria/              # CRUD de galeria de fotos
│   │   ├── equipe/               # CRUD da equipe pastoral
│   │   ├── avisos/               # CRUD do mural de avisos
│   │   ├── oracao/               # Gestão de pedidos de oração
│   │   ├── versiculo-destaque/   # Versículo em destaque
│   │   └── configuracoes/        # Configurações da igreja
│   ├── api/
│   │   └── contato/              # API de envio de emails
│   ├── layout.tsx                # Layout raiz com metadata
│   ├── sitemap.ts                # Sitemap automático
│   └── robots.ts                 # Robots.txt automático
├── components/
│   ├── layout/
│   │   ├── navbar.tsx            # Navegação sticky responsiva
│   │   ├── footer.tsx            # Rodapé
│   │   └── scroll-to-top.tsx     # Reset de scroll na navegação
│   ├── admin/                    # Componentes do painel admin
│   ├── adorador/                 # Componentes do canal do adorador
│   ├── home/                     # Seções da página inicial
│   ├── sobre/                    # Componentes da página sobre
│   ├── estudos/                  # Componentes de estudos
│   ├── eventos/                  # Componentes de eventos
│   ├── galeria/                  # Componentes da galeria
│   ├── contato/                  # Formulário de contato
│   └── ui/                       # Componentes shadcn/ui
├── lib/
│   ├── constants/                # Constantes centralizadas
│   │   ├── config.ts             # Configurações gerais (site, storage, validação, rate limit)
│   │   └── navigation.ts         # Itens do menu administrativo
│   ├── services/
│   │   └── storage.service.ts    # Upload/delete/otimização de imagens
│   ├── supabase/
│   │   ├── browser.ts            # Cliente para Client Components
│   │   ├── client.ts             # Cliente padrão (Server Components)
│   │   └── middleware.ts         # Cliente para middleware SSR
│   ├── types/
│   │   ├── database.ts           # Interfaces TypeScript do banco
│   │   └── index.ts              # Re-exports do alias @/types
│   ├── validations/              # Schemas Zod por domínio
│   ├── hooks/
│   │   └── useAuth.tsx           # AuthProvider e hook useAuth
│   ├── providers/
│   │   └── providers.tsx         # Composição de providers globais
│   └── logger.ts                 # Logger seguro sem exposição de dados
├── hooks/
│   └── useAdminCRUD.ts           # Hook genérico de CRUD para o admin
├── middleware.ts                 # Proteção server-side de rotas
├── supabase/
│   ├── schema.sql                # Schema completo do banco
│   └── migrations/               # Migrations incrementais
├── docs/
│   └── SECURITY.md               # Documentação de segurança
└── public/                       # Arquivos estáticos
```

## 🎨 Design

- **Paleta de Cores**: Azul (#1d4ed8), Roxo (#7c3aed), Branco
- **Hero fullscreen** com gradiente e call-to-actions
- **Navbar sticky** com menu mobile animado
- **Mobile-first** design 100% responsivo
- **Animações** suaves com Framer Motion
- **Acessibilidade** - WCAG 2.1 AA compliant
- **Performance** - Next.js Image optimization, lazy loading

## 🔧 Como Executar

### 1. Clonar o repositório

```bash
git clone https://github.com/vmarques-dev/pib-vila-canaan.git
cd pib-vila-canaan
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Resend (envio de emails)
RESEND_API_KEY=re_sua-chave-aqui

# Email que receberá as mensagens de contato
CONTACT_EMAIL=contato@suaigreja.com.br

# URL pública do site em produção
NEXT_PUBLIC_SITE_URL=https://pibvilacanaan.com.br

# Feature flags (recomendado manter true em produção)
NEXT_PUBLIC_USE_MIDDLEWARE_AUTH=true
NEXT_PUBLIC_USE_RATE_LIMITING=true
```

#### Como obter as credenciais:

**Supabase:**
1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings → API
4. Copie a **Project URL** e a **anon/public key**

**Resend:**
1. Crie uma conta em [resend.com](https://resend.com)
2. Vá em API Keys → Create API Key
3. Copie a chave gerada (começa com `re_`)

### 4. Configurar o banco de dados

No painel do Supabase, abra o **SQL Editor** e execute o arquivo completo:

```
supabase/schema.sql
```

> Para ambientes já em produção, utilize as migrations incrementais em `supabase/migrations/` na ordem dos prefixos numéricos.

### 5. Executar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento (porta 3000)
npm run build    # Cria build otimizado de produção
npm run start    # Inicia servidor de produção
npm run lint     # Verifica problemas de código com ESLint
```

## 🗃️ Banco de Dados

O schema completo está em [`supabase/schema.sql`](supabase/schema.sql). Abaixo um resumo das tabelas principais:

```sql
-- Controle de acesso de administradores
CREATE TABLE usuarios_admin (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membros da igreja (Canal do Adorador)
CREATE TABLE adoradores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefone    TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eventos e programações
CREATE TABLE eventos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  descricao       TEXT NOT NULL,
  data_inicio     DATE NOT NULL,
  data_fim        DATE,
  horario_inicio  TIME,
  horario_fim     TIME,
  local           TEXT NOT NULL,
  imagem_url      TEXT,
  concluido       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inscrições em eventos
CREATE TABLE inscricoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  adorador_id UUID REFERENCES adoradores(id),
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefone    TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estudos bíblicos
CREATE TABLE estudos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          TEXT NOT NULL,
  livro           TEXT,
  referencia      TEXT,
  texto_versiculo TEXT,
  conteudo        TEXT NOT NULL,
  categoria       TEXT NOT NULL,
  data_estudo     DATE NOT NULL,
  arquivado       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipe pastoral
CREATE TABLE equipe_pastoral (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  cargo       TEXT NOT NULL,
  descricao   TEXT NOT NULL,
  foto_url    TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Galeria de fotos
CREATE TABLE galeria (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL,
  categoria   TEXT NOT NULL, -- 'Cultos' | 'Jovens' | 'Eventos Especiais' | 'Infantil'
  url         TEXT NOT NULL,
  descricao   TEXT,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mural de avisos (Canal do Adorador)
CREATE TABLE avisos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL,
  conteudo    TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos de oração
CREATE TABLE pedidos_oracao (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adorador_id UUID NOT NULL REFERENCES adoradores(id) ON DELETE CASCADE,
  descricao   TEXT NOT NULL,
  respondido  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Versículo em destaque
CREATE TABLE versiculo_destaque (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livro       TEXT NOT NULL,
  referencia  TEXT NOT NULL,
  texto       TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Informações da igreja
CREATE TABLE informacoes_igreja (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL DEFAULT 'PIB Vila Canaan',
  endereco      TEXT NOT NULL,
  telefone      TEXT NOT NULL,
  whatsapp      TEXT,
  email         TEXT NOT NULL,
  horarios      TEXT,
  missao        TEXT,
  visao         TEXT,
  facebook_url  TEXT,
  instagram_url TEXT,
  youtube_url   TEXT,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure todas as variáveis de ambiente no painel da Vercel:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon/public do Supabase |
| `RESEND_API_KEY` | Chave da API do Resend |
| `CONTACT_EMAIL` | Email de destino do formulário de contato |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site em produção |
| `NEXT_PUBLIC_USE_MIDDLEWARE_AUTH` | `true` (recomendado em produção) |
| `NEXT_PUBLIC_USE_RATE_LIMITING` | `true` (recomendado em produção) |

4. Deploy automático a cada push em `main`!

## ✅ Funcionalidades Implementadas

**Site público**
- ✅ Landing page moderna e responsiva
- ✅ Página sobre com história e equipe pastoral
- ✅ Sistema de estudos bíblicos com filtros por categoria
- ✅ Calendário de eventos com inscrições pelo site
- ✅ Galeria de fotos com lightbox e filtros por categoria
- ✅ Formulário de contato com envio de email (Resend)
- ✅ Versículo em destaque dinâmico
- ✅ Integração com Google Maps
- ✅ Redes sociais dinâmicas

**Canal do Adorador (área de membros)**
- ✅ Cadastro e login de membros
- ✅ Dashboard com próximos eventos e avisos recentes
- ✅ Mural de avisos internos da igreja
- ✅ Pedidos de oração
- ✅ Perfil do membro

**Painel Administrativo**
- ✅ Dashboard com estatísticas e resumos operacionais
- ✅ CRUD completo de eventos (com upload de imagens)
- ✅ Gestão de inscrições em eventos
- ✅ CRUD de estudos bíblicos
- ✅ CRUD da galeria de fotos
- ✅ CRUD da equipe pastoral
- ✅ Gestão do mural de avisos
- ✅ Gestão de pedidos de oração
- ✅ Versículo em destaque
- ✅ Configurações gerais da igreja

**Infraestrutura**
- ✅ SEO otimizado (Open Graph, Twitter Cards, Sitemap, Robots.txt)
- ✅ Performance otimizada (Next.js Image, lazy loading)
- ✅ Validação de formulários com Zod
- ✅ Máscaras de input (telefone)
- ✅ Feature flags para rollback rápido

## 🔐 Segurança

- ✅ **Middleware server-side** protege rotas admin e adorador (não bypassável via DevTools)
- ✅ **Row Level Security (RLS)** no Supabase com policies restritivas por tabela
- ✅ **Validação Zod** em todas as APIs e formulários, com sanitização automática
- ✅ **Proteção XSS** com escape HTML em todas as entradas do formulário de contato
- ✅ **Rate limiting** na API de contato (3 requisições/hora por IP)
- ✅ **Logger seguro** sem exposição de dados sensíveis em produção
- ✅ **Tabela `usuarios_admin`** com controle de acesso ativo/inativo
- ✅ **Storage RLS** — apenas admins ativos podem fazer upload de imagens
- ✅ TypeScript strict mode
- ✅ Variáveis de ambiente para todos os dados sensíveis
- ⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env.local`

> Para detalhes completos, consulte [`docs/SECURITY.md`](docs/SECURITY.md).

## ♿ Acessibilidade

- ✅ HTML semântico
- ✅ Alt text em todas as imagens
- ✅ ARIA labels em componentes interativos
- ✅ Navegação por teclado
- ✅ Contraste de cores adequado (WCAG AA)
- ✅ Focus states visíveis

## 📊 SEO

- ✅ Metadata completa por página
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ Sitemap.xml automático
- ✅ Robots.txt configurado
- ✅ URLs semânticas
- 🔄 Structured data / Schema.org (próximo passo)

## 🎯 Próximos Passos

- [ ] Adicionar testes unitários (Jest + React Testing Library)
- [ ] Implementar testes E2E (Playwright)
- [ ] Configurar pipeline de CI/CD (GitHub Actions)
- [ ] Integrar error tracking (Sentry)
- [ ] Adicionar Structured Data (Schema.org)
- [ ] Implementar sistema de doações
- [ ] Integrar YouTube para transmissões ao vivo
- [ ] Adicionar PWA (Progressive Web App)
- [ ] Dashboard com analytics

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para a PIB Vila Canaan.

---

**Desenvolvido com ❤️ para PIB Vila Canaan**
