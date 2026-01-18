# PRD-013: CRUD de Vagas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar gestão completa de vagas pela empresa (criar, editar, listar, arquivar) |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 6+ componentes, formulário complexo, múltiplos estados, validações |

---

## Contexto do Problema

A empresa precisa gerenciar suas vagas de emprego de forma autônoma. Publicar, editar e encerrar vagas são ações fundamentais para o processo de recrutamento.

Atualmente:
- A área de vagas da empresa existe mas está limitada
- Não há como criar novas vagas
- Não há como editar vagas existentes
- Não há gestão de status (ativa, pausada, encerrada)

O CRUD de vagas permite:
- Autonomia da empresa na gestão de vagas
- Publicação rápida de oportunidades
- Edição e atualização de informações
- Controle do ciclo de vida da vaga

---

## Conceito da Solução

### Listagem de Vagas

```
┌──────────────────────────────────────────────────────────────────┐
│                    Minhas Vagas                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ Nova Vaga]                                                   │
│                                                                  │
│  Filtrar: [Todas ▼] [Ativas] [Pausadas] [Encerradas]            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 💼 Desenvolvedor React Senior                    🟢 Ativa  │  │
│  │ CLT | São Paulo, SP | R$ 12.000 - R$ 18.000                │  │
│  │ 45 candidatos | Criada em 05/01/2026                       │  │
│  │                                                            │  │
│  │ [👁️ Ver] [✏️ Editar] [⏸️ Pausar] [📋 Duplicar]            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 💼 Product Manager                              🟡 Pausada  │  │
│  │ PJ | Remoto | R$ 15.000 - R$ 20.000                        │  │
│  │ 32 candidatos | Criada em 03/01/2026                       │  │
│  │                                                            │  │
│  │ [👁️ Ver] [✏️ Editar] [▶️ Reativar] [🗑️ Encerrar]          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 💼 UX Designer                                 ⚫ Encerrada │  │
│  │ CLT | Rio de Janeiro, RJ | R$ 8.000 - R$ 12.000            │  │
│  │ 28 candidatos | Encerrada em 10/01/2026                    │  │
│  │                                                            │  │
│  │ [👁️ Ver] [📋 Duplicar] [🗑️ Excluir]                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Formulário de Nova Vaga / Editar

```
┌──────────────────────────────────────────────────────────────────┐
│                    Nova Vaga                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Informações Básicas                                        │  │
│  │                                                            │  │
│  │ Título da Vaga *                                           │  │
│  │ [Desenvolvedor React Senior                           ]    │  │
│  │                                                            │  │
│  │ Tipo de Contrato *           Modalidade *                  │  │
│  │ [CLT              ▼]         [Presencial        ▼]         │  │
│  │                                                            │  │
│  │ Localização *                                              │  │
│  │ [São Paulo, SP                                        ]    │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Remuneração                                                │  │
│  │                                                            │  │
│  │ Faixa Salarial                                             │  │
│  │ De: [R$ 12.000    ]  Até: [R$ 18.000    ]                 │  │
│  │                                                            │  │
│  │ [ ] Salário a combinar                                     │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Descrição da Vaga *                                        │  │
│  │                                                            │  │
│  │ [                                                      ]   │  │
│  │ [  Descreva as responsabilidades e o dia-a-dia...     ]   │  │
│  │ [                                                      ]   │  │
│  │                                              500/2000 car  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Requisitos *                                               │  │
│  │                                                            │  │
│  │ [                                                      ]   │  │
│  │ [  Liste os requisitos obrigatórios e desejáveis...   ]   │  │
│  │ [                                                      ]   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Benefícios                                                 │  │
│  │                                                            │  │
│  │ [✓] Vale Refeição    [✓] Plano de Saúde   [ ] Vale Transp │  │
│  │ [ ] Home Office      [✓] PLR              [ ] Gym Pass    │  │
│  │                                                            │  │
│  │ Outros: [Horário flexível, ambiente descontraído     ]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Skills Desejadas                                           │  │
│  │                                                            │  │
│  │ [React] [TypeScript] [Node.js] [+ Adicionar]              │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                              [Cancelar]  [Salvar como Rascunho]  │
│                                          [Publicar Vaga]         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Listagem de vagas da empresa com filtros por status
- ✅ Criação de nova vaga com formulário completo
- ✅ Edição de vaga existente
- ✅ Visualização de detalhes da vaga
- ✅ Alteração de status (ativa, pausada, encerrada)
- ✅ Duplicar vaga existente
- ✅ Excluir vaga encerrada
- ✅ Validação de campos obrigatórios
- ✅ Contador de caracteres em campos de texto
- ✅ Seleção de benefícios comuns (checkboxes)
- ✅ Gestão de skills desejadas (tags)

### Excluído

- ❌ Rascunhos salvos automaticamente
- ❌ Agendamento de publicação
- ❌ Templates de vagas
- ❌ Integração com job boards externos
- ❌ Análise de mercado/salários
- ❌ Perguntas customizadas para candidatos

---

## Requisitos Funcionais

### Listagem

- **RF-001:** Deve listar todas as vagas da empresa logada
- **RF-002:** Deve permitir filtrar por status (todas, ativas, pausadas, encerradas)
- **RF-003:** Cada card deve exibir: título, tipo, localização, salário, quantidade de candidatos, status
- **RF-004:** Deve exibir data de criação ou encerramento
- **RF-005:** Deve ter ações contextuais por status
- **RF-006:** Deve ter botão "Nova Vaga" no topo

### Criação de Vaga

- **RF-007:** Formulário deve ter campos: título, tipo de contrato, modalidade, localização
- **RF-008:** Deve ter campos de faixa salarial (min/max) ou checkbox "a combinar"
- **RF-009:** Deve ter campo de descrição com limite de caracteres (2000)
- **RF-010:** Deve ter campo de requisitos com limite de caracteres (1500)
- **RF-011:** Deve ter checkboxes de benefícios comuns
- **RF-012:** Deve ter campo de texto para benefícios adicionais
- **RF-013:** Deve permitir adicionar skills desejadas (tags)
- **RF-014:** Campos obrigatórios: título, tipo, modalidade, localização, descrição, requisitos
- **RF-015:** Ao publicar, status deve ser "ativa"
- **RF-016:** Deve redirecionar para listagem após salvar

### Edição de Vaga

- **RF-017:** Deve carregar dados atuais no formulário
- **RF-018:** Deve permitir editar todos os campos
- **RF-019:** Deve manter histórico de candidaturas (não afeta candidaturas existentes)
- **RF-020:** Deve exibir toast de confirmação ao salvar

### Gestão de Status

- **RF-021:** Vaga ativa pode ser pausada ou encerrada
- **RF-022:** Vaga pausada pode ser reativada ou encerrada
- **RF-023:** Vaga encerrada pode ser duplicada ou excluída
- **RF-024:** Pausar/Reativar deve pedir confirmação
- **RF-025:** Encerrar deve pedir confirmação (ação significativa)
- **RF-026:** Excluir deve pedir confirmação dupla (ação destrutiva)

### Duplicar Vaga

- **RF-027:** Deve criar cópia da vaga com título "[Original] - Cópia"
- **RF-028:** Nova vaga deve ter status "rascunho" ou ir para edição
- **RF-029:** Candidaturas não são copiadas

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Formulário deve ter feedback visual de campos inválidos
- **RNF-002 (Performance):** Salvamento deve responder em menos de 500ms
- **RNF-003 (Responsividade):** Formulário deve funcionar em tablet/mobile
- **RNF-004 (Validação):** Validação em tempo real (onChange) para UX

---

## Critérios de Aceitação

### RF-001 a RF-006: Listagem

```gherkin
DADO que a empresa tem vagas cadastradas
QUANDO ela acessa /empresa/vagas
ENTÃO deve ver lista de suas vagas
  E cada card deve mostrar informações resumidas
  E deve ter filtros por status
  E vagas ativas devem aparecer primeiro
```

### RF-007 a RF-016: Criação

```gherkin
DADO que a empresa quer criar uma vaga
QUANDO ela clica em "Nova Vaga"
ENTÃO deve ver formulário completo
  E campos obrigatórios devem estar marcados
  E ao preencher e clicar "Publicar"
  ENTÃO a vaga deve ser criada com status "ativa"
  E deve redirecionar para listagem
  E deve exibir toast "Vaga publicada com sucesso"
```

```gherkin
DADO que a empresa não preencheu campos obrigatórios
QUANDO ela tenta publicar a vaga
ENTÃO deve exibir erros inline nos campos
  E não deve salvar a vaga
```

### RF-021 a RF-026: Status

```gherkin
DADO que a empresa tem uma vaga ativa
QUANDO ela clica em "Pausar"
ENTÃO deve exibir confirmação
  E se confirmar, status muda para "pausada"
  E vaga não aparece mais para candidatos
```

```gherkin
DADO que a empresa quer encerrar uma vaga
QUANDO ela clica em "Encerrar"
ENTÃO deve exibir confirmação com aviso
  E se confirmar, status muda para "encerrada"
  E não pode mais receber candidaturas
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e listagem | 3 |
| 2 | Formulário básico | 4 |
| 3 | Campos avançados | 3 |
| 4 | Gestão de status | 2 |
| 5 | Duplicar, excluir e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Listagem

**Objetivo:** Implementar listagem de vagas

**Ações:**
- [ ] Criar/atualizar página `/empresa/vagas`
- [ ] Criar componente `JobListCard`
- [ ] Implementar filtros por status
- [ ] Implementar ordenação

**Validação:** Listagem funcional com filtros

#### Fase 2: Formulário Básico

**Objetivo:** Criar formulário de nova vaga (campos básicos)

**Ações:**
- [ ] Criar página `/empresa/vagas/nova`
- [ ] Criar componente `JobForm`
- [ ] Implementar campos: título, tipo, modalidade, localização
- [ ] Implementar campos de salário
- [ ] Implementar validação básica

**Validação:** Formulário com campos básicos funcionando

#### Fase 3: Campos Avançados

**Objetivo:** Adicionar descrição, requisitos, benefícios, skills

**Ações:**
- [ ] Adicionar textarea de descrição com contador
- [ ] Adicionar textarea de requisitos
- [ ] Criar checkboxes de benefícios
- [ ] Criar input de skills (tags)
- [ ] Implementar validação completa

**Validação:** Formulário completo

#### Fase 4: Gestão de Status

**Objetivo:** Implementar ações de status

**Ações:**
- [ ] Implementar pausar/reativar
- [ ] Implementar encerrar
- [ ] Criar modais de confirmação
- [ ] Atualizar ações no card conforme status

**Validação:** Todas as transições de status funcionando

#### Fase 5: Duplicar, Excluir e Refinamentos

**Objetivo:** Funcionalidades adicionais e polimento

**Ações:**
- [ ] Implementar duplicar vaga
- [ ] Implementar excluir vaga encerrada
- [ ] Criar página de edição (reutilizar JobForm)
- [ ] Testar responsividade
- [ ] Ajustes de UX

**Validação:** CRUD completo funcionando

---

## Estados da Vaga

| Status | Cor | Descrição | Ações Disponíveis |
|--------|-----|-----------|-------------------|
| `ativa` | Verde 🟢 | Visível para candidatos | Ver, Editar, Pausar, Duplicar |
| `pausada` | Amarelo 🟡 | Não visível, pode reativar | Ver, Editar, Reativar, Encerrar |
| `encerrada` | Cinza ⚫ | Finalizada | Ver, Duplicar, Excluir |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-012 | Dashboard Empresa | ⏳ Pendente |

### PRDs Seguintes

| PRD | Descrição |
|-----|-----------|
| PRD-015 | Gestão de Candidaturas (por vaga) |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.12.0 → 0.13.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.13.0] - 2026-01-XX

### Added
- Listagem de vagas da empresa com filtros por status
- Criação de nova vaga com formulário completo
- Edição de vaga existente
- Gestão de status (ativa, pausada, encerrada)
- Duplicar vaga existente
- Excluir vaga encerrada
- Seleção de benefícios e skills
- Validação de campos obrigatórios
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Formulário** | react-hook-form ou controlled components |
| **Validação** | Zod ou validação manual |
| **Textarea** | Contador de caracteres em tempo real |
| **Tags** | Reutilizar lógica do PRD-005 (skills) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Integração com job boards externos |
| Auto-save de rascunhos |
| Agendamento de publicação |
| Campos muito customizáveis |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Observações** | Core feature da área Empresa |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
