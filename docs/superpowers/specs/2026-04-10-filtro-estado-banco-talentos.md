# Filtro de Estado no Banco de Talentos

**Data:** 2026-04-10
**Escopo:** Adicionar filtro por estado brasileiro na sidebar de filtros do Banco de Talentos (empresa)
**Rota:** `/empresa/candidatos`

---

## Contexto

Recrutadores que usam o Banco de Talentos precisam filtrar candidatos por estado. Atualmente só existe o filtro por cidade (campo "Localização"), que mistura todas as cidades sem agrupamento geográfico. Com 200+ candidatos distribuídos por vários estados, encontrar talentos de uma região específica exige rolar a lista inteira.

## Design

### Layout da Sidebar

Nova seção **"Região"** no topo dos filtros, agrupando Estado e Localização:

```
Filtros                                    [Limpar]
─────────────────────────────────────────
REGIÃO
─────────────────────────────────────────
Estado
[Combobox: Todos os estados           ▾]

Localização                          [RS]  ← badge cascata
[Select: Todas as cidades             ▾]

Perfil Comportamental
[Select: Todos os perfis              ▾]

Experiência
[Select: Todas as faixas              ▾]

Skills
[chip] [chip] [chip] ...
```

### Componente: Combobox com busca

O filtro de estado usa um **Combobox** (shadcn/ui `Command` + `Popover`) com campo de busca embutido. O recrutador pode digitar para filtrar os 27 estados ou scrollar a lista.

- **Placeholder:** "Todos os estados"
- **Display:** Nome completo do estado (ex: "Rio Grande do Sul", não "RS")
- **Dados:** Array `brazilianStates` de `src/data/settingsConfig.ts` (já existe, formato `{ value: 'RS', label: 'Rio Grande do Sul' }`)
- **Seleção:** Single-select. Valor armazenado é o código UF (ex: `'RS'`)

### Seção "Região"

- Header: `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
- Separador: `border-b border-border/50` abaixo do header
- Agrupa visualmente Estado + Localização

### Comportamento de Cascata

Quando o recrutador seleciona um estado:

1. O dropdown de Localização mostra **apenas cidades de candidatos que estão naquele estado**
2. Se a cidade previamente selecionada não pertence ao novo estado, reseta para "Todas as cidades"
3. Um **badge com a sigla do estado** (ex: `RS`) aparece ao lado do label "Localização" para indicar que as cidades estão filtradas
4. A lista de candidatos filtra imediatamente por `candidate.state === stateFilter`

Quando o recrutador limpa o estado ("Todos os estados"):

1. O dropdown de Localização volta a mostrar todas as cidades de todos os candidatos
2. O badge de cascata desaparece
3. A seleção de cidade permanece (não é resetada)

### Badge Indicador de Cascata

- Posição: inline ao lado do label "Localização"
- Estilo: `bg-secondary/15 text-secondary text-xs px-1.5 py-0.5 rounded font-semibold`
- Conteúdo: sigla do estado selecionado (ex: "RS", "SP")
- Visibilidade: só aparece quando um estado está selecionado

### Lógica de Filtragem

O filtro de estado é AND-ed com os demais filtros existentes:

```
matchesState = stateFilter === 'all' || candidate.state === stateFilter
matchesLocation = locationFilter === 'all' || candidate.location.includes(locationFilter)
matchesProfile = ...
matchesExperience = ...
matchesSkills = ...

return matchesState && matchesLocation && matchesProfile && matchesExperience && matchesSkills
```

### Integração com Paginação URL

O filtro de estado deve resetar a página para 1 quando alterado (via `resetPage()` do hook `usePaginationParams`).

Adicionar `stateFilter` ao array de dependências do `useEffect` que reseta a paginação.

### Filter Chips

Quando um estado está selecionado, um chip removível deve aparecer na barra de filtros ativos acima da lista:

- Label: nome completo do estado (ex: "Rio Grande do Sul")
- Ao remover: seta `stateFilter` para `'all'`

### "Limpar filtros"

A função `clearFilters()` deve incluir `setStateFilter('all')`.
O `hasActiveFilters` deve considerar `stateFilter !== 'all'`.

### Mobile (Sheet)

O filtro de estado aparece no Sheet lateral com o mesmo layout, incluindo seção "Região" e badge de cascata.

## Dados Disponíveis

| Recurso | Caminho | Uso |
|---------|---------|-----|
| Lista de estados BR | `src/data/settingsConfig.ts` → `brazilianStates` | Opções do combobox |
| Cidades por estado | `src/data/brazilianCities.ts` → `brazilianCitiesByState` | Disponível mas não necessário (cidades vêm dos candidatos) |
| Campo estado no candidato | `candidate.state` (tipo `string?`, código UF) | Filtro principal |
| Campo localização | `candidate.location` (tipo `string`, ex: "Porto Alegre, RS") | Filtro de cidade existente |

## Arquivos a Modificar

1. **`src/pages/empresa/Candidates.tsx`** — adicionar estado de filtro, combobox, seção "Região", cascata, badge, chips, lógica de filtragem
2. **Nenhum outro arquivo** — dados de referência e tipos já existem

## Verificação

1. Selecionar "Rio Grande do Sul" → lista mostra apenas candidatos com `state === 'RS'`
2. Dropdown de cidades mostra apenas cidades de candidatos do RS
3. Badge "RS" aparece ao lado de "Localização"
4. Limpar estado → todas as cidades voltam, badge desaparece
5. Filtro estado combinado com outros filtros (perfil + skills) funciona corretamente
6. Chip de filtro ativo aparece e é removível
7. "Limpar filtros" reseta tudo incluindo estado
8. Paginação reseta ao mudar estado
9. Mobile sheet mostra o mesmo layout
10. Build sem erros TypeScript
