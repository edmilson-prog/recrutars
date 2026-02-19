# PRD-079: Vinculação Obrigatória de Plano e Gestão de Trial para Empresas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Plataforma de Recrutamento Inteligente |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Garantir que toda empresa ativa na plataforma esteja obrigatoriamente vinculada a um plano de assinatura, com onboarding automático no plano "Basico Empresas" em modo trial, aviso visual durante o período de teste e bloqueio ao expirar |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Gestão de Assinaturas e Planos |
| **PRDs Relacionados** | PRD-078 (Cadastro Empresa CNPJ) |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

> **Justificativa da complexidade Alta:** Envolve regras de negócio em múltiplos fluxos (cadastro, migração, expiração, conversão), impacta empresas existentes em produção, requer integração com estrutura de planos/Stripe e afeta a experiência do usuário em múltiplas telas.

---

## Contexto do Problema

Atualmente, empresas podem se cadastrar e permanecer ativas na plataforma RecrutaRS sem estarem vinculadas a nenhum plano de assinatura. Isso cria inconsistência nos dados, dificulta o controle de acesso a funcionalidades por tier e impossibilita a gestão comercial adequada da base de clientes.

Empresas sem plano consomem recursos da plataforma sem previsão de conversão, e a ausência de uma experiência de trial estruturada reduz a percepção de valor — a empresa não sabe o que está testando nem quando o teste termina.

Este PRD estabelece a regra fundamental de que **nenhuma empresa pode estar ativa na plataforma sem um plano vinculado**, implementa o onboarding automático via trial do plano "Basico Empresas" e cria os mecanismos de comunicação visual, bloqueio por expiração e conversão para planos pagos.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Empresas podem se cadastrar sem vinculação a nenhum plano
- Empresas existentes na base não possuem plano associado
- Não há comunicação visual sobre período de trial
- Não há mecanismo de bloqueio quando o trial expira
- Não há fluxo estruturado de conversão para plano pago

### Situação Desejada (To-Be)

- Toda empresa nova é automaticamente vinculada ao plano "Basico Empresas" em modo trial
- Empresas existentes sem plano são migradas para o "Basico Empresas" com trial
- A quantidade de dias do trial é dinâmica, obtida diretamente da configuração do plano
- Um aviso visual destacado (mas não intrusivo) informa o período de trial e dias restantes
- Ao expirar o trial, a empresa é bloqueada até assinar um plano pago
- Um fluxo de conversão permite que a empresa escolha e assine um plano pago

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Deixar empresas sem plano e controlar manualmente | Inviável para escala, gera inconsistência de dados |
| Vincular ao plano Essencial como trial | O plano de entrada natural é o "Basico Empresas", que já possui a configuração de trial |
| Trial sem bloqueio (apenas downgrade de recursos) | Não cria urgência de conversão e complica a lógica de permissões |

---

## Escopo

### Incluído

- ✅ Vinculação automática do plano "Basico Empresas" com trial a toda empresa nova no momento do cadastro
- ✅ Migração de empresas existentes sem plano para o "Basico Empresas" com trial
- ✅ Leitura dinâmica dos dias de trial a partir da configuração do plano
- ✅ Aviso visual de trial no dashboard da empresa com contagem regressiva de dias restantes
- ✅ Botão de ação (CTA) no aviso para direcionar à escolha de plano
- ✅ Bloqueio da conta da empresa quando o trial expirar
- ✅ Tela de bloqueio informativa com direcionamento para assinatura de plano pago
- ✅ Fluxo de escolha e assinatura de plano pago (Essencial, Avançar, Premium)

### Excluído

- ❌ Processamento de pagamento via gateway (Stripe checkout) — será abordado em PRD dedicado de integração Stripe
- ❌ Alteração nos recursos/funcionalidades de cada plano
- ❌ Gestão administrativa de planos pelo painel admin
- ❌ Notificações por e-mail sobre expiração do trial (PRD futuro)
- ❌ Lógica de upgrade/downgrade entre planos pagos

---

## Requisitos Funcionais

### Vinculação Automática no Cadastro

- **RF-001:** O sistema deve vincular automaticamente toda empresa nova ao plano "Basico Empresas" em modo trial no momento do cadastro, antes de conceder acesso à plataforma
- **RF-002:** A data de início do trial deve ser registrada como a data/hora do cadastro da empresa
- **RF-003:** A duração do trial deve ser obtida dinamicamente a partir da configuração do plano, não sendo um valor fixo no código
- **RF-004:** Nenhuma empresa deve conseguir acessar funcionalidades da plataforma sem ter um plano ativo vinculado

### Migração de Empresas Existentes

- **RF-005:** O sistema deve identificar todas as empresas existentes que não possuem plano vinculado
- **RF-006:** Essas empresas devem ser migradas para o plano "Basico Empresas" em modo trial, com a data de início do trial sendo a data da migração
- **RF-007:** A migração deve preservar todos os dados existentes da empresa sem alteração

### Aviso Visual de Trial

- **RF-008:** O sistema deve exibir um aviso visual destacado no ambiente da empresa enquanto ela estiver em período de trial
- **RF-009:** O aviso deve informar claramente que a empresa está em período de teste e quantos dias restam
- **RF-010:** O aviso deve incluir um botão de ação (CTA) que direcione a empresa para a página de escolha de planos
- **RF-011:** O aviso deve ser visível mas não deve bloquear ou prejudicar a experiência de uso da plataforma
- **RF-012:** A contagem de dias restantes deve ser calculada dinamicamente com base na data de início do trial e na duração configurada no plano
- **RF-013:** O aviso deve se intensificar visualmente nos últimos 7 dias do trial (ex: mudança de cor ou destaque maior), sem atrapalhar o uso

### Bloqueio Pós-Trial

- **RF-014:** O sistema deve bloquear o acesso da empresa a funcionalidades da plataforma quando o período de trial expirar
- **RF-015:** A empresa bloqueada deve visualizar uma tela informativa explicando que o trial expirou e que é necessário assinar um plano pago para continuar
- **RF-016:** A tela de bloqueio deve exibir as opções de planos pagos disponíveis (Essencial, Avançar, Premium) com seus respectivos recursos e preços
- **RF-017:** Dados da empresa não devem ser excluídos pelo bloqueio — apenas o acesso é restrito

### Fluxo de Conversão

- **RF-018:** O sistema deve oferecer uma página de escolha de planos acessível tanto pelo CTA do aviso de trial quanto pela tela de bloqueio
- **RF-019:** A página de planos deve exibir os planos pagos disponíveis com seus recursos, preços por ciclo de cobrança (mensal, trimestral, semestral, anual) e descontos aplicáveis
- **RF-020:** O sistema deve registrar a escolha do plano pela empresa e atualizar o status da assinatura para ativo
- **RF-021:** Ao assinar um plano pago, o aviso de trial deve ser removido e o bloqueio (se houver) deve ser desfeito imediatamente

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** A verificação de status do plano/trial deve ocorrer sem impacto perceptível no carregamento das páginas (< 500ms adicionais)
- **RNF-002 (Consistência):** A informação de dias restantes deve ser consistente em todas as telas onde o aviso for exibido
- **RNF-003 (Resiliência):** Se a consulta ao plano falhar, a empresa não deve ser bloqueada por erro — o sistema deve assumir trial ativo e registrar o erro para investigação
- **RNF-004 (Migração segura):** A migração de empresas existentes deve ser reversível e auditável, com log de cada empresa migrada

---

## Critérios de Aceitação

### RF-001/RF-004: Vinculação Automática no Cadastro

```gherkin
DADO que uma nova empresa está concluindo o processo de cadastro
QUANDO o cadastro for finalizado com sucesso
ENTÃO a empresa deve estar vinculada ao plano "Basico Empresas" em modo trial
  E a data de início do trial deve ser a data/hora atual
  E a empresa deve ter acesso às funcionalidades do plano "Basico Empresas"
```

### RF-003: Dias de Trial Dinâmicos

```gherkin
DADO que o plano "Basico Empresas" possui a configuração de dias de trial
QUANDO o sistema vincular uma empresa a esse plano
ENTÃO a duração do trial deve ser obtida diretamente da configuração do plano
  E não deve haver valores fixos de dias de trial no código da aplicação
```

### RF-005/RF-006: Migração de Empresas Existentes

```gherkin
DADO que existem empresas cadastradas sem plano vinculado
QUANDO a migração for executada
ENTÃO todas essas empresas devem estar vinculadas ao plano "Basico Empresas" em modo trial
  E a data de início do trial deve ser a data da execução da migração
  E os dados existentes da empresa devem permanecer inalterados
```

### RF-008/RF-012: Aviso Visual de Trial

```gherkin
DADO que uma empresa está em período de trial com 45 dias restantes
QUANDO ela acessar qualquer página do dashboard
ENTÃO deve ser exibido um aviso informando "Período de teste — 45 dias restantes"
  E o aviso deve conter um botão para escolha de planos
  E o aviso não deve impedir o uso das funcionalidades
```

### RF-013: Intensificação do Aviso

```gherkin
DADO que uma empresa está nos últimos 7 dias do trial
QUANDO ela acessar o dashboard
ENTÃO o aviso de trial deve ter destaque visual intensificado
  E deve comunicar urgência sem bloquear o uso
```

### RF-014/RF-015: Bloqueio Pós-Trial

```gherkin
DADO que o período de trial de uma empresa expirou
QUANDO ela tentar acessar qualquer funcionalidade da plataforma
ENTÃO deve ser exibida uma tela de bloqueio informativa
  E a tela deve explicar que o trial expirou
  E deve apresentar as opções de planos pagos disponíveis
  E os dados da empresa não devem ser excluídos
```

### RF-020/RF-021: Conversão para Plano Pago

```gherkin
DADO que uma empresa (em trial ou bloqueada) escolheu um plano pago
QUANDO a assinatura for confirmada
ENTÃO o status da empresa deve ser atualizado para assinante ativo
  E o aviso de trial deve ser removido
  E o bloqueio (se existente) deve ser desfeito imediatamente
  E a empresa deve ter acesso às funcionalidades do novo plano
```

### Cenários de Erro

```gherkin
DADO que ocorreu uma falha ao consultar o status do plano da empresa
QUANDO a empresa tentar acessar a plataforma
ENTÃO o sistema não deve bloquear a empresa por erro de consulta
  E o sistema deve registrar o erro para investigação
  E a empresa deve ter acesso normalmente (fail-safe)
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Investigação da estrutura de dados e preparação | - |
| 2 | Vinculação automática no cadastro e regra de obrigatoriedade | 3-5 |
| 3 | Migração de empresas existentes | 1-2 |
| 4 | Aviso visual de trial e contagem regressiva | 3-5 |
| 5 | Bloqueio pós-trial e fluxo de conversão | 5-8 |

### Detalhamento das Fases

#### Fase 1: Investigação e Preparação

**Objetivo:** Mapear a estrutura atual de dados de planos e empresas, validar campos existentes e identificar ajustes necessários

**Ações:**
- [ ] Investigar a estrutura das tabelas de planos no Supabase — verificar se o campo de dias de trial já existe (ver Observação Crítica abaixo)
- [ ] Mapear a relação atual entre empresas e planos na base de dados
- [ ] Identificar empresas existentes sem plano vinculado
- [ ] Validar a configuração do plano "Basico Empresas" e sua identificação no sistema

**Validação:** Relatório completo da estrutura atual e gaps identificados

#### Fase 2: Vinculação Automática no Cadastro

**Objetivo:** Garantir que toda nova empresa receba automaticamente o plano "Basico Empresas" em modo trial

**Ações:**
- [ ] Implementar a vinculação automática do plano no fluxo de cadastro de empresa
- [ ] Registrar data de início do trial
- [ ] Obter dias de trial dinamicamente da configuração do plano
- [ ] Implementar validação que impeça empresa de ficar ativa sem plano

**Validação:** Cadastrar uma nova empresa e verificar que o plano foi vinculado automaticamente com trial ativo

#### Fase 3: Migração de Empresas Existentes

**Objetivo:** Normalizar a base de dados vinculando empresas sem plano ao "Basico Empresas" com trial

**Ações:**
- [ ] Criar script de migração para empresas sem plano
- [ ] Implementar log de auditoria da migração
- [ ] Executar migração com data de início do trial = data da execução

**Validação:** Todas as empresas na base possuem plano vinculado, dados preservados, logs gerados

#### Fase 4: Aviso Visual de Trial

**Objetivo:** Comunicar ao usuário da empresa que está em período de trial com contagem regressiva

**Ações:**
- [ ] Implementar componente de aviso visual com contagem de dias restantes
- [ ] Incluir CTA para página de escolha de planos
- [ ] Implementar intensificação visual nos últimos 7 dias
- [ ] Garantir que o aviso não prejudica a experiência de uso

**Validação:** Aviso visível com contagem correta, CTA funcional, intensificação nos últimos 7 dias

#### Fase 5: Bloqueio Pós-Trial e Fluxo de Conversão

**Objetivo:** Bloquear empresas com trial expirado e oferecer caminho para assinatura

**Ações:**
- [ ] Implementar verificação de expiração do trial
- [ ] Criar tela de bloqueio informativa
- [ ] Implementar página de escolha de planos com preços e ciclos de cobrança
- [ ] Implementar registro da escolha de plano e desbloqueio

**Validação:** Empresa com trial expirado vê tela de bloqueio, consegue escolher plano e é desbloqueada

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-078 | Cadastro Empresa CNPJ | Verificar status |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Supabase | Banco de dados / Auth | Disponível |
| Stripe | Gestão de planos e assinaturas | Sincronizado (conforme imagem) |

### Decisões Pendentes

- [ ] Validar se o campo de dias de trial já existe na tabela de planos no Supabase (ver Observação Crítica)

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Status da assinatura | Sensível | Controle de acesso por RLS |
| Data de expiração do trial | Interno | Não expor em APIs públicas |

### Autenticação e Autorização

- A verificação de status do plano deve ocorrer server-side, não apenas no frontend
- O bloqueio deve ser enforced no backend — o frontend é apenas a camada visual
- Usuários de uma empresa bloqueada não devem conseguir acessar endpoints da API

### Auditoria

- Registrar toda vinculação de plano (automática ou por migração)
- Registrar toda mudança de status (trial → bloqueado → ativo)
- Registrar toda escolha de plano no fluxo de conversão

---

## Fluxos de Usuário

### Fluxo 1: Empresa Nova — Cadastro com Trial

1. Empresa se cadastra na plataforma
2. Sistema vincula automaticamente o plano "Basico Empresas" com trial
3. Empresa acessa o dashboard e vê o aviso de trial com dias restantes e CTA
4. Empresa utiliza a plataforma normalmente durante o trial

### Fluxo 2: Empresa em Trial — Conversão Voluntária

1. Empresa em trial visualiza o aviso com CTA "Escolha seu plano"
2. Empresa clica no CTA
3. Sistema exibe página com planos pagos, recursos e preços
4. Empresa seleciona plano e ciclo de cobrança
5. Sistema registra a assinatura e remove o aviso de trial
6. Empresa continua usando a plataforma como assinante

### Fluxo 3: Empresa com Trial Expirado — Bloqueio e Conversão

1. Trial da empresa expira
2. Empresa tenta acessar a plataforma
3. Sistema exibe tela de bloqueio com explicação e opções de planos
4. Empresa escolhe um plano pago
5. Sistema ativa a assinatura e desbloqueia o acesso
6. Empresa retoma o uso da plataforma

### Fluxo de Erro

1. Falha ao consultar status do plano
2. Sistema assume trial ativo (fail-safe)
3. Erro é registrado para investigação
4. Empresa não é prejudicada pela falha

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### ⚠️ OBSERVAÇÃO CRÍTICA — VALIDAR ANTES DE TUDO

> **Antes de iniciar a implementação, investigue a estrutura de dados no Supabase e valide:**
> 1. Se a tabela de planos (`plans` ou equivalente) já possui um campo para configurar os dias de trial
> 2. Se já existe uma tabela de vínculo entre empresa e plano (assinaturas/subscriptions)
> 3. Se já existem campos para data de início do trial e data de expiração
> 4. Qual o identificador do plano "Basico Empresas" no banco de dados
>
> **Se o campo de dias de trial NÃO existir na tabela de planos, será necessário criá-lo.** Toda a lógica de duração do trial depende desse campo ser dinâmico — valor fixo no código não é aceitável.

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — usar tipo **Added**
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-079-vinculacao-plano-trial-empresas_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **1.14.0 → 1.15.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças. Sugestão contextual: **"Gatekeeper"** (vinculação obrigatória de plano + controle de acesso por trial).

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
| **Fail gracefully** | Se a consulta ao plano falhar, não bloquear a empresa — assumir trial ativo |
| **Preservar evidências** | Toda vinculação e mudança de status deve ser auditada |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Dias de trial** | Devem ser lidos da configuração do plano, NUNCA hardcoded |
| **Bloqueio** | Deve ser enforced server-side, não apenas no frontend |
| **Migração** | Deve ser reversível e gerar log completo |
| **Aviso visual** | Destacado mas não intrusivo — não deve cobrir conteúdo ou travar navegação |
| **Contagem regressiva** | Calcular com base em data de início + dias do plano, não em data fixa |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Hardcodar número de dias de trial (ex: `const TRIAL_DAYS = 90`) |
| Implementar bloqueio apenas no frontend (verificação deve ser server-side) |
| Excluir ou alterar dados da empresa ao bloquear por expiração |
| Bloquear empresa se houver falha na consulta ao plano (fail-safe) |
| Implementar lógica de pagamento/checkout neste PRD |
| Alterar recursos ou configurações dos planos existentes |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 18/02/2026 |
| **Versão do App** | v1.17.0 "Gatekeeper" |
| **Implementado por** | Claude Opus 4.6 via Claude Code |
| **Observações** | Descoberto que PRD-074 ja havia implementado toda a UI de trial (badge, banner, alert, guard, pagina expirada). Dois bugs criticos corrigidos: (1) trigger handle_new_user() perdeu codigo de criacao de subscription na migracao 030, (2) getSubscription() filtrava apenas status='active' ignorando trials. Migracao aplicada para 4 empresas existentes. |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 17/02/2026 | v1 | Criação inicial |
| 18/02/2026 | v2 | Implementação completa — v1.17.0 "Gatekeeper" |

---

**AILA - Sistemas Inteligentes**
