# PRD-056: Gestão de Equipes — Compatibilidade e Team Builder

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
| **`PRD-056`** | ⬅ Você está aqui — Gestão de Equipes: Compatibilidade e Team Builder |
| `PRD-057` | Gestão de Equipes: Desenvolvimento e Evolução |

---

# PRD-056: Gestão de Equipes — Compatibilidade e Team Builder

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Empresa |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar análise de compatibilidade entre membros da equipe com score de sinergia, sistema de Gap Analysis que identifica lacunas comportamentais, e simulador Team Builder que permite montar/reorganizar equipes com cálculo automático de equilíbrio dimensional |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Gestão de Equipes |
| **PRDs Relacionados** | PRD-049, PRD-050, PRD-051, PRD-055, PRD-057 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade — algoritmo de cálculo de sinergia entre pares, análise de gap dimensional com recomendações, simulador interativo com drag-and-drop e cálculos em tempo real, e integração com dados do Hub de Testes (PRD-052) para sugerir perfis de contratação.

---

## Contexto do Problema

Com o mapa comportamental (PRD-055), a empresa vê o perfil da equipe. Mas ver é diferente de **entender dinâmicas** e **tomar decisões**.

Três perguntas ficam sem resposta:
1. **"Quem trabalha bem junto?"** — Não há indicador de compatibilidade entre pares
2. **"O que falta na minha equipe?"** — Não há análise de gaps dimensionais que indique lacunas
3. **"E se eu reorganizar os times?"** — Não há simulador para testar impacto de mudanças

Este PRD implementa inteligência relacional sobre os dados comportamentais, transformando perfis individuais em insights sobre dinâmica de grupo.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Mapa comportamental mostra perfis individuais e médias
- Não há análise de relações entre membros
- Não há identificação de lacunas comportamentais
- Reorganização de equipes é baseada em intuição
- Recrutamento não se conecta com necessidades da equipe existente

### Situação Desejada (To-Be)

- Score de compatibilidade entre qualquer par de colaboradores
- Matriz de compatibilidade de todo departamento
- Gap Analysis: dimensões carentes na equipe com recomendação de perfil ideal
- Team Builder: simulador drag-and-drop para montar equipes
- Conexão direta: Gap → Perfil ideal → Filtro no recrutamento

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Compatibilidade apenas por arquétipo | Perde nuances dimensionais |
| Gap analysis manual pelo RH | Não escala, subjetiva |
| Sem Team Builder | Perde a capacidade de simular cenários "e se" |

---

## Escopo

### Incluído

- ✅ Score de compatibilidade entre pares (algoritmo dimensional)
- ✅ Matriz de compatibilidade por departamento
- ✅ Alertas de conflito potencial
- ✅ Sugestão de melhores duplas/trios
- ✅ Gap Analysis: lacunas dimensionais da equipe
- ✅ Recomendação de perfil ideal para próxima contratação
- ✅ Conexão Gap → Hub de Testes (sugestão de filtro)
- ✅ Team Builder: simulador drag-and-drop
- ✅ Cálculo em tempo real de equilíbrio ao montar times
- ✅ Cenários salvos para comparação

### Excluído

- ❌ IA generativa para análise de compatibilidade (futuro)
- ❌ Recomendação automática de reorganização (futuro)
- ❌ Integração com ferramentas de gestão de projetos
- ❌ Planos de desenvolvimento (PRD-057)
- ❌ Retestes e evolução temporal (PRD-057)

---

## Estrutura do Menu

### Localização no Painel Empresa

```
👥 Gestão de Equipes
    ├── Visão Geral (Dashboard)
    ├── Minha Equipe
    ├── Departamentos
    ├── Mapa Comportamental
    ├── Compatibilidade ← NOVO
    ├── Team Builder ← NOVO
    └── Gap Analysis ← NOVO
```

---

## Requisitos Funcionais

### Compatibilidade entre Membros

#### Algoritmo de Sinergia

- **RF-001:** O sistema deve calcular score de compatibilidade entre qualquer par de colaboradores usando a seguinte lógica:

  **Modelo de cálculo — Complementaridade Ponderada:**
  
  Para cada dimensão D1-D5, calcular:
  - Se ambos na mesma faixa (alto-alto ou baixo-baixo): **similaridade** → pontuação neutra
  - Se complementares (alto-baixo): avaliar se a complementaridade é positiva ou negativa para a dimensão
  
  **Matriz de sinergia por dimensão:**

  | Dimensão | Combinação | Efeito | Score |
  |----------|-----------|--------|-------|
  | D1 (Dominância) | Alto + Alto | ⚠️ Conflito potencial | -20 |
  | D1 (Dominância) | Alto + Baixo | ✅ Complementar (líder + executor) | +15 |
  | D1 (Dominância) | Baixo + Baixo | ➡️ Neutro (sem liderança clara) | 0 |
  | D2 (Sociabilidade) | Alto + Alto | ✅ Sinergia social | +10 |
  | D2 (Sociabilidade) | Alto + Baixo | ➡️ Neutro (equilíbrio) | +5 |
  | D2 (Sociabilidade) | Baixo + Baixo | ⚠️ Isolamento | -10 |
  | D3 (Ritmo) | Similar | ✅ Alinhamento de ritmo | +15 |
  | D3 (Ritmo) | Diferente (>30pts) | ⚠️ Descompasso | -15 |
  | D4 (Conformidade) | Alto + Alto | ✅ Estruturados | +10 |
  | D4 (Conformidade) | Alto + Baixo | ⚠️ Atrito em processos | -10 |
  | D4 (Conformidade) | Baixo + Baixo | ➡️ Flexíveis | +5 |
  | D5 (Orientação) | Alto + Alto | ✅ Ambiente empático | +15 |
  | D5 (Orientação) | Alto + Baixo | ➡️ Equilíbrio | +5 |
  | D5 (Orientação) | Baixo + Baixo | ⚠️ Ambiente impessoal | -10 |

  **Score final:** Soma dos scores por dimensão, normalizado para 0-100%
  
  **Faixas:** Baixo = 0-33, Médio = 34-66, Alto = 67-100

- **RF-002:** O sistema deve classificar a compatibilidade:

  | Score | Classificação | Ícone | Cor |
  |-------|--------------|-------|-----|
  | 80-100% | Excelente sinergia | 🟢 | Verde |
  | 60-79% | Boa compatibilidade | 🔵 | Azul |
  | 40-59% | Compatibilidade neutra | 🟡 | Amarelo |
  | 20-39% | Atenção necessária | 🟠 | Laranja |
  | 0-19% | Risco de conflito | 🔴 | Vermelho |

#### Visualizações de Compatibilidade

- **RF-003:** O sistema deve exibir "Matriz de Compatibilidade" por departamento:
  
  ```
              Maria  João   Ana    Pedro  Carol
  Maria        -     85%    72%    45%    90%
  João        85%     -     68%    92%    55%
  Ana         72%    68%     -     78%    82%
  Pedro       45%    92%    78%     -     40%
  Carol       90%    55%    82%    40%     -
  ```
  
  Células com código de cor conforme faixa

- **RF-004:** O sistema deve exibir "Top 5 Melhores Duplas":
  - Lista das 5 duplas com maior compatibilidade
  - Score, nomes, departamentos e detalhe por dimensão

- **RF-005:** O sistema deve exibir "Alertas de Conflito":
  - Pares com score < 30%
  - Descrição do motivo principal do risco
  - Ex: "Maria e Pedro: ambos com D1 muito alto → risco de disputa por liderança"

- **RF-006:** O sistema deve permitir ver detalhes de compatibilidade entre um par:
  - Radar chart sobreposto dos dois membros
  - Score por dimensão (similaridade vs complementaridade)
  - Pontos fortes da dupla
  - Pontos de atenção
  - Sugestão: "Ideal para: projetos que exigem [X]"

- **RF-007:** O sistema deve sugerir "Melhores Trios" para projetos:
  - Combinação de 3 membros com maior score médio de compatibilidade
  - Indicador de equilíbrio dimensional do trio

### Gap Analysis

- **RF-008:** O sistema deve calcular e exibir análise de lacunas dimensionais:
  - Para a equipe inteira ou por departamento
  - Comparar scores médios vs perfil ideal equilibrado (D1=D2=D3=D4=D5=60)
  - Identificar dimensões com score médio < 40 como "lacunas"
  - Identificar dimensões com score médio > 80 como "excesso"

- **RF-009:** O sistema deve exibir resultado do Gap Analysis com:

  **Radar chart de Gap:**
  - Linha contínua: perfil médio da equipe
  - Área sombreada: zona ideal (40-75 em cada dimensão)
  - Destaques vermelhos: dimensões fora da zona ideal

  **Card de lacunas:**
  ```
  ⚠️ LACUNAS IDENTIFICADAS:
  
  🔴 D5 (Orientação Relacional): Score médio 28
     "Sua equipe carece de perfis empáticos e relacionais."
  
  🟠 D2 (Sociabilidade): Score médio 35
     "Comunicação e influência estão abaixo do ideal."
  ```

  **Card de excessos:**
  ```
  ℹ️ DIMENSÕES EM EXCESSO:
  
  🔵 D4 (Conformidade): Score médio 85
     "Equipe muito focada em processos — pode limitar inovação."
  ```

- **RF-010:** O sistema deve recomendar perfil ideal para próxima contratação:
  - Baseado nas lacunas, sugerir:
    - "Para equilibrar sua equipe, busque candidatos com perfil: D5 alto, D2 médio-alto"
    - Perfil arquetípico sugerido (ex: "Facilitador" ou "Influenciador")
    - Pesos recomendados para filtro no Hub de Testes

- **RF-011:** O sistema deve oferecer botão "Criar Teste com Base no Gap":
  - Ao clicar, redirecionar para criação de teste (PRD-052)
  - Pré-preencher os pesos das dimensões conforme recomendação do Gap
  - Ex: Se gap em D5, criar teste com D5 peso 1.8

- **RF-012:** O sistema deve permitir filtrar Gap Analysis:
  - Por departamento
  - Por nível (Operacional / Tático / Estratégico)
  - Excluindo membros específicos

### Team Builder (Simulador)

- **RF-013:** O sistema deve oferecer simulador interativo de montagem de equipes:
  - Área lateral com lista de todos os colaboradores mapeados (fonte)
  - Área central com slots para montar times (destino)
  - Drag-and-drop para mover colaboradores entre times

- **RF-014:** O simulador deve permitir criar múltiplos times na mesma tela:
  - "Time A", "Time B", "Time C"...
  - Cada time com nome editável
  - Sem limite de membros por time

- **RF-015:** A cada alteração (membro adicionado/removido), o sistema deve recalcular em tempo real:

  **Por time:**
  - Radar chart do time (média das dimensões dos membros)
  - Score de equilíbrio (quão equilibradas estão as 5 dimensões)
  - Perfil predominante do time
  - Alertas de conflito interno
  - Gap interno do time

  **Comparação entre times:**
  - Radar charts sobrepostos dos times
  - Qual time é mais equilibrado
  - Qual time tem mais conflitos potenciais

- **RF-016:** O cálculo de equilíbrio do time deve usar:
  ```
  Equilíbrio = 100 - (Desvio_Padrão das médias D1-D5) × Fator_Normalização
  ```
  Onde:
  - Equilíbrio alto (>75): Time com dimensões equilibradas → ícone 🟢
  - Equilíbrio médio (50-74): Algumas dimensões dominam → ícone 🟡
  - Equilíbrio baixo (<50): Time muito enviesado → ícone 🔴

- **RF-017:** O simulador deve exibir "Impacto da Mudança":
  - Ao arrastar um membro para outro time:
    - Mostrar preview: "Se você mover Pedro para o Time B:"
    - "Time A perde: liderança (-12% em D1)"
    - "Time B ganha: conformidade (+8% em D4)"
    - Atualizar radars em tempo real

- **RF-018:** O sistema deve permitir salvar cenários:
  - Nome do cenário
  - Composição de cada time
  - Data de criação
  - Permite comparar cenários salvos lado a lado

- **RF-019:** O sistema deve permitir carregar cenário salvo e continuar editando

- **RF-020:** O simulador deve exibir "Cenário Atual" como ponto de partida:
  - Carregar automaticamente os times/departamentos como estão hoje
  - Permitir simular mudanças a partir da realidade

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Cálculo de compatibilidade entre par < 500ms
- **RNF-002 (Performance):** Matriz de compatibilidade (até 30 membros) < 3 segundos
- **RNF-003 (Performance):** Recálculo do Team Builder em tempo real < 1 segundo
- **RNF-004 (UX):** Drag-and-drop deve ser fluido com feedback visual imediato
- **RNF-005 (Responsividade):** Team Builder funcional em desktop; Compatibilidade e Gap em desktop e tablet

---

## Critérios de Aceitação

### RF-001/002/003: Compatibilidade

```gherkin
DADO que o departamento "Vendas" tem 5 colaboradores mapeados
QUANDO o gestor acessar Compatibilidade e filtrar por "Vendas"
ENTÃO deve ver matriz 5×5 com scores entre todos os pares
  E as células devem ter cores por faixa (verde, azul, amarelo, laranja, vermelho)
  E deve ver "Top 5 Melhores Duplas" com scores mais altos
  E deve ver "Alertas de Conflito" para pares com score < 30%
```

### RF-006: Detalhes do Par

```gherkin
DADO que a matriz mostra Maria e João com 85% de compatibilidade
QUANDO o gestor clicar na célula
ENTÃO deve ver radar chart sobreposto dos dois membros
  E deve ver breakdown por dimensão (qual contribuiu positivamente ou negativamente)
  E deve ver sugestão de uso da dupla
```

### RF-008/009/010: Gap Analysis

```gherkin
DADO que a equipe de TI tem scores médios D1=45, D2=35, D3=80, D4=88, D5=28
QUANDO o gestor acessar Gap Analysis para "TI"
ENTÃO deve identificar D5 (28) e D2 (35) como lacunas
  E deve identificar D4 (88) como excesso
  E deve recomendar: "Busque perfil com D5 alto e D2 médio-alto"
  E deve sugerir arquétipo: "Facilitador" ou "Influenciador"
  E deve oferecer botão "Criar Teste com Base no Gap"
```

### RF-011: Conexão Gap → Hub de Testes

```gherkin
DADO que o Gap Analysis recomenda D5=1.8 e D2=1.5
QUANDO o gestor clicar em "Criar Teste com Base no Gap"
ENTÃO deve ser redirecionado para criação de teste (PRD-052)
  E os pesos devem ser pré-preenchidos: D1=0.8, D2=1.5, D3=0.8, D4=0.7, D5=1.8
  E o template deve estar como "Personalizado"
```

### RF-013/015/017: Team Builder

```gherkin
DADO que o gestor acessou o Team Builder com cenário atual carregado
QUANDO arrastar "Pedro" do Time A para o Time B
ENTÃO o sistema deve mostrar preview do impacto antes de confirmar
  E ao confirmar, radar charts de ambos os times devem atualizar em < 1 segundo
  E score de equilíbrio de ambos os times deve recalcular
  E alertas de conflito devem atualizar

DADO que o gestor montou 3 times no simulador
QUANDO clicar em "Salvar Cenário"
ENTÃO deve solicitar nome do cenário
  E salvar composição completa
  E permitir recarregar para edição futura
```

### Cenários de Erro

```gherkin
DADO que o gestor tenta ver compatibilidade de departamento com apenas 1 membro mapeado
QUANDO acessar a matriz
ENTÃO deve exibir mensagem "Necessário pelo menos 2 colaboradores mapeados"
  E sugerir envio de teste para os não mapeados

DADO que o gestor tenta usar Team Builder sem nenhum colaborador mapeado
QUANDO acessar o simulador
ENTÃO deve exibir mensagem "Mapeie os perfis da sua equipe primeiro"
  E link para envio de testes
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Algoritmo de compatibilidade e score | 3 |
| 2 | Visualizações: matriz, top duplas, alertas | 4 |
| 3 | Gap Analysis com recomendações | 4 |
| 4 | Team Builder — interface e drag-and-drop | 5 |
| 5 | Team Builder — cálculos, cenários e conexão com Hub | 4 |

### Detalhamento das Fases

#### Fase 1: Algoritmo de Compatibilidade

**Objetivo:** Implementar cálculo de sinergia entre pares

**Ações:**
- [ ] Implementar matriz de sinergia por dimensão
- [ ] Criar função de cálculo de score normalizado (0-100%)
- [ ] Implementar classificação por faixa
- [ ] Criar endpoint para cálculo por par e por departamento

**Validação:** Cálculo retorna scores corretos para diferentes combinações

#### Fase 2: Visualizações de Compatibilidade

**Objetivo:** Implementar telas de compatibilidade

**Ações:**
- [ ] Criar componente de matriz com código de cores
- [ ] Implementar lista "Top 5 Melhores Duplas"
- [ ] Implementar lista "Alertas de Conflito"
- [ ] Criar modal de detalhes do par com radar sobreposto
- [ ] Implementar filtros por departamento

**Validação:** Matriz exibe dados corretos com cores e interação funcional

#### Fase 3: Gap Analysis

**Objetivo:** Implementar análise de lacunas e recomendações

**Ações:**
- [ ] Implementar cálculo de gaps (média vs zona ideal)
- [ ] Criar visualização radar com zona ideal sombreada
- [ ] Implementar cards de lacunas e excessos
- [ ] Criar motor de recomendação de perfil ideal
- [ ] Implementar botão "Criar Teste com Base no Gap" → PRD-052

**Validação:** Gap Analysis identifica corretamente lacunas e gera recomendações

#### Fase 4: Team Builder — Interface

**Objetivo:** Implementar simulador visual com drag-and-drop

**Ações:**
- [ ] Criar layout com lista lateral (colaboradores) e área central (times)
- [ ] Implementar drag-and-drop fluido entre áreas
- [ ] Criar componente de time com slots para membros
- [ ] Implementar criação de múltiplos times
- [ ] Carregar cenário atual como ponto de partida

**Validação:** Drag-and-drop funciona fluidamente entre times

#### Fase 5: Team Builder — Cálculos e Cenários

**Objetivo:** Implementar cálculos em tempo real e salvar cenários

**Ações:**
- [ ] Implementar cálculo de radar e equilíbrio por time em tempo real
- [ ] Implementar preview de impacto ao mover membro
- [ ] Implementar comparação entre times (radars sobrepostos)
- [ ] Implementar salvar/carregar cenários
- [ ] Implementar comparação entre cenários salvos

**Validação:** Cálculos atualizam em tempo real; cenários são salvos e carregados corretamente

---

## Modelo de Dados

### Tabela: `compatibility_cache`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| member_a_id | UUID | FK colaborador A |
| member_b_id | UUID | FK colaborador B |
| overall_score | DECIMAL(5,2) | Score geral (0-100) |
| d1_score | DECIMAL(5,2) | Score compatibilidade D1 |
| d2_score | DECIMAL(5,2) | Score compatibilidade D2 |
| d3_score | DECIMAL(5,2) | Score compatibilidade D3 |
| d4_score | DECIMAL(5,2) | Score compatibilidade D4 |
| d5_score | DECIMAL(5,2) | Score compatibilidade D5 |
| classification | ENUM | 'excellent', 'good', 'neutral', 'attention', 'risk' |
| calculated_at | TIMESTAMP | Última vez que foi calculado |

> **Nota:** Cache invalidado quando qualquer um dos membros faz reteste

### Tabela: `team_builder_scenarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| created_by | UUID | FK usuário |
| name | VARCHAR(200) | Nome do cenário |
| description | TEXT | Descrição opcional |
| teams_config | JSONB | Estrutura: [{ name: "Time A", members: [uuid, uuid] }, ...] |
| metrics | JSONB | Métricas calculadas: { teamA: { balance: 78, d1_avg: ... } } |
| is_current | BOOLEAN | Se é o cenário que reflete a realidade atual |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última edição |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-049 | Seleção de Palavras (gera scores) | ⏳ |
| PRD-050 | Cenários Situacionais (gera perfil) | ⏳ |
| PRD-052 | Hub de Testes (destino do Gap→Teste) | ⏳ |
| PRD-055 | Core da Gestão de Equipes (dados de colaboradores) | ⏳ |

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
| 6 | PRD-055 | Equipes: Core e Mapa | ⏳ | Fundação Equipes |
| **7** | **PRD-056** | **Equipes: Compatibilidade e Team Builder** | **🔄 ATUAL** | Depende de 052, 055 |
| 8 | PRD-057 | Equipes: Desenvolvimento e Evolução | ⏳ | Depende de 055, 056 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados de Compatibilidade

- Scores de compatibilidade visíveis apenas para gestores
- Colaboradores NÃO veem seu score de compatibilidade com colegas
- Alertas de conflito são sensíveis — usar linguagem neutra

### Cenários

- Cenários do Team Builder são por usuário (gestor)
- Cenários podem ser compartilhados entre gestores da mesma empresa
- Cenários NÃO afetam a estrutura real da equipe (apenas simulação)

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

**Codinomes:** Sugestão: "Synergy" (compatibilidade e trabalho em equipe)

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
| **Não bloquear fluxo principal** | Cálculos pesados em background/cache |
| **Fail gracefully** | Se cache expirar, recalcular sob demanda |
| **Preservar evidências** | Cenários salvos são imutáveis (versionados) |
| **Testar incrementalmente** | Validar algoritmo isoladamente antes de integrar |
| **Documentar decisões** | Registrar ajustes nos pesos do algoritmo |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Compatibilidade** | Usar cache para evitar recálculo a cada visualização |
| **Team Builder** | Usar state management robusto para drag-and-drop |
| **Gap Analysis** | Zona ideal configurável (default 40-75) |
| **Performance** | Cálculos de matriz: fazer no backend, não no frontend |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Calcular matriz de 30×30 no frontend |
| Invalidar todo cache quando apenas 1 membro muda |
| Aplicar cenário do Team Builder à realidade sem confirmação |
| Usar linguagem negativa nos alertas de conflito (usar "atenção necessária") |
| Limitar drag-and-drop a mouse (suportar touch) |

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
