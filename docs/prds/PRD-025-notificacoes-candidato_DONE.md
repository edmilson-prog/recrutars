# PRD-025: Notificações (Candidato)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar sistema de notificações com sino no header |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Componente no header, dropdown, tipos de notificação, estados |

---

## Contexto do Problema

O candidato precisa ser informado sobre eventos importantes: novas vagas compatíveis, mudanças no status de candidaturas, mensagens de empresas, solicitações de teste. Atualmente não há um sistema centralizado de alertas.

### Benefícios

- Candidato fica informado em tempo real
- Não perde oportunidades importantes
- Engajamento com a plataforma
- Feedback sobre candidaturas

---

## Conceito da Solução

### Sino no Header

```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 RecrutaRS          🔍 Buscar...           🔔 ●3    👤 João ▼│
└──────────────────────────────────────────────────────────────────┘
                                                 ↑
                                          Badge com contador
```

### Dropdown de Notificações

```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 RecrutaRS          🔍 Buscar...           🔔 ●3    👤 João ▼│
└──────────────────────────────────────────────────────────────────┘
                                                │
                        ┌───────────────────────▼───────────────────┐
                        │  Notificações                             │
                        │  ─────────────────────────────────────── │
                        │                                          │
                        │  🔵 Nova vaga compatível                 │
                        │  "Dev React Senior" na TechCorp          │
                        │  85% match • há 2 horas                  │
                        │                                          │
                        │  ─────────────────────────────────────── │
                        │                                          │
                        │  🔵 Candidatura atualizada               │
                        │  Você avançou para "Entrevista"          │
                        │  Product Manager - StartupXYZ • há 1 dia │
                        │                                          │
                        │  ─────────────────────────────────────── │
                        │                                          │
                        │  🔵 Teste solicitado                     │
                        │  TechCorp solicita teste comportamental  │
                        │  Prazo: 7 dias • há 3 dias               │
                        │                                          │
                        │  ─────────────────────────────────────── │
                        │                                          │
                        │  ○ Mensagem de BigCorp                   │
                        │  "Obrigado pelo interesse..."            │
                        │  há 5 dias                               │
                        │                                          │
                        │  ─────────────────────────────────────── │
                        │                                          │
                        │  [Marcar todas como lidas]               │
                        │  [Ver todas as notificações →]           │
                        │                                          │
                        └──────────────────────────────────────────┘
```

### Tipos de Notificação

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  💼 NOVA VAGA COMPATÍVEL                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔵 Nova vaga compatível                                     ││
│  │    "Desenvolvedor React Senior" na TechCorp                 ││
│  │    ⭐ 85% match • Publicada há 2 horas                      ││
│  │    [Ver vaga]                                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  📋 CANDIDATURA ATUALIZADA                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔵 Candidatura atualizada                                   ││
│  │    Você avançou para a etapa "Entrevista"                   ││
│  │    Product Manager - StartupXYZ • há 1 dia                  ││
│  │    [Ver candidatura]                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  📊 TESTE SOLICITADO                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔵 Teste comportamental solicitado                          ││
│  │    TechCorp solicita que você realize o teste               ││
│  │    ⏰ Prazo: 7 dias • Solicitado há 3 dias                  ││
│  │    [Realizar teste]                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  💬 NOVA MENSAGEM                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔵 Nova mensagem                                            ││
│  │    BigCorp enviou uma mensagem                              ││
│  │    "Gostaríamos de agendar uma entrevista..."               ││
│  │    há 5 horas                                               ││
│  │    [Ver mensagem]                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ✅ CANDIDATURA APROVADA                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🎉 Parabéns! Você foi aprovado!                             ││
│  │    Sua candidatura para "Dev React" foi aprovada            ││
│  │    TechCorp • há 1 hora                                     ││
│  │    [Ver detalhes]                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ❌ CANDIDATURA REPROVADA                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Processo encerrado                                          ││
│  │    Sua candidatura para "PM" não avançou                    ││
│  │    StartupXYZ • há 2 dias                                   ││
│  │    [Ver feedback]                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Página de Todas as Notificações

```
┌──────────────────────────────────────────────────────────────────┐
│  🔔 Notificações                                                 │
│  Todas as suas notificações e alertas                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filtrar: [Todas ▼]    [Marcar todas como lidas]                │
│                                                                  │
│  ── Hoje ──                                                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔵 💼 Nova vaga compatível                        14:30    │  │
│  │    "Desenvolvedor React Senior" na TechCorp                │  │
│  │    ⭐ 85% match                                             │  │
│  │    [Ver vaga]                                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔵 💬 Nova mensagem                               10:15    │  │
│  │    BigCorp enviou uma mensagem                             │  │
│  │    "Gostaríamos de agendar..."                             │  │
│  │    [Ver mensagem]                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ── Ontem ──                                                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ 📋 Candidatura atualizada                       16:45    │  │
│  │    Você avançou para a etapa "Entrevista"                  │  │
│  │    Product Manager - StartupXYZ                            │  │
│  │    [Ver candidatura]                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ── Esta semana ──                                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ○ 📊 Teste solicitado                             12/01    │  │
│  │    TechCorp solicita teste comportamental                  │  │
│  │    ⚠️ Prazo: restam 4 dias                                 │  │
│  │    [Realizar teste]                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│               [Carregar mais notificações]                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Estado Vazio

```
┌──────────────────────────────────────────────────────────────────┐
│  🔔 Notificações                                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                         🔔                                       │
│                                                                  │
│              Você não tem notificações ainda                     │
│                                                                  │
│     Quando houver novidades sobre vagas, candidaturas           │
│        ou mensagens, você será notificado aqui.                  │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Ícone de sino no header
- ✅ Badge com contador de não lidas
- ✅ Dropdown com últimas notificações (5)
- ✅ Marcar como lida (individual e todas)
- ✅ Tipos: vaga compatível, candidatura atualizada, teste solicitado, mensagem, aprovação, reprovação
- ✅ Página completa de notificações
- ✅ Filtro por tipo na página
- ✅ Agrupamento por data
- ✅ Ação contextual por tipo (link para destino)
- ✅ Estado vazio

### Excluído

- ❌ Push notifications (navegador)
- ❌ Notificações por email
- ❌ Configurar quais tipos receber
- ❌ Sons de notificação
- ❌ Notificações em tempo real (WebSocket)

---

## Requisitos Funcionais

### Sino no Header

- **RF-001:** Ícone de sino sempre visível no header
- **RF-002:** Badge numérico com contagem de não lidas
- **RF-003:** Badge oculto se não há notificações não lidas
- **RF-004:** Ao clicar, abre dropdown

### Dropdown

- **RF-005:** Exibir últimas 5 notificações
- **RF-006:** Indicar visualmente se lida (○) ou não lida (🔵)
- **RF-007:** Ao clicar na notificação, marcar como lida e navegar
- **RF-008:** Botão "Marcar todas como lidas"
- **RF-009:** Link "Ver todas as notificações"
- **RF-010:** Fechar ao clicar fora

### Tipos de Notificação

- **RF-011:** `job_match` - Nova vaga compatível com perfil
- **RF-012:** `application_update` - Mudança de status na candidatura
- **RF-013:** `test_request` - Empresa solicita teste
- **RF-014:** `message` - Nova mensagem de empresa
- **RF-015:** `application_approved` - Candidatura aprovada
- **RF-016:** `application_rejected` - Candidatura reprovada

### Conteúdo por Tipo

| Tipo | Título | Descrição | Ação |
|------|--------|-----------|------|
| job_match | "Nova vaga compatível" | Título da vaga + empresa + match | Ver vaga |
| application_update | "Candidatura atualizada" | Nova etapa + vaga + empresa | Ver candidatura |
| test_request | "Teste solicitado" | Empresa + prazo | Realizar teste |
| message | "Nova mensagem" | Empresa + preview | Ver mensagem |
| application_approved | "Parabéns! Você foi aprovado!" | Vaga + empresa | Ver detalhes |
| application_rejected | "Processo encerrado" | Vaga + empresa | Ver feedback |

### Página Completa

- **RF-017:** Rota `/candidato/notificacoes`
- **RF-018:** Listar todas as notificações
- **RF-019:** Filtrar por tipo (Todas, Vagas, Candidaturas, Mensagens, Testes)
- **RF-020:** Agrupar por data (Hoje, Ontem, Esta semana, Este mês, Anteriores)
- **RF-021:** Paginação ou "Carregar mais"
- **RF-022:** Marcar todas como lidas

### Estados

- **RF-023:** Notificação não lida: destaque visual (fundo ou ícone)
- **RF-024:** Ao abrir dropdown, NÃO marcar automaticamente como lidas
- **RF-025:** Marcar como lida apenas ao clicar na notificação ou em "marcar todas"

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Dropdown abre em menos de 100ms
- **RNF-002 (UX):** Transição suave ao abrir/fechar dropdown
- **RNF-003 (Persistência):** Estado de lido/não lido persiste
- **RNF-004 (Acessibilidade):** Sino acessível via teclado

---

## Critérios de Aceitação

### RF-001 a RF-004: Sino

```gherkin
DADO que o candidato tem 3 notificações não lidas
QUANDO ele visualiza o header
ENTÃO deve ver o ícone de sino
  E deve ver badge com número "3"
  E ao clicar, deve abrir dropdown
```

### RF-005 a RF-010: Dropdown

```gherkin
DADO que o dropdown está aberto
QUANDO o candidato visualiza as notificações
ENTÃO deve ver as últimas 5 notificações
  E deve diferenciar lidas de não lidas
  E ao clicar em uma, deve navegar para o destino
  E ao clicar fora, deve fechar
```

### RF-011 a RF-016: Tipos

```gherkin
DADO que uma empresa solicitou teste comportamental
QUANDO a notificação é criada
ENTÃO deve ser do tipo "test_request"
  E deve mostrar nome da empresa e prazo
  E ao clicar, deve ir para página de testes
```

### RF-023 a RF-025: Estados

```gherkin
DADO que há notificações não lidas
QUANDO o candidato abre o dropdown
ENTÃO as notificações NÃO devem ser marcadas como lidas automaticamente
  E ao clicar em uma específica, apenas ela deve ser marcada como lida
  E ao clicar "Marcar todas", todas devem ser marcadas
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Sino e dropdown | 3 |
| 2 | Tipos e conteúdo | 2 |
| 3 | Página completa | 2 |

### Detalhamento das Fases

#### Fase 1: Sino e Dropdown

**Objetivo:** Componente no header com dropdown básico

**Ações:**
- [ ] Criar componente `NotificationBell`
- [ ] Criar componente `NotificationDropdown`
- [ ] Integrar no header
- [ ] Implementar badge de contador
- [ ] Implementar abrir/fechar dropdown

**Validação:** Sino aparece, dropdown abre e fecha

#### Fase 2: Tipos e Conteúdo

**Objetivo:** Diferentes tipos de notificação

**Ações:**
- [ ] Criar tipos TypeScript para notificações
- [ ] Criar componente `NotificationItem`
- [ ] Implementar renderização por tipo
- [ ] Implementar ações (marcar lida, navegar)
- [ ] Criar dados mock de notificações

**Validação:** Cada tipo renderiza corretamente

#### Fase 3: Página Completa

**Objetivo:** Página de todas as notificações

**Ações:**
- [ ] Criar página `/candidato/notificacoes`
- [ ] Implementar filtros por tipo
- [ ] Implementar agrupamento por data
- [ ] Implementar "carregar mais"
- [ ] Implementar estado vazio

**Validação:** Página lista e filtra corretamente

---

## Modelo de Dados

### Notification

```typescript
type NotificationType = 
  | 'job_match'
  | 'application_update'
  | 'test_request'
  | 'message'
  | 'application_approved'
  | 'application_rejected';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: string; // ISO date
  actionUrl: string; // onde navegar ao clicar
  metadata: {
    jobId?: string;
    jobTitle?: string;
    companyId?: string;
    companyName?: string;
    applicationId?: string;
    newStage?: string;
    testDeadline?: string;
    matchPercentage?: number;
  };
}
```

### Exemplo de Dados Mock

```typescript
const notifications: Notification[] = [
  {
    id: "notif-001",
    type: "job_match",
    title: "Nova vaga compatível",
    description: '"Dev React Senior" na TechCorp',
    read: false,
    createdAt: "2026-01-15T14:30:00Z",
    actionUrl: "/candidato/vagas/job-001",
    metadata: {
      jobId: "job-001",
      jobTitle: "Desenvolvedor React Senior",
      companyName: "TechCorp",
      matchPercentage: 85
    }
  },
  {
    id: "notif-002",
    type: "application_update",
    title: "Candidatura atualizada",
    description: 'Você avançou para "Entrevista"',
    read: false,
    createdAt: "2026-01-14T16:45:00Z",
    actionUrl: "/candidato/candidaturas/app-001",
    metadata: {
      applicationId: "app-001",
      jobTitle: "Product Manager",
      companyName: "StartupXYZ",
      newStage: "Entrevista"
    }
  }
];
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-003 | Header e Footer | ✅ Implementado |
| PRD-009 | Minhas Candidaturas | ✅ Implementado |
| PRD-010 | Mensagens (Candidato) | ✅ Implementado |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.24.0 → 0.25.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.25.0] - 2026-01-XX

### Added
- Sistema de notificações no header
- Ícone de sino com badge de contador
- Dropdown com últimas notificações
- Tipos: vaga compatível, candidatura, teste, mensagem, aprovação, reprovação
- Página completa de notificações
- Filtros por tipo e agrupamento por data
- Marcar como lida (individual e todas)
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Dropdown** | Usar Popover do shadcn/ui ou implementar próprio |
| **Badge** | Esconder se contador = 0 |
| **Posição** | Dropdown alinhado à direita do sino |
| **Z-index** | Garantir que dropdown fica acima de tudo |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Marcar como lida ao apenas abrir dropdown |
| Dropdown que ultrapassa a tela |
| Notificações sem ação (todas devem navegar) |
| Perder estado ao recarregar (usar localStorage) |

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
