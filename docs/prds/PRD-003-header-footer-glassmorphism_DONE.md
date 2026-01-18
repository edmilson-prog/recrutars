# PRD-003: Header e Footer com Glassmorphism

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar Header e Footer com efeito glassmorphism em toda a plataforma |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | 2-5 arquivos, afeta múltiplos layouts, componentes reutilizáveis |

---

## Contexto do Problema

A plataforma RecrutaRS precisa de uma identidade visual consistente e moderna. Atualmente:

- O layout das áreas logadas (DashboardLayout) não possui footer
- As páginas públicas têm estrutura diferente das áreas logadas
- Não há elemento visual que identifique a marca AILA de forma persistente
- A versão do app não está visível para o usuário

A implementação de Header e Footer com efeito glassmorphism trará:
- Identidade visual moderna e sofisticada
- Consistência entre todas as áreas da plataforma
- Visibilidade da marca AILA e versão do sistema
- Melhor experiência de navegação

---

## Conceito da Solução

### Situação Atual (As-Is)

**Áreas logadas (DashboardLayout):**
```
┌────────────────────────────────────────────────┐
│  Sidebar  │        Header (existente)          │
│           ├────────────────────────────────────┤
│           │                                    │
│           │        Conteúdo da Página          │
│           │                                    │
│           │                                    │
└───────────┴────────────────────────────────────┘
        Sem footer, header sem glassmorphism
```

**Páginas públicas:**
```
┌────────────────────────────────────────────────┐
│              Navbar (variado)                  │
├────────────────────────────────────────────────┤
│                                                │
│           Conteúdo da Página                   │
│                                                │
├────────────────────────────────────────────────┤
│              Footer (variado)                  │
└────────────────────────────────────────────────┘
        Estrutura inconsistente
```

### Situação Desejada (To-Be)

**Todas as páginas:**
```
┌────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░ HEADER ░░░░░░░░░░░░░░░░░░░░░░░  │  ← glassmorphism
├────────────────────────────────────────────────┤
│                                                │
│           Conteúdo da Página                   │
│           (scroll independente)                │
│                                                │
├────────────────────────────────────────────────┤
│  ░░░░░░░░░░░ AILA · v0.2.0 ░░░░░░░░░░░░░░░░░░  │  ← glassmorphism (sticky)
└────────────────────────────────────────────────┘
        Header e Footer consistentes, footer sempre visível
```

### Efeito Glassmorphism — Especificação Visual

| Propriedade | Valor |
|-------------|-------|
| Background | `rgba(255, 255, 255, 0.7)` (light) ou `rgba(0, 0, 0, 0.7)` (dark) |
| Backdrop Filter | `blur(10px)` |
| Border | `1px solid rgba(255, 255, 255, 0.2)` |
| Box Shadow | `0 4px 30px rgba(0, 0, 0, 0.1)` |

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Footer no final do scroll | Versão e marca não estariam sempre visíveis |
| Apenas nas áreas logadas | Inconsistência visual entre público e privado |
| Sem glassmorphism | Design menos moderno, sem diferencial visual |

---

## Escopo

### Incluído

- ✅ Componente `GlassHeader` com efeito glassmorphism
- ✅ Componente `GlassFooter` com efeito glassmorphism + "AILA · vX.X.X"
- ✅ Versão dinâmica do app (constante ou do package.json)
- ✅ Aplicar no `DashboardLayout` (Admin, Empresa, Candidato)
- ✅ Aplicar nas páginas públicas (Landing, Login, Register, etc.)
- ✅ Footer sticky (sempre visível no bottom)
- ✅ Design responsivo (mobile e desktop)
- ✅ Manter conteúdo atual do header (logo, menu, avatar, etc.)

### Excluído

- ❌ Mudança de cores/tema geral da plataforma
- ❌ Redesign do conteúdo interno do header
- ❌ Alteração de funcionalidades existentes
- ❌ Dark mode (pode ser PRD futuro)

---

## Requisitos Funcionais

### Header

- **RF-001:** O Header deve aplicar efeito glassmorphism (blur, transparência, borda sutil)
- **RF-002:** O Header deve manter todo o conteúdo atual (logo, navegação, avatar, etc.)
- **RF-003:** O Header deve ser fixo no topo da página (sticky top)
- **RF-004:** O Header deve ser responsivo, adaptando-se a mobile e desktop

### Footer

- **RF-005:** O Footer deve aplicar efeito glassmorphism (blur, transparência, borda sutil)
- **RF-006:** O Footer deve exibir "AILA" como identificação da marca
- **RF-007:** O Footer deve exibir a versão atual do app (ex: "v0.2.0")
- **RF-008:** O Footer deve ser fixo no bottom da página (sticky bottom), sempre visível
- **RF-009:** O Footer deve ser responsivo, adaptando-se a mobile e desktop
- **RF-010:** O formato do Footer deve ser: "AILA · vX.X.X" (com separador)

### Layout Geral

- **RF-011:** O conteúdo da página deve ter scroll independente entre Header e Footer
- **RF-012:** O conteúdo não deve ficar escondido atrás do Header ou Footer (padding adequado)
- **RF-013:** O efeito glassmorphism deve ser consistente entre Header e Footer

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O backdrop-filter não deve causar lag perceptível no scroll
- **RNF-002 (Compatibilidade):** Deve funcionar em Chrome, Firefox, Safari, Edge (versões modernas)
- **RNF-003 (Fallback):** Em navegadores sem suporte a backdrop-filter, usar background sólido
- **RNF-004 (Acessibilidade):** Contraste de texto deve atender WCAG AA
- **RNF-005 (Responsividade):** Funcionar de 320px a 1920px de largura

---

## Critérios de Aceitação

### RF-001/RF-005: Efeito Glassmorphism

```gherkin
DADO que o usuário está em qualquer página da plataforma
QUANDO a página é carregada
ENTÃO o Header deve ter efeito de vidro fosco (blur + transparência)
  E o Footer deve ter efeito de vidro fosco (blur + transparência)
  E ambos devem ter borda sutil e sombra suave
```

### RF-006/RF-007/RF-010: Conteúdo do Footer

```gherkin
DADO que o usuário está em qualquer página
QUANDO visualiza o Footer
ENTÃO deve ver o texto "AILA · vX.X.X"
  E a versão deve corresponder à versão atual do app
  E o texto deve estar centralizado
```

### RF-008: Footer Sticky

```gherkin
DADO que o usuário está em uma página com conteúdo longo
QUANDO ele faz scroll para baixo
ENTÃO o Footer deve permanecer visível no bottom da tela
  E o conteúdo deve passar por baixo do Footer (com blur visível)
```

### RF-003: Header Sticky

```gherkin
DADO que o usuário está em uma página com conteúdo longo
QUANDO ele faz scroll para baixo
ENTÃO o Header deve permanecer visível no topo da tela
  E o conteúdo deve passar por baixo do Header (com blur visível)
```

### RF-012: Conteúdo Não Escondido

```gherkin
DADO que a página tem Header e Footer fixos
QUANDO o conteúdo é renderizado
ENTÃO nenhuma parte do conteúdo deve ficar escondida atrás do Header
  E nenhuma parte do conteúdo deve ficar escondida atrás do Footer
  E deve haver padding/margin adequado
```

### RF-004/RF-009: Responsividade

```gherkin
DADO que o usuário acessa pelo celular (viewport 375px)
QUANDO a página é carregada
ENTÃO o Header deve adaptar-se à largura da tela
  E o Footer deve adaptar-se à largura da tela
  E o texto "AILA · vX.X.X" deve permanecer legível
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Análise e criação dos estilos base | 1 |
| 2 | Criar componentes GlassHeader e GlassFooter | 2 |
| 3 | Integrar no DashboardLayout | 1 |
| 4 | Integrar nas páginas públicas e validar | 2-3 |

### Detalhamento das Fases

#### Fase 1: Estilos Base

**Objetivo:** Criar classes CSS/Tailwind para o efeito glassmorphism

**Ações:**
- [ ] Analisar estrutura atual de estilos (Tailwind config, globals.css)
- [ ] Criar classes utilitárias para glassmorphism (se necessário)
- [ ] Definir variáveis de cor para transparência
- [ ] Testar efeito isoladamente

**Validação:** Classes de glassmorphism funcionando em elemento de teste

#### Fase 2: Componentes

**Objetivo:** Criar os componentes reutilizáveis

**Ações:**
- [ ] Criar `src/components/layout/GlassHeader.tsx`
- [ ] Criar `src/components/layout/GlassFooter.tsx`
- [ ] Implementar versão dinâmica no Footer (constante APP_VERSION)
- [ ] Garantir tipagem TypeScript correta
- [ ] Testar componentes isoladamente

**Validação:** Componentes renderizam corretamente com efeito visual

#### Fase 3: Integração — Áreas Logadas

**Objetivo:** Aplicar no DashboardLayout

**Ações:**
- [ ] Modificar `src/components/layout/DashboardLayout.tsx`
- [ ] Substituir/envolver Header existente com GlassHeader
- [ ] Adicionar GlassFooter ao layout
- [ ] Ajustar padding do conteúdo para não ficar escondido
- [ ] Testar em todas as áreas (Admin, Empresa, Candidato)

**Validação:** Layout funciona corretamente em todas as áreas logadas

#### Fase 4: Integração — Páginas Públicas

**Objetivo:** Aplicar nas páginas públicas e validação final

**Ações:**
- [ ] Criar layout wrapper para páginas públicas (se não existir)
- [ ] Aplicar GlassHeader e GlassFooter nas páginas: Landing, Login, Register, HowItWorks, Plans
- [ ] Testar responsividade em todas as páginas
- [ ] Verificar fallback em navegadores sem backdrop-filter
- [ ] Validar todos os critérios de aceitação

**Validação:** Todas as páginas com design consistente e responsivo

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-001 | Remover referências Lovable | ✅ Implementado |
| PRD-002 | Proteção e Correção de Rotas | ✅ Implementado |

### Serviços Externos

Nenhum.

### Decisões Pendentes

Nenhuma — escopo definido.

---

## Considerações de Segurança

Não aplicável — PRD puramente visual/UI.

---

## Fluxos de Usuário

### Fluxo: Navegação com Header/Footer Fixos

```
[Usuário] ──▶ [Acessa qualquer página]
                    │
                    ▼
         ┌─────────────────────┐
         │  Header (sticky)    │ ← sempre visível
         ├─────────────────────┤
         │                     │
         │  Conteúdo (scroll)  │ ← usuário faz scroll
         │                     │
         ├─────────────────────┤
         │  Footer (sticky)    │ ← sempre visível
         │  AILA · v0.3.0      │
         └─────────────────────┘
```

---

## Especificação Visual

### Estrutura do Footer

```
┌────────────────────────────────────────────────────────────┐
│                      AILA · v0.3.0                         │
└────────────────────────────────────────────────────────────┘
                         ▲
                    Texto centralizado
                    Fonte: atual do sistema
                    Tamanho: text-sm (14px)
                    Cor: text-muted-foreground
```

### Classes Tailwind Sugeridas (Referência)

```css
/* Glassmorphism base */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

/* Header */
.glass-header {
  @apply glass fixed top-0 left-0 right-0 z-50;
}

/* Footer */
.glass-footer {
  @apply glass fixed bottom-0 left-0 right-0 z-50;
}
```

> **Nota:** Esta é apenas referência. O desenvolvedor deve avaliar a melhor implementação com Tailwind/CSS.

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/) — **MINOR +1** (0.2.0 → 0.3.0)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Criar constante APP_VERSION que será exibida no Footer
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-003-header-footer-glassmorphism_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 0.2.0 → 0.2.1 |
| **Nova funcionalidade** | **MINOR +1, PATCH = 0** | **0.2.0 → 0.3.0** |
| Mudança incompatível | MAJOR +1, outros = 0 | 0.3.0 → 1.0.0 |

🔗 Referência: https://semver.org/

### Guia de Changelog (Keep a Changelog)

```markdown
## [0.3.0] - 2026-01-XX

### Added
- Header com efeito glassmorphism em todas as páginas
- Footer com efeito glassmorphism exibindo "AILA · vX.X.X"
- Constante APP_VERSION para controle de versão visível
- Suporte a fallback para navegadores sem backdrop-filter

### Changed
- DashboardLayout atualizado com novos Header e Footer
- Páginas públicas agora usam layout consistente com áreas logadas
```

🔗 Referência: https://keepachangelog.com/en/1.1.0/

### Princípios de Implementação

| Princípio | Descrição |
|-----------|-----------|
| **Não bloquear fluxo principal** | Efeito visual não deve impactar performance |
| **Fail gracefully** | Se backdrop-filter não funcionar, usar fallback sólido |
| **Preservar existente** | Manter conteúdo atual do header intacto |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar decisões técnicas tomadas durante implementação |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Localização** | `src/components/layout/GlassHeader.tsx` e `GlassFooter.tsx` |
| **Versão** | Criar `src/constants/app.ts` com `export const APP_VERSION = "0.3.0"` |
| **Z-index** | Header e Footer devem ter z-index alto (z-50) |
| **Padding** | Ajustar padding-top e padding-bottom do conteúdo |
| **Tailwind** | Preferir classes Tailwind, CSS custom só se necessário |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Alterar conteúdo/funcionalidade do header atual |
| Remover elementos existentes da navegação |
| Usar JavaScript para efeito de blur (deve ser CSS) |
| Criar animações pesadas que impactem performance |
| Ignorar fallback para navegadores antigos |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ IMPLEMENTADO |
| **Data de Implementação** | 10/01/2026 |
| **Versão do App** | 0.3.0 |
| **Implementado por** | Agente Desenvolvedor (Claude Opus 4.5) |
| **Observações** | Implementação completa conforme especificação |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 10/01/2026 | v1 | Criação inicial |
| 10/01/2026 | v2 | Implementação concluída |

---

**AILA - Sistemas Inteligentes**
