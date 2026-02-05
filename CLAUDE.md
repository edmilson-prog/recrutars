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

RecrutaRS is a React SPA for intelligent recruitment with behavioral assessments (Gauge-Pro DISC tests).

### Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router v6, React Query, React Hook Form + Zod
- Framer Motion for animations

### Project Structure
```
src/
├── pages/              # Route pages
│   ├── admin/          # Admin dashboard
│   ├── empresa/        # Company dashboard (vagas, candidatos, testes)
│   └── candidato/      # Candidate dashboard (perfil, vagas, candidaturas)
├── components/
│   ├── ui/             # shadcn/ui components (50+ files)
│   ├── landing/        # Landing page sections
│   └── layout/         # DashboardLayout wrapper
├── contexts/           # AuthContext (Supabase Auth)
├── hooks/              # useAuth, useMobile, useToast
├── data/               # Mock data (migração em andamento — veja Roadmap)
├── lib/                # utils.ts, supabase.ts, supabaseConverters.ts
└── types/              # database.ts (Supabase schema types)

sql/
├── migrations/         # DDL schemas PostgreSQL (rodar no Supabase SQL Editor)
└── seeds/              # Dados de desenvolvimento

docs/prds/db/           # PRDs e roadmap da migração Supabase
```

### Routing Pattern
- Public: `/`, `/login`, `/cadastro`, `/como-funciona`, `/planos`
- Admin: `/admin/*`
- Company: `/empresa/*` (vagas, candidatos, testes, mensagens)
- Candidate: `/candidato/*` (perfil, vagas, candidaturas, testes)

### Key Patterns
- **Auth**: Supabase Auth via AuthContext. `useAuth()` provides `user`, `isAuthenticated`, `loading`, `login(email, password)`, `logout()`, `signUp(params)`, `resetPassword(email)`, `currentCompany`, `currentCandidate`
- **Layouts**: Use `DashboardLayout` wrapper for authenticated pages with `userType` prop
- **Styling**: Use `cn()` from `@/lib/utils` for Tailwind class merging
- **Imports**: Use `@/` path alias (maps to `src/`)

### Data Models
- **Mock data** (src/data/mockData.ts): User, Company, Candidate, Job, Application, BehavioralTest, Message — migração em andamento
- **Supabase types** (src/types/database.ts): Database schema types (64 tables)
- **Converters** (src/lib/supabaseConverters.ts): Mapeamento snake_case (DB) ↔ camelCase (TS)
- Three user types: `'admin' | 'company' | 'candidate'`

### Service Layer (PRD-066/067)
```
src/services/
  config.ts              -- DATA_SOURCE toggle: 'mock' | 'supabase' per module
  types.ts               -- PaginatedResult<T>, ServiceError, DataSource
  {module}/
    {module}Service.ts        -- Interface + factory
    {module}Service.mock.ts   -- Mock implementation
    {module}Service.supabase.ts -- Supabase implementation
```

**16 modules:** jobs, applications, candidates, companies, users, messages, interviews, favorites, notifications, tickets, assessments, gaugePro, behavioralTests, plans, rbac, featureFlags, reports, gamification, teams, curriculums

**React Query hooks** (src/hooks/use*Query.ts): 18 hook files with query key factories, pagination, mutations, and cache invalidation.

**Toggle data source** in `src/services/config.ts` — flip any module from `'mock'` to `'supabase'`.

### Design System
- Colors: Navy (primary dark) + Cyan (accent)
- Font: Plus Jakarta Sans
- CSS variables for theming (HSL format)
- Animations: fade-in, fade-up, scale-in

## Supabase Setup

### Environment Variables
Copy `.env.example` to `.env` and fill in:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Database Migrations
Run in Supabase SQL Editor (Dashboard > SQL Editor):
1. `sql/migrations/001_identity_schema.sql` — Creates tables (profiles, candidates, companies), triggers, functions, and RLS policies

### Seed Data (Development)
1. Create 9 users via Supabase Dashboard (Authentication > Users > Add User). Credentials are documented in `sql/seeds/001_dev_users.sql`
2. Run `sql/seeds/001_dev_users.sql` in SQL Editor to populate companies and candidates data

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

## Roadmap de Migração Supabase

Documentação completa em `docs/prds/db/ROADMAP-migracao-supabase.md`.

Epic de 10 PRDs (063→072) para migrar de mock data para Supabase com auth real, RLS e persistência.

### Fases Estratégicas

| Fase | PRDs | Objetivo |
|------|------|----------|
| **A — Foundation** | 063 ✅, 064 ✅, 065 ✅ | Auth real, schema completo, seeds |
| **B — Service Layer** | 066 ✅, 067 ✅ | Camada de abstração mock ↔ Supabase |
| **C — Migration** | 068 ✅–072 ✅ | UI aponta para Supabase, limpeza dos mocks |

### PRDs Detalhados

| PRD | Nome | Status |
|-----|------|--------|
| 063 | Fundação Supabase + Auth | ✅ Done (v0.54.0) |
| 064 | Schema Core + Seeds Transacionais | ✅ Done |
| 065 | Dados de Referência + Seeds Permanentes | ✅ Done |
| 066 | Service Layer — Padrão e Módulos Core | ✅ Done |
| 067 | Service Layer — Módulos Especializados | ✅ Done |
| 068 | Migração — Auth + Perfis | ✅ Done |
| 069 | Migração — Vagas e Candidaturas | ✅ Done |
| 070 | Migração — Comunicação + Avaliações | ✅ Done |
| 071 | Migração — Admin + Planos + RBAC | ✅ Done |
| 072 | Limpeza e Remoção dos Mocks (v1.0.0) | ✅ Done |

### Grafo de Dependências
```
PRD-063 (Alicerce)
├─→ PRD-064 ──→ PRD-066 ──→ PRD-069 ──┐
│                                      ├─→ PRD-072
├─→ PRD-065 ──→ PRD-067 ──┬──→ PRD-070 ┤
└─────────────────────────┴──→ PRD-071 ┘
```
