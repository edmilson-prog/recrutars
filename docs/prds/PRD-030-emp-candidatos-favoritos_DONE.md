# PRD-030: Candidatos Favoritos (Empresa)

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS |
| **Repositório** | https://github.com/edmilson-prog/recrutars-maike.git |
| **Objetivo** | Permitir que empresas salvem candidatos do banco de talentos |
| **Tipo** | Feature |
| **Complexidade** | Baixa |
| **Total de Fases** | 2 |
| **Prioridade** | Alta |
| **Padrão de código** | camelCase para variáveis/funções, PascalCase para componentes |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Baixa** | Funcionalidade isolada, espelho do PRD-024 (Vagas Favoritas) |

---

## Contexto do Problema

Empresas navegam pelo Banco de Talentos e encontram candidatos interessantes, mas não têm como salvá-los para análise posterior. Precisam anotar externamente ou lembrar de memória. Uma lista de favoritos resolve isso, permitindo curadoria de talentos ao longo do tempo.

### Casos de Uso

| Cenário | Necessidade |
|---------|-------------|
| Recrutador explorando | Salvar perfis interessantes para revisar depois |
| Vaga futura | Guardar candidatos bons para próximas oportunidades |
| Comparação | Criar shortlist para decidir quem convidar |
| Múltiplos recrutadores | Compartilhar favoritos com a equipe |

---

## Conceito da Solução

### Botão Favoritar no Card de Candidato

```
┌──────────────────────────────────────────────────────────────────┐
│  Banco de Talentos                                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ┌──────┐                                           🤍     │  │
│  │  │      │  João Silva                               ↑      │  │
│  │  │ foto │  Desenvolvedor Full Stack            Favoritar   │  │
│  │  │      │  📍 Porto Alegre, RS                             │  │
│  │  └──────┘                                                  │  │
│  │                                                            │  │
│  │  ⭐ 94% match • 5 anos experiência                        │  │
│  │                                                            │  │
│  │  [React ●●●●●] [Node.js ●●●●○] [TypeScript ●●●●○]         │  │
│  │                                                            │  │
│  │  📊 DISC: Dominante (D)                                    │  │
│  │                                                            │  │
│  │  [👁️ Ver Perfil]  [📩 Enviar Convite]                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ┌──────┐                                           ❤️     │  │
│  │  │      │  Maria Santos                        Favoritado  │  │
│  │  │ foto │  Product Designer                                │  │
│  │  │      │  📍 São Paulo, SP                                │  │
│  │  └──────┘                                                  │  │
│  │  ...                                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Menu Lateral (Nova Opção)

```
┌────────────────────────┐
│  📊 Dashboard          │
│  🏢 Perfil da Empresa  │
│  📋 Minhas Vagas       │
│  🔍 Banco de Talentos  │
│  ⭐ Candidatos Salvos (12) │  ← Nova opção com badge
│  📥 Candidaturas       │
│  📅 Entrevistas        │
│  💬 Mensagens          │
│  ⚙️ Configurações      │
└────────────────────────┘
```

### Página de Candidatos Salvos

```
┌──────────────────────────────────────────────────────────────────┐
│  ⭐ Candidatos Salvos                                            │
│  Candidatos que você salvou do Banco de Talentos                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  12 candidatos salvos                                           │
│                                                                  │
│  Ordenar por: [Mais recentes ▼]  Filtrar: [Todas as áreas ▼]   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ┌──────┐                                           ❤️     │  │
│  │  │      │  Maria Santos                                    │  │
│  │  │ foto │  Product Designer                                │  │
│  │  │      │  📍 São Paulo, SP                                │  │
│  │  └──────┘                                                  │  │
│  │                                                            │  │
│  │  ⭐ 96% match • 7 anos experiência                        │  │
│  │  📊 DISC: Influente (I)                                    │  │
│  │                                                            │  │
│  │  💾 Salvo há 2 dias                                        │  │
│  │                                                            │  │
│  │  [👁️ Ver Perfil]  [📩 Convidar]  [📊 Comparar]            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ┌──────┐                                           ❤️     │  │
│  │  │      │  João Silva                                      │  │
│  │  │ foto │  Desenvolvedor Full Stack                        │  │
│  │  │      │  📍 Porto Alegre, RS                             │  │
│  │  └──────┘                                                  │  │
│  │                                                            │  │
│  │  ⭐ 94% match • 5 anos experiência                        │  │
│  │  📊 DISC: Dominante (D)                                    │  │
│  │                                                            │  │
│  │  💾 Salvo há 5 dias                                        │  │
│  │  📩 Convite enviado em 03/01/2026                         │  │
│  │                                                            │  │
│  │  [👁️ Ver Perfil]  [💬 Ver Conversa]  [📊 Comparar]        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Página de Perfil do Candidato

```
┌──────────────────────────────────────────────────────────────────┐
│  [← Voltar]                                              ❤️ 🤍   │
│                                                          ↑       │
│  ┌──────────┐  João Silva                           Favoritar    │
│  │          │  Desenvolvedor Full Stack                          │
│  │   foto   │  📍 Porto Alegre, RS                              │
│  │          │  📧 joao@email.com • 📱 (51) 99999-9999           │
│  └──────────┘                                                    │
│                                                                  │
│  [📩 Enviar Convite]  [💬 Enviar Mensagem]                      │
│  ...                                                             │
└──────────────────────────────────────────────────────────────────┘
```

### Estado Vazio

```
┌──────────────────────────────────────────────────────────────────┐
│  ⭐ Candidatos Salvos                                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         ┌─────────┐                              │
│                         │   ⭐    │                              │
│                         │  vazio  │                              │
│                         └─────────┘                              │
│                                                                  │
│              Você ainda não salvou nenhum candidato              │
│                                                                  │
│         Explore o Banco de Talentos e clique no ❤️ para         │
│              salvar candidatos interessantes.                    │
│                                                                  │
│                    [🔍 Explorar Talentos]                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Escopo

### Incluído

- ✅ Botão de favoritar (coração) nos cards de candidato
- ✅ Botão de favoritar na página de perfil do candidato
- ✅ Toggle de favorito com feedback instantâneo
- ✅ Nova opção "Candidatos Salvos" no menu lateral
- ✅ Badge com contador de favoritos no menu
- ✅ Página `/empresa/candidatos-salvos`
- ✅ Ordenação: mais recentes, maior match, área de atuação
- ✅ Filtro por área de atuação
- ✅ Indicador "Salvo há X dias"
- ✅ Indicador se já enviou convite
- ✅ Estado vazio com CTA

### Excluído

- ❌ Pastas/categorias para organizar favoritos
- ❌ Notas/comentários em candidatos salvos
- ❌ Compartilhar lista com outros usuários da empresa
- ❌ Alertas quando candidato atualiza perfil

---

## Requisitos Funcionais

### Botão Favoritar

- **RF-001:** Ícone de coração nos cards do Banco de Talentos
- **RF-002:** Ícone de coração na página de perfil do candidato
- **RF-003:** 🤍 (vazio) = não favoritado, ❤️ (preenchido) = favoritado
- **RF-004:** Clique alterna o estado
- **RF-005:** Atualização otimista (visual imediato)
- **RF-006:** Toast de confirmação: "Candidato salvo!" / "Candidato removido dos salvos"

### Menu e Navegação

- **RF-007:** Nova opção "⭐ Candidatos Salvos" no menu lateral
- **RF-008:** Badge com contador de candidatos salvos
- **RF-009:** Rota `/empresa/candidatos-salvos`

### Página de Candidatos Salvos

- **RF-010:** Listar todos os candidatos favoritados
- **RF-011:** Ordenar por: Mais recentes, Maior match, Área
- **RF-012:** Filtrar por área de atuação
- **RF-013:** Exibir "Salvo há X dias"
- **RF-014:** Exibir indicador se já enviou convite
- **RF-015:** Ações: Ver Perfil, Convidar/Ver Conversa, Comparar
- **RF-016:** Estado vazio com CTA para Banco de Talentos

### Sincronização

- **RF-017:** Estado de favorito sincronizado em toda a aplicação
- **RF-018:** Remover da lista ao desfavoritar

---

## Requisitos Não-Funcionais

- **RNF-001 (UX):** Atualização otimista para feedback instantâneo
- **RNF-002 (Performance):** Página carrega em menos de 2 segundos
- **RNF-003 (Persistência):** Favoritos persistidos (localStorage/mock)

---

## Critérios de Aceitação

### RF-001 a RF-006: Botão Favoritar

```gherkin
DADO que a empresa visualiza um candidato no Banco de Talentos
QUANDO ela clica no ícone de coração
ENTÃO o ícone deve mudar de 🤍 para ❤️
  E deve exibir toast "Candidato salvo!"
  E o contador no menu deve incrementar
```

### RF-010 a RF-016: Página de Salvos

```gherkin
DADO que a empresa tem candidatos salvos
QUANDO ela acessa "Candidatos Salvos"
ENTÃO deve ver lista de candidatos favoritados
  E deve poder ordenar e filtrar
  E deve ver há quanto tempo salvou cada um
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Botão favoritar | 2 |
| 2 | Página de salvos | 2 |

### Detalhamento das Fases

#### Fase 1: Botão Favoritar

**Objetivo:** Toggle de favorito funcional

**Ações:**
- [ ] Adicionar ícone de coração nos cards de candidato
- [ ] Adicionar ícone na página de perfil
- [ ] Implementar toggle com toast
- [ ] Adicionar opção no menu lateral com badge

**Validação:** Empresa consegue favoritar/desfavoritar

#### Fase 2: Página de Salvos

**Objetivo:** Página completa de candidatos salvos

**Ações:**
- [ ] Criar página `/empresa/candidatos-salvos`
- [ ] Implementar listagem com cards
- [ ] Implementar ordenação e filtros
- [ ] Implementar indicadores (tempo, convite)
- [ ] Implementar estado vazio

**Validação:** Página funcional com ordenação/filtros

---

## Modelo de Dados

### FavoriteCandidate

```typescript
interface FavoriteCandidate {
  candidateId: string;
  savedAt: string; // ISO date
  inviteSentAt?: string; // se já enviou convite
}

// Armazenamento por empresa
interface CompanyFavorites {
  companyId: string;
  candidates: FavoriteCandidate[];
}
```

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-014 | Banco de Talentos | ✅ Implementado |
| PRD-024 | Vagas Favoritas (Candidato) | ✅ Implementado |

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3.

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. APÓS IMPLEMENTAR:**
> - Incrementar versão: **0.29.0 → 0.30.0**
> - Atualizar CHANGELOG.md
> - Renomear arquivo com `_DONE`

### Changelog

```markdown
## [0.30.0] - 2026-01-XX

### Added
- Botão de favoritar candidatos no Banco de Talentos
- Página "Candidatos Salvos" para empresas
- Ordenação e filtros na lista de salvos
- Indicadores de tempo e status de convite
- Badge com contador no menu lateral
```

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Componente** | Reutilizar lógica similar ao PRD-024 |
| **Ícone** | Usar Heart do Lucide React |
| **Persistência** | localStorage ou context global |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Favoritar candidato anônimo revelando dados |
| Perder favoritos ao navegar |
| Permitir favoritar sem estar logado como empresa |

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
