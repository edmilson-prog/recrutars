# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev       # Start dev server on port 8080
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Architecture Overview

RecrutaRS is a React SPA for intelligent recruitment with Gauge-Pro behavioral assessments (inspired by Predictive Index).

### Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router v6, React Query, React Hook Form + Zod
- Framer Motion for animations
- Supabase (Auth, PostgreSQL with RLS, Storage)
- Claude API for AI behavioral analysis

### Project Structure
```
src/
├── pages/              # Route pages
│   ├── admin/          # Admin dashboard (RBAC, plans, flags, reports)
│   ├── empresa/        # Company dashboard (vagas, candidatos, testes, equipes)
│   └── candidato/      # Candidate dashboard (perfil, vagas, candidaturas, testes)
├── components/
│   ├── ui/             # shadcn/ui components (50+ files)
│   ├── disc/           # Behavioral chart components (radar, quadrant, legends)
│   ├── match/          # Match score and comparison components
│   ├── compare/        # Side-by-side candidate comparison
│   ├── landing/        # Landing page sections
│   └── layout/         # DashboardLayout wrapper
├── contexts/           # AuthContext (Supabase Auth)
├── hooks/              # 23 React Query hooks + utility hooks
├── services/           # Service layer (22 Supabase modules)
├── data/               # Reference/config data (18 files — NOT mocks)
├── lib/                # utils.ts, supabase.ts, supabaseConverters.ts, aiAgent/, rbac.ts
└── types/              # database.ts (Supabase schema), gaugePro.ts, disc.ts

sql/
├── migrations/         # DDL schemas PostgreSQL (21 migrations applied)
└── seeds/              # Development seed data
```

### Routing Pattern
- Public: `/`, `/login`, `/cadastro`, `/como-funciona`, `/planos`
- Admin: `/admin/*`
- Company: `/empresa/*` (vagas, candidatos, testes, equipes, mensagens)
- Candidate: `/candidato/*` (perfil profissional, conta, vagas, candidaturas, testes, gauge-pro)

### Key Patterns
- **Auth**: Supabase Auth via AuthContext. `useAuth()` provides `user`, `isAuthenticated`, `loading`, `login(email, password)`, `logout()`, `signUp(params)`, `resetPassword(email)`, `currentCompany`, `currentCandidate`
- **Layouts**: Use `DashboardLayout` wrapper for authenticated pages with `userType` prop
- **Styling**: Use `cn()` from `@/lib/utils` for Tailwind class merging
- **Imports**: Use `@/` path alias (maps to `src/`)

### Data Models
- **Supabase types** (src/types/database.ts): Database schema types (64+ tables)
- **Converters** (src/lib/supabaseConverters.ts): snake_case (DB) <-> camelCase (TS)
- **Reference data** (src/data/): 18 config/reference files (archetypes, scenarios, words, cities, templates)
- Three user types: `'admin' | 'company' | 'candidate'`

### Service Layer (Post-Migration)
```
src/services/
  types.ts               -- PaginatedResult<T>, ServiceError
  {module}/
    {module}Service.ts        -- Interface + factory (direct Supabase import)
    {module}Service.supabase.ts -- Supabase implementation
```

**22 modules:** jobs, applications, candidates, companies, users, messages, interviews, favorites, notifications, tickets, assessments, gaugePro, behavioralTests, plans, rbac, featureFlags, reports, gamification, teams, curriculums, highlights, settings

**React Query hooks** (src/hooks/use*Query.ts): 23 hook files with query key factories, pagination, mutations, and cache invalidation.

All modules point directly to Supabase — no mock toggle, no mock implementations.

### Changelog & Versioning
- **Changelog file**: `public/changelog.json` (feeds About page and footer version tooltip)
- **Version constants**: `src/constants/app.ts` (`APP_VERSION`, `APP_CODENAME`)
- **Types**: `src/types/changelog.ts` — valid types: `added`, `changed`, `deprecated`, `removed`, `fixed`, `security`
- **NEVER use** `enhanced` or other custom types (causes crash in VersionAccordion)
- **Every item MUST have `details`** with `description` (string), `files` (string[]), `routes` (string[])
- Details keys are string indices ("0", "1"...) matching the item's position in the `items` array
- Only ONE version should have `isCurrent: true`
- Use proper Portuguese accents (ã, ç, é, í, ó, ú, â, ê, ô) — UTF-8 charset

### Design System
- Colors: Navy (primary dark) + Cyan (accent)
- Font: Roboto Mono
- CSS variables for theming (HSL format)
- Dark mode support (light/dark/system)
- Animations: fade-in, fade-up, scale-in (respects prefers-reduced-motion)

## Supabase Setup

### Environment Variables
Copy `.env.example` to `.env` and fill in:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Database
- 64+ tables with RLS policies, triggers, and full-text search
- 21 migrations applied (some via MCP, some saved locally in sql/migrations/)
- Seeds in sql/seeds/ for development data

### Test Credentials (Development)
| Email | Password | Type |
|-------|----------|------|
| admin@recrutars.com | Admin@123 | admin |
| rh@techsolutions.com | Company@123 | company |
| rh@inovacaodigital.com | Company@123 | company |
| contato@startupbrasil.com | Company@123 | company |
| joao.santos@email.com | Candidate@123 | candidate |
| maria.oliveira@email.com | Candidate@123 | candidate |
| pedro.costa@email.com | Candidate@123 | candidate |
| carla.mendes@email.com | Candidate@123 | candidate |
| lucas.ferreira@email.com | Candidate@123 | candidate |

### Important Notes
- Disable "Confirm email" in Supabase Auth settings for development
- `.env` is gitignored — never commit credentials
- The `handle_new_user()` trigger auto-creates a profile row when a user signs up via Supabase Auth

## Migration Status

Supabase migration is **complete** (v1.0.0 "Genesis"). All 10 PRDs (063-072) done.
PRD-073 (Perfil Profissional Unificado) **complete** (v1.9.0 "Monolith").

- mockData.ts deleted, 20 .mock.ts files deleted, service factories simplified
- All UI modules consume Supabase via service layer + React Query hooks
- Reference/config data (18 files in src/data/) stays as bundled constants
- RBAC engine uses injectable data store via `configureRBAC()` in `src/lib/rbac.ts`
- Curriculum model: 1:1 per candidate (UNIQUE constraint on candidate_id)
- Application highlights: candidates can highlight profile items per application
- Routes: `/candidato/perfil` = professional profile, `/candidato/conta` = account settings
