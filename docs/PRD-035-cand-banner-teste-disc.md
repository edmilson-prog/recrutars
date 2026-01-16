# PRD-035: Banner de Incentivo ao Teste DISC (Candidato)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Incentivar candidatos a completarem o teste comportamental DISC |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | Múltiplos pontos de exibição, lógica contextual, integração com gamificação |

---

## Contexto do Problema

O teste comportamental DISC (Gauge-Pro) é o diferencial competitivo do RecrutaRS, permitindo matching inteligente entre perfil comportamental e requisitos das vagas. Porém, muitos candidatos não completam o teste por:

- Não entenderem o valor
- Acharem que é opcional e "deixar para depois"
- Não perceberem o impacto nas chances de contratação

Sem o DISC completo, o candidato:
- Tem match limitado (baseado apenas em habilidades)
- Não aparece em filtros por perfil comportamental
- Perde oportunidades de convites personalizados

### Dados que Justificam

| Métrica | Sem DISC | Com DISC |
|---------|----------|----------|
| Taxa de convites | 1x | **3x mais** |
| Match médio | 65% | **85%** |
| Tempo médio até contratação | 45 dias | **28 dias** |
| Preferência das empresas | 15% | **85%** |

---

## Conceito da Solução

### Estratégia Multi-Touch

Exibir incentivos contextuais em momentos de alta motivação:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  📊 DASHBOARD                                                   │
│  └─ Banner principal (sempre visível até completar)            │
│                                                                 │
│  📋 PÁGINA DE VAGA (match < 80%)                               │
│  └─ Banner contextual "Aumente seu match!"                     │
│                                                                 │
│  ✉️ APÓS CANDIDATURA                                            │
│  └─ Banner "Destaque-se dos outros candidatos"                 │
│                                                                 │
│  📩 AO RECEBER CONVITE                                          │
│  └─ Banner "Empresas valorizam perfis completos"               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mockups Detalhados

### Banner Principal (Dashboard)

```
┌──────────────────────────────────────────────────────────────────┐
│  📊 Dashboard                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ╔════════════════════════════════════════════════════════╗ │  │
│  │ ║  🧠                                               [✕]  ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  Descubra seu Perfil Comportamental                   ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  Complete o teste DISC e aumente suas chances de      ║ │  │
│  │ ║  contratação em até 3x! Empresas preferem candidatos  ║ │  │
│  │ ║  com perfil comportamental completo.                  ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  ┌──────────────────────────────────────────────────┐ ║ │  │
│  │ ║  │ Seu perfil: ████████░░ 80% completo              │ ║ │  │
│  │ ║  │              ↑ +20% ao completar o teste DISC    │ ║ │  │
│  │ ║  └──────────────────────────────────────────────────┘ ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  ⭐ 85% das empresas preferem perfis completos        ║ │  │
│  │ ║  ⏱️ Apenas 10 minutos para completar                  ║ │  │
│  │ ║  🎯 +50 XP ao finalizar                               ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║          [🚀 Aumentar Minhas Chances]                 ║ │  │
│  │ ║                                                        ║ │  │
│  │ ╚════════════════════════════════════════════════════════╝ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Candidaturas   │  │  Convites       │  │  Match Médio    │  │
│  │      12         │  │      3          │  │     78%         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ...resto do dashboard...                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Banner Contextual (Vaga com Match Baixo)

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Voltar]  Desenvolvedor React Senior                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ╔════════════════════════════════════════════════════════╗ │  │
│  │ ║  📈 Seu match com esta vaga pode aumentar!        [✕]  ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  Atualmente: ⭐ 72% match                              ║ │  │
│  │ ║  Com DISC:   ⭐ ~85-92% match estimado                 ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  Complete o teste comportamental e veja seu match     ║ │  │
│  │ ║  real com esta vaga.                                  ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║     [📊 Completar Teste DISC]    [Agora não]          ║ │  │
│  │ ╚════════════════════════════════════════════════════════╝ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  🏢 TechCorp Soluções                                           │
│  📍 Porto Alegre, RS (Híbrido)                                  │
│  💰 R$ 12.000 - R$ 15.000                                       │
│                                                                  │
│  ...detalhes da vaga...                                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Banner Pós-Candidatura (Toast/Snackbar Persistente)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ✅ Candidatura enviada com sucesso!                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ╔════════════════════════════════════════════════════════╗ │  │
│  │ ║  ✨ Quer se destacar dos outros candidatos?       [✕]  ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  Candidatos com perfil DISC completo têm 3x mais      ║ │  │
│  │ ║  chances de receber resposta das empresas.            ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║     [🎯 Completar Meu Perfil]    [Depois]             ║ │  │
│  │ ╚════════════════════════════════════════════════════════╝ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Banner ao Receber Convite

```
┌──────────────────────────────────────────────────────────────────┐
│  📩 Convites Recebidos                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ╔════════════════════════════════════════════════════════╗ │  │
│  │ ║  🏆 Empresas valorizam perfis completos!          [✕]  ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  Você recebeu um convite! Sabia que empresas dão      ║ │  │
│  │ ║  prioridade a candidatos com perfil comportamental?   ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║  Complete o teste DISC e receba ainda mais convites.  ║ │  │
│  │ ║                                                        ║ │  │
│  │ ║           [📊 Descobrir Meu Perfil DISC]              ║ │  │
│  │ ╚════════════════════════════════════════════════════════╝ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🏢 TechCorp te convidou para Product Manager             │  │
│  │  ...                                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Estado: Teste Já Realizado (Não Exibe Banner)

```
┌──────────────────────────────────────────────────────────────────┐
│  📊 Dashboard                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  (Sem banner - candidato já completou o teste)                  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Candidaturas   │  │  Convites       │  │  Match Médio    │  │
│  │      12         │  │      8          │  │     92%         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  📊 Seu Perfil DISC: Dominante (D)                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  D ████████░░  I ███░░░░░░░  S ██░░░░░░░░  C ██████░░░░   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Variações de CTA por Contexto

```
┌──────────────────────────────────────────────────────────────────┐
│  CONTEXTO               │  CTA PRINCIPAL              │  CTA 2  │
├─────────────────────────┼─────────────────────────────┼─────────┤
│  Dashboard              │  🚀 Aumentar Minhas Chances │  [✕]    │
│  Vaga (match baixo)     │  📊 Completar Teste DISC    │  Agora não│
│  Pós-candidatura        │  🎯 Completar Meu Perfil    │  Depois │
│  Recebeu convite        │  📊 Descobrir Meu Perfil    │  [✕]    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Banner principal no Dashboard (card horizontal no topo)
- ✅ Banner contextual em vagas com match < 80%
- ✅ Banner pós-candidatura (destaque)
- ✅ Banner ao visualizar convites recebidos
- ✅ Botão de fechar (✕) em todos os banners
- ✅ Reaparece a cada novo login
- ✅ Barra de progresso do perfil
- ✅ Prova social (estatísticas)
- ✅ Tempo estimado (10 minutos)
- ✅ Integração com XP (+50 XP)
- ✅ CTAs contextuais diferentes por local
- ✅ Não exibe se já completou o teste
- ✅ Link direto para página do teste DISC

### Excluído

- ❌ Push notification para lembrar
- ❌ Email de lembrete
- ❌ Modal bloqueante (sempre pode fechar)
- ❌ Obrigatoriedade do teste
- ❌ Desconto/benefício monetário

---

## Requisitos Funcionais

### Condição de Exibição

- **RF-001:** Banner só aparece se candidato NÃO completou teste DISC
- **RF-002:** Verificar flag `discCompleted` no perfil do candidato
- **RF-003:** Se `discCompleted === true`, não exibir nenhum banner

### Banner no Dashboard

- **RF-004:** Exibir card horizontal no topo do Dashboard
- **RF-005:** Mostrar barra de progresso do perfil
- **RF-006:** Mostrar estatística "85% das empresas preferem"
- **RF-007:** Mostrar tempo "Apenas 10 minutos"
- **RF-008:** Mostrar recompensa "+50 XP ao finalizar"
- **RF-009:** CTA principal: "🚀 Aumentar Minhas Chances"
- **RF-010:** Botão ✕ para fechar

### Banner em Vaga (Match < 80%)

- **RF-011:** Exibir apenas se match da vaga < 80%
- **RF-012:** Mostrar match atual e estimativa com DISC
- **RF-013:** Mensagem: "Seu match com esta vaga pode aumentar!"
- **RF-014:** CTA: "📊 Completar Teste DISC"
- **RF-015:** CTA secundário: "Agora não"

### Banner Pós-Candidatura

- **RF-016:** Exibir após confirmação de candidatura enviada
- **RF-017:** Mensagem: "Quer se destacar dos outros candidatos?"
- **RF-018:** Estatística: "3x mais chances de resposta"
- **RF-019:** CTA: "🎯 Completar Meu Perfil"
- **RF-020:** CTA secundário: "Depois"

### Banner em Convites

- **RF-021:** Exibir na página de convites recebidos
- **RF-022:** Mensagem: "Empresas valorizam perfis completos!"
- **RF-023:** CTA: "📊 Descobrir Meu Perfil DISC"

### Comportamento de Dispensa

- **RF-024:** Clicar em ✕ fecha o banner
- **RF-025:** Clicar em "Agora não" / "Depois" fecha o banner
- **RF-026:** Estado de fechado persiste até novo login
- **RF-027:** Ao fazer logout e login, banners reaparecem
- **RF-028:** Usar sessionStorage para controle (não localStorage)

### Navegação

- **RF-029:** Clicar no CTA principal redireciona para `/candidato/teste-disc`
- **RF-030:** Se teste já iniciado mas não concluído, continuar de onde parou

### Gamificação

- **RF-031:** Exibir "+50 XP" no banner do Dashboard
- **RF-032:** Ao completar teste, conceder 50 XP
- **RF-033:** Badge "Perfil Completo" 🏆 ao finalizar (se sistema de badges existir)

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Banner não pode bloquear conteúdo importante
- **RNF-002 (UX):** Animação suave ao fechar (fade out)
- **RNF-003 (Performance):** Verificação de DISC deve ser instantânea (cache)
- **RNF-004 (Acessibilidade):** Botão de fechar com aria-label apropriado

---

## Critérios de Aceitação

### RF-001 a RF-003: Condição de Exibição

```gherkin
DADO que o candidato NÃO completou o teste DISC
QUANDO ele acessa o Dashboard
ENTÃO deve ver o banner de incentivo ao teste

DADO que o candidato JÁ completou o teste DISC
QUANDO ele acessa o Dashboard
ENTÃO NÃO deve ver nenhum banner de incentivo
```

### RF-011 a RF-015: Banner em Vaga

```gherkin
DADO que o candidato está visualizando uma vaga
  E seu match com a vaga é 72%
  E ele não completou o teste DISC
QUANDO a página carrega
ENTÃO deve exibir banner "Seu match pode aumentar!"
  E deve mostrar match atual (72%) e estimativa (~85-92%)
```

### RF-024 a RF-028: Comportamento de Dispensa

```gherkin
DADO que o candidato fechou o banner no Dashboard
QUANDO ele navega para outra página e volta ao Dashboard
ENTÃO o banner NÃO deve reaparecer

DADO que o candidato fechou o banner
QUANDO ele faz logout e login novamente
ENTÃO o banner DEVE reaparecer
```

### RF-031 a RF-033: Gamificação

```gherkin
DADO que o candidato completou o teste DISC
QUANDO o resultado é salvo
ENTÃO ele deve receber +50 XP
  E deve receber badge "Perfil Completo" (se aplicável)
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Banner no Dashboard | 2 |
| 2 | Banners contextuais | 3 |
| 3 | Gamificação e polish | 2 |

### Detalhamento das Fases

#### Fase 1: Banner no Dashboard

**Objetivo:** Banner principal funcional

**Ações:**
- [ ] Criar componente `DiscIncentiveBanner`
- [ ] Implementar verificação `discCompleted`
- [ ] Implementar barra de progresso
- [ ] Implementar lógica de dispensa (sessionStorage)
- [ ] Adicionar ao Dashboard

**Validação:** Banner aparece/desaparece corretamente

#### Fase 2: Banners Contextuais

**Objetivo:** Banners em outros pontos estratégicos

**Ações:**
- [ ] Banner em página de vaga (match < 80%)
- [ ] Banner pós-candidatura
- [ ] Banner em convites recebidos
- [ ] Mensagens e CTAs contextuais

**Validação:** Banners aparecem nos contextos corretos

#### Fase 3: Gamificação e Polish

**Objetivo:** Integração com XP e refinamentos

**Ações:**
- [ ] Integrar concessão de +50 XP
- [ ] Adicionar badge "Perfil Completo"
- [ ] Animações de entrada/saída
- [ ] Testes e ajustes finais

**Validação:** XP concedido, animações funcionando

---

## Modelo de Dados

### Verificação de DISC

```typescript
interface CandidateProfile {
  // ...outros campos
  discCompleted: boolean;
  discCompletedAt?: string; // ISO date
  discProfile?: {
    primary: 'D' | 'I' | 'S' | 'C';
    scores: { d: number; i: number; s: number; c: number };
  };
}
```

### Estado de Dispensa

```typescript
// sessionStorage key
const BANNER_DISMISSED_KEY = 'disc_banner_dismissed';

// Valores possíveis
type BannerDismissedState = {
  dashboard: boolean;
  jobPage: boolean;
  afterApplication: boolean;
  invites: boolean;
};
```

### Contextos de Banner

```typescript
type BannerContext = 
  | 'dashboard'
  | 'job_low_match'
  | 'after_application'
  | 'invites_page';

interface BannerConfig {
  context: BannerContext;
  title: string;
  message: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  showProgress?: boolean;
  showStats?: boolean;
  showXpReward?: boolean;
}

const bannerConfigs: Record<BannerContext, BannerConfig> = {
  dashboard: {
    context: 'dashboard',
    title: 'Descubra seu Perfil Comportamental',
    message: 'Complete o teste DISC e aumente suas chances de contratação em até 3x!',
    ctaPrimary: '🚀 Aumentar Minhas Chances',
    showProgress: true,
    showStats: true,
    showXpReward: true,
  },
  job_low_match: {
    context: 'job_low_match',
    title: 'Seu match com esta vaga pode aumentar!',
    message: 'Complete o teste comportamental e veja seu match real com esta vaga.',
    ctaPrimary: '📊 Completar Teste DISC',
    ctaSecondary: 'Agora não',
  },
  after_application: {
    context: 'after_application',
    title: 'Quer se destacar dos outros candidatos?',
    message: 'Candidatos com perfil DISC completo têm 3x mais chances de receber resposta.',
    ctaPrimary: '🎯 Completar Meu Perfil',
    ctaSecondary: 'Depois',
  },
  invites_page: {
    context: 'invites_page',
    title: 'Empresas valorizam perfis completos!',
    message: 'Complete o teste DISC e receba ainda mais convites.',
    ctaPrimary: '📊 Descobrir Meu Perfil DISC',
  },
};
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-007 | Teste DISC (Gauge-Pro) | ✅ Implementado |
| PRD-008 | Sistema de XP e Badges | ✅ Implementado |
| PRD-005 | Dashboard do Candidato | ✅ Implementado |

---

## Métricas de Sucesso

| Métrica | Baseline | Meta |
|---------|----------|------|
| Taxa de conclusão do DISC | (atual) | +30% |
| Cliques no CTA | - | > 15% |
| Taxa de dispensa imediata | - | < 50% |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.34.0 → 0.35.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.35.0] - 2026-01-XX

### Added
- Banner de incentivo ao teste DISC no Dashboard
- Banner contextual em vagas com match baixo (<80%)
- Banner pós-candidatura para completar perfil
- Banner na página de convites recebidos
- Barra de progresso do perfil no banner
- Estatísticas de prova social (3x mais chances)
- Recompensa de +50 XP ao completar teste DISC
- Lógica de dispensa com reaparecimento a cada login
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Persistência** | Usar sessionStorage (não localStorage) |
| **Verificação** | Cache do estado `discCompleted` |
| **Animação** | Tailwind animate-fade-out ou similar |
| **XP** | Integrar com sistema existente (PRD-008) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Bloquear conteúdo com o banner |
| Usar modal intrusivo |
| Mostrar banner se DISC já foi feito |
| Persistir dispensa permanentemente (deve voltar no login) |
| Esquecer aria-label no botão de fechar |

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
| 16/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
