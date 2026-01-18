# PRD-036-ia-cand: Recomendação Inteligente de Vagas

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar sistema de recomendação de vagas personalizado para candidatos baseado em perfil, comportamento e histórico |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Épico** | Inteligência Artificial |
| **Perfil** | Candidato |
| **PRDs Relacionados** | PRD-035-ia-all (Transparência Matching), PRD-006 (Busca de Vagas), PRD-008 (Teste Comportamental) |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 10+ arquivos, algoritmo de recomendação, múltiplos sinais de entrada, personalização dinâmica |

---

## Contexto do Problema

Atualmente, candidatos no RecrutaRS precisam buscar vagas manualmente usando filtros e palavras-chave. Isso cria problemas:

| Problema | Impacto |
|----------|---------|
| **Candidatos perdem vagas relevantes** | Não encontram vagas que seriam ideais por não saber os termos certos |
| **Busca genérica** | Todos veem as mesmas vagas, sem personalização |
| **Baixo engajamento** | Candidatos desistem se não encontram vagas rapidamente |
| **Sobrecarga cognitiva** | Muitas vagas para filtrar, paralisia de escolha |

Plataformas líderes como LinkedIn ("Vagas para você"), Glassdoor e Indeed usam recomendação personalizada como feature principal. Candidatos esperam que a plataforma "entenda" seu perfil e sugira oportunidades relevantes automaticamente.

O RecrutaRS tem vantagem competitiva: possui dados comportamentais do Gauge-Pro (DISC) que concorrentes não têm, permitindo recomendações mais precisas baseadas em fit cultural.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard do Candidato                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Bem-vindo, João!                                               │
│                                                                 │
│  [🔍 Buscar vagas...]                                           │
│                                                                 │
│  Vagas Recentes (genéricas, iguais para todos)                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │ Vaga 1  │ │ Vaga 2  │ │ Vaga 3  │                           │
│  └─────────┘ └─────────┘ └─────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard do Candidato                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Bem-vindo, João!                                               │
│                                                                 │
│  ⭐ VAGAS RECOMENDADAS PARA VOCÊ                                │
│  Baseadas no seu perfil e preferências                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🏢 TechCorp — Dev React Senior          🔥 95% match   │    │
│  │ Porto Alegre, RS • Híbrido • R$ 12-15k                 │    │
│  │                                                         │    │
│  │ 💡 Por que recomendamos:                                │    │
│  │ • Suas skills React e TypeScript são perfeitas         │    │
│  │ • Seu perfil Analítico combina com a cultura           │    │
│  │                                                         │    │
│  │ [Ver vaga] [Salvar] [Não tenho interesse]              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🏢 StartupX — Full Stack Developer       ⭐ 88% match   │    │
│  │ Remoto • R$ 10-12k                                      │    │
│  │ ...                                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Ver mais recomendações]                                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  🔍 BUSCAR OUTRAS VAGAS                                         │
│  [Buscar por cargo, skill ou empresa...]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Apenas filtros manuais | Não resolve descoberta passiva |
| Recomendação só por skills | Ignora fit cultural (DISC) |
| Email diário com vagas | Muito intrusivo, baixa conversão |

---

## Escopo

### Incluído

- ✅ Seção "Vagas Recomendadas para Você" no Dashboard
- ✅ Algoritmo de recomendação com múltiplos sinais
- ✅ Sinais de entrada: perfil, skills, experiência, DISC, localização, histórico
- ✅ Explicação resumida "Por que recomendamos"
- ✅ Ordenação por relevância (match score)
- ✅ Ação "Não tenho interesse" para feedback negativo
- ✅ Atualização dinâmica baseada em comportamento
- ✅ Página dedicada `/candidato/vagas-recomendadas`
- ✅ Widget no Dashboard (top 3-5 vagas)
- ✅ Indicador visual de novas recomendações

### Excluído

- ❌ Notificações push de novas vagas (PRD futuro)
- ❌ Email com recomendações (PRD futuro)
- ❌ Machine Learning com treinamento contínuo (fase 1 usa regras)
- ❌ Recomendação de empresas (apenas vagas)
- ❌ Preferências avançadas configuráveis pelo usuário

---

## Requisitos Funcionais

### Algoritmo de Recomendação

- **RF-001:** Deve calcular score de recomendação para cada vaga ativa
- **RF-002:** Sinais de entrada devem incluir:
  - Skills do candidato vs requisitos da vaga (peso 35%)
  - Experiência do candidato vs requisito mínimo (peso 20%)
  - Perfil DISC vs cultura da empresa (peso 20%)
  - Localização/modalidade de trabalho (peso 15%)
  - Histórico de interações: vagas visualizadas, candidaturas (peso 10%)
- **RF-003:** Vagas já candidatadas devem ser excluídas
- **RF-004:** Vagas marcadas "Não tenho interesse" devem ser excluídas
- **RF-005:** Vagas expiradas ou pausadas devem ser excluídas
- **RF-006:** Ordenar por score de recomendação decrescente
- **RF-007:** Mínimo de 50% de match para aparecer nas recomendações

### Sinais de Comportamento

- **RF-008:** Rastrear vagas visualizadas (sem candidatura)
- **RF-009:** Rastrear tempo gasto em cada vaga
- **RF-010:** Rastrear padrões de busca (termos usados)
- **RF-011:** Usar vagas candidatadas como sinal positivo para similares
- **RF-012:** Usar "Não tenho interesse" como sinal negativo para similares

### Widget no Dashboard

- **RF-013:** Exibir seção "Vagas Recomendadas para Você" no topo do Dashboard
- **RF-014:** Mostrar 3-5 vagas com maior score
- **RF-015:** Cada card deve exibir: empresa, título, localização, match %, motivo resumido
- **RF-016:** Botão "Ver mais recomendações" leva para página dedicada
- **RF-017:** Indicador de "X novas vagas para você" se houver desde último acesso

### Página de Recomendações

- **RF-018:** Criar página `/candidato/vagas-recomendadas`
- **RF-019:** Listar todas as vagas recomendadas (paginação)
- **RF-020:** Permitir filtrar por: localização, faixa salarial, modalidade
- **RF-021:** Manter ordenação por relevância como padrão
- **RF-022:** Exibir "Por que recomendamos" expandível em cada card

### Explicação da Recomendação

- **RF-023:** Gerar 2-3 motivos específicos para cada recomendação
- **RF-024:** Motivos devem ser personalizados (não genéricos)
- **RF-025:** Exemplos: "Suas skills React e Node.js são prioridade desta vaga"
- **RF-026:** Integrar com MatchScoreCard do PRD-035 ao expandir

### Feedback do Usuário

- **RF-027:** Botão "Não tenho interesse" em cada card
- **RF-028:** Ao clicar, remover vaga da lista imediatamente
- **RF-029:** Opcionalmente perguntar motivo (modal rápido)
- **RF-030:** Motivos: "Salário baixo", "Localização", "Não é minha área", "Outro"
- **RF-031:** Usar feedback para melhorar recomendações futuras

### Atualização Dinâmica

- **RF-032:** Recalcular recomendações quando candidato atualiza perfil
- **RF-033:** Recalcular quando novas vagas são publicadas
- **RF-034:** Recalcular quando candidato completa teste DISC
- **RF-035:** Cache de recomendações com TTL de 1 hora

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Gerar recomendações em < 500ms
- **RNF-002 (Performance):** Widget deve carregar em < 200ms (usar cache)
- **RNF-003 (Escalabilidade):** Suportar 10.000 vagas ativas sem degradação
- **RNF-004 (Privacidade):** Não expor dados de outros candidatos nas recomendações
- **RNF-005 (Frescor):** Novas vagas devem aparecer em até 1 hora

---

## Critérios de Aceitação

### RF-001 a RF-007: Algoritmo Base

```gherkin
DADO um candidato com perfil completo
  E existem 100 vagas ativas na plataforma
QUANDO o algoritmo de recomendação é executado
ENTÃO deve retornar lista ordenada por score decrescente
  E todas as vagas devem ter match ≥ 50%
  E vagas já candidatadas devem ser excluídas
  E vagas marcadas "Não tenho interesse" devem ser excluídas
```

### RF-013 a RF-017: Widget Dashboard

```gherkin
DADO que o candidato acessa o Dashboard
QUANDO a página carrega
ENTÃO deve exibir seção "Vagas Recomendadas para Você"
  E deve mostrar entre 3 e 5 vagas
  E cada card deve ter empresa, título, match % e motivo
  E deve ter botão "Ver mais recomendações"
```

### RF-023 a RF-026: Explicação

```gherkin
DADO uma vaga recomendada para o candidato
QUANDO o card é exibido
ENTÃO deve mostrar 2-3 motivos específicos da recomendação
  E motivos devem mencionar dados reais do candidato
  E ao expandir deve integrar com MatchScoreCard
```

### RF-027 a RF-031: Feedback Negativo

```gherkin
DADO que o candidato vê uma vaga recomendada
QUANDO clica em "Não tenho interesse"
ENTÃO a vaga deve ser removida da lista imediatamente
  E pode exibir modal perguntando motivo (opcional)
  E a vaga não deve aparecer novamente nas recomendações
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Algoritmo de recomendação | 4 |
| 2 | Widget no Dashboard | 4 |
| 3 | Página dedicada | 3 |
| 4 | Feedback e sinais | 3 |
| 5 | Refinamentos e cache | 2 |

### Detalhamento das Fases

#### Fase 1: Algoritmo de Recomendação

**Objetivo:** Implementar motor de recomendação

**Ações:**
- [ ] Criar tipo `JobRecommendation` com score e motivos
- [ ] Implementar `calculateRecommendationScore(candidato, vaga)`
- [ ] Implementar `generateRecommendationReasons(candidato, vaga)`
- [ ] Implementar `getRecommendedJobs(candidatoId, limit)`
- [ ] Criar filtros de exclusão (já candidatou, não interesse)

**Validação:** Função retorna lista ordenada com scores e motivos

#### Fase 2: Widget no Dashboard

**Objetivo:** Exibir recomendações no Dashboard do candidato

**Ações:**
- [ ] Criar componente `RecommendedJobsWidget`
- [ ] Criar componente `RecommendedJobCard`
- [ ] Integrar widget no Dashboard do candidato
- [ ] Implementar indicador de "X novas vagas"
- [ ] Implementar loading state e empty state

**Validação:** Widget exibe vagas personalizadas no Dashboard

#### Fase 3: Página Dedicada

**Objetivo:** Criar página completa de recomendações

**Ações:**
- [ ] Criar página `/candidato/vagas-recomendadas`
- [ ] Implementar listagem paginada
- [ ] Implementar filtros (localização, salário, modalidade)
- [ ] Integrar "Por que recomendamos" expandível
- [ ] Adicionar link no menu lateral

**Validação:** Candidato navega para página e vê todas as recomendações

#### Fase 4: Feedback e Sinais

**Objetivo:** Coletar feedback e rastrear comportamento

**Ações:**
- [ ] Implementar botão "Não tenho interesse"
- [ ] Criar modal de motivo (opcional)
- [ ] Rastrear visualizações de vagas
- [ ] Integrar sinais no algoritmo
- [ ] Persistir feedback (localStorage/mock)

**Validação:** Feedback do usuário afeta recomendações futuras

#### Fase 5: Refinamentos e Cache

**Objetivo:** Otimizar performance e UX

**Ações:**
- [ ] Implementar cache de recomendações
- [ ] Definir TTL e invalidação
- [ ] Ajustar pesos do algoritmo baseado em testes
- [ ] Refinar textos e UX

**Validação:** Recomendações carregam rapidamente e são relevantes

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-004 | Tipos TypeScript | ⏳ Pendente |
| PRD-005 | Perfil do Candidato | ⏳ Pendente |
| PRD-006 | Busca de Vagas | ⏳ Pendente |
| PRD-008 | Teste Comportamental | ⏳ Pendente |
| PRD-035-ia-all | Transparência Matching | ⏳ Pendente |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Nenhum | - | - |

---

## Cadeia de PRDs

Este PRD faz parte do épico **"Inteligência Artificial"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-035-ia-all | Transparência do Matching | ⏳ | Base para IA |
| **2** | **PRD-036-ia-cand** | **Recomendação de Vagas** | **🔄 ATUAL** | Depende de 035 |
| 3 | PRD-037-ia-emp | Recomendação de Candidatos | ⏳ | Espelho de 036 |
| 4 | PRD-038-ia-cand | Parser de Currículo | ⏳ | Independente |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Histórico de visualizações | Privado | Apenas do próprio candidato |
| Feedback "Não interesse" | Privado | Não compartilhar com empresas |
| Score de recomendação | Privado | Visível apenas para candidato |

### Privacidade

- Empresas NÃO devem saber se candidato viu vaga mas não candidatou
- Empresas NÃO devem saber se candidato marcou "Não tenho interesse"
- Dados de comportamento são apenas para melhorar recomendações

---

## Fluxos de Usuário

### Fluxo Principal

```
[Candidato] ──▶ [Acessa Dashboard] ──▶ [Vê widget "Vagas para Você"]
                                               │
                                               ▼
                                    [Clica em vaga recomendada]
                                               │
                                               ▼
                                    [Vê detalhes + MatchScoreCard]
                                               │
                                               ▼
                                    [Candidata-se ou salva]
```

### Fluxo de Feedback Negativo

```
[Candidato] ──▶ [Vê vaga não relevante] ──▶ [Clica "Não tenho interesse"]
                                                      │
                                                      ▼
                                            [Modal: motivo (opcional)]
                                                      │
                                                      ▼
                                            [Vaga removida da lista]
                                                      │
                                                      ▼
                                            [Algoritmo ajustado]
```

---

## Mockups Conceituais

### Widget no Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  ⭐ VAGAS RECOMENDADAS PARA VOCÊ                    🔔 3 novas  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🏢 TechCorp                                             │    │
│  │ Dev React Senior                            🔥 95%      │    │
│  │ 📍 Porto Alegre • Híbrido • R$ 12-15k                   │    │
│  │                                                         │    │
│  │ 💡 Por que recomendamos:                                │    │
│  │ • Suas skills React e TypeScript são prioridade        │    │
│  │ • Perfil Analítico alinha com cultura técnica          │    │
│  │                                                         │    │
│  │ [Ver vaga]  [💾 Salvar]  [✕ Não tenho interesse]       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🏢 StartupX                                             │    │
│  │ Full Stack Developer                        ⭐ 88%      │    │
│  │ 📍 Remoto • R$ 10-12k                                   │    │
│  │ ...                                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│                    [Ver todas as recomendações →]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Modal "Não tenho interesse"

```
┌─────────────────────────────────────────────────────────────────┐
│  Por que esta vaga não é para você? (opcional)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Isso nos ajuda a melhorar suas recomendações.                  │
│                                                                 │
│  ○ Salário abaixo do esperado                                   │
│  ○ Localização não é conveniente                                │
│  ○ Não é minha área de atuação                                  │
│  ○ Já conheço a empresa (não tenho interesse)                   │
│  ○ Outro motivo                                                 │
│                                                                 │
│                           [Pular]  [Enviar feedback]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
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

**Codinome sugerido:** `Compass` (representa orientação e descoberta)

🔗 Referência: https://semver.org/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear Dashboard** | Se recomendações falharem, mostrar vagas recentes |
| **Fail gracefully** | Se candidato sem DISC, calcular com peso redistribuído |
| **Cache primeiro** | Sempre tentar cache antes de recalcular |
| **Feedback não-bloqueante** | Modal de motivo é opcional, não forçar |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Cache** | Usar React Query ou similar com TTL de 1h |
| **Pesos** | Centralizar em arquivo de config, não hardcodar |
| **Feedback** | Armazenar em localStorage até ter banco |
| **Loading** | Usar skeleton loading para widget |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Recalcular recomendações a cada renderização |
| Mostrar vagas com match < 50% |
| Expor dados de comportamento para empresas |
| Forçar feedback (deve ser opcional) |
| Bloquear Dashboard se recomendações falharem |

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
