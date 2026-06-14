# Ambiente Stripe em Pacotes & Planos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Desfazer a colisão do termo "Teste" nas telas de admin tornando o controle de ambiente Stripe inequívoco (Abordagem A), padronizando Produção como default e compartilhando os componentes entre Pacotes e Planos.

**Architecture:** Extrair 3 componentes compartilhados (`StripeEnvironmentSelector`, `StripeEnvironmentBanner`, `StripeSyncStatus`) + um helper de microcopy em `src/components/admin/stripe/`, e aplicá-los em `PackagesManagement`/`PackageCard` e `PlansManagement`/`PlanCard`. Sem mudanças de dados, serviços ou Edge Functions — apenas exibição, default e nomenclatura.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind + shadcn/ui (Radix), lucide-react, Framer Motion.

**Spec:** `docs/superpowers/specs/2026-06-14-pacotes-planos-ambiente-stripe-design.md`

---

## Estratégia de verificação (sem test runner)

O projeto **não tem** Vitest/Jest (sem script `test`, nenhum `*.test.tsx` em `src/`). Cada tarefa é verificada por:

- **Lint:** `npm run lint` — sem novos erros.
- **Type-check:** `npx tsc --noEmit -p tsconfig.app.json` — sem erros.
- **Visual:** dev server já rodando em `http://localhost:8080` (rotas `/admin/pacotes` e `/admin/planos`). Login admin: `admin@recrutars.com` / `Admin@123`.
- **Build final:** `npm run build` na última tarefa.

> Commits seguem a política do projeto: confirme com o usuário antes de commitar se ele não tiver autorizado a execução com commits.

## Estrutura de arquivos

**Criar** (`src/components/admin/stripe/`):
- `stripeEnvironmentLabels.ts` — microcopy pt-BR do ambiente (única fonte de verdade dos rótulos).
- `StripeSyncStatus.tsx` — bloco "Sincronização Stripe" com as 2 linhas (Produção/Sandbox). Sem estado.
- `StripeEnvironmentBanner.tsx` — banner âmbar; retorna `null` fora do sandbox.
- `StripeEnvironmentSelector.tsx` — chip recolhido + dropdown (rótulo "Ambiente Stripe").

**Modificar:**
- `src/components/admin/packages/PackageCard.tsx` — usa `StripeSyncStatus`.
- `src/pages/admin/PackagesManagement.tsx` — usa selector + banner; default `live`; título; sincronizar-todos.
- `src/components/admin/plans/PlanCard.tsx` — usa `StripeSyncStatus`; default prop `live`; preserva ação de sync.
- `src/pages/admin/PlansManagement.tsx` — usa selector + banner.
- `src/components/layout/DashboardLayout.tsx` — rename do item de menu.

---

### Task 1: Helper de microcopy do ambiente

**Files:**
- Create: `src/components/admin/stripe/stripeEnvironmentLabels.ts`

- [ ] **Step 1: Criar o helper**

```ts
import type { StripeEnvironment } from '@/types/plans';

/**
 * Rótulos pt-BR do ambiente Stripe (cobrança), exibidos ao usuário.
 * Fonte única de verdade — não duplicar strings de ambiente em componentes.
 */
export const STRIPE_ENV_LABELS: Record<StripeEnvironment, string> = {
  live: 'Produção',
  test: 'Teste (sandbox)',
};
```

- [ ] **Step 2: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/stripe/stripeEnvironmentLabels.ts
git commit -m "feat(admin): add Stripe environment labels helper"
```

---

### Task 2: Componente `StripeSyncStatus`

Mostra o status de sync dos **dois** ambientes ao mesmo tempo. Cor + ícone + texto (acessível).

**Files:**
- Create: `src/components/admin/stripe/StripeSyncStatus.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
import { Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StripeSyncStatusProps {
  liveProductId: string | null;
  liveSyncedAt: string | null;
  testProductId: string | null;
  testSyncedAt: string | null;
  className?: string;
}

interface SyncLineProps {
  label: string;
  synced: boolean;
  syncedAt: string | null;
}

function SyncLine({ label, synced, syncedAt }: SyncLineProps) {
  const dateLabel = synced && syncedAt
    ? new Date(syncedAt).toLocaleDateString('pt-BR')
    : null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        aria-hidden="true"
        className={cn(
          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full',
          synced ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
        )}
      >
        {synced ? <Cloud className="h-2.5 w-2.5" /> : <CloudOff className="h-2.5 w-2.5" />}
      </span>
      <span className="w-[68px] flex-shrink-0 font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">
        {synced ? 'sincronizado' : 'não sincronizado'}
      </span>
      {dateLabel && <span className="ml-auto text-muted-foreground">{dateLabel}</span>}
    </div>
  );
}

export function StripeSyncStatus({
  liveProductId,
  liveSyncedAt,
  testProductId,
  testSyncedAt,
  className,
}: StripeSyncStatusProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Sincronização Stripe
      </h4>
      <SyncLine label="Produção" synced={!!liveProductId} syncedAt={liveSyncedAt} />
      <SyncLine label="Sandbox" synced={!!testProductId} syncedAt={testSyncedAt} />
    </div>
  );
}
```

- [ ] **Step 2: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/stripe/StripeSyncStatus.tsx
git commit -m "feat(admin): add StripeSyncStatus component (dual environment)"
```

---

### Task 3: Componente `StripeEnvironmentBanner`

Banner âmbar de aviso, exibido **somente** no sandbox.

**Files:**
- Create: `src/components/admin/stripe/StripeEnvironmentBanner.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StripeEnvironment } from '@/types/plans';

interface StripeEnvironmentBannerProps {
  environment: StripeEnvironment;
  onSwitchToProduction?: () => void;
  className?: string;
}

export function StripeEnvironmentBanner({
  environment,
  onSwitchToProduction,
  className,
}: StripeEnvironmentBannerProps) {
  if (environment !== 'test') return null;

  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-3 rounded-lg border border-l-4 border-amber-500/45 border-l-amber-500',
        'bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="flex-1">
        <strong className="font-semibold">Ambiente de teste (sandbox) do Stripe.</strong>{' '}
        As ações aqui não afetam cobranças reais — use para validar antes de publicar.
      </p>
      {onSwitchToProduction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSwitchToProduction}
          className="flex-shrink-0 border-amber-500/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
        >
          Voltar para Produção
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/stripe/StripeEnvironmentBanner.tsx
git commit -m "feat(admin): add StripeEnvironmentBanner component"
```

---

### Task 4: Componente `StripeEnvironmentSelector`

Chip recolhido (verde Produção / âmbar Sandbox) + dropdown com as 2 opções descritas. Rótulo "Ambiente Stripe".

**Files:**
- Create: `src/components/admin/stripe/StripeEnvironmentSelector.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
import { Check, ChevronDown, FlaskConical, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { StripeEnvironment } from '@/types/plans';

interface StripeEnvironmentSelectorProps {
  value: StripeEnvironment;
  onChange: (env: StripeEnvironment) => void;
  className?: string;
}

const OPTIONS: { value: StripeEnvironment; label: string; description: string }[] = [
  { value: 'live', label: 'Produção', description: 'Cobranças reais. É onde os clientes compram.' },
  { value: 'test', label: 'Teste (sandbox)', description: 'Valida pacotes sem cobrar de verdade.' },
];

export function StripeEnvironmentSelector({
  value,
  onChange,
  className,
}: StripeEnvironmentSelectorProps) {
  const isTest = value === 'test';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Ambiente Stripe
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Ambiente Stripe: ${isTest ? 'Teste (sandbox)' : 'Produção'}. Clique para alterar.`}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isTest
              ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : 'border-success/40 bg-success/10 text-success'
          )}
        >
          {isTest ? <FlaskConical className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
          {isTest ? 'Teste (sandbox)' : 'Produção'}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="flex items-start gap-2 py-2"
            >
              <Check
                className={cn(
                  'mt-0.5 h-4 w-4 flex-shrink-0',
                  value === opt.value ? 'opacity-100' : 'opacity-0'
                )}
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

- [ ] **Step 2: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/stripe/StripeEnvironmentSelector.tsx
git commit -m "feat(admin): add StripeEnvironmentSelector component"
```

---

### Task 5: `PackageCard` usa `StripeSyncStatus`

Trocar o badge de sync de um ambiente pelo bloco de dois ambientes. A prop `stripeEnv` deixa de ser usada para exibição (o card passa a mostrar ambos); mantemos a prop por enquanto para não quebrar a assinatura — apenas paramos de usá-la no render.

**Files:**
- Modify: `src/components/admin/packages/PackageCard.tsx`

- [ ] **Step 1: Remover o cálculo por-ambiente**

Remover estas linhas (atualmente `63–65`):

```tsx
  const productId = stripeEnv === 'test' ? pkg.stripeProductIdTest : pkg.stripeProductIdLive;
  const syncedAt = stripeEnv === 'test' ? pkg.stripeSyncedAtTest : pkg.stripeSyncedAtLive;
  const isSynced = !!productId;
```

- [ ] **Step 2: Substituir o bloco do badge de sync**

Substituir todo o bloco `{/* Stripe sync badge */}` (atualmente `138–156`):

```tsx
        {/* Stripe sync badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'gap-1 text-xs',
              isSynced
                ? 'text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700'
                : 'text-muted-foreground border-border'
            )}
          >
            {isSynced ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
            {isSynced
              ? (syncedAt
                  ? `Sync ${new Date(syncedAt).toLocaleDateString('pt-BR')}`
                  : 'Stripe sincronizado')
              : 'Não sincronizado'}
          </Badge>
        </div>
```

por:

```tsx
        {/* Stripe sync status — both environments */}
        <StripeSyncStatus
          liveProductId={pkg.stripeProductIdLive}
          liveSyncedAt={pkg.stripeSyncedAtLive}
          testProductId={pkg.stripeProductIdTest}
          testSyncedAt={pkg.stripeSyncedAtTest}
        />
```

- [ ] **Step 3: Ajustar imports**

Adicionar o import do novo componente (junto aos demais imports de `@/components`):

```tsx
import { StripeSyncStatus } from '@/components/admin/stripe/StripeSyncStatus';
```

Em seguida, remover `Cloud` e `CloudOff` do import de `lucide-react` (linhas 9–12) — eles agora vivem dentro de `StripeSyncStatus`. O import deve ficar assim:

```tsx
import {
  Check, Copy, Edit, Power, PowerOff, Trash2,
  RefreshCw, MoreHorizontal, Package,
} from 'lucide-react';
```

> Removidos **apenas** `Cloud` e `CloudOff`; mantenha os demais ícones exatamente como estavam. Não remova `cn` nem `Badge` (seguem em uso no card).

- [ ] **Step 4: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros. Se o `tsc` apontar `stripeEnv` como não usado, ignore (config tem `noUnusedLocals: false`); a prop continua na interface.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/packages/PackageCard.tsx
git commit -m "refactor(packages): show dual-environment sync in PackageCard"
```

---

### Task 6: `PackagesManagement` — selector recolhido, banner, default e rename

**Files:**
- Modify: `src/pages/admin/PackagesManagement.tsx`

- [ ] **Step 1: Trocar o default do ambiente para Produção**

Linha `44`:

```tsx
  const [stripeEnv, setStripeEnv] = useState<StripeEnvironment>('test');
```
por:
```tsx
  const [stripeEnv, setStripeEnv] = useState<StripeEnvironment>('live');
```

- [ ] **Step 2: Renomear o título da página**

Linhas `141–142`:

```tsx
          title="Pacotes de Testes"
          description="Gerencie pacotes de créditos de testes avulsos. Configure preços, recursos e sincronização com Stripe."
```
por:
```tsx
          title="Pacotes de Créditos · Gauge-Pro"
          description="Créditos avulsos de testes Gauge-Pro. Configure preços, recursos e sincronização com o Stripe."
```

- [ ] **Step 3: Substituir o bloco do toggle inline pelos componentes compartilhados**

Substituir todo o bloco `{/* Stripe environment toggle + sync all */}` (atualmente `158–196`) por:

```tsx
        {/* Stripe environment controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {packageCount} {packageCount === 1 ? 'pacote' : 'pacotes'}
            </Badge>
            <div className="ml-auto flex items-end gap-3">
              <StripeEnvironmentSelector value={stripeEnv} onChange={setStripeEnv} />
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isSyncingAll}
                onClick={handleSyncAll}
              >
                <RefreshCw className={cn('mr-1.5 h-3 w-3', isSyncingAll && 'animate-spin')} />
                {isSyncingAll
                  ? 'Sincronizando...'
                  : `Sincronizar todos · ${STRIPE_ENV_LABELS[stripeEnv]}`}
              </Button>
            </div>
          </div>
          <StripeEnvironmentBanner
            environment={stripeEnv}
            onSwitchToProduction={() => setStripeEnv('live')}
          />
        </div>
```

- [ ] **Step 4: Ajustar imports**

Adicionar:

```tsx
import { StripeEnvironmentSelector } from '@/components/admin/stripe/StripeEnvironmentSelector';
import { StripeEnvironmentBanner } from '@/components/admin/stripe/StripeEnvironmentBanner';
import { STRIPE_ENV_LABELS } from '@/components/admin/stripe/stripeEnvironmentLabels';
```

> Mantenha `Badge`, `Button`, `RefreshCw`, `cn` (todos seguem em uso). `Plus` e `Package` continuam usados (botão Novo Pacote / empty state).

- [ ] **Step 5: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros.

- [ ] **Step 6: Verificação visual**

Abra `http://localhost:8080/admin/pacotes`. Confirme:
- Título "Pacotes de Créditos · Gauge-Pro".
- À direita: rótulo "Ambiente Stripe" + chip verde "Produção" (default) e botão "Sincronizar todos · Produção".
- Cada card mostra "Sincronização Stripe" com 2 linhas (Produção / Sandbox).
- Ao abrir o chip e escolher "Teste (sandbox)": chip fica âmbar, surge o banner âmbar, botão vira "Sincronizar todos · Teste (sandbox)". "Voltar para Produção" remove o banner.

- [ ] **Step 7: Commit**

```bash
git add src/pages/admin/PackagesManagement.tsx
git commit -m "feat(packages): collapsed Stripe env selector + sandbox banner + rename"
```

---

### Task 7: `PlanCard` usa `StripeSyncStatus` (preservando a ação de sync)

**Files:**
- Modify: `src/components/admin/plans/PlanCard.tsx`

- [ ] **Step 1: Trocar o default da prop para Produção**

Linha `34`:

```tsx
export function PlanCard({ plan, onEdit, onToggleStatus, onDelete, onClone, index = 0, stripeEnvironment = 'test' }: PlanCardProps) {
```
por:
```tsx
export function PlanCard({ plan, onEdit, onToggleStatus, onDelete, onClone, index = 0, stripeEnvironment = 'live' }: PlanCardProps) {
```

- [ ] **Step 2: Remover o cálculo por-ambiente**

Remover estas linhas (atualmente `40–42`):

```tsx
  const syncedAt = stripeEnvironment === 'test' ? plan.stripeSyncedAtTest : plan.stripeSyncedAtLive;
  const productId = stripeEnvironment === 'test' ? plan.stripeProductIdTest : plan.stripeProductIdLive;
  const isSynced = !!productId;
```

- [ ] **Step 3: Substituir o bloco de sync**

Substituir todo o bloco `{/* PRD-075: Stripe sync badge */}` (atualmente `109–135`):

```tsx
        {/* PRD-075: Stripe sync badge */}
        {!plan.isFree && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'gap-1 text-xs',
                isSynced
                  ? 'text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700'
                  : 'text-muted-foreground border-border'
              )}
            >
              {isSynced ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
              {isSynced ? 'Stripe sincronizado' : 'Não sincronizado'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              disabled={syncPlan.isPending}
              onClick={() => syncPlan.mutate({ planId: plan.id, environment: stripeEnvironment })}
            >
              <RefreshCw className={cn('w-3 h-3 mr-1', syncPlan.isPending && 'animate-spin')} />
              Sync
            </Button>
          </div>
        )}
```

por:

```tsx
        {/* Stripe sync status — both environments + sync action (active env) */}
        {!plan.isFree && (
          <div className="space-y-2">
            <StripeSyncStatus
              liveProductId={plan.stripeProductIdLive}
              liveSyncedAt={plan.stripeSyncedAtLive}
              testProductId={plan.stripeProductIdTest}
              testSyncedAt={plan.stripeSyncedAtTest}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={syncPlan.isPending}
              onClick={() => syncPlan.mutate({ planId: plan.id, environment: stripeEnvironment })}
            >
              <RefreshCw className={cn('mr-1 h-3 w-3', syncPlan.isPending && 'animate-spin')} />
              Sincronizar {STRIPE_ENV_LABELS[stripeEnvironment]}
            </Button>
          </div>
        )}
```

- [ ] **Step 4: Ajustar imports**

Adicionar:

```tsx
import { StripeSyncStatus } from '@/components/admin/stripe/StripeSyncStatus';
import { STRIPE_ENV_LABELS } from '@/components/admin/stripe/stripeEnvironmentLabels';
```

Remover `Cloud` e `CloudOff` do import de `lucide-react` (linha 7). O import deve ficar:

```tsx
import { Check, Copy, Edit, Power, PowerOff, Clock, Percent, RefreshCw, Trash2 } from 'lucide-react';
```

> `RefreshCw` continua em uso (botão de sync). `Badge`, `cn` permanecem.

- [ ] **Step 5: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/plans/PlanCard.tsx
git commit -m "refactor(plans): show dual-environment sync in PlanCard"
```

---

### Task 8: `PlansManagement` usa selector + banner compartilhados

**Files:**
- Modify: `src/pages/admin/PlansManagement.tsx`

- [ ] **Step 1: Substituir o bloco do toggle inline**

Substituir todo o bloco `{/* PRD-075: Stripe environment toggle + sync all */}` (atualmente `104–144`) por:

```tsx
        {/* Stripe environment controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="ml-auto flex items-end gap-3">
              <StripeEnvironmentSelector value={stripeEnv} onChange={setStripeEnv} />
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={syncAll.isPending}
                onClick={() => {
                  syncAll.mutate(stripeEnv, {
                    onSuccess: () => toast.success('Todos os planos sincronizados com Stripe!'),
                    onError: () => toast.error('Erro ao sincronizar planos com Stripe'),
                  });
                }}
              >
                <RefreshCw className={cn('mr-1.5 h-3 w-3', syncAll.isPending && 'animate-spin')} />
                {syncAll.isPending
                  ? 'Sincronizando...'
                  : `Sincronizar todos · ${STRIPE_ENV_LABELS[stripeEnv]}`}
              </Button>
            </div>
          </div>
          <StripeEnvironmentBanner
            environment={stripeEnv}
            onSwitchToProduction={() => setStripeEnv('live')}
          />
        </div>
```

> O default já é `live` (linha 39 — `useState<StripeEnvironment>('live')`); não alterar.

- [ ] **Step 2: Ajustar imports**

Adicionar:

```tsx
import { StripeEnvironmentSelector } from '@/components/admin/stripe/StripeEnvironmentSelector';
import { StripeEnvironmentBanner } from '@/components/admin/stripe/StripeEnvironmentBanner';
import { STRIPE_ENV_LABELS } from '@/components/admin/stripe/stripeEnvironmentLabels';
```

> Remova `Badge` do import — após esta troca ele deixa de ser usado em `PlansManagement` (o único uso era o badge "Stripe:" do bloco removido). `Button`, `RefreshCw`, `cn`, `toast` seguem em uso.

- [ ] **Step 3: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros (resolva eventual import não usado conforme o aviso do lint).

- [ ] **Step 4: Verificação visual**

Abra `http://localhost:8080/admin/planos`. Confirme: mesmo padrão de Pacotes (chip "Produção" default, banner no sandbox, botão "Sincronizar todos · {ambiente}"), e que cada `PlanCard` mostra as 2 linhas de sync + botão "Sincronizar {ambiente}". Alterne as tabs Empresa/Candidato para garantir que nada quebrou.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/PlansManagement.tsx
git commit -m "feat(plans): use shared Stripe env selector + sandbox banner"
```

---

### Task 9: Rename no menu lateral + verificação final

**Files:**
- Modify: `src/components/layout/DashboardLayout.tsx:88`

- [ ] **Step 1: Renomear o item de menu**

Linha `88`:

```tsx
      { href: '/admin/pacotes', label: 'Pacotes de Testes', icon: Package },
```
por:
```tsx
      { href: '/admin/pacotes', label: 'Pacotes de Créditos', icon: Package },
```

- [ ] **Step 2: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit -p tsconfig.app.json`
Expected: sem erros.

- [ ] **Step 3: Build de produção**

Run: `npm run build`
Expected: build conclui sem erros.

- [ ] **Step 4: Verificação visual final**

No `http://localhost:8080`:
- Menu lateral admin mostra "Pacotes de Créditos".
- `/admin/pacotes` e `/admin/planos` abrem em **Produção**, sem banner.
- Trocar para sandbox mostra o banner âmbar nas duas telas.
- Ações dos cards seguem funcionando: Editar, Duplicar, Ativar/Desativar, Excluir, Sincronizar (pacote via menu `⋯`; plano via botão).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/DashboardLayout.tsx
git commit -m "refactor(admin): rename sidebar item to 'Pacotes de Créditos'"
```

---

## Checklist de aceite final (rodar após Task 9)

- [ ] Pacotes e Planos abrem em **Produção** por padrão.
- [ ] Controle de ambiente exibe rótulo "Ambiente Stripe" e não parece filtro de itens.
- [ ] Banner âmbar aparece **apenas** no sandbox, com cor + ícone + texto e botão de retorno.
- [ ] Todo card mostra os **dois** ambientes (Produção/Sandbox) com status de sync.
- [ ] Título da página e item do menu renomeados.
- [ ] Nenhuma mudança em dados/serviços/Edge Functions; sync continua por ambiente.
- [ ] Sem regressão nas ações dos cards.
- [ ] `npm run lint`, `npx tsc --noEmit -p tsconfig.app.json` e `npm run build` passam.

## Notas

- **Não** introduzir framework de testes (fora de escopo; o projeto não usa).
- **Não** alterar tipos, migrações, serviços de Stripe ou Edge Functions.
- Atualizar o changelog (`public/changelog.json` + `src/constants/app.ts`) e bump de versão ficam para o fluxo de versionamento, quando o usuário solicitar — não fazem parte deste plano.
