# PRD-008: Teste Comportamental

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar fluxo de teste comportamental (responder e visualizar resultado) |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | Múltiplos componentes, lógica de questionário, cálculo de resultado, visualização de perfil |

---

## Contexto do Problema

O diferencial do RecrutaRS é o matching comportamental baseado no Gauge-Pro. Para isso funcionar, candidatos precisam realizar o teste comportamental que mapeia seu perfil.

Atualmente:
- A página de testes (`/candidato/testes`) existe mas está básica
- Não há fluxo de responder ao teste
- Não há visualização de resultado
- Candidatos não conseguem demonstrar seu perfil comportamental

O teste comportamental permite:
- Matching preciso com vagas e cultura empresarial
- Diferenciação do candidato no mercado
- Dados ricos para empresas avaliarem fit cultural
- Base do produto premium do RecrutaRS

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────┐
│         Página de Testes            │
│                                     │
│  "Você ainda não realizou o teste"  │
│                                     │
│  [Botão sem ação]                   │
└─────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Teste Comportamental                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Status: ⏳ Não realizado                                  │  │
│  │                                                            │  │
│  │  O teste comportamental Gauge-Pro mapeia seu perfil        │  │
│  │  profissional e ajuda empresas a encontrar você.           │  │
│  │                                                            │  │
│  │  ⏱️ Tempo estimado: 15-20 minutos                          │  │
│  │  📊 50 questões de múltipla escolha                        │  │
│  │                                                            │  │
│  │                    [Iniciar Teste]                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

                           │
                           ▼ (após iniciar)

┌──────────────────────────────────────────────────────────────────┐
│                    Questão 15 de 50                              │
├──────────────────────────────────────────────────────────────────┤
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  30%                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Em situações de conflito no trabalho, você geralmente:    │  │
│  │                                                            │  │
│  │  ○ Busca mediar e encontrar um meio-termo                  │  │
│  │  ○ Defende sua posição com argumentos lógicos              │  │
│  │  ○ Prefere evitar o confronto direto                       │  │
│  │  ○ Consulta outras pessoas antes de se posicionar          │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                              [Próxima →]                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

                           │
                           ▼ (após concluir)

┌──────────────────────────────────────────────────────────────────┐
│                    Seu Perfil Comportamental                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    PERFIL: ANALÍTICO                       │  │
│  │                                                            │  │
│  │          Dominância: ████████░░ 75%                        │  │
│  │          Influência: ████░░░░░░ 40%                        │  │
│  │         Estabilidade: ██████░░░░ 60%                       │  │
│  │        Conformidade: █████████░ 85%                        │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Características Principais:                               │  │
│  │  • Orientado a dados e precisão                           │  │
│  │  • Analítico e detalhista                                 │  │
│  │  • Prefere ambientes estruturados                         │  │
│  │  • Toma decisões baseadas em fatos                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Ambientes Ideais:                                         │  │
│  │  • Empresas com processos bem definidos                   │  │
│  │  • Áreas que valorizam qualidade e precisão               │  │
│  │  • Equipes que apreciam planejamento                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│              [Baixar PDF]  [Compartilhar]  [Refazer]            │
└──────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Teste externo (link) | Perde controle da experiência, dados fora da plataforma |
| Teste curto (10 questões) | Resultado menos preciso |
| Sem visualização de resultado | Candidato não vê valor |

---

## Escopo

### Incluído

- ✅ Página inicial do teste com instruções e status
- ✅ Fluxo de questionário com 50 questões (mock simplificado)
- ✅ Barra de progresso durante o teste
- ✅ Navegação entre questões (próxima/anterior)
- ✅ Salvamento de progresso (estado local)
- ✅ Tela de conclusão
- ✅ Visualização do resultado (perfil DISC simplificado)
- ✅ Gráfico de perfil (barras ou radar)
- ✅ Descrição textual do perfil
- ✅ Status do teste na página principal

### Excluído

- ❌ Algoritmo real do Gauge-Pro (será mock/simulação)
- ❌ Integração com sistema externo de assessment
- ❌ Múltiplos tipos de teste
- ❌ Download real de PDF (mock)
- ❌ Compartilhamento em redes sociais
- ❌ Refazer teste (uma única vez nesta fase)
- ❌ Timer obrigatório por questão

---

## Requisitos Funcionais

### Página Inicial do Teste

- **RF-001:** Deve exibir status atual do teste (não realizado, em andamento, concluído)
- **RF-002:** Deve exibir informações sobre o teste (tempo, quantidade de questões)
- **RF-003:** Deve ter botão "Iniciar Teste" se não realizado
- **RF-004:** Deve ter botão "Continuar" se em andamento
- **RF-005:** Deve exibir resultado se concluído

### Fluxo do Questionário

- **RF-006:** Deve exibir uma questão por vez
- **RF-007:** Cada questão deve ter 4 opções de resposta
- **RF-008:** Deve exibir barra de progresso (questão X de Y)
- **RF-009:** Deve permitir navegar para próxima questão após responder
- **RF-010:** Deve permitir voltar para questão anterior
- **RF-011:** Deve salvar respostas no estado local
- **RF-012:** Ao sair, deve manter progresso (estado local)

### Conclusão

- **RF-013:** Ao responder última questão, deve processar resultado
- **RF-014:** Deve exibir tela de "Processando resultado..."
- **RF-015:** Deve calcular perfil baseado nas respostas (mock)
- **RF-016:** Deve salvar resultado no mock de dados

### Visualização do Resultado

- **RF-017:** Deve exibir nome do perfil principal (ex: "Analítico", "Comunicador")
- **RF-018:** Deve exibir gráfico com dimensões DISC (Dominância, Influência, Estabilidade, Conformidade)
- **RF-019:** Deve exibir descrição textual do perfil
- **RF-020:** Deve exibir características principais (lista)
- **RF-021:** Deve exibir ambientes de trabalho ideais
- **RF-022:** Deve ter botão "Baixar PDF" (mock - apenas toast)

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Transição entre questões deve ser suave
- **RNF-002 (Performance):** Cálculo do resultado em menos de 1 segundo
- **RNF-003 (Responsividade):** Questionário deve funcionar bem em mobile
- **RNF-004 (Acessibilidade):** Questões navegáveis por teclado

---

## Critérios de Aceitação

### RF-001 a RF-005: Página Inicial

```gherkin
DADO que o candidato não realizou o teste
QUANDO ele acessa /candidato/testes
ENTÃO deve ver status "Não realizado"
  E deve ver informações sobre o teste
  E deve ver botão "Iniciar Teste"
```

```gherkin
DADO que o candidato já concluiu o teste
QUANDO ele acessa /candidato/testes
ENTÃO deve ver status "Concluído"
  E deve ver seu resultado/perfil
  E não deve ver botão "Iniciar Teste"
```

### RF-006 a RF-012: Questionário

```gherkin
DADO que o candidato iniciou o teste
QUANDO ele está na questão 15
ENTÃO deve ver "Questão 15 de 50"
  E deve ver barra de progresso em 30%
  E deve ver 4 opções de resposta
```

```gherkin
DADO que o candidato respondeu uma questão
QUANDO ele clica em "Próxima"
ENTÃO deve avançar para próxima questão
  E a resposta deve ser salva
  E o progresso deve atualizar
```

### RF-017 a RF-022: Resultado

```gherkin
DADO que o candidato concluiu o teste
QUANDO o resultado é calculado
ENTÃO deve exibir nome do perfil (ex: "Analítico")
  E deve exibir gráfico DISC
  E deve exibir descrição do perfil
  E deve exibir características principais
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e dados do teste | 3 |
| 2 | Página inicial e status | 2 |
| 3 | Fluxo do questionário | 4 |
| 4 | Cálculo e resultado | 3 |
| 5 | Visualização do perfil | 3 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Dados

**Objetivo:** Criar estrutura de dados e questões mock

**Ações:**
- [ ] Criar tipos para teste (TestQuestion, TestAnswer, TestResult)
- [ ] Criar mock de 50 questões (pode ser repetido/simplificado)
- [ ] Definir estrutura do resultado DISC
- [ ] Criar perfis de resultado (4-8 perfis possíveis)

**Validação:** Dados estruturados e tipados

#### Fase 2: Página Inicial

**Objetivo:** Implementar página de status do teste

**Ações:**
- [ ] Criar/atualizar página `/candidato/testes`
- [ ] Implementar exibição de status
- [ ] Implementar informações do teste
- [ ] Implementar botões de ação

**Validação:** Página exibe status correto

#### Fase 3: Questionário

**Objetivo:** Implementar fluxo de responder questões

**Ações:**
- [ ] Criar componente `TestQuestion`
- [ ] Criar componente `TestProgress`
- [ ] Implementar navegação entre questões
- [ ] Implementar salvamento de respostas
- [ ] Implementar persistência de progresso

**Validação:** Candidato consegue responder todas as questões

#### Fase 4: Cálculo do Resultado

**Objetivo:** Processar respostas e gerar perfil

**Ações:**
- [ ] Criar função de cálculo de perfil (mock)
- [ ] Mapear respostas para dimensões DISC
- [ ] Determinar perfil principal
- [ ] Salvar resultado no mock

**Validação:** Resultado é calculado e salvo

#### Fase 5: Visualização

**Objetivo:** Exibir resultado de forma visual

**Ações:**
- [ ] Criar componente `ProfileChart` (barras ou radar)
- [ ] Criar componente `ProfileDescription`
- [ ] Criar componente `ProfileCharacteristics`
- [ ] Implementar layout completo do resultado

**Validação:** Resultado é exibido de forma clara e visual

---

## Modelo de Dados

### Tipos do Teste

```typescript
interface TestQuestion {
  id: string;
  text: string;
  options: TestOption[];
  dimension: "D" | "I" | "S" | "C"; // qual dimensão DISC essa questão mede
}

interface TestOption {
  id: string;
  text: string;
  value: number; // 1-4, peso da resposta
}

interface TestAnswer {
  questionId: string;
  optionId: string;
  value: number;
}

interface TestResult {
  id: string;
  candidateId: string;
  profileName: string; // "Analítico", "Comunicador", etc.
  scores: {
    dominance: number;    // 0-100
    influence: number;    // 0-100
    steadiness: number;   // 0-100
    compliance: number;   // 0-100
  };
  description: string;
  characteristics: string[];
  idealEnvironments: string[];
  completedAt: string;
}
```

### Perfis Possíveis (Mock)

| Perfil | D | I | S | C | Descrição |
|--------|---|---|---|---|-----------|
| Executor | Alto | Médio | Baixo | Médio | Orientado a resultados |
| Comunicador | Médio | Alto | Médio | Baixo | Orientado a pessoas |
| Planejador | Baixo | Médio | Alto | Médio | Orientado a estabilidade |
| Analítico | Médio | Baixo | Médio | Alto | Orientado a qualidade |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-005 | Perfil do Candidato | ⏳ Pendente |

### PRDs Seguintes

| PRD | Descrição |
|-----|-----------|
| (Empresa) | Visualização de perfil do candidato |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.7.0 → 0.8.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.8.0] - 2026-01-XX

### Added
- Teste comportamental com 50 questões
- Barra de progresso durante o teste
- Cálculo de perfil DISC (mock)
- Visualização de resultado com gráfico
- Descrição e características do perfil
- Salvamento de progresso do teste
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Questões** | Pode repetir/simplificar, foco é no fluxo |
| **Gráfico** | Usar Recharts (já disponível) ou barras CSS |
| **Cálculo** | Mock simples, média das respostas por dimensão |
| **Estado** | useState ou useReducer para questionário |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Algoritmo complexo de assessment |
| Integração com APIs externas |
| Timer obrigatório |
| Múltiplas tentativas nesta fase |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Observações** | Depende de PRD-004, PRD-005 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
