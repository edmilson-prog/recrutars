# PRD-033: Notificações (Empresa)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Sistema de notificações para empresas (espelho do PRD-025) |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Múltiplos tipos de notificação, dropdown + página, estado de leitura |

---

## Contexto do Problema

Empresas perdem oportunidades por não saber em tempo real quando:
- Um candidato se candidatou a uma vaga
- Um candidato aceitou ou recusou convite
- Um candidato confirmou ou cancelou entrevista
- Um candidato respondeu mensagem
- Uma vaga está prestes a expirar

Um sistema de notificações centralizado mantém a empresa informada e ágil.

---

## Conceito da Solução

### Sino no Header

```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 RecrutaRS       🔍 Buscar...       🌙  🔔 ●5    👤 TechCorp ▼│
│                                            ↑                     │
│                                      Sino com badge              │
│                                      5 não lidas                 │
└──────────────────────────────────────────────────────────────────┘
```

### Dropdown de Notificações

```
┌──────────────────────────────────────────────────────────────────┐
│                                           🔔 ●5                  │
│                                             │                    │
│                               ┌─────────────▼────────────────┐   │
│                               │  Notificações                │   │
│                               │                              │   │
│                               │  ┌────────────────────────┐  │   │
│                               │  │ 🔵 Nova candidatura    │  │   │
│                               │  │    João Silva se cand- │  │   │
│                               │  │    idatou para Dev...  │  │   │
│                               │  │    há 5 minutos        │  │   │
│                               │  └────────────────────────┘  │   │
│                               │                              │   │
│                               │  ┌────────────────────────┐  │   │
│                               │  │ 🔵 Convite aceito      │  │   │
│                               │  │    Maria Santos acei-  │  │   │
│                               │  │    tou seu convite     │  │   │
│                               │  │    há 1 hora           │  │   │
│                               │  └────────────────────────┘  │   │
│                               │                              │   │
│                               │  ┌────────────────────────┐  │   │
│                               │  │ 🔵 Entrevista conf.    │  │   │
│                               │  │    Pedro Lima confir-  │  │   │
│                               │  │    mou para 20/01      │  │   │
│                               │  │    há 2 horas          │  │   │
│                               │  └────────────────────────┘  │   │
│                               │                              │   │
│                               │  ┌────────────────────────┐  │   │
│                               │  │ ○ Teste concluído      │  │   │
│                               │  │    Ana Costa concluiu  │  │   │
│                               │  │    o teste DISC        │  │   │
│                               │  │    há 1 dia            │  │   │
│                               │  └────────────────────────┘  │   │
│                               │                              │   │
│                               │  ─────────────────────────   │   │
│                               │  [Marcar todas como lidas]   │   │
│                               │  [Ver todas →]               │   │
│                               └──────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tipos de Notificação

```
┌──────────────────────────────────────────────────────────────────┐
│  TIPOS DE NOTIFICAÇÃO - EMPRESA                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📥 NOVA CANDIDATURA (new_application)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  João Silva se candidatou para Desenvolvedor React Senior  │  │
│  │  ⭐ 94% match                                               │  │
│  │  → Vai para: Pipeline da vaga                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ✅ CONVITE ACEITO (invite_accepted)                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Maria Santos aceitou seu convite para Product Manager     │  │
│  │  → Vai para: Pipeline da vaga                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ❌ CONVITE RECUSADO (invite_declined)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Pedro Lima recusou seu convite para Tech Lead             │  │
│  │  → Vai para: Pipeline da vaga                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📅 ENTREVISTA CONFIRMADA (interview_confirmed)                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Ana Costa confirmou entrevista para 20/01 às 14:00        │  │
│  │  Vaga: UX Designer                                          │  │
│  │  → Vai para: Detalhes da entrevista                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📅 HORÁRIO SUGERIDO (interview_suggested)                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Carlos Souza sugeriu novos horários para entrevista       │  │
│  │  Vaga: Backend Developer                                    │  │
│  │  → Vai para: Entrevistas pendentes                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ❌ ENTREVISTA CANCELADA (interview_cancelled)                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Lucas Mendes cancelou a entrevista                        │  │
│  │  Motivo: Aceitou outra proposta                            │  │
│  │  → Vai para: Pipeline da vaga                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  💬 NOVA MENSAGEM (new_message)                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Fernanda Lima enviou uma mensagem                         │  │
│  │  "Olá, gostaria de saber mais sobre..."                    │  │
│  │  → Vai para: Conversa                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📊 TESTE CONCLUÍDO (test_completed)                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Roberto Alves concluiu o teste comportamental             │  │
│  │  Perfil DISC: Dominante (D)                                 │  │
│  │  → Vai para: Perfil do candidato                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ⚠️ VAGA EXPIRANDO (job_expiring)                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Sua vaga "Dev React Senior" expira em 3 dias              │  │
│  │  23 candidaturas recebidas                                  │  │
│  │  → Vai para: Editar vaga                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  🔴 VAGA EXPIRADA (job_expired)                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Sua vaga "Product Manager" expirou                        │  │
│  │  Total de candidaturas: 45                                  │  │
│  │  → Vai para: Renovar/encerrar vaga                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Página Completa de Notificações

```
┌──────────────────────────────────────────────────────────────────┐
│  🔔 Notificações                                                 │
│  Todas as suas notificações em um só lugar                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Todas]  [Candidaturas]  [Entrevistas]  [Mensagens]  [Vagas]   │
│  ══════                                                          │
│                                                                  │
│                                        [Marcar todas como lidas] │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  HOJE                                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔵 📥 Nova candidatura                          há 5 min   │  │
│  │                                                            │  │
│  │    João Silva se candidatou para Desenvolvedor React      │  │
│  │    Senior • ⭐ 94% match                                   │  │
│  │                                                            │  │
│  │    [Ver candidatura]                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔵 ✅ Convite aceito                            há 1 hora  │  │
│  │                                                            │  │
│  │    Maria Santos aceitou seu convite para Product Manager  │  │
│  │                                                            │  │
│  │    [Ver perfil]  [Agendar entrevista]                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  ONTEM                                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ 📊 Teste concluído                            há 1 dia   │  │
│  │                                                            │  │
│  │    Ana Costa concluiu o teste comportamental              │  │
│  │    Perfil DISC: Influente (I)                             │  │
│  │                                                            │  │
│  │    [Ver resultado DISC]                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  ESTA SEMANA                                                     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ ⚠️ Vaga expirando                              há 3 dias │  │
│  │                                                            │  │
│  │    Sua vaga "UX Designer" expira em 2 dias                │  │
│  │    18 candidaturas recebidas                              │  │
│  │                                                            │  │
│  │    [Renovar vaga]  [Ver candidaturas]                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [Carregar mais]                                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Menu Lateral (Empresa)

```
┌────────────────────────┐
│  📊 Dashboard          │
│  🏢 Perfil da Empresa  │
│  📋 Minhas Vagas       │
│  🔍 Banco de Talentos  │
│  ⭐ Candidatos Salvos  │
│  📥 Candidaturas       │
│  📅 Entrevistas        │
│  🔔 Notificações (5)   │  ← Opção no menu também
│  💬 Mensagens          │
│  ⚙️ Configurações      │
└────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Sino no header com badge de não lidas
- ✅ Dropdown com últimas 5 notificações
- ✅ 10 tipos de notificação específicos para empresa
- ✅ Página completa de notificações
- ✅ Filtros por tipo (Candidaturas, Entrevistas, Mensagens, Vagas)
- ✅ Agrupamento por data (Hoje, Ontem, Esta semana, etc)
- ✅ Marcar como lida ao clicar
- ✅ "Marcar todas como lidas"
- ✅ Ações contextuais por tipo
- ✅ Link para página relacionada

### Excluído

- ❌ Push notifications (navegador)
- ❌ Notificações por email
- ❌ Configuração de preferências de notificação
- ❌ Notificações em tempo real (WebSocket)
- ❌ Sons de notificação

---

## Requisitos Funcionais

### Sino e Badge

- **RF-001:** Ícone de sino no header da empresa
- **RF-002:** Badge vermelho com contador de não lidas
- **RF-003:** Badge desaparece quando todas lidas
- **RF-004:** Clicar no sino abre dropdown

### Dropdown

- **RF-005:** Exibir últimas 5 notificações
- **RF-006:** Ordenar por mais recente
- **RF-007:** Indicador visual: 🔵 não lida, ○ lida
- **RF-008:** Exibir ícone do tipo + título + preview
- **RF-009:** Exibir tempo relativo (há X minutos)
- **RF-010:** Botão "Marcar todas como lidas"
- **RF-011:** Link "Ver todas →" para página completa

### Tipos de Notificação

- **RF-012:** `new_application` - Nova candidatura recebida
- **RF-013:** `invite_accepted` - Candidato aceitou convite
- **RF-014:** `invite_declined` - Candidato recusou convite
- **RF-015:** `interview_confirmed` - Entrevista confirmada
- **RF-016:** `interview_suggested` - Candidato sugeriu horários
- **RF-017:** `interview_cancelled` - Entrevista cancelada
- **RF-018:** `new_message` - Nova mensagem recebida
- **RF-019:** `test_completed` - Candidato concluiu teste
- **RF-020:** `job_expiring` - Vaga prestes a expirar
- **RF-021:** `job_expired` - Vaga expirou

### Página Completa

- **RF-022:** Rota `/empresa/notificacoes`
- **RF-023:** Filtros por tipo
- **RF-024:** Agrupamento por data
- **RF-025:** Paginação (carregar mais)
- **RF-026:** Ações contextuais por tipo de notificação
- **RF-027:** Clicar na notificação marca como lida

### Comportamento de Leitura

- **RF-028:** Marcar como lida APENAS ao clicar na notificação
- **RF-029:** NÃO marcar como lida ao abrir dropdown
- **RF-030:** "Marcar todas como lidas" marca todas

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Badge atualiza em tempo real (polling a cada 30s)
- **RNF-002 (Performance):** Dropdown abre em menos de 200ms
- **RNF-003 (Persistência):** Estado de leitura persiste

---

## Critérios de Aceitação

### RF-001 a RF-004: Sino

```gherkin
DADO que a empresa tem 5 notificações não lidas
QUANDO ela visualiza o header
ENTÃO deve ver sino com badge "5"
  E ao clicar, deve abrir dropdown
```

### RF-012: Nova Candidatura

```gherkin
DADO que um candidato se candidatou a uma vaga
QUANDO a empresa abre as notificações
ENTÃO deve ver notificação "João se candidatou para..."
  E deve ver o match (ex: 94%)
  E ao clicar, deve ir para o pipeline da vaga
```

### RF-028 a RF-030: Leitura

```gherkin
DADO que há notificações não lidas
QUANDO a empresa apenas abre o dropdown
ENTÃO as notificações NÃO devem ser marcadas como lidas
  E ao clicar em uma notificação específica
ENTÃO apenas essa notificação deve ser marcada como lida
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Sino e dropdown | 2 |
| 2 | Tipos e conteúdo | 2 |
| 3 | Página completa | 2 |

### Detalhamento das Fases

#### Fase 1: Sino e Dropdown

**Objetivo:** Estrutura básica de notificações

**Ações:**
- [ ] Adicionar sino no header da empresa
- [ ] Implementar badge com contador
- [ ] Criar componente dropdown
- [ ] Implementar abertura/fechamento

**Validação:** Sino funciona com dropdown

#### Fase 2: Tipos e Conteúdo

**Objetivo:** 10 tipos de notificação

**Ações:**
- [ ] Criar modelo de dados
- [ ] Implementar renderização por tipo
- [ ] Criar dados mock para cada tipo
- [ ] Implementar ícones e cores

**Validação:** Todos os tipos renderizam corretamente

#### Fase 3: Página Completa

**Objetivo:** Página de notificações

**Ações:**
- [ ] Criar página `/empresa/notificacoes`
- [ ] Implementar filtros por tipo
- [ ] Implementar agrupamento por data
- [ ] Implementar ações contextuais
- [ ] Implementar "Marcar todas como lidas"

**Validação:** Página completa funciona

---

## Modelo de Dados

### CompanyNotificationType

```typescript
type CompanyNotificationType = 
  | 'new_application'
  | 'invite_accepted'
  | 'invite_declined'
  | 'interview_confirmed'
  | 'interview_suggested'
  | 'interview_cancelled'
  | 'new_message'
  | 'test_completed'
  | 'job_expiring'
  | 'job_expired';

interface CompanyNotification {
  id: string;
  type: CompanyNotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  actionUrl: string;
  metadata: {
    // Dados específicos por tipo
    candidateId?: string;
    candidateName?: string;
    candidatePhoto?: string;
    jobId?: string;
    jobTitle?: string;
    matchPercentage?: number;
    interviewDate?: string;
    discProfile?: string;
    messagePreview?: string;
    daysUntilExpiry?: number;
    totalApplications?: number;
    cancellationReason?: string;
  };
}
```

### Mapeamento de Ações

```typescript
const notificationActions: Record<CompanyNotificationType, string[]> = {
  new_application: ['Ver candidatura'],
  invite_accepted: ['Ver perfil', 'Agendar entrevista'],
  invite_declined: ['Ver perfil'],
  interview_confirmed: ['Ver detalhes'],
  interview_suggested: ['Responder'],
  interview_cancelled: ['Ver pipeline'],
  new_message: ['Ver conversa'],
  test_completed: ['Ver resultado DISC'],
  job_expiring: ['Renovar vaga', 'Ver candidaturas'],
  job_expired: ['Renovar', 'Encerrar'],
};
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-025 | Notificações (Candidato) | ✅ Implementado |
| PRD-015 | Pipeline de Candidaturas | ✅ Implementado |
| PRD-034 | Agendamento (Empresa) | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.32.0 → 0.33.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.33.0] - 2026-01-XX

### Added
- Sistema de notificações para empresas
- Sino com badge no header
- Dropdown com últimas 5 notificações
- 10 tipos de notificação (candidaturas, entrevistas, mensagens, vagas)
- Página completa de notificações
- Filtros por tipo e agrupamento por data
- Ações contextuais por tipo de notificação
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Componentes** | Reutilizar estrutura do PRD-025 (Candidato) |
| **Polling** | Verificar novas notificações a cada 30 segundos |
| **Icons** | Usar Lucide React para ícones dos tipos |
| **Tempo** | Usar date-fns para "há X minutos" |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Marcar como lida ao abrir dropdown |
| Notificações duplicadas |
| Perder estado de leitura ao navegar |
| Links que não funcionam nas ações |

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
