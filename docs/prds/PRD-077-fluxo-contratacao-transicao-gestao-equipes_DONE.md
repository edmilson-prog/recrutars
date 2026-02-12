# PRD-077: Fluxo de Contratação e Transição para Gestão de Equipes

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Painel Empresa |
| **Repositório** | (repositório Git do RecrutaRS) |
| **Objetivo** | Implementar o fluxo completo de transição do candidato aprovado no pipeline de recrutamento para o módulo de Gestão de Equipes, incluindo ação de contratação, encerramento inteligente de vaga e notificações |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Ciclo Completo de Recrutamento → Gestão |
| **PRDs Relacionados** | PRD-014 (Pipeline Kanban), PRD-007 (Candidatura a Vagas), PRD-013 (CRUD de Vagas), PRDs de Gestão de Equipes, PRDs de Notificações |
| **Padrão de código** | camelCase para novos campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** ✅ | 5+ arquivos, múltiplas integrações (pipeline + equipes + vagas + notificações), regras de negócio complexas (encerramento de vaga, transição de dados, lógica condicional por número de posições) |

---

## Contexto do Problema

O RecrutaRS possui um pipeline de recrutamento bem definido com 4 etapas (Novos → Em Análise → Entrevista → Aprovados) e um módulo de Gestão de Equipes planejado para gerenciar colaboradores com perfis comportamentais. Porém, não existe nenhum fluxo que conecte esses dois mundos.

Quando a empresa aprova um candidato, ele permanece indefinidamente na coluna "Aprovados" do Kanban sem nenhuma ação subsequente. Não há como registrar a contratação, mover o candidato para a equipe, encerrar a vaga ou notificar os demais candidatos. O pipeline "termina" sem desfecho.

Essa lacuna quebra o ciclo que dá sentido ao RecrutaRS como plataforma: **recrutar com inteligência comportamental → contratar → gerenciar a equipe com os mesmos dados**. Sem essa ponte, o perfil Gauge-Pro do candidato contratado "morre" no pipeline, e a empresa perde a continuidade dos dados comportamentais dentro da organização.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Pipeline termina no status "aprovado" sem ação subsequente
- Candidatos aprovados acumulam-se indefinidamente na coluna
- Não há registro formal de contratação na plataforma
- Perfil Gauge-Pro do candidato não é aproveitado após contratação
- Vaga permanece aberta mesmo após contratação
- Demais candidatos não recebem feedback sobre encerramento

### Situação Desejada (To-Be)

- Empresa pode acionar "Contratar" no card do candidato aprovado
- Modal de contratação coleta dados essenciais (departamento, cargo, data de início, salário)
- Candidato contratado é automaticamente transferido para o módulo de Gestão de Equipes como colaborador
- Perfil Gauge-Pro, histórico de candidatura e anotações são preservados na transição
- Sistema verifica posições da vaga e sugere encerramento inteligente
- Empresa confirma e decide o destino dos candidatos restantes
- Candidato contratado recebe notificação de parabéns
- Pipeline fica limpo — candidato sai de "Aprovados"

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Criar módulo separado de "Contratados" | Duplicaria funcionalidades do módulo de Gestão de Equipes já planejado |
| Transição automática sem confirmação | Empresa precisa informar dados adicionais (departamento, cargo, data) e ter controle do processo |
| Encerramento automático da vaga | Empresa pode querer manter a vaga aberta para mais posições ou banco de talentos |
| Apenas marcar status "contratado" no pipeline | Não conecta com Gestão de Equipes, dados comportamentais são perdidos |

---

## Escopo

### Incluído

- ✅ Botão/ação "Contratar" no card do candidato com status "aprovado"
- ✅ Modal de contratação com coleta de dados (departamento, cargo, data de início, salário)
- ✅ Transição do candidato para o módulo de Gestão de Equipes como colaborador
- ✅ Preservação do perfil Gauge-Pro e histórico na transição
- ✅ Verificação de posições da vaga e sugestão inteligente de encerramento
- ✅ Modal de encerramento de vaga com opções para candidatos restantes
- ✅ Notificação ao candidato contratado
- ✅ Notificação aos candidatos dispensados (quando vaga é encerrada)
- ✅ Remoção do candidato contratado da coluna "Aprovados"
- ✅ Registro de contratação para métricas (data, tempo de preenchimento, origem)

### Excluído

- ❌ Gestão de onboarding do colaborador (pertence ao módulo de Gestão de Equipes)
- ❌ Funcionalidades internas do módulo de Gestão de Equipes (mapa comportamental, compatibilidade, etc.)
- ❌ Gestão de folha, ponto, férias ou benefícios
- ❌ Fluxo de desligamento de colaborador
- ❌ Relatórios avançados de contratações (será PRD separado)
- ❌ Integração com sistemas externos de RH

---

## Requisitos Funcionais

### Ação de Contratar

- **RF-001:** O sistema deve exibir a ação "Contratar" exclusivamente para candidatos com status `aprovado` no pipeline
- **RF-002:** A ação "Contratar" deve estar disponível no card do candidato (coluna Aprovados) e no drawer/modal de detalhes do candidato
- **RF-003:** A ação "Contratar" deve ser visualmente destacada das demais ações (mover, reprovar), indicando que é uma ação definitiva e positiva

### Modal de Contratação

- **RF-004:** Ao acionar "Contratar", o sistema deve exibir um modal de confirmação com os seguintes campos:
  - **Departamento** (obrigatório) — seletor com departamentos cadastrados pela empresa
  - **Cargo definitivo** (obrigatório) — campo de texto, pré-preenchido com o título da vaga
  - **Data de início prevista** (obrigatório) — seletor de data, mínimo = data atual
  - **Salário acordado** (opcional) — campo numérico com máscara monetária (R$), marcado como confidencial
  - **Observações** (opcional) — campo de texto livre para anotações sobre a contratação

- **RF-005:** O modal deve exibir um resumo do candidato: nome, foto/avatar, vaga de origem, score de matching e status do teste Gauge-Pro (realizado/não realizado)

- **RF-006:** O campo "Departamento" deve listar os departamentos cadastrados no módulo de Gestão de Equipes; caso nenhum departamento exista, o sistema deve exibir aviso com link para cadastrar departamentos

- **RF-007:** O sistema deve solicitar confirmação explícita antes de efetivar a contratação, informando que o candidato será transferido para o módulo de Gestão de Equipes

### Transição para Gestão de Equipes

- **RF-008:** Ao confirmar a contratação, o sistema deve criar um registro de colaborador no módulo de Gestão de Equipes com os seguintes dados importados automaticamente:
  - Nome completo e e-mail (do perfil do candidato)
  - Foto/avatar (se disponível)
  - Perfil Gauge-Pro completo (scores dimensionais, perfil arquetípico, análise IA)
  - Departamento e cargo (informados no modal)
  - Data de admissão (data de início informada no modal)
  - Salário (se informado)
  - Status: Ativo

- **RF-009:** O sistema deve preservar o vínculo entre o registro do colaborador e o histórico de candidatura (vaga de origem, data de candidatura, etapas percorridas, tempo em cada etapa, anotações do recrutador)

- **RF-010:** O candidato contratado deve ser removido da coluna "Aprovados" do pipeline e receber o status interno `contratado` (distinto de `aprovado`)

- **RF-011:** O sistema deve registrar a contratação com metadados para métricas futuras:
  - Data da contratação
  - Vaga de origem (ID e título)
  - Tempo total de preenchimento (data de abertura da vaga → data de contratação)
  - Tempo no pipeline (data de candidatura → data de contratação)
  - Score de matching no momento da contratação
  - Status do teste Gauge-Pro no momento da contratação (realizado/não realizado)

### Verificação e Encerramento de Vaga

- **RF-012:** Após registrar a contratação, o sistema deve verificar o número de posições da vaga versus o número de contratações já realizadas para aquela vaga

- **RF-013:** Se todas as posições foram preenchidas, o sistema deve exibir modal de sugestão de encerramento:
  - Título: "Todas as posições foram preenchidas"
  - Mensagem informativa com resumo (X de X posições preenchidas)
  - Opção 1: "Encerrar vaga e notificar candidatos" — encerra a vaga e dispara feedback aos demais
  - Opção 2: "Encerrar vaga sem notificar" — encerra mas não dispara feedback
  - Opção 3: "Manter vaga aberta" — para banco de talentos ou novas posições futuras

- **RF-014:** Se ainda há posições em aberto, o sistema deve exibir mensagem informativa: "Contratação registrada. A vaga ainda possui X posição(ões) em aberto." sem sugerir encerramento

- **RF-015:** Ao encerrar uma vaga, o sistema deve registrar:
  - Status da vaga: `encerrada`
  - Motivo: "Posições preenchidas"
  - Data de encerramento
  - A vaga encerrada não deve mais aparecer na busca de vagas para candidatos

### Gestão dos Candidatos Restantes

- **RF-016:** Quando a empresa opta por "Encerrar vaga e notificar candidatos", o sistema deve exibir modal com a lista de candidatos ainda no pipeline daquela vaga (status: `novo`, `em_analise`, `entrevista`, `aprovado`), permitindo à empresa:
  - Selecionar todos ou individualmente
  - Ação padrão: "Mover para banco de talentos" (preserva o perfil para vagas futuras)
  - Ação alternativa: "Dispensar com feedback" (envia notificação de vaga encerrada)

- **RF-017:** Candidatos movidos para "banco de talentos" devem manter seus dados, perfil Gauge-Pro e histórico acessíveis para futuras vagas da empresa

- **RF-018:** Candidatos dispensados devem receber notificação gentil informando que a vaga foi preenchida, agradecendo o interesse e informando que o perfil permanece no banco da plataforma para futuras oportunidades

### Notificações

- **RF-019:** O candidato contratado deve receber notificação na plataforma (e por e-mail, se configurado) com mensagem de congratulações, nome da empresa, cargo e orientações sobre próximos passos

- **RF-020:** Candidatos dispensados por encerramento de vaga devem receber notificação na plataforma (e por e-mail, se configurado) com mensagem gentil de agradecimento

- **RF-021:** O sistema deve registrar todas as notificações enviadas no histórico de comunicação entre empresa e candidato

### Validações e Restrições

- **RF-022:** A ação "Contratar" só deve ser permitida para usuários da empresa com permissão adequada (admin ou recrutador responsável pela vaga)

- **RF-023:** O sistema deve impedir contratação duplicada — se o candidato já foi contratado para outra vaga da mesma empresa, exibir aviso: "Este candidato já é colaborador da sua equipe desde [data]. Deseja registrar nova contratação?"

- **RF-024:** O sistema deve impedir contratar candidato para vaga já encerrada

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** A transição de candidato para colaborador deve ser concluída em menos de 3 segundos
- **RNF-002 (Consistência):** A operação de contratação deve ser atômica — se qualquer etapa falhar (criar colaborador, atualizar pipeline, registrar métricas), toda a operação deve ser revertida
- **RNF-003 (Responsividade):** O modal de contratação deve funcionar adequadamente em dispositivos móveis (min 320px)
- **RNF-004 (Confidencialidade):** O campo de salário deve ser armazenado de forma que apenas usuários com permissão adequada possam visualizá-lo

---

## Critérios de Aceitação

### RF-001/RF-002: Ação de Contratar Visível

```gherkin
DADO que existe um candidato com status "aprovado" na coluna Aprovados do pipeline
QUANDO a empresa visualiza o card do candidato
ENTÃO deve ser exibida a ação "Contratar" de forma destacada
  E a ação também deve estar disponível no drawer de detalhes do candidato
```

### RF-004/RF-005: Modal de Contratação

```gherkin
DADO que a empresa aciona "Contratar" em um candidato aprovado
QUANDO o modal de contratação é exibido
ENTÃO deve mostrar resumo do candidato (nome, vaga, score, status Gauge-Pro)
  E deve exibir campos: Departamento (obrigatório), Cargo (obrigatório, pré-preenchido), Data de início (obrigatório), Salário (opcional), Observações (opcional)
  E o botão de confirmar só deve estar habilitado quando os campos obrigatórios estiverem preenchidos
```

### RF-006: Departamento Inexistente

```gherkin
DADO que a empresa não possui departamentos cadastrados no módulo de Gestão de Equipes
QUANDO o modal de contratação é exibido
ENTÃO o campo Departamento deve exibir aviso "Nenhum departamento cadastrado"
  E deve exibir link para cadastrar departamentos no módulo de Gestão de Equipes
  E o botão de confirmar deve estar desabilitado até que um departamento seja selecionado
```

### RF-008/RF-009: Transição para Gestão de Equipes

```gherkin
DADO que a empresa confirmou a contratação com todos os dados preenchidos
QUANDO a operação é concluída com sucesso
ENTÃO deve existir um novo registro de colaborador no módulo de Gestão de Equipes
  E o colaborador deve conter perfil Gauge-Pro completo (se o candidato tinha teste realizado)
  E o colaborador deve ter vínculo rastreável com a candidatura de origem
  E o candidato deve ser removido da coluna "Aprovados" do pipeline
```

### RF-012/RF-013: Encerramento de Vaga — Posições Preenchidas

```gherkin
DADO que a contratação foi registrada
  E a vaga tinha 2 posições disponíveis
  E esta é a segunda contratação para esta vaga
QUANDO o sistema verifica as posições
ENTÃO deve exibir modal sugerindo encerramento da vaga
  E deve informar "2 de 2 posições preenchidas"
  E deve oferecer opções: Encerrar com notificação, Encerrar sem notificação, Manter aberta
```

### RF-014: Vaga com Posições em Aberto

```gherkin
DADO que a contratação foi registrada
  E a vaga tinha 3 posições disponíveis
  E esta é a primeira contratação para esta vaga
QUANDO o sistema verifica as posições
ENTÃO deve exibir mensagem informativa "A vaga ainda possui 2 posição(ões) em aberto"
  E NÃO deve sugerir encerramento
  E o pipeline deve continuar ativo para aquela vaga
```

### RF-016: Gestão de Candidatos ao Encerrar

```gherkin
DADO que a empresa optou por "Encerrar vaga e notificar candidatos"
QUANDO o modal de gestão de candidatos é exibido
ENTÃO deve listar todos os candidatos restantes no pipeline daquela vaga
  E deve permitir selecionar todos ou individualmente
  E deve oferecer ações: "Mover para banco de talentos" ou "Dispensar com feedback"
```

### RF-023: Contratação Duplicada

```gherkin
DADO que o candidato já foi contratado anteriormente para outra vaga da mesma empresa
QUANDO a empresa aciona "Contratar" para este candidato
ENTÃO deve exibir aviso informando que o candidato já é colaborador
  E deve informar a data da contratação anterior
  E deve perguntar se deseja registrar nova contratação mesmo assim
```

### Cenários de Erro

```gherkin
DADO que a empresa confirmou a contratação
QUANDO ocorre falha na criação do registro de colaborador
ENTÃO toda a operação deve ser revertida
  E o candidato deve permanecer com status "aprovado" no pipeline
  E deve ser exibida mensagem de erro orientando a tentar novamente
```

```gherkin
DADO que a empresa tenta contratar um candidato
QUANDO a vaga já está com status "encerrada"
ENTÃO o sistema deve impedir a contratação
  E deve exibir mensagem informando que a vaga está encerrada
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Modelo de dados e ação de contratar | 4 |
| 2 | Modal de contratação e validações | 5 |
| 3 | Transição para Gestão de Equipes | 4 |
| 4 | Encerramento de vaga e gestão de candidatos | 5 |
| 5 | Notificações e métricas | 4 |

### Detalhamento das Fases

#### Fase 1: Modelo de Dados e Ação de Contratar

**Objetivo:** Estabelecer a base de dados para contratações e adicionar a ação no pipeline

**Ações:**
- [ ] Definir estrutura de dados para registro de contratação (hiring record)
- [ ] Adicionar status `contratado` ao enum de status do pipeline
- [ ] Implementar botão "Contratar" no card do candidato aprovado
- [ ] Implementar botão "Contratar" no drawer de detalhes

**Validação:** Botão "Contratar" visível apenas para candidatos aprovados; clique abre modal (vazio por enquanto)

#### Fase 2: Modal de Contratação e Validações

**Objetivo:** Implementar o modal completo com coleta de dados e validações

**Ações:**
- [ ] Criar componente do modal de contratação
- [ ] Implementar resumo do candidato no topo do modal
- [ ] Implementar campos: departamento (seletor), cargo (pré-preenchido), data de início (date picker), salário (input monetário opcional), observações (textarea)
- [ ] Implementar validações de campos obrigatórios
- [ ] Implementar verificação de departamentos existentes (com fallback/aviso)
- [ ] Implementar verificação de contratação duplicada
- [ ] Implementar confirmação explícita antes de efetivar

**Validação:** Modal funcional com todos os campos, validações impedindo submissão incompleta, aviso quando não há departamentos

#### Fase 3: Transição para Gestão de Equipes

**Objetivo:** Implementar a criação do colaborador e transferência de dados

**Ações:**
- [ ] Implementar criação de registro de colaborador no módulo de Gestão de Equipes com dados do candidato
- [ ] Implementar importação do perfil Gauge-Pro (scores dimensionais, perfil arquetípico)
- [ ] Implementar vínculo rastreável entre colaborador e candidatura de origem
- [ ] Implementar atualização do status do candidato no pipeline (aprovado → contratado)
- [ ] Implementar remoção visual do candidato da coluna "Aprovados"
- [ ] Garantir atomicidade da operação (rollback em caso de falha)

**Validação:** Candidato contratado aparece como colaborador no módulo de Equipes com todos os dados; pipeline reflete a mudança; operação é revertida em caso de erro

#### Fase 4: Encerramento de Vaga e Gestão de Candidatos

**Objetivo:** Implementar a lógica de verificação de posições e encerramento inteligente

**Ações:**
- [ ] Implementar verificação de posições preenchidas vs disponíveis após contratação
- [ ] Implementar modal de sugestão de encerramento (quando todas as posições preenchidas)
- [ ] Implementar as 3 opções: encerrar com notificação, encerrar sem notificação, manter aberta
- [ ] Implementar modal de gestão de candidatos restantes (selecionar, banco de talentos, dispensar)
- [ ] Implementar encerramento de vaga (status, motivo, data)
- [ ] Implementar mensagem informativa quando ainda há posições em aberto

**Validação:** Vaga com todas as posições preenchidas dispara sugestão de encerramento; vaga com posições abertas apenas informa; candidatos restantes podem ser gerenciados individualmente

#### Fase 5: Notificações e Métricas

**Objetivo:** Implementar notificações e registro de métricas de contratação

**Ações:**
- [ ] Implementar notificação de congratulações ao candidato contratado
- [ ] Implementar notificação de vaga encerrada aos candidatos dispensados
- [ ] Implementar registro de métricas de contratação (tempo de preenchimento, conversão, origem)
- [ ] Registrar notificações no histórico de comunicação

**Validação:** Candidato contratado recebe notificação; candidatos dispensados recebem feedback gentil; métricas são registradas corretamente

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-014 | Pipeline Kanban (colunas, cards, movimentação) | ✅ Implementado |
| PRD-007 | Candidatura a Vagas | ✅ Implementado |
| PRD-013 | CRUD de Vagas (inclui número de posições) | ✅ Implementado |
| PRDs Gauge-Pro | Testes comportamentais baseados em PI | ✅ Implementado |
| PRDs Gestão de Equipes | Módulo de equipes (departamentos, colaboradores) | ✅ Implementado |
| PRDs Notificações | Sistema de notificações | ✅ Implementado |

### Decisões Pendentes

- [ ] Confirmar se o módulo de Gestão de Equipes já possui endpoint/função para criar colaborador programaticamente (se não, esta é uma dependência técnica)
- [ ] Definir se o "banco de talentos" mencionado no RF-016 é uma funcionalidade existente ou se precisa de PRD separado

---

## Cadeia de PRDs

Este PRD é um **PRD de ponte** que conecta dois domínios já implementados.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| - | PRD-014 | Pipeline Kanban | ✅ | Base — fornece o pipeline e status "aprovado" |
| - | PRD-013 | CRUD de Vagas | ✅ | Base — fornece número de posições da vaga |
| - | PRDs Equipes | Gestão de Equipes | ✅ | Base — recebe o colaborador contratado |
| **1** | **PRD-077** | **Fluxo de Contratação e Transição** | **🔄 ATUAL** | Ponte entre recrutamento e gestão |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Salário acordado | Confidencial | Visível apenas para admin e recrutador responsável |
| Perfil Gauge-Pro | Sensível (dados comportamentais) | Transferido com mesmo nível de proteção do módulo de origem |
| Dados pessoais do candidato | PII | Transferidos conforme LGPD, com consentimento implícito na aceitação dos termos da plataforma |

### Autenticação e Autorização

- Ação de "Contratar" restrita a usuários com permissão de gestão de vagas (admin ou recrutador responsável)
- Visualização de salário restrita a admin da empresa
- Operação de encerramento de vaga restrita a admin ou criador da vaga

### Auditoria

- Registrar quem executou a contratação (usuário, timestamp)
- Registrar quem encerrou a vaga e motivo
- Registrar quem dispensou cada candidato e canal de notificação

---

## Fluxos de Usuário

### Fluxo Principal: Contratar Candidato Aprovado

```
[Pipeline Kanban — Coluna "Aprovados"]
         │
         ▼
[Empresa clica "Contratar" no card]
         │
         ▼
[Modal de Contratação]
  • Resumo do candidato
  • Departamento (obrigatório)
  • Cargo definitivo (pré-preenchido)
  • Data de início (obrigatório)
  • Salário (opcional)
  • Observações (opcional)
         │
         ▼
[Empresa clica "Confirmar Contratação"]
         │
         ▼
[Sistema executa transição]
  • Cria colaborador no módulo de Equipes
  • Importa perfil Gauge-Pro
  • Atualiza status no pipeline
  • Registra métricas
  • Envia notificação ao candidato
         │
         ▼
[Sistema verifica posições da vaga]
         │
    ┌────┴────┐
    ▼         ▼
[Todas      [Ainda há
preenchidas] posições]
    │         │
    ▼         ▼
[Modal:     [Mensagem:
"Encerrar   "Vaga ainda
vaga?"]     tem X posições"]
    │
    ├── Encerrar com notificação → [Modal: Gerenciar candidatos restantes]
    ├── Encerrar sem notificação → [Vaga encerrada]
    └── Manter aberta → [Pipeline continua]
```

### Fluxo de Exceção: Sem Departamentos Cadastrados

```
[Empresa clica "Contratar"]
         │
         ▼
[Modal de Contratação]
  • Campo Departamento: "Nenhum departamento cadastrado"
  • Link: "Cadastrar departamentos →"
  • Botão Confirmar: desabilitado
         │
         ▼
[Empresa clica no link]
         │
         ▼
[Navega para módulo de Gestão de Equipes > Departamentos]
```

### Fluxo de Exceção: Candidato Já É Colaborador

```
[Empresa clica "Contratar"]
         │
         ▼
[Modal de Aviso]
  "Este candidato já é colaborador da sua equipe desde [data]."
  "Deseja registrar nova contratação?"
         │
    ┌────┴────┐
    ▼         ▼
  [Sim]     [Não]
    │         │
    ▼         ▼
[Modal de   [Cancelar]
Contratação]
```

### Fluxo de Erro: Falha na Transição

```
[Empresa confirma contratação]
         │
         ▼
[Sistema tenta criar colaborador]
         │
         ▼ (FALHA)
[Rollback completo]
  • Candidato permanece "aprovado"
  • Nenhum colaborador criado
  • Nenhuma notificação enviada
         │
         ▼
[Mensagem de erro: "Não foi possível concluir a contratação. Tente novamente."]
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."
>
> **Especificamente:**
> - Investigue a estrutura atual do módulo de Gestão de Equipes — como colaboradores são criados
> - Verifique se existe endpoint/função para criar colaborador programaticamente
> - Verifique a estrutura de dados do Gauge-Pro para saber exatamente quais campos transferir
> - Verifique como o número de posições da vaga é armazenado e se já existe contagem de contratações
> - Verifique o sistema de notificações existente para seguir o mesmo padrão

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (nova funcionalidade)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — usar tipo **Added**
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-077-fluxo-contratacao-transicao-gestao-equipes_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **1.5.0 → 1.6.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Sugestão de codinome para esta versão: **"Bridge"** — representando a ponte entre recrutamento e gestão de equipes.

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
| **Não bloquear fluxo principal** | Se a criação do colaborador falhar, o pipeline não deve ser corrompido |
| **Fail gracefully** | Operação atômica — sucesso total ou rollback completo |
| **Preservar evidências** | Todo o histórico de candidatura deve ser preservado na transição |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Testes comportamentais** | O Gauge-Pro é baseado no **PI (Predictive Index)**, NÃO no DISC. Referenciar corretamente em labels e mensagens |
| **Atomicidade** | A operação de contratação envolve múltiplas escritas (colaborador, pipeline, métricas). Garantir que todas ocorram ou nenhuma |
| **Departamentos** | Reutilizar a estrutura de departamentos do módulo de Gestão de Equipes — não criar estrutura paralela |
| **Notificações** | Seguir o mesmo padrão/componente de notificações já existente na plataforma |
| **UX do modal** | O modal de contratação é uma ação definitiva — deve ter confirmação clara, sem ser acessível acidentalmente |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Criar tabela/coleção separada de "contratados" — usar o módulo de Gestão de Equipes existente |
| Duplicar dados do Gauge-Pro — referenciar o perfil existente, não copiar |
| Permitir contratação sem departamento — é campo obrigatório para integração com Equipes |
| Encerrar vaga automaticamente sem confirmação da empresa |
| Disparar notificações de dispensa sem ação explícita da empresa |
| Remover candidato do pipeline sem criar o registro de colaborador primeiro |
| Hardcodar mensagens de notificação — usar templates configuráveis |

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
| 12/02/2026 | v1 | Criação inicial — Fluxo de contratação como ponte entre pipeline de recrutamento e módulo de Gestão de Equipes |

---

**AILA - Sistemas Inteligentes**
