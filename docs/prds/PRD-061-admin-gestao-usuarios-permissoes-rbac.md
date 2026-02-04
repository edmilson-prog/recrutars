# PRD-061: Admin — Gestão de Usuários e Permissões (RBAC)

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| **`PRD-061`** | ⬅ Você está aqui — Gestão de Usuários e Permissões |
| `PRD-060` | Gestão de Planos e Assinaturas |
| `PRD-062` | Feature Flags e Simulador de Planos |
| `PRD-058` | Gestão de Vagas e Moderação |
| `PRD-059` | Relatórios e Analytics |

---

# PRD-061: Admin — Gestão de Usuários e Permissões (RBAC)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Admin |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar sistema completo de gestão de usuários (admins, empresas, candidatos) com RBAC granular por ação, grupos de permissão, hierarquia de papéis e funcionalidade de impersonation para suporte e testes |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 6 |
| **Prioridade** | Alta |
| **Épico** | Painel Admin — Fundação |
| **PRDs Relacionados** | PRD-060, PRD-062, PRD-058, PRD-059 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Modelo de dados hierárquico (roles → permissions → groups → users), sistema de herança de permissões, impersonation com contexto de segurança, auditoria de acessos, e impacto transversal em toda a plataforma.

---

## Contexto do Problema

O RecrutaRS possui três tipos de usuário (admin, empresa, candidato), mas não dispõe de um sistema centralizado de gestão com permissões granulares. Hoje o controle é binário: ou tem acesso ao painel ou não tem.

Problemas concretos:

1. **Sem granularidade:** Não é possível dar acesso parcial — por exemplo, um admin que pode ver relatórios mas não pode excluir empresas, ou um colaborador de empresa que só pode gerenciar vagas mas não acessar resultados de testes.

2. **Sem grupos:** Cada usuário precisa ter suas permissões configuradas individualmente. Não há como criar "Perfil de Suporte" e atribuir a vários admins.

3. **Sem impersonation:** Para testar ou dar suporte, o admin precisa pedir login e senha do usuário. Inaceitável em termos de segurança e LGPD.

4. **Cadastro incompleto:** O CRUD de usuários é básico — faltam filtros avançados, ações em lote, histórico de atividades e status detalhados.

Este PRD cria a fundação de autorização e gestão de identidades que será consumida por todos os demais PRDs do admin.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Autenticação existe (login/senha via Supabase Auth)
- Tipo de usuário definido por campo simples (role: admin/company/candidate)
- Sem permissões granulares
- Sem grupos
- Sem impersonation
- CRUD básico de listagem

### Situação Desejada (To-Be)

- RBAC completo com roles, permissões por recurso+ação, e grupos
- Hierarquia: SuperAdmin > Admin > Moderator (para admins); Owner > Manager > Recruiter > Viewer (para empresas)
- Permissões atribuíveis a roles, grupos ou diretamente a usuários
- Impersonation seguro com trilha de auditoria
- Cadastro completo com filtros, ações em lote, timeline de atividades
- Resolução de permissão: User overrides > Group > Role (mais específico vence)

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Permissões apenas por role (sem granularidade) | Não atende cenários de acesso parcial |
| ACL puro (sem roles) | Muito trabalhoso de manter, não escala |
| Ferramenta externa (Auth0 RBAC) | Dependência externa, custo, complexidade de integração |

---

## Escopo

### Incluído

- ✅ CRUD completo de usuários (admin, empresa, candidato)
- ✅ Sistema de Roles com hierarquia
- ✅ Sistema de Permissões granulares (recurso + ação)
- ✅ Sistema de Grupos de permissão
- ✅ Atribuição de permissões: por role, por grupo, por usuário
- ✅ Resolução de conflitos: override do usuário > grupo > role
- ✅ Impersonation com auditoria
- ✅ Filtros avançados, busca e ações em lote
- ✅ Timeline de atividades por usuário
- ✅ Auditoria de quem alterou permissões

### Excluído

- ❌ Autenticação (já existe via Supabase Auth)
- ❌ SSO / OAuth social (futuro)
- ❌ Multi-tenancy (já existe via company_id + RLS)
- ❌ Gestão de planos e assinaturas (PRD-060)
- ❌ Feature flags (PRD-062)

---

## Arquitetura de Permissões

### Hierarquia de Roles

**Roles de Admin (plataforma):**

| Role | Nível | Descrição |
|------|-------|-----------|
| `super_admin` | 1 (máximo) | Acesso total, gerencia outros admins |
| `admin` | 2 | Acesso amplo, não gerencia super_admins |
| `moderator` | 3 | Acesso limitado: moderação de conteúdo, suporte |

**Roles de Empresa:**

| Role | Nível | Descrição |
|------|-------|-----------|
| `owner` | 1 (máximo) | Dono da conta, acesso total na empresa |
| `manager` | 2 | Gerente de RH, acesso a testes e equipes |
| `recruiter` | 3 | Recrutador, acesso a vagas e candidatos |
| `viewer` | 4 | Visualizador, apenas leitura |

**Roles de Candidato:**

| Role | Nível | Descrição |
|------|-------|-----------|
| `candidate` | 1 | Role única — controle por plano, não por role |

### Modelo de Permissões

Cada permissão é um par `recurso:ação`:

```
formato: recurso:ação

Exemplos:
  users:view          → Ver listagem de usuários
  users:create        → Criar usuários
  users:edit          → Editar usuários
  users:delete        → Excluir/desativar usuários
  users:impersonate   → Impersonar usuário
  
  companies:view      → Ver empresas
  companies:create    → Criar empresas
  companies:edit      → Editar empresas
  companies:suspend   → Suspender empresas
  
  vacancies:view      → Ver vagas
  vacancies:moderate  → Aprovar/rejeitar vagas
  vacancies:delete    → Remover vagas
  
  candidates:view     → Ver candidatos
  candidates:export   → Exportar dados de candidatos
  
  reports:view        → Ver relatórios
  reports:export      → Exportar relatórios
  
  plans:view          → Ver planos
  plans:manage        → Criar/editar planos
  
  settings:view       → Ver configurações
  settings:manage     → Alterar configurações
  
  audit:view          → Ver logs de auditoria
  
  tests:view          → Ver testes comportamentais
  tests:manage        → Gerenciar testes
  tests:results       → Ver resultados de testes
```

### Tabela de Permissões Padrão por Role (Admin)

| Permissão | super_admin | admin | moderator |
|-----------|:-----------:|:-----:|:---------:|
| users:view | ✅ | ✅ | ✅ |
| users:create | ✅ | ✅ | ❌ |
| users:edit | ✅ | ✅ | ❌ |
| users:delete | ✅ | ❌ | ❌ |
| users:impersonate | ✅ | ✅ | ❌ |
| companies:view | ✅ | ✅ | ✅ |
| companies:create | ✅ | ✅ | ❌ |
| companies:edit | ✅ | ✅ | ✅ |
| companies:suspend | ✅ | ✅ | ❌ |
| vacancies:view | ✅ | ✅ | ✅ |
| vacancies:moderate | ✅ | ✅ | ✅ |
| vacancies:delete | ✅ | ✅ | ❌ |
| candidates:view | ✅ | ✅ | ✅ |
| candidates:export | ✅ | ✅ | ❌ |
| reports:view | ✅ | ✅ | ❌ |
| reports:export | ✅ | ❌ | ❌ |
| plans:view | ✅ | ✅ | ❌ |
| plans:manage | ✅ | ❌ | ❌ |
| settings:view | ✅ | ✅ | ❌ |
| settings:manage | ✅ | ❌ | ❌ |
| audit:view | ✅ | ✅ | ❌ |

### Tabela de Permissões Padrão por Role (Empresa)

| Permissão (contexto empresa) | owner | manager | recruiter | viewer |
|-------------------------------|:-----:|:-------:|:---------:|:------:|
| company:settings | ✅ | ❌ | ❌ | ❌ |
| company:billing | ✅ | ❌ | ❌ | ❌ |
| company:members | ✅ | ✅ | ❌ | ❌ |
| vacancies:create | ✅ | ✅ | ✅ | ❌ |
| vacancies:edit | ✅ | ✅ | ✅ | ❌ |
| vacancies:close | ✅ | ✅ | ❌ | ❌ |
| candidates:view | ✅ | ✅ | ✅ | ✅ |
| candidates:evaluate | ✅ | ✅ | ✅ | ❌ |
| tests:manage | ✅ | ✅ | ❌ | ❌ |
| tests:results | ✅ | ✅ | ✅ | ✅ |
| teams:view | ✅ | ✅ | ❌ | ❌ |
| teams:manage | ✅ | ✅ | ❌ | ❌ |
| reports:view | ✅ | ✅ | ✅ | ✅ |
| reports:export | ✅ | ✅ | ❌ | ❌ |

### Resolução de Permissões

```
Ordem de prioridade (mais específico vence):

1. Permissão direta do usuário (override explícito)
   ↓ se não definida
2. Permissão do(s) grupo(s) do usuário (união de todos os grupos)
   ↓ se não definida
3. Permissão da role do usuário
   ↓ se não definida
4. Negado por padrão
```

**Override pode ser positivo ou negativo:**
- Admin João tem role `admin` (que inclui `users:edit`)
- Override no João: `users:edit = DENY`
- Resultado: João NÃO pode editar usuários, apesar da role permitir

---

## Requisitos Funcionais

### Gestão de Usuários — Listagem e Filtros

- **RF-001:** O sistema deve exibir listagem unificada de todos os usuários com:
  - Avatar (ou iniciais), nome, e-mail
  - Tipo (Admin / Empresa / Candidato) com badge colorido
  - Role específica (super_admin, owner, recruiter, etc.)
  - Status: Ativo / Inativo / Suspenso / Pendente
  - Plano atual (para empresas e candidatos)
  - Data de cadastro
  - Último acesso

- **RF-002:** Filtros avançados:
  - Tipo de usuário (Admin, Empresa, Candidato)
  - Status (Ativo, Inativo, Suspenso, Pendente)
  - Role
  - Plano (Essencial, Avançar, Destaque Máximo, Seleção Inteligente, Recrutamento Premium)
  - Data de cadastro (período)
  - Último acesso (período)
  - Grupo de permissão
  - Busca por nome ou e-mail

- **RF-003:** Ações em lote:
  - Ativar/Desativar selecionados
  - Atribuir grupo de permissão
  - Exportar lista (CSV)
  - Enviar notificação

### Gestão de Usuários — CRUD Completo

- **RF-004:** Criar usuário admin:
  - Nome, e-mail, senha temporária
  - Role (super_admin, admin, moderator)
  - Grupos de permissão (opcionais)
  - Overrides de permissão (opcionais)
  - Enviar e-mail de boas-vindas com link de ativação

- **RF-005:** Criar/editar empresa:
  - Dados da empresa: razão social, CNPJ, nome fantasia, logo
  - Endereço completo
  - Responsável (owner): nome, e-mail, telefone
  - Plano atual (manual ou via assinatura)
  - Status da conta
  - Membros da empresa com suas roles

- **RF-006:** Criar/editar candidato:
  - Dados pessoais: nome, e-mail, telefone, CPF
  - Endereço
  - Plano atual
  - Status do perfil (ativo, inativo, pendente)
  - Status do teste Gauge-Pro (não realizado, em andamento, concluído)

- **RF-007:** Perfil detalhado de cada usuário:

  **Aba Dados:** Todas as informações de cadastro editáveis
  
  **Aba Permissões:** 
  - Role atual
  - Grupos vinculados
  - Overrides individuais
  - Visualização consolidada: "Permissões efetivas" (resultado final da resolução)
  
  **Aba Timeline:**
  - Histórico de ações do usuário (login, alterações, etc.)
  - Últimos 50 eventos
  
  **Aba Assinatura** (empresa/candidato):
  - Plano atual, data de ativação, próxima cobrança
  - Histórico de planos
  
  **Aba Notas:**
  - Anotações internas do admin sobre o usuário (suporte, observações)

- **RF-008:** Ações no perfil do usuário:
  - Editar dados
  - Alterar role
  - Alterar status (ativar, desativar, suspender)
  - Resetar senha
  - Impersonar (entrar como)
  - Revogar todas as sessões
  - Excluir conta (soft delete com confirmação dupla)

### Sistema de Roles

- **RF-009:** O sistema deve manter cadastro de roles:
  - Nome da role
  - Tipo (admin / company / candidate)
  - Nível hierárquico (1 = máximo)
  - Descrição
  - Permissões padrão vinculadas
  - Se é editável (roles padrão do sistema não são deletáveis)

- **RF-010:** O admin deve poder criar roles customizadas:
  - Ex: "Suporte Nível 2" — com permissões específicas de suporte
  - Tipo obrigatório (não pode misturar admin com empresa)
  - Definir permissões ao criar

- **RF-011:** Regra de hierarquia:
  - Usuário só pode atribuir roles de nível igual ou inferior ao seu
  - super_admin pode atribuir qualquer role
  - admin não pode criar/editar super_admins

### Sistema de Permissões

- **RF-012:** O sistema deve manter catálogo de permissões:
  - Organizadas por recurso (users, companies, vacancies, etc.)
  - Cada permissão com: código, nome legível, descrição, categoria
  - Novas permissões podem ser adicionadas pelo sistema (via PRDs futuros)

- **RF-013:** Tela de configuração de permissões por role:
  - Matriz visual: linhas = permissões agrupadas por recurso, colunas = roles
  - Toggle (✅/❌) para cada combinação
  - Salvar configuração

- **RF-014:** O sistema deve resolver permissões seguindo a hierarquia definida:
  - Override direto > Grupo > Role > Negado
  - Função: `hasPermission(userId, 'recurso:ação')` → true/false
  - Cache de permissões resolvidas por sessão (invalidar ao alterar)

### Sistema de Grupos

- **RF-015:** O sistema deve permitir criar grupos de permissão:
  - Nome do grupo (ex: "Suporte", "Analistas", "Moderadores de Conteúdo")
  - Descrição
  - Lista de permissões do grupo
  - Lista de membros do grupo

- **RF-016:** Um usuário pode pertencer a múltiplos grupos:
  - Permissões resultantes = união de todos os grupos
  - Se grupo A dá `reports:view` e grupo B dá `reports:export`, usuário tem ambas

- **RF-017:** Tela de gestão de grupos:
  - Listagem de grupos com contagem de membros
  - Criar/editar/excluir grupo
  - Adicionar/remover membros (com busca)
  - Visualizar permissões efetivas do grupo

### Impersonation

- **RF-018:** Admin com permissão `users:impersonate` deve poder "entrar como" qualquer usuário:
  - Botão "Entrar como [Nome]" no perfil do usuário
  - Confirmação: "Você irá visualizar a plataforma como [Nome]. Todas as ações serão registradas."
  - A sessão de impersonation deve ter:
    - Banner fixo no topo: "Você está visualizando como [Nome] — [Sair da impersonation]"
    - Todas as ações ficam registradas como: "Ação por [Nome] (impersonado por [Admin])"

- **RF-019:** Restrições de impersonation:
  - Não é possível impersonar super_admin (proteção)
  - admin só impersona roles de nível inferior
  - moderator NÃO pode impersonar
  - Duração máxima: 1 hora (expiração automática)
  - Não permite alterar senha ou dados de segurança durante impersonation

- **RF-020:** Registro de auditoria para impersonation:
  - Quem impersonou, quem foi impersonado
  - Início e fim da sessão
  - Todas as ações realizadas durante a sessão
  - IP de origem

### Auditoria de Permissões

- **RF-021:** Toda alteração de permissão deve ser auditada:
  - Quem alterou
  - O que foi alterado (role, grupo, override)
  - Valor anterior → valor novo
  - Timestamp
  - IP

- **RF-022:** Log de auditoria visualizável no admin:
  - Filtros por: usuário afetado, admin que alterou, tipo de alteração, período
  - Exportação em CSV

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Resolução de permissão (`hasPermission`) < 50ms (com cache)
- **RNF-002 (Performance):** Listagem de usuários com filtros < 2 segundos (até 50.000 registros)
- **RNF-003 (Segurança):** Permissões verificadas no backend (nunca apenas no frontend)
- **RNF-004 (Segurança):** Cache de permissões invalidado imediatamente após alteração
- **RNF-005 (Escalabilidade):** Suportar até 100 permissões distintas e 50 grupos

---

## Critérios de Aceitação

### RF-001/002: Listagem e Filtros

```gherkin
DADO que existem 500 usuários cadastrados (100 admins, 150 empresas, 250 candidatos)
QUANDO o admin acessar Gestão de Usuários
ENTÃO deve ver listagem paginada com todos os campos
  E ao filtrar por "Tipo: Empresa" + "Status: Ativo"
  ENTÃO deve exibir apenas empresas ativas
  E a busca por "maria" deve retornar usuários com "maria" no nome ou e-mail
```

### RF-014: Resolução de Permissões

```gherkin
DADO que João tem role "admin" (inclui users:edit)
  E João pertence ao grupo "Suporte" (não inclui users:edit)
  E João tem override direto: users:edit = DENY
QUANDO o sistema verificar hasPermission(João, 'users:edit')
ENTÃO deve retornar FALSE (override direto DENY tem prioridade)

DADO que Maria tem role "moderator" (não inclui reports:view)
  E Maria pertence ao grupo "Analistas" (inclui reports:view)
QUANDO o sistema verificar hasPermission(Maria, 'reports:view')
ENTÃO deve retornar TRUE (grupo adiciona permissão)
```

### RF-018/019: Impersonation

```gherkin
DADO que o admin está no perfil da empresa "Tech Corp"
QUANDO clicar em "Entrar como Tech Corp"
ENTÃO deve ver o Painel da Empresa exatamente como o owner vê
  E deve ter banner fixo "Você está visualizando como Tech Corp"
  E todas as ações devem registrar "impersonado por [admin]"
  E não deve poder alterar senha ou dados de segurança
  E após 1 hora, a sessão deve expirar automaticamente
```

### Cenários de Erro

```gherkin
DADO que um moderator tenta impersonar um admin
QUANDO clicar em "Entrar como"
ENTÃO deve receber erro "Você não tem permissão para impersonar este usuário"

DADO que um admin tenta atribuir role super_admin a outro usuário
  E o admin atual NÃO é super_admin
QUANDO tentar salvar
ENTÃO deve receber erro "Apenas super_admins podem atribuir esta role"
```

---

## Modelo de Dados

### Tabela: `roles`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| name | VARCHAR(50) | Nome técnico (ex: 'super_admin') |
| display_name | VARCHAR(100) | Nome legível (ex: 'Super Administrador') |
| type | ENUM | 'admin', 'company', 'candidate' |
| level | INT | Nível hierárquico (1 = máximo) |
| description | TEXT | Descrição |
| is_system | BOOLEAN | Se é role do sistema (não deletável) |
| is_active | BOOLEAN | Ativo |
| created_at | TIMESTAMP | Criação |

### Tabela: `permissions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| code | VARCHAR(100) | Código único (ex: 'users:view') |
| resource | VARCHAR(50) | Recurso (ex: 'users') |
| action | VARCHAR(50) | Ação (ex: 'view') |
| display_name | VARCHAR(200) | Nome legível |
| description | TEXT | Descrição |
| category | VARCHAR(50) | Categoria para agrupamento visual |
| created_at | TIMESTAMP | Criação |

### Tabela: `role_permissions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| role_id | UUID | FK role |
| permission_id | UUID | FK permissão |
| created_at | TIMESTAMP | Criação |

### Tabela: `permission_groups`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| name | VARCHAR(100) | Nome do grupo |
| description | TEXT | Descrição |
| is_active | BOOLEAN | Ativo |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Atualização |

### Tabela: `group_permissions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| group_id | UUID | FK grupo |
| permission_id | UUID | FK permissão |
| created_at | TIMESTAMP | Criação |

### Tabela: `user_groups`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK usuário |
| group_id | UUID | FK grupo |
| created_at | TIMESTAMP | Criação |

### Tabela: `user_permission_overrides`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK usuário |
| permission_id | UUID | FK permissão |
| granted | BOOLEAN | TRUE = concede, FALSE = nega (DENY) |
| granted_by | UUID | FK admin que concedeu |
| reason | TEXT | Motivo do override |
| created_at | TIMESTAMP | Criação |

### Tabela: `impersonation_sessions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| admin_id | UUID | FK admin que impersona |
| target_user_id | UUID | FK usuário impersonado |
| started_at | TIMESTAMP | Início da sessão |
| ended_at | TIMESTAMP | Fim da sessão (nullable = ativa) |
| ip_address | VARCHAR(45) | IP do admin |
| actions_count | INT | Número de ações realizadas |

### Tabela: `permission_audit_logs`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| admin_id | UUID | FK admin que fez a alteração |
| target_user_id | UUID | FK usuário afetado (nullable) |
| action_type | ENUM | 'role_changed', 'permission_overridden', 'group_assigned', 'group_removed', 'group_created', 'group_modified' |
| old_value | JSONB | Valor anterior |
| new_value | JSONB | Valor novo |
| ip_address | VARCHAR(45) | IP |
| created_at | TIMESTAMP | Imutável |

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de dados e seed de roles/permissions | 4 |
| 2 | Motor de resolução de permissões (hasPermission) | 3 |
| 3 | CRUD de usuários com filtros e ações em lote | 5 |
| 4 | Sistema de grupos e overrides | 4 |
| 5 | Impersonation | 4 |
| 6 | Auditoria e visualizações de permissão | 3 |

### Detalhamento das Fases

#### Fase 1: Modelo de Dados e Seed

**Objetivo:** Criar estrutura de tabelas e popular com roles e permissões padrão

**Ações:**
- [ ] Criar tabelas: roles, permissions, role_permissions, permission_groups, group_permissions, user_groups, user_permission_overrides
- [ ] Seed roles padrão (super_admin, admin, moderator, owner, manager, recruiter, viewer, candidate)
- [ ] Seed permissões padrão (~30 permissões)
- [ ] Vincular permissões padrão às roles

**Validação:** Tabelas criadas, roles e permissões populadas

#### Fase 2: Motor de Resolução

**Objetivo:** Implementar hasPermission com cache

**Ações:**
- [ ] Criar função de resolução: override > grupo > role > deny
- [ ] Implementar cache de permissões por sessão
- [ ] Criar middleware de verificação para rotas
- [ ] Implementar invalidação de cache ao alterar permissões

**Validação:** hasPermission retorna resultados corretos para os cenários de teste

#### Fase 3: CRUD de Usuários

**Objetivo:** Implementar gestão completa de usuários

**Ações:**
- [ ] Criar listagem unificada com filtros avançados
- [ ] Implementar perfil detalhado com abas
- [ ] Implementar CRUD por tipo (admin, empresa, candidato)
- [ ] Implementar ações em lote
- [ ] Implementar busca global

**Validação:** Admin consegue listar, criar, editar, filtrar e realizar ações em lote

#### Fase 4: Grupos e Overrides

**Objetivo:** Implementar grupos de permissão e overrides individuais

**Ações:**
- [ ] Criar CRUD de grupos
- [ ] Implementar atribuição de permissões a grupos
- [ ] Implementar vínculo usuário ↔ grupo
- [ ] Implementar overrides individuais (grant/deny)
- [ ] Criar visualização "Permissões efetivas"

**Validação:** Permissões resolvem corretamente com grupos e overrides

#### Fase 5: Impersonation

**Objetivo:** Implementar funcionalidade de entrar como outro usuário

**Ações:**
- [ ] Criar fluxo de início/fim de impersonation
- [ ] Implementar banner fixo durante sessão
- [ ] Implementar restrições (nível hierárquico, timeout)
- [ ] Implementar registro de ações durante impersonation
- [ ] Criar tabela e tela de sessões de impersonation

**Validação:** Impersonation funciona com auditoria completa e restrições

#### Fase 6: Auditoria

**Objetivo:** Implementar logs de auditoria de permissões

**Ações:**
- [ ] Criar registro automático de toda alteração de permissão
- [ ] Implementar tela de visualização de logs
- [ ] Implementar filtros e exportação
- [ ] Implementar timeline de atividades no perfil do usuário

**Validação:** Toda alteração de permissão é registrada e visualizável

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| — | Autenticação Supabase | ✅ Existente |

### PRDs Subsequentes (dependem deste)

| PRD | Descrição |
|-----|-----------|
| PRD-060 | Gestão de Planos (usa permissões) |
| PRD-062 | Feature Flags (usa roles/planos) |
| PRD-058 | Gestão de Vagas (usa permissões de moderação) |
| PRD-059 | Relatórios (usa permissões de visualização) |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Painel Admin — Fundação"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| **1** | **PRD-061** | **Usuários e Permissões** | **🔄 ATUAL** | Base |
| 2 | PRD-060 | Planos e Assinaturas | ⏳ | Depende de 061 |
| 3 | PRD-062 | Feature Flags e Simulador | ⏳ | Depende de 060, 061 |
| 4 | PRD-058 | Vagas e Moderação | ⏳ | Depende de 061 |
| 5 | PRD-059 | Relatórios e Analytics | ⏳ | Depende de 058, 060, 061 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Permissões

- TODA verificação de permissão deve ocorrer no backend
- Frontend usa permissões apenas para esconder/exibir UI (não como bloqueio)
- Endpoints sem permissão devem retornar 403 Forbidden

### Impersonation

- Log imutável (append-only) de sessões
- Timeout automático de 1 hora
- Não permite operações de segurança (trocar senha, revogar 2FA)
- Exige confirmação explícita ao iniciar

### LGPD

- Registro de quem acessou dados de quem
- Candidato pode solicitar relatório de acessos ao seu perfil
- Soft delete obrigatório (dados preservados por 5 anos)

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

**Codinomes:** Sugestão: "Guardian" (proteção, permissões, segurança)

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
| **Não bloquear fluxo principal** | Auditoria em background, não bloquear ação |
| **Fail gracefully** | Se cache de permissão falhar, recalcular (nunca assumir permissão) |
| **Preservar evidências** | Logs de auditoria imutáveis |
| **Testar incrementalmente** | Validar hasPermission com testes unitários extensivos |
| **Documentar decisões** | Registrar decisões sobre hierarquia e resolução |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Cache** | Invalidar seletivamente (apenas o usuário afetado) |
| **Middleware** | Criar middleware genérico reutilizável para todas as rotas |
| **Seed** | Seed de permissões deve ser idempotente (re-executável sem duplicar) |
| **UI** | Matriz de permissões com toggles visuais, não formulário de texto |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Verificar permissão apenas no frontend |
| Hardcodar verificações de role (usar hasPermission sempre) |
| Invalidar cache de todos os usuários quando apenas um muda |
| Permitir exclusão física de roles do sistema |
| Permitir impersonation sem registro de auditoria |
| Criar roles sem tipo (admin/company/candidate) |

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
