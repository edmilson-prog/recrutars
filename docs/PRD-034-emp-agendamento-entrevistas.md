# PRD-034: Agendamento de Entrevistas (Empresa)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Sistema de agendamento de entrevistas do lado da empresa |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | Múltiplos estados, fluxo de proposta/confirmação, espelho do PRD-027, integração com pipeline |

---

## Contexto do Problema

O PRD-027 implementou o lado do candidato no agendamento. Agora precisamos do lado da empresa: propor horários, receber confirmações, gerenciar entrevistas agendadas. Sem isso, o fluxo de agendamento não funciona.

### Fluxo Completo

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Empresa    │────▶│  Candidato  │────▶│  Empresa    │────▶│ Entrevista  │
│  propõe     │     │  responde   │     │  confirma   │     │  realizada  │
│  horários   │     │             │     │  (se sugeriu)│     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Conceito da Solução

### Menu Lateral (Nova Opção)

```
┌────────────────────────┐
│  📊 Dashboard          │
│  🏢 Perfil da Empresa  │
│  📋 Minhas Vagas       │
│  🔍 Banco de Talentos  │
│  ⭐ Candidatos Salvos  │
│  📥 Candidaturas       │
│  📅 Entrevistas (3)    │  ← Nova opção com badge
│  🔔 Notificações       │
│  💬 Mensagens          │
│  ⚙️ Configurações      │
└────────────────────────┘
```

### Agendar a partir do Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│  Pipeline • Desenvolvedor React Senior                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EM ANÁLISE (15)    │   ENTREVISTA (5)   │   FINALISTAS (2)     │
│  ═══════════════    │                    │                       │
│                     │                    │                       │
│  ┌──────────────┐   │                    │                       │
│  │ João Silva   │   │                    │                       │
│  │ ⭐ 94%       │   │                    │                       │
│  │              │   │                    │                       │
│  │ [📅 Agendar] │   │                    │                       │
│  │     ↑        │   │                    │                       │
│  │ Novo botão   │   │                    │                       │
│  └──────────────┘   │                    │                       │
│                     │                    │                       │
└──────────────────────────────────────────────────────────────────┘
```

### Modal de Agendar Entrevista

```
┌──────────────────────────────────────────────────────────────────┐
│  📅 Agendar Entrevista                                     [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Candidato: João Silva                                          │
│  Vaga: Desenvolvedor React Senior                               │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Título da Entrevista *                                         │
│  [Entrevista Técnica                                        ]   │
│                                                                  │
│  Tipo de Entrevista *                                           │
│                                                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │ 📹 Videochamada│ │ 📞 Telefone    │ │ 📍 Presencial  │       │
│  │ ● Selecionado  │ │ ○ Selecionar  │ │ ○ Selecionar  │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Duração Estimada *                                              │
│  [1 hora                                                    ▼]  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Propor Horários * (mínimo 1, máximo 3)                         │
│                                                                  │
│  Opção 1 *                                                       │
│  [20/01/2026    ]  às  [14:00  ▼]                               │
│                                                                  │
│  Opção 2                                                         │
│  [21/01/2026    ]  às  [10:00  ▼]                               │
│                                                                  │
│  Opção 3                                                         │
│  [22/01/2026    ]  às  [15:30  ▼]   [✕ Remover]                 │
│                                                                  │
│  [+ Adicionar horário]                                          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Prazo para Resposta                                             │
│  [3 dias                                                    ▼]  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Detalhes adicionais (visíveis para tipo selecionado)          │
│                                                                  │
│  [VIDEOCHAMADA]                                                 │
│  Link da reunião                                                 │
│  [https://meet.google.com/abc-defg-hij                      ]   │
│                                                                  │
│  [PRESENCIAL]                                                   │
│  Endereço *                                                      │
│  [Av. Paulista, 1000, 10º andar - São Paulo, SP             ]   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Entrevistador                                                   │
│  [Carlos Silva                                              ]   │
│  Cargo do Entrevistador                                          │
│  [CTO                                                       ]   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Observações para o candidato (opcional)                        │
│  [Trazer portfólio de projetos. Haverá uma apresentação     ]   │
│  [técnica de 15 minutos.                                    ]   │
│                                                                  │
│                                                                  │
│                            [Cancelar]  [📩 Enviar Proposta]     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Página de Entrevistas (Empresa)

```
┌──────────────────────────────────────────────────────────────────┐
│  📅 Entrevistas                                                  │
│  Gerencie suas entrevistas agendadas                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Aguardando Resposta (2)] [Confirmadas (3)] [Realizadas (10)]  │
│  ═════════════════════════                                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟡 AGUARDANDO RESPOSTA DO CANDIDATO                       │  │
│  │                                                            │  │
│  │  Entrevista Técnica                                        │  │
│  │  👤 João Silva • Desenvolvedor React Senior               │  │
│  │                                                            │  │
│  │  Você propôs:                                              │  │
│  │  • Seg, 20/01 às 14:00                                    │  │
│  │  • Ter, 21/01 às 10:00                                    │  │
│  │  • Qua, 22/01 às 15:30                                    │  │
│  │                                                            │  │
│  │  📹 Videochamada • ⏱️ 1 hora                               │  │
│  │                                                            │  │
│  │  Prazo: Candidato deve responder até 18/01/2026           │  │
│  │                                                            │  │
│  │  [💬 Enviar Lembrete]  [❌ Cancelar Proposta]             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟠 CANDIDATO SUGERIU NOVO HORÁRIO                         │  │
│  │                                                            │  │
│  │  Entrevista com RH                                         │  │
│  │  👤 Maria Santos • Product Manager                        │  │
│  │                                                            │  │
│  │  Candidato sugeriu:                                        │  │
│  │  • Qui, 23/01 às 11:00                                    │  │
│  │  • Sex, 24/01 às 14:00                                    │  │
│  │                                                            │  │
│  │  Motivo: "Tenho compromisso nos horários propostos"       │  │
│  │                                                            │  │
│  │  [✓ Aceitar Sugestão]  [📅 Propor Novos]                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Aba Confirmadas

```
┌──────────────────────────────────────────────────────────────────┐
│  [Aguardando (2)]  [Confirmadas (3)]  [Realizadas (10)]         │
│                    ═══════════════════                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟢 CONFIRMADA                                  Amanhã      │  │
│  │                                                            │  │
│  │  Entrevista Final                                          │  │
│  │  👤 Pedro Lima • Tech Lead                                │  │
│  │                                                            │  │
│  │  📅 Segunda, 20 de Janeiro de 2026                        │  │
│  │  🕐 14:00 - 15:00 (1 hora)                                │  │
│  │                                                            │  │
│  │  📍 Presencial                                             │  │
│  │  Av. Paulista, 1000, 10º andar - São Paulo, SP            │  │
│  │                                                            │  │
│  │  👤 Entrevistador: Carlos Silva (CTO)                     │  │
│  │                                                            │  │
│  │  [💬 Mensagem]  [📝 Editar]  [❌ Cancelar]                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  📅 Calendário da Semana                                        │
│                                                                  │
│       Seg 20    Ter 21    Qua 22    Qui 23    Sex 24           │
│       ──────    ──────    ──────    ──────    ──────           │
│  09h                                                             │
│  10h             ▓▓▓▓▓                                          │
│  11h             ▓▓▓▓▓                         ▓▓▓▓▓            │
│  12h                                                             │
│  13h                                                             │
│  14h   ▓▓▓▓▓              ▓▓▓▓▓               ▓▓▓▓▓            │
│  15h   ▓▓▓▓▓              ▓▓▓▓▓               ▓▓▓▓▓            │
│  16h                                                             │
│  17h                       ▓▓▓▓▓                                │
│  18h                       ▓▓▓▓▓                                │
│                                                                  │
│  ▓ = Entrevista agendada                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal: Aceitar Sugestão do Candidato

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ Confirmar Horário Sugerido                              [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Maria Santos sugeriu os seguintes horários:                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ● Quinta, 23/01/2026 às 11:00                   ✓ Aceito   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ Sexta, 24/01/2026 às 14:00                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Ao confirmar, o candidato será notificado e a entrevista       │
│  ficará agendada.                                                │
│                                                                  │
│                            [Cancelar]  [✓ Confirmar Horário]    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Aba Realizadas

```
┌──────────────────────────────────────────────────────────────────┐
│  [Aguardando (2)]  [Confirmadas (3)]  [Realizadas (10)]         │
│                                       ═══════════════════        │
│                                                                  │
│  Filtrar por vaga: [Todas as vagas                          ▼]  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ✅ REALIZADA                                   15/01/2026  │  │
│  │                                                            │  │
│  │  Entrevista Técnica                                        │  │
│  │  👤 Ana Costa • UX Designer                               │  │
│  │                                                            │  │
│  │  📹 Videochamada • 1h20min                                │  │
│  │                                                            │  │
│  │  📝 Feedback pendente                                      │  │
│  │                                                            │  │
│  │  [📝 Adicionar Feedback]  [👁️ Ver Candidatura]            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ❌ CANCELADA PELO CANDIDATO                    10/01/2026  │  │
│  │                                                            │  │
│  │  Entrevista com RH                                         │  │
│  │  👤 Lucas Mendes • Backend Developer                      │  │
│  │                                                            │  │
│  │  Motivo: Aceitou outra proposta                           │  │
│  │                                                            │  │
│  │  [👁️ Ver Candidatura]                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Botão "Agendar Entrevista" no pipeline
- ✅ Modal completo de agendamento
- ✅ Propor 1 a 3 horários
- ✅ Tipos: Videochamada, Telefone, Presencial
- ✅ Página "Entrevistas" no menu lateral
- ✅ Abas: Aguardando Resposta, Confirmadas, Realizadas
- ✅ Visualizar sugestões do candidato
- ✅ Aceitar sugestão de horário
- ✅ Cancelar entrevista (empresa)
- ✅ Calendário semanal visual
- ✅ Notificação quando candidato responde
- ✅ Feedback pós-entrevista (placeholder)

### Excluído

- ❌ Integração com Google Calendar
- ❌ Videochamada nativa
- ❌ Múltiplos entrevistadores
- ❌ Entrevistas em grupo
- ❌ Recorrência de entrevistas

---

## Requisitos Funcionais

### Agendar do Pipeline

- **RF-001:** Botão "📅 Agendar" no card do candidato (pipeline)
- **RF-002:** Ao clicar, abre modal de agendamento
- **RF-003:** Modal pré-preenche candidato e vaga

### Modal de Agendamento

- **RF-004:** Campo: Título da entrevista
- **RF-005:** Seleção de tipo (Vídeo, Telefone, Presencial)
- **RF-006:** Seleção de duração (30min, 1h, 1h30, 2h)
- **RF-007:** Propor 1 a 3 horários (data + hora)
- **RF-008:** Prazo para resposta (1, 2, 3, 5, 7 dias)
- **RF-009:** Campo de link (se videochamada)
- **RF-010:** Campo de endereço (se presencial)
- **RF-011:** Nome e cargo do entrevistador
- **RF-012:** Observações para o candidato

### Página de Entrevistas

- **RF-013:** Nova rota `/empresa/entrevistas`
- **RF-014:** Opção no menu lateral com badge
- **RF-015:** 3 abas: Aguardando, Confirmadas, Realizadas
- **RF-016:** Contador em cada aba

### Aguardando Resposta

- **RF-017:** Listar entrevistas aguardando candidato
- **RF-018:** Listar entrevistas com sugestão do candidato
- **RF-019:** Exibir horários propostos ou sugeridos
- **RF-020:** Botões: Aceitar Sugestão, Propor Novos, Cancelar

### Aceitar Sugestão

- **RF-021:** Modal para selecionar horário sugerido
- **RF-022:** Ao confirmar, entrevista move para "Confirmadas"
- **RF-023:** Notificar candidato da confirmação

### Confirmadas

- **RF-024:** Listar entrevistas confirmadas
- **RF-025:** Exibir countdown ("Amanhã", "Em 3 dias")
- **RF-026:** Calendário semanal com horários ocupados
- **RF-027:** Botões: Mensagem, Editar, Cancelar

### Realizadas

- **RF-028:** Listar entrevistas passadas
- **RF-029:** Status: Realizada, Cancelada (por quem)
- **RF-030:** Indicador de feedback pendente
- **RF-031:** Botão "Adicionar Feedback" (placeholder)

### Cancelamento (Empresa)

- **RF-032:** Modal de confirmação
- **RF-033:** Motivo obrigatório
- **RF-034:** Notificar candidato

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Destaque visual para entrevistas nas próximas 24h
- **RNF-002 (UX):** Calendário mostra conflitos de horário
- **RNF-003 (Performance):** Página carrega em menos de 2 segundos

---

## Critérios de Aceitação

### RF-001 a RF-012: Modal de Agendamento

```gherkin
DADO que a empresa está no pipeline de uma vaga
QUANDO ela clica em "Agendar" em um candidato
ENTÃO o modal deve abrir pré-preenchido
  E deve permitir configurar todos os campos
  E ao enviar, a proposta deve aparecer em "Aguardando"
```

### RF-017 a RF-020: Sugestão do Candidato

```gherkin
DADO que um candidato sugeriu novos horários
QUANDO a empresa acessa "Aguardando Resposta"
ENTÃO deve ver a sugestão com os horários
  E deve ver o motivo do candidato
  E deve poder aceitar ou propor novos
```

### RF-024 a RF-027: Confirmadas

```gherkin
DADO que há entrevistas confirmadas
QUANDO a empresa acessa a aba "Confirmadas"
ENTÃO deve ver lista ordenada por data
  E deve ver calendário semanal
  E deve poder enviar mensagem ou cancelar
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modal de agendamento | 3 |
| 2 | Página e listagens | 3 |
| 3 | Aceitar sugestões | 2 |
| 4 | Calendário e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Modal de Agendamento

**Objetivo:** Permitir propor entrevistas

**Ações:**
- [ ] Adicionar botão "Agendar" no pipeline
- [ ] Criar componente `ScheduleInterviewModal`
- [ ] Implementar todos os campos
- [ ] Validar e enviar proposta

**Validação:** Empresa consegue propor entrevista

#### Fase 2: Página e Listagens

**Objetivo:** Página de gestão de entrevistas

**Ações:**
- [ ] Criar página `/empresa/entrevistas`
- [ ] Adicionar ao menu lateral com badge
- [ ] Implementar 3 abas
- [ ] Implementar cards de entrevista

**Validação:** Página funciona com dados mock

#### Fase 3: Aceitar Sugestões

**Objetivo:** Responder a sugestões do candidato

**Ações:**
- [ ] Implementar visualização de sugestões
- [ ] Criar modal de aceitar sugestão
- [ ] Implementar confirmação
- [ ] Integrar com notificações

**Validação:** Fluxo de sugestão funciona

#### Fase 4: Calendário e Refinamentos

**Objetivo:** Visão de calendário e polish

**Ações:**
- [ ] Implementar calendário semanal
- [ ] Implementar cancelamento
- [ ] Adicionar aba "Realizadas"
- [ ] Testes e ajustes

**Validação:** Sistema completo funciona

---

## Modelo de Dados

Reutiliza modelo do PRD-027, adicionando campos específicos:

```typescript
// Extensão do modelo do PRD-027
interface InterviewFromCompanyPerspective extends Interview {
  // Campos adicionais para visão da empresa
  candidatePhoto: string;
  jobTitle: string;
  feedbackPending?: boolean;
  feedbackNote?: string;
}

// Para o calendário
interface CalendarSlot {
  datetime: string;
  interviewId: string;
  candidateName: string;
  type: InterviewType;
}
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-015 | Pipeline de Candidaturas | ✅ Implementado |
| PRD-027 | Agendamento (Candidato) | ✅ Implementado |
| PRD-033 | Notificações (Empresa) | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.33.0 → 0.34.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.34.0] - 2026-01-XX

### Added
- Sistema de agendamento de entrevistas (lado empresa)
- Modal para propor horários de entrevista
- Página "Entrevistas" para empresas
- Abas: Aguardando, Confirmadas, Realizadas
- Aceitar sugestões de horário do candidato
- Calendário semanal visual
- Integração com pipeline de candidaturas
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Modelo** | Reutilizar estrutura do PRD-027 |
| **Estado** | Sincronizar com estado do candidato |
| **Calendário** | Pode usar react-calendar ou custom |
| **Pipeline** | Atualizar status ao agendar |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Propor horários no passado |
| Permitir agendar sem preencher campos obrigatórios |
| Conflito de horários sem aviso |
| Perder entrevistas ao navegar |

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
| 15/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
