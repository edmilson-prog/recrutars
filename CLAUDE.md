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
├── contexts/           # AuthContext (mock auth)
├── hooks/              # useAuth, useMobile, useToast
├── data/               # mockData.ts (all mock data)
└── lib/                # utils.ts (cn helper)
```

### Routing Pattern
- Public: `/`, `/login`, `/cadastro`, `/como-funciona`, `/planos`
- Admin: `/admin/*`
- Company: `/empresa/*` (vagas, candidatos, testes, mensagens)
- Candidate: `/candidato/*` (perfil, vagas, candidaturas, testes)

### Key Patterns
- **Auth**: Mock-based via AuthContext. `useAuth()` provides `user`, `isAuthenticated`, `login(userType)`, `logout()`
- **Layouts**: Use `DashboardLayout` wrapper for authenticated pages with `userType` prop
- **Styling**: Use `cn()` from `@/lib/utils` for Tailwind class merging
- **Imports**: Use `@/` path alias (maps to `src/`)

### Data Models (src/data/mockData.ts)
- User, Company, Candidate, Job, Application, BehavioralTest, Message
- Three user types: `'admin' | 'company' | 'candidate'`

### Design System
- Colors: Navy (primary dark) + Cyan (accent)
- Font: Plus Jakarta Sans
- CSS variables for theming (HSL format)
- Animations: fade-in, fade-up, scale-in
