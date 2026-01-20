# PRD-019: Dashboard Admin

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar dashboard administrativo da plataforma |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Cards de métricas, gráficos simples, visão consolidada |

---

## Contexto do Problema

O administrador da plataforma precisa de uma visão consolidada do sistema: quantas empresas, candidatos, vagas, testes realizados. Isso permite monitorar a saúde do marketplace.

---

## Conceito da Solução

### Layout do Dashboard Admin

```
┌──────────────────────────────────────────────────────────────────┐
│                    Dashboard - Administração                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Bem-vindo, Administrador! 👋                                    │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ 🏢 Empresas │ │ 👥 Candid.  │ │ 💼 Vagas    │ │ 📊 Testes   │ │
│  │   Ativas    │ │   Total     │ │   Ativas    │ │ Realizados  │ │
│  │             │ │             │ │             │ │             │ │
│  │     45      │ │   1.234     │ │    127      │ │    892      │ │
│  │   +5 mês    │ │  +89 mês    │ │  +23 mês    │ │  +156 mês   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                  │
│  ┌────────────────────────────────┐ ┌──────────────────────────┐ │
│  │ 📈 Crescimento (últimos 30d)   │ │ 🆕 Últimas Empresas      │ │
│  │                                │ │                          │ │
│  │     /\                        │ │ • TechCorp    10/01      │ │
│  │    /  \    /\                 │ │ • StartupXYZ  09/01      │ │
│  │   /    \  /  \                │ │ • BigCorp     08/01      │ │
│  │  /      \/    \               │ │ • Agency      07/01      │ │
│  │ ────────────────              │ │                          │ │
│  │ Empresas  Candidatos          │ │ [Ver todas →]            │ │
│  │                                │ │                          │ │
│  └────────────────────────────────┘ └──────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────┐ ┌──────────────────────────┐ │
│  │ 📊 Candidaturas por Status     │ │ 🏆 Top Empresas          │ │
│  │                                │ │                          │ │
│  │ Pendentes    ████████████ 456 │ │ 1. TechCorp     45 vagas │ │
│  │ Em análise   ████████ 312     │ │ 2. StartupXYZ   32 vagas │ │
│  │ Aprovados    ████ 189         │ │ 3. BigCorp      28 vagas │ │
│  │ Reprovados   ██████ 234       │ │ 4. Agency       22 vagas │ │
│  │                                │ │ 5. FinTech      18 vagas │ │
│  └────────────────────────────────┘ └──────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⚡ Ações Rápidas                                           │  │
│  │                                                            │  │
│  │ [🏢 Empresas]  [👥 Candidatos]  [💼 Vagas]  [📊 Relatórios]│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Cards de métricas principais (empresas, candidatos, vagas, testes)
- ✅ Variação mensal em cada métrica
- ✅ Gráfico de crescimento (últimos 30 dias)
- ✅ Lista de últimas empresas cadastradas
- ✅ Distribuição de candidaturas por status
- ✅ Top empresas por vagas
- ✅ Ações rápidas para navegação

### Excluído

- ❌ Relatórios exportáveis
- ❌ Gráficos interativos complexos
- ❌ Filtros por período
- ❌ Métricas de receita/financeiro
- ❌ Logs de sistema

---

## Requisitos Funcionais

### Métricas Principais

- **RF-001:** Card de empresas ativas (total + variação mês)
- **RF-002:** Card de candidatos cadastrados (total + variação mês)
- **RF-003:** Card de vagas ativas (total + variação mês)
- **RF-004:** Card de testes realizados (total + variação mês)
- **RF-005:** Cards clicáveis navegam para lista correspondente

### Gráfico de Crescimento

- **RF-006:** Gráfico de linha mostrando últimos 30 dias
- **RF-007:** Duas séries: empresas e candidatos
- **RF-008:** Exibir valores ao passar o mouse (tooltip)

### Últimas Empresas

- **RF-009:** Listar 5 empresas mais recentes
- **RF-010:** Exibir nome e data de cadastro
- **RF-011:** Link "Ver todas" navega para gestão de empresas

### Candidaturas por Status

- **RF-012:** Barras horizontais com quantidade por status
- **RF-013:** Status: pendentes, em análise, aprovados, reprovados

### Top Empresas

- **RF-014:** Ranking das 5 empresas com mais vagas
- **RF-015:** Exibir nome e quantidade de vagas

### Ações Rápidas

- **RF-016:** Botões de navegação para áreas principais
- **RF-017:** Empresas, Candidatos, Vagas, Relatórios

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Dashboard carrega em menos de 1s
- **RNF-002 (Responsividade):** Cards reorganizam em grid responsivo
- **RNF-003 (UX):** Métricas mais importantes no topo

---

## Critérios de Aceitação

### RF-001 a RF-005: Métricas

```gherkin
DADO que o admin acessa o dashboard
QUANDO a página carrega
ENTÃO deve ver 4 cards de métricas
  E cada card deve mostrar total e variação
  E ao clicar, deve navegar para lista correspondente
```

### RF-006 a RF-008: Gráfico

```gherkin
DADO que o admin visualiza o gráfico de crescimento
QUANDO passa o mouse sobre um ponto
ENTÃO deve ver tooltip com valor daquele dia
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e métricas | 2 |
| 2 | Gráficos e listas | 3 |
| 3 | Ações e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Métricas

**Ações:**
- [ ] Criar página `/admin/dashboard`
- [ ] Criar componente `AdminMetricCard`
- [ ] Implementar cálculo de métricas do mock
- [ ] Implementar variação mensal

#### Fase 2: Gráficos e Listas

**Ações:**
- [ ] Criar gráfico de crescimento (Recharts)
- [ ] Criar lista de últimas empresas
- [ ] Criar barras de candidaturas por status
- [ ] Criar ranking de top empresas

#### Fase 3: Ações e Refinamentos

**Ações:**
- [ ] Criar seção de ações rápidas
- [ ] Testar responsividade
- [ ] Ajustes visuais

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-002 | Proteção de Rotas | ✅ Implementado |
| PRD-004 | Tipos TypeScript | ⏳ Pendente |

### PRDs Seguintes

| PRD | Descrição |
|-----|-----------|
| PRD-020 | Gestão de Empresas |
| PRD-021 | Gestão de Candidatos |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.18.0 → 0.19.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.19.0] - 2026-01-XX

### Added
- Dashboard administrativo
- Cards de métricas (empresas, candidatos, vagas, testes)
- Gráfico de crescimento dos últimos 30 dias
- Lista de últimas empresas cadastradas
- Distribuição de candidaturas por status
- Ranking de top empresas por vagas
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Gráficos** | Usar Recharts (já disponível) |
| **Grid** | CSS Grid para cards responsivos |
| **Variação** | Calcular diferença com mês anterior |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Gráficos muito complexos |
| Relatórios exportáveis |
| Métricas financeiras |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Observações** | Início da Fase 4 (Área Admin) |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
