# PRD-042-ia-cand: Análise de Fit Cultural com IA

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar análise de compatibilidade cultural entre candidato e empresa, utilizando dados comportamentais (DISC) e valores organizacionais |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Baixa |
| **Épico** | Inteligência Artificial |
| **Perfil** | Candidato (primário), Empresa (secundário) |
| **PRDs Relacionados** | PRD-008 (Teste Comportamental), PRD-035-ia-all (Transparência Matching) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 10+ arquivos, análise comportamental avançada, modelo de cultura organizacional, múltiplas visualizações |

---

## Contexto do Problema

O match técnico (skills + experiência) não garante sucesso de uma contratação. Estudos mostram que:

| Estatística | Fonte |
|-------------|-------|
| **89% das falhas em contratação** são por falta de fit cultural, não técnico | Leadership IQ |
| **Candidatos com alto fit cultural** têm 2.5x mais chance de permanecer 2+ anos | SHRM |
| **Times com fit cultural** são 30% mais produtivos | Deloitte |

Problemas atuais no RecrutaRS:

| Problema | Impacto |
|----------|---------|
| **Só avaliamos skills** | Contratações que "não dão certo" mesmo com perfil técnico ideal |
| **Candidato não sabe a cultura** | Aceita vaga e descobre incompatibilidade depois |
| **DISC subutilizado** | Dados comportamentais não são usados para fit cultural |
| **Empresas não definem cultura** | Não há como comparar se empresa não declara valores |

A análise de fit cultural pode:
- Prever compatibilidade além do técnico
- Informar candidato sobre ambiente de trabalho
- Ajudar empresa a identificar alinhamento de valores
- Usar dados DISC de forma mais estratégica

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Match Score                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│         ┌─────────┐                                             │
│         │   78%   │   Compatibilidade                           │
│         └─────────┘                                             │
│                                                                 │
│  Baseado em:                                                    │
│  • Skills técnicas ✓                                            │
│  • Experiência ✓                                                │
│  • Localização ✓                                                │
│  • Perfil DISC (usado superficialmente)                         │
│                                                                 │
│  (sem análise de cultura ou valores)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Compatibilidade Completa                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MATCH TÉCNICO: 78%          FIT CULTURAL: 85%                  │
│  ████████████░░░░             ██████████████░░                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  🎯 ANÁLISE DE FIT CULTURAL                                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  VOCÊ (Analítico-Estável)     CULTURA DA EMPRESA        │    │
│  │                                                         │    │
│  │  ✅ Gosta de processos       ✅ Ambiente estruturado     │    │
│  │  ✅ Prefere planejamento     ✅ Decisões baseadas em     │    │
│  │  ✅ Trabalho focado             dados                   │    │
│  │                              ✅ Trabalho em equipe       │    │
│  │                              colaborativo               │    │
│  │                                                         │    │
│  │  💡 PONTOS DE ATENÇÃO                                   │    │
│  │  • Empresa valoriza ritmo acelerado - você prefere      │    │
│  │    estabilidade (compatibilidade média neste aspecto)   │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  📊 COMPATIBILIDADE POR DIMENSÃO                                │
│  • Estilo de trabalho:     ████████████████░░  90%              │
│  • Comunicação:            █████████████░░░░░  75%              │
│  • Tomada de decisão:      ██████████████████  95%              │
│  • Ritmo/Ambiente:         ██████████░░░░░░░░  60%              │
│                                                                 │
│  [ℹ️ Como calculamos fit cultural?]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Questionário de cultura para candidato | Duplica esforço, já temos DISC |
| Apenas valores declarados | Subjetivo, não é mensurável |
| Ignorar fit cultural | Perde oportunidade de diferenciação |

---

## Escopo

### Incluído

- ✅ Perfil de cultura organizacional para empresas
- ✅ Dimensões de cultura: Estilo de trabalho, Comunicação, Decisão, Ritmo
- ✅ Mapeamento DISC → Preferências culturais
- ✅ Score de fit cultural (0-100)
- ✅ Análise detalhada de compatibilidade por dimensão
- ✅ Pontos fortes e pontos de atenção
- ✅ Visualização para candidato (ao ver vaga)
- ✅ Visualização para empresa (ao ver candidato)
- ✅ Integração com MatchScoreCard existente
- ✅ Explicação da metodologia

### Excluído

- ❌ Questionário de cultura para candidatos (usar DISC existente)
- ❌ Análise de linguagem em mensagens
- ❌ Previsão de tempo de permanência
- ❌ Matching de valores pessoais (complexo demais)
- ❌ Integração com avaliações de desempenho

---

## Requisitos Funcionais

### Perfil de Cultura da Empresa

- **RF-001:** Criar formulário de perfil cultural para empresas
- **RF-002:** Dimensões a capturar:
  - Estilo de trabalho: Estruturado ↔ Flexível
  - Comunicação: Formal ↔ Informal
  - Tomada de decisão: Hierárquica ↔ Colaborativa
  - Ritmo: Estável ↔ Dinâmico
  - Ambiente: Individual ↔ Colaborativo
- **RF-003:** Cada dimensão em escala de 1-5
- **RF-004:** Opcionalmente descrever cultura em texto livre
- **RF-005:** Salvar perfil cultural vinculado à empresa

### Mapeamento DISC → Preferências

- **RF-006:** Criar mapeamento de perfis DISC para preferências culturais
- **RF-007:** Perfil D (Dominância): prefere autonomia, ritmo acelerado, resultados
- **RF-008:** Perfil I (Influência): prefere colaboração, comunicação informal, reconhecimento
- **RF-009:** Perfil S (Estabilidade): prefere estrutura, ritmo estável, harmonia
- **RF-010:** Perfil C (Conformidade): prefere processos, dados, qualidade
- **RF-011:** Combinar perfis DISC primário e secundário para nuances

### Cálculo de Fit Cultural

- **RF-012:** Calcular compatibilidade por dimensão (0-100)
- **RF-013:** Calcular score geral de fit cultural (média ponderada)
- **RF-014:** Identificar pontos fortes (dimensões ≥ 80%)
- **RF-015:** Identificar pontos de atenção (dimensões < 60%)
- **RF-016:** Gerar insights textuais sobre a compatibilidade

### Visualização para Candidato

- **RF-017:** Exibir fit cultural na página de detalhes da vaga
- **RF-018:** Mostrar score geral + breakdown por dimensão
- **RF-019:** Listar pontos fortes e pontos de atenção
- **RF-020:** Comparar "Seu perfil" vs "Cultura da empresa"
- **RF-021:** Explicar cada dimensão em linguagem simples
- **RF-022:** Integrar com MatchScoreCard (nova seção)

### Visualização para Empresa

- **RF-023:** Exibir fit cultural no perfil do candidato
- **RF-024:** Mostrar score + dimensões
- **RF-025:** Destacar onde candidato se encaixa bem
- **RF-026:** Alertar dimensões com baixa compatibilidade
- **RF-027:** Permitir comparar fit cultural de múltiplos candidatos

### Explicação da Metodologia

- **RF-028:** Modal "Como calculamos fit cultural?"
- **RF-029:** Explicar cada dimensão e sua importância
- **RF-030:** Explicar como DISC é traduzido para preferências
- **RF-031:** Deixar claro que é complementar, não substitui entrevista

### Fallbacks

- **RF-032:** Se empresa não tem perfil cultural: exibir mensagem explicativa
- **RF-033:** Se candidato não fez DISC: sugerir que complete
- **RF-034:** Não impedir visualização de vaga se dados faltam

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Cálculo de fit em < 100ms
- **RNF-002 (Clareza):** Visualização deve ser compreensível por leigos
- **RNF-003 (Não-discriminatório):** Fit cultural não deve criar viés
- **RNF-004 (Transparência):** Metodologia deve ser explicável

---

## Critérios de Aceitação

### RF-001 a RF-005: Perfil da Empresa

```gherkin
DADO que a empresa está editando seu perfil
QUANDO acessa a seção "Cultura Organizacional"
ENTÃO deve ver formulário com 5 dimensões em escala 1-5
  E deve poder descrever cultura em texto livre
  E ao salvar os dados devem ser persistidos
```

### RF-012 a RF-016: Cálculo

```gherkin
DADO um candidato com perfil DISC "C-S" (Analítico-Estável)
  E uma empresa com cultura "Estruturada, Formal, Hierárquica, Estável, Colaborativa"
QUANDO o fit cultural é calculado
ENTÃO deve retornar score alto (>80%) em "Estilo de trabalho" e "Ritmo"
  E deve identificar pontos fortes
  E deve gerar insight como "Seu perfil se encaixa bem em ambientes estruturados"
```

### RF-017 a RF-022: Visualização Candidato

```gherkin
DADO que o candidato visualiza uma vaga
QUANDO a empresa tem perfil cultural definido
  E o candidato tem perfil DISC
ENTÃO deve exibir seção "Fit Cultural" com score
  E deve mostrar breakdown por dimensão
  E deve listar pontos fortes e atenção
  E deve ter botão "Como calculamos?"
```

### RF-032 a RF-034: Fallbacks

```gherkin
DADO que a empresa NÃO tem perfil cultural
QUANDO o candidato visualiza a vaga
ENTÃO NÃO deve exibir seção de fit cultural
  E deve mostrar mensagem "Cultura não definida pela empresa"
  E NÃO deve impedir visualização da vaga
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Perfil cultural da empresa | 3 |
| 2 | Mapeamento DISC → Preferências | 2 |
| 3 | Motor de cálculo | 3 |
| 4 | Visualização candidato | 3 |
| 5 | Visualização empresa | 2 |

### Detalhamento das Fases

#### Fase 1: Perfil Cultural da Empresa

**Objetivo:** Permitir empresas definirem sua cultura

**Ações:**
- [ ] Criar tipo `CompanyCultureProfile`
- [ ] Criar formulário de cultura no perfil da empresa
- [ ] Implementar escala 1-5 para cada dimensão
- [ ] Salvar perfil cultural

**Validação:** Empresa consegue definir e salvar perfil cultural

#### Fase 2: Mapeamento DISC

**Objetivo:** Traduzir DISC para preferências culturais

**Ações:**
- [ ] Criar mapeamento `DISC → CulturePreferences`
- [ ] Definir preferências para cada perfil (D, I, S, C)
- [ ] Combinar perfis primário + secundário
- [ ] Documentar metodologia

**Validação:** Perfil DISC gera preferências culturais

#### Fase 3: Motor de Cálculo

**Objetivo:** Calcular compatibilidade

**Ações:**
- [ ] Implementar `calculateCulturalFit(candidato, empresa)`
- [ ] Calcular score por dimensão
- [ ] Identificar pontos fortes e atenção
- [ ] Gerar insights textuais

**Validação:** Cálculo retorna scores e insights

#### Fase 4: Visualização Candidato

**Objetivo:** Mostrar fit cultural para candidato

**Ações:**
- [ ] Criar componente `CulturalFitCard`
- [ ] Integrar na página de detalhes da vaga
- [ ] Criar visualização de dimensões
- [ ] Implementar modal de metodologia

**Validação:** Candidato vê fit cultural na vaga

#### Fase 5: Visualização Empresa

**Objetivo:** Mostrar fit cultural para recrutador

**Ações:**
- [ ] Integrar `CulturalFitCard` no perfil do candidato
- [ ] Permitir comparação entre candidatos
- [ ] Destacar alertas de baixa compatibilidade

**Validação:** Recrutador vê fit cultural dos candidatos

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-008 | Teste Comportamental DISC | ⏳ Pendente |
| PRD-035-ia-all | Transparência Matching | ⏳ Pendente |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Inteligência Artificial"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-035-ia-all | Transparência do Matching | ⏳ | Base |
| 2-7 | PRD-036 a 041 | Features de IA | ⏳ | - |
| **8** | **PRD-042-ia-cand** | **Fit Cultural** | **🔄 ATUAL** | Depende de 035 e 008 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Modelo de Dados Conceitual

### Dimensões de Cultura

| Dimensão | Polo 1 (1-2) | Neutro (3) | Polo 2 (4-5) |
|----------|--------------|------------|--------------|
| **Estilo de trabalho** | Estruturado, processos definidos | Balanceado | Flexível, adaptável |
| **Comunicação** | Formal, documentada | Mista | Informal, direta |
| **Tomada de decisão** | Hierárquica, top-down | Consultiva | Colaborativa, consenso |
| **Ritmo** | Estável, previsível | Moderado | Dinâmico, acelerado |
| **Ambiente** | Individual, foco | Híbrido | Colaborativo, times |

### Mapeamento DISC → Preferências

| Perfil DISC | Preferências Culturais |
|-------------|------------------------|
| **D (Dominância)** | Ritmo dinâmico, decisão rápida, resultados, autonomia |
| **I (Influência)** | Comunicação informal, ambiente colaborativo, reconhecimento |
| **S (Estabilidade)** | Ritmo estável, estrutura, harmonia, previsibilidade |
| **C (Conformidade)** | Processos, dados, qualidade, comunicação documentada |

---

## Considerações de Segurança

### Dados

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Perfil cultural empresa | Público | Visível para candidatos |
| Score de fit | Calculado | Visível para ambas as partes |
| Perfil DISC | Sensível | Apenas resumo, não detalhes |

### Viés e Discriminação

- Fit cultural NÃO deve ser usado para discriminar
- Deve ser complementar à análise técnica, não substituto
- Alertar que baixo fit não significa "candidato ruim"
- Explicar limitações da análise automatizada

---

## Mockups Conceituais

### Card de Fit Cultural (Candidato)

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 FIT CULTURAL                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     ┌─────────┐                                                 │
│     │   85%   │   Compatibilidade Cultural                      │
│     │  ██████ │                                                 │
│     └─────────┘                                                 │
│                                                                 │
│  COMPATIBILIDADE POR DIMENSÃO                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Estilo de trabalho    ████████████████████  95%                │
│  Você: Estruturado     Empresa: Estruturada                     │
│                                                                 │
│  Comunicação           █████████████░░░░░░░  72%                │
│  Você: Mais formal     Empresa: Informal                        │
│                                                                 │
│  Tomada de decisão     ██████████████████░░  88%                │
│  Você: Baseada em dados Empresa: Colaborativa                   │
│                                                                 │
│  Ritmo de trabalho     ████████████░░░░░░░░  65%                │
│  Você: Estável         Empresa: Dinâmico                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ✅ PONTOS FORTES                                               │
│  • Seu perfil analítico combina com a cultura de dados          │
│  • Você valoriza processos e a empresa é estruturada            │
│                                                                 │
│  ⚠️ PONTOS DE ATENÇÃO                                           │
│  • A empresa tem ritmo mais acelerado que seu perfil ideal      │
│  • Comunicação tende a ser mais informal que sua preferência    │
│                                                                 │
│  [ℹ️ Como calculamos fit cultural?]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Formulário de Cultura (Empresa)

```
┌─────────────────────────────────────────────────────────────────┐
│  🏢 CULTURA ORGANIZACIONAL                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Defina o perfil cultural da sua empresa para melhorar          │
│  o match com candidatos.                                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ESTILO DE TRABALHO                                             │
│  Estruturado  ○ ○ ○ ● ○  Flexível                               │
│  (processos)            (adaptável)                             │
│                                                                 │
│  COMUNICAÇÃO                                                    │
│  Formal       ○ ○ ● ○ ○  Informal                               │
│  (documentada)          (direta)                                │
│                                                                 │
│  TOMADA DE DECISÃO                                              │
│  Hierárquica  ○ ○ ○ ○ ●  Colaborativa                           │
│  (top-down)             (consenso)                              │
│                                                                 │
│  RITMO DE TRABALHO                                              │
│  Estável      ○ ○ ○ ● ○  Dinâmico                               │
│  (previsível)           (acelerado)                             │
│                                                                 │
│  AMBIENTE                                                       │
│  Individual   ○ ○ ○ ● ○  Colaborativo                           │
│  (foco)                 (times)                                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  DESCRIÇÃO (opcional)                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Somos uma empresa que valoriza inovação e colaboração.  │    │
│  │ Nosso ambiente é dinâmico, com decisões baseadas em     │    │
│  │ dados e muita autonomia para os times...                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│                    [Cancelar]  [Salvar]                         │
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
> - Incrementar versão seguindo SemVer
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

**Codinome sugerido:** `Compass` (representa alinhamento e direção)

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Complementar** | Fit cultural complementa, não substitui análise técnica |
| **Transparente** | Explicar como é calculado |
| **Não-discriminatório** | Evitar viés em dimensões culturais |
| **Gracioso** | Funcionar mesmo sem todos os dados |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Usar fit cultural para excluir candidatos automaticamente |
| Sugerir que baixo fit = candidato ruim |
| Expor detalhes completos do DISC (apenas preferências) |
| Impedir visualização de vaga se dados faltam |
| Criar dimensões que possam discriminar (religião, política) |

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
