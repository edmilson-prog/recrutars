# PRD-058: Admin — Gestão de Vagas e Moderação

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| **`PRD-058`** | ⬅ Você está aqui — Admin: Gestão de Vagas e Moderação |
| `PRD-059` | Admin: Relatórios e Analytics |
| `PRD-060` | Admin: Gestão de Planos e Assinaturas |
| `PRD-061` | Admin: Gestão de Usuários e Permissões (RBAC) |
| `PRD-062` | Admin: Feature Flags e Simulador de Planos |

---

# PRD-058: Admin — Gestão de Vagas e Moderação

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Administrativo |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Implementar gestão completa de vagas no Painel Admin com visão 360° de todas as vagas da plataforma, sistema de moderação com aprovação opcional antes da publicação, dashboard de métricas de vagas, e ferramentas de curadoria para garantir qualidade e compliance das publicações |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Painel Admin Avançado |
| **PRDs Relacionados** | PRD-059, PRD-060, PRD-061, PRD-062 |
| **Padrão de código** | camelCase para campos/tabelas |

---

## Contexto do Problema

O Painel Admin do RecrutaRS atualmente permite gerenciar candidatos e empresas, mas não oferece visão nem controle sobre as vagas publicadas na plataforma. Isso cria três problemas críticos:

1. **Sem visibilidade:** O admin não sabe quantas vagas estão ativas, quais empresas publicam mais, ou quais vagas não recebem candidaturas. Não há como medir a saúde do marketplace.

2. **Sem controle de qualidade:** Vagas com descrições inadequadas, salários irreais, informações incompletas ou potencialmente fraudulentas são publicadas sem nenhuma verificação. Isso prejudica a credibilidade da plataforma.

3. **Sem métricas:** Não há como medir eficiência do recrutamento (tempo médio de preenchimento, taxa de conversão candidatura→contratação, vagas abandonadas), impossibilitando decisões baseadas em dados.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Admin não tem acesso a vagas no painel
- Vagas são publicadas diretamente pelas empresas sem revisão
- Não há métricas de vagas na plataforma
- Não há conceito de moderação ou aprovação
- Vagas finalizadas e contratações não são rastreadas

### Situação Desejada (To-Be)

- Seção "Vagas" no painel admin com visão completa
- Dashboard de métricas de vagas e recrutamento
- Sistema de moderação configurável (automático ou com aprovação)
- Ferramentas de curadoria (editar, pausar, remover vagas)
- Rastreabilidade completa: vaga → candidaturas → entrevistas → contratação
- Vagas finalizadas com histórico de contratação

---

## Escopo

### Incluído

- ✅ Dashboard de vagas com KPIs e métricas
- ✅ Listagem de todas as vagas com filtros avançados
- ✅ Visualização detalhada de cada vaga
- ✅ Sistema de moderação (aprovação/rejeição)
- ✅ Ações administrativas (pausar, despublicar, destacar)
- ✅ Vagas finalizadas com registro de contratação
- ✅ Entrevistas realizadas (com dados de currículo, teste e anotações)
- ✅ Entrevistas agendadas (agenda)
- ✅ Métricas de eficiência de recrutamento
- ✅ Configuração de regras de moderação

### Excluído

- ❌ Criação de vagas pelo admin (responsabilidade da empresa)
- ❌ Gestão de planos e assinaturas (PRD-060)
- ❌ Relatórios financeiros (PRD-059)
- ❌ Publicação automática em job boards externos

---

## Estrutura do Menu

### Localização no Painel Admin

```
📊 Dashboard
👥 Candidatos
🏢 Empresas
📋 Vagas ← NOVO
    ├── Dashboard de Vagas
    ├── Todas as Vagas
    ├── Moderação (fila de aprovação)
    ├── Vagas Finalizadas
    ├── Entrevistas
    │       ├── Agendadas
    │       └── Realizadas
    └── Contratações
📊 Relatórios (PRD-059)
⚙️ Configurações
```

---

## Requisitos Funcionais

### Dashboard de Vagas

- **RF-001:** O sistema deve exibir dashboard com KPIs principais:
  - Total de vagas ativas
  - Vagas publicadas este mês
  - Vagas em fila de moderação (pendentes de aprovação)
  - Vagas finalizadas (com contratação) este mês
  - Vagas expiradas/abandonadas este mês
  - Total de candidaturas (todas as vagas)
  - Taxa de conversão média (candidatura → entrevista → contratação)
  - Tempo médio de preenchimento (dias entre publicação e contratação)

- **RF-002:** O dashboard deve exibir gráficos:
  - **Vagas por status:** gráfico de pizza (Ativas, Pausadas, Em moderação, Finalizadas, Expiradas)
  - **Vagas publicadas por mês:** gráfico de barras (últimos 6 meses)
  - **Top 10 empresas por vagas:** ranking com quantidade
  - **Candidaturas por vaga:** média, mínima e máxima
  - **Funil de recrutamento:** Vagas → Candidaturas → Entrevistas → Contratações

- **RF-003:** O dashboard deve exibir alertas:
  - Vagas pendentes de moderação há mais de 24h
  - Vagas ativas há mais de 60 dias sem contratação
  - Vagas com 0 candidaturas há mais de 7 dias
  - Empresas com vagas denunciadas

### Listagem de Vagas

- **RF-004:** O sistema deve exibir listagem de todas as vagas da plataforma:
  
  **Colunas visíveis:**
  - Título da vaga
  - Empresa (com logo)
  - Localidade
  - Status (badge colorido)
  - Plano da empresa (Essencial / Seleção Inteligente / Premium)
  - Nível de destaque da vaga
  - Data de publicação
  - Candidaturas (quantidade)
  - Ações

- **RF-005:** O sistema deve oferecer filtros avançados:
  - Por status: Rascunho / Em moderação / Ativa / Pausada / Finalizada / Expirada / Rejeitada
  - Por empresa (busca por nome)
  - Por localidade (estado/cidade)
  - Por período de publicação
  - Por plano da empresa
  - Por faixa salarial
  - Por área/setor
  - Por quantidade de candidaturas (faixas)

- **RF-006:** O sistema deve permitir busca textual por:
  - Título da vaga
  - Descrição
  - Nome da empresa

### Detalhamento da Vaga

- **RF-007:** Ao clicar em uma vaga, o admin deve ver página de detalhamento com:

  **Dados da vaga:**
  - Título, descrição completa, requisitos
  - Faixa salarial, regime de contratação, modalidade (presencial/remoto/híbrido)
  - Benefícios
  - Data de publicação e expiração
  - Status atual com histórico de mudanças

  **Dados da empresa:**
  - Nome, CNPJ, plano ativo
  - Total de vagas publicadas
  - Histórico de moderação (aprovações/rejeições anteriores)

  **Pipeline da vaga:**
  - Total de candidaturas
  - Lista de candidatos com status (Candidatou → Em análise → Entrevista agendada → Entrevista realizada → Contratado / Rejeitado)
  - Percentual de fit comportamental (se teste Gauge-Pro aplicado)

  **Ações disponíveis:**
  - Aprovar / Rejeitar (se em moderação)
  - Pausar / Despublicar
  - Adicionar nota interna (visível só para admins)
  - Marcar como destaque (pin no topo)
  - Notificar empresa (enviar mensagem)

### Sistema de Moderação

- **RF-008:** O sistema deve suportar modo de moderação configurável:

  | Modo | Comportamento |
  |------|-------------|
  | **Automático** | Vagas publicadas imediatamente (default) |
  | **Moderação para novos** | Primeiras 3 vagas de cada empresa passam por aprovação |
  | **Moderação total** | Toda vaga passa por aprovação antes de publicar |
  | **Moderação por plano** | Apenas vagas de empresas do plano Essencial (gratuito) passam por moderação |

- **RF-009:** Fila de moderação deve exibir:
  - Lista de vagas pendentes ordenada por data de submissão (mais antiga primeiro)
  - Preview do conteúdo da vaga
  - Dados da empresa (plano, histórico, vagas anteriores)
  - Indicador de tempo na fila
  - Ações: Aprovar / Rejeitar (com motivo obrigatório) / Solicitar correção

- **RF-010:** Ao rejeitar uma vaga, o admin deve:
  - Selecionar motivo (lista predefinida + campo livre):
    - Descrição inadequada ou incompleta
    - Faixa salarial incompatível com o cargo
    - Suspeita de fraude
    - Conteúdo discriminatório
    - Informações duplicadas
    - Outro (texto livre)
  - O sistema deve notificar a empresa por e-mail com o motivo
  - A empresa pode corrigir e resubmeter

- **RF-011:** Ao solicitar correção, o admin deve:
  - Indicar quais campos precisam de ajuste
  - Adicionar comentário explicativo
  - A vaga volta para a empresa como "Correção solicitada"
  - A empresa edita e resubmete para nova análise

### Vagas Finalizadas e Contratações

- **RF-012:** O sistema deve exibir seção "Vagas Finalizadas":
  - Lista de vagas que foram encerradas (com ou sem contratação)
  - Motivo do encerramento: Vaga preenchida / Cancelada pela empresa / Expirada
  - Data de encerramento

- **RF-013:** O sistema deve exibir seção "Contratações":
  - Lista de contratações realizadas pela plataforma
  - Para cada contratação:
    - Candidato contratado (nome, perfil)
    - Vaga (título, empresa)
    - Data da contratação
    - Tempo de preenchimento (dias)
    - Currículo do contratado
    - Resultado do teste de perfil Gauge-Pro (se realizado)
    - Anotações de entrevista do recrutador
  - Filtros: por empresa, período, área

### Entrevistas

- **RF-014:** O sistema deve exibir seção "Entrevistas Agendadas":
  - Lista de entrevistas futuras (agenda)
  - Dados: candidato, vaga, empresa, data/hora, modalidade (presencial/online)
  - Ordenação cronológica (próxima primeiro)
  - Filtro por empresa, período, modalidade

- **RF-015:** O sistema deve exibir seção "Entrevistas Realizadas":
  - Lista de entrevistas já concluídas
  - Para cada entrevista:
    - Candidato (nome, foto)
    - Vaga e empresa
    - Data da entrevista
    - Currículo do candidato (link/preview)
    - Resultado do teste de perfil (se disponível)
    - Bloco de anotações do recrutador
    - Resultado: Aprovado para próxima fase / Rejeitado / Contratado
  - Filtros: por empresa, período, resultado

### Configurações de Moderação

- **RF-016:** Na seção de Configurações do Admin, permitir configurar:
  - Modo de moderação (automático / novos / total / por plano)
  - Tempo máximo na fila antes de alerta (default: 24h)
  - Motivos de rejeição (lista editável)
  - Template de e-mail de rejeição
  - Template de e-mail de solicitação de correção
  - Regras automáticas de flagging:
    - Salário abaixo do mínimo regional
    - Descrição com menos de 100 caracteres
    - Vagas sem requisitos preenchidos

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Dashboard de vagas deve carregar em < 3 segundos
- **RNF-002 (Performance):** Listagem com filtros deve retornar em < 2 segundos (até 10.000 vagas)
- **RNF-003 (UX):** Fila de moderação deve ter atalhos de teclado (A = Aprovar, R = Rejeitar, N = Próxima)
- **RNF-004 (Auditoria):** Toda ação de moderação deve ser registrada com timestamp e admin responsável
- **RNF-005 (Notificação):** Rejeição/correção deve gerar e-mail para a empresa em até 5 minutos

---

## Critérios de Aceitação

### RF-001/002: Dashboard de Vagas

```gherkin
DADO que existem 150 vagas na plataforma em diversos status
QUANDO o admin acessar Vagas → Dashboard
ENTÃO deve ver KPIs atualizados (ativas, finalizadas, em moderação)
  E deve ver gráfico de pizza com distribuição por status
  E deve ver ranking das top 10 empresas por vagas
  E deve ver funil: vagas → candidaturas → entrevistas → contratações
```

### RF-008/009/010: Moderação

```gherkin
DADO que o modo de moderação é "Moderação total"
QUANDO uma empresa publicar uma vaga
ENTÃO a vaga deve entrar na fila de moderação com status "Em moderação"
  E NÃO deve aparecer para candidatos
  E deve aparecer na fila do admin

DADO que o admin está na fila de moderação
QUANDO rejeitar uma vaga selecionando motivo "Descrição inadequada"
ENTÃO a vaga deve mudar para status "Rejeitada"
  E a empresa deve receber e-mail com o motivo
  E o registro de moderação deve ser salvo com admin, motivo e timestamp
```

### RF-013: Contratações

```gherkin
DADO que um candidato foi marcado como "Contratado" em uma vaga
QUANDO o admin acessar Vagas → Contratações
ENTÃO deve ver o registro com candidato, vaga, empresa e data
  E deve poder visualizar o currículo do contratado
  E deve poder visualizar o resultado do teste de perfil
  E deve poder ver as anotações de entrevista do recrutador
```

### Cenários de Erro

```gherkin
DADO que o admin tenta rejeitar uma vaga sem selecionar motivo
QUANDO clicar em "Rejeitar"
ENTÃO deve exibir "Selecione o motivo da rejeição"
  E não permitir a ação

DADO que a moderação está como "Automático"
QUANDO uma empresa publicar uma vaga
ENTÃO a vaga deve ir direto para status "Ativa" sem fila de moderação
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Menu, navegação e dashboard de vagas | 4 |
| 2 | Listagem, filtros e detalhamento | 4 |
| 3 | Sistema de moderação (fila, aprovação, rejeição) | 5 |
| 4 | Vagas finalizadas, contratações e entrevistas | 4 |
| 5 | Configurações de moderação e regras automáticas | 3 |

### Detalhamento das Fases

#### Fase 1: Menu e Dashboard

**Objetivo:** Criar seção de vagas no admin com dashboard

**Ações:**
- [ ] Adicionar item "Vagas" no menu lateral do admin
- [ ] Criar subitens de navegação
- [ ] Implementar dashboard com KPIs e gráficos
- [ ] Implementar alertas

**Validação:** Dashboard exibe métricas corretas da plataforma

#### Fase 2: Listagem e Detalhamento

**Objetivo:** Implementar listagem completa com filtros

**Ações:**
- [ ] Criar listagem de vagas com colunas e badges
- [ ] Implementar filtros avançados
- [ ] Criar página de detalhamento de vaga
- [ ] Implementar pipeline de candidatos da vaga

**Validação:** Admin vê todas as vagas com filtros e detalhamento

#### Fase 3: Moderação

**Objetivo:** Implementar sistema de moderação configurável

**Ações:**
- [ ] Criar fila de moderação
- [ ] Implementar ações de aprovação/rejeição/correção
- [ ] Implementar notificação por e-mail para empresa
- [ ] Registrar auditoria de moderação

**Validação:** Vagas passam por fila conforme modo configurado

#### Fase 4: Finalizadas, Contratações e Entrevistas

**Objetivo:** Implementar rastreamento completo

**Ações:**
- [ ] Criar seção de vagas finalizadas
- [ ] Criar seção de contratações com histórico completo
- [ ] Criar seção de entrevistas agendadas
- [ ] Criar seção de entrevistas realizadas

**Validação:** Histórico completo do ciclo vaga→contratação visível

#### Fase 5: Configurações

**Objetivo:** Implementar configurações de moderação

**Ações:**
- [ ] Criar tela de configuração de modo de moderação
- [ ] Implementar edição de motivos de rejeição
- [ ] Implementar templates de e-mail
- [ ] Implementar regras automáticas de flagging

**Validação:** Configurações aplicam corretamente ao fluxo de moderação

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

**Codinomes:** Sugestão: "Sentinel" (vigilância e moderação de vagas)

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
| **Não bloquear fluxo principal** | Moderação não pode travar publicação se modo automático |
| **Fail gracefully** | Se notificação de rejeição falhar, registrar e permitir reenvio |
| **Preservar evidências** | Histórico de moderação é imutável |
| **Testar incrementalmente** | Validar cada modo de moderação isoladamente |
| **Documentar decisões** | Registrar escolhas de moderação no log |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Moderação** | Default é "Automático" — moderação ativa é opt-in |
| **Performance** | Dashboard usa queries agregadas com cache de 5 minutos |
| **Ações** | Toda ação gera registro de auditoria |
| **E-mails** | Templates editáveis com variáveis ({{empresa}}, {{vaga}}, {{motivo}}) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Excluir vagas permanentemente (sempre soft delete) |
| Permitir moderação sem motivo registrado |
| Enviar e-mail de rejeição sem preview ao admin |
| Bloquear empresa automaticamente por rejeição (pode ser erro do admin) |
| Mostrar dados internos de moderação para a empresa (apenas resultado) |

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
