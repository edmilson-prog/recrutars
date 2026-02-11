# PRD-074: Reestruturação dos Planos de Empresas

> **AILA - Sistemas Inteligentes**

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-060` | Gestão de Planos e Assinaturas (Commerce) — **base sendo atualizada** |
| `PRD-062` | Feature Flags e Simulador de Planos (Switch) |
| **`PRD-074`** | ⬅ Você está aqui — Reestruturação dos Planos de Empresas |
| `PRD-075` | Integração Stripe (próximo da cadeia) |
| `PRD-076` | Regras de Billing e Upgrade (próximo da cadeia) |

---

# PRD-074: Reestruturação dos Planos de Empresas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Painel Admin / Planos |
| **Repositório** | RecrutaRS Git Repository |
| **Objetivo** | Reestruturar os planos de empresa de 3 para 4 (adicionando Básico gratuito com trial de 3 meses), atualizar preços, recursos, e implementar sistema de sinalização visual de trial com escalada de avisos |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Planos, Billing e Stripe |
| **PRDs Relacionados** | PRD-060, PRD-062, PRD-075, PRD-076 |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 5+ arquivos, múltiplas regras de negócio (trial, avisos, escalada), impacta estrutura existente de planos |

---

## Contexto do Problema

O PRD-060 (Commerce) definiu a estrutura original de planos para o RecrutaRS com 3 planos de empresa: Essencial Empresas (gratuito permanente), Seleção Inteligente e Recrutamento Premium. Essa estrutura precisa ser revisada por três razões.

Primeiro, a estratégia comercial evoluiu. O modelo anterior oferecia um plano gratuito permanente, o que não gera urgência de conversão. O novo modelo substitui isso por um **trial de 3 meses** no plano Básico, criando uma janela de experimentação que leva naturalmente à decisão de assinar um plano pago. Além disso, um quarto plano foi adicionado para melhor segmentação do mercado.

Segundo, os preços foram significativamente reajustados (de R$ 99-119 para R$ 199-349) para refletir o valor real da plataforma, e novas regras de desconto (10% para assinaturas de 6+ meses) e bônus (testes comportamentais) foram introduzidas.

Terceiro, sem sinalização visual do período de trial e sem escalada de avisos antes da expiração, empresas em trial podem perder o acesso de forma abrupta, gerando frustração e perda de conversão. É necessário um sistema que comunique claramente o status do trial e intensifique os avisos nos últimos 15 dias.

---

## Conceito da Solução

### Situação Atual (As-Is)

- 3 planos de empresa definidos (Essencial gratuito permanente, Seleção Inteligente, Recrutamento Premium)
- Preços originais: R$ 0 / R$ 99,90 / R$ 119,90 (mensal)
- Sem plano Básico com trial
- Sem sistema de avisos de expiração
- Sem desconto por período longo
- Sem bônus de testes comportamentais
- Interface de Gestão de Planos já implementada em `/admin/planos`

### Situação Desejada (To-Be)

- 4 planos de empresa com nova estrutura de preços e recursos
- Plano Básico gratuito por 3 meses com expiração automática
- Sinalização visual clara de empresas em trial (badge, banner)
- Escalada de avisos nos últimos 15 dias do trial
- Desconto de 10% para assinaturas acima de 6 meses
- Bônus de testes comportamentais por plano e período
- Design existente mantido — apenas dados e comportamentos atualizados

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Manter 3 planos e adicionar trial no Essencial | A segmentação em 4 planos permite melhor diferenciação de valor e pricing |
| Trial de 14 dias (padrão SaaS) | 3 meses permitem que a empresa vivencie o ciclo completo de uma contratação, gerando mais dados para conversão |
| Sem escalada de avisos (só bloqueio) | Perda abrupta de acesso causa frustração e reduz conversão; escalada gradual nudge a decisão |

---

## Escopo

### Incluído

- ✅ Reestruturação de 3 para 4 planos de empresa (Básico, Essencial, Avançar, Premium)
- ✅ Novos preços para todos os planos
- ✅ Novos recursos/capabilities por plano
- ✅ Regra de trial de 3 meses no Básico (com data de expiração)
- ✅ Identificação visual de empresas em trial (badge no admin + banner para empresa)
- ✅ Escalada de avisos nos últimos 15 dias do trial
- ✅ Regra de desconto 10% para assinaturas de 6+ meses
- ✅ Bônus de testes comportamentais por plano/período
- ✅ Atualização dos dados na interface existente de `/admin/planos`
- ✅ Bloqueio de acesso após expiração do trial

### Excluído

- ❌ Integração com Stripe (PRD-075)
- ❌ Regras de upgrade/downgrade com proration (PRD-076)
- ❌ Implementação completa da feature "Gestão de Equipes" do Premium (futuro PRD dedicado)
- ❌ Notificações por e-mail ou WhatsApp (apenas visual na plataforma por enquanto)
- ❌ Planos de candidato (permanecem como estão: Essencial, Avançar, Destaque Máximo)
- ❌ Alteração de design/layout da interface de planos

---

## Requisitos Funcionais

### Nova Estrutura de Planos — Empresas

- **RF-001:** O sistema deve suportar 4 planos de empresa conforme a tabela abaixo:

#### Plano 1: Básico Empresas (Trial Gratuito)

| Campo | Valor |
|-------|-------|
| **Nome** | Básico Empresas |
| **Slug** | basico-empresas |
| **Preço** | R$ 0,00 (gratuito) |
| **Duração** | 3 meses (trial) — sem renovação |
| **Descrição curta** | Para empresas que estão começando |
| **Badge** | Trial Gratuito |
| **Ativo** | Sim |

**Recursos do plano Básico Empresas:**

| Recurso | Detalhe |
|---------|---------|
| Vagas ativas | Até 2 vagas ativas/mês |
| Candidatos por vaga | Até 5 candidatos por vaga ativa |
| Currículo do candidato | Acesso completo |
| Perfil comportamental | Acesso básico |
| Compatibilidade vaga/candidato | Indicação básica |
| Dashboard | Básico |
| Suporte | Por e-mail |

#### Plano 2: Essencial Empresas

| Campo | Valor |
|-------|-------|
| **Nome** | Essencial Empresas |
| **Slug** | essencial-empresas |
| **Preço mensal** | R$ 199,00 |
| **Desconto 6+ meses** | 10% sobre o valor mensal |
| **Descrição curta** | Para empresas em crescimento |
| **Badge** | — |
| **Ativo** | Sim |

**Recursos do plano Essencial Empresas:**

| Recurso | Detalhe |
|---------|---------|
| Vagas ativas | Até 5 vagas ativas/mês |
| Candidatos por vaga | Até 10 candidatos por vaga ativa |
| Currículo do candidato | Acesso completo |
| Perfil comportamental | Acesso intermediário |
| Compatibilidade vaga/candidato | Indicação intermediária com destaque (utilização de IA) |
| Mensagens | Envio de mensagem ao candidato com agendamento de entrevistas e tirar dúvidas |
| Dashboard | Intermediário com comparação de candidatos selecionados |
| Banco de talentos | Sim |
| Suporte | E-mail e chat |
| **Bônus (6+ meses)** | 3 testes de perfil comportamental |

#### Plano 3: Avançar Empresas

| Campo | Valor |
|-------|-------|
| **Nome** | Avançar Empresas |
| **Slug** | avancar-empresas |
| **Preço mensal** | R$ 249,00 |
| **Desconto 6+ meses** | 10% sobre o valor mensal |
| **Descrição curta** | Para empresas que buscam os melhores talentos |
| **Badge** | Mais popular |
| **Ativo** | Sim |

**Recursos do plano Avançar Empresas:**

| Recurso | Detalhe |
|---------|---------|
| Vagas ativas | Até 10 vagas ativas/mês |
| Candidatos por vaga | Até 15 candidatos por vaga ativa |
| Currículo do candidato | Acesso completo |
| Perfil comportamental | Acesso avançado com possibilidade de liberação completa |
| Compatibilidade vaga/candidato | Sugestão de candidatos compatíveis via IA |
| Mensagens | Envio de mensagem ao candidato com agendamento e realização de entrevistas online dentro da plataforma |
| Dashboard | Avançado com comparação de candidatos selecionados |
| Banco de talentos | Sim |
| Suporte | E-mail e chat |
| **Bônus (6+ meses)** | 5 testes de perfil comportamental |

#### Plano 4: Premium Empresas

| Campo | Valor |
|-------|-------|
| **Nome** | Premium Empresas |
| **Slug** | premium-empresas |
| **Preço mensal** | R$ 349,00 |
| **Desconto 6+ meses** | 10% sobre o valor mensal |
| **Descrição curta** | Para empresas que querem o melhor do recrutamento |
| **Badge** | Completo |
| **Ativo** | Sim |

**Recursos do plano Premium Empresas:**

| Recurso | Detalhe |
|---------|---------|
| Vagas ativas | ILIMITADAS |
| Candidatos por vaga | ILIMITADOS |
| Currículo do candidato | Acesso completo |
| Perfil comportamental | Acesso COMPLETO |
| Compatibilidade vaga/candidato | Destaque MÁXIMO com IA indicando melhores talentos |
| Mensagens | Envio de mensagem ao candidato com agendamento e realização de entrevistas online dentro da plataforma |
| Dashboard | COMPLETO — gestão de vagas ativas/encerradas, processos seletivos e relatórios |
| Gestão de equipes | Incluir equipe da empresa, realizar testes de perfil, gerenciar por setor, IA sugere perfis por função e desenvolvimento |
| Banco de talentos | Sim |
| Suporte | E-mail, chat e WhatsApp |
| **Bônus (6+ meses)** | 10 testes de perfil comportamental |

---

### Tabela Comparativa de Preços

- **RF-002:** Os preços por período devem seguir a seguinte estrutura:

| Plano | Mensal | Trimestral | Semestral | Anual |
|-------|--------|-----------|-----------|-------|
| **Básico** | Grátis | — | — | — |
| **Essencial** | R$ 199,00 | R$ 199,00/mês | R$ 179,10/mês (-10%) | R$ 179,10/mês (-10%) |
| **Avançar** | R$ 249,00 | R$ 249,00/mês | R$ 224,10/mês (-10%) | R$ 224,10/mês (-10%) |
| **Premium** | R$ 349,00 | R$ 349,00/mês | R$ 314,10/mês (-10%) | R$ 314,10/mês (-10%) |

> **Nota:** O desconto de 10% aplica-se automaticamente para assinaturas de 6 meses (semestral) ou 12 meses (anual). As assinaturas mensal e trimestral não têm desconto.

- **RF-003:** O plano Básico Empresas é exclusivamente trial — não possui variações de período (mensal, trimestral, etc.). Dura exatamente 3 meses a partir da data de ativação.

---

### Regras do Trial — Plano Básico

- **RF-004:** Ao cadastrar uma nova empresa, ela deve receber automaticamente o plano Básico Empresas com data de início e data de expiração (início + 90 dias).

- **RF-005:** O sistema deve registrar para cada empresa em trial:
  - Data de início do trial
  - Data de expiração do trial
  - Status do trial: ativo / expirado
  - Dias restantes (calculado)

- **RF-006:** Após a expiração do trial (dia 91+), a empresa deve perder acesso às funcionalidades do plano. Ao acessar a plataforma, deve ver apenas uma tela de conversão indicando que o período gratuito encerrou, com opção de assinar um plano pago.

- **RF-007:** A empresa em trial **não** pode renovar o plano Básico. Após expiração, a única opção é assinar um plano pago (Essencial, Avançar ou Premium).

---

### Sinalização Visual do Trial

- **RF-008:** Enquanto a empresa estiver em período de trial, deve existir identificação visual clara:

  **Na visão da empresa:**
  - Badge permanente no header/navbar: "Período de teste — X dias restantes"
  - A cor e destaque do badge devem refletir a urgência conforme a escalada de avisos (RF-009)

  **Na visão do admin:**
  - Na listagem de empresas: indicador visual (ícone, badge ou coluna) identificando empresas em trial
  - No detalhe da empresa: informação de dias restantes do trial
  - No dashboard de assinaturas: contador de empresas em trial e empresas com trial expirando nos próximos 15 dias

---

### Escalada de Avisos nos Últimos 15 Dias

- **RF-009:** O sistema deve implementar avisos visuais com intensidade crescente conforme o trial se aproxima do fim:

| Período | Dias Restantes | Intensidade | Tipo de Aviso |
|---------|---------------|-------------|---------------|
| Dia 1–75 | 90–16 dias | Baixa | Badge sutil no header: "Período de teste — X dias restantes" |
| Dia 76–82 | 15–8 dias | Média | Banner informativo no topo da página: "Seu período gratuito termina em X dias. Conheça nossos planos." com link para página de planos |
| Dia 83–88 | 7–2 dias | Alta | Alerta destacado (cor de atenção) + CTA de upgrade proeminente: "Faltam apenas X dias! Assine agora para não perder acesso." |
| Dia 89–90 | 1–0 dias | Urgente | Alerta urgente (cor de alerta/vermelho): "Amanhã seu acesso será encerrado!" ou "Último dia de acesso gratuito!" |
| Dia 91+ | Expirado | Bloqueio | Tela de conversão em tela cheia: "Seu período gratuito encerrou. Assine um plano para continuar." |

- **RF-010:** Cada nível de aviso deve:
  - Conter um CTA (call to action) com link para a página de planos/pricing
  - Ser **não-dispensável** nos últimos 7 dias (a empresa não pode fechar/ocultar o aviso)
  - Nos primeiros 75 dias, o badge pode ser discreto e não intrusivo
  - A transição entre níveis deve ser automática baseada no cálculo de dias restantes

- **RF-011:** O aviso de bloqueio (dia 91+) deve:
  - Impedir o acesso a qualquer funcionalidade da plataforma
  - Mostrar resumo do que a empresa tinha (vagas ativas, candidatos em processo) como motivação para assinar
  - Oferecer os 3 planos pagos com comparativo
  - Manter o acesso ao perfil básico da empresa (dados cadastrais) para que ela possa assinar sem precisar recadastrar

---

### Bônus de Testes Comportamentais

- **RF-012:** O sistema deve registrar a regra de bônus por plano e período:

| Plano | Bônus (assinaturas 6+ meses) |
|-------|------------------------------|
| Essencial | 3 testes de perfil comportamental |
| Avançar | 5 testes de perfil comportamental |
| Premium | 10 testes de perfil comportamental |

- **RF-013:** O bônus deve ser:
  - Creditado uma única vez no momento da ativação da assinatura de 6+ meses
  - Visível no dashboard da empresa: "Você tem X testes comportamentais disponíveis"
  - Consumido conforme a empresa utiliza (contador decrementando)
  - Não acumulativo entre renovações (ao renovar, recebe novos créditos)

---

### Desconto por Período Longo

- **RF-014:** O sistema deve aplicar automaticamente desconto de 10% sobre o valor mensal base quando o período de assinatura for semestral ou anual.

- **RF-015:** O desconto deve ser:
  - Calculado sobre o preço mensal do plano
  - Exibido na página de pricing com destaque visual (preço original riscado + preço com desconto)
  - Registrado como regra configurável pelo admin (percentual de desconto editável)
  - Aplicável apenas aos planos pagos (Essencial, Avançar, Premium)

---

### Atualização da Interface Admin

- **RF-016:** A interface existente em `/admin/planos` deve ser atualizada para refletir os 4 planos de empresa, mantendo o design atual:
  - Cards dos planos com nome, slug, preços por período e recursos
  - Modal de edição com campos de preço, descrição, badge e recursos
  - Toggle de ativo/inativo por plano
  - Aba "Candidato" e "Empresa" para alternar entre os tipos

- **RF-017:** Na aba "Empresa", os cards devem exibir os 4 planos na ordem: Básico → Essencial → Avançar → Premium, com identificação visual diferenciada para o plano Básico (indicando que é trial).

- **RF-018:** O modal de edição do plano Básico deve exibir campos específicos de trial:
  - Duração do trial (em dias, default 90)
  - Status do trial (ativo/inativo como opção de plano)
  - Informação de que este plano não possui variações de período

---

### Feature "Gestão de Equipes" (Referência)

- **RF-019:** O plano Premium Empresas deve listar a "Gestão de Equipes" como recurso disponível. Neste PRD, a feature é **apenas registrada como capability do plano** — sua implementação completa será tratada em PRD dedicado futuro. O recurso deve aparecer na listagem de features do plano Premium no admin e na página de pricing com descrição: "Gerencie sua equipe, aplique testes de perfil por setor e receba sugestões de desenvolvimento via IA".

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O cálculo de dias restantes do trial e nível de aviso deve ser computado sem impactar o tempo de carregamento da página (< 200ms adicionais).

- **RNF-002 (Consistência):** A transição entre níveis de aviso deve ser precisa — sem atraso de mais de 1 hora entre a mudança de dia e a atualização do aviso.

- **RNF-003 (Responsividade):** Os banners e alertas de trial devem ser responsivos e legíveis em dispositivos móveis.

- **RNF-004 (Auditoria):** Toda mudança de preço, recurso ou configuração de plano deve ser registrada com timestamp e identificação do admin que realizou a alteração.

- **RNF-005 (Compatibilidade):** Os avisos visuais devem funcionar em Chrome, Firefox, Safari e Edge.

---

## Critérios de Aceitação

### RF-001/002: Estrutura de Planos

```gherkin
DADO que o admin acessa Configurações → Planos → aba Empresa
QUANDO visualizar os planos de empresa
ENTÃO deve ver 4 cards: Básico, Essencial, Avançar e Premium
  E cada card deve exibir nome, slug, preços e recursos conforme especificado
  E o plano Básico deve ter identificação visual de "Trial Gratuito"
```

### RF-004/005: Ativação de Trial

```gherkin
DADO que uma nova empresa se cadastra na plataforma
QUANDO o cadastro for concluído
ENTÃO a empresa deve receber automaticamente o plano Básico Empresas
  E a data de início do trial deve ser a data do cadastro
  E a data de expiração deve ser início + 90 dias
  E o status do trial deve ser "ativo"
```

### RF-006/007: Expiração do Trial

```gherkin
DADO que uma empresa está no plano Básico e o trial expirou (dia 91+)
QUANDO a empresa acessar a plataforma
ENTÃO deve ver uma tela de conversão em tela cheia
  E NÃO deve ter acesso a nenhuma funcionalidade
  E deve ver os 3 planos pagos com opção de assinar
  E NÃO deve haver opção de renovar o trial
```

### RF-008/009: Sinalização e Escalada de Avisos

```gherkin
DADO que uma empresa está no dia 60 do trial (30 dias restantes)
QUANDO acessar a plataforma
ENTÃO deve ver apenas um badge sutil no header: "Período de teste — 30 dias restantes"
  E o badge NÃO deve ser intrusivo

DADO que uma empresa está no dia 78 do trial (12 dias restantes)
QUANDO acessar a plataforma
ENTÃO deve ver um banner informativo no topo da página
  E o banner deve conter "Seu período gratuito termina em 12 dias"
  E deve haver link para página de planos

DADO que uma empresa está no dia 85 do trial (5 dias restantes)
QUANDO acessar a plataforma
ENTÃO deve ver um alerta destacado com cor de atenção
  E o alerta deve conter CTA proeminente de upgrade
  E o alerta NÃO deve ser dispensável

DADO que uma empresa está no dia 90 do trial (último dia)
QUANDO acessar a plataforma
ENTÃO deve ver alerta urgente em cor de alerta
  E o alerta deve informar "Último dia de acesso gratuito!"
```

### RF-012/013: Bônus de Testes

```gherkin
DADO que uma empresa assina o plano Avançar por 6 meses
QUANDO a assinatura for ativada
ENTÃO a empresa deve receber 5 créditos de testes comportamentais
  E os créditos devem ser visíveis no dashboard
  E ao usar um teste, o contador deve decrementar
```

### RF-014/015: Desconto por Período

```gherkin
DADO que uma empresa visualiza o plano Essencial na página de pricing
QUANDO selecionar o período semestral
ENTÃO deve ver o preço mensal original de R$ 199,00 riscado
  E deve ver o preço com desconto de R$ 179,10/mês
  E deve indicar "10% de desconto"
```

### Cenários de Erro

```gherkin
DADO que o admin tenta desativar o plano Básico Empresas
QUANDO houver empresas com trial ativo neste plano
ENTÃO deve exibir alerta: "Existem N empresas em trial ativo neste plano"
  E deve pedir confirmação antes de desativar
  E empresas em trial ativo devem manter o acesso até a expiração
```

```gherkin
DADO que uma empresa com trial expirado tenta acessar qualquer funcionalidade
QUANDO clicar em qualquer link/botão da plataforma
ENTÃO deve ser redirecionada para a tela de conversão
  E NÃO deve conseguir burlar o bloqueio via URL direta
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Atualização dos dados de planos | 3-4 |
| 2 | Regras de trial e expiração | 4-5 |
| 3 | Sinalização visual e escalada de avisos | 5-6 |
| 4 | Bônus, descontos e interface admin | 3-4 |
| 5 | Tela de conversão e validação | 3-4 |

### Detalhamento das Fases

#### Fase 1: Atualização dos Dados de Planos

**Objetivo:** Atualizar a estrutura de planos de 3 para 4 empresas com novos preços e recursos.

**Ações:**
- [ ] Adicionar o plano Básico Empresas com dados de trial
- [ ] Atualizar preços dos planos existentes (Essencial, Seleção Inteligente → Avançar, Recrutamento Premium → Premium)
- [ ] Atualizar slugs para os novos nomes
- [ ] Atualizar lista de recursos/capabilities de cada plano

**Validação:** Os 4 planos aparecem na interface admin com dados corretos.

#### Fase 2: Regras de Trial e Expiração

**Objetivo:** Implementar a lógica de trial de 3 meses com data de expiração e bloqueio automático.

**Ações:**
- [ ] Implementar campos de trial na estrutura de assinatura (data início, data expiração, status)
- [ ] Implementar lógica de atribuição automática do plano Básico ao cadastrar empresa
- [ ] Implementar verificação de expiração do trial
- [ ] Implementar bloqueio de acesso após expiração

**Validação:** Empresa em trial ativa tem acesso; empresa com trial expirado é bloqueada.

#### Fase 3: Sinalização Visual e Escalada de Avisos

**Objetivo:** Implementar o sistema de avisos visuais com 4 níveis de intensidade.

**Ações:**
- [ ] Implementar componente de badge sutil para header (dias 1-75)
- [ ] Implementar componente de banner informativo (dias 76-82)
- [ ] Implementar componente de alerta destacado não-dispensável (dias 83-88)
- [ ] Implementar componente de alerta urgente (dias 89-90)
- [ ] Implementar lógica de seleção automática do nível baseado em dias restantes
- [ ] Adicionar indicadores de trial na visão do admin (listagem e detalhe de empresas)

**Validação:** Cada nível de aviso aparece corretamente conforme os dias restantes.

#### Fase 4: Bônus, Descontos e Interface Admin

**Objetivo:** Implementar regras de bônus de testes e desconto por período.

**Ações:**
- [ ] Implementar lógica de desconto de 10% para períodos de 6+ meses
- [ ] Implementar exibição de preço com desconto (original riscado + novo)
- [ ] Implementar sistema de créditos de testes comportamentais por plano
- [ ] Atualizar interface de edição de plano no admin para incluir campos de trial e bônus

**Validação:** Preços com desconto calculados corretamente; créditos de bônus atribuídos.

#### Fase 5: Tela de Conversão e Validação

**Objetivo:** Implementar a tela que a empresa vê ao expirar o trial, e validar todos os fluxos.

**Ações:**
- [ ] Implementar tela de conversão em tela cheia (bloqueio + oferta de planos)
- [ ] Incluir resumo do que a empresa tinha no trial (vagas, candidatos) como motivação
- [ ] Implementar comparativo dos 3 planos pagos na tela de conversão
- [ ] Validar todos os cenários: trial ativo, expiração, avisos, bloqueio, acesso admin
- [ ] Testar responsividade em dispositivos móveis

**Validação:** Fluxo completo do trial funciona de ponta a ponta.

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-060 | Gestão de Planos e Assinaturas (Commerce) | ✅ Base implementada |
| PRD-062 | Feature Flags e Simulador de Planos | ✅ Referência de capabilities |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum neste PRD | — | — |

> **Nota:** A integração com Stripe será tratada no PRD-075. Este PRD atualiza apenas a estrutura interna de planos e interface.

### Decisões Pendentes

- [ ] Definir se o Premium terá contrato mínimo ou pode ser mensal
- [ ] Confirmar se o bônus de testes pode ser utilizado pela empresa em seus próprios colaboradores ou apenas em candidatos

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Planos, Billing e Stripe"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 0 | PRD-060 | Gestão de Planos e Assinaturas (Commerce) | ✅ | Base |
| **1** | **PRD-074** | **Reestruturação dos Planos de Empresas** | **🔄 ATUAL** | Atualiza PRD-060 |
| 2 | PRD-075 | Integração Stripe | ⏳ | Depende de PRD-074 |
| 3 | PRD-076 | Regras de Billing e Upgrade | ⏳ | Depende de PRD-074, PRD-075 |

> **Nota:** Implemente na ordem indicada. PRDs anteriores devem estar ✅ antes de iniciar o seguinte.

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Preços dos planos | Público | Sem restrição |
| Status de trial da empresa | Interno | Visível apenas para admin e a própria empresa |
| Créditos de bônus | Interno | Auditável, não editável pela empresa |

### Autenticação e Autorização

Apenas admins com permissão de gestão de planos (conforme RBAC do PRD-061) podem editar preços, recursos e configurações de trial. A empresa pode visualizar seus próprios dados de trial (dias restantes, status) mas não pode alterá-los.

### Auditoria

Toda alteração de plano (preço, recurso, configuração de trial, ativação/desativação) deve gerar log de auditoria com: admin responsável, data/hora, campo alterado, valor anterior e valor novo.

---

## Fluxos de Usuário

### Fluxo 1: Empresa Nova — Ativação de Trial

```
Empresa se cadastra ──▶ Recebe Plano Básico automaticamente ──▶ Trial ativo (90 dias)
                                                                    │
                                                              Badge sutil no header
                                                           "Período de teste — 90 dias"
```

### Fluxo 2: Escalada de Avisos

```
Dia 1-75: Badge sutil
    │
    ▼
Dia 76-82: Banner informativo + CTA
    │
    ▼
Dia 83-88: Alerta destacado (não dispensável) + CTA proeminente
    │
    ▼
Dia 89-90: Alerta urgente + "Último dia!"
    │
    ▼
Dia 91+: BLOQUEIO ──▶ Tela de conversão (comparativo de planos)
                          │
                          ├──▶ Assina plano pago ──▶ Acesso restaurado
                          │
                          └──▶ Não assina ──▶ Permanece bloqueado
```

### Fluxo 3: Admin Visualiza Empresas em Trial

```
Admin acessa /admin/planos ──▶ Aba Empresa ──▶ Vê 4 planos com Básico destacado como trial
                                                    │
Admin acessa Dashboard Assinaturas ──▶ Vê contadores:
                                        ├── Empresas em trial ativo: N
                                        ├── Trials expirando em 15 dias: N
                                        └── Trials expirados: N
```

### Fluxos de Erro

```
Empresa com trial expirado tenta acessar via URL direta
    ──▶ Redirecionamento forçado para tela de conversão
    ──▶ Nenhuma funcionalidade acessível

Admin tenta desativar plano Básico com empresas em trial
    ──▶ Alerta com quantidade de empresas afetadas
    ──▶ Pede confirmação
    ──▶ Se confirmado, empresas mantêm trial até expiração
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. CONTEXTO IMPORTANTE:**
> - A interface de `/admin/planos` já está implementada (PRD-060). Este PRD ATUALIZA os dados e comportamentos, não recria a interface.
> - O design existente deve ser MANTIDO. Apenas dados, regras e componentes de aviso são novos.
> - Os planos de CANDIDATO não são alterados neste PRD.

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-074-reestruturacao-planos-empresas_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças. Sugestão para este PRD: **"Tiers"** (referência à reestruturação de camadas de planos).

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
| **Não bloquear fluxo principal** | Operações secundárias não devem impedir o core |
| **Fail gracefully** | Se captura opcional falhar, prosseguir com dados parciais |
| **Preservar evidências** | Dados parciais ainda são valiosos para auditoria |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Migração de dados** | Os planos existentes (Essencial Empresas, Seleção Inteligente, Recrutamento Premium) devem ser migrados para os novos nomes e slugs. Assinaturas ativas nesses planos devem ser preservadas. |
| **Componentes de aviso** | Os 4 níveis de aviso (badge, banner, alerta, urgente) devem ser componentes reutilizáveis, pois poderão ser usados em outros contextos futuramente. |
| **Cálculo de dias** | O cálculo de dias restantes do trial deve considerar timezone da empresa (ou UTC se não disponível). |
| **Plano Básico na edição** | O modal de edição do Básico deve ter campos de duração de trial desabilitados para edição pelo admin (fixo em 90 dias), a menos que haja decisão futura de torná-lo configurável. |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Alterar os planos de Candidato (Essencial, Avançar, Destaque Máximo) |
| Recriar a interface de `/admin/planos` — apenas atualizar dados e adicionar componentes |
| Implementar integração com Stripe (será no PRD-075) |
| Implementar regras de upgrade/downgrade com proration (será no PRD-076) |
| Implementar a feature completa de "Gestão de Equipes" do Premium |
| Enviar notificações por e-mail ou WhatsApp sobre o trial |
| Hardcodar os 90 dias de trial — usar campo configurável mesmo que fixo por ora |

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
| 11/02/2026 | v1 | Criação inicial — Reestruturação de 3 para 4 planos de empresa, trial de 3 meses com escalada de avisos |

---

**AILA - Sistemas Inteligentes**
