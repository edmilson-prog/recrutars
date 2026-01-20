# PRD-047: Teste Geral do Candidato (Gauge-Pro 2.0)

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-035` | Banner de Incentivo ao Teste DISC |
| `PRD-046` | Banco de Perguntas (pré-requisito) |
| `PRD-048` | Teste por Vaga - Empresa (próximo) |

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Painel Candidato |
| **Repositório** | github.com/aila-sistemas/recrutars |
| **Objetivo** | Implementar teste comportamental completo (Gauge-Pro 2.0) para candidatos, avaliando Personalidade, Caráter e Competências com análise por IA e integração com sistema de matching |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 6 |
| **Prioridade** | Alta |
| **Épico** | Gauge-Pro 2.0 — Sistema de Avaliação Comportamental |
| **PRDs Relacionados** | PRD-035, PRD-046, PRD-048 |
| **Padrão de código** | camelCase para componentes React |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** ✅ | 10+ arquivos, integração com IA, múltiplas telas, lógica de scoring complexa, gamificação |

---

## Contexto do Problema

O RecrutaRS atualmente possui apenas o teste DISC básico que avalia 4 dimensões. O Gauge-Pro 2.0 expande isso para **3 dimensões e 20 categorias**, oferecendo uma avaliação muito mais completa e precisa.

O teste é **voluntário mas fortemente incentivado** — candidatos com perfil completo têm **3x mais chances** de contratação.

---

## Conceito da Solução

### Situação Atual (As-Is)

- ~20 perguntas fixas, 4 dimensões DISC
- Resultado simples, sem insights personalizados
- Integração básica com matching

### Situação Desejada (To-Be)

- 50-60 perguntas selecionadas por IA
- 3 dimensões, 20 categorias de avaliação
- Formato: **Likert (escala 1-5) + Situacional (múltipla escolha A-D)**
- Análise por IA com insights personalizados
- Red flags detectados (alerta para recrutador, não bloqueante)
- Gamificação: +50 XP, badge "Perfil Completo"
- Progresso salvo, pode continuar depois

---

## Escopo

### Incluído

- ✅ Página de introdução ao teste
- ✅ Seleção inteligente de 50-60 perguntas por IA
- ✅ Interface de perguntas (Likert e Situacional - **múltipla escolha**)
- ✅ Barra de progresso e timer informativo
- ✅ Salvamento automático + pausar/continuar (até 7 dias)
- ✅ Análise por IA (Gauge-Pro)
- ✅ Cálculo de scores por categoria (0-100)
- ✅ Identificação de pontos fortes e áreas de desenvolvimento
- ✅ Detecção de red flags (alerta, não bloqueante)
- ✅ Insights personalizados em texto
- ✅ Tela de resultado com gráficos
- ✅ Gamificação (+50 XP, badge)
- ✅ Integração com matching de vagas
- ✅ Possibilidade de refazer após 90 dias

### Excluído

- ❌ Teste customizado por empresa (PRD-048)
- ❌ Link mágico (PRD-048)
- ❌ Perguntas abertas/dissertativas (apenas múltipla escolha)
- ❌ Bloqueio por red flags

---

## Fluxo do Candidato

```
[Banner de incentivo (PRD-035)]
         │
         ▼
[Clica "🚀 Aumentar Minhas Chances"]
         │
         ▼
┌─────────────────────────────────────────┐
│  PÁGINA DE INTRODUÇÃO                   │
│                                         │
│  🧠 Descubra seu Perfil Comportamental │
│                                         │
│  • 🎭 Personalidade (Big Five)         │
│  • 💎 Caráter (valores e princípios)   │
│  • 💼 Competências (habilidades)       │
│                                         │
│  ⏱️ 10-15 minutos | 📊 50-60 perguntas │
│  💾 Progresso salvo | 🎯 +50 XP        │
│                                         │
│  [🚀 Iniciar Teste]                    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  PERGUNTAS (50-60x)                     │
│                                         │
│  Pergunta 23 de 55    ████████░░ 42%   │
│                                         │
│  🎭 Personalidade > Abertura            │
│                                         │
│  "Gosto de experimentar novas formas   │
│   de fazer as coisas..."               │
│                                         │
│  ○ 1 - Discordo totalmente             │
│  ○ 2 - Discordo                        │
│  ● 3 - Neutro                    ✓     │
│  ○ 4 - Concordo                        │
│  ○ 5 - Concordo totalmente             │
│                                         │
│  [← Anterior]  [💾 Pausar]  [Próxima →]│
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  🧠 Analisando suas respostas...       │
│  [████████████████░░░░] 72%            │
│                                         │
│  ✓ Processando personalidade           │
│  ✓ Analisando traços de caráter        │
│  → Calculando competências             │
│  ○ Gerando insights personalizados     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  🎉 Parabéns! Perfil completo!         │
│  +50 XP • 🏆 Badge "Perfil Completo"   │
│                                         │
│  [Ver Meu Resultado Detalhado]         │
└─────────────────────────────────────────┘
```

---

## Modelo de Dados

### Tabela: `behavioral_assessments`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `candidateId` | UUID | FK → candidates |
| `status` | ENUM | 'in_progress', 'completed', 'expired' |
| `questionsIds` | JSONB | IDs das perguntas selecionadas |
| `totalQuestions` | INT | Total (50-60) |
| `currentQuestionIndex` | INT | Progresso atual |
| `answeredCount` | INT | Respondidas |
| `startedAt` | TIMESTAMP | Início |
| `lastActivityAt` | TIMESTAMP | Última atividade |
| `completedAt` | TIMESTAMP | Conclusão |
| `totalTimeSeconds` | INT | Tempo total |

### Tabela: `behavioral_responses`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `assessmentId` | UUID | FK → behavioral_assessments |
| `questionId` | UUID | FK → behavioral_questions |
| `response` | VARCHAR(10) | "1"-"5" (Likert) ou "A"-"D" (Situacional) |
| `score` | INT | Score calculado |
| `answeredAt` | TIMESTAMP | Quando respondeu |
| `timeSpentSeconds` | INT | Tempo na pergunta |

### Tabela: `behavioral_results`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `assessmentId` | UUID | FK |
| `candidateId` | UUID | FK |
| `overallScore` | INT | Score geral (0-100) |
| `personalityScore` | INT | Score personalidade |
| `characterScore` | INT | Score caráter |
| `competencyScore` | INT | Score competências |
| `categoryScores` | JSONB | Scores detalhados por categoria |
| `strengths` | JSONB | Top 3 pontos fortes |
| `developmentAreas` | JSONB | Top 3 áreas de desenvolvimento |
| `redFlags` | JSONB | Red flags detectados |
| `summary` | TEXT | Resumo gerado por IA |
| `insights` | JSONB | Insights por dimensão |
| `careerRecommendations` | JSONB | Tipos de cargo recomendados |
| `xpAwarded` | INT | XP concedido (50) |
| `badgeAwarded` | VARCHAR | Badge concedido |
| `generatedAt` | TIMESTAMP | Quando gerado |

---

## Requisitos Funcionais

### Iniciar Teste

- **RF-001:** Acesso via menu ou banner (PRD-035)
- **RF-002:** Se teste em andamento, exibir modal "Continuar?"
- **RF-003:** Se completou nos últimos 90 dias, exibir resultado anterior
- **RF-004:** Página de introdução com benefícios
- **RF-005:** Ao iniciar, criar sessão e selecionar perguntas

### Seleção de Perguntas (IA)

- **RF-006:** Selecionar 50-60 perguntas do banco (PRD-046)
- **RF-007:** Balancear: ~35% Personalidade, ~30% Caráter, ~35% Competências
- **RF-008:** Mínimo 2 perguntas por categoria (20 categorias)
- **RF-009:** Balancear níveis: ~30% Básico, ~40% Intermediário, ~30% Avançado
- **RF-010:** Misturar tipos (Likert e Situacional)
- **RF-011:** Randomizar ordem

### Interface de Perguntas

- **RF-012:** Uma pergunta por vez (mobile-friendly)
- **RF-013:** Progresso: "Pergunta X de Y" + barra percentual
- **RF-014:** Categoria visível (dimensão > categoria)
- **RF-015:** Timer informativo (sem limite)
- **RF-016:** Likert: escala 1-5 com labels claros
- **RF-017:** Situacional: opções A, B, C, D
- **RF-018:** Botão "Anterior" para voltar
- **RF-019:** "Próxima" habilitado só após selecionar
- **RF-020:** Salvar automático ao selecionar

### Progresso e Pausa

- **RF-021:** Botão "Salvar e continuar depois"
- **RF-022:** Sessão válida por 7 dias
- **RF-023:** Ao retornar, continuar da última pergunta
- **RF-024:** Permitir alterar respostas anteriores

### Análise por IA (Gauge-Pro)

- **RF-025:** Calcular score geral (0-100)
- **RF-026:** Calcular score por dimensão
- **RF-027:** Calcular score por categoria (20)
- **RF-028:** Identificar top 3 pontos fortes
- **RF-029:** Identificar top 3 áreas de desenvolvimento
- **RF-030:** Detectar red flags (baseado em thresholds)
- **RF-031:** Gerar insights personalizados em texto
- **RF-032:** Gerar recomendações de tipo de cargo
- **RF-033:** Se IA falhar, usar fallback com regras

### Tela de Resultado

- **RF-034:** Banner de parabéns com XP e badge
- **RF-035:** Gráfico radar para Personalidade
- **RF-036:** Barras de progresso por categoria
- **RF-037:** Destacar fortes (⭐) e desenvolvimento (📈)
- **RF-038:** Seção "Insights Personalizados"
- **RF-039:** Seção "Perfil de Cargo Recomendado"
- **RF-040:** Botão "Ver Vagas Compatíveis"
- **RF-041:** Data disponível para refazer (90 dias)

### Gamificação

- **RF-042:** +50 XP ao completar
- **RF-043:** Badge "Perfil Completo" 🏆
- **RF-044:** Animação de conquista

### Integração com Matching

- **RF-045:** Flag `behavioralProfileComplete = true`
- **RF-046:** Resultado usado no cálculo de match
- **RF-047:** Candidato aparece em filtros comportamentais

---

## Requisitos Não-Funcionais

- **RNF-001:** Análise por IA < 15 segundos
- **RNF-002:** Salvamento automático a cada resposta
- **RNF-003:** Interface mobile-first
- **RNF-004:** Navegação por teclado
- **RNF-005:** Fallback se IA falhar

---

## Critérios de Aceitação

### Iniciar Teste

```gherkin
DADO que o candidato acessa a página do teste
  E não tem teste em andamento
QUANDO clica em "Iniciar Teste"
ENTÃO deve criar sessão e exibir primeira pergunta

DADO que o candidato tem teste em andamento
QUANDO acessa a página
ENTÃO deve exibir modal "Continuar teste?"
```

### Responder Perguntas

```gherkin
DADO que o candidato está na pergunta 25
QUANDO seleciona opção "4 - Concordo"
ENTÃO a resposta deve ser salva automaticamente
  E o botão "Próxima" deve ficar habilitado
```

### Análise por IA

```gherkin
DADO que o candidato completou todas as perguntas
QUANDO a análise é executada
ENTÃO deve calcular scores por categoria
  E deve identificar pontos fortes e fracos
  E deve gerar insights em texto
  E deve detectar red flags (se houver)
```

### Gamificação

```gherkin
DADO que o candidato completou o teste
QUANDO o resultado é exibido
ENTÃO deve receber +50 XP
  E deve receber badge "Perfil Completo"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos |
|------|----------|----------|
| 1 | Modelo de dados | 3-4 |
| 2 | Seleção de perguntas | 2-3 |
| 3 | Interface de teste | 5-6 |
| 4 | Progresso e pausa | 2-3 |
| 5 | Análise por IA | 3-4 |
| 6 | Resultado e gamificação | 4-5 |

---

## Dependências

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-046 | Banco de Perguntas | ⏳ Pré-requisito |
| PRD-035 | Banner de Incentivo | ⏳ Paralelo |

---

## Cadeia de PRDs

| Ordem | PRD | Título | Status |
|-------|-----|--------|--------|
| 1 | PRD-046 | Banco de Perguntas | ⏳ |
| **2** | **PRD-047** | **Teste Geral Candidato** | **🔄 ATUAL** |
| 3 | PRD-048 | Teste por Vaga | ⏳ |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. VERIFICAR ENGINE DE IA:**
> Verificar se existe integração com OpenAI/Claude no projeto. Se não, implementar com regras fixas como fallback.

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar versão (SemVer)
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Princípios

| Princípio | Descrição |
|-----------|-----------|
| **Mobile-first** | Candidatos usam celular |
| **Salvamento automático** | Não perder respostas |
| **Fail gracefully** | Se IA falhar, usar fallback |
| **Não bloquear** | Red flags alertam, não bloqueiam |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Bloquear candidato por red flags |
| Perder respostas se conexão cair |
| Permitir refazer antes de 90 dias |
| Implementar perguntas abertas (apenas múltipla escolha) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Depende de** | PRD-046 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 20/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
