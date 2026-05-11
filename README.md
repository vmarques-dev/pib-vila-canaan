# PIB Vila Canaan - Official Website

Official website of the Baptist Church in Vila Canaan, built with modern web-development best practices.

## 🚀 Tech Stack

- **Next.js 16** — React framework with App Router and Server Components
- **TypeScript** — static typing for safer code
- **Tailwind CSS** — responsive utility-first styling
- **shadcn/ui** — accessible, customizable UI components
- **Framer Motion** — fluid, performant animations
- **Supabase** — backend, database, auth, and storage
- **Resend** — transactional email delivery
- **React Hook Form + Zod** — enterprise-grade form validation
- **Lucide React** — modern icon set
- **date-fns** — date manipulation
- **Sonner** — toast notifications

## 📁 Project Structure

```
pib-vila-canaan/
├── app/
│   ├── (public)/                 # Public-facing pages
│   │   ├── page.tsx              # Home page
│   │   ├── sobre/                # About the church and pastoral team
│   │   ├── estudos/              # Bible studies
│   │   ├── eventos/              # Event calendar
│   │   ├── galeria/              # Photo gallery
│   │   ├── contato/              # Contact form
│   │   ├── login/                # Login (admin and worshiper)
│   │   └── cadastro/             # Worshiper sign-up
│   ├── (adorador)/               # Restricted area — Worshiper Channel
│   │   └── adorador/
│   │       ├── dashboard/        # Member dashboard
│   │       ├── mural/            # Announcement board
│   │       ├── oracao/           # Prayer requests
│   │       └── perfil/           # Worshiper profile
│   ├── admin/                    # Admin panel (protected)
│   │   ├── dashboard/            # Overview and statistics
│   │   ├── eventos/              # Events CRUD
│   │   ├── estudos/              # Bible studies CRUD
│   │   ├── galeria/              # Photo gallery CRUD
│   │   ├── equipe/               # Pastoral team CRUD
│   │   ├── avisos/               # Announcement board CRUD
│   │   ├── oracao/               # Prayer requests management
│   │   ├── versiculo-destaque/   # Featured verse
│   │   └── configuracoes/        # Church settings
│   ├── api/
│   │   └── contato/              # Email-sending API
│   ├── layout.tsx                # Root layout with metadata
│   ├── sitemap.ts                # Auto-generated sitemap
│   └── robots.ts                 # Auto-generated robots.txt
├── components/
│   ├── layout/
│   │   ├── navbar.tsx            # Responsive sticky navigation
│   │   ├── footer.tsx            # Footer
│   │   └── scroll-to-top.tsx     # Scroll reset on navigation
│   ├── admin/                    # Admin-panel components
│   ├── adorador/                 # Worshiper-channel components
│   ├── home/                     # Home-page sections
│   ├── sobre/                    # About-page components
│   ├── estudos/                  # Studies components
│   ├── eventos/                  # Events components
│   ├── galeria/                  # Gallery components
│   ├── contato/                  # Contact form
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── constants/                # Centralized constants
│   │   ├── config.ts             # General config (site, storage, validation, rate limit)
│   │   └── navigation.ts         # Admin menu items
│   ├── services/
│   │   └── storage.service.ts    # Image upload / delete / optimization
│   ├── supabase/
│   │   ├── browser.ts            # Client for Client Components
│   │   ├── client.ts             # Default client (Server Components)
│   │   └── middleware.ts         # Client for SSR middleware
│   ├── types/
│   │   ├── database.ts           # TypeScript interfaces for the DB
│   │   └── index.ts              # Re-exports for the @/types alias
│   ├── validations/              # Zod schemas per domain
│   ├── hooks/
│   │   └── useAuth.tsx           # AuthProvider and useAuth hook
│   ├── providers/
│   │   └── providers.tsx         # Composition of global providers
│   └── logger.ts                 # Safe logger (no sensitive data)
├── hooks/
│   └── useAdminCRUD.ts           # Generic CRUD hook for the admin panel
├── middleware.ts                 # Server-side route protection
├── supabase/
│   ├── schema.sql                # Full database schema
│   └── migrations/               # Incremental migrations
├── docs/
│   └── SECURITY.md               # Security documentation
└── public/                       # Static assets
```

## 🎨 Design

- **Color Palette**: blue (#1d4ed8), purple (#7c3aed), white
- **Full-screen hero** with gradient and call-to-actions
- **Sticky navbar** with animated mobile menu
- **Mobile-first** — fully responsive design
- **Animations** — smooth transitions powered by Framer Motion
- **Accessibility** — WCAG 2.1 AA compliant
- **Performance** — Next.js Image optimization, lazy loading

## 🔧 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vmarques-dev/pib-vila-canaan.git
cd pib-vila-canaan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and set your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend (email delivery)
RESEND_API_KEY=re_your-key

# Email that receives contact-form submissions
CONTACT_EMAIL=contact@yourchurch.com

# Public site URL (production)
NEXT_PUBLIC_SITE_URL=https://pibvilacanaan.com.br

# Feature flags (recommended: keep both true in production).
# Server-only — no NEXT_PUBLIC_ prefix, so the values stay off the client bundle.
USE_MIDDLEWARE_AUTH=true
USE_RATE_LIMITING=true
```

#### How to obtain the credentials

**Supabase:**

1. Create an account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the **Project URL** and the **anon/public key**

**Resend:**

1. Create an account at [resend.com](https://resend.com)
2. Go to API Keys → Create API Key
3. Copy the generated key (starts with `re_`)

### 4. Set up the database

In the Supabase dashboard, open the **SQL Editor** and run the full file:

```
supabase/schema.sql
```

> For environments already in production, apply the incremental migrations
> in `supabase/migrations/` following the order described in that
> directory's README.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
npm run dev      # Start the dev server (port 3000)
npm run build    # Build an optimized production bundle
npm run start    # Start the production server
npm run lint     # Run ESLint
```

## 🗃️ Database

The full schema lives in [`supabase/schema.sql`](supabase/schema.sql). A summary of the main tables is below:

```sql
-- Admin access control
CREATE TABLE usuarios_admin (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Church members (Worshiper Channel)
CREATE TABLE adoradores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefone    TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events and schedules
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

-- Event registrations
CREATE TABLE inscricoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  adorador_id UUID REFERENCES adoradores(id),
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefone    TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bible studies
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

-- Pastoral team
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

-- Photo gallery
CREATE TABLE galeria (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL,
  categoria   TEXT NOT NULL, -- 'Cultos' | 'Jovens' | 'Eventos Especiais' | 'Infantil'
  url         TEXT NOT NULL,
  descricao   TEXT,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcement board (Worshiper Channel)
CREATE TABLE avisos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL,
  conteudo    TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer requests
CREATE TABLE pedidos_oracao (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adorador_id UUID NOT NULL REFERENCES adoradores(id) ON DELETE CASCADE,
  descricao   TEXT NOT NULL,
  respondido  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Featured verse
CREATE TABLE versiculo_destaque (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livro       TEXT NOT NULL,
  referencia  TEXT NOT NULL,
  texto       TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Church information
CREATE TABLE informacoes_igreja (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL DEFAULT 'PIB Vila Canaan',
  endereco      TEXT NOT NULL,
  telefone      TEXT NOT NULL,
  whatsapp      TEXT,
  email         TEXT NOT NULL,
  horarios      TEXT,
  facebook_url  TEXT,
  instagram_url TEXT,
  youtube_url   TEXT,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deploy

### Vercel (Recommended)

1. Push the code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Configure every environment variable in the Vercel dashboard:

| Variable                        | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                     |
| `RESEND_API_KEY`                | Resend API key                               |
| `CONTACT_EMAIL`                 | Recipient email for contact-form submissions |
| `NEXT_PUBLIC_SITE_URL`          | Public site URL (production)                 |
| `USE_MIDDLEWARE_AUTH`           | `true` (recommended in production)           |
| `USE_RATE_LIMITING`             | `true` (recommended in production)           |

4. Automatic deploy on every push to `main`!

## ✅ Implemented Features

**Public site**

- ✅ Modern, responsive landing page
- ✅ About page with church history and pastoral team
- ✅ Bible-study system with category filters
- ✅ Event calendar with on-site registration
- ✅ Photo gallery with lightbox and category filters
- ✅ Contact form with email delivery (Resend)
- ✅ Dynamic featured verse
- ✅ Google Maps integration
- ✅ Dynamic social-media links

**Worshiper Channel (member area)**

- ✅ Member sign-up and login
- ✅ Dashboard with upcoming events and recent announcements
- ✅ Internal church announcement board
- ✅ Prayer requests
- ✅ Member profile

**Admin Panel**

- ✅ Dashboard with statistics and operational summaries
- ✅ Full events CRUD (with image upload)
- ✅ Event-registration management
- ✅ Bible-studies CRUD
- ✅ Photo-gallery CRUD
- ✅ Pastoral-team CRUD
- ✅ Announcement-board management
- ✅ Prayer-request management
- ✅ Featured-verse editor
- ✅ Church-wide settings

**Infrastructure**

- ✅ SEO optimized (Open Graph, Twitter Cards, Sitemap, Robots.txt)
- ✅ Performance optimized (Next.js Image, lazy loading)
- ✅ Form validation with Zod
- ✅ Input masks (phone)
- ✅ Feature flags for fast rollback

## 🔐 Security

- ✅ **Server-side middleware** protects admin and worshiper routes (cannot be bypassed via DevTools)
- ✅ **Row Level Security (RLS)** on Supabase with table-specific policies
- ✅ **Zod validation** on every API and form, with automatic sanitization
- ✅ **XSS protection** via HTML escaping on all contact-form input
- ✅ **Rate limiting** on the contact API (3 requests/hour per IP)
- ✅ **Safe logger** without exposing sensitive data in production
- ✅ **`usuarios_admin` table** with active/inactive access control
- ✅ **Storage RLS** — only active admins can upload images
- ✅ TypeScript strict mode
- ✅ Environment variables for all sensitive data
- ⚠️ **IMPORTANT**: never commit `.env.local`

> For full details, see [`docs/SECURITY.md`](docs/SECURITY.md).

## ♿ Accessibility

- ✅ Semantic HTML
- ✅ Alt text on every image
- ✅ ARIA labels on interactive components
- ✅ Keyboard navigation
- ✅ Adequate color contrast (WCAG AA)
- ✅ Visible focus states

## 📊 SEO

- ✅ Full per-page metadata
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Cards
- ✅ Auto-generated `sitemap.xml`
- ✅ `robots.txt` configured
- ✅ Semantic URLs
- 🔄 Structured data / Schema.org (next step)

## 🎯 Next Steps

- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Set up a CI/CD pipeline (GitHub Actions)
- [ ] Integrate error tracking (Sentry)
- [ ] Add Structured Data (Schema.org)
- [ ] Implement a donations system
- [ ] Integrate YouTube for live streams
- [ ] Add PWA support
- [ ] Analytics dashboard

## 📄 License

This project was developed exclusively for PIB Vila Canaan.

---

**Built with ❤️ for PIB Vila Canaan**
