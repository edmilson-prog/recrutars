# PRD-054: Hub de Testes Comportamentais — Relatórios, Métricas e Auditoria

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
| `PRD-053` | Hub de Testes: Resultados e Comparativos |
| **`PRD-054`** | ⬅ Você está aqui — Hub de Testes: Relatórios, Métricas e Auditoria |

---

# PRD-054: Hub de Testes Comportamentais — Relatórios, Métricas e Auditoria

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Empresa + Painel Admin |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar sistema completo de relatórios exportáveis (PDF/Excel), métricas e estatísticas agregadas de testes comportamentais, e sistema de auditoria com log de ações para conformidade e rastreabilidade |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Hub de Testes Comportamentais |
| **PRDs Relacionados** | PRD-049, PRD-050, PRD-051, PRD-052, PRD-053 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade — geração de PDFs com gráficos, exportação Excel com dados estruturados, cálculo de métricas agregadas com múltiplas dimensões de análise, sistema de auditoria com log granular, e dashboards de estatísticas com filtros avançados.

---

## Contexto do Problema

Empresas que aplicam testes comportamentais precisam de três capacidades complementares:

1. **Relatórios exportáveis** — Para compartilhar resultados com stakeholders que não acessam a plataforma (diretores, clientes, consultores externos)

2. **Métricas e estatísticas** — Para entender padrões: qual perfil mais se candidata? Qual a taxa de conclusão? A empresa está contratando perfis compatíveis?

3. **Auditoria** — Para conformidade LGPD e governança: quem acessou qual resultado, quando, e o que fez com a informação

Este PRD fecha o ciclo do Hub de Testes com ferramentas de inteligência e controle.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Resultados visíveis apenas dentro da plataforma
- Sem exportação para compartilhar com terceiros
- Sem visão agregada de padrões comportamentais
- Sem rastro de quem acessou ou visualizou resultados
- Sem indicadores de eficiência do processo de avaliação

### Situação Desejada (To-Be)

- Relatório PDF profissional por candidato (com gráficos e análise IA)
- Relatório Excel consolidado por teste (todos os candidatos)
- Dashboard de métricas com filtros por período, vaga, perfil
- Estatísticas de distribuição de perfis e dimensões
- Log completo de auditoria com filtros
- Indicadores de eficiência do processo de avaliação

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas print da tela | Qualidade baixa, sem formatação profissional |
| Exportar apenas CSV | Não inclui gráficos, não serve para apresentações |
| Auditoria manual | Não escala, não é confiável, não é automática |

---

## Escopo

### Incluído

- ✅ Relatório PDF individual (por candidato)
- ✅ Relatório PDF comparativo (2-4 candidatos)
- ✅ Relatório Excel consolidado (por teste ou por vaga)
- ✅ Dashboard de métricas e estatísticas
- ✅ Distribuição de perfis arquetípicos
- ✅ Distribuição de scores por dimensão
- ✅ Taxa de conclusão e tempo médio
- ✅ Tendências ao longo do tempo
- ✅ Sistema de auditoria (log de ações)
- ✅ Filtros e exportação do log de auditoria

### Excluído

- ❌ Relatório interativo online (compartilhável por link)
- ❌ Integração com ferramentas BI externas (Power BI, etc.)
- ❌ Alertas automáticos baseados em métricas
- ❌ Relatórios para candidatos (apenas empresa e admin)

---

## Requisitos Funcionais

### Relatórios PDF

#### Relatório Individual do Candidato

- **RF-001:** O sistema deve gerar relatório PDF individual contendo:

  **Capa:**
  - Logo da empresa (ou logo RecrutaRS)
  - "Relatório de Perfil Comportamental"
  - Nome do candidato
  - Nome do teste / vaga
  - Data de geração

  **Página 1 — Visão Geral:**
  - Perfil arquetípico (nome, ícone, descrição)
  - Radar chart com 5 dimensões
  - Score de fit com a vaga (se aplicável)
  - Top 3 forças e Top 2 áreas de desenvolvimento

  **Página 2 — Análise Detalhada:**
  - Barras de progresso por dimensão com valores
  - Descrição de cada dimensão relevante
  - Análise Prática gerada por IA (PRD-051)

  **Página 3 — Recomendações (se análise IA disponível):**
  - Perguntas sugeridas para entrevista
  - Compatibilidade com a vaga
  - Recomendação final

  **Rodapé:**
  - "Gerado por RecrutaRS — Plataforma de Recrutamento Inteligente"
  - Data e hora de geração
  - Indicador "Análise assistida por IA" (se aplicável)
  - Aviso de confidencialidade

- **RF-002:** O PDF deve usar identidade visual da empresa (se configurada) ou identidade padrão RecrutaRS

- **RF-003:** O sistema deve permitir download direto ou envio por e-mail

#### Relatório Comparativo (2-4 candidatos)

- **RF-004:** O sistema deve gerar relatório PDF comparativo contendo:

  **Capa:**
  - "Relatório Comparativo de Perfil Comportamental"
  - Nome do teste / vaga
  - Nomes dos candidatos comparados

  **Página 1 — Comparação Visual:**
  - Radar chart com linhas sobrepostas
  - Tabela comparativa de dimensões
  - Score de fit de cada candidato

  **Página 2 — Análise Comparativa:**
  - Destaques: quem se destaca em cada dimensão
  - Complementaridades entre candidatos
  - Ranking de compatibilidade

  **Página 3 — Recomendação:**
  - Shortlist sugerida
  - Observações gerais

- **RF-005:** Limite de 4 candidatos por relatório comparativo

### Relatórios Excel

- **RF-006:** O sistema deve gerar relatório Excel consolidado por teste, contendo:

  **Aba 1 — Resumo:**
  - Informações do teste (nome, vaga, datas, pesos)
  - Total de candidatos (convidados, concluídos, pendentes)
  - Taxa de conclusão e tempo médio

  **Aba 2 — Resultados Individuais:**

  | Candidato | Email | D1 | D2 | D3 | D4 | D5 | Perfil | Fit% | Data |
  |-----------|-------|----|----|----|----|-----|--------|------|------|
  | Maria S. | m@e.com | 85 | 42 | 67 | 91 | 55 | Comandante | 78% | 01/02 |
  | João P. | j@e.com | 45 | 88 | 50 | 63 | 72 | Influenciador | 65% | 02/02 |

  **Aba 3 — Estatísticas:**
  - Média por dimensão
  - Desvio padrão por dimensão
  - Distribuição de perfis (contagem)

  **Aba 4 — Convites:**
  - Status de cada convite (enviado, concluído, expirado)

- **RF-007:** O sistema deve permitir gerar Excel consolidado por vaga (agrupando todos os testes vinculados à mesma vaga)

- **RF-008:** O sistema deve permitir gerar Excel consolidado geral (todos os testes da empresa, com filtro por período)

### Dashboard de Métricas e Estatísticas

- **RF-009:** O sistema deve exibir dashboard de métricas acessível pelo menu:
  ```
  🧠 Testes Comportamentais
      └── 📊 Métricas (ou acessível via aba no dashboard principal)
  ```

- **RF-010:** Métricas de Eficiência:

  | Métrica | Descrição | Visualização |
  |---------|-----------|--------------|
  | Taxa de conclusão | Concluídos / Convidados × 100 | Gauge (0-100%) |
  | Tempo médio de aplicação | Média em minutos | Número com tendência |
  | Taxa de abandono | Iniciados - Concluídos / Iniciados × 100 | Gauge |
  | Tempo médio convite→início | Dias entre convite e início | Número |
  | Convites expirados | Total e % de expirados | Barra |

- **RF-011:** Estatísticas de Perfis:

  | Estatística | Descrição | Visualização |
  |-------------|-----------|--------------|
  | Distribuição de perfis | Contagem por arquétipo | Gráfico de barras ou pizza |
  | Perfil mais frequente | Arquétipo mais comum | Card destacado |
  | Score médio por dimensão | Média de todos os candidatos | Radar chart médio |
  | Distribuição por dimensão | Histograma de scores | Gráfico de distribuição |
  | Faixa de fit | Contagem por faixa (Excelente, Bom, etc) | Barras horizontais |

- **RF-012:** Tendências ao longo do tempo:
  - Gráfico de linha: testes aplicados por mês
  - Gráfico de linha: taxa de conclusão por mês
  - Gráfico de linha: score médio de fit por mês

- **RF-013:** Filtros disponíveis:
  - Período (7d, 30d, 90d, 12m, personalizado)
  - Vaga específica
  - Tipo de template usado
  - Status do teste

- **RF-014:** Métricas por vaga (comparar desempenho entre vagas):

  | Vaga | Candidatos | Conclusão | Fit Médio | Perfil Dominante |
  |------|------------|-----------|-----------|-----------------|
  | Gerente Vendas | 25 | 84% | 72% | Influenciador |
  | Analista TI | 18 | 91% | 68% | Especialista |
  | Coordenador | 12 | 75% | 80% | Capitão |

### Sistema de Auditoria

- **RF-015:** O sistema deve registrar automaticamente as seguintes ações:

  | Ação | Dados Registrados |
  |------|------------------|
  | Criação de teste | Usuário, teste, timestamp |
  | Ativação de teste | Usuário, teste, timestamp |
  | Encerramento de teste | Usuário, teste, timestamp |
  | Envio de convite | Usuário, teste, candidato(s), timestamp |
  | Visualização de resultado | Usuário, candidato, timestamp |
  | Download de relatório PDF | Usuário, candidato(s), tipo relatório, timestamp |
  | Export Excel | Usuário, teste/vaga, timestamp |
  | Regeneração de análise IA | Usuário, candidato, timestamp |
  | Adição à shortlist | Usuário, candidato, timestamp |
  | Alteração de configuração | Usuário, campo alterado, valor anterior, novo valor, timestamp |

- **RF-016:** O sistema deve exibir log de auditoria com:
  - Lista cronológica (mais recente primeiro)
  - Ícone por tipo de ação
  - Nome do usuário que realizou
  - Descrição da ação
  - Timestamp com fuso horário
  - Link para o recurso afetado (teste, candidato)

- **RF-017:** Filtros do log de auditoria:
  - Tipo de ação (dropdown multi-select)
  - Usuário (quem realizou)
  - Período (data inicial → data final)
  - Recurso afetado (teste ou candidato específico)

- **RF-018:** O sistema deve permitir exportar log de auditoria em Excel

- **RF-019:** O log deve ser visível:
  - **Painel Empresa:** Apenas ações da própria empresa
  - **Painel Admin:** Todas as ações de todas as empresas

- **RF-020:** Registros de auditoria são imutáveis — não podem ser editados ou excluídos

### Conformidade LGPD

- **RF-021:** O sistema deve registrar toda visualização de dados pessoais de candidatos

- **RF-022:** O log de auditoria deve servir como evidência para relatórios de conformidade LGPD

- **RF-023:** O sistema deve permitir gerar "Relatório de Acesso a Dados" por candidato:
  - Quem acessou os resultados deste candidato
  - Quando
  - O que foi visualizado/exportado

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Geração de PDF individual < 5 segundos
- **RNF-002 (Performance):** Geração de Excel consolidado < 10 segundos (até 500 registros)
- **RNF-003 (Performance):** Dashboard de métricas deve carregar em < 3 segundos
- **RNF-004 (Armazenamento):** Logs de auditoria retidos por mínimo 5 anos
- **RNF-005 (Integridade):** Logs de auditoria imutáveis (append-only)
- **RNF-006 (Segurança):** PDFs gerados devem ter marca d'água "Confidencial"

---

## Critérios de Aceitação

### RF-001/002/003: PDF Individual

```gherkin
DADO que existe resultado completo para um candidato
QUANDO o gestor clicar em "Gerar PDF"
ENTÃO o sistema deve gerar documento PDF com:
  E capa com dados do candidato e teste
  E radar chart com 5 dimensões renderizado
  E barras de progresso por dimensão
  E análise prática da IA (se disponível)
  E rodapé com timestamp e aviso de confidencialidade
  E o download deve iniciar automaticamente
```

### RF-006/007: Excel Consolidado

```gherkin
DADO que um teste tem 20 candidatos com resultados
QUANDO o gestor clicar em "Exportar Excel"
ENTÃO o sistema deve gerar arquivo .xlsx com:
  E aba "Resumo" com informações do teste
  E aba "Resultados" com 20 linhas (uma por candidato) e colunas D1-D5, perfil, fit%
  E aba "Estatísticas" com médias e distribuição
  E o download deve completar em menos de 10 segundos
```

### RF-010/011: Dashboard de Métricas

```gherkin
DADO que a empresa tem testes com resultados
QUANDO o gestor acessar Métricas
ENTÃO deve ver taxa de conclusão como gauge visual
  E distribuição de perfis como gráfico de barras
  E score médio por dimensão como radar chart
  E tendências ao longo do tempo como gráfico de linha
  E filtros por período devem atualizar todos os gráficos
```

### RF-015/016: Auditoria

```gherkin
DADO que um gestor visualizou resultado de um candidato
QUANDO o admin acessar o log de auditoria
ENTÃO deve ver registro com:
  E nome do gestor
  E ação "Visualizou resultado"
  E nome do candidato
  E timestamp exato
  E link para o recurso
  E o registro não pode ser editado ou excluído
```

### RF-023: Relatório LGPD

```gherkin
DADO que um candidato solicita saber quem acessou seus dados
QUANDO o admin gerar "Relatório de Acesso a Dados" para esse candidato
ENTÃO deve listar todos os acessos:
  E quem acessou (nome do gestor/empresa)
  E quando (data e hora)
  E o que foi feito (visualizado, exportado, etc)
```

### Cenários de Erro

```gherkin
DADO que o sistema tenta gerar PDF mas o radar chart falha
QUANDO o erro ocorrer
ENTÃO deve gerar PDF sem o gráfico
  E incluir nota "Gráfico indisponível"
  E registrar erro em log técnico

DADO que o gestor tenta exportar Excel de teste sem resultados
QUANDO clicar em "Exportar"
ENTÃO deve exibir mensagem "Nenhum resultado disponível para exportação"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Relatório PDF individual | 4 |
| 2 | Relatório PDF comparativo e Excel | 4 |
| 3 | Dashboard de métricas | 5 |
| 4 | Sistema de auditoria | 4 |
| 5 | LGPD e exportações de auditoria | 3 |

### Detalhamento das Fases

#### Fase 1: Relatório PDF Individual

**Objetivo:** Gerar PDF profissional por candidato

**Ações:**
- [ ] Implementar template PDF com capa, visão geral e análise
- [ ] Renderizar radar chart em formato compatível com PDF
- [ ] Incluir análise IA formatada
- [ ] Implementar download e envio por e-mail
- [ ] Adicionar marca d'água e rodapé

**Validação:** PDF gerado contém todas as seções com gráficos renderizados

#### Fase 2: Relatório PDF Comparativo e Excel

**Objetivo:** Implementar relatórios consolidados

**Ações:**
- [ ] Criar template PDF comparativo (2-4 candidatos)
- [ ] Implementar geração de Excel com múltiplas abas
- [ ] Criar exportação consolidada por teste e por vaga
- [ ] Implementar exportação geral com filtros

**Validação:** PDFs comparativos e Excels são gerados corretamente

#### Fase 3: Dashboard de Métricas

**Objetivo:** Implementar visualizações de métricas agregadas

**Ações:**
- [ ] Criar componentes de gauge (taxa de conclusão, abandono)
- [ ] Implementar gráfico de distribuição de perfis
- [ ] Implementar radar chart médio da empresa
- [ ] Criar gráficos de tendência temporal
- [ ] Implementar filtros por período, vaga, template

**Validação:** Dashboard exibe métricas corretas com filtros funcionais

#### Fase 4: Sistema de Auditoria

**Objetivo:** Implementar log automático de ações

**Ações:**
- [ ] Criar tabela de log de auditoria
- [ ] Implementar interceptors/hooks para registrar ações automaticamente
- [ ] Criar tela de visualização do log com filtros
- [ ] Implementar regra de imutabilidade (append-only)

**Validação:** Ações são registradas automaticamente e log é consultável

#### Fase 5: LGPD e Exportações de Auditoria

**Objetivo:** Garantir conformidade e rastreabilidade

**Ações:**
- [ ] Implementar "Relatório de Acesso a Dados" por candidato
- [ ] Implementar exportação do log em Excel
- [ ] Garantir que registros de visualização de PII são capturados
- [ ] Adicionar políticas de retenção (5 anos)

**Validação:** Relatório LGPD gerado corretamente com todos os acessos

---

## Modelo de Dados

### Tabela: `audit_logs`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| user_id | UUID | FK usuário que realizou ação |
| user_name | VARCHAR(200) | Nome do usuário (desnormalizado para histórico) |
| action_type | ENUM | 'test_created', 'test_activated', 'test_closed', 'invite_sent', 'result_viewed', 'pdf_downloaded', 'excel_exported', 'ai_regenerated', 'shortlist_added', 'config_changed' |
| resource_type | ENUM | 'test', 'invitation', 'result', 'report', 'config' |
| resource_id | UUID | ID do recurso afetado |
| resource_name | VARCHAR(200) | Nome do recurso (desnormalizado) |
| details | JSONB | Detalhes adicionais (campo alterado, valor anterior/novo, etc) |
| ip_address | VARCHAR(45) | IP do usuário |
| created_at | TIMESTAMP | Timestamp da ação (imutável) |

> **Nota:** Esta tabela é append-only. Não permitir UPDATE ou DELETE.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-051 | Análise IA (conteúdo para PDF) | ⏳ |
| PRD-052 | Hub Dashboard e Gestão (dados de testes) | ⏳ |
| PRD-053 | Resultados e Comparativos (visualizações) | ⏳ |

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
| 6 | PRD-053 | Hub: Resultados e Comparativos | ⏳ | Depende de 051, 052 |
| **7** | **PRD-054** | **Hub: Relatórios, Métricas e Auditoria** | **🔄 ATUAL** | Depende de 052, 053 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Relatórios

| Aspecto | Tratamento |
|---------|------------|
| PDFs gerados | Marca d'água "Confidencial" |
| Links de download | Temporários (expiram em 1h) |
| E-mail com PDF | Aviso de confidencialidade no corpo do e-mail |

### Auditoria

| Aspecto | Tratamento |
|---------|------------|
| Imutabilidade | Tabela append-only, sem UPDATE/DELETE |
| Retenção | Mínimo 5 anos |
| Acesso | Empresa vê apenas seus logs; Admin vê todos |
| Integridade | Incluir hash de verificação por registro |

### LGPD

| Aspecto | Tratamento |
|---------|------------|
| Direito de acesso | Relatório de Acesso a Dados por candidato |
| Direito de exclusão | Logs de auditoria retidos (obrigação legal) mas dados pessoais anonimizados |
| Transparência | Candidato pode solicitar relatório de quem viu seus dados |

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
| **Não bloquear fluxo principal** | Geração de PDF/Excel em background |
| **Fail gracefully** | Se gráfico falhar no PDF, substituir por tabela |
| **Preservar evidências** | Logs são imutáveis |
| **Testar incrementalmente** | Validar cada tipo de relatório independentemente |
| **Documentar decisões** | Registrar biblioteca escolhida para PDF e Excel |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **PDF** | Gráficos devem ser renderizados como imagem no PDF |
| **Excel** | Usar formatação condicional para destacar valores |
| **Métricas** | Cache com invalidação a cada 5 minutos |
| **Auditoria** | Interceptar ações no nível de serviço, não de UI |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Gerar PDF com dados desatualizados (sempre buscar dados frescos) |
| Permitir edição ou exclusão de registros de auditoria |
| Cache de métricas sem invalidação |
| Expor IP ou dados sensíveis no log de auditoria visível pela empresa |
| Gerar Excel com mais de 10.000 linhas sem paginação |

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
