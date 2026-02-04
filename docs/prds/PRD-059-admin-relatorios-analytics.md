# PRD-059: Admin — Relatórios e Analytics

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-058` | Admin: Gestão de Vagas e Moderação |
| **`PRD-059`** | ⬅ Você está aqui — Admin: Relatórios e Analytics |
| `PRD-060` | Admin: Gestão de Planos e Assinaturas |
| `PRD-061` | Admin: Gestão de Usuários e Permissões (RBAC) |
| `PRD-062` | Admin: Feature Flags e Simulador de Planos |

---

# PRD-059: Admin — Relatórios e Analytics

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Administrativo |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar central de relatórios e analytics no Painel Admin com dashboards de receita (MRR, churn, LTV), métricas de crescimento (usuários, vagas, testes), funil de conversão, activity feed em tempo real, e exportação de relatórios consolidados para tomada de decisão estratégica |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Painel Admin Avançado |
| **PRDs Relacionados** | PRD-058, PRD-060, PRD-061, PRD-062 |
| **Padrão de código** | camelCase para campos/tabelas |

---

## Contexto do Problema

O Painel Admin precisa ser a central de inteligência do negócio. Hoje não há visão consolidada de métricas financeiras, operacionais ou de crescimento. O administrador não consegue responder perguntas básicas:

- Quanto a plataforma está faturando este mês?
- Quantos candidatos e empresas são pagantes vs gratuitos?
- Qual a taxa de conversão free → paid?
- Qual o tempo médio de preenchimento de vagas?
- Quais empresas mais contratam?
- Quantos testes comportamentais são realizados por semana?

Sem essas respostas, decisões de produto, pricing e marketing são baseadas em suposição.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Não há relatórios centralizados
- Métricas espalhadas ou inexistentes
- Sem visão financeira (receita, churn, conversão)
- Sem activity feed (o que está acontecendo agora)
- Sem exportação de dados para análise

### Situação Desejada (To-Be)

- Dashboard financeiro com MRR, ARR, churn, LTV
- Dashboard de crescimento com curvas de adoção
- Dashboard operacional com funis de conversão
- Activity feed em tempo real (pulso da plataforma)
- Relatórios exportáveis (PDF e Excel)
- Filtros temporais e comparativos (mês atual vs anterior)

---

## Escopo

### Incluído

- ✅ Dashboard financeiro (receita, MRR, churn, LTV, conversão)
- ✅ Dashboard de crescimento (cadastros, ativações, retenção)
- ✅ Dashboard operacional (vagas, testes, contratações)
- ✅ Activity feed em tempo real
- ✅ Relatórios consolidados exportáveis (PDF e Excel)
- ✅ Filtros temporais (dia, semana, mês, trimestre, ano, custom)
- ✅ Comparativos (período atual vs anterior)

### Excluído

- ❌ BI integrado com ferramentas externas (Metabase, PowerBI)
- ❌ Previsões com machine learning
- ❌ Relatórios personalizáveis pelo admin (drag-and-drop de widgets)
- ❌ Data warehouse separado

---

## Estrutura do Menu

### Localização no Painel Admin

```
📊 Dashboard (Home)
👥 Candidatos
🏢 Empresas
📋 Vagas
📊 Relatórios ← NOVO
    ├── Financeiro
    ├── Crescimento
    ├── Operacional
    ├── Activity Feed
    └── Exportar
⚙️ Configurações
```

---

## Requisitos Funcionais

### Dashboard Financeiro

- **RF-001:** O sistema deve exibir KPIs financeiros:

  | KPI | Descrição | Cálculo |
  |-----|-----------|---------|
  | **MRR** | Monthly Recurring Revenue | Soma de todas assinaturas ativas convertidas para mensal |
  | **ARR** | Annual Recurring Revenue | MRR × 12 |
  | **Receita do Período** | Total faturado no período filtrado | Soma de pagamentos confirmados |
  | **Ticket Médio** | Receita média por assinante | Receita / nº de assinantes |
  | **Churn Rate** | Taxa de cancelamento mensal | Cancelamentos / total assinantes início do mês × 100 |
  | **LTV** | Lifetime Value médio | Ticket médio / Churn rate |
  | **Taxa de Conversão Free→Paid** | % de gratuitos que assinaram | Novos pagantes / total gratuitos × 100 |

- **RF-002:** Cada KPI deve exibir:
  - Valor atual
  - Variação vs período anterior (↑ verde se positivo, ↓ vermelho se negativo)
  - Percentual de variação

- **RF-003:** Gráficos financeiros:
  - **MRR ao longo do tempo:** gráfico de área (últimos 12 meses)
  - **Receita por plano:** gráfico de barras empilhadas (separado por plano candidato e empresa)
  - **Distribuição de assinantes por plano:** pizza/donut
  - **Churn vs novas assinaturas:** gráfico de barras comparativo mensal
  - **Receita por tipo de período:** pizza (mensal / trimestral / semestral / anual)

- **RF-004:** O sistema deve separar métricas de candidatos e empresas:
  
  **Candidatos:**
  | Plano | Assinantes | MRR | Churn |
  |-------|-----------|-----|-------|
  | Essencial (Free) | N | R$ 0 | - |
  | Avançar | N | R$ X | Y% |
  | Destaque Máximo | N | R$ X | Y% |

  **Empresas:**
  | Plano | Assinantes | MRR | Churn |
  |-------|-----------|-----|-------|
  | Essencial (Free) | N | R$ 0 | - |
  | Seleção Inteligente | N | R$ X | Y% |
  | Recrutamento Premium | N | R$ X | Y% |

### Dashboard de Crescimento

- **RF-005:** O sistema deve exibir métricas de crescimento:

  | KPI | Descrição |
  |-----|-----------|
  | **Total de candidatos** | Cadastrados na plataforma |
  | **Total de empresas** | Cadastradas na plataforma |
  | **Novos cadastros (período)** | Candidatos + empresas no período filtrado |
  | **Taxa de ativação** | % que completaram perfil após cadastro |
  | **Candidatos ativos** | Fizeram login nos últimos 30 dias |
  | **Empresas ativas** | Publicaram vaga ou acessaram nos últimos 30 dias |

- **RF-006:** Gráficos de crescimento:
  - **Curva de cadastros cumulativa:** gráfico de área (candidatos e empresas)
  - **Novos cadastros por semana:** gráfico de barras (últimas 12 semanas)
  - **Distribuição geográfica:** mapa do Brasil (heat por estado)
  - **Retenção (cohort):** tabela de retenção por mês de cadastro
  - **Funil de ativação:** Cadastro → Perfil completo → Teste realizado → Candidatura (candidatos) / Vaga publicada (empresas)

- **RF-007:** Métricas de testes comportamentais:
  - Total de testes realizados
  - Testes realizados no período
  - Taxa de conclusão (iniciados vs concluídos)
  - Tempo médio de conclusão
  - Distribuição de perfis arquetípicos (gráfico de barras)
  - Dimensão média da plataforma (radar geral)

### Dashboard Operacional

- **RF-008:** O sistema deve exibir métricas operacionais:

  | KPI | Descrição |
  |-----|-----------|
  | **Vagas ativas** | Total de vagas publicadas e abertas |
  | **Candidaturas / vaga** | Média de candidaturas por vaga |
  | **Tempo médio preenchimento** | Dias entre publicação e contratação |
  | **Taxa de contratação** | % de vagas que resultaram em contratação |
  | **Entrevistas agendadas** | Total no período |
  | **Contratações** | Total no período |

- **RF-009:** Gráficos operacionais:
  - **Funil de recrutamento:** Vagas → Candidaturas → Entrevistas → Contratações (com taxas de conversão entre etapas)
  - **Contratações por mês:** gráfico de barras
  - **Top 10 empresas contratantes:** ranking
  - **Top 10 vagas mais concorridas:** ranking por candidaturas
  - **Vagas por área/setor:** pizza
  - **Tempo de preenchimento (distribuição):** histograma

### Activity Feed

- **RF-010:** O sistema deve exibir feed de atividades em tempo real (últimas 100):

  **Tipos de eventos:**
  | Evento | Ícone | Exemplo |
  |--------|-------|---------|
  | Novo candidato | 👤 | "João Silva se cadastrou" |
  | Nova empresa | 🏢 | "Tech Solutions se cadastrou" |
  | Nova vaga | 📋 | "Tech Solutions publicou 'Desenvolvedor React'" |
  | Candidatura | 📩 | "João Silva candidatou-se a 'Desenvolvedor React'" |
  | Teste concluído | 🧠 | "Maria Souza concluiu teste Gauge-Pro — Perfil: Comandante" |
  | Assinatura | 💳 | "Tech Solutions assinou Seleção Inteligente (trimestral)" |
  | Cancelamento | ❌ | "Pedro Lima cancelou plano Avançar" |
  | Contratação | ✅ | "Ana Costa foi contratada por Tech Solutions" |
  | Entrevista agendada | 📅 | "Entrevista agendada: João × Tech Solutions, 05/02 14h" |

- **RF-011:** O feed deve:
  - Atualizar automaticamente (polling a cada 30 segundos ou WebSocket)
  - Ser filtrável por tipo de evento
  - Ser clicável (clicar no evento leva ao registro correspondente)
  - Exibir timestamp relativo ("há 5 minutos", "há 2 horas")

- **RF-012:** O sistema deve exibir resumo de atividade do dia:
  - Total de eventos por tipo
  - Comparativo com mesmo dia da semana anterior
  - Horários de pico de atividade (gráfico de calor por hora)

### Filtros Temporais e Comparativos

- **RF-013:** Todos os dashboards devem suportar filtros temporais:
  - Hoje
  - Últimos 7 dias
  - Últimos 30 dias
  - Este mês
  - Mês anterior
  - Este trimestre
  - Este ano
  - Período personalizado (data início e fim)

- **RF-014:** Todos os KPIs devem exibir comparativo automático:
  - Período atual vs período equivalente anterior
  - Ex: "Este mês" compara com "Mês anterior"
  - Indicador de variação com seta e percentual

### Exportação de Relatórios

- **RF-015:** O sistema deve permitir exportar relatórios:

  **Relatório Executivo (PDF):**
  - Resumo de KPIs financeiros, crescimento e operacionais
  - Principais gráficos em formato visual
  - Período selecionado no cabeçalho
  - Logotipo RecrutaRS + data de geração

  **Relatório Detalhado (Excel):**
  - Aba "Financeiro": MRR, receita, assinantes por plano, churn
  - Aba "Crescimento": cadastros, ativações, retenção
  - Aba "Operacional": vagas, candidaturas, entrevistas, contratações
  - Aba "Testes": testes realizados, perfis, scores médios
  - Aba "Activity Log": lista de eventos do período

- **RF-016:** O sistema deve permitir agendar envio de relatório:
  - Frequência: semanal ou mensal
  - Destinatários: lista de e-mails (admins)
  - Tipo: PDF executivo
  - Dia/hora de envio

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Dashboards devem carregar em < 5 segundos (dados agregados com cache)
- **RNF-002 (Cache):** Métricas com cache de 15 minutos (configurable), invalidação ao exportar
- **RNF-003 (Export):** Geração de PDF em < 10 segundos, Excel em < 15 segundos
- **RNF-004 (Feed):** Activity feed deve exibir eventos em < 60 segundos após ocorrência
- **RNF-005 (Dados):** Como dados são mockados, todo o módulo deve funcionar com seed data coerente

---

## Critérios de Aceitação

### RF-001/002/003: Dashboard Financeiro

```gherkin
DADO que existem assinaturas ativas de candidatos e empresas
QUANDO o admin acessar Relatórios → Financeiro
ENTÃO deve ver MRR calculado como soma de assinaturas convertidas para mensal
  E deve ver variação vs mês anterior com indicador (↑/↓)
  E deve ver gráfico de MRR ao longo dos últimos 12 meses
  E deve ver distribuição por plano (candidatos e empresas separados)
```

### RF-005/006: Dashboard de Crescimento

```gherkin
DADO que 500 candidatos e 50 empresas se cadastraram nos últimos 3 meses
QUANDO o admin acessar Relatórios → Crescimento com filtro "Últimos 3 meses"
ENTÃO deve ver curva cumulativa de cadastros
  E deve ver taxa de ativação (% que completaram perfil)
  E deve ver funil: Cadastro → Perfil completo → Teste → Candidatura
  E deve ver distribuição geográfica por estado
```

### RF-010/011: Activity Feed

```gherkin
DADO que o admin está na tela de Activity Feed
QUANDO um candidato se cadastrar na plataforma
ENTÃO o evento deve aparecer no feed em até 60 segundos
  E deve exibir ícone 👤, nome do candidato e timestamp relativo
  E ao clicar no evento, deve navegar para o perfil do candidato
```

### RF-015: Exportação

```gherkin
DADO que o admin está no dashboard financeiro com filtro "Este mês"
QUANDO clicar em "Exportar PDF"
ENTÃO deve gerar relatório executivo com KPIs e gráficos do período
  E o download deve iniciar em até 10 segundos
```

### Cenários de Erro

```gherkin
DADO que não há dados financeiros no período selecionado
QUANDO o admin acessar o dashboard financeiro
ENTÃO deve exibir os KPIs com valor "R$ 0,00" ou "0%"
  E deve exibir mensagem contextual "Sem dados no período selecionado"
  E NÃO deve exibir erro ou tela vazia
```

---

## Modelo de Dados

### Tabela: `platform_metrics_daily`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| metric_date | DATE | Data da métrica |
| total_candidates | INT | Total cumulativo de candidatos |
| total_companies | INT | Total cumulativo de empresas |
| new_candidates | INT | Novos candidatos no dia |
| new_companies | INT | Novas empresas no dia |
| active_jobs | INT | Vagas ativas no fim do dia |
| new_jobs | INT | Novas vagas no dia |
| applications | INT | Candidaturas no dia |
| interviews_scheduled | INT | Entrevistas agendadas no dia |
| interviews_done | INT | Entrevistas realizadas no dia |
| hires | INT | Contratações no dia |
| tests_started | INT | Testes iniciados no dia |
| tests_completed | INT | Testes concluídos no dia |
| mrr | DECIMAL(12,2) | MRR no fim do dia |
| new_subscriptions | INT | Novas assinaturas no dia |
| cancellations | INT | Cancelamentos no dia |
| created_at | TIMESTAMP | Criação do registro |

> **Nota:** Job diário agrega métricas. Dashboards consultam esta tabela para performance.

### Tabela: `activity_feed`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| event_type | ENUM | Tipo de evento (ver RF-010) |
| actor_type | ENUM | 'candidate', 'company', 'admin', 'system' |
| actor_id | UUID | FK do ator |
| actor_name | VARCHAR(200) | Nome para exibição |
| resource_type | VARCHAR(100) | Tipo do recurso (job, test, subscription, etc) |
| resource_id | UUID | FK do recurso |
| description | VARCHAR(500) | Descrição do evento |
| metadata | JSONB | Dados extras (plano, valor, perfil, etc) |
| created_at | TIMESTAMP | Timestamp do evento |

> **Nota:** Tabela append-only. Reter últimos 90 dias (purge automático).

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Menu, navegação e estrutura de dados | 3 |
| 2 | Dashboard financeiro | 4 |
| 3 | Dashboard de crescimento e operacional | 5 |
| 4 | Activity feed | 3 |
| 5 | Exportação de relatórios e agendamento | 5 |

### Detalhamento das Fases

#### Fase 1: Estrutura

**Objetivo:** Menu, rotas e modelo de dados

**Ações:**
- [ ] Criar seção "Relatórios" no menu admin
- [ ] Criar tabela platform_metrics_daily e job de agregação
- [ ] Criar tabela activity_feed e triggers para eventos
- [ ] Implementar seed data coerente para testes

**Validação:** Estrutura funcional com dados mockados

#### Fase 2: Dashboard Financeiro

**Objetivo:** Implementar KPIs e gráficos financeiros

**Ações:**
- [ ] Implementar KPIs com cálculo e comparativo
- [ ] Criar gráficos (MRR, receita por plano, distribuição, churn)
- [ ] Implementar separação candidato/empresa
- [ ] Implementar filtros temporais

**Validação:** Dashboard financeiro com dados corretos e filtráveis

#### Fase 3: Crescimento e Operacional

**Objetivo:** Implementar dashboards de crescimento e operações

**Ações:**
- [ ] Implementar KPIs de crescimento
- [ ] Criar curva cumulativa, funil de ativação, distribuição geográfica
- [ ] Implementar KPIs operacionais
- [ ] Criar funil de recrutamento e rankings

**Validação:** Métricas de crescimento e operações corretas

#### Fase 4: Activity Feed

**Objetivo:** Implementar feed de atividades em tempo real

**Ações:**
- [ ] Criar componente de feed com polling/WebSocket
- [ ] Implementar filtro por tipo de evento
- [ ] Implementar navegação ao clicar em evento
- [ ] Criar resumo de atividade do dia

**Validação:** Feed exibe eventos em tempo near-real

#### Fase 5: Exportação

**Objetivo:** Relatórios exportáveis e agendamento

**Ações:**
- [ ] Implementar geração de PDF executivo
- [ ] Implementar geração de Excel detalhado
- [ ] Criar sistema de agendamento de envio
- [ ] Implementar template de e-mail de relatório

**Validação:** Relatórios exportados com dados corretos

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

**Codinomes:** Sugestão: "Radar" (visibilidade e métricas)

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

- **Added** — novas funcionalidades
- **Changed** — mudanças em funcionalidades existentes
- **Fixed** — correções de bugs

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Agregação em background, nunca na request |
| **Fail gracefully** | Se cache expirar, recalcular sob demanda |
| **Preservar evidências** | Activity feed append-only |
| **Testar incrementalmente** | Validar cada dashboard independentemente |
| **Documentar decisões** | Registrar escolhas de cálculo (ex: como calcular MRR) |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Dados** | Usar seed data coerente e realista para testes |
| **Cache** | 15 min para dashboards, activity feed sem cache |
| **MRR** | Converter todas assinaturas para mensal (anual ÷ 12) |
| **Export** | PDF usa charts como imagens renderizadas |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Calcular métricas on-the-fly em queries pesadas (usar tabela agregada) |
| Expor dados financeiros reais de empresas para outros admins sem permissão |
| Activity feed com mais de 90 dias (purge periódico) |
| Gráficos com mais de 12 meses sem agregação (usar granularidade mensal) |
| Relatório PDF com mais de 10 páginas (manter executivo) |

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
| 03/02/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
