# PRD-018: Configurações (Empresa)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar página de configurações e perfil da empresa |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Múltiplas seções, upload de logo, formulários |

---

## Contexto do Problema

A empresa precisa gerenciar seu perfil público (que candidatos veem), configurar preferências da conta e gerenciar usuários com acesso.

Diferente do candidato (PRD-011), a empresa tem:
- Perfil público da empresa
- Múltiplos usuários (gestão de equipe)
- Configurações de plano/assinatura

---

## Conceito da Solução

### Estrutura de Abas

```
┌──────────────────────────────────────────────────────────────────┐
│                       Configurações                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Perfil da Empresa] [Equipe] [Conta] [Plano]                   │
│  ═══════════════════                                             │
│                                                                  │
```

### Tab: Perfil da Empresa

```
┌──────────────────────────────────────────────────────────────────┐
│  Perfil da Empresa                                               │
│  ──────────────────                                              │
│                                                                  │
│  Este perfil é exibido para candidatos nas vagas e mensagens.    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Logo da Empresa                                            │  │
│  │                                                            │  │
│  │ ┌────────┐                                                 │  │
│  │ │  LOGO  │  [Alterar logo]                                │  │
│  │ └────────┘                                                 │  │
│  │                                                            │  │
│  │ Recomendado: 200x200px, PNG ou JPG                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Informações Básicas                                        │  │
│  │                                                            │  │
│  │ Nome da Empresa *                                          │  │
│  │ [TechCorp Soluções                                    ]    │  │
│  │                                                            │  │
│  │ Setor de Atuação *                                         │  │
│  │ [Tecnologia                                      ▼]        │  │
│  │                                                            │  │
│  │ Tamanho da Empresa *                                       │  │
│  │ [51-200 funcionários                             ▼]        │  │
│  │                                                            │  │
│  │ Website                                                    │  │
│  │ [https://techcorp.com.br                              ]    │  │
│  │                                                            │  │
│  │ LinkedIn                                                   │  │
│  │ [https://linkedin.com/company/techcorp                ]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Sobre a Empresa *                                          │  │
│  │                                                            │  │
│  │ [A TechCorp é uma empresa de tecnologia focada em         ]│  │
│  │ [soluções inovadoras para o mercado financeiro...         ]│  │
│  │ [                                                         ]│  │
│  │                                              350/1000 car  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Localização                                                │  │
│  │                                                            │  │
│  │ Cidade *                      Estado *                     │  │
│  │ [São Paulo              ]     [SP ▼]                       │  │
│  │                                                            │  │
│  │ Endereço (opcional)                                        │  │
│  │ [Av. Paulista, 1000 - Bela Vista                      ]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                                              [Salvar alterações] │
└──────────────────────────────────────────────────────────────────┘
```

### Tab: Equipe

```
┌──────────────────────────────────────────────────────────────────┐
│  Equipe                                                          │
│  ──────                                                          │
│                                                                  │
│  Gerencie quem tem acesso à conta da empresa.                    │
│                                                                  │
│                                              [+ Convidar membro] │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 Maria Silva                                    Admin    │  │
│  │    maria@techcorp.com.br                                   │  │
│  │    Último acesso: Hoje às 14:30                           │  │
│  │                                              [Você]        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👤 João Santos                                   Membro    │  │
│  │    joao@techcorp.com.br                                    │  │
│  │    Último acesso: Ontem                                    │  │
│  │                                    [Alterar cargo] [Remover]│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 📧 Convite pendente                                        │  │
│  │    ana@techcorp.com.br                                     │  │
│  │    Enviado em: 10/01/2026                                  │  │
│  │                              [Reenviar convite] [Cancelar] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tab: Conta

```
┌──────────────────────────────────────────────────────────────────┐
│  Conta                                                           │
│  ─────                                                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔐 Segurança                                               │  │
│  │                                                            │  │
│  │ Email: maria@techcorp.com.br            [Alterar email]    │  │
│  │ Senha: ••••••••                         [Alterar senha]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔔 Notificações                                            │  │
│  │                                                            │  │
│  │ [✓] Novas candidaturas                                    │  │
│  │ [✓] Mensagens de candidatos                               │  │
│  │ [✓] Testes realizados                                     │  │
│  │ [ ] Resumo semanal                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⚠️ Zona de Perigo                                          │  │
│  │                                                            │  │
│  │ [Desativar conta da empresa]                              │  │
│  │ Todas as vagas serão pausadas. Pode ser reativada.        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tab: Plano

```
┌──────────────────────────────────────────────────────────────────┐
│  Plano                                                           │
│  ─────                                                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Seu plano atual: PROFISSIONAL                              │  │
│  │                                                            │  │
│  │ • Até 10 vagas ativas                                     │  │
│  │ • Banco de talentos ilimitado                             │  │
│  │ • 5 usuários                                              │  │
│  │ • Suporte prioritário                                     │  │
│  │                                                            │  │
│  │ Próxima cobrança: 01/02/2026 - R$ 299,00                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Uso do plano                                               │  │
│  │                                                            │  │
│  │ Vagas ativas:    ████████░░ 8/10                          │  │
│  │ Usuários:        ████░░░░░░ 2/5                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Ver outros planos]  [Gerenciar pagamento]                     │
│                                                                  │
│  (Nota: Funcionalidades de pagamento são mock nesta versão)     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Tab Perfil: logo, informações básicas, sobre, localização
- ✅ Tab Equipe: lista de membros, convites pendentes
- ✅ Tab Conta: segurança, notificações, zona de perigo
- ✅ Tab Plano: informações do plano atual (mock)
- ✅ Upload de logo (preview local)
- ✅ Validação de campos obrigatórios
- ✅ Toast de feedback

### Excluído

- ❌ Convite real de membros (mock)
- ❌ Integração com pagamento
- ❌ Alteração real de plano
- ❌ Histórico de faturas
- ❌ API de upload de imagem

---

## Requisitos Funcionais

### Perfil da Empresa

- **RF-001:** Deve permitir upload de logo (preview local)
- **RF-002:** Campos: nome, setor, tamanho, website, LinkedIn, sobre, cidade, estado
- **RF-003:** Campos obrigatórios: nome, setor, tamanho, sobre, cidade, estado
- **RF-004:** Campo "sobre" com limite de 1000 caracteres
- **RF-005:** Botão salvar com toast de confirmação

### Equipe

- **RF-006:** Listar membros da empresa com cargo (Admin/Membro)
- **RF-007:** Exibir último acesso de cada membro
- **RF-008:** Botão "Convidar membro" abre modal (mock)
- **RF-009:** Admin pode remover membros
- **RF-010:** Exibir convites pendentes

### Conta

- **RF-011:** Exibir email atual com botão alterar
- **RF-012:** Botão alterar senha abre modal
- **RF-013:** Checkboxes de preferências de notificação
- **RF-014:** Botão desativar conta com confirmação

### Plano

- **RF-015:** Exibir nome e benefícios do plano atual
- **RF-016:** Exibir data da próxima cobrança
- **RF-017:** Exibir barras de uso (vagas, usuários)
- **RF-018:** Botões de ação (mock - apenas exibem toast)

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Tabs para organização clara
- **RNF-002 (Responsividade):** Tabs viram accordion em mobile
- **RNF-003 (Feedback):** Toast em toda ação

---

## Critérios de Aceitação

### RF-001 a RF-005: Perfil

```gherkin
DADO que a empresa quer atualizar seu perfil
QUANDO ela edita os campos e clica salvar
ENTÃO os dados devem ser salvos (mock)
  E deve exibir toast "Perfil atualizado"
```

### RF-006 a RF-010: Equipe

```gherkin
DADO que a empresa tem membros cadastrados
QUANDO ela acessa a tab Equipe
ENTÃO deve ver lista de membros com cargo
  E deve ver convites pendentes
  E admin deve ter opção de remover membros
```

### RF-015 a RF-018: Plano

```gherkin
DADO que a empresa acessa a tab Plano
QUANDO a página carrega
ENTÃO deve ver detalhes do plano atual
  E deve ver uso de recursos (barras)
  E botões de ação devem ser mock
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e Perfil | 3 |
| 2 | Equipe e Conta | 3 |
| 3 | Plano e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Perfil

**Ações:**
- [ ] Criar página `/empresa/configuracoes`
- [ ] Implementar estrutura de tabs
- [ ] Criar formulário de perfil
- [ ] Implementar upload de logo (preview)

#### Fase 2: Equipe e Conta

**Ações:**
- [ ] Criar tab Equipe com lista de membros
- [ ] Criar modal de convite (mock)
- [ ] Criar tab Conta com segurança e notificações
- [ ] Implementar zona de perigo

#### Fase 3: Plano e Refinamentos

**Ações:**
- [ ] Criar tab Plano com informações mock
- [ ] Implementar barras de uso
- [ ] Testar responsividade
- [ ] Ajustes de UX

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-002 | Proteção de Rotas | ✅ Implementado |
| PRD-004 | Tipos TypeScript | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.17.0 → 0.18.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.18.0] - 2026-01-XX

### Added
- Configurações da empresa com tabs
- Perfil público da empresa com upload de logo
- Gestão de equipe (mock)
- Configurações de conta e notificações
- Visualização de plano (mock)
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Tabs** | Usar Tabs do shadcn/ui |
| **Logo** | FileReader para preview local |
| **Plano** | Dados mockados, botões com toast |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Integração real de pagamento |
| Convite real de membros |
| Upload real de imagem |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 11/01/2026 |
| **Versão do App** | 0.18.0 |
| **Observações** | Conclui Fase 3 (Área da Empresa) |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |
| 11/01/2026 | v2 | Implementação completa |

---

**AILA - Sistemas Inteligentes**
