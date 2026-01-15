# PRD-000-dgn: Design System e Microinterações

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Estabelecer design system consistente com tokens, animações e microinterações que transformem a experiência visual da plataforma |
| **Tipo** | Feature |
| **Complexidade** | Alta |
| **Total de Fases** | 5 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Alta** | 15+ arquivos, impacta toda a aplicação, múltiplos componentes reutilizáveis, sistema de animações |

---

## Contexto do Problema

A interface atual do RecrutaRS é funcional, mas visualmente genérica. Os componentes utilizam shadcn/ui padrão sem personalização significativa, as animações são básicas (fade-in/up simples), e não há sistema de feedback visual consistente para ações do usuário. Isso resulta em uma experiência que não se diferencia de outros SaaS e não transmite a sofisticação esperada de uma plataforma de recrutamento com IA.

O design system atual carece de identidade própria. Embora existam tokens CSS definidos (cores, gradientes, sombras), eles não são aplicados de forma consistente. Os estados de loading são inconsistentes entre páginas, não há celebrações visuais para conquistas, e as transições entre estados são abruptas ou inexistentes.

Este PRD estabelece a fundação visual sobre a qual todas as melhorias futuras serão construídas. Sem um design system sólido, features como gamificação e visualização de dados comportamentais não terão o impacto visual desejado.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│ DESIGN SYSTEM ATUAL                                             │
├─────────────────────────────────────────────────────────────────┤
│ • Tokens CSS definidos mas subutilizados                        │
│ • Animações genéricas (opacity + translateY)                    │
│ • Componentes shadcn/ui sem customização                        │
│ • Skeleton loading inexistente ou inconsistente                 │
│ • Sem celebrações visuais                                       │
│ • Estados de erro/vazio sem padrão                              │
│ • Hover effects básicos                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│ DESIGN SYSTEM EVOLUÍDO                                          │
├─────────────────────────────────────────────────────────────────┤
│ • Design tokens expandidos e documentados                       │
│ • Sistema de animações com variants reutilizáveis               │
│ • Componentes estilizados com identidade RecrutaRS              │
│ • Skeleton loading com shimmer em todas as listas               │
│ • Celebrações visuais (confetti, checkmarks animados)           │
│ • Estados padronizados (loading, empty, error, success)         │
│ • Microinterações em botões, cards e formulários                │
│ • Transições suaves entre páginas e estados                     │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Trocar shadcn/ui por outro design system | Retrabalho excessivo, shadcn é extensível |
| Usar biblioteca de animações pronta (Animate.css) | Menos controle, não integra bem com React |
| Implementar apenas em páginas novas | Inconsistência visual, experiência fragmentada |

---

## Escopo

### Incluído

- ✅ Expansão dos design tokens (cores semânticas, espaçamentos, sombras)
- ✅ Sistema de variants Framer Motion reutilizáveis
- ✅ Componentes de Skeleton Loading com efeito shimmer
- ✅ Estados padronizados (EmptyState, ErrorState, LoadingState)
- ✅ Microinterações em botões (hover, press, loading)
- ✅ Microinterações em cards (hover reveal, expand)
- ✅ Celebrações visuais (confetti explosion, animated checkmark)
- ✅ Transições de página com AnimatePresence
- ✅ Feedback visual para ações (toast aprimorado)
- ✅ Aplicação nos 3 dashboards (Candidato, Empresa, Admin)

### Excluído

- ❌ Gamificação (XP, badges, níveis) — PRD-001-dgn
- ❌ Visualização DISC e match score — PRD-002-dgn
- ❌ Navegação mobile bottom bar — PRD-003-dgn
- ❌ Dark mode toggle (já existe, apenas refinamentos)
- ❌ Redesign completo de páginas (apenas aplicação do sistema)

---

## Requisitos Funcionais

### Design Tokens

- **RF-001:** O sistema deve ter paleta de cores semânticas expandida (primary, secondary, success, warning, destructive, info)
- **RF-002:** Cada cor semântica deve ter variantes de intensidade (50, 100, 200... 900)
- **RF-003:** O sistema deve definir escala de espaçamentos consistente (4px base)
- **RF-004:** O sistema deve definir escala de border-radius padronizada
- **RF-005:** O sistema deve ter sombras categorizadas (soft, medium, large, glow)

### Sistema de Animações

- **RF-006:** O sistema deve prover variants Framer Motion reutilizáveis para fade-in, slide-up, scale-in
- **RF-007:** As animações devem respeitar `prefers-reduced-motion` do sistema operacional
- **RF-008:** O timing padrão deve ser 200-300ms para transições UI e 100-200ms para feedback
- **RF-009:** O sistema deve usar easing curves naturais (não linear)
- **RF-010:** Listas devem suportar stagger animation (delay incremental entre itens)

### Skeleton Loading

- **RF-011:** O sistema deve prover componente SkeletonCard para cards de vaga/candidato
- **RF-012:** O sistema deve prover componente SkeletonList para listas genéricas
- **RF-013:** O sistema deve prover componente SkeletonTable para tabelas
- **RF-014:** Skeletons devem ter efeito shimmer (gradiente animado)
- **RF-015:** Skeletons devem espelhar o layout real do conteúdo (evitar layout shift)

### Estados Padronizados

- **RF-016:** O sistema deve prover componente EmptyState com ícone, título, descrição e ação opcional
- **RF-017:** O sistema deve prover componente ErrorState com ícone, mensagem e botão de retry
- **RF-018:** O sistema deve prover componente LoadingState com spinner e mensagem opcional
- **RF-019:** O sistema deve prover componente SuccessState com checkmark animado

### Microinterações - Botões

- **RF-020:** Botões devem ter hover effect com transição suave de cor/sombra
- **RF-021:** Botões devem ter press effect (scale down sutil: 0.98)
- **RF-022:** Botões em estado loading devem mostrar spinner inline
- **RF-023:** Botões de ação destrutiva devem ter confirmação visual (shake em erro)

### Microinterações - Cards

- **RF-024:** Cards devem ter hover effect com elevação de sombra
- **RF-025:** Cards devem revelar ações secundárias no hover (ex: bookmark, share)
- **RF-026:** Cards clicáveis devem ter cursor pointer e feedback visual
- **RF-027:** Cards devem suportar estado de seleção visual

### Celebrações Visuais

- **RF-028:** O sistema deve prover componente ConfettiExplosion para conquistas
- **RF-029:** O sistema deve prover componente AnimatedCheckmark para confirmações de sucesso
- **RF-030:** Celebrações devem ser disparadas em momentos específicos (ex: candidatura enviada, perfil completo)
- **RF-031:** Celebrações devem ter duração máxima de 3 segundos

### Transições de Página

- **RF-032:** Transições entre páginas devem usar AnimatePresence com fade
- **RF-033:** Conteúdo deve animar de forma coordenada (header primeiro, depois conteúdo)
- **RF-034:** Transições não devem bloquear interação por mais de 300ms

### Feedback de Ações

- **RF-035:** Toasts de sucesso devem ter ícone de checkmark e cor verde
- **RF-036:** Toasts de erro devem ter ícone de X e cor vermelha
- **RF-037:** Toasts devem ter animação de entrada (slide-in) e saída (fade-out)
- **RF-038:** Toasts devem auto-dismiss após 4 segundos (configurável)

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Animações devem rodar a 60fps sem jank
- **RNF-002 (Performance):** Uso de transform/opacity ao invés de width/height para animações GPU-accelerated
- **RNF-003 (Acessibilidade):** Respeitar `prefers-reduced-motion` desabilitando animações complexas
- **RNF-004 (Acessibilidade):** Manter contraste mínimo 4.5:1 para texto
- **RNF-005 (Bundle Size):** Não adicionar dependências superiores a 50KB gzipped
- **RNF-006 (Manutenibilidade):** Componentes devem ser documentados com props tipadas
- **RNF-007 (Consistência):** Tokens devem ser usados via variáveis CSS, nunca hardcoded

---

## Critérios de Aceitação

### RF-006/RF-010: Sistema de Animações

```gherkin
DADO que o desenvolvedor importa as variants de animação
QUANDO ele aplica fadeInUp a um componente
ENTÃO o componente deve animar de opacity 0 → 1 e translateY 20px → 0
  E a duração deve ser 300ms com easing natural
  E deve respeitar prefers-reduced-motion
```

```gherkin
DADO que uma lista de cards é renderizada
QUANDO a animação stagger é aplicada
ENTÃO cada card deve animar com delay incremental de 50-100ms
  E o delay total não deve exceder 500ms para 10 itens
```

### RF-011/RF-015: Skeleton Loading

```gherkin
DADO que dados estão sendo carregados
QUANDO o componente está em estado loading
ENTÃO deve exibir skeleton com layout idêntico ao conteúdo real
  E o skeleton deve ter efeito shimmer animado
  E não deve haver layout shift quando dados carregarem
```

### RF-016/RF-019: Estados Padronizados

```gherkin
DADO que uma lista não tem itens
QUANDO o componente EmptyState é renderizado
ENTÃO deve exibir ícone centralizado
  E título descritivo (ex: "Nenhuma candidatura ainda")
  E descrição auxiliar
  E botão de ação opcional (ex: "Buscar vagas")
```

```gherkin
DADO que uma ação foi concluída com sucesso
QUANDO o componente SuccessState é exibido
ENTÃO deve mostrar checkmark animado (círculo + stroke do ✓)
  E a animação deve durar ~500ms
  E deve ser acompanhado de mensagem de sucesso
```

### RF-028/RF-031: Celebrações Visuais

```gherkin
DADO que o candidato enviou uma candidatura com sucesso
QUANDO a confirmação é exibida
ENTÃO deve disparar confetti explosion
  E o confetti deve usar cores da marca
  E deve durar no máximo 3 segundos
  E não deve bloquear interação do usuário
```

### Cenários de Erro

```gherkin
DADO que ocorreu erro ao carregar dados
QUANDO o componente ErrorState é exibido
ENTÃO deve mostrar ícone de erro (alert/warning)
  E mensagem descritiva do problema
  E botão "Tentar novamente" que dispara retry
  E ao clicar em retry, deve mostrar loading state
```

```gherkin
DADO que o usuário tem prefers-reduced-motion ativado
QUANDO animações são disparadas
ENTÃO transições complexas devem ser desabilitadas
  E apenas mudanças instantâneas de estado devem ocorrer
  E funcionalidade deve permanecer intacta
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Design Tokens e CSS Variables | 2-3 |
| 2 | Sistema de Animações (variants Framer Motion) | 3-4 |
| 3 | Componentes de Estado (Skeleton, Empty, Error, Success) | 5-6 |
| 4 | Microinterações (botões, cards, feedback) | 4-5 |
| 5 | Aplicação nos Dashboards e Celebrações | 5-6 |

### Detalhamento das Fases

#### Fase 1: Design Tokens e CSS Variables

**Objetivo:** Expandir e organizar os tokens de design no CSS global

**Ações:**
- [ ] Expandir paleta de cores com variantes de intensidade (50-900)
- [ ] Adicionar cores semânticas (info, surface, on-surface)
- [ ] Definir escala de espaçamentos (space-1 a space-16)
- [ ] Definir escala de border-radius (radius-sm, radius-md, radius-lg, radius-xl, radius-full)
- [ ] Refinar sombras (shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl)
- [ ] Adicionar variáveis de timing para animações
- [ ] Documentar tokens em comentários

**Validação:** Variáveis CSS disponíveis e funcionando no tema light e dark

#### Fase 2: Sistema de Animações

**Objetivo:** Criar biblioteca de variants Framer Motion reutilizáveis

**Ações:**
- [ ] Criar arquivo `src/lib/animations.ts` com variants exportáveis
- [ ] Implementar variant `fadeIn` (opacity)
- [ ] Implementar variant `fadeInUp` (opacity + translateY)
- [ ] Implementar variant `fadeInDown` (opacity + translateY negativo)
- [ ] Implementar variant `scaleIn` (opacity + scale)
- [ ] Implementar variant `slideInLeft` / `slideInRight`
- [ ] Implementar `staggerContainer` para listas
- [ ] Implementar hook `useReducedMotion` para acessibilidade
- [ ] Criar componente `PageTransition` com AnimatePresence

**Validação:** Variants funcionando em componente de teste, respeitando prefers-reduced-motion

#### Fase 3: Componentes de Estado

**Objetivo:** Criar componentes padronizados para estados da UI

**Ações:**
- [ ] Criar `src/components/ui/skeleton-card.tsx` com shimmer effect
- [ ] Criar `src/components/ui/skeleton-list.tsx` para listas
- [ ] Criar `src/components/ui/skeleton-table.tsx` para tabelas
- [ ] Criar `src/components/ui/empty-state.tsx` com props configuráveis
- [ ] Criar `src/components/ui/error-state.tsx` com retry callback
- [ ] Criar `src/components/ui/loading-state.tsx` com spinner
- [ ] Criar `src/components/ui/success-state.tsx` com checkmark animado
- [ ] Adicionar keyframes shimmer no CSS global

**Validação:** Componentes renderizando corretamente com todas as variações de props

#### Fase 4: Microinterações

**Objetivo:** Adicionar feedback visual em elementos interativos

**Ações:**
- [ ] Estender Button do shadcn com variants de hover/press/loading
- [ ] Criar `src/components/ui/interactive-card.tsx` com hover reveal
- [ ] Implementar shake animation para erros
- [ ] Criar componente `LoadingButton` com spinner inline
- [ ] Adicionar transições em inputs (focus ring animado)
- [ ] Implementar feedback visual em checkboxes e switches
- [ ] Refinar toasts com animações de entrada/saída

**Validação:** Interações funcionando de forma fluida em 60fps

#### Fase 5: Aplicação e Celebrações

**Objetivo:** Aplicar o design system nos dashboards e adicionar celebrações

**Ações:**
- [ ] Criar `src/components/ui/confetti.tsx` para celebrações
- [ ] Aplicar skeleton loading no Dashboard do Candidato
- [ ] Aplicar skeleton loading no Dashboard da Empresa
- [ ] Aplicar skeleton loading no Dashboard do Admin
- [ ] Aplicar empty states nas listas vazias
- [ ] Integrar confetti na confirmação de candidatura
- [ ] Integrar success state no envio de formulários
- [ ] Aplicar page transitions nas rotas principais
- [ ] Testar e ajustar timings

**Validação:** Experiência visual consistente em toda a aplicação

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 a PRD-021 | Funcionalidades base do RecrutaRS | ✅ Concluído |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Framer Motion | Biblioteca | ✅ Já instalada |
| Tailwind CSS | Framework | ✅ Já instalado |
| shadcn/ui | Componentes | ✅ Já instalado |

### Bibliotecas Adicionais Sugeridas

| Biblioteca | Propósito | Tamanho |
|------------|-----------|---------|
| `canvas-confetti` | Efeito confetti leve | ~3KB gzipped |

> **Nota:** A biblioteca é opcional. É possível implementar confetti com CSS/Canvas puro se preferir evitar dependência.

### Decisões Pendentes

- [ ] Nenhuma decisão pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| N/A | Este PRD não manipula dados sensíveis | N/A |

### Autenticação e Autorização

Este PRD trata apenas de componentes visuais. Não há requisitos de auth específicos.

### Auditoria

Não aplicável para este PRD.

---

## Fluxos de Usuário

### Fluxo: Loading → Conteúdo

```
[Usuário acessa página] 
    ──▶ [Skeleton loading aparece imediatamente]
    ──▶ [Dados carregam (1-3s)]
    ──▶ [Conteúdo substitui skeleton com fade]
    ──▶ [Usuário visualiza conteúdo]
```

### Fluxo: Ação → Feedback → Celebração

```
[Usuário clica "Candidatar-se"]
    ──▶ [Botão entra em loading state]
    ──▶ [Processamento (1-2s)]
    ──▶ [Modal de sucesso com checkmark animado]
    ──▶ [Confetti explosion]
    ──▶ [Toast de confirmação]
```

### Fluxo: Lista Vazia

```
[Usuário acessa "Minhas Candidaturas"]
    ──▶ [Skeleton loading]
    ──▶ [Dados retornam vazio]
    ──▶ [EmptyState aparece com animação]
    ──▶ [Usuário clica "Buscar Vagas"]
    ──▶ [Navegação para página de busca]
```

### Fluxo: Erro e Retry

```
[Usuário acessa página]
    ──▶ [Skeleton loading]
    ──▶ [Erro de rede]
    ──▶ [ErrorState aparece]
    ──▶ [Usuário clica "Tentar novamente"]
    ──▶ [Loading state]
    ──▶ [Sucesso ou novo erro]
```

---

## Wireframes Conceituais

### Skeleton Card de Vaga

```
┌────────────────────────────────────────────────────────┐
│  ┌──────┐  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░               │
│  │▒▒▒▒▒▒│  ░░░░░░░░░░░░░░░░░░                         │
│  │▒▒▒▒▒▒│  ░░░░░░░░░░░░░                              │
│  └──────┘                                              │
│                                                        │
│  ░░░░░░░░  ░░░░░░░░  ░░░░░░░                          │
│                                                        │
│  ░░░░░░░░░░░░░░░░░░░░░░           ░░░░░░░░░░░░       │
└────────────────────────────────────────────────────────┘
  ▲ Logo      ▲ Título/Empresa      ▲ Tags    ▲ Salário/Botão
```

### Empty State

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                      ┌─────────┐                       │
│                      │  📭    │                       │
│                      └─────────┘                       │
│                                                        │
│              Nenhuma candidatura ainda                 │
│                                                        │
│        Explore as vagas disponíveis e comece          │
│           sua jornada profissional                    │
│                                                        │
│                 [ Buscar Vagas ]                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Success State com Checkmark

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                      ╭─────────╮                       │
│                      │    ✓    │  ← Animado           │
│                      ╰─────────╯                       │
│                                                        │
│              Candidatura enviada!                      │
│                                                        │
│       A empresa receberá seu perfil em instantes      │
│                                                        │
│                   [ Ver Minhas Candidaturas ]          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Atualizar o registro de versão no banco de dados (se aplicável)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-000-dgn-design-system-microinteracoes_DONE.md`
> - Atualizar a seção "Status de Implementação" com:
>   - Status: ✅ IMPLEMENTADO
>   - Data de Implementação
>   - Versão do App após implementação
>   - Observações relevantes

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinome sugerido para esta versão:** `Polish` (refinamento visual)

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
| **Não bloquear fluxo principal** | Animações não devem impedir interação do usuário |
| **Fail gracefully** | Se animação falhar, conteúdo deve aparecer sem animação |
| **Preservar performance** | Usar transform/opacity, evitar layout thrashing |
| **Testar incrementalmente** | Validar cada componente antes de integrar |
| **Documentar decisões** | Registrar escolhas de timing, easing, etc. |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Timing de animações** | 100-200ms para feedback, 200-400ms para transições UI |
| **Easing** | Usar `[0.16, 1, 0.3, 1]` (ease-out) para entradas, `[0.4, 0, 0.2, 1]` para saídas |
| **Stagger** | Máximo de 50-80ms entre itens, nunca exceder 500ms total |
| **Skeleton shimmer** | Gradiente de -200% a 200% em 1.5s, ease-in-out |
| **Confetti** | Força 0.6, duração 3s, ~100 partículas, cores da marca |
| **Reduced motion** | Desabilitar tudo exceto opacity transitions |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Animações lineares (sempre usar easing curves) |
| Animar width/height diretamente (usar transform: scale) |
| Stagger muito longo em listas grandes (máx 500ms total) |
| Bloquear interação durante animações (>300ms) |
| Hardcodar cores (usar variáveis CSS) |
| Esquecer de testar prefers-reduced-motion |
| Adicionar dependências pesadas (>50KB gzipped) |
| Animações em elementos não visíveis (performance) |

---

## Referências Técnicas

### Estrutura de Arquivos Sugerida

```
src/
├── lib/
│   └── animations.ts          # Variants Framer Motion
├── hooks/
│   └── useReducedMotion.ts    # Hook de acessibilidade
├── components/
│   └── ui/
│       ├── skeleton-card.tsx
│       ├── skeleton-list.tsx
│       ├── skeleton-table.tsx
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       ├── loading-state.tsx
│       ├── success-state.tsx
│       ├── interactive-card.tsx
│       ├── loading-button.tsx
│       ├── confetti.tsx
│       └── page-transition.tsx
└── index.css                  # Tokens expandidos
```

### Exemplo de Variant (Referência)

```typescript
// Exemplo conceitual - não é código prescritivo
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};
```

### Exemplo de Shimmer (Referência)

```css
/* Exemplo conceitual - não é código prescritivo */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

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
| 15/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
