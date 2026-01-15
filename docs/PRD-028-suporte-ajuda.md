# PRD-028: Central de Ajuda

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Criar central de ajuda com FAQ e sistema de tickets |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | FAQ por área, sistema de tickets, múltiplas telas |

---

## Contexto do Problema

Usuários precisam de suporte para dúvidas e problemas. Atualmente não há um canal estruturado para isso. Uma central de ajuda com FAQ resolve dúvidas comuns imediatamente, e um sistema de tickets organiza solicitações que precisam de atendimento humano.

---

## Conceito da Solução

### Acesso à Central de Ajuda

Acessível via:
- Link no footer
- Menu de usuário (dropdown do avatar)
- Menu lateral (todas as áreas)

### Página Principal

```
┌──────────────────────────────────────────────────────────────────┐
│  Central de Ajuda                                                │
│  Encontre respostas ou entre em contato com nossa equipe        │
│                                                    [+ Novo Ticket]│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │ 📧 Email         │ │ 📞 Telefone      │ │ 🕐 Horário       │ │
│  │                  │ │                  │ │                  │ │
│  │ suporte@         │ │ (51) 3333-3333   │ │ Seg-Sex          │ │
│  │ recrutars.com.br │ │                  │ │ 9h às 18h        │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [❓ Perguntas Frequentes]  [🎫 Meus Tickets]                    │
│  ═══════════════════════════                                     │
│                                                                  │
│  🔍 [Buscar nas perguntas...                                  ]  │
│                                                                  │
│  Filtrar por: [Todas as categorias                           ▼]  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como me candidato a uma vaga?           [Candidaturas] ▼ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como acompanho minhas candidaturas?     [Candidaturas] ▼ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como edito meu perfil?                       [Perfil]  ▼ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como funciona o teste comportamental?        [Testes]  ▼ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como me preparo para uma entrevista?     [Entrevistas] ▼ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como altero minha assinatura?            [Assinatura]  ▼ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como controlo minha privacidade?         [Privacidade] ▼ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como envio mensagens para empresas?      [Comunicação] ▼ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  🤔 Não encontrou o que procurava?                              │
│                                                                  │
│  [📩 Abrir um Ticket]  Entre em contato com nossa equipe        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### FAQ Expandido (Accordion)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ❓ Como me candidato a uma vaga?           [Candidaturas] ▲ │  │
│  │                                                            │  │
│  │ Para se candidatar a uma vaga:                            │  │
│  │                                                            │  │
│  │ 1. Acesse "Buscar Vagas" no menu lateral                  │  │
│  │ 2. Encontre a vaga desejada usando os filtros             │  │
│  │ 3. Clique em "Ver detalhes" para ver mais informações     │  │
│  │ 4. Clique no botão "Candidatar-se"                        │  │
│  │ 5. Selecione qual currículo deseja usar                   │  │
│  │ 6. Confirme sua candidatura                               │  │
│  │                                                            │  │
│  │ 💡 Dica: Mantenha seu currículo atualizado para           │  │
│  │    aumentar suas chances!                                 │  │
│  │                                                            │  │
│  │ 📎 Artigos relacionados:                                   │  │
│  │ • Como criar um currículo atrativo                        │  │
│  │ • Como funcionam os filtros de busca                      │  │
│  │                                                            │  │
│  │                              Esta resposta foi útil?       │  │
│  │                                      [👍 Sim] [👎 Não]     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Aba Meus Tickets

```
┌──────────────────────────────────────────────────────────────────┐
│  [❓ Perguntas Frequentes]  [🎫 Meus Tickets]                    │
│                             ═════════════════                    │
│                                                                  │
│  [Todos]  [Abertos (2)]  [Resolvidos (5)]      [+ Novo Ticket]  │
│  ══════                                                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟡 Ticket #1247                              Aberto       │  │
│  │                                                            │  │
│  │  Problema com login                                        │  │
│  │  Categoria: Conta • Criado em 14/01/2026                  │  │
│  │                                                            │  │
│  │  Última atualização: Aguardando resposta do suporte       │  │
│  │                                             há 2 horas     │  │
│  │                                                            │  │
│  │                                            [Ver detalhes]  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟢 Ticket #1198                           Respondido      │  │
│  │                                                            │  │
│  │  Dúvida sobre teste comportamental                        │  │
│  │  Categoria: Testes • Criado em 10/01/2026                 │  │
│  │                                                            │  │
│  │  Última atualização: Resposta da equipe                   │  │
│  │                                             há 1 dia       │  │
│  │                                                            │  │
│  │                                            [Ver detalhes]  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ✅ Ticket #1156                            Resolvido      │  │
│  │                                                            │  │
│  │  Como alterar email cadastrado                            │  │
│  │  Categoria: Conta • Criado em 05/01/2026                  │  │
│  │                                                            │  │
│  │  Resolvido em 06/01/2026                                  │  │
│  │                                                            │  │
│  │                                            [Ver detalhes]  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Modal Novo Ticket

```
┌──────────────────────────────────────────────────────────────────┐
│  📩 Novo Ticket                                            [✕]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Categoria *                                                     │
│  [Selecione a categoria...                                  ▼]  │
│                                                                  │
│  • Conta e Acesso                                               │
│  • Candidaturas                                                  │
│  • Currículos                                                    │
│  • Testes                                                        │
│  • Entrevistas                                                   │
│  • Mensagens                                                     │
│  • Pagamentos e Assinatura                                      │
│  • Problemas Técnicos                                           │
│  • Sugestões                                                     │
│  • Outros                                                        │
│                                                                  │
│  Assunto *                                                       │
│  [Problema com login                                        ]    │
│                                                                  │
│  Descreva seu problema ou dúvida *                              │
│  [Não estou conseguindo acessar minha conta. Quando tento   ]   │
│  [fazer login, aparece a mensagem "Credenciais inválidas"   ]   │
│  [mas tenho certeza que a senha está correta.               ]   │
│  [                                                          ]   │
│  [                                                          ]   │
│                                                   50/2000 car   │
│                                                                  │
│  Anexar arquivo (opcional)                                       │
│  [📎 Clique para anexar ou arraste um arquivo aqui]             │
│  PNG, JPG, PDF - máximo 5MB                                     │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  📧 Você receberá atualizações no email: joao@email.com         │
│                                                                  │
│                             [Cancelar]  [📩 Enviar Ticket]      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Detalhes do Ticket (Conversa)

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Voltar]  Ticket #1247                          🟡 Aberto    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Problema com login                                              │
│  Categoria: Conta • Criado em 14/01/2026 às 10:30              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  👤 Você                                    14/01 às 10:30 │  │
│  │                                                            │  │
│  │  Não estou conseguindo acessar minha conta. Quando tento  │  │
│  │  fazer login, aparece a mensagem "Credenciais inválidas"  │  │
│  │  mas tenho certeza que a senha está correta.              │  │
│  │                                                            │  │
│  │  📎 screenshot_erro.png                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🎧 Equipe RecrutaRS                        14/01 às 14:15 │  │
│  │                                                            │  │
│  │  Olá João!                                                │  │
│  │                                                            │  │
│  │  Identificamos que houve uma tentativa de troca de senha  │  │
│  │  na sua conta. Você realizou essa solicitação?            │  │
│  │                                                            │  │
│  │  Caso não tenha sido você, recomendamos:                  │  │
│  │  1. Utilizar o link "Esqueci minha senha"                 │  │
│  │  2. Definir uma nova senha segura                         │  │
│  │  3. Nos avisar para verificarmos a segurança da conta     │  │
│  │                                                            │  │
│  │  Ficamos no aguardo!                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Responder:                                                      │
│  [Não fui eu que solicitei troca de senha! Vou seguir os   ]    │
│  [passos que vocês indicaram.                              ]    │
│                                                                  │
│  [📎 Anexar]                                 [📩 Enviar Resposta]│
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [✅ Marcar como Resolvido]                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### FAQ por Área de Usuário

O FAQ exibe perguntas diferentes baseado no tipo de usuário logado:

```
┌──────────────────────────────────────────────────────────────────┐
│  FAQ por Área                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  👤 CANDIDATO                                                    │
│  • Como me candidato a uma vaga?                                │
│  • Como edito meu currículo?                                    │
│  • Como funciona o teste DISC?                                  │
│  • Como controlo minha privacidade?                             │
│  • Como acompanho minhas candidaturas?                          │
│  • Como me preparo para entrevistas?                            │
│                                                                  │
│  🏢 EMPRESA                                                      │
│  • Como publico uma nova vaga?                                  │
│  • Como funciona o Banco de Talentos?                           │
│  • Como envio convites para candidatos?                         │
│  • Como gerencio as candidaturas recebidas?                     │
│  • Como solicito teste comportamental?                          │
│  • Como configuro meu plano?                                    │
│                                                                  │
│  ⚙️ ADMIN                                                        │
│  • Como gerencio empresas da plataforma?                        │
│  • Como aprovar/rejeitar cadastros?                             │
│  • Como visualizo relatórios?                                   │
│  • Como gerencio configurações globais?                         │
│                                                                  │
│  📋 GERAL (todos veem)                                          │
│  • Como altero minha senha?                                     │
│  • Como atualizo meu email?                                     │
│  • Como excluo minha conta?                                     │
│  • Política de privacidade                                      │
│  • Termos de uso                                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Página Central de Ajuda acessível de todas as áreas
- ✅ Header com contatos (email, telefone, horário)
- ✅ Aba "Perguntas Frequentes" com accordion
- ✅ Busca nas perguntas
- ✅ Filtro por categoria
- ✅ FAQ específico por tipo de usuário
- ✅ Aba "Meus Tickets" com listagem
- ✅ Criar novo ticket com categoria, assunto, descrição
- ✅ Upload de anexo no ticket
- ✅ Conversa/histórico do ticket
- ✅ Status: Aberto, Respondido, Resolvido
- ✅ Marcar ticket como resolvido
- ✅ Feedback "Esta resposta foi útil?"

### Excluído

- ❌ Chat ao vivo real (apenas mock)
- ❌ Base de conhecimento com artigos longos
- ❌ Chatbot de IA
- ❌ Escalonamento de tickets
- ❌ SLA e métricas de atendimento

---

## Requisitos Funcionais

### Página Principal

- **RF-001:** Rota `/ajuda` (ou `/suporte`)
- **RF-002:** Acessível via footer, menu de usuário, menu lateral
- **RF-003:** Header com email, telefone e horário de atendimento
- **RF-004:** Abas: Perguntas Frequentes, Meus Tickets
- **RF-005:** Botão "Novo Ticket" sempre visível

### FAQ

- **RF-006:** Lista de perguntas em formato accordion
- **RF-007:** Campo de busca que filtra perguntas em tempo real
- **RF-008:** Filtro por categoria (dropdown)
- **RF-009:** Categorias: Candidaturas, Perfil, Testes, Entrevistas, Assinatura, Privacidade, Comunicação, etc.
- **RF-010:** Exibir FAQ baseado no tipo de usuário logado
- **RF-011:** Feedback "Esta resposta foi útil?" (👍/👎)
- **RF-012:** Ao clicar em pergunta, expandir resposta

### Sistema de Tickets

- **RF-013:** Listar tickets do usuário logado
- **RF-014:** Filtros: Todos, Abertos, Resolvidos
- **RF-015:** Exibir: número, assunto, categoria, data, status
- **RF-016:** Status com cores: 🟡 Aberto, 🟢 Respondido, ✅ Resolvido

### Criar Ticket

- **RF-017:** Modal ou página para novo ticket
- **RF-018:** Campos: Categoria (select), Assunto (texto), Descrição (textarea)
- **RF-019:** Upload de anexo opcional (imagem ou PDF, max 5MB)
- **RF-020:** Validação de campos obrigatórios
- **RF-021:** Gerar número único do ticket (ex: #1247)

### Detalhes do Ticket

- **RF-022:** Exibir conversa completa (thread)
- **RF-023:** Diferenciar mensagens do usuário vs suporte
- **RF-024:** Campo para enviar nova resposta
- **RF-025:** Upload de anexo na resposta
- **RF-026:** Botão "Marcar como Resolvido"

### Respostas do Suporte (Mock)

- **RF-027:** Simular resposta do suporte (mock com delay)
- **RF-028:** Respostas automáticas genéricas por categoria

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** FAQ carrega instantaneamente
- **RNF-002 (UX):** Busca com debounce (300ms)
- **RNF-003 (Persistência):** Tickets persistidos (localStorage/mock)

---

## Critérios de Aceitação

### RF-006 a RF-012: FAQ

```gherkin
DADO que o candidato acessa a Central de Ajuda
QUANDO ele visualiza a aba "Perguntas Frequentes"
ENTÃO deve ver lista de perguntas relevantes para candidatos
  E deve poder buscar por texto
  E deve poder filtrar por categoria
  E ao clicar numa pergunta, deve expandir a resposta
```

### RF-017 a RF-021: Criar Ticket

```gherkin
DADO que o usuário precisa de suporte
QUANDO ele clica em "Novo Ticket"
ENTÃO deve poder selecionar categoria
  E deve preencher assunto e descrição
  E deve poder anexar arquivo opcional
  E ao enviar, ticket deve ser criado com número único
```

### RF-022 a RF-026: Conversa

```gherkin
DADO que o usuário tem um ticket aberto
QUANDO ele acessa os detalhes
ENTÃO deve ver histórico da conversa
  E deve poder enviar nova mensagem
  E deve poder marcar como resolvido
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Página e FAQ | 3 |
| 2 | Sistema de tickets | 4 |
| 3 | Conversa e refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Página e FAQ

**Objetivo:** Estrutura básica com FAQ funcional

**Ações:**
- [ ] Criar página `/ajuda`
- [ ] Criar header com contatos
- [ ] Implementar accordion de FAQ
- [ ] Implementar busca e filtros
- [ ] Criar conteúdo FAQ mock por área

**Validação:** FAQ funciona com busca e filtros

#### Fase 2: Sistema de Tickets

**Objetivo:** Criar e listar tickets

**Ações:**
- [ ] Implementar aba "Meus Tickets"
- [ ] Criar modal de novo ticket
- [ ] Implementar upload de anexo
- [ ] Criar listagem com filtros

**Validação:** Usuário consegue criar e ver tickets

#### Fase 3: Conversa e Refinamentos

**Objetivo:** Thread de conversa e polish

**Ações:**
- [ ] Criar página de detalhes do ticket
- [ ] Implementar thread de mensagens
- [ ] Implementar marcar como resolvido
- [ ] Simular respostas do suporte (mock)

**Validação:** Fluxo completo funciona

---

## Modelo de Dados

### FAQItem

```typescript
type UserArea = 'candidate' | 'company' | 'admin' | 'general';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  area: UserArea; // para quem mostrar
  relatedArticles?: string[];
}
```

### Ticket

```typescript
type TicketStatus = 'open' | 'answered' | 'resolved';

interface TicketMessage {
  id: string;
  sender: 'user' | 'support';
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  number: number; // #1247
  userId: string;
  category: string;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
```

---

## Conteúdo FAQ (Exemplos)

### Candidato

| Categoria | Pergunta |
|-----------|----------|
| Candidaturas | Como me candidato a uma vaga? |
| Candidaturas | Como acompanho minhas candidaturas? |
| Perfil | Como edito meu perfil? |
| Perfil | Como crio múltiplos currículos? |
| Testes | Como funciona o teste comportamental? |
| Testes | Posso refazer o teste DISC? |
| Entrevistas | Como me preparo para uma entrevista? |
| Entrevistas | Como confirmo uma entrevista? |
| Privacidade | Como controlo minha privacidade? |
| Privacidade | O que é o modo anônimo? |
| Comunicação | Como envio mensagens para empresas? |

### Empresa

| Categoria | Pergunta |
|-----------|----------|
| Vagas | Como publico uma nova vaga? |
| Vagas | Como edito uma vaga publicada? |
| Talentos | Como funciona o Banco de Talentos? |
| Talentos | Como envio convites para candidatos? |
| Candidaturas | Como gerencio as candidaturas recebidas? |
| Testes | Como solicito teste comportamental? |
| Assinatura | Como configuro meu plano? |

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-003 | Header e Footer | ✅ Implementado |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.27.0 → 0.28.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.28.0] - 2026-01-XX

### Added
- Central de Ajuda com FAQ e sistema de tickets
- FAQ com busca, filtros e accordion
- FAQ específico por tipo de usuário
- Sistema de tickets: criar, listar, responder
- Upload de anexos em tickets
- Thread de conversa com suporte
- Marcar ticket como resolvido
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Accordion** | Usar Accordion do shadcn/ui |
| **Ticket number** | Auto-incrementar a partir de 1000 |
| **Mock suporte** | Responder após 2-5 segundos com mensagem genérica |
| **Área do FAQ** | Filtrar baseado no role do usuário logado |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Mostrar FAQ de empresa para candidato |
| Permitir ticket sem categoria ou descrição |
| Perder tickets ao recarregar (persistir) |
| Upload maior que 5MB |

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
| 15/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
