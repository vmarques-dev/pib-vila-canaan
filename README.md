# PIB Vila Canaan - Site Oficial

Site moderno da Igreja Batista em Vila Canaan, desenvolvido com as melhores práticas de desenvolvimento web.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router e Server Components
- **TypeScript** - Tipagem estática para código mais seguro
- **Tailwind CSS** - Estilização utility-first responsiva
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **Framer Motion** - Animações fluidas e performáticas
- **Supabase** - Backend, banco de dados e autenticação
- **Resend** - Envio de emails transacionais
- **React Hook Form + Zod** - Validação de formulários enterprise
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

## 📁 Estrutura do Projeto

```
igreja-moderna/
├── app/                      # App Router (Next.js 15)
│   ├── page.tsx              # Página inicial
│   ├── sobre/                # Sobre a igreja + equipe pastoral
│   ├── estudos/              # Estudos bíblicos
│   ├── eventos/              # Calendário de eventos
│   ├── galeria/              # Galeria de fotos
│   ├── contato/              # Formulário de contato
│   ├── admin/                # Painel administrativo
│   │   ├── eventos/          # CRUD de eventos
│   │   ├── estudos/          # CRUD de estudos
│   │   └── galeria/          # CRUD de fotos
│   ├── api/
│   │   └── contato/          # API de envio de emails
│   ├── layout.tsx            # Layout raiz com metadata
│   ├── sitemap.ts            # Sitemap automático
│   └── robots.ts             # Robots.txt automático
├── components/
│   ├── layout/
│   │   ├── navbar.tsx        # Navegação sticky responsiva
│   │   └── footer.tsx        # Rodapé com mapa
│   ├── admin/                # Componentes do painel admin
│   ├── auth/                 # Componentes de autenticação
│   ├── home/                 # Componentes da home
│   ├── sobre/                # Componentes da página sobre
│   ├── estudos/              # Componentes de estudos
│   ├── eventos/              # Componentes de eventos
│   ├── galeria/              # Componentes da galeria
│   ├── contato/              # Formulário de contato
│   └── ui/                   # Componentes shadcn/ui
├── lib/
│   ├── constants/            # Constantes centralizadas
│   │   ├── routes.ts         # Rotas da aplicação
│   │   ├── config.ts         # Configurações gerais
│   │   ├── bible-books.ts    # Lista de livros da Bíblia
│   │   ├── features.ts       # Feature flags
│   │   └── index.ts          # Export centralizado
│   ├── services/             # Lógica de negócio
│   │   ├── storage.service.ts # Upload/delete de imagens
│   │   └── index.ts          # Export centralizado
│   ├── supabase/             # Cliente Supabase
│   │   ├── client.ts         # Cliente para browser
│   │   └── middleware.ts     # Cliente para middleware
│   ├── types/                # Tipos TypeScript
│   ├── validations/          # Schemas Zod
│   └── logger.ts             # Logger seguro
├── hooks/                    # React hooks customizados
├── middleware.ts             # Proteção server-side de rotas
├── supabase/                 # Migrations e configs do Supabase
│   └── migrations/           # SQL migrations
├── docs/                     # Documentação adicional
│   ├── FEATURE_FLAGS.md      # Guia de feature flags
│   └── SECURITY.md           # Documentação de segurança
└── public/                   # Arquivos estáticos
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
git clone https://github.com/vmarques03/igreja-moderna.git
cd igreja-moderna
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Resend (Email Service)
RESEND_API_KEY=your_resend_api_key_here

# Contact Form
CONTACT_EMAIL=contato@pibvilacanaan.com.br
```

#### Como obter as credenciais:

**Supabase:**
1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API
4. Copie a URL e a `anon/public` key

**Resend:**
1. Crie uma conta em [resend.com](https://resend.com)
2. Crie uma API Key
3. Copie a chave

### 4. Executar em desenvolvimento

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

### Estrutura das Tabelas (Supabase)

```sql
-- Eventos
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP,
  local TEXT,
  imagem_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Estudos
CREATE TABLE estudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo TEXT,
  data DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Galeria
CREATE TABLE galeria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT NOT NULL,
  categoria TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Equipe Pastoral
CREATE TABLE equipe_pastoral (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  foto_url TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Versículo do Dia
CREATE TABLE versiculo_dia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  versiculo TEXT NOT NULL,
  referencia TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Informações da Igreja
CREATE TABLE informacoes_igreja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático!

### Variáveis de Ambiente (Produção)

Configure as mesmas variáveis do `.env.local` no painel da Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `CONTACT_EMAIL`

## ✅ Funcionalidades Implementadas

- ✅ Landing page moderna e responsiva
- ✅ Página sobre com história e equipe pastoral
- ✅ Sistema de estudos bíblicos
- ✅ Calendário de eventos
- ✅ Galeria de fotos com filtros
- ✅ Formulário de contato com envio de email
- ✅ Painel administrativo completo (CRUD)
- ✅ Versículo do dia dinâmico
- ✅ Integração com Google Maps
- ✅ Redes sociais dinâmicas
- ✅ SEO otimizado (Open Graph, Twitter Cards, Sitemap)
- ✅ Performance otimizada (Image optimization, lazy loading)
- ✅ Validação de formulários com Zod
- ✅ Máscaras de input (telefone)
- ✅ Segurança (XSS protection, sanitização)

## 🔐 Segurança

- ✅ **Middleware server-side** protege rotas admin (não bypassável)
- ✅ **Row Level Security (RLS)** no Supabase com policies restritivas
- ✅ **Validação Zod** em todas as APIs e formulários
- ✅ **Sanitização de dados** (XSS protection com escape HTML)
- ✅ **Rate limiting** na API de contato (3 requests/hora por IP)
- ✅ **Logger seguro** sem exposição de dados sensíveis
- ✅ **Tabela usuarios_admin** com controle de acesso ativo/inativo
- ✅ **Storage RLS** - apenas admins ativos podem fazer upload
- ✅ Variáveis de ambiente para dados sensíveis
- ✅ TypeScript strict mode
- ✅ HTTPS obrigatório em produção
- ⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env.local`!
- ⚠️ **IMPORTANTE**: `.env.local` já está no `.gitignore` - não precisa adicionar manualmente

## ♿ Acessibilidade

- ✅ HTML semântico
- ✅ Alt text em todas as imagens
- ✅ ARIA labels em componentes interativos
- ✅ Navegação por teclado
- ✅ Contraste de cores adequado (WCAG AA)
- ✅ Focus states visíveis

## 📊 SEO

- ✅ Metadata completa
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ Sitemap.xml automático
- ✅ Robots.txt configurado
- ✅ URLs semânticas
- 🔄 Structured data (próximo passo)

## 🎯 Próximos Passos

- [ ] Adicionar testes unitários (Jest + React Testing Library)
- [ ] Implementar testes E2E (Playwright)
- [ ] Adicionar structured data (Schema.org)
- [ ] Implementar sistema de doações
- [ ] Integrar YouTube para transmissões ao vivo
- [ ] Adicionar PWA (Progressive Web App)
- [ ] Implementar sistema de notificações
- [ ] Dashboard com analytics
- [ ] Blog/Devocional

## 📄 Licença

Este projeto foi criado para a PIB Vila Canaan.

---

**Desenvolvido com ❤️ para PIB Vila Canaan**
