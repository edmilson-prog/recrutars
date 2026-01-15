# PRD-031: Comparar Candidatos (Empresa)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Permitir comparação lado a lado de candidatos |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Layout comparativo, múltiplas seções, seleção de candidatos |

---

## Contexto do Problema

Quando a empresa tem vários candidatos interessantes para uma vaga, é difícil decidir quem convidar. Atualmente precisa abrir múltiplas abas ou anotar informações externamente para comparar. Uma visualização lado a lado facilita a tomada de decisão.

### Casos de Uso

| Cenário | Necessidade |
|---------|-------------|
| Shortlist final | Comparar 2-3 finalistas antes de decidir |
| Mesmo nível técnico | Comparar perfis comportamentais (DISC) |
| Trade-offs | Visualizar experiência vs formação vs habilidades |
| Decisão em equipe | Apresentar comparativo para gestores |

---

## Conceito da Solução

### Botão Comparar

O botão aparece em:
- Cards de candidatos (Banco de Talentos)
- Cards de candidatos (Candidatos Salvos)
- Cards de candidaturas recebidas

```
┌────────────────────────────────────────────────────────────────┐
│  Card de Candidato                                      ❤️     │
│  ...                                                           │
│  [👁️ Ver Perfil]  [📩 Convidar]  [📊 Comparar]               │
│                                   ↑                            │
│                             Adiciona à comparação              │
└────────────────────────────────────────────────────────────────┘
```

### Barra de Comparação (Flutuante)

Quando há candidatos selecionados para comparação:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  (conteúdo da página)                                           │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  📊 Comparar Candidatos                                         │
│                                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐                                     │
│  │ foto │ │ foto │ │  +   │   2 de 3 selecionados              │
│  │ ✕    │ │ ✕    │ │      │                                     │
│  └──────┘ └──────┘ └──────┘                                     │
│   João     Maria                                                │
│                                                                  │
│                        [Limpar]  [📊 Comparar Agora]            │
└──────────────────────────────────────────────────────────────────┘
```

### Tela de Comparação

```
┌──────────────────────────────────────────────────────────────────┐
│  📊 Comparativo de Candidatos                            [✕]    │
│  Comparando 3 candidatos                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│           João Silva      Maria Santos     Pedro Lima           │
│           ┌────────┐      ┌────────┐      ┌────────┐           │
│           │  foto  │      │  foto  │      │  foto  │           │
│           └────────┘      └────────┘      └────────┘           │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  MATCH                                                          │
│  ─────────────────────────────────────────────────────────────  │
│  % Compatibilidade   94%           96%           88%            │
│                      ████████░░    █████████░    ███████░░░     │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  EXPERIÊNCIA                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  Anos de Exp.        5 anos        7 anos        3 anos         │
│  Cargo Atual         Dev Senior    Product Lead  Dev Pleno      │
│  Empresa Atual       TechCorp      StartupXYZ    BigCo          │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  FORMAÇÃO                                                       │
│  ─────────────────────────────────────────────────────────────  │
│  Graduação           Ciência da    Design        Eng. de        │
│                      Computação    Digital       Software       │
│  Instituição         UFRGS         ESPM          PUC-RS         │
│  Status              ✅ Completo   ✅ Completo   ✅ Completo    │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  HABILIDADES TOP 5                                              │
│  ─────────────────────────────────────────────────────────────  │
│                      React ●●●●●   Figma ●●●●●  React ●●●●○     │
│                      Node ●●●●○    UX ●●●●●     Vue ●●●●●       │
│                      TS ●●●●○      CSS ●●●●○    Node ●●●○○      │
│                      AWS ●●●○○     Proto ●●●●○  AWS ●●●○○       │
│                      Docker ●●●○○  Research ●●●○ Docker ●●○○○   │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  PERFIL COMPORTAMENTAL (DISC)                                   │
│  ─────────────────────────────────────────────────────────────  │
│  Perfil Primário     Dominante     Influente     Estável        │
│                      (D)           (I)           (S)            │
│                                                                  │
│       D ████████░░   D ███░░░░░░░  D ████░░░░░░                 │
│       I ███░░░░░░░   I █████████░  I ██████░░░░                 │
│       S ██░░░░░░░░   S █████░░░░░  S ████████░░                 │
│       C ██████░░░░   C ████░░░░░░  C ███░░░░░░░                 │
│                                                                  │
│  Características     Decisivo      Comunicativo  Colaborativo   │
│                      Orientado a   Entusiasta    Paciente       │
│                      resultados    Persuasivo    Leal           │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  PRETENSÃO SALARIAL                                             │
│  ─────────────────────────────────────────────────────────────  │
│                      R$ 12.000     R$ 15.000     R$ 9.000       │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  DISPONIBILIDADE                                                │
│  ─────────────────────────────────────────────────────────────  │
│                      Imediata      30 dias       15 dias        │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  LOCALIZAÇÃO                                                    │
│  ─────────────────────────────────────────────────────────────  │
│                      Porto Alegre  São Paulo     Remoto         │
│                      RS            SP                           │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [📩 Convidar João] [📩 Convidar Maria] [📩 Convidar Pedro]    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Comparação com 2 Candidatos

```
┌──────────────────────────────────────────────────────────────────┐
│  📊 Comparativo de Candidatos                            [✕]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│              João Silva              Maria Santos               │
│              ┌────────┐              ┌────────┐                 │
│              │  foto  │              │  foto  │                 │
│              └────────┘              └────────┘                 │
│                                                                  │
│  ═══════════════════════════════════════════════════════════    │
│  MATCH                                                          │
│  ─────────────────────────────────────────────────────────────  │
│  % Compatibilidade      94%                96%                  │
│                         ████████░░         █████████░           │
│                                         ⭐ Melhor match         │
│                                                                  │
│  ...                                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Destaque de Vencedor por Categoria

```
┌────────────────────────────────────────────────────────────────┐
│  EXPERIÊNCIA                                                   │
│  ──────────────────────────────────────────────────────────── │
│  Anos de Exp.        5 anos        7 anos  ⭐                  │
│                                    ↑                           │
│                              Destaque verde                    │
│                              para o melhor                     │
└────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Botão "Comparar" nos cards de candidatos
- ✅ Barra flutuante de seleção (máximo 3 candidatos)
- ✅ Tela de comparação lado a lado
- ✅ Seções: Match, Experiência, Formação, Habilidades, DISC, Salário, Disponibilidade
- ✅ Destaque visual do "melhor" em cada categoria
- ✅ Gráficos do perfil DISC lado a lado
- ✅ Botão de convidar direto da comparação
- ✅ Funciona com 2 ou 3 candidatos

### Excluído

- ❌ Comparar mais de 3 candidatos
- ❌ Salvar/exportar comparação
- ❌ Comparação automática por IA
- ❌ Histórico de comparações anteriores
- ❌ Pesos customizáveis para ranking

---

## Requisitos Funcionais

### Seleção de Candidatos

- **RF-001:** Botão "📊 Comparar" nos cards de candidatos
- **RF-002:** Ao clicar, adiciona candidato à lista de comparação
- **RF-003:** Máximo de 3 candidatos selecionados
- **RF-004:** Se tentar adicionar 4º, exibir alerta
- **RF-005:** Barra flutuante aparece quando há 1+ candidatos selecionados
- **RF-006:** Exibir foto miniatura na barra flutuante
- **RF-007:** Botão ✕ para remover candidato da seleção
- **RF-008:** Botão "Limpar" remove todos

### Tela de Comparação

- **RF-009:** Abre como modal ou página dedicada
- **RF-010:** Layout em colunas (1 por candidato)
- **RF-011:** Mínimo 2 candidatos para abrir comparação
- **RF-012:** Seções comparativas organizadas

### Seções Comparativas

- **RF-013:** Match (% compatibilidade com barra visual)
- **RF-014:** Experiência (anos, cargo atual, empresa)
- **RF-015:** Formação (graduação, instituição, status)
- **RF-016:** Habilidades (top 5 com níveis)
- **RF-017:** DISC (gráfico de barras lado a lado)
- **RF-018:** Pretensão salarial
- **RF-019:** Disponibilidade
- **RF-020:** Localização

### Destaques

- **RF-021:** Destacar "melhor" valor em cada categoria numérica
- **RF-022:** Usar ⭐ ou cor verde para indicar vencedor
- **RF-023:** Match mais alto = destaque
- **RF-024:** Mais experiência = destaque (quando relevante)

### Ações

- **RF-025:** Botão "Convidar" para cada candidato na comparação
- **RF-026:** Ao convidar, comportamento igual ao Banco de Talentos
- **RF-027:** Fechar comparação ao clicar em ✕ ou fora

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Layout responsivo (scroll horizontal em mobile)
- **RNF-002 (Performance):** Carregar comparação em menos de 2 segundos
- **RNF-003 (Visual):** Alinhamento perfeito entre colunas

---

## Critérios de Aceitação

### RF-001 a RF-008: Seleção

```gherkin
DADO que a empresa está no Banco de Talentos
QUANDO ela clica em "Comparar" em 2 candidatos
ENTÃO ambos devem aparecer na barra flutuante
  E a barra deve mostrar "2 de 3 selecionados"
  E deve ter botão "Comparar Agora"
```

### RF-009 a RF-020: Tela de Comparação

```gherkin
DADO que 3 candidatos estão selecionados
QUANDO a empresa clica em "Comparar Agora"
ENTÃO deve abrir tela de comparação
  E deve exibir 3 colunas lado a lado
  E deve mostrar todas as seções comparativas
  E deve destacar o melhor em cada categoria
```

### RF-021 a RF-024: Destaques

```gherkin
DADO que João tem 94% match e Maria tem 96%
QUANDO a comparação é exibida
ENTÃO Maria deve ter destaque na seção Match
  E deve exibir indicador visual (⭐ ou cor)
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Seleção e barra flutuante | 2 |
| 2 | Tela de comparação básica | 2 |
| 3 | DISC e destaques | 2 |

### Detalhamento das Fases

#### Fase 1: Seleção e Barra Flutuante

**Objetivo:** Permitir selecionar candidatos

**Ações:**
- [ ] Adicionar botão "Comparar" nos cards
- [ ] Criar contexto global para candidatos selecionados
- [ ] Implementar barra flutuante
- [ ] Implementar limite de 3 candidatos

**Validação:** Empresa consegue selecionar até 3 candidatos

#### Fase 2: Tela de Comparação Básica

**Objetivo:** Visualização lado a lado

**Ações:**
- [ ] Criar componente `ComparisonModal`
- [ ] Implementar layout de colunas
- [ ] Implementar seções: Match, Experiência, Formação, Habilidades
- [ ] Implementar botões de convidar

**Validação:** Comparação básica funciona

#### Fase 3: DISC e Destaques

**Objetivo:** Perfil comportamental e indicadores

**Ações:**
- [ ] Implementar gráfico DISC lado a lado
- [ ] Implementar lógica de destaque (melhor valor)
- [ ] Adicionar seções: Salário, Disponibilidade, Localização
- [ ] Polish visual

**Validação:** Comparação completa com destaques

---

## Modelo de Dados

### ComparisonContext

```typescript
interface ComparisonState {
  selectedCandidates: string[]; // máx 3 IDs
  isBarVisible: boolean;
}

// Dados necessários para comparação
interface CandidateComparison {
  id: string;
  name: string;
  photo: string;
  matchPercentage: number;
  experienceYears: number;
  currentRole: string;
  currentCompany: string;
  education: {
    degree: string;
    institution: string;
    status: string;
  };
  topSkills: {
    name: string;
    level: number; // 1-5
  }[];
  disc: {
    d: number;
    i: number;
    s: number;
    c: number;
    primary: 'D' | 'I' | 'S' | 'C';
    characteristics: string[];
  };
  salaryExpectation: number;
  availability: string;
  location: string;
}
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-014 | Banco de Talentos | ✅ Implementado |
| PRD-030 | Candidatos Favoritos (Empresa) | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.30.0 → 0.31.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.31.0] - 2026-01-XX

### Added
- Sistema de comparação de candidatos
- Seleção de até 3 candidatos para comparar
- Barra flutuante de seleção
- Tela de comparação lado a lado
- Seções: Match, Experiência, Formação, Habilidades, DISC
- Destaque visual do melhor em cada categoria
- Gráfico DISC comparativo
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Context** | Usar React Context para estado global |
| **Barra** | Posição fixed no bottom |
| **Modal** | Pode ser fullscreen em mobile |
| **DISC** | Reutilizar componente de gráfico existente |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Permitir mais de 3 candidatos |
| Comparar com menos de 2 candidatos |
| Perder seleção ao navegar entre páginas |
| Layout quebrado com nomes longos |

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
