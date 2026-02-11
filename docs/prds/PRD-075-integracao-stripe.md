# PRD-075: Integração Stripe

> **AILA - Sistemas Inteligentes**

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-060` | Gestão de Planos e Assinaturas (Commerce) — base de planos |
| `PRD-074` | Reestruturação dos Planos de Empresas — estrutura atualizada |
| **`PRD-075`** | ⬅ Você está aqui — Integração Stripe |
| `PRD-076` | Regras de Billing e Upgrade (próximo da cadeia) |

---

# PRD-075: Integração Stripe

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Painel Admin / Billing |
| **Repositório** | RecrutaRS Git Repository |
| **Objetivo** | Integrar o RecrutaRS com o Stripe para gerenciar produtos, preços e assinaturas, com administração completa via painel admin, suporte a ambientes de teste e produção, e sincronização bidirecional entre planos internos e o Stripe |
| **Tipo** | Integração |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Planos, Billing e Stripe |
| **PRDs Relacionados** | PRD-060, PRD-074, PRD-076 |
| **Padrão de código** | camelCase para novos campos/tabelas |

---

## Informações do Serviço Externo

### Dados do Provedor

| Campo | Valor |
|-------|-------|
| **Nome do Serviço** | Stripe |
| **Provedor** | Stripe, Inc. |
| **Documentação** | https://docs.stripe.com/api |
| **Tipo de API** | REST |
| **Versão da API** | 2024-12-18.acacia (ou mais recente estável) |
| **Ambientes** | Test (Sandbox) + Production (Live) |

### Credenciais Necessárias

| Credencial | Tipo | Variável de Ambiente |
|------------|------|----------------------|
| Chave publicável (test) | Publishable Key | `STRIPE_TEST_PUBLISHABLE_KEY` |
| Chave secreta (test) | Secret Key | `STRIPE_TEST_SECRET_KEY` |
| Chave publicável (live) | Publishable Key | `STRIPE_LIVE_PUBLISHABLE_KEY` |
| Chave secreta (live) | Secret Key | `STRIPE_LIVE_SECRET_KEY` |
| Webhook Secret (test) | Webhook Signing Secret | `STRIPE_TEST_WEBHOOK_SECRET` |
| Webhook Secret (live) | Webhook Signing Secret | `STRIPE_LIVE_WEBHOOK_SECRET` |

> ⚠️ **NUNCA** incluir credenciais reais em código ou documentos. Usar exclusivamente variáveis de ambiente. As chaves já foram geradas no dashboard do Stripe e devem ser configuradas no ambiente de deploy.

### Limites e Quotas

| Limite | Valor | Consequência se Exceder |
|--------|-------|------------------------|
| Rate Limit (modo teste) | 25 requests/segundo | 429 Too Many Requests |
| Rate Limit (modo live) | 100 requests/segundo | 429 Too Many Requests |
| Payload Máximo | 4 MB | 413 Payload Too Large |
| Webhook Timeout | 30 segundos | Retry automático pelo Stripe |
| Webhook Retries | Até 3 dias | Evento marcado como falho |

---

## Contexto da Integração

### Por que Integrar?

O RecrutaRS definiu 4 planos de empresa (PRD-074) e 3 planos de candidato com preços, períodos e descontos configuráveis. Atualmente toda a gestão de planos é interna — não existe gateway de pagamento que processe cobranças reais. Para que a plataforma possa monetizar, é necessário um sistema que crie produtos e preços no Stripe espelhando os planos do admin, gerencie o ciclo de vida de assinaturas (criação, cobrança, renovação, cancelamento), e receba notificações de eventos via webhooks.

A escolha do Stripe se dá pela robustez da API, suporte nativo a assinaturas recorrentes com proration, ambiente de teste completo (sem cobranças reais), e portal do cliente para autogestão de pagamento. Além disso, o Stripe suporta nativamente as regras de negócio que serão detalhadas no PRD-076 (upgrade com cobrança proporcional, descontos por período, trial).

Um requisito fundamental é que toda a configuração seja feita **via painel admin** — sem necessidade de acessar o dashboard do Stripe para operações rotineiras. O admin deve poder criar, editar, atualizar e excluir planos tanto no ambiente de teste quanto de produção, com distinção visual clara entre eles.

### Fluxo de Dados

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   PAINEL ADMIN  │ ──────▶ │     STRIPE      │ ──────▶ │   RECRUTARS     │
│   (Configura    │ Products│   (Processa     │ Webhooks│   (Atualiza     │
│    planos)      │ & Prices│    pagamentos)  │         │    assinaturas) │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        │                           │                           │
        ▼                           ▼                           ▼
  Cria/edita plano          Cobra assinante           Ativa/cancela plano
  no admin                  via cartão/PIX            do usuário
```

### Direção da Integração

| Direção | Descrição |
|---------|-----------|
| [x] **Outbound** | Admin envia dados de planos para o Stripe (Products, Prices) |
| [x] **Inbound** | Stripe envia eventos para o RecrutaRS via webhooks (pagamentos, cancelamentos) |
| [x] **Bidirecional** | Dados fluem em ambas as direções |

---

## Escopo da Integração

### Operações Incluídas

| Operação | Recurso Stripe | Direção | Prioridade |
|----------|---------------|---------|------------|
| Criar produto | Products | Outbound | Alta |
| Atualizar produto | Products | Outbound | Alta |
| Desativar produto | Products | Outbound | Alta |
| Criar preço | Prices | Outbound | Alta |
| Desativar preço | Prices | Outbound | Alta |
| Criar assinatura | Subscriptions | Outbound | Alta |
| Cancelar assinatura | Subscriptions | Outbound | Alta |
| Criar cliente | Customers | Outbound | Alta |
| Atualizar cliente | Customers | Outbound | Média |
| Receber webhook de pagamento | Webhook Events | Inbound | Alta |
| Receber webhook de assinatura | Webhook Events | Inbound | Alta |
| Consultar assinatura | Subscriptions | Outbound | Média |
| Listar preços de produto | Prices | Outbound | Média |

### Operações Excluídas (Escopo Futuro)

| Operação | Motivo da Exclusão |
|----------|-------------------|
| Stripe Checkout (hosted page) | Será avaliado — pode ser implementado se preferido ao checkout inline |
| Stripe Customer Portal | Será avaliado em PRD futuro para autogestão do assinante |
| Cupons e promoções (Coupons API) | Futuro — quando sistema de promoções for implementado |
| Invoices avançados | Futuro — notas fiscais serão tratadas separadamente |
| Connect (marketplace) | Não aplicável ao modelo atual |
| Payment Intents avulsos | Futuro — para compras avulsas de features |

---

## Especificação Técnica

### Autenticação

| Campo | Valor |
|-------|-------|
| **Tipo** | Bearer Token (Secret Key) |
| **Header** | `Authorization: Bearer {STRIPE_SECRET_KEY}` |
| **Expiração** | Não expira (rotação manual via dashboard) |
| **Ambiente** | Determinado pela chave usada (`sk_test_` = teste, `sk_live_` = produção) |

### Conceito Fundamental: Ambiente Test vs Production

- **RF-001:** O sistema deve suportar dois ambientes Stripe operando simultaneamente:

| Aspecto | Ambiente Test | Ambiente Production |
|---------|--------------|---------------------|
| **Prefixo das chaves** | `pk_test_` / `sk_test_` | `pk_live_` / `sk_live_` |
| **Cobranças reais** | Não | Sim |
| **Cartões de teste** | `4242 4242 4242 4242` | Cartões reais |
| **Indicação visual no admin** | Badge "🧪 TESTE" (cor laranja/amarela) | Badge "🟢 PRODUÇÃO" (cor verde) |
| **Dados isolados** | Produtos/preços/clientes de teste | Produtos/preços/clientes reais |

- **RF-002:** O admin deve poder visualizar e operar nos dois ambientes a partir da mesma interface, com distinção visual clara e impossibilidade de confundir operações de teste com produção.

- **RF-003:** O admin deve poder escolher o ambiente ativo por meio de um seletor visualmente destacado (toggle ou dropdown). Ao trocar de ambiente, todos os dados exibidos devem refletir o ambiente selecionado.

---

## Requisitos Funcionais

### Configuração de Credenciais

- **RF-004:** O sistema deve permitir que o admin configure as credenciais do Stripe pelo painel admin, em uma seção dedicada de configurações (ex: Configurações → Integrações → Stripe):
  - Campos para chaves de teste (publishable e secret)
  - Campos para chaves de produção (publishable e secret)
  - Botão "Testar conexão" que valida se as chaves são válidas fazendo um request de leitura
  - Status de conexão visível: "Conectado" / "Desconectado" / "Erro" para cada ambiente
  - As chaves secretas devem ser exibidas mascaradas após salvas (ex: `sk_test_...wQUnO`)

- **RF-005:** As credenciais devem ser armazenadas de forma segura:
  - Chaves secretas devem ser criptografadas em repouso
  - Nunca retornadas completas em responses da API interna
  - Acessíveis apenas no backend para requests ao Stripe

### Sincronização de Planos → Stripe Products

- **RF-006:** Cada plano do RecrutaRS deve ser espelhado como um **Product** no Stripe:

| Campo RecrutaRS | Campo Stripe Product |
|----------------|---------------------|
| Nome do plano | `name` |
| Slug do plano | `metadata.slug` |
| Descrição curta | `description` |
| Tipo (candidato/empresa) | `metadata.type` |
| Ativo/Inativo | `active` |
| ID interno do plano | `metadata.recrutars_plan_id` |

- **RF-007:** O admin deve poder, a partir da interface de edição de plano existente em `/admin/planos`:
  - **Criar no Stripe:** Ao criar/editar um plano, botão "Sincronizar com Stripe" que cria ou atualiza o Product correspondente no ambiente selecionado
  - **Visualizar status:** Indicação se o plano está sincronizado com Stripe (ícone/badge ao lado do plano)
  - **Sincronizar ambos ambientes:** Opção de sincronizar plano tanto no test quanto no production em uma operação

- **RF-008:** Ao sincronizar um plano com o Stripe, o sistema deve criar automaticamente os **Prices** correspondentes aos períodos configurados:

| Período RecrutaRS | Stripe Price `recurring.interval` | `recurring.interval_count` |
|-------------------|----------------------------------|---------------------------|
| Mensal | `month` | 1 |
| Trimestral | `month` | 3 |
| Semestral | `month` | 6 |
| Anual | `year` | 1 |

- **RF-009:** Os preços no Stripe devem refletir os valores configurados no admin, incluindo o desconto de 10% para períodos de 6+ meses:

| Plano | Mensal | Trimestral (3x) | Semestral (6x com 10% desc) | Anual (12x com 10% desc) |
|-------|--------|-----------------|----------------------------|--------------------------|
| Essencial | R$ 199,00 | R$ 597,00 | R$ 1.074,60 | R$ 2.149,20 |
| Avançar | R$ 249,00 | R$ 747,00 | R$ 1.344,60 | R$ 2.689,20 |
| Premium | R$ 349,00 | R$ 1.047,00 | R$ 1.884,60 | R$ 3.769,20 |

> **Nota:** No Stripe, os Prices são imutáveis. Ao alterar o preço de um plano no admin, o sistema deve desativar o Price antigo e criar um novo Price. Assinantes existentes mantêm o Price antigo até renovação.

- **RF-010:** O plano Básico Empresas (trial gratuito) deve ser registrado no Stripe como Product com Price de R$ 0,00, com metadata indicando `trial: true` e `trial_days: 90`. Isso permite rastreamento mesmo sem cobrança.

### Sincronização de Clientes → Stripe Customers

- **RF-011:** Cada empresa ou candidato que assinar um plano pago deve ser registrado como **Customer** no Stripe:

| Campo RecrutaRS | Campo Stripe Customer |
|-----------------|----------------------|
| Nome da empresa / Candidato | `name` |
| E-mail | `email` |
| ID interno | `metadata.recrutars_user_id` |
| Tipo (candidato/empresa) | `metadata.user_type` |

- **RF-012:** O `stripe_customer_id` deve ser armazenado no registro do usuário no RecrutaRS para referência futura. Um mesmo usuário pode ter IDs diferentes no ambiente test e production.

### CRUD de Planos via Admin

- **RF-013:** O admin deve poder realizar as seguintes operações nos planos, refletindo automaticamente no Stripe:

| Operação Admin | Ação no Stripe |
|---------------|----------------|
| **Criar plano** | Criar Product + Prices para cada período |
| **Editar nome/descrição** | Atualizar Product |
| **Editar preço** | Desativar Price antigo + Criar novo Price |
| **Desativar plano** | Desativar Product (archive). Assinantes existentes mantêm acesso até fim do período. |
| **Excluir plano** | Somente se não houver assinaturas ativas. Desativar no Stripe (Products não são deletados, apenas arquivados). |

- **RF-014:** Toda operação deve ser executada no ambiente selecionado (test ou production). O admin deve confirmar explicitamente quando a operação afetar o ambiente de produção — modal de confirmação: "Você está alterando o ambiente de PRODUÇÃO. Confirma?"

- **RF-015:** O sistema deve manter o mapeamento entre IDs internos e IDs do Stripe:

| Campo | Descrição |
|-------|-----------|
| `stripe_product_id_test` | ID do Product no ambiente de teste |
| `stripe_product_id_live` | ID do Product no ambiente de produção |
| `stripe_price_ids_test` | JSON com IDs de Prices por período (test) |
| `stripe_price_ids_live` | JSON com IDs de Prices por período (live) |
| `stripe_synced_at_test` | Timestamp da última sincronização (test) |
| `stripe_synced_at_live` | Timestamp da última sincronização (live) |

### Interface de Gestão Stripe no Admin

- **RF-016:** Adicionar uma nova aba ou seção na interface de planos que permita visualizar o status de sincronização com o Stripe:

**Visão por plano:**

| Info | Descrição |
|------|-----------|
| Status de sincronização | Sincronizado ✅ / Pendente ⚠️ / Erro ❌ / Não sincronizado ➖ |
| Ambiente test | Product ID, última sincronização, quantidade de prices ativos |
| Ambiente production | Product ID, última sincronização, quantidade de prices ativos |
| Ações | Sincronizar test / Sincronizar production / Sincronizar ambos |

- **RF-017:** Na tela de configurações do Stripe, exibir painel de status geral:

| Indicador | Descrição |
|-----------|-----------|
| Conexão Test | Status da conexão com ambiente de teste |
| Conexão Production | Status da conexão com ambiente de produção |
| Planos sincronizados (test) | X de Y planos |
| Planos sincronizados (production) | X de Y planos |
| Última sincronização geral | Timestamp |
| Ação: Sincronizar todos | Botão para sincronizar todos os planos de uma vez |

### Webhooks

- **RF-018:** O sistema deve registrar endpoints de webhook para receber eventos do Stripe:

| Evento | Ação no RecrutaRS |
|--------|------------------|
| `customer.subscription.created` | Registrar nova assinatura ativa |
| `customer.subscription.updated` | Atualizar dados da assinatura (plano, status, período) |
| `customer.subscription.deleted` | Marcar assinatura como cancelada |
| `invoice.payment_succeeded` | Confirmar pagamento, ativar/renovar assinatura |
| `invoice.payment_failed` | Marcar assinatura como "pagamento falhou", notificar admin |
| `customer.subscription.trial_will_end` | Intensificar avisos de trial (3 dias antes) |

- **RF-019:** Os webhooks devem:
  - Validar a assinatura do evento usando o webhook secret correspondente ao ambiente
  - Processar eventos de forma idempotente (mesmo evento processado 2x não deve causar duplicação)
  - Retornar 200 OK imediatamente e processar de forma assíncrona se necessário
  - Logar cada evento recebido (ID, tipo, timestamp, resultado do processamento)

- **RF-020:** O admin deve poder visualizar um log de webhooks recebidos:
  - Listagem com filtros por tipo de evento, status (sucesso/erro), ambiente (test/production)
  - Detalhe do evento com payload recebido (dados sensíveis sanitizados)
  - Indicação de retries pendentes

### Moeda e Localização

- **RF-021:** Todos os valores devem ser enviados ao Stripe em **centavos de BRL** (Real brasileiro):
  - R$ 199,00 → `19900` (unit_amount)
  - Currency: `brl`

---

## Mapeamento de Dados

### Dados Enviados — Criar Product

| Campo RecrutaRS | Campo Stripe | Tipo | Obrigatório | Transformação |
|----------------|-------------|------|-------------|---------------|
| plano.nome | name | string | Sim | Nenhuma |
| plano.descricaoCurta | description | string | Não | Nenhuma |
| plano.slug | metadata.slug | string | Sim | Nenhuma |
| plano.tipo | metadata.type | string | Sim | "candidato" ou "empresa" |
| plano.id | metadata.recrutars_plan_id | string | Sim | Converter para string |
| plano.ativo | active | boolean | Sim | Nenhuma |

### Dados Enviados — Criar Price

| Campo RecrutaRS | Campo Stripe | Tipo | Obrigatório | Transformação |
|----------------|-------------|------|-------------|---------------|
| plano.stripe_product_id | product | string | Sim | ID do Product já criado |
| preço em reais | unit_amount | integer | Sim | Multiplicar por 100 (centavos) |
| "brl" | currency | string | Sim | Fixo "brl" |
| período | recurring.interval | string | Sim | Mapear: mensal→month, trimestral→month, anual→year |
| período | recurring.interval_count | integer | Sim | Mapear: mensal→1, trimestral→3, semestral→6, anual→1 |
| plano.slug + período | metadata.plan_period | string | Sim | Ex: "essencial-empresas_mensal" |

### Dados Recebidos — Webhook subscription.created

| Campo Stripe | Campo RecrutaRS | Tipo | Transformação |
|-------------|-----------------|------|---------------|
| subscription.id | stripe_subscription_id | string | Nenhuma |
| subscription.customer | stripe_customer_id | string | Lookup para user interno |
| subscription.status | status_assinatura | string | Mapear: active→ativa, canceled→cancelada, past_due→pendente |
| subscription.current_period_start | data_inicio_periodo | datetime | Converter timestamp Unix |
| subscription.current_period_end | data_fim_periodo | datetime | Converter timestamp Unix |
| subscription.items.data[0].price.id | stripe_price_id | string | Lookup para plano/período interno |

---

## Tratamento de Erros

### Estratégia de Retry

| Cenário | Estratégia | Máximo de Tentativas |
|---------|-----------|---------------------|
| Timeout | Retry imediato | 3 |
| Rate Limit (429) | Exponential backoff (1s, 2s, 4s) | 5 |
| Server Error (5xx) | Retry com delay (2s, 5s, 10s) | 3 |
| Client Error (4xx) | Não fazer retry (exceto 429) | 0 |
| Webhook falhou | Stripe faz retry automático por até 3 dias | — |

### Fallback

| Cenário | Comportamento Fallback |
|---------|----------------------|
| Stripe indisponível ao criar plano | Salvar plano localmente como "pendente de sincronização". Exibir status ⚠️. Permitir retry manual. |
| Stripe indisponível ao criar assinatura | Informar ao usuário que o pagamento está sendo processado. Enfileirar para retry. |
| Webhook não processado | Evento fica no log como "pendente". Admin pode reprocessar manualmente. |
| Chaves inválidas | Exibir erro claro no painel de configurações. Não permitir operações até corrigir. |
| Price imutável (alteração de preço) | Desativar Price antigo automaticamente. Criar novo. Logar a troca. |

### Monitoramento

| Métrica | Como Monitorar |
|---------|---------------|
| Taxa de sucesso de sincronização | Contagem de planos sincronizados vs total |
| Webhooks recebidos vs processados | Log de webhooks com status |
| Tempo médio de sincronização | Timestamp de início/fim de cada operação |
| Erros por tipo | Contagem por código HTTP no log |
| Planos desincronizados | Comparação periódica entre dados locais e Stripe |

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Configuração de credenciais e conexão | 4-5 |
| 2 | Sincronização de Products e Prices | 5-6 |
| 3 | Gestão de Customers e Subscriptions | 4-5 |
| 4 | Webhooks e processamento de eventos | 5-6 |
| 5 | Interface admin, logs e validação | 4-5 |

### Detalhamento das Fases

#### Fase 1: Configuração e Conexão

**Objetivo:** Estabelecer conexão autenticada com o Stripe nos dois ambientes.

**Ações:**
- [ ] Implementar tela de configuração de credenciais no admin (Configurações → Integrações → Stripe)
- [ ] Implementar armazenamento seguro das chaves (criptografia em repouso)
- [ ] Implementar seletor de ambiente (test/production) com distinção visual
- [ ] Implementar botão "Testar conexão" que valida as chaves
- [ ] Implementar status de conexão visível (Conectado / Desconectado / Erro)

**Validação:** Admin configura chaves de teste, clica "Testar conexão" e recebe confirmação de sucesso.

#### Fase 2: Sincronização de Products e Prices

**Objetivo:** Espelhar os planos do RecrutaRS como Products/Prices no Stripe.

**Ações:**
- [ ] Implementar criação de Product no Stripe a partir de um plano do admin
- [ ] Implementar criação de Prices por período (mensal, trimestral, semestral, anual) com valores corretos em centavos BRL
- [ ] Implementar atualização de Product (nome, descrição, status)
- [ ] Implementar desativação de Price antigo + criação de novo ao alterar preço
- [ ] Implementar mapeamento de IDs (stripe_product_id, stripe_price_ids por ambiente)
- [ ] Implementar botão "Sincronizar com Stripe" na interface de edição de plano
- [ ] Implementar botão "Sincronizar todos" no painel de status
- [ ] Implementar indicação visual de status de sincronização por plano

**Validação:** Ao criar/editar plano no admin e sincronizar, os Products/Prices correspondentes existem no Stripe Dashboard.

#### Fase 3: Gestão de Customers e Subscriptions

**Objetivo:** Criar e gerenciar clientes e assinaturas no Stripe.

**Ações:**
- [ ] Implementar criação de Customer no Stripe ao assinar um plano pago
- [ ] Implementar armazenamento de stripe_customer_id por ambiente no registro do usuário
- [ ] Implementar criação de Subscription vinculando Customer a Price
- [ ] Implementar cancelamento de Subscription
- [ ] Implementar consulta de status de assinatura

**Validação:** Empresa assina plano → Customer e Subscription criados no Stripe → dados refletidos no admin.

#### Fase 4: Webhooks e Processamento de Eventos

**Objetivo:** Receber e processar eventos do Stripe de forma segura e idempotente.

**Ações:**
- [ ] Implementar endpoint de webhook para cada ambiente (test e production)
- [ ] Implementar validação de assinatura do webhook (webhook secret)
- [ ] Implementar processamento dos eventos: subscription.created, subscription.updated, subscription.deleted, invoice.payment_succeeded, invoice.payment_failed, subscription.trial_will_end
- [ ] Implementar idempotência (verificação de event ID já processado)
- [ ] Implementar log de webhooks recebidos

**Validação:** Simular eventos via Stripe CLI → RecrutaRS processa corretamente → dados atualizados.

#### Fase 5: Interface Admin, Logs e Validação

**Objetivo:** Completar a interface de gestão e validar todos os fluxos.

**Ações:**
- [ ] Implementar painel de status geral de sincronização no admin
- [ ] Implementar log de webhooks com filtros e detalhes
- [ ] Implementar modal de confirmação para operações em produção
- [ ] Implementar reprocessamento manual de webhooks falhos
- [ ] Validar todos os cenários: criação, edição, desativação, exclusão de planos nos dois ambientes
- [ ] Testar fluxo completo: plano criado → sincronizado → empresa assina → pagamento → webhook → assinatura ativa

**Validação:** Fluxo end-to-end funciona nos dois ambientes sem erros.

---

## Critérios de Aceitação

### Conexão e Autenticação

```gherkin
DADO que o admin acessa Configurações → Integrações → Stripe
QUANDO inserir chaves de teste válidas e clicar "Testar conexão"
ENTÃO deve exibir "Conexão estabelecida ✅" para o ambiente de teste
  E as chaves secretas devem ser exibidas mascaradas
```

```gherkin
DADO que o admin inseriu chaves inválidas
QUANDO clicar "Testar conexão"
ENTÃO deve exibir "Erro de autenticação ❌" com mensagem descritiva
  E não deve permitir operações de sincronização
```

### Sincronização de Planos

```gherkin
DADO que o admin editou o plano "Essencial Empresas" e está no ambiente "Teste"
QUANDO clicar "Sincronizar com Stripe"
ENTÃO deve criar (ou atualizar) o Product no Stripe com nome, descrição e metadata corretos
  E deve criar 4 Prices: mensal (R$ 199), trimestral (R$ 597), semestral (R$ 1.074,60), anual (R$ 2.149,20)
  E os valores devem ser enviados em centavos BRL
  E o status do plano deve mudar para "Sincronizado ✅"
```

```gherkin
DADO que o admin alterou o preço mensal do plano Essencial de R$ 199 para R$ 219
QUANDO sincronizar com Stripe
ENTÃO deve desativar o Price antigo de R$ 199
  E deve criar novo Price de R$ 219
  E assinantes existentes devem manter o Price antigo até renovação
```

### Distinção de Ambientes

```gherkin
DADO que o admin está com ambiente "Teste" selecionado
QUANDO visualizar a interface
ENTÃO deve ver badge "🧪 TESTE" visível em destaque
  E todos os dados exibidos devem ser do ambiente de teste
  E operações devem afetar apenas o ambiente de teste

DADO que o admin está com ambiente "Produção" selecionado
QUANDO tentar sincronizar um plano
ENTÃO deve exibir modal de confirmação: "Você está alterando o ambiente de PRODUÇÃO. Confirma?"
  E somente após confirmação a operação deve ser executada
```

### Webhooks

```gherkin
DADO que o Stripe envia evento "invoice.payment_succeeded" para o webhook
QUANDO o sistema receber o evento
ENTÃO deve validar a assinatura do webhook
  E deve ativar/renovar a assinatura do usuário correspondente
  E deve registrar o evento no log de webhooks
  E deve retornar 200 OK

DADO que o mesmo evento é enviado duas vezes (retry)
QUANDO o sistema processar a segunda vez
ENTÃO deve identificar que o evento já foi processado (idempotência)
  E deve retornar 200 OK sem duplicar a operação
```

### Cenários de Erro

```gherkin
DADO que o Stripe está temporariamente indisponível
QUANDO o admin tentar sincronizar um plano
ENTÃO deve salvar o plano localmente como "pendente de sincronização ⚠️"
  E deve exibir mensagem informando o erro
  E deve permitir retry manual posterior
```

```gherkin
DADO que o admin tenta excluir um plano que tem assinaturas ativas no Stripe
QUANDO tentar executar a exclusão
ENTÃO deve bloquear a operação
  E deve exibir: "Este plano tem N assinaturas ativas. Desative primeiro ou migre os assinantes."
```

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Planos, Billing e Stripe"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 0 | PRD-060 | Gestão de Planos e Assinaturas (Commerce) | ✅ | Base |
| 1 | PRD-074 | Reestruturação dos Planos de Empresas | ✅/🔄 | Atualiza PRD-060 |
| **2** | **PRD-075** | **Integração Stripe** | **🔄 ATUAL** | Depende de PRD-074 |
| 3 | PRD-076 | Regras de Billing e Upgrade | ⏳ | Depende de PRD-074, PRD-075 |

> **Nota:** Implemente na ordem indicada. PRDs anteriores devem estar ✅ antes de iniciar o seguinte.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Credenciais

| Item | Requisito |
|------|-----------|
| Armazenamento | Variáveis de ambiente para deploy + criptografadas em banco para configuração via admin |
| Rotação | Admin pode atualizar chaves a qualquer momento pelo painel |
| Acesso | Apenas backend — nunca expostas ao frontend ou em responses da API |
| Mascaramento | Chaves exibidas no admin como `sk_test_...últimos4chars` |

### Dados em Trânsito

| Item | Requisito |
|------|-----------|
| Protocolo | HTTPS obrigatório (Stripe rejeita HTTP) |
| Certificado | Validar certificado SSL do Stripe |
| Dados sensíveis | Cartão de crédito NUNCA passa pelo nosso servidor — Stripe Elements ou Checkout |
| PCI Compliance | RecrutaRS não armazena dados de cartão — compliance delegada ao Stripe |

### Logs

| O que Logar | O que NÃO Logar |
|-------------|-----------------|
| Request ID | Chaves secretas |
| Timestamps | Tokens completos |
| Códigos de resposta | Dados de cartão de crédito |
| Event IDs de webhooks | Webhook secrets |
| Payloads sanitizados | Dados pessoais sensíveis completos |
| Operações realizadas (quem, quando, o quê) | — |

### Webhook Security

| Item | Requisito |
|------|-----------|
| Validação | Toda request ao endpoint de webhook deve ter assinatura validada via `stripe-signature` header |
| Rejeição | Requests sem assinatura válida devem ser rejeitadas com 401 |
| HTTPS | Endpoint de webhook deve ser HTTPS |
| Idempotência | Event ID verificado antes de processar para evitar duplicação |

---

## Troubleshooting

### Problemas Comuns

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| 401 Unauthorized | Chave secreta inválida ou do ambiente errado | Verificar chaves no painel → "Testar conexão" |
| Product criado no ambiente errado | Admin não verificou o seletor de ambiente | Verificar seletor; modal de confirmação em produção |
| Webhook não chega | URL de webhook não configurada no Stripe Dashboard | Configurar webhook endpoint no Stripe Dashboard |
| Webhook assinatura inválida | Webhook secret incorreto | Verificar/atualizar webhook secret no painel |
| Preço desincronizado | Preço alterado no admin sem sincronizar | Usar botão "Sincronizar com Stripe" |
| Assinatura não ativou | Webhook `invoice.payment_succeeded` não processado | Verificar log de webhooks; reprocessar manualmente |

### Como Debugar

1. Verificar status de conexão no painel admin (Configurações → Stripe)
2. Verificar seletor de ambiente (test vs production)
3. Consultar log de webhooks para eventos recentes
4. Testar endpoint de webhook via Stripe CLI: `stripe listen --forward-to localhost:PORT/api/webhooks/stripe`
5. Verificar Stripe Dashboard → Events para confirmar eventos enviados
6. Verificar mapeamento de IDs (stripe_product_id, stripe_price_ids) no banco

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. CREDENCIAIS:**
> - NUNCA hardcodar credenciais no código
> - Usar variáveis de ambiente para deploy
> - Para configuração via admin: criptografar em repouso, mascarar na exibição
> - Verificar se está usando ambiente correto (test vs production) antes de cada operação
> - As chaves já existem — NÃO criar novas. Apenas consumir das variáveis de ambiente.

> **⚠️ 3. STRIPE PRICES SÃO IMUTÁVEIS:**
> - Ao alterar preço de um plano, NUNCA tentar editar um Price existente
> - Sempre: desativar Price antigo → criar novo Price
> - Manter referência ao Price antigo para assinantes existentes

> **⚠️ 4. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-075-integracao-stripe_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Sugestão para este PRD: **"Gateway"** (referência à ponte de pagamento com Stripe).

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
| **Não bloquear fluxo principal** | Falha na sincronização com Stripe não deve impedir salvar plano localmente |
| **Fail gracefully** | Se Stripe indisponível, salvar como "pendente" e permitir retry |
| **Preservar evidências** | Logar todas as requests e responses para debug |
| **Testar incrementalmente** | Validar cada fase no ambiente de teste antes de tocar produção |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **SDK vs REST** | Avaliar uso da SDK oficial do Stripe (stripe-node) versus chamadas REST diretas. SDK é recomendada por lidar com retry, tipagem e versionamento. |
| **Idempotency Keys** | Usar `Idempotency-Key` header em operações de escrita (POST) para evitar duplicação em caso de retry. |
| **Valores monetários** | Sempre converter para centavos (integer) antes de enviar ao Stripe. R$ 199,00 = 19900. |
| **Metadata** | Usar campo `metadata` do Stripe para armazenar referências ao RecrutaRS (IDs internos, slugs, tipos). Facilita lookup reverso. |
| **Webhook endpoint** | Deve ser acessível publicamente. Para desenvolvimento local, usar Stripe CLI para forwarding. |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Hardcodar credenciais do Stripe em qualquer arquivo |
| Armazenar dados de cartão de crédito no nosso banco |
| Tentar editar um Price existente no Stripe (são imutáveis) |
| Ignorar validação de assinatura de webhooks |
| Fazer requests síncronas bloqueantes no fluxo de checkout |
| Confiar cegamente nos dados retornados sem validar |
| Permitir operações em produção sem confirmação explícita |
| Logar chaves secretas, webhook secrets ou dados de cartão |
| Expor chaves secretas ao frontend (apenas publishable key no frontend) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Ambiente Testado** | - |
| **Observações** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/02/2026 | v1 | Criação inicial — Integração Stripe com gestão via admin, suporte test/production, webhooks |

---

**AILA - Sistemas Inteligentes**
