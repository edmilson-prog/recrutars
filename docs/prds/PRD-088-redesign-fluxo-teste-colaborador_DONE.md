# PRD-088: Redesign do Fluxo Unificado de Teste Gauge-Pro para Colaboradores

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo Testes Comportamentais (Gauge-Pro) |
| **Repositório** | recrutars-maike (Vercel) + RecrutaRS-NovaVersao (Supabase) |
| **Objetivo** | Unificar o fluxo de envio de teste Gauge-Pro para colaboradores, centralizando no Hub de Testes com a segurança e contexto da Gestão de Equipes |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Estabilização e Redesign do Fluxo de Testes para Colaboradores |
| **PRDs Relacionados** | PRD-087-fix (pré-requisito), PRD-008 (DISC), PRD-035-ia (transparência matching) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | ✅ 5+ arquivos, múltiplas integrações (frontend + edge functions + banco), regras de negócio complexas (dois perfis de usuário com jornadas inversas) |

---

## Contexto do Problema

Atualmente existem **dois caminhos paralelos** para enviar teste Gauge-Pro para colaboradores de empresas, e nenhum funciona de forma completa.

O **Hub de Testes** (`/empresa/testes`) oferece boa gestão operacional — criação de testes com templates, funil de conversão, métricas — mas o envio era genérico e inseguro (link público sem verificação de identidade). O **Perfil do Colaborador** (`/empresa/equipes/membro/:id`) trouxe segurança (verificação CPF, pré-cadastro obrigatório), mas ao embutir a lógica de envio dentro do detalhamento, misturou gestão de testes com visualização de resultados.

O resultado é uma arquitetura onde: o frontend tem lógica de criação de convites espalhada em dois componentes diferentes; as edge functions `send-test-invitation` e `process-collaborator-invite` têm responsabilidades sobrepostas; o `gauge_pro_assessments` exige `candidate_id`, forçando a criação de "candidatos fantasma" com `visibility_locked: true` para cada colaborador.

Adicionalmente, as jornadas de **candidato** e **colaborador** são fundamentalmente inversas: o candidato faz o teste como etapa final do onboarding (após preencher dados); o colaborador faz o teste como ponto de entrada (dados já pré-cadastrados pela empresa). Esta diferença precisa ser refletida na arquitetura.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
CAMINHO 1 — Hub de Testes (/empresa/testes)
Empresa → Criar Teste → Escolher Template → Enviar convite (email/link público/da base)
  → Colaborador acessa link genérico → Pede nome + email → Cria candidato → Gauge-Pro
  → Resultado vinculado a candidate_id

CAMINHO 2 — Perfil do Colaborador (/empresa/equipes/membro/:id)  
Empresa → Pré-cadastro → Botão "Enviar Teste Comportamental" → Modal com link/email/WhatsApp
  → Colaborador acessa link → Verifica CPF (3 dígitos) → Cria candidato shadow → Gauge-Pro
  → Resultado sincronizado para team_member (gauge_status, archetype)

PROBLEMAS:
- Dois caminhos com lógicas diferentes
- Convites duplicados por bug no modal
- gauge_pro_assessments exige candidate_id → candidato fantasma obrigatório
- Links quebrados
- assessment_id não rastreado
```

### Situação Desejada (To-Be)

```
FLUXO ÚNICO — Hub de Testes como centro operacional

1. CRIAÇÃO DO TESTE (Hub de Testes)
   Empresa → Criar Teste → Escolher Template + Pesos → Definir público-alvo:
     [Candidatos Externos] ou [Colaboradores da Equipe]

2. ENVIO (Hub de Testes → aba Convites)
   Se público = Colaboradores:
     → Selecionar da base de team_members (já pré-cadastrados)
     → Enviar via Link Único / Email / WhatsApp
     → 1 convite ativo por colaborador por teste (deduplicação)
     → Consumir crédito de teste

3. REALIZAÇÃO DO TESTE (Colaborador)
   Colaborador abre link → Verificação CPF (3 dígitos) → Gauge-Pro
     → Ao final: coleta dados complementares faltantes
     → Resultado vinculado diretamente a team_member_id (sem candidato fantasma)

4. VISUALIZAÇÃO (Perfil do Colaborador → somente leitura)
   Timeline de avaliações → Clica em data → Vê resultado daquele teste
   Aba IA → Análises geradas por IA
   Plano de Desenvolvimento → Acompanhamento
   Botão "Enviar Teste" → ATALHO que redireciona para o Hub com colaborador pré-selecionado

5. RETESTE (Hub de Testes)
   Agendamento de reteste periódico (3/6/9/12 meses)
   Novo convite criado automaticamente quando reteste agendado vence
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Manter dois caminhos e sincronizar | Complexidade dobrada, bugs recorrentes, difícil manter consistência |
| Mover tudo para o Perfil do Colaborador | Perde a gestão centralizada, métricas, funil de conversão, templates |
| Criar módulo completamente novo | Desperdício do que já funciona bem no Hub de Testes |

---

## Escopo

### Incluído

- ✅ Hub de Testes como ponto único de envio para candidatos E colaboradores
- ✅ Distinção de público-alvo na criação/envio do teste
- ✅ Seleção de colaboradores da base de `team_members` no envio
- ✅ Verificação CPF mantida no fluxo do colaborador
- ✅ Adição de `team_member_id` nullable em `gauge_pro_assessments` e `gauge_pro_results`
- ✅ Eliminação da criação de candidato fantasma para colaboradores
- ✅ Perfil do Colaborador como visualização somente-leitura (timeline, IA, desenvolvimento)
- ✅ Botão "Enviar Teste" no perfil como atalho para o Hub
- ✅ Controle de 1 convite ativo por colaborador por teste
- ✅ Edge function unificada para envio de convites

### Excluído

- ❌ Alteração do fluxo de onboarding de candidatos (funciona bem como está)
- ❌ Criação de plano/pacote separado para testes corporativos (decisão de negócio futura)
- ❌ Migração retroativa de candidatos fantasma existentes (fase futura)
- ❌ Redesign visual do Hub de Testes (apenas ajustes funcionais)

---

## Requisitos Funcionais

### Hub de Testes — Criação

- **RF-001:** Na aba "Criar Teste", o sistema deve permitir definir o público-alvo: "Candidatos Externos" ou "Colaboradores da Equipe". O público-alvo deve ser salvo no campo `target_audience` da tabela `company_tests`.
- **RF-002:** Se público-alvo = "Colaboradores", o sistema deve desabilitar o método "Link Público" e habilitar "Selecionar da Equipe" como método primário.

### Hub de Testes — Envio de Convites

- **RF-003:** Na aba "Convites", quando o teste tem público-alvo = "Colaboradores", o sistema deve exibir um seletor de colaboradores baseado na tabela `team_members` da empresa, filtrável por departamento e status de mapeamento.
- **RF-004:** O sistema deve verificar se já existe convite ativo (`status IN ('sent', 'viewed', 'started')`) para o `team_member_id` + `test_id`. Se existir, deve oferecer "Reenviar" em vez de criar novo convite.
- **RF-005:** O envio deve consumir um crédito de teste (`test_credits`) por colaborador convidado.
- **RF-006:** O convite deve ser enviável por 3 canais: Link Único, Email e WhatsApp (via Evolution API).
- **RF-007:** O sistema deve gerar o token do convite e persistir no banco ANTES de exibir a URL ao usuário.

### Fluxo do Colaborador — Realização

- **RF-008:** Ao acessar o link de convite, se o convite possui `team_member_id`, o sistema deve exibir tela de verificação CPF (3 últimos dígitos), sem pedir nome/email.
- **RF-009:** Após verificação CPF, o sistema deve iniciar o Gauge-Pro vinculado ao `team_member_id` — SEM criar registro em `candidates`.
- **RF-010:** O `gauge_pro_assessments` deve aceitar `team_member_id` como alternativa a `candidate_id`. Pelo menos um deve estar preenchido.
- **RF-011:** Ao finalizar o teste, o sistema deve atualizar `team_members` (gauge_status, archetype, gauge_scores, last_test_date) e preencher `test_invitations.assessment_id`.
- **RF-012:** Após o teste, se o colaborador não possui dados complementares (telefone, LinkedIn, etc.), o sistema deve oferecer tela opcional de complemento de dados.

### Perfil do Colaborador — Visualização

- **RF-013:** O botão "Enviar Teste Comportamental" no perfil do colaborador deve redirecionar para o Hub de Testes com o colaborador pré-selecionado no seletor de convites, em vez de abrir modal próprio.
- **RF-014:** A timeline de avaliações deve exibir dados vindos de `gauge_pro_assessments` filtrados por `team_member_id`, com links para visualizar cada resultado.
- **RF-015:** A aba IA deve exibir análises vinculadas aos assessments do colaborador via `team_member_id`.

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O seletor de colaboradores deve carregar em < 2 segundos para equipes de até 200 membros.
- **RNF-002 (Segurança):** A verificação CPF deve permanecer obrigatória para convites com `team_member_id`. O CPF nunca deve ser exibido completo — máscara `***.XXX.XXX-**`.
- **RNF-003 (Integridade):** Cada colaborador deve ter no máximo 1 convite ativo por teste. Constraint no banco: `UNIQUE(team_member_id, test_id) WHERE status IN ('sent', 'viewed', 'started')`.
- **RNF-004 (Compatibilidade):** O fluxo de onboarding de candidatos não deve ser alterado em nenhum aspecto.
- **RNF-005 (Auditoria):** Todas as ações de envio, reenvio, conclusão e cancelamento devem ser registradas em `test_audit_logs`.

---

## Critérios de Aceitação

### RF-003: Seletor de Colaboradores

```gherkin
DADO que o gestor está na aba "Convites" de um teste com público-alvo "Colaboradores"
QUANDO o gestor abre o seletor de colaboradores
ENTÃO deve ver a lista de team_members da empresa
  E deve poder filtrar por departamento
  E deve ver o status de mapeamento de cada colaborador (mapeado/sem teste/convidado)
```

### RF-004: Deduplicação de Convites

```gherkin
DADO que o colaborador "GUIDO ALMEIDA" já possui um convite pendente para o teste atual
QUANDO o gestor tenta enviar novo convite para o Guido
ENTÃO o sistema deve exibir aviso "Convite ativo existente"
  E oferecer opção "Reenviar" que atualiza o convite existente
  E NÃO criar novo registro em test_invitations
```

### RF-009: Gauge-Pro sem candidato fantasma

```gherkin
DADO que um colaborador completou o Gauge-Pro via link de convite corporativo
QUANDO o sistema persiste o resultado
ENTÃO o gauge_pro_assessments deve conter team_member_id preenchido
  E candidate_id deve ser NULL
  E NÃO deve existir novo registro na tabela candidates
```

### RF-013: Botão como atalho

```gherkin
DADO que o gestor está no perfil do colaborador (/empresa/equipes/membro/:id)
QUANDO clica no botão "Enviar Teste Comportamental"
ENTÃO deve ser redirecionado para /empresa/testes com o colaborador pré-selecionado
  E NÃO deve abrir modal local
  E NENHUM convite deve ser criado neste momento
```

### Cenários de Erro

```gherkin
DADO que a empresa possui 0 créditos de teste disponíveis
QUANDO o gestor tenta enviar convite para um colaborador
ENTÃO o sistema deve exibir mensagem "Sem créditos disponíveis"
  E oferecer link para compra de pacote
  E NÃO criar o convite
```

```gherkin
DADO que o colaborador não possui CPF cadastrado no pré-cadastro
QUANDO o link de convite é acessado
ENTÃO o sistema deve exibir tela de identificação com nome + CPF completo
  E salvar o CPF no team_member para verificações futuras
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Preparação do banco (migrations) | 2-3 migrations |
| 2 | Edge function unificada | 1-2 edge functions |
| 3 | Frontend — Hub de Testes (seletor + envio) | 5-8 componentes |
| 4 | Frontend — Perfil do Colaborador (simplificação) | 3-5 componentes |
| 5 | Validação, testes e limpeza | 1 migration de dados |

### Detalhamento das Fases

#### Fase 1: Preparação do Banco

**Objetivo:** Adequar o schema para suportar `team_member_id` direto no Gauge-Pro

**Ações:**
- [ ] Adicionar coluna `target_audience TEXT DEFAULT 'candidate' CHECK (target_audience IN ('candidate', 'collaborator'))` em `company_tests`
- [ ] Adicionar coluna `team_member_id UUID REFERENCES team_members(id) NULL` em `gauge_pro_assessments`
- [ ] Adicionar coluna `team_member_id UUID REFERENCES team_members(id) NULL` em `gauge_pro_results`
- [ ] Alterar constraint de `gauge_pro_assessments`: `CHECK (candidate_id IS NOT NULL OR team_member_id IS NOT NULL)`
- [ ] Alterar constraint de `gauge_pro_results`: `CHECK (candidate_id IS NOT NULL OR team_member_id IS NOT NULL)`
- [ ] Criar índice parcial único: `CREATE UNIQUE INDEX idx_active_invite_per_member ON test_invitations(team_member_id, test_id) WHERE status IN ('sent', 'viewed', 'started') AND team_member_id IS NOT NULL`
- [ ] Ajustar RLS policies para permitir leitura de assessments por `team_member_id`

**Validação:** Migrations aplicadas, constraints ativas, dados existentes inalterados

#### Fase 2: Edge Function Unificada

**Objetivo:** Centralizar lógica de envio de convite e conclusão em edge functions coerentes

**Ações:**
- [ ] Atualizar `send-test-invitation` para aceitar `team_member_id` e verificar convite ativo antes de criar novo
- [ ] Atualizar `process-collaborator-invite` (action `mark_completed`) para aceitar `team_member_id` direto — criar `gauge_pro_assessment` com `team_member_id` em vez de `candidate_id` quando for convite corporativo
- [ ] Atualizar `process-collaborator-invite` (action `verify_cpf`) para NÃO criar candidato shadow — apenas verificar CPF e retornar confirmação
- [ ] Manter backward compatibility: convites antigos com `candidate_id` devem continuar funcionando

**Validação:** Edge functions deployadas, testadas com convites novos e antigos

#### Fase 3: Frontend — Hub de Testes

**Objetivo:** Adicionar seletor de colaboradores e distinção de público-alvo

**Ações:**
- [ ] Na aba "Criar Teste" (stepper etapa 3 — Detalhes): adicionar campo "Público-alvo" com opções Candidatos/Colaboradores
- [ ] Na aba "Convites": se teste tem `target_audience = 'collaborator'`, exibir seletor de colaboradores (lista de `team_members` com filtros por departamento e status)
- [ ] Substituir input de email por seletor de membros quando público = Colaboradores
- [ ] Implementar verificação de convite ativo antes de enviar (exibir "Reenviar" se existir)
- [ ] Implementar verificação de créditos antes de enviar
- [ ] Garantir que o token é gerado e persistido ANTES de exibir URL

**Validação:** Fluxo completo: criar teste corporativo → enviar para colaborador → colaborador recebe link

#### Fase 4: Frontend — Perfil do Colaborador

**Objetivo:** Simplificar para somente-leitura + atalho

**Ações:**
- [ ] Remover o modal de envio de teste do componente do perfil do colaborador
- [ ] Botão "Enviar Teste Comportamental" → redirecionar para `/empresa/testes?tab=convites&member=:id`
- [ ] Timeline de avaliações: alterar query para buscar `gauge_pro_assessments` por `team_member_id` (com fallback para `candidate_id` via `imported_from_candidate_id` para dados legados)
- [ ] Aba IA: alterar query para buscar análises por `team_member_id` (com fallback legado)
- [ ] Manter "Agendar Reteste" funcionando via Hub

**Validação:** Perfil exibe dados existentes corretamente, botão redireciona para Hub

#### Fase 5: Validação e Limpeza

**Objetivo:** Garantir integridade e migrar dados legados

**Ações:**
- [ ] Testar fluxo completo end-to-end: criar teste → enviar para colaborador → colaborador faz teste → resultado aparece no perfil
- [ ] Testar regressão: onboarding de candidato inalterado
- [ ] Testar regressão: Hub de Testes para candidatos externos inalterado
- [ ] Backfill `team_member_id` em `gauge_pro_assessments` e `gauge_pro_results` existentes quando possível (via `team_members.imported_from_candidate_id`)
- [ ] Documentar mapeamento legado para consultas futuras

**Validação:** Todos os cenários de aceitação passando, dados legados acessíveis

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-087 | [Fix] Convites Duplicados, Link Indisponível e Rastreabilidade | ⏳ Pendente — **OBRIGATÓRIO antes deste PRD** |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Evolution API (WhatsApp) | API REST | Disponível — já integrada via `send-whatsapp` edge function |
| Stripe (créditos) | Webhook/API | Disponível — já integrado |

### Decisões Pendentes

- [ ] Definir se colaboradores que já foram criados como candidatos fantasma devem ser migrados retroativamente (sugestão: fazer em PRD separado)
- [ ] Definir se a análise de IA para colaboradores deve usar o mesmo modelo/prompt dos candidatos ou um prompt específico para desenvolvimento de equipe

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Estabilização e Redesign do Fluxo de Testes para Colaboradores"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-087 | [Fix] Convites Duplicados, Link Indisponível e Rastreabilidade | ⏳ | Base — corrige bugs em produção |
| **2** | **PRD-088** | **Redesign do Fluxo Unificado de Teste para Colaboradores** | **🔄 ATUAL** | Depende de PRD-087 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| CPF do colaborador | PII | Armazenado criptografado, exibido mascarado (`***.XXX.XXX-**`), verificação por 3 últimos dígitos |
| Email do colaborador | PII | Visível apenas para gestores da empresa (RLS) |
| Resultados Gauge-Pro | Sensível | RLS por `company_id`, visível apenas para a empresa do colaborador |

### Autenticação e Autorização

O colaborador NÃO precisa ter conta na plataforma para fazer o teste. A verificação é feita por CPF (pré-cadastrado pela empresa). Após o teste, o resultado fica vinculado ao `team_member_id` sem criar auth user.

O gestor da empresa deve ser `company_user` com role `admin` ou `member` para enviar testes.

### Auditoria

Todas as ações registradas em `test_audit_logs`: envio de convite, reenvio, verificação CPF, início do teste, conclusão, cancelamento. Cada registro inclui `user_id`, `company_id`, `resource_type`, `resource_id` e `details`.

---

## Fluxos de Usuário

### Fluxo Principal — Envio de Teste para Colaborador

```
Gestor ──▶ Hub de Testes ──▶ Criar Teste (template + público = Colaboradores)
  ──▶ Aba Convites ──▶ Selecionar colaborador da equipe
  ──▶ Escolher canal (Link/Email/WhatsApp) ──▶ Enviar
  ──▶ Sistema verifica créditos + convite existente ──▶ Cria convite
  ──▶ Exibe URL com token persistido
```

### Fluxo Principal — Realização do Teste pelo Colaborador

```
Colaborador ──▶ Abre link (/convite/teste/:token)
  ──▶ Sistema detecta team_member_id ──▶ Tela CPF (3 dígitos)
  ──▶ CPF verificado ──▶ Gauge-Pro Parte 1 (adjetivos) ──▶ Parte 2 (situacional)
  ──▶ Resultado calculado ──▶ Salvo em gauge_pro_assessments (team_member_id)
  ──▶ team_member atualizado (gauge_status, archetype, scores)
  ──▶ Tela de resultado + opção de completar dados
```

### Fluxo do Atalho — Perfil do Colaborador

```
Gestor ──▶ Perfil do Colaborador (/empresa/equipes/membro/:id)
  ──▶ Clica "Enviar Teste Comportamental"
  ──▶ Redireciona para /empresa/testes?tab=convites&member=:id
  ──▶ Hub abre com colaborador pré-selecionado no seletor
```

### Fluxos de Exceção

- **Colaborador sem CPF:** Exibir tela de identificação com campo para CPF completo + nome. Salvar CPF no `team_member`.
- **Convite ativo existente:** Exibir aviso + opção "Reenviar" (atualiza `sent_at`, regenera token).
- **Sem créditos:** Exibir mensagem + link para compra de pacote.

### Fluxos de Erro

- **CPF não confere:** Exibir "CPF não confere. Verifique os dígitos." Permitir até 3 tentativas.
- **Link expirado:** Exibir "Convite expirado. Solicite novo à sua empresa."
- **Edge function falha:** Exibir mensagem genérica + sugerir tentar novamente.

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
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-088-redesign-fluxo-teste-colaborador_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **1.X.Y → 1.X+1.0** |

**Codinome sugerido:** "Sentinel" — referência à unificação e segurança do fluxo de testes corporativos.

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | O onboarding de candidatos NÃO deve ser alterado |
| **Backward compatibility** | Convites antigos (com `candidate_id`) devem continuar funcionando |
| **Fail gracefully** | Se verificação CPF falhar, oferecer alternativa (nome + email) |
| **Preservar evidências** | Dados legados (candidatos fantasma) devem ser mantidos, apenas novos convites usam o novo fluxo |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |

### Orientações Específicas

| Aspecto | Orientação |
|---------|------------|
| **Migrations** | A adição de `team_member_id` em `gauge_pro_assessments` deve ser nullable para não quebrar dados existentes. O CHECK constraint deve ser `candidate_id IS NOT NULL OR team_member_id IS NOT NULL`. |
| **Edge Functions** | Não criar edge functions novas — atualizar `send-test-invitation` e `process-collaborator-invite`. Manter actions existentes funcionando. |
| **Frontend** | O seletor de colaboradores no Hub pode reutilizar o componente de lista de `team_members` que já existe em `/empresa/equipes`. |
| **Perfil do Colaborador** | A remoção do modal é a parte mais sensível — garantir que o botão de atalho funciona antes de remover o modal. |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Alterar o fluxo de onboarding de candidatos |
| Deletar dados de candidatos fantasma existentes (migração futura) |
| Criar novas edge functions — reutilizar as existentes |
| Alterar a estrutura do Gauge-Pro em si (perguntas, cálculo de scores, arquétipos) |
| Implementar plano/pacote separado para testes corporativos (decisão de negócio pendente) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 19/03/2026 |
| **Versão do App** | v1.42.0 "Sentinel" |
| **Implementado por** | Claude Opus 4.6 via Claude Code |
| **Observações** | Bloco 1 (DB + Edge) e Bloco 2 (Frontend) implementados. Migration 063 aplicada, edge function deployada. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 19/03/2026 | v1 | Criação inicial — baseado em análise de código, banco e UX atual |
| 19/03/2026 | v2 | Implementação concluída — v1.42.0 "Sentinel" |

---

**AILA - Sistemas Inteligentes**
