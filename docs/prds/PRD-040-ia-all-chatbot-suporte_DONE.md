# PRD-040-ia-all: Chatbot Inteligente de Suporte

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar chatbot de suporte integrado que responde dúvidas frequentes, orienta usuários e reduz carga do suporte humano |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Baixa |
| **Épico** | Inteligência Artificial |
| **Perfil** | Todos (Candidato, Empresa, Admin) |
| **PRDs Relacionados** | PRD-028 (Central de Ajuda) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 10+ arquivos, processamento de linguagem natural, base de conhecimento, múltiplos fluxos conversacionais |

---

## Contexto do Problema

Usuários do RecrutaRS frequentemente têm dúvidas sobre como usar a plataforma, mas nem sempre encontram respostas rapidamente:

| Problema | Impacto |
|----------|---------|
| **FAQ estática** | Usuários não encontram resposta específica |
| **Suporte por ticket** | Tempo de resposta longo (24-48h) |
| **Abandono** | Usuários desistem se não conseguem ajuda rápida |
| **Sobrecarga de suporte** | Perguntas repetitivas consomem tempo da equipe |
| **Horário comercial** | Sem suporte fora do expediente |

Um chatbot pode:
- Responder 70-80% das dúvidas instantaneamente
- Funcionar 24/7
- Escalar atendimento para humano quando necessário
- Aprender com interações para melhorar

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Central de Ajuda                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FAQ                                                            │
│  ├─ Como criar meu perfil?                                      │
│  ├─ Como me candidatar a uma vaga?                              │
│  ├─ O que é o teste comportamental?                             │
│  └─ ...                                                         │
│                                                                 │
│  Não encontrou sua resposta?                                    │
│  [Abrir ticket de suporte] ← espera de 24-48h                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Qualquer página                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [conteúdo da página]                                           │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                           ┌─────────────────┐   │
│                                           │ 💬 Precisa de   │   │
│                                           │    ajuda?       │   │
│                                           └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

                     ↓ Ao clicar

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                              ┌──────────────────────────────┐   │
│                              │ 🤖 Assistente RecrutaRS      │   │
│                              ├──────────────────────────────┤   │
│                              │                              │   │
│                              │ Olá! Sou o assistente        │   │
│                              │ virtual do RecrutaRS.        │   │
│                              │ Como posso ajudar?           │   │
│                              │                              │   │
│                              │ Sugestões rápidas:           │   │
│                              │ • Como criar meu perfil      │   │
│                              │ • Problemas com login        │   │
│                              │ • Sobre o teste DISC         │   │
│                              │                              │   │
│                              │ [Digite sua pergunta...]     │   │
│                              │                              │   │
│                              └──────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas FAQ expandido | Não é conversacional, difícil navegar |
| Suporte por WhatsApp | Requer integração externa, custo |
| Chat humano em tempo real | Não escala, custo alto |

---

## Escopo

### Incluído

- ✅ Widget de chat flutuante em todas as páginas
- ✅ Interface conversacional (chat)
- ✅ Base de conhecimento com FAQs categorizadas
- ✅ Processamento de linguagem natural para entender perguntas
- ✅ Respostas contextuais baseadas no perfil do usuário
- ✅ Sugestões rápidas baseadas na página atual
- ✅ Escalonamento para ticket quando não conseguir ajudar
- ✅ Histórico de conversa na sessão
- ✅ Feedback: resposta foi útil? (sim/não)
- ✅ Respostas para candidatos, empresas e admin

### Excluído

- ❌ Chat com humano em tempo real
- ❌ Integração com WhatsApp/Telegram
- ❌ Aprendizado automático com conversas (ML)
- ❌ Suporte multilíngue
- ❌ Ações transacionais (ex: candidatar via chat)
- ❌ Acesso a dados sensíveis do usuário

---

## Requisitos Funcionais

### Widget de Chat

- **RF-001:** Exibir botão flutuante "Precisa de ajuda?" no canto inferior direito
- **RF-002:** Botão deve ser fixo, visível em todas as páginas logadas
- **RF-003:** Ao clicar, abrir janela de chat
- **RF-004:** Permitir minimizar/fechar chat
- **RF-005:** Manter estado da conversa ao navegar entre páginas
- **RF-006:** Indicador visual quando há nova mensagem

### Mensagem Inicial

- **RF-007:** Exibir saudação personalizada com nome do usuário
- **RF-008:** Exibir sugestões rápidas baseadas no contexto
- **RF-009:** Sugestões variam por perfil (candidato, empresa, admin)
- **RF-010:** Sugestões variam pela página atual

### Processamento de Perguntas

- **RF-011:** Aceitar perguntas em linguagem natural
- **RF-012:** Identificar intenção da pergunta (classificação)
- **RF-013:** Extrair entidades relevantes (ex: "teste" → teste comportamental)
- **RF-014:** Tolerar erros de digitação (fuzzy matching)
- **RF-015:** Suportar perguntas em português informal

### Base de Conhecimento

- **RF-016:** Manter base de FAQs categorizadas
- **RF-017:** Categorias: Perfil, Vagas, Candidaturas, Testes, Mensagens, Conta, Pagamentos
- **RF-018:** Cada FAQ com: pergunta, variações, resposta, links relacionados
- **RF-019:** FAQs específicas por perfil de usuário
- **RF-020:** Atualização fácil da base (arquivo de configuração)

### Respostas

- **RF-021:** Responder de forma conversacional, não robótica
- **RF-022:** Incluir links para páginas relevantes quando aplicável
- **RF-023:** Incluir passos numerados para tutoriais
- **RF-024:** Incluir imagens/GIFs para explicações visuais (futuro)
- **RF-025:** Se não souber responder, admitir e oferecer alternativas

### Contexto do Usuário

- **RF-026:** Adaptar respostas ao perfil (candidato vs empresa)
- **RF-027:** Considerar página atual para sugestões
- **RF-028:** Não pedir informações que já temos (ex: nome)

### Escalonamento

- **RF-029:** Detectar quando não consegue ajudar (baixa confiança)
- **RF-030:** Após 2 respostas não úteis, oferecer escalonamento
- **RF-031:** Escalonamento: abrir formulário de ticket pré-preenchido
- **RF-032:** Incluir histórico da conversa no ticket

### Feedback

- **RF-033:** Após cada resposta, perguntar "Isso foi útil?"
- **RF-034:** Botões: 👍 Sim / 👎 Não
- **RF-035:** Se não útil, perguntar "O que você esperava?"
- **RF-036:** Usar feedback para melhorar respostas

### Histórico

- **RF-037:** Manter histórico da conversa durante a sessão
- **RF-038:** Permitir rolar para ver mensagens anteriores
- **RF-039:** Limpar ao fechar sessão (privacidade)

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Resposta em < 1 segundo
- **RNF-002 (Disponibilidade):** 24/7, não depende de horário comercial
- **RNF-003 (UX):** Widget não deve atrapalhar navegação
- **RNF-004 (Mobile):** Funcionar bem em telas pequenas
- **RNF-005 (Acessibilidade):** Suporte a navegação por teclado

---

## Critérios de Aceitação

### RF-001 a RF-006: Widget

```gherkin
DADO que o usuário está logado em qualquer página
QUANDO a página carrega
ENTÃO deve exibir botão flutuante no canto inferior direito
  E ao clicar deve abrir janela de chat
  E ao navegar para outra página o chat deve permanecer aberto
```

### RF-011 a RF-015: Processamento

```gherkin
DADO que o usuário digita "como faço pra me candidatar?"
QUANDO envia a mensagem
ENTÃO o chatbot deve entender a intenção (candidatura)
  E deve responder com instruções de como se candidatar
  E deve incluir link para busca de vagas
```

### RF-029 a RF-032: Escalonamento

```gherkin
DADO que o chatbot não conseguiu ajudar
  E o usuário marcou 2 respostas como não úteis
QUANDO o chatbot responde novamente
ENTÃO deve oferecer "Quer falar com nossa equipe?"
  E ao aceitar deve abrir formulário de ticket
  E o ticket deve incluir histórico da conversa
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Widget e interface de chat | 4 |
| 2 | Base de conhecimento e matching | 4 |
| 3 | Respostas e contexto | 3 |
| 4 | Escalonamento e feedback | 3 |
| 5 | Refinamentos e testes | 2 |

### Detalhamento das Fases

#### Fase 1: Widget e Interface

**Objetivo:** Criar estrutura visual do chatbot

**Ações:**
- [ ] Criar componente `ChatWidget` flutuante
- [ ] Criar componente `ChatWindow` com mensagens
- [ ] Criar componente `ChatMessage` para bolhas
- [ ] Criar componente `ChatInput` para digitação
- [ ] Implementar abrir/fechar/minimizar
- [ ] Persistir estado entre páginas

**Validação:** Widget aparece e permite digitar mensagens

#### Fase 2: Base de Conhecimento

**Objetivo:** Criar sistema de FAQs e matching

**Ações:**
- [ ] Criar estrutura de dados para FAQs
- [ ] Criar arquivo de configuração com perguntas/respostas
- [ ] Implementar `findBestMatch(pergunta)` com similaridade
- [ ] Implementar fuzzy matching para erros de digitação
- [ ] Categorizar por perfil de usuário

**Validação:** Perguntas são matched com respostas corretas

#### Fase 3: Respostas e Contexto

**Objetivo:** Respostas inteligentes e contextuais

**Ações:**
- [ ] Implementar respostas formatadas (markdown)
- [ ] Adicionar links para páginas relevantes
- [ ] Adaptar respostas ao perfil do usuário
- [ ] Implementar sugestões baseadas na página atual
- [ ] Criar respostas de fallback (não entendi)

**Validação:** Respostas são úteis e contextuais

#### Fase 4: Escalonamento e Feedback

**Objetivo:** Fallback para humano e melhoria contínua

**Ações:**
- [ ] Implementar detecção de baixa confiança
- [ ] Criar fluxo de escalonamento para ticket
- [ ] Implementar botões de feedback (útil/não útil)
- [ ] Armazenar feedback para análise
- [ ] Incluir histórico no ticket

**Validação:** Escalonamento funciona e feedback é coletado

#### Fase 5: Refinamentos

**Objetivo:** Ajustes e melhorias

**Ações:**
- [ ] Ajustar threshold de confiança
- [ ] Expandir base de conhecimento
- [ ] Melhorar respostas baseado em feedback
- [ ] Otimizar para mobile
- [ ] Testes de usabilidade

**Validação:** Chatbot resolve maioria das dúvidas

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-028 | Central de Ajuda (FAQ) | ⏳ Pendente |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Inteligência Artificial"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1-4 | PRD-035 a 038 | Features de IA anteriores | ⏳ | - |
| 5 | PRD-039-ia-emp | Assistente de Redação | ⏳ | - |
| **6** | **PRD-040-ia-all** | **Chatbot de Suporte** | **🔄 ATUAL** | Depende de PRD-028 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Histórico de chat | Temporário | Não persistir após sessão |
| Feedback | Agregado | Anonimizar para análise |
| Perguntas do usuário | Privado | Não logar dados sensíveis |

### Privacidade

- Chatbot NÃO acessa dados sensíveis do usuário
- Histórico limpo ao encerrar sessão
- Não coletar informações além do necessário

---

## Base de Conhecimento Inicial

### Categorias e Exemplos de FAQs

| Categoria | Exemplo de Pergunta | Perfil |
|-----------|---------------------|--------|
| **Perfil** | "Como completo meu perfil?" | Candidato |
| **Vagas** | "Como publico uma vaga?" | Empresa |
| **Candidaturas** | "Como acompanho minhas candidaturas?" | Candidato |
| **Testes** | "O que é o teste DISC?" | Todos |
| **Mensagens** | "Como envio mensagem para candidato?" | Empresa |
| **Conta** | "Como altero minha senha?" | Todos |
| **Match** | "Como o match é calculado?" | Todos |

### Estrutura de uma FAQ

```json
{
  "id": "candidatura-como-fazer",
  "categoria": "candidaturas",
  "perfis": ["candidato"],
  "pergunta": "Como me candidato a uma vaga?",
  "variacoes": [
    "como faço pra me candidatar",
    "quero me candidatar",
    "candidatar vaga",
    "aplicar vaga"
  ],
  "resposta": "Para se candidatar a uma vaga:\n\n1. Acesse a página da vaga\n2. Clique em **Candidatar-se**\n3. Revise seu perfil\n4. Confirme a candidatura\n\nVocê pode acompanhar suas candidaturas em [Minhas Candidaturas](/candidato/candidaturas).",
  "links": ["/candidato/vagas", "/candidato/candidaturas"]
}
```

---

## Mockups Conceituais

### Widget Fechado

```
                                           ┌─────────────────┐
                                           │ 💬              │
                                           │ Precisa de      │
                                           │ ajuda?          │
                                           └─────────────────┘
```

### Chat Aberto

```
┌──────────────────────────────────────┐
│ 🤖 Assistente RecrutaRS         [✕] │
├──────────────────────────────────────┤
│                                      │
│   🤖 Olá João! Sou o assistente     │
│   virtual do RecrutaRS. Como        │
│   posso ajudar?                     │
│                                      │
│   Sugestões rápidas:                 │
│   [Como completar perfil]            │
│   [Sobre o teste DISC]               │
│   [Acompanhar candidaturas]          │
│                                      │
│ ─────────────────────────────────── │
│                                      │
│   👤 Como me candidato a uma vaga?  │
│                                      │
│   🤖 Para se candidatar:            │
│   1. Acesse a página da vaga        │
│   2. Clique em "Candidatar-se"      │
│   3. Revise seu perfil              │
│   4. Confirme!                      │
│                                      │
│   📎 Ver vagas disponíveis          │
│                                      │
│   Isso foi útil? [👍] [👎]          │
│                                      │
├──────────────────────────────────────┤
│ [Digite sua pergunta...        ] [→]│
└──────────────────────────────────────┘
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão seguindo SemVer
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

**Codinome sugerido:** `Guide` (representa orientação e ajuda)

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não intrusivo** | Widget não deve atrapalhar uso da plataforma |
| **Conversacional** | Respostas naturais, não robóticas |
| **Honesto** | Admitir quando não souber responder |
| **Escalável** | Base de conhecimento fácil de expandir |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Fingir que é humano |
| Acessar dados sensíveis do usuário |
| Respostas muito longas (máx 3-4 parágrafos) |
| Forçar interação (popup automático) |
| Armazenar histórico após sessão |

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
| 16/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
