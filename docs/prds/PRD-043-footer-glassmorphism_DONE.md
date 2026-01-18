# PRD-043: Footer Fixo com Glassmorphism (Áreas Autenticadas)

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-dgn-000` | Design System — Microinterações |
| `PRD-dgn-001` | Design System — Gamificação |

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Frontend (Todos os Painéis) |
| **Repositório** | github.com/aila-sistemas/recrutars |
| **Objetivo** | Implementar footer fixo com efeito Glassmorphism exibindo versão do app e nome da empresa, visível apenas nas áreas autenticadas (candidato, empresa, admin) |
| **Tipo** | Feature |
| **Complexidade** | Baixa |
| **Total de Fases** | 2 |
| **Prioridade** | Média |
| **Épico** | UI/UX — Identidade Visual |
| **PRDs Relacionados** | PRD-dgn-000, PRD-dgn-001 |
| **Padrão de código** | camelCase para componentes React |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** ✅ | 1-2 arquivos, sem dependências externas, componente isolado |

---

## Contexto do Problema

Atualmente, os painéis autenticados do RecrutaRS (candidato, empresa e admin) não possuem um footer padrão que reforce a identidade visual da plataforma e exiba informações básicas como versão do sistema.

A ausência de um footer consistente nas áreas logadas cria uma experiência visual incompleta e dificulta a identificação rápida da versão do app em uso — informação útil para suporte técnico e rastreabilidade.

Este PRD implementa um footer minimalista com efeito Glassmorphism (vidro fosco), seguindo tendências modernas de UI, que aparece **exclusivamente nas áreas autenticadas**, mantendo a landing page (área pública) inalterada.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Painéis autenticados não possuem footer
- Não há indicação visual da versão do app nas telas
- Landing page não possui footer (e deve permanecer assim)

### Situação Desejada (To-Be)

- Footer fixo com Glassmorphism visível em todos os painéis autenticados
- Exibe apenas: versão do app + "AILA Sistemas Inteligentes"
- Landing page continua sem footer
- Design responsivo e elegante

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Footer sólido (sem transparência) | Não segue a estética moderna do projeto |
| Footer com múltiplos links | Excesso de informação; objetivo é minimalismo |
| Footer apenas no admin | Inconsistência visual entre painéis |

---

## Escopo

### Incluído

- ✅ Componente `<GlassFooter />` reutilizável
- ✅ Efeito Glassmorphism (blur, transparência, borda sutil)
- ✅ Exibição da versão do app (dinâmica)
- ✅ Exibição do texto "AILA Sistemas Inteligentes"
- ✅ Posição fixa no rodapé da viewport
- ✅ Responsividade (mobile e desktop)
- ✅ Integração nos layouts de: Candidato, Empresa, Admin

### Excluído

- ❌ Footer na landing page (área pública)
- ❌ Links de navegação no footer
- ❌ Ícones de redes sociais
- ❌ Formulário de contato ou newsletter

---

## Requisitos Funcionais

### Componente GlassFooter

- **RF-001:** O componente deve exibir a versão atual do app no formato `vX.Y.Z` alinhada à esquerda
- **RF-002:** O componente deve exibir o texto "AILA Sistemas Inteligentes" alinhado à direita
- **RF-003:** O componente deve ter posição fixa (`fixed`) no rodapé da tela
- **RF-004:** O componente deve aplicar efeito Glassmorphism com as seguintes características:
  - Fundo semi-transparente (blur de backdrop)
  - Borda superior sutil (1px, cor clara com baixa opacidade)
  - Sombra suave superior

### Integração nos Layouts

- **RF-005:** O footer deve ser renderizado nos layouts autenticados: `/candidato/*`, `/empresa/*`, `/admin/*`
- **RF-006:** O footer NÃO deve ser renderizado na landing page (`/`) e rotas públicas
- **RF-007:** O conteúdo das páginas deve ter padding-bottom suficiente para não ser coberto pelo footer

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** O efeito de blur não deve impactar performance em dispositivos móveis de entrada
- **RNF-002 (Acessibilidade):** Contraste mínimo de 4.5:1 entre texto e fundo para leitura
- **RNF-003 (Compatibilidade):** Funcionar em Chrome, Firefox, Safari, Edge (versões recentes)
- **RNF-004 (Responsividade):** Adaptar-se a telas de 320px a 1920px+

---

## Critérios de Aceitação

### RF-001/RF-002: Conteúdo do Footer

```gherkin
DADO que o usuário está autenticado em qualquer painel
QUANDO a página é carregada
ENTÃO o footer deve exibir a versão do app à esquerda (ex: "v1.2.0")
  E o texto "AILA Sistemas Inteligentes" à direita
```

### RF-003/RF-004: Efeito Visual

```gherkin
DADO que o footer está visível
QUANDO o usuário visualiza a interface
ENTÃO o footer deve ter fundo semi-transparente com efeito blur
  E deve ter borda superior sutil
  E deve permanecer fixo ao rolar a página
```

### RF-005/RF-006: Visibilidade Condicional

```gherkin
DADO que o usuário está na landing page (área pública)
QUANDO a página é carregada
ENTÃO o footer NÃO deve ser exibido

DADO que o usuário está logado no painel do candidato
QUANDO a página é carregada
ENTÃO o footer DEVE ser exibido

DADO que o usuário está logado no painel da empresa
QUANDO a página é carregada
ENTÃO o footer DEVE ser exibido

DADO que o usuário está logado no painel do admin
QUANDO a página é carregada
ENTÃO o footer DEVE ser exibido
```

### RF-007: Espaçamento do Conteúdo

```gherkin
DADO que uma página autenticada possui conteúdo extenso
QUANDO o usuário rola até o final da página
ENTÃO o conteúdo final não deve ser coberto pelo footer
  E deve haver espaçamento adequado (padding-bottom)
```

---

## Especificação Visual

### Dimensões

| Propriedade | Valor |
|-------------|-------|
| Altura | 48px (desktop) / 40px (mobile) |
| Largura | 100% da viewport |
| Padding horizontal | 24px (desktop) / 16px (mobile) |

### Efeito Glassmorphism

| Propriedade CSS | Valor Sugerido |
|-----------------|----------------|
| `background` | `rgba(255, 255, 255, 0.1)` ou `rgba(0, 0, 0, 0.2)` (dark mode) |
| `backdrop-filter` | `blur(12px)` |
| `border-top` | `1px solid rgba(255, 255, 255, 0.2)` |
| `box-shadow` | `0 -4px 30px rgba(0, 0, 0, 0.1)` |

### Tipografia

| Elemento | Especificação |
|----------|---------------|
| Versão | Font-size: 12px, Font-weight: 500, Cor: texto secundário |
| Nome da empresa | Font-size: 12px, Font-weight: 400, Cor: texto secundário |

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  v1.2.0                              AILA Sistemas Inteligentes  │
└─────────────────────────────────────────────────────────────┘
     ↑                                           ↑
  Esquerda                                    Direita
  (versão)                                   (empresa)
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Criar componente GlassFooter | 1-2 |
| 2 | Integrar nos layouts autenticados | 3-4 |

### Detalhamento das Fases

#### Fase 1: Componente GlassFooter

**Objetivo:** Criar o componente reutilizável com efeito Glassmorphism

**Ações:**
- [ ] Criar componente `GlassFooter.tsx` em `/components/ui/` ou `/components/layout/`
- [ ] Implementar estilos com Tailwind CSS ou styled-components
- [ ] Obter versão do app dinamicamente (de `package.json` ou variável de ambiente)
- [ ] Garantir responsividade

**Validação:** Componente renderiza corretamente em isolamento com efeito visual correto

#### Fase 2: Integração nos Layouts

**Objetivo:** Adicionar o footer nos layouts autenticados

**Ações:**
- [ ] Identificar os arquivos de layout de cada painel (candidato, empresa, admin)
- [ ] Importar e adicionar `<GlassFooter />` nos layouts autenticados
- [ ] Adicionar padding-bottom nas áreas de conteúdo para evitar sobreposição
- [ ] Verificar que a landing page NÃO inclui o footer

**Validação:** Footer visível apenas nas áreas autenticadas, sem sobreposição de conteúdo

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-dgn-000 | Design System — Microinterações | ✅ Referência |

### Serviços Externos

Nenhum serviço externo necessário.

### Decisões Pendentes

- [ ] Confirmar se há dark mode no projeto e ajustar cores do Glassmorphism

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Versão do app | Público | Nenhuma necessária |

### Autenticação e Autorização

O componente não manipula dados sensíveis. A visibilidade é controlada pela estrutura de rotas/layouts.

### Auditoria

Não aplicável para este componente.

---

## Fluxos de Usuário

### Fluxo Principal (Happy Path)

```
[Usuário Logado] ──▶ [Acessa Painel] ──▶ [Footer Visível com Glassmorphism]
```

### Fluxo Público (Sem Footer)

```
[Visitante] ──▶ [Acessa Landing Page] ──▶ [Footer NÃO Visível]
```

---

## Mockup Conceitual

### Desktop (Painel Autenticado)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                      [CONTEÚDO DO PAINEL]                           │
│                                                                     │
│                                                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░░░░ GLASSMORPHISM ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ v1.2.0                                    AILA Sistemas Inteligentes │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile

```
┌─────────────────────────┐
│                         │
│  [CONTEÚDO DO PAINEL]   │
│                         │
│                         │
├─────────────────────────┤
│ ░░░ GLASSMORPHISM ░░░░░ │
│ v1.2.0    AILA Sistemas │
└─────────────────────────┘
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
>   Ex: `PRD-043-footer-glassmorphism_DONE.md`
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

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças.

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
| **Não bloquear fluxo principal** | Footer é elemento decorativo, não deve impactar funcionalidade |
| **Fail gracefully** | Se versão não carregar, exibir fallback (ex: "v-.-.-") |
| **Testar incrementalmente** | Validar componente isolado antes de integrar |
| **Documentar decisões** | Registrar escolhas de implementação do Glassmorphism |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **CSS** | Preferir Tailwind CSS se já utilizado no projeto; fallback para CSS modules |
| **Versão dinâmica** | Buscar de `process.env.NEXT_PUBLIC_APP_VERSION` ou `package.json` |
| **Z-index** | Garantir que footer fique acima do conteúdo mas abaixo de modais |
| **Dark mode** | Se existir, ajustar opacidade/cores do Glassmorphism |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Adicionar o footer na landing page ou rotas públicas |
| Incluir links ou elementos interativos além do texto |
| Usar blur excessivo que prejudique performance mobile |
| Hardcodar a versão do app — deve ser dinâmica |
| Esquecer o padding-bottom nas páginas para evitar sobreposição |

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
| 18/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
