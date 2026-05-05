# Development Guide

Day-to-day workflow, useful commands, and common issues for working on
this codebase.

For project overview and stack, see [`README.md`](../README.md).
For security model and policies, see [`SECURITY.md`](./SECURITY.md).

## Prerequisites

- Node.js 20+ and npm
- A Supabase project configured via `.env.local` (see
  [`.env.local.example`](../.env.local.example))
- Git with `core.autocrlf=false` (recommended on Windows; see
  [Troubleshooting](#troubleshooting))

## Useful commands

### One-time setup

```bash
npm install              # install dependencies
cp .env.local.example .env.local   # then edit with your credentials
```

### Daily development

```bash
npm run dev              # start the dev server on http://localhost:3000
npm run lint             # run ESLint
npm run lint:fix         # auto-fix ESLint issues
npm run format           # apply Prettier to all files
npm run format:check     # verify Prettier compliance (CI uses this)
npx tsc --noEmit         # type-check without emitting files
npm run build            # production build (catches issues `dev` hides)
npm run start            # serve the production build locally
```

### Smoke test

A quick health check to run after pulling significant changes or before
opening a PR with non-trivial work:

```bash
npm install
npm run format:check
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Then manually verify in the browser:

- Home (`/`) loads without console errors
- `/admin/dashboard` redirects to `/login/admin` (middleware is alive)
- Admin login succeeds and the panel loads
- Contact form submits and the email arrives at `CONTACT_EMAIL`
- Worshiper sign-up and login succeed

## Git workflow

All work goes through pull requests targeting `develop`. `main` is updated
only via release PRs from `develop`.

### Branch naming

Pattern: `<type>/<short-kebab-description>`

| Prefix      | Used for                         | Example                      |
| ----------- | -------------------------------- | ---------------------------- |
| `feat/`     | new feature                      | `feat/donations-system`      |
| `fix/`      | bug fix                          | `fix/empty-singleton-tables` |
| `refactor/` | refactor without behavior change | `refactor/admin-pages-split` |
| `chore/`    | tooling, config, dependencies    | `chore/upgrade-next`         |
| `docs/`     | documentation only               | `docs/development-guide`     |

### Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/)
with an optional scope:

```
<type>(<optional scope>): <imperative description in lowercase>
```

Examples from this project's history:

- `chore(tooling): setup CI, Prettier, husky and lint-staged`
- `fix(footer): handle empty informacoes_igreja table`
- `docs(security): align feature flags section with runtime`
- `refactor(hooks): drop duplicate CRUD and unused modal hooks`

The scope is the affected module (`tooling`, `footer`, `security`,
`hooks`) rather than the dependency. Use a scope when it sharpens the
message; omit it when the change spans multiple modules.

### Standard PR flow

```bash
# 1. Start from an up-to-date develop
git checkout develop
git pull

# 2. Create a feature/fix branch
git checkout -b <type>/<short-name>

# 3. Make changes and commit (Conventional Commits)
git add -A
git commit -m "<type>: <description>"

# 4. Push the branch
git push -u origin <type>/<short-name>

# 5. Open a PR on GitHub with base=develop
#    (the push output prints a direct link)

# 6. Wait for the CI to turn green

# 7. Merge via the GitHub UI ("Squash and merge" preferred)

# 8. Clean up locally
git checkout develop
git pull
git branch -d <type>/<short-name>
```

### Merge strategy

Prefer **Squash and merge** for feature/fix branches:

- Keeps the `develop` history linear and Conventional-Commits-friendly
- Reverting a whole change is a single `git revert <sha>`
- The PR diff retains the per-file detail; nothing is lost

Use a regular merge commit only when preserving multiple
logically-distinct commits inside a single PR matters (rare).

## Troubleshooting

### Prettier flags many files on Windows (CRLF vs LF)

The repo enforces LF endings via [`.gitattributes`](../.gitattributes).
If `npm run format:check` flags dozens of files you didn't touch, your
Git client converted endings to CRLF on checkout.

```bash
git config core.autocrlf false
git rm --cached -r .
git reset --hard
```

### `npm run build` logs `PGRST125`

Usually means the Supabase URL or anon key in `.env.local` is wrong, or
the table referenced does not exist in the project the URL points to.
Double-check `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### `npm run build` logs `PGRST116` (`Cannot coerce the result to a single JSON object`)

A query is using `.single()` against a table that legitimately has
0 rows (typically `informacoes_igreja` before the admin saves the
initial config). Either populate the row, or update the call site to
use `.maybeSingle()` and handle `null`.

### CI fails on a check that passed locally

GitHub Actions run on Linux, which is case-sensitive and uses LF. The
two most common causes:

- Line endings — see the Prettier troubleshooting above
- Case-sensitive imports — verify the exact casing of every file path

### Husky pre-commit hook didn't run

Husky is installed via the `prepare` script. If hooks aren't running:

```bash
npm install               # re-runs `husky` install
git config core.hooksPath .husky
```

## Database setup for a fresh environment

For a brand-new Supabase project (e.g. a new dev environment):

1. Open the Supabase dashboard, **SQL Editor**
2. Run [`supabase/schema.sql`](../supabase/schema.sql) end-to-end
3. Apply migrations from [`supabase/migrations/`](../supabase/migrations)
   in order
4. Create an admin user (see [`SECURITY.md`](./SECURITY.md) for details
   on `usuarios_admin` and the `role` metadata)
5. Sign in to `/admin/configuracoes` and save the church information
   (this populates `informacoes_igreja`, which several public pages read)

## Related documentation

- [`README.md`](../README.md) — project overview, stack, deploy
- [`docs/SECURITY.md`](./SECURITY.md) — security model and policies
- [`supabase/migrations/README.md`](../supabase/migrations/README.md)
  — database migrations
