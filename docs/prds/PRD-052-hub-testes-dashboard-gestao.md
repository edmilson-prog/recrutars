# PRD-052: Hub de Testes Comportamentais — Dashboard e Gestão

> **AILA - Sistemas Inteligentes**  
> RecrutaRS - Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-046` | Gauge-Pro 2.0 - Fundação Administrativa |
| `PRD-049` | Gauge-Pro Parte 1: Seleção de Palavras |
| `PRD-050` | Gauge-Pro Parte 2: Cenários Situacionais |
| `PRD-051` | Agente de Análise Comportamental por IA |
| **`PRD-052`** | ⬅ Você está aqui — Hub de Testes: Dashboard e Gestão |
| `PRD-053` | Hub de Testes: Resultados e Comparativos |
| `PRD-054` | Hub de Testes: Relatórios, Métricas e Auditoria |

---

# PRD-052: Hub de Testes Comportamentais — Dashboard e Gestão

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS - Painel Empresa |
| **Repositório** | [URL do repositório Git] |
| **Objetivo** | Criar o Hub de Testes Comportamentais no Painel da Empresa, permitindo que empresas criem, configurem, gerenciem e acompanhem testes Gauge-Pro aplicados a candidatos, com dashboard de visão geral e gestão completa do ciclo de vida dos testes |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Hub de Testes Comportamentais |
| **PRDs Relacionados** | PRD-046, PRD-049, PRD-050, PRD-051, PRD-053, PRD-054 |
| **Padrão de código** | camelCase para campos/tabelas |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 1 arquivo, sem dependências externas, < 100 linhas |
| **Média** | 2-5 arquivos, banco OU integração, funcionalidade isolada |
| **Alta** | 5+ arquivos, múltiplas integrações, regras de negócio complexas |

**Justificativa:** Alta complexidade — múltiplas telas interligadas (dashboard, criação, gestão, convites), integração com sistema Gauge-Pro existente, regras de negócio para ciclo de vida dos testes, e persistência de configurações por empresa.

---

## Contexto do Problema

Atualmente a aplicação do teste Gauge-Pro é passiva: o candidato se inscreve em uma vaga e o teste é disponibilizado automaticamente. A empresa não tem controle sobre o processo de avaliação comportamental.

Empresas precisam de autonomia para:
- Criar testes comportamentais customizados (ex: pesos diferentes por dimensão para cada vaga)
- Convidar candidatos diretamente (fora do fluxo de vagas)
- Acompanhar em tempo real quem já fez, quem falta, quem abandonou
- Ter visão consolidada de todo o pipeline de avaliação comportamental

O Hub de Testes Comportamentais transforma a empresa de consumidora passiva para **gestora ativa** do processo de avaliação.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Teste Gauge-Pro é aplicado automaticamente quando candidato se inscreve em vaga
- Empresa não pode criar testes avulsos ou customizados
- Não há visão consolidada de todos os testes em andamento
- Não há sistema de convites diretos para candidatos

### Situação Desejada (To-Be)

- Nova seção "Testes Comportamentais" no menu lateral do Painel Empresa
- Dashboard com KPIs, funil de testes, alertas e pendências
- Empresa pode criar testes com configurações customizadas
- Sistema de convites por e-mail e por link
- Gestão completa do ciclo de vida: rascunho → ativo → encerrado → arquivado
- Acompanhamento individual de candidatos por teste

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Manter apenas fluxo automático por vaga | Limita autonomia da empresa, não permite testes avulsos |
| Tela única sem dashboard | Não oferece visão estratégica do pipeline |
| Apenas lista de candidatos com teste | Não permite gestão ativa do ciclo de vida |

---

## Escopo

### Incluído

- ✅ Nova seção "Testes Comportamentais" no menu do Painel Empresa
- ✅ Dashboard com KPIs e funil visual
- ✅ Criação de testes com templates e customização de pesos
- ✅ Vinculação de teste a vaga (opcional)
- ✅ Sistema de convites (e-mail e link público)
- ✅ Gestão de status: Rascunho → Ativo → Encerrado → Arquivado
- ✅ Acompanhamento de candidatos por teste (pendentes, em andamento, concluídos)
- ✅ Alertas de pendências
- ✅ Prazo de validade para convites

### Excluído

- ❌ Comparativo lado a lado de candidatos (PRD-053)
- ❌ Relatórios PDF e exportação (PRD-054)
- ❌ Métricas avançadas e auditoria (PRD-054)
- ❌ Gestão de equipes internas (PRD-055+)
- ❌ Matching automático com vaga (funcionalidade já existente em PRDs anteriores)

---

## Estrutura do Menu

### Localização no Painel Empresa

```
📊 Dashboard
👥 Candidatos
📋 Vagas
🧠 Testes Comportamentais ← NOVO
    ├── Visão Geral (Dashboard)
    ├── Criar Teste
    ├── Meus Testes
    └── Convites
⚙️ Configurações
```

---

## Requisitos Funcionais

### Dashboard — Visão Geral

- **RF-001:** O sistema deve exibir dashboard com KPIs principais:
  - Total de testes criados
  - Testes ativos no momento
  - Candidatos com teste pendente
  - Taxa de conclusão geral (%)
  - Tempo médio de aplicação

- **RF-002:** O sistema deve exibir funil visual de testes:
  ```
  Convites Enviados → Testes Iniciados → Testes Concluídos → Analisados por IA
  ```

- **RF-003:** O sistema deve exibir alertas de pendências:
  - Candidatos com convite expirado
  - Candidatos que iniciaram mas não concluíram (há mais de 48h)
  - Testes sem candidatos vinculados

- **RF-004:** O sistema deve exibir lista de atividades recentes:
  - "[Candidato] concluiu teste para [Vaga]" — há X minutos
  - "[Candidato] iniciou teste" — há X horas
  - "Novo convite enviado para [e-mail]" — há X dias

- **RF-005:** O sistema deve permitir filtrar dashboard por período (7d, 30d, 90d, personalizado)

### Criação de Testes

- **RF-006:** O sistema deve permitir criar novo teste comportamental com:
  - Nome do teste (obrigatório)
  - Descrição (opcional)
  - Vaga vinculada (opcional — permite testes avulsos)
  - Prazo de validade do convite (dias)
  - Status inicial: Rascunho

- **RF-007:** O sistema deve oferecer templates de teste por perfil:

  | Template | Descrição | Pesos Customizados |
  |----------|-----------|-------------------|
  | Padrão Gauge-Pro | Todas as dimensões com peso igual | D1=1, D2=1, D3=1, D4=1, D5=1 |
  | Liderança | Foco em assertividade e relacional | D1=1.5, D2=1.2, D3=0.8, D4=1.0, D5=1.5 |
  | Operacional | Foco em ritmo e conformidade | D1=0.8, D2=0.8, D3=1.5, D4=1.5, D5=1.0 |
  | Vendas | Foco em sociabilidade e dominância | D1=1.3, D2=1.5, D3=0.8, D4=0.8, D5=1.2 |
  | Técnico | Foco em conformidade e ritmo | D1=0.8, D2=0.8, D3=1.2, D4=1.5, D5=1.0 |
  | Criativo | Foco em sociabilidade e baixa conformidade | D1=1.0, D2=1.3, D3=0.8, D4=0.7, D5=1.2 |
  | Personalizado | Empresa define todos os pesos | Livre |

- **RF-008:** O sistema deve permitir customizar pesos por dimensão no template "Personalizado":
  - Cada dimensão com slider de 0.5 a 2.0
  - Visualização em radar chart do perfil ideal

- **RF-009:** O sistema deve permitir adicionar instruções personalizadas que o candidato verá antes de iniciar o teste

- **RF-010:** O sistema deve salvar rascunhos automaticamente

### Gestão de Testes (Meus Testes)

- **RF-011:** O sistema deve listar todos os testes da empresa com:
  - Nome do teste
  - Vaga vinculada (se houver)
  - Status (Rascunho / Ativo / Encerrado / Arquivado)
  - Total de candidatos convidados
  - Total de testes concluídos
  - Taxa de conclusão (%)
  - Data de criação

- **RF-012:** O sistema deve permitir filtrar testes por: status, vaga, período de criação

- **RF-013:** O sistema deve permitir buscar testes por nome ou vaga

- **RF-014:** O sistema deve permitir as seguintes ações por status:

  | Status Atual | Ações Disponíveis |
  |-------------|-------------------|
  | **Rascunho** | Editar, Ativar, Excluir |
  | **Ativo** | Ver candidatos, Enviar convites, Encerrar |
  | **Encerrado** | Ver resultados, Reativar, Arquivar |
  | **Arquivado** | Ver resultados, Restaurar |

- **RF-015:** Ao ativar um teste (Rascunho → Ativo), o sistema deve gerar:
  - Link público de convite (URL única)
  - Status de envio de convites

- **RF-016:** O sistema deve permitir duplicar um teste existente (cópia com novo nome)

### Detalhes do Teste (Visualização Individual)

- **RF-017:** O sistema deve exibir página de detalhes com:
  - Informações do teste (nome, descrição, pesos, vaga)
  - Estatísticas: convidados, iniciados, concluídos, pendentes
  - Mini funil visual específico deste teste
  - Lista de candidatos com status individual

- **RF-018:** A lista de candidatos deve mostrar:
  - Nome do candidato
  - E-mail
  - Status: Convidado / Em andamento / Concluído / Expirado / Abandonado
  - Data do convite
  - Data de conclusão (se concluído)
  - Perfil arquetípico (se concluído)

- **RF-019:** O sistema deve permitir ações por candidato:
  - Reenviar convite (se expirado ou não iniciado)
  - Ver resultado (se concluído)
  - Remover do teste (se não iniciado)

### Sistema de Convites

- **RF-020:** O sistema deve permitir convidar candidatos de três formas:
  1. **Por e-mail:** Inserir um ou múltiplos e-mails (separados por vírgula ou um por linha)
  2. **Por link:** Gerar URL pública que qualquer pessoa pode acessar
  3. **Da base:** Selecionar candidatos já cadastrados na plataforma

- **RF-021:** Convites por e-mail devem conter:
  - Nome da empresa
  - Nome do teste
  - Instruções básicas
  - Link único por candidato
  - Prazo de validade

- **RF-022:** O link público deve:
  - Ser uma URL amigável e única por teste
  - Solicitar nome e e-mail antes de iniciar
  - Respeitar prazo de validade do teste
  - Poder ser desativado pelo gestor

- **RF-023:** O sistema deve registrar status de cada convite:
  - Enviado
  - Visualizado (link acessado)
  - Iniciado
  - Concluído
  - Expirado

- **RF-024:** O sistema deve permitir definir lembrete automático:
  - Enviar lembrete para candidatos que não iniciaram após X dias
  - Máximo de 2 lembretes por candidato

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Dashboard deve carregar em < 3 segundos
- **RNF-002 (Responsividade):** Interface deve funcionar em desktop e tablet
- **RNF-003 (Escalabilidade):** Suportar empresa com até 500 testes simultâneos
- **RNF-004 (UX):** Criação de teste em no máximo 5 passos
- **RNF-005 (Segurança):** Links de convite devem ser únicos e não adivinháveis

---

## Critérios de Aceitação

### RF-001/002: Dashboard

```gherkin
DADO que a empresa possui testes comportamentais criados
QUANDO o gestor acessar Testes Comportamentais → Visão Geral
ENTÃO deve visualizar KPIs com totais atualizados
  E deve ver funil visual de conversão
  E deve ver alertas de pendências (se houver)
  E o dashboard deve carregar em menos de 3 segundos
```

### RF-006/007/008: Criação de Teste

```gherkin
DADO que o gestor está na tela de criação de teste
QUANDO preencher nome, selecionar template e clicar em Salvar
ENTÃO o teste deve ser criado com status "Rascunho"
  E os pesos das dimensões devem corresponder ao template selecionado
  E o teste deve aparecer na lista "Meus Testes"

DADO que o gestor selecionou template "Personalizado"
QUANDO ajustar os sliders de peso por dimensão
ENTÃO o radar chart deve atualizar em tempo real
  E os pesos devem ser salvos no teste
```

### RF-014/015: Gestão de Status

```gherkin
DADO que existe um teste com status "Rascunho"
QUANDO o gestor clicar em "Ativar"
ENTÃO o status deve mudar para "Ativo"
  E um link público de convite deve ser gerado
  E o teste deve aceitar candidatos

DADO que existe um teste com status "Ativo"
QUANDO o gestor clicar em "Encerrar"
ENTÃO o status deve mudar para "Encerrado"
  E novos convites não devem ser aceitos
  E resultados existentes devem permanecer acessíveis
```

### RF-020/021: Convites

```gherkin
DADO que o gestor está na tela de convites de um teste ativo
QUANDO inserir e-mails e clicar em "Enviar Convites"
ENTÃO cada e-mail deve receber convite com link único
  E os candidatos devem aparecer na lista com status "Convidado"
  E o total de convidados deve ser atualizado no dashboard

DADO que um candidato recebeu convite com prazo de 7 dias
QUANDO o prazo expirar sem o candidato iniciar
ENTÃO o status deve mudar para "Expirado"
  E deve aparecer no alerta de pendências do dashboard
```

### Cenários de Erro

```gherkin
DADO que o gestor tenta ativar um teste sem nome
QUANDO clicar em "Ativar"
ENTÃO deve exibir mensagem: "Preencha o nome do teste antes de ativar"
  E o teste deve permanecer como Rascunho

DADO que o gestor tenta enviar convite para e-mail inválido
QUANDO clicar em "Enviar"
ENTÃO deve destacar o e-mail inválido
  E deve permitir corrigir antes de reenviar
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura do menu e navegação | 3 |
| 2 | Dashboard (Visão Geral) | 4 |
| 3 | Criação de testes com templates | 5 |
| 4 | Gestão de testes e detalhes | 4 |
| 5 | Sistema de convites | 4 |

### Detalhamento das Fases

#### Fase 1: Estrutura do Menu e Navegação

**Objetivo:** Criar a seção "Testes Comportamentais" no Painel Empresa

**Ações:**
- [ ] Adicionar item "Testes Comportamentais" no menu lateral com ícone 🧠
- [ ] Criar subitens: Visão Geral, Criar Teste, Meus Testes, Convites
- [ ] Configurar rotas de navegação
- [ ] Criar layout base das páginas

**Validação:** Menu aparece corretamente e navegação funciona entre sub-páginas

#### Fase 2: Dashboard (Visão Geral)

**Objetivo:** Implementar dashboard com KPIs, funil e alertas

**Ações:**
- [ ] Criar componentes de KPI cards
- [ ] Implementar funil visual de testes
- [ ] Criar lista de alertas/pendências
- [ ] Criar feed de atividades recentes
- [ ] Implementar filtro por período

**Validação:** Dashboard exibe dados corretos (mockados inicialmente)

#### Fase 3: Criação de Testes com Templates

**Objetivo:** Implementar fluxo de criação com templates e customização

**Ações:**
- [ ] Criar formulário de criação de teste
- [ ] Implementar sistema de templates com pesos pré-definidos
- [ ] Criar componente de customização de pesos (sliders + radar chart)
- [ ] Implementar vinculação opcional com vaga
- [ ] Implementar auto-save de rascunhos

**Validação:** Gestor consegue criar teste com template ou pesos customizados

#### Fase 4: Gestão de Testes e Detalhes

**Objetivo:** Implementar lista de testes e tela de detalhes

**Ações:**
- [ ] Criar tela "Meus Testes" com lista filtável
- [ ] Implementar máquina de estados (Rascunho → Ativo → Encerrado → Arquivado)
- [ ] Criar tela de detalhes do teste com lista de candidatos
- [ ] Implementar ações por status e por candidato

**Validação:** Gestor consegue gerenciar ciclo de vida completo do teste

#### Fase 5: Sistema de Convites

**Objetivo:** Implementar convites por e-mail, link e da base

**Ações:**
- [ ] Criar tela de envio de convites com as 3 modalidades
- [ ] Implementar geração de links únicos por candidato
- [ ] Implementar geração de link público por teste
- [ ] Criar tracking de status do convite
- [ ] Implementar lembrete automático

**Validação:** Convites são enviados e rastreados corretamente

---

## Modelo de Dados

### Tabela: `company_tests`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_id | UUID | FK empresa |
| name | VARCHAR(200) | Nome do teste |
| description | TEXT | Descrição opcional |
| vacancy_id | UUID | FK vaga (nullable) |
| template_type | ENUM | 'standard', 'leadership', 'operational', 'sales', 'technical', 'creative', 'custom' |
| dimension_weights | JSONB | Pesos por dimensão: { d1: 1.0, d2: 1.5, ... } |
| custom_instructions | TEXT | Instruções personalizadas para o candidato |
| invite_expiry_days | INT | Prazo de validade do convite em dias |
| public_link_slug | VARCHAR(50) | Slug para link público (unique) |
| public_link_active | BOOLEAN | Link público ativo/inativo |
| reminder_days | INT | Dias para enviar lembrete automático |
| max_reminders | INT | Máximo de lembretes (default 2) |
| status | ENUM | 'draft', 'active', 'closed', 'archived' |
| activated_at | TIMESTAMP | Data de ativação |
| closed_at | TIMESTAMP | Data de encerramento |
| created_at | TIMESTAMP | Criação |
| updated_at | TIMESTAMP | Última atualização |
| created_by | UUID | FK usuário que criou |

### Tabela: `test_invitations`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| company_test_id | UUID | FK teste |
| candidate_id | UUID | FK candidato (nullable — preenchido ao aceitar) |
| candidate_email | VARCHAR(255) | E-mail do convidado |
| candidate_name | VARCHAR(200) | Nome (se disponível) |
| invite_token | VARCHAR(100) | Token único do convite |
| invite_type | ENUM | 'email', 'link', 'internal' |
| status | ENUM | 'sent', 'viewed', 'started', 'completed', 'expired', 'abandoned' |
| sent_at | TIMESTAMP | Data de envio |
| viewed_at | TIMESTAMP | Primeira visualização |
| started_at | TIMESTAMP | Início do teste |
| completed_at | TIMESTAMP | Conclusão |
| expires_at | TIMESTAMP | Data de expiração |
| reminders_sent | INT | Quantidade de lembretes enviados |
| last_reminder_at | TIMESTAMP | Último lembrete |
| test_result_id | UUID | FK resultado do teste (após conclusão) |
| created_at | TIMESTAMP | Criação |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-046 | Fundação Administrativa Gauge-Pro | ✅ |
| PRD-049 | Gauge-Pro Parte 1: Seleção de Palavras | ⏳ |
| PRD-050 | Gauge-Pro Parte 2: Cenários Situacionais | ⏳ |

### PRDs Subsequentes (dependem deste)

| PRD | Descrição |
|-----|-----------|
| PRD-053 | Hub de Testes: Resultados e Comparativos |
| PRD-054 | Hub de Testes: Relatórios, Métricas e Auditoria |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Hub de Testes Comportamentais"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-046 | Fundação Administrativa | ✅ | Base |
| 2 | PRD-049 | Seleção de Palavras | ⏳ | Depende de 046 |
| 3 | PRD-050 | Cenários Situacionais | ⏳ | Depende de 049 |
| 4 | PRD-051 | Agente IA de Análise | ⏳ | Depende de 050 |
| **5** | **PRD-052** | **Hub: Dashboard e Gestão** | **🔄 ATUAL** | Depende de 049, 050 |
| 6 | PRD-053 | Hub: Resultados e Comparativos | ⏳ | Depende de 052 |
| 7 | PRD-054 | Hub: Relatórios, Métricas e Auditoria | ⏳ | Depende de 052, 053 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| E-mail de candidatos | PII | RLS por empresa |
| Resultados de testes | Sensível | Acesso apenas pela empresa dona |
| Links de convite | Funcional | Tokens únicos, expiração |

### Autenticação e Autorização

- Apenas usuários da empresa com papel "Gestor" ou superior podem criar/gerenciar testes
- Candidatos acessam teste apenas via link válido (token + prazo)
- Resultados visíveis apenas para a empresa que criou o teste

---

## Fluxos de Usuário

### Fluxo Principal: Criar e Aplicar Teste

```
Gestor acessa "Testes Comportamentais"
    │
    ├── Clica em "Criar Teste"
    │       │
    │       ├── Preenche nome e descrição
    │       ├── Seleciona template (ou Personalizado)
    │       ├── Vincula vaga (opcional)
    │       ├── Define prazo de convite
    │       └── Salva como Rascunho
    │
    ├── Ativa o teste
    │       │
    │       └── Sistema gera link público
    │
    ├── Envia convites
    │       │
    │       ├── Por e-mail (1 ou mais)
    │       ├── Por link compartilhável
    │       └── Da base de candidatos
    │
    └── Acompanha no Dashboard
            │
            ├── Vê funil de conversão
            ├── Recebe alertas de pendências
            └── Clica no candidato → Vê resultado
```

### Fluxo de Exceção: Convite Expirado

```
Convite expira → Status muda para "Expirado"
    │
    ├── Aparece no alerta do dashboard
    │
    └── Gestor pode:
            ├── Reenviar convite (novo prazo)
            └── Remover candidato do teste
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

**Codinomes:** Sugestão: "Command" (controle ativo sobre testes)

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
| **Não bloquear fluxo principal** | Testes automáticos por vaga devem continuar funcionando |
| **Fail gracefully** | Se convite falhar, permitir reenvio |
| **Preservar evidências** | Log de todas as ações de gestão |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Dashboard** | Dados mockados inicialmente, preparar para dados reais |
| **Templates** | Os pesos dos templates são sugestões, empresa pode ajustar |
| **Links** | Tokens de convite devem ser UUID ou hash seguro |
| **Status** | Implementar como máquina de estados com transições válidas |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Permitir exclusão de teste com candidatos que já responderam |
| Expor tokens de convite em URLs adivinháveis |
| Bloquear fluxo automático de testes por vaga |
| Criar dependência circular entre testes e vagas |
| Cache de dados do dashboard sem invalidação |

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
| 01/02/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
