# PRD-089: Rastreamento e Observabilidade Ponta a Ponta do Fluxo de Testes Gauge-Pro

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo Testes Comportamentais (Gauge-Pro) |
| **Repositório** | recrutars-maike (Vercel) + RecrutaRS-NovaVersao (Supabase) |
| **Objetivo** | Implementar rastreamento completo do ciclo de vida dos testes comportamentais — do envio do convite até a análise de IA — com auditoria, métricas, notificações e controle de créditos |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Estabilização e Redesign do Fluxo de Testes para Colaboradores |
| **PRDs Relacionados** | PRD-087-fix (pré-requisito), PRD-088 (pré-requisito), PRD-035-ia (transparência matching) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | ✅ Transversal — afeta banco, edge functions, frontend (Hub + Perfil), notificações, métricas. 7 dimensões de rastreamento. |

---

## Contexto do Problema

A plataforma possui tabelas de auditoria, métricas, notificações e créditos, mas o rastreamento do fluxo de testes é **fragmentado e incompleto**. A análise dos dados em produção revela:

**Ciclo de vida dos convites:** Dos 40 convites no banco, apenas 25% tem `viewed_at` preenchido. `assessment_id` está NULL em 100% dos registros. Não é possível saber, olhando os dados, qual convite gerou qual resultado.

**Auditoria:** Existem 31 registros em `test_audit_logs` com 10 tipos de ação, mas faltam eventos críticos: `cpf_verified`, `test_viewed`, `test_completed_by_collaborator`, `invite_resent`. Dos 40 convites enviados, apenas 6 têm log de `invite_sent` — ou seja, 85% dos envios não foram auditados.

**Créditos:** A tabela `test_credit_transactions` tem apenas 2 registros, ambos de crédito manual admin. Nenhum consumo de crédito por teste está registrado. Não existe vínculo entre transação e convite/colaborador.

**Métricas:** `platform_metrics_daily` coleta métricas gerais (664 dias), mas não há métricas específicas de testes corporativos: taxa de conclusão por empresa, tempo médio de resposta, taxa de reteste.

**Activity feed:** Completamente vazio (0 registros). Nenhuma atividade de teste é registrada.

**Notificações:** 186 notificações no sistema, mas nenhuma é do tipo "teste concluído" para empresas. O gestor não sabe quando um colaborador terminou o teste.

**Retestes:** A tabela `retest_schedules` existe (0 registros) mas nenhum agendamento está sendo criado.

Sem rastreamento confiável, a empresa não tem visibilidade sobre o que está acontecendo com seus testes, não consegue fazer follow-up com colaboradores pendentes, e a RecrutaRS não consegue medir o valor do produto.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
CADEIA QUEBRADA:
  Convite → [???] → Assessment → [???] → Resultado → [???] → Análise IA
             ↑ sem viewed_at    ↑ sem assessment_id    ↑ sem vínculo

AUDITORIA PARCIAL:
  31 logs / 40 convites = 77% sem registro

CRÉDITOS SEM CONSUMO:
  2 transações manuais / 0 consumos rastreados

EMPRESA SEM VISIBILIDADE:
  0 notificações de conclusão / 0 atividades no feed
```

### Situação Desejada (To-Be)

```
CADEIA COMPLETA E RASTREÁVEL:
  Convite (sent_at) → Visualizado (viewed_at) → Iniciado (started_at)
    → CPF verificado → Gauge-Pro executado → Concluído (completed_at)
    → assessment_id preenchido → gauge_pro_results vinculado
    → ai_analyses vinculada → team_member atualizado
    → crédito consumido → notificação enviada → audit log completo

7 DIMENSÕES DE RASTREAMENTO:
  1. Ciclo de vida: cada transição de status registrada com timestamp
  2. Cadeia de vínculos: convite ↔ assessment ↔ resultado ↔ IA
  3. Timeline de retestes: histórico + agendamento automático
  4. Créditos: consumo vinculado a convite + colaborador
  5. Auditoria: TODOS os eventos com quem/quando/como
  6. Métricas: funil, taxa de conclusão, tempo médio, por empresa
  7. Notificações: empresa avisada em tempo real
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Rastrear apenas no frontend (state local) | Perda de dados ao fechar navegador, sem auditoria server-side |
| Usar apenas logs do Supabase | Não estruturado, difícil de consultar e agregar em dashboards |
| Implementar observabilidade externa (ex: Datadog) | Over-engineering para o estágio atual, custo desnecessário |

---

## Escopo

### Incluído

- ✅ **Dimensão 1:** Ciclo de vida completo do convite com timestamps consistentes
- ✅ **Dimensão 2:** Cadeia de vínculos convite → assessment → resultado → análise IA
- ✅ **Dimensão 3:** Timeline de retestes com agendamento e histórico comparativo
- ✅ **Dimensão 4:** Consumo de créditos vinculado a convite + colaborador
- ✅ **Dimensão 5:** Auditoria completa de todos os eventos do fluxo
- ✅ **Dimensão 6:** Métricas agregadas para o Hub (funil, taxa, tempo médio)
- ✅ **Dimensão 7:** Notificações para empresa quando colaborador conclui teste

### Excluído

- ❌ Dashboard de analytics externo (futuro)
- ❌ Exportação de relatórios de métricas em PDF/Excel (futuro)
- ❌ Alertas por email para gestores (apenas notificação in-app e WhatsApp neste PRD)
- ❌ Rastreamento do fluxo de candidatos no onboarding (escopo separado)

---

## Requisitos Funcionais

### Dimensão 1 — Ciclo de Vida do Convite

- **RF-001:** Cada transição de status do convite deve registrar o timestamp correspondente: `sent_at` (envio), `viewed_at` (primeiro acesso ao link), `started_at` (início do Gauge-Pro), `completed_at` (conclusão). Os timestamps devem ser imutáveis após preenchidos — apenas o primeiro acesso seta `viewed_at`, por exemplo.
- **RF-002:** O status do convite deve seguir a máquina de estados: `sent → viewed → started → completed` ou `sent → viewed → started → abandoned` ou `sent → expired`. Transições inválidas (ex: de `completed` para `sent`) devem ser rejeitadas.
- **RF-003:** O sistema deve detectar e registrar abandono: se um convite está em `started` há mais de 24 horas sem conclusão, deve ser marcado como `abandoned` por um job agendado ou na próxima consulta.

### Dimensão 2 — Cadeia de Vínculos

- **RF-004:** Ao concluir o teste, o `test_invitations.assessment_id` deve ser preenchido com o UUID do `gauge_pro_assessment` criado. Este é o elo central da cadeia.
- **RF-005:** O `gauge_pro_results` deve conter referência ao `test_invitations.id` (novo campo `invitation_id`) para permitir rastreamento reverso: resultado → convite.
- **RF-006:** A `ai_analyses` deve conter referência ao `gauge_pro_results.id` (novo campo `result_id`) para fechar a cadeia: análise IA → resultado → assessment → convite.
- **RF-007:** O sistema deve expor uma consulta unificada (view ou function) que retorne a cadeia completa dado qualquer ponto de entrada: convite_id, assessment_id, result_id, team_member_id ou candidate_id.

### Dimensão 3 — Histórico e Retestes

- **RF-008:** A timeline de avaliações no perfil do colaborador deve exibir todos os testes realizados em ordem cronológica, com: data, nome do teste, arquétipo resultante, score geral e status da análise IA.
- **RF-009:** Ao visualizar um ponto na timeline, o sistema deve carregar o resultado daquele teste específico (scores, competências, análise IA daquela época), permitindo comparação temporal.
- **RF-010:** O sistema deve suportar agendamento de reteste com frequência configurável (3, 6, 9, 12 meses) via tabela `retest_schedules`. Quando a data do reteste chegar, o sistema deve criar automaticamente um novo convite ou notificar o gestor.
- **RF-011:** O perfil do colaborador deve exibir indicador visual de reteste pendente quando a data agendada foi ultrapassada.

### Dimensão 4 — Consumo de Créditos

- **RF-012:** Ao criar um convite de teste para colaborador, o sistema deve consumir 1 crédito da empresa em `test_credits` e registrar uma transação em `test_credit_transactions` com: `type = 'consume'`, `reference_type = 'invitation'`, `reference_id = <invitation_id>`, `description` contendo nome do colaborador e nome do teste.
- **RF-013:** Se a empresa não possui créditos suficientes, o envio deve ser bloqueado com mensagem clara e link para compra de pacote.
- **RF-014:** Se um convite for cancelado antes de ser iniciado (`status = 'sent'` ou `'viewed'`), o crédito deve ser estornado automaticamente: `type = 'refund'`, `reference_type = 'invitation_cancelled'`, `reference_id = <invitation_id>`.
- **RF-015:** O gestor deve visualizar no Hub de Testes: créditos totais, consumidos, disponíveis, e histórico de transações filtrável por período e colaborador.

### Dimensão 5 — Auditoria

- **RF-016:** Todos os eventos do fluxo de teste devem ser registrados em `test_audit_logs` com os seguintes campos: `action`, `user_id` (quem disparou), `user_name`, `resource_type`, `resource_id`, `resource_name`, `details` (JSON com contexto), `company_id`, `created_at`.
- **RF-017:** Os seguintes eventos devem ser auditados:

| action | Quando | resource_type | details esperados |
|--------|--------|---------------|-------------------|
| `invite_created` | Convite criado | invitation | canal (link/email/whatsapp), teste, colaborador |
| `invite_resent` | Convite reenviado | invitation | canal, motivo |
| `invite_cancelled` | Convite cancelado | invitation | motivo, crédito estornado |
| `invite_viewed` | Colaborador abriu o link | invitation | IP, user-agent (anonimizado) |
| `cpf_verified` | CPF verificado com sucesso | team_member | tentativas usadas |
| `cpf_failed` | CPF verificação falhou | team_member | tentativas restantes |
| `test_started` | Gauge-Pro iniciado | assessment | fase (part1/part2) |
| `test_completed` | Gauge-Pro concluído | assessment | duração, arquétipo |
| `test_abandoned` | Teste abandonado | invitation | tempo decorrido |
| `result_generated` | Resultado calculado | result | scores resumidos |
| `ai_analysis_generated` | Análise IA gerada | ai_analysis | modelo usado, tokens |
| `ai_analysis_regenerated` | Análise IA regenerada | ai_analysis | motivo, modelo |
| `credit_consumed` | Crédito consumido | credit_transaction | saldo antes/depois |
| `credit_refunded` | Crédito estornado | credit_transaction | motivo |
| `retest_scheduled` | Reteste agendado | retest_schedule | frequência, próxima data |
| `retest_triggered` | Reteste disparado automaticamente | invitation | convite criado |

- **RF-018:** A aba "Auditoria" no Hub de Testes deve exibir os logs filtráveis por: período, tipo de ação, colaborador, teste e gestor. Deve suportar paginação.

### Dimensão 6 — Métricas Agregadas

- **RF-019:** O Hub de Testes deve exibir na aba "Visão Geral" as seguintes métricas para testes corporativos (público = Colaboradores), filtráveis por período (7d, 30d, 90d, todos):

| Métrica | Cálculo |
|---------|---------|
| Total de convites | COUNT de test_invitations para testes da empresa |
| Taxa de conclusão | % de convites com status 'completed' sobre total |
| Tempo médio de resposta | AVG de (completed_at - sent_at) em dias/horas |
| Funil de conversão | Barras: Convidados → Visualizados → Iniciados → Concluídos → Analisados |
| Taxa de abandono | % de convites 'abandoned' ou 'started' sem conclusão |
| Colaboradores mapeados | COUNT de team_members com gauge_status = 'mapped' vs total |
| Créditos utilizados | SUM de test_credit_transactions type='consume' no período |
| Retestes pendentes | COUNT de retest_schedules com next_date <= hoje |

- **RF-020:** As métricas devem ser calculadas em tempo real via queries no banco (não dependendo de `platform_metrics_daily`), com cache de 5 minutos no frontend para evitar sobrecarga.
- **RF-021:** O funil de conversão deve ser visual (barras horizontais como já existe) com valores absolutos e percentuais em cada etapa.

### Dimensão 7 — Notificações de Status

- **RF-022:** Quando um colaborador conclui o teste, o sistema deve criar uma notificação in-app para todos os `company_users` da empresa com role `admin`, contendo: nome do colaborador, nome do teste, arquétipo resultante, e link para visualizar o resultado no perfil do colaborador.
- **RF-023:** Se a empresa tem integração WhatsApp configurada (Evolution API), o sistema deve enviar mensagem via WhatsApp para o gestor principal (company owner) com resumo do resultado. Deve usar template da tabela `whatsapp_templates` com categoria `informativo`.
- **RF-024:** Quando um convite está pendente há mais de 48 horas (sem `viewed_at`), o sistema deve criar notificação de lembrete para o gestor: "[Colaborador] ainda não acessou o teste. Deseja reenviar?"
- **RF-025:** Quando um reteste agendado atinge a data, o sistema deve notificar o gestor: "Reteste de [Colaborador] está pendente. Último teste realizado em [data]."

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** As queries de métricas devem responder em < 3 segundos para empresas com até 500 convites. Utilizar índices apropriados e materializar cálculos pesados se necessário.
- **RNF-002 (Consistência):** Todos os registros de auditoria devem ser criados de forma transacional com a operação principal. Se o insert do audit log falhar, a operação principal NÃO deve ser bloqueada (fail gracefully).
- **RNF-003 (Imutabilidade):** Registros de `test_audit_logs` e `test_credit_transactions` devem ser append-only. Não deve ser possível alterar ou deletar registros existentes (RLS + políticas de update negadas).
- **RNF-004 (Privacidade):** Logs de auditoria não devem armazenar CPF completo. Em eventos de `cpf_verified`/`cpf_failed`, registrar apenas "CPF verificado" ou "CPF falhou" sem os dígitos.
- **RNF-005 (Retrocompatibilidade):** Os novos campos adicionados (`invitation_id` em results, `result_id` em analyses) devem ser nullable para não quebrar dados existentes.

---

## Critérios de Aceitação

### Dimensão 1 — Ciclo de Vida

```gherkin
DADO que um convite foi enviado para o colaborador (status 'sent')
QUANDO o colaborador abre o link pela primeira vez
ENTÃO o status deve mudar para 'viewed'
  E viewed_at deve ser preenchido com timestamp atual
  E um registro de auditoria 'invite_viewed' deve ser criado
```

```gherkin
DADO que um convite está em 'started' há mais de 24 horas
QUANDO o job de detecção de abandono executa
ENTÃO o status deve mudar para 'abandoned'
  E um registro de auditoria 'test_abandoned' deve ser criado
  E uma notificação deve ser enviada ao gestor
```

### Dimensão 2 — Cadeia de Vínculos

```gherkin
DADO que um colaborador concluiu o teste Gauge-Pro
QUANDO o sistema persiste o resultado
ENTÃO test_invitations.assessment_id deve conter o UUID do assessment
  E gauge_pro_results deve conter invitation_id com o UUID do convite
  E a consulta unificada de cadeia deve retornar todos os elos a partir de qualquer ID
```

### Dimensão 4 — Créditos

```gherkin
DADO que a empresa tem 5 créditos disponíveis
QUANDO o gestor envia teste para 1 colaborador
ENTÃO 1 crédito deve ser consumido
  E test_credit_transactions deve ter registro type='consume' com reference_id do convite
  E o saldo visível no Hub deve ser 4
```

```gherkin
DADO que um convite em status 'sent' é cancelado pelo gestor
QUANDO o cancelamento é processado
ENTÃO o crédito deve ser estornado automaticamente
  E test_credit_transactions deve ter registro type='refund'
  E o saldo visível no Hub deve voltar ao valor anterior
```

### Dimensão 7 — Notificações

```gherkin
DADO que um colaborador "ANA PAULA" concluiu o teste "Avaliação Liderança"
QUANDO o resultado é gerado com arquétipo "Conselheira"
ENTÃO todos os admins da empresa devem receber notificação in-app:
  "ANA PAULA concluiu Avaliação Liderança — Arquétipo: Conselheira"
  E a notificação deve conter link para /empresa/equipes/membro/:id
```

### Cenários de Erro

```gherkin
DADO que o insert de audit log falha por qualquer motivo
QUANDO o colaborador está realizando o teste
ENTÃO o teste deve continuar normalmente
  E o erro deve ser logado no console da edge function
  E NÃO deve afetar o fluxo principal
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Migrations: novos campos, índices, views | 3-4 migrations |
| 2 | Edge functions: auditoria + créditos + vínculos | 2-3 edge functions |
| 3 | Frontend: Hub de Testes (métricas + auditoria) | 4-6 componentes |
| 4 | Frontend: Notificações + Perfil (timeline) | 3-5 componentes |
| 5 | Validação + backfill de dados legados | 1 migration + testes |

### Detalhamento das Fases

#### Fase 1: Preparação do Banco

**Objetivo:** Adicionar campos, índices e views para suportar rastreamento completo

**Ações:**
- [ ] Adicionar `invitation_id UUID REFERENCES test_invitations(id) NULL` em `gauge_pro_results`
- [ ] Adicionar `result_id UUID REFERENCES gauge_pro_results(id) NULL` em `ai_analyses`
- [ ] Criar índice em `test_audit_logs(company_id, created_at DESC)` para consultas da aba Auditoria
- [ ] Criar índice em `test_invitations(team_member_id, test_id, status)` para verificação de convite ativo
- [ ] Criar view `vw_test_tracking_chain` que retorne a cadeia completa:
  ```
  test_invitations ← gauge_pro_assessments ← gauge_pro_results ← ai_analyses
  ```
  Com campos: invitation_id, invitation_status, sent_at, viewed_at, started_at, completed_at, assessment_id, result_id, archetype, ai_analysis_status, team_member_id, candidate_id, company_id, test_name
- [ ] Criar view `vw_test_metrics_summary` com métricas pré-calculadas por empresa e período
- [ ] Alterar RLS de `test_audit_logs`: negar UPDATE e DELETE para todos os roles

**Validação:** Migrations aplicadas, views retornando dados para registros existentes (com NULLs nos novos campos), constraints ativas

#### Fase 2: Edge Functions — Auditoria, Créditos e Vínculos

**Objetivo:** Instrumentar as edge functions para registrar todos os eventos

**Ações:**
- [ ] Criar helper function `createAuditLog(supabase, params)` reutilizável nas edge functions — deve ser fire-and-forget (não bloquear fluxo principal)
- [ ] Atualizar `process-collaborator-invite`:
  - Action `get_invitation`: se primeira visualização (viewed_at NULL), setar `viewed_at` + status `viewed` + audit log `invite_viewed`
  - Action `verify_cpf`: audit log `cpf_verified` ou `cpf_failed`
  - Action `mark_started`: audit log `test_started`
  - Action `mark_completed`: setar `assessment_id` no convite + `invitation_id` no result + audit log `test_completed` + notificação para admins da empresa
- [ ] Atualizar `send-test-invitation`:
  - Action `send_invitations`: consumir crédito + registrar transação + audit log `invite_created` + `credit_consumed`
  - Action `cancel`: estornar crédito se status era `sent`/`viewed` + audit log `invite_cancelled` + `credit_refunded`
- [ ] Criar função helper para notificação: `createTestCompletionNotification(supabase, company_id, member_name, test_name, archetype, member_id)`

**Validação:** Enviar teste, completar, e verificar que toda a cadeia de eventos está registrada

#### Fase 3: Frontend — Hub de Testes (Métricas + Auditoria)

**Objetivo:** Exibir métricas e auditoria completas no Hub

**Ações:**
- [ ] Aba "Visão Geral": substituir queries atuais pela view `vw_test_metrics_summary` com filtro de período
- [ ] Exibir novas métricas: taxa de abandono, colaboradores mapeados vs total, créditos utilizados, retestes pendentes
- [ ] Funil de conversão: adicionar etapa "Analisados" após "Concluídos"
- [ ] Aba "Auditoria": implementar lista paginada de `test_audit_logs` com filtros por: período, tipo de ação, colaborador (busca por nome), teste, gestor
- [ ] Card de créditos no Hub: total, consumidos, disponíveis, link para histórico de transações
- [ ] Alerta visual quando retestes estão pendentes

**Validação:** Hub exibindo métricas reais, auditoria filtrável, créditos visíveis

#### Fase 4: Frontend — Notificações + Perfil do Colaborador

**Objetivo:** Notificar empresa e melhorar timeline no perfil

**Ações:**
- [ ] Notificação in-app ao completar teste: badge no sino, card na lista de notificações com link para perfil
- [ ] Notificação WhatsApp (se configurada): usar template `informativo` com variáveis {{nome}}, {{teste}}, {{arquetipo}}
- [ ] Notificação de lembrete (48h sem visualização): card na lista de notificações com ação "Reenviar"
- [ ] Timeline do perfil: exibir indicador de reteste pendente (badge laranja) quando `retest_schedules.next_date <= hoje`
- [ ] Timeline do perfil: ao clicar em ponto, carregar dados via `vw_test_tracking_chain` filtrando por assessment_id, exibindo resultado + análise IA daquela data específica

**Validação:** Notificações aparecendo, WhatsApp enviando (se configurado), timeline navegável com dados por data

#### Fase 5: Validação + Backfill

**Objetivo:** Garantir integridade e vincular dados legados

**Ações:**
- [ ] Backfill `invitation_id` em `gauge_pro_results` para testes concluídos que possuem `test_invitations.status = 'completed'` com match por `candidate_id` + proximidade temporal de `completed_at`
- [ ] Backfill `assessment_id` em `test_invitations` para convites `completed` com match por `candidate_id` + proximidade temporal
- [ ] Gerar relatório de integridade: % de cadeias completas vs incompletas
- [ ] Testar fluxo completo end-to-end: envio → visualização → CPF → teste → resultado → IA → notificação → auditoria → crédito
- [ ] Testar regressão: onboarding de candidatos inalterado

**Validação:** Backfill aplicado, relatório de integridade com > 90% de cadeias completas para dados recentes, fluxo E2E passando

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-087 | [Fix] Convites Duplicados, Link Indisponível e Rastreabilidade | ⏳ Pendente — **OBRIGATÓRIO** |
| PRD-088 | Redesign do Fluxo Unificado de Teste para Colaboradores | ⏳ Pendente — **OBRIGATÓRIO** (novos campos team_member_id) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Evolution API (WhatsApp) | API REST | Disponível — notificações de conclusão |
| Supabase Cron (pg_cron) | Database | A verificar — para detecção de abandono e disparo de retestes |

### Decisões Pendentes

- [ ] Confirmar se `pg_cron` está habilitado no Supabase para jobs agendados (detecção de abandono, disparo de retestes)
- [ ] Definir se notificação WhatsApp de conclusão é opt-in (empresa configura) ou default
- [ ] Definir retenção de `test_audit_logs` — manter indefinidamente ou com window de 12 meses

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Estabilização e Redesign do Fluxo de Testes para Colaboradores"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-087 | [Fix] Convites Duplicados, Link Indisponível e Rastreabilidade | ⏳ | Base |
| 2 | PRD-088 | Redesign do Fluxo Unificado de Teste para Colaboradores | ⏳ | Estrutura |
| **3** | **PRD-089** | **Rastreamento e Observabilidade Ponta a Ponta** | **🔄 ATUAL** | Depende de 043 + 044 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| CPF nos logs de auditoria | PII | NUNCA armazenar dígitos — apenas "CPF verificado" ou "CPF falhou" |
| IP do colaborador | PII | Armazenar apenas se necessário para fraude, anonimizar após 30 dias |
| Scores comportamentais | Sensível | RLS por company_id, visível apenas para empresa do colaborador |

### Autenticação e Autorização

- Audit logs: leitura permitida para `company_users` com role `admin` da empresa. UPDATE e DELETE negados para todos.
- Créditos: leitura para `admin` e `member`. Transações manuais apenas para `admin` da RecrutaRS (system admin).
- Notificações: criadas server-side, visíveis apenas para o `user_id` destinatário.

### Auditoria

A auditoria é o próprio escopo deste PRD. Os logs devem ser append-only, imutáveis, e retidos conforme política a ser definida.

---

## Fluxos de Usuário

### Fluxo Completo — Rastreamento Ponta a Ponta

```
1. Gestor envia teste para colaborador
   → test_invitations: status='sent', sent_at=now()
   → test_credit_transactions: type='consume', reference_id=invitation_id
   → test_audit_logs: action='invite_created'
   → test_audit_logs: action='credit_consumed'

2. Colaborador abre o link
   → test_invitations: status='viewed', viewed_at=now()
   → test_audit_logs: action='invite_viewed'

3. Colaborador verifica CPF
   → test_audit_logs: action='cpf_verified' (ou 'cpf_failed')

4. Colaborador inicia Gauge-Pro
   → test_invitations: status='started', started_at=now()
   → test_audit_logs: action='test_started'

5. Colaborador conclui Gauge-Pro
   → gauge_pro_assessments: INSERT com team_member_id
   → gauge_pro_results: INSERT com assessment_id + invitation_id
   → test_invitations: status='completed', completed_at=now(), assessment_id=<uuid>
   → team_members: gauge_status='mapped', archetype=<tipo>, last_test_date=now()
   → test_audit_logs: action='test_completed'

6. Análise IA gerada
   → ai_analyses: INSERT com result_id
   → test_audit_logs: action='ai_analysis_generated'

7. Notificação para empresa
   → notifications: INSERT para cada admin da empresa
   → whatsapp_messages: INSERT (se configurado)

8. Gestor visualiza resultado
   → Acessa Hub ou Perfil do Colaborador
   → Vê cadeia completa via vw_test_tracking_chain
   → Métricas atualizadas em tempo real
```

### Fluxo de Reteste

```
1. Gestor agenda reteste (6 meses)
   → retest_schedules: INSERT com next_date + frequency
   → test_audit_logs: action='retest_scheduled'

2. Data chega (job agendado ou check no acesso)
   → notifications: "Reteste de [Nome] está pendente"
   → test_audit_logs: action='retest_triggered'

3. Gestor reenvia teste
   → Fluxo de envio normal (volta ao passo 1 do fluxo principal)
   → retest_schedules: UPDATE next_date com base na frequency
```

### Fluxo de Cancelamento com Estorno

```
1. Gestor cancela convite pendente
   → test_invitations: status='expired'
   → test_credit_transactions: type='refund', reference_id=invitation_id
   → test_audit_logs: action='invite_cancelled' + 'credit_refunded'
   → Saldo de créditos restaurado
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
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **1.X.Y → 1.X+1.0** |

**Codinome sugerido:** "Lighthouse" — referência à visibilidade e observabilidade que este PRD traz ao fluxo de testes.

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Audit logs e notificações devem ser fire-and-forget. Se falharem, o teste continua. |
| **Fail gracefully** | Se a criação de notificação ou audit log falhar, logar o erro e prosseguir. |
| **Append-only** | Audit logs e credit transactions NUNCA são alterados ou deletados. |
| **Preservar dados legados** | Backfill é best-effort — dados legados podem ter cadeias incompletas e isso é aceitável. |
| **Testar incrementalmente** | Validar cada dimensão isoladamente antes de integrar. |

### Orientações Específicas

| Aspecto | Orientação |
|---------|------------|
| **Helper de auditoria** | Criar como função TypeScript reutilizável que recebe supabase client + params. Usar `Promise.allSettled` para não bloquear se falhar. |
| **View materializada** | `vw_test_tracking_chain` pode ser uma view simples inicialmente. Se performance for problema com volume, considerar materializar com refresh periódico. |
| **Notificações** | Reutilizar o padrão existente de `notifications` (172 registros existem). Para WhatsApp, reutilizar a edge function `send-whatsapp` existente. |
| **pg_cron** | Se não disponível, a detecção de abandono pode ser feita on-demand (ao consultar convites, verificar se algum está em `started` > 24h). |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Bloquear o fluxo principal se um audit log falhar |
| Armazenar CPF completo em qualquer log ou transação |
| Permitir UPDATE ou DELETE em test_audit_logs e test_credit_transactions |
| Criar tabelas novas — usar as existentes (test_audit_logs, notifications, test_credit_transactions, retest_schedules) |
| Alterar a estrutura do Gauge-Pro (perguntas, cálculos, arquétipos) |
| Implementar dashboard de analytics externo (futuro) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | Aguarda conclusão dos PRDs 043 e 044 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 19/03/2026 | v1 | Criação inicial — 7 dimensões de rastreamento baseadas em análise de dados de produção |

---

**AILA - Sistemas Inteligentes**
