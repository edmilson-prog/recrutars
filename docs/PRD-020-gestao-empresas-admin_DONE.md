# PRD-020: Gestão de Empresas (Admin)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar gestão de empresas pelo administrador |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Listagem, filtros, detalhes, ações administrativas |

---

## Contexto do Problema

O administrador precisa gerenciar as empresas da plataforma: visualizar, ativar/desativar, editar planos, verificar status de pagamento.

---

## Conceito da Solução

### Listagem de Empresas

```
┌──────────────────────────────────────────────────────────────────┐
│                    Gestão de Empresas                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔍 [Buscar por nome ou CNPJ...                             ]    │
│                                                                  │
│  Filtros: [Status ▼] [Plano ▼] [Setor ▼]      Total: 45 empresas│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🏢 TechCorp Soluções                          🟢 Ativa     │  │
│  │ CNPJ: 12.345.678/0001-90                                   │  │
│  │ Plano: Profissional | Vagas: 8 | Usuários: 2               │  │
│  │ Cadastro: 01/01/2026                                       │  │
│  │                                                            │  │
│  │ [Ver detalhes]  [Editar plano]  [Desativar]               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🏢 StartupXYZ                                 🟡 Pendente   │  │
│  │ CNPJ: 98.765.432/0001-10                                   │  │
│  │ Plano: Básico | Vagas: 2 | Usuários: 1                     │  │
│  │ Cadastro: 05/01/2026 | Pagamento pendente                  │  │
│  │                                                            │  │
│  │ [Ver detalhes]  [Editar plano]  [Notificar]               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🏢 OldCorp                                    🔴 Inativa    │  │
│  │ CNPJ: 11.222.333/0001-44                                   │  │
│  │ Plano: - | Desativada em: 10/12/2025                       │  │
│  │                                                            │  │
│  │ [Ver detalhes]  [Reativar]                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│               [1] [2] [3] ... [5] [→]                            │
└──────────────────────────────────────────────────────────────────┘
```

### Detalhes da Empresa (Drawer)

```
┌──────────────────────────────────────────────────────────────────┐
│  TechCorp Soluções                                       [✕]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────┐  TechCorp Soluções                    🟢 Ativa      │
│  │  LOGO  │  CNPJ: 12.345.678/0001-90                           │
│  └────────┘  Setor: Tecnologia | 51-200 funcionários            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Tabs: [Informações] [Vagas] [Usuários] [Histórico]         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ── Tab: Informações ──                                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Plano Atual                                                 │ │
│  │                                                             │ │
│  │ Profissional - R$ 299/mês                                  │ │
│  │ Próxima cobrança: 01/02/2026                               │ │
│  │ Status pagamento: ✅ Em dia                                 │ │
│  │                                                             │ │
│  │ [Alterar plano]  [Conceder desconto]                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Contato                                                     │ │
│  │                                                             │ │
│  │ Email: contato@techcorp.com.br                             │ │
│  │ Telefone: (11) 99999-9999                                  │ │
│  │ Website: https://techcorp.com.br                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Métricas                                                    │ │
│  │                                                             │ │
│  │ Vagas ativas: 8 | Total candidaturas: 156                  │ │
│  │ Testes solicitados: 45 | Taxa de resposta: 72%             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Ações Administrativas                                       │ │
│  │                                                             │ │
│  │ [Desativar empresa]  [Enviar notificação]                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Listagem de todas as empresas com filtros
- ✅ Busca por nome ou CNPJ
- ✅ Filtros: status (ativa, pendente, inativa), plano, setor
- ✅ Card de empresa com resumo
- ✅ Drawer com detalhes completos
- ✅ Tabs: Informações, Vagas, Usuários, Histórico
- ✅ Ações: ver detalhes, editar plano (mock), ativar/desativar
- ✅ Paginação

### Excluído

- ❌ Criar empresa manualmente
- ❌ Integração com pagamento
- ❌ Emissão de nota fiscal
- ❌ Exportar lista

---

## Requisitos Funcionais

### Listagem

- **RF-001:** Listar todas as empresas da plataforma
- **RF-002:** Buscar por nome ou CNPJ
- **RF-003:** Filtrar por status (ativa, pendente, inativa)
- **RF-004:** Filtrar por plano (Básico, Profissional, Enterprise)
- **RF-005:** Filtrar por setor
- **RF-006:** Exibir contador de resultados
- **RF-007:** Paginação (20 por página)

### Card de Empresa

- **RF-008:** Exibir: logo, nome, CNPJ, status
- **RF-009:** Exibir: plano, quantidade de vagas, usuários
- **RF-010:** Exibir data de cadastro
- **RF-011:** Exibir alertas (pagamento pendente, etc.)
- **RF-012:** Botões de ação contextual

### Detalhes (Drawer)

- **RF-013:** Tab Informações: plano, contato, métricas
- **RF-014:** Tab Vagas: lista das vagas da empresa
- **RF-015:** Tab Usuários: membros da empresa
- **RF-016:** Tab Histórico: log de ações administrativas

### Ações Administrativas

- **RF-017:** Desativar empresa (com confirmação)
- **RF-018:** Reativar empresa (com confirmação)
- **RF-019:** Alterar plano (mock - select + confirmação)
- **RF-020:** Enviar notificação (mock - toast)

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Listagem carrega em menos de 1s
- **RNF-002 (UX):** Filtros combináveis
- **RNF-003 (Segurança):** Apenas admin pode acessar

---

## Critérios de Aceitação

### RF-001 a RF-007: Listagem

```gherkin
DADO que o admin acessa gestão de empresas
QUANDO a página carrega
ENTÃO deve ver lista de empresas
  E deve ter campo de busca
  E deve ter filtros funcionais
  E deve ter paginação
```

### RF-017/RF-018: Ativar/Desativar

```gherkin
DADO que o admin quer desativar uma empresa
QUANDO ele clica em "Desativar"
ENTÃO deve ver confirmação
  E ao confirmar, status muda para "inativa"
  E vagas da empresa são pausadas
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Listagem e filtros | 3 |
| 2 | Drawer de detalhes | 3 |
| 3 | Ações administrativas | 2 |

### Detalhamento das Fases

#### Fase 1: Listagem e Filtros

**Ações:**
- [ ] Criar página `/admin/empresas`
- [ ] Criar componente `CompanyCard`
- [ ] Implementar busca e filtros
- [ ] Implementar paginação

#### Fase 2: Drawer de Detalhes

**Ações:**
- [ ] Criar componente `CompanyDrawer`
- [ ] Implementar tabs
- [ ] Exibir informações, vagas, usuários

#### Fase 3: Ações Administrativas

**Ações:**
- [ ] Implementar ativar/desativar
- [ ] Implementar alterar plano (mock)
- [ ] Implementar modais de confirmação

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-019 | Dashboard Admin | ⏳ Pendente |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.19.0 → 0.20.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.20.0] - 2026-01-XX

### Added
- Gestão de empresas para admin
- Listagem com busca e filtros
- Drawer com detalhes completos (tabs)
- Ações: ativar, desativar, alterar plano
- Visualização de vagas e usuários por empresa
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Drawer** | Usar Sheet do shadcn/ui |
| **Filtros** | Combináveis, persistir em URL |
| **Paginação** | 20 itens por página |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Criar empresa manualmente |
| Integração com pagamento |
| Exportar dados |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
