# PRD-024: Vagas Favoritas

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Permitir que candidatos salvem vagas de interesse |
| **Tipo** | Feature |
| **Complexidade** | Baixa |
| **Total de Fases** | 2 |
| **Prioridade** | Média |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | Funcionalidade simples, poucos componentes, lógica direta |

---

## Contexto do Problema

Candidatos encontram várias vagas interessantes durante a busca, mas nem sempre querem se candidatar imediatamente. Precisam de uma forma de "salvar para depois" e organizar as oportunidades de interesse.

### Benefícios

- Salvar vagas para candidatura posterior
- Comparar vagas salvas antes de decidir
- Acompanhar vagas de interesse
- Não perder oportunidades encontradas

---

## Conceito da Solução

### Botão Favoritar (Card da Vaga)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Desenvolvedor React Senior                           🤍   │  │
│  │  TechCorp Soluções                                        │  │
│  │  📍 São Paulo, SP | 💼 CLT | 🏠 Híbrido                   │  │
│  │  💰 R$ 12.000 - R$ 18.000                                 │  │
│  │                                                            │  │
│  │  [React] [TypeScript] [Node.js]                           │  │
│  │                                                            │  │
│  │  ⭐ 85% match                                              │  │
│  │                                                            │  │
│  │  [Ver detalhes]                            Publicada há 2d │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

                              ↓ Ao clicar no 🤍

┌────────────────────────────────────────────────────────────────┐
│  Desenvolvedor React Senior                           ❤️      │
│  ...                                                          │
│                                   Toast: "Vaga salva!" ✓     │
└────────────────────────────────────────────────────────────────┘
```

### Botão Favoritar (Detalhe da Vaga)

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Voltar]                                                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ┌──────┐  Desenvolvedor React Senior                      │  │
│  │  │ Logo │  TechCorp Soluções                               │  │
│  │  └──────┘  📍 São Paulo, SP | 💼 CLT | 🏠 Híbrido          │  │
│  │                                                            │  │
│  │  ⭐ 85% match com seu perfil                               │  │
│  │                                                            │  │
│  │  [❤️ Salva]  [Candidatar-se]                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ...                                                             │
└──────────────────────────────────────────────────────────────────┘
```

### Menu Lateral (Nova Opção)

```
┌────────────────────────┐
│  📊 Dashboard          │
│  👤 Meu Perfil         │
│  📄 Currículos         │
│  🔍 Buscar Vagas       │
│  ❤️ Vagas Salvas (3)   │  ← Nova opção
│  📋 Candidaturas       │
│  💬 Mensagens          │
│  📊 Teste DISC         │
│  ⚙️ Configurações      │
└────────────────────────┘
```

### Página Vagas Salvas

```
┌──────────────────────────────────────────────────────────────────┐
│  ❤️ Vagas Salvas                                                 │
│  Vagas que você salvou para analisar depois                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Ordenar por: [Mais recentes ▼]    Você tem 3 vagas salvas      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Desenvolvedor React Senior                           ❤️   │  │
│  │  TechCorp Soluções                                        │  │
│  │  📍 São Paulo, SP | 💼 CLT | 🏠 Híbrido                   │  │
│  │  💰 R$ 12.000 - R$ 18.000                                 │  │
│  │                                                            │  │
│  │  ⭐ 85% match                          Salva há 2 dias     │  │
│  │                                                            │  │
│  │  [Ver detalhes]  [Candidatar-se]                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Product Manager                                      ❤️   │  │
│  │  StartupXYZ                                               │  │
│  │  📍 Remoto | 💼 PJ | 🏠 Remoto                            │  │
│  │  💰 R$ 15.000 - R$ 20.000                                 │  │
│  │                                                            │  │
│  │  ⭐ 72% match                          Salva há 5 dias     │  │
│  │  ⚠️ Encerra em 3 dias                                     │  │
│  │                                                            │  │
│  │  [Ver detalhes]  [Candidatar-se]                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  UX Designer                                          ❤️   │  │
│  │  Agency Creative                                    🔴 Encerrada│
│  │  📍 Curitiba, PR | 💼 CLT                                 │  │
│  │                                                            │  │
│  │  Esta vaga não está mais disponível                       │  │
│  │                                                            │  │
│  │  [Remover da lista]                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Estado Vazio

```
┌──────────────────────────────────────────────────────────────────┐
│  ❤️ Vagas Salvas                                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                         ❤️                                       │
│                                                                  │
│              Você ainda não salvou nenhuma vaga                  │
│                                                                  │
│        Ao encontrar vagas interessantes, clique no ❤️            │
│           para salvá-las e analisar depois.                      │
│                                                                  │
│                     [🔍 Buscar Vagas]                            │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Botão favoritar (coração) no card da vaga
- ✅ Botão favoritar na página de detalhes da vaga
- ✅ Toggle visual (vazio/preenchido)
- ✅ Nova página "Vagas Salvas" no menu
- ✅ Contador de vagas salvas no menu
- ✅ Ordenação (mais recentes, match, prazo)
- ✅ Indicador de vaga encerrada
- ✅ Indicador de prazo próximo
- ✅ Estado vazio amigável
- ✅ Toast de feedback ao salvar/remover

### Excluído

- ❌ Pastas/categorias de vagas salvas
- ❌ Notas pessoais na vaga salva
- ❌ Compartilhar vaga salva
- ❌ Alerta quando vaga salva for encerrar
- ❌ Limite de vagas salvas

---

## Requisitos Funcionais

### Botão Favoritar

- **RF-001:** Ícone de coração em todos os cards de vaga
- **RF-002:** Coração vazio (🤍) = não salva
- **RF-003:** Coração preenchido (❤️) = salva
- **RF-004:** Ao clicar, alternar estado (toggle)
- **RF-005:** Toast "Vaga salva!" ou "Vaga removida"
- **RF-006:** Mesmo comportamento na página de detalhes

### Página Vagas Salvas

- **RF-007:** Nova rota `/candidato/vagas-salvas`
- **RF-008:** Nova opção no menu lateral
- **RF-009:** Contador de vagas salvas no menu
- **RF-010:** Listar todas as vagas salvas
- **RF-011:** Ordenação: Mais recentes, Maior match, Prazo mais próximo
- **RF-012:** Exibir "Salva há X dias" em cada card

### Status da Vaga

- **RF-013:** Indicar se vaga foi encerrada (não disponível)
- **RF-014:** Indicar prazo próximo "⚠️ Encerra em X dias"
- **RF-015:** Vaga encerrada: mostrar botão "Remover da lista"
- **RF-016:** Vaga ativa: mostrar botões "Ver detalhes" e "Candidatar-se"

### Estado Vazio

- **RF-017:** Se não há vagas salvas, mostrar mensagem amigável
- **RF-018:** Botão de call-to-action para buscar vagas

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** Toggle deve ser instantâneo (otimistic update)
- **RNF-002 (UX):** Animação suave no coração
- **RNF-003 (Persistência):** Vagas salvas persistem (localStorage/mock)

---

## Critérios de Aceitação

### RF-001 a RF-006: Botão Favoritar

```gherkin
DADO que o candidato está vendo uma vaga
QUANDO ele clica no ícone de coração
ENTÃO o estado deve alternar (salva/não salva)
  E o ícone deve mudar visualmente
  E deve exibir toast de feedback
  E a mudança deve refletir em toda a aplicação
```

### RF-007 a RF-012: Página

```gherkin
DADO que o candidato tem vagas salvas
QUANDO ele acessa /candidato/vagas-salvas
ENTÃO deve ver lista de todas as vagas salvas
  E deve ver há quanto tempo cada uma foi salva
  E deve poder ordenar a lista
  E deve ver contador no menu lateral
```

### RF-013 a RF-016: Status

```gherkin
DADO que uma vaga salva foi encerrada pela empresa
QUANDO o candidato vê a lista de vagas salvas
ENTÃO deve ver indicador "🔴 Encerrada"
  E não deve ver botão "Candidatar-se"
  E deve ver botão "Remover da lista"
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Botão favoritar | 2 |
| 2 | Página de vagas salvas | 3 |

### Detalhamento das Fases

#### Fase 1: Botão Favoritar

**Objetivo:** Toggle de favorito nos cards e detalhes

**Ações:**
- [ ] Criar hook `useFavoriteJobs`
- [ ] Adicionar ícone nos cards de vaga
- [ ] Adicionar ícone na página de detalhes
- [ ] Implementar toggle com toast

**Validação:** Favoritar/desfavoritar funciona em toda app

#### Fase 2: Página de Vagas Salvas

**Objetivo:** Listagem das vagas salvas

**Ações:**
- [ ] Criar página `/candidato/vagas-salvas`
- [ ] Adicionar item no menu lateral
- [ ] Implementar ordenação
- [ ] Implementar indicadores de status
- [ ] Implementar estado vazio

**Validação:** Página lista corretamente com todos os estados

---

## Modelo de Dados

### FavoriteJob (Mock)

```typescript
interface FavoriteJob {
  jobId: string;
  savedAt: string; // ISO date
}

// Armazenado em array no localStorage ou state global
const favoriteJobs: FavoriteJob[] = [
  { jobId: "job-001", savedAt: "2026-01-13T10:30:00Z" },
  { jobId: "job-003", savedAt: "2026-01-10T14:20:00Z" },
];
```

### Hook

```typescript
const useFavoriteJobs = () => {
  const [favorites, setFavorites] = useState<FavoriteJob[]>([]);
  
  const isFavorite = (jobId: string) => boolean;
  const toggleFavorite = (jobId: string) => void;
  const getFavoriteJobs = () => Job[];
  
  return { favorites, isFavorite, toggleFavorite, getFavoriteJobs };
};
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-006 | Busca e Visualização de Vagas | ✅ Implementado |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.23.0 → 0.24.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.24.0] - 2026-01-XX

### Added
- Sistema de vagas favoritas
- Botão de coração para salvar vagas
- Página "Vagas Salvas" com listagem
- Contador de vagas salvas no menu
- Indicadores de vaga encerrada e prazo próximo
- Ordenação de vagas salvas
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Estado** | Context API ou Zustand para estado global |
| **Persistência** | localStorage para mock |
| **Animação** | CSS transition no ícone |
| **Performance** | Optimistic update no toggle |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Favoritar sem feedback visual |
| Perder favoritos ao recarregar (usar localStorage) |
| Mostrar botão "Candidatar-se" em vaga encerrada |

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
