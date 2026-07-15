# Aviso de atualização disponível + modal de novidades

**Data:** 2026-07-15

## Objetivo

Quando um novo deploy sobe em produção (qualquer merge na `main`, com ou sem bump de versão), avisar quem está com a aba aberta que existe uma versão mais nova do app, oferecendo atualizar agora (hard reload) ou adiar. Depois do reload, se a versão semântica do app realmente mudou (ou seja, rodou o skill de versionamento), mostrar automaticamente um modal com as novidades da versão — hoje isso só existe manualmente na página `/sobre`.

São dois mecanismos independentes, disparados por sinais diferentes:

| | Dispara em | Fonte do dado |
|---|---|---|
| Toast "Atualização disponível" | qualquer novo deploy | build-id (SHA do commit) |
| Modal "O que há de novo" | versão semântica mudou | `public/changelog.json` (já existe) |

## Escopo

Arquivos novos:
- `src/hooks/useUpdateChecker.ts`
- `src/components/update/UpdateAvailableToast.tsx`
- `src/components/update/WhatsNewModal.tsx`

Arquivos modificados:
- `vite.config.ts` — injeta `__BUILD_ID__` e gera `dist/build-meta.json` no build
- `src/vite-env.d.ts` — declaração de tipo do `__BUILD_ID__`
- `src/App.tsx` — monta os dois componentes globalmente

Fora de escopo: Service Worker/PWA, sincronização entre abas, alterar o fluxo do skill de versionamento ou o formato do `changelog.json`.

## Comportamento

### 1. Toast "Atualização disponível"

- Card estilo toast (não bloqueia a tela), canto inferior direito — layout de referência: ícone de foguete, título "Atualização disponível", descrição "Uma nova versão da plataforma está pronta. Atualize quando puder para aplicar as melhorias.", botão vermelho **"Atualizar agora"** + botão outline **"Agora não"**.
- Aparece em qualquer rota, pública ou autenticada.
- Gatilho: a cada 5 minutos, e também quando a aba volta a ficar visível/em foco, o app busca `/build-meta.json` (`cache: 'no-store'`) e compara com o `__BUILD_ID__` embutido no bundle atual. Divergiu → deploy novo aconteceu → mostra o toast.
- **"Atualizar agora"** → `window.location.reload()`.
- **"Agora não"** → fecha o toast e não pergunta de novo por 30 minutos (estado em memória, não precisa persistir — se a aba for fechada/recarregada o problema se resolve sozinho).
- Falha de rede ao buscar `build-meta.json` é silenciosa (mesmo padrão já usado em `useCurrentVersion`) — nunca quebra a tela nem loga erro visível.

### 2. Modal "O que há de novo"

- `Dialog` centralizado (shadcn, mesmo padrão do resto do projeto), diferente do toast acima porque tem mais conteúdo.
- Gatilho: no carregamento do app, compara a versão atual (`isCurrent: true` em `changelog.json`, via `useCurrentVersion()` que já existe) com `localStorage['recrutars_last_seen_version']`.
  - Primeira visita de sempre (chave inexistente): grava a versão silenciosamente, **não** mostra o modal.
  - Versões diferentes: mostra o modal.
  - Mesma versão: não mostra nada.
- Conteúdo: lista as mudanças da versão atual agrupadas por categoria (novidades, corrigido, etc.), mesmos dados/tipos já usados em `VersionAccordion`.
- Botão **"Entendi"** fecha o modal e grava a versão atual no localStorage.

### Por que essa combinação faz sentido

Um merge sem bump de versão dispara o toast de atualização (o código mudou, vale atualizar), mas não dispara o modal de novidades (nada de novo pra contar, porque não passou pelo skill de versionamento). Só quando alguém roda o versionamento é que, no próximo reload, o modal de novidades aparece — sem exigir nenhuma mudança no processo de versionamento já existente.

## Implementação

### Detecção de build/deploy

- `vite.config.ts`: `define: { __BUILD_ID__: JSON.stringify(buildId) }`, onde `buildId = process.env.VERCEL_GIT_COMMIT_SHA || process.env.CF_PAGES_COMMIT_SHA || 'dev'` (cobre Vercel e Cloudflare Pages, os dois hosts que este projeto usa).
- Um plugin Vite inline (hook `closeBundle`) escreve `<outDir>/build-meta.json` com `{ "buildId": "<mesmo valor>" }` — roda automaticamente em `npm run build`, sem script novo no `package.json`.
- `src/vite-env.d.ts`: `declare const __BUILD_ID__: string;`

### `useUpdateChecker`

Hook com polling (`setInterval` 5 min + listener de `visibilitychange`/`focus`), retorna se há atualização disponível e uma função de dispensar (snooze). Sem estado persistido — vive só na sessão da aba.

### Componentes

- `UpdateAvailableToast` — sem UI própria visível por padrão; usa o hook e, quando há atualização, chama `toast.custom(...)` (sonner, já usado no projeto) com o card e os dois botões.
- `WhatsNewModal` — usa `useCurrentVersion()` existente + leitura/escrita de localStorage; renderiza o `Dialog` quando aplicável.
- Ambos montados uma vez em `App.tsx`, junto com `<Toaster />` / `<Sonner />` / `<ChatbotWidget />`.

## Tratamento de erro / limites conhecidos

- `fetch` de `build-meta.json` com erro de rede/404 é ignorado silenciosamente — não trava a UI.
- Abas já abertas **antes** desta feature existir não vão detectar o primeiro deploy dela mesma (limitação de bootstrap, sem solução razoável).
- Sem sincronização entre múltiplas abas abertas do mesmo usuário.
- "Hard reload" aqui é um `location.reload()` padrão — navegadores modernos não permitem mais forçar bypass de cache via JS a partir de um clique; funciona porque Vercel/Cloudflare Pages já servem `index.html` como no-cache por padrão.

## Fora de escopo

- Service Worker / PWA e qualquer cache offline.
- Sincronização entre abas (BroadcastChannel etc.).
- Tornar o "Atualizar agora" obrigatório/sem opção de adiar.
- Mudar o formato do `changelog.json` ou o skill de versionamento.
