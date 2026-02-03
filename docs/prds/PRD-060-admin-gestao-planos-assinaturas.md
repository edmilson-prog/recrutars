# PRD-060: Admin — Gestão de Planos e Assinaturas

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-058` | Admin: Gestão de Vagas e Moderação |
| `PRD-059` | Admin: Relatórios e Analytics |
| **`PRD-060`** | ⬅ Você está aqui — Admin: Gestão de Planos e Assinaturas |
| `PRD-061` | Admin: Gestão de Usuários e Permissões (RBAC) |
| `PRD-062` | Admin: Feature Flags e Simulador de Planos |

---

# PRD-060: Admin — Gestão de Planos e Assinaturas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Administrativo |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar CRUD completo de planos de assinatura para candidatos e empresas, com configuração de preços por período, features vinculadas a cada plano, tabela de preços de lançamento, gestão de assinaturas ativas, e regras de negócio para upgrade/downgrade, cancelamento e reativação |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Painel Admin Avançado |
| **PRDs Relacionados** | PRD-059, PRD-061, PRD-062 |
| **Padrão de código** | camelCase para campos/tabelas |

---

## Contexto do Problema

O RecrutaRS opera com dois eixos de monetização — planos para candidatos e planos para empresas. Cada plano define quais features estão disponíveis, qual nível de visibilidade e acesso o assinante tem, e qual o preço por período de contratação.

Atualmente, não existe interface administrativa para configurar esses planos. Qualquer alteração de preço, feature ou regra exige mudança em código. Isso impede agilidade comercial (promoções, planos customizados para early adopters) e dificulta o teste de modelos de pricing.

Além disso, sem persistência de dados de assinaturas, é preciso criar mecanismos de mock que simulem todo o ciclo de vida de uma assinatura para validar funcionalidades dependentes de plano.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Planos definidos apenas em documentação (Google Docs)
- Sem CRUD de planos no admin
- Sem gestão de assinaturas
- Sem vínculo formal entre plano e features liberadas
- Sem regras de upgrade/downgrade implementadas
- Sem tabela de preços configurável

### Situação Desejada (To-Be)

- CRUD completo de planos (candidato e empresa)
- Configuração de preços por período (mensal, trimestral, semestral, anual)
- Tabela de preços de lançamento (valores promocionais)
- Vínculo plano → features (lista de capabilities por plano)
- Gestão de assinaturas (ativas, canceladas, expiradas)
- Regras de upgrade, downgrade, cancelamento e reativação
- Compra avulsa de features (desbloqueio unitário)

---

## Escopo

### Incluído

- ✅ CRUD de planos para candidatos (3 planos + configuração)
- ✅ CRUD de planos para empresas (3 planos + configuração)
- ✅ Configuração de preços por período (mensal / trimestral / semestral / anual)
- ✅ Preços de lançamento (tabela promocional separada)
- ✅ Vínculo plano → features/capabilities
- ✅ Gestão de assinaturas ativas
- ✅ Regras de ciclo de vida (upgrade / downgrade / cancelamento / reativação)
- ✅ Compra avulsa de features
- ✅ Regras de perfil inativo (após cancelamento)
- ✅ Dashboard de assinaturas

### Excluído

- ❌ Integração com gateway de pagamento (Stripe, PagSeguro)
- ❌ Cobrança automática e faturamento
- ❌ Nota fiscal
- ❌ Cupons de desconto (futuro)

---

## Estrutura do Menu

### Localização no Painel Admin

```
⚙️ Configurações
    ├── Geral
    ├── Planos e Assinaturas ← NOVO
    │       ├── Planos Candidatos
    │       ├── Planos Empresas
    │       ├── Preços de Lançamento
    │       ├── Features por Plano
    │       └── Assinaturas
    ├── Usuários e Permissões (PRD-061)
    └── Feature Flags (PRD-062)
```

---

## Requisitos Funcionais

### Gestão de Planos — Candidatos

- **RF-001:** O sistema deve permitir visualizar e editar os 3 planos de candidato:

  **Plano 1: Essencial (Gratuito)**
  | Campo | Valor Default |
  |-------|---------------|
  | Nome | Essencial |
  | Slug | essencial |
  | Tipo | Candidato |
  | Preço | R$ 0,00 (gratuito) |
  | Destaque | 🏷️ "Para quem está iniciando" |
  | Ativo | Sim |

  **Plano 2: Avançar (Iniciante)**
  | Campo | Valor Default |
  |-------|---------------|
  | Nome | Avançar |
  | Slug | avancar |
  | Tipo | Candidato |
  | Preço Mensal | R$ 19,90 |
  | Preço Trimestral | R$ 49,90 |
  | Preço Semestral | R$ 89,90 |
  | Destaque | 🏷️ "Para quem quer se destacar" |
  | Ativo | Sim |

  **Plano 3: Destaque Máximo (Profissional)**
  | Campo | Valor Default |
  |-------|---------------|
  | Nome | Destaque Máximo |
  | Slug | destaque-maximo |
  | Tipo | Candidato |
  | Preço Mensal | R$ 39,90 |
  | Preço Trimestral | R$ 99,90 |
  | Preço Semestral | R$ 179,90 |
  | Destaque | 🏷️ "Acelere seus resultados" |
  | Ativo | Sim |

- **RF-002:** Cada plano deve ter campos editáveis:
  - Nome e slug (identificador único)
  - Descrição curta (tagline)
  - Descrição longa
  - Preços por período (mensal, trimestral, semestral, anual)
  - Status: Ativo / Inativo
  - Ordem de exibição (para página de pricing)
  - Badge (ex: "Mais popular")

### Gestão de Planos — Empresas

- **RF-003:** O sistema deve permitir visualizar e editar os 3 planos de empresa:

  **Plano 1: Essencial Empresas (Gratuito)**
  | Campo | Valor Default |
  |-------|---------------|
  | Nome | Essencial Empresas |
  | Slug | essencial-empresas |
  | Preço | R$ 0,00 |

  **Plano 2: Seleção Inteligente (Profissional)**
  | Período | Preço Normal | Preço Lançamento |
  |---------|-------------|-----------------|
  | Mensal | R$ 99,90 | R$ 69,90 |
  | Trimestral | R$ 269,90 | R$ 209,90 |
  | Semestral | R$ 499,90 | R$ 419,90 |
  | Anual | R$ 899,90 | R$ 839,90 |

  **Plano 3: Recrutamento Premium (Empresarial)**
  | Período | Preço Normal | Preço Lançamento |
  |---------|-------------|-----------------|
  | Mensal | R$ 119,90 | R$ 84,90 |
  | Trimestral | R$ 329,90 | R$ 249,90 |
  | Semestral | R$ 629,90 | R$ 499,90 |
  | Anual | R$ 1.099,90 | R$ 999,90 |

### Preços de Lançamento

- **RF-004:** O sistema deve suportar tabela de preços de lançamento:
  - Preço promocional por período (separado do preço normal)
  - Data de início e fim da promoção de lançamento
  - Flag "usar preço de lançamento" (ativo/inativo)
  - Quando ativo, exibir preço de lançamento na página de pricing
  - Quando expirado, voltar automaticamente para preço normal
  - Badge visual na página de pricing: "Valor de lançamento" / "Oferta por tempo limitado"

- **RF-005:** Regra de early adopters:
  - Empresas que assinarem durante o período de lançamento mantêm o preço promocional enquanto a assinatura estiver ativa e renovada
  - Se cancelar e reativar após fim do lançamento, paga preço normal
  - Flag `is_early_adopter` no registro de assinatura

### Features por Plano (Capabilities)

- **RF-006:** O sistema deve permitir configurar quais features cada plano libera:

  **Candidatos:**
  | Feature (capability_key) | Essencial | Avançar | Destaque |
  |--------------------------|-----------|---------|----------|
  | `report_basic` | ✅ | ✅ | ✅ |
  | `report_complete` | ❌ | ✅ | ✅ |
  | `report_premium` | ❌ | ❌ | ✅ |
  | `visibility_standard` | ✅ | ❌ | ❌ |
  | `visibility_medium` | ❌ | ✅ | ❌ |
  | `visibility_priority` | ❌ | ❌ | ✅ |
  | `profile_visit_notification` | ❌ | ✅ | ✅ |
  | `auto_recommendation` | ❌ | ❌ | ✅ |
  | `exclusive_content` | ❌ | ❌ | ✅ |
  | `company_interest_info` | ❌ | ❌ | ✅ |

  **Empresas:**
  | Feature (capability_key) | Essencial | Seleção | Premium |
  |--------------------------|-----------|---------|---------|
  | `job_posting_unlimited` | ✅ | ✅ | ✅ |
  | `job_highlight_standard` | ✅ | ❌ | ❌ |
  | `job_highlight_medium` | ❌ | ✅ | ❌ |
  | `job_highlight_top` | ❌ | ❌ | ✅ |
  | `filter_basic` | ✅ | ✅ | ✅ |
  | `filter_advanced` | ❌ | ✅ | ✅ |
  | `filter_ai` | ❌ | ❌ | ✅ |
  | `compatibility_basic` | ✅ | ✅ | ✅ |
  | `compatibility_advanced` | ❌ | ✅ | ✅ |
  | `compatibility_premium` | ❌ | ❌ | ✅ |
  | `report_basic` | ✅ | ✅ | ✅ |
  | `report_complete` | ❌ | ✅ | ✅ |
  | `report_comparative` | ❌ | ❌ | ✅ |
  | `profile_access_basic` | ✅ | ✅ | ✅ |
  | `profile_access_partial` | ❌ | ✅ | ✅ |
  | `profile_access_full` | ❌ | ❌ | ✅ |
  | `unlock_profiles` | ❌ | partial | ✅ |
  | `candidate_ranking` | ❌ | ✅ | ✅ |
  | `candidate_ranking_ai` | ❌ | ❌ | ✅ |
  | `auto_recommendation` | ❌ | ❌ | ✅ |
  | `recruitment_reports` | ❌ | ❌ | ✅ |
  | `priority_support` | ❌ | level_2 | level_1 |

- **RF-007:** O admin deve poder:
  - Ver a matriz completa plano × features em tela
  - Alterar quais features são liberadas por plano (checkbox)
  - Adicionar novas features (capability_key + nome + descrição)
  - Desativar features descontinuadas
  - Ver quais assinantes são impactados ao mudar uma feature

- **RF-008:** Cada feature deve ter:
  - `capability_key` (identificador único em snake_case)
  - Nome amigável (para exibição)
  - Descrição
  - Categoria (Visibilidade / Relatórios / Triagem / Acesso / Suporte)
  - Tipo de valor: boolean (tem/não tem) ou enum (nivel_1 / nivel_2 / partial)
  - Status: Ativo / Inativo

### Compra Avulsa

- **RF-009:** O sistema deve suportar compra avulsa de features:
  - Candidato Essencial pode comprar `report_complete` avulso
  - Candidato Avançar pode comprar `report_premium` avulso
  - Empresa Essencial pode comprar desbloqueio de perfil avulso
  - Preço configurável por feature avulsa
  - Validade: permanente ou por período

- **RF-010:** Registrar compras avulsas:
  - Usuário que comprou
  - Feature comprada
  - Preço pago
  - Data de compra
  - Data de expiração (se aplicável)

### Gestão de Assinaturas

- **RF-011:** O sistema deve exibir listagem de todas as assinaturas:
  - Assinante (nome, tipo: candidato/empresa)
  - Plano atual
  - Período (mensal/trimestral/semestral/anual)
  - Preço pago
  - Data de início
  - Data de renovação/expiração
  - Status: Ativa / Cancelada / Expirada / Suspensa
  - Flag early_adopter

- **RF-012:** O admin deve poder:
  - Filtrar por tipo (candidato/empresa), plano, status, período
  - Buscar por nome ou e-mail
  - Ver detalhes de uma assinatura
  - Alterar plano manualmente (upgrade/downgrade administrativo)
  - Cancelar assinatura
  - Reativar assinatura cancelada
  - Marcar como early_adopter
  - Adicionar nota interna

### Regras de Ciclo de Vida

- **RF-013:** Regras de upgrade:
  - Upgrade imediato (acesso às novas features na hora)
  - Cálculo de crédito proporcional do período não utilizado
  - Notificação ao usuário

- **RF-014:** Regras de downgrade:
  - Efetivo ao fim do período atual (não imediato)
  - Notificação de quais features serão perdidas
  - Confirmação obrigatória

- **RF-015:** Regras de cancelamento:
  - Acesso mantido até o fim do período pago
  - Após encerramento:
    - Candidato: perfil passa para status inativo
    - Empresa: não vê dados do candidato, candidato não vê dados da empresa
    - Candidato vê apenas dados básicos do cadastro
  - Após 6 meses inativo: se reativar, precisa atualizar dados e refazer teste

- **RF-016:** Regras de reativação:
  - Se reativar dentro de 6 meses: restaurar perfil completo
  - Se reativar após 6 meses: obrigar atualização de dados + novo teste
  - Se early_adopter e período de lançamento expirou: paga preço normal

### Dashboard de Assinaturas

- **RF-017:** Dashboard com:
  - Total de assinantes por plano (candidatos e empresas)
  - Distribuição por período (mensal / trimestral / semestral / anual)
  - Gráfico de crescimento de assinantes (últimos 6 meses)
  - Top empresas por plano
  - Assinaturas próximas da expiração (próximos 7 dias)
  - Early adopters: quantos, valor total

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Listagem de assinaturas com filtros < 2 segundos
- **RNF-002 (Consistência):** Mudança de plano deve atualizar features em < 5 segundos
- **RNF-003 (Auditoria):** Toda mudança de plano/assinatura registrada com admin e timestamp
- **RNF-004 (Mock):** Como não há gateway de pagamento, assinaturas podem ser criadas manualmente pelo admin para testes

---

## Critérios de Aceitação

### RF-001/002/003: CRUD de Planos

```gherkin
DADO que o admin acessar Configurações → Planos e Assinaturas
QUANDO visualizar os planos de candidato
ENTÃO deve ver os 3 planos com preços por período
  E deve poder editar preços, descrições e status
  E ao salvar, os novos valores devem ser refletidos imediatamente
```

### RF-006/007: Features por Plano

```gherkin
DADO que o admin está na tela de Features por Plano
QUANDO visualizar a matriz plano × features
ENTÃO deve ver todas as features com checkboxes por plano
  E ao marcar/desmarcar uma feature para um plano
  E ao salvar, assinantes do plano devem ter acesso atualizado
```

### RF-015: Cancelamento

```gherkin
DADO que um candidato com plano "Avançar" cancela a assinatura
QUANDO o período pago expirar
ENTÃO o perfil deve mudar para status "inativo"
  E empresas não devem ver o perfil do candidato nas buscas
  E o candidato deve ver apenas dados básicos do cadastro
  E se tentar reativar após 6 meses, deve ser obrigado a refazer o teste
```

### RF-004: Preços de Lançamento

```gherkin
DADO que o período de lançamento está ativo
QUANDO uma empresa assinar o plano "Seleção Inteligente" mensal
ENTÃO deve pagar R$ 69,90 (preço de lançamento) em vez de R$ 99,90
  E deve ser marcada como early_adopter
  E ao renovar, deve manter o preço de lançamento
```

### Cenários de Erro

```gherkin
DADO que o admin tenta desativar um plano que tem assinantes ativos
QUANDO tentar desativar
ENTÃO deve exibir alerta "Este plano tem N assinantes ativos"
  E pedir confirmação "Assinantes serão migrados para qual plano?"
  E NÃO desativar sem migração definida
```

---

## Modelo de Dados

### Tabela: `plans`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| name | VARCHAR(100) | Nome do plano |
| slug | VARCHAR(50) | Identificador único |
| type | ENUM | 'candidate', 'company' |
| description_short | VARCHAR(300) | Tagline |
| description_long | TEXT | Descrição completa |
| price_monthly | DECIMAL(10,2) | Preço mensal (0 para gratuito) |
| price_quarterly | DECIMAL(10,2) | Preço trimestral (nullable) |
| price_semiannual | DECIMAL(10,2) | Preço semestral (nullable) |
| price_annual | DECIMAL(10,2) | Preço anual (nullable) |
| launch_price_monthly | DECIMAL(10,2) | Preço de lançamento mensal (nullable) |
| launch_price_quarterly | DECIMAL(10,2) | Preço de lançamento trimestral (nullable) |
| launch_price_semiannual | DECIMAL(10,2) | Preço de lançamento semestral (nullable) |
| launch_price_annual | DECIMAL(10,2) | Preço de lançamento anual (nullable) |
| launch_start_date | DATE | Início do período de lançamento |
| launch_end_date | DATE | Fim do período de lançamento |
| is_launch_active | BOOLEAN | Se usar preço de lançamento |
| badge | VARCHAR(50) | Badge (ex: "Mais popular") |
| display_order | INT | Ordem de exibição |
| is_free | BOOLEAN | Se é plano gratuito |
| is_active | BOOLEAN | Se está ativo |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: `plan_capabilities`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| capability_key | VARCHAR(100) | Identificador único (snake_case) |
| name | VARCHAR(200) | Nome amigável |
| description | TEXT | Descrição da feature |
| category | ENUM | 'visibility', 'reports', 'filtering', 'access', 'support', 'other' |
| value_type | ENUM | 'boolean', 'enum', 'number' |
| is_active | BOOLEAN | Se a feature está ativa |
| created_at | TIMESTAMP | Criação |

### Tabela: `plan_capability_assignments`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| plan_id | UUID | FK plano |
| capability_id | UUID | FK feature |
| is_enabled | BOOLEAN | Se habilitada para este plano |
| value | VARCHAR(100) | Valor se enum (ex: 'level_1', 'partial') |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: `subscriptions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK usuário (candidato ou empresa) |
| user_type | ENUM | 'candidate', 'company' |
| plan_id | UUID | FK plano |
| period | ENUM | 'monthly', 'quarterly', 'semiannual', 'annual' |
| price_paid | DECIMAL(10,2) | Valor pago |
| start_date | DATE | Início da assinatura |
| end_date | DATE | Fim do período |
| renewal_date | DATE | Próxima renovação |
| status | ENUM | 'active', 'cancelled', 'expired', 'suspended' |
| is_early_adopter | BOOLEAN | Se assinou durante lançamento |
| cancelled_at | TIMESTAMP | Data de cancelamento (nullable) |
| cancel_reason | TEXT | Motivo do cancelamento (nullable) |
| admin_notes | TEXT | Notas internas |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: `subscription_history`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| subscription_id | UUID | FK assinatura |
| action | ENUM | 'created', 'upgraded', 'downgraded', 'cancelled', 'reactivated', 'expired', 'renewed' |
| from_plan_id | UUID | Plano anterior (nullable) |
| to_plan_id | UUID | Plano novo (nullable) |
| performed_by | UUID | FK admin ou system |
| notes | TEXT | Observações |
| created_at | TIMESTAMP | Data da ação |

### Tabela: `one_time_purchases`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK usuário |
| user_type | ENUM | 'candidate', 'company' |
| capability_id | UUID | FK feature comprada |
| price_paid | DECIMAL(10,2) | Valor pago |
| purchased_at | TIMESTAMP | Data da compra |
| expires_at | TIMESTAMP | Expiração (nullable = permanente) |
| is_active | BOOLEAN | Se ainda ativa |

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de dados e seed dos planos | 3 |
| 2 | CRUD de planos (candidatos e empresas) | 4 |
| 3 | Features/capabilities e matriz plano×feature | 4 |
| 4 | Gestão de assinaturas e regras de ciclo de vida | 5 |
| 5 | Dashboard de assinaturas, preços de lançamento, compra avulsa | 4 |

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

**Codinomes:** Sugestão: "Commerce" (monetização e assinaturas)

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

- **Added** — novas funcionalidades
- **Changed** — mudanças em funcionalidades existentes
- **Fixed** — correções de bugs

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Mudança de plano não pode travar acesso do usuário |
| **Fail gracefully** | Se check de capability falhar, permitir acesso (fail open para UX) |
| **Preservar evidências** | Histórico de assinaturas é imutável (append-only) |
| **Testar incrementalmente** | Validar cada regra de ciclo de vida isoladamente |
| **Documentar decisões** | Registrar decisões de pricing |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Capabilities** | Usar capability_key como constante no código |
| **Check de acesso** | Função `hasCapability(userId, capabilityKey)` centralizada |
| **Preços** | Armazenar em centavos (INT) internamente se preferível |
| **Early Adopter** | Flag na assinatura, não no plano |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Hardcodar planos ou preços no código (sempre do banco) |
| Excluir planos (desativar) |
| Mudar features de plano sem notificar assinantes |
| Permitir downgrade imediato (sempre ao fim do período) |
| Apagar histórico de assinatura |

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
