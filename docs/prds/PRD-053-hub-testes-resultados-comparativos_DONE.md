# PRD-053: Hub de Testes Comportamentais — Resultados e Comparativos

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-049` | Gauge-Pro Parte 1: Seleção de Palavras |
| `PRD-050` | Gauge-Pro Parte 2: Cenários Situacionais |
| `PRD-051` | Agente de Análise Comportamental por IA |
| `PRD-052` | Hub de Testes: Dashboard e Gestão |
| **`PRD-053`** | ⬅ Você está aqui — Hub de Testes: Resultados e Comparativos |
| `PRD-054` | Hub de Testes: Relatórios, Métricas e Auditoria |

---

# PRD-053: Hub de Testes Comportamentais — Resultados e Comparativos

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Empresa |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar visualização de resultados individuais e sistema de comparação lado a lado entre candidatos, com ranking de compatibilidade com vaga e destaque visual de pontos fortes e fracos |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Épico** | Hub de Testes Comportamentais |
| **PRDs Relacionados** | PRD-049, PRD-050, PRD-051, PRD-052, PRD-054 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade — visualizações de dados (radar charts, barras comparativas), algoritmo de ranking de compatibilidade, comparação lado a lado com até 4 candidatos, integração com análise IA (PRD-051) e com sistema de gestão (PRD-052).

---

## Contexto do Problema

Com o Hub de Testes (PRD-052), empresas podem criar e aplicar testes comportamentais. Porém, ter resultados é diferente de **entender** e **comparar** resultados.

Recrutadores enfrentam três dificuldades:
1. **Interpretar resultados individuais** — scores numéricos não são intuitivos para leigos
2. **Comparar candidatos** — sem ferramenta visual, a comparação é mental e enviesada
3. **Decidir quem avançar** — sem ranking objetivo, decisões são baseadas em "feeling"

Este PRD resolve essas dificuldades com visualizações intuitivas, comparativos lado a lado e ranking automático de compatibilidade.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Resultados do Gauge-Pro são exibidos como scores e perfil arquetípico
- Análise IA gera texto prático e técnico (PRD-051)
- Não há comparação visual entre candidatos
- Não há ranking de compatibilidade com a vaga
- Gestor precisa abrir resultado de cada candidato individualmente

### Situação Desejada (To-Be)

- Resultado individual com visualização rica (radar, barras, perfil)
- Comparativo lado a lado de 2 a 4 candidatos
- Ranking automático de compatibilidade com a vaga
- Destaque visual de pontos fortes, fracos e diferenciais
- Visão "shortlist" para decisão rápida

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas tabela numérica | Não intuitiva para recrutadores leigos |
| Comparar apenas 2 candidatos | Muito limitado para vagas com muitos candidatos |
| Ranking sem visualização | Números sozinhos não comunicam o "porquê" |

---

## Escopo

### Incluído

- ✅ Visualização individual rica do resultado
- ✅ Radar chart por candidato e por comparação
- ✅ Barra de progresso por dimensão com código de cores
- ✅ Card de perfil arquetípico
- ✅ Exibição da Análise Prática da IA (PRD-051)
- ✅ Comparativo lado a lado (2-4 candidatos)
- ✅ Radar chart sobreposto na comparação
- ✅ Tabela comparativa de dimensões
- ✅ Ranking de compatibilidade com a vaga
- ✅ Score de fit calculado automaticamente
- ✅ Destaque visual de diferenciais entre candidatos
- ✅ Shortlist com recomendação

### Excluído

- ❌ Relatório PDF exportável (PRD-054)
- ❌ Métricas agregadas de todos os testes (PRD-054)
- ❌ Auditoria de quem visualizou (PRD-054)
- ❌ Análise Técnica (visível apenas no Admin, não na Empresa)

---

## Requisitos Funcionais

### Resultado Individual do Candidato

- **RF-001:** O sistema deve exibir tela de resultado individual com:
  - Nome e foto do candidato
  - Perfil arquetípico com ícone e nome
  - Descrição resumida do perfil (2-3 linhas)
  - Score geral de compatibilidade com a vaga (se vinculada)

- **RF-002:** O sistema deve exibir radar chart com as 5 dimensões:
  - D1 (Dominância) — valores de 0 a 100
  - D2 (Sociabilidade) — valores de 0 a 100
  - D3 (Ritmo) — valores de 0 a 100
  - D4 (Conformidade) — valores de 0 a 100
  - D5 (Orientação) — valores de 0 a 100
  - Se há vaga vinculada: sobrepor "perfil ideal da vaga" em cor diferente

- **RF-003:** O sistema deve exibir barras de progresso por dimensão:
  - Barra horizontal 0-100 com código de cores:
    - 0-33: Vermelho suave (baixo)
    - 34-66: Amarelo (médio)
    - 67-100: Verde (alto)
  - Label com nome legível da dimensão (ex: "Assertividade" ao invés de "D1")
  - Valor numérico e classificação (Baixo/Médio/Alto)

- **RF-004:** O sistema deve exibir card do perfil arquetípico:
  - Nome do perfil (ex: "O Capitão")
  - Ícone representativo
  - Características principais (3-5 bullet points)
  - Áreas de força
  - Áreas de desenvolvimento

- **RF-005:** O sistema deve exibir a Análise Prática gerada por IA (PRD-051):
  - Seção expansível "Análise Inteligente"
  - Indicador "Gerado por IA"
  - Conteúdo formatado em Markdown renderizado

- **RF-006:** O sistema deve exibir seção "Top 3 Forças" e "Top 2 Áreas de Desenvolvimento":
  - As 3 dimensões com maior score como forças
  - As 2 dimensões com menor score como desenvolvimento
  - Cada uma com breve descrição prática

- **RF-007:** Se o teste está vinculado a uma vaga, exibir "Score de Fit":
  - Cálculo: média ponderada dos scores por dimensão × peso da dimensão na vaga
  - Exibição: percentual (0-100%) com barra de progresso
  - Classificação: Excelente (80-100), Bom (60-79), Regular (40-59), Baixo (0-39)
  - Código de cores correspondente

### Comparativo Lado a Lado

- **RF-008:** O sistema deve permitir selecionar de 2 a 4 candidatos para comparação:
  - Checkbox na lista de candidatos do teste
  - Botão "Comparar Selecionados" (habilitado com 2+ selecionados)
  - Limite máximo de 4 candidatos simultâneos

- **RF-009:** Na tela de comparação, exibir:
  - Cards lado a lado com foto, nome e perfil arquetípico
  - Score de fit (se há vaga) com destaque no maior
  - Radar chart com linhas sobrepostas (uma cor por candidato)
  - Legenda com nome e cor de cada candidato

- **RF-010:** O sistema deve exibir tabela comparativa de dimensões:

  ```
  Dimensão        | Maria (85%) | João (72%) | Ana (68%) |
  Assertividade   |  ████████░  | ███████░░  | ██████░░░ |
  Sociabilidade   |  ████░░░░░  | █████████░ | ██████░░░ |
  Ritmo           |  ███████░░  | ████░░░░░  | █████████ |
  Organização     |  █████████  | ██████░░░  | ███████░░ |
  Foco Relacional |  █████░░░░  | ████████░░ | █████████ |
  ```

- **RF-011:** O sistema deve destacar diferenciais:
  - Maior valor por dimensão destacado em verde
  - Menor valor por dimensão destacado em vermelho suave
  - Se diferença > 20 pontos entre candidatos, exibir ícone de alerta

- **RF-012:** O sistema deve exibir seção "Destaques da Comparação":
  - "[Maria] se destaca em Organização e Assertividade"
  - "[João] é o mais forte em Sociabilidade"
  - "[Ana] tem o melhor equilíbrio entre todas as dimensões"

### Ranking de Compatibilidade

- **RF-013:** O sistema deve gerar ranking automático de candidatos quando o teste está vinculado a uma vaga:
  - Ordenar por Score de Fit (maior → menor)
  - Exibir posição (#1, #2, #3...)
  - Exibir score de fit com barra de progresso
  - Exibir perfil arquetípico de cada um

- **RF-014:** O cálculo do Score de Fit deve usar a fórmula:
  ```
  Score_Fit = Σ(Score_Dimensão × Peso_Dimensão) / Σ(100 × Peso_Dimensão) × 100
  ```
  Onde:
  - `Score_Dimensão` = score normalizado (0-100) do candidato em cada D1-D5
  - `Peso_Dimensão` = peso configurado no teste (0.5 a 2.0) conforme PRD-052

- **RF-015:** O ranking deve permitir:
  - Filtrar por classificação de fit (Excelente, Bom, Regular, Baixo)
  - Ordenar por dimensão específica (ex: ordenar pelo score de D2)
  - Buscar candidato por nome

- **RF-016:** O sistema deve exibir indicador visual por faixa de fit:

  | Faixa | Score | Cor | Ícone |
  |-------|-------|-----|-------|
  | Excelente | 80-100% | Verde | ✅ |
  | Bom | 60-79% | Azul | 👍 |
  | Regular | 40-59% | Amarelo | ➡️ |
  | Baixo | 0-39% | Vermelho suave | ⚠️ |

### Shortlist e Recomendação

- **RF-017:** O sistema deve gerar shortlist automática:
  - Top 3 candidatos por Score de Fit
  - Exibição em cards destacados no topo do ranking
  - Badge "Recomendado" no candidato #1

- **RF-018:** O sistema deve permitir que o gestor adicione/remova candidatos de uma shortlist manual:
  - Botão "Adicionar à Shortlist" em cada candidato
  - Seção "Minha Shortlist" separada do ranking automático
  - Possibilidade de anotar observações por candidato

- **RF-019:** Na shortlist, o sistema deve exibir:
  - Mini radar chart de cada candidato
  - Score de fit
  - Perfil arquetípico
  - Botão de ação: "Ver resultado completo" ou "Avançar para entrevista"

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Radar charts devem renderizar em < 1 segundo
- **RNF-002 (Performance):** Ranking deve calcular e exibir em < 2 segundos (até 200 candidatos)
- **RNF-003 (Responsividade):** Comparativo deve funcionar em desktop (lado a lado) e tablet (stacked)
- **RNF-004 (Acessibilidade):** Cores devem ter contraste suficiente; informação não deve depender apenas de cor
- **RNF-005 (UX):** Transição suave ao alternar entre candidatos na comparação

---

## Critérios de Aceitação

### RF-001/002/003: Resultado Individual

```gherkin
DADO que um candidato concluiu o teste Gauge-Pro
QUANDO o gestor clicar no candidato na lista de resultados
ENTÃO deve ver tela de resultado com:
  E radar chart com 5 dimensões preenchidas
  E barras de progresso por dimensão com cores correspondentes
  E card do perfil arquetípico com descrição
  E análise prática da IA (se disponível)
```

### RF-007/014: Score de Fit

```gherkin
DADO que o teste está vinculado a uma vaga com pesos D1=1.5, D2=1.0, D3=0.8, D4=1.0, D5=1.2
  E o candidato tem scores D1=80, D2=60, D3=70, D4=50, D5=90
QUANDO o sistema calcular o Score de Fit
ENTÃO deve aplicar: (80×1.5 + 60×1.0 + 70×0.8 + 50×1.0 + 90×1.2) / (100×1.5 + 100×1.0 + 100×0.8 + 100×1.0 + 100×1.2) × 100
  E resultado deve ser: (120 + 60 + 56 + 50 + 108) / (550) × 100 = 71.6%
  E classificação deve ser "Bom" (faixa 60-79%)
```

### RF-008/009/010: Comparativo

```gherkin
DADO que o gestor selecionou 3 candidatos na lista
QUANDO clicar em "Comparar Selecionados"
ENTÃO deve ver tela com 3 cards lado a lado
  E radar chart com 3 linhas sobrepostas (cores diferentes)
  E tabela comparativa com barras visuais por dimensão
  E destaques automáticos de quem se destaca em cada dimensão
```

### RF-013/017: Ranking e Shortlist

```gherkin
DADO que o teste tem 10 candidatos concluídos e está vinculado a uma vaga
QUANDO o gestor acessar o ranking
ENTÃO deve ver lista ordenada por Score de Fit (maior primeiro)
  E os Top 3 devem aparecer em cards destacados (shortlist automática)
  E o #1 deve ter badge "Recomendado"
  E cada candidato deve ter barra de fit com cor por faixa
```

### Cenários de Erro

```gherkin
DADO que o gestor tenta comparar mais de 4 candidatos
QUANDO selecionar o 5º candidato
ENTÃO o checkbox deve ficar desabilitado
  E deve exibir tooltip "Máximo de 4 candidatos para comparação"

DADO que o teste não está vinculado a nenhuma vaga
QUANDO o gestor acessar ranking
ENTÃO não deve exibir Score de Fit
  E deve sugerir "Vincule este teste a uma vaga para ver o ranking de compatibilidade"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Resultado individual com visualizações | 5 |
| 2 | Comparativo lado a lado | 4 |
| 3 | Ranking de compatibilidade e Score de Fit | 3 |
| 4 | Shortlist e recomendações | 3 |

### Detalhamento das Fases

#### Fase 1: Resultado Individual

**Objetivo:** Criar tela completa de visualização de resultado

**Ações:**
- [ ] Implementar radar chart (5 dimensões, com sobreposição de perfil ideal se houver vaga)
- [ ] Implementar barras de progresso por dimensão com código de cores
- [ ] Criar card de perfil arquetípico
- [ ] Integrar exibição da Análise Prática (IA)
- [ ] Implementar seção "Top Forças" e "Áreas de Desenvolvimento"

**Validação:** Resultado individual exibe todas as visualizações corretamente

#### Fase 2: Comparativo Lado a Lado

**Objetivo:** Implementar seleção e comparação de candidatos

**Ações:**
- [ ] Adicionar checkboxes na lista de candidatos
- [ ] Implementar tela de comparação com cards lado a lado
- [ ] Implementar radar chart com linhas sobrepostas (2-4 candidatos)
- [ ] Implementar tabela comparativa com barras visuais
- [ ] Implementar destaques automáticos de diferenciais

**Validação:** Gestor consegue comparar 2-4 candidatos visualmente

#### Fase 3: Ranking de Compatibilidade

**Objetivo:** Implementar cálculo e exibição do ranking

**Ações:**
- [ ] Implementar cálculo do Score de Fit (fórmula ponderada)
- [ ] Criar lista rankeada com barras de fit
- [ ] Implementar filtros e ordenação
- [ ] Implementar classificação por faixa (Excelente, Bom, Regular, Baixo)

**Validação:** Ranking exibe candidatos ordenados por compatibilidade

#### Fase 4: Shortlist e Recomendações

**Objetivo:** Implementar shortlist automática e manual

**Ações:**
- [ ] Criar seção Top 3 (shortlist automática)
- [ ] Implementar badge "Recomendado"
- [ ] Criar shortlist manual com botão de adição
- [ ] Implementar campo de observações por candidato
- [ ] Criar ações rápidas (ver resultado, avançar para entrevista)

**Validação:** Shortlist automática e manual funcionam corretamente

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-049 | Seleção de Palavras (gera scores) | ⏳ |
| PRD-050 | Cenários Situacionais (gera perfil) | ⏳ |
| PRD-051 | Análise IA (gera textos) | ⏳ |
| PRD-052 | Hub Dashboard e Gestão (estrutura) | ⏳ |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Hub de Testes Comportamentais"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-046 | Fundação Administrativa | ✅ | Base |
| 2 | PRD-049 | Seleção de Palavras | ⏳ | Depende de 046 |
| 3 | PRD-050 | Cenários Situacionais | ⏳ | Depende de 049 |
| 4 | PRD-051 | Agente IA de Análise | ⏳ | Depende de 050 |
| 5 | PRD-052 | Hub: Dashboard e Gestão | ⏳ | Depende de 049, 050 |
| **6** | **PRD-053** | **Hub: Resultados e Comparativos** | **🔄 ATUAL** | Depende de 051, 052 |
| 7 | PRD-054 | Hub: Relatórios, Métricas e Auditoria | ⏳ | Depende de 052, 053 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Autorização

- Apenas gestores da empresa podem visualizar resultados de seus testes
- RLS por empresa: empresa A não vê resultados da empresa B
- Candidatos NÃO veem o ranking ou a comparação (apenas seu próprio resultado)

### Dados

- Resultados são read-only no painel da empresa (não podem ser editados)
- Shortlist manual é por gestor (cada gestor mantém sua seleção)

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
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

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
| **Não bloquear fluxo principal** | Visualizações devem carregar progressivamente |
| **Fail gracefully** | Se radar chart falhar, exibir dados em tabela |
| **Preservar evidências** | Scores originais nunca são alterados |
| **Testar incrementalmente** | Validar cada visualização independentemente |
| **Documentar decisões** | Registrar escolha de biblioteca de charts |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Charts** | Usar biblioteca compatível com React (recharts, chart.js, etc) |
| **Cores** | Seguir sistema de design existente da plataforma |
| **Responsivo** | Comparativo: lado a lado em desktop, stacked em tablet |
| **Performance** | Lazy loading para componentes pesados de chart |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Alterar scores originais para exibição (sempre usar dados brutos) |
| Renderizar todos os charts simultaneamente (usar lazy loading) |
| Permitir comparação sem candidatos com teste concluído |
| Expor Score de Fit quando não há vaga vinculada |
| Dependência de biblioteca de chart que não suporte responsividade |

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
| 01/02/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
