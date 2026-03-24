# PRD-090: Ciclo de Vida do Colaborador (Empresa)

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-055` | Gestão de Equipes: Core e Mapa Comportamental |
| `PRD-056` | Gestão de Equipes: Compatibilidade e Team Builder |
| `PRD-057` | Gestão de Equipes: Desenvolvimento e Evolução |
| `PRD-061` | Admin: Gestão de Usuários e Permissões (RBAC) |
| `PRD-076` | Regras de Billing e Upgrade |
| `PRD-077` | Fluxo de Contratação e Transição para Gestão de Equipes |
| `PRD-081` | Fluxo de Convite e Semi-Cadastro de Colaboradores |
| **`PRD-090`** | ⬅ Você está aqui — Ciclo de Vida do Colaborador (Empresa) |
| `PRD-091` | Gestão Administrativa de Colaboradores (Admin) |

---

# PRD-090: Ciclo de Vida do Colaborador (Empresa)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Empresa |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar o ciclo de vida completo do colaborador no módulo de Gestão de Equipes, incluindo desligamento formal com preservação de histórico, desvinculação sem exclusão, reativação/recontratação, afastamento temporário com controle de retorno, movimentações internas (promoção, transferência de setor, mudança de cargo) com timeline consolidada, ações em lote para reestruturações, e mecanismo de anonimização LGPD |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 7 |
| **Prioridade** | Alta |
| **Épico** | Gestão de Equipes |
| **PRDs Relacionados** | PRD-055, PRD-056, PRD-057, PRD-061, PRD-076, PRD-077, PRD-081, PRD-091 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade — múltiplos fluxos com regras de negócio distintas (desligamento, desvinculação, afastamento, movimentação), impacto transversal em métricas, mapa comportamental, billing e auditoria, modelo de dados com histórico temporal, e conformidade LGPD com lógica de anonimização.

---

## Contexto do Problema

O RecrutaRS possui hoje um módulo robusto de Gestão de Equipes com três PRDs cobrindo o core comportamental (PRD-055), compatibilidade e team building (PRD-056), e desenvolvimento e evolução (PRD-057). O fluxo de entrada de colaboradores também está bem definido: contratação via pipeline (PRD-077), convite com semi-cadastro (PRD-081), cadastro manual e importação em massa (PRD-055).

Porém, **o ciclo de vida do colaborador termina na admissão**. Não existe processo formal de desligamento, mecanismo de afastamento temporário, registro de movimentações internas, nem caminho para reativação. O PRD-077 explicitamente excluiu "fluxo de desligamento de colaborador" do seu escopo, e o PRD-055 menciona apenas que "desativar colaborador" é uma opção, sem definir processo, motivo ou impacto.

Na prática, isso significa que:
- O gestor não tem como registrar uma demissão formalmente — só pode mudar o status para "inativo", sem motivo, sem data, sem histórico
- Promoções e mudanças de departamento sobrescrevem o dado anterior sem registro — perde-se a trajetória
- Não há como afastar temporariamente um colaborador (licença, férias prolongadas) sem "desativá-lo"
- Um colaborador desligado que é recontratado não tem como ser reativado com seu histórico anterior
- Convites de teste pendentes para colaboradores desligados continuam ativos
- Não há conformidade com LGPD para o direito ao esquecimento

Este PRD fecha o ciclo de vida completo: da admissão ao desligamento, passando por todas as movimentações do meio.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Status do colaborador é campo simples: `active`, `inactive`, `on_leave`
- Mudar status para `inactive` é a única forma de "desligar" — sem motivo, data ou processo
- Promoções e transferências sobrescrevem dados sem histórico
- Afastamento não tem tipo, duração prevista ou retorno controlado
- Colaborador desligado não pode ser reativado com histórico
- Convites de teste pendentes não são cancelados ao desligar
- Não há mecanismo de anonimização LGPD
- Métricas e mapa comportamental incluem todos os registros sem distinção

### Situação Desejada (To-Be)

- Desligamento formal com modal dedicado: motivo, data efetiva, observações confidenciais, checklist de offboarding
- Desvinculação sem exclusão: remove relação empresa↔colaborador preservando conta do usuário
- Reativação/recontratação com preservação de histórico anterior
- Afastamento temporário com tipo, data prevista de retorno, flag de inclusão em métricas
- Movimentações internas registradas como eventos: promoção, transferência de setor, mudança de cargo
- Timeline consolidada no perfil do colaborador: toda a jornada visível
- Ações em lote para reestruturações: mover departamento ou desligar múltiplos colaboradores
- Anonimização LGPD com período de retenção configurável
- Cancelamento automático de convites pendentes ao desligar
- Recálculo automático de métricas e mapa comportamental ao desligar/afastar

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas expandir o campo status com mais valores | Não captura motivo, histórico ou impacto em métricas |
| Excluir registros de colaboradores desligados | Perde histórico comportamental e viola princípio de soft delete |
| Usar campo de observações genérico para registrar movimentações | Não é estruturado, não permite busca, filtros ou relatórios |
| Tratar afastamento como desligamento temporário | Semânticas diferentes — afastamento preserva vínculo ativo |

---

## Escopo

### Incluído

- ✅ Desligamento formal com motivo, data e observações
- ✅ Desvinculação (remoção de vínculo sem excluir conta)
- ✅ Reativação / recontratação com histórico
- ✅ Afastamento temporário com tipo e retorno previsto
- ✅ Retorno de afastamento (manual ou com lembrete)
- ✅ Movimentações internas: promoção, transferência de departamento, mudança de cargo
- ✅ Histórico de posições do colaborador
- ✅ Timeline consolidada no perfil do colaborador
- ✅ Ações em lote: desligamento múltiplo, mudança de departamento em massa
- ✅ Cancelamento automático de convites de teste ao desligar
- ✅ Recálculo de métricas ao desligar/afastar
- ✅ Notificações relevantes (colaborador, gestor, admin)
- ✅ Solicitação de anonimização LGPD
- ✅ Período de retenção configurável por empresa
- ✅ Checklist de offboarding opcional

### Excluído

- ❌ Transferência entre empresas (PRD-091)
- ❌ Exclusão forçada / hard delete (PRD-091)
- ❌ Auditoria cross-company (PRD-091)
- ❌ Listagem administrativa global de colaboradores (PRD-091)
- ❌ Gestão de folha de pagamento, ponto ou férias
- ❌ Integração com sistemas de RH externos
- ❌ Avaliação de desempenho no desligamento
- ❌ Pesquisa de desligamento (exit interview)
- ❌ Cálculo de rescisão ou verbas trabalhistas

---

## Requisitos Funcionais

### Desligamento

- **RF-001:** O sistema deve permitir desligar um colaborador com status `active` ou `on_leave` através de modal dedicado contendo:
  - Motivo do desligamento (obrigatório): `voluntary` (pedido de demissão), `involuntary` (demissão pela empresa), `contract_end` (término de contrato), `retirement` (aposentadoria), `mutual_agreement` (acordo mútuo), `other` (outro — com campo de texto obrigatório)
  - Data efetiva do desligamento (obrigatório): padrão = data atual, aceita data futura para desligamentos programados
  - Observações confidenciais (opcional): campo de texto livre visível apenas para gestores/admins
  - Checkbox de confirmação: "Confirmo o desligamento de [Nome] com efeito em [data]"

- **RF-002:** Ao confirmar o desligamento, o sistema deve:
  - Alterar o status do colaborador para `terminated`
  - Registrar o evento na timeline com todos os dados do modal
  - Cancelar automaticamente todos os convites de teste pendentes (`sent`, `viewed`, `started`) vinculados ao colaborador
  - Excluir o colaborador das métricas ativas e do mapa comportamental
  - Preservar integralmente o perfil Gauge-Pro e o histórico de testes para consulta retroativa
  - Disparar notificação para o gestor do departamento (se diferente de quem executou)

- **RF-003:** Colaboradores com status `terminated` devem:
  - Aparecer na listagem de equipe com filtro "Desligados" (não na visualização padrão)
  - Ter perfil acessível em modo somente leitura (dados + resultados Gauge-Pro)
  - Exibir badge visual "Desligado em [data]" no perfil
  - Não contabilizar em métricas de equipe (headcount, mapa comportamental, distribuição de arquétipos)

- **RF-004:** O sistema deve suportar desligamento programado (data futura):
  - O colaborador permanece `active` até a data efetiva
  - Indicador visual "Desligamento previsto para [data]" no perfil
  - Job automático (ou trigger) altera o status na data efetiva
  - O gestor pode cancelar o desligamento programado antes da data efetiva

- **RF-005:** O sistema deve exibir checklist de offboarding opcional, configurável pela empresa:
  - Itens padrão sugeridos: "Revogar acessos", "Devolver equipamentos", "Transferir responsabilidades", "Realizar entrevista de desligamento"
  - Gestor pode marcar itens como concluídos
  - Checklist é informativo — não bloqueia o desligamento
  - Progresso do checklist visível no perfil do colaborador desligado

### Desvinculação

- **RF-006:** O sistema deve permitir desvincular um colaborador da empresa, distinto do desligamento. A desvinculação é usada quando:
  - O vínculo foi criado por engano
  - O colaborador não pertence mais à empresa mas mantém conta ativa na plataforma (ex: pode ser candidato em outra empresa)

- **RF-007:** Ao desvincular, o sistema deve:
  - Exibir modal de confirmação explicando a diferença entre desvincular e desligar
  - Solicitar motivo da desvinculação: `error` (vínculo por engano), `company_change` (saiu da empresa), `duplicate` (registro duplicado), `other`
  - Remover o registro de `team_members` da empresa (soft delete com flag `unlinked`)
  - Preservar a conta do usuário na plataforma (perfil de candidato, se existir, continua ativo)
  - NÃO preservar dados comportamentais no contexto da empresa (diferente do desligamento)
  - Cancelar convites de teste pendentes
  - Registrar a ação em auditoria

- **RF-008:** Se o colaborador desvinculado possuir `candidate_id` vinculado (veio do pipeline via PRD-077), o candidato deve retornar à condição anterior — visível no banco de talentos da empresa, sem flag `visibility_locked`.

### Reativação / Recontratação

- **RF-009:** O sistema deve permitir reativar um colaborador com status `terminated` através de ação "Recontratar" no perfil do desligado, contendo:
  - Data de readmissão (obrigatório)
  - Departamento (obrigatório — pode ser diferente do anterior)
  - Cargo (obrigatório — pode ser diferente do anterior)
  - Observações (opcional)

- **RF-010:** Ao reativar, o sistema deve:
  - Alterar o status para `active`
  - Criar novo registro na timeline: "Recontratado em [data]"
  - Manter todo o histórico anterior acessível (testes, movimentações, desligamento anterior)
  - Perguntar se o perfil Gauge-Pro existente deve ser mantido como atual ou se é necessário solicitar novo teste
  - Se o perfil anterior tiver mais de 12 meses, sugerir reteste (não obrigatório)
  - Recalcular métricas do departamento incluindo o colaborador reativado

- **RF-011:** Se a reativação é de um colaborador que foi desvinculado (não desligado), o sistema deve criar novo registro em `team_members` com referência ao registro anterior para rastreabilidade.

### Afastamento Temporário

- **RF-012:** O sistema deve permitir registrar afastamento temporário de colaborador `active`, com:
  - Tipo de afastamento (obrigatório): `medical_leave` (licença médica), `maternity` (maternidade/paternidade), `vacation_extended` (férias prolongadas), `unpaid_leave` (licença sem remuneração), `sabbatical` (sabático), `other`
  - Data de início do afastamento (obrigatório)
  - Data prevista de retorno (opcional — alguns afastamentos não têm previsão)
  - Observações (opcional)
  - Flag "Incluir nas métricas durante afastamento": sim/não (padrão: não)

- **RF-013:** Ao registrar afastamento, o sistema deve:
  - Alterar status para `on_leave`
  - Registrar evento na timeline
  - Se flag de métricas = não: excluir temporariamente do mapa comportamental e headcount ativo
  - Manter o perfil acessível normalmente (não é modo somente leitura)
  - Exibir badge "Afastado desde [data] — Retorno previsto: [data]" no perfil e na listagem

- **RF-014:** O sistema deve gerenciar o retorno do afastamento:
  - Ação manual "Registrar Retorno" no perfil do colaborador afastado
  - Se data prevista de retorno foi informada: enviar lembrete ao gestor 7 dias antes ("Colaborador [Nome] tem retorno previsto para [data]")
  - Ao registrar retorno: alterar status para `active`, registrar na timeline, reincluir nas métricas

- **RF-015:** Se o colaborador é desligado durante afastamento (ex: término de contrato durante licença), o fluxo de desligamento (RF-001) deve funcionar normalmente a partir do status `on_leave`.

### Movimentações Internas

- **RF-016:** O sistema deve permitir registrar promoção de colaborador, contendo:
  - Novo cargo (obrigatório)
  - Novo departamento (opcional — se mudou junto)
  - Data efetiva (obrigatório)
  - Motivo/justificativa (opcional)
  - Aprovado por (preenchido automaticamente com o usuário logado)

- **RF-017:** O sistema deve permitir registrar transferência de departamento, contendo:
  - Novo departamento (obrigatório)
  - Novo cargo (opcional — se mudou junto)
  - Data efetiva (obrigatório)
  - Motivo (opcional)

- **RF-018:** O sistema deve permitir registrar mudança de cargo (lateral — sem promoção), contendo:
  - Novo cargo (obrigatório)
  - Data efetiva (obrigatório)
  - Motivo (opcional)

- **RF-019:** Toda movimentação deve:
  - Gerar registro na tabela `team_member_events` com tipo, dados anteriores, dados novos, data efetiva, quem registrou
  - Atualizar os campos atuais do colaborador (department_id, position_id)
  - Registrar na timeline do colaborador
  - NÃO sobrescrever silenciosamente — o histórico de posições deve ser consultável

- **RF-020:** O sistema deve exibir no perfil do colaborador uma seção "Histórico de Posições":
  - Lista cronológica: cargo, departamento, período (de → até), tipo de movimentação
  - Posição atual destacada
  - Exemplo: "Analista Jr. → TI (01/2024 - 06/2024) → Promovido → Analista Pleno → TI (07/2024 - atual)"

### Timeline Consolidada

- **RF-021:** O sistema deve exibir no perfil do colaborador uma timeline visual contendo todos os eventos do ciclo de vida, em ordem cronológica reversa (mais recente primeiro):
  - Admissão (data, origem: manual/pipeline/convite/importação)
  - Testes Gauge-Pro realizados (data, arquétipo resultante)
  - Movimentações (promoção, transferência, mudança de cargo)
  - Afastamentos (início e retorno)
  - Desligamento
  - Reativação/recontratação
  - Observações do gestor (notas adicionadas manualmente)

- **RF-022:** Cada evento na timeline deve exibir:
  - Ícone representativo do tipo de evento
  - Data e hora
  - Descrição do evento
  - Quem registrou (nome do gestor/admin)
  - Detalhes expandíveis (motivo, observações, dados anteriores/novos para movimentações)

- **RF-023:** O gestor deve poder adicionar notas manuais à timeline do colaborador:
  - Campo de texto livre
  - Visibilidade: "Apenas gestores" ou "Gestores e admin"
  - Notas não alteram status nem dados do colaborador

### Ações em Lote

- **RF-024:** O sistema deve permitir desligamento em lote:
  - Selecionar múltiplos colaboradores na listagem de equipe
  - Ação "Desligar selecionados" com modal compartilhado
  - Motivo único para todos ou motivo individual por colaborador
  - Data efetiva única para todos
  - Confirmação: "Você está prestes a desligar [N] colaboradores. Esta ação não pode ser desfeita automaticamente."
  - Processamento com feedback de progresso

- **RF-025:** O sistema deve permitir mudança de departamento em lote:
  - Selecionar múltiplos colaboradores
  - Ação "Mover para departamento"
  - Selecionar departamento de destino
  - Data efetiva e motivo (ex: "Reestruturação organizacional")
  - Cada movimentação gera evento individual na timeline de cada colaborador

- **RF-026:** O sistema deve permitir mudança de status em lote:
  - Selecionar múltiplos colaboradores
  - Ação "Registrar afastamento" ou "Registrar retorno"
  - Dados compartilhados (tipo de afastamento, data)

### LGPD — Anonimização

- **RF-027:** O sistema deve permitir que o colaborador (ou o admin, a pedido) solicite anonimização dos dados pessoais:
  - Solicitação registrada como evento formal
  - Verificação de período de retenção antes de executar

- **RF-028:** O período de retenção deve ser configurável por empresa:
  - Padrão: 5 anos após desligamento
  - Configurável em "Configurações → LGPD → Retenção de dados"
  - Valores permitidos: 1, 2, 3, 5, 7, 10 anos
  - Se o colaborador solicitar antes do período, exibir aviso ao admin com o prazo restante

- **RF-029:** Ao executar a anonimização, o sistema deve:
  - Substituir nome por "Colaborador Anonimizado #[hash]"
  - Substituir email por hash irreversível
  - Remover foto, telefone, CPF e observações pessoais
  - Preservar dados estatísticos agregados: scores Gauge-Pro (D1-D5), arquétipo, departamento, cargo, período de vínculo — mas desvinculados de identidade
  - Preservar a contagem no histórico da empresa (ex: "departamento TI teve 15 colaboradores em 2025")
  - Marcar o registro como `anonymized = true`
  - Registrar a ação em log de auditoria (quem solicitou, quem executou, quando)

- **RF-030:** Dados anonimizados não podem ser revertidos. O sistema deve exigir confirmação dupla antes de executar: primeiro checkbox, depois digitação de "ANONIMIZAR" no campo de confirmação.

### Notificações

- **RF-031:** Notificações de desligamento:
  - Para o gestor do departamento (se não foi quem executou): "[Nome] foi desligado(a) da equipe por [Executor]"
  - Para o colaborador (se tem conta ativa): "Seu vínculo com [Empresa] foi encerrado em [data]" — apenas se a empresa optar por notificar

- **RF-032:** Notificações de movimentação:
  - Para o colaborador (se tem conta ativa): "Você foi promovido(a) para [Cargo] no departamento [Departamento]"
  - Para o gestor do departamento de destino (em transferências): "[Nome] foi transferido(a) para o seu departamento"

- **RF-033:** Notificações de afastamento:
  - Lembrete de retorno ao gestor: 7 dias antes da data prevista
  - Alerta se retorno está vencido: "Colaborador [Nome] deveria ter retornado em [data]"

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Desligamento individual deve completar em < 3 segundos (incluindo cancelamento de convites e recálculo de métricas)
- **RNF-002 (Performance):** Ações em lote para até 100 colaboradores devem completar em < 30 segundos com feedback de progresso
- **RNF-003 (Performance):** Timeline deve carregar últimos 50 eventos em < 2 segundos
- **RNF-004 (Segurança):** Observações confidenciais de desligamento visíveis apenas para roles com permissão `teams:manage` (PRD-061)
- **RNF-005 (Segurança):** Anonimização LGPD deve ser irreversível — dados pessoais não podem ser recuperados após execução
- **RNF-006 (Integridade):** Toda operação de mudança de status deve ser atômica — se o cancelamento de convites falhar, o desligamento não deve ser efetivado parcialmente
- **RNF-007 (Auditoria):** Todas as ações de ciclo de vida devem ser registradas em log de auditoria com: quem, quando, o quê, IP de origem
- **RNF-008 (Compatibilidade):** Os fluxos de cadastro existentes (PRD-055, PRD-077, PRD-081) não devem ser alterados

---

## Critérios de Aceitação

### RF-001/RF-002: Desligamento

```gherkin
DADO que o gestor está no perfil de um colaborador com status "active"
QUANDO acionar "Desligar colaborador"
ENTÃO deve exibir modal com campos: motivo, data efetiva, observações, confirmação
  E ao confirmar, o status deve mudar para "terminated"
  E todos os convites de teste pendentes devem ser cancelados
  E o colaborador não deve mais aparecer no mapa comportamental
  E evento deve ser registrado na timeline
```

### RF-004: Desligamento Programado

```gherkin
DADO que o gestor registrou desligamento com data futura (ex: 30 dias)
QUANDO a data efetiva chegar
ENTÃO o status deve mudar automaticamente para "terminated"
  E o gestor pode cancelar o desligamento antes da data
  E o perfil deve exibir "Desligamento previsto para [data]" enquanto ativo
```

### RF-006/RF-007: Desvinculação

```gherkin
DADO que o gestor quer desvincular um colaborador criado por engano
QUANDO acionar "Desvincular"
ENTÃO o modal deve explicar a diferença entre desvincular e desligar
  E ao confirmar, o registro deve ser marcado como "unlinked"
  E a conta do usuário na plataforma deve continuar ativa
  E se havia candidate_id vinculado, o candidato deve ficar visível novamente no banco de talentos
```

### RF-009/RF-010: Reativação

```gherkin
DADO que o gestor está no perfil de um colaborador com status "terminated"
QUANDO acionar "Recontratar"
ENTÃO deve solicitar nova data de admissão, departamento e cargo
  E ao confirmar, o status deve mudar para "active"
  E todo o histórico anterior deve permanecer acessível
  E se o perfil Gauge-Pro tem mais de 12 meses, sugerir reteste
```

### RF-012/RF-014: Afastamento e Retorno

```gherkin
DADO que o gestor registrou afastamento médico com retorno previsto em 90 dias
QUANDO faltarem 7 dias para o retorno
ENTÃO o gestor deve receber notificação de lembrete
  E ao registrar retorno, o status deve voltar para "active"
  E o colaborador deve ser reincluído nas métricas
```

### RF-016/RF-019: Movimentações Internas

```gherkin
DADO que o gestor promoveu colaborador de "Analista Jr" para "Analista Pleno"
QUANDO a promoção for registrada
ENTÃO o cargo atual deve ser atualizado
  E o histórico de posições deve conter ambos os registros com datas
  E a timeline deve exibir evento "Promoção"
  E os dados anteriores (cargo anterior, departamento anterior) devem ser preservados no evento
```

### RF-024: Ações em Lote

```gherkin
DADO que o gestor selecionou 15 colaboradores do departamento "Vendas" que será extinto
QUANDO acionar "Desligar selecionados"
ENTÃO deve exibir modal com contagem e confirmação
  E cada colaborador deve ter evento individual na timeline
  E feedback de progresso deve ser exibido durante processamento
  E métricas devem ser recalculadas ao final
```

### RF-029/RF-030: Anonimização LGPD

```gherkin
DADO que um colaborador desligado há mais de 5 anos solicitou anonimização
QUANDO o admin confirmar com checkbox + digitação de "ANONIMIZAR"
ENTÃO o nome deve ser substituído por "Colaborador Anonimizado #[hash]"
  E email, CPF e foto devem ser removidos
  E scores Gauge-Pro devem ser preservados sem vínculo de identidade
  E a operação deve ser irreversível
```

### Cenários de Erro

```gherkin
DADO que o gestor tenta desligar um colaborador que já está "terminated"
QUANDO acionar "Desligar"
ENTÃO o botão deve estar desabilitado
  E exibir tooltip "Colaborador já desligado em [data]"
```

```gherkin
DADO que a empresa tenta anonimizar dados de colaborador desligado há menos de 1 ano
  E o período de retenção configurado é 5 anos
QUANDO solicitar anonimização
ENTÃO o sistema deve exibir aviso "Período de retenção não atingido. Dados podem ser anonimizados a partir de [data]"
  E o admin pode forçar a execução com justificativa (ex: ordem judicial)
```

```gherkin
DADO que o gestor tenta registrar afastamento para colaborador com desligamento programado
QUANDO tentar registrar
ENTÃO o sistema deve exibir aviso "Este colaborador tem desligamento previsto para [data]. Deseja prosseguir com o afastamento?"
```

---

## Modelo de Dados

### Alterações na Tabela: `team_members`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| status | ENUM | Expandir para: `active`, `inactive`, `on_leave`, `terminated`, `unlinked` |
| termination_date | DATE | Data efetiva do desligamento (nullable) |
| termination_reason | ENUM | `voluntary`, `involuntary`, `contract_end`, `retirement`, `mutual_agreement`, `other` (nullable) |
| termination_reason_detail | TEXT | Detalhe quando motivo = `other` (nullable) |
| termination_notes | TEXT | Observações confidenciais do desligamento (nullable) |
| termination_scheduled_date | DATE | Data futura programada para desligamento (nullable) |
| leave_type | ENUM | `medical_leave`, `maternity`, `vacation_extended`, `unpaid_leave`, `sabbatical`, `other` (nullable) |
| leave_start_date | DATE | Data de início do afastamento (nullable) |
| leave_expected_return | DATE | Data prevista de retorno (nullable) |
| leave_include_metrics | BOOLEAN | Se inclui nas métricas durante afastamento (default false) |
| previous_team_member_id | UUID | FK para registro anterior se recontratação (nullable) |
| anonymized | BOOLEAN | Se dados foram anonimizados (default false) |
| anonymized_at | TIMESTAMP | Data da anonimização (nullable) |

### Nova Tabela: `team_member_events`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| team_member_id | UUID | FK team_members |
| company_id | UUID | FK empresa (para RLS) |
| event_type | ENUM | `hired`, `terminated`, `unlinked`, `reactivated`, `leave_started`, `leave_returned`, `promoted`, `department_transferred`, `position_changed`, `note_added`, `test_completed`, `test_invited`, `anonymized`, `offboarding_item_completed` |
| event_date | DATE | Data efetiva do evento |
| description | TEXT | Descrição legível do evento |
| metadata | JSONB | Dados estruturados do evento (ex: `{"previous_position": "Analista Jr", "new_position": "Analista Pleno", "previous_department_id": "uuid", "new_department_id": "uuid"}`) |
| performed_by | UUID | FK do usuário que registrou o evento |
| visibility | ENUM | `all_managers`, `managers_and_admin` (para notas confidenciais) |
| created_at | TIMESTAMP | Criação do registro |

### Nova Tabela: `offboarding_checklists`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| team_member_id | UUID | FK colaborador |
| item_label | VARCHAR(200) | Descrição do item (ex: "Revogar acessos") |
| is_completed | BOOLEAN | Se foi concluído (default false) |
| completed_at | TIMESTAMP | Quando foi concluído (nullable) |
| completed_by | UUID | Quem marcou como concluído (nullable) |
| sort_order | INT | Ordem de exibição |
| created_at | TIMESTAMP | Criação |

### Nova Tabela: `offboarding_templates`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| item_label | VARCHAR(200) | Label do item template |
| is_default | BOOLEAN | Se é item padrão sugerido pelo sistema |
| sort_order | INT | Ordem de exibição |
| is_active | BOOLEAN | Se o template está ativo |
| created_at | TIMESTAMP | Criação |

### Nova Tabela: `data_retention_settings`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa (unique) |
| retention_years | INT | Período de retenção em anos (default 5) |
| updated_at | TIMESTAMP | Última atualização |
| updated_by | UUID | Quem atualizou |

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Análise e preparação do modelo de dados | 3 |
| 2 | Desligamento e desvinculação | 8 |
| 3 | Afastamento temporário e retorno | 5 |
| 4 | Movimentações internas e histórico de posições | 6 |
| 5 | Timeline consolidada | 4 |
| 6 | Ações em lote e notificações | 5 |
| 7 | LGPD e anonimização | 4 |

### Detalhamento das Fases

#### Fase 1: Análise e Preparação

**Objetivo:** Mapear a estrutura atual, criar migrations e preparar modelo de dados

**Ações:**
- [ ] Auditar a tabela `team_members` atual e confirmar campos existentes
- [ ] Criar migration para novos campos em `team_members` (termination_*, leave_*, anonymized, etc.)
- [ ] Criar tabela `team_member_events`
- [ ] Criar tabelas `offboarding_checklists` e `offboarding_templates`
- [ ] Criar tabela `data_retention_settings`
- [ ] Configurar RLS em todas as novas tabelas (company_id)
- [ ] Seed de itens padrão para `offboarding_templates`
- [ ] Verificar e documentar impacto nas queries existentes de métricas e mapa comportamental

**Validação:** Todas as tabelas criadas com RLS, migrations aplicadas sem quebrar funcionalidades existentes

#### Fase 2: Desligamento e Desvinculação

**Objetivo:** Implementar os fluxos de desligamento formal e desvinculação

**Ações:**
- [ ] Criar componente `TerminationModal` com campos de motivo, data, observações e confirmação
- [ ] Criar componente `UnlinkModal` com explicação da diferença e campos de motivo
- [ ] Implementar edge function `manage-team-member-lifecycle` com actions: `terminate`, `unlink`, `cancel_scheduled_termination`
- [ ] Implementar cancelamento automático de convites pendentes ao desligar
- [ ] Implementar lógica de desligamento programado (data futura) com job/trigger
- [ ] Implementar checklist de offboarding (componente + CRUD de templates)
- [ ] Atualizar queries de métricas para excluir `terminated` e `unlinked`
- [ ] Atualizar mapa comportamental para excluir desligados
- [ ] Implementar visualização de colaboradores desligados (filtro na listagem)

**Validação:** Desligamento cria evento, cancela convites, exclui de métricas. Desvinculação remove vínculo sem excluir conta. Checklist funcional.

#### Fase 3: Afastamento e Retorno

**Objetivo:** Implementar registro de afastamento temporário com controle de retorno

**Ações:**
- [ ] Criar componente `LeaveModal` com tipo, datas e flag de métricas
- [ ] Criar componente `ReturnFromLeaveModal`
- [ ] Implementar actions `start_leave` e `return_from_leave` na edge function
- [ ] Implementar lógica de flag `leave_include_metrics` nas queries de métricas
- [ ] Implementar notificação de lembrete de retorno (7 dias antes)
- [ ] Implementar alerta de retorno vencido

**Validação:** Afastamento registrado com tipo e datas, retorno funcional, lembretes disparados, métricas respeitam flag

#### Fase 4: Movimentações Internas

**Objetivo:** Implementar promoção, transferência de departamento e mudança de cargo com histórico

**Ações:**
- [ ] Criar componente `PromotionModal`
- [ ] Criar componente `DepartmentTransferModal`
- [ ] Criar componente `PositionChangeModal`
- [ ] Implementar actions `promote`, `transfer_department`, `change_position` na edge function
- [ ] Garantir que toda movimentação salva dados anteriores no `metadata` do evento
- [ ] Implementar seção "Histórico de Posições" no perfil do colaborador
- [ ] Atualizar campos atuais de `team_members` (department_id, position_id) nas movimentações

**Validação:** Cada movimentação gera evento com dados anteriores/novos preservados, histórico de posições exibido corretamente

#### Fase 5: Timeline Consolidada

**Objetivo:** Implementar a timeline visual no perfil do colaborador

**Ações:**
- [ ] Criar componente `TeamMemberTimeline` com listagem de eventos em ordem cronológica reversa
- [ ] Implementar ícones e badges por tipo de evento
- [ ] Implementar detalhes expandíveis por evento
- [ ] Implementar ação de adicionar notas manuais à timeline
- [ ] Implementar filtros na timeline (por tipo de evento, por período)

**Validação:** Timeline exibe todos os eventos do colaborador, notas podem ser adicionadas, filtros funcionam

#### Fase 6: Ações em Lote e Notificações

**Objetivo:** Implementar operações em massa e sistema de notificações

**Ações:**
- [ ] Implementar seleção múltipla na listagem de equipe
- [ ] Criar componente `BulkTerminationModal`
- [ ] Criar componente `BulkDepartmentTransferModal`
- [ ] Implementar actions em lote na edge function com processamento assíncrono e feedback de progresso
- [ ] Implementar notificações de desligamento (para gestor e colaborador)
- [ ] Implementar notificações de movimentação
- [ ] Implementar notificações de afastamento (lembrete e alerta de vencimento)

**Validação:** Ações em lote processam corretamente, cada colaborador tem evento individual, notificações disparadas

#### Fase 7: LGPD e Anonimização

**Objetivo:** Implementar o mecanismo de anonimização e configuração de retenção

**Ações:**
- [ ] Criar tela de configuração de período de retenção em Configurações da Empresa
- [ ] Implementar action `request_anonymization` com validação de período de retenção
- [ ] Implementar lógica de anonimização: substituir PII, preservar dados estatísticos
- [ ] Implementar confirmação dupla (checkbox + digitação de "ANONIMIZAR")
- [ ] Implementar alerta quando período de retenção não foi atingido (com override para admin + justificativa)
- [ ] Registrar ação em log de auditoria

**Validação:** Anonimização substitui PII preservando estatísticas, operação irreversível, auditoria registrada

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-055 | Gestão de Equipes: Core e Mapa Comportamental | ✅ Concluído |
| PRD-057 | Gestão de Equipes: Desenvolvimento e Evolução | ✅ Concluído |
| PRD-077 | Fluxo de Contratação | ✅ Concluído |
| PRD-081 | Convite e Semi-Cadastro | ✅ Concluído |
| PRD-061 | RBAC (permissões teams:manage) | ⏳ Pendente |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Supabase (RLS, Edge Functions, Cron Jobs) | Infraestrutura | Disponível |
| Sistema de notificações existente | Interno | Disponível |

### Decisões Pendentes

- [ ] Confirmar se o desligamento programado será implementado via Supabase cron job ou trigger com verificação periódica
- [ ] Definir se notificação ao colaborador no desligamento é opt-in ou opt-out por parte da empresa
- [ ] Confirmar se o período de retenção LGPD padrão deve ser 5 anos ou configurável desde o primeiro uso

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Gestão de Equipes"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-055 | Equipes: Core e Mapa Comportamental | ✅ | Base |
| 2 | PRD-056 | Equipes: Compatibilidade e Team Builder | ✅ | Depende de 055 |
| 3 | PRD-057 | Equipes: Desenvolvimento e Evolução | ✅ | Depende de 055, 056 |
| 4 | PRD-077 | Contratação e Transição para Equipes | ✅ | Ponte pipeline→equipes |
| 5 | PRD-081 | Convite e Semi-Cadastro de Colaboradores | ✅ | Entrada via convite |
| **6** | **PRD-090** | **Ciclo de Vida do Colaborador (Empresa)** | **🔄 ATUAL** | Depende de 055, 077, 081 |
| 7 | PRD-091 | Gestão Administrativa de Colaboradores (Admin) | ⏳ | Depende de 090 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Motivo de desligamento | Sensível | Visível apenas para roles com `teams:manage` |
| Observações confidenciais | Sensível | Visível apenas para roles com `teams:manage` |
| Tipo de afastamento | PII (saúde) | RLS por empresa + restrição por role |
| CPF (no contexto de anonimização) | PII | Removido na anonimização |
| Dados do checklist de offboarding | Sensível | RLS por empresa |

### Autenticação e Autorização

- Desligamento e desvinculação: requer role `owner` ou `manager` na empresa (PRD-061)
- Movimentações internas: requer role `owner` ou `manager`
- Anonimização: requer role `owner` da empresa ou `admin` da plataforma
- Notas na timeline com visibilidade "managers_and_admin": visíveis apenas para esses roles
- Ações em lote: requer role `owner` (managers não podem desligar em massa)

### Auditoria

- Toda alteração de status de colaborador registrada em `team_member_events`
- Anonimização registrada com detalhes de quem solicitou e quem executou
- Ações em lote registram cada operação individualmente

---

## Fluxos de Usuário

### Fluxo Principal: Desligamento

```
Gestor acessa perfil do colaborador
    │
    ├── Clica "Desligar colaborador"
    │
    ├── Modal de Desligamento
    │       ├── Seleciona motivo
    │       ├── Define data efetiva
    │       ├── Adiciona observações (opcional)
    │       ├── Marca itens do checklist (opcional)
    │       └── Confirma com checkbox
    │
    ├── Sistema executa:
    │       ├── Altera status → "terminated"
    │       ├── Cancela convites pendentes
    │       ├── Registra evento na timeline
    │       ├── Recalcula métricas
    │       └── Notifica gestor do departamento
    │
    └── Colaborador aparece em "Desligados" (filtro)
```

### Fluxo: Movimentação Interna

```
Gestor acessa perfil do colaborador
    │
    ├── Clica "Registrar movimentação"
    │       ├── Promoção
    │       ├── Transferência de departamento
    │       └── Mudança de cargo
    │
    ├── Modal com dados anteriores (read-only) e novos campos
    │
    ├── Confirma
    │       ├── Atualiza campos atuais
    │       ├── Salva dados anteriores no evento
    │       └── Registra na timeline
    │
    └── Histórico de posições atualizado
```

### Fluxo: Afastamento → Retorno

```
Gestor registra afastamento
    │
    ├── Status → "on_leave"
    ├── Badge "Afastado" na listagem
    ├── Excluído de métricas (se flag = não)
    │
    ├── [7 dias antes do retorno previsto]
    │       └── Notificação ao gestor
    │
    └── Gestor registra retorno
            ├── Status → "active"
            ├── Reincluído nas métricas
            └── Evento na timeline
```

### Fluxos de Erro

```
Gestor tenta desligar colaborador já terminated
    └── Botão desabilitado + tooltip "Já desligado em [data]"

Gestor tenta anonimizar antes do período de retenção
    └── Aviso com data permitida + opção de override (admin + justificativa)

Ação em lote falha no meio do processamento
    └── Operações concluídas são preservadas + relatório de erros exibido
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

**Codinomes:** Sugestão: "Lifecycle" (ciclo de vida do colaborador)

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
| **Soft delete sempre** | Nunca excluir registros — alterar status e preservar histórico |
| **Eventos são imutáveis** | Registros em `team_member_events` nunca são editados ou excluídos |
| **Atomicidade** | Desligamento = status + cancelar convites + recalcular métricas — tudo ou nada |
| **Retroatividade** | Gerar eventos de admissão para colaboradores já existentes que não têm evento |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Edge Function** | Centralizar toda lógica de ciclo de vida em `manage-team-member-lifecycle` com actions |
| **Métricas** | Atualizar todas as queries que contam colaboradores para filtrar por `status = 'active'` (ou incluir `on_leave` quando `leave_include_metrics = true`) |
| **Timeline** | Consultar `team_member_events` com paginação (últimos 50 por padrão) |
| **Modais** | Todos os modais de ação definitiva devem ter confirmação explícita |
| **Anonimização** | Implementar como operação em batch em edge function separada — não misturar com lifecycle |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Hard delete de registros de colaboradores (sempre soft delete) |
| Sobrescrever campos sem registrar evento (toda mudança vira evento) |
| Bloquear desligamento por causa de checklist incompleto (checklist é informativo) |
| Enviar notificação de desligamento ao colaborador sem opt-in da empresa |
| Permitir anonimização sem confirmação dupla |
| Calcular métricas no frontend quando há muitos registros (usar queries agregadas) |
| Misturar lógica de desligamento com desvinculação — são fluxos diferentes |

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
| 23/03/2026 | v1 | Criação inicial — Ciclo de vida completo do colaborador no painel empresa |

---

**AILA - Sistemas Inteligentes**
