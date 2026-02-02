# PRD-049: Gauge-Pro - Parte 1: Seleção de Palavras

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
| **`PRD-049`** | ⬅ Você está aqui — Gauge-Pro Parte 1: Seleção de Palavras |
| `PRD-050` | Gauge-Pro Parte 2: Cenários Situacionais |

---

# PRD-049: Gauge-Pro - Parte 1: Seleção de Palavras

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel do Candidato |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar a primeira parte do teste Gauge-Pro: seleção de adjetivos comportamentais que mapeiam 5 dimensões de perfil |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Épico** | Sistema de Avaliação Comportamental Gauge-Pro |
| **PRDs Relacionados** | PRD-046, PRD-047, PRD-048, PRD-050 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade devido a: banco de 100 adjetivos mapeados em 5 dimensões, lógica de pontuação bidirecional (+2/-2), duas listas de seleção (A e B), validação de exatamente 5 seleções por lista, sistema de gamificação integrado, e cálculo de scores normalizados.

---

## Contexto do Problema

O RecrutaRS precisa de um sistema de avaliação comportamental proprietário que vai além do teste DISC existente. A Parte 1 do Gauge-Pro utiliza uma técnica validada de **escolha forçada de adjetivos** para mapear o perfil comportamental do candidato em 5 dimensões.

Esta metodologia é fundamentada em bases científicas (Big Five, Predictive Index, DISC) e adaptada para o contexto brasileiro. A seleção de palavras é uma técnica menos suscetível a respostas socialmente desejáveis, pois força o candidato a fazer escolhas entre palavras que parecem igualmente positivas.

O teste de palavras funciona em duas perspectivas: como o candidato se vê (Lista A) e como acredita que outros esperam que seja no trabalho (Lista B), permitindo identificar gaps entre autopercepção e expectativa social.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Plataforma possui apenas teste DISC tradicional
- PRDs 046-048 definiram a arquitetura do Gauge-Pro
- Não existe teste de seleção de palavras implementado
- Candidatos não têm acesso a avaliação comportamental multidimensional

### Situação Desejada (To-Be)

- Candidato acessa Gauge-Pro e inicia com Parte 1 (Seleção de Palavras)
- Visualiza 100 adjetivos organizados por dimensão (exibição embaralhada)
- Seleciona exatamente 5 palavras para Lista A ("como você realmente é")
- Seleciona exatamente 5 palavras para Lista B ("como outros esperam que você seja")
- Sistema calcula scores por dimensão (D1-D5) com base nas seleções
- Progresso é salvo e candidato pode continuar para Parte 2
- Gamificação: XP e progresso no perfil

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Seleção livre (sem limite de 5) | Não força escolhas, reduz validade do teste |
| Uma única lista de seleção | Perde a dimensão de expectativa social vs autopercepção |
| 10 palavras por dimensão | 20 palavras por dimensão oferece maior granularidade e validade |
| Exibição por dimensão | Revela estrutura do teste, facilita manipulação |

---

## Escopo

### Incluído

- ✅ Banco de 100 adjetivos mapeados em 5 dimensões (D1-D5)
- ✅ Interface de seleção com checkboxes e contador
- ✅ Duas listas de seleção: Lista A e Lista B
- ✅ Validação de exatamente 5 seleções por lista
- ✅ Embaralhamento dos adjetivos na exibição
- ✅ Sistema de pontuação (+2 para alta, -2 para baixa dimensão)
- ✅ Cálculo de scores brutos e normalizados por dimensão
- ✅ Persistência de respostas no banco de dados
- ✅ Integração com gamificação (XP por conclusão)
- ✅ Timer indicativo (não bloqueante)
- ✅ Design responsivo mobile-first

### Excluído

- ❌ Parte 2 do teste (cenários situacionais) — ver PRD-050
- ❌ Geração de relatório completo — depende das duas partes
- ❌ Análise de IA sobre perfil — fase posterior
- ❌ Comparação com perfil ideal de vaga — depende de conclusão total
- ❌ Dashboard administrativo para este teste — já coberto em PRD-046

---

## Modelo de Dados: Banco de Adjetivos

### Dimensões Avaliadas

| Dimensão | Nome | O que Mede |
|----------|------|------------|
| **D1** | Dominância/Assertividade | Como a pessoa influencia pessoas, eventos e resultados |
| **D2** | Sociabilidade/Extroversão | Preferência por interação social vs trabalho independente |
| **D3** | Ritmo/Paciência | Velocidade preferida de trabalho e resposta a mudanças |
| **D4** | Conformidade/Estrutura | Adesão a normas, processos e atenção a detalhes |
| **D5** | Orientação Relacional | Foco em pessoas vs foco em tarefas/resultados |

### Banco de 100 Adjetivos

#### D1 - DOMINÂNCIA/ASSERTIVIDADE (20 adjetivos)

**Alta Dominância (Score +2):**
| ID | Adjetivo |
|----|----------|
| 1 | Decidido |
| 2 | Influente |
| 3 | Competitivo |
| 4 | Determinado |
| 5 | Direto |
| 6 | Ousado |
| 7 | Controlador |
| 8 | Autoritário |
| 9 | Comandante |
| 10 | Desafiador |

**Baixa Dominância (Score -2):**
| ID | Adjetivo |
|----|----------|
| 11 | Cooperativo |
| 12 | Receptivo |
| 13 | Conciliador |
| 14 | Diplomático |
| 15 | Consensual |
| 16 | Harmonioso |
| 17 | Moderado |
| 18 | Cauteloso |
| 19 | Prudente |
| 20 | Reservado |

#### D2 - SOCIABILIDADE/EXTROVERSÃO (20 adjetivos)

**Alta Sociabilidade (Score +2):**
| ID | Adjetivo |
|----|----------|
| 21 | Comunicativo |
| 22 | Entusiasmado |
| 23 | Persuasivo |
| 24 | Amigável |
| 25 | Expressivo |
| 26 | Sociável |
| 27 | Animado |
| 28 | Caloroso |
| 29 | Extrovertido |
| 30 | Falante |

**Baixa Sociabilidade (Score -2):**
| ID | Adjetivo |
|----|----------|
| 31 | Reservado |
| 32 | Reflexivo |
| 33 | Introspectivo |
| 34 | Discreto |
| 35 | Observador |
| 36 | Quieto |
| 37 | Concentrado |
| 38 | Sério |
| 39 | Analítico |
| 40 | Independente |

#### D3 - RITMO/PACIÊNCIA (20 adjetivos)

**Alto Ritmo/Paciente (Score +2):**
| ID | Adjetivo |
|----|----------|
| 41 | Paciente |
| 42 | Constante |
| 43 | Persistente |
| 44 | Estável |
| 45 | Metódico |
| 46 | Regular |
| 47 | Previsível |
| 48 | Calmo |
| 49 | Consistente |
| 50 | Deliberado |

**Baixo Ritmo/Dinâmico (Score -2):**
| ID | Adjetivo |
|----|----------|
| 51 | Ágil |
| 52 | Dinâmico |
| 53 | Rápido |
| 54 | Energético |
| 55 | Impulsivo |
| 56 | Versátil |
| 57 | Inquieto |
| 58 | Urgente |
| 59 | Espontâneo |
| 60 | Multitarefa |

#### D4 - CONFORMIDADE/ESTRUTURA (20 adjetivos)

**Alta Conformidade (Score +2):**
| ID | Adjetivo |
|----|----------|
| 61 | Organizado |
| 62 | Preciso |
| 63 | Detalhista |
| 64 | Sistemático |
| 65 | Disciplinado |
| 66 | Cuidadoso |
| 67 | Meticuloso |
| 68 | Formal |
| 69 | Estruturado |
| 70 | Rigoroso |

**Baixa Conformidade (Score -2):**
| ID | Adjetivo |
|----|----------|
| 71 | Criativo |
| 72 | Inovador |
| 73 | Flexível |
| 74 | Informal |
| 75 | Independente |
| 76 | Improvisador |
| 77 | Adaptável |
| 78 | Livre |
| 79 | Original |
| 80 | Questionador |

#### D5 - ORIENTAÇÃO RELACIONAL (20 adjetivos)

**Orientação Relacional (Score +2):**
| ID | Adjetivo |
|----|----------|
| 81 | Empático |
| 82 | Compreensivo |
| 83 | Atencioso |
| 84 | Solidário |
| 85 | Colaborativo |
| 86 | Acolhedor |
| 87 | Gentil |
| 88 | Sensível |
| 89 | Prestativo |
| 90 | Carinhoso |

**Orientação a Tarefas (Score -2):**
| ID | Adjetivo |
|----|----------|
| 91 | Objetivo |
| 92 | Prático |
| 93 | Focado |
| 94 | Eficiente |
| 95 | Direto |
| 96 | Produtivo |
| 97 | Lógico |
| 98 | Pragmático |
| 99 | Realista |
| 100 | Técnico |

---

## Requisitos Funcionais

### Interface do Candidato

- **RF-001:** O sistema deve exibir instruções claras antes do início do teste de palavras
- **RF-002:** As instruções devem explicar as duas listas: Lista A (como você realmente é) e Lista B (como outros esperam que você seja no trabalho)
- **RF-003:** O sistema deve exibir os 100 adjetivos em ordem embaralhada (não agrupados por dimensão)
- **RF-004:** Cada adjetivo deve ter um checkbox para seleção
- **RF-005:** O sistema deve exibir contador de seleções: "Selecionados: X/5"
- **RF-006:** O sistema deve impedir seleção de mais de 5 palavras por lista
- **RF-007:** O candidato deve poder desmarcar palavras já selecionadas
- **RF-008:** O botão "Avançar" só deve ser habilitado quando exatamente 5 palavras estiverem selecionadas
- **RF-009:** Após completar Lista A, o sistema deve carregar Lista B com os mesmos adjetivos (re-embaralhados)
- **RF-010:** O sistema deve exibir timer indicativo (estimativa de 5-8 minutos para parte completa)
- **RF-011:** O design deve ser responsivo e mobile-first
- **RF-012:** O sistema deve exibir barra de progresso indicando etapa atual

### Lógica de Pontuação

- **RF-013:** Cada adjetivo selecionado deve adicionar seu valor mapeado (+2 ou -2) à dimensão correspondente
- **RF-014:** Lista A deve ter peso 1.0 na pontuação
- **RF-015:** Lista B deve ter peso 0.5 na pontuação
- **RF-016:** O score bruto por dimensão deve ser calculado como: `(Soma Lista A × 1.0) + (Soma Lista B × 0.5)`
- **RF-017:** O score normalizado deve ser calculado para escala 0-100 por dimensão

### Persistência

- **RF-018:** As respostas devem ser salvas no banco de dados ao concluir cada lista
- **RF-019:** O sistema deve registrar timestamp de início e conclusão de cada lista
- **RF-020:** O sistema deve permitir retomar teste incompleto
- **RF-021:** Após conclusão da Parte 1, o candidato deve ser direcionado para Parte 2

### Gamificação

- **RF-022:** O candidato deve receber XP ao completar a Parte 1 do teste
- **RF-023:** O progresso do teste deve atualizar o indicador de completude do perfil

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Tempo de carregamento dos adjetivos < 2 segundos
- **RNF-002 (Usabilidade):** Interface clara sem necessidade de scroll excessivo em mobile
- **RNF-003 (Acessibilidade):** Contraste adequado e tamanho de fonte legível
- **RNF-004 (Responsividade):** Funcional em telas de 320px a 1920px
- **RNF-005 (Segurança):** Adjetivos exibidos em ordem aleatória para evitar manipulação

---

## Critérios de Aceitação

### RF-001/002: Instruções Iniciais

```gherkin
DADO que o candidato iniciou o teste Gauge-Pro Parte 1
QUANDO a tela de instruções é exibida
ENTÃO deve mostrar explicação sobre Lista A e Lista B
  E deve indicar que o candidato selecionará exatamente 5 palavras em cada lista
  E deve ter botão "Iniciar Teste"
```

### RF-003/004/005: Exibição dos Adjetivos

```gherkin
DADO que o candidato está na tela de seleção da Lista A
QUANDO os adjetivos são carregados
ENTÃO os 100 adjetivos devem estar em ordem aleatória (não por dimensão)
  E cada adjetivo deve ter um checkbox
  E deve exibir contador "Selecionados: 0/5"
```

### RF-006/007/008: Validação de Seleção

```gherkin
DADO que o candidato selecionou 5 palavras na Lista A
QUANDO tentar selecionar uma 6ª palavra
ENTÃO o sistema deve impedir a seleção adicional
  E deve manter o contador em "Selecionados: 5/5"
  E o botão "Avançar" deve estar habilitado

DADO que o candidato selecionou menos de 5 palavras
QUANDO visualizar o botão "Avançar"
ENTÃO o botão deve estar desabilitado
```

### RF-013/014/015/016: Cálculo de Pontuação

```gherkin
DADO que o candidato completou Lista A e Lista B
QUANDO o sistema calcular os scores
ENTÃO deve somar os valores dos adjetivos selecionados por dimensão
  E Lista A deve ter peso 1.0
  E Lista B deve ter peso 0.5
  E o score bruto deve ser (Soma_A × 1.0) + (Soma_B × 0.5) por dimensão
```

### RF-022: Gamificação

```gherkin
DADO que o candidato completou a Parte 1 do teste
QUANDO os dados forem salvos
ENTÃO o candidato deve receber XP correspondente
  E o perfil deve indicar progresso na avaliação Gauge-Pro
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de dados e seed de adjetivos | 3 |
| 2 | Interface de seleção de palavras | 4 |
| 3 | Lógica de pontuação e persistência | 3 |
| 4 | Gamificação e integração | 2 |

### Detalhamento das Fases

#### Fase 1: Modelo de Dados e Seed

**Objetivo:** Criar estrutura de banco para adjetivos e respostas

**Ações:**
- [ ] Criar tabela `gauge_adjectives` com: id, word, dimension (D1-D5), polarity (high/low), score (+2/-2)
- [ ] Criar tabela `gauge_word_responses` com: candidato_id, test_id, list_type (A/B), adjective_ids[], created_at
- [ ] Seed com os 100 adjetivos mapeados
- [ ] Validar integridade dos dados

**Validação:** Query retorna 100 adjetivos, 20 por dimensão, 10 +2 e 10 -2 cada

#### Fase 2: Interface de Seleção

**Objetivo:** Criar componentes de UI para seleção de palavras

**Ações:**
- [ ] Criar componente `WordSelectionScreen` com instruções
- [ ] Criar componente `AdjectiveGrid` com checkboxes
- [ ] Criar componente `SelectionCounter` (X/5)
- [ ] Implementar embaralhamento de adjetivos
- [ ] Criar lógica de bloqueio ao atingir 5 seleções
- [ ] Implementar transição Lista A → Lista B
- [ ] Design responsivo mobile-first

**Validação:** Candidato consegue selecionar exatamente 5 palavras em cada lista

#### Fase 3: Lógica de Pontuação e Persistência

**Objetivo:** Calcular scores e salvar respostas

**Ações:**
- [ ] Implementar função de cálculo de score bruto por dimensão
- [ ] Implementar normalização para escala 0-100
- [ ] Criar serviço de persistência de respostas
- [ ] Implementar salvamento parcial (por lista)
- [ ] Criar lógica de retomada de teste incompleto

**Validação:** Scores calculados corretamente conforme fórmula

#### Fase 4: Gamificação e Integração

**Objetivo:** Integrar com sistema de XP e fluxo geral

**Ações:**
- [ ] Configurar XP por conclusão da Parte 1
- [ ] Atualizar indicador de progresso do perfil
- [ ] Criar transição para Parte 2 (PRD-050)
- [ ] Testes de integração end-to-end

**Validação:** Fluxo completo funciona sem erros

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-046 | Fundação Administrativa Gauge-Pro | ✅ Implementado |
| PRD-047 | Avaliação Gauge-Pro Candidatos | ✅ Implementado |
| PRD-048 | Avaliação Gauge-Pro por Vaga | ✅ Implementado |

### PRDs Subsequentes

| PRD | Descrição | Dependência |
|-----|-----------|-------------|
| PRD-050 | Gauge-Pro Parte 2: Cenários | Depende deste PRD |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Sistema de Avaliação Comportamental Gauge-Pro"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-046 | Fundação Administrativa | ✅ | Base |
| 2 | PRD-047 | Avaliação Candidatos | ✅ | Depende de 046 |
| 3 | PRD-048 | Avaliação por Vaga | ✅ | Depende de 046, 047 |
| **4** | **PRD-049** | **Seleção de Palavras** | **🔄 ATUAL** | Depende de 046-048 |
| 5 | PRD-050 | Cenários Situacionais | ⏳ | Depende de 049 |

> **Nota:** Implemente na ordem indicada. PRDs anteriores devem estar ✅ antes de iniciar este.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Candidato] ──▶ [Inicia Gauge-Pro] ──▶ [Lê Instruções] ──▶ [Inicia Parte 1]
                                                              │
                                                              ▼
                                                   [Vê 100 adjetivos embaralhados]
                                                              │
                                                              ▼
                                                   [Seleciona 5 para Lista A]
                                                              │
                                                              ▼
                                                   [Avança para Lista B]
                                                              │
                                                              ▼
                                                   [Seleciona 5 para Lista B]
                                                              │
                                                              ▼
                                                   [Sistema calcula scores]
                                                              │
                                                              ▼
                                                   [Recebe XP] ──▶ [Parte 2]
```

### Fluxo de Retomada

```
[Candidato] ──▶ [Acessa Gauge-Pro] ──▶ [Detecta teste incompleto]
                                              │
                                              ▼
                                    [Opções: Continuar ou Reiniciar]
                                              │
                                              ▼
                                    [Retoma de onde parou]
```

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Respostas do candidato | Sensível | RLS por candidato |
| Scores calculados | Sensível | Acesso restrito |

### Anti-Manipulação

- Adjetivos exibidos em ordem aleatória
- Dimensões não são reveladas ao candidato
- Não há feedback imediato sobre "acertos"

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
>   Ex: `PRD-049-gauge-pro-selecao-palavras_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças.

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
| **Não bloquear fluxo principal** | Se embaralhamento falhar, usar ordem original |
| **Fail gracefully** | Se salvamento parcial falhar, manter em memória e retry |
| **Preservar evidências** | Salvar timestamp de cada seleção para auditoria |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Embaralhamento** | Usar algoritmo Fisher-Yates para distribuição uniforme |
| **Persistência** | Salvar após cada lista, não apenas no final |
| **Mobile** | Testar em viewports 320px, 375px, 414px |
| **Acessibilidade** | Labels adequados para screen readers |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Agrupar adjetivos por dimensão na exibição |
| Revelar score parcial ao candidato durante seleção |
| Permitir mais ou menos de 5 seleções |
| Cache de adjetivos que comprometa embaralhamento |
| Hardcodar adjetivos no código (usar banco de dados) |

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
| 27/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
