# PRD-091: Gestão Administrativa de Colaboradores (Admin)

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-055` | Gestão de Equipes: Core e Mapa Comportamental |
| `PRD-061` | Admin: Gestão de Usuários e Permissões (RBAC) |
| `PRD-076` | Regras de Billing e Upgrade |
| `PRD-090` | Ciclo de Vida do Colaborador (Empresa) |
| **`PRD-091`** | ⬅ Você está aqui — Gestão Administrativa de Colaboradores (Admin) |

---

# PRD-091: Gestão Administrativa de Colaboradores (Admin)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Admin |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar ferramentas administrativas para gestão cross-company de colaboradores, incluindo transferência entre empresas com rastreabilidade, correção de vínculos indevidos, exclusão forçada com justificativa para casos excepcionais, auditoria multi-empresa, impacto automático no billing ao movimentar colaboradores, e listagem administrativa global com busca e filtros avançados |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Média |
| **Épico** | Painel Admin — Gestão Avançada |
| **PRDs Relacionados** | PRD-055, PRD-061, PRD-076, PRD-090 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade — operações cross-company que atravessam RLS, lógica de transferência com opção de migrar ou não histórico comportamental, integração com billing para ajuste de contagem de colaboradores ativos, auditoria com trilha multi-empresa, e exclusão forçada (hard delete) com múltiplas verificações de segurança.

---

## Contexto do Problema

Com o PRD-090 implementado, o gestor da empresa tem controle completo sobre o ciclo de vida dos seus colaboradores: desligamento, afastamento, movimentações e anonimização. Porém, existem operações que **nenhuma empresa individual pode executar** — elas exigem visão e permissão de plataforma:

1. **Transferência entre empresas:** Um colaborador que muda de filial dentro de um grupo econômico, ou que sai de uma empresa e entra em outra — ambas clientes do RecrutaRS. Nenhuma das duas empresas tem visibilidade sobre os dados na outra. Apenas o admin da plataforma pode intermediar.

2. **Correção de vínculos:** Erros operacionais como colaborador vinculado à empresa errada (ex: empresa de teste vs produção), duplicidade de registros entre empresas, ou convites que criaram vínculos indevidos. O suporte precisa poder corrigir sem depender do gestor da empresa.

3. **Exclusão forçada:** Casos excepcionais — fraude, ordem judicial, ou LGPD com pedido urgente — onde o soft delete do PRD-090 não é suficiente e o registro precisa ser permanentemente removido do banco. Operação de último recurso com múltiplas confirmações.

4. **Visão cross-company:** O admin precisa encontrar um colaborador por nome, email ou CPF independente da empresa, para atender chamados de suporte, investigar inconsistências ou gerar relatórios consolidados.

5. **Impacto no billing:** Quando um colaborador é transferido ou desvinculado administrativamente, a contagem de colaboradores ativos da empresa muda — e isso pode afetar o plano contratado (PRD-076).

---

## Conceito da Solução

### Situação Atual (As-Is)

- Admin não tem visão consolidada de colaboradores entre empresas
- Não existe mecanismo de transferência entre empresas
- Correção de vínculos exige acesso direto ao banco de dados
- Exclusão é sempre soft delete — não há caminho para hard delete em casos excepcionais
- Movimentações administrativas não impactam automaticamente o billing
- Auditoria de colaboradores é limitada ao escopo de uma empresa

### Situação Desejada (To-Be)

- Listagem administrativa global de colaboradores com busca cross-company
- Transferência de colaborador entre empresas com opções de migração de histórico
- Correção de vínculos: desvincular, revincular, corrigir empresa
- Exclusão forçada (hard delete) com justificativa, confirmação tripla e auditoria permanente
- Auditoria multi-empresa: timeline de um colaborador que passou por várias empresas
- Ajuste automático de contagem de colaboradores no billing ao transferir/desvincular
- Todas as operações restritas a roles admin com permissões específicas

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Deixar transferências para as empresas resolverem (uma desliga, outra contrata) | Perde histórico comportamental, cria trabalho duplicado, não rastreia a transferência |
| Hard delete via acesso direto ao banco | Inseguro, sem auditoria, sem confirmações, propenso a erros |
| API externa para operações cross-company | Complexidade desnecessária — admin já está autenticado no painel |

---

## Escopo

### Incluído

- ✅ Listagem administrativa global de colaboradores (cross-company)
- ✅ Busca por nome, email, CPF independente de empresa
- ✅ Filtros avançados: empresa, status, departamento, período
- ✅ Transferência de colaborador entre empresas
- ✅ Opção de migrar ou não o histórico comportamental (Gauge-Pro)
- ✅ Correção de vínculos: desvincular, revincular a outra empresa
- ✅ Exclusão forçada (hard delete) com justificativa e confirmação tripla
- ✅ Auditoria multi-empresa (timeline cross-company)
- ✅ Ajuste automático de billing ao transferir/desvincular
- ✅ Log permanente de exclusões forçadas (preservado mesmo após hard delete)
- ✅ Restrição por RBAC: permissões específicas para cada operação

### Excluído

- ❌ Desligamento/afastamento/movimentações internas (PRD-090 — feito pela empresa)
- ❌ Gestão de planos e assinaturas (PRD-060)
- ❌ Criação de colaboradores pelo admin (isso é responsabilidade da empresa)
- ❌ Anonimização LGPD (PRD-090 — feito pela empresa ou a pedido)
- ❌ Integração com sistemas externos de RH
- ❌ Relatórios consolidados de colaboradores (PRD-059)

---

## Requisitos Funcionais

### Listagem Administrativa Global

- **RF-001:** O Painel Admin deve exibir seção "Colaboradores" com listagem global cross-company contendo:
  - Nome, email, CPF (mascarado: ***.XXX.XXX-**)
  - Empresa atual (nome fantasia)
  - Departamento e cargo atuais
  - Status: Ativo / Inativo / Afastado / Desligado / Desvinculado
  - Data de admissão
  - Status Gauge-Pro: Mapeado / Sem teste / Convite pendente
  - Data do último teste

- **RF-002:** Filtros avançados:
  - Empresa (seletor com autocomplete)
  - Status do colaborador
  - Status Gauge-Pro
  - Departamento (filtrado por empresa selecionada)
  - Período de admissão
  - Período de desligamento
  - Busca por nome, email ou CPF (parcial)
  - Flag "Sem empresa" (colaboradores órfãos/desvinculados)

- **RF-003:** Ações disponíveis na listagem (dependem de permissão RBAC):
  - Ver perfil completo (abre perfil cross-company)
  - Transferir para outra empresa
  - Corrigir vínculo
  - Excluir permanentemente

- **RF-004:** O perfil cross-company do colaborador deve exibir:
  - Todos os dados do colaborador (como o gestor vê)
  - Histórico de empresas por onde passou (se houve transferências)
  - Timeline consolidada incluindo eventos de todas as empresas
  - Informações de billing associadas (qual plano, impacto na contagem)

### Transferência entre Empresas

- **RF-005:** O admin deve poder transferir um colaborador da Empresa A para a Empresa B através de modal contendo:
  - Empresa de origem (read-only, preenchida automaticamente)
  - Empresa de destino (seletor com autocomplete — apenas empresas ativas)
  - Departamento de destino (seletor filtrado pela empresa de destino — opcional se a empresa não tem departamentos)
  - Cargo de destino (campo de texto — opcional, pode ser preenchido depois pela empresa)
  - Data efetiva da transferência (obrigatório)
  - Motivo da transferência (obrigatório): `restructuring` (reestruturação), `group_transfer` (transferência entre filiais), `correction` (correção de erro), `support_request` (solicitação de suporte), `other`
  - Opção: "Migrar histórico comportamental" (checkbox, default: sim)
    - Se sim: perfil Gauge-Pro (scores, arquétipo, análise IA) e histórico de testes são copiados para o novo registro
    - Se não: colaborador é criado "limpo" na empresa de destino, histórico fica vinculado à empresa de origem

- **RF-006:** Ao confirmar a transferência, o sistema deve:
  - Desligar o colaborador na Empresa A com motivo `transferred` (novo motivo específico, não aparece nas opções da empresa)
  - Criar novo registro de `team_member` na Empresa B com os dados informados
  - Se migração de histórico = sim: copiar scores Gauge-Pro, arquétipo e referência ao último teste
  - Vincular os dois registros via campo `transferred_from_id` (novo campo em team_members)
  - Registrar evento de transferência na timeline de ambos os registros (origem e destino)
  - Registrar ação completa em log de auditoria admin
  - Ajustar contagem de colaboradores ativos: -1 na Empresa A, +1 na Empresa B
  - Cancelar convites de teste pendentes na Empresa A
  - Notificar gestores de ambas as empresas (se configurado)

- **RF-007:** A transferência deve ser atômica: se qualquer etapa falhar, nenhuma alteração deve ser persistida.

- **RF-008:** O admin deve poder consultar o histórico de transferências de um colaborador:
  - Lista de empresas por onde passou, com datas de entrada e saída
  - Indicação visual de qual registro é o "atual"

### Correção de Vínculos

- **RF-009:** O admin deve poder desvincular administrativamente um colaborador de uma empresa quando:
  - O vínculo foi criado por erro operacional
  - O colaborador foi vinculado a empresa de teste/sandbox por engano
  - Existe duplicidade de registro

- **RF-010:** Ao desvincular administrativamente, o sistema deve:
  - Solicitar motivo: `wrong_company` (empresa errada), `duplicate` (registro duplicado), `test_data` (dados de teste), `support_request` (chamado de suporte), `other`
  - Se motivo = `duplicate`: solicitar qual registro manter (link para o outro registro)
  - Executar soft delete com status `admin_unlinked`
  - Ajustar contagem de billing da empresa
  - Registrar em auditoria: quem fez, motivo, empresa, colaborador

- **RF-011:** O admin deve poder revincular um colaborador órfão (desvinculado) a uma empresa:
  - Seletor de empresa de destino
  - Departamento e cargo (opcionais)
  - Motivo da revinculação
  - Cria novo registro em team_members na empresa de destino

### Exclusão Forçada (Hard Delete)

- **RF-012:** O admin com permissão `users:delete` (super_admin) deve poder executar exclusão permanente de um registro de colaborador, reservada para casos excepcionais:
  - Fraude comprovada
  - Ordem judicial
  - Solicitação LGPD urgente quando anonimização não é suficiente
  - Dados de teste/sandbox que precisam ser removidos completamente

- **RF-013:** A exclusão forçada deve exigir confirmação tripla:
  - Etapa 1: Modal com aviso "Esta ação é irreversível. O registro será permanentemente removido do banco de dados."
  - Etapa 2: Checkbox "Entendo que esta ação não pode ser desfeita e que todos os dados serão perdidos"
  - Etapa 3: Campo de texto — digitar "EXCLUIR PERMANENTEMENTE" para habilitar o botão
  - Justificativa obrigatória (campo de texto com mínimo de 20 caracteres)

- **RF-014:** Ao executar exclusão forçada, o sistema deve:
  - Remover o registro de `team_members` (hard delete)
  - Remover eventos associados em `team_member_events`
  - Remover itens de offboarding associados
  - NÃO remover o registro de auditoria — criar log permanente em tabela separada (`admin_deletion_log`) com:
    - Dados do colaborador no momento da exclusão (snapshot JSON)
    - Empresa, departamento, cargo
    - Justificativa
    - Admin que executou
    - Timestamp
    - IP de origem
  - Ajustar contagem de billing

- **RF-015:** A exclusão forçada NÃO deve estar disponível para:
  - Colaboradores com status `active` (deve desligar antes)
  - Registros que possuem `transferred_from_id` apontando para eles (são referência de outro registro)
  - Nestas situações, o botão deve estar desabilitado com tooltip explicativo

### Auditoria Cross-Company

- **RF-016:** O Painel Admin deve exibir log de auditoria de operações administrativas sobre colaboradores:
  - Transferências realizadas
  - Desvinculações administrativas
  - Revinculações
  - Exclusões forçadas
  - Filtros: por admin, por empresa, por tipo de operação, por período
  - Exportação em CSV

- **RF-017:** No perfil cross-company do colaborador, a seção "Histórico de Empresas" deve exibir:
  - Timeline visual com cada empresa, período, cargo e como saiu (desligado, transferido, desvinculado)
  - Indicação de quais registros têm histórico Gauge-Pro preservado
  - Links para os registros em cada empresa (para admins com permissão)

### Impacto no Billing

- **RF-018:** Ao transferir colaborador da Empresa A para Empresa B, o sistema deve:
  - Decrementar em 1 o count de colaboradores ativos da Empresa A
  - Incrementar em 1 o count de colaboradores ativos da Empresa B
  - Se o plano da Empresa B tem limite de colaboradores e o limite será atingido: exibir aviso ao admin antes de confirmar, mas NÃO bloquear a operação (admin pode forçar)
  - Registrar a alteração em `billing_events` ou tabela equivalente (PRD-076)

- **RF-019:** Ao desvincular administrativamente, o sistema deve:
  - Decrementar em 1 o count da empresa
  - Registrar a alteração com referência ao motivo administrativo

- **RF-020:** Ao excluir permanentemente, o sistema deve:
  - Garantir que a contagem de billing já foi ajustada (o colaborador deve estar desligado/desvinculado antes)
  - Se o registro era `active` no momento da exclusão (edge case que não deveria ocorrer por RF-015), forçar o ajuste

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Listagem global com busca deve retornar resultados em < 3 segundos para até 100.000 registros
- **RNF-002 (Performance):** Transferência (operação atômica) deve completar em < 5 segundos
- **RNF-003 (Segurança):** Todas as operações deste PRD requerem autenticação admin + permissão RBAC específica
- **RNF-004 (Segurança):** CPF deve ser exibido mascarado na listagem; CPF completo apenas no perfil detalhado e com permissão `users:view_pii`
- **RNF-005 (Segurança):** Exclusão forçada deve ser registrada em tabela de auditoria separada que NÃO pode ser alterada ou excluída (append-only)
- **RNF-006 (Integridade):** Transferência é atômica — se falhar, nenhuma alteração persiste
- **RNF-007 (Auditoria):** Toda operação deste PRD registrada com: admin, ação, dados, timestamp, IP
- **RNF-008 (Escalabilidade):** Busca global por CPF/email deve usar índice — não full scan

---

## Critérios de Aceitação

### RF-001/RF-002: Listagem Global

```gherkin
DADO que existem 500 colaboradores distribuídos em 20 empresas
QUANDO o admin acessar "Colaboradores" no Painel Admin
ENTÃO deve ver listagem paginada com todos os colaboradores de todas as empresas
  E ao buscar por email "joao@empresa.com" deve retornar o colaborador correto
  E ao filtrar por "Empresa: Tech Corp" + "Status: Ativo" deve exibir apenas os ativos da Tech Corp
```

### RF-005/RF-006: Transferência

```gherkin
DADO que o colaborador "Maria Silva" pertence à "Empresa Alpha"
  E o admin inicia transferência para "Empresa Beta"
  E seleciona "Migrar histórico comportamental: Sim"
QUANDO confirmar a transferência
ENTÃO Maria deve ter status "terminated" (motivo: transferred) na Empresa Alpha
  E deve existir novo registro de Maria na Empresa Beta com status "active"
  E os scores Gauge-Pro (D1-D5) devem estar presentes no novo registro
  E ambos os registros devem ter evento de transferência na timeline
  E a contagem de billing deve ser: Alpha -1, Beta +1
  E convites de teste pendentes na Alpha devem estar cancelados
```

### RF-005: Transferência sem Migração de Histórico

```gherkin
DADO que o admin transfere colaborador com "Migrar histórico: Não"
QUANDO a transferência for concluída
ENTÃO o novo registro na empresa de destino não deve ter scores Gauge-Pro
  E o gauge_status deve ser "unmapped"
  E o histórico comportamental deve permanecer acessível no registro da empresa de origem
```

### RF-012/RF-013/RF-014: Exclusão Forçada

```gherkin
DADO que o admin (super_admin) precisa excluir permanentemente um registro de colaborador desligado
QUANDO executar as 3 etapas de confirmação + justificativa
ENTÃO o registro deve ser removido de team_members (hard delete)
  E os eventos associados devem ser removidos
  E deve existir registro em admin_deletion_log com snapshot dos dados
  E a ação deve ser irreversível
```

### RF-018: Impacto no Billing

```gherkin
DADO que Empresa Beta tem plano com limite de 50 colaboradores
  E já possui 49 colaboradores ativos
QUANDO o admin transferir um colaborador para a Empresa Beta
ENTÃO deve exibir aviso "Empresa Beta atingirá o limite de 50 colaboradores do plano atual"
  E deve permitir que o admin prossiga (não bloquear)
  E a contagem de billing da Beta deve ser atualizada para 50
```

### Cenários de Erro

```gherkin
DADO que o admin tenta transferir colaborador para uma empresa inativa
QUANDO selecionar a empresa de destino
ENTÃO a empresa inativa não deve aparecer no seletor
```

```gherkin
DADO que o admin tenta excluir permanentemente um colaborador com status "active"
QUANDO tentar acionar a exclusão
ENTÃO o botão deve estar desabilitado
  E tooltip deve informar "Colaborador deve ser desligado antes da exclusão permanente"
```

```gherkin
DADO que o admin (role: moderator) tenta acessar "Exclusão Permanente"
QUANDO clicar na ação
ENTÃO deve receber erro "Você não tem permissão para esta operação. Requer: super_admin"
```

---

## Modelo de Dados

### Alterações na Tabela: `team_members`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| transferred_from_id | UUID | FK para o registro de team_member de onde veio (nullable — preenchido em transferências) |
| transferred_to_id | UUID | FK para o registro de team_member de destino (nullable — preenchido na origem) |
| admin_notes | TEXT | Notas administrativas (visíveis apenas para admin, nullable) |

### Novo valor no ENUM `termination_reason` (team_members)

| Valor | Descrição |
|-------|-----------|
| `transferred` | Desligado por transferência administrativa entre empresas |

### Novo valor no ENUM `status` (team_members)

| Valor | Descrição |
|-------|-----------|
| `admin_unlinked` | Desvinculado administrativamente |

### Nova Tabela: `admin_deletion_log`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| original_team_member_id | UUID | ID original do registro excluído (para referência, o registro já não existe) |
| company_id | UUID | FK empresa à qual pertencia |
| company_name | VARCHAR(200) | Nome da empresa no momento da exclusão (snapshot) |
| collaborator_snapshot | JSONB | Todos os dados do colaborador no momento da exclusão |
| events_snapshot | JSONB | Todos os eventos do colaborador no momento da exclusão |
| justification | TEXT | Justificativa obrigatória fornecida pelo admin |
| deletion_reason | ENUM | `fraud`, `court_order`, `lgpd_urgent`, `test_data`, `other` |
| performed_by | UUID | FK admin que executou |
| performed_by_name | VARCHAR(200) | Nome do admin no momento (snapshot) |
| ip_address | VARCHAR(50) | IP de origem |
| created_at | TIMESTAMP | Quando a exclusão foi executada |

> **Nota:** Esta tabela é append-only. RLS deve impedir DELETE e UPDATE. Apenas super_admin pode SELECT.

### Nova Tabela: `admin_transfer_log`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| source_team_member_id | UUID | FK registro na empresa de origem |
| target_team_member_id | UUID | FK registro na empresa de destino |
| source_company_id | UUID | FK empresa de origem |
| target_company_id | UUID | FK empresa de destino |
| transfer_reason | ENUM | `restructuring`, `group_transfer`, `correction`, `support_request`, `other` |
| migrated_gauge_pro | BOOLEAN | Se o histórico comportamental foi migrado |
| effective_date | DATE | Data efetiva da transferência |
| notes | TEXT | Observações adicionais (nullable) |
| performed_by | UUID | FK admin que executou |
| created_at | TIMESTAMP | Quando a transferência foi executada |

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Análise, migrations e preparação | 4 |
| 2 | Listagem administrativa global | 5 |
| 3 | Transferência entre empresas | 7 |
| 4 | Correção de vínculos e exclusão forçada | 6 |
| 5 | Auditoria e billing | 4 |

### Detalhamento das Fases

#### Fase 1: Análise e Preparação

**Objetivo:** Criar modelo de dados e preparar infraestrutura

**Ações:**
- [ ] Auditar tabelas existentes (team_members, team_member_events) e confirmar compatibilidade
- [ ] Criar migration para novos campos em team_members (transferred_from_id, transferred_to_id, admin_notes)
- [ ] Adicionar novos valores aos ENUMs existentes (termination_reason: `transferred`; status: `admin_unlinked`)
- [ ] Criar tabela `admin_deletion_log` com RLS append-only
- [ ] Criar tabela `admin_transfer_log`
- [ ] Criar índices para busca global: email, CPF, nome (full-text)
- [ ] Verificar permissões RBAC necessárias (PRD-061): `teams:transfer`, `teams:admin_unlink`, `users:delete`

**Validação:** Migrations aplicadas, tabelas criadas, índices funcionando, permissões mapeadas

#### Fase 2: Listagem Administrativa Global

**Objetivo:** Implementar a listagem cross-company de colaboradores

**Ações:**
- [ ] Criar rota admin `/admin/colaboradores`
- [ ] Implementar query cross-company (bypass RLS via service_role para admin autenticado)
- [ ] Criar componente de listagem com colunas: nome, email, empresa, departamento, cargo, status, gauge_status
- [ ] Implementar filtros: empresa, status, gauge_status, período, busca por nome/email/CPF
- [ ] Implementar paginação server-side para performance
- [ ] Criar componente de perfil cross-company (visualização unificada)

**Validação:** Admin vê todos os colaboradores de todas as empresas, busca por CPF funciona, filtros combinam corretamente

#### Fase 3: Transferência entre Empresas

**Objetivo:** Implementar o fluxo completo de transferência

**Ações:**
- [ ] Criar componente `AdminTransferModal` com campos de origem, destino, departamento, cargo, data, motivo e flag de migração
- [ ] Implementar edge function `admin-transfer-collaborator` como operação atômica:
  - Desligar na origem (status: terminated, reason: transferred)
  - Criar na destino (com ou sem Gauge-Pro conforme flag)
  - Vincular registros (transferred_from_id / transferred_to_id)
  - Registrar eventos em ambas as timelines
  - Registrar em admin_transfer_log
  - Ajustar billing em ambas as empresas
  - Cancelar convites pendentes na origem
- [ ] Implementar validações: empresa destino ativa, colaborador não já desligado
- [ ] Implementar notificações para gestores de ambas as empresas (opcional, configurável)
- [ ] Implementar visualização "Histórico de Empresas" no perfil cross-company

**Validação:** Transferência atômica funciona, histórico preservado ou não conforme opção, billing ajustado, auditoria registrada

#### Fase 4: Correção de Vínculos e Exclusão Forçada

**Objetivo:** Implementar desvinculação administrativa, revinculação e hard delete

**Ações:**
- [ ] Criar componente `AdminUnlinkModal` com motivo e opção de indicar duplicata
- [ ] Implementar action `admin_unlink` na edge function com ajuste de billing
- [ ] Criar componente `AdminRelinkModal` com seletor de empresa destino
- [ ] Implementar action `admin_relink` criando novo registro na empresa de destino
- [ ] Criar componente `AdminForceDeleteModal` com confirmação tripla e justificativa
- [ ] Implementar edge function `admin-force-delete` com:
  - Snapshot de todos os dados antes de excluir
  - Inserção em admin_deletion_log
  - Hard delete de team_members, team_member_events, offboarding_checklists
  - Validação de pré-condições (status != active, sem referências pendentes)
- [ ] Implementar restrição: botão desabilitado para colaboradores ativos ou com referências

**Validação:** Desvinculação funciona com ajuste de billing, revinculação cria novo registro, exclusão forçada requer todas as confirmações e preserva log permanente

#### Fase 5: Auditoria e Billing

**Objetivo:** Implementar log de auditoria admin e integração com billing

**Ações:**
- [ ] Criar tela de auditoria admin: `/admin/auditoria/colaboradores`
- [ ] Implementar listagem de operações com filtros (admin, empresa, tipo, período)
- [ ] Implementar exportação CSV do log de auditoria
- [ ] Integrar com sistema de billing (PRD-076): notificar módulo de billing a cada alteração de contagem
- [ ] Implementar alerta de limite de plano ao transferir para empresa próxima do teto

**Validação:** Log de auditoria completo e filtrável, billing ajustado automaticamente, alertas de limite funcionando

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-055 | Gestão de Equipes: Core | ✅ Concluído |
| PRD-090 | Ciclo de Vida do Colaborador (Empresa) | ⏳ Pendente |
| PRD-061 | RBAC (permissões teams:transfer, users:delete) | ⏳ Pendente |
| PRD-076 | Regras de Billing | ✅ Concluído |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Supabase (RLS, Edge Functions, service_role para cross-company) | Infraestrutura | Disponível |
| Sistema de notificações existente | Interno | Disponível |

### Decisões Pendentes

- [ ] Confirmar se a transferência deve notificar automaticamente os gestores ou se é opt-in pelo admin
- [ ] Definir se o `admin_deletion_log` deve ter retention policy próprio ou ser permanente
- [ ] Confirmar se roles `admin` podem executar exclusão forçada ou apenas `super_admin`
- [ ] Definir se transferências devem ser aprovadas pelo gestor da empresa de destino ou se admin tem autonomia total

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Painel Admin — Gestão Avançada"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-055 | Equipes: Core e Mapa Comportamental | ✅ | Base de dados |
| 2 | PRD-061 | Admin: RBAC e Permissões | ⏳ | Permissões necessárias |
| 3 | PRD-076 | Regras de Billing | ✅ | Integração billing |
| 4 | PRD-090 | Ciclo de Vida do Colaborador (Empresa) | ⏳ | Infraestrutura de eventos e timeline |
| **5** | **PRD-091** | **Gestão Administrativa de Colaboradores** | **🔄 ATUAL** | Depende de 090 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| CPF de colaboradores (cross-company) | PII | Mascarado na listagem, completo apenas com `users:view_pii` |
| Justificativa de exclusão forçada | Sensível | Apenas super_admin no admin_deletion_log |
| Snapshot de dados excluídos | PII | Tabela append-only, apenas super_admin |
| Notas administrativas | Sensível | Visíveis apenas para admin |
| Dados de billing por empresa | Comercial | Visíveis apenas para admin com `plans:view` |

### Autenticação e Autorização

| Operação | Permissão Mínima | Role Mínima |
|----------|-----------------|-------------|
| Listar colaboradores (cross-company) | `teams:view` | admin |
| Ver perfil cross-company | `teams:view` + `users:view_pii` | admin |
| Transferir entre empresas | `teams:transfer` | admin |
| Desvincular administrativamente | `teams:admin_unlink` | admin |
| Revincular | `teams:admin_unlink` | admin |
| Exclusão forçada | `users:delete` | super_admin |
| Ver log de auditoria | `audit:view` | admin |
| Ver admin_deletion_log | `audit:view` + `users:delete` | super_admin |

### Auditoria

- Todas as operações registradas em `admin_transfer_log` e/ou `admin_deletion_log`
- admin_deletion_log é **append-only** — nenhum role pode UPDATE ou DELETE
- Cada registro inclui: quem, quando, o quê, IP, justificativa
- Logs de auditoria exportáveis para compliance

---

## Fluxos de Usuário

### Fluxo Principal: Transferência entre Empresas

```
Admin acessa "Colaboradores" no Painel Admin
    │
    ├── Busca por "Maria Silva"
    │
    ├── Encontra Maria na "Empresa Alpha"
    │
    ├── Clica "Transferir"
    │
    ├── Modal de Transferência
    │       ├── Origem: Empresa Alpha (read-only)
    │       ├── Destino: seleciona "Empresa Beta"
    │       ├── Departamento: seleciona "TI" (da Empresa Beta)
    │       ├── Cargo: "Analista Pleno"
    │       ├── Data: 01/04/2026
    │       ├── Motivo: Transferência entre filiais
    │       ├── Migrar Gauge-Pro: ✅ Sim
    │       └── Confirma
    │
    ├── Sistema executa (atômico):
    │       ├── Maria → "terminated" (transferred) na Alpha
    │       ├── Maria → novo registro "active" na Beta com Gauge-Pro
    │       ├── Vínculos: Alpha.transferred_to_id → Beta.id
    │       ├── Billing: Alpha -1, Beta +1
    │       ├── Cancela convites Alpha
    │       ├── Eventos em ambas as timelines
    │       └── Log em admin_transfer_log
    │
    └── Admin vê confirmação com link para ambos os registros
```

### Fluxo: Exclusão Forçada

```
Admin (super_admin) acessa perfil de colaborador desligado
    │
    ├── Clica "Excluir Permanentemente"
    │
    ├── Etapa 1: Aviso de irreversibilidade
    │
    ├── Etapa 2: Checkbox de confirmação
    │
    ├── Etapa 3: Digita "EXCLUIR PERMANENTEMENTE"
    │
    ├── Preenche justificativa (mínimo 20 caracteres)
    │
    ├── Sistema executa:
    │       ├── Snapshot → admin_deletion_log
    │       ├── Hard delete: team_members, events, checklists
    │       └── Ajuste de billing (se necessário)
    │
    └── Registro removido — log permanente preservado
```

### Fluxos de Erro

```
Admin tenta transferir para empresa inativa
    └── Empresa não aparece no seletor (filtrada)

Admin tenta excluir colaborador ativo
    └── Botão desabilitado + tooltip explicativo

Transferência falha no meio (ex: timeout)
    └── Rollback automático — nenhuma alteração persistida
    └── Mensagem de erro com opção de tentar novamente
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

**Codinomes:** Sugestão: "Overseer" (supervisão administrativa, visão panorâmica)

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
| **Atomicidade absoluta** | Transferência é tudo-ou-nada — se qualquer etapa falhar, rollback total |
| **Append-only para auditoria** | admin_deletion_log nunca é alterado ou excluído |
| **Cross-company via service_role** | Usar Supabase service_role para queries cross-company, nunca expor ao frontend |
| **Snapshots antes de destruir** | Toda exclusão forçada deve snapshot completo antes do hard delete |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Cross-company queries** | Implementar via edge function com service_role — nunca expor RLS bypass ao frontend |
| **Índices** | Criar índices em email, CPF (parcial) e nome (full-text) para busca performática |
| **Transferência** | Usar transaction do Supabase (ou edge function com rollback manual) para atomicidade |
| **Billing** | Chamar a mesma lógica de contagem do PRD-076 — não duplicar cálculo |
| **Exclusão** | Edge function separada `admin-force-delete` — não misturar com lifecycle |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Expor queries cross-company diretamente ao frontend (sempre via edge function) |
| Permitir exclusão forçada de registros ativos (deve desligar primeiro) |
| Deletar log de auditoria sob nenhuma circunstância |
| Transferir sem snapshot de billing antes e depois |
| Permitir que roles abaixo de super_admin executem hard delete |
| Alterar registros de admin_deletion_log após criação (append-only) |
| Permitir auto-exclusão (admin excluir seu próprio registro) |

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
| 23/03/2026 | v1 | Criação inicial — Gestão administrativa de colaboradores com visão cross-company |

---

**AILA - Sistemas Inteligentes**
