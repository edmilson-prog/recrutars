# PRD-051: Agente de Análise Comportamental por IA

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-046` | Sistema de Avaliação Gauge-Pro 2.0 - Fundação Administrativa |
| `PRD-047` | Avaliação Gauge-Pro para Candidatos - Teste Geral |
| `PRD-048` | Avaliação Gauge-Pro por Vaga - Teste Específico |
| `PRD-049` | Gauge-Pro Parte 1: Seleção de Palavras |
| `PRD-050` | Gauge-Pro Parte 2: Cenários Situacionais |
| **`PRD-051`** | ⬅ Você está aqui — Agente de Análise Comportamental por IA |

---

# PRD-051: Agente de Análise Comportamental por IA

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Todos os Painéis |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar agente de IA (Claude) capaz de interpretar, analisar, sugerir, indicar, validar e recomendar com base nos resultados do teste Gauge-Pro, gerando duas análises distintas: uma prática para recrutadores e uma técnica para administradores |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Sistema de Avaliação Comportamental Gauge-Pro |
| **PRDs Relacionados** | PRD-046, PRD-047, PRD-048, PRD-049, PRD-050 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade devido a: integração com API externa (Claude/Anthropic), prompt engineering avançado, geração de duas análises distintas (leigo vs técnico), persistência de análises, configurações administrativas, e integração com fluxo existente do Gauge-Pro.

---

## Contexto do Problema

O teste Gauge-Pro (PRDs 049-050) gera scores numéricos em 5 dimensões (D1-D5) e determina um perfil arquetípico entre 16 possíveis. Porém, números e classificações não são suficientes para:

1. **Recrutadores/Empresas** — Precisam de insights práticos e acionáveis: "O que fazer com essa informação? Este candidato serve para minha vaga?"

2. **Administradores Técnicos** — Precisam de análise fundamentada cientificamente para validar resultados e orientar decisões complexas.

Um agente de IA pode transformar dados brutos em inteligência acionável, personalizando a linguagem e profundidade conforme o público-alvo.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Gauge-Pro gera scores numéricos (0-100) para 5 dimensões
- Determina perfil arquetípico entre 16 possíveis
- Relatório básico é gerado com dados fixos
- Não há interpretação inteligente ou personalizada
- Recrutadores recebem mesma informação que administradores

### Situação Desejada (To-Be)

- Agente IA (Claude) recebe resultados do Gauge-Pro
- Gera **duas análises distintas** do mesmo resultado:
  - **Análise Prática** → Para Recrutadores/Empresas (linguagem simples)
  - **Análise Técnica** → Para Administradores (linguagem científica)
- Análises são salvas e associadas ao resultado do teste
- Configurações do agente gerenciáveis no Painel Admin
- API Key hardcoded inicialmente (sem backend ativo)

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Análises pré-escritas por perfil | Não personalizadas, genéricas demais |
| Uma única análise para todos | Não atende necessidades distintas dos públicos |
| GPT-4 da OpenAI | Claude oferece melhor custo-benefício e controle |
| Análise apenas no Admin | Recrutadores ficariam sem insights acionáveis |

---

## Escopo

### Incluído

- ✅ Integração com API Claude (Anthropic)
- ✅ Prompt engineering para análise comportamental
- ✅ Geração de Análise Prática (Recrutador/Empresa)
- ✅ Geração de Análise Técnica (Admin)
- ✅ Configuração no Painel Admin (grupo "Inteligência Artificial")
- ✅ API Key hardcoded (provisório)
- ✅ Toggle para ativar/desativar análise IA
- ✅ Seleção de modelo Claude
- ✅ Persistência das análises geradas
- ✅ Exibição das análises nos respectivos painéis
- ✅ Tratamento de erros e fallback

### Excluído

- ❌ Backend para gestão segura de API Keys (fase posterior)
- ❌ Análise de vídeo/áudio de entrevistas
- ❌ Chatbot interativo para dúvidas sobre o perfil
- ❌ Integração com outras IAs além do Claude

---

## Arquitetura do Agente

### Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESULTADO GAUGE-PRO                          │
│  Scores D1-D5 | Perfil Arquetípico | Respostas Parte 1 e 2     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AGENTE IA (CLAUDE)                           │
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │ PROMPT PRÁTICO  │         │ PROMPT TÉCNICO  │               │
│  │ (Recrutador)    │         │ (Admin)         │               │
│  └────────┬────────┘         └────────┬────────┘               │
│           │                           │                         │
│           ▼                           ▼                         │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │ ANÁLISE PRÁTICA │         │ ANÁLISE TÉCNICA │               │
│  └─────────────────┘         └─────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   PAINEL EMPRESA        │     │   PAINEL ADMIN          │
│   (Análise Prática)     │     │   (Análise Técnica)     │
└─────────────────────────┘     └─────────────────────────┘
```

### Capacidades do Agente

| Capacidade | Descrição | Exemplo Prático | Exemplo Técnico |
|------------|-----------|-----------------|-----------------|
| **Interpretar** | Traduzir scores em linguagem humana | "João prefere ambientes organizados" | "Score D4=78 indica alta conformidade, correlação positiva com conscienciosidade no modelo Big Five" |
| **Sugerir** | Propor ações concretas | "Pergunte sobre experiência com metas e prazos" | "Aplicar técnica STAR para validar conscienciosidade em entrevista estruturada" |
| **Analisar** | Cruzar dimensões e identificar padrões | "Combina bem liderança com empatia" | "Combinação D1 alto + D5 alto sugere perfil 'Capitão' — liderança inspiradora com foco relacional" |
| **Indicar** | Apontar fit, riscos, potenciais | "Ideal para gestão de equipes" | "Risco de burnout em ambientes D3 baixo (alta urgência) — monitorar carga de trabalho" |
| **Validar** | Confirmar coerência dos resultados | "Respostas consistentes entre as partes do teste" | "Correlação Parte1-Parte2: r=0.87 — alta consistência interna, resultado confiável" |
| **Recomendar** | Orientar decisões | "Considere para a vaga de Coordenador" | "Perfil indica potencial para trilha de desenvolvimento em liderança situacional" |

---

## Dois Espectros de Análise

### 👔 Análise Prática (Recrutador/Empresa)

**Público-alvo:** Recrutadores, gestores de contratação, empresários — pessoas leigas em psicologia organizacional.

**Características:**
| Aspecto | Especificação |
|---------|---------------|
| **Linguagem** | Simples, direta, sem jargões técnicos |
| **Foco** | "O que fazer com isso?" — Ações práticas |
| **Tom** | Consultivo, como um especialista explicando para cliente |
| **Tamanho** | 300-500 palavras |
| **Estrutura** | Bullet points, seções claras, fácil de escanear |

**Seções da Análise Prática:**

1. **Resumo do Perfil** (2-3 frases)
   - Quem é este candidato em essência
   - Exemplo: "Maria é uma profissional orientada a resultados que valoriza organização e clareza. Prefere ambientes estruturados e se destaca em funções que exigem atenção a detalhes."

2. **Pontos Fortes** (3-5 itens)
   - Características que agregam valor
   - Exemplo: "✅ Comprometida com prazos e qualidade"

3. **Pontos de Atenção** (2-3 itens)
   - Aspectos a monitorar ou desenvolver
   - Exemplo: "⚠️ Pode ter dificuldade em ambientes muito dinâmicos e imprevisíveis"

4. **Fit com a Vaga** (se houver vaga associada)
   - Compatibilidade específica
   - Exemplo: "Para a vaga de Analista Financeiro: Excelente fit — perfil combina com as demandas de precisão e organização"

5. **Perguntas Sugeridas para Entrevista** (3-5 perguntas)
   - Questões práticas para validar o perfil
   - Exemplo: "Conte sobre uma situação em que teve que lidar com mudanças inesperadas de planos"

6. **Recomendação Final**
   - Orientação clara sobre próximos passos
   - Exemplo: "Recomendamos avançar para entrevista técnica. Atenção especial à adaptabilidade."

---

### 🔬 Análise Técnica (Admin)

**Público-alvo:** Profissionais de RH formados, psicólogos organizacionais — pessoas com conhecimento técnico em avaliação comportamental.

**Características:**
| Aspecto | Especificação |
|---------|---------------|
| **Linguagem** | Técnica, terminologia psicológica, referências científicas |
| **Foco** | "Por que isso acontece?" — Fundamentação |
| **Tom** | Analítico, como relatório técnico entre pares |
| **Tamanho** | 600-1000 palavras |
| **Estrutura** | Seções detalhadas, correlações, fundamentação teórica |

**Seções da Análise Técnica:**

1. **Síntese Psicométrica**
   - Scores normalizados por dimensão
   - Classificação (Baixo/Médio/Alto)
   - Perfil arquetípico identificado

2. **Análise Dimensional Detalhada**
   - Para cada dimensão (D1-D5):
     - Score e classificação
     - Interpretação baseada em Big Five/DISC
     - Comportamentos esperados
     - Correlações com outras dimensões

3. **Consistência Interna**
   - Coerência entre Parte 1 (Palavras) e Parte 2 (Cenários)
   - Indicadores de confiabilidade do resultado
   - Possíveis vieses identificados

4. **Análise de Padrões**
   - Combinações dimensionais relevantes
   - Perfil de risco (se aplicável)
   - Potencial de desenvolvimento

5. **Fundamentação Teórica**
   - Referências ao modelo Big Five (OCEAN)
   - Correlações com literatura científica
   - Limitações da avaliação

6. **Recomendações Técnicas**
   - Orientações para entrevista estruturada (método STAR)
   - Sugestões de avaliação complementar
   - Indicações de desenvolvimento

7. **Red Flags e Observações**
   - Inconsistências identificadas
   - Pontos que merecem investigação adicional
   - Alertas específicos

---

## Configuração no Painel Admin

### Localização

**Menu:** Configurações → Inteligência Artificial → **Agente de Análise** (NOVO)

> ⚠️ **IMPORTANTE:** Não alterar configurações existentes (Gauge-Pro, Matching, Análise Comportamental). Criar nova seção dentro do grupo "Inteligência Artificial".

### Campos de Configuração

| Campo | Tipo | Descrição | Valor Padrão |
|-------|------|-----------|--------------|
| **Ativar Agente IA** | Toggle | Liga/desliga análise por IA | Ativado |
| **Chave API Claude** | Texto (mascarado) | API Key da Anthropic | Hardcoded |
| **Modelo** | Dropdown | Modelo Claude a utilizar | claude-sonnet-4-20250514 |
| **Gerar Análise Prática** | Toggle | Ativa análise para recrutadores | Ativado |
| **Gerar Análise Técnica** | Toggle | Ativa análise para admins | Ativado |
| **Temperatura** | Slider (0.0-1.0) | Criatividade da resposta | 0.7 |
| **Max Tokens** | Input numérico | Limite de tokens por análise | 2000 |

### Mockup da Tela

```
┌─────────────────────────────────────────────────────────────────┐
│  Inteligência Artificial - Agente de Análise                    │
│  Configurações do agente de IA para análise comportamental      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Ativar Agente IA                                    [====●]    │
│  Habilita análise inteligente dos resultados Gauge-Pro          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Modelo Claude                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ claude-sonnet-4-20250514                            ▼   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Chave API                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ sk-ant-api03-••••••••••••••••••••••••••••••••••••••     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ⚠️ API Key hardcoded para desenvolvimento                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Análises Geradas                                               │
│                                                                 │
│  Gerar Análise Prática (Recrutador)                  [====●]    │
│  Linguagem simples, foco em ações práticas                      │
│                                                                 │
│  Gerar Análise Técnica (Admin)                       [====●]    │
│  Linguagem técnica, fundamentação científica                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Parâmetros Avançados                                           │
│                                                                 │
│  Temperatura                                                    │
│  ○─────────────●─────────○  0.7                                │
│  0.0                    1.0                                     │
│                                                                 │
│  Max Tokens por Análise                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2000                                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                          [💾 Salvar Alterações] │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requisitos Funcionais

### Configuração (Painel Admin)

- **RF-001:** O sistema deve exibir nova seção "Agente de Análise" dentro do grupo "Inteligência Artificial" nas Configurações
- **RF-002:** O sistema deve permitir ativar/desativar o agente de IA via toggle
- **RF-003:** O sistema deve permitir selecionar o modelo Claude via dropdown
- **RF-004:** O sistema deve exibir campo de API Key mascarado (apenas últimos 4 caracteres visíveis)
- **RF-005:** O sistema deve permitir ativar/desativar cada tipo de análise (Prática e Técnica) independentemente
- **RF-006:** O sistema deve permitir configurar temperatura e max tokens
- **RF-007:** As configurações existentes do grupo "Inteligência Artificial" NÃO devem ser alteradas

### Geração de Análise

- **RF-008:** Ao concluir o teste Gauge-Pro, o sistema deve automaticamente chamar o agente de IA (se ativado)
- **RF-009:** O sistema deve enviar para a API Claude: scores D1-D5, perfil arquetípico, respostas das duas partes
- **RF-010:** O sistema deve gerar Análise Prática usando prompt específico para linguagem simples
- **RF-011:** O sistema deve gerar Análise Técnica usando prompt específico para linguagem técnica
- **RF-012:** Ambas as análises devem ser geradas em paralelo (ou sequencial se necessário)
- **RF-013:** O sistema deve tratar erros da API e exibir mensagem adequada
- **RF-014:** Se a API falhar, o relatório básico (sem IA) deve ser exibido como fallback

### Persistência

- **RF-015:** As análises geradas devem ser salvas no banco de dados associadas ao resultado do teste
- **RF-016:** O sistema deve registrar: timestamp, modelo utilizado, tokens consumidos
- **RF-017:** O sistema deve permitir regenerar análise (admin apenas)

### Exibição

- **RF-018:** A Análise Prática deve ser exibida no Painel da Empresa ao visualizar candidato
- **RF-019:** A Análise Técnica deve ser exibida no Painel Admin ao visualizar resultado
- **RF-020:** Ambas as análises devem ser incluídas no relatório PDF (seções distintas)
- **RF-021:** O sistema deve indicar claramente que a análise foi gerada por IA

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Geração de análise < 30 segundos (incluindo chamada à API)
- **RNF-002 (Disponibilidade):** Fallback para relatório básico se IA falhar
- **RNF-003 (Segurança):** API Key não deve ser exposta em logs ou console
- **RNF-004 (Custo):** Monitorar uso de tokens para controle de custos
- **RNF-005 (UX):** Indicador de loading durante geração da análise

---

## Prompts do Agente

### Prompt Base (System)

```
Você é um especialista em psicologia organizacional e avaliação comportamental, 
com profundo conhecimento nos modelos Big Five (OCEAN), DISC e Predictive Index.

Você analisa resultados de testes comportamentais e gera insights acionáveis.

IMPORTANTE:
- Seja objetivo e baseado em evidências
- Não faça afirmações absolutas ("sempre", "nunca")
- Use linguagem condicional ("tende a", "pode preferir")
- Destaque tanto pontos fortes quanto áreas de desenvolvimento
- Não diagnostique condições psicológicas
- Foque em comportamentos observáveis no contexto profissional
```

### Prompt para Análise Prática (Recrutador)

```
CONTEXTO:
Você está gerando uma análise para um recrutador ou gestor de contratação que 
NÃO tem formação em psicologia. Ele precisa de informações práticas e acionáveis.

DADOS DO CANDIDATO:
- Nome: {nome}
- Scores: D1 (Dominância): {d1}, D2 (Sociabilidade): {d2}, D3 (Ritmo): {d3}, 
  D4 (Conformidade): {d4}, D5 (Orientação): {d5}
- Perfil Arquetípico: {perfil}
- Vaga (se houver): {vaga}

INSTRUÇÕES:
1. Use linguagem simples, sem jargões técnicos
2. Foque em "o que fazer" e não em "por quê"
3. Seja direto e prático
4. Limite a 500 palavras

ESTRUTURA OBRIGATÓRIA:
1. Resumo do Perfil (2-3 frases)
2. Pontos Fortes (3-5 bullet points com ✅)
3. Pontos de Atenção (2-3 bullet points com ⚠️)
4. Fit com a Vaga (se aplicável)
5. Perguntas Sugeridas para Entrevista (3-5 perguntas)
6. Recomendação Final (1-2 frases)
```

### Prompt para Análise Técnica (Admin)

```
CONTEXTO:
Você está gerando uma análise técnica para um profissional de RH com formação 
em psicologia organizacional. Ele entende terminologia científica e quer 
fundamentação para suas decisões.

DADOS DO CANDIDATO:
- Nome: {nome}
- Scores Normalizados (0-100):
  - D1 (Dominância/Assertividade): {d1} - Classificação: {class_d1}
  - D2 (Sociabilidade/Extroversão): {d2} - Classificação: {class_d2}
  - D3 (Ritmo/Paciência): {d3} - Classificação: {class_d3}
  - D4 (Conformidade/Estrutura): {d4} - Classificação: {class_d4}
  - D5 (Orientação Relacional): {d5} - Classificação: {class_d5}
- Perfil Arquetípico: {perfil}
- Score Parte 1 (Palavras): {score_p1}
- Score Parte 2 (Cenários): {score_p2}
- Respostas detalhadas: {respostas}

INSTRUÇÕES:
1. Use terminologia técnica de psicologia organizacional
2. Faça correlações com modelo Big Five (OCEAN)
3. Analise consistência interna dos resultados
4. Fundamente observações em literatura científica
5. Limite a 1000 palavras

ESTRUTURA OBRIGATÓRIA:
1. Síntese Psicométrica (tabela de scores)
2. Análise Dimensional Detalhada (cada D1-D5)
3. Consistência Interna (correlação Parte1 x Parte2)
4. Análise de Padrões e Combinações
5. Fundamentação Teórica (Big Five, DISC)
6. Recomendações Técnicas
7. Red Flags e Observações (se houver)
```

---

## Critérios de Aceitação

### RF-001/007: Configuração no Admin

```gherkin
DADO que o admin está na página Configurações → Inteligência Artificial
QUANDO visualizar as opções disponíveis
ENTÃO deve ver a nova seção "Agente de Análise"
  E as seções existentes (Gauge-Pro, Matching, Análise Comportamental) devem estar inalteradas
  E deve poder configurar: toggle ativo, modelo, temperatura, max tokens
```

### RF-008/009/010/011: Geração de Análise

```gherkin
DADO que um candidato concluiu o teste Gauge-Pro completo
  E o agente de IA está ativado nas configurações
QUANDO o sistema processar o resultado
ENTÃO deve chamar a API Claude com os dados do candidato
  E deve gerar Análise Prática (linguagem simples)
  E deve gerar Análise Técnica (linguagem técnica)
  E ambas devem ser salvas no banco de dados
```

### RF-013/014: Tratamento de Erros

```gherkin
DADO que a API Claude está indisponível ou retorna erro
QUANDO o sistema tentar gerar análise
ENTÃO deve exibir mensagem informativa ao usuário
  E deve exibir o relatório básico (sem IA) como fallback
  E deve registrar o erro em log
```

### RF-018/019: Exibição nos Painéis

```gherkin
DADO que o recrutador está visualizando um candidato no Painel da Empresa
QUANDO acessar os resultados do Gauge-Pro
ENTÃO deve ver a Análise Prática gerada pela IA
  E a linguagem deve ser simples e prática
  E deve haver indicação de que foi gerado por IA

DADO que o admin está visualizando um resultado no Painel Admin
QUANDO acessar os detalhes do teste Gauge-Pro
ENTÃO deve ver a Análise Técnica gerada pela IA
  E a linguagem deve ser técnica e fundamentada
  E deve haver indicação de que foi gerado por IA
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Configuração no Painel Admin | 3 |
| 2 | Serviço de integração com API Claude | 4 |
| 3 | Prompts e geração de análises | 3 |
| 4 | Persistência e exibição | 4 |
| 5 | Testes e fallback | 2 |

### Detalhamento das Fases

#### Fase 1: Configuração no Painel Admin

**Objetivo:** Criar interface de configuração do agente

**Ações:**
- [ ] Criar nova seção "Agente de Análise" dentro de "Inteligência Artificial"
- [ ] Implementar campos: toggle ativo, modelo, API Key (mascarado), temperatura, max tokens
- [ ] Implementar toggles para cada tipo de análise
- [ ] Hardcodar API Key: `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`
- [ ] Salvar configurações (local storage ou estado global por enquanto)

**Validação:** Admin consegue visualizar e alterar configurações do agente

#### Fase 2: Serviço de Integração com API Claude

**Objetivo:** Criar serviço para comunicação com API Anthropic

**Ações:**
- [ ] Criar serviço `claudeApiService` com método para chamada à API
- [ ] Implementar headers de autenticação
- [ ] Implementar tratamento de erros e timeouts
- [ ] Implementar retry com backoff exponencial
- [ ] Criar tipos TypeScript para request/response

**Validação:** Chamada de teste à API retorna resposta válida

#### Fase 3: Prompts e Geração de Análises

**Objetivo:** Implementar lógica de geração de análises

**Ações:**
- [ ] Criar módulo de prompts (system, prático, técnico)
- [ ] Implementar função para montar prompt com dados do candidato
- [ ] Implementar função para gerar Análise Prática
- [ ] Implementar função para gerar Análise Técnica
- [ ] Implementar geração paralela/sequencial das duas análises

**Validação:** Dado um resultado Gauge-Pro, sistema gera ambas as análises

#### Fase 4: Persistência e Exibição

**Objetivo:** Salvar e exibir análises nos painéis corretos

**Ações:**
- [ ] Criar tabela/campos para armazenar análises geradas
- [ ] Integrar geração de análise no fluxo de conclusão do Gauge-Pro
- [ ] Criar componente de exibição de Análise Prática (Painel Empresa)
- [ ] Criar componente de exibição de Análise Técnica (Painel Admin)
- [ ] Adicionar indicador "Gerado por IA"
- [ ] Integrar análises no PDF do relatório

**Validação:** Análises aparecem corretamente em cada painel

#### Fase 5: Testes e Fallback

**Objetivo:** Garantir robustez e fallback

**Ações:**
- [ ] Implementar fallback para relatório básico se IA falhar
- [ ] Implementar loading state durante geração
- [ ] Implementar botão "Regenerar Análise" (admin apenas)
- [ ] Testar cenários de erro (API down, timeout, rate limit)
- [ ] Testes de integração end-to-end

**Validação:** Sistema funciona corretamente mesmo com falhas de API

---

## Modelo de Dados

### Tabela: `gauge_ai_analyses`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| test_result_id | UUID | FK para resultado do teste Gauge-Pro |
| candidate_id | UUID | FK para candidato |
| analysis_type | ENUM | 'practical' ou 'technical' |
| content | TEXT | Conteúdo da análise gerada |
| model_used | VARCHAR | Modelo Claude utilizado |
| tokens_input | INT | Tokens de entrada consumidos |
| tokens_output | INT | Tokens de saída consumidos |
| generation_time_ms | INT | Tempo de geração em ms |
| created_at | TIMESTAMP | Data/hora de criação |
| regenerated_at | TIMESTAMP | Data/hora de regeneração (se houver) |
| regenerated_by | UUID | Admin que solicitou regeneração |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-049 | Gauge-Pro Parte 1: Seleção de Palavras | ⏳ Pendente |
| PRD-050 | Gauge-Pro Parte 2: Cenários Situacionais | ⏳ Pendente |

### Dependências Técnicas

| Dependência | Tipo | Status |
|-------------|------|--------|
| API Claude (Anthropic) | Externa | Disponível |
| API Key | Credencial | Fornecida (hardcoded) |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Sistema de Avaliação Comportamental Gauge-Pro"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-046 | Fundação Administrativa | ✅ | Base |
| 2 | PRD-047 | Avaliação Candidatos | ✅ | Depende de 046 |
| 3 | PRD-048 | Avaliação por Vaga | ✅ | Depende de 046, 047 |
| 4 | PRD-049 | Seleção de Palavras | ⏳ | Depende de 046-048 |
| 5 | PRD-050 | Cenários Situacionais | ⏳ | Depende de 049 |
| **6** | **PRD-051** | **Agente de Análise IA** | **🔄 ATUAL** | Depende de 049, 050 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### API Key

| Aspecto | Especificação |
|---------|---------------|
| **Armazenamento atual** | Hardcoded (temporário) |
| **Armazenamento futuro** | Variável de ambiente no backend |
| **Exibição** | Mascarada (apenas últimos 4 caracteres) |
| **Logs** | Nunca logar API Key |

### Dados Enviados à API

| Dado | Sensibilidade | Mitigação |
|------|---------------|-----------|
| Nome do candidato | Moderada | Pode usar apenas primeiro nome |
| Scores | Baixa | Dados numéricos agregados |
| Respostas | Baixa | Dados de múltipla escolha |

### LGPD

- Candidato deve consentir com análise por IA
- Análises podem ser excluídas junto com dados do candidato
- Transparência: indicar claramente que análise foi gerada por IA

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. API KEY:**
> A API Key do Claude deve ser hardcoded neste momento: 
> `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`
> 
> Quando o backend estiver ativo, migrar para variável de ambiente.

> **⚠️ 3. NÃO ALTERAR CONFIGS EXISTENTES:**
> O grupo "Inteligência Artificial" já possui: Gauge-Pro, Matching, Análise Comportamental.
> Criar NOVA seção "Agente de Análise" sem modificar as existentes.

> **⚠️ 4. APÓS IMPLEMENTAR:**
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

**Codinomes:** Sugestão para este épico: "Insight" ou "Oracle"

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
| **Não bloquear fluxo principal** | Se IA falhar, mostrar relatório básico |
| **Fail gracefully** | Timeout de 30s, retry com backoff |
| **Preservar evidências** | Logar tokens consumidos e tempo de geração |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **API Claude** | Usar endpoint `/v1/messages` com modelo especificado |
| **Timeout** | 30 segundos para cada análise |
| **Retry** | Máximo 2 retries com backoff exponencial |
| **Loading** | Mostrar skeleton ou spinner durante geração |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Expor API Key em logs, console ou código client-side |
| Alterar configurações existentes do grupo "Inteligência Artificial" |
| Bloquear fluxo se IA falhar (sempre ter fallback) |
| Enviar dados sensíveis desnecessários para a API |
| Cache de análises que impeça regeneração |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 31/01/2026 |
| **Versão do App** | 0.45.0 "Oracle" |
| **Implementado por** | Claude Opus 4.5 via Claude Code |
| **Observações** | API via Vite proxy dev-only. Backend futuro para gestão segura de API Key. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 31/01/2026 | v1 | Criação inicial |
| 31/01/2026 | v2 | Implementação completa — versão 0.45.0 "Oracle" |

---

**AILA - Sistemas Inteligentes**
