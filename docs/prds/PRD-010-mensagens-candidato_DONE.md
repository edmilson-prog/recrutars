# PRD-010: Mensagens (Candidato)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar sistema de mensagens entre candidato e empresas |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 4-6 componentes, lista + detalhe, estado de conversa |

---

## Contexto do Problema

A comunicação entre candidato e empresa é essencial para o processo seletivo. Sem um canal interno, a comunicação depende de emails externos, perdendo contexto e rastreabilidade.

Atualmente:
- A página de mensagens existe mas está básica
- Não há visualização de conversas
- Não há como enviar novas mensagens
- Comunicação acontece fora da plataforma

O sistema de mensagens permite:
- Comunicação contextualizada dentro da plataforma
- Histórico de conversas por candidatura
- Agilidade no processo seletivo
- Base para notificações futuras

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────┐
│         Mensagens                   │
│                                     │
│  [Lista vazia ou básica]            │
│                                     │
└─────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌──────────────────────────────────────────────────────────────────┐
│                        Mensagens                                 │
├───────────────────────┬──────────────────────────────────────────┤
│                       │                                          │
│  🔍 Buscar conversa   │  TechCorp - Vaga: Dev React Sr           │
│  ─────────────────── │  ──────────────────────────────────────  │
│                       │                                          │
│  ┌─────────────────┐  │  ┌────────────────────────────────────┐  │
│  │ 🏢 TechCorp     │  │  │ Maria (RH)           10/01 14:30  │  │
│  │ Dev React Sr    │  │  │ Olá João! Gostamos do seu perfil  │  │
│  │ "Olá João!..."  │  │  │ e gostaríamos de agendar uma      │  │
│  │ 10/01 • 🔵 2    │  │  │ entrevista. Você tem              │  │
│  └─────────────────┘  │  │ disponibilidade na próxima...     │  │
│                       │  └────────────────────────────────────┘  │
│  ┌─────────────────┐  │                                          │
│  │ 🏢 StartupXYZ   │  │  ┌────────────────────────────────────┐  │
│  │ Product Manager │  │  │ João (você)          10/01 15:45  │  │
│  │ "Obrigado pe..." │  │  │ Olá Maria! Agradeço o contato.   │  │
│  │ 08/01           │  │  │ Tenho disponibilidade na terça    │  │
│  └─────────────────┘  │  │ ou quarta à tarde. Qual horário   │  │
│                       │  │ seria melhor?                      │  │
│  ┌─────────────────┐  │  └────────────────────────────────────┘  │
│  │ 🏢 BigCorp      │  │                                          │
│  │ Tech Lead       │  │  ┌────────────────────────────────────┐  │
│  │ "Parabéns!..."  │  │  │ Maria (RH)           10/01 16:00  │  │
│  │ 05/01           │  │  │ Perfeito! Vamos agendar para      │  │
│  └─────────────────┘  │  │ terça às 14h. Envio o link em     │  │
│                       │  │ seguida.                           │  │
│                       │  └────────────────────────────────────┘  │
│                       │                                          │
│                       │  ┌────────────────────────────────────┐  │
│                       │  │ Digite sua mensagem...      [📎][➤]│  │
│                       │  └────────────────────────────────────┘  │
│                       │                                          │
└───────────────────────┴──────────────────────────────────────────┘
```

### Layout Mobile

```
┌─────────────────────────────┐      ┌─────────────────────────────┐
│        Mensagens            │      │  ← TechCorp                 │
├─────────────────────────────┤      │  Dev React Sr               │
│                             │      ├─────────────────────────────┤
│ 🔍 Buscar conversa          │      │                             │
│ ─────────────────────────── │      │  Maria (RH)      14:30     │
│                             │      │  Olá João! Gostamos...     │
│ ┌─────────────────────────┐ │      │                             │
│ │ 🏢 TechCorp            →│ │      │  João (você)     15:45     │
│ │ Dev React Sr            │ │      │  Olá Maria! Agradeço...    │
│ │ 🔵 2 novas              │ │      │                             │
│ └─────────────────────────┘ │      │  Maria (RH)      16:00     │
│                             │      │  Perfeito! Vamos...        │
│ ┌─────────────────────────┐ │      │                             │
│ │ 🏢 StartupXYZ          →│ │      ├─────────────────────────────┤
│ │ Product Manager         │ │      │ Digite mensagem...    [➤] │
│ └─────────────────────────┘ │      └─────────────────────────────┘
│                             │
└─────────────────────────────┘
      Lista de Conversas              Conversa Selecionada
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Chat em tempo real | Complexidade de WebSocket desnecessária para MVP |
| Email integrado | Perde contexto da plataforma |
| Apenas notificações | Não permite diálogo |

---

## Escopo

### Incluído

- ✅ Lista de conversas (agrupadas por empresa/vaga)
- ✅ Visualização de mensagens de uma conversa
- ✅ Envio de nova mensagem
- ✅ Indicador de mensagens não lidas
- ✅ Busca de conversas
- ✅ Ordenação por última mensagem
- ✅ Estado vazio (sem conversas)
- ✅ Layout responsivo (lista/detalhe)

### Excluído

- ❌ Chat em tempo real (polling ou refresh manual)
- ❌ Anexos de arquivos
- ❌ Emojis/reações
- ❌ Mensagens de voz
- ❌ Videochamada
- ❌ Notificações push
- ❌ Iniciar conversa (apenas responder empresas)

---

## Requisitos Funcionais

### Lista de Conversas

- **RF-001:** Deve listar todas as conversas do candidato
- **RF-002:** Conversas devem ser agrupadas por empresa + vaga
- **RF-003:** Deve exibir preview da última mensagem
- **RF-004:** Deve exibir data/hora da última mensagem
- **RF-005:** Deve indicar quantidade de mensagens não lidas
- **RF-006:** Conversas com não lidas devem ter destaque visual
- **RF-007:** Deve ordenar por última mensagem (mais recente primeiro)
- **RF-008:** Deve permitir buscar conversas por nome da empresa ou vaga

### Visualização de Conversa

- **RF-009:** Ao clicar em uma conversa, deve exibir todas as mensagens
- **RF-010:** Mensagens devem ser ordenadas cronologicamente
- **RF-011:** Deve identificar remetente de cada mensagem
- **RF-012:** Mensagens do candidato devem ter estilo diferente (alinhamento/cor)
- **RF-013:** Deve exibir data/hora de cada mensagem
- **RF-014:** Ao abrir, mensagens não lidas devem ser marcadas como lidas

### Envio de Mensagem

- **RF-015:** Deve ter campo de texto para nova mensagem
- **RF-016:** Deve ter botão de enviar
- **RF-017:** Enviar com Enter (Shift+Enter para quebra de linha)
- **RF-018:** Mensagem enviada deve aparecer imediatamente na conversa
- **RF-019:** Campo deve ser limpo após envio
- **RF-020:** Deve validar mensagem não vazia

### Estado Vazio

- **RF-021:** Se não houver conversas, exibir mensagem apropriada
- **RF-022:** Sugerir que mensagens aparecem quando empresas entram em contato

### Navegação

- **RF-023:** Em mobile, lista e detalhe devem ser telas separadas
- **RF-024:** Em desktop, lado a lado (split view)
- **RF-025:** Botão voltar em mobile deve retornar à lista

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Scroll automático para última mensagem ao abrir conversa
- **RNF-002 (Performance):** Carregar últimas 50 mensagens por conversa
- **RNF-003 (Responsividade):** Breakpoint em 768px para mudar layout
- **RNF-004 (Acessibilidade):** Mensagens devem ser navegáveis por teclado

---

## Critérios de Aceitação

### RF-001 a RF-008: Lista de Conversas

```gherkin
DADO que o candidato tem conversas com empresas
QUANDO ele acessa /candidato/mensagens
ENTÃO deve ver lista de conversas
  E ordenadas por última mensagem
  E com preview da última mensagem
  E com indicador de não lidas (se houver)
```

```gherkin
DADO que o candidato busca por "Tech"
QUANDO ele digita no campo de busca
ENTÃO deve filtrar conversas que contenham "Tech" no nome da empresa ou vaga
```

### RF-009 a RF-014: Visualização

```gherkin
DADO que o candidato clica em uma conversa
QUANDO a conversa abre
ENTÃO deve ver todas as mensagens ordenadas
  E mensagens do candidato à direita/cor diferente
  E mensagens da empresa à esquerda
  E deve rolar para última mensagem
```

### RF-015 a RF-020: Envio

```gherkin
DADO que o candidato está em uma conversa
QUANDO ele digita uma mensagem e clica em enviar
ENTÃO a mensagem deve aparecer na conversa
  E o campo de texto deve ser limpo
  E a conversa deve rolar para a nova mensagem
```

### RF-021/RF-022: Estado Vazio

```gherkin
DADO que o candidato não tem conversas
QUANDO ele acessa /candidato/mensagens
ENTÃO deve ver "Você ainda não tem mensagens"
  E deve ver "As empresas entrarão em contato quando houver interesse"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e dados | 2 |
| 2 | Lista de conversas | 3 |
| 3 | Visualização de conversa | 3 |
| 4 | Envio e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Dados

**Objetivo:** Preparar estrutura de dados para mensagens

**Ações:**
- [ ] Verificar/criar tipos para Message e Conversation
- [ ] Estruturar mock de mensagens
- [ ] Agrupar mensagens por conversa (empresa + vaga)

**Validação:** Dados estruturados e agrupados

#### Fase 2: Lista de Conversas

**Objetivo:** Implementar lista lateral de conversas

**Ações:**
- [ ] Criar componente `ConversationList`
- [ ] Criar componente `ConversationItem`
- [ ] Implementar indicador de não lidas
- [ ] Implementar busca
- [ ] Implementar ordenação

**Validação:** Lista exibe conversas corretamente

#### Fase 3: Visualização de Conversa

**Objetivo:** Implementar área de mensagens

**Ações:**
- [ ] Criar componente `MessageList`
- [ ] Criar componente `MessageBubble`
- [ ] Implementar diferenciação visual por remetente
- [ ] Implementar scroll automático
- [ ] Implementar marcação de lidas

**Validação:** Mensagens são exibidas corretamente

#### Fase 4: Envio e Refinamentos

**Objetivo:** Implementar envio e polir UX

**Ações:**
- [ ] Criar componente `MessageInput`
- [ ] Implementar envio de mensagem
- [ ] Implementar layout responsivo
- [ ] Testar em mobile
- [ ] Implementar estado vazio

**Validação:** Envio funciona, layout responsivo

---

## Modelo de Dados

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "candidato" | "empresa";
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  candidateId: string;
  companyId: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-007 | Candidatura a Vagas | ⏳ Pendente |

> **Nota:** Conversas existem no contexto de candidaturas.

### PRDs Relacionados

| PRD | Descrição |
|-----|-----------|
| PRD-017 | Mensagens (Empresa) - mesma estrutura, outra perspectiva |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.9.0 → 0.10.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.10.0] - 2026-01-XX

### Added
- Sistema de mensagens do candidato
- Lista de conversas com preview e indicador de não lidas
- Visualização de conversa com histórico de mensagens
- Envio de novas mensagens
- Busca de conversas
- Layout responsivo (lista/detalhe)
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Layout** | Split view em desktop, telas separadas em mobile |
| **Mensagens** | Bubble style, candidato à direita, empresa à esquerda |
| **Scroll** | ScrollIntoView para última mensagem |
| **Não lidas** | Badge numérico no item da lista |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| WebSocket ou polling (refresh manual OK) |
| Upload de arquivos |
| Iniciar conversa (apenas responder) |
| Notificações push |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Observações** | Depende de PRD-004, PRD-007 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
