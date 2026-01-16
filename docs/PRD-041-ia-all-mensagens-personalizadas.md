# PRD-041-ia-all: Mensagens Personalizadas com IA

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar sistema de templates inteligentes e personalização automática de mensagens para comunicação entre candidatos e empresas |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Épico** | Inteligência Artificial |
| **Perfil** | Todos (Candidato, Empresa) |
| **PRDs Relacionados** | PRD-016 (Mensagens Empresa), PRD-017 (Mensagens Candidato) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 6-8 arquivos, geração de texto, personalização dinâmica, múltiplos templates |

---

## Contexto do Problema

A comunicação entre candidatos e empresas no RecrutaRS frequentemente é genérica e impessoal:

| Problema | Impacto |
|----------|---------|
| **Mensagens genéricas** | "Obrigado por se candidatar" não engaja |
| **Copiar/colar repetitivo** | Recrutadores perdem tempo reescrevendo |
| **Falta de contexto** | Mensagens não mencionam dados relevantes do perfil |
| **Tom inconsistente** | Cada pessoa escreve de um jeito |
| **Candidatos ignorados** | Sem resposta = experiência ruim |

Estudos mostram que:
- Candidatos que recebem feedback personalizado têm **3x mais chance** de se candidatar novamente
- Mensagens personalizadas têm **26% mais taxa de abertura**
- Recrutadores gastam **~30% do tempo** escrevendo mensagens

Um sistema de mensagens inteligentes pode:
- Personalizar automaticamente com dados do perfil
- Oferecer templates prontos para situações comuns
- Ajustar tom (formal/informal)
- Reduzir tempo de escrita em 70%

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Enviar Mensagem                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Para: João Silva (Candidato)                                   │
│                                                                 │
│  Assunto: [________________________]                            │
│                                                                 │
│  Mensagem:                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │ (campo vazio - recrutador precisa escrever do zero)     │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│                              [Enviar]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Enviar Mensagem                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Para: João Silva (Candidato)                                   │
│  Vaga: Dev React Senior                                         │
│                                                                 │
│  🎯 TEMPLATES RÁPIDOS                                           │
│  [Convite p/ entrevista] [Feedback positivo] [Próximos passos]  │
│  [Solicitar informação] [Feedback negativo] [+ Ver todos]       │
│                                                                 │
│  Assunto: [Convite para entrevista - Dev React Senior]          │
│                                                                 │
│  Mensagem:                                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Olá João! 👋                                            │    │
│  │                                                         │    │
│  │ Analisamos seu perfil para a vaga de Dev React Senior   │    │
│  │ e ficamos impressionados com sua experiência de 6 anos  │    │
│  │ em React e seu perfil Analítico que combina muito com   │    │
│  │ nossa cultura técnica.                                  │    │
│  │                                                         │    │
│  │ Gostaríamos de convidá-lo para uma entrevista.          │    │
│  │ Você teria disponibilidade na próxima semana?           │    │
│  │                                                         │    │
│  │ Aguardamos seu retorno!                                 │    │
│  │ Equipe TechCorp                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ✨ Personalizado automaticamente com dados do perfil           │
│                                                                 │
│  Tom: [Formal ▼]  [🔄 Regenerar]  [✏️ Editar]                   │
│                                                                 │
│                              [Enviar]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas templates estáticos | Não personaliza, parece robótico |
| Campo de variáveis manual | Complexo para o usuário |
| Sem templates | Não resolve problema de produtividade |

---

## Escopo

### Incluído

- ✅ Biblioteca de templates por situação
- ✅ Personalização automática com variáveis do perfil
- ✅ Variáveis: nome, vaga, skills, experiência, perfil DISC
- ✅ Seletor de tom (formal, neutro, informal)
- ✅ Preview em tempo real
- ✅ Edição livre após geração
- ✅ Botão "Regenerar" para nova versão
- ✅ Templates para Empresa → Candidato
- ✅ Templates para Candidato → Empresa
- ✅ Salvamento de templates personalizados

### Excluído

- ❌ Envio automático (sempre requer confirmação)
- ❌ Tradução automática
- ❌ Análise de sentimento de respostas
- ❌ Integração com email externo
- ❌ Chatbot conversacional (ver PRD-040)

---

## Requisitos Funcionais

### Biblioteca de Templates

- **RF-001:** Manter biblioteca de templates organizados por categoria
- **RF-002:** Categorias para Empresa: Convite, Feedback, Atualização, Rejeição, Informação
- **RF-003:** Categorias para Candidato: Interesse, Dúvida, Disponibilidade, Agradecimento
- **RF-004:** Cada template com: título, categoria, corpo, variáveis usadas
- **RF-005:** Exibir templates mais usados como "atalhos rápidos"

### Variáveis de Personalização

- **RF-006:** Suportar variáveis dinâmicas no template
- **RF-007:** Variáveis do candidato: {{nome}}, {{cargo}}, {{experiencia}}, {{skills}}, {{disc_perfil}}
- **RF-008:** Variáveis da vaga: {{vaga_titulo}}, {{vaga_empresa}}, {{vaga_local}}
- **RF-009:** Variáveis da empresa: {{empresa_nome}}, {{recrutador_nome}}
- **RF-010:** Variáveis de match: {{match_score}}, {{match_destaque}}
- **RF-011:** Substituir variáveis automaticamente ao selecionar template

### Seleção e Geração

- **RF-012:** Ao clicar em template, preencher campo de mensagem
- **RF-013:** Preview deve mostrar variáveis já substituídas
- **RF-014:** Se variável não disponível, omitir trecho ou usar fallback
- **RF-015:** Permitir selecionar tom da mensagem
- **RF-016:** Tons disponíveis: Formal, Neutro, Informal/Amigável
- **RF-017:** Tom afeta escolha de palavras e saudação

### Geração Inteligente

- **RF-018:** Botão "Regenerar" cria nova versão do mesmo template
- **RF-019:** Variações devem manter mesmo sentido com palavras diferentes
- **RF-020:** Usar dados contextuais para enriquecer mensagem
- **RF-021:** Mencionar pontos fortes específicos quando relevante

### Edição

- **RF-022:** Após geração, mensagem é totalmente editável
- **RF-023:** Alterações manuais sobrescrevem template
- **RF-024:** Indicador visual de que mensagem foi personalizada

### Templates Personalizados

- **RF-025:** Permitir salvar mensagem editada como novo template
- **RF-026:** Templates salvos aparecem em "Meus Templates"
- **RF-027:** Permitir editar e excluir templates salvos
- **RF-028:** Templates salvos são privados (por empresa/candidato)

### Para Empresas

- **RF-029:** Templates de convite para entrevista
- **RF-030:** Templates de feedback positivo (aprovado para próxima fase)
- **RF-031:** Templates de feedback negativo (não selecionado)
- **RF-032:** Templates de solicitação de informação adicional
- **RF-033:** Templates de atualização de status

### Para Candidatos

- **RF-034:** Templates de demonstração de interesse
- **RF-035:** Templates de dúvida sobre vaga
- **RF-036:** Templates de disponibilidade para entrevista
- **RF-037:** Templates de agradecimento
- **RF-038:** Templates de follow-up

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Geração de mensagem em < 500ms
- **RNF-002 (UX):** Preview em tempo real sem lag
- **RNF-003 (Consistência):** Mesmo template gera mensagens similares
- **RNF-004 (Privacidade):** Templates salvos são privados do usuário

---

## Critérios de Aceitação

### RF-006 a RF-011: Variáveis

```gherkin
DADO um template com "Olá {{nome}}, sua experiência de {{experiencia}} em {{skills}} é impressionante"
  E o candidato é João com 6 anos de experiência em React, Node.js
QUANDO o template é aplicado
ENTÃO a mensagem deve ser "Olá João, sua experiência de 6 anos em React, Node.js é impressionante"
```

### RF-015 a RF-017: Tom

```gherkin
DADO o mesmo template de convite para entrevista
QUANDO o recrutador seleciona tom "Formal"
ENTÃO a saudação deve ser "Prezado(a) João Silva"
  E o texto deve usar linguagem formal

QUANDO o recrutador seleciona tom "Informal"
ENTÃO a saudação deve ser "Oi João! 👋"
  E o texto deve usar linguagem casual
```

### RF-025 a RF-028: Templates Salvos

```gherkin
DADO que o recrutador editou uma mensagem
QUANDO clica em "Salvar como template"
ENTÃO deve pedir nome para o template
  E deve salvar em "Meus Templates"
  E deve estar disponível para uso futuro
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Biblioteca de templates base | 3 |
| 2 | Sistema de variáveis | 2 |
| 3 | Interface de seleção | 3 |
| 4 | Templates personalizados | 2 |

### Detalhamento das Fases

#### Fase 1: Biblioteca de Templates

**Objetivo:** Criar estrutura de templates padrão

**Ações:**
- [ ] Definir estrutura de dados `MessageTemplate`
- [ ] Criar arquivo de configuração com templates padrão
- [ ] Categorizar templates por tipo e perfil
- [ ] Criar 15-20 templates iniciais (10 empresa, 10 candidato)

**Validação:** Templates carregam e estão organizados

#### Fase 2: Sistema de Variáveis

**Objetivo:** Implementar substituição de variáveis

**Ações:**
- [ ] Criar função `parseTemplate(template, context)`
- [ ] Implementar extração de variáveis {{var}}
- [ ] Criar mapeamento de variáveis para dados reais
- [ ] Implementar fallbacks para variáveis ausentes

**Validação:** Variáveis são substituídas corretamente

#### Fase 3: Interface de Seleção

**Objetivo:** Criar UI para seleção e preview

**Ações:**
- [ ] Criar componente `TemplateSelector`
- [ ] Criar componente `MessagePreview`
- [ ] Integrar com formulário de mensagem existente
- [ ] Implementar seletor de tom
- [ ] Implementar botão "Regenerar"

**Validação:** Usuário seleciona template e vê preview

#### Fase 4: Templates Personalizados

**Objetivo:** Permitir salvar templates próprios

**Ações:**
- [ ] Criar modal "Salvar como template"
- [ ] Implementar CRUD de templates do usuário
- [ ] Criar seção "Meus Templates"
- [ ] Persistir em localStorage (ou mock)

**Validação:** Templates salvos estão disponíveis

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-016 | Sistema de Mensagens (Empresa) | ⏳ Pendente |
| PRD-017 | Sistema de Mensagens (Candidato) | ⏳ Pendente |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Inteligência Artificial"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1-6 | PRD-035 a 040 | Features de IA anteriores | ⏳ | - |
| **7** | **PRD-041-ia-all** | **Mensagens Personalizadas** | **🔄 ATUAL** | Independente |
| 8 | PRD-042-ia-cand | Análise de Fit Cultural | ⏳ | - |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Biblioteca de Templates (Exemplos)

### Templates para Empresa → Candidato

#### Convite para Entrevista

```
Assunto: Convite para entrevista - {{vaga_titulo}}

Olá {{nome}}! 👋

Analisamos seu perfil para a vaga de {{vaga_titulo}} e ficamos muito interessados 
na sua experiência de {{experiencia}} em {{skills}}.

Gostaríamos de convidá-lo(a) para uma entrevista para conhecê-lo(a) melhor 
e apresentar mais detalhes sobre a oportunidade.

Você teria disponibilidade nos próximos dias?

Aguardamos seu retorno!
{{recrutador_nome}}
{{empresa_nome}}
```

#### Feedback Positivo (Aprovação)

```
Assunto: Parabéns! Próxima etapa - {{vaga_titulo}}

Olá {{nome}}!

Temos uma ótima notícia! 🎉

Você foi aprovado(a) para a próxima fase do processo seletivo para {{vaga_titulo}}.

Seu {{match_destaque}} nos chamou muito a atenção.

Em breve entraremos em contato com os detalhes da próxima etapa.

Atenciosamente,
{{empresa_nome}}
```

#### Feedback Negativo (Gentil)

```
Assunto: Atualização sobre sua candidatura - {{vaga_titulo}}

Olá {{nome}},

Agradecemos muito seu interesse na vaga de {{vaga_titulo}} na {{empresa_nome}}.

Após cuidadosa análise, decidimos seguir com outros candidatos cujos perfis 
estão mais alinhados com as necessidades específicas desta posição.

Isso não diminui suas qualificações. Seu perfil ficará em nosso banco de talentos 
para futuras oportunidades.

Desejamos sucesso em sua jornada!
{{empresa_nome}}
```

### Templates para Candidato → Empresa

#### Demonstração de Interesse

```
Assunto: Interesse na vaga de {{vaga_titulo}}

Olá!

Vi a vaga de {{vaga_titulo}} na {{empresa_nome}} e fiquei muito interessado(a).

Tenho {{experiencia}} de experiência em {{skills}} e acredito que meu perfil 
pode contribuir com a equipe.

Gostaria de saber mais sobre a oportunidade e o processo seletivo.

Obrigado(a) pela atenção!
{{nome}}
```

#### Disponibilidade para Entrevista

```
Assunto: Re: Entrevista - {{vaga_titulo}}

Olá!

Muito obrigado(a) pelo convite para a entrevista! Fico muito feliz com a oportunidade.

Tenho disponibilidade nos seguintes horários:
• [data/horário 1]
• [data/horário 2]
• [data/horário 3]

Por favor, me avise qual funciona melhor para vocês.

Atenciosamente,
{{nome}}
```

---

## Mockups Conceituais

### Seleção de Template

```
┌─────────────────────────────────────────────────────────────────┐
│  📝 ENVIAR MENSAGEM                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Para: João Silva                                               │
│  Contexto: Candidatura para Dev React Senior                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  🎯 TEMPLATES RÁPIDOS                                           │
│                                                                 │
│  [📅 Convite entrevista] [✅ Aprovação] [📋 Solicitar info]     │
│  [❌ Não selecionado] [🔄 Atualização] [📝 + Ver todos]         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Assunto: [Convite para entrevista - Dev React Senior    ]      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Olá João! 👋                                            │    │
│  │                                                         │    │
│  │ Analisamos seu perfil para a vaga de Dev React Senior   │    │
│  │ e ficamos muito interessados na sua experiência de      │    │
│  │ 6 anos em React, TypeScript.                            │    │
│  │                                                         │    │
│  │ Gostaríamos de convidá-lo para uma entrevista.          │    │
│  │                                                         │    │
│  │ Você teria disponibilidade nos próximos dias?           │    │
│  │                                                         │    │
│  │ Aguardamos seu retorno!                                 │    │
│  │ Maria (RH)                                              │    │
│  │ TechCorp                                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ✨ Personalizado com dados do perfil de João                   │
│                                                                 │
│  Tom: [Amigável ▼]   [🔄 Regenerar]   [💾 Salvar template]      │
│                                                                 │
│                    [Cancelar]  [📤 Enviar]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Modal "Ver Todos Templates"

```
┌─────────────────────────────────────────────────────────────────┐
│  📚 BIBLIOTECA DE TEMPLATES                              [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Todos] [Convite] [Feedback] [Informação] [Meus Templates]     │
│                                                                 │
│  🔍 [Buscar template...                              ]          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📅 CONVITE                                                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Convite para Entrevista                                 │    │
│  │ Convida candidato para entrevista com personalização    │    │
│  │                                           [Usar]        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Convite para Teste Técnico                              │    │
│  │ Convida para etapa de teste técnico                     │    │
│  │                                           [Usar]        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ✅ FEEDBACK                                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Aprovação para Próxima Fase                             │    │
│  │ Comunica aprovação e próximos passos                    │    │
│  │                                           [Usar]        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
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

**Codinome sugerido:** `Quill` (representa escrita elegante)

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Sempre editável** | Usuário pode modificar qualquer mensagem gerada |
| **Fallback gracioso** | Variável ausente não quebra o template |
| **Tom consistente** | Mesmo tom deve gerar resultados similares |
| **Privacidade** | Templates salvos são privados |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Enviar mensagem sem confirmação do usuário |
| Templates com linguagem robótica |
| Variáveis que expõem dados sensíveis |
| Forçar uso de template (sempre permitir texto livre) |
| Regenerar destruindo edições manuais |

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
