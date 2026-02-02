# PRD-055: Gestão de Equipes — Core e Mapa Comportamental

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-046` | Gauge-Pro 2.0 - Fundação Administrativa |
| `PRD-049` | Gauge-Pro Parte 1: Seleção de Palavras |
| `PRD-050` | Gauge-Pro Parte 2: Cenários Situacionais |
| `PRD-051` | Agente de Análise Comportamental por IA |
| `PRD-052` | Hub de Testes: Dashboard e Gestão |
| **`PRD-055`** | ⬅ Você está aqui — Gestão de Equipes: Core e Mapa Comportamental |
| `PRD-056` | Gestão de Equipes: Compatibilidade e Team Builder |
| `PRD-057` | Gestão de Equipes: Desenvolvimento e Evolução |

---

# PRD-055: Gestão de Equipes — Core e Mapa Comportamental

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Empresa |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Criar o módulo de Gestão de Equipes no Painel da Empresa, permitindo cadastro de colaboradores com perfis comportamentais Gauge-Pro, organização por departamentos e cargos, e visualização do mapa comportamental da equipe com radar charts coletivos e heatmaps dimensionais |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Gestão de Equipes |
| **PRDs Relacionados** | PRD-046, PRD-049, PRD-050, PRD-051, PRD-052, PRD-056, PRD-057 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade — modelo de dados hierárquico (empresa → departamento → cargo → colaborador), integração com Gauge-Pro para aplicação de testes em colaboradores, visualizações de dados agregados (radar coletivo, heatmap), e lógica de importação de perfis de candidatos contratados.

---

## Contexto do Problema

O RecrutaRS hoje opera exclusivamente no eixo de **recrutamento**: a empresa publica vagas, candidatos aplicam, fazem testes e são avaliados. Porém, o ciclo comportamental termina na contratação — o perfil Gauge-Pro do candidato contratado "morre" no pipeline.

Empresas precisam estender a inteligência comportamental para dentro da organização:
- Entender o perfil comportamental da equipe atual
- Identificar pontos fortes e lacunas coletivas
- Mapear dinâmicas por departamento e cargo
- Transformar dados de recrutamento em gestão de pessoas

Este PRD cria a fundação do módulo de Gestão de Equipes: a estrutura organizacional, o cadastro de colaboradores com perfis comportamentais, e o mapa comportamental visual da equipe.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Perfis comportamentais existem apenas para candidatos
- Não há conceito de "equipe" ou "colaborador" na plataforma
- Não há visão coletiva do perfil comportamental da organização
- Candidato contratado perde vínculo com seu perfil Gauge-Pro

### Situação Desejada (To-Be)

- Nova seção "Gestão de Equipes" no menu do Painel Empresa
- Cadastro de colaboradores com vínculo a departamento e cargo
- Importação automática de perfil Gauge-Pro quando candidato é contratado
- Aplicação de teste Gauge-Pro diretamente para colaboradores
- Mapa comportamental coletivo (radar, heatmap)
- Filtros por departamento, cargo, time

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas listar colaboradores sem perfil | Não agrega valor comportamental |
| Usar perfil do recrutamento sem reteste | Perfil pode mudar com o tempo |
| Módulo separado desconectado do Gauge-Pro | Duplicação de esforço, perda de consistência |

---

## Escopo

### Incluído

- ✅ Nova seção "Gestão de Equipes" no menu lateral
- ✅ Dashboard de equipe com visão geral
- ✅ Cadastro de departamentos e cargos
- ✅ Cadastro de colaboradores (manual e por importação)
- ✅ Importação de perfil Gauge-Pro de candidato contratado
- ✅ Aplicação de teste Gauge-Pro para colaboradores existentes
- ✅ Mapa comportamental: radar chart coletivo
- ✅ Mapa comportamental: heatmap de dimensões por departamento
- ✅ Perfil individual do colaborador com resultado Gauge-Pro
- ✅ Filtros por departamento, cargo, status

### Excluído

- ❌ Análise de compatibilidade entre membros (PRD-056)
- ❌ Team Builder / simulador (PRD-056)
- ❌ Gap Analysis (PRD-056)
- ❌ Plano de desenvolvimento individual (PRD-057)
- ❌ Retestes e evolução temporal (PRD-057)
- ❌ Perfil cultural da empresa (PRD-057)
- ❌ Folha de pagamento ou gestão de RH tradicional

---

## Estrutura do Menu

### Localização no Painel Empresa

```
📊 Dashboard
👥 Candidatos
📋 Vagas
🧠 Testes Comportamentais
👥 Gestão de Equipes ← NOVO
    ├── Visão Geral (Dashboard)
    ├── Minha Equipe
    ├── Departamentos
    └── Mapa Comportamental
⚙️ Configurações
```

---

## Requisitos Funcionais

### Dashboard da Equipe — Visão Geral

- **RF-001:** O sistema deve exibir dashboard de equipe com KPIs:
  - Total de colaboradores cadastrados
  - Colaboradores com perfil Gauge-Pro mapeado (%)
  - Colaboradores sem perfil (pendentes)
  - Total de departamentos
  - Perfil arquetípico mais comum na equipe

- **RF-002:** O sistema deve exibir mini radar chart com o perfil médio da equipe:
  - Média de cada dimensão (D1-D5) de todos os colaboradores mapeados
  - Atualização automática a cada novo perfil adicionado

- **RF-003:** O sistema deve exibir distribuição de perfis arquetípicos:
  - Gráfico de barras ou pizza com contagem por arquétipo
  - Ex: 5 Comandantes, 3 Influenciadores, 2 Facilitadores...

- **RF-004:** O sistema deve exibir alertas:
  - Colaboradores cadastrados sem teste realizado
  - Testes com resultado há mais de 12 meses (sugestão de reteste)
  - Departamentos sem nenhum colaborador mapeado

### Cadastro de Departamentos e Cargos

- **RF-005:** O sistema deve permitir criar departamentos:
  - Nome (obrigatório, único por empresa)
  - Descrição (opcional)
  - Gestor responsável (colaborador vinculado, opcional)

- **RF-006:** O sistema deve permitir criar cargos dentro de cada departamento:
  - Nome do cargo (obrigatório)
  - Nível: Operacional / Tático / Estratégico
  - Departamento vinculado

- **RF-007:** O sistema deve permitir editar e desativar departamentos e cargos:
  - Desativar não exclui — marca como inativo
  - Colaboradores de departamento desativado são movidos para "Sem departamento"

- **RF-008:** O sistema deve exibir organograma visual simplificado:
  - Agrupamento por departamento
  - Quantidade de colaboradores por departamento
  - Indicador visual do perfil predominante

### Cadastro de Colaboradores

- **RF-009:** O sistema deve permitir cadastrar colaborador manualmente:
  - Nome completo (obrigatório)
  - E-mail (obrigatório, único)
  - Cargo (obrigatório)
  - Departamento (obrigatório)
  - Data de admissão (obrigatório)
  - Foto (opcional)
  - Status: Ativo / Inativo / Afastado

- **RF-010:** O sistema deve permitir importar colaborador a partir de candidato contratado:
  - Ao marcar candidato como "Contratado" no pipeline, oferecer opção "Adicionar à equipe"
  - Ao adicionar, importar automaticamente:
    - Nome e e-mail
    - Perfil Gauge-Pro completo (scores D1-D5, perfil arquetípico)
    - Análise IA (se gerada)
  - Solicitar apenas: cargo, departamento, data de admissão

- **RF-011:** O sistema deve permitir importar lista de colaboradores via planilha:
  - Template CSV/Excel disponível para download
  - Campos: nome, email, cargo, departamento, data_admissao
  - Validação de e-mails duplicados
  - Relatório de importação (sucesso/erro por linha)

- **RF-012:** O sistema deve permitir editar dados do colaborador

- **RF-013:** O sistema deve permitir desativar colaborador (não excluir):
  - Colaboradores inativos não entram em métricas
  - Perfil comportamental é preservado para histórico

### Aplicação de Teste para Colaboradores

- **RF-014:** O sistema deve permitir enviar teste Gauge-Pro para colaboradores que ainda não foram mapeados:
  - Selecionar um ou mais colaboradores
  - Enviar convite por e-mail com link para o teste
  - O teste aplicado é o Gauge-Pro padrão (Parte 1 + Parte 2)

- **RF-015:** O sistema deve permitir enviar teste de reteste para colaboradores já mapeados:
  - Opção "Solicitar reteste"
  - O novo resultado substitui o anterior como "atual"
  - O resultado anterior é mantido como histórico

- **RF-016:** O status do teste por colaborador deve ser visível:
  - Sem teste
  - Convite enviado
  - Em andamento
  - Concluído (com data)
  - Reteste pendente

### Perfil Individual do Colaborador

- **RF-017:** O sistema deve exibir página de perfil do colaborador contendo:

  **Dados Pessoais:**
  - Nome, foto, e-mail
  - Cargo, departamento
  - Data de admissão, tempo de casa

  **Perfil Comportamental (se mapeado):**
  - Perfil arquetípico (nome, ícone, descrição)
  - Radar chart individual (D1-D5)
  - Barras de progresso por dimensão
  - Top 3 forças e Top 2 áreas de desenvolvimento
  - Análise Prática da IA (se disponível)
  - Data do último teste

  **Estado do teste:**
  - Indicador visual: ✅ Mapeado / ⚠️ Pendente / 🔄 Reteste sugerido

- **RF-018:** Se o colaborador não tem perfil, exibir call-to-action:
  - "Este colaborador ainda não foi mapeado. Enviar teste Gauge-Pro?"
  - Botão direto para envio de convite

### Mapa Comportamental da Equipe

- **RF-019:** O sistema deve exibir radar chart coletivo:
  - Média de cada dimensão (D1-D5) de todos os colaboradores ativos e mapeados
  - Possibilidade de sobrepor perfil individual vs média da equipe
  - Possibilidade de sobrepor perfil de um departamento vs equipe geral

- **RF-020:** O sistema deve exibir heatmap de dimensões:
  
  ```
  Departamento    | D1    | D2    | D3    | D4    | D5    |
  Vendas          | 🔴 85 | 🟢 78 | 🟡 52 | 🟡 48 | 🟢 72 |
  TI              | 🟡 45 | 🟡 55 | 🟢 80 | 🔴 88 | 🟡 50 |
  Marketing       | 🟢 70 | 🔴 90 | 🟡 60 | 🟡 45 | 🟢 75 |
  Financeiro      | 🟡 40 | 🟡 42 | 🟡 55 | 🔴 92 | 🟡 48 |
  ```
  
  Código de cores:
  - 🔴 Alto (>75): Cor forte (dimensão dominante)
  - 🟢 Médio-alto (50-75): Cor média
  - 🟡 Baixo (<50): Cor clara (dimensão recessiva)

- **RF-021:** O sistema deve exibir distribuição de perfis arquetípicos por departamento:
  - Gráfico de barras empilhadas (cada barra = departamento, seções = arquétipos)
  - Clicável: ao clicar em um segmento, ver lista de colaboradores daquele perfil

- **RF-022:** Filtros do mapa comportamental:
  - Departamento (todos ou específico)
  - Cargo (todos ou específico)
  - Nível (Operacional / Tático / Estratégico)
  - Status (Ativo / Todos)

- **RF-023:** O sistema deve exibir "Perfil Predominante" por departamento:
  - Card com o arquétipo mais frequente no departamento
  - Descrição breve do que isso significa para a dinâmica do setor

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Mapa comportamental deve carregar em < 3 segundos (até 500 colaboradores)
- **RNF-002 (Responsividade):** Interface funcional em desktop e tablet
- **RNF-003 (Escalabilidade):** Suportar empresas com até 2.000 colaboradores
- **RNF-004 (UX):** Cadastro de colaborador em no máximo 3 passos
- **RNF-005 (Importação):** Importação de planilha com até 500 registros em < 30 segundos

---

## Critérios de Aceitação

### RF-001/002: Dashboard da Equipe

```gherkin
DADO que a empresa tem 50 colaboradores, dos quais 35 possuem perfil Gauge-Pro
QUANDO o gestor acessar Gestão de Equipes → Visão Geral
ENTÃO deve ver KPI "50 colaboradores" e "70% mapeados"
  E deve ver mini radar chart com a média das 5 dimensões dos 35 mapeados
  E deve ver distribuição de perfis arquetípicos
  E deve ver alerta "15 colaboradores sem perfil"
```

### RF-009/010: Cadastro de Colaboradores

```gherkin
DADO que o gestor está na tela de cadastro de colaborador
QUANDO preencher nome, email, cargo, departamento e data de admissão
  E clicar em Salvar
ENTÃO o colaborador deve ser criado com status "Ativo"
  E deve aparecer na lista de equipe com indicador "⚠️ Pendente" (sem teste)

DADO que um candidato foi marcado como "Contratado" no pipeline
QUANDO o gestor escolher "Adicionar à equipe"
ENTÃO o sistema deve pré-preencher nome, email e perfil Gauge-Pro
  E solicitar apenas cargo, departamento e data de admissão
  E ao salvar, o colaborador deve aparecer com indicador "✅ Mapeado"
```

### RF-019/020: Mapa Comportamental

```gherkin
DADO que existem colaboradores mapeados em 3 departamentos
QUANDO o gestor acessar Mapa Comportamental
ENTÃO deve ver radar chart coletivo com média geral da equipe
  E deve ver heatmap com scores médios por departamento e dimensão
  E deve ver distribuição de arquétipos por departamento
  E ao filtrar por departamento "Vendas", todos os gráficos devem atualizar
```

### RF-014/015: Aplicação de Teste

```gherkin
DADO que existem 5 colaboradores sem perfil Gauge-Pro
QUANDO o gestor selecionar os 5 e clicar em "Enviar Teste"
ENTÃO cada colaborador deve receber e-mail com link para o teste
  E o status de cada um deve mudar para "Convite enviado"
  E ao concluírem, o perfil deve atualizar automaticamente no mapa
```

### Cenários de Erro

```gherkin
DADO que o gestor tenta cadastrar colaborador com e-mail já existente
QUANDO clicar em Salvar
ENTÃO deve exibir "Este e-mail já está cadastrado na equipe"
  E não permitir duplicação

DADO que o gestor tenta importar planilha com formato inválido
QUANDO fizer upload
ENTÃO deve exibir relatório de erros por linha
  E importar apenas as linhas válidas
  E exibir resumo: "18 de 20 importados com sucesso"
```

---

## Modelo de Dados

### Tabela: `departments`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| name | VARCHAR(200) | Nome do departamento |
| description | TEXT | Descrição (opcional) |
| manager_id | UUID | FK colaborador gestor (nullable) |
| is_active | BOOLEAN | Ativo/inativo (default true) |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: `positions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| department_id | UUID | FK departamento |
| name | VARCHAR(200) | Nome do cargo |
| level | ENUM | 'operational', 'tactical', 'strategic' |
| is_active | BOOLEAN | Ativo/inativo (default true) |
| created_at | TIMESTAMP | Criação |

### Tabela: `team_members`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| department_id | UUID | FK departamento |
| position_id | UUID | FK cargo |
| candidate_id | UUID | FK candidato original (nullable — se veio do pipeline) |
| full_name | VARCHAR(200) | Nome completo |
| email | VARCHAR(255) | E-mail (unique por empresa) |
| photo_url | VARCHAR(500) | URL da foto (nullable) |
| admission_date | DATE | Data de admissão |
| status | ENUM | 'active', 'inactive', 'on_leave' |
| gauge_status | ENUM | 'unmapped', 'invited', 'in_progress', 'mapped', 'retest_pending' |
| current_test_result_id | UUID | FK resultado do teste atual (nullable) |
| archetype | VARCHAR(50) | Perfil arquetípico atual (nullable) |
| d1_score | DECIMAL(5,2) | Score D1 - Dominância (nullable) |
| d2_score | DECIMAL(5,2) | Score D2 - Sociabilidade (nullable) |
| d3_score | DECIMAL(5,2) | Score D3 - Ritmo (nullable) |
| d4_score | DECIMAL(5,2) | Score D4 - Conformidade (nullable) |
| d5_score | DECIMAL(5,2) | Score D5 - Orientação (nullable) |
| last_test_date | TIMESTAMP | Data do último teste (nullable) |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: `team_member_test_history`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| team_member_id | UUID | FK colaborador |
| test_result_id | UUID | FK resultado do teste |
| test_date | TIMESTAMP | Data de realização |
| d1_score | DECIMAL(5,2) | Score D1 |
| d2_score | DECIMAL(5,2) | Score D2 |
| d3_score | DECIMAL(5,2) | Score D3 |
| d4_score | DECIMAL(5,2) | Score D4 |
| d5_score | DECIMAL(5,2) | Score D5 |
| archetype | VARCHAR(50) | Perfil arquetípico |
| is_current | BOOLEAN | Se é o resultado atual |
| created_at | TIMESTAMP | Criação |

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura do menu e navegação | 3 |
| 2 | Departamentos, cargos e cadastro de colaboradores | 5 |
| 3 | Importação de candidatos e planilha | 3 |
| 4 | Perfil individual e aplicação de teste | 4 |
| 5 | Mapa comportamental (radar, heatmap, distribuição) | 5 |

### Detalhamento das Fases

#### Fase 1: Estrutura do Menu e Navegação

**Objetivo:** Criar a seção "Gestão de Equipes" no Painel Empresa

**Ações:**
- [ ] Adicionar item "Gestão de Equipes" no menu lateral com ícone 👥
- [ ] Criar subitens: Visão Geral, Minha Equipe, Departamentos, Mapa Comportamental
- [ ] Configurar rotas de navegação
- [ ] Criar layout base das páginas

**Validação:** Menu funcional com navegação entre sub-páginas

#### Fase 2: Departamentos, Cargos e Cadastro

**Objetivo:** Implementar estrutura organizacional e cadastro de colaboradores

**Ações:**
- [ ] Criar CRUD de departamentos
- [ ] Criar CRUD de cargos vinculados a departamentos
- [ ] Criar formulário de cadastro de colaborador
- [ ] Implementar lista de equipe com filtros
- [ ] Implementar organograma visual simplificado

**Validação:** Gestor consegue criar departamentos, cargos e cadastrar colaboradores

#### Fase 3: Importação de Candidatos e Planilha

**Objetivo:** Implementar fluxos de importação

**Ações:**
- [ ] Criar fluxo "Adicionar à equipe" no pipeline de candidatos contratados
- [ ] Implementar importação automática de perfil Gauge-Pro
- [ ] Criar importação via planilha CSV/Excel
- [ ] Implementar validação e relatório de importação

**Validação:** Candidato contratado é importado com perfil; planilha importa corretamente

#### Fase 4: Perfil Individual e Teste

**Objetivo:** Criar página de perfil e envio de teste

**Ações:**
- [ ] Criar página de perfil do colaborador
- [ ] Exibir resultado Gauge-Pro quando disponível
- [ ] Implementar envio de convite de teste (individual e em lote)
- [ ] Implementar tracking de status do teste
- [ ] Implementar fluxo de reteste

**Validação:** Perfil exibe dados completos; teste pode ser enviado e rastreado

#### Fase 5: Mapa Comportamental

**Objetivo:** Implementar visualizações coletivas

**Ações:**
- [ ] Implementar radar chart coletivo (média da equipe)
- [ ] Implementar heatmap de dimensões por departamento
- [ ] Implementar distribuição de arquétipos por departamento
- [ ] Implementar sobreposição individual vs equipe
- [ ] Implementar filtros (departamento, cargo, nível)

**Validação:** Mapa comportamental exibe dados corretos com filtros funcionais

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-046 | Fundação Administrativa Gauge-Pro | ✅ |
| PRD-049 | Seleção de Palavras (teste Gauge-Pro) | ⏳ |
| PRD-050 | Cenários Situacionais (teste Gauge-Pro) | ⏳ |
| PRD-051 | Análise IA (análise do perfil) | ⏳ |

### PRDs Subsequentes (dependem deste)

| PRD | Descrição |
|-----|-----------|
| PRD-056 | Compatibilidade e Team Builder |
| PRD-057 | Desenvolvimento e Evolução |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Gestão de Equipes"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-046 | Fundação Administrativa | ✅ | Base Gauge-Pro |
| 2 | PRD-049 | Seleção de Palavras | ⏳ | Teste |
| 3 | PRD-050 | Cenários Situacionais | ⏳ | Teste |
| 4 | PRD-051 | Agente IA de Análise | ⏳ | Análise |
| **5** | **PRD-055** | **Equipes: Core e Mapa** | **🔄 ATUAL** | Depende de 049, 050, 051 |
| 6 | PRD-056 | Equipes: Compatibilidade e Team Builder | ⏳ | Depende de 055 |
| 7 | PRD-057 | Equipes: Desenvolvimento e Evolução | ⏳ | Depende de 055, 056 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Nome e e-mail de colaboradores | PII | RLS por empresa |
| Perfis comportamentais | Sensível | Acesso apenas por gestores autorizados |
| Dados de admissão | Pessoal | RLS por empresa |

### Autenticação e Autorização

- Apenas usuários da empresa com papel "Gestor" ou "Admin" podem acessar Gestão de Equipes
- Colaborador cadastrado NÃO ganha acesso ao painel da empresa (é apenas registro)
- Dados de uma empresa são invisíveis para outras empresas (RLS)

### LGPD

- Colaboradores devem dar consentimento para teste comportamental
- Perfis podem ser solicitados para exclusão pelo colaborador
- Registro de quem acessou perfil de quem (auditoria PRD-054)

---

## Fluxos de Usuário

### Fluxo Principal: Cadastrar e Mapear Equipe

```
Gestor acessa "Gestão de Equipes"
    │
    ├── Cria Departamentos e Cargos
    │
    ├── Cadastra Colaboradores
    │       │
    │       ├── Manual (formulário)
    │       ├── Via Pipeline (candidato contratado → equipe)
    │       └── Via Planilha (importação em massa)
    │
    ├── Envia Teste Gauge-Pro para os não mapeados
    │
    ├── Aguarda conclusão
    │       │
    │       └── Perfil é atualizado automaticamente
    │
    └── Visualiza Mapa Comportamental
            │
            ├── Radar coletivo da equipe
            ├── Heatmap por departamento
            └── Distribuição de arquétipos
```

### Fluxo de Importação: Candidato → Colaborador

```
Pipeline de Vagas
    │
    ├── Candidato marcado como "Contratado"
    │
    ├── Modal: "Adicionar à equipe?"
    │       │
    │       ├── Dados pré-preenchidos (nome, email, perfil Gauge-Pro)
    │       ├── Solicitar: departamento, cargo, data admissão
    │       └── Confirmar
    │
    └── Colaborador criado com perfil já mapeado ✅
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
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Sugestão: "Tribe" (gestão de equipes, tribo organizacional)

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
| **Não bloquear fluxo principal** | Importação em background, não travar a UI |
| **Fail gracefully** | Se importação parcial falhar, salvar o que deu certo |
| **Preservar evidências** | Histórico de testes nunca é excluído |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Scores** | Desnormalizar D1-D5 na tabela team_members para queries rápidas |
| **Heatmap** | Calcular médias agregadas em query, não em application layer |
| **Importação** | Validar antes de persistir (modo preview) |
| **Candidato→Colaborador** | Manter vínculo via candidate_id para rastreabilidade |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Excluir registros de colaboradores (usar soft delete) |
| Calcular médias no frontend com muitos registros (usar queries agregadas) |
| Criar dependência obrigatória de teste para cadastrar colaborador |
| Duplicar dados do Gauge-Pro (referenciar resultado existente) |
| Permitir dois colaboradores com mesmo e-mail na mesma empresa |

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
