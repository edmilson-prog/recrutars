# PRD-029: Tema e Fonte

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Implementar escolha de tema (dark/light) e trocar fonte para Roboto Mono |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 3 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** | CSS global, variáveis de tema, persistência, componentes de toggle |

---

## Contexto do Problema

A plataforma atualmente só tem modo claro. Muitos usuários preferem modo escuro, especialmente para uso noturno ou por preferência visual. Além disso, a fonte atual será substituída por "Roboto Mono" para uma identidade visual mais moderna e técnica.

---

## Conceito da Solução

### Toggle de Tema

O toggle pode estar em dois lugares:
1. **Header** - Ícone de sol/lua ao lado do sino de notificações
2. **Configurações** - Opção dentro da página de configurações

### Toggle no Header

```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 RecrutaRS       🔍 Buscar...       🌙  🔔 ●3    👤 João ▼  │
└──────────────────────────────────────────────────────────────────┘
                                          ↑
                                    Toggle de tema
                                    🌙 = Dark mode
                                    ☀️ = Light mode
```

### Toggle nas Configurações

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚙️ Configurações                                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Conta]  [Notificações]  [Privacidade]  [Aparência]            │
│                                          ════════════            │
│                                                                  │
│  🎨 Aparência                                                    │
│  Personalize a aparência da plataforma                          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Tema                                                            │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │                 │ │                 │ │                 │    │
│  │   ┌─────────┐   │ │   ┌─────────┐   │ │   ┌─────────┐   │    │
│  │   │ ░░░░░░░ │   │ │   │ ▓▓▓▓▓▓▓ │   │ │   │ ░░░/▓▓▓ │   │    │
│  │   │ ░░░░░░░ │   │ │   │ ▓▓▓▓▓▓▓ │   │ │   │ ░░░/▓▓▓ │   │    │
│  │   │ ░░░░░░░ │   │ │   │ ▓▓▓▓▓▓▓ │   │ │   │ ░░░/▓▓▓ │   │    │
│  │   └─────────┘   │ │   └─────────┘   │ │   └─────────┘   │    │
│  │                 │ │                 │ │                 │    │
│  │   ☀️ Claro      │ │   🌙 Escuro     │ │   💻 Sistema    │    │
│  │   ● Selecionado │ │   ○ Selecionar  │ │   ○ Selecionar  │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Fonte                                                           │
│                                                                  │
│  A plataforma utiliza a fonte Roboto Mono para melhor           │
│  legibilidade e identidade visual moderna.                       │
│                                                                  │
│  Exemplo: AaBbCcDdEe 0123456789                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Comparativo Visual

#### Light Mode

```
┌──────────────────────────────────────────────────────────────────┐
│  ████████████████████████████████████████████████████████████   │
│  █                                                           █   │
│  █   Fundo: #FFFFFF (branco)                                █   │
│  █   Texto: #1A1A1A (quase preto)                           █   │
│  █   Cards: #F8FAFC (cinza muito claro)                     █   │
│  █   Bordas: #E2E8F0 (cinza claro)                          █   │
│  █   Primária: #2563EB (azul)                               █   │
│  █   Secundária: #0EA5E9 (azul claro)                       █   │
│  █                                                           █   │
│  ████████████████████████████████████████████████████████████   │
└──────────────────────────────────────────────────────────────────┘
```

#### Dark Mode

```
┌──────────────────────────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  ▓                                                           ▓   │
│  ▓   Fundo: #0F172A (azul escuro)                           ▓   │
│  ▓   Texto: #F1F5F9 (quase branco)                          ▓   │
│  ▓   Cards: #1E293B (cinza azulado escuro)                  ▓   │
│  ▓   Bordas: #334155 (cinza médio)                          ▓   │
│  ▓   Primária: #3B82F6 (azul mais claro)                    ▓   │
│  ▓   Secundária: #38BDF8 (azul cyan)                        ▓   │
│  ▓                                                           ▓   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
└──────────────────────────────────────────────────────────────────┘
```

### Fonte Roboto Mono

```
┌──────────────────────────────────────────────────────────────────┐
│  Roboto Mono                                                     │
│  ══════════                                                      │
│                                                                  │
│  Tipo: Monospace (largura fixa)                                 │
│  Designer: Christian Robertson                                   │
│  Fonte: Google Fonts                                             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Pesos disponíveis:                                              │
│                                                                  │
│  • 300 Light                                                     │
│  • 400 Regular  ← Principal                                      │
│  • 500 Medium   ← Destaques                                      │
│  • 700 Bold     ← Títulos                                        │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Exemplos:                                                       │
│                                                                  │
│  ABCDEFGHIJKLMNOPQRSTUVWXYZ                                     │
│  abcdefghijklmnopqrstuvwxyz                                     │
│  0123456789                                                      │
│  !@#$%^&*()_+-=[]{}|;':",.<>?                                   │
│                                                                  │
│  "A quick brown fox jumps over the lazy dog"                    │
│  "Programação é a arte de resolver problemas"                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Paleta de Cores por Tema

#### Light Theme

| Token | Cor | Uso |
|-------|-----|-----|
| `--background` | #FFFFFF | Fundo principal |
| `--foreground` | #0F172A | Texto principal |
| `--card` | #F8FAFC | Fundo de cards |
| `--card-foreground` | #0F172A | Texto em cards |
| `--primary` | #2563EB | Botões, links |
| `--primary-foreground` | #FFFFFF | Texto em botões |
| `--secondary` | #F1F5F9 | Fundos secundários |
| `--secondary-foreground` | #0F172A | Texto secundário |
| `--muted` | #F1F5F9 | Elementos desabilitados |
| `--muted-foreground` | #64748B | Texto desabilitado |
| `--accent` | #0EA5E9 | Destaques |
| `--accent-foreground` | #FFFFFF | Texto em destaques |
| `--border` | #E2E8F0 | Bordas |
| `--input` | #E2E8F0 | Borda de inputs |
| `--ring` | #2563EB | Foco |
| `--destructive` | #EF4444 | Erros, excluir |
| `--destructive-foreground` | #FFFFFF | Texto em destrutivo |

#### Dark Theme

| Token | Cor | Uso |
|-------|-----|-----|
| `--background` | #0F172A | Fundo principal |
| `--foreground` | #F1F5F9 | Texto principal |
| `--card` | #1E293B | Fundo de cards |
| `--card-foreground` | #F1F5F9 | Texto em cards |
| `--primary` | #3B82F6 | Botões, links |
| `--primary-foreground` | #FFFFFF | Texto em botões |
| `--secondary` | #334155 | Fundos secundários |
| `--secondary-foreground` | #F1F5F9 | Texto secundário |
| `--muted` | #334155 | Elementos desabilitados |
| `--muted-foreground` | #94A3B8 | Texto desabilitado |
| `--accent` | #38BDF8 | Destaques |
| `--accent-foreground` | #0F172A | Texto em destaques |
| `--border` | #334155 | Bordas |
| `--input` | #334155 | Borda de inputs |
| `--ring` | #3B82F6 | Foco |
| `--destructive` | #F87171 | Erros, excluir |
| `--destructive-foreground` | #0F172A | Texto em destrutivo |

---

## Escopo

### Incluído

- ✅ Toggle de tema no header (ícone sol/lua)
- ✅ Opção de tema nas configurações
- ✅ 3 opções: Claro, Escuro, Sistema (auto)
- ✅ Persistência da preferência (localStorage)
- ✅ Transição suave entre temas
- ✅ Trocar fonte para Roboto Mono em toda a plataforma
- ✅ Importar Roboto Mono do Google Fonts
- ✅ Ajustar variáveis CSS para ambos os temas
- ✅ Aplicar tema ao carregar a página

### Excluído

- ❌ Escolha de cores customizadas
- ❌ Escolha de fonte alternativa
- ❌ Temas personalizados (além de claro/escuro)
- ❌ Agendamento de tema por horário

---

## Requisitos Funcionais

### Toggle no Header

- **RF-001:** Ícone de tema ao lado das notificações
- **RF-002:** ☀️ quando em dark mode (clique troca para light)
- **RF-003:** 🌙 quando em light mode (clique troca para dark)
- **RF-004:** Tooltip ao passar o mouse ("Mudar para modo escuro/claro")
- **RF-005:** Transição suave ao trocar (200ms)

### Configurações

- **RF-006:** Nova aba "Aparência" nas configurações
- **RF-007:** 3 opções visuais: Claro, Escuro, Sistema
- **RF-008:** Opção "Sistema" usa preferência do SO
- **RF-009:** Preview visual de cada opção
- **RF-010:** Aplicar imediatamente ao selecionar

### Persistência

- **RF-011:** Salvar preferência em localStorage
- **RF-012:** Carregar preferência ao iniciar
- **RF-013:** Se "Sistema", verificar prefers-color-scheme
- **RF-014:** Atualizar se preferência do SO mudar (listener)

### Fonte Roboto Mono

- **RF-015:** Importar do Google Fonts (400, 500, 700)
- **RF-016:** Aplicar como font-family principal
- **RF-017:** Manter fallback: 'Roboto Mono', monospace
- **RF-018:** Aplicar em todos os elementos (reset global)

### Variáveis CSS

- **RF-019:** Definir variáveis CSS para light theme
- **RF-020:** Definir variáveis CSS para dark theme
- **RF-021:** Usar classe .dark no :root ou body
- **RF-022:** Componentes shadcn/ui devem respeitar tema

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Fonte carregada com font-display: swap
- **RNF-002 (UX):** Transição de tema sem flash branco/preto
- **RNF-003 (Acessibilidade):** Contraste mínimo WCAG AA em ambos os temas
- **RNF-004 (Consistência):** Todos os componentes respeitam tema

---

## Critérios de Aceitação

### RF-001 a RF-005: Toggle Header

```gherkin
DADO que o usuário está em light mode
QUANDO ele clica no ícone de lua no header
ENTÃO a plataforma deve mudar para dark mode
  E o ícone deve mudar para sol
  E a transição deve ser suave (200ms)
```

### RF-011 a RF-014: Persistência

```gherkin
DADO que o usuário escolheu dark mode
QUANDO ele fecha e reabre a plataforma
ENTÃO o tema dark deve ser aplicado automaticamente
  E a preferência deve estar salva
```

### RF-015 a RF-018: Fonte

```gherkin
DADO que a plataforma carrega
QUANDO qualquer página é exibida
ENTÃO todos os textos devem usar Roboto Mono
  E os pesos 400, 500 e 700 devem estar disponíveis
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Fonte e variáveis CSS | 3 |
| 2 | Toggle e lógica | 3 |
| 3 | Configurações e polish | 2 |

### Detalhamento das Fases

#### Fase 1: Fonte e Variáveis CSS

**Objetivo:** Base técnica para temas e fonte

**Ações:**
- [ ] Importar Roboto Mono no index.html ou CSS
- [ ] Definir variáveis CSS light theme
- [ ] Definir variáveis CSS dark theme (.dark)
- [ ] Aplicar font-family global
- [ ] Testar componentes existentes

**Validação:** Fonte aplicada, variáveis funcionam

#### Fase 2: Toggle e Lógica

**Objetivo:** Funcionalidade de troca de tema

**Ações:**
- [ ] Criar hook `useTheme`
- [ ] Criar componente `ThemeToggle`
- [ ] Adicionar toggle no header
- [ ] Implementar persistência localStorage
- [ ] Implementar detecção de preferência do sistema

**Validação:** Toggle funciona e persiste

#### Fase 3: Configurações e Polish

**Objetivo:** Opções nas configurações e refinamentos

**Ações:**
- [ ] Criar aba "Aparência" nas configurações
- [ ] Implementar 3 opções visuais
- [ ] Adicionar transição suave global
- [ ] Testar todos os componentes em ambos os temas
- [ ] Ajustar cores se necessário

**Validação:** Configurações funcionam, visual consistente

---

## Implementação Técnica

### Google Fonts Import

```html
<!-- No index.html ou via CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">
```

### CSS Variables

```css
:root {
  /* Light theme (default) */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 210 40% 98%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... outras variáveis */
  
  /* Font */
  --font-sans: 'Roboto Mono', monospace;
}

.dark {
  /* Dark theme */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 217.2 32.6% 17.5%;
  --card-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  /* ... outras variáveis */
}

body {
  font-family: var(--font-sans);
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

### Hook useTheme

```typescript
type Theme = 'light' | 'dark' | 'system';

const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('system');
  
  // Carregar do localStorage
  // Aplicar classe .dark no document
  // Listener para prefers-color-scheme
  
  return { theme, setTheme };
};
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-003 | Header e Footer | ✅ Implementado |
| PRD-011 | Configurações (Candidato) | ✅ Implementado |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.28.0 → 0.29.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.29.0] - 2026-01-XX

### Added
- Modo escuro (dark mode)
- Toggle de tema no header
- Opções de tema nas configurações (Claro, Escuro, Sistema)
- Persistência de preferência de tema

### Changed
- Fonte principal alterada para Roboto Mono
- Variáveis CSS adaptadas para suportar temas
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Tailwind** | Verificar se Tailwind dark: já está configurado |
| **shadcn/ui** | Componentes já suportam dark mode via variáveis |
| **Transição** | Aplicar em body, não em cada elemento |
| **localStorage** | Key: "recrutars-theme" |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Flash de tema errado ao carregar (FOUC) |
| Esquecer de testar gráficos/charts em dark mode |
| Usar cores hardcoded em vez de variáveis |
| Transição muito lenta (>300ms) |

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
