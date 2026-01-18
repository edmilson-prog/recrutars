# PRD-009: Minhas Candidaturas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar página de acompanhamento das candidaturas do candidato |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 3-5 componentes, filtros, múltiplos estados |

---

## Contexto do Problema

Após se candidatar a vagas, o candidato precisa acompanhar o status de suas candidaturas. Sem essa visibilidade, ele fica "no escuro" sobre o andamento dos processos.

Atualmente:
- Não há página de acompanhamento de candidaturas
- Candidato não sabe quais vagas se candidatou
- Não há histórico de interações
- Candidato precisa lembrar de cabeça onde se candidatou

O acompanhamento de candidaturas permite:
- Visibilidade do pipeline pessoal
- Organização da busca de emprego
- Histórico de processos seletivos
- Base para notificações futuras

---

## Conceito da Solução

### Situação Atual (As-Is)

```
[Candidato se candidata] ──▶ [Não sabe mais onde se candidatou]
```

### Situação Desejada (To-Be)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Minhas Candidaturas                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Filtrar por status:                                        │  │
│  │ [Todas] [Pendentes] [Em análise] [Aprovadas] [Reprovadas] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📊 Total: 12 candidaturas | 3 em análise | 1 aprovada          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 💼 Desenvolvedor React Senior                              │  │
│  │ TechCorp | São Paulo, SP                                   │  │
│  │ Candidatura: 10/01/2026                                    │  │
│  │ Status: 🔵 Em análise                                      │  │
│  │                                                            │  │
│  │ [Ver vaga] [Cancelar candidatura]                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 💼 Product Manager                                         │  │
│  │ StartupXYZ | Remoto                                        │  │
│  │ Candidatura: 08/01/2026                                    │  │
│  │ Status: ⏳ Pendente                                        │  │
│  │                                                            │  │
│  │ [Ver vaga] [Cancelar candidatura]                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 💼 Tech Lead                                               │  │
│  │ BigCorp | Rio de Janeiro, RJ                               │  │
│  │ Candidatura: 05/01/2026                                    │  │
│  │ Status: ✅ Aprovado - Aguardando contato                   │  │
│  │                                                            │  │
│  │ [Ver vaga] [Ver mensagens]                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Lista simples sem filtros | Difícil gerenciar muitas candidaturas |
| Timeline visual | Complexidade desnecessária nesta fase |
| Kanban de candidaturas | Over-engineering para MVP |

---

## Escopo

### Incluído

- ✅ Listagem de todas as candidaturas do candidato
- ✅ Filtro por status (todas, pendentes, em análise, aprovadas, reprovadas)
- ✅ Card de candidatura com informações resumidas
- ✅ Contador de candidaturas por status
- ✅ Link para ver detalhes da vaga
- ✅ Opção de cancelar candidatura (desistência)
- ✅ Ordenação por data (mais recentes primeiro)
- ✅ Estado vazio (sem candidaturas)

### Excluído

- ❌ Notificações de mudança de status
- ❌ Chat com recrutador (será em Mensagens)
- ❌ Reagendar entrevistas
- ❌ Upload de documentos adicionais
- ❌ Avaliação da empresa após processo

---

## Requisitos Funcionais

### Listagem

- **RF-001:** Deve listar todas as candidaturas do candidato logado
- **RF-002:** Candidaturas devem ser ordenadas por data (mais recentes primeiro)
- **RF-003:** Deve exibir estado vazio se não houver candidaturas
- **RF-004:** Estado vazio deve ter link para buscar vagas

### Card de Candidatura

- **RF-005:** Cada card deve exibir: título da vaga, empresa, localização
- **RF-006:** Deve exibir data da candidatura
- **RF-007:** Deve exibir status atual com indicador visual (cor/ícone)
- **RF-008:** Deve ter link para ver detalhes da vaga original
- **RF-009:** Deve ter opção de cancelar candidatura (se status permitir)

### Filtros

- **RF-010:** Deve permitir filtrar por status
- **RF-011:** Filtros disponíveis: Todas, Pendentes, Em análise, Aprovadas, Reprovadas, Desistências
- **RF-012:** Filtro "Todas" deve ser o padrão
- **RF-013:** Contador deve atualizar conforme filtro

### Contadores

- **RF-014:** Deve exibir total de candidaturas
- **RF-015:** Deve exibir quantidade por status principal (em análise, aprovadas)

### Cancelar Candidatura

- **RF-016:** Candidato pode cancelar candidatura com status "pendente" ou "em_analise"
- **RF-017:** Deve exibir confirmação antes de cancelar
- **RF-018:** Ao cancelar, status muda para "desistencia"
- **RF-019:** Deve exibir toast de confirmação

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Listagem deve carregar em menos de 500ms
- **RNF-002 (UX):** Filtros devem ser responsivos e instantâneos
- **RNF-003 (Responsividade):** Cards devem empilhar em mobile
- **RNF-004 (Acessibilidade):** Status deve ter indicação além de cor (ícone/texto)

---

## Critérios de Aceitação

### RF-001 a RF-004: Listagem

```gherkin
DADO que o candidato tem candidaturas registradas
QUANDO ele acessa /candidato/candidaturas
ENTÃO deve ver lista de suas candidaturas
  E ordenadas por data (mais recentes primeiro)
```

```gherkin
DADO que o candidato não tem candidaturas
QUANDO ele acessa /candidato/candidaturas
ENTÃO deve ver mensagem "Você ainda não se candidatou a nenhuma vaga"
  E deve ver link "Buscar vagas"
```

### RF-005 a RF-009: Card

```gherkin
DADO que o candidato está na listagem de candidaturas
QUANDO ele visualiza um card
ENTÃO deve ver título da vaga, empresa, localização
  E deve ver data da candidatura
  E deve ver status com indicador visual
  E deve ver botões de ação
```

### RF-010 a RF-013: Filtros

```gherkin
DADO que o candidato quer ver apenas candidaturas em análise
QUANDO ele clica no filtro "Em análise"
ENTÃO deve ver apenas candidaturas com esse status
  E o contador deve refletir a quantidade filtrada
```

### RF-016 a RF-019: Cancelar

```gherkin
DADO que o candidato quer desistir de uma candidatura pendente
QUANDO ele clica em "Cancelar candidatura"
ENTÃO deve ver modal de confirmação
  E se confirmar, status muda para "desistencia"
  E deve exibir toast "Candidatura cancelada"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e listagem básica | 2 |
| 2 | Card e filtros | 3 |
| 3 | Cancelamento e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Listagem

**Objetivo:** Criar página e listagem básica

**Ações:**
- [ ] Criar/atualizar página `/candidato/candidaturas`
- [ ] Buscar candidaturas do mock pelo candidateId
- [ ] Implementar ordenação por data
- [ ] Implementar estado vazio

**Validação:** Listagem exibe candidaturas do candidato

#### Fase 2: Card e Filtros

**Objetivo:** Implementar cards e sistema de filtros

**Ações:**
- [ ] Criar componente `ApplicationCard`
- [ ] Implementar indicadores visuais de status
- [ ] Criar componente `ApplicationFilters`
- [ ] Implementar lógica de filtro
- [ ] Implementar contadores

**Validação:** Filtros funcionam, cards exibem informações corretas

#### Fase 3: Cancelamento e Refinamentos

**Objetivo:** Implementar cancelamento e polir UX

**Ações:**
- [ ] Implementar modal de cancelamento
- [ ] Atualizar status no mock
- [ ] Implementar toasts de feedback
- [ ] Testar responsividade
- [ ] Ajustes de UX

**Validação:** Fluxo completo funcionando

---

## Estados de Candidatura

| Status | Cor | Ícone | Pode Cancelar? |
|--------|-----|-------|----------------|
| `pendente` | Amarelo | ⏳ | Sim |
| `em_analise` | Azul | 🔵 | Sim |
| `aprovado` | Verde | ✅ | Não |
| `reprovado` | Vermelho | ❌ | Não |
| `desistencia` | Cinza | 🚫 | Não |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-006 | Busca de Vagas | ⏳ Pendente |
| PRD-007 | Candidatura a Vagas | ⏳ Pendente |

> **Dependência crítica:** PRD-007 cria as candidaturas que serão listadas aqui.

### PRDs Seguintes

| PRD | Descrição |
|-----|-----------|
| PRD-010 | Mensagens (para candidaturas aprovadas) |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.8.0 → 0.9.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.9.0] - 2026-01-XX

### Added
- Página "Minhas Candidaturas" com listagem completa
- Filtros por status de candidatura
- Cards com informações da vaga e status
- Contadores de candidaturas por status
- Funcionalidade de cancelar candidatura (desistência)
- Estado vazio com link para buscar vagas
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Filtros** | Usar tabs ou botões toggle |
| **Cards** | Componente similar ao JobCard |
| **Status** | Usar Badge do shadcn/ui com cores |
| **Ordenação** | Mais recentes primeiro |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Paginação (lista deve ser curta por candidato) |
| Lógica de notificação |
| Integração com mensagens (é outro PRD) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Observações** | Depende de PRD-007 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
