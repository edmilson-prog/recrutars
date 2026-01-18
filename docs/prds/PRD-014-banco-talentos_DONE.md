# PRD-014: Banco de Talentos

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar busca e visualização de candidatos disponíveis na plataforma |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 4-6 componentes, filtros avançados, visualização de perfil |

---

## Contexto do Problema

Além de receber candidaturas, empresas querem buscar proativamente talentos que se encaixem em suas necessidades. O banco de talentos permite hunting ativo.

Atualmente:
- Empresa só consegue ver candidatos que se candidataram
- Não há busca proativa de talentos
- Não há filtros por skills ou perfil comportamental
- Oportunidades de match são perdidas

O banco de talentos permite:
- Busca proativa de candidatos
- Filtro por skills, experiência, localização
- Visualização de perfil comportamental
- Convite para vagas específicas

---

## Conceito da Solução

### Situação Desejada (To-Be)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Banco de Talentos                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔍 [Buscar por cargo, skill ou palavra-chave...        ]  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Filtros:                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │ Skills ▼ │ │ Local  ▼ │ │ Perfil ▼ │ │ Experiência    ▼ │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │
│                                                                  │
│  Encontrados: 234 candidatos                  [Limpar filtros]  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 João Silva                                              │  │
│  │ Desenvolvedor Full Stack | São Paulo, SP                   │  │
│  │                                                            │  │
│  │ [React] [Node.js] [TypeScript] [PostgreSQL]               │  │
│  │                                                            │  │
│  │ 📊 Perfil: Analítico | ⭐ 85% match com "Dev React Sr"    │  │
│  │                                                            │  │
│  │ [Ver perfil completo]  [Convidar para vaga]               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 Maria Santos                                            │  │
│  │ Product Manager | Remoto                                   │  │
│  │                                                            │  │
│  │ [Produto] [Agile] [Métricas] [SQL]                        │  │
│  │                                                            │  │
│  │ 📊 Perfil: Comunicador | ⭐ 72% match com "PM"            │  │
│  │                                                            │  │
│  │ [Ver perfil completo]  [Convidar para vaga]               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│               [1] [2] [3] ... [10] [→]                           │
└──────────────────────────────────────────────────────────────────┘
```

### Visualização de Perfil do Candidato

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Voltar ao Banco de Talentos]                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ┌──────┐                                                   │  │
│  │ │ Foto │  João Silva                                       │  │
│  │ └──────┘  Desenvolvedor Full Stack                         │  │
│  │           São Paulo, SP                                    │  │
│  │                                                            │  │
│  │           [Convidar para vaga ▼]                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 📊 Perfil Comportamental: ANALÍTICO                        │  │
│  │                                                            │  │
│  │ Dominância:  ████████░░ 75%                                │  │
│  │ Influência:  ████░░░░░░ 40%                                │  │
│  │ Estabilidade: ██████░░░░ 60%                               │  │
│  │ Conformidade: █████████░ 85%                               │  │
│  │                                                            │  │
│  │ Características: Orientado a dados, analítico, detalhista  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 💼 Experiência                                             │  │
│  │                                                            │  │
│  │ • Tech Lead @ TechCorp (2022 - atual)                     │  │
│  │ • Senior Developer @ StartupXYZ (2019 - 2022)             │  │
│  │ • Developer @ Agency (2017 - 2019)                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🎓 Formação                                                │  │
│  │                                                            │  │
│  │ • Ciência da Computação - USP (2013 - 2017)               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🏷️ Skills                                                  │  │
│  │                                                            │  │
│  │ [React] [Node.js] [TypeScript] [PostgreSQL] [Docker]      │  │
│  │ [AWS] [GraphQL] [Jest] [CI/CD]                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Busca por texto (cargo, skill, palavra-chave)
- ✅ Filtro por skills (multi-select)
- ✅ Filtro por localização
- ✅ Filtro por perfil comportamental (DISC)
- ✅ Filtro por anos de experiência
- ✅ Card de candidato com resumo
- ✅ Visualização de perfil completo do candidato
- ✅ Indicador de match com vagas da empresa
- ✅ Botão "Convidar para vaga"
- ✅ Paginação de resultados

### Excluído

- ❌ Salvar candidatos favoritos
- ❌ Comparar candidatos lado a lado
- ❌ Exportar lista de candidatos
- ❌ Filtro por pretensão salarial (privacidade)
- ❌ Contato direto (apenas via convite para vaga)

---

## Requisitos Funcionais

### Busca

- **RF-001:** Deve permitir busca por texto livre
- **RF-002:** Busca deve pesquisar em: título, skills, descrição do perfil
- **RF-003:** Busca deve ter debounce de 300ms
- **RF-004:** Deve exibir contador de resultados

### Filtros

- **RF-005:** Filtro por skills (multi-select com autocomplete)
- **RF-006:** Filtro por localização (select ou input)
- **RF-007:** Filtro por perfil DISC (Executor, Comunicador, Planejador, Analítico)
- **RF-008:** Filtro por experiência (0-2, 3-5, 6-10, 10+ anos)
- **RF-009:** Filtros devem ser combináveis (AND)
- **RF-010:** Botão "Limpar filtros"

### Card de Candidato

- **RF-011:** Deve exibir: foto, nome, título, localização
- **RF-012:** Deve exibir principais skills (tags)
- **RF-013:** Deve exibir perfil comportamental resumido
- **RF-014:** Deve exibir indicador de match com vagas ativas da empresa
- **RF-015:** Botão "Ver perfil completo"
- **RF-016:** Botão "Convidar para vaga"

### Perfil Completo

- **RF-017:** Página `/empresa/talentos/:id` com perfil detalhado
- **RF-018:** Deve exibir gráfico DISC do candidato
- **RF-019:** Deve exibir experiências profissionais
- **RF-020:** Deve exibir formação acadêmica
- **RF-021:** Deve exibir todas as skills
- **RF-022:** Botão "Convidar para vaga" com dropdown de vagas ativas

### Convite para Vaga

- **RF-023:** Ao clicar em "Convidar", deve abrir dropdown com vagas ativas
- **RF-024:** Ao selecionar vaga, deve abrir modal de confirmação
- **RF-025:** Pode adicionar mensagem personalizada
- **RF-026:** Convite deve criar conversa em Mensagens
- **RF-027:** Deve exibir toast de confirmação

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Busca deve responder em menos de 500ms
- **RNF-002 (Privacidade):** Não exibir dados de contato (email, telefone)
- **RNF-003 (Responsividade):** Cards devem funcionar em mobile
- **RNF-004 (UX):** Filtros devem ser colapsáveis em mobile

---

## Critérios de Aceitação

### RF-001 a RF-004: Busca

```gherkin
DADO que a empresa acessa o banco de talentos
QUANDO ela digita "React" na busca
ENTÃO deve filtrar candidatos que tenham React nas skills ou título
  E deve exibir contador atualizado
  E deve aplicar debounce de 300ms
```

### RF-011 a RF-016: Card

```gherkin
DADO que a empresa visualiza a lista de candidatos
QUANDO ela vê um card
ENTÃO deve ver foto, nome, título e localização
  E deve ver principais skills
  E deve ver perfil comportamental
  E deve ver match com suas vagas
  E deve ter botões de ação
```

### RF-023 a RF-027: Convite

```gherkin
DADO que a empresa quer convidar um candidato
QUANDO ela clica em "Convidar para vaga"
ENTÃO deve ver dropdown com suas vagas ativas
  E ao selecionar, deve abrir modal de confirmação
  E pode adicionar mensagem
  E ao confirmar, deve criar conversa
  E deve exibir toast "Convite enviado"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e listagem | 3 |
| 2 | Busca e filtros | 3 |
| 3 | Perfil do candidato | 2 |
| 4 | Convite para vaga | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Listagem

**Ações:**
- [ ] Criar página `/empresa/talentos`
- [ ] Criar componente `CandidateCard`
- [ ] Listar candidatos do mock
- [ ] Implementar paginação

#### Fase 2: Busca e Filtros

**Ações:**
- [ ] Criar componente `TalentSearchBar`
- [ ] Criar componente `TalentFilters`
- [ ] Implementar lógica de filtro combinado
- [ ] Implementar debounce

#### Fase 3: Perfil do Candidato

**Ações:**
- [ ] Criar página `/empresa/talentos/:id`
- [ ] Exibir perfil DISC com gráfico
- [ ] Exibir experiências e formação
- [ ] Exibir skills completas

#### Fase 4: Convite para Vaga

**Ações:**
- [ ] Criar componente `InviteToJobDropdown`
- [ ] Criar modal de confirmação com mensagem
- [ ] Integrar com mock de mensagens
- [ ] Implementar toasts

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-008 | Teste Comportamental | ⏳ Pendente |
| PRD-013 | CRUD de Vagas | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.13.0 → 0.14.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.14.0] - 2026-01-XX

### Added
- Banco de Talentos com busca e filtros
- Filtros por skills, localização, perfil DISC, experiência
- Cards de candidato com resumo e match
- Visualização de perfil completo do candidato
- Convite para vaga com mensagem personalizada
```

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Exibir dados de contato do candidato |
| Contato direto sem ser via plataforma |
| Exportação de dados |

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
