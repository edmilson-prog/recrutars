# PRD-082: Admin Helpdesk Intelligence

> **AILA - Sistemas Inteligentes**
> RecrutaRS — Módulo de Suporte com IA Embarcada

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `TEMPLATE-PRD-feature.md` | Template utilizado |
| `PRD-079` | Planos e Trial — contexto de planos por empresa |
| `PRD-080` | Reorganização LLM/Provedores — configuração de IA |

---

# PRD-082: Admin Helpdesk Intelligence

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo Admin |
| **Repositório** | RecrutaRS-NovaVersao |
| **Objetivo** | Transformar a Central de Ajuda do Admin de uma página de autoatendimento (cópia da visão candidato/empresa) em uma mesa de operações de suporte inteligente, com IA embarcada para triagem, sugestão de respostas, detecção de padrões e FAQ auto-evolutivo |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Épico** | Admin Intelligence Suite |
| **PRDs Relacionados** | PRD-079, PRD-080 |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas, IA embarcada via Anthropic API |

---

## Contexto do Problema

A Central de Ajuda foi implementada para candidatos e empresas como um canal de autoatendimento: os usuários consultam FAQs, criam tickets e acompanham suas solicitações. A versão Admin, porém, foi replicada com a mesma estrutura — o que não faz sentido operacional. Um administrador não abre ticket para si mesmo; ele **recebe, triages, responde e resolve** tickets vindos de empresas e candidatos.

O problema central é que o admin hoje não tem visibilidade nem controle sobre os chamados de suporte. Não há listagem consolidada de tickets, não há contexto do solicitante ao responder, não há métricas de atendimento, e não há ferramentas para identificar padrões antes que virem crises. Isso resulta em atendimentos lentos, respostas inconsistentes e incapacidade de agir proativamente.

A oportunidade vai além da correção: ao embarcamos IA neste módulo — usando a infraestrutura de provedores LLM já configurada (PRD-080) — o RecrutaRS pode oferecer ao administrador superpoderes de suporte: triagem automática, sugestão de respostas contextualizadas, detecção de padrões sistêmicos e evolução contínua do FAQ baseada nos tickets reais.

---

## Conceito da Solução

### Situação Atual (As-Is)

A tela Admin > Central de Ajuda exibe exatamente o mesmo conteúdo que a versão candidato/empresa: cards de contato (email, telefone, horário), lista de FAQs em acordeão, e botão "Novo Ticket". O admin não tem forma de ver, gerenciar ou responder os tickets de outros usuários pelo painel.

### Situação Desejada (To-Be)

O módulo Admin > Helpdesk deve funcionar como uma **mesa de operações de suporte (helpdesk)** com quatro camadas:

1. **Dashboard de métricas** — visão executiva em tempo real: tickets abertos, em andamento, SLA em risco, CSAT e tempo médio de atendimento.
2. **Gestão de tickets** — listagem completa com filtros, semáforo de SLA, painel de contexto do solicitante (plano, trial, histórico), notas internas e respostas.
3. **Gestão de FAQ** — CRUD completo das perguntas/respostas que os usuários visualizam, com sugestões automáticas da IA.
4. **IA embarcada** — triagem automática, sugestão de respostas, detecção de padrões e FAQ auto-evolutivo.

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Integração com Zendesk/Freshdesk externo | Cria dependência de terceiros, fragmenta a experiência, custo adicional e não aproveita o contexto nativo da plataforma (planos, Gauge-Pro, histórico) |
| Manter a tela atual e apenas adicionar listagem de tickets | Resolve só 20% do problema — não endereça IA, contexto do solicitante nem métricas de suporte |

---

## Escopo

### Incluído

- ✅ Dashboard de métricas de suporte (tickets por status, TMA, SLA, CSAT)
- ✅ Listagem de tickets com filtros por status, tipo de usuário, prioridade e SLA
- ✅ Alerta de padrão detectado pela IA (múltiplos tickets sobre mesmo tema)
- ✅ Semáforo visual de SLA por ticket (verde/âmbar/vermelho)
- ✅ Painel de detalhe do ticket com thread de mensagens
- ✅ Notas internas (visíveis apenas para admins, separadas da resposta ao usuário)
- ✅ Painel de contexto do solicitante: plano, status de trial, engajamento, histórico de tickets
- ✅ IA: triagem automática (categorização + prioridade ao receber ticket)
- ✅ IA: sugestão de resposta contextualizada com nível de confiança
- ✅ IA: detecção de padrões sistêmicos com alertas proativos
- ✅ IA: sugestão de novas entradas no FAQ baseadas em tickets recorrentes
- ✅ Gestão de FAQ pelo admin (CRUD completo)
- ✅ Banco de respostas rápidas com variáveis dinâmicas ({{nome}}, {{plano}}, {{dias_trial}})
- ✅ CSAT simples pós-ticket (👍/👎 enviado ao usuário após resolução)
- ✅ Gestão das informações de contato exibidas na Central de Ajuda (email, telefone, horário)

### Excluído

- ❌ Chat em tempo real (WebSocket) — tickets são assíncronos nesta versão
- ❌ Atribuição de tickets entre múltiplos agentes de suporte — admin único por ora
- ❌ Integração com canais externos (WhatsApp, email SMTP) — escopo futuro
- ❌ SLA configurável por tipo de ticket — SLA padrão fixo nesta versão
- ❌ IA gerando resposta e enviando automaticamente sem aprovação humana — sempre requer confirmação do admin

---

## Requisitos Funcionais

### RF-01: Dashboard de Métricas

- **RF-01.1:** O sistema deve exibir na área de métricas os seguintes indicadores em tempo real: total de tickets abertos, tickets em andamento, tickets resolvidos nos últimos 7 dias, tickets com SLA em risco e índice de CSAT do período.
- **RF-01.2:** Cada métrica deve exibir um indicador de tendência comparado ao período anterior (delta), com sinalização visual positiva/negativa.
- **RF-01.3:** O tempo médio de atendimento (TMA) deve ser calculado como a média de tempo entre abertura e resolução dos tickets do período filtrado.
- **RF-01.4:** O CSAT deve ser calculado como percentual de avaliações positivas (👍) sobre o total de avaliações recebidas no período.

### RF-02: Listagem e Filtros de Tickets

- **RF-02.1:** O sistema deve exibir todos os tickets de empresas e candidatos em lista consolidada, ordenados por padrão pelo mais recente.
- **RF-02.2:** A listagem deve suportar filtragem por: status (aberto, em andamento, resolvido, fechado), tipo de solicitante (empresa, candidato), prioridade (alta, média, baixa) e condição de SLA (em risco, dentro do prazo, vencido).
- **RF-02.3:** Cada item da lista deve exibir: ID do ticket, tipo de solicitante, título, preview da última mensagem, nome do solicitante, tempo decorrido desde abertura, prioridade (indicador colorido) e status do SLA.
- **RF-02.4:** O sistema deve suportar busca textual no título e corpo dos tickets.
- **RF-02.5:** Tickets com SLA vencido devem receber destaque visual diferenciado dos demais.

### RF-03: Semáforo de SLA

- **RF-03.1:** Cada ticket deve ter um SLA calculado automaticamente com base em sua prioridade: alta prioridade = 2 horas, média = 8 horas, baixa = 24 horas (valores padrão, ajustáveis futuramente).
- **RF-03.2:** O status do SLA deve ser exibido em três estados visuais: verde (>50% do tempo restante), âmbar (entre 0% e 50% do tempo restante) e vermelho (SLA vencido).
- **RF-03.3:** No detalhe do ticket, o SLA deve ser exibido como barra de progresso com o tempo restante legível.
- **RF-03.4:** O admin deve poder estender o SLA de um ticket individualmente, com registro da extensão no histórico.

### RF-04: Detalhe do Ticket e Thread

- **RF-04.1:** Ao selecionar um ticket, o sistema deve exibir: cabeçalho com ID, status, tipo, título e metadados (data abertura, prioridade, responsável); thread cronológica de mensagens; área de resposta; e painel lateral de contexto do solicitante.
- **RF-04.2:** Cada mensagem na thread deve identificar claramente seu autor (solicitante ou admin) com diferenciação visual entre os dois.
- **RF-04.3:** Notas internas devem ser visualmente distintas das respostas ao usuário (cor e marcação "Privado"), e não devem ser enviadas ao solicitante em nenhuma hipótese.
- **RF-04.4:** O admin deve poder alterar o status do ticket (aberto → em andamento → resolvido → fechado) e a prioridade a qualquer momento.
- **RF-04.5:** Ao marcar um ticket como resolvido, o sistema deve enviar automaticamente uma solicitação de CSAT ao solicitante (👍/👎).

### RF-05: Painel de Contexto do Solicitante

- **RF-05.1:** O painel lateral deve exibir, para o solicitante do ticket ativo, as seguintes informações buscadas do banco de dados: nome, tipo (empresa/candidato), plano atual, status do trial com dias restantes, data de cadastro e responsável da conta (para empresas).
- **RF-05.2:** O painel deve exibir métricas de engajamento do solicitante: número de logins nos últimos 30 dias, vagas ativas (para empresas) ou candidaturas (para candidatos), e contagem de tickets históricos (abertos e resolvidos).
- **RF-05.3:** O histórico de tickets anteriores do solicitante deve ser listado no painel com título, data e status de resolução.
- **RF-05.4:** O painel deve oferecer ações rápidas: link para perfil completo do solicitante, ação de sugerir upgrade de plano (para empresas) e ação de enviar email direto.

### RF-06: Banco de Respostas Rápidas

- **RF-06.1:** O sistema deve manter um banco de respostas pré-cadastradas pelo admin, acessível ao compor uma resposta de ticket.
- **RF-06.2:** Respostas rápidas devem suportar variáveis dinâmicas substituídas automaticamente no momento do uso: `{{nome}}`, `{{plano}}`, `{{dias_trial}}`, `{{limite_vagas}}`.
- **RF-06.3:** O admin deve poder criar, editar, excluir e organizar por categoria as respostas rápidas.

### RF-07: Gestão de FAQ

- **RF-07.1:** O admin deve poder criar, editar, excluir e reordenar entradas do FAQ, com campos: pergunta, resposta (suporte a markdown), categoria e público-alvo (empresa, candidato, ambos).
- **RF-07.2:** FAQs marcadas como inativas não devem ser exibidas para os usuários mas devem permanecer no sistema.
- **RF-07.3:** O sistema deve exibir para cada FAQ quantos tickets foram resolvidos apontando aquela resposta como solução, indicando sua efetividade.

### RF-08: Gestão de Informações de Contato

- **RF-08.1:** O admin deve poder editar as informações de contato exibidas na Central de Ajuda de candidatos e empresas: email de suporte, telefone e horário de atendimento.
- **RF-08.2:** Alterações devem ser refletidas imediatamente nas telas de candidato e empresa sem necessidade de deploy.

### RF-09: IA — Triagem Automática

- **RF-09.1:** Quando um novo ticket é recebido, o sistema deve enviar o conteúdo para o provedor LLM configurado (conforme PRD-080) e obter automaticamente: categoria sugerida (acesso/plano/financeiro/técnico/outro), prioridade sugerida (alta/média/baixa) e resumo em uma linha.
- **RF-09.2:** Os resultados da triagem automática devem ser exibidos como sugestões no ticket, com indicação visual de que são geradas por IA. O admin pode aceitar ou substituir manualmente.
- **RF-09.3:** A triagem automática deve ser executada de forma assíncrona e não deve bloquear a abertura do ticket caso a chamada à API de IA falhe.

### RF-10: IA — Sugestão de Resposta

- **RF-10.1:** Na área de resposta do ticket, o sistema deve disponibilizar um botão "Completar com IA" que envia para o LLM: o histórico completo do ticket, os dados do solicitante (plano, tipo, histórico) e o texto parcial digitado pelo admin, e retorna uma sugestão de resposta completa.
- **RF-10.2:** A sugestão deve ser exibida em caixa destacada acima da área de digitação, com: o texto sugerido, um indicador de confiança (percentual), e botões de ação (Usar / Editar / Ignorar).
- **RF-10.3:** Ao clicar em "Usar", o texto sugerido deve substituir o conteúdo da área de digitação, permitindo edições antes do envio.
- **RF-10.4:** A IA nunca deve enviar respostas diretamente ao usuário — toda resposta requer ação deliberada do admin (clique em "Enviar").

### RF-11: IA — Detecção de Padrões

- **RF-11.1:** O sistema deve monitorar os tickets abertos e identificar quando 3 ou mais tickets com conteúdo semanticamente similar forem recebidos em uma janela de 2 horas.
- **RF-11.2:** Quando um padrão for detectado, deve ser exibido um banner de alerta no topo da listagem de tickets, descrevendo o padrão identificado e a quantidade de tickets afetados.
- **RF-11.3:** O admin deve poder dispensar o alerta, e o sistema não deve reexibi-lo para o mesmo padrão por pelo menos 4 horas.
- **RF-11.4:** A detecção de padrões deve ser executada periodicamente (a cada 30 minutos ou ao receber novo ticket), e nunca de forma síncrona ao fluxo de atendimento.

### RF-12: IA — FAQ Auto-Evolutivo

- **RF-12.1:** O sistema deve analisar periodicamente os tickets resolvidos e identificar perguntas recorrentes que não possuem correspondente no FAQ atual.
- **RF-12.2:** As sugestões de novas entradas de FAQ devem ser exibidas na tela de Gestão de FAQ com: a pergunta identificada, a frequência de ocorrência e um botão "Criar com IA".
- **RF-12.3:** Ao clicar em "Criar com IA", o sistema deve gerar uma proposta de resposta completa para a pergunta, que o admin pode editar e publicar.
- **RF-12.4:** Sugestões podem ser descartadas pelo admin. Sugestões descartadas não devem reaparecer por pelo menos 30 dias.

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Listagem de tickets deve carregar em menos de 2 segundos para até 500 tickets. Chamadas à IA são assíncronas e não bloqueiam a interface.
- **RNF-002 (Resiliência de IA):** Todas as funcionalidades de IA devem ser opcionais e gracefully degradable — se o provedor LLM estiver indisponível, o módulo de helpdesk deve continuar funcionando normalmente sem as sugestões.
- **RNF-003 (Segurança):** Apenas usuários com role `admin` devem acessar o módulo de helpdesk. Notas internas não devem jamais vazar para os endpoints acessados por candidatos/empresas.
- **RNF-004 (Consistência):** O painel de contexto do solicitante deve exibir dados em tempo real, buscando diretamente do banco — não de cache desatualizado.
- **RNF-005 (Auditoria):** Toda ação do admin em tickets (mudança de status, envio de resposta, adição de nota) deve ser registrada com timestamp e identificação do usuário.

---

## Critérios de Aceitação

### RF-02: Listagem de Tickets

```gherkin
DADO que o admin está na tela Admin > Helpdesk
QUANDO a tela é carregada
ENTÃO o sistema deve exibir todos os tickets de empresas e candidatos
  E os tickets devem estar ordenados do mais recente ao mais antigo por padrão
  E cada ticket deve exibir ID, tipo, título, preview, nome do solicitante, tempo decorrido e status de SLA
```

```gherkin
DADO que o admin aplica o filtro "SLA em risco"
QUANDO o filtro é confirmado
ENTÃO apenas tickets com SLA em estado âmbar ou vermelho devem ser exibidos
```

### RF-03: Semáforo de SLA

```gherkin
DADO que um ticket de alta prioridade foi aberto há 1 hora e 30 minutos
QUANDO o admin visualiza a listagem
ENTÃO o indicador de SLA desse ticket deve estar em âmbar
  E o tempo restante deve exibir "30 min restantes"
```

```gherkin
DADO que um ticket de prioridade média foi aberto há 9 horas sem resposta
QUANDO o admin visualiza a listagem
ENTÃO o indicador de SLA deve estar em vermelho
  E o ticket deve receber destaque visual diferenciado
```

### RF-04: Nota Interna

```gherkin
DADO que o admin está no detalhe de um ticket
QUANDO o admin seleciona a aba "Nota interna" e envia uma mensagem
ENTÃO a mensagem deve aparecer na thread com marcação visual "Privado"
  E a mensagem não deve ser visível para o solicitante em nenhuma interface
  E ao recarregar o ticket, a nota deve permanecer na thread
```

### RF-09: Triagem Automática

```gherkin
DADO que um novo ticket foi submetido por uma empresa
QUANDO a triagem automática é executada
ENTÃO o ticket deve exibir a categoria sugerida pela IA
  E a prioridade sugerida pela IA
  E um resumo em uma linha
  E todos devem ser marcados visualmente como "sugestão IA"
```

```gherkin
DADO que a API do provedor LLM está indisponível
QUANDO um novo ticket é recebido
ENTÃO o ticket deve ser criado normalmente sem triagem automática
  E nenhuma mensagem de erro deve ser exibida ao solicitante
  E um log de falha deve ser registrado no sistema
```

### RF-10: Sugestão de Resposta

```gherkin
DADO que o admin está no detalhe de um ticket com histórico de mensagens
QUANDO o admin clica em "Completar com IA"
ENTÃO o sistema deve exibir uma sugestão de resposta acima da área de digitação
  E a sugestão deve incluir o indicador de confiança em percentual
  E os botões "Usar", "Editar" e "Ignorar" devem estar visíveis
```

```gherkin
DADO que a sugestão de IA está visível
QUANDO o admin clica em "Usar"
ENTÃO o texto sugerido deve ser inserido na área de digitação
  E o admin deve poder editar o texto antes de enviar
  E o envio só deve ocorrer após clicar em "Enviar resposta"
```

### RF-11: Detecção de Padrões

```gherkin
DADO que 3 ou mais tickets com conteúdo similar foram abertos em menos de 2 horas
QUANDO o sistema executa a verificação de padrões
ENTÃO um banner de alerta deve ser exibido no topo da listagem
  E o banner deve descrever o padrão identificado e a quantidade de tickets
```

```gherkin
DADO que o banner de padrão está visível
QUANDO o admin clica em dispensar
ENTÃO o banner deve desaparecer
  E não deve reaparecer para o mesmo padrão por pelo menos 4 horas
```

### RF-12: FAQ Auto-Evolutivo

```gherkin
DADO que 4 tickets com a mesma pergunta foram resolvidos e não há FAQ correspondente
QUANDO o sistema executa a análise periódica de FAQ
ENTÃO a pergunta deve aparecer como sugestão na tela de Gestão de FAQ
  E deve exibir "4 tickets similares"
  E o botão "Criar com IA" deve estar disponível
```

### Cenários de Erro

```gherkin
DADO que o admin tenta enviar uma resposta com a área de texto vazia
QUANDO o admin clica em "Enviar resposta"
ENTÃO o sistema deve impedir o envio
  E exibir mensagem de validação "A resposta não pode estar vazia"
```

```gherkin
DADO que o admin está visualizando o painel de contexto
QUANDO ocorre falha ao buscar dados do solicitante
ENTÃO o painel deve exibir os dados disponíveis e sinalizar quais falharam ao carregar
  E um botão "Tentar novamente" deve estar disponível para recarregar apenas o painel
```

---

## Fases de Implementação

| Fase | Objetivo | Complexidade |
|------|----------|-------------|
| 1 | Estrutura de dados e listagem de tickets com filtros | Média |
| 2 | Detalhe do ticket, thread, notas internas, SLA e painel de contexto | Alta |
| 3 | Gestão de FAQ, respostas rápidas e métricas do dashboard | Média |
| 4 | IA embarcada: triagem, sugestão de resposta, padrões e FAQ evolutivo | Alta |

### Detalhamento das Fases

#### Fase 1: Estrutura de Dados e Listagem

**Objetivo:** Criar a base de dados para o helpdesk e exibir tickets na interface admin com filtros funcionais.

**Ações:**
- [ ] Investigar tabelas existentes de tickets no Supabase (verificar se há estrutura de suporte já criada pelos PRDs anteriores)
- [ ] Criar ou complementar tabela `support_tickets` com campos: id, type (empresa/candidato), requester_id, requester_type, title, status, priority, category, created_at, updated_at, resolved_at, sla_deadline, assigned_to
- [ ] Criar tabela `ticket_messages` com campos: id, ticket_id, author_id, author_type (admin/user), content, is_internal_note, created_at
- [ ] Criar tabela `ticket_csat` com campos: id, ticket_id, rating (positive/negative), created_at
- [ ] Implementar a tela Admin > Helpdesk substituindo completamente a Central de Ajuda atual
- [ ] Implementar listagem de tickets com filtros por status, tipo, prioridade e SLA
- [ ] Implementar busca textual nos tickets
- [ ] Implementar semáforo visual de SLA na listagem

**Validação:** Admin visualiza listagem de tickets mockados com filtros funcionais e semáforo de SLA visual.

#### Fase 2: Detalhe, Thread e Contexto

**Objetivo:** Admin consegue abrir um ticket, ler o histórico, responder, adicionar notas internas e ver o contexto completo do solicitante.

**Ações:**
- [ ] Implementar painel de detalhe do ticket com thread de mensagens
- [ ] Implementar diferenciação visual entre respostas ao usuário e notas internas
- [ ] Implementar envio de resposta ao solicitante e adição de nota interna
- [ ] Implementar mudança de status e prioridade do ticket
- [ ] Implementar barra de SLA no detalhe com progresso e opção de extensão
- [ ] Implementar painel de contexto lateral com dados do solicitante (buscar de companies/candidates no Supabase)
- [ ] Implementar histórico de tickets anteriores do solicitante no painel de contexto
- [ ] Implementar ações rápidas no painel de contexto
- [ ] Implementar auditoria de ações do admin (log de mudanças de status e respostas)
- [ ] Implementar envio de CSAT ao resolver ticket

**Validação:** Admin abre ticket, lê thread, envia resposta, adiciona nota interna, vê dados do solicitante e altera status — tudo sem recarregar a página.

#### Fase 3: FAQ, Respostas Rápidas e Dashboard

**Objetivo:** Admin gerencia o conteúdo do FAQ e tem visão executiva do suporte.

**Ações:**
- [ ] Criar tabela `faq_items` com campos: id, question, answer, category, target_audience (empresa/candidato/both), is_active, sort_order, resolved_count, created_at, updated_at
- [ ] Criar tabela `quick_replies` com campos: id, title, content, category, variables_used, created_at
- [ ] Criar tabela `faq_ai_suggestions` com campos: id, question, occurrences, status (pending/accepted/dismissed), dismissed_until, created_at
- [ ] Implementar tela de Gestão de FAQ com CRUD completo e reordenação
- [ ] Implementar tela de Respostas Rápidas com variáveis dinâmicas
- [ ] Implementar banco de respostas rápidas acessível ao compor resposta no ticket
- [ ] Implementar gestão das informações de contato (email, telefone, horário)
- [ ] Implementar dashboard de métricas com KPIs: abertos, andamento, resolvidos, SLA em risco, CSAT, TMA
- [ ] Garantir que FAQ e informações de contato editadas reflitam nas interfaces de candidato e empresa

**Validação:** Admin cria/edita/exclui FAQ, usa resposta rápida ao responder ticket, visualiza métricas corretas no dashboard.

#### Fase 4: IA Embarcada

**Objetivo:** Habilitar as quatro funcionalidades de IA: triagem, sugestão de resposta, detecção de padrões e FAQ auto-evolutivo.

**Ações:**
- [ ] Criar tabela `ticket_ai_metadata` com campos: id, ticket_id, suggested_category, suggested_priority, summary, response_suggestion, response_confidence, triage_at, pattern_group_id
- [ ] Criar tabela `ai_pattern_alerts` com campos: id, pattern_description, ticket_count, detected_at, dismissed_at, dismissed_by
- [ ] Implementar chamada assíncrona ao provedor LLM configurado (PRD-080) para triagem automática ao receber novo ticket
- [ ] Implementar exibição das sugestões de triagem no ticket com marcação visual de IA
- [ ] Implementar botão "Completar com IA" na área de resposta, com envio de contexto completo ao LLM
- [ ] Implementar caixa de sugestão de resposta com nível de confiança e ações (Usar/Editar/Ignorar)
- [ ] Implementar job periódico de detecção de padrões (execução a cada 30 minutos ou ao receber novo ticket)
- [ ] Implementar banner de alerta de padrão na listagem com opção de dispensar
- [ ] Implementar job periódico de análise de FAQ (sugerir novas entradas baseadas em tickets recorrentes)
- [ ] Implementar exibição de sugestões de FAQ na tela de gestão com botão "Criar com IA"
- [ ] Garantir fallback gracioso para todos os recursos de IA (se LLM falhar, módulo continua funcionando)

**Validação:** IA triagem classifica ticket ao abrir, sugestão de resposta é gerada ao clicar no botão, banner de padrão aparece com dados simulados, sugestão de FAQ aparece na tela de gestão.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-063 | Migração Supabase — estrutura base de dados | ✅ Implementado |
| PRD-079 | Planos e Trial — dados de plano por empresa necessários no painel de contexto | ✅ Implementado |
| PRD-080 | Reorganização LLM/Provedores — provedor LLM configurado necessário para IA | ✅ Implementado |

### Serviços Externos

| Serviço | Tipo | Uso |
|---------|------|-----|
| Anthropic API (ou provedor configurado via PRD-080) | API REST | Triagem automática, sugestão de resposta, detecção de padrões, FAQ evolutivo |

### Decisões Pendentes

- [ ] Definir o SLA padrão por prioridade (sugerido: Alta=2h, Média=8h, Baixa=24h) — confirmar com Edmilson
- [ ] Definir janela de análise para detecção de padrões (sugerido: 2 horas, mínimo 3 tickets) — confirmar com Edmilson
- [ ] Confirmar se o CSAT (👍/👎) deve ser enviado por email ou exibido in-app na próxima visita do solicitante

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Admin Intelligence Suite"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-080 | Reorganização LLM/Provedores | ✅ | Provedor LLM configurado |
| **2** | **PRD-082** | **Admin Helpdesk Intelligence** | 🔄 ATUAL | Depende de PRD-080 |
| 3 | PRD-08X | Admin Analytics Dashboard | ⏳ | Depende de PRD-082 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Conteúdo dos tickets | Sensível | Acesso restrito a role `admin`; candidatos/empresas só veem seus próprios tickets |
| Notas internas | Sensível/Interno | Nunca expostas em endpoints acessíveis por candidatos/empresas; filtrar no nível da query |
| Dados do solicitante no painel de contexto | PII | Exibir apenas quando admin está visualizando ticket relacionado |
| Sugestões de IA com contexto do ticket | Sensível | Não logar o conteúdo completo enviado ao LLM; usar apenas ID de referência nos logs |

### Autenticação e Autorização

O módulo Admin > Helpdesk deve ser protegido pela mesma verificação de role `admin` que os demais módulos administrativos. Nenhuma rota ou endpoint deste módulo deve ser acessível por usuários com role `empresa` ou `candidato`. Validar no nível do middleware/RLS do Supabase, não apenas no frontend.

### Auditoria

As seguintes ações devem ser registradas com timestamp, user_id e detalhes da ação: abertura de ticket, mudanças de status, mudanças de prioridade, envio de resposta ao usuário, adição de nota interna, extensão de SLA, criação/edição/exclusão de FAQ, criação/edição de resposta rápida, dispensa de alertas de padrão, aceitação/descarte de sugestões de IA.

---

## Fluxos de Usuário

### Fluxo Principal: Admin Atende um Ticket

```
Admin acessa Helpdesk
  ──▶ Visualiza dashboard de métricas
  ──▶ Identifica ticket com SLA em risco (âmbar/vermelho)
  ──▶ Abre o ticket
  ──▶ Lê o contexto do solicitante no painel lateral (plano, histórico)
  ──▶ Lê a thread de mensagens
  ──▶ Adiciona nota interna com diagnóstico
  ──▶ Clica em "Completar com IA" para sugestão de resposta
  ──▶ Edita a sugestão se necessário
  ──▶ Envia a resposta ao solicitante
  ──▶ Muda o status para "Resolvido"
  ──▶ Sistema envia CSAT automaticamente ao solicitante
```

### Fluxo: Admin Recebe Alerta de Padrão

```
Sistema detecta 3+ tickets similares em 2h
  ──▶ Banner de alerta aparece no topo da listagem
  ──▶ Admin lê o padrão descrito
  ──▶ Admin clica para filtrar os tickets afetados
  ──▶ Admin responde os tickets em lote usando resposta rápida
  ──▶ Admin dispensa o alerta após atuar
```

### Fluxo: Admin Cria FAQ a Partir de Sugestão da IA

```
IA detecta pergunta recorrente sem resposta no FAQ
  ──▶ Sugestão aparece na tela de Gestão de FAQ
  ──▶ Admin visualiza a sugestão com frequência de ocorrência
  ──▶ Admin clica em "Criar com IA"
  ──▶ IA gera proposta de resposta completa
  ──▶ Admin edita e ajusta o conteúdo
  ──▶ Admin publica a nova entrada no FAQ
  ──▶ FAQ fica disponível para candidatos/empresas imediatamente
```

### Fluxos de Exceção

Se um solicitante exclui sua conta enquanto o ticket está aberto, o ticket deve permanecer no sistema com indicação "Conta excluída" nos dados do solicitante, para preservar histórico de suporte.

### Fluxos de Erro

Se a chamada ao LLM falhar durante triagem, o ticket é criado normalmente com categoria e prioridade como "Não classificado", sem impacto na experiência do solicitante. O admin pode classificar manualmente. Falhas de IA devem ser logadas silenciosamente.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus operando via Claude Code CLI. Este PRD foi criado pelo Agente Arquiteto na plataforma web.

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. VERIFICAÇÕES INICIAIS OBRIGATÓRIAS:**
> - Inspecionar se já existe alguma tabela de tickets/suporte no banco (pode ter sido criada por PRDs anteriores da Central de Ajuda)
> - Verificar a estrutura atual da tabela `companies` e `candidates` para garantir compatibilidade com o painel de contexto
> - Verificar como o PRD-080 armazenou a configuração do provedor LLM para reutilizar a mesma lógica de chamada
> - Verificar a estrutura de roles/permissões do Supabase para garantir que o middleware admin já existe

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar versão do app (MINOR +1 — nova feature significativa)
> - Codinome sugerido: **"Oracle"** (sistema que vê padrões e sugere respostas)
> - Atualizar CHANGELOG.md
> - Renomear este arquivo adicionando `_DONE` ao final

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **IA e resiliência** | Toda funcionalidade de IA deve ter fallback gracioso. O módulo deve funcionar 100% sem IA — ela é um enhancer, não um requisito de funcionamento |
| **Notas internas** | Esta é uma funcionalidade crítica de privacidade. Nunca expor notas internas em nenhum endpoint acessado por candidatos/empresas. Validar no nível do Supabase RLS, não apenas no frontend |
| **Performance da listagem** | Implementar paginação desde o início para a listagem de tickets. Não carregar todos os tickets em memória |
| **Chamadas à IA** | Usar o mesmo padrão de configuração de provedor estabelecido no PRD-080. Não hardcodar endpoints ou chaves |
| **CSAT** | Implementar o fluxo de envio de CSAT como um evento disparado ao resolver, não como um processo manual |
| **Dados do solicitante** | O painel de contexto deve buscar dados em tempo real do Supabase ao abrir o ticket — não usar dados em cache que podem estar desatualizados |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Não copiar a lógica da Central de Ajuda de candidato/empresa para a versão admin — são módulos completamente diferentes |
| Não expor notas internas em endpoints públicos ou em qualquer view acessada por usuários não-admin |
| Não implementar envio automático de respostas pela IA sem confirmação do admin |
| Não bloquear a criação de tickets se a chamada à IA falhar — são operações independentes |
| Não hardcodar os valores de SLA (usar configuração) |
| Não buscar todos os tickets sem paginação — pode ter centenas de registros |

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
| 19/02/2026 | v1 | Criação inicial — módulo completo de Admin Helpdesk com IA embarcada |

---

**AILA - Sistemas Inteligentes**
*RecrutaRS — Consultoria e Gestão*
