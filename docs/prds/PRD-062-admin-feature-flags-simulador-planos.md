# PRD-062: Admin — Feature Flags e Simulador de Planos

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-061` | Gestão de Usuários e Permissões (RBAC) |
| `PRD-060` | Gestão de Planos e Assinaturas |
| **`PRD-062`** | ⬅ Você está aqui — Feature Flags e Simulador de Planos |
| `PRD-058` | Gestão de Vagas e Moderação |
| `PRD-059` | Relatórios e Analytics |

---

# PRD-062: Admin — Feature Flags e Simulador de Planos

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Admin |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar engine de feature flags dinâmicas com vínculo a planos e permissões, simulador de plano para testar restrições sem criar contas de teste, mecanismo de rollout gradual, kill switch para features em produção, e tela de diagnóstico que mostra em tempo real quais features estão ativas para cada combinação de plano/role/usuário |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Painel Admin — Fundação |
| **PRDs Relacionados** | PRD-060, PRD-061 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Integra com sistema de planos (PRD-060) e permissões (PRD-061), engine de avaliação em tempo real com múltiplas condições, simulador cross-context (candidato/empresa/admin), rollout gradual com segmentação.

---

## Contexto do Problema

O RecrutaRS ainda opera com dados mockados e sem persistência real de assinaturas. Isso cria dois desafios imediatos:

1. **Testar features por plano:** Sem um gateway de pagamento ativo, é impossível simular "este candidato tem plano Avançar, logo deve ver o relatório completo". Precisamos de um mecanismo de teste que simule as restrições de cada plano sem depender de dados de pagamento reais.

2. **Controlar features em produção:** Quando funcionalidades novas são implementadas (ex: comparativo lado a lado, IA de recomendação), é arriscado liberar para 100% dos usuários de uma vez. Feature flags permitem rollout gradual, kill switch instantâneo, e testes A/B sem deploy.

Além disso, o documento de planos define uma matriz complexa de features por plano. Sem um sistema centralizado que avalie "este usuário TEM acesso a esta feature?", o código ficaria cheio de `if/else` hardcodados, impossíveis de manter.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Features controladas por `if (plan === 'premium')` hardcodado
- Sem forma de testar restrições de plano sem conta de teste
- Sem rollout gradual (tudo ou nada)
- Sem kill switch para desativar features em emergência
- Sem visibilidade de quais features estão ativas para quem

### Situação Desejada (To-Be)

- Engine centralizada: `isFeatureEnabled(userId, featureKey)` → true/false
- Feature flags com condições compostas (plano + role + % rollout + segmento)
- Simulador de plano: admin vê a plataforma "como se fosse" cada plano
- Kill switch: desativar qualquer feature em 1 clique
- Dashboard de flags: visão consolidada de todas as features e seu estado
- Diagnóstico por usuário: "o que João consegue acessar e por quê?"

### Integração com PRDs Existentes

```
PRD-061 (Permissões)     PRD-060 (Planos)
    │                         │
    └──────── PRD-062 ────────┘
              Feature Flags
                  │
     ┌────────────┼────────────┐
     │            │            │
  PRD-058     PRD-059    Toda a
  (Vagas)   (Relatórios)  plataforma
```

A engine consome:
- **Capabilities do plano** (PRD-060): qual plano do usuário, quais capabilities ativas
- **Permissões RBAC** (PRD-061): qual role, quais permissões

E responde para toda a plataforma: "esta feature está ativa para este usuário?"

---

## Escopo

### Incluído

- ✅ Engine de avaliação de feature flags
- ✅ CRUD de feature flags com condições compostas
- ✅ Vínculo com planos/capabilities (PRD-060) e permissões (PRD-061)
- ✅ Simulador de plano (testar como cada plano/role vê a plataforma)
- ✅ Kill switch por feature (desativar instantaneamente)
- ✅ Rollout gradual (% de usuários, por segmento)
- ✅ Dashboard de feature flags
- ✅ Diagnóstico por usuário ("o que este user vê?")
- ✅ Override por usuário específico (force enable / force disable)
- ✅ Logs de alterações em flags

### Excluído

- ❌ Testes A/B com métricas (futuro)
- ❌ Feature flags baseados em geolocalização
- ❌ Integração com LaunchDarkly ou similar
- ❌ API pública de feature flags

---

## Estrutura do Menu

### Localização no Painel Admin

```
⚙️ Configurações
    ├── Geral
    ├── Planos e Assinaturas (PRD-060)
    ├── Usuários e Permissões (PRD-061)
    └── Feature Flags ← NOVO
            ├── Dashboard de Flags
            ├── Gerenciar Flags
            ├── Simulador de Plano
            └── Diagnóstico
```

---

## Requisitos Funcionais

### Engine de Avaliação

- **RF-001:** O sistema deve implementar função centralizada de avaliação:

  ```
  isFeatureEnabled(context) → boolean
  
  onde context = {
    userId,
    userType (candidate | company | admin),
    planSlug (essencial | avancar | destaque-maximo | ...),
    roleSlug (super_admin | admin | owner | recruiter | ...),
    capabilities[] (lista de capabilities ativas do plano),
    permissions[] (lista de permissões efetivas)
  }
  ```

- **RF-002:** A avaliação deve seguir ordem de prioridade:

  | Prioridade | Condição | Comportamento |
  |:----------:|----------|---------------|
  | 1 (máxima) | **Kill switch ativo** | Feature desativada para TODOS |
  | 2 | **Override por usuário** | Force enable ou force disable |
  | 3 | **Override por empresa** | Force enable/disable para toda a empresa |
  | 4 | **Condições da flag** | Avaliar regras (plano, role, capability, rollout %) |
  | 5 (mínima) | **Default** | Valor padrão da flag (enabled/disabled) |

- **RF-003:** Cada feature flag deve suportar condições compostas:

  **Condições disponíveis:**
  | Tipo | Operador | Exemplo |
  |------|----------|---------|
  | `plan_is` | IN | plan_is IN ['avancar', 'destaque-maximo'] |
  | `plan_is_not` | NOT IN | plan_is_not IN ['essencial'] |
  | `role_is` | IN | role_is IN ['owner', 'manager'] |
  | `user_type_is` | EQUALS | user_type_is = 'company' |
  | `has_capability` | HAS | has_capability = 'filter_advanced' |
  | `rollout_percentage` | <= | rollout_percentage <= 50 |
  | `user_id_in` | IN | user_id_in = ['uuid1', 'uuid2'] |
  | `company_id_in` | IN | company_id_in = ['uuid1'] |
  | `created_after` | >= | created_after >= '2026-01-01' |
  | `created_before` | <= | created_before <= '2026-06-30' |

  **Lógica de combinação:**
  - Condições dentro do mesmo grupo: AND
  - Grupos entre si: OR
  - Pelo menos UM grupo deve ser verdadeiro para a flag estar ativa

  **Exemplo de flag com condições compostas:**
  ```
  Flag: "ai_candidate_recommendation"
  
  Grupo 1 (OR):
    - plan_is IN ['recrutamento-premium']   (AND)
    - has_capability = 'auto_recommendation' (AND)
    
  Grupo 2 (OR):
    - user_id_in = ['uuid-beta-tester']
    
  Resultado: Ativa para Premium COM capability OU para beta testers específicos
  ```

### CRUD de Feature Flags

- **RF-004:** O admin deve poder criar/editar feature flags:

  **Campos da flag:**
  | Campo | Tipo | Descrição |
  |-------|------|-----------|
  | Key | VARCHAR(100) | Identificador único (snake_case) |
  | Nome | VARCHAR(200) | Nome legível |
  | Descrição | TEXT | O que a feature faz |
  | Categoria | ENUM | 'visibility', 'reports', 'filtering', 'ai', 'access', 'ui', 'beta' |
  | Escopo | ENUM | 'candidate', 'company', 'admin', 'global' |
  | Status | ENUM | 'active', 'inactive', 'killed' |
  | Default | BOOLEAN | Valor padrão se nenhuma condição aplicar |
  | Condições | JSON | Grupos de condições (ver RF-003) |
  | Kill Switch | BOOLEAN | Se ativo, desliga para todos |
  | Notas | TEXT | Observações internas |

- **RF-005:** Feature flags pré-configuradas (seed inicial):

  **Candidato:**
  | Flag Key | Descrição | Condição Default |
  |----------|-----------|------------------|
  | `candidate_report_basic` | Relatório básico do teste | plan_is IN ['essencial', 'avancar', 'destaque-maximo'] |
  | `candidate_report_complete` | Relatório completo | plan_is IN ['avancar', 'destaque-maximo'] |
  | `candidate_report_premium` | Relatório premium | plan_is IN ['destaque-maximo'] |
  | `candidate_visibility_medium` | Visibilidade 3x | plan_is IN ['avancar', 'destaque-maximo'] |
  | `candidate_visibility_priority` | Visibilidade topo | plan_is IN ['destaque-maximo'] |
  | `candidate_visit_notification` | Notificação de visita | plan_is IN ['avancar', 'destaque-maximo'] |
  | `candidate_auto_recommendation` | Recomendação automática | plan_is IN ['destaque-maximo'] |
  | `candidate_exclusive_content` | Conteúdos exclusivos | plan_is IN ['destaque-maximo'] |
  | `candidate_company_interest` | Info interesse empresa | plan_is IN ['destaque-maximo'] |

  **Empresa:**
  | Flag Key | Descrição | Condição Default |
  |----------|-----------|------------------|
  | `company_job_highlight_medium` | Destaque 3x vagas | plan_is IN ['selecao-inteligente', 'recrutamento-premium'] |
  | `company_job_highlight_top` | Destaque topo vagas | plan_is IN ['recrutamento-premium'] |
  | `company_filter_advanced` | Filtros avançados | plan_is IN ['selecao-inteligente', 'recrutamento-premium'] |
  | `company_filter_ai` | Triagem por IA | plan_is IN ['recrutamento-premium'] |
  | `company_compatibility_advanced` | Compatibilidade avançada | plan_is IN ['selecao-inteligente', 'recrutamento-premium'] |
  | `company_compatibility_premium` | Compatibilidade + IA | plan_is IN ['recrutamento-premium'] |
  | `company_report_complete` | Relatórios completos | plan_is IN ['selecao-inteligente', 'recrutamento-premium'] |
  | `company_report_comparative` | Comparativos | plan_is IN ['recrutamento-premium'] |
  | `company_profile_partial` | Acesso parcial perfil | plan_is IN ['selecao-inteligente', 'recrutamento-premium'] |
  | `company_profile_full` | Acesso total perfil | plan_is IN ['recrutamento-premium'] |
  | `company_unlock_profiles` | Desbloquear perfis | plan_is IN ['recrutamento-premium'] |
  | `company_ranking` | Ranking candidatos | plan_is IN ['selecao-inteligente', 'recrutamento-premium'] |
  | `company_ranking_ai` | Ranking + IA | plan_is IN ['recrutamento-premium'] |
  | `company_auto_recommendation` | Recomendação automática | plan_is IN ['recrutamento-premium'] |
  | `company_recruitment_reports` | Relatórios recrutamento | plan_is IN ['recrutamento-premium'] |

  **Plataforma (beta/experimental):**
  | Flag Key | Descrição | Condição Default |
  |----------|-----------|------------------|
  | `beta_team_builder` | Team Builder | rollout_percentage <= 0 (desligado) |
  | `beta_cultural_fit` | Cultural Fit Score | rollout_percentage <= 0 |
  | `beta_nine_box` | Nine Box Comportamental | rollout_percentage <= 0 |

### Dashboard de Feature Flags

- **RF-006:** O dashboard deve exibir:
  
  **KPIs:**
  - Total de flags ativas
  - Flags desativadas / killed
  - Flags beta (rollout < 100%)
  - Última alteração (flag + admin + data)

  **Listagem:**
  - Todas as flags com: key, nome, status (badge), escopo, default, última alteração
  - Filtros: por status, escopo, categoria
  - Busca por key ou nome
  - Toggle rápido: ativar/desativar flag direto da listagem
  - Kill switch: botão vermelho para desativar emergencialmente

- **RF-007:** Indicadores visuais de status:
  
  | Status | Badge | Cor |
  |--------|-------|-----|
  | Active | 🟢 Ativa | Verde |
  | Inactive | ⚪ Inativa | Cinza |
  | Killed | 🔴 Killed | Vermelho |
  | Beta (rollout < 100%) | 🟡 Beta X% | Amarelo |

### Simulador de Plano

- **RF-008:** O admin deve poder simular a plataforma como diferentes combinações:

  **Interface do Simulador:**
  - Dropdown: Tipo de usuário (Candidato / Empresa)
  - Dropdown: Plano (Essencial / Avançar / Destaque Máximo / Seleção Inteligente / Recrutamento Premium)
  - Dropdown: Role (aplicável para empresas: Owner / Manager / Recruiter / Viewer)
  - Botão: "Iniciar Simulação"

- **RF-009:** Durante a simulação:
  - Banner fixo amarelo no topo: "🔍 MODO SIMULAÇÃO — Plano: [Plano] | Role: [Role] | Tipo: [Tipo] — [Encerrar Simulação]"
  - A plataforma exibe/oculta features conforme as flags avaliam para a combinação selecionada
  - Painel lateral (collapsible) mostrando: "Features ativas para esta combinação: [lista]"
  - A simulação NÃO altera dados reais
  - A simulação NÃO requer criação de conta de teste

- **RF-010:** O simulador deve permitir comparar duas combinações lado a lado:
  - Coluna esquerda: Combinação A (ex: Candidato Essencial)
  - Coluna direita: Combinação B (ex: Candidato Destaque Máximo)
  - Diferenças destacadas em amarelo
  - Lista: "Features em B que não estão em A" (valor de upgrade)

### Diagnóstico por Usuário

- **RF-011:** Para cada usuário, o admin deve poder ver "Diagnóstico de Acesso":

  **Acessível via:** perfil do usuário (PRD-061) → aba "Diagnóstico" ou botão "Ver acesso"

  **Informações exibidas:**
  | Seção | Conteúdo |
  |-------|----------|
  | **Contexto** | Tipo, plano, role, grupos, capabilities do plano |
  | **Permissões RBAC** | Lista de permissões efetivas (de PRD-061) |
  | **Feature Flags** | Cada flag avaliada com resultado (✅/❌) e motivo |
  | **Overrides** | Se tem override por usuário ou empresa |
  | **Capabilities do Plano** | Lista do que o plano libera |

- **RF-012:** Para cada flag no diagnóstico, exibir a "cadeia de avaliação":
  ```
  Flag: company_filter_ai
  Resultado: ❌ DESATIVADA
  Motivo: Plano 'selecao-inteligente' não está nas condições (requer 'recrutamento-premium')
  
  Cadeia:
  1. Kill switch? → Não
  2. Override usuário? → Não
  3. Override empresa? → Não
  4. Condição: plan_is IN ['recrutamento-premium'] → ❌ (plano atual: selecao-inteligente)
  5. Default: false → ❌
  ```

### Overrides

- **RF-013:** O admin deve poder forçar enable/disable de uma flag para:
  - Um usuário específico
  - Uma empresa específica (todos os membros)

  **Interface:** No perfil do usuário/empresa, seção "Overrides de Features":
  - Lista de todas as flags com estado atual
  - Toggle: "Forçar ativa" / "Forçar inativa" / "Sem override (avaliar normalmente)"

- **RF-014:** Overrides devem ter:
  - Motivo (obrigatório ao criar)
  - Data de expiração (opcional — auto-remove)
  - Quem criou e quando
  - Log de auditoria

### Rollout Gradual

- **RF-015:** Feature flags com `rollout_percentage` devem:
  - Usar hash determinístico do userId para consistência (mesmo usuário sempre no mesmo bucket)
  - rollout_percentage = 0% → ninguém
  - rollout_percentage = 100% → todos
  - rollout_percentage = 50% → metade dos usuários (determinístico, não aleatório por request)
  - O admin deve poder ver quantos usuários estão no rollout
  - O admin deve poder aumentar/diminuir o percentual gradualmente

- **RF-016:** Rollout pode ser combinado com outras condições:
  - Ex: rollout_percentage 25% + plan_is ['recrutamento-premium'] = 25% dos usuários Premium

### Logs de Alteração

- **RF-017:** Toda alteração em feature flags deve ser logada:
  - Quem alterou
  - O que mudou (status, condições, rollout %, override)
  - Valor anterior → valor novo
  - Timestamp
  - Motivo (obrigatório para kill switch e overrides)

- **RF-018:** Histórico de alterações visualizável:
  - Por flag: timeline de mudanças
  - Global: últimas 50 alterações em qualquer flag

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** `isFeatureEnabled()` < 20ms (com cache)
- **RNF-002 (Cache):** Cache de avaliação por sessão, invalidação ao alterar flag
- **RNF-003 (Disponibilidade):** Se o sistema de flags falhar, usar valor default da flag (fail-safe)
- **RNF-004 (Consistência):** Rollout % deve ser determinístico (mesmo resultado para mesmo userId)
- **RNF-005 (Segurança):** Apenas admins com permissão `settings:manage` podem alterar flags

---

## Critérios de Aceitação

### RF-001/002: Engine de Avaliação

```gherkin
DADO que a flag "company_filter_ai" tem condição plan_is IN ['recrutamento-premium']
  E a empresa "Tech Corp" tem plano "selecao-inteligente"
QUANDO avaliar isFeatureEnabled para "Tech Corp" + "company_filter_ai"
ENTÃO deve retornar FALSE

DADO que a mesma flag tem override force_enable para "Tech Corp"
QUANDO avaliar isFeatureEnabled para "Tech Corp" + "company_filter_ai"
ENTÃO deve retornar TRUE (override tem prioridade sobre condições)
```

### RF-008/009: Simulador

```gherkin
DADO que o admin inicia simulação como "Candidato + Plano Avançar"
QUANDO a plataforma renderizar
ENTÃO deve mostrar relatório completo (flag candidate_report_complete ativa)
  E deve mostrar notificação de visita (flag candidate_visit_notification ativa)
  E NÃO deve mostrar conteúdos exclusivos (flag candidate_exclusive_content inativa)
  E deve exibir banner "MODO SIMULAÇÃO — Plano: Avançar"
```

### RF-010: Comparação Lado a Lado

```gherkin
DADO que o admin está no simulador
QUANDO comparar "Candidato Essencial" vs "Candidato Destaque Máximo"
ENTÃO deve exibir duas colunas com as features de cada plano
  E deve destacar em amarelo as diferenças
  E deve listar "Features exclusivas do Destaque Máximo: relatório premium, recomendação automática, conteúdos exclusivos..."
```

### RF-011/012: Diagnóstico

```gherkin
DADO que o admin acessa diagnóstico do candidato "Maria" (plano Avançar)
QUANDO visualizar a flag "candidate_report_premium"
ENTÃO deve ver: "❌ DESATIVADA — Plano 'avancar' não está nas condições (requer 'destaque-maximo')"
  E deve ver a cadeia completa de avaliação
```

### Kill Switch

```gherkin
DADO que a flag "beta_team_builder" está ativa para 20% dos usuários
QUANDO o admin ativar kill switch
ENTÃO a flag deve ser IMEDIATAMENTE desativada para TODOS
  E o dashboard deve mostrar badge 🔴 "Killed"
  E o motivo deve ser obrigatório e registrado
```

### Cenários de Erro

```gherkin
DADO que o sistema de feature flags está indisponível (crash)
QUANDO a plataforma tentar avaliar uma flag
ENTÃO deve usar o valor default da flag (fail-safe)
  E deve logar o erro para investigação
  E NÃO deve mostrar erro para o usuário
```

---

## Modelo de Dados

### Tabela: `feature_flags`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| key | VARCHAR(100) | Identificador único (snake_case) |
| name | VARCHAR(200) | Nome legível |
| description | TEXT | Descrição da feature |
| category | ENUM | 'visibility', 'reports', 'filtering', 'ai', 'access', 'ui', 'beta' |
| scope | ENUM | 'candidate', 'company', 'admin', 'global' |
| status | ENUM | 'active', 'inactive', 'killed' |
| default_value | BOOLEAN | Valor padrão |
| conditions | JSONB | Grupos de condições (ver RF-003) |
| rollout_percentage | INT | 0-100 (NULL = sem rollout, avaliar condições) |
| is_kill_switched | BOOLEAN | Se kill switch está ativo |
| kill_switch_reason | TEXT | Motivo do kill switch |
| kill_switch_by | UUID | FK admin que ativou |
| kill_switch_at | TIMESTAMP | Quando ativou |
| notes | TEXT | Observações |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |
| created_by | UUID | FK admin que criou |

### Tabela: `feature_flag_overrides`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| flag_id | UUID | FK feature flag |
| target_type | ENUM | 'user', 'company' |
| target_id | UUID | FK usuário ou empresa |
| forced_value | BOOLEAN | TRUE = force enable, FALSE = force disable |
| reason | TEXT | Motivo do override |
| expires_at | TIMESTAMP | Expiração (nullable = permanente) |
| created_by | UUID | FK admin |
| created_at | TIMESTAMP | Criação |

### Tabela: `feature_flag_audit`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| flag_id | UUID | FK feature flag |
| admin_id | UUID | FK admin |
| action | ENUM | 'created', 'updated', 'killed', 'unkilled', 'override_added', 'override_removed', 'rollout_changed' |
| old_value | JSONB | Estado anterior |
| new_value | JSONB | Estado novo |
| reason | TEXT | Motivo |
| created_at | TIMESTAMP | Imutável |

---

## Integração com PRD-060 e PRD-061

### Como consome PRD-060 (Planos)

```
1. Engine recebe userId
2. Busca assinatura ativa (subscriptions)
3. Busca plano (plans)
4. Busca capabilities do plano (plan_capability_assignments)
5. Monta contexto: { planSlug, capabilities[] }
6. Avalia condições da flag contra contexto
```

### Como consome PRD-061 (Permissões)

```
1. Engine recebe userId
2. Busca role do usuário
3. Busca permissões efetivas (hasPermission)
4. Monta contexto: { roleSlug, permissions[] }
5. Avalia condições da flag que usam role_is ou has_permission
```

### Relação com Capabilities (PRD-060) vs Feature Flags

| Conceito | Propósito | Quem define | Granularidade |
|----------|-----------|-------------|---------------|
| **Capability** (PRD-060) | O que o plano INCLUI | Admin via plano | Por plano |
| **Feature Flag** (PRD-062) | Se a feature está ATIVA | Admin via flag | Por plano + role + user + % |

**Exemplo:**
- Capability `filter_ai` está no plano Recrutamento Premium (PRD-060)
- Feature flag `company_filter_ai` verifica `has_capability = 'filter_ai'` (PRD-062)
- A flag pode adicionar condições extras: rollout 50%, ou override por empresa

Capabilities = "o que o plano dá direito a"
Feature Flags = "se a feature está ligada, considerando plano + contexto + regras de negócio"

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de dados, seed de flags e engine base | 4 |
| 2 | CRUD de flags e dashboard | 4 |
| 3 | Simulador de plano | 4 |
| 4 | Diagnóstico por usuário e overrides | 4 |
| 5 | Rollout gradual, kill switch e auditoria | 4 |

### Detalhamento das Fases

#### Fase 1: Engine e Dados

**Objetivo:** Criar motor de avaliação e popular flags iniciais

**Ações:**
- [ ] Criar tabelas: feature_flags, feature_flag_overrides, feature_flag_audit
- [ ] Implementar `isFeatureEnabled(context)` com lógica completa
- [ ] Seed das ~25 flags iniciais (candidato + empresa + beta)
- [ ] Implementar cache de avaliação por sessão

**Validação:** Engine retorna resultados corretos para combinações de teste

#### Fase 2: CRUD e Dashboard

**Objetivo:** Interface de gerenciamento de flags

**Ações:**
- [ ] Criar dashboard com KPIs e listagem
- [ ] Implementar CRUD de flags com editor de condições
- [ ] Implementar toggle rápido e kill switch
- [ ] Implementar busca e filtros

**Validação:** Admin consegue criar, editar e gerenciar flags visualmente

#### Fase 3: Simulador

**Objetivo:** Simular plataforma sob diferentes combinações

**Ações:**
- [ ] Criar interface de seleção (tipo + plano + role)
- [ ] Implementar contexto de simulação (banner, restrições)
- [ ] Implementar painel lateral de features ativas
- [ ] Implementar comparação lado a lado

**Validação:** Admin vê plataforma exatamente como cada plano/role

#### Fase 4: Diagnóstico e Overrides

**Objetivo:** Diagnóstico por usuário e overrides

**Ações:**
- [ ] Criar aba "Diagnóstico" no perfil do usuário
- [ ] Implementar cadeia de avaliação visual
- [ ] Implementar overrides por usuário e empresa
- [ ] Implementar expiração automática de overrides

**Validação:** Admin vê exatamente por que cada flag está ativa/inativa

#### Fase 5: Rollout e Auditoria

**Objetivo:** Rollout gradual e logs completos

**Ações:**
- [ ] Implementar hash determinístico para rollout
- [ ] Implementar controle de percentual com visualização
- [ ] Implementar log de auditoria completo
- [ ] Implementar timeline de alterações por flag

**Validação:** Rollout gradual funciona de forma determinística e auditável

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Painel Admin — Fundação"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-061 | Usuários e Permissões | ⏳ | Base |
| 2 | PRD-060 | Planos e Assinaturas | ⏳ | Depende de 061 |
| **3** | **PRD-062** | **Feature Flags e Simulador** | **🔄 ATUAL** | Depende de 060, 061 |
| 4 | PRD-058 | Vagas e Moderação | ⏳ | Depende de 061 |
| 5 | PRD-059 | Relatórios e Analytics | ⏳ | Depende de 058, 060, 061 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

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

**Codinomes:** Sugestão: "Switch" (controle de features, liga/desliga)

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
| **Não bloquear fluxo principal** | Se flag falhar, usar default (fail-safe) |
| **Fail gracefully** | Engine NUNCA deve crashar — sempre retornar boolean |
| **Preservar evidências** | Logs de auditoria imutáveis |
| **Testar incrementalmente** | Testar engine com unit tests extensivos antes de UI |
| **Documentar decisões** | Registrar decisões de arquitetura da engine |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Engine** | Deve ser uma função pura (dado contexto → boolean) |
| **Cache** | Invalidar por flag alterada, não global |
| **Simulador** | Não cria dados reais — apenas aplica contexto no frontend |
| **Rollout** | Hash determinístico: `hash(userId + flagKey) % 100 < rollout%` |
| **Seed** | Flags iniciais devem ser idempotentes |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Engine que faz queries ao banco em cada avaliação (usar cache) |
| Rollout aleatório por request (deve ser determinístico por userId) |
| Simulador que altera dados reais |
| Permitir alterar flags sem permissão settings:manage |
| Kill switch sem motivo obrigatório |
| Feature flags no frontend sem verificação no backend |
| Condições que avaliam dados não disponíveis no contexto (fail-safe) |

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
