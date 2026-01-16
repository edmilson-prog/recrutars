# PRD-035-ia-all: Transparência e Explicabilidade do Matching por IA

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar sistema de explicabilidade do algoritmo de matching, mostrando aos usuários como e por que o score de compatibilidade foi calculado |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Inteligência Artificial |
| **Perfil** | Todos (Candidato, Empresa, Admin) |
| **PRDs Relacionados** | PRD-008 (Teste Comportamental), PRD-002-dgn (Visualização DISC) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 10+ arquivos, lógica de cálculo complexa, múltiplas visualizações, impacta 3 perfis de usuário |

---

## Contexto do Problema

O RecrutaRS utiliza um algoritmo de matching que calcula a compatibilidade entre candidatos e vagas baseado em múltiplos fatores: skills técnicas, experiência, perfil comportamental DISC e localização. Atualmente, o resultado é exibido apenas como um número percentual (ex: "85% de match"), sem explicar quais fatores contribuíram para esse score.

Essa falta de transparência gera problemas reais:

| Problema | Impacto |
|----------|---------|
| **Candidatos frustrados** | "Por que tenho apenas 60% de match se tenho todas as skills?" |
| **Recrutadores inseguros** | "O que diferencia esses dois candidatos com 82% e 78%?" |
| **Desconfiança no sistema** | Usuários não confiam em "caixas-pretas" algorítmicas |
| **Risco legal** | GDPR e NYC Local Law 144 exigem explicabilidade em decisões automatizadas de RH |

A transparência algorítmica é um diferencial competitivo. Plataformas como LinkedIn mostram "Por que você foi recomendado", gerando confiança e engajamento.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vaga: Dev React Senior                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         ┌───────┐                               │
│                         │       │                               │
│                         │  78%  │                               │
│                         │       │                               │
│                         └───────┘                               │
│                      Compatibilidade                            │
│                                                                 │
│                  (nenhuma explicação)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vaga: Dev React Senior                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          ┌───────┐                                      │    │
│  │          │       │     Sua Compatibilidade              │    │
│  │          │  78%  │     ━━━━━━━━━━━━━━━━━━━              │    │
│  │          │       │                                      │    │
│  │          └───────┘                                      │    │
│  │                                                         │    │
│  │  BREAKDOWN DO SCORE                                     │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │  Skills Técnicas (40%)        ████████████░░  85%       │    │
│  │  Experiência (30%)            ██████████░░░░  72%       │    │
│  │  Perfil Comportamental (20%)  ██████████████  95%       │    │
│  │  Localização (10%)            ████░░░░░░░░░░  40%       │    │
│  │                                                         │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │                                                         │    │
│  │  ✅ POR QUE VOCÊ COMBINA                                │    │
│  │  • Experiência com React excede o requisito (5+ anos)   │    │
│  │  • Perfil Analítico alinhado com cultura técnica        │    │
│  │  • TypeScript no nível avançado                         │    │
│  │                                                         │    │
│  │  💡 OPORTUNIDADES DE MELHORIA                           │    │
│  │  • Adicionar GraphQL pode aumentar match em +8%         │    │
│  │  • Disponibilidade para híbrido aumentaria em +12%      │    │
│  │                                                         │    │
│  │  [ℹ️ Como calculamos seu match?]                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Mostrar apenas % sem breakdown | Não resolve o problema de confiança |
| Explicação genérica igual para todos | Não é personalizada, perde valor |
| Mostrar fórmula matemática completa | Muito técnico, confunde usuário comum |

---

## Escopo

### Incluído

- ✅ Componente `MatchScoreCard` com score total + breakdown
- ✅ Progress bars por categoria (Skills, Experiência, DISC, Localização)
- ✅ Pesos configuráveis por categoria (somando 100%)
- ✅ Seção "Por que você combina" com pontos fortes específicos
- ✅ Seção "Oportunidades de melhoria" com sugestões acionáveis
- ✅ Cores semânticas: ≥80% verde, 60-79% amarelo, <60% vermelho
- ✅ Tooltips explicativos em cada categoria
- ✅ Modal "Como calculamos seu match?" com metodologia
- ✅ Visão do Candidato: ver match em vagas
- ✅ Visão da Empresa: ver match de candidatos com suas vagas
- ✅ Comparação lado-a-lado de breakdowns (para recrutadores)

### Excluído

- ❌ Alteração do algoritmo de matching (apenas visualização)
- ❌ Ajuste manual de pesos pelo usuário
- ❌ Machine Learning dinâmico (pesos são fixos nesta fase)
- ❌ Exportação de relatório de match em PDF
- ❌ Histórico de evolução do match ao longo do tempo

---

## Requisitos Funcionais

### Componente MatchScoreCard

- **RF-001:** Deve exibir score total em formato circular/ring com percentual
- **RF-002:** Cor do score deve ser semântica: ≥80% `success`, 60-79% `warning`, <60% `destructive`
- **RF-003:** Deve exibir breakdown com 4 categorias: Skills, Experiência, Perfil DISC, Localização
- **RF-004:** Cada categoria deve ter progress bar horizontal com percentual
- **RF-005:** Progress bars devem usar mesma escala de cores semânticas
- **RF-006:** Pesos padrão: Skills 40%, Experiência 30%, DISC 20%, Localização 10%
- **RF-007:** Tooltip em cada categoria deve explicar o que é avaliado

### Cálculo do Match (Motor de Explicabilidade)

- **RF-008:** Função `calculateMatchBreakdown(candidato, vaga)` deve retornar objeto com scores por categoria
- **RF-009:** Score de Skills deve comparar skills do candidato com requisitos da vaga
- **RF-010:** Score de Experiência deve comparar anos de experiência com requisito mínimo
- **RF-011:** Score de DISC deve comparar perfil do candidato com perfil ideal da vaga
- **RF-012:** Score de Localização deve considerar: mesmo cidade (100%), mesmo estado (70%), remoto aceito (50%), outros (20%)
- **RF-013:** Score total = soma ponderada dos scores individuais

### Seção "Por que você combina"

- **RF-014:** Deve listar 3-5 pontos fortes específicos do candidato para a vaga
- **RF-015:** Pontos devem ser frases completas e específicas (não genéricas)
- **RF-016:** Deve destacar skills que excedem o requisito
- **RF-017:** Deve mencionar alinhamento de perfil DISC quando relevante
- **RF-018:** Deve incluir ícone ✅ antes de cada ponto

### Seção "Oportunidades de Melhoria"

- **RF-019:** Deve listar 2-3 sugestões acionáveis
- **RF-020:** Cada sugestão deve indicar impacto potencial (ex: "+8%")
- **RF-021:** Sugestões devem ser baseadas em gaps reais (skills faltantes, localização)
- **RF-022:** Deve incluir ícone 💡 antes de cada sugestão
- **RF-023:** Não exibir se match ≥ 95%

### Modal de Metodologia

- **RF-024:** Botão "Como calculamos?" deve abrir modal explicativo
- **RF-025:** Modal deve explicar cada categoria e seu peso
- **RF-026:** Deve incluir exemplo visual simplificado
- **RF-027:** Deve mencionar que algoritmo não usa dados sensíveis (raça, gênero, idade)
- **RF-028:** Deve ter link para política de privacidade

### Visão do Candidato

- **RF-029:** Exibir MatchScoreCard na página de detalhes da vaga
- **RF-030:** Exibir MatchScoreCard resumido nos cards de vagas recomendadas
- **RF-031:** Exibir breakdown completo ao clicar em "Ver detalhes do match"

### Visão da Empresa

- **RF-032:** Exibir MatchScoreCard no perfil do candidato (Banco de Talentos)
- **RF-033:** Exibir match resumido nos cards de candidatos
- **RF-034:** Permitir comparar breakdown de até 3 candidatos lado-a-lado
- **RF-035:** Destacar categorias onde candidatos diferem significativamente (>15%)

### Visão do Admin

- **RF-036:** Dashboard com estatísticas de matches da plataforma
- **RF-037:** Média de match por categoria (identificar gargalos)
- **RF-038:** Alertas de vagas com poucos candidatos de alto match

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Cálculo de match deve completar em < 100ms
- **RNF-002 (Performance):** Renderização do componente em < 200ms
- **RNF-003 (Acessibilidade):** Valores nunca apenas por cor, sempre incluir texto/número
- **RNF-004 (Acessibilidade):** Suporte a screen readers com aria-labels
- **RNF-005 (Responsividade):** Componente deve funcionar em mobile (empilhar verticalmente)
- **RNF-006 (Consistência):** Mesmo cálculo deve gerar mesmo resultado sempre (determinístico)

---

## Critérios de Aceitação

### RF-001 a RF-007: MatchScoreCard Visual

```gherkin
DADO que um candidato visualiza uma vaga
QUANDO o componente MatchScoreCard é renderizado
ENTÃO deve exibir score total em formato circular
  E deve usar cor verde se score ≥ 80%
  E deve usar cor amarela se score entre 60-79%
  E deve usar cor vermelha se score < 60%
  E deve exibir 4 progress bars com percentuais
  E cada progress bar deve ter tooltip explicativo
```

### RF-008 a RF-013: Cálculo do Match

```gherkin
DADO um candidato com perfil completo
  E uma vaga com requisitos definidos
QUANDO a função calculateMatchBreakdown é executada
ENTÃO deve retornar objeto com scores para Skills, Experiência, DISC, Localização
  E score total deve ser soma ponderada (40%, 30%, 20%, 10%)
  E todos os scores devem estar entre 0 e 100
```

### RF-014 a RF-018: Pontos Fortes

```gherkin
DADO um candidato com match > 50% em uma vaga
QUANDO a seção "Por que você combina" é renderizada
ENTÃO deve listar entre 3 e 5 pontos fortes
  E cada ponto deve ser específico ao candidato/vaga
  E cada ponto deve ter ícone ✅
```

### RF-019 a RF-023: Oportunidades

```gherkin
DADO um candidato com match < 95% em uma vaga
QUANDO a seção "Oportunidades de melhoria" é renderizada
ENTÃO deve listar entre 1 e 3 sugestões
  E cada sugestão deve indicar impacto potencial
  E cada sugestão deve ter ícone 💡

DADO um candidato com match ≥ 95%
QUANDO a seção "Oportunidades de melhoria" seria renderizada
ENTÃO não deve exibir a seção
```

### RF-034 a RF-035: Comparação de Candidatos

```gherkin
DADO que um recrutador seleciona 2 ou 3 candidatos
QUANDO solicita comparação lado-a-lado
ENTÃO deve exibir breakdowns em colunas paralelas
  E deve destacar categorias com diferença > 15%
  E deve permitir identificar rapidamente qual candidato é melhor em cada categoria
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Motor de cálculo e tipos | 4 |
| 2 | Componentes visuais base | 5 |
| 3 | Integração na visão Candidato | 3 |
| 4 | Integração na visão Empresa | 4 |
| 5 | Dashboard Admin e refinamentos | 3 |

### Detalhamento das Fases

#### Fase 1: Motor de Cálculo

**Objetivo:** Implementar lógica de cálculo de match com breakdown

**Ações:**
- [ ] Criar tipo `MatchBreakdown` com scores por categoria
- [ ] Criar tipo `MatchExplanation` com pontos fortes e oportunidades
- [ ] Implementar `calculateSkillsScore(candidato, vaga)`
- [ ] Implementar `calculateExperienceScore(candidato, vaga)`
- [ ] Implementar `calculateDISCScore(candidato, vaga)`
- [ ] Implementar `calculateLocationScore(candidato, vaga)`
- [ ] Implementar `calculateMatchBreakdown(candidato, vaga)`
- [ ] Implementar `generateMatchExplanation(breakdown, candidato, vaga)`

**Validação:** Testes unitários com casos de uso variados

#### Fase 2: Componentes Visuais

**Objetivo:** Criar componentes reutilizáveis de visualização

**Ações:**
- [ ] Criar `MatchScoreRing` (círculo com percentual)
- [ ] Criar `MatchBreakdownBar` (progress bar individual)
- [ ] Criar `MatchScoreCard` (composição completa)
- [ ] Criar `MatchStrengthsList` (pontos fortes)
- [ ] Criar `MatchOpportunitiesList` (oportunidades)
- [ ] Criar `MatchMethodologyModal` (explicação da metodologia)
- [ ] Implementar responsividade mobile

**Validação:** Componentes renderizam corretamente em Storybook/preview

#### Fase 3: Integração Candidato

**Objetivo:** Exibir match explicado na jornada do candidato

**Ações:**
- [ ] Integrar `MatchScoreCard` na página de detalhes da vaga
- [ ] Adicionar match resumido nos cards de vagas
- [ ] Implementar "Ver detalhes do match" expandível
- [ ] Testar fluxo completo do candidato

**Validação:** Candidato consegue ver e entender seu match em qualquer vaga

#### Fase 4: Integração Empresa

**Objetivo:** Exibir match explicado na jornada da empresa

**Ações:**
- [ ] Integrar `MatchScoreCard` no perfil do candidato
- [ ] Adicionar match resumido nos cards do Banco de Talentos
- [ ] Implementar comparação lado-a-lado de candidatos
- [ ] Destacar diferenças significativas na comparação

**Validação:** Recrutador consegue comparar candidatos de forma informada

#### Fase 5: Admin e Refinamentos

**Objetivo:** Dashboard administrativo e ajustes finais

**Ações:**
- [ ] Criar widget de estatísticas de match no Dashboard Admin
- [ ] Implementar alertas de vagas com poucos matches altos
- [ ] Ajustar textos e UX baseado em feedback
- [ ] Documentar metodologia para FAQ

**Validação:** Admin tem visibilidade sobre saúde dos matches na plataforma

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-008 | Teste Comportamental (DISC) | ⏳ Pendente |
| PRD-013 | CRUD de Vagas | ⏳ Pendente |
| PRD-014 | Banco de Talentos | ⏳ Pendente |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum | - | - |

### Decisões Pendentes

- [ ] Confirmar pesos exatos das categorias com stakeholders
- [ ] Definir se perfil DISC da vaga será definido manualmente ou inferido

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Inteligência Artificial"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| **1** | **PRD-035-ia-all** | **Transparência do Matching** | **🔄 ATUAL** | Base para IA |
| 2 | PRD-036-ia-cand | Recomendação de Vagas | ⏳ | Depende de 035 |
| 3 | PRD-037-ia-emp | Recomendação de Candidatos | ⏳ | Depende de 035 |
| 4 | PRD-038-ia-cand | Parser de Currículo | ⏳ | Independente |
| 5 | PRD-039-ia-emp | Assistente de Redação de Vagas | ⏳ | Independente |
| 6 | PRD-040-ia-all | Chatbot de Suporte | ⏳ | Depende de 035-039 |
| 7 | PRD-041-ia-all | Mensagens Personalizadas | ⏳ | Independente |
| 8 | PRD-042-ia-cand | Análise de Fit Cultural | ⏳ | Depende de 035 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Score de match | Público para usuário | Visível apenas para candidato e empresa da vaga |
| Breakdown detalhado | Público para usuário | Mesmo acima |
| Algoritmo/pesos | Interno | Não expor fórmula exata, apenas conceitual |

### Autenticação e Autorização

- Candidato só vê match de vagas públicas ou que se candidatou
- Empresa só vê match de candidatos que se candidataram ou estão no Banco de Talentos
- Admin vê estatísticas agregadas, não matches individuais

### Auditoria

- Logar quando usuário visualiza breakdown detalhado
- Não logar scores individuais (volume muito alto)

---

## Fluxos de Usuário

### Fluxo do Candidato

```
[Candidato] ──▶ [Busca Vagas] ──▶ [Vê card com match resumido]
                                         │
                                         ▼
                               [Clica na vaga]
                                         │
                                         ▼
                            [Vê MatchScoreCard completo]
                                         │
                                         ▼
                            [Entende por que combina/não combina]
                                         │
                                         ▼
                            [Decide se candidata ou melhora perfil]
```

### Fluxo da Empresa

```
[Recrutador] ──▶ [Banco de Talentos] ──▶ [Vê cards com match]
                                                │
                                                ▼
                                    [Seleciona 2-3 candidatos]
                                                │
                                                ▼
                                    [Clica "Comparar"]
                                                │
                                                ▼
                                    [Vê breakdowns lado-a-lado]
                                                │
                                                ▼
                                    [Identifica melhor candidato]
```

### Fluxos de Erro

```
DADO que o candidato não tem perfil DISC preenchido
QUANDO visualiza match de uma vaga
ENTÃO deve exibir "Complete o teste comportamental para match mais preciso"
  E score de DISC deve ser N/A ou 50% (neutro)
```

---

## Mockups Conceituais

### MatchScoreCard Completo

```
┌─────────────────────────────────────────────────────────────────┐
│  SUA COMPATIBILIDADE COM ESTA VAGA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│       ┌─────────────┐                                           │
│       │             │                                           │
│       │     78%     │   Match Geral                             │
│       │  ████████░░ │                                           │
│       └─────────────┘                                           │
│                                                                 │
│  COMO SEU MATCH É CALCULADO                                     │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  Skills Técnicas (40%)              ℹ️                          │
│  ████████████████░░░░  85%                                      │
│                                                                 │
│  Experiência (30%)                  ℹ️                          │
│  ██████████████░░░░░░  72%                                      │
│                                                                 │
│  Perfil Comportamental (20%)        ℹ️                          │
│  ██████████████████░░  95%                                      │
│                                                                 │
│  Localização (10%)                  ℹ️                          │
│  ████████░░░░░░░░░░░░  40%                                      │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  ✅ POR QUE VOCÊ COMBINA                                        │
│  • Sua experiência com React (6 anos) excede o requisito (3+)   │
│  • Seu perfil Analítico é ideal para esta cultura técnica       │
│  • TypeScript em nível avançado - skill prioritária da vaga     │
│                                                                 │
│  💡 OPORTUNIDADES PARA AUMENTAR SEU MATCH                       │
│  • Adicionar GraphQL ao perfil pode aumentar em +8%             │
│  • Indicar disponibilidade para híbrido: +12%                   │
│                                                                 │
│                      [ℹ️ Como calculamos seu match?]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Comparação Lado-a-Lado (Empresa)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COMPARAR CANDIDATOS — Vaga: Dev React Senior                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  │ João Silva          │ Maria Santos        │ Pedro Lima          │       │
│  │ 85% ████████████░░  │ 78% ██████████░░░░  │ 72% █████████░░░░░  │       │
│  │                     │                     │                     │       │
│  │ Skills      92%     │ Skills      85%     │ Skills      88%     │       │
│  │ ████████████████░░  │ ████████████████░░  │ ████████████████░░  │       │
│  │                     │                     │                     │       │
│  │ Experiência 88%     │ Experiência 75%     │ Experiência 65% ⚠️  │       │
│  │ █████████████████░  │ ██████████████░░░░  │ ████████████░░░░░░  │       │
│  │                     │                     │                     │       │
│  │ DISC        78%     │ DISC        82%     │ DISC        70%     │       │
│  │ ███████████████░░░  │ ████████████████░░  │ █████████████░░░░░  │       │
│  │                     │                     │                     │       │
│  │ Local       80%     │ Local       60%     │ Local       80%     │       │
│  │ ████████████████░░  │ ████████████░░░░░░  │ ████████████████░░  │       │
│  │                     │                     │                     │       │
│  │ [Ver Perfil]        │ [Ver Perfil]        │ [Ver Perfil]        │       │
│  │ [Convidar]          │ [Convidar]          │ [Convidar]          │       │
│                                                                             │
│  ⚠️ = Diferença significativa (>15% abaixo do melhor)                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-035-ia-all-transparencia-matching_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinome sugerido:** `Oracle` (representa a explicabilidade e transparência)

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
| **Não bloquear fluxo principal** | Se cálculo falhar, mostrar score simples sem breakdown |
| **Fail gracefully** | Se DISC não preenchido, calcular com peso redistribuído |
| **Preservar evidências** | Logar inputs do cálculo para debug |
| **Testar incrementalmente** | Validar cada função de score isoladamente |
| **Documentar decisões** | Registrar escolhas de pesos e fórmulas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Biblioteca de gráficos** | Usar Recharts para progress bars e rings |
| **Cores semânticas** | Usar tokens do design system (success, warning, destructive) |
| **Responsividade** | Progress bars empilham verticalmente em mobile |
| **Acessibilidade** | Sempre incluir texto junto com cor |
| **Performance** | Memoizar cálculos com useMemo quando inputs não mudam |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Expor fórmula matemática exata para o usuário |
| Usar apenas cor para indicar score (sempre incluir número) |
| Fazer cálculos síncronos que bloqueiem a UI |
| Hardcodar pesos em múltiplos lugares (centralizar em config) |
| Mostrar scores negativos ou acima de 100% |
| Comparar mais de 3 candidatos simultaneamente (fica confuso) |

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
| 16/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
