# PRD-039-ia-emp: Assistente Inteligente de Redação de Vagas

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar assistente de IA que analisa descrições de vagas e sugere melhorias para aumentar qualidade, atratividade e taxa de candidaturas |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Épico** | Inteligência Artificial |
| **Perfil** | Empresa |
| **PRDs Relacionados** | PRD-013 (CRUD de Vagas) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 6-8 arquivos, análise de texto, regras heurísticas, integração com formulário de vaga |

---

## Contexto do Problema

A qualidade da descrição de uma vaga impacta diretamente a quantidade e qualidade de candidaturas. Problemas comuns em descrições de vagas:

| Problema | Impacto |
|----------|---------|
| **Descrição vaga ou curta** | Candidatos não entendem a oportunidade |
| **Falta de faixa salarial** | -47% de candidaturas (dado de mercado) |
| **Requisitos excessivos** | Afasta candidatos qualificados |
| **Linguagem enviesada** | Reduz diversidade de candidatos |
| **Falta de benefícios** | Menos atrativa que concorrentes |
| **Erros gramaticais** | Passa impressão de falta de profissionalismo |

Recrutadores, especialmente em empresas menores, não são especialistas em copywriting de vagas. Um assistente de IA pode democratizar o acesso a boas práticas de redação.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Criar Nova Vaga                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Título: [Dev React                    ]                        │
│                                                                 │
│  Descrição:                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Precisamos de desenvolvedor React.                      │    │
│  │ Requisitos: React, experiência.                         │    │
│  │ Interessados enviar currículo.                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Salário: [Não informado ▼]                                     │
│                                                                 │
│                              [Publicar]                         │
│                                                                 │
│  😕 Vaga publicada → poucas candidaturas                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Criar Nova Vaga                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Título: [Dev React                    ]                        │
│                                                                 │
│  Descrição:                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Precisamos de desenvolvedor React.                      │    │
│  │ Requisitos: React, experiência.                         │    │
│  │ Interessados enviar currículo.                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🤖 ASSISTENTE DE VAGA                    Score: 45/100  │    │
│  │ ─────────────────────────────────────────────────────── │    │
│  │                                                         │    │
│  │ ⚠️ MELHORIAS SUGERIDAS                                  │    │
│  │                                                         │    │
│  │ 🔴 Adicione faixa salarial (+25 pontos)                 │    │
│  │    Vagas com salário recebem 47% mais candidaturas      │    │
│  │    [Adicionar faixa salarial]                           │    │
│  │                                                         │    │
│  │ 🟡 Descrição muito curta (+15 pontos)                   │    │
│  │    Recomendado: 150-300 palavras. Atual: 12 palavras    │    │
│  │    [✨ Gerar sugestão de descrição]                     │    │
│  │                                                         │    │
│  │ 🟡 Adicione benefícios (+10 pontos)                     │    │
│  │    Candidatos valorizam: VR, plano de saúde, remoto     │    │
│  │                                                         │    │
│  │ 🟢 Título claro e objetivo ✓                            │    │
│  │                                                         │    │
│  │ ─────────────────────────────────────────────────────── │    │
│  │ 💡 Dica: Vagas com score > 80 recebem 3x mais           │    │
│  │    candidaturas qualificadas                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│                    [Salvar rascunho]  [Publicar]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas templates prontos | Não se adapta ao contexto da empresa |
| Revisão manual por equipe | Não escala, depende de pessoas |
| Rejeitar vagas ruins | Péssima UX, frustra recrutadores |

---

## Escopo

### Incluído

- ✅ Análise em tempo real da descrição da vaga
- ✅ Score de qualidade (0-100)
- ✅ Sugestões de melhoria categorizadas
- ✅ Detecção de campos faltantes (salário, benefícios, requisitos)
- ✅ Análise de tamanho da descrição
- ✅ Detecção de linguagem potencialmente enviesada
- ✅ Sugestão de descrição expandida (geração de texto)
- ✅ Checklist de boas práticas
- ✅ Integração no formulário de criar/editar vaga
- ✅ Métricas: comparação com média da plataforma

### Excluído

- ❌ Correção gramatical automática (usar ferramentas externas)
- ❌ Tradução automática
- ❌ Geração completa da vaga do zero
- ❌ Análise de vagas de concorrentes
- ❌ A/B testing de descrições

---

## Requisitos Funcionais

### Análise de Qualidade

- **RF-001:** Calcular score de qualidade da vaga (0-100)
- **RF-002:** Score composto por múltiplos critérios ponderados
- **RF-003:** Atualizar score em tempo real conforme recrutador digita (debounce 500ms)
- **RF-004:** Exibir score com cor semântica: 0-40 vermelho, 41-70 amarelo, 71-100 verde

### Critérios de Análise

- **RF-005:** Verificar presença de faixa salarial (peso 25%)
- **RF-006:** Verificar tamanho da descrição (ideal: 150-300 palavras) (peso 20%)
- **RF-007:** Verificar presença de benefícios (peso 15%)
- **RF-008:** Verificar clareza do título (peso 10%)
- **RF-009:** Verificar presença de requisitos técnicos (peso 10%)
- **RF-010:** Verificar presença de soft skills desejadas (peso 5%)
- **RF-011:** Verificar modalidade de trabalho definida (peso 5%)
- **RF-012:** Verificar localização definida (peso 5%)
- **RF-013:** Detectar linguagem potencialmente enviesada (peso 5%)

### Sugestões de Melhoria

- **RF-014:** Listar sugestões ordenadas por impacto no score
- **RF-015:** Cada sugestão deve ter: ícone de severidade, descrição, impacto em pontos
- **RF-016:** Severidade: 🔴 crítico (>15 pontos), 🟡 importante (5-15), 🟢 ok
- **RF-017:** Sugestões devem ser acionáveis (link para campo ou ação)
- **RF-018:** Mostrar itens já atendidos como ✓

### Detecção de Viés

- **RF-019:** Detectar termos potencialmente discriminatórios
- **RF-020:** Termos a detectar: relacionados a idade, gênero, aparência
- **RF-021:** Sugerir alternativas neutras
- **RF-022:** Exemplos: "jovem e dinâmico" → "proativo", "boa aparência" → remover

### Geração de Sugestão

- **RF-023:** Botão "Gerar sugestão" para expandir descrição curta
- **RF-024:** Usar dados já preenchidos (título, requisitos) como contexto
- **RF-025:** Gerar texto complementar, não substituir existente
- **RF-026:** Permitir aceitar, editar ou descartar sugestão
- **RF-027:** Formato da sugestão: estrutura com seções (Sobre, Responsabilidades, Requisitos)

### Checklist de Boas Práticas

- **RF-028:** Exibir checklist visual do que a vaga tem/não tem
- **RF-029:** Itens: título claro, descrição completa, requisitos, benefícios, salário, localização, modalidade
- **RF-030:** Mostrar % de completude

### Comparação com Média

- **RF-031:** Exibir "Sua vaga vs. média da plataforma"
- **RF-032:** Comparar: tamanho descrição, % com salário, % com benefícios
- **RF-033:** Mostrar se está acima ou abaixo da média

### Integração

- **RF-034:** Componente deve aparecer no formulário de criar vaga
- **RF-035:** Componente deve aparecer no formulário de editar vaga
- **RF-036:** Análise não deve bloquear publicação (apenas sugerir)
- **RF-037:** Permitir minimizar/expandir o assistente

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Análise deve completar em < 200ms
- **RNF-002 (UX):** Não bloquear digitação do usuário
- **RNF-003 (UX):** Debounce de 500ms para análise em tempo real
- **RNF-004 (Acessibilidade):** Sugestões devem ser lidas por screen readers

---

## Critérios de Aceitação

### RF-001 a RF-004: Score de Qualidade

```gherkin
DADO que o recrutador está criando uma vaga
QUANDO preenche os campos do formulário
ENTÃO deve ver score de qualidade atualizado em tempo real
  E score deve ter cor verde se ≥ 71
  E score deve ter cor amarela se entre 41-70
  E score deve ter cor vermelha se ≤ 40
```

### RF-014 a RF-018: Sugestões

```gherkin
DADO uma vaga com score < 100
QUANDO o assistente é exibido
ENTÃO deve listar sugestões ordenadas por impacto
  E cada sugestão deve ter ícone de severidade
  E deve indicar quantos pontos adiciona
  E itens já atendidos devem mostrar ✓
```

### RF-023 a RF-027: Geração de Texto

```gherkin
DADO uma descrição curta (< 50 palavras)
QUANDO o recrutador clica em "Gerar sugestão"
ENTÃO deve gerar texto complementar estruturado
  E deve usar contexto dos outros campos
  E deve permitir aceitar, editar ou descartar
```

### RF-019 a RF-022: Detecção de Viés

```gherkin
DADO uma descrição com termo "jovem e dinâmico"
QUANDO a análise é executada
ENTÃO deve detectar linguagem potencialmente enviesada
  E deve sugerir alternativa "proativo"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Motor de análise | 4 |
| 2 | Componente visual | 3 |
| 3 | Geração de sugestão | 2 |
| 4 | Integração e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Motor de Análise

**Objetivo:** Implementar lógica de análise e scoring

**Ações:**
- [ ] Criar tipo `JobAnalysis` com score e sugestões
- [ ] Implementar `analyzeJobDescription(vaga)` com critérios
- [ ] Implementar detecção de campos faltantes
- [ ] Implementar detecção de viés com dicionário de termos
- [ ] Calcular score ponderado

**Validação:** Função retorna análise correta para vagas de teste

#### Fase 2: Componente Visual

**Objetivo:** Criar interface do assistente

**Ações:**
- [ ] Criar componente `JobAssistant`
- [ ] Criar componente `JobScoreRing`
- [ ] Criar componente `SuggestionList`
- [ ] Implementar atualização em tempo real com debounce
- [ ] Implementar minimizar/expandir

**Validação:** Assistente renderiza e atualiza em tempo real

#### Fase 3: Geração de Sugestão

**Objetivo:** Gerar texto complementar para descrições curtas

**Ações:**
- [ ] Implementar `generateJobSuggestion(vaga)` com templates
- [ ] Criar estrutura de seções (Sobre, Responsabilidades, etc.)
- [ ] Implementar modal de revisão da sugestão
- [ ] Permitir aceitar/editar/descartar

**Validação:** Sugestão é gerada e pode ser aplicada

#### Fase 4: Integração e Refinamentos

**Objetivo:** Integrar no formulário de vagas

**Ações:**
- [ ] Integrar no formulário de criar vaga
- [ ] Integrar no formulário de editar vaga
- [ ] Implementar comparação com média
- [ ] Ajustar pesos e textos baseado em testes

**Validação:** Assistente funciona em criar e editar vagas

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-013 | CRUD de Vagas | ⏳ Pendente |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Inteligência Artificial"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-035-ia-all | Transparência do Matching | ⏳ | - |
| 2 | PRD-036-ia-cand | Recomendação de Vagas | ⏳ | - |
| 3 | PRD-037-ia-emp | Recomendação de Candidatos | ⏳ | - |
| 4 | PRD-038-ia-cand | Parser de Currículo | ⏳ | - |
| **5** | **PRD-039-ia-emp** | **Assistente de Redação** | **🔄 ATUAL** | Independente |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Descrição da vaga | Público | Apenas empresa autora pode editar |
| Análise/Score | Interno | Visível apenas para empresa |

---

## Fluxos de Usuário

### Fluxo Principal

```
[Recrutador] ──▶ [Criar vaga] ──▶ [Digita descrição]
                                        │
                                        ▼
                              [Assistente analisa em tempo real]
                                        │
                                        ▼
                              [Exibe score + sugestões]
                                        │
                                        ▼
                              [Recrutador melhora vaga]
                                        │
                                        ▼
                              [Score aumenta → publica]
```

---

## Mockups Conceituais

### Assistente no Formulário

```
┌─────────────────────────────────────────────────────────────────┐
│  🤖 ASSISTENTE DE VAGA                           [─] Minimizar  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     ┌─────────┐                                                 │
│     │         │                                                 │
│     │   45    │   Qualidade da Vaga                             │
│     │  /100   │   ━━━━━━━━━━░░░░░░░░░░                          │
│     └─────────┘                                                 │
│                                                                 │
│  MELHORIAS SUGERIDAS                                            │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  🔴 Adicione faixa salarial                         +25 pts     │
│     Vagas com salário recebem 47% mais candidaturas             │
│     [Ir para campo de salário]                                  │
│                                                                 │
│  🟡 Descrição muito curta                           +15 pts     │
│     Atual: 12 palavras • Ideal: 150-300 palavras                │
│     [✨ Gerar sugestão de texto]                                │
│                                                                 │
│  🟡 Adicione benefícios                             +10 pts     │
│     Vale refeição, plano de saúde, home office...               │
│                                                                 │
│  🟢 Título claro e objetivo                         ✓           │
│                                                                 │
│  🟢 Modalidade de trabalho definida                 ✓           │
│                                                                 │
│  ───────────────────────────────────────────────────────────    │
│                                                                 │
│  📊 SUA VAGA vs. MÉDIA DA PLATAFORMA                            │
│  • Tamanho descrição: 12 palavras (média: 180) ⬇️               │
│  • Com salário: Não (72% das vagas têm) ⬇️                      │
│  • Com benefícios: Não (65% das vagas têm) ⬇️                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Modal de Sugestão Gerada

```
┌─────────────────────────────────────────────────────────────────┐
│  ✨ Sugestão de Descrição                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Baseado no título "Dev React" e requisitos informados,         │
│  sugerimos a seguinte estrutura:                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ **Sobre a oportunidade**                                │    │
│  │ Buscamos um Desenvolvedor React para integrar nosso     │    │
│  │ time de tecnologia e contribuir com o desenvolvimento   │    │
│  │ de soluções inovadoras.                                 │    │
│  │                                                         │    │
│  │ **Responsabilidades**                                   │    │
│  │ • Desenvolver interfaces web responsivas               │    │
│  │ • Colaborar com o time de design e backend             │    │
│  │ • Participar de code reviews e melhorias contínuas     │    │
│  │                                                         │    │
│  │ **O que oferecemos**                                    │    │
│  │ • Ambiente colaborativo e inovador                     │    │
│  │ • Oportunidades de crescimento                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ⚠️ Revise e personalize o texto antes de usar                  │
│                                                                 │
│              [Descartar]  [Editar]  [Usar sugestão]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo SemVer
> - Atualizar o CHANGELOG.md
> - Renomear este arquivo adicionando `_DONE` ao final

**Codinome sugerido:** `Mentor` (representa orientação e melhoria)

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear** | Assistente sugere, não impede publicação |
| **Tempo real** | Feedback imediato conforme recrutador digita |
| **Acionável** | Sugestões devem ter ações claras |
| **Educativo** | Explicar o "porquê" de cada sugestão |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Bloquear publicação baseado em score |
| Análise síncrona que trava a UI |
| Sugestões genéricas sem contexto |
| Forçar uso das sugestões geradas |
| Detectar viés de forma excessivamente sensível |

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
