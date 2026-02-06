# RecrutaRS

Plataforma de recrutamento inteligente com avaliacao comportamental Gauge-Pro e matching por IA.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Roteamento:** React Router v6
- **Estado servidor:** React Query (TanStack Query)
- **Formularios:** React Hook Form + Zod
- **Animacoes:** Framer Motion
- **Backend:** Supabase (Auth, PostgreSQL, RLS, Storage)
- **IA:** Claude API (analise comportamental)
- **PDF/Excel:** @react-pdf/renderer, xlsx
- **Drag & Drop:** @dnd-kit

## Desenvolvimento Local

```bash
# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Iniciar servidor de desenvolvimento (porta 8080)
npm run dev

# Build de producao
npm run build

# Executar linter
npm run lint

# Preview do build
npm run preview
```

## Estrutura do Projeto

```
src/
├── pages/              # Paginas por rota
│   ├── admin/          # Painel administrativo
│   ├── empresa/        # Painel da empresa (vagas, candidatos, testes, equipes)
│   └── candidato/      # Painel do candidato (perfil, vagas, candidaturas, testes)
├── components/
│   ├── ui/             # shadcn/ui (50+ componentes)
│   ├── landing/        # Secoes da landing page
│   ├── disc/           # Graficos comportamentais (radar, quadrante, legendas)
│   ├── match/          # Match score e comparacao
│   ├── compare/        # Comparacao lado a lado de candidatos
│   └── layout/         # DashboardLayout wrapper
├── contexts/           # AuthContext (Supabase Auth)
├── hooks/              # 22 React Query hooks + hooks utilitarios
├── services/           # Service layer (21 modulos Supabase)
├── data/               # Dados de referencia e configuracao (18 arquivos)
├── lib/                # utils, supabase client, converters, aiAgent, rbac
└── types/              # TypeScript types (database.ts, gaugePro.ts, disc.ts)

sql/
├── migrations/         # DDL PostgreSQL (21 migrations)
└── seeds/              # Dados de desenvolvimento

docs/prds/db/           # PRDs e roadmap
```

## Modulos Principais

- **Gauge-Pro:** Avaliacao comportamental com 5 dimensoes, selecao de adjetivos, cenarios situacionais e 16 arquetipos
- **Analise IA:** Analise pratica (recrutadores) e tecnica (RH) via Claude API com dual-write localStorage + Supabase
- **Matching:** Score de compatibilidade candidato-vaga com breakdown transparente
- **Gestao de Equipes:** Mapa comportamental, compatibilidade dimensional, Team Builder, PDI, cultura organizacional
- **Hub de Testes:** Criacao de testes, convites, resultados, comparativos e relatorios PDF/Excel
- **Admin:** RBAC Guardian, Planos Commerce, Feature Flags, Vagas Sentinel, Relatorios Radar

## Credenciais de Teste (Desenvolvimento)

| Email | Senha | Tipo |
|-------|-------|------|
| admin@recrutars.com | Admin@123 | admin |
| rh@techsolutions.com | Company@123 | company |
| joao.santos@email.com | Candidate@123 | candidate |

Todos os usuarios de teste estao documentados em `sql/seeds/001_dev_users.sql`.

## Licenca

Proprietario - AILA Automacao Inteligente
