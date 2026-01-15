# PRD-027: Agendamento de Entrevistas (Candidato)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Sistema de agendamento e gestão de entrevistas para candidatos |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | Múltiplos estados, fluxo de proposta/aceite, diferentes tipos de entrevista, calendário visual |

---

## Contexto do Problema

Quando uma candidatura avança no processo seletivo, a empresa precisa agendar entrevistas com o candidato. Atualmente não há um sistema centralizado para isso, resultando em comunicação por mensagens desorganizadas e dificuldade de acompanhamento.

### Fluxo Atual (Problemático)

```
Empresa envia mensagem → Candidato responde → Várias mensagens de ida e volta → Confusão sobre horário confirmado
```

### Fluxo Desejado

```
Empresa propõe horários → Candidato aceita ou sugere alternativa → Confirmação clara → Entrevista no calendário
```

---

## Conceito da Solução

### Menu Lateral (Nova Opção)

```
┌────────────────────────┐
│  📊 Dashboard          │
│  👤 Meu Perfil         │
│  📄 Currículos         │
│  🔍 Buscar Vagas       │
│  ❤️ Vagas Salvas       │
│  📋 Candidaturas       │
│  📅 Entrevistas (2)    │  ← Nova opção com badge
│  💬 Mensagens          │
│  📊 Teste DISC         │
│  ⚙️ Configurações      │
└────────────────────────┘
```

### Página de Entrevistas

```
┌──────────────────────────────────────────────────────────────────┐
│  📅 Minhas Entrevistas                                           │
│  Gerencie suas entrevistas agendadas                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Pendentes (2)]  [Confirmadas (1)]  [Realizadas (3)]           │
│  ═══════════════                                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟡 AGUARDANDO SUA RESPOSTA                                │  │
│  │                                                            │  │
│  │  Entrevista Técnica                                        │  │
│  │  TechCorp Soluções • Desenvolvedor React Senior           │  │
│  │                                                            │  │
│  │  A empresa propôs os seguintes horários:                   │  │
│  │                                                            │  │
│  │  ○ Seg, 20/01 às 14:00                                    │  │
│  │  ○ Ter, 21/01 às 10:00                                    │  │
│  │  ○ Qua, 22/01 às 15:30                                    │  │
│  │                                                            │  │
│  │  📹 Videochamada (Google Meet)                             │  │
│  │  ⏱️ Duração estimada: 1 hora                               │  │
│  │                                                            │  │
│  │  Responda até: 18/01/2026                                  │  │
│  │                                                            │  │
│  │  [✓ Aceitar Horário]  [📅 Sugerir Alternativa]            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟡 AGUARDANDO CONFIRMAÇÃO DA EMPRESA                      │  │
│  │                                                            │  │
│  │  Entrevista com RH                                         │  │
│  │  StartupXYZ • Product Manager                              │  │
│  │                                                            │  │
│  │  Você sugeriu:                                             │  │
│  │  📅 Qui, 23/01 às 11:00                                    │  │
│  │                                                            │  │
│  │  📞 Telefone                                               │  │
│  │                                                            │  │
│  │  Aguardando resposta da empresa...                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Aba Confirmadas

```
┌──────────────────────────────────────────────────────────────────┐
│  [Pendentes (2)]  [Confirmadas (1)]  [Realizadas (3)]           │
│                   ═══════════════════                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟢 CONFIRMADA                                  Em 3 dias   │  │
│  │                                                            │  │
│  │  Entrevista Final com CEO                                  │  │
│  │  BigCorp Brasil • Tech Lead                               │  │
│  │                                                            │  │
│  │  📅 Segunda, 20 de Janeiro de 2026                        │  │
│  │  🕐 14:00 - 15:00 (1 hora)                                │  │
│  │                                                            │  │
│  │  📍 Presencial                                             │  │
│  │  Av. Paulista, 1000, 10º andar - São Paulo, SP            │  │
│  │                                                            │  │
│  │  👤 Entrevistador: Carlos Silva (CEO)                     │  │
│  │                                                            │  │
│  │  📝 Observações da empresa:                                │  │
│  │  "Trazer portfólio de projetos. Apresentação de 15min."   │  │
│  │                                                            │  │
│  │  [📍 Ver no Mapa]  [💬 Enviar Mensagem]  [❌ Cancelar]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  💡 Dica: Chegue 15 minutos antes para entrevistas presenciais  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Aba Realizadas

```
┌──────────────────────────────────────────────────────────────────┐
│  [Pendentes (2)]  [Confirmadas (1)]  [Realizadas (3)]           │
│                                      ═══════════════════         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ✅ REALIZADA                                   10/01/2026  │  │
│  │                                                            │  │
│  │  Entrevista Técnica                                        │  │
│  │  TechCorp Soluções • Desenvolvedor React Senior           │  │
│  │                                                            │  │
│  │  📹 Videochamada • 1h15min de duração                     │  │
│  │                                                            │  │
│  │  [👁️ Ver Candidatura]                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ❌ CANCELADA                                   05/01/2026  │  │
│  │                                                            │  │
│  │  Entrevista com RH                                         │  │
│  │  OldCompany • Analista                                    │  │
│  │                                                            │  │
│  │  Motivo: Vaga preenchida                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal: Aceitar Horário

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ Confirmar Entrevista                                    [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Selecione o horário de sua preferência:                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ Segunda, 20/01/2026 às 14:00                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ● Terça, 21/01/2026 às 10:00                    ✓ Selecionado│ │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ Quarta, 22/01/2026 às 15:30                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  📹 Videochamada (Google Meet)                                  │
│  ⏱️ Duração: 1 hora                                             │
│                                                                  │
│  Mensagem para a empresa (opcional):                            │
│  [Confirmo presença! Estou ansioso para a entrevista.     ]     │
│                                                                  │
│                                                                  │
│                            [Cancelar]  [✓ Confirmar Horário]    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal: Sugerir Alternativa

```
┌──────────────────────────────────────────────────────────────────┐
│  📅 Sugerir Horário Alternativo                            [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Nenhum dos horários propostos funciona para você?              │
│  Sugira até 3 horários alternativos.                            │
│                                                                  │
│  Horário 1 *                                                     │
│  [23/01/2026    ] às [11:00  ▼]                                 │
│                                                                  │
│  Horário 2 (opcional)                                           │
│  [24/01/2026    ] às [14:00  ▼]                                 │
│                                                                  │
│  Horário 3 (opcional)                                           │
│  [             ] às [      ▼]                                   │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Motivo (opcional):                                              │
│  [Tenho compromisso nos horários propostos. Os horários     ]   │
│  [acima funcionam melhor para mim.                          ]   │
│                                                                  │
│  ⚠️ A empresa precisará confirmar o novo horário.              │
│                                                                  │
│                            [Cancelar]  [📩 Enviar Sugestão]     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal: Cancelar Entrevista

```
┌──────────────────────────────────────────────────────────────────┐
│  ❌ Cancelar Entrevista                                    [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ Tem certeza que deseja cancelar esta entrevista?            │
│                                                                  │
│  Entrevista Final com CEO                                        │
│  BigCorp Brasil • Tech Lead                                     │
│  📅 Segunda, 20/01/2026 às 14:00                                │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Motivo do cancelamento: *                                       │
│  [Selecione...                                              ▼]  │
│                                                                  │
│  • Aceitei outra proposta                                       │
│  • Problemas de agenda                                          │
│  • Desisti da vaga                                              │
│  • Motivos pessoais                                             │
│  • Outro                                                         │
│                                                                  │
│  Detalhes (opcional):                                           │
│  [                                                          ]   │
│                                                                  │
│  ⚠️ Cancelar entrevistas pode impactar negativamente sua       │
│     reputação na plataforma.                                    │
│                                                                  │
│                            [Voltar]  [❌ Confirmar Cancelamento] │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Calendário Visual (Mini-calendário)

```
┌──────────────────────────────────────────────────────────────────┐
│  📅 Janeiro 2026                                 [<]  [>]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│       Dom   Seg   Ter   Qua   Qui   Sex   Sáb                   │
│                                                                  │
│              13    14    15    16    17    18                    │
│                                                                  │
│        19   [20]   21    22    23    24    25                    │
│              ●                                                   │
│        26    27    28    29    30    31                          │
│                                                                  │
│  ● Entrevista agendada                                          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Segunda, 20/01:                                                │
│  • 14:00 - Entrevista Final (BigCorp)                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tipos de Entrevista

```
┌──────────────────────────────────────────────────────────────────┐
│  Tipos de Entrevista Suportados                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📹 VIDEOCHAMADA                                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Link será disponibilizado pela empresa                    │  │
│  │  Plataformas: Google Meet, Zoom, Teams, etc.              │  │
│  │  Exibir: Link clicável para acessar                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📞 TELEFONE                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Empresa ligará no telefone cadastrado                     │  │
│  │  Exibir: Número que receberá a ligação                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📍 PRESENCIAL                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Candidato deve comparecer ao local                        │  │
│  │  Exibir: Endereço completo + link para mapa               │  │
│  │  Dica: "Chegue 15 minutos antes"                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Página "Minhas Entrevistas" no menu
- ✅ Abas: Pendentes, Confirmadas, Realizadas
- ✅ Badge com contagem de pendentes no menu
- ✅ Visualizar proposta de horários da empresa
- ✅ Aceitar um dos horários propostos
- ✅ Sugerir horários alternativos
- ✅ Visualizar entrevistas confirmadas com detalhes
- ✅ Cancelar entrevista (com motivo)
- ✅ Histórico de entrevistas realizadas/canceladas
- ✅ Tipos: Videochamada, Telefone, Presencial
- ✅ Mini-calendário visual
- ✅ Prazo para resposta
- ✅ Notificações relacionadas

### Excluído

- ❌ Integração com Google Calendar/Outlook
- ❌ Gravação de entrevistas
- ❌ Videochamada nativa na plataforma
- ❌ Reagendamento após confirmação (precisa cancelar e remarcar)
- ❌ Entrevistas em grupo

---

## Requisitos Funcionais

### Página Principal

- **RF-001:** Nova rota `/candidato/entrevistas`
- **RF-002:** Nova opção no menu lateral com badge
- **RF-003:** 3 abas: Pendentes, Confirmadas, Realizadas
- **RF-004:** Contador em cada aba

### Entrevistas Pendentes

- **RF-005:** Listar entrevistas aguardando resposta do candidato
- **RF-006:** Listar entrevistas aguardando confirmação da empresa
- **RF-007:** Exibir horários propostos pela empresa
- **RF-008:** Exibir tipo de entrevista e duração
- **RF-009:** Exibir prazo para resposta
- **RF-010:** Botões: Aceitar Horário, Sugerir Alternativa

### Aceitar Horário

- **RF-011:** Modal para selecionar um dos horários propostos
- **RF-012:** Campo opcional de mensagem para empresa
- **RF-013:** Ao confirmar, mover para aba "Confirmadas"
- **RF-014:** Notificar empresa da confirmação

### Sugerir Alternativa

- **RF-015:** Modal para propor até 3 horários
- **RF-016:** Campo de data e hora para cada sugestão
- **RF-017:** Campo opcional de motivo
- **RF-018:** Ao enviar, status muda para "Aguardando empresa"
- **RF-019:** Notificar empresa da sugestão

### Entrevistas Confirmadas

- **RF-020:** Listar entrevistas com data/hora confirmada
- **RF-021:** Exibir countdown ("Em 3 dias")
- **RF-022:** Detalhes: data, hora, tipo, local/link, entrevistador
- **RF-023:** Observações da empresa
- **RF-024:** Botões: Ver no Mapa (presencial), Enviar Mensagem, Cancelar

### Cancelamento

- **RF-025:** Modal de confirmação com motivo obrigatório
- **RF-026:** Motivos pré-definidos + "Outro"
- **RF-027:** Alerta sobre impacto na reputação
- **RF-028:** Ao cancelar, mover para "Realizadas" com status "Cancelada"
- **RF-029:** Notificar empresa do cancelamento

### Entrevistas Realizadas

- **RF-030:** Listar entrevistas passadas
- **RF-031:** Status: Realizada, Cancelada (pelo candidato ou empresa)
- **RF-032:** Exibir motivo se cancelada
- **RF-033:** Link para candidatura relacionada

### Calendário

- **RF-034:** Mini-calendário mostrando dias com entrevistas
- **RF-035:** Indicador visual nos dias com entrevistas
- **RF-036:** Ao clicar no dia, mostrar entrevistas daquele dia

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Destaque visual para entrevistas próximas (24h)
- **RNF-002 (UX):** Dicas contextuais para cada tipo de entrevista
- **RNF-003 (Performance):** Carregar página em menos de 2 segundos

---

## Critérios de Aceitação

### RF-005 a RF-010: Pendentes

```gherkin
DADO que a empresa propôs 3 horários para entrevista
QUANDO o candidato acessa a aba "Pendentes"
ENTÃO deve ver a entrevista listada
  E deve ver os 3 horários propostos
  E deve ver tipo, duração e prazo
  E deve ver botões de ação
```

### RF-011 a RF-014: Aceitar

```gherkin
DADO que o candidato quer aceitar um horário
QUANDO ele clica em "Aceitar Horário" e seleciona um
ENTÃO deve poder adicionar mensagem opcional
  E ao confirmar, entrevista move para "Confirmadas"
  E empresa deve ser notificada
```

### RF-015 a RF-019: Sugerir

```gherkin
DADO que nenhum horário proposto serve
QUANDO o candidato clica em "Sugerir Alternativa"
ENTÃO deve poder propor até 3 horários
  E deve poder adicionar motivo
  E ao enviar, status muda para "Aguardando empresa"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Página e listagem | 3 |
| 2 | Aceitar e sugerir | 3 |
| 3 | Confirmadas e cancelamento | 2 |
| 4 | Calendário e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Página e Listagem

**Objetivo:** Estrutura básica da página

**Ações:**
- [ ] Criar página `/candidato/entrevistas`
- [ ] Adicionar ao menu lateral com badge
- [ ] Implementar abas e contadores
- [ ] Criar componente `InterviewCard`

**Validação:** Página exibe entrevistas mock

#### Fase 2: Aceitar e Sugerir

**Objetivo:** Modais de resposta

**Ações:**
- [ ] Criar modal `AcceptInterviewModal`
- [ ] Criar modal `SuggestAlternativeModal`
- [ ] Implementar fluxo de aceite
- [ ] Implementar fluxo de sugestão

**Validação:** Candidato consegue aceitar ou sugerir

#### Fase 3: Confirmadas e Cancelamento

**Objetivo:** Gestão de entrevistas confirmadas

**Ações:**
- [ ] Implementar aba "Confirmadas" com detalhes
- [ ] Criar modal `CancelInterviewModal`
- [ ] Implementar fluxo de cancelamento
- [ ] Implementar aba "Realizadas"

**Validação:** Fluxo completo funciona

#### Fase 4: Calendário e Refinamentos

**Objetivo:** Visão de calendário e polish

**Ações:**
- [ ] Criar componente `MiniCalendar`
- [ ] Integrar com entrevistas
- [ ] Adicionar dicas contextuais
- [ ] Testes responsivos

**Validação:** Calendário funcional

---

## Modelo de Dados

### Interview

```typescript
type InterviewType = 'video' | 'phone' | 'in_person';
type InterviewStatus = 
  | 'pending_candidate' // empresa propôs, candidato precisa responder
  | 'pending_company'   // candidato sugeriu, empresa precisa confirmar
  | 'confirmed'
  | 'completed'
  | 'cancelled_by_candidate'
  | 'cancelled_by_company';

interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  title: string; // "Entrevista Técnica", "Entrevista com RH", etc.
  type: InterviewType;
  status: InterviewStatus;
  
  // Horários propostos (quando pendente)
  proposedSlots?: {
    datetime: string;
    selected?: boolean;
  }[];
  
  // Horário confirmado
  confirmedDatetime?: string;
  duration: number; // minutos
  
  // Detalhes por tipo
  videoLink?: string;       // para video
  phoneNumber?: string;     // para phone
  address?: string;         // para in_person
  mapLink?: string;         // para in_person
  
  // Extras
  interviewerName?: string;
  interviewerRole?: string;
  notes?: string;           // observações da empresa
  
  // Datas
  responseDeadline?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-009 | Minhas Candidaturas | ✅ Implementado |
| PRD-025 | Notificações (Candidato) | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.26.0 → 0.27.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.27.0] - 2026-01-XX

### Added
- Página "Minhas Entrevistas" para candidatos
- Abas: Pendentes, Confirmadas, Realizadas
- Aceitar horário proposto pela empresa
- Sugerir horários alternativos
- Cancelar entrevista com motivo
- Suporte a: Videochamada, Telefone, Presencial
- Mini-calendário com indicadores de entrevistas
- Badge de entrevistas pendentes no menu
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Countdown** | Usar date-fns ou similar para "Em X dias" |
| **Calendário** | Pode usar react-calendar ou implementar simples |
| **Mapa** | Link externo para Google Maps |
| **Videochamada** | Apenas exibir link, não precisa validar |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Permitir confirmar sem selecionar horário |
| Cancelar sem motivo |
| Esconder entrevistas passadas (manter histórico) |
| Link de videochamada visível antes da confirmação |

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
