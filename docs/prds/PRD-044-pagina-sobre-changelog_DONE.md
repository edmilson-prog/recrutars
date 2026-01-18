# PRD-044: Página "Sobre" e Tooltip de Versão no Footer

> **AILA - Sistemas Inteligentes**  
> RecrutaRS — Plataforma de Recrutamento Inteligente

---

## 📚 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `GuiaPRD.md` | Guia principal de criação de PRDs |
| `PRD-043` | Footer Fixo com Glassmorphism (pré-requisito) |
| `PRD-dgn-000` | Design System — Microinterações |

---

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Projeto** | RecrutaRS — Frontend (Todos os Painéis) |
| **Repositório** | github.com/aila-sistemas/recrutars |
| **Objetivo** | Implementar tooltip interativo no footer, item "Sobre" no menu lateral e página dedicada com informações do sistema e histórico completo de versões (changelog) |
| **Tipo** | Feature |
| **Complexidade** | Média |
| **Total de Fases** | 4 |
| **Prioridade** | Média |
| **Épico** | UI/UX — Identidade Visual e Transparência |
| **PRDs Relacionados** | PRD-043 (Footer Glassmorphism) |
| **Padrão de código** | camelCase para componentes React |

### Critérios de Complexidade Utilizados

| Complexidade | Critérios |
|--------------|-----------|
| **Média** ✅ | 5-8 arquivos, estrutura de dados para changelog, múltiplos componentes interativos |

---

## Contexto do Problema

Com a implementação do footer com versão do app (PRD-043), surge a necessidade de oferecer aos usuários mais contexto sobre as atualizações do sistema. Atualmente, não há forma de o usuário saber o que mudou entre versões ou acessar um histórico de releases.

A transparência sobre o desenvolvimento do produto é importante para:
- **Usuários avançados:** Querem saber o que mudou para aproveitar novas funcionalidades
- **Suporte técnico:** Precisa identificar rapidamente a versão e mudanças recentes
- **Confiança:** Demonstra que o produto está em evolução constante

Este PRD implementa um sistema completo de visualização de changelog, acessível tanto via tooltip no footer quanto por página dedicada.

---

## Conceito da Solução

### Situação Atual (As-Is)

- Footer exibe apenas versão estática (PRD-043)
- Não há página "Sobre" no sistema
- Changelog existe apenas no repositório (CHANGELOG.md), inacessível aos usuários
- Menu lateral não possui opção para informações do sistema

### Situação Desejada (To-Be)

- Hover na versão do footer exibe tooltip com resumo da release atual
- Menu lateral possui item "Sobre" como última opção
- Página dedicada "Sobre o RecrutaRS" com:
  - Card hero com informações da versão atual
  - Créditos do desenvolvedor (AILA)
  - Histórico completo de versões com busca e filtros
  - Detalhes expansíveis de cada release

### Alternativas Consideradas

| Alternativa | Por que foi descartada |
|-------------|------------------------|
| Modal ao invés de página | Limitaria espaço para histórico completo |
| Changelog em PDF externo | Ruim para UX, difícil de manter |
| Apenas tooltip sem página | Insuficiente para histórico detalhado |

---

## Escopo

### Incluído

- ✅ Tooltip/Popover ao hover na versão do footer
- ✅ Item "Sobre" no menu lateral (todos os painéis autenticados)
- ✅ Página "Sobre o RecrutaRS" com card da versão atual
- ✅ Seção "Desenvolvido por" com créditos AILA
- ✅ Seção "Histórico de Versões" com lista de releases
- ✅ Campo de busca no changelog
- ✅ Filtros por tipo de release (Major/Minor/Patch) e período
- ✅ Accordion expansível com detalhes de cada versão
- ✅ Badges visuais para tipo de release e status "Atual"
- ✅ Contador de mudanças por versão
- ✅ Estrutura de dados para armazenar changelog

### Excluído

- ❌ Notificação push de novas versões (PRD futuro)
- ❌ Comparação lado a lado entre versões
- ❌ Rollback de versões
- ❌ Changelog em múltiplos idiomas

---

## Requisitos Funcionais

### Tooltip de Versão no Footer

- **RF-001:** Ao posicionar o mouse sobre a versão no footer, deve exibir um tooltip/popover
- **RF-002:** O tooltip deve exibir:
  - Versão + codinome (ex: `Versão 1.21.2 "Fixes"`)
  - Data de lançamento (ex: `Lançamento: 09/01/2026`)
  - Tipo de release + descrição (ex: `Patch Release - Correções de bugs`)
  - Link clicável "Clique para ver o que há de novo"
- **RF-003:** O link do tooltip deve navegar para a página "Sobre"
- **RF-004:** O tooltip deve ter animação suave de entrada/saída
- **RF-005:** Em dispositivos touch, o tooltip deve abrir ao toque e fechar ao tocar fora

### Menu Lateral

- **RF-006:** Adicionar item "Sobre" como última opção do menu lateral
- **RF-007:** O item deve estar presente nos três painéis: Candidato, Empresa, Admin
- **RF-008:** O item deve ter ícone apropriado (ex: info-circle, help-circle)
- **RF-009:** Ao clicar, navegar para a rota `/sobre` (ou equivalente por painel)

### Página "Sobre" — Header

- **RF-010:** A página deve ter título "Sobre o RecrutaRS" e subtítulo "Informações do sistema e histórico de versões"
- **RF-011:** Exibir card hero com:
  - Logo/ícone do RecrutaRS
  - Nome do app + versão + codinome (ex: `RecrutaRS v1.21.2 "Fixes"`)
  - Descrição do sistema
  - Badge do tipo de release (Major/Minor/Patch)
- **RF-012:** O card hero deve exibir 3 métricas:
  - **Lançamento:** Data + tempo relativo (ex: "09/01/2026 — há 1 semana")
  - **Tipo de Release:** Nome + descrição (ex: "Patch — Correções de bugs")
  - **Mudanças:** Quantidade de itens na versão atual (ex: "2 itens nesta versão")
- **RF-013:** Botão "O que há de novo" que ancora/scrolla para o histórico de versões

### Página "Sobre" — Desenvolvido Por

- **RF-014:** Seção com card "Desenvolvido por" contendo:
  - Logo/ícone da AILA
  - Nome: "AILA - Sistemas Inteligentes"
  - Descrição: Texto customizável sobre a empresa
  - Botão "Visitar site" que abre link externo em nova aba

### Página "Sobre" — Histórico de Versões

- **RF-015:** Título "Histórico de Versões" com contador (ex: "32 de 32 versões")
- **RF-016:** Campo de busca com placeholder "Buscar no changelog..."
- **RF-017:** Filtros dropdown:
  - **Tipo de release:** Todos, Major, Minor, Patch
  - **Período:** Todas as datas, Última semana, Último mês, Últimos 3 meses, Último ano
- **RF-018:** Lista de versões em formato accordion, cada item exibindo:
  - Seta de expansão (chevron)
  - Versão + codinome (ex: `v1.21.2 "Fixes"`)
  - Badge do tipo (Major/Minor/Patch) com cores distintas
  - Badge "Atual" para versão corrente (destaque verde)
  - Descrição resumida da release
  - Data de lançamento
  - Badge com número de mudanças (ex: "2 mudanças")
- **RF-019:** Ao expandir um item, exibir detalhes agrupados por categoria:
  - 🐛 Correções (X) — lista de bugs corrigidos
  - ✨ Novidades (X) — lista de features adicionadas
  - 🔄 Alterações (X) — lista de mudanças
  - ⚠️ Descontinuados (X) — lista de deprecations
  - 🗑️ Removidos (X) — lista de remoções
  - 🔒 Segurança (X) — lista de fixes de segurança
- **RF-020:** A busca deve filtrar versões por: número da versão, codinome, descrição, itens do changelog
- **RF-021:** Versões devem ser ordenadas da mais recente para a mais antiga

---

## Requisitos Não-Funcionais

- **RNF-001 (Performance):** A página deve carregar em menos de 2 segundos, mesmo com 50+ versões
- **RNF-002 (Acessibilidade):** Tooltip e accordion devem ser navegáveis por teclado
- **RNF-003 (Responsividade):** Layout deve adaptar-se de 320px a 1920px+
- **RNF-004 (Compatibilidade):** Chrome, Firefox, Safari, Edge (versões recentes)
- **RNF-005 (SEO):** Página "Sobre" não precisa ser indexada (área autenticada)

---

## Especificação Visual

### Tooltip de Versão

```
┌─────────────────────────────────────────────┐
│ Versão 1.21.2 "Fixes"                       │
│ Lançamento: 09/01/2026                      │
│ Patch Release - Correções de bugs           │
│                                             │
│ 🔗 Clique para ver o que há de novo         │
└─────────────────────────────────────────────┘
```

| Propriedade | Valor |
|-------------|-------|
| Largura | 280-320px |
| Background | Tema escuro com leve transparência |
| Border | 1px sutil |
| Border-radius | 8px |
| Posição | Acima do footer, alinhado à esquerda |
| Animação | Fade-in 150ms |

### Card Hero da Versão Atual

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🚀 RecrutaRS v1.21.2 "Fixes"                              [Patch]      │
│    Plataforma de Recrutamento Inteligente                              │
│                                                                         │
│ 📅 Lançamento      📦 Tipo de Release       </> Mudanças               │
│    09/01/2026         Patch                      2 itens               │
│    há 1 semana        Correções de bugs          nesta versão          │
│                                                                         │
│ [ 🚀 O que há de novo ]                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Card Desenvolvido Por

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🏢 Desenvolvido por                                                     │
│                                                                         │
│ AILA - Sistemas Inteligentes                      [ ↗ Visitar site ]   │
│ Soluções em automação e gestão para                                    │
│ recrutamento inteligente                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Lista de Versões (Accordion)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Histórico de Versões                                   32 de 32 versões │
├─────────────────────────────────────────────────────────────────────────┤
│ 🔍 Buscar no changelog...                                              │
│ [ Todos os tipos ▼ ]  [ Todas as datas ▼ ]                             │
├─────────────────────────────────────────────────────────────────────────┤
│ ▼ v1.21.2 "Fixes" [Patch] [Atual]              09/01/2026  [2 mudanças]│
│   Correções de bugs e melhorias de acessibilidade                      │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ 🐛 Correções (2)                                                    ││
│ │ • Gráfico de barras no Histórico de Compliance - barras não        ││
│ │   apareciam devido a problema de cálculo de altura                 ││
│ │ • Avisos de acessibilidade do DialogContent (Radix UI)             ││
│ └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│ ▶ v1.21.1 "Templates" [Patch]                  09/01/2026  [7 mudanças]│
│   Gerenciador de Templates de Mensagem para notificações               │
├─────────────────────────────────────────────────────────────────────────┤
│ ▶ v1.21.0 "Níveis" [Minor]                     09/01/2026  [8 mudanças]│
│   Sistema de Gamificação - Níveis de progressão configurável           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Cores dos Badges de Tipo

| Tipo | Cor de Fundo | Cor do Texto |
|------|--------------|--------------|
| Major | Vermelho/Rosa | Branco |
| Minor | Azul | Branco |
| Patch | Amarelo/Laranja | Escuro |
| Atual | Verde | Branco |

---

## Estrutura de Dados

### Modelo de Versão (Version)

```typescript
interface Version {
  version: string;           // "1.21.2"
  codename: string;          // "Fixes"
  type: 'major' | 'minor' | 'patch';
  releaseDate: string;       // ISO date
  description: string;       // Resumo da release
  isCurrent: boolean;        // Se é a versão atual
  changes: ChangeCategory[];
}

interface ChangeCategory {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  items: string[];           // Lista de mudanças
}
```

### Fonte de Dados

Os dados podem vir de:
1. **Arquivo JSON estático** — `/public/changelog.json`
2. **Variável de ambiente** — build-time
3. **API endpoint** — `/api/changelog` (se precisar de dados dinâmicos)

> **Recomendação:** Iniciar com JSON estático, migrar para API se necessário.

---

## Critérios de Aceitação

### RF-001/RF-002: Tooltip de Versão

```gherkin
DADO que o usuário está em qualquer painel autenticado
QUANDO posiciona o mouse sobre a versão no footer
ENTÃO um tooltip deve aparecer com animação suave
  E deve exibir versão + codinome
  E deve exibir data de lançamento
  E deve exibir tipo de release + descrição
  E deve exibir link "Clique para ver o que há de novo"
```

### RF-006/RF-009: Menu Lateral

```gherkin
DADO que o usuário está logado em qualquer painel
QUANDO visualiza o menu lateral
ENTÃO deve ver o item "Sobre" como última opção
  E ao clicar, deve navegar para a página Sobre
```

### RF-018/RF-019: Accordion de Versões

```gherkin
DADO que o usuário está na página Sobre
QUANDO clica em uma versão do histórico
ENTÃO o accordion deve expandir
  E deve exibir os detalhes agrupados por categoria
  E deve exibir ícones e contadores por categoria

DADO que o accordion está expandido
QUANDO o usuário clica novamente
ENTÃO o accordion deve colapsar
```

### RF-016/RF-020: Busca no Changelog

```gherkin
DADO que o usuário está na página Sobre
QUANDO digita "Template" no campo de busca
ENTÃO a lista deve filtrar mostrando apenas versões que contenham "Template"
  E o contador deve atualizar (ex: "5 de 32 versões")

DADO que a busca não encontra resultados
QUANDO o usuário visualiza a lista
ENTÃO deve exibir mensagem "Nenhuma versão encontrada"
```

### RF-017: Filtros

```gherkin
DADO que o usuário está na página Sobre
QUANDO seleciona "Patch" no filtro de tipo
ENTÃO a lista deve mostrar apenas versões do tipo Patch
  E o contador deve atualizar

DADO que o usuário seleciona "Último mês" no filtro de período
QUANDO a lista é atualizada
ENTÃO deve mostrar apenas versões lançadas no último mês
```

---

## Fases de Implementação

| Fase | Objetivo | Arquivos Estimados |
|------|----------|-------------------|
| 1 | Estrutura de dados e fonte do changelog | 2-3 |
| 2 | Tooltip de versão no footer | 1-2 |
| 3 | Item "Sobre" no menu lateral | 3-4 |
| 4 | Página "Sobre" completa | 4-6 |

### Detalhamento das Fases

#### Fase 1: Estrutura de Dados

**Objetivo:** Criar modelo de dados e fonte do changelog

**Ações:**
- [ ] Definir interface/tipo TypeScript para Version e ChangeCategory
- [ ] Criar arquivo `changelog.json` com dados mockados (5-10 versões de exemplo)
- [ ] Criar hook `useChangelog()` ou service para acessar os dados
- [ ] Incluir função para obter versão atual

**Validação:** Hook retorna dados do changelog corretamente

#### Fase 2: Tooltip de Versão

**Objetivo:** Implementar tooltip interativo no footer

**Ações:**
- [ ] Criar componente `<VersionTooltip />` 
- [ ] Integrar com o `<GlassFooter />` do PRD-043
- [ ] Implementar lógica de hover (desktop) e touch (mobile)
- [ ] Adicionar animação de entrada/saída
- [ ] Linkar para página Sobre

**Validação:** Tooltip aparece ao hover com informações corretas

#### Fase 3: Menu Lateral

**Objetivo:** Adicionar item "Sobre" nos menus

**Ações:**
- [ ] Identificar componentes de menu lateral de cada painel
- [ ] Adicionar item "Sobre" como última opção
- [ ] Configurar rota `/sobre` (ou por painel: `/candidato/sobre`, etc.)
- [ ] Adicionar ícone apropriado

**Validação:** Item visível e funcional nos três painéis

#### Fase 4: Página "Sobre"

**Objetivo:** Implementar página completa com todos os componentes

**Ações:**
- [ ] Criar página `/sobre` com layout responsivo
- [ ] Implementar card hero da versão atual
- [ ] Implementar card "Desenvolvido por"
- [ ] Implementar seção "Histórico de Versões" com:
  - [ ] Campo de busca
  - [ ] Filtros (tipo, período)
  - [ ] Lista accordion
  - [ ] Detalhes expansíveis com categorias
- [ ] Implementar lógica de busca e filtros
- [ ] Testar responsividade

**Validação:** Página funcional com busca, filtros e accordion

---

## Dependências

### PRDs Anteriores

| PRD | Descrição | Status |
|-----|-----------|--------|
| PRD-043 | Footer Glassmorphism | ⏳ Pendente (pré-requisito) |

### Serviços Externos

| Serviço | Tipo | Status |
|---------|------|--------|
| Site AILA | Link externo | Disponível |

### Decisões Pendentes

- [ ] Definir URL do site da AILA para botão "Visitar site"
- [ ] Confirmar se descrição do sistema e da AILA devem ser editáveis (CMS) ou estáticas

---

## Cadeia de PRDs

Este PRD faz parte do épico **"UI/UX — Identidade Visual"**.

| Ordem | PRD | Título | Status | Relação |
|-------|-----|--------|--------|---------|
| 1 | PRD-043 | Footer Glassmorphism | ⏳ | Base |
| **2** | **PRD-044** | **Página Sobre e Tooltip** | **🔄 ATUAL** | Depende de 043 |

**Legenda:** ✅ Implementado | 🔄 Atual | ⏳ Pendente

---

## Considerações de Segurança

### Dados Sensíveis

| Dado | Classificação | Proteção |
|------|---------------|----------|
| Changelog | Público | Nenhuma necessária |
| Versão do app | Público | Nenhuma necessária |

### Autenticação e Autorização

A página "Sobre" está dentro da área autenticada, mas não contém dados sensíveis. Qualquer usuário logado pode acessar.

### Auditoria

Não aplicável — página informativa sem ações críticas.

---

## Fluxos de Usuário

### Fluxo 1: Tooltip → Página Sobre

```
[Usuário no Painel] 
      │
      ▼
[Hover na versão do footer]
      │
      ▼
[Tooltip aparece com resumo]
      │
      ▼
[Clica em "Ver o que há de novo"]
      │
      ▼
[Navega para página Sobre]
```

### Fluxo 2: Menu → Página Sobre

```
[Usuário no Painel]
      │
      ▼
[Abre menu lateral]
      │
      ▼
[Clica em "Sobre"]
      │
      ▼
[Navega para página Sobre]
```

### Fluxo 3: Busca no Changelog

```
[Usuário na página Sobre]
      │
      ▼
[Digita termo na busca]
      │
      ▼
[Lista filtra em tempo real]
      │
      ▼
[Clica em versão para expandir]
      │
      ▼
[Visualiza detalhes da release]
```

---

## Notas para o Agente Desenvolvedor

> **Contexto:** Você é o Claude Opus 4.5 operando via Claude Code CLI v2.1.3. Este PRD foi criado pelo Agente Arquiteto (Claude Opus 4.5 na plataforma web).

### Esclarecimento de Dúvidas

> **💬 Antes de implementar, faça perguntas para esclarecer qualquer ambiguidade sobre: requisitos funcionais, restrições técnicas, dependências, comportamentos esperados e critérios de aceitação.**

### Instruções Obrigatórias

> **⚠️ 1. ANTES DE IMPLEMENTAR:**
> "Lembre-se: explore a estrutura dos dados, planeje primeiro cada passo, analise, investigue a fundo, pense e revise tudo antes de realizar qualquer atualização ou implementação."

> **⚠️ 2. PRÉ-REQUISITO:**
> Este PRD depende do PRD-043 (Footer Glassmorphism). Verifique se o footer já está implementado antes de iniciar a Fase 2.

> **⚠️ 3. APÓS IMPLEMENTAR:**
> - Incrementar a versão do app seguindo [SemVer](https://semver.org/)
> - Atualizar o CHANGELOG.md seguindo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
> - Renomear este arquivo adicionando `_DONE` ao final
>   Ex: `PRD-044-pagina-sobre-changelog_DONE.md`
> - Atualizar a seção "Status de Implementação"

### Guia de Versionamento (SemVer)

| Tipo de Mudança | Ação | Exemplo |
|-----------------|------|---------|
| Correção de bug | PATCH +1 | 1.0.0 → 1.0.1 |
| Nova funcionalidade | MINOR +1, PATCH = 0 | 1.0.1 → 1.1.0 |
| Mudança incompatível | MAJOR +1, outros = 0 | 1.1.0 → 2.0.0 |

**Codinomes:** Para MINOR ou MAJOR, gerar codinome em inglês baseado no contexto das mudanças. Sugestão para este PRD: "Chronicle" ou "Transparency".

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
| **Não bloquear fluxo principal** | Se changelog não carregar, exibir mensagem amigável |
| **Fail gracefully** | Filtros e busca devem funcionar mesmo com dados parciais |
| **Testar incrementalmente** | Validar cada fase antes de prosseguir |
| **Documentar decisões** | Registrar escolhas técnicas (ex: tooltip library usada) |

### Orientações Gerais

| Aspecto | Orientação |
|---------|------------|
| **Tooltip** | Considerar usar Radix UI Tooltip ou similar para acessibilidade |
| **Accordion** | Usar Radix UI Accordion ou componente existente do projeto |
| **Dados** | Iniciar com JSON estático em `/public/changelog.json` |
| **Busca** | Implementar busca client-side com debounce de 300ms |
| **Filtros** | Aplicar filtros cumulativamente (tipo E período) |
| **Tempo relativo** | Usar lib como `date-fns` para "há X dias/semanas" |
| **Ícones** | Usar biblioteca de ícones já presente no projeto (Lucide, etc.) |

### O que NÃO Fazer

| ❌ Evitar |
|----------|
| Implementar antes do PRD-043 (footer) estar pronto |
| Criar endpoint de API se JSON estático for suficiente |
| Hardcodar dados do changelog no componente |
| Ignorar acessibilidade do accordion (keyboard navigation) |
| Esquecer de atualizar o changelog.json quando novas versões forem lançadas |
| Usar busca server-side para poucos dados (client-side é mais rápido) |

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ⏳ PENDENTE |
| **Data de Implementação** | - |
| **Versão do App** | - |
| **Implementado por** | - |
| **Observações** | Aguarda PRD-043 |

---

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 18/01/2026 | v1 | Criação inicial |

---

**AILA - Sistemas Inteligentes**
