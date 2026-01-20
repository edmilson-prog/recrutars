# PRD-011: Configurações (Candidato)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar página de configurações e preferências do candidato |
| **Tipo** | Feature |
| **Complexidade** | Baixa |
| **Total de Fases** | 2 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | 2-3 componentes, formulários simples, sem lógica complexa |

---

## Contexto do Problema

O candidato precisa ter controle sobre suas preferências e dados da conta. Configurações centralizam ajustes que não fazem parte do perfil profissional.

Atualmente:
- A página de configurações existe mas está vazia ou básica
- Não há como alterar senha
- Não há preferências de notificação
- Não há opção de excluir conta

As configurações permitem:
- Controle sobre dados pessoais
- Preferências de comunicação
- Segurança da conta
- Conformidade com LGPD (exclusão de dados)

---

## Conceito da Solução

### Situação Desejada (To-Be)

```
┌──────────────────────────────────────────────────────────────────┐
│                       Configurações                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔐 Segurança                                               │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │ Email: joao@email.com                      [Alterar email] │  │
│  │                                                            │  │
│  │ Senha: ••••••••                            [Alterar senha] │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔔 Notificações                                            │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │ Receber emails sobre:                                      │  │
│  │ [✓] Novas vagas compatíveis com meu perfil                │  │
│  │ [✓] Atualizações de candidaturas                          │  │
│  │ [✓] Mensagens de empresas                                 │  │
│  │ [ ] Newsletter e novidades da plataforma                  │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 👁️ Privacidade                                             │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │ Visibilidade do perfil:                                    │  │
│  │ (•) Visível para empresas                                 │  │
│  │ ( ) Oculto (apenas vagas que me candidatei)               │  │
│  │                                                            │  │
│  │ [Baixar meus dados]                                       │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⚠️ Zona de Perigo                                          │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │ [Desativar conta]                                         │  │
│  │ Sua conta ficará invisível, mas pode ser reativada.       │  │
│  │                                                            │  │
│  │ [Excluir conta permanentemente]                           │  │
│  │ Todos os seus dados serão apagados. Ação irreversível.    │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Seção de Segurança (visualização de email, botão alterar senha)
- ✅ Seção de Notificações (preferências de email)
- ✅ Seção de Privacidade (visibilidade do perfil)
- ✅ Seção Zona de Perigo (desativar/excluir conta)
- ✅ Modais de confirmação para ações críticas
- ✅ Toast de feedback ao salvar

### Excluído

- ❌ Alteração real de email/senha (mock)
- ❌ Envio real de notificações
- ❌ Download real de dados (mock - toast)
- ❌ Exclusão real de conta (mock - logout)
- ❌ Autenticação 2FA
- ❌ Sessões ativas

---

## Requisitos Funcionais

### Segurança

- **RF-001:** Deve exibir email atual do usuário (parcialmente oculto)
- **RF-002:** Deve ter botão "Alterar email" que abre modal
- **RF-003:** Deve ter botão "Alterar senha" que abre modal
- **RF-004:** Modal de senha deve pedir: senha atual, nova senha, confirmar nova senha

### Notificações

- **RF-005:** Deve ter checkboxes para preferências de notificação
- **RF-006:** Opções: vagas compatíveis, atualizações de candidatura, mensagens, newsletter
- **RF-007:** Alterações devem ser salvas automaticamente (ou com botão salvar)
- **RF-008:** Deve exibir toast ao salvar preferências

### Privacidade

- **RF-009:** Deve ter opção de visibilidade do perfil (visível/oculto)
- **RF-010:** Deve ter botão "Baixar meus dados" (mock - exibe toast)
- **RF-011:** Deve explicar o que cada opção significa

### Zona de Perigo

- **RF-012:** Deve ter botão "Desativar conta"
- **RF-013:** Desativar deve pedir confirmação com senha
- **RF-014:** Deve ter botão "Excluir conta permanentemente"
- **RF-015:** Excluir deve pedir confirmação dupla (digitar "EXCLUIR")
- **RF-016:** Ao excluir, deve fazer logout e redirecionar para home

---

## Requisitos Não-Funcionais

- **RNF-001 (Segurança):** Senha nunca deve ser exibida em texto
- **RNF-002 (UX):** Ações destrutivas devem ter confirmação
- **RNF-003 (Feedback):** Toda ação deve ter toast de confirmação
- **RNF-004 (Responsividade):** Layout deve funcionar em mobile

---

## Critérios de Aceitação

### RF-002/RF-003: Alterar Email/Senha

```gherkin
DADO que o candidato quer alterar sua senha
QUANDO ele clica em "Alterar senha"
ENTÃO deve abrir modal com campos
  E deve pedir senha atual
  E deve pedir nova senha
  E deve pedir confirmação da nova senha
  E ao salvar, deve exibir toast "Senha alterada com sucesso"
```

### RF-005 a RF-008: Notificações

```gherkin
DADO que o candidato altera uma preferência de notificação
QUANDO ele marca/desmarca um checkbox
ENTÃO a preferência deve ser salva
  E deve exibir toast "Preferências salvas"
```

### RF-014/RF-015: Excluir Conta

```gherkin
DADO que o candidato quer excluir sua conta
QUANDO ele clica em "Excluir conta permanentemente"
ENTÃO deve abrir modal de confirmação
  E deve pedir para digitar "EXCLUIR"
  E deve ter aviso de ação irreversível
  E ao confirmar, deve fazer logout
  E deve redirecionar para página inicial
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura e seções | 2 |
| 2 | Modais e ações | 3 |

### Detalhamento das Fases

#### Fase 1: Estrutura e Seções

**Objetivo:** Criar layout da página de configurações

**Ações:**
- [ ] Criar/atualizar página `/candidato/configuracoes`
- [ ] Criar seção de Segurança
- [ ] Criar seção de Notificações com checkboxes
- [ ] Criar seção de Privacidade
- [ ] Criar seção Zona de Perigo

**Validação:** Layout completo renderizando

#### Fase 2: Modais e Ações

**Objetivo:** Implementar interações e modais

**Ações:**
- [ ] Criar modal de alterar senha
- [ ] Criar modal de confirmação de exclusão
- [ ] Implementar salvamento de preferências (mock)
- [ ] Implementar toasts de feedback
- [ ] Implementar logout ao excluir

**Validação:** Todas as ações funcionando com feedback

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
> - Incrementar versão: **0.10.0 → 0.11.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.11.0] - 2026-01-XX

### Added
- Página de configurações do candidato
- Seção de segurança (alterar email/senha mock)
- Preferências de notificação por email
- Configuração de visibilidade do perfil
- Opção de desativar/excluir conta
- Modais de confirmação para ações críticas
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Cards** | Usar Card do shadcn/ui para cada seção |
| **Checkboxes** | Usar Checkbox do shadcn/ui |
| **Modais** | Usar AlertDialog para confirmações destrutivas |
| **Toast** | Feedback em toda ação |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Implementar alteração real de senha |
| Enviar emails reais |
| Excluir dados reais (apenas logout) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Observações** | Conclui área do Candidato |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 11/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
