# Roadmap de Migração: Mock → Supabase

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma SaaS de Recrutamento Inteligente  
> Épico: Migração Completa Mock → Supabase  
> Data: 04/02/2026 | Versão: v1.0

---

## 📋 Visão Geral do Épico

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Versão Atual** | v0.53.0 "Sentinel" |
| **Repositório** | RecrutaRS (Lovable → Claude Code CLI) |
| **Supabase Project** | `filackbesialiapjwijb` |
| **Objetivo** | Migrar 100% dos dados mockados para Supabase com auth real, RLS e persistência |
| **Total de PRDs** | 10 (PRD-063 a PRD-072) |
| **Fases Estratégicas** | 3 (Fundação → Abstração → Migração) |
| **Abordagem** | Incremental (auth-first, módulo por módulo) |

---

## 🔍 Diagnóstico do Estado Atual

### Métricas do Codebase

| Métrica | Valor |
|---------|-------|
| **Arquivos mock** | 22 arquivos em `src/data/` |
| **Linhas de mock** | ~17.500 linhas |
| **Tipos/Interfaces** | 327 em `src/types/` |
| **Imports de @/data/** | 151 imports em 125 arquivos |
| **Maior arquivo** | `mockData.ts` — 3.972 linhas, 133KB, 44 importações |
| **Schema Supabase** | 100% vazio (zero tabelas) |

### Mapa de Arquivos Mock

#### Categoria 1 — Seeds Permanentes (~8.574 linhas)

Dados de referência que definem a estrutura do negócio. Sempre presentes em produção.

| Arquivo | Linhas | Conteúdo |
|---------|--------|----------|
| `assessmentData.ts` | 3.135 | Dimensões, categorias, ~200 questões comportamentais |
| `settingsConfig.ts` | 1.521 | Categorias de configuração da plataforma |
| `plansData.ts` | 1.068 | 6 planos, 25 capabilities, assignments |
| `rbacData.ts` | 678 | 8 roles, 34 permissions, groups |
| `gamificationConfig.ts` | 432 | Levels, badges, XP actions |
| `messageTemplates.ts` | 320 | Templates de mensagem |
| `culturalDimensions.ts` | 216 | Dimensões culturais, mappings |
| `gaugeProArchetypes.ts` | 251 | Perfis arquetípicos |
| `gaugeProScenarios.ts` | 189 | Cenários Gauge-Pro |
| `gaugeProWords.ts` | 128 | Adjetivos para avaliação |
| `chatbotKnowledge.ts` | 226 | Base de conhecimento do chatbot |
| `profileSummaries.ts` | 88 | Sumários de perfil DISC |

#### Categoria 2 — Seeds Transacionais (~8.230 linhas)

Dados que simulam uso real. Tabelas vazias em produção, seeds para dev/staging.

| Arquivo | Linhas | Conteúdo |
|---------|--------|----------|
| `mockData.ts` | 3.972 | Users, companies, candidates, jobs, applications, messages, interviews, tickets, curriculums, behavioral profiles, match scores |
| `teamManagementData.ts` | 1.725 | Departments, positions, team members, compatibility, development plans |
| `adminJobsData.ts` | 1.418 | Admin jobs view, moderation, hires |
| `behavioralAssessmentData.ts` | 461 | Assessments, responses, results, invites |
| `companyTestData.ts` | 311 | Company tests, invitations, results |
| `reportsData.ts` | 343 | Daily metrics, activity feed, schedules |

#### Categoria 3 — Feature Flags / Config (~1.008 linhas)

Configuração de plataforma e feature toggles.

| Arquivo | Linhas | Conteúdo |
|---------|--------|----------|
| `featureFlagsData.ts` | 898 | 25 flags, overrides, audit logs |
| `companyTestTemplates.ts` | 59 | Templates de testes corporativos |
| `gaugeProConfig.ts` | 40 | Constantes de configuração |
| `testConfig.ts` | 11 | Config de testes |

### Padrão de Consumo Atual

| Padrão | Descrição | Ocorrências |
|--------|-----------|-------------|
| **Direto em Pages** | Componentes importam arrays, usam `.find()` / `.filter()` | Maioria |
| **Via Hooks** | `useApplications`, `useMessages`, `useInterviews` encapsulam lógica | ~10 hooks |
| **Via Contexts** | `AuthContext`, `RBACContext`, `SimulationContext` | 3 contexts |

---

## 🗺️ Estratégia de Migração

### Princípio: Incremental, Auth-First

```
NÃO big-bang. Cada PRD entrega valor testável.

Schema → Seeds → Abstração → Migração → Limpeza
  063     064      066        068-071     072
          065      067
```

### Por que Auth Primeiro?

1. **RLS depende de auth** — Row Level Security precisa de `auth.uid()` para funcionar
2. **Identidade é fundação** — Toda query futura precisa saber quem é o usuário
3. **Testa infra Supabase** — Valida conexão, client, ambiente antes de avançar
4. **Desbloqueia tudo** — Sem auth real, nenhum outro PRD pode ser implementado com segurança

### Lógica da Sequência

| Etapa | O que faz | Por que nesta ordem |
|-------|-----------|---------------------|
| **Auth (063)** | Identidade real | Fundação de tudo — RLS, queries, sessions |
| **Schema (064-065)** | Tabelas + dados | Precisa de auth para FKs e RLS |
| **Abstração (066-067)** | Service layer | "Seguro" para troca de fonte de dados |
| **Migração (068-071)** | Componentes apontam para Supabase | Service layer protege contra quebras |
| **Limpeza (072)** | Remove mocks | Só quando 100% migrado |

---

## 📊 Fases Estratégicas

### Visão Macro

```
╔══════════════════════════════════════════════════════════════════════╗
║  FASE A — FUNDAÇÃO                                                  ║
║  PRD-063 → PRD-064 → PRD-065                                       ║
║  "Construir o alicerce: auth real, schema completo, dados base"     ║
╠══════════════════════════════════════════════════════════════════════╣
║  FASE B — CAMADA DE SERVIÇO                                        ║
║  PRD-066 → PRD-067                                                  ║
║  "Criar abstração que permite trocar fonte sem quebrar UI"          ║
╠══════════════════════════════════════════════════════════════════════╣
║  FASE C — MIGRAÇÃO DE CONSUMO                                      ║
║  PRD-068 → PRD-069 → PRD-070 → PRD-071 → PRD-072                  ║
║  "Módulo por módulo, apontar componentes para Supabase + limpeza"  ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## FASE A — FUNDAÇÃO (Crítica, Bloqueia Tudo)

> **Objetivo:** Criar o alicerce sobre o qual toda a migração será construída.
> Sem esta fase, nenhuma outra PRD pode avançar com segurança.

### PRD-063: Fundação Supabase + Autenticação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ PRD CRIADO (813 linhas, 17 seções, 5 fases) |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Fases** | 5 |
| **Arquivos estimados** | ~17 |
| **Depende de** | — (é o alicerce) |
| **Desbloqueia** | PRD-064, PRD-065 |

**Escopo:**
- Setup do client Supabase (`supabaseClient.ts`)
- Supabase Auth nativo (email/senha + magic link)
- Migração do `AuthContext` mantendo interface pública inalterada
- Tabelas: `auth.users` + `profiles` + `companies` + `candidates`
- RLS base para as tabelas de identidade
- Onboarding: fluxo único onde usuário escolhe candidato vs empresa

**Decisões técnicas:**
- Sem login social (por enquanto)
- `auth.users` para autenticação, `profiles` para dados compartilhados
- `companies` e `candidates` como tabelas especializadas por tipo

**Arquivo:** `PRD-063-fundacao-supabase-auth.md`

---

### PRD-064: Schema Core + Seeds Transacionais

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Fases estimadas** | 4-5 |
| **Linhas de mock cobertas** | ~8.230 (Categoria 2) |
| **Depende de** | PRD-063 |
| **Desbloqueia** | PRD-066, PRD-069 |

**Escopo:**
- Criar tabelas core do negócio no Supabase:
  - `jobs` (vagas)
  - `applications` (candidaturas)
  - `messages` / `conversations` (comunicação)
  - `interviews` (entrevistas)
  - `tickets` (suporte)
  - `curriculums` (currículos)
  - `departments`, `positions`, `team_members` (gestão de equipes)
  - `behavioral_profiles`, `match_scores` (assessment results)
- RLS para todas as tabelas baseado em tipo de usuário
- Seeds com dados dos mocks atuais para ambientes dev/staging
- **NÃO** alterar nenhum componente React — apenas banco

**Fonte dos dados:** `mockData.ts`, `adminJobsData.ts`, `behavioralAssessmentData.ts`, `companyTestData.ts`, `teamManagementData.ts`, `reportsData.ts`

---

### PRD-065: Dados de Referência + Seeds Permanentes

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Fases estimadas** | 4-5 |
| **Linhas de mock cobertas** | ~8.574 (Categoria 1) + ~1.008 (Categoria 3) |
| **Depende de** | PRD-063 |
| **Desbloqueia** | PRD-067, PRD-071 |

**Escopo:**
- Criar tabelas de referência no Supabase:
  - `plans`, `plan_capabilities`, `plan_assignments` (planos e assinaturas)
  - `roles`, `permissions`, `role_permissions` (RBAC)
  - `assessment_dimensions`, `assessment_categories`, `assessment_questions` (~200 questões)
  - `gauge_pro_scenarios`, `gauge_pro_words`, `gauge_pro_archetypes` (Gauge-Pro)
  - `cultural_dimensions`, `cultural_mappings`
  - `gamification_levels`, `gamification_badges`, `gamification_xp_actions`
  - `feature_flags`, `feature_flag_overrides`
  - `message_templates`, `chatbot_knowledge`
  - `settings_categories`, `settings_options`
- Seeds permanentes (dados que existem em produção desde o dia 1)
- RLS: maioria é leitura pública, escrita admin-only
- **NÃO** alterar nenhum componente React — apenas banco

**Fonte dos dados:** `plansData.ts`, `rbacData.ts`, `assessmentData.ts`, `gaugeProScenarios.ts`, `gaugeProWords.ts`, `gaugeProArchetypes.ts`, `culturalDimensions.ts`, `gamificationConfig.ts`, `featureFlagsData.ts`, `settingsConfig.ts`, `messageTemplates.ts`, `chatbotKnowledge.ts`, `profileSummaries.ts`, `companyTestTemplates.ts`, `gaugeProConfig.ts`, `testConfig.ts`

---

## FASE B — CAMADA DE SERVIÇO (Abstração)

> **Objetivo:** Criar uma camada intermediária entre componentes React e fonte de dados.
> Isso permite trocar de mock para Supabase sem alterar nenhum componente da UI.

### PRD-066: Service Layer — Padrão e Módulos Core

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Fases estimadas** | 4-5 |
| **Depende de** | PRD-063, PRD-064 |
| **Desbloqueia** | PRD-067, PRD-068, PRD-069 |

**Escopo:**
- Definir o padrão de abstração (services/repositories)
- Implementar services para os módulos core:
  - `AuthService` — login, registro, sessão, perfil
  - `UsersService` — CRUD de usuários e perfis
  - `CompaniesService` — CRUD de empresas
  - `CandidatesService` — CRUD de candidatos
  - `JobsService` — CRUD de vagas, busca, filtros
- Cada service com interface pública que pode apontar para mock OU Supabase
- Feature flag interna para alternar fonte de dados
- Hooks adaptados para usar services ao invés de imports diretos

**Conceito-chave:** Componentes chamam `JobsService.list()` em vez de `import { mockJobs } from '@/data'`. O service decide internamente se busca do mock ou do Supabase.

---

### PRD-067: Service Layer — Módulos Especializados

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Fases estimadas** | 4-5 |
| **Depende de** | PRD-065, PRD-066 |
| **Desbloqueia** | PRD-070, PRD-071 |

**Escopo:**
- Services para módulos especializados:
  - `ApplicationsService` — candidaturas, status, histórico
  - `MessagesService` — conversas, mensagens, notificações
  - `InterviewsService` — agendamento, gestão de entrevistas
  - `AssessmentsService` — testes comportamentais, Gauge-Pro, resultados
  - `PlansService` — planos, capabilities, assinaturas
  - `RBACService` — roles, permissions, verificação de acesso
  - `FeatureFlagsService` — flags, overrides, avaliação
  - `ReportsService` — métricas, analytics, relatórios
  - `GamificationService` — XP, badges, levels
  - `TeamManagementService` — departamentos, posições, membros

**Mesmo padrão:** Interface pública → implementação interna pode ser mock ou Supabase.

---

## FASE C — MIGRAÇÃO DE CONSUMO (Módulo por Módulo)

> **Objetivo:** Apontar cada módulo para Supabase real, validar, e limpar mocks.
> Ordem: do core (auth, perfis) para o específico (admin, planos).

### PRD-068: Migração — Auth + Perfis

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Fases estimadas** | 3-4 |
| **Depende de** | PRD-066 |
| **Desbloqueia** | PRD-069 (parcial) |

**Escopo:**
- Trocar `AuthContext` por Supabase Auth real via `AuthService`
- Migrar pages de login/cadastro para auth real
- Migrar dashboard de cada tipo de usuário (candidato, empresa, admin)
- Gestão de perfil conectada ao Supabase
- Validar fluxo completo: cadastro → login → dashboard → logout

**Resultado:** Usuários reais, sessões reais, perfis persistentes.

---

### PRD-069: Migração — Vagas e Candidaturas

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Fases estimadas** | 4-5 |
| **Depende de** | PRD-064, PRD-066 |
| **Desbloqueia** | PRD-070 |

**Escopo:**
- Migrar páginas de vagas (listagem, busca, filtros, detalhes)
- Migrar candidaturas (aplicar, acompanhar, histórico)
- Migrar vagas salvas e recomendadas
- Painel da empresa: publicar, editar, gerenciar vagas
- Admin: moderação de vagas

**Resultado:** Fluxo completo de vagas operando com dados reais.

---

### PRD-070: Migração — Comunicação + Avaliações

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Fases estimadas** | 4-5 |
| **Depende de** | PRD-067, PRD-069 |
| **Desbloqueia** | PRD-072 (parcial) |

**Escopo:**
- Migrar sistema de mensagens (conversas, inbox, notificações)
- Migrar gestão de entrevistas (agendamento, status)
- Migrar testes comportamentais (assessment questions, respostas, resultados)
- Migrar Gauge-Pro (cenários, words, archetypes, avaliação)
- Migrar gestão de equipes (departamentos, membros, compatibility)

**Resultado:** Comunicação e avaliação comportamental operando com dados reais.

---

### PRD-071: Migração — Admin + Planos + RBAC

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Fases estimadas** | 4-5 |
| **Depende de** | PRD-065, PRD-067 |
| **Desbloqueia** | PRD-072 (parcial) |

**Escopo:**
- Migrar painel admin completo (gestão de usuários, dashboard)
- Migrar sistema de planos e assinaturas (plans, capabilities)
- Migrar RBAC (roles, permissions, verificação de acesso)
- Migrar feature flags (flags, overrides, avaliação, simulação)
- Migrar reports e analytics (métricas, gráficos, exportação)
- Migrar gamificação (XP, badges, leaderboard)
- Migrar configurações da plataforma

**Resultado:** Admin totalmente operacional com dados reais.

---

### PRD-072: Migração — Limpeza e Remoção dos Mocks

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PRD A CRIAR |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Fases estimadas** | 3 |
| **Depende de** | PRD-068, PRD-069, PRD-070, PRD-071 |
| **Desbloqueia** | — (encerra o épico) |

**Escopo:**
- Remover todos os 22 arquivos de `src/data/*.ts`
- Limpar 151 imports residuais em 125 arquivos
- Remover tipos/interfaces que eram exclusivos dos mocks
- Limpar hooks que tinham lógica mock-specific
- Validação final: build limpo, zero referências a `@/data/`
- Atualizar documentação

**Resultado:** Codebase 100% Supabase, zero dados mockados.

---

## 🗺️ Mapa de Dependências

```
PRD-063 (Fundação Auth) ⭐ ALICERCE
    │
    ├──▶ PRD-064 (Schema Core + Seeds Transacionais)
    │       │
    │       ├──▶ PRD-066 (Service Layer Core)
    │       │       │
    │       │       ├──▶ PRD-068 (Migração Auth + Perfis)
    │       │       │       │
    │       │       │       └──▶ ─── ─── ─── ─── ─┐
    │       │       │                               │
    │       │       └──▶ PRD-069 (Migração Vagas)   │
    │       │               │                       │
    │       │               └──▶ ─── ─── ─── ─┐    │
    │       │                                  │    │
    │       └───────────────────────────────────│────│──▶ PRD-072 (Limpeza)
    │                                          │    │        ▲
    └──▶ PRD-065 (Referência + Seeds Permanentes)  │    │        │
            │                                  │    │        │
            └──▶ PRD-067 (Service Layer Espec.)│    │        │
                    │                          │    │        │
                    ├──▶ PRD-070 (Migração Comunicação + Avaliações)
                    │                                       │
                    └──▶ PRD-071 (Migração Admin + Planos)  │
                                                            │
                            ────────────────────────────────┘
```

### Tabela de Dependências

| PRD | Título | Depende de | Desbloqueia |
|-----|--------|-----------|-------------|
| **PRD-063** | Fundação Supabase + Auth | — | 064, 065 |
| **PRD-064** | Schema Core + Seeds Transacionais | 063 | 066, 069 |
| **PRD-065** | Referência + Seeds Permanentes | 063 | 067, 071 |
| **PRD-066** | Service Layer Core | 063, 064 | 067, 068, 069 |
| **PRD-067** | Service Layer Especializado | 065, 066 | 070, 071 |
| **PRD-068** | Migração Auth + Perfis | 066 | 072 |
| **PRD-069** | Migração Vagas + Candidaturas | 064, 066 | 070, 072 |
| **PRD-070** | Migração Comunicação + Avaliações | 067, 069 | 072 |
| **PRD-071** | Migração Admin + Planos + RBAC | 065, 067 | 072 |
| **PRD-072** | Limpeza e Remoção dos Mocks | 068-071 | — |

### Caminho Crítico

```
063 → 064 → 066 → 069 → 070 → 072
```

Este é o caminho mais longo — qualquer atraso aqui atrasa o épico inteiro.

### Paralelismos Possíveis

| Podem rodar em paralelo | Condição |
|--------------------------|----------|
| PRD-064 e PRD-065 | Ambas dependem apenas de PRD-063 |
| PRD-068 e PRD-069 | Ambas dependem de PRD-066 (PRD-069 também de PRD-064) |
| PRD-070 e PRD-071 | Ambas dependem de PRD-067 |

---

## 📈 Estimativas

### Por PRD

| PRD | Complexidade | Arquivos Est. | Linhas Mock Cobertas |
|-----|-------------|---------------|----------------------|
| PRD-063 | Alta | ~17 | — (infra) |
| PRD-064 | Alta | ~15 | ~8.230 |
| PRD-065 | Alta | ~15 | ~9.582 |
| PRD-066 | Alta | ~20 | — (abstração) |
| PRD-067 | Alta | ~25 | — (abstração) |
| PRD-068 | Média | ~12 | — (migração) |
| PRD-069 | Alta | ~18 | — (migração) |
| PRD-070 | Alta | ~20 | — (migração) |
| PRD-071 | Alta | ~20 | — (migração) |
| PRD-072 | Média | ~22 (remoção) | ~17.500 (todas) |
| **Total** | — | **~184 arquivos** | **~17.500 linhas removidas** |

### Por Fase

| Fase | PRDs | Arquivos Est. | Entrega Principal |
|------|------|---------------|-------------------|
| **A — Fundação** | 063, 064, 065 | ~47 | Schema completo + Auth real |
| **B — Abstração** | 066, 067 | ~45 | Service layer completa |
| **C — Migração** | 068-072 | ~92 | UI apontando para Supabase + limpeza |

---

## 🎯 Critérios de Sucesso por Fase

### Fase A — Fundação

| Critério | Métrica |
|----------|---------|
| Auth funcional | Login/cadastro/logout com Supabase Auth |
| Schema completo | Todas as tabelas criadas no Supabase |
| Seeds carregados | Dados de referência disponíveis para consulta |
| RLS ativo | Policies impedindo acesso não autorizado |
| **App continua funcionando** | Zero quebras na UI (ainda usa mocks) |

### Fase B — Abstração

| Critério | Métrica |
|----------|---------|
| Padrão definido | Interface de service documentada e consistente |
| Services implementados | Todos os módulos com service layer |
| Feature flag funcional | Toggle mock ↔ Supabase por módulo |
| Testes passando | Services retornam dados corretos de ambas as fontes |
| **App continua funcionando** | Zero quebras na UI |

### Fase C — Migração

| Critério | Métrica |
|----------|---------|
| Módulos migrados | Cada PRD migra um grupo de funcionalidades |
| Dados persistentes | CRUD real no Supabase |
| RLS validado | Cada tipo de usuário vê apenas seus dados |
| Zero mocks | Nenhum import de `@/data/` no codebase |
| Build limpo | `npm run build` sem erros ou warnings |
| **Plataforma 100% operacional** | Todos os fluxos funcionando com dados reais |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Quebra de UI durante migração | Alta | Alto | Service layer como camada de proteção |
| Incompatibilidade de tipos mock → Supabase | Média | Médio | Mapear tipos antes de migrar (PRDs 064-065) |
| RLS bloqueando acessos legítimos | Média | Alto | Testar cada policy com todos os perfis |
| Performance com queries reais vs arrays locais | Média | Médio | Paginação, índices, cache quando necessário |
| Complexidade do mockData.ts (44 importações) | Alta | Alto | Migrar por service, não por arquivo |
| Perda de dados durante migração | Baixa | Alto | Seeds como backup, rollback por feature flag |

---

## 📋 Status Consolidado

| PRD | Título | Fase | Status PRD | Status Impl. |
|-----|--------|------|-----------|-------------|
| PRD-063 | Fundação Supabase + Auth | A | ✅ Criado | ⏳ Pendente |
| PRD-064 | Schema Core + Seeds Transacionais | A | ⏳ A criar | ⏳ Pendente |
| PRD-065 | Referência + Seeds Permanentes | A | ⏳ A criar | ⏳ Pendente |
| PRD-066 | Service Layer Core | B | ⏳ A criar | ⏳ Pendente |
| PRD-067 | Service Layer Especializado | B | ⏳ A criar | ⏳ Pendente |
| PRD-068 | Migração Auth + Perfis | C | ⏳ A criar | ⏳ Pendente |
| PRD-069 | Migração Vagas + Candidaturas | C | ⏳ A criar | ⏳ Pendente |
| PRD-070 | Migração Comunicação + Avaliações | C | ⏳ A criar | ⏳ Pendente |
| PRD-071 | Migração Admin + Planos + RBAC | C | ⏳ A criar | ⏳ Pendente |
| PRD-072 | Limpeza e Remoção dos Mocks | C | ⏳ A criar | ⏳ Pendente |

**Progresso:** 1/10 PRDs criados (10%) | 0/10 implementados (0%)

---

## 🔄 Ordem de Criação dos PRDs

A criação dos PRDs segue a ordem de dependência. Cada PRD só é criado quando suas dependências já estão criadas (e idealmente implementadas ou em implementação).

| Ordem | PRD | Pode criar quando |
|-------|-----|-------------------|
| 1 | ~~PRD-063~~ | ✅ Já criado |
| 2 | PRD-064 | Após PRD-063 criado |
| 3 | PRD-065 | Após PRD-063 criado (paralelo com 064) |
| 4 | PRD-066 | Após PRD-063, PRD-064 criados |
| 5 | PRD-067 | Após PRD-065, PRD-066 criados |
| 6 | PRD-068 | Após PRD-066 criado |
| 7 | PRD-069 | Após PRD-064, PRD-066 criados |
| 8 | PRD-070 | Após PRD-067, PRD-069 criados |
| 9 | PRD-071 | Após PRD-065, PRD-067 criados |
| 10 | PRD-072 | Após PRD-068 a PRD-071 criados |

---

## 📊 Versionamento Previsto

| PRD | Versão Esperada | Tipo SemVer | Codinome Sugerido |
|-----|----------------|-------------|-------------------|
| PRD-063 | 0.54.0 | MINOR | **Foundation** |
| PRD-064 | 0.55.0 | MINOR | **Blueprint** |
| PRD-065 | 0.56.0 | MINOR | **Catalog** |
| PRD-066 | 0.57.0 | MINOR | **Bridge** |
| PRD-067 | 0.58.0 | MINOR | **Conduit** |
| PRD-068 | 0.59.0 | MINOR | **Gateway** |
| PRD-069 | 0.60.0 | MINOR | **Pipeline** |
| PRD-070 | 0.61.0 | MINOR | **Signal** |
| PRD-071 | 0.62.0 | MINOR | **Command** |
| PRD-072 | 1.0.0 | MAJOR | **Genesis** |

> **Nota:** PRD-072 marca a transição para v1.0.0 — a primeira versão com dados 100% reais. O codinome "Genesis" representa o nascimento da plataforma em produção real.

---

## Decisões Técnicas Consolidadas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Autenticação | Supabase Auth nativo | Integração nativa com RLS, sessions, tokens |
| Métodos de login | Email/senha + magic link | Suficiente para MVP, social depois |
| Onboarding | Fluxo único, escolha de tipo | Simplifica cadastro, evita dois fluxos separados |
| Schema | 100% criado via PRDs | Controle total, versionado, auditável |
| Seeds permanentes | Tabelas com dados pré-populados | Planos, roles, questions existem desde o dia 1 |
| Seeds transacionais | Apenas em dev/staging | Produção começa com tabelas vazias |
| Camada de abstração | Service layer com toggle | Permite migração gradual sem quebrar UI |
| Limpeza de mocks | PRD separado no final | Só remove quando 100% migrado e validado |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 04/02/2026 | v1.0 | Criação inicial — Roadmap completo com 10 PRDs, 3 fases |

---

**AILA - Sistemas Inteligentes**
