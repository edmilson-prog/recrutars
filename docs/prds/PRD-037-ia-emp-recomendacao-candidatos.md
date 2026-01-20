# PRD-037-ia-emp: Recomendação Inteligente de Candidatos

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar sistema de recomendação de candidatos para empresas, sugerindo talentos ideais para cada vaga ativa |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Inteligência Artificial |
| **Perfil** | Empresa |
| **PRDs Relacionados** | PRD-035-ia-all (Transparência Matching), PRD-036-ia-cand (espelho), PRD-014 (Banco de Talentos) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 10+ arquivos, algoritmo de recomendação, múltiplos sinais, integração com vagas e candidaturas |

---

## Contexto do Problema

Atualmente, recrutadores no RecrutaRS precisam buscar candidatos manualmente no Banco de Talentos usando filtros. Isso cria ineficiências:

| Problema | Impacto |
|----------|---------|
| **Perda de talentos** | Candidatos ideais passam despercebidos na busca manual |
| **Tempo desperdiçado** | Recrutadores gastam horas filtrando perfis |
| **Viés de busca** | Buscas manuais tendem a repetir os mesmos termos |
| **Vagas sem candidatos** | Vagas novas não têm candidaturas e recrutador não sabe por onde começar |

Plataformas como LinkedIn Recruiter, Gupy e Greenhouse oferecem "Candidatos Sugeridos" como feature premium. Recrutadores esperam que a plataforma proativamente sugira talentos relevantes.

O RecrutaRS tem vantagem: dados comportamentais DISC permitem matching por fit cultural, não apenas skills técnicas.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard da Empresa                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Suas Vagas Ativas                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Dev React Senior                     12 candidaturas     │   │
│  │ [Ver candidaturas] [Editar] [Pausar]                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Para encontrar mais candidatos:                                │
│  [🔍 Buscar no Banco de Talentos]  ← trabalho manual            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard da Empresa                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Suas Vagas Ativas                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Dev React Senior                     12 candidaturas     │   │
│  │                                                          │   │
│  │ ⭐ CANDIDATOS SUGERIDOS PARA ESTA VAGA          🔔 5 novos│   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ 👤 João Silva              🔥 95% match           │   │   │
│  │ │ Dev Full Stack • 6 anos exp • Porto Alegre        │   │   │
│  │ │ 💡 Perfil Analítico ideal para sua cultura técnica│   │   │
│  │ │ [Ver perfil] [Convidar] [✕]                       │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ 👤 Maria Santos            ⭐ 88% match           │   │   │
│  │ │ ...                                                │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │ [Ver todos os candidatos sugeridos →]                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas Banco de Talentos | Não é proativo, depende de busca manual |
| Notificação por email | Complementar, não substitui in-app |
| Recomendação global (sem vaga) | Menos relevante, precisa de contexto da vaga |

---

## Escopo

### Incluído

- ✅ Seção "Candidatos Sugeridos" em cada vaga ativa
- ✅ Algoritmo de recomendação por vaga
- ✅ Sinais: skills, experiência, DISC, localização, atividade recente
- ✅ Explicação "Por que sugerimos" para cada candidato
- ✅ Ordenação por relevância (match score)
- ✅ Ação "Não é adequado" para feedback
- ✅ Ação rápida "Convidar para entrevista"
- ✅ Widget no card de cada vaga (top 3)
- ✅ Página dedicada `/empresa/vagas/:id/candidatos-sugeridos`
- ✅ Indicador de novos candidatos desde último acesso
- ✅ Filtro por disponibilidade e pretensão salarial

### Excluído

- ❌ Recomendação de candidatos sem vaga específica
- ❌ Contato automático com candidatos
- ❌ Machine Learning com treinamento contínuo (fase 1 usa regras)
- ❌ Notificações push/email (PRD futuro)
- ❌ Análise de currículos anexados

---

## Requisitos Funcionais

### Algoritmo de Recomendação

- **RF-001:** Deve calcular score de recomendação para cada candidato ativo vs vaga
- **RF-002:** Sinais de entrada:
  - Skills do candidato vs requisitos da vaga (peso 35%)
  - Experiência vs requisito mínimo (peso 20%)
  - Perfil DISC vs perfil ideal da vaga (peso 20%)
  - Localização/modalidade aceita (peso 10%)
  - Atividade recente na plataforma (peso 10%)
  - Histórico: candidaturas similares aceitas (peso 5%)
- **RF-003:** Excluir candidatos que já se candidataram à vaga
- **RF-004:** Excluir candidatos marcados "Não é adequado"
- **RF-005:** Excluir candidatos inativos há mais de 90 dias
- **RF-006:** Ordenar por score decrescente
- **RF-007:** Mínimo de 60% de match para aparecer nas sugestões

### Sinais de Qualidade do Candidato

- **RF-008:** Priorizar candidatos com perfil 100% completo
- **RF-009:** Priorizar candidatos com teste DISC realizado
- **RF-010:** Priorizar candidatos com login recente (últimos 7 dias)
- **RF-011:** Considerar taxa de resposta a convites anteriores

### Widget por Vaga

- **RF-012:** Exibir seção "Candidatos Sugeridos" no card de cada vaga ativa
- **RF-013:** Mostrar 3 candidatos com maior score
- **RF-014:** Cada mini-card: foto, nome, título, match %, motivo resumido
- **RF-015:** Botões: "Ver perfil", "Convidar", "✕ Não adequado"
- **RF-016:** Indicador "X novos candidatos" se houver desde último acesso
- **RF-017:** Link "Ver todos os candidatos sugeridos"

### Página de Candidatos Sugeridos

- **RF-018:** Criar página `/empresa/vagas/:id/candidatos-sugeridos`
- **RF-019:** Listar todos os candidatos sugeridos (paginação)
- **RF-020:** Filtrar por: experiência, localização, pretensão salarial, disponibilidade
- **RF-021:** Ordenação padrão por relevância
- **RF-022:** Exibir "Por que sugerimos" expandível
- **RF-023:** Integrar com MatchScoreCard ao expandir

### Explicação da Sugestão

- **RF-024:** Gerar 2-3 motivos específicos para cada sugestão
- **RF-025:** Motivos personalizados: "6 anos de React excede seu requisito de 3+"
- **RF-026:** Mencionar alinhamento DISC quando relevante
- **RF-027:** Destacar se candidato está "Buscando ativamente"

### Ações Rápidas

- **RF-028:** Botão "Convidar" abre modal de convite para entrevista/processo
- **RF-029:** Ao convidar, candidato recebe notificação/mensagem
- **RF-030:** Candidato convidado sai da lista de sugestões (vai para pipeline)
- **RF-031:** Botão "Não é adequado" remove da lista
- **RF-032:** Opcionalmente perguntar motivo do descarte

### Feedback do Recrutador

- **RF-033:** Modal "Por que não é adequado?" com opções
- **RF-034:** Opções: "Experiência insuficiente", "Pretensão alta", "Localização", "Outro"
- **RF-035:** Usar feedback para melhorar sugestões futuras
- **RF-036:** Não mostrar candidato descartado novamente para esta vaga

### Atualização Dinâmica

- **RF-037:** Recalcular quando novos candidatos se cadastram
- **RF-038:** Recalcular quando candidato atualiza perfil
- **RF-039:** Recalcular quando vaga é editada
- **RF-040:** Cache com TTL de 2 horas

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Gerar sugestões em < 500ms
- **RNF-002 (Performance):** Widget deve carregar em < 300ms
- **RNF-003 (Escalabilidade):** Suportar 50.000 candidatos sem degradação
- **RNF-004 (Privacidade):** Não expor dados sensíveis do candidato
- **RNF-005 (Frescor):** Novos candidatos aparecem em até 2 horas

---

## Critérios de Aceitação

### RF-001 a RF-007: Algoritmo Base

```gherkin
DADO uma vaga ativa com requisitos definidos
  E existem 1000 candidatos na plataforma
QUANDO o algoritmo de sugestão é executado
ENTÃO deve retornar lista ordenada por score decrescente
  E todos os candidatos devem ter match ≥ 60%
  E candidatos já aplicados devem ser excluídos
  E candidatos marcados "Não adequado" devem ser excluídos
```

### RF-012 a RF-017: Widget por Vaga

```gherkin
DADO que o recrutador visualiza uma vaga ativa
QUANDO o card da vaga é renderizado
ENTÃO deve exibir seção "Candidatos Sugeridos"
  E deve mostrar até 3 candidatos
  E cada mini-card deve ter foto, nome, match % e motivo
  E deve ter botões de ação rápida
```

### RF-028 a RF-030: Convidar Candidato

```gherkin
DADO que o recrutador vê um candidato sugerido
QUANDO clica em "Convidar"
ENTÃO deve abrir modal de convite
  E ao confirmar, candidato recebe notificação
  E candidato é removido da lista de sugestões
  E candidato aparece no pipeline da vaga
```

### RF-031 a RF-036: Feedback Negativo

```gherkin
DADO que o recrutador vê um candidato não adequado
QUANDO clica em "✕ Não é adequado"
ENTÃO candidato é removido da lista imediatamente
  E pode exibir modal perguntando motivo
  E candidato não aparece mais para esta vaga
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Algoritmo de sugestão | 4 |
| 2 | Widget nas vagas | 4 |
| 3 | Página dedicada | 3 |
| 4 | Ações e feedback | 4 |
| 5 | Refinamentos | 2 |

### Detalhamento das Fases

#### Fase 1: Algoritmo de Sugestão

**Objetivo:** Implementar motor de sugestão de candidatos

**Ações:**
- [ ] Criar tipo `CandidateRecommendation` com score e motivos
- [ ] Implementar `calculateCandidateScore(candidato, vaga)`
- [ ] Implementar `generateSuggestionReasons(candidato, vaga)`
- [ ] Implementar `getSuggestedCandidates(vagaId, limit)`
- [ ] Criar filtros de exclusão

**Validação:** Função retorna lista ordenada de candidatos

#### Fase 2: Widget nas Vagas

**Objetivo:** Exibir sugestões no card de cada vaga

**Ações:**
- [ ] Criar componente `SuggestedCandidatesWidget`
- [ ] Criar componente `SuggestedCandidateCard`
- [ ] Integrar widget no card de vaga (Dashboard)
- [ ] Implementar indicador de novos candidatos
- [ ] Implementar estados loading/empty

**Validação:** Widget exibe candidatos em cada vaga ativa

#### Fase 3: Página Dedicada

**Objetivo:** Criar página completa de sugestões por vaga

**Ações:**
- [ ] Criar página `/empresa/vagas/:id/candidatos-sugeridos`
- [ ] Implementar listagem paginada
- [ ] Implementar filtros avançados
- [ ] Integrar "Por que sugerimos" expandível
- [ ] Integrar com MatchScoreCard

**Validação:** Recrutador navega e vê todas as sugestões

#### Fase 4: Ações e Feedback

**Objetivo:** Implementar ações de convite e descarte

**Ações:**
- [ ] Criar modal de convite
- [ ] Integrar com sistema de mensagens/notificações
- [ ] Implementar "Não é adequado" com feedback
- [ ] Persistir feedback e exclusões
- [ ] Atualizar lista dinamicamente

**Validação:** Ações funcionam e afetam sugestões

#### Fase 5: Refinamentos

**Objetivo:** Otimizar e ajustar

**Ações:**
- [ ] Implementar cache de sugestões
- [ ] Ajustar pesos baseado em feedback
- [ ] Refinar UX e textos
- [ ] Documentar metodologia

**Validação:** Sugestões são rápidas e relevantes

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-013 | CRUD de Vagas | ⏳ Pendente |
| PRD-014 | Banco de Talentos | ⏳ Pendente |
| PRD-016 | Mensagens (Empresa) | ⏳ Pendente |
| PRD-035-ia-all | Transparência Matching | ⏳ Pendente |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Inteligência Artificial"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-035-ia-all | Transparência do Matching | ⏳ | Base |
| 2 | PRD-036-ia-cand | Recomendação de Vagas | ⏳ | Espelho |
| **3** | **PRD-037-ia-emp** | **Recomendação de Candidatos** | **🔄 ATUAL** | Depende de 035 |
| 4 | PRD-038-ia-cand | Parser de Currículo | ⏳ | Independente |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Dados do candidato | PII | Exibir apenas dados públicos do perfil |
| Score de sugestão | Interno | Visível para empresa, não para candidato |
| Motivo de descarte | Interno | Não compartilhar com candidato |

### Privacidade

- Candidato NÃO deve saber se foi descartado pela empresa
- Candidato NÃO deve ver score interno de sugestão
- Empresa só vê dados que candidato tornou públicos

---

## Fluxos de Usuário

### Fluxo Principal

```
[Recrutador] ──▶ [Dashboard] ──▶ [Vê vaga com sugestões]
                                        │
                                        ▼
                              [Clica em candidato]
                                        │
                                        ▼
                              [Vê perfil + MatchScoreCard]
                                        │
                                        ▼
                              [Convida para processo]
```

### Fluxo de Descarte

```
[Recrutador] ──▶ [Vê candidato não adequado] ──▶ [Clica "✕"]
                                                      │
                                                      ▼
                                            [Modal: motivo]
                                                      │
                                                      ▼
                                            [Candidato removido]
```

---

## Mockups Conceituais

### Widget no Card da Vaga

```
┌─────────────────────────────────────────────────────────────────┐
│  Dev React Senior                               12 candidaturas │
│  Porto Alegre • Híbrido • R$ 12-15k                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⭐ CANDIDATOS SUGERIDOS                               🔔 5 novos│
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ┌────┐ João Silva                           🔥 95%        │  │
│  │ │foto│ Dev Full Stack • 6 anos • POA                      │  │
│  │ └────┘ 💡 Perfil Analítico ideal                          │  │
│  │        [Ver] [Convidar] [✕]                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ┌────┐ Maria Santos                         ⭐ 88%        │  │
│  │ │foto│ Frontend Dev • 4 anos • Remoto                     │  │
│  │ └────┘ 💡 React avançado, TypeScript                      │  │
│  │        [Ver] [Convidar] [✕]                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Ver todos os 23 candidatos sugeridos →]                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Ver candidaturas] [Editar vaga] [Pausar]                      │
└─────────────────────────────────────────────────────────────────┘
```

### Modal de Convite

```
┌─────────────────────────────────────────────────────────────────┐
│  Convidar João Silva para o processo                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Vaga: Dev React Senior                                         │
│                                                                 │
│  Mensagem personalizada:                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Olá João! Vimos seu perfil e achamos que você seria     │    │
│  │ um ótimo fit para nossa vaga de Dev React Senior.       │    │
│  │ Gostaria de conversar sobre a oportunidade?             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ○ Agendar entrevista                                           │
│  ● Apenas enviar convite                                        │
│                                                                 │
│                           [Cancelar]  [Enviar convite]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
> - Atualizar a seção "Status de Implementação"

**Codinome sugerido:** `Scout` (representa busca proativa de talentos)

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear vaga** | Se sugestões falharem, mostrar vaga sem widget |
| **Cache agressivo** | Sugestões mudam pouco, cachear 2h |
| **Privacidade** | Nunca expor motivo de descarte ao candidato |
| **Convite não-bloqueante** | Envio assíncrono, não travar UI |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Mostrar candidatos com match < 60% |
| Expor dados sensíveis do candidato |
| Informar candidato que foi descartado |
| Recalcular a cada renderização |
| Bloquear card da vaga se sugestões falharem |

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
