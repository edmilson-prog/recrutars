# PRD-076: Regras de Billing e Upgrade

> **AILA - Sistemas Inteligentes**

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-060` | Gestão de Planos e Assinaturas (Commerce) — base |
| `PRD-074` | Reestruturação dos Planos de Empresas — estrutura de planos |
| `PRD-075` | Integração Stripe — infraestrutura de pagamento |
| **`PRD-076`** | ⬅ Você está aqui — Regras de Billing e Upgrade |

---

# PRD-076: Regras de Billing e Upgrade

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Billing / Assinaturas |
| **Repositório** | RecrutaRS Git Repository |
| **Objetivo** | Implementar as regras de negócio de billing: upgrade de plano com cobrança proporcional (proration), downgrade ao fim do período, desconto automático para assinaturas longas, créditos de bônus, conversão de trial para pago, e gestão do ciclo de vida completo da assinatura |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Planos, Billing e Stripe |
| **PRDs Relacionados** | PRD-060, PRD-074, PRD-075 |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, múltiplas regras de negócio interdependentes (proration, descontos, bônus, ciclo de vida), integração com Stripe Billing API |

---

## Contexto do Problema

Com a integração Stripe estabelecida (PRD-075) e os planos reestruturados (PRD-074), falta o componente mais crítico: as **regras de negócio** que governam o ciclo de vida financeiro das assinaturas. Sem essas regras, a plataforma não sabe como cobrar um upgrade no meio do período, como aplicar desconto para assinaturas longas, ou como converter um trial gratuito em assinatura paga.

O cenário mais comum e mais importante é o **upgrade**: uma empresa assinou o Essencial por 6 meses, mas após 2 meses quer mudar para o Avançar. O sistema precisa calcular o valor proporcional restante do Essencial (4 meses não usados), descontar do novo preço do Avançar, e cobrar apenas a diferença. O Stripe possui suporte nativo a proration, mas as regras de negócio de quando e como aplicar precisam estar definidas.

Além disso, existem regras de desconto (10% para 6+ meses), bônus de testes comportamentais que são creditados na ativação, conversão de trial para pago, e regras de cancelamento que afetam o acesso à plataforma. Tudo isso precisa estar orquestrado de forma coerente.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Planos definidos e sincronizados com Stripe (PRD-074 + PRD-075)
- Webhooks processando eventos de pagamento
- Sem regras de upgrade/downgrade implementadas
- Sem cálculo de proration
- Sem fluxo de conversão de trial para pago
- Sem gestão de ciclo de vida da assinatura (renovação, cancelamento, reativação)
- Sem aplicação automática de descontos por período
- Sem crédito de bônus de testes comportamentais

### Situação Desejada (To-Be)

- Upgrade imediato com cobrança proporcional (proration)
- Downgrade programado para o fim do período atual
- Desconto de 10% aplicado automaticamente para períodos de 6+ meses
- Bônus de testes comportamentais creditado na ativação de assinatura qualificada
- Fluxo de conversão de trial para plano pago
- Ciclo de vida completo: assinar → renovar → upgrade → downgrade → cancelar → reativar
- Tela de upgrade/downgrade acessível pela empresa e pelo candidato
- Painel admin com visão completa de billing e histórico de transações

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Upgrade apenas na renovação | Frustra o usuário que quer acesso imediato às novas features |
| Proration manual (cálculo próprio) | Stripe já faz isso nativamente — reimplementar seria redundante e propenso a erros |
| Desconto como cupom Stripe | Adiciona complexidade desnecessária; desconto é regra fixa por período, melhor aplicar no Price |
| Downgrade imediato | Risco de conflito com dados já consumidos no período; downgrade ao fim do período é mais seguro |

---

## Escopo

### Incluído

- ✅ Upgrade de plano com cobrança proporcional (proration) via Stripe
- ✅ Downgrade de plano programado para o fim do período
- ✅ Conversão de trial (Básico Empresas) para plano pago
- ✅ Desconto automático de 10% para assinaturas de 6+ meses
- ✅ Crédito de bônus de testes comportamentais na ativação
- ✅ Tela/fluxo de escolha de plano para empresa e candidato (upgrade, downgrade, assinar)
- ✅ Cancelamento de assinatura (com acesso até fim do período pago)
- ✅ Reativação de assinatura cancelada
- ✅ Histórico de billing no admin (transações, mudanças de plano, valores)
- ✅ Renovação automática de assinaturas via Stripe

### Excluído

- ❌ Nota fiscal / faturamento (futuro)
- ❌ Cupons de desconto personalizados (futuro)
- ❌ Pagamento avulso por feature (futuro — Payment Intents)
- ❌ Mudança de período durante a assinatura (ex: de mensal para semestral — futuro)
- ❌ Reembolso automático (tratado caso a caso pelo admin)

---

## Requisitos Funcionais

### Upgrade de Plano

- **RF-001:** O sistema deve permitir que o assinante (empresa ou candidato) faça upgrade do plano atual para um plano superior a qualquer momento.

  **Hierarquia de planos — Empresas:**
  
  ```
  Básico (trial) → Essencial → Avançar → Premium
  ```
  
  **Hierarquia de planos — Candidatos:**
  
  ```
  Essencial (gratuito) → Avançar → Destaque Máximo
  ```

- **RF-002:** Ao solicitar upgrade, o sistema deve:
  1. Exibir o plano atual com destaque
  2. Exibir os planos superiores disponíveis com preços
  3. Calcular e exibir o valor proporcional a ser cobrado (proration)
  4. Após confirmação e pagamento, ativar o novo plano **imediatamente**
  5. Liberar as novas features do plano superior na hora

- **RF-003:** O cálculo de proration deve seguir a lógica:

  ```
  Crédito = (valor_pago_período_atual / dias_total_período) × dias_restantes
  Valor_upgrade = preço_novo_plano_período_proporcional - Crédito
  Cobra = max(Valor_upgrade, 0)
  ```

  **Exemplo concreto:**
  - Empresa assinou Essencial Semestral: R$ 179,10/mês × 6 = R$ 1.074,60
  - Após 2 meses quer upgrade para Avançar
  - Crédito não utilizado: (R$ 1.074,60 / 180 dias) × 120 dias restantes = R$ 716,40
  - Custo proporcional do Avançar para 120 dias: (R$ 1.344,60 / 180) × 120 = R$ 896,40
  - **Cobra a diferença: R$ 896,40 - R$ 716,40 = R$ 180,00**

  > **Nota:** O Stripe calcula proration nativamente via `proration_behavior: 'create_prorations'` na API de Subscriptions. O RecrutaRS deve usar esse mecanismo, não reimplementar o cálculo.

- **RF-004:** O sistema deve utilizar o recurso nativo de proration do Stripe:
  - Ao fazer upgrade, enviar `subscription.update()` com o novo Price ID e `proration_behavior: 'create_prorations'`
  - O Stripe gera automaticamente um invoice com o valor proporcional
  - O RecrutaRS recebe confirmação via webhook `invoice.payment_succeeded`

- **RF-005:** Antes de confirmar o upgrade, o sistema deve exibir um **resumo de preview** para o assinante:

  | Info | Exemplo |
  |------|---------|
  | Plano atual | Essencial Empresas (Semestral) |
  | Novo plano | Avançar Empresas (Semestral) |
  | Crédito do período não usado | - R$ 716,40 |
  | Custo proporcional do novo plano | + R$ 896,40 |
  | **Valor a pagar agora** | **R$ 180,00** |
  | Próxima cobrança | [data] — R$ 224,10/mês (Avançar Semestral) |
  | Novas features liberadas | [lista de features adicionais] |

  > **Nota:** Esse preview pode ser gerado usando `subscription.update()` com `preview` mode ou `upcoming_invoice` do Stripe.

- **RF-006:** O botão de upgrade deve estar acessível:
  - Na página de "Meu Plano" / "Minha Assinatura" do assinante
  - No card do plano atual com CTA "Fazer Upgrade"
  - Na página de pricing da plataforma

---

### Downgrade de Plano

- **RF-007:** O sistema deve permitir que o assinante faça downgrade para um plano inferior, com as seguintes regras:
  - O downgrade **não é imediato** — entra em vigor ao fim do período atual
  - O assinante mantém acesso completo às features do plano atual até a data de renovação
  - Na renovação, o sistema ativa o plano inferior automaticamente

- **RF-008:** Ao solicitar downgrade, o sistema deve:
  1. Exibir aviso claro: "Seu plano será alterado para [Plano Inferior] em [data]. Até lá, você mantém acesso a todas as features atuais."
  2. Listar as features que serão **perdidas** com o downgrade
  3. Solicitar confirmação explícita: "Confirma o downgrade? Esta ação será efetivada em [data]."
  4. Registrar o downgrade como "programado" (scheduled)

- **RF-009:** O sistema deve utilizar `subscription_schedule` ou `cancel_at_period_end` + nova subscription no Stripe para implementar o downgrade programado.

- **RF-010:** O assinante deve poder **cancelar o downgrade programado** antes que ele entre em vigor, mantendo o plano atual.

---

### Conversão de Trial para Plano Pago

- **RF-011:** Empresas no plano Básico (trial) devem poder converter para qualquer plano pago a qualquer momento durante ou após o trial:

  | Cenário | Comportamento |
  |---------|---------------|
  | Converte durante o trial (antes de 90 dias) | Trial encerra, plano pago ativa imediatamente |
  | Converte após expiração do trial | Plano pago ativa, acesso restaurado |
  | Candidato no Essencial (gratuito) quer Avançar | Assinatura criada normalmente |

- **RF-012:** A conversão de trial deve:
  - Criar Customer no Stripe (se ainda não existir)
  - Criar Subscription com o Price do plano escolhido
  - Coletar método de pagamento (cartão via Stripe Elements)
  - Após pagamento confirmado (webhook), ativar plano e remover status de trial
  - Remover todos os avisos/banners de trial

- **RF-013:** Se a empresa converter durante o trial, o sistema **não deve cobrar** pelo tempo restante do trial (o trial é gratuito — não há crédito a calcular).

---

### Desconto Automático por Período

- **RF-014:** O sistema deve aplicar automaticamente desconto de 10% sobre o valor mensal base quando o assinante escolher período semestral ou anual:

  | Período | Desconto | Aplicação |
  |---------|----------|-----------|
  | Mensal | 0% | Preço cheio |
  | Trimestral | 0% | Preço cheio |
  | Semestral | 10% | Sobre valor mensal × 6 |
  | Anual | 10% | Sobre valor mensal × 12 |

- **RF-015:** O desconto já deve estar refletido nos Prices do Stripe (criados no PRD-075). Neste PRD, a regra deve ser:
  - Exibida na tela de escolha de plano: preço cheio riscado + preço com desconto
  - Destacada com tag visual: "Economize 10%" nos períodos qualificados
  - Calculada automaticamente se o admin alterar o preço base

- **RF-016:** Se o admin alterar o percentual de desconto no painel, os Prices do Stripe devem ser atualizados (desativar antigos, criar novos) na próxima sincronização.

---

### Bônus de Testes Comportamentais

- **RF-017:** Ao ativar uma assinatura de 6+ meses (semestral ou anual), o sistema deve creditar testes comportamentais conforme o plano:

  **Empresas:**
  
  | Plano | Bônus (6+ meses) |
  |-------|-----------------|
  | Essencial | 3 testes |
  | Avançar | 5 testes |
  | Premium | 10 testes |

  > **Nota:** Candidatos não recebem bônus de testes nesta versão.

- **RF-018:** Regras de crédito de bônus:
  - Creditados **uma vez** no momento da ativação da assinatura qualificada
  - Visíveis no dashboard: "Testes comportamentais disponíveis: X"
  - Consumidos ao aplicar testes em candidatos (para empresas)
  - **Não acumulativos** entre renovações: ao renovar, recebe novos créditos (os anteriores não usados são perdidos)
  - **Não transferíveis** entre planos: ao fazer upgrade/downgrade, os créditos atuais são mantidos mas não complementados

- **RF-019:** Se uma empresa fizer upgrade de Essencial (3 bônus) para Avançar (5 bônus) e já tiver usado 1 dos 3:
  - Mantém os 2 créditos restantes do Essencial
  - **Não** recebe os 5 do Avançar (já foram creditados na ativação original)
  - Na **próxima renovação** no plano Avançar, recebe 5 novos créditos

---

### Cancelamento de Assinatura

- **RF-020:** O assinante deve poder cancelar sua assinatura a qualquer momento, com as seguintes regras:
  - Acesso mantido até o fim do período já pago
  - Após o fim do período, acesso bloqueado conforme regras do PRD-074 (RF-006)
  - Cancelamento deve ser feito com confirmação dupla

- **RF-021:** O fluxo de cancelamento deve:
  1. Perguntar o motivo do cancelamento (seleção de opções + campo livre)
  2. Exibir o que o assinante vai perder: lista de features e data de bloqueio
  3. Oferecer alternativa: "Que tal fazer um downgrade em vez de cancelar?"
  4. Solicitar confirmação final: "Tem certeza? Seu acesso será encerrado em [data]."
  5. Registrar o cancelamento como `cancel_at_period_end: true` no Stripe

- **RF-022:** Motivos de cancelamento para coleta:
  - Preço muito alto
  - Não uso mais a plataforma
  - Encontrei alternativa melhor
  - Funcionalidades insuficientes
  - Problemas técnicos
  - Outro (campo livre)

- **RF-023:** Os motivos de cancelamento devem ser armazenados e visíveis no admin para análise de churn.

---

### Reativação de Assinatura

- **RF-024:** O assinante que cancelou deve poder reativar, com regras diferenciadas:

  | Cenário | Regra |
  |---------|-------|
  | Cancelou mas período ainda não expirou | Reverter cancelamento — `cancel_at_period_end: false` no Stripe |
  | Período expirou há menos de 6 meses | Pode assinar novamente qualquer plano. Perfil preservado. |
  | Período expirou há mais de 6 meses | Pode assinar novamente, mas deve atualizar dados e refazer teste comportamental (conforme PRD-060/RF-015). |

- **RF-025:** Na reativação, se a empresa foi early_adopter e o período de lançamento expirou, ela paga o preço normal (não mantém preço de lançamento).

---

### Renovação Automática

- **RF-026:** Assinaturas devem ser renovadas automaticamente pelo Stripe ao fim de cada período:
  - Stripe tenta cobrar o cartão cadastrado
  - Em caso de sucesso: webhook `invoice.payment_succeeded` → assinatura renovada
  - Em caso de falha: webhook `invoice.payment_failed` → assinatura marcada como `past_due`

- **RF-027:** Em caso de falha de pagamento na renovação:
  - O Stripe tenta novamente automaticamente (retry schedule configurável)
  - O sistema deve avisar o assinante: "Houve um problema com seu pagamento. Atualize seu método de pagamento para manter o acesso."
  - Após X tentativas falhas (configurável, default 3), assinatura cancelada automaticamente

- **RF-028:** O aviso de falha de pagamento deve ser visual na plataforma (banner vermelho) informando que a assinatura está em risco.

---

### Tela de Escolha de Plano (Assinante)

- **RF-029:** O sistema deve oferecer uma tela acessível ao assinante (empresa ou candidato) para gerenciar sua assinatura:

  **Seção "Meu Plano":**
  
  | Info exibida | Descrição |
  |-------------|-----------|
  | Plano atual | Nome, preço, período |
  | Status | Ativa / Cancelamento programado / Pagamento pendente |
  | Próxima cobrança | Data e valor |
  | Método de pagamento | Últimos 4 dígitos do cartão |
  | Histórico de pagamentos | Lista de invoices (data, valor, status) |
  | Bônus disponíveis | Testes comportamentais: X restantes |

  **Ações disponíveis:**
  
  | Ação | Quando disponível |
  |------|------------------|
  | Fazer Upgrade | Quando existem planos superiores |
  | Fazer Downgrade | Quando existem planos inferiores |
  | Cancelar assinatura | Sempre (exceto trial) |
  | Atualizar pagamento | Sempre |
  | Ver comparativo de planos | Sempre |

- **RF-030:** A tela de comparativo de planos deve exibir os planos lado a lado com:
  - Features de cada plano com check/uncheck
  - Preço por período (mensal, trimestral, semestral, anual)
  - Destaque do plano atual
  - Destaque visual no plano recomendado (badge "Mais popular")
  - CTA diferenciado: "Seu plano atual" / "Fazer Upgrade" / "Fazer Downgrade"

---

### Painel Admin — Billing

- **RF-031:** O admin deve ter acesso a uma seção de billing com:

  **Dashboard de Receita:**
  
  | Métrica | Descrição |
  |---------|-----------|
  | MRR (Monthly Recurring Revenue) | Receita recorrente mensal total |
  | Assinantes ativos | Total por plano e tipo |
  | Churn rate | Percentual de cancelamentos no período |
  | Upgrades no período | Quantidade e valor incremental |
  | Downgrades no período | Quantidade e valor decremental |
  | Conversões trial → pago | Quantidade e plano escolhido |
  | Motivos de cancelamento | Ranking dos motivos mais citados |

- **RF-032:** O admin deve poder visualizar o histórico de billing de cada assinante:
  - Todas as transações (pagamentos, proration, reembolsos)
  - Mudanças de plano com datas e valores
  - Status atual da assinatura
  - Bônus creditados e consumidos
  - Invoices do Stripe vinculadas

- **RF-033:** O admin deve poder executar ações manuais:
  - Forçar upgrade/downgrade de um assinante
  - Cancelar assinatura manualmente
  - Creditar bônus de testes manualmente
  - Adicionar nota interna ao registro de billing

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O cálculo de preview de upgrade (proration) deve retornar em menos de 3 segundos (depende da latência do Stripe).

- **RNF-002 (Consistência):** Após pagamento confirmado via webhook, o novo plano deve ser ativado em menos de 30 segundos.

- **RNF-003 (Segurança):** Dados de pagamento (cartão) nunca passam pelo nosso servidor — usar Stripe Elements/Checkout.

- **RNF-004 (Auditoria):** Toda mudança de plano, cancelamento, reativação e crédito de bônus deve ser registrada com timestamp, agente (assinante ou admin) e valores envolvidos.

- **RNF-005 (UX):** O fluxo de upgrade deve ter no máximo 3 cliques: "Upgrade" → Preview → "Confirmar e Pagar".

---

## Critérios de Aceitação

### RF-001/002/003: Upgrade com Proration

```gherkin
DADO que uma empresa tem assinatura Essencial Semestral ativa há 2 meses
QUANDO clicar em "Fazer Upgrade" e selecionar Avançar
ENTÃO deve ver preview com:
  - Crédito proporcional dos 4 meses restantes do Essencial
  - Custo proporcional de 4 meses do Avançar
  - Diferença a pagar
  E ao confirmar e pagar com sucesso
  ENTÃO o plano Avançar deve ser ativado imediatamente
  E as features do Avançar devem estar disponíveis na hora
```

### RF-007/008: Downgrade Programado

```gherkin
DADO que uma empresa tem assinatura Premium ativa com renovação em 30 dias
QUANDO solicitar downgrade para Essencial
ENTÃO deve ver mensagem: "Seu plano será alterado para Essencial em [data]"
  E deve ver lista de features que serão perdidas
  E ao confirmar, o downgrade deve ficar como "programado"
  E a empresa deve manter acesso ao Premium até a data de renovação
  E na data de renovação, o plano deve mudar automaticamente para Essencial
```

### RF-010: Cancelar Downgrade

```gherkin
DADO que uma empresa tem downgrade programado de Premium para Essencial
QUANDO clicar em "Cancelar downgrade"
ENTÃO o downgrade deve ser revogado
  E a empresa deve manter o plano Premium normalmente
  E a próxima renovação deve ser no plano Premium
```

### RF-011/012: Conversão de Trial

```gherkin
DADO que uma empresa está no dia 45 do trial do Básico
QUANDO clicar em "Assinar" e escolher o plano Avançar Trimestral
ENTÃO deve coletar método de pagamento via Stripe Elements
  E ao pagamento confirmado, o trial deve encerrar
  E o plano Avançar deve ativar imediatamente
  E todos os avisos de trial devem desaparecer
  E o sistema NÃO deve cobrar pelo tempo restante do trial
```

### RF-014/015: Desconto por Período

```gherkin
DADO que um candidato está na tela de escolha de plano
QUANDO visualizar o plano Destaque Máximo
ENTÃO deve ver para período Semestral:
  - Preço original riscado: "R$ 39,90/mês"
  - Preço com desconto: "R$ 35,91/mês"
  - Tag: "Economize 10%"
```

### RF-017/018: Bônus de Testes

```gherkin
DADO que uma empresa assina o plano Avançar Anual
QUANDO a assinatura for ativada
ENTÃO deve receber 5 créditos de testes comportamentais
  E o dashboard deve exibir "Testes disponíveis: 5"
  E ao usar 1 teste, deve exibir "Testes disponíveis: 4"
```

### RF-020/021: Cancelamento

```gherkin
DADO que uma empresa com plano Essencial Mensal quer cancelar
QUANDO clicar em "Cancelar assinatura"
ENTÃO deve ver pergunta sobre motivo do cancelamento
  E deve ver lista de features que perderá
  E deve ver sugestão de downgrade como alternativa
  E deve ver data em que o acesso será bloqueado
  E ao confirmar, a assinatura deve ser marcada como "cancelamento programado"
  E a empresa deve manter acesso até o fim do período
```

### RF-026/027: Falha de Pagamento

```gherkin
DADO que a renovação automática de uma assinatura falhou
QUANDO o sistema processar o webhook invoice.payment_failed
ENTÃO deve marcar a assinatura como "pagamento pendente"
  E deve exibir banner vermelho para o assinante: "Problema com seu pagamento"
  E deve ser visível no admin como "pagamento pendente"
```

### Cenários de Erro

```gherkin
DADO que uma empresa tenta upgrade mas o pagamento é recusado
QUANDO o Stripe retornar erro de pagamento
ENTÃO deve informar a empresa: "Pagamento recusado. Verifique os dados do cartão."
  E o plano atual deve ser mantido sem alteração
  E nenhuma feature deve ser desbloqueada
```

```gherkin
DADO que uma empresa tenta downgrade para Básico (trial)
QUANDO selecionar o plano Básico
ENTÃO o sistema deve impedir: "O plano Básico é exclusivo para novos cadastros."
  E NÃO deve permitir downgrade para trial
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Upgrade com proration | 5-6 |
| 2 | Downgrade programado | 4-5 |
| 3 | Conversão de trial e desconto | 4-5 |
| 4 | Bônus, cancelamento e reativação | 5-6 |
| 5 | Tela do assinante, admin billing e validação | 5-6 |

### Detalhamento das Fases

#### Fase 1: Upgrade com Proration

**Objetivo:** Implementar o fluxo completo de upgrade com cobrança proporcional.

**Ações:**
- [ ] Implementar endpoint para gerar preview de upgrade (usando Stripe `upcoming_invoice`)
- [ ] Implementar tela de preview mostrando crédito, custo e diferença
- [ ] Implementar confirmação e execução do upgrade via Stripe `subscription.update()`
- [ ] Implementar ativação imediata do novo plano após confirmação de pagamento (webhook)
- [ ] Implementar atualização de features liberadas após upgrade

**Validação:** Upgrade executado → valor correto cobrado → features liberadas imediatamente.

#### Fase 2: Downgrade Programado

**Objetivo:** Implementar downgrade ao fim do período com opção de cancelamento.

**Ações:**
- [ ] Implementar programação de downgrade via Stripe (subscription_schedule ou similar)
- [ ] Implementar aviso de features que serão perdidas
- [ ] Implementar status "downgrade programado" na interface
- [ ] Implementar cancelamento de downgrade programado
- [ ] Implementar efetivação automática do downgrade na data de renovação

**Validação:** Downgrade programado → features mantidas até renovação → plano muda automaticamente.

#### Fase 3: Conversão de Trial e Desconto

**Objetivo:** Implementar conversão de trial para pago e exibição de descontos.

**Ações:**
- [ ] Implementar fluxo de coleta de pagamento via Stripe Elements
- [ ] Implementar criação de Customer + Subscription para conversão de trial
- [ ] Implementar encerramento do trial e remoção de avisos
- [ ] Implementar exibição de preço com desconto (original riscado + desconto)
- [ ] Implementar tag visual "Economize 10%" nos períodos qualificados

**Validação:** Trial converte para pago → cobrança correta → avisos removidos → descontos visíveis.

#### Fase 4: Bônus, Cancelamento e Reativação

**Objetivo:** Implementar crédito de bônus, fluxo de cancelamento e reativação.

**Ações:**
- [ ] Implementar sistema de créditos de testes comportamentais (creditação, consumo, exibição)
- [ ] Implementar fluxo de cancelamento com coleta de motivo e confirmação
- [ ] Implementar "cancel_at_period_end" no Stripe
- [ ] Implementar sugestão de downgrade como alternativa ao cancelamento
- [ ] Implementar reativação (reverter cancelamento ou nova assinatura)
- [ ] Implementar regras de reativação (< 6 meses vs > 6 meses)

**Validação:** Bônus creditados → cancelamento com motivo → reativação funciona conforme regras.

#### Fase 5: Telas do Assinante, Admin Billing e Validação

**Objetivo:** Implementar interfaces de gestão e validar fluxo completo.

**Ações:**
- [ ] Implementar tela "Meu Plano" para assinante (info, ações, histórico)
- [ ] Implementar tela de comparativo de planos lado a lado
- [ ] Implementar seção de billing no admin (dashboard, histórico, ações manuais)
- [ ] Implementar métricas: MRR, churn rate, conversões, motivos de cancelamento
- [ ] Implementar aviso visual de falha de pagamento
- [ ] Validar fluxo end-to-end: assinar → upgrade → downgrade → cancelar → reativar

**Validação:** Todos os fluxos funcionam corretamente nos dois ambientes (test/production).

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-060 | Gestão de Planos e Assinaturas (Commerce) | ✅ Base |
| PRD-074 | Reestruturação dos Planos de Empresas | ✅/🔄 Planos definidos |
| PRD-075 | Integração Stripe | ✅/🔄 Infraestrutura de pagamento |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Stripe Billing API | Subscriptions, Invoices, Prices | Disponível (configurado no PRD-075) |
| Stripe Elements | Frontend de coleta de pagamento | Disponível |

### Decisões Pendentes

- [ ] Confirmar política de retry em falha de pagamento (quantas tentativas, intervalo)
- [ ] Definir se candidatos também terão bônus de testes em versão futura
- [ ] Decidir se mudança de período (mensal→semestral) será implementada neste PRD ou futuro

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Planos, Billing e Stripe"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 0 | PRD-060 | Gestão de Planos e Assinaturas (Commerce) | ✅ | Base |
| 1 | PRD-074 | Reestruturação dos Planos de Empresas | ✅ | Planos definidos |
| 2 | PRD-075 | Integração Stripe | ✅ | Infraestrutura Stripe |
| **3** | **PRD-076** | **Regras de Billing e Upgrade** | **🔄 ATUAL** | Depende de 074 + 075 |

> **Nota:** Este PRD depende da infraestrutura Stripe (PRD-075) estar funcional e dos planos reestruturados (PRD-074).

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Dados de cartão de crédito | PCI | NUNCA armazenados — Stripe Elements |
| Histórico de pagamentos | Sensível | Visível apenas para o próprio assinante e admins |
| Motivos de cancelamento | Interno | Armazenado no banco, visível apenas para admins |
| Valores de proration | Transacional | Logado para auditoria |

### Autenticação e Autorização

- Assinante pode alterar apenas sua própria assinatura
- Admin pode visualizar e alterar qualquer assinatura (com auditoria)
- Operações financeiras (upgrade, downgrade, cancelamento) requerem confirmação explícita
- Ações do admin em billing devem ser registradas com identificação

### Auditoria

Toda operação de billing deve gerar registro de auditoria:
- Tipo de operação (upgrade, downgrade, cancelamento, reativação, crédito de bônus)
- Agente (assinante ou admin + ID)
- Timestamp
- Valores envolvidos (antes, depois, diferença)
- ID da transação no Stripe

---

## Fluxos de Usuário

### Fluxo 1: Upgrade (Happy Path)

```
Assinante acessa "Meu Plano"
    │
    ▼
Clica "Fazer Upgrade"
    │
    ▼
Seleciona novo plano (ex: Avançar)
    │
    ▼
Vê preview: crédito, custo, diferença
    │
    ▼
Clica "Confirmar e Pagar"
    │
    ▼
Stripe processa pagamento
    │
    ├── Sucesso ──▶ Novo plano ativo imediatamente
    │                Features liberadas
    │
    └── Falha ──▶ "Pagamento recusado"
                   Plano atual mantido
```

### Fluxo 2: Downgrade

```
Assinante acessa "Meu Plano"
    │
    ▼
Clica "Alterar Plano" → Seleciona plano inferior
    │
    ▼
Vê aviso: "Será efetivado em [data]"
Vê features que perderá
    │
    ▼
Confirma ──▶ Status: "Downgrade programado para [data]"
              Acesso atual mantido
    │
    ▼ (na data de renovação)
    │
Plano inferior ativado automaticamente
Features ajustadas
```

### Fluxo 3: Cancelamento com Oferta de Downgrade

```
Assinante clica "Cancelar"
    │
    ▼
Seleciona motivo do cancelamento
    │
    ▼
Sistema sugere: "Que tal um downgrade? Mantenha acesso com menos custo."
    │
    ├── Aceita downgrade ──▶ Fluxo de downgrade
    │
    └── Insiste em cancelar
         │
         ▼
    Vê o que vai perder + data de bloqueio
         │
         ▼
    Confirma ──▶ Cancelamento programado
                  Acesso mantido até [data]
```

### Fluxos de Erro

```
Pagamento de upgrade recusado
    ──▶ Mensagem: "Pagamento recusado. Verifique os dados."
    ──▶ Plano atual mantido, sem alteração

Renovação automática falhou
    ──▶ Banner vermelho: "Problema com pagamento"
    ──▶ Stripe retenta automaticamente
    ──▶ Após 3 falhas: cancelamento automático

Empresa tenta downgrade para Básico (trial)
    ──▶ Bloqueado: "Plano Básico é exclusivo para novos cadastros"
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. PRORATION — USE O STRIPE:**
> - NÃO reimplementar cálculo de proration manualmente
> - Usar `subscription.update()` com `proration_behavior: 'create_prorations'`
> - Usar `upcoming_invoice` para gerar preview antes de confirmar
> - O Stripe gera o invoice com valor correto automaticamente

> **⚠️ 3. DADOS DE CARTÃO:**
> - NUNCA processar dados de cartão no nosso servidor
> - Usar Stripe Elements para coleta segura no frontend
> - Toda interação com cartão acontece entre o browser do usuário e o Stripe diretamente

> **⚠️ 4. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-076-regras-billing-upgrade_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Sugestão para este PRD: **"Billing"** (referência direta ao núcleo financeiro da plataforma).

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
| **Não bloquear fluxo principal** | Falha em operação secundária (ex: log, métrica) não deve impedir upgrade/downgrade |
| **Fail gracefully** | Se preview do Stripe falhar, informar o assinante e permitir retry |
| **Preservar evidências** | Toda transação financeira deve ter rastro completo para auditoria |
| **Testar incrementalmente** | Validar cada fluxo (upgrade, downgrade, cancelamento) independentemente |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Stripe Proration** | Sempre usar `proration_behavior: 'create_prorations'` para upgrades. Para downgrades, usar `subscription_schedule` ou `proration_behavior: 'none'` com mudança programada. |
| **Preview de upgrade** | Usar `GET /v1/invoices/upcoming` com parâmetros de subscription_items para simular o upgrade antes de confirmar. |
| **Stripe Elements** | Para coleta de pagamento na conversão de trial, usar `PaymentElement` ou `CardElement`. Não coletar dados de cartão em formulário próprio. |
| **Webhook idempotência** | Reutilizar a infraestrutura de webhooks do PRD-075. Não duplicar endpoints. |
| **Métricas de billing** | MRR, churn, LTV podem ser calculados a partir dos dados de assinatura + invoices já armazenados. Não precisa de serviço externo. |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Reimplementar cálculo de proration — usar Stripe nativo |
| Armazenar ou processar dados de cartão no servidor |
| Permitir downgrade para o plano Básico (trial) |
| Ativar novo plano antes de confirmação de pagamento |
| Implementar reembolso automático (tratar caso a caso via admin) |
| Ignorar falhas de pagamento na renovação (devem gerar aviso visual) |
| Creditar bônus de teste em upgrade se já foram creditados na ativação original |
| Permitir acúmulo de bônus não usados entre renovações |

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
| 11/02/2026 | v1 | Criação inicial — Regras de billing: upgrade com proration, downgrade programado, conversão de trial, bônus, cancelamento, reativação |

---

**AILA - Sistemas Inteligentes**
