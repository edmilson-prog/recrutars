# PRD-021: Gestão de Candidatos (Admin)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar gestão de candidatos pelo administrador |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Similar ao PRD-020, listagem, filtros, detalhes |

---

## Contexto do Problema

O administrador precisa visualizar e gerenciar os candidatos da plataforma: verificar perfis, status de testes, candidaturas, e realizar ações administrativas quando necessário.

---

## Conceito da Solução

### Listagem de Candidatos

```
┌──────────────────────────────────────────────────────────────────┐
│                    Gestão de Candidatos                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔍 [Buscar por nome ou email...                            ]    │
│                                                                  │
│  Filtros: [Status ▼] [Teste ▼] [Perfil ▼]   Total: 1.234 candid.│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 João Silva                                 🟢 Ativo      │  │
│  │ joao@email.com                                             │  │
│  │ Desenvolvedor Full Stack | São Paulo, SP                   │  │
│  │ Teste: ✅ Realizado | Perfil: Analítico                    │  │
│  │ Candidaturas: 5 | Cadastro: 01/01/2026                     │  │
│  │                                                            │  │
│  │ [Ver detalhes]  [Ver teste]  [Desativar]                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 Maria Santos                               🟢 Ativo      │  │
│  │ maria@email.com                                            │  │
│  │ Product Manager | Remoto                                   │  │
│  │ Teste: ⏳ Não realizado | Perfil: -                        │  │
│  │ Candidaturas: 3 | Cadastro: 05/01/2026                     │  │
│  │                                                            │  │
│  │ [Ver detalhes]  [Desativar]                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 Pedro Lima                                 🔴 Inativo    │  │
│  │ pedro@email.com                                            │  │
│  │ Desativado em: 10/12/2025 | Motivo: Solicitação própria   │  │
│  │                                                            │  │
│  │ [Ver detalhes]  [Reativar]                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│               [1] [2] [3] ... [50] [→]                           │
└──────────────────────────────────────────────────────────────────┘
```

### Detalhes do Candidato (Drawer)

```
┌──────────────────────────────────────────────────────────────────┐
│  João Silva                                              [✕]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────┐  João Silva                           🟢 Ativo      │
│  │  Foto  │  joao@email.com                                     │
│  └────────┘  Desenvolvedor Full Stack | São Paulo, SP           │
│              Cadastro: 01/01/2026                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Tabs: [Perfil] [Teste] [Candidaturas] [Histórico]          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ── Tab: Perfil ──                                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Sobre                                                       │ │
│  │                                                             │ │
│  │ "Desenvolvedor apaixonado por tecnologia com 5 anos de     │ │
│  │ experiência em React e Node.js..."                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Skills                                                      │ │
│  │                                                             │ │
│  │ [React] [Node.js] [TypeScript] [PostgreSQL] [Docker]       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Experiência                                                 │ │
│  │                                                             │ │
│  │ • Tech Lead @ TechCorp (2022 - atual)                      │ │
│  │ • Senior Developer @ StartupXYZ (2019 - 2022)              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Ações Administrativas                                       │ │
│  │                                                             │ │
│  │ [Desativar conta]  [Resetar teste]  [Enviar notificação]   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Listagem de todos os candidatos com filtros
- ✅ Busca por nome ou email
- ✅ Filtros: status (ativo, inativo), teste (realizado, não), perfil DISC
- ✅ Card de candidato com resumo
- ✅ Drawer com detalhes completos
- ✅ Tabs: Perfil, Teste, Candidaturas, Histórico
- ✅ Ações: ver detalhes, ativar/desativar, resetar teste
- ✅ Paginação

### Excluído

- ❌ Criar candidato manualmente
- ❌ Editar dados do candidato
- ❌ Exportar lista
- ❌ Enviar mensagem direta

---

## Requisitos Funcionais

### Listagem

- **RF-001:** Listar todos os candidatos da plataforma
- **RF-002:** Buscar por nome ou email
- **RF-003:** Filtrar por status (ativo, inativo)
- **RF-004:** Filtrar por teste realizado (sim, não)
- **RF-005:** Filtrar por perfil DISC
- **RF-006:** Exibir contador de resultados
- **RF-007:** Paginação (20 por página)

### Card de Candidato

- **RF-008:** Exibir: foto, nome, email, status
- **RF-009:** Exibir: título profissional, localização
- **RF-010:** Exibir: status do teste, perfil DISC
- **RF-011:** Exibir: quantidade de candidaturas, data cadastro
- **RF-012:** Botões de ação contextual

### Detalhes (Drawer)

- **RF-013:** Tab Perfil: sobre, skills, experiências, formação
- **RF-014:** Tab Teste: resultado DISC (se realizado)
- **RF-015:** Tab Candidaturas: lista com status
- **RF-016:** Tab Histórico: log de ações administrativas

### Ações Administrativas

- **RF-017:** Desativar candidato (com confirmação e motivo)
- **RF-018:** Reativar candidato (com confirmação)
- **RF-019:** Resetar teste (permite refazer)
- **RF-020:** Enviar notificação (mock - toast)

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Listagem carrega em menos de 1s
- **RNF-002 (UX):** Filtros combináveis
- **RNF-003 (Segurança):** Apenas admin pode acessar
- **RNF-004 (Privacidade):** Não expor dados sensíveis

---

## Critérios de Aceitação

### RF-001 a RF-007: Listagem

```gherkin
DADO que o admin acessa gestão de candidatos
QUANDO a página carrega
ENTÃO deve ver lista de candidatos
  E deve ter campo de busca
  E deve ter filtros funcionais
  E deve ter paginação
```

### RF-019: Resetar Teste

```gherkin
DADO que o admin quer permitir que candidato refaça o teste
QUANDO ele clica em "Resetar teste"
ENTÃO deve ver confirmação
  E ao confirmar, status do teste volta para "não realizado"
  E candidato pode refazer
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Listagem e filtros | 3 |
| 2 | Drawer de detalhes | 3 |
| 3 | Ações administrativas | 2 |

### Detalhamento das Fases

#### Fase 1: Listagem e Filtros

**Ações:**
- [ ] Criar página `/admin/candidatos`
- [ ] Criar componente `CandidateAdminCard`
- [ ] Implementar busca e filtros
- [ ] Implementar paginação

#### Fase 2: Drawer de Detalhes

**Ações:**
- [ ] Criar componente `CandidateAdminDrawer`
- [ ] Implementar tabs
- [ ] Exibir perfil, teste, candidaturas

#### Fase 3: Ações Administrativas

**Ações:**
- [ ] Implementar ativar/desativar
- [ ] Implementar resetar teste
- [ ] Implementar modais de confirmação

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-008 | Teste Comportamental | ⏳ Pendente |
| PRD-019 | Dashboard Admin | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.20.0 → 0.21.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.21.0] - 2026-01-XX

### Added
- Gestão de candidatos para admin
- Listagem com busca e filtros
- Drawer com detalhes completos (tabs)
- Visualização de teste comportamental
- Ações: ativar, desativar, resetar teste
- Histórico de candidaturas por candidato
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Drawer** | Usar Sheet do shadcn/ui |
| **Componentes** | Reutilizar padrões do PRD-020 |
| **Filtros** | Combináveis, persistir em URL |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Editar dados do candidato |
| Mensagem direta |
| Expor dados sensíveis (senha, etc.) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
