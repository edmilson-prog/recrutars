# PRD-017: Mensagens (Empresa)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar sistema de mensagens da perspectiva da empresa |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Reutiliza estrutura do PRD-010, adapta perspectiva |

---

## Contexto do Problema

A empresa precisa se comunicar com candidatos durante o processo seletivo. O sistema de mensagens permite comunicação contextualizada dentro da plataforma.

Este PRD é o espelho do PRD-010 (Mensagens Candidato), mas da perspectiva da empresa. A estrutura de dados é a mesma, apenas a interface e funcionalidades diferem.

---

## Conceito da Solução

### Layout Desktop

```
┌──────────────────────────────────────────────────────────────────┐
│                        Mensagens                                 │
├───────────────────────┬──────────────────────────────────────────┤
│                       │                                          │
│  🔍 Buscar candidato  │  João Silva - Dev React Sr               │
│  ─────────────────── │  ──────────────────────────────────────  │
│                       │                                          │
│  Filtrar: [Todas ▼]   │  ┌────────────────────────────────────┐  │
│                       │  │ João Silva           10/01 14:30   │  │
│  ┌─────────────────┐  │  │ Olá! Agradeço o contato. Tenho    │  │
│  │ 👤 João Silva   │  │  │ disponibilidade na terça ou       │  │
│  │ Dev React Sr    │  │  │ quarta à tarde.                   │  │
│  │ "Tenho disp..." │  │  └────────────────────────────────────┘  │
│  │ 10/01 • 🔵 1    │  │                                          │
│  └─────────────────┘  │  ┌────────────────────────────────────┐  │
│                       │  │ Maria (você)         10/01 15:00   │  │
│  ┌─────────────────┐  │  │ Perfeito! Vamos agendar para      │  │
│  │ 👤 Ana Costa    │  │  │ terça às 14h. Envio o link da     │  │
│  │ Product Manager │  │  │ videochamada em seguida.          │  │
│  │ "Obrigada pe..." │  │  └────────────────────────────────────┘  │
│  │ 08/01           │  │                                          │
│  └─────────────────┘  │  ┌────────────────────────────────────┐  │
│                       │  │ Digite sua mensagem...      [📎][➤]│  │
│                       │  └────────────────────────────────────┘  │
└───────────────────────┴──────────────────────────────────────────┘
```

### Diferenças do PRD-010 (Candidato)

| Aspecto | Candidato (PRD-010) | Empresa (PRD-017) |
|---------|---------------------|-------------------|
| Agrupa por | Empresa + Vaga | Candidato + Vaga |
| Pode iniciar conversa | Não | Sim |
| Filtros | Busca simples | Por vaga, status |
| Ações extras | - | Ir para candidatura |

---

## Escopo

### Incluído

- ✅ Lista de conversas (agrupadas por candidato + vaga)
- ✅ Visualização de mensagens de uma conversa
- ✅ Envio de nova mensagem
- ✅ Iniciar conversa com candidato (convite)
- ✅ Indicador de mensagens não lidas
- ✅ Filtro por vaga
- ✅ Busca por nome do candidato
- ✅ Link para ir à candidatura
- ✅ Estado vazio
- ✅ Layout responsivo

### Excluído

- ❌ Chat em tempo real
- ❌ Anexos de arquivos
- ❌ Templates de mensagem
- ❌ Mensagens automáticas
- ❌ Notificações push

---

## Requisitos Funcionais

### Lista de Conversas

- **RF-001:** Deve listar todas as conversas da empresa
- **RF-002:** Conversas agrupadas por candidato + vaga
- **RF-003:** Exibir foto, nome do candidato, título da vaga
- **RF-004:** Exibir preview da última mensagem
- **RF-005:** Indicar quantidade de não lidas
- **RF-006:** Ordenar por última mensagem

### Filtros

- **RF-007:** Filtrar por vaga (select)
- **RF-008:** Buscar por nome do candidato
- **RF-009:** Filtrar: Todas, Não lidas, Por vaga específica

### Visualização de Conversa

- **RF-010:** Exibir todas as mensagens da conversa
- **RF-011:** Mensagens ordenadas cronologicamente
- **RF-012:** Diferenciar visualmente mensagens da empresa vs candidato
- **RF-013:** Marcar como lidas ao abrir
- **RF-014:** Scroll automático para última mensagem

### Envio de Mensagem

- **RF-015:** Campo de texto para nova mensagem
- **RF-016:** Botão enviar (e Enter para enviar)
- **RF-017:** Validar mensagem não vazia
- **RF-018:** Atualizar conversa imediatamente

### Ações Extras

- **RF-019:** Link "Ver candidatura" que navega para gestão de candidaturas
- **RF-020:** Indicar vaga relacionada no header da conversa

### Estado Vazio

- **RF-021:** Se não houver conversas, exibir mensagem apropriada
- **RF-022:** Sugerir convidar candidatos do banco de talentos

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Mesmo padrão visual do PRD-010
- **RNF-002 (Responsividade):** Lista/detalhe em telas separadas no mobile
- **RNF-003 (Consistência):** Componentes reutilizados do PRD-010

---

## Critérios de Aceitação

### RF-001 a RF-006: Lista

```gherkin
DADO que a empresa tem conversas com candidatos
QUANDO ela acessa /empresa/mensagens
ENTÃO deve ver lista de conversas por candidato
  E ordenadas por última mensagem
  E com indicador de não lidas
```

### RF-007 a RF-009: Filtros

```gherkin
DADO que a empresa quer ver mensagens de uma vaga específica
QUANDO ela seleciona a vaga no filtro
ENTÃO deve ver apenas conversas relacionadas àquela vaga
```

### RF-019: Navegação

```gherkin
DADO que a empresa está em uma conversa
QUANDO ela clica em "Ver candidatura"
ENTÃO deve navegar para o drawer da candidatura
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e lista | 2 |
| 2 | Conversa e envio | 2 |
| 3 | Filtros e ações | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Lista

**Ações:**
- [ ] Criar página `/empresa/mensagens`
- [ ] Adaptar/reutilizar componentes do PRD-010
- [ ] Implementar lista de conversas
- [ ] Implementar indicadores

#### Fase 2: Conversa e Envio

**Ações:**
- [ ] Implementar visualização de conversa
- [ ] Implementar envio de mensagem
- [ ] Implementar marcação de lidas

#### Fase 3: Filtros e Ações

**Ações:**
- [ ] Implementar filtro por vaga
- [ ] Implementar busca por candidato
- [ ] Implementar link para candidatura
- [ ] Testar responsividade

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-010 | Mensagens (Candidato) | ⏳ Pendente |
| PRD-015 | Gestão de Candidaturas | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.16.0 → 0.17.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.17.0] - 2026-01-XX

### Added
- Sistema de mensagens da empresa
- Lista de conversas por candidato
- Filtro por vaga
- Busca por candidato
- Link para candidatura relacionada
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Componentes** | Reutilizar do PRD-010 quando possível |
| **Layout** | Mesmo padrão split view |
| **Filtros** | Select de vaga + input de busca |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Recriar componentes que existem no PRD-010 |
| Templates de mensagem |
| Automações |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 11/01/2026 |
| **Versão do App** | 0.17.0 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |
| 11/01/2026 | v2 | Implementação completa |

---

**AILA - Sistemas Inteligentes**
