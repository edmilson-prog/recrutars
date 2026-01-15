# PRD-016: Envio de Testes

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar solicitação de teste comportamental para candidatos |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 3-4 componentes, integração com teste existente, notificação |

---

## Contexto do Problema

Nem todos os candidatos realizam o teste comportamental espontaneamente. A empresa precisa poder solicitar que candidatos específicos realizem o teste para avaliação de fit cultural.

Atualmente:
- Candidato pode fazer teste por conta própria
- Empresa não consegue solicitar teste
- Não há como acompanhar quem fez ou não
- Processo de avaliação comportamental é passivo

O envio de testes permite:
- Empresa solicitar teste a candidatos específicos
- Acompanhar status (pendente, realizado)
- Avaliar fit cultural de forma proativa
- Comparar perfis comportamentais

---

## Conceito da Solução

### Solicitação de Teste (no contexto de candidatura)

```
┌──────────────────────────────────────────────────────────────────┐
│  João Silva - Candidatura                                [✕]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 Teste Comportamental: ❌ Não realizado                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Este candidato ainda não realizou o teste comportamental.  │ │
│  │                                                             │ │
│  │  O teste ajuda a avaliar o fit cultural e comportamental    │ │
│  │  do candidato com sua empresa e a vaga.                     │ │
│  │                                                             │ │
│  │                  [Solicitar Teste]                          │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal de Solicitação

```
┌──────────────────────────────────────────────────────────────────┐
│               Solicitar Teste Comportamental                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Candidato: João Silva                                           │
│  Vaga: Desenvolvedor React Senior                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Mensagem para o candidato:                                  │ │
│  │                                                             │ │
│  │ [Olá João! Para darmos continuidade ao processo seletivo,  ]│ │
│  │ [gostaríamos que você realizasse nosso teste comportamental]│ │
│  │ [Gauge-Pro. O teste leva cerca de 15-20 minutos.          ]│ │
│  │                                                             │ │
│  │                                               120/500 car   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [ ] Definir prazo para realização                               │
│      Prazo: [7 dias ▼]                                          │
│                                                                  │
│                              [Cancelar]  [Enviar Solicitação]   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Visão do Candidato (Notificação)

```
┌──────────────────────────────────────────────────────────────────┐
│                        Mensagens                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🏢 TechCorp - Dev React Senior                    🔵 Nova  │ │
│  │                                                             │ │
│  │ A empresa TechCorp solicitou que você realize o teste      │ │
│  │ comportamental Gauge-Pro para a vaga de Dev React Senior.  │ │
│  │                                                             │ │
│  │ Mensagem: "Olá João! Para darmos continuidade..."          │ │
│  │                                                             │ │
│  │ ⏰ Prazo: até 18/01/2026                                    │ │
│  │                                                             │ │
│  │              [Realizar Teste Agora]  [Ver Vaga]            │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Status na Gestão de Candidaturas

```
┌────────────────────────────────────────────────────────────────┐
│ 👤 João Silva                                                  │
│ ⭐ 85% match  |  📊 Teste: ⏳ Solicitado (aguardando)          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 👤 Maria Santos                                                │
│ ⭐ 78% match  |  📊 Teste: ✅ Realizado                        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 👤 Pedro Lima                                                  │
│ ⭐ 72% match  |  📊 Teste: ❌ Não solicitado                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Botão "Solicitar Teste" no drawer de candidatura
- ✅ Modal de solicitação com mensagem personalizável
- ✅ Prazo opcional para realização
- ✅ Notificação para candidato via Mensagens
- ✅ Status do teste na candidatura (não solicitado, solicitado, realizado)
- ✅ Link direto para realizar teste na notificação
- ✅ Indicador visual no card de candidatura

### Excluído

- ❌ Envio de email (apenas mensagem na plataforma)
- ❌ Lembretes automáticos
- ❌ Bloqueio de candidatura se não fizer teste
- ❌ Múltiplos tipos de teste
- ❌ Teste técnico/prático (apenas comportamental)

---

## Requisitos Funcionais

### Solicitação (Empresa)

- **RF-001:** No drawer de candidatura, se teste não realizado, exibir botão "Solicitar Teste"
- **RF-002:** Ao clicar, abrir modal de solicitação
- **RF-003:** Modal deve ter campo de mensagem com texto padrão editável
- **RF-004:** Modal deve ter opção de prazo (3, 5, 7, 14 dias ou sem prazo)
- **RF-005:** Ao confirmar, deve criar mensagem para candidato
- **RF-006:** Deve atualizar status do teste para "solicitado"
- **RF-007:** Deve exibir toast "Solicitação enviada"

### Status do Teste

- **RF-008:** Status possíveis: "não_solicitado", "solicitado", "realizado"
- **RF-009:** Card de candidatura deve exibir status com ícone
- **RF-010:** Drawer deve exibir status detalhado (data da solicitação, prazo)
- **RF-011:** Se "solicitado", exibir há quanto tempo foi solicitado
- **RF-012:** Se "realizado", exibir link para ver resultado

### Notificação (Candidato)

- **RF-013:** Candidato deve receber mensagem especial de solicitação de teste
- **RF-014:** Mensagem deve conter: empresa, vaga, mensagem personalizada, prazo
- **RF-015:** Deve ter botão "Realizar Teste Agora" que leva para /candidato/testes
- **RF-016:** Deve ter botão "Ver Vaga" que leva para detalhes da vaga

### Fluxo Completo

- **RF-017:** Quando candidato realizar teste, status deve atualizar para "realizado"
- **RF-018:** Empresa deve ver resultado do teste na tab "Teste" do drawer

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Fluxo de solicitação deve ser simples (2 cliques)
- **RNF-002 (Feedback):** Status deve ser atualizado em tempo real (refresh)
- **RNF-003 (Clareza):** Mensagem padrão deve ser profissional e clara

---

## Critérios de Aceitação

### RF-001 a RF-007: Solicitação

```gherkin
DADO que a empresa está vendo um candidato que não fez o teste
QUANDO ela clica em "Solicitar Teste"
ENTÃO deve abrir modal com mensagem padrão
  E pode editar a mensagem
  E pode definir prazo
  E ao confirmar, deve enviar mensagem ao candidato
  E status deve mudar para "solicitado"
```

### RF-013 a RF-016: Notificação

```gherkin
DADO que a empresa solicitou teste a um candidato
QUANDO o candidato acessa suas mensagens
ENTÃO deve ver notificação de solicitação de teste
  E deve ver empresa, vaga e prazo
  E deve ter botão "Realizar Teste Agora"
  E ao clicar, deve ir para página de teste
```

### RF-017/RF-018: Conclusão

```gherkin
DADO que o candidato realizou o teste após solicitação
QUANDO a empresa visualiza a candidatura
ENTÃO deve ver status "Realizado"
  E deve poder ver resultado na tab "Teste"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modal de solicitação | 2 |
| 2 | Status e indicadores | 2 |
| 3 | Notificação do candidato | 2 |

### Detalhamento das Fases

#### Fase 1: Modal de Solicitação

**Ações:**
- [ ] Criar componente `RequestTestModal`
- [ ] Implementar campos de mensagem e prazo
- [ ] Integrar no drawer de candidatura
- [ ] Implementar envio de solicitação (mock)

#### Fase 2: Status e Indicadores

**Ações:**
- [ ] Adicionar campo `testStatus` na candidatura
- [ ] Atualizar `ApplicationCard` com indicador
- [ ] Atualizar drawer com status detalhado
- [ ] Implementar lógica de atualização de status

#### Fase 3: Notificação do Candidato

**Ações:**
- [ ] Criar tipo especial de mensagem "solicitacao_teste"
- [ ] Criar componente de exibição da notificação
- [ ] Implementar botões de ação
- [ ] Testar fluxo completo

---

## Modelo de Dados

### Extensão de Application

```typescript
interface Application {
  // ... campos existentes
  testStatus: TestRequestStatus;
  testRequestedAt?: string;
  testDeadline?: string;
}

type TestRequestStatus = "nao_solicitado" | "solicitado" | "realizado";
```

### Mensagem de Solicitação

```typescript
interface TestRequestMessage extends Message {
  type: "solicitacao_teste";
  metadata: {
    jobId: string;
    jobTitle: string;
    deadline?: string;
  };
}
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-008 | Teste Comportamental | ⏳ Pendente |
| PRD-010 | Mensagens (Candidato) | ⏳ Pendente |
| PRD-015 | Gestão de Candidaturas | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.15.0 → 0.16.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.16.0] - 2026-01-XX

### Added
- Solicitação de teste comportamental pela empresa
- Modal com mensagem personalizável e prazo
- Status do teste na candidatura (não solicitado, solicitado, realizado)
- Notificação especial para candidato
- Botão direto para realizar teste
- Indicadores visuais no card de candidatura
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Modal** | Usar Dialog do shadcn/ui |
| **Prazo** | Select com opções pré-definidas |
| **Status** | Badge colorido no card |
| **Mensagem** | Tipo especial com metadata |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Envio de email real |
| Lembretes automáticos |
| Bloqueio de candidatura |
| Múltiplos tipos de teste |

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
