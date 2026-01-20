# PRD-015: Gestão de Candidaturas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar gestão de candidaturas recebidas pela empresa |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 6+ componentes, pipeline visual, múltiplos estados, ações em lote |

---

## Contexto do Problema

A empresa precisa gerenciar o fluxo de candidatos em seus processos seletivos. Visualizar, avaliar, mover entre etapas e dar feedback são ações essenciais.

Atualmente:
- Empresa não consegue ver candidaturas de forma organizada
- Não há pipeline de etapas
- Não há como aprovar/reprovar candidatos
- Processo seletivo não é gerenciável

A gestão de candidaturas permite:
- Visão de pipeline por vaga
- Movimentação entre etapas
- Avaliação de candidatos
- Feedback estruturado

---

## Conceito da Solução

### Visão de Pipeline (Kanban)

```
┌──────────────────────────────────────────────────────────────────┐
│  Candidaturas - Dev React Senior                    [Filtros ▼]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│  │   NOVOS      │ │  EM ANÁLISE  │ │  ENTREVISTA  │ │ APROVADOS││
│  │     12       │ │      8       │ │      3       │ │    2     ││
│  ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────┤│
│  │              │ │              │ │              │ │          ││
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │ │┌────────┐││
│  │ │João Silva│ │ │ │Ana Costa │ │ │ │Pedro Lima│ │ ││Maria S.│││
│  │ │⭐ 85%    │ │ │ │⭐ 78%    │ │ │ │⭐ 92%    │ │ ││⭐ 88%  │││
│  │ │📊 Anal.  │ │ │ │📊 Comun. │ │ │ │📊 Exec.  │ │ ││📊 Plan.│││
│  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │ │└────────┘││
│  │              │ │              │ │              │ │          ││
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │ │┌────────┐││
│  │ │Carlos M. │ │ │ │Bruno F.  │ │ │ │Lucia R.  │ │ ││José P. │││
│  │ │⭐ 72%    │ │ │ │⭐ 81%    │ │ │ │⭐ 75%    │ │ ││⭐ 90%  │││
│  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │ │└────────┘││
│  │              │ │              │ │              │ │          ││
│  │ [+ mais 10]  │ │ [+ mais 6]   │ │              │ │          ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘│
│                                                                  │
│  ───────────────────────────────────────────────────────────────│
│  REPROVADOS: 8 candidatos                         [Ver lista →] │
└──────────────────────────────────────────────────────────────────┘
```

### Detalhes do Candidato (Modal/Drawer)

```
┌──────────────────────────────────────────────────────────────────┐
│  João Silva                                              [✕]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────┐  Desenvolvedor Full Stack                              │
│  │ Foto │  São Paulo, SP                                         │
│  └──────┘  Candidatura: 10/01/2026                               │
│                                                                  │
│  ⭐ Match: 85%  |  📊 Perfil: Analítico  |  📝 Teste: Realizado  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Tabs: [Perfil] [Experiência] [Teste] [Mensagem] [Histórico] │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Mensagem do Candidato:                                      │ │
│  │ "Olá! Tenho grande interesse nessa vaga e acredito que      │ │
│  │ minha experiência com React e Node.js..."                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Anotações internas:                                         │ │
│  │ [Adicionar anotação...]                                     │ │
│  │                                                             │ │
│  │ • 10/01 - Maria: Bom perfil, avançar para entrevista       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Ações:                                                      │ │
│  │                                                             │ │
│  │ [Mover para: ▼]  [Enviar mensagem]  [Reprovar]             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Seletor de vaga (ver candidaturas por vaga)
- ✅ Visão de pipeline (Kanban) com colunas de status
- ✅ Cards de candidato com resumo
- ✅ Drawer/Modal com detalhes do candidato
- ✅ Mover candidato entre etapas (drag ou select)
- ✅ Aprovar/Reprovar candidato
- ✅ Anotações internas sobre candidato
- ✅ Filtros (match, perfil DISC, teste realizado)
- ✅ Link para enviar mensagem
- ✅ Histórico de movimentações

### Excluído

- ❌ Drag and drop entre colunas (usar select)
- ❌ Ações em lote (selecionar múltiplos)
- ❌ Agendamento de entrevista integrado
- ❌ Scorecards de entrevista
- ❌ Integração com calendário
- ❌ Email automático ao mover etapa

---

## Requisitos Funcionais

### Seleção de Vaga

- **RF-001:** Deve ter seletor de vaga no topo da página
- **RF-002:** Deve listar apenas vagas ativas ou pausadas da empresa
- **RF-003:** Ao selecionar vaga, deve carregar candidaturas

### Pipeline (Kanban)

- **RF-004:** Deve exibir colunas: Novos, Em Análise, Entrevista, Aprovados
- **RF-005:** Cada coluna deve ter contador de candidatos
- **RF-006:** Reprovados devem aparecer em seção separada (colapsável)
- **RF-007:** Cards devem mostrar: nome, foto, match, perfil DISC

### Card de Candidato

- **RF-008:** Ao clicar no card, deve abrir drawer com detalhes
- **RF-009:** Deve indicar se teste comportamental foi realizado
- **RF-010:** Deve indicar se há mensagem não lida

### Detalhes do Candidato

- **RF-011:** Drawer deve ter tabs: Perfil, Experiência, Teste, Mensagem, Histórico
- **RF-012:** Tab Perfil: dados básicos, skills, "sobre mim"
- **RF-013:** Tab Experiência: experiências e formação
- **RF-014:** Tab Teste: resultado DISC com gráfico (se realizado)
- **RF-015:** Tab Mensagem: mensagem enviada na candidatura + link para chat
- **RF-016:** Tab Histórico: log de movimentações

### Movimentação

- **RF-017:** Deve ter select "Mover para:" com etapas disponíveis
- **RF-018:** Ao mover, deve registrar no histórico
- **RF-019:** Ao mover para "Reprovado", deve pedir motivo (opcional)
- **RF-020:** Ao aprovar, deve exibir opções de próximos passos

### Anotações

- **RF-021:** Deve permitir adicionar anotações internas
- **RF-022:** Anotações devem ter autor e timestamp
- **RF-023:** Apenas empresa vê anotações (candidato não vê)

### Filtros

- **RF-024:** Filtrar por faixa de match (ex: >80%)
- **RF-025:** Filtrar por perfil DISC
- **RF-026:** Filtrar por teste realizado/não realizado

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Pipeline deve ser visualmente claro
- **RNF-002 (Performance):** Carregar candidaturas em menos de 1s
- **RNF-003 (Responsividade):** Em mobile, colunas empilham verticalmente
- **RNF-004 (Feedback):** Toda movimentação deve ter toast

---

## Critérios de Aceitação

### RF-004 a RF-007: Pipeline

```gherkin
DADO que a empresa selecionou uma vaga com candidatos
QUANDO o pipeline carrega
ENTÃO deve ver 4 colunas de status
  E cada coluna deve ter contador
  E cards devem mostrar resumo do candidato
```

### RF-017 a RF-020: Movimentação

```gherkin
DADO que a empresa quer avançar um candidato
QUANDO ela seleciona "Mover para: Entrevista"
ENTÃO o card deve mover para a coluna Entrevista
  E deve registrar no histórico
  E deve exibir toast "Candidato movido para Entrevista"
```

### RF-019: Reprovar

```gherkin
DADO que a empresa quer reprovar um candidato
QUANDO ela seleciona "Reprovar"
ENTÃO deve abrir modal pedindo motivo (opcional)
  E ao confirmar, candidato vai para seção Reprovados
  E status da candidatura muda para "reprovado"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e pipeline | 3 |
| 2 | Cards e drawer | 4 |
| 3 | Movimentação e ações | 3 |
| 4 | Filtros e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Pipeline

**Ações:**
- [ ] Criar página `/empresa/candidaturas`
- [ ] Criar seletor de vaga
- [ ] Criar layout de colunas (Kanban)
- [ ] Implementar contadores

#### Fase 2: Cards e Drawer

**Ações:**
- [ ] Criar componente `ApplicationCard`
- [ ] Criar componente `CandidateDrawer`
- [ ] Implementar tabs do drawer
- [ ] Exibir dados do candidato

#### Fase 3: Movimentação e Ações

**Ações:**
- [ ] Implementar select de movimentação
- [ ] Implementar ação de reprovar com modal
- [ ] Implementar anotações internas
- [ ] Registrar histórico de movimentações

#### Fase 4: Filtros e Refinamentos

**Ações:**
- [ ] Implementar filtros
- [ ] Testar responsividade
- [ ] Ajustes de UX
- [ ] Seção de reprovados colapsável

---

## Etapas do Pipeline

| Etapa | Descrição | Cor |
|-------|-----------|-----|
| `novo` | Candidatura recém-recebida | Azul |
| `em_analise` | Sendo avaliado | Amarelo |
| `entrevista` | Agendado/em entrevista | Roxo |
| `aprovado` | Aprovado no processo | Verde |
| `reprovado` | Não aprovado | Vermelho |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-007 | Candidatura a Vagas | ⏳ Pendente |
| PRD-008 | Teste Comportamental | ⏳ Pendente |
| PRD-013 | CRUD de Vagas | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.14.0 → 0.15.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.15.0] - 2026-01-XX

### Added
- Gestão de candidaturas por vaga
- Pipeline visual (Kanban) com colunas de status
- Drawer com detalhes do candidato (tabs)
- Movimentação entre etapas
- Ação de aprovar/reprovar
- Anotações internas por candidato
- Histórico de movimentações
- Filtros por match, perfil e teste
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Kanban** | Usar flexbox, não precisa de lib de drag |
| **Drawer** | Usar Sheet do shadcn/ui |
| **Tabs** | Usar Tabs do shadcn/ui |
| **Histórico** | Array de eventos com timestamp |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Drag and drop complexo (usar select) |
| Ações em lote |
| Integração com calendário |
| Envio de email automático |

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
