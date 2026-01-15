# PRD-012: Dashboard Empresa

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar dashboard principal da área da empresa |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 4-6 componentes, múltiplos cards de métricas, gráficos simples |

---

## Contexto do Problema

A empresa é o cliente pagante do RecrutaRS. Ao fazer login, ela precisa ter uma visão clara do status de seus processos seletivos, candidaturas recebidas e métricas relevantes.

Atualmente:
- O dashboard da empresa existe mas está básico
- Não há métricas ou indicadores
- Não há visão consolidada dos processos
- Empresa não consegue ter overview rápido

O dashboard permite:
- Visão executiva do recrutamento
- Acesso rápido às principais ações
- Acompanhamento de métricas
- Identificação de gargalos

---

## Conceito da Solução

### Situação Desejada (To-Be)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Dashboard - TechCorp                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Bem-vindo de volta, Maria! 👋                                   │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ 📋 Vagas    │ │ 👥 Candid.  │ │ 📨 Novas    │ │ ✅ Em       │ │
│  │   Ativas    │ │   Total     │ │   Hoje      │ │   Análise   │ │
│  │             │ │             │ │             │ │             │ │
│  │     5       │ │    127      │ │     12      │ │     34      │ │
│  │             │ │             │ │             │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                  │
│  ┌────────────────────────────────┐ ┌──────────────────────────┐ │
│  │ 📊 Candidaturas por Vaga       │ │ 🔔 Ações Pendentes       │ │
│  │                                │ │                          │ │
│  │ Dev React Sr    ████████ 45   │ │ • 12 novos candidatos    │ │
│  │ Product Manager ██████ 32     │ │ • 5 mensagens não lidas  │ │
│  │ UX Designer     ████ 28       │ │ • 3 testes para avaliar  │ │
│  │ Tech Lead       ███ 22        │ │                          │ │
│  │                                │ │ [Ver todos →]            │ │
│  │ [Ver todas as vagas →]        │ │                          │ │
│  └────────────────────────────────┘ └──────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 📬 Últimas Candidaturas                                    │  │
│  │                                                            │  │
│  │ ┌────────────────────────────────────────────────────────┐ │  │
│  │ │ João Silva        Dev React Sr       Há 2 horas  [→]  │ │  │
│  │ │ ⭐ 85% match     📊 Teste realizado                    │ │  │
│  │ └────────────────────────────────────────────────────────┘ │  │
│  │ ┌────────────────────────────────────────────────────────┐ │  │
│  │ │ Maria Santos      Product Manager    Há 5 horas  [→]  │ │  │
│  │ │ ⭐ 72% match     ⏳ Aguardando teste                   │ │  │
│  │ └────────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │ [Ver todas as candidaturas →]                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⚡ Ações Rápidas                                           │  │
│  │                                                            │  │
│  │ [+ Nova Vaga]  [🔍 Banco de Talentos]  [📨 Mensagens]     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Cards de métricas principais (vagas ativas, total candidatos, novos hoje, em análise)
- ✅ Gráfico/lista de candidaturas por vaga
- ✅ Lista de ações pendentes
- ✅ Lista das últimas candidaturas recebidas
- ✅ Ações rápidas (nova vaga, banco de talentos, mensagens)
- ✅ Saudação personalizada com nome do usuário
- ✅ Links de navegação para áreas relevantes

### Excluído

- ❌ Gráficos complexos de analytics
- ❌ Relatórios exportáveis
- ❌ Comparação com período anterior
- ❌ Métricas de conversão detalhadas
- ❌ Integração com ATS externo

---

## Requisitos Funcionais

### Métricas Principais

- **RF-001:** Deve exibir card com número de vagas ativas
- **RF-002:** Deve exibir card com total de candidatos (todas as vagas)
- **RF-003:** Deve exibir card com novas candidaturas hoje
- **RF-004:** Deve exibir card com candidaturas em análise
- **RF-005:** Cards devem ser clicáveis e navegar para área correspondente

### Candidaturas por Vaga

- **RF-006:** Deve exibir lista/gráfico das vagas com quantidade de candidatos
- **RF-007:** Deve ordenar por quantidade de candidatos (maior primeiro)
- **RF-008:** Deve limitar a 5 vagas (com link "ver todas")
- **RF-009:** Barra horizontal mostrando proporção

### Ações Pendentes

- **RF-010:** Deve listar ações que requerem atenção
- **RF-011:** Tipos: novos candidatos, mensagens não lidas, testes para avaliar
- **RF-012:** Deve ter link "Ver todos" para cada tipo

### Últimas Candidaturas

- **RF-013:** Deve listar as 5 candidaturas mais recentes
- **RF-014:** Cada item deve mostrar: nome, vaga, tempo, indicador de match
- **RF-015:** Deve indicar status do teste comportamental
- **RF-016:** Deve ter link para ver detalhes do candidato
- **RF-017:** Deve ter link "Ver todas as candidaturas"

### Ações Rápidas

- **RF-018:** Botão "Nova Vaga" → navega para criação de vaga
- **RF-019:** Botão "Banco de Talentos" → navega para busca de candidatos
- **RF-020:** Botão "Mensagens" → navega para mensagens

### Personalização

- **RF-021:** Deve exibir saudação com nome do usuário logado
- **RF-022:** Saudação deve variar com horário (Bom dia/Boa tarde/Boa noite)

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Dashboard deve carregar em menos de 1 segundo
- **RNF-002 (Responsividade):** Cards devem reorganizar em grid responsivo
- **RNF-003 (UX):** Informações mais importantes no topo

---

## Critérios de Aceitação

### RF-001 a RF-005: Métricas

```gherkin
DADO que a empresa acessa o dashboard
QUANDO a página carrega
ENTÃO deve ver 4 cards de métricas
  E vagas ativas deve refletir quantidade real
  E total de candidatos deve somar todas as vagas
  E ao clicar em um card, deve navegar para área correspondente
```

### RF-013 a RF-017: Últimas Candidaturas

```gherkin
DADO que a empresa tem candidaturas recentes
QUANDO visualiza o dashboard
ENTÃO deve ver as 5 candidaturas mais recentes
  E cada uma deve mostrar nome, vaga e tempo relativo
  E deve indicar se candidato fez teste comportamental
  E deve ter link para ver detalhes
```

### RF-021/RF-022: Saudação

```gherkin
DADO que o usuário "Maria" acessa o dashboard às 14h
QUANDO a página carrega
ENTÃO deve exibir "Boa tarde, Maria! 👋"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e métricas | 3 |
| 2 | Listas e gráfico | 3 |
| 3 | Ações e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Métricas

**Objetivo:** Criar layout e cards de métricas

**Ações:**
- [ ] Criar/atualizar página `/empresa/dashboard`
- [ ] Criar componente `MetricCard`
- [ ] Implementar cálculo de métricas a partir do mock
- [ ] Implementar saudação personalizada
- [ ] Layout responsivo de cards

**Validação:** Métricas exibindo valores corretos

#### Fase 2: Listas e Gráfico

**Objetivo:** Implementar seções de dados

**Ações:**
- [ ] Criar componente `ApplicationsByJob` (barras horizontais)
- [ ] Criar componente `PendingActions`
- [ ] Criar componente `RecentApplications`
- [ ] Implementar links de navegação

**Validação:** Todas as listas populadas com dados mock

#### Fase 3: Ações e Refinamentos

**Objetivo:** Ações rápidas e polimento

**Ações:**
- [ ] Criar seção de ações rápidas
- [ ] Implementar navegação dos botões
- [ ] Testar responsividade
- [ ] Ajustes visuais

**Validação:** Dashboard completo e funcional

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-002 | Proteção de Rotas | ✅ Implementado |
| PRD-004 | Tipos TypeScript | ⏳ Pendente |

### PRDs Seguintes (mesma área)

| PRD | Descrição |
|-----|-----------|
| PRD-013 | CRUD de Vagas |
| PRD-014 | Banco de Talentos |
| PRD-015 | Gestão de Candidaturas |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.11.0 → 0.12.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.12.0] - 2026-01-XX

### Added
- Dashboard completo da empresa
- Cards de métricas (vagas, candidatos, novos, em análise)
- Gráfico de candidaturas por vaga
- Lista de ações pendentes
- Lista de últimas candidaturas
- Ações rápidas (nova vaga, banco de talentos, mensagens)
- Saudação personalizada por horário
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Grid** | CSS Grid ou Flexbox para layout responsivo |
| **Cards** | Usar Card do shadcn/ui |
| **Barras** | CSS simples ou Recharts para barras horizontais |
| **Tempo** | Usar formatação relativa ("Há 2 horas") |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Gráficos complexos com muitas libs |
| Dados em tempo real |
| Analytics avançados |
| Relatórios exportáveis |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Observações** | Início da Fase 3 (Área da Empresa) |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
