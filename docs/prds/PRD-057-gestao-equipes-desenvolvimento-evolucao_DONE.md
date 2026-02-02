# PRD-057: Gestão de Equipes — Desenvolvimento e Evolução

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
| `PRD-055` | Gestão de Equipes: Core e Mapa Comportamental |
| `PRD-056` | Gestão de Equipes: Compatibilidade e Team Builder |
| **`PRD-057`** | ⬅ Você está aqui — Gestão de Equipes: Desenvolvimento e Evolução |

---

# PRD-057: Gestão de Equipes — Desenvolvimento e Evolução

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Empresa |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar sistema de desenvolvimento individual baseado em perfil comportamental, retestes periódicos com linha do tempo de evolução, identificação de líderes naturais, cultura organizacional mapeada, e trilhas de crescimento personalizadas por colaborador |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Média |
| **Épico** | Gestão de Equipes |
| **PRDs Relacionados** | PRD-049, PRD-050, PRD-051, PRD-055, PRD-056 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade — sistema de retestes com histórico temporal, cálculo de evolução por dimensão, algoritmo de identificação de potenciais (líderes, especialistas), motor de recomendação de desenvolvimento, e agregação de dados para DNA cultural.

---

## Contexto do Problema

Com mapa comportamental (PRD-055) e compatibilidade (PRD-056), a empresa entende sua equipe **no presente**. Mas perfis comportamentais não são estáticos — pessoas evoluem, desenvolvem novas competências, e mudam com o ambiente.

Três necessidades emergem:

1. **Desenvolvimento individual:** Colaborador mapeado como "D5 baixo" pode desenvolver orientação relacional. Mas sem plano nem métricas, o crescimento é invisível.

2. **Evolução temporal:** Sem retestes, o perfil de 2 anos atrás pode não refletir a pessoa de hoje. E sem linha do tempo, não há como medir impacto de treinamentos.

3. **Cultura organizacional:** A agregação de todos os perfis revela o "DNA" da empresa — e permite comparar candidatos com a cultura, não apenas com a vaga.

Este PRD fecha o ciclo da Gestão de Equipes com visão de longo prazo.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Perfil comportamental é estático (foto de um momento)
- Não há plano de desenvolvimento baseado em perfil
- Não há reteste periódico
- Não há evolução temporal visível
- Não há conceito de cultura organizacional mapeada
- Candidatos são comparados apenas com vagas, não com a cultura

### Situação Desejada (To-Be)

- Plano de desenvolvimento individual (PDI) baseado no perfil
- Sugestões de treinamentos por dimensão
- Retestes periódicos (6-12 meses) com comparação
- Linha do tempo de evolução por dimensão
- Medir impacto de treinamentos no perfil
- Identificação de líderes naturais, especialistas, mediadores
- Perfil cultural da empresa (DNA organizacional)
- Matching candidato vs cultura (além de candidato vs vaga)

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| PDI manual sem vínculo com perfil | Não usa inteligência comportamental |
| Apenas reteste sem comparação | Perde o valor da evolução temporal |
| Cultura como texto descritivo | Não é mensurável nem comparável |

---

## Escopo

### Incluído

- ✅ Plano de Desenvolvimento Individual (PDI) por colaborador
- ✅ Sugestões de desenvolvimento por dimensão
- ✅ Sistema de retestes periódicos
- ✅ Linha do tempo de evolução (D1-D5)
- ✅ Comparação antes/depois (impacto de treinamentos)
- ✅ Identificação de potenciais (líderes, especialistas, mediadores)
- ✅ Mapa de talentos (nine-box comportamental)
- ✅ Perfil cultural da empresa (DNA)
- ✅ Score de fit cultural para candidatos
- ✅ Relatórios de evolução

### Excluído

- ❌ Gestão de treinamentos (LMS)
- ❌ Avaliação de desempenho tradicional (objetivos, OKRs)
- ❌ Pesquisa de clima organizacional
- ❌ 360° feedback
- ❌ Integração com plataformas de e-learning

---

## Estrutura do Menu

### Localização no Painel Empresa

```
👥 Gestão de Equipes
    ├── Visão Geral (Dashboard)
    ├── Minha Equipe
    ├── Departamentos
    ├── Mapa Comportamental
    ├── Compatibilidade
    ├── Team Builder
    ├── Gap Analysis
    ├── Desenvolvimento ← NOVO
    ├── Talentos ← NOVO
    └── Cultura ← NOVO
```

---

## Requisitos Funcionais

### Plano de Desenvolvimento Individual (PDI)

- **RF-001:** O sistema deve gerar PDI automático baseado no perfil Gauge-Pro:

  Para cada dimensão do colaborador, gerar recomendações:

  | Score da Dimensão | Tipo de Recomendação |
  |-------------------|---------------------|
  | 0-33 (Baixo) | "Área de desenvolvimento prioritário" — sugestões intensivas |
  | 34-50 (Médio-baixo) | "Área de desenvolvimento" — sugestões moderadas |
  | 51-66 (Médio) | "Manutenção" — fortalecer o que já existe |
  | 67-100 (Alto) | "Ponto forte" — usar como alavanca, evitar excesso |

- **RF-002:** Sugestões de desenvolvimento por dimensão:

  | Dimensão | Score Baixo: Sugestão | Score Alto: Sugestão |
  |----------|-----------------------|---------------------|
  | D1 (Dominância) | Treinamentos de assertividade, tomada de decisão, protagonismo | Mentoria em escuta ativa, delegação, liderança servidora |
  | D2 (Sociabilidade) | Workshops de comunicação, networking, apresentação | Foco em aprofundamento técnico, trabalho individual |
  | D3 (Ritmo) | Gestão de tempo, técnicas de foco, urgência produtiva | Técnicas de desaceleração, qualidade vs velocidade |
  | D4 (Conformidade) | Metodologias ágeis, processos, frameworks organizacionais | Pensamento criativo, flexibilidade, improvisação |
  | D5 (Orientação) | Inteligência emocional, empatia, feedback construtivo | Gestão de limites, objetividade em decisões |

- **RF-003:** O sistema deve permitir que o gestor:
  - Visualizar PDI gerado automaticamente
  - Adicionar objetivos personalizados
  - Definir prazo para cada objetivo
  - Marcar objetivos como concluídos
  - Adicionar observações/notas

- **RF-004:** Cada objetivo do PDI deve ter:
  - Título
  - Dimensão vinculada (D1-D5)
  - Tipo: Desenvolvimento / Manutenção / Alavanca
  - Status: Pendente / Em andamento / Concluído
  - Prazo
  - Notas do gestor

- **RF-005:** O sistema deve exibir progresso do PDI:
  - Barra de progresso geral (% de objetivos concluídos)
  - Lista de objetivos agrupados por dimensão
  - Indicador visual de prioridade (alto/médio/baixo)

### Retestes e Evolução Temporal

- **RF-006:** O sistema deve permitir agendar retestes periódicos:
  - Frequência configurável: 3, 6, 9 ou 12 meses
  - Alerta automático quando reteste está pendente
  - Envio automático de convite na data programada (se habilitado)

- **RF-007:** O sistema deve manter histórico de todos os testes por colaborador:
  - Data de cada teste
  - Scores D1-D5 de cada teste
  - Perfil arquetípico de cada teste
  - Análise IA de cada teste (se disponível)

- **RF-008:** O sistema deve exibir linha do tempo de evolução:
  
  **Gráfico de linhas por dimensão:**
  ```
  Score
  100 │
   80 │          ╭─────── D4 ──────╮
   60 │    ╭─────────── D1 ─────────────
   40 │────────────── D5 ──────╭────────
   20 │
      └───────────────────────────────── Tempo
        Jan/25   Jul/25   Jan/26   Jul/26
  ```
  
  - Uma linha por dimensão (5 linhas)
  - Pontos marcados em cada data de teste
  - Tooltip com score exato ao passar o mouse
  - Opção de mostrar/ocultar dimensões individuais

- **RF-009:** O sistema deve calcular e exibir "Delta de Evolução":

  | Dimensão | Teste 1 (Jan/25) | Teste 2 (Jul/25) | Teste 3 (Jan/26) | Evolução |
  |----------|------------------|-------------------|-------------------|----------|
  | D1 | 45 | 52 | 60 | +15 ↑ |
  | D2 | 78 | 75 | 80 | +2 → |
  | D5 | 28 | 38 | 55 | +27 ↑↑ |

  Indicadores visuais:
  - ↑↑ Evolução significativa (> +15)
  - ↑ Evolução moderada (+5 a +15)
  - → Estável (-4 a +4)
  - ↓ Regressão (-5 a -15)
  - ↓↓ Regressão significativa (< -15)

- **RF-010:** O sistema deve permitir vincular evolução a ações:
  - "D5 subiu de 28 para 55 após treinamento de Inteligência Emocional"
  - Gestor pode anotar qual treinamento/ação causou a mudança
  - Permite medir ROI de treinamentos

### Identificação de Potenciais e Mapa de Talentos

- **RF-011:** O sistema deve identificar automaticamente perfis de potencial:

  | Perfil | Critério Dimensional | Descrição |
  |--------|---------------------|-----------|
  | **Líder Natural** | D1 ≥ 70 E D5 ≥ 60 | Assertivo e empático — liderança inspiradora |
  | **Especialista** | D4 ≥ 75 E D3 ≥ 60 | Metódico e ágil — excelência técnica |
  | **Mediador** | D5 ≥ 75 E D2 ≥ 60 | Relacional e comunicativo — resolução de conflitos |
  | **Inovador** | D1 ≥ 60 E D4 < 40 | Assertivo mas pouco conformista — disruptivo |
  | **Motor** | D1 ≥ 70 E D3 ≥ 70 | Dominante e rápido — execução e entrega |
  | **Mentor** | D5 ≥ 70 E D4 ≥ 60 | Empático e organizado — desenvolvimento de pessoas |

- **RF-012:** O sistema deve exibir seção "Talentos da Equipe":
  - Cards por tipo de potencial identificado
  - Lista de colaboradores que se encaixam
  - Filtro por departamento
  - Ex: "3 Líderes Naturais identificados — Maria (D1=82, D5=75), João (D1=78, D5=68), Ana (D1=70, D5=72)"

- **RF-013:** O sistema deve exibir "Nine-Box Comportamental":
  
  Adaptação do nine-box usando dimensões comportamentais:
  
  **Eixo X:** Score médio de "Entrega" (D1 + D3) / 2
  **Eixo Y:** Score médio de "Potencial Relacional" (D2 + D5) / 2

  ```
          Alto Potencial
            │
    ┌───────┼───────┐───────┐
    │ Estrela│ Alto  │ Gema  │
    │ Bruta  │Potencial│ Rara │
    ├────────┼────────┼───────┤
    │Contribui│ Core  │Futuro │
    │ dor    │ Player │Líder  │
    ├────────┼────────┼───────┤
    │Desen-  │Confia- │ Top   │
    │volver  │vel     │Performer│
    └────────┴────────┴───────┘
                    Alta Entrega →
  ```

  - Cada colaborador posicionado como bolha no grid
  - Tooltip com nome e scores
  - Clicável → abre perfil do colaborador

### Cultura Organizacional

- **RF-014:** O sistema deve calcular e exibir "DNA Cultural" da empresa:

  **Cálculo:**
  - Média ponderada de todas as dimensões (D1-D5) de todos os colaboradores ativos e mapeados
  - Peso por nível: Estratégico = 1.5, Tático = 1.2, Operacional = 1.0

  **Visualização:**
  - Radar chart do DNA Cultural
  - Descrição textual automática:
    - "Sua empresa tem cultura de Alta Conformidade e Alta Orientação Relacional — valoriza processos e pessoas."
    - "Pontos fortes: organização e empatia. Pontos de desenvolvimento: assertividade e velocidade."

- **RF-015:** O sistema deve gerar "Manifesto Cultural" automático:
  
  Baseado nos scores médios, gerar texto descritivo:
  ```
  "A [Nome da Empresa] é uma organização que valoriza [dimensões altas].
   Nossa equipe se destaca pela [força principal] e busca constantemente
   desenvolver [lacuna principal]. Nosso perfil predominante é [arquétipo 
   mais comum], refletindo uma cultura de [descrição do arquétipo]."
  ```

- **RF-016:** O sistema deve exibir evolução da cultura ao longo do tempo:
  - Radar chart comparativo: cultura de 12 meses atrás vs atual
  - Gráfico de tendência: como cada dimensão evoluiu

- **RF-017:** O sistema deve calcular "Score de Fit Cultural" para candidatos:
  
  **Cálculo:**
  ```
  Fit_Cultural = 100 - (Σ|Score_Candidato_Di - DNA_Empresa_Di| / 5)
  ```
  
  - Score 80-100: "Alta aderência cultural" 🟢
  - Score 60-79: "Boa aderência cultural" 🔵
  - Score 40-59: "Aderência parcial" 🟡
  - Score 0-39: "Baixa aderência" 🟠

- **RF-018:** O Score de Fit Cultural deve ser exibido:
  - No resultado individual do candidato (PRD-053) como badge adicional
  - No ranking de candidatos como coluna extra
  - No relatório PDF do candidato (PRD-054)
  - Junto ao Score de Fit com a Vaga (já existente)

### Relatórios de Desenvolvimento

- **RF-019:** O sistema deve gerar relatório PDF de evolução por colaborador:
  
  **Conteúdo:**
  - Capa com dados do colaborador
  - Gráfico de evolução temporal (todas as dimensões)
  - Tabela de delta por dimensão
  - Ações vinculadas a evoluções
  - Status do PDI
  - Observações do gestor

- **RF-020:** O sistema deve gerar relatório PDF de cultura organizacional:
  
  **Conteúdo:**
  - Radar chart do DNA Cultural
  - Distribuição de perfis
  - Manifesto Cultural gerado
  - Evolução cultural (12 meses)
  - Top talentos identificados
  - Gaps organizacionais

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Linha do tempo de evolução deve carregar em < 2 segundos
- **RNF-002 (Performance):** DNA Cultural deve calcular em < 5 segundos (até 2.000 colaboradores)
- **RNF-003 (Armazenamento):** Histórico de testes mantido indefinidamente
- **RNF-004 (UX):** PDI editável inline (sem abrir modal para cada ação)
- **RNF-005 (Automação):** Alertas de reteste enviados automaticamente por e-mail

---

## Critérios de Aceitação

### RF-001/002/003: PDI

```gherkin
DADO que um colaborador tem perfil mapeado com D5=28 (baixo) e D1=82 (alto)
QUANDO o gestor acessar o PDI desse colaborador
ENTÃO deve ver D5 como "Área de desenvolvimento prioritário" com sugestões de inteligência emocional
  E deve ver D1 como "Ponto forte" com sugestão de usar como alavanca
  E deve permitir adicionar objetivos personalizados
  E deve mostrar barra de progresso do PDI
```

### RF-006/007/008: Retestes e Evolução

```gherkin
DADO que um colaborador fez testes em Jan/25, Jul/25 e Jan/26
QUANDO o gestor acessar a evolução temporal
ENTÃO deve ver gráfico de linhas com 5 dimensões ao longo do tempo
  E deve ver 3 pontos por dimensão (um para cada teste)
  E deve ver delta de evolução: D5 = +27 (↑↑ significativa)
  E deve permitir anotar "Evolução após treinamento de IE" vinculado a D5
```

### RF-011/012: Identificação de Potenciais

```gherkin
DADO que Maria tem D1=82 e D5=75
QUANDO o sistema calcular perfis de potencial
ENTÃO Maria deve ser identificada como "Líder Natural"
  E deve aparecer na seção "Talentos da Equipe"
  E deve ter badge "Líder Natural" em seu perfil
```

### RF-014/015: Cultura Organizacional

```gherkin
DADO que a empresa tem 50 colaboradores mapeados
  E os scores médios são D1=55, D2=48, D3=62, D4=85, D5=72
QUANDO o gestor acessar a seção Cultura
ENTÃO deve ver radar chart do DNA Cultural
  E deve ver descrição: "Cultura de Alta Conformidade e Orientação Relacional"
  E deve ver Manifesto Cultural gerado automaticamente
  E deve ver evolução vs 12 meses atrás (se dados disponíveis)
```

### RF-017/018: Fit Cultural

```gherkin
DADO que o DNA Cultural é D1=55, D2=48, D3=62, D4=85, D5=72
  E um candidato tem D1=50, D2=45, D3=60, D4=80, D5=70
QUANDO o sistema calcular Fit Cultural
ENTÃO o score deve ser: 100 - (|50-55| + |45-48| + |60-62| + |80-85| + |70-72|) / 5
  E resultado = 100 - (5+3+2+5+2)/5 = 100 - 3.4 = 96.6%
  E classificação: "Alta aderência cultural" 🟢
  E deve aparecer no resultado do candidato junto ao Score de Fit da Vaga
```

### Cenários de Erro

```gherkin
DADO que um colaborador tem apenas 1 teste realizado
QUANDO o gestor acessar evolução temporal
ENTÃO deve exibir dados do teste único (sem gráfico de linha)
  E mensagem "Agende reteste para acompanhar a evolução"

DADO que a empresa não tem nenhum colaborador mapeado
QUANDO acessar Cultura Organizacional
ENTÃO deve exibir "Mapeie sua equipe para descobrir o DNA da sua empresa"
  E link para envio de testes em massa
```

---

## Modelo de Dados

### Tabela: `development_plans`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| team_member_id | UUID | FK colaborador |
| created_by | UUID | FK gestor que criou |
| status | ENUM | 'active', 'completed', 'archived' |
| progress_percent | DECIMAL(5,2) | Progresso geral |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: `development_objectives`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| plan_id | UUID | FK plano |
| dimension | ENUM | 'd1', 'd2', 'd3', 'd4', 'd5' |
| type | ENUM | 'development', 'maintenance', 'leverage' |
| title | VARCHAR(300) | Título do objetivo |
| description | TEXT | Descrição detalhada |
| priority | ENUM | 'high', 'medium', 'low' |
| status | ENUM | 'pending', 'in_progress', 'completed' |
| due_date | DATE | Prazo |
| completed_at | TIMESTAMP | Data de conclusão (nullable) |
| notes | TEXT | Observações do gestor |
| is_auto_generated | BOOLEAN | Se foi gerado automaticamente |
| created_at | TIMESTAMP | Criação |

### Tabela: `retest_schedules`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| team_member_id | UUID | FK colaborador |
| frequency_months | INT | Frequência em meses (3, 6, 9, 12) |
| next_test_date | DATE | Data do próximo teste |
| auto_send | BOOLEAN | Enviar convite automaticamente |
| is_active | BOOLEAN | Agendamento ativo |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: `evolution_annotations`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| team_member_id | UUID | FK colaborador |
| test_history_id | UUID | FK histórico do teste |
| dimension | ENUM | 'd1', 'd2', 'd3', 'd4', 'd5', 'general' |
| annotation | TEXT | Texto da anotação |
| action_type | VARCHAR(100) | Tipo de ação (treinamento, coaching, etc) |
| created_by | UUID | FK gestor |
| created_at | TIMESTAMP | Criação |

### Tabela: `company_culture_snapshots`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| snapshot_date | DATE | Data do snapshot |
| total_members | INT | Total de colaboradores mapeados |
| d1_avg | DECIMAL(5,2) | Média D1 |
| d2_avg | DECIMAL(5,2) | Média D2 |
| d3_avg | DECIMAL(5,2) | Média D3 |
| d4_avg | DECIMAL(5,2) | Média D4 |
| d5_avg | DECIMAL(5,2) | Média D5 |
| predominant_archetype | VARCHAR(50) | Arquétipo predominante |
| manifesto_text | TEXT | Manifesto gerado |
| created_at | TIMESTAMP | Criação |

> **Nota:** Snapshots gerados mensalmente para permitir comparação temporal.

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | PDI e objetivos de desenvolvimento | 4 |
| 2 | Retestes e evolução temporal | 4 |
| 3 | Identificação de potenciais e mapa de talentos | 4 |
| 4 | Cultura organizacional e DNA | 4 |
| 5 | Fit cultural e relatórios | 4 |

### Detalhamento das Fases

#### Fase 1: PDI e Objetivos

**Objetivo:** Implementar plano de desenvolvimento individual

**Ações:**
- [ ] Criar motor de geração automática de PDI baseado no perfil
- [ ] Implementar CRUD de objetivos de desenvolvimento
- [ ] Criar interface de visualização e edição do PDI
- [ ] Implementar barra de progresso e status

**Validação:** PDI é gerado automaticamente e permite edição pelo gestor

#### Fase 2: Retestes e Evolução

**Objetivo:** Implementar retestes periódicos e linha do tempo

**Ações:**
- [ ] Criar sistema de agendamento de retestes
- [ ] Implementar histórico de testes (tabela já existe no PRD-055)
- [ ] Criar gráfico de evolução temporal (linhas por dimensão)
- [ ] Implementar cálculo e exibição de delta
- [ ] Criar sistema de anotações vinculadas a evolução

**Validação:** Evolução temporal exibe dados corretos com delta calculado

#### Fase 3: Identificação de Potenciais

**Objetivo:** Implementar identificação automática e mapa de talentos

**Ações:**
- [ ] Implementar algoritmo de identificação de potenciais
- [ ] Criar seção "Talentos da Equipe"
- [ ] Implementar Nine-Box Comportamental
- [ ] Adicionar badges de potencial ao perfil do colaborador

**Validação:** Potenciais são identificados corretamente e nine-box funciona

#### Fase 4: Cultura Organizacional

**Objetivo:** Implementar DNA cultural e manifesto

**Ações:**
- [ ] Implementar cálculo do DNA Cultural (média ponderada)
- [ ] Criar radar chart cultural
- [ ] Implementar geração do Manifesto Cultural
- [ ] Criar snapshots mensais automáticos
- [ ] Implementar evolução cultural (comparação temporal)

**Validação:** DNA cultural calculado corretamente e manifesto gerado

#### Fase 5: Fit Cultural e Relatórios

**Objetivo:** Integrar fit cultural no recrutamento e gerar relatórios

**Ações:**
- [ ] Implementar cálculo de Fit Cultural para candidatos
- [ ] Integrar badge de fit cultural no resultado do candidato (PRD-053)
- [ ] Integrar no ranking de candidatos
- [ ] Gerar relatório PDF de evolução por colaborador
- [ ] Gerar relatório PDF de cultura organizacional

**Validação:** Fit cultural aparece em resultados de candidatos; relatórios gerados corretamente

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-049 | Seleção de Palavras (teste Gauge-Pro) | ⏳ |
| PRD-050 | Cenários Situacionais (teste Gauge-Pro) | ⏳ |
| PRD-051 | Análise IA (para PDFs) | ⏳ |
| PRD-053 | Resultados e Comparativos (para fit cultural) | ⏳ |
| PRD-055 | Core da Gestão de Equipes | ⏳ |
| PRD-056 | Compatibilidade e Team Builder | ⏳ |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Gestão de Equipes"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-046 | Fundação Administrativa | ✅ | Base Gauge-Pro |
| 2 | PRD-049 | Seleção de Palavras | ⏳ | Teste |
| 3 | PRD-050 | Cenários Situacionais | ⏳ | Teste |
| 4 | PRD-051 | Agente IA de Análise | ⏳ | Análise |
| 5 | PRD-052 | Hub: Dashboard e Gestão | ⏳ | Hub de Testes |
| 6 | PRD-053 | Hub: Resultados e Comparativos | ⏳ | Resultados |
| 7 | PRD-054 | Hub: Relatórios e Auditoria | ⏳ | Relatórios |
| 8 | PRD-055 | Equipes: Core e Mapa | ⏳ | Fundação Equipes |
| 9 | PRD-056 | Equipes: Compatibilidade e Team Builder | ⏳ | Dinâmica |
| **10** | **PRD-057** | **Equipes: Desenvolvimento e Evolução** | **🔄 ATUAL** | Depende de 053, 055, 056 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados do PDI

- PDI visível pelo gestor e pelo colaborador (se acesso for liberado no futuro)
- Objetivos e notas são dados sensíveis de RH
- RLS por empresa

### Dados de Cultura

- DNA Cultural é informação estratégica da empresa
- Não compartilhar entre empresas
- Snapshots históricos são imutáveis

### Fit Cultural

- Candidato NÃO vê seu Score de Fit Cultural
- Score usado apenas internamente pela empresa para decisão

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

**Codinomes:** Sugestão: "Evolve" (evolução e desenvolvimento)

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
| **Não bloquear fluxo principal** | Cálculos de cultura em background/schedule |
| **Fail gracefully** | Se snapshot falhar, usar último válido |
| **Preservar evidências** | Histórico de testes e snapshots nunca excluídos |
| **Testar incrementalmente** | Validar cada cálculo isoladamente |
| **Documentar decisões** | Registrar ajustes nas fórmulas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **PDI** | Geração automática como sugestão, não imposição |
| **Retestes** | Notificar gestor, não enviar direto ao colaborador sem opt-in |
| **Nine-box** | Usar cores suaves, evitar rótulos negativos |
| **Snapshots** | Agendar job mensal (primeira noite do mês) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Excluir histórico de testes antigos |
| Mostrar nine-box para colaboradores (é ferramenta de gestão) |
| Compartilhar DNA Cultural entre empresas |
| Gerar manifesto com linguagem negativa |
| Calcular cultura com menos de 5 colaboradores mapeados (amostra insuficiente) |

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
