# Aviso de Atualização Disponível + Modal de Novidades — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quando um novo deploy sobe (qualquer merge na `main`), mostrar um toast persistente avisando que há atualização, com botão para dar hard reload; depois do reload, se a versão semântica mudou, mostrar automaticamente um modal com as novidades da versão (dados já existentes em `public/changelog.json`).

**Architecture:** Dois mecanismos independentes. (1) Um `buildId` (SHA do commit) é embutido no bundle via `define` do Vite e também gravado em `dist/build-meta.json` no fim do build; um hook faz polling desse arquivo e, ao detectar divergência, dispara um toast (sonner) com "Atualizar agora" (`location.reload()`) e "Agora não" (snooze). (2) Um componente compara a versão atual do `changelog.json` com a última vista (localStorage) e mostra um `Dialog` com as mudanças quando ela mudou.

**Tech Stack:** React 18 + TypeScript + Vite, sonner (toast), shadcn/ui Dialog + Button, vitest (testes de função pura, ambiente `node`, sem Testing Library).

## Global Constraints

- Toast aparece no canto inferior direito (posição padrão do `Sonner` já montado em `App.tsx`), em qualquer rota (pública ou autenticada).
- Botão "Atualizar agora" usa `variant="destructive"` (vermelho) — decisão explícita do usuário, replicando a referência visual fornecida.
- Botão "Agora não" usa `variant="outline"`.
- Polling do build-id: a cada 5 minutos (`POLL_INTERVAL_MS = 5 * 60 * 1000`), mais uma checagem extra quando a aba volta a ficar visível/em foco.
- Snooze do "Agora não": 30 minutos (`SNOOZE_MS = 30 * 60 * 1000`), guardado em memória (não persiste em localStorage/sessionStorage).
- Modal de novidades NUNCA aparece na primeira visita de sempre (localStorage sem a chave `recrutars_last_seen_version`) — só grava a versão silenciosamente.
- Sem Service Worker/PWA, sem sincronização entre abas — fora de escopo (ver spec).
- Ambiente de teste do projeto é `node` (vitest.config.ts) — sem `jsdom`/Testing Library. Só funções puras exportadas são testadas; hooks/componentes React são verificados manualmente no navegador.
- Toda vitrine de vitest do projeto vive em `src/**/*.{test,spec}.{ts,tsx}` (padrão já usado em `useViewMode.test.ts`, `usePendingApprovals.test.ts`).

---

### Task 1: `resolveBuildId` — resolve o identificador de build a partir de variáveis de ambiente

**Files:**
- Create: `src/lib/buildId.ts`
- Test: `src/lib/buildId.test.ts`

**Interfaces:**
- Produces: `resolveBuildId(env: Record<string, string | undefined>): string` — usado por `vite.config.ts` na Task 2.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/buildId.test.ts
import { describe, it, expect } from 'vitest';
import { resolveBuildId } from './buildId';

describe('resolveBuildId', () => {
  it('prioriza VERCEL_GIT_COMMIT_SHA quando presente', () => {
    expect(
      resolveBuildId({ VERCEL_GIT_COMMIT_SHA: 'abc123', CF_PAGES_COMMIT_SHA: 'def456' }),
    ).toBe('abc123');
  });

  it('usa CF_PAGES_COMMIT_SHA quando a variável da Vercel não existe', () => {
    expect(resolveBuildId({ CF_PAGES_COMMIT_SHA: 'def456' })).toBe('def456');
  });

  it('cai para "dev" quando nenhuma variável de commit existe', () => {
    expect(resolveBuildId({})).toBe('dev');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/buildId.test.ts`
Expected: FAIL — `Cannot find module './buildId'` (arquivo ainda não existe).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/buildId.ts
export function resolveBuildId(env: Record<string, string | undefined>): string {
  return env.VERCEL_GIT_COMMIT_SHA || env.CF_PAGES_COMMIT_SHA || 'dev';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/buildId.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/buildId.ts src/lib/buildId.test.ts
git commit -m "feat: add resolveBuildId to derive build id from CI env vars"
```

---

### Task 2: Embutir o `buildId` no bundle e gerar `dist/build-meta.json` no build

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/vite-env.d.ts`

**Interfaces:**
- Consumes: `resolveBuildId` (Task 1).
- Produces: constante global `__BUILD_ID__: string` (disponível em todo o app cliente); arquivo `dist/build-meta.json` com `{ "buildId": string }` gerado a cada `npm run build`.

- [ ] **Step 1: Substituir `vite.config.ts` por completo**

```ts
// vite.config.ts
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { resolveBuildId } from "./src/lib/buildId";

function buildMetaPlugin(buildId: string): Plugin {
  let outDir = "dist";
  return {
    name: "write-build-meta",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const outPath = path.resolve(outDir, "build-meta.json");
      fs.writeFileSync(outPath, JSON.stringify({ buildId }));
    },
  };
}

const buildId = resolveBuildId(process.env);

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 3000,
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        headers: {
          'x-api-key': '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',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      },
    },
  },
  plugins: [react(), buildMetaPlugin(buildId)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@react-pdf') || id.includes('pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('recharts') || id.match(/[/\\]d3-/)) return 'vendor-charts';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            if (id.includes('mammoth')) return 'vendor-mammoth';
            return 'vendor';
          }
        }
      }
    }
  },
}));
```

> Nota: a chave `x-api-key` hardcoded acima já existia no arquivo antes desta feature (fora de escopo mexer nela aqui — foi reportada ao usuário separadamente para rotação). A estrutura `() => ({...})` (object-literal implícito) foi mantida propositalmente igual ao original — só a linha `plugins:` muda e o bloco `define:` é inserido — para o diff não recriar o arquivo inteiro (o que faria a linha da chave aparecer como removida+adicionada).

- [ ] **Step 2: Adicionar a declaração de tipo em `src/vite-env.d.ts`**

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

declare const __BUILD_ID__: string;
```

- [ ] **Step 3: Build e verificar o arquivo gerado**

Run: `npm run build`
Expected: build termina sem erro.

Run (bash): `cat dist/build-meta.json`
Expected: `{"buildId":"dev"}` (localmente, sem as env vars de CI, cai no fallback `"dev"`).

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts src/vite-env.d.ts
git commit -m "feat: embed build id in bundle and emit dist/build-meta.json on build"
```

---

### Task 3: `hasNewBuild` / `isSnoozed` — regras puras de quando mostrar/repetir o aviso

**Files:**
- Create: `src/lib/updateChecker.ts`
- Test: `src/lib/updateChecker.test.ts`

**Interfaces:**
- Produces: `hasNewBuild(currentBuildId: string, fetchedBuildId: string | null): boolean`, `isSnoozed(snoozedUntil: number | null, now: number): boolean` — usados por `useUpdateChecker` na Task 4.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/updateChecker.test.ts
import { describe, it, expect } from 'vitest';
import { hasNewBuild, isSnoozed } from './updateChecker';

describe('hasNewBuild', () => {
  it('retorna true quando o build buscado é diferente do atual', () => {
    expect(hasNewBuild('abc', 'def')).toBe(true);
  });

  it('retorna false quando os ids são iguais', () => {
    expect(hasNewBuild('abc', 'abc')).toBe(false);
  });

  it('retorna false quando a busca falhou (null)', () => {
    expect(hasNewBuild('abc', null)).toBe(false);
  });

  it('retorna false para string vazia', () => {
    expect(hasNewBuild('abc', '')).toBe(false);
  });
});

describe('isSnoozed', () => {
  it('retorna true quando "agora" é antes do fim do snooze', () => {
    expect(isSnoozed(2000, 1000)).toBe(true);
  });

  it('retorna false quando "agora" já passou do snooze', () => {
    expect(isSnoozed(1000, 2000)).toBe(false);
  });

  it('retorna false quando não há snooze definido', () => {
    expect(isSnoozed(null, 1000)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/updateChecker.test.ts`
Expected: FAIL — `Cannot find module './updateChecker'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/updateChecker.ts
export function hasNewBuild(currentBuildId: string, fetchedBuildId: string | null): boolean {
  return typeof fetchedBuildId === 'string' && fetchedBuildId.length > 0 && fetchedBuildId !== currentBuildId;
}

export function isSnoozed(snoozedUntil: number | null, now: number): boolean {
  return snoozedUntil !== null && now < snoozedUntil;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/updateChecker.test.ts`
Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/updateChecker.ts src/lib/updateChecker.test.ts
git commit -m "feat: add pure predicates for build-mismatch and snooze window"
```

---

### Task 4: Hook + toast "Atualização disponível"

**Files:**
- Create: `src/hooks/useUpdateChecker.tsx`
- Create: `src/components/update/UpdateAvailableToast.tsx`

**Interfaces:**
- Consumes: `hasNewBuild`, `isSnoozed` (Task 3); `__BUILD_ID__` (Task 2); `toast` de `sonner`; `Button` de `@/components/ui/button`.
- Produces: `useUpdateChecker(): void` (efeito colateral — dispara o toast); `<UpdateAvailableToast />` (componente de montagem, sem props).

- [ ] **Step 1: Implementar o hook**

```tsx
// src/hooks/useUpdateChecker.tsx
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasNewBuild, isSnoozed } from '@/lib/updateChecker';

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const SNOOZE_MS = 30 * 60 * 1000;
const TOAST_ID = 'update-available';

async function fetchBuildId(): Promise<string | null> {
  try {
    const response = await fetch('/build-meta.json', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data?.buildId === 'string' ? data.buildId : null;
  } catch {
    return null;
  }
}

function showUpdateToast(onSnooze: () => void) {
  toast.custom(
    (id) => (
      <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 shadow-lg w-[356px]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Atualização disponível</p>
            <p className="text-sm text-muted-foreground">
              Uma nova versão da plataforma está pronta. Atualize quando puder para aplicar as melhorias.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.dismiss(id);
              onSnooze();
            }}
          >
            Agora não
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Atualizar agora
          </Button>
        </div>
      </div>
    ),
    { id: TOAST_ID, duration: Infinity },
  );
}

export function useUpdateChecker(): void {
  const snoozedUntilRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (isSnoozed(snoozedUntilRef.current, Date.now())) return;
      const fetchedBuildId = await fetchBuildId();
      if (cancelled) return;
      if (hasNewBuild(__BUILD_ID__, fetchedBuildId)) {
        showUpdateToast(() => {
          snoozedUntilRef.current = Date.now() + SNOOZE_MS;
        });
      }
    };

    check();
    const intervalId = window.setInterval(check, POLL_INTERVAL_MS);
    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
    };
  }, []);
}
```

- [ ] **Step 2: Componente de montagem**

```tsx
// src/components/update/UpdateAvailableToast.tsx
import { useUpdateChecker } from '@/hooks/useUpdateChecker';

export function UpdateAvailableToast() {
  useUpdateChecker();
  return null;
}
```

- [ ] **Step 3: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos relacionados a `useUpdateChecker.tsx` ou `UpdateAvailableToast.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useUpdateChecker.tsx src/components/update/UpdateAvailableToast.tsx
git commit -m "feat: poll for new builds and show update-available toast"
```

---

### Task 5: `shouldShowWhatsNew` + leitura/escrita da última versão vista

**Files:**
- Create: `src/lib/whatsNewVersion.ts`
- Test: `src/lib/whatsNewVersion.test.ts`

**Interfaces:**
- Produces: `shouldShowWhatsNew(lastSeenVersion: string | null, currentVersion: string | null): boolean`, `readLastSeenVersion(): string | null`, `writeLastSeenVersion(version: string): void` — usados por `WhatsNewModal` na Task 6.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/whatsNewVersion.test.ts
import { describe, it, expect } from 'vitest';
import { shouldShowWhatsNew } from './whatsNewVersion';

describe('shouldShowWhatsNew', () => {
  it('retorna true quando a versão mudou', () => {
    expect(shouldShowWhatsNew('1.73.0', '1.73.1')).toBe(true);
  });

  it('retorna false quando a versão é a mesma', () => {
    expect(shouldShowWhatsNew('1.73.1', '1.73.1')).toBe(false);
  });

  it('retorna false na primeira visita de sempre (sem última versão vista)', () => {
    expect(shouldShowWhatsNew(null, '1.73.1')).toBe(false);
  });

  it('retorna false enquanto a versão atual ainda não carregou', () => {
    expect(shouldShowWhatsNew('1.73.0', null)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/whatsNewVersion.test.ts`
Expected: FAIL — `Cannot find module './whatsNewVersion'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/whatsNewVersion.ts
const STORAGE_KEY = 'recrutars_last_seen_version';

export function shouldShowWhatsNew(lastSeenVersion: string | null, currentVersion: string | null): boolean {
  return currentVersion !== null && lastSeenVersion !== null && lastSeenVersion !== currentVersion;
}

export function readLastSeenVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeLastSeenVersion(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch {
    // localStorage indisponível (modo privado, cookies bloqueados) — ignora
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/whatsNewVersion.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsNewVersion.ts src/lib/whatsNewVersion.test.ts
git commit -m "feat: add shouldShowWhatsNew and last-seen-version storage helpers"
```

---

### Task 6: `WhatsNewModal` — modal de novidades

**Files:**
- Create: `src/components/update/WhatsNewModal.tsx`

**Interfaces:**
- Consumes: `useCurrentVersion` (já existe em `@/hooks/useChangelog`); `shouldShowWhatsNew`, `readLastSeenVersion`, `writeLastSeenVersion` (Task 5); `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter` (`@/components/ui/dialog`); `Button` (`@/components/ui/button`); tipo `ChangeType` (`@/types/changelog`).
- Produces: `<WhatsNewModal />` (componente de montagem, sem props).

- [ ] **Step 1: Implementar o componente**

```tsx
// src/components/update/WhatsNewModal.tsx
import { useEffect, useState } from 'react';
import { Plus, RefreshCw, AlertTriangle, Trash2, Wrench, Shield, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCurrentVersion } from '@/hooks/useChangelog';
import { shouldShowWhatsNew, readLastSeenVersion, writeLastSeenVersion } from '@/lib/whatsNewVersion';
import type { ChangeType } from '@/types/changelog';
import { cn } from '@/lib/utils';

const changeTypeConfig: Record<ChangeType, { label: string; icon: typeof Plus; color: string }> = {
  added: { label: 'Adicionado', icon: Plus, color: 'text-green-500' },
  changed: { label: 'Alterado', icon: RefreshCw, color: 'text-blue-500' },
  deprecated: { label: 'Descontinuado', icon: AlertTriangle, color: 'text-yellow-500' },
  removed: { label: 'Removido', icon: Trash2, color: 'text-red-500' },
  fixed: { label: 'Corrigido', icon: Wrench, color: 'text-purple-500' },
  security: { label: 'Segurança', icon: Shield, color: 'text-orange-500' },
};

export function WhatsNewModal() {
  const { version, isLoading } = useCurrentVersion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !version) return;
    const lastSeen = readLastSeenVersion();
    if (lastSeen === null) {
      writeLastSeenVersion(version.version);
      return;
    }
    if (shouldShowWhatsNew(lastSeen, version.version)) {
      setOpen(true);
    }
  }, [isLoading, version]);

  if (!version) return null;

  const handleClose = () => {
    writeLastSeenVersion(version.version);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Novidades da versão {version.version}
          </DialogTitle>
          <DialogDescription>{version.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {version.changes.map((category) => {
            const config = changeTypeConfig[category.type];
            const Icon = config.icon;
            return (
              <div key={category.type} className="space-y-2">
                <div className={cn('flex items-center gap-2 font-medium text-sm', config.color)}>
                  <Icon className="w-4 h-4" />
                  {config.label}
                </div>
                <ul className="space-y-1 pl-6">
                  {category.items.map((item, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground list-disc marker:text-muted-foreground/50"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos relacionados a `WhatsNewModal.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/update/WhatsNewModal.tsx
git commit -m "feat: add WhatsNewModal for version-change announcements"
```

---

### Task 7: Montar os dois componentes em `App.tsx`

**Files:**
- Modify: `src/App.tsx:190-232` (imports + JSX)

**Interfaces:**
- Consumes: `<UpdateAvailableToast />` (Task 4), `<WhatsNewModal />` (Task 6).

- [ ] **Step 1: Adicionar os imports**

Adicionar junto aos outros imports de componentes globais (perto de `ChatbotWidget`, por volta da linha 193-194 de `src/App.tsx`):

```tsx
// PRD-040: Chatbot de Suporte
import { ChatbotWidget } from "./components/chatbot";
import { UpdateAvailableToast } from "./components/update/UpdateAvailableToast";
import { WhatsNewModal } from "./components/update/WhatsNewModal";
```

- [ ] **Step 2: Montar os componentes junto aos outros globais**

Localizar este bloco (linha ~228-232 de `src/App.tsx`):

```tsx
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ChatbotWidget />
              <PendingApprovalGate />
```

Substituir por:

```tsx
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ChatbotWidget />
              <PendingApprovalGate />
              <UpdateAvailableToast />
              <WhatsNewModal />
```

- [ ] **Step 3: Checar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: mount update-available toast and whats-new modal globally"
```

---

### Task 8: Testes automatizados + verificação manual no navegador

**Files:** nenhum arquivo novo — validação do que foi construído nas Tasks 1-7.

- [ ] **Step 1: Rodar toda a suíte de testes**

Run: `npm run test`
Expected: todos os testes passam, incluindo os 3 arquivos novos (`buildId.test.ts`, `updateChecker.test.ts`, `whatsNewVersion.test.ts`).

- [ ] **Step 2: Build de produção e checagem do `build-meta.json`**

Run: `npm run build`
Expected: build sem erros; `dist/build-meta.json` existe e contém `{"buildId":"dev"}` (ou o SHA real, se rodado em CI).

- [ ] **Step 3: Verificar o modal de novidades no navegador**

Com o dev server rodando em `http://localhost:3000` (já ativo nesta sessão):
1. Abrir o DevTools do navegador, aba Console.
2. Rodar `localStorage.setItem('recrutars_last_seen_version', '0.0.0')`.
3. Recarregar a página (F5 normal — não precisa ser hard reload aqui).
4. **Esperado:** o modal "Novidades da versão 1.73.1" aparece automaticamente, listando os itens de `public/changelog.json` para a versão atual.
5. Clicar em "Entendi" — modal fecha.
6. Recarregar de novo (F5).
7. **Esperado:** o modal NÃO aparece mais (já foi visto).

- [ ] **Step 4: Verificar o toast de atualização (requer build + preview, pois `build-meta.json` só existe em `dist/`)**

Run: `npm run build && npm run preview` (em background ou outro terminal)
1. Abrir a URL do preview (Vite mostra a porta, ex. `http://localhost:4173`) no navegador.
2. Em outro terminal, sobrescrever o build-id gerado: `echo '{"buildId":"outro-build-simulado"}' > dist/build-meta.json`
3. Voltar à aba do navegador e trocar de aba e voltar (dispara o listener de `visibilitychange`) — ou aguardar até 5 min.
4. **Esperado:** toast "Atualização disponível" aparece no canto inferior direito, com botão vermelho "Atualizar agora" e botão outline "Agora não".
5. Clicar em "Agora não" — toast some.
6. Repetir os passos 2-3, desta vez clicar em "Atualizar agora" — **esperado:** a página recarrega (`location.reload()`).
7. Encerrar o preview server (`Ctrl+C`) ao final.

- [ ] **Step 5: Validação final combinada**

Run: `npx tsc --noEmit && npm run lint && npm run test && npm run build`
Expected: tudo passa sem erros.

- [ ] **Step 6: Commit final (se houver ajustes da verificação manual)**

```bash
git status
# Se houver mudanças pendentes dos passos anteriores:
git add -A
git commit -m "fix: address issues found during manual verification"
```

---

## Depois do plano

Com todas as tasks concluídas na branch `feat/aviso-atualizacao-disponivel`, o próximo passo (fora deste plano) é abrir o PR e aguardar autorização explícita do usuário para mergear — nunca integrar direto na `main`.
