# PRD-006: Busca e Visualização de Vagas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar listagem de vagas com filtros e página de detalhes |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 4-6 componentes, lógica de filtros, múltiplas views |

---

## Contexto do Problema

Para que candidatos encontrem oportunidades adequadas ao seu perfil, eles precisam de uma experiência de busca eficiente e completa.

Atualmente:
- A página de busca de vagas (`/candidato/vagas`) existe mas está básica
- Não há filtros funcionais
- A visualização de detalhes é limitada
- Não há indicadores de compatibilidade

Uma busca eficiente permite:
- Candidatos encontrarem vagas relevantes rapidamente
- Melhor taxa de conversão (candidaturas)
- Menor frustração do usuário
- Base para matching inteligente futuro

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────┐
│         Busca de Vagas              │
│  ┌────────────────────────────────┐ │
│  │ [Campo de busca]               │ │
│  └────────────────────────────────┘ │
│                                     │
│  • Vaga 1 - Empresa X               │
│  • Vaga 2 - Empresa Y               │
│  • Vaga 3 - Empresa Z               │
│                                     │
│  [Sem filtros, sem detalhes ricos]  │
└─────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌──────────────────────────────────────────────────────────┐
│                    Busca de Vagas                        │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔍 [Buscar por cargo, empresa ou palavra-chave...] │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ Localização │  │ Tipo (CLT)  │  │ Salário: R$X-Y   │  │
│  └─────────────┘  └─────────────┘  └──────────────────┘  │
│                                                          │
│  Exibindo 24 vagas                    [Ordenar por ▼]   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 💼 Desenvolvedor React Senior                      │  │
│  │ TechCorp | São Paulo, SP | CLT                     │  │
│  │ R$ 12.000 - R$ 18.000                              │  │
│  │ [React] [TypeScript] [Node.js]                     │  │
│  │                                    [Ver detalhes]  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│               [1] [2] [3] ... [10] [→]                   │
└──────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Modal para detalhes | Dificulta compartilhamento de link, UX inferior |
| Filtros em sidebar | Ocupa espaço em mobile, filtros inline são mais modernos |
| Infinite scroll | Paginação é mais previsível para o usuário |

---

## Escopo

### Incluído

- ✅ Campo de busca por texto (cargo, empresa, palavra-chave)
- ✅ Filtro por localização (select ou input)
- ✅ Filtro por tipo de contrato (CLT, PJ, Freelancer, Estágio)
- ✅ Filtro por faixa salarial (range ou min/max)
- ✅ Ordenação (mais recentes, salário, relevância)
- ✅ Card de vaga com informações resumidas
- ✅ Página de detalhes da vaga (`/candidato/vagas/:id`)
- ✅ Paginação de resultados
- ✅ Contador de resultados
- ✅ Estado vazio (nenhuma vaga encontrada)
- ✅ Botão "Candidatar-se" (navega para fluxo de candidatura)

### Excluído

- ❌ Matching inteligente por IA (fase futura)
- ❌ Salvar vaga nos favoritos (fase futura)
- ❌ Alertas de novas vagas
- ❌ Compartilhar vaga em redes sociais
- ❌ Filtro por data de publicação
- ❌ Mapa de localização

---

## Requisitos Funcionais

### Busca

- **RF-001:** O sistema deve permitir busca por texto livre (cargo, empresa, palavra-chave)
- **RF-002:** A busca deve ser case-insensitive
- **RF-003:** A busca deve atualizar resultados ao digitar (debounce de 300ms)
- **RF-004:** Deve haver botão para limpar busca

### Filtros

- **RF-005:** O sistema deve permitir filtrar por localização
- **RF-006:** O sistema deve permitir filtrar por tipo de contrato (multi-select)
- **RF-007:** O sistema deve permitir filtrar por faixa salarial (min e/ou max)
- **RF-008:** Filtros devem ser combináveis (AND)
- **RF-009:** Deve haver botão "Limpar filtros"
- **RF-010:** Filtros ativos devem ser visualmente indicados

### Listagem

- **RF-011:** Vagas devem ser exibidas em cards com: título, empresa, localização, tipo, salário, skills
- **RF-012:** Deve exibir contador de resultados
- **RF-013:** Deve permitir ordenar por: mais recentes, maior salário, menor salário
- **RF-014:** Deve haver paginação (10-20 itens por página)
- **RF-015:** Deve exibir estado vazio quando não houver resultados

### Detalhes da Vaga

- **RF-016:** Cada vaga deve ter página de detalhes em `/candidato/vagas/:id`
- **RF-017:** Deve exibir: título, empresa, localização, tipo, salário, descrição, requisitos, benefícios
- **RF-018:** Deve haver botão "Voltar" para retornar à busca
- **RF-019:** Deve haver botão "Candidatar-se"
- **RF-020:** Deve exibir informações da empresa

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Filtragem em menos de 100ms
- **RNF-002 (UX):** Debounce de 300ms na busca
- **RNF-003 (Responsividade):** Layout de 320px a 1920px
- **RNF-004 (Acessibilidade):** Navegável por teclado

---

## Critérios de Aceitação

### Busca e Filtros

```gherkin
DADO que o candidato está na página de busca
QUANDO ele digita "React" no campo de busca
ENTÃO os resultados devem ser filtrados após 300ms
  E apenas vagas com "React" devem aparecer
```

```gherkin
DADO que o candidato aplicou filtros
QUANDO ele clica em "Limpar filtros"
ENTÃO todos os filtros devem ser resetados
```

### Detalhes

```gherkin
DADO que o candidato clica em "Ver detalhes"
QUANDO a página de detalhes carrega
ENTÃO deve ver todas as informações da vaga
  E deve ver botão "Candidatar-se"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Análise e estrutura | 2 |
| 2 | Listagem e cards | 3 |
| 3 | Busca e filtros | 3 |
| 4 | Página de detalhes | 2 |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ✅ Implementado |

### PRDs Seguintes

| PRD | Descrição |
|-----|-----------|
| PRD-007 | Candidatura a Vagas |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.5.0 → 0.6.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.6.0] - 2026-01-XX

### Added
- Busca de vagas com filtros
- Cards de vaga com informações resumidas
- Página de detalhes da vaga
- Paginação e ordenação
```

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Fetch real de dados |
| Lógica de candidatura (é PRD-007) |
| Infinite scroll |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 11/01/2026 |
| **Versão do App** | 0.6.0 |
| **Implementado por** | Agente Desenvolvedor (Claude Opus 4.5 via Claude Code CLI) |
| **Observações** | Implementado com debounce, ordenação, paginação e página de detalhes dedicada. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 10/01/2026 | v1 | Criação inicial |
| 11/01/2026 | v2 | Implementação concluída (v0.6.0) |

---

**AILA - Sistemas Inteligentes**
