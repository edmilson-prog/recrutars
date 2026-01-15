# PRD-003-dgn: Mobile-First e Acessibilidade

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar navegação mobile-first com bottom navigation bar e garantir conformidade WCAG 2.1 AA em toda a plataforma |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 10-15 arquivos, mudanças em layout global, auditoria de acessibilidade |

---

## Contexto do Problema

A plataforma RecrutaRS foi desenvolvida com abordagem desktop-first, resultando em experiência subótima em dispositivos móveis. A navegação atual usa sidebar/header tradicional que não se adapta bem a telas pequenas. Estudos mostram que 70%+ dos candidatos acessam plataformas de emprego via smartphone, especialmente em horários de deslocamento.

Adicionalmente, a plataforma não foi auditada para conformidade com WCAG (Web Content Accessibility Guidelines), o que exclui potencialmente 15-20% da população com algum tipo de deficiência visual, motora ou cognitiva. Legislações como a LBI (Lei Brasileira de Inclusão) exigem acessibilidade em plataformas digitais.

A Nielsen Norman Group demonstrou que bottom navigation bar aumenta uso de recursos em 86% comparado a hamburger menu. A RecrutaRS precisa de uma experiência verdadeiramente mobile-first para competir no mercado brasileiro.

---

## Conceito da Solução

### Situação Atual (As-Is)

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTADO ATUAL                                                    │
├─────────────────────────────────────────────────────────────────┤
│ • Navegação por sidebar que colapsa em hamburger no mobile      │
│ • Touch targets menores que 44px em vários lugares              │
│ • Contraste de cores não verificado sistematicamente            │
│ • Sem skip links para navegação por teclado                     │
│ • Formulários sem labels associados corretamente                │
│ • Imagens sem alt text adequado                                 │
│ • Sem suporte a prefers-reduced-motion                          │
│ • Dark mode com contraste insuficiente em alguns elementos      │
└─────────────────────────────────────────────────────────────────┘
```

### Situação Desejada (To-Be)

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTADO DESEJADO                                                 │
├─────────────────────────────────────────────────────────────────┤
│ • Bottom navigation bar com 5 itens principais (mobile)         │
│ • Touch targets mínimo 48x48px em toda a plataforma             │
│ • Contraste WCAG AA (4.5:1 texto, 3:1 UI)                       │
│ • Skip links para conteúdo principal                            │
│ • Formulários 100% acessíveis (labels, erros, hints)            │
│ • Alt text em todas as imagens                                  │
│ • Suporte completo a prefers-reduced-motion                     │
│ • Dark mode com contraste adequado                              │
│ • Navegação por teclado funcional                               │
│ • Landmarks semânticos (main, nav, aside)                       │
│ • Configurações de acessibilidade para usuário                  │
└─────────────────────────────────────────────────────────────────┘
```

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| PWA nativo separado | Duplicação de código, manutenção dobrada |
| Apenas ajustes CSS | Não resolve problemas estruturais de acessibilidade |
| Bottom nav com mais de 5 itens | Pesquisas mostram que >5 itens confunde usuários |

---

## Escopo

### Incluído

- ✅ Bottom Navigation Bar para candidatos (mobile)
- ✅ Bottom Navigation Bar para empresas (mobile)
- ✅ Touch targets mínimo 48x48px em elementos clicáveis
- ✅ Auditoria e correção de contraste de cores
- ✅ Skip links para navegação por teclado
- ✅ Labels e aria-labels em todos os formulários
- ✅ Alt text em todas as imagens
- ✅ Suporte a prefers-reduced-motion
- ✅ Landmarks semânticos (main, nav, aside, footer)
- ✅ Focus states visíveis e consistentes
- ✅ Anúncios para screen readers (aria-live)
- ✅ Painel de configurações de acessibilidade
- ✅ Testes com axe-core/Lighthouse

### Excluído

- ❌ App nativo iOS/Android
- ❌ Suporte a gestos complexos (swipe para ações)
- ❌ Modo offline/PWA completo
- ❌ Notificações push (será PRD separado)
- ❌ Fonte OpenDyslexic (configurável mas não padrão)
- ❌ Traduções para múltiplos idiomas

---

## Requisitos Funcionais

### Bottom Navigation Bar

- **RF-001:** Deve existir componente BottomNav que aparece apenas em viewports mobile (<768px)
- **RF-002:** BottomNav para candidatos deve ter 5 itens: Início, Vagas, Candidaturas, Mensagens, Perfil
- **RF-003:** BottomNav para empresas deve ter 5 itens: Início, Vagas, Candidatos, Mensagens, Perfil
- **RF-004:** Cada item deve ter ícone + label de texto
- **RF-005:** Item ativo deve ter destaque visual (cor, indicador)
- **RF-006:** BottomNav deve ter altura mínima de 56px
- **RF-007:** BottomNav deve ser fixo no bottom da viewport
- **RF-008:** Badge de notificação deve aparecer em itens com pendências
- **RF-009:** BottomNav deve ocultar ao scrollar para baixo (scroll hide)
- **RF-010:** BottomNav deve reaparecer ao scrollar para cima

### Touch Targets

- **RF-011:** Todos os elementos clicáveis devem ter área mínima de 48x48px
- **RF-012:** Espaçamento entre elementos clicáveis deve ser mínimo 8px
- **RF-013:** Botões em mobile devem ocupar largura full quando apropriado
- **RF-014:** Links em texto devem ter área de toque expandida (padding)

### Contraste de Cores

- **RF-015:** Texto normal deve ter contraste mínimo de 4.5:1
- **RF-016:** Texto grande (≥18px bold ou ≥24px regular) deve ter contraste mínimo de 3:1
- **RF-017:** Elementos de UI (bordas, ícones) devem ter contraste mínimo de 3:1
- **RF-018:** Focus indicators devem ter contraste mínimo de 3:1
- **RF-019:** Cores de match score devem manter contraste em ambos os temas

### Navegação por Teclado

- **RF-020:** Deve existir skip link "Pular para conteúdo" no topo de cada página
- **RF-021:** Tab order deve seguir ordem lógica de leitura
- **RF-022:** Focus deve ser visível em todos os elementos interativos
- **RF-023:** Focus trap deve funcionar em modals e dropdowns
- **RF-024:** ESC deve fechar modals e menus abertos
- **RF-025:** Arrow keys devem navegar em menus e selects

### Formulários Acessíveis

- **RF-026:** Todo input deve ter label associado (htmlFor/id ou aria-labelledby)
- **RF-027:** Campos obrigatórios devem ter indicador visual E aria-required
- **RF-028:** Erros de validação devem ser anunciados (aria-describedby + aria-invalid)
- **RF-029:** Hints de campo devem estar associados (aria-describedby)
- **RF-030:** Grupo de radio/checkbox deve usar fieldset + legend

### Imagens e Mídia

- **RF-031:** Todas as imagens informativas devem ter alt text descritivo
- **RF-032:** Imagens decorativas devem ter alt="" ou role="presentation"
- **RF-033:** Logos devem ter alt com nome da empresa/marca
- **RF-034:** Ícones funcionais devem ter aria-label ou texto visível

### Screen Readers

- **RF-035:** Mudanças dinâmicas de conteúdo devem usar aria-live
- **RF-036:** Toasts e notificações devem ser anunciados (aria-live="polite")
- **RF-037:** Erros críticos devem usar aria-live="assertive"
- **RF-038:** Landmarks semânticos devem estar presentes (main, nav, aside)
- **RF-039:** Headings devem seguir hierarquia lógica (h1 > h2 > h3)

### Preferências de Usuário

- **RF-040:** Sistema deve respeitar prefers-reduced-motion
- **RF-041:** Sistema deve respeitar prefers-color-scheme
- **RF-042:** Deve existir painel de configurações de acessibilidade
- **RF-043:** Configurações devem incluir: tamanho de fonte, espaçamento, animações
- **RF-044:** Configurações devem persistir em localStorage

### Painel de Acessibilidade

- **RF-045:** Usuário deve poder aumentar fonte (12px a 24px)
- **RF-046:** Usuário deve poder aumentar espaçamento de linhas (1.2 a 2.0)
- **RF-047:** Usuário deve poder desativar animações
- **RF-048:** Usuário deve poder ativar alto contraste
- **RF-049:** Configurações devem aplicar imediatamente (sem refresh)

---

## Requisitos Não-Funcionais

- **RNF-001 (Acessibilidade):** Score Lighthouse Accessibility ≥ 90
- **RNF-002 (Acessibilidade):** Zero erros críticos no axe-core
- **RNF-003 (Performance):** First Input Delay < 100ms em mobile
- **RNF-004 (Performance):** Bottom nav não deve causar layout shift
- **RNF-005 (UX):** Transições de navegação devem ser suaves (<300ms)
- **RNF-006 (Compatibilidade):** Funcionar em iOS Safari, Android Chrome
- **RNF-007 (Conformidade):** Atender WCAG 2.1 nível AA

---

## Critérios de Aceitação

### RF-001/RF-010: Bottom Navigation

```gherkin
DADO que o candidato está em viewport mobile (<768px)
QUANDO qualquer página da área logada é carregada
ENTÃO deve exibir bottom navigation bar
  E bar deve ter 5 itens: Início, Vagas, Candidaturas, Mensagens, Perfil
  E item da página atual deve estar destacado
  E cada item deve ter ícone + label
```

```gherkin
DADO que o candidato está scrollando uma lista longa
QUANDO scroll é para baixo (conteúdo sobe)
ENTÃO bottom nav deve ocultar suavemente
  E conteúdo deve ocupar espaço liberado
```

```gherkin
DADO que o candidato scrollou para baixo e bottom nav está oculto
QUANDO scroll é para cima (conteúdo desce)
ENTÃO bottom nav deve reaparecer suavemente
  E transição deve ser menor que 300ms
```

### RF-015/RF-019: Contraste

```gherkin
DADO que a página é analisada com ferramenta de contraste
QUANDO verificamos texto sobre background
ENTÃO todo texto normal deve ter contraste ≥ 4.5:1
  E todo texto grande deve ter contraste ≥ 3:1
  E elementos de UI devem ter contraste ≥ 3:1
```

```gherkin
DADO que o usuário está em dark mode
QUANDO visualiza cores de match score
ENTÃO verde (match alto) deve ter contraste ≥ 4.5:1
  E amarelo (match médio) deve ter contraste ≥ 4.5:1
  E vermelho (match baixo) deve ter contraste ≥ 4.5:1
```

### RF-020/RF-025: Navegação por Teclado

```gherkin
DADO que o usuário navega apenas com teclado
QUANDO a página carrega
ENTÃO primeiro Tab deve focar no skip link "Pular para conteúdo"
  E ativar skip link deve mover foco para conteúdo principal
```

```gherkin
DADO que um modal está aberto
QUANDO o usuário pressiona Tab repetidamente
ENTÃO foco deve permanecer dentro do modal (focus trap)
  E pressionar ESC deve fechar o modal
  E foco deve retornar ao elemento que abriu o modal
```

### RF-026/RF-030: Formulários

```gherkin
DADO que screen reader está ativo
QUANDO usuário foca em campo de formulário
ENTÃO label do campo deve ser anunciado
  E se obrigatório, deve anunciar "obrigatório"
  E se houver hint, deve anunciar o hint
```

```gherkin
DADO que usuário submete formulário com erros
QUANDO validação falha
ENTÃO erros devem ser anunciados pelo screen reader
  E campos com erro devem ter aria-invalid="true"
  E foco deve mover para primeiro campo com erro
```

### RF-042/RF-049: Painel de Acessibilidade

```gherkin
DADO que usuário abre configurações de acessibilidade
QUANDO aumenta tamanho da fonte para 20px
ENTÃO toda a interface deve atualizar imediatamente
  E novo tamanho deve persistir ao navegar entre páginas
  E novo tamanho deve persistir ao recarregar
```

```gherkin
DADO que usuário tem prefers-reduced-motion no sistema
QUANDO acessa a plataforma
ENTÃO animações devem ser desativadas automaticamente
  E transições devem ser instantâneas ou muito curtas
```

### Cenários de Erro e Edge Cases

```gherkin
DADO que dispositivo é muito estreito (<320px)
QUANDO bottom nav renderiza
ENTÃO deve manter usabilidade (labels podem truncar)
  E touch targets devem permanecer ≥ 48px
```

```gherkin
DADO que navegador não suporta CSS custom properties
QUANDO configurações de acessibilidade são alteradas
ENTÃO deve aplicar fallback via classes CSS
  E funcionalidade básica deve ser mantida
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Bottom Navigation Bar | 4-5 |
| 2 | Touch Targets e Layout Mobile | 3-4 |
| 3 | Auditoria e Correções de Acessibilidade | 8-10 |
| 4 | Painel de Configurações e Testes | 3-4 |

### Detalhamento das Fases

#### Fase 1: Bottom Navigation Bar

**Objetivo:** Implementar navegação mobile-first

**Ações:**
- [ ] Criar `src/components/navigation/BottomNav.tsx`
- [ ] Criar `src/components/navigation/BottomNavItem.tsx`
- [ ] Implementar detecção de viewport (useMediaQuery ou similar)
- [ ] Implementar scroll hide/show behavior
- [ ] Criar variante para área de candidato
- [ ] Criar variante para área de empresa
- [ ] Adicionar badges de notificação
- [ ] Testar em iOS Safari e Android Chrome

**Validação:** Bottom nav aparecendo em mobile, ocultando em scroll

#### Fase 2: Touch Targets e Layout Mobile

**Objetivo:** Garantir usabilidade touch em toda a plataforma

**Ações:**
- [ ] Auditar todos os botões e links
- [ ] Criar classe utilitária `touch-target` (min 48x48px)
- [ ] Ajustar padding em links de texto
- [ ] Ajustar espaçamento entre elementos clicáveis
- [ ] Revisar formulários para mobile
- [ ] Testar com ferramenta de touch target

**Validação:** Nenhum elemento clicável < 48x48px

#### Fase 3: Auditoria e Correções de Acessibilidade

**Objetivo:** Conformidade WCAG 2.1 AA

**Ações:**
- [ ] Rodar axe-core em todas as páginas
- [ ] Corrigir erros de contraste identificados
- [ ] Adicionar skip links em todas as páginas
- [ ] Revisar e corrigir labels de formulários
- [ ] Adicionar alt text em todas as imagens
- [ ] Implementar focus states consistentes
- [ ] Adicionar landmarks semânticos (main, nav, aside)
- [ ] Revisar hierarquia de headings
- [ ] Implementar aria-live para notificações
- [ ] Testar navegação completa por teclado

**Validação:** Lighthouse Accessibility ≥ 90, zero erros críticos axe

#### Fase 4: Painel de Configurações e Testes

**Objetivo:** Preferências de usuário e validação final

**Ações:**
- [ ] Criar `src/components/accessibility/AccessibilityPanel.tsx`
- [ ] Implementar controle de tamanho de fonte
- [ ] Implementar controle de espaçamento
- [ ] Implementar toggle de animações
- [ ] Implementar hook useAccessibilityPrefs()
- [ ] Persistir em localStorage
- [ ] Documentar conformidade
- [ ] Testar com screen reader (NVDA/VoiceOver)

**Validação:** Configurações funcionando, persistindo, documentação completa

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-000-dgn | Design System (tokens de cor, focus states) | ⏳ Pendente |

### Bibliotecas Necessárias

| Biblioteca | Uso | Status |
|------------|-----|--------|
| framer-motion | Animações de bottom nav | ✅ Disponível |
| lucide-react | Ícones de navegação | ✅ Disponível |
| @axe-core/react | Auditoria de acessibilidade em dev | ⏳ A instalar (devDep) |

### Decisões Pendentes

- [ ] Nenhuma decisão pendente identificada

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Preferências de acessibilidade | Preferências de usuário | localStorage (não sensível) |

### Autenticação e Autorização

Este PRD não altera requisitos de autenticação.

### Auditoria

Não há requisitos de auditoria para funcionalidades de acessibilidade.

---

## Fluxos de Usuário

### Fluxo: Navegação Mobile (Candidato)

```
[Candidato abre app em smartphone]
    ──▶ [Dashboard carrega com bottom nav]
    ──▶ [Toca em "Vagas"]
    ──▶ [Navega para listagem de vagas]
    ──▶ [Scrolla lista para baixo]
    ──▶ [Bottom nav oculta (mais espaço)]
    ──▶ [Scrolla para cima]
    ──▶ [Bottom nav reaparece]
```

### Fluxo: Navegação por Teclado

```
[Usuário abre página com teclado]
    ──▶ [Tab 1: Skip link "Pular para conteúdo"]
    ──▶ [Enter: Pula para main content]
    ──▶ [Tab: Navega por elementos interativos]
    ──▶ [Enter/Space: Ativa elemento focado]
    ──▶ [Shift+Tab: Volta para elemento anterior]
```

### Fluxo: Configuração de Acessibilidade

```
[Usuário abre configurações]
    ──▶ [Acessa painel de acessibilidade]
    ──▶ [Aumenta fonte para 18px]
    ──▶ [Aumenta espaçamento para 1.5]
    ──▶ [Desativa animações]
    ──▶ [Mudanças aplicam imediatamente]
    ──▶ [Fecha configurações]
    ──▶ [Navega para outra página]
    ──▶ [Configurações persistem]
```

---

## Mockups Conceituais

### Bottom Navigation Bar

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONTEÚDO DA PÁGINA                       │
│                                                                 │
│                              ...                                │
│                                                                 │
│                              ...                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │   🏠        🔍        📄         💬        👤              │ │
│ │  Início    Vagas   Candidat.  Mensagens   Perfil           │ │
│ │            [●]                  (3)                         │ │
│ │                                                             │ │
│ │   ↑ badge de "ativo"           ↑ badge de notificação       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                         56px altura mínima                      │
└─────────────────────────────────────────────────────────────────┘
```

### Skip Link

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  [Pular para conteúdo]  ← Visível apenas quando focado      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ HEADER / NAVEGAÇÃO                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ <main id="main-content">  ← Alvo do skip link             │  │
│  │                                                           │  │
│  │    CONTEÚDO PRINCIPAL                                     │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Painel de Acessibilidade

```
┌─────────────────────────────────────────────────────────────────┐
│ Configurações de Acessibilidade                           [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Tamanho da Fonte                                              │
│   ├──────────────●────────────────┤                             │
│   12px                          24px                            │
│   Atual: 16px                                                   │
│                                                                 │
│   Espaçamento de Linhas                                         │
│   ├────────●──────────────────────┤                             │
│   1.2                            2.0                            │
│   Atual: 1.5                                                    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [✓] Reduzir animações                                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [ ] Alto contraste                                      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                           [Restaurar Padrões]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Focus States

```
┌─────────────────────────────────────────────────────────────────┐
│ Focus States - Consistentes em toda a plataforma                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ESTADO NORMAL           ESTADO FOCADO                         │
│                                                                 │
│   ┌──────────────┐        ┌──────────────┐                      │
│   │    Botão     │        │░░░░Botão░░░░░│  ← ring-2 ring-primary│
│   └──────────────┘        └──────────────┘    ring-offset-2     │
│                                                                 │
│   [ input text  ]         [░input text░░]  ← ring visible       │
│                                                                 │
│   Link normal             Link focado       ← outline visible   │
│                           ‾‾‾‾‾‾‾‾‾‾‾                          │
│                                                                 │
│   Consistência: todos usam ring-2 ring-primary ring-offset-2    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist de Acessibilidade (Referência)

### Perceptível

- [ ] Todo conteúdo não-textual tem alternativa textual
- [ ] Vídeos têm legendas (se aplicável)
- [ ] Conteúdo pode ser apresentado de diferentes formas
- [ ] Conteúdo é distinguível (contraste, redimensionamento)

### Operável

- [ ] Toda funcionalidade disponível por teclado
- [ ] Usuários têm tempo suficiente para ler/usar
- [ ] Conteúdo não causa convulsões (sem flashes)
- [ ] Usuários podem navegar e encontrar conteúdo

### Compreensível

- [ ] Texto é legível e compreensível
- [ ] Páginas aparecem e operam de forma previsível
- [ ] Usuários são ajudados a evitar e corrigir erros

### Robusto

- [ ] Compatibilidade com tecnologias assistivas
- [ ] Parsing válido do HTML
- [ ] Nome, função e valor disponíveis para componentes UI

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
>   Ex: `PRD-003-dgn-mobile-first-acessibilidade_DONE.md`
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

**Codinome sugerido:** `Access` (representa acessibilidade e acesso mobile)

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
| **Mobile-first** | Começar pelo mobile, expandir para desktop |
| **Inclusão** | Nenhum usuário deve ser excluído por limitação |
| **Teste com ferramentas** | Usar axe-core e Lighthouse sistematicamente |
| **Touch-friendly** | Pensar em dedos, não em cursores |
| **Semântica** | HTML semântico é a base da acessibilidade |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Touch targets** | Mínimo 48x48px, ideal 56x56px para ações primárias |
| **Bottom nav** | Usar position: fixed com safe-area-inset-bottom |
| **Skip link** | Visível apenas quando focado (sr-only + focus:not-sr-only) |
| **Focus ring** | Usar ring-2 ring-primary ring-offset-2 consistentemente |
| **Contraste** | Verificar com ferramenta antes de commitar |
| **Screen reader** | Testar com NVDA (Windows) ou VoiceOver (Mac) |
| **Axe-core** | Instalar @axe-core/react como devDependency |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Touch targets menores que 44px |
| Esconder skip link permanentemente |
| Confiar apenas em cor para transmitir informação |
| Remover focus outline sem substituir por outro indicador |
| Usar tabindex > 0 (altera ordem natural) |
| Ignorar prefers-reduced-motion |
| Formulários sem labels associados |
| Imagens sem alt (ou decorativas sem alt="") |
| Bottom nav com mais de 5 itens |
| Animações de mais de 300ms em transições de navegação |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 2026-01-15 |
| **Versão do App** | 0.33.0 |
| **Implementado por** | Claude Opus 4.5 via Claude Code |
| **Lighthouse Score** | Pendente auditoria |
| **Observações** | Todas as 4 fases implementadas: Bottom Nav, Touch Targets, Acessibilidade, Painel de Preferências |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 15/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
