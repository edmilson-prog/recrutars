# PRD-087: [Fix] Convites Duplicados, Link Indisponível e Rastreabilidade no Gauge-Pro Corporativo

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Módulo Testes Comportamentais (Gauge-Pro) |
| **Repositório** | recrutars-maike (Vercel) + RecrutaRS-NovaVersao (Supabase) |
| **Objetivo** | Corrigir: convites duplicados a cada abertura de modal, links indisponíveis (Edge Function non-2xx), e `assessment_id` NULL em `test_invitations` |
| **Tipo** | Correção |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Crítica |
| **Severidade** | Alta |
| **Épico** | Estabilização do Fluxo de Testes para Colaboradores |
| **PRDs Relacionados** | PRD-088-redesign-fluxo-teste-colaborador (depende desta correção) |

### Critérios de Prioridade

| Prioridade | Critérios |
|------------|-----------|
| **Crítica** | ✅ Funcionalidade principal quebrada em produção, dados inconsistentes no banco, UX degradada para empresas clientes |

---

## Descrição do Bug

### Comportamento Atual (Errado)

**Bug 1 — Convites Duplicados:**
Cada vez que o usuário abre o modal "Enviar Teste Comportamental" no perfil do colaborador (`/empresa/equipes/membro/:id`), um novo UUID de token é gerado via `useState` + `crypto.randomUUID()`. Ao clicar "Enviar Convite", um novo registro é inserido em `test_invitations`, sem verificar se já existe convite pendente para aquele `team_member_id` + `test_id`. Caso de produção: colaborador "GUIDO ALMEIDA" possui **17 convites** (11 pendentes, 6 concluídos) para o mesmo teste.

**Bug 2 — Link Indisponível (Edge Function non-2xx):**
Ao acessar o link de convite (`/convite/teste/:token`), a tela exibe "Link indisponível — Edge Function returned a non-2xx status code". A causa provável: o token UUID é gerado no frontend e usado para montar a URL imediatamente, mas o insert no banco pode falhar silenciosamente (constraint de token duplicado, race condition, ou expiração da sessão), resultando em um token que não existe no banco quando a edge function `process-collaborator-invite` tenta buscá-lo.

**Bug 3 — `assessment_id` NULL:**
A edge function `process-collaborator-invite` (action `mark_completed`) cria um novo `gauge_pro_assessment` e `gauge_pro_results`, mas **nunca faz o UPDATE** de volta em `test_invitations.assessment_id`. Todos os convites de colaboradores possuem `assessment_id = NULL`, quebrando a rastreabilidade convite → assessment → resultado.

### Comportamento Esperado (Correto)

**Bug 1:** O sistema deve verificar se já existe convite pendente (`status IN ('sent', 'viewed')`) para o `team_member_id` + `test_id` antes de criar um novo. Se existir, deve reutilizar o convite existente (atualizando `sent_at` e regenerando token se necessário). O UUID do token deve ser gerado apenas no momento do envio efetivo, não na abertura do modal.

**Bug 2:** O link de convite deve funcionar consistentemente. O convite deve estar persistido no banco ANTES de montar e exibir a URL ao usuário. Se o insert falhar, exibir erro no modal em vez de gerar uma URL quebrada.

**Bug 3:** Após criar o `gauge_pro_assessment` na action `mark_completed`, a edge function deve fazer um `UPDATE` em `test_invitations` setando o `assessment_id` do assessment recém-criado.

### Passos para Reproduzir

**Bug 1:**
1. Acessar `/empresa/equipes/membro/:id` de qualquer colaborador
2. Clicar no botão "Enviar Teste Comportamental" no topo
3. Observar a URL do link único no modal — contém um UUID
4. Fechar o modal sem enviar
5. Reabrir o modal — o UUID mudou
6. Clicar "Enviar Convite"
7. Repetir passos 2-6 múltiplas vezes
8. **Resultado:** Múltiplos registros em `test_invitations` para o mesmo colaborador/teste

**Bug 2:**
1. Abrir o modal de envio de teste no perfil do colaborador
2. Copiar o link único exibido
3. Abrir o link em navegador anônimo
4. **Resultado:** Tela "Link indisponível — Edge Function returned a non-2xx status code"

**Bug 3:**
1. Colaborador completa o teste via link de convite
2. Consultar `test_invitations` no banco filtrando pelo colaborador
3. **Resultado:** Campo `assessment_id` está NULL em todos os registros

### Evidências

| Tipo | Descrição |
|------|-----------|
| Screenshot | Modal com link único — UUID muda a cada abertura |
| Screenshot | Tela "Link indisponível" ao acessar convite |
| Query SQL | `SELECT COUNT(*) FROM test_invitations WHERE candidate_email = 'cpd@tauramate.com'` → 17 registros, 11 pendentes |
| Query SQL | `SELECT assessment_id FROM test_invitations WHERE team_member_id IS NOT NULL` → todos NULL |

---

## Análise da Causa Raiz

### Bug 1 — Convites Duplicados

**Causa:** O componente React do modal de envio executa `crypto.randomUUID()` no `useState` initializer, gerando um novo token a cada mount. O insert é feito diretamente pelo frontend no Supabase (não pela edge function `send-test-invitation`), sem nenhuma verificação de convite existente.

**Trecho relevante no bundle:**
```
[d,u]=A.useState(!1),[h,f]=A.useState(!1),[m,g]=A.useState(()=>crypto.randomUUID())
```

**Componentes Envolvidos:**
- Frontend: componente do modal "Enviar Teste Comportamental" no perfil do colaborador
- Edge function: `send-test-invitation` — não é usada nesse fluxo; o insert é direto
- Tabela: `test_invitations`

### Bug 2 — Link Indisponível

**Causa:** O token é gerado no frontend e a URL é exibida ao usuário ANTES de confirmar que o insert no banco foi bem-sucedido. Se o insert falhar (ou se o usuário copiar o link antes de clicar "Enviar"), a URL aponta para um token inexistente. A edge function `process-collaborator-invite` retorna 404 com "Convite não encontrado", que o frontend exibe como "Link indisponível".

**Componentes Envolvidos:**
- Frontend: componente do modal — exibe URL antes da persistência
- Edge function: `process-collaborator-invite` (action `get_invitation`)

### Bug 3 — `assessment_id` NULL

**Causa:** Na edge function `process-collaborator-invite`, a action `mark_completed` cria o `gauge_pro_assessment` e `gauge_pro_results` com insert, mas não faz update no `test_invitations.assessment_id`.

**Trecho relevante na edge function (`process-collaborator-invite` linha ~mark_completed):**
```typescript
// Cria assessment — OK
const { data: assessmentRows } = await supabase
  .from('gauge_pro_assessments')
  .insert({ candidate_id: result_data.candidate_id, phase: 'completed', ... })
  .select('id');

// Cria result — OK  
await supabase.from('gauge_pro_results').insert({ assessment_id: assessmentId, ... });

// ❌ FALTANDO: update de test_invitations.assessment_id
```

### Investigação Necessária

- [ ] Confirmar se o frontend faz insert direto no Supabase ou se usa edge function para convites de colaboradores
- [ ] Verificar se existem constraints no banco que possam causar falha silenciosa do insert (token unique, RLS)
- [ ] Verificar se o `assessment_id` no `test_invitations` tem FK constraint ou é apenas text/uuid nullable

---

## Escopo da Correção

### Incluído

- ✅ Verificação de convite pendente antes de criar novo (deduplicação)
- ✅ Geração do token apenas no momento do envio efetivo (não na abertura do modal)
- ✅ Feedback de erro no modal se insert falhar
- ✅ Update de `test_invitations.assessment_id` na action `mark_completed`
- ✅ Limpeza dos convites órfãos no banco (migration de dados)

### Excluído

- ❌ Redesign do fluxo de envio (será tratado no PRD-088)
- ❌ Eliminação do candidato fantasma (será tratado no PRD-088)
- ❌ Unificação dos caminhos Hub/Equipes (será tratado no PRD-088)
- ❌ Refatoração da edge function `send-test-invitation`

---

## Impacto da Correção

### Usuários Afetados

| Grupo | Quantidade Estimada | Impacto |
|-------|---------------------|---------|
| Empresas usando Gestão de Equipes | Todas as empresas ativas (2+) | Não conseguem enviar testes confiáveis para colaboradores |
| Colaboradores recebendo testes | 8 team_members ativos | Links quebrados, experiência degradada |

### Funcionalidades Relacionadas

| Funcionalidade | Risco de Regressão |
|----------------|-------------------|
| Gauge-Pro do onboarding de candidatos | Baixo — fluxo diferente, não usa modal de envio |
| Hub de Testes (`/empresa/testes`) | Médio — usa `send-test-invitation` edge function (diferente) |
| Perfil do Colaborador — timeline | Baixo — apenas leitura |
| Sistema de créditos de teste | Baixo — consumo ocorre após o teste, não no envio |

---

## Plano de Correção

### Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|--------------------|
| 1 | Investigação: confirmar causa raiz no código-fonte | 0 |
| 2 | Correção da edge function + lógica do frontend | 3-5 |
| 3 | Limpeza de dados + validação | 1 migration |

### Detalhamento

#### Fase 1: Investigação

**Objetivo:** Confirmar a causa raiz no código-fonte antes de alterar

**Ações:**
- [ ] Localizar o componente React do modal "Enviar Teste Comportamental" — verificar onde o UUID é gerado e como o insert é feito
- [ ] Confirmar se o insert é direto (Supabase client) ou via edge function
- [ ] Verificar RLS policies na tabela `test_invitations` que possam bloquear inserts
- [ ] Verificar constraints de unicidade no campo `token`
- [ ] Confirmar que `test_invitations.assessment_id` é UUID nullable sem FK

**Validação:** Causa raiz de cada bug confirmada com evidência no código

#### Fase 2: Correção

**Objetivo:** Implementar as três correções

**Ações:**

**Bug 1 — Convites Duplicados (Frontend):**
- [ ] Remover geração de UUID do `useState` initializer
- [ ] Antes de criar convite, consultar `test_invitations` para verificar se já existe convite `sent` ou `viewed` para o mesmo `team_member_id`
- [ ] Se existir convite pendente: reutilizar (opção "Reenviar" — update de `sent_at`, regenerar token)
- [ ] Se não existir: gerar UUID e fazer insert apenas ao clicar "Enviar Convite"
- [ ] Exibir URL somente APÓS confirmação de insert bem-sucedido

**Bug 2 — Link Indisponível (Frontend + UX):**
- [ ] Garantir que a URL do link único é exibida apenas após o insert retornar sucesso
- [ ] Se insert falhar, exibir toast de erro no modal em vez de URL quebrada
- [ ] Adicionar estado de loading no botão "Enviar Convite" durante o insert

**Bug 3 — `assessment_id` NULL (Edge Function):**
- [ ] Na edge function `process-collaborator-invite`, action `mark_completed`, após criar o `gauge_pro_assessment`, fazer:
  ```
  UPDATE test_invitations 
  SET assessment_id = <novo_assessment_id>
  WHERE id = <invitation_id>
  ```
- [ ] Adicionar log de confirmação do update

**Validação:** Testar os 3 cenários reproduzíveis e confirmar que estão corrigidos

#### Fase 3: Limpeza de Dados

**Objetivo:** Limpar convites e assessments órfãos no banco

**Ações:**
- [ ] Criar migration para marcar como `expired` todos os convites `sent` que são duplicatas (manter apenas o mais recente por `team_member_id` + `test_id`)
- [ ] Backfill `assessment_id` nos convites `completed` que possuem `team_member_id` — vincular ao assessment mais recente do candidato associado
- [ ] Gerar relatório de dados antes/depois para validação

**Validação:** Consultar `test_invitations` e confirmar que cada colaborador tem no máximo 1 convite `sent` por teste

---

## Critérios de Aceitação

### Bug 1: Convites Duplicados

```gherkin
DADO que o colaborador "GUIDO ALMEIDA" já possui um convite pendente para o teste "Teste Criativo Magenta"
QUANDO o gestor abre o modal "Enviar Teste Comportamental" no perfil do Guido
ENTÃO o sistema deve detectar o convite existente
  E exibir a opção "Reenviar" em vez de criar um novo convite
  E NÃO criar um novo registro em test_invitations
```

```gherkin
DADO que o gestor abre o modal de envio de teste
QUANDO o gestor fecha o modal SEM clicar "Enviar"
ENTÃO NENHUM registro deve ser criado em test_invitations
```

### Bug 2: Link Indisponível

```gherkin
DADO que o gestor clicou "Enviar Convite" no modal
QUANDO o insert no banco é bem-sucedido
ENTÃO a URL do link é exibida com o token persistido
  E o link funciona ao ser aberto em outro navegador
```

```gherkin
DADO que o gestor clicou "Enviar Convite" no modal
QUANDO o insert no banco falha por qualquer motivo
ENTÃO NENHUMA URL é exibida
  E uma mensagem de erro é exibida ao gestor
```

### Bug 3: `assessment_id` NULL

```gherkin
DADO que um colaborador completou o teste Gauge-Pro via link de convite
QUANDO a edge function process-collaborator-invite executa mark_completed
ENTÃO o campo assessment_id do registro em test_invitations deve conter o UUID do gauge_pro_assessment criado
```

### Sem Regressão

```gherkin
DADO que um candidato está fazendo o onboarding normal (não é colaborador)
QUANDO o candidato completa o Gauge-Pro
ENTÃO o fluxo de onboarding deve funcionar normalmente sem alterações
```

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Estabilização e Redesign do Fluxo de Testes para Colaboradores"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| **1** | **PRD-087** | **[Fix] Convites Duplicados, Link Indisponível e Rastreabilidade** | **🔄 ATUAL** | Base — corrige bugs em produção |
| 2 | PRD-088 | Redesign do Fluxo Unificado de Teste para Colaboradores | ⏳ | Depende de PRD-087 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Testes de Regressão

| Cenário | Resultado Esperado | Prioridade |
|---------|-------------------|------------|
| Abrir e fechar modal de envio sem enviar | Nenhum convite criado no banco | Alta |
| Enviar teste para colaborador com convite pendente | Reutilizar convite existente | Alta |
| Enviar teste para colaborador sem convite pendente | Criar novo convite, link funcional | Alta |
| Colaborador abre link e completa teste | `assessment_id` preenchido no convite | Alta |
| Candidato faz onboarding normal | Fluxo inalterado | Média |
| Hub de Testes — enviar convite por email | Fluxo inalterado | Média |
| Sistema de créditos — consumo após teste | Continua funcionando | Média |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. INVESTIGAÇÃO OBRIGATÓRIA:**
> - Confirme a causa raiz ANTES de alterar código
> - Reproduza o bug localmente
> - Identifique TODOS os pontos que podem ser afetados

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **PATCH +1** para correções
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — usar tipo **Fixed**
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| **Correção de bug** | **PATCH +1** | **1.X.Y → 1.X.Y+1** |

**Codinomes:** PATCH mantém o codinome da versão MINOR atual. Não gerar novo codinome para correções.

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Mínima alteração** | Alterar apenas o necessário para corrigir os 3 bugs |
| **Não adicionar features** | Correção não é momento de redesenhar o fluxo (isso é PRD-088) |
| **Testar regressão** | Garantir que o fluxo de onboarding de candidatos e o Hub de Testes não foram afetados |
| **Documentar causa** | Registrar no commit o que causou cada bug |

### Orientações Específicas

| Aspecto | Orientação |
|---------|------------|
| **Edge Function** | A `process-collaborator-invite` precisa de update em `test_invitations.assessment_id` na action `mark_completed`. Não alterar outras actions. |
| **Frontend** | O componente do modal de envio é o principal alvo. Não refatorar a estrutura — apenas corrigir a geração de token e adicionar verificação de convite pendente. |
| **Migration** | A limpeza de dados deve ser conservadora: apenas marcar como `expired`, nunca deletar. Manter `completed` intactos. |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Redesenhar o fluxo de envio de teste (isso é PRD-088) |
| Alterar o fluxo do Hub de Testes (`/empresa/testes`) |
| Alterar a edge function `send-test-invitation` (usada pelo Hub, não pelo perfil) |
| Deletar registros no banco (apenas marcar como expired) |
| Alterar tabelas `gauge_pro_assessments` ou `gauge_pro_results` (schema) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 19/03/2026 |
| **Versão do App** | v1.41.1 "Insight" |
| **Implementado por** | Claude Opus 4.6 via Claude Code |
| **Causa Raiz Confirmada** | Sim — análise via bundle JS e edge functions |
| **Observações** | Migration 062 deve ser aplicada via MCP Supabase. Edge function deve ser deployada. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 19/03/2026 | v1 | Criação inicial — 3 bugs reportados e analisados |
| 19/03/2026 | v2 | Implementação concluída — v1.41.1 |

---

**AILA - Sistemas Inteligentes**
