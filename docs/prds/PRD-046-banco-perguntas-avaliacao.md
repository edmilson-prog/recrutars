# PRD-046: Banco de Perguntas e Estrutura de Avaliação Comportamental

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-035` | Banner de Incentivo ao Teste DISC |
| `PRD-047` | Teste Geral do Candidato (Gauge-Pro 2.0) |
| `PRD-048` | Teste por Vaga (Empresa) |
| `Framework Avaliação` | Documento base com metodologia e perguntas |

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Painel Admin |
| **Repositório** | github.com/aila-sistemas/recrutars |
| **Objetivo** | Implementar banco de perguntas estruturado para avaliação comportamental, com gestão de categorias, níveis e tipos de perguntas pelo Admin |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Épico** | Gauge-Pro 2.0 — Sistema de Avaliação Comportamental |
| **PRDs Relacionados** | PRD-047, PRD-048 |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** ✅ | 5-8 arquivos, CRUD completo, estrutura de dados moderada, apenas painel Admin |

---

## Contexto do Problema

O RecrutaRS possui um framework de avaliação comportamental científico baseado no modelo Big Five, avaliando candidatos em 3 dimensões: Personalidade, Caráter e Competências. Este framework contém 100+ perguntas categorizadas, mas atualmente existe apenas como documento estático.

Para que o sistema Gauge-Pro 2.0 funcione, precisamos:
- Estruturar as perguntas no banco de dados
- Permitir que o Admin gerencie o banco de perguntas
- Categorizar por dimensão, competência e nível
- Definir tipos de resposta (Likert, Situacional)
- Preparar a base para os testes de candidatos (PRD-047) e empresas (PRD-048)

---

## Conceito da Solução

### Situação Atual (As-Is)

- Framework existe apenas como documento Word/PDF
- Perguntas não estão estruturadas no sistema
- Não há interface para gestão de perguntas
- Não há categorização dinâmica

### Situação Desejada (To-Be)

- Banco de perguntas no banco de dados
- CRUD completo pelo Admin
- Categorização hierárquica (Dimensão → Categoria → Subcategoria)
- Filtros e busca avançada
- Importação em massa (seed inicial)
- Base pronta para PRD-047 e PRD-048

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Perguntas hardcoded no frontend | Inflexível, difícil manutenção |
| Arquivo JSON estático | Não permite edição pelo Admin |
| Integração com banco externo | Complexidade desnecessária |

---

## Escopo

### Incluído

- ✅ Modelo de dados para perguntas
- ✅ Modelo de dados para categorias/dimensões
- ✅ CRUD de perguntas pelo Admin
- ✅ CRUD de categorias pelo Admin
- ✅ Tipos de pergunta: Likert e Situacional
- ✅ Níveis de complexidade: Básico, Intermediário, Avançado
- ✅ Tags para competências
- ✅ Filtros e busca
- ✅ Importação inicial (seed) das 100+ perguntas do framework
- ✅ Ativação/desativação de perguntas
- ✅ Visualização de estatísticas de uso

### Excluído

- ❌ Aplicação do teste (PRD-047)
- ❌ Criação de teste pela empresa (PRD-048)
- ❌ Análise de respostas por IA
- ❌ Relatórios de resultados
- ❌ Exportação de perguntas

---

## Arquitetura de Dados

### Hierarquia de Categorização

```
DIMENSÃO (3)
├── Personalidade (Big Five)
│   ├── Abertura à Experiência
│   ├── Conscienciosidade
│   ├── Extroversão
│   ├── Amabilidade
│   └── Estabilidade Emocional
│
├── Caráter
│   ├── Integridade
│   ├── Responsabilidade
│   ├── Honestidade
│   ├── Ética Profissional
│   └── Confiabilidade
│
└── Competências
    ├── Liderança
    ├── Comunicação
    ├── Trabalho em Equipe
    ├── Resiliência
    ├── Resolução de Problemas
    ├── Adaptabilidade
    ├── Pensamento Crítico
    ├── Orientação a Resultados
    ├── Iniciativa e Proatividade
    └── Gestão de Tempo
```

### Tipos de Pergunta

| Tipo | Formato | Exemplo |
|------|---------|---------|
| **Likert** | Escala 1-5 | "Gosto de experimentar coisas novas" → Discordo totalmente...Concordo totalmente |
| **Situacional** | Múltipla escolha (A-D) | "Você descobre um erro no trabalho de um colega. O que faz?" → 4 opções de ação |
| **Comportamental** | Texto estruturado | "Descreva uma situação em que..." (usado em teste por vaga, não no geral) |

### Níveis de Complexidade

| Nível | Código | Público-Alvo | Qtd Estimada |
|-------|--------|--------------|--------------|
| ⭐ Básico | `basic` | Cargos operacionais | ~30 perguntas |
| ⭐⭐ Intermediário | `intermediate` | Cargos táticos/analistas | ~40 perguntas |
| ⭐⭐⭐ Avançado | `advanced` | Cargos estratégicos/liderança | ~30 perguntas |

---

## Modelo de Dados

### Tabela: `assessment_dimensions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `name` | VARCHAR(100) | Nome da dimensão |
| `slug` | VARCHAR(50) | Slug único (personality, character, competencies) |
| `description` | TEXT | Descrição da dimensão |
| `icon` | VARCHAR(50) | Ícone (emoji ou Lucide) |
| `order` | INT | Ordem de exibição |
| `isActive` | BOOLEAN | Ativo/Inativo |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

### Tabela: `assessment_categories`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `dimensionId` | UUID | FK → assessment_dimensions |
| `name` | VARCHAR(100) | Nome da categoria |
| `slug` | VARCHAR(50) | Slug único |
| `description` | TEXT | O que avalia |
| `icon` | VARCHAR(50) | Ícone |
| `order` | INT | Ordem de exibição |
| `isActive` | BOOLEAN | Ativo/Inativo |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

### Tabela: `assessment_questions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `categoryId` | UUID | FK → assessment_categories |
| `code` | VARCHAR(20) | Código único (ex: "1.1", "6.7") |
| `type` | ENUM | 'likert', 'situational', 'behavioral' |
| `level` | ENUM | 'basic', 'intermediate', 'advanced' |
| `text` | TEXT | Texto da pergunta |
| `helpText` | TEXT | Texto de ajuda (opcional) |
| `options` | JSONB | Opções de resposta (para situacional) |
| `correctWeight` | JSONB | Pesos por opção para scoring |
| `redFlagThreshold` | INT | Limite para red flag (opcional) |
| `isActive` | BOOLEAN | Ativo/Inativo |
| `usageCount` | INT | Quantas vezes foi usada |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |

### Estrutura de `options` (JSONB)

```typescript
// Para pergunta Likert
{
  "type": "likert",
  "scale": [
    { "value": 1, "label": "Discordo totalmente" },
    { "value": 2, "label": "Discordo" },
    { "value": 3, "label": "Neutro" },
    { "value": 4, "label": "Concordo" },
    { "value": 5, "label": "Concordo totalmente" }
  ]
}

// Para pergunta Situacional
{
  "type": "situational",
  "choices": [
    { "key": "A", "text": "Reporta imediatamente ao gestor", "weight": 5 },
    { "key": "B", "text": "Conversa primeiro com o colega", "weight": 4 },
    { "key": "C", "text": "Ignora se não te afeta", "weight": 1 },
    { "key": "D", "text": "Documenta e aguarda", "weight": 3 }
  ]
}
```

### Estrutura de `correctWeight` (JSONB)

```typescript
// Mapeamento de resposta → pontuação por competência
{
  "integridade": { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 },
  "honestidade": { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 }
}

// Para situacional
{
  "integridade": { "A": 5, "B": 4, "C": 1, "D": 3 }
}
```

---

## Requisitos Funcionais

### Gestão de Dimensões

- **RF-001:** Admin pode visualizar lista de dimensões
- **RF-002:** Admin pode editar nome, descrição e ícone de dimensões
- **RF-003:** Admin pode ativar/desativar dimensões
- **RF-004:** Admin pode reordenar dimensões (drag-and-drop)
- **RF-005:** Dimensões desativadas não aparecem nos testes

### Gestão de Categorias

- **RF-006:** Admin pode visualizar categorias por dimensão
- **RF-007:** Admin pode criar nova categoria
- **RF-008:** Admin pode editar categoria existente
- **RF-009:** Admin pode ativar/desativar categorias
- **RF-010:** Admin pode reordenar categorias dentro da dimensão
- **RF-011:** Categorias desativadas não aparecem nos testes

### Gestão de Perguntas

- **RF-012:** Admin pode visualizar lista de perguntas com filtros
- **RF-013:** Filtros disponíveis: dimensão, categoria, tipo, nível, status
- **RF-014:** Admin pode buscar perguntas por texto
- **RF-015:** Admin pode criar nova pergunta
- **RF-016:** Admin pode editar pergunta existente
- **RF-017:** Admin pode duplicar pergunta
- **RF-018:** Admin pode ativar/desativar perguntas
- **RF-019:** Admin pode visualizar estatísticas de uso da pergunta
- **RF-020:** Admin pode definir se pergunta pode gerar red flag

### Criação de Pergunta

- **RF-021:** Formulário deve permitir selecionar dimensão → categoria (cascata)
- **RF-022:** Formulário deve permitir selecionar tipo (Likert, Situacional)
- **RF-023:** Formulário deve permitir selecionar nível (Básico, Intermediário, Avançado)
- **RF-024:** Para Likert: usar escala padrão 1-5
- **RF-025:** Para Situacional: permitir cadastrar 2-5 opções com pesos
- **RF-026:** Permitir adicionar texto de ajuda (opcional)
- **RF-027:** Permitir definir threshold de red flag (opcional)

### Importação Inicial (Seed)

- **RF-028:** Sistema deve ter seed com as 100+ perguntas do framework
- **RF-029:** Seed deve popular dimensões, categorias e perguntas
- **RF-030:** Seed deve ser idempotente (não duplicar se rodar novamente)

### Visualização e Estatísticas

- **RF-031:** Dashboard com contadores: total de perguntas por dimensão/categoria
- **RF-032:** Indicador de perguntas mais/menos usadas
- **RF-033:** Alerta se categoria tem poucas perguntas ativas (<3)

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Listagem de perguntas com paginação (50 por página)
- **RNF-002 (Busca):** Busca deve ser instantânea (client-side ou debounce 300ms)
- **RNF-003 (Validação):** Impedir exclusão de dimensão/categoria com perguntas ativas
- **RNF-004 (Auditoria):** Logar alterações em perguntas (quem, quando, o quê)

---

## Especificação Visual

### Tela Principal: Lista de Perguntas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Banco de Perguntas                                    [+ Nova Pergunta]    │
│  Gerencie as perguntas do sistema de avaliação comportamental              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 Buscar pergunta...                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Filtros: [Dimensão ▼] [Categoria ▼] [Tipo ▼] [Nível ▼] [Status ▼]        │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  📊 Estatísticas: 105 perguntas | 42 Personalidade | 28 Caráter | 35 Comp. │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1.1 ⭐⭐ | 🎭 Personalidade > Abertura           [Likert] [Ativo ●]  │   │
│  │                                                                     │   │
│  │ "Descreva uma situação em que você teve que aprender algo          │   │
│  │  completamente novo para realizar um projeto..."                    │   │
│  │                                                                     │   │
│  │ 📈 Usado 47x                        [✏️ Editar] [📋 Duplicar] [...]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 6.1 ⭐⭐⭐ | 💎 Caráter > Integridade          [Situacional] [Ativo ●]│   │
│  │                                                                     │   │
│  │ "Conte sobre uma situação em que você teve que escolher entre      │   │
│  │  fazer o que era mais fácil ou fazer o que era certo..."           │   │
│  │                                                                     │   │
│  │ 📈 Usado 32x                        [✏️ Editar] [📋 Duplicar] [...]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [← Anterior]  Página 1 de 5  [Próxima →]                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Modal: Nova/Editar Pergunta

```
┌─────────────────────────────────────────────────────────────────┐
│  Nova Pergunta                                           [✕]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Dimensão *                                                     │
│  [🎭 Personalidade                                         ▼]   │
│                                                                 │
│  Categoria *                                                    │
│  [Abertura à Experiência                                   ▼]   │
│                                                                 │
│  Código *                     Nível *                           │
│  [1.8                    ]    [⭐⭐ Intermediário           ▼]   │
│                                                                 │
│  Tipo de Pergunta *                                             │
│  ○ Likert (escala 1-5)                                         │
│  ● Situacional (múltipla escolha)                              │
│                                                                 │
│  Texto da Pergunta *                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Você está prestes a finalizar um projeto quando percebe │   │
│  │ um pequeno erro que passaria despercebido. Consertar    │   │
│  │ atrasaria a entrega em algumas horas. O que você faz?   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Opções de Resposta                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ A) [Corrige imediatamente, mesmo atrasando        ] [5] │   │
│  │ B) [Entrega no prazo e corrige depois             ] [2] │   │
│  │ C) [Consulta o gestor antes de decidir            ] [4] │   │
│  │ D) [Ignora, pois é um erro pequeno                ] [1] │   │
│  │                                         [+ Adicionar]    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Texto de Ajuda (opcional)                                      │
│  [Avalia conscienciosidade e atenção aos detalhes         ]    │
│                                                                 │
│  ☐ Esta pergunta pode indicar Red Flag                         │
│    Threshold: [2] (respostas ≤ threshold = alerta)             │
│                                                                 │
│                              [Cancelar]  [💾 Salvar Pergunta]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tela: Gestão de Categorias

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Dimensões e Categorias                                [+ Nova Categoria]   │
│  Organize a estrutura de avaliação comportamental                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🎭 PERSONALIDADE (Big Five)                              [Ativo ●]    │ │
│  │ Padrões consistentes de pensamento, emoção e comportamento           │ │
│  │                                                                       │ │
│  │  ├─ Abertura à Experiência      12 perguntas  [✏️] [●]               │ │
│  │  ├─ Conscienciosidade           13 perguntas  [✏️] [●]               │ │
│  │  ├─ Extroversão                 11 perguntas  [✏️] [●]               │ │
│  │  ├─ Amabilidade                 12 perguntas  [✏️] [●]               │ │
│  │  └─ Estabilidade Emocional      12 perguntas  [✏️] [●]               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 💎 CARÁTER                                               [Ativo ●]    │ │
│  │ Valores morais, integridade e princípios éticos                      │ │
│  │                                                                       │ │
│  │  ├─ Integridade                 11 perguntas  [✏️] [●]               │ │
│  │  ├─ Responsabilidade            10 perguntas  [✏️] [●]               │ │
│  │  ├─ Honestidade                  9 perguntas  [✏️] [●]               │ │
│  │  ├─ Ética Profissional           9 perguntas  [✏️] [●]               │ │
│  │  └─ Confiabilidade               9 perguntas  [✏️] [●]               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 💼 COMPETÊNCIAS                                          [Ativo ●]    │ │
│  │ Conhecimentos, habilidades e atitudes para desempenho                │ │
│  │                                                                       │ │
│  │  ├─ Liderança                   12 perguntas  [✏️] [●]               │ │
│  │  ├─ Comunicação                 12 perguntas  [✏️] [●]               │ │
│  │  ├─ Trabalho em Equipe          12 perguntas  [✏️] [●]               │ │
│  │  ├─ Resiliência                 11 perguntas  [✏️] [●]               │ │
│  │  ├─ Resolução de Problemas      12 perguntas  [✏️] [●]               │ │
│  │  ├─ Adaptabilidade              11 perguntas  [✏️] [●]               │ │
│  │  ├─ Pensamento Crítico          11 perguntas  [✏️] [●]               │ │
│  │  ├─ Orientação a Resultados     11 perguntas  [✏️] [●]               │ │
│  │  ├─ Iniciativa e Proatividade   11 perguntas  [✏️] [●]               │ │
│  │  └─ Gestão de Tempo             11 perguntas  [✏️] [●]               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Critérios de Aceitação

### RF-012 a RF-014: Listagem e Filtros

```gherkin
DADO que o Admin acessa o Banco de Perguntas
QUANDO a página carrega
ENTÃO deve exibir lista paginada de perguntas
  E deve mostrar estatísticas no topo
  E deve permitir filtrar por dimensão, categoria, tipo, nível e status

DADO que o Admin digita "liderança" na busca
QUANDO a busca é executada
ENTÃO deve filtrar perguntas que contenham "liderança" no texto
```

### RF-015 a RF-017: CRUD de Perguntas

```gherkin
DADO que o Admin clica em "Nova Pergunta"
QUANDO preenche todos os campos obrigatórios
  E clica em "Salvar"
ENTÃO a pergunta deve ser criada
  E deve aparecer na lista
  E deve exibir toast de sucesso

DADO que o Admin clica em "Duplicar" em uma pergunta
QUANDO confirma a ação
ENTÃO deve criar cópia da pergunta
  E deve abrir modal de edição da cópia
```

### RF-028 a RF-030: Seed Inicial

```gherkin
DADO que o sistema é instalado pela primeira vez
QUANDO o seed de perguntas é executado
ENTÃO deve criar 3 dimensões
  E deve criar 20 categorias
  E deve criar 100+ perguntas
  E não deve duplicar se executado novamente
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de dados e migrations | 3 |
| 2 | Seed de perguntas do framework | 2 |
| 3 | CRUD de categorias | 3 |
| 4 | CRUD de perguntas | 4 |

### Detalhamento das Fases

#### Fase 1: Modelo de Dados

**Objetivo:** Criar estrutura no banco de dados

**Ações:**
- [ ] Criar tabela `assessment_dimensions`
- [ ] Criar tabela `assessment_categories`
- [ ] Criar tabela `assessment_questions`
- [ ] Definir relacionamentos e índices
- [ ] Criar tipos TypeScript correspondentes

**Validação:** Migrations executam sem erro

#### Fase 2: Seed de Perguntas

**Objetivo:** Popular banco com perguntas do framework

**Ações:**
- [ ] Criar arquivo de seed para dimensões
- [ ] Criar arquivo de seed para categorias
- [ ] Criar arquivo de seed para perguntas (100+)
- [ ] Implementar lógica de idempotência
- [ ] Mapear pesos e red flags

**Validação:** Seed popula corretamente, re-execução não duplica

#### Fase 3: CRUD de Categorias

**Objetivo:** Interface de gestão de dimensões/categorias

**Ações:**
- [ ] Criar página `/admin/avaliacoes/categorias`
- [ ] Implementar visualização em árvore
- [ ] Implementar edição inline de categorias
- [ ] Implementar ativação/desativação
- [ ] Implementar reordenação (drag-and-drop opcional)

**Validação:** Admin consegue gerenciar categorias

#### Fase 4: CRUD de Perguntas

**Objetivo:** Interface completa de gestão de perguntas

**Ações:**
- [ ] Criar página `/admin/avaliacoes/perguntas`
- [ ] Implementar listagem com filtros e busca
- [ ] Implementar modal de criação/edição
- [ ] Implementar duplicação de pergunta
- [ ] Implementar estatísticas de uso
- [ ] Adicionar ao menu lateral do Admin

**Validação:** Admin consegue gerenciar perguntas completamente

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| - | Nenhuma dependência crítica | - |

### PRDs Dependentes

| PRD | Descrição | Relação |
|-----|-----------|---------|
| PRD-047 | Teste Geral do Candidato | Usa as perguntas deste banco |
| PRD-048 | Teste por Vaga (Empresa) | Usa as perguntas deste banco |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Gauge-Pro 2.0 — Sistema de Avaliação Comportamental"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| **1** | **PRD-046** | **Banco de Perguntas** | **🔄 ATUAL** | Base |
| 2 | PRD-047 | Teste Geral do Candidato | ⏳ | Depende de 046 |
| 3 | PRD-048 | Teste por Vaga (Empresa) | ⏳ | Depende de 046, 047 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Perguntas | Interno | Apenas Admin pode editar |
| Pesos de resposta | Interno | Não expor no frontend do candidato |

### Autenticação e Autorização

- Apenas usuários com role `admin` podem acessar
- Auditoria de alterações em perguntas

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. SEED DE PERGUNTAS:**
> O framework completo de perguntas está disponível nos documentos anexos. Use-os como base para criar o seed.

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Sugestão para este épico: "Gauge" ou "Assessment".

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

Tipos de mudança a documentar:
- **Added** — novas funcionalidades
- **Changed** — mudanças em funcionalidades existentes
- **Deprecated** — funcionalidades que serão removidas
- **Removed** — funcionalidades removidas
- **Fixed** — correções de bugs
- **Security** — correções de vulnerabilidades

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Seed idempotente** | Deve poder rodar múltiplas vezes sem duplicar |
| **Soft delete** | Desativar perguntas em vez de excluir |
| **Auditoria** | Logar quem alterou cada pergunta |
| **Validação** | Impedir salvar pergunta sem opções (situacional) |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Paginação** | 50 itens por página |
| **Busca** | Debounce 300ms, busca em texto da pergunta |
| **Filtros** | Aplicar cumulativamente |
| **Ordem** | Por código (1.1, 1.2, ..., 2.1, etc.) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Expor pesos de resposta no frontend público |
| Permitir exclusão física de perguntas usadas em testes |
| Criar perguntas sem categoria |
| Seed que duplica dados ao re-executar |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 20/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
