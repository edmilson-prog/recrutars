# Controle de Período de Avaliação por Empresa — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin controla os dias de avaliação de cada empresa individualmente em `/admin/empresas/:id`; empresas novas nascem travadas ("aguardando liberação") com tela acolhedora.

**Architecture:** Fonte de verdade continua `subscriptions.trial_end_date`. Nova coluna `trial_released_at` (NULL = nunca liberado). Admin grava via service layer + React Query (RLS `subscriptions_update` já permite admin — verificado no banco). Trigger `handle_new_user()` passa a criar trial com 0 dias. `TrialGuard` ganha ramificação para a nova página `AwaitingRelease`.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind + shadcn/ui, React Query, Supabase (Postgres + RLS), framer-motion.

**Spec:** `docs/superpowers/specs/2026-06-10-controle-trial-por-empresa-design.md`

**⚠️ Sem test runner no projeto** (sem vitest/jest). Verificação por tarefa: `npx tsc --noEmit`, `npm run lint`, `npm run build` e checklist manual no fim. Dev server roda na **porta 8081** (8080 é outro projeto).

**Fatos verificados no banco (2026-06-10):**
- Policy `subscriptions_update` (cmd UPDATE): `(user_id = auth.uid()) OR (get_user_type(auth.uid()) = 'admin')` → admin JÁ pode atualizar. **Não criar policy nova.**
- Policy `subscriptions_insert` idem para INSERT.
- Trigger `handle_new_user()` deployado = versão da migration 058 (capturado integralmente; a Task 1 parte dele).
- RPC `send_manual_notification` existe e é usada pelo fluxo "Enviar Notificação" do admin.

---

### Task 1: Migration 103 — coluna `trial_released_at` + trigger sem dias automáticos

**Files:**
- Create: `sql/migrations/103_trial_release_control.sql`
- Apply: via MCP `mcp__supabase__apply_migration` (name: `trial_release_control`)

- [ ] **Step 1: Criar o arquivo da migration**

O conteúdo do trigger abaixo é a versão deployada ATUAL (capturada do banco em 2026-06-10) com mudança cirúrgica APENAS no bloco da subscription trial: remove `_trial_days`, datas de término viram `NOW()`. Todo o resto (UPPER, CPF, CNPJ, company_users, invited, onboarding) preservado byte a byte.

```sql
-- Migration 103: Trial release control (PRD spec 2026-06-10)
--
-- 1) subscriptions.trial_released_at: NULL = empresa nunca liberada pelo admin
--    (tela "Aguardando liberação"); preenchido = trial já liberado.
-- 2) Backfill: trials existentes contam como liberados (não são afetados).
-- 3) handle_new_user(): empresa nova nasce com trial de 0 dias (travada).
--    plans.trial_duration_days deixa de conceder dias automáticos — vira
--    apenas default sugerido no input do admin.
--
-- RLS: nenhuma policy nova necessária — subscriptions_update e
-- subscriptions_insert já permitem admin (verificado no banco).

-- 1) Coluna
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_released_at timestamptz;

-- 2) Backfill: trials existentes são considerados "já liberados"
UPDATE public.subscriptions
SET trial_released_at = COALESCE(trial_start_date, created_at, NOW())
WHERE is_trial = TRUE AND trial_released_at IS NULL;

-- 3) Trigger: empresa nova nasce travada (trial 0 dias, trial_released_at NULL)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  _type TEXT;
  _name TEXT;
  _phone TEXT;
  _cpf TEXT;
  _invited BOOLEAN;
  _invited_company_id TEXT;
  _invited_role TEXT;
  _cnpj TEXT;
  _razao_social TEXT;
  _nome_fantasia TEXT;
  _cep TEXT;
  _logradouro TEXT;
  _numero TEXT;
  _complemento TEXT;
  _bairro TEXT;
  _city TEXT;
  _state TEXT;
  _address TEXT;
  _situacao_cadastral TEXT;
  _industry TEXT;
  _size TEXT;
  _basico_plan_id UUID;
BEGIN
  _type  := COALESCE(NEW.raw_user_meta_data->>'type', 'candidate');
  _name  := COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuario');
  _phone := NEW.raw_user_meta_data->>'phone';
  _cpf   := NEW.raw_user_meta_data->>'cpf';
  _invited := COALESCE((NEW.raw_user_meta_data->>'invited')::BOOLEAN, FALSE);

  -- Normalizar nome para UPPERCASE (candidatos E empresas)
  _name := UPPER(_name);

  INSERT INTO public.profiles (id, name, email, type, status, role_id)
  VALUES (
    NEW.id,
    _name,
    NEW.email,
    _type,
    CASE WHEN _invited THEN 'pending' ELSE 'active' END,
    CASE
      WHEN _type = 'candidate' THEN (SELECT id::text FROM public.roles WHERE slug = 'candidate')
      WHEN _type = 'company'   THEN (SELECT id::text FROM public.roles WHERE slug = 'recruiter')
      ELSE NULL
    END
  );

  IF _type = 'candidate' THEN
    INSERT INTO public.candidates (
      profile_id, name, email, phone, cpf, anonymous_id, onboarding_step,
      visibility_mode, visibility_locked
    )
    VALUES (
      NEW.id,
      _name,
      NEW.email,
      _phone,
      _cpf,
      LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0'),
      CASE WHEN _invited THEN 'completed' ELSE 'personal_profile' END,
      CASE WHEN _invited THEN 'private' ELSE 'public' END,
      _invited
    );
  ELSIF _type = 'company' THEN
    _invited_company_id := NEW.raw_user_meta_data->>'invited_company_id';
    _invited_role := COALESCE(NEW.raw_user_meta_data->>'invited_role', 'member');

    IF _invited_company_id IS NOT NULL THEN
      INSERT INTO public.company_users (company_id, profile_id, role)
      VALUES (_invited_company_id::UUID, NEW.id, _invited_role);

      UPDATE public.company_invites
      SET status = 'accepted', accepted_at = NOW()
      WHERE company_id = _invited_company_id::UUID AND email = NEW.email AND status = 'pending';
    ELSE
      _cnpj := NEW.raw_user_meta_data->>'cnpj';
      _razao_social := NEW.raw_user_meta_data->>'razao_social';
      _nome_fantasia := NEW.raw_user_meta_data->>'nome_fantasia';
      _cep := NEW.raw_user_meta_data->>'cep';
      _logradouro := NEW.raw_user_meta_data->>'logradouro';
      _numero := NEW.raw_user_meta_data->>'numero';
      _complemento := NEW.raw_user_meta_data->>'complemento';
      _bairro := NEW.raw_user_meta_data->>'bairro';
      _city := NEW.raw_user_meta_data->>'city';
      _state := NEW.raw_user_meta_data->>'state';
      _address := NEW.raw_user_meta_data->>'address';
      _situacao_cadastral := NEW.raw_user_meta_data->>'situacao_cadastral';
      _industry := NEW.raw_user_meta_data->>'industry';
      _size := NEW.raw_user_meta_data->>'size';

      INSERT INTO public.companies (
        profile_id, name, phone, plan,
        cnpj, razao_social, nome_fantasia,
        cep, logradouro, numero, complemento, bairro,
        city, state, address,
        situacao_cadastral, industry, size
      )
      VALUES (
        NEW.id, _name, _phone, 'Basico Empresas',
        _cnpj, _razao_social, _nome_fantasia,
        _cep, _logradouro, _numero, _complemento, _bairro,
        _city, _state, _address,
        _situacao_cadastral, _industry, _size
      );

      INSERT INTO public.company_users (company_id, profile_id, role)
      VALUES (
        (SELECT id FROM public.companies WHERE profile_id = NEW.id),
        NEW.id,
        'admin'
      );

      SELECT id
      INTO _basico_plan_id
      FROM public.plans
      WHERE slug = 'basico-empresas' AND type = 'company'
      LIMIT 1;

      IF _basico_plan_id IS NOT NULL THEN
        -- Empresa nova nasce TRAVADA: trial de 0 dias, aguardando liberação
        -- manual do admin (trial_released_at fica NULL).
        INSERT INTO public.subscriptions (
          user_id, plan_id, status, period, price_paid,
          start_date, end_date, renewal_date,
          is_trial, trial_start_date, trial_end_date,
          is_early_adopter,
          user_type, user_name, plan_slug, plan_name
        )
        VALUES (
          NEW.id,
          _basico_plan_id,
          'trial',
          'monthly',
          0,
          NOW(),
          NOW(),
          NOW(),
          TRUE,
          NOW(),
          NOW(),
          FALSE,
          'company',
          _name,
          'basico-empresas',
          'Basico Empresas'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
```

- [ ] **Step 2: Aplicar via MCP**

Chamar `mcp__supabase__apply_migration` com `name: "trial_release_control"` e o SQL acima como `query`.

- [ ] **Step 3: Verificar no banco**

Rodar via `mcp__supabase__execute_sql`:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'subscriptions' AND column_name = 'trial_released_at';
-- Esperado: 1 linha

SELECT COUNT(*) AS pendentes FROM public.subscriptions
WHERE is_trial = TRUE AND trial_released_at IS NULL;
-- Esperado: 0 (backfill cobriu todos os trials existentes)

SELECT pg_get_functiondef(oid) LIKE '%_trial_days%' AS still_has_trial_days
FROM pg_proc WHERE proname = 'handle_new_user';
-- Esperado: false
```

- [ ] **Step 4: Commit**

```bash
git add sql/migrations/103_trial_release_control.sql
git commit -m "feat(db): add trial_released_at and lock new company signups"
```

---

### Task 2: Tipos — `trialReleasedAt` no Subscription

**Files:**
- Modify: `src/types/plans.ts` (interface `Subscription`, ~linha 88-92)
- Modify: `src/types/database.ts` (tabela `subscriptions` — Row/Insert/Update)
- Modify: `src/hooks/usePlansQuery.ts` (função `normalizeSubscription`, ~linha 207-232)

- [ ] **Step 1: Adicionar campo na interface `Subscription`** (`src/types/plans.ts`)

Logo após `trialEndDate?: string;` (linha ~92):

```typescript
  /** Trial release control: when the admin released the trial. NULL = awaiting release (blocked). */
  trialReleasedAt?: string | null;
```

- [ ] **Step 2: Adicionar coluna em `src/types/database.ts`**

Localizar a definição da tabela `subscriptions` (buscar `subscriptions:` no arquivo). Adicionar em Row:

```typescript
        trial_released_at: string | null
```

E em Insert/Update (se a tabela tiver esses blocos separados, como as demais):

```typescript
        trial_released_at?: string | null
```

- [ ] **Step 3: Mapear no `normalizeSubscription`** (`src/hooks/usePlansQuery.ts`)

Logo após a linha `trialEndDate: ...` (linha ~225):

```typescript
    trialReleasedAt: (raw.trialReleasedAt ?? raw.trial_released_at ?? null) as string | null,
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit 2>&1 | Select-String "plans.ts|database.ts|usePlansQuery"`
Expected: nenhum erro novo nesses arquivos.

- [ ] **Step 5: Commit**

```bash
git add src/types/plans.ts src/types/database.ts src/hooks/usePlansQuery.ts
git commit -m "feat(types): add trialReleasedAt to Subscription model"
```

---

### Task 3: Service layer — `adminSetTrialPeriod` e `adminEndTrial`

**Files:**
- Modify: `src/services/plans/plansService.ts` (interface `IPlansService`, após `createTrialSubscription`, ~linha 97)
- Modify: `src/services/plans/plansService.supabase.ts` (após `createTrialSubscription`, ~linha 530)

- [ ] **Step 1: Adicionar assinaturas na interface** (`plansService.ts`, antes do `}` da interface, linha ~98)

```typescript
  /** Admin: release (or extend) a company's trial by N days. Creates the trial row if missing. */
  adminSetTrialPeriod(userId: string, days: number): Promise<Subscription>;

  /** Admin: end a company's trial immediately (sets trial_end_date to yesterday). */
  adminEndTrial(userId: string): Promise<Subscription>;
```

- [ ] **Step 2: Implementar no `plansService.supabase.ts`**

Adicionar após o método `createTrialSubscription` (que termina ~linha 530). Notas de design embutidas:
- "Encerrar" usa `ontem` porque `isExpired = daysRemaining < 0` em `trialRules.ts` (data de hoje = "último dia", ainda com acesso).
- `.select()` após UPDATE é obrigatório: RLS bloqueado retorna 0 linhas sem erro (memória do projeto).
- Auditoria (`subscription_history`) e notificação (RPC `send_manual_notification`) são best-effort: falha não desfaz a liberação (mesmo padrão do `handleChangePlan`).

```typescript
  // ---------------------------------------------------------------------------
  // Trial release control (admin) — spec 2026-06-10
  // ---------------------------------------------------------------------------

  /** Formats YYYY-MM-DD as DD/MM/YYYY for user-facing messages. */
  private formatDateBRString(isoDate: string): string {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  }

  async adminSetTrialPeriod(userId: string, days: number): Promise<Subscription> {
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      throw new Error('Informe um período entre 1 e 365 dias.');
    }

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const today = new Date();

    const existing = await this.getTrialSubscription(userId);

    let updatedSub: Subscription;
    let endIso: string;
    let action: 'released' | 'extended';

    if (!existing) {
      // Legacy company without a trial row: create one, already released.
      const { data: planRow, error: planErr } = await supabase
        .from('plans')
        .select('id, slug, name')
        .eq('slug', 'basico-empresas')
        .eq('type', 'company')
        .single();
      if (planErr || !planRow) throw new Error('Plano Básico Empresas não encontrado.');

      const { data: companyRow } = await supabase
        .from('companies')
        .select('name')
        .eq('profile_id', userId)
        .maybeSingle();

      const end = new Date(today);
      end.setDate(end.getDate() + days);
      endIso = fmt(end);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          user_type: 'company',
          user_name: companyRow?.name ?? '',
          plan_id: planRow.id,
          plan_slug: planRow.slug,
          plan_name: planRow.name,
          period: 'monthly',
          price_paid: 0,
          start_date: fmt(today),
          end_date: endIso,
          renewal_date: endIso,
          status: 'trial',
          is_trial: true,
          trial_start_date: fmt(today),
          trial_end_date: endIso,
          is_early_adopter: false,
          trial_released_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      updatedSub = data as unknown as Subscription;
      action = 'released';
    } else {
      const raw = existing as unknown as Record<string, unknown>;
      const subscriptionId = raw.id as string;
      const releasedAt = (raw.trial_released_at ?? raw.trialReleasedAt) as string | null | undefined;
      const currentEnd = (raw.trial_end_date ?? raw.trialEndDate) as string | undefined;

      // Active trial (released + end date today or later) extends from the
      // current end; awaiting/expired trials restart from today.
      const isActiveTrial =
        Boolean(releasedAt) && !!currentEnd && currentEnd.split('T')[0] >= fmt(today);
      const base = isActiveTrial ? new Date(currentEnd as string) : today;
      const end = new Date(base);
      end.setDate(end.getDate() + days);
      endIso = fmt(end);

      const updates: Record<string, unknown> = {
        status: 'trial',
        is_trial: true,
        trial_end_date: endIso,
        end_date: endIso,
        renewal_date: endIso,
      };
      if (!isActiveTrial) updates.trial_start_date = fmt(today);
      if (!releasedAt) updates.trial_released_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Nenhuma linha atualizada — verifique as permissões (RLS).');
      }
      updatedSub = data[0] as unknown as Subscription;
      action = isActiveTrial ? 'extended' : 'released';
    }

    const endBR = this.formatDateBRString(endIso);
    const subRaw = updatedSub as unknown as Record<string, unknown>;

    // Best-effort audit trail — must not undo the release on failure.
    try {
      await supabase.from('subscription_history').insert({
        subscription_id: subRaw.id,
        action: action === 'extended' ? 'renewed' : 'reactivated',
        to_plan_id: subRaw.plan_id ?? null,
        notes:
          action === 'extended'
            ? `Avaliação estendida pelo admin em ${days} dias (até ${endBR}).`
            : `Avaliação liberada pelo admin por ${days} dias (até ${endBR}).`,
      });
    } catch (err) {
      console.warn('[Plans] adminSetTrialPeriod: history insert failed (non-fatal):', err);
    }

    // Best-effort in-app notification to the company user.
    try {
      await supabase.rpc('send_manual_notification', {
        p_title:
          action === 'extended'
            ? 'Período de avaliação estendido'
            : 'Período de avaliação liberado',
        p_description:
          action === 'extended'
            ? `Sua avaliação foi estendida até ${endBR}. Bom recrutamento!`
            : `Sua avaliação foi liberada até ${endBR}. Bom recrutamento!`,
        p_action_url: null,
        p_category: 'informativo',
        p_priority: 'media',
        p_target_type: 'specific_user',
        p_target_user_id: userId,
        p_scheduled_at: null,
        p_template_id: null,
      });
    } catch (err) {
      console.warn('[Plans] adminSetTrialPeriod: notification failed (non-fatal):', err);
    }

    return updatedSub;
  }

  async adminEndTrial(userId: string): Promise<Subscription> {
    const existing = await this.getTrialSubscription(userId);
    if (!existing) throw new Error('Esta empresa não possui assinatura de avaliação.');

    const raw = existing as unknown as Record<string, unknown>;
    const subscriptionId = raw.id as string;

    // Yesterday: trialRules treats daysRemaining < 0 as expired, so today's
    // date would still grant access ("último dia").
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endIso = yesterday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        trial_end_date: endIso,
        end_date: endIso,
        renewal_date: endIso,
      })
      .eq('id', subscriptionId)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nenhuma linha atualizada — verifique as permissões (RLS).');
    }

    try {
      await supabase.from('subscription_history').insert({
        subscription_id: subscriptionId,
        action: 'expired',
        from_plan_id: raw.plan_id ?? null,
        notes: 'Avaliação encerrada manualmente pelo admin.',
      });
    } catch (err) {
      console.warn('[Plans] adminEndTrial: history insert failed (non-fatal):', err);
    }

    return data[0] as unknown as Subscription;
  }
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit 2>&1 | Select-String "plansService"`
Expected: nenhum erro.

- [ ] **Step 4: Commit**

```bash
git add src/services/plans/plansService.ts src/services/plans/plansService.supabase.ts
git commit -m "feat(plans): add adminSetTrialPeriod and adminEndTrial service methods"
```

---

### Task 4: Hooks React Query

**Files:**
- Modify: `src/hooks/usePlansQuery.ts` (final do arquivo, após `useCreateTrialSubscription`)

- [ ] **Step 1: Adicionar os dois hooks de mutação**

```typescript
/** Admin: release or extend a company's trial period by N days. */
export function useAdminSetTrialPeriod() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, days }: { userId: string; days: number }) => {
      const svc = await getPlansService();
      return svc.adminSetTrialPeriod(userId, days);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] });
    },
    onError: (err) => {
      console.error('[Plans] adminSetTrialPeriod failed:', err);
    },
  });
}

/** Admin: end a company's trial immediately. */
export function useAdminEndTrial() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const svc = await getPlansService();
      return svc.adminEndTrial(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] });
    },
    onError: (err) => {
      console.error('[Plans] adminEndTrial failed:', err);
    },
  });
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit 2>&1 | Select-String "usePlansQuery"`
Expected: nenhum erro.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePlansQuery.ts
git commit -m "feat(plans): add admin trial period mutation hooks"
```

---

### Task 5: `useTrialStatus.awaitingRelease` + ramificação no `TrialGuard`

**Files:**
- Modify: `src/hooks/useTrialStatus.ts`
- Modify: `src/components/trial/TrialGuard.tsx`

- [ ] **Step 1: Expor `awaitingRelease` no hook** (`useTrialStatus.ts`)

Substituir o bloco do retorno (linhas 20-56) por:

```typescript
interface UseTrialStatusReturn {
  trialStatus: TrialStatus;
  isLoading: boolean;
  isTrial: boolean;
  isExpired: boolean;
  /** True when the trial was never released by the admin (blocked, awaiting). */
  awaitingRelease: boolean;
  daysRemaining: number;
  warningLevel: TrialWarningLevel;
}

export function useTrialStatus(): UseTrialStatusReturn {
  const { user } = useAuth();
  const { data: subscription, isLoading } = useSubscription(user?.id);

  const trialStatus = useMemo<TrialStatus>(() => {
    if (!subscription || !subscription.isTrial) {
      return getNoTrialStatus();
    }

    if (!subscription.trialStartDate || !subscription.trialEndDate) {
      return getNoTrialStatus();
    }

    return calculateTrialStatus(
      subscription.trialStartDate,
      subscription.trialEndDate,
    );
  }, [subscription]);

  const awaitingRelease = Boolean(
    subscription?.isTrial && !subscription?.trialReleasedAt,
  );

  return {
    trialStatus,
    isLoading,
    isTrial: trialStatus.isTrial,
    isExpired: trialStatus.isExpired,
    awaitingRelease,
    daysRemaining: trialStatus.daysRemaining,
    warningLevel: trialStatus.warningLevel,
  };
}
```

Atenção: `awaitingRelease` deriva da **subscription**, não do `trialStatus` — uma empresa travada tem `trial_end_date = NOW()` (não conta como `isExpired` no dia do cadastro, pois `daysRemaining = 0`), por isso a flag separada.

- [ ] **Step 2: Ramificar o `TrialGuard`** (`TrialGuard.tsx`)

Substituir o corpo do componente (a partir da linha 15) por:

```typescript
const LazyTrialExpired = lazy(() => import('@/pages/empresa/TrialExpired'));
const LazyAwaitingRelease = lazy(() => import('@/pages/empresa/AwaitingRelease'));

interface TrialGuardProps {
  children: ReactNode;
}

/** Routes accessible even when trial is expired or awaiting release */
const ALLOWED_EXPIRED_PATHS = [
  '/empresa/configuracoes',
  '/empresa/meu-plano',
  '/empresa/checkout/sucesso',
  '/empresa/checkout/cancelado',
];

const guardFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

export function TrialGuard({ children }: TrialGuardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { isTrial, isExpired, isLoading, awaitingRelease } = useTrialStatus();

  // Only applies to company users
  if (!user || user.type !== 'company') {
    return <>{children}</>;
  }

  // While loading subscription data, show children (avoid flash)
  if (isLoading) {
    return <>{children}</>;
  }

  const isAllowedPath = ALLOWED_EXPIRED_PATHS.some(
    (path) => location.pathname.startsWith(path),
  );

  // Trial never released by the admin — welcoming "awaiting release" page.
  // Checked BEFORE isExpired: a just-created locked trial has end date = today,
  // which does not count as expired yet (daysRemaining = 0).
  if (isTrial && awaitingRelease) {
    if (isAllowedPath) return <>{children}</>;
    return (
      <Suspense fallback={guardFallback}>
        <LazyAwaitingRelease />
      </Suspense>
    );
  }

  // If not on trial or trial is active, allow through
  if (!isTrial || !isExpired) {
    return <>{children}</>;
  }

  if (isAllowedPath) {
    return <>{children}</>;
  }

  // Render the conversion page
  return (
    <Suspense fallback={guardFallback}>
      <LazyTrialExpired />
    </Suspense>
  );
}
```

- [ ] **Step 3: Verificar tipos** (o `AwaitingRelease` ainda não existe — o tsc vai acusar o import; isso é esperado e a Task 6 resolve. Se preferir ordem limpa, execute a Task 6 antes deste commit e committe as duas juntas. Caso contrário:)

Run: `npx tsc --noEmit 2>&1 | Select-String "TrialGuard|useTrialStatus"`
Expected: apenas o erro do import de `AwaitingRelease` (resolvido na Task 6).

- [ ] **Step 4: NÃO commitar ainda** — commit conjunto no fim da Task 6.

---

### Task 6: Página `AwaitingRelease` (tela acolhedora)

**Files:**
- Create: `src/pages/empresa/AwaitingRelease.tsx`

- [ ] **Step 1: Criar a página**

Reaproveita o esqueleto do `TrialExpired.tsx` (seletor de período + grid de planos + CheckoutButton). Difere no hero (emerald/cyan, check de sucesso), no bloco de passos e no copy (vocabulário de espera/oportunidade — nunca "bloqueado/encerrado/expirado").

```tsx
/**
 * AwaitingRelease Page
 * Spec 2026-06-10: Welcoming fullscreen page for newly registered companies
 * whose trial was not yet released by the admin (trial_released_at IS NULL).
 *
 * - Success-toned hero (account created, awaiting team release)
 * - 3-step timeline (created -> awaiting -> full access)
 * - Optional shortcut: subscribe to a paid plan right away
 * - Link to account settings (allowed even while locked)
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CircleCheckBig, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { usePlans } from '@/hooks/usePlans';
import { CheckoutButton } from '@/components/billing/CheckoutButton';
import type { PlanPeriod } from '@/types';

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

export default function AwaitingRelease() {
  const { companyPlans } = usePlans();
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the heading so screen readers announce the status immediately
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const paidPlans = companyPlans.filter((p) => !p.isFree && p.isActive);
  const isDiscountPeriod = selectedPeriod === 'semiannual' || selectedPeriod === 'annual';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero — success tone, never punitive */}
      <div className="bg-gradient-to-br from-cyan-500/10 via-background to-emerald-500/10 py-12 px-4 text-center border-b border-border">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10"
        >
          <CircleCheckBig className="h-8 w-8 text-emerald-500" aria-hidden="true" />
        </motion.div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl md:text-4xl font-bold text-foreground mb-3 outline-none"
        >
          Sua conta foi criada com sucesso!
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Nossa equipe vai liberar seu período de avaliação em instantes.
          Você receberá um aviso assim que estiver tudo pronto.
        </p>
      </div>

      {/* Steps timeline */}
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <ol className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-8">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-foreground">Conta criada</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15">
              <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-cyan-500/60 motion-reduce:hidden" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
            </span>
            <span className="text-sm font-medium text-foreground">Aguardando liberação</span>
          </li>
          <li className="flex items-center gap-3 opacity-60">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground text-sm">
              3
            </span>
            <span className="text-sm text-muted-foreground">Acesso completo</span>
          </li>
        </ol>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Liberações costumam levar poucos minutos em horário comercial.
        </p>
      </div>

      {/* Divider — optional shortcut */}
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-sm font-medium text-muted-foreground text-center">
            Não quer esperar? Assine um plano e comece a recrutar agora mesmo.
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      {/* Period selector */}
      <div className="container max-w-5xl mx-auto px-4 py-4">
        <div
          className="flex items-center justify-center gap-2 flex-wrap"
          role="group"
          aria-label="Período de cobrança"
        >
          {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              aria-pressed={selectedPeriod === period}
              className="relative"
            >
              {PERIOD_LABELS[period]}
              {(period === 'semiannual' || period === 'annual') && (
                <Badge className="ml-1.5 text-[9px] px-1 py-0 h-3.5 bg-green-500 text-white border-0">
                  -10%
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Plans comparison */}
      <div className="container max-w-5xl mx-auto px-4 py-8 flex-1">
        <div className="grid md:grid-cols-3 gap-6">
          {paidPlans.map((plan, index) => {
            const basePrice = plan.prices.monthly ?? 0;
            const periodPrice = plan.prices[selectedPeriod] ?? basePrice;
            const hasDiscount = isDiscountPeriod && periodPrice < basePrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'bg-card rounded-2xl p-6 shadow-soft relative border',
                  plan.badge === 'Mais popular'
                    ? 'border-2 border-secondary ring-4 ring-secondary/20'
                    : 'border-border',
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.descriptionShort}</p>

                  <div className="flex items-baseline justify-center gap-1">
                    {hasDiscount && (
                      <span className="text-lg text-muted-foreground line-through mr-1">
                        {formatBRL(basePrice)}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-foreground">
                      {formatBRL(periodPrice)}
                    </span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>

                  {hasDiscount && (
                    <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                      10% de desconto
                    </Badge>
                  )}

                  {plan.bonusTests && isDiscountPeriod && (
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 font-medium">
                      + {plan.bonusTests[selectedPeriod] ?? 0} testes comportamentais de bonus
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <CheckoutButton
                  planId={plan.id}
                  planName={plan.name}
                  period={selectedPeriod}
                  variant={plan.badge === 'Mais popular' ? 'default' : 'outline'}
                  className="w-full"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer link to settings */}
      <div className="text-center py-6 border-t border-border">
        <Link
          to="/empresa/configuracoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          Acessar configurações da conta
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit 2>&1 | Select-String "AwaitingRelease|TrialGuard|useTrialStatus"`
Expected: nenhum erro (o import pendente da Task 5 agora resolve).

Run: `npm run lint 2>&1 | Select-String "AwaitingRelease|TrialGuard|useTrialStatus"`
Expected: nenhum erro.

- [ ] **Step 3: Commit (Tasks 5 + 6 juntas)**

```bash
git add src/hooks/useTrialStatus.ts src/components/trial/TrialGuard.tsx src/pages/empresa/AwaitingRelease.tsx
git commit -m "feat(empresa): add awaiting-release gate and welcoming locked page"
```

---

### Task 7: Card "Período de Avaliação" no admin

**Files:**
- Create: `src/components/admin/companies/TrialPeriodCard.tsx`
- Modify: `src/pages/admin/CompanyDetail.tsx` (aba Assinatura, ~linha 893-899)

- [ ] **Step 1: Criar o componente `TrialPeriodCard`**

Estrutura em 3 faixas (design-specialist): estado → controles → ação destrutiva. Estados derivados de `calculateTrialStatus`/`getWarningLevel` (`@/lib/trialRules`) + `trialReleasedAt`. Cuidado async do `AlertDialogAction` (preventDefault + fechar no finally — memória do projeto).

```tsx
/**
 * TrialPeriodCard — Admin control for a company's trial period.
 * Spec 2026-06-10: per-company trial release/extend/end from /admin/empresas/:id.
 *
 * Three vertical bands: current state (high contrast) -> controls -> destructive action.
 * State colors mirror TrialAlert (amber = high, red = urgent/expired).
 */

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  Info,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSubscription, useAdminSetTrialPeriod, useAdminEndTrial } from '@/hooks/usePlansQuery';
import { calculateTrialStatus, getWarningLevel } from '@/lib/trialRules';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type TrialCardState = 'awaiting' | 'active' | 'expiring' | 'expired' | 'paid';

interface TrialPeriodCardProps {
  /** Company auth user id (companies.profile_id / subscriptions.user_id) */
  userId: string | undefined;
  companyName: string;
  /** Suggested default for the days input (plans.trial_duration_days) */
  defaultDays?: number;
  /** Registers an entry in the page's admin actions timeline */
  onActionRegistered?: (details: string) => void;
}

const QUICK_DAYS = [7, 15, 30, 90];

function formatDateBRFromISO(iso: string): string {
  const datePart = iso.split('T')[0];
  const [y, m, d] = datePart.split('-');
  return `${d}/${m}/${y}`;
}

function addDaysISO(baseISO: string | null, days: number): string {
  const base = baseISO ? new Date(baseISO) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
}

const STATE_CONFIG: Record<
  TrialCardState,
  { icon: typeof Clock; band: string; iconWrap: string; iconColor: string; title: string }
> = {
  awaiting: {
    icon: Clock,
    band: 'border-border bg-muted/30',
    iconWrap: 'bg-muted',
    iconColor: 'text-muted-foreground',
    title: 'Aguardando liberação',
  },
  active: {
    icon: CalendarCheck,
    band: 'border-cyan-500/30 bg-cyan-500/5',
    iconWrap: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
    title: 'Em avaliação',
  },
  expiring: {
    icon: AlertTriangle,
    band: 'border-amber-500/30 bg-amber-500/5',
    iconWrap: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    title: 'Avaliação terminando',
  },
  expired: {
    icon: CalendarX,
    band: 'border-red-500/30 bg-red-500/5',
    iconWrap: 'bg-red-500/10',
    iconColor: 'text-red-500',
    title: 'Avaliação expirada',
  },
  paid: {
    icon: BadgeCheck,
    band: 'border-emerald-500/30 bg-emerald-500/5',
    iconWrap: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    title: 'Assinante ativo',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TrialPeriodCard({
  userId,
  companyName,
  defaultDays = 90,
  onActionRegistered,
}: TrialPeriodCardProps) {
  const { data: subscription, isLoading } = useSubscription(userId);
  const setTrialMutation = useAdminSetTrialPeriod();
  const endTrialMutation = useAdminEndTrial();

  const [days, setDays] = useState<number>(defaultDays);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  // ---------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------

  const trialStatus = useMemo(() => {
    if (!subscription?.isTrial || !subscription.trialStartDate || !subscription.trialEndDate) {
      return null;
    }
    return calculateTrialStatus(subscription.trialStartDate, subscription.trialEndDate);
  }, [subscription]);

  const cardState: TrialCardState = useMemo(() => {
    if (subscription && !subscription.isTrial) return 'paid';
    if (!subscription || !subscription.trialReleasedAt) return 'awaiting';
    if (!trialStatus) return 'awaiting';
    if (trialStatus.isExpired) return 'expired';
    const level = getWarningLevel(trialStatus.daysRemaining);
    if (level === 'high' || level === 'urgent') return 'expiring';
    return 'active';
  }, [subscription, trialStatus]);

  const isTrialRunning = cardState === 'active' || cardState === 'expiring';
  const endDateISO = subscription?.trialEndDate ?? null;
  const previewISO = useMemo(
    () => addDaysISO(isTrialRunning ? endDateISO : null, days || 0),
    [isTrialRunning, endDateISO, days],
  );
  const previewBR = formatDateBRFromISO(previewISO);
  const daysValid = Number.isInteger(days) && days >= 1 && days <= 365;
  const isPending = setTrialMutation.isPending || endTrialMutation.isPending;

  const config = STATE_CONFIG[cardState];
  const StateIcon =
    cardState === 'expiring' && trialStatus && getWarningLevel(trialStatus.daysRemaining) === 'urgent'
      ? Zap
      : config.icon;

  // ---------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------

  const handleConfirmSet = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // AlertDialogAction auto-closes; close manually in finally
    if (!userId || !daysValid) return;
    try {
      await setTrialMutation.mutateAsync({ userId, days });
      const verb = isTrialRunning ? 'estendida' : 'liberada';
      toast.success(`Avaliação ${verb} até ${previewBR}.`);
      onActionRegistered?.(
        isTrialRunning
          ? `Avaliação estendida em ${days} dias (até ${previewBR})`
          : `Avaliação liberada por ${days} dias (até ${previewBR})`,
      );
    } catch {
      toast.error('Não foi possível atualizar o período. Tente novamente.');
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleConfirmEnd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await endTrialMutation.mutateAsync({ userId });
      toast.success('Avaliação encerrada.');
      onActionRegistered?.('Avaliação encerrada manualmente');
    } catch {
      toast.error('Não foi possível encerrar a avaliação. Tente novamente.');
    } finally {
      setEndOpen(false);
    }
  };

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  if (isLoading) return null;

  return (
    <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Período de avaliação</h4>

      {/* Band 1: current state */}
      <div className={cn('flex items-start gap-4 rounded-lg border p-4', config.band)} role="status">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.iconWrap)}>
          <StateIcon className={cn('h-5 w-5', config.iconColor)} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{config.title}</p>
          <p className="text-sm text-muted-foreground">
            {cardState === 'awaiting' &&
              'Esta empresa ainda não teve o período de avaliação liberado.'}
            {cardState === 'active' && trialStatus && (
              <>
                <span className="font-medium text-cyan-600 dark:text-cyan-400">
                  {trialStatus.daysRemaining} dias
                </span>{' '}
                restantes · termina em {formatDateBRFromISO(trialStatus.endDate)}
              </>
            )}
            {cardState === 'expiring' && trialStatus && (
              <>
                Faltam{' '}
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {trialStatus.daysRemaining} dias
                </span>
                . Termina em {formatDateBRFromISO(trialStatus.endDate)}.
              </>
            )}
            {cardState === 'expired' && trialStatus && (
              <>Encerrou em {formatDateBRFromISO(trialStatus.endDate)}. A empresa está bloqueada.</>
            )}
            {cardState === 'paid' &&
              'Controle de avaliação não se aplica a assinantes pagos.'}
          </p>
          {/* Progress bar for running trials */}
          {isTrialRunning && trialStatus && trialStatus.totalDays > 0 && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  cardState === 'expiring' ? 'bg-amber-500' : 'bg-cyan-500',
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, (trialStatus.daysElapsed / trialStatus.totalDays) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Band 2: controls (or explanatory note for paid subscribers) */}
      {cardState === 'paid' ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Esta empresa possui assinatura paga ativa. O período de avaliação não se aplica.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Label
            htmlFor="trialDays"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {isTrialRunning ? 'Estender em mais quantos dias?' : 'Dias de avaliação a partir de hoje'}
          </Label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              id="trialDays"
              type="number"
              min={1}
              max={365}
              inputMode="numeric"
              placeholder="Ex.: 14"
              value={Number.isNaN(days) ? '' : days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              aria-describedby="trialDaysPreview"
              aria-invalid={!daysValid}
              className="w-full sm:w-32"
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de período">
              {QUICK_DAYS.map((d) => (
                <Button
                  key={d}
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                  className={cn(
                    days === d &&
                      'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                  )}
                >
                  +{d} dias
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            id="trialDaysPreview"
            className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm"
            aria-live="polite"
          >
            <CalendarClock className="h-4 w-4 text-cyan-500" aria-hidden="true" />
            <span className="text-muted-foreground">Novo término:</span>
            <motion.span
              key={previewBR}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-semibold text-foreground"
            >
              {daysValid ? previewBR : '—'}
            </motion.span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setConfirmOpen(true)} disabled={!daysValid || !userId || isPending}>
              {isTrialRunning ? 'Estender avaliação' : 'Liberar avaliação'}
            </Button>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              Esta ação será registrada no histórico da empresa.
            </p>
          </div>
        </div>
      )}

      {/* Band 3: destructive action — only for running trials */}
      {isTrialRunning && (
        <div className="border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEndOpen(true)}
            disabled={isPending}
            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500 focus-visible:ring-red-500"
          >
            Encerrar agora
          </Button>
        </div>
      )}

      {/* Confirm release/extend */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isTrialRunning
                ? `Estender avaliação até ${previewBR}?`
                : 'Liberar período de avaliação?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isTrialRunning
                ? `A avaliação de ${companyName} passará a terminar em ${previewBR}. A empresa receberá uma notificação no app.`
                : `${companyName} terá acesso completo até ${previewBR} e receberá uma notificação no app.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSet} disabled={isPending}>
              {isPending ? 'Confirmando...' : 'Confirmar liberação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm end now */}
      <AlertDialog open={endOpen} onOpenChange={setEndOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar avaliação agora?</AlertDialogTitle>
            <AlertDialogDescription>
              {companyName} perderá o acesso imediatamente e verá a tela de bloqueio.
              Esta ação pode ser revertida liberando um novo período.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter avaliação</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEnd}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Encerrando...' : 'Encerrar acesso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

- [ ] **Step 2: Integrar no `CompanyDetail.tsx`**

2a. Adicionar import (junto ao import do `CompanySubscriptionTab`, linha ~83):

```typescript
import { TrialPeriodCard } from '@/components/admin/companies/TrialPeriodCard';
```

2b. Inserir o card na aba Assinatura, ENTRE o `<div>` do "Plano Atual" (fecha na linha ~892) e o `<CompanySubscriptionTab>` (linha ~895). O bloco fica:

```tsx
                {/* Trial period control (spec 2026-06-10) */}
                <TrialPeriodCard
                  userId={mergedCompany.userId}
                  companyName={mergedCompany.name}
                  defaultDays={
                    Number(
                      (activeCompanyPlans.find((p) => p.slug === 'basico-empresas') as unknown as Record<string, unknown>)
                        ?.trialDurationDays ??
                        (activeCompanyPlans.find((p) => p.slug === 'basico-empresas') as unknown as Record<string, unknown>)
                          ?.trial_duration_days ??
                        90,
                    )
                  }
                  onActionRegistered={(details) => {
                    setAdminActions((prev) => [
                      {
                        id: `action-${Date.now()}`,
                        companyId: mergedCompany.id,
                        companyName: mergedCompany.name,
                        action: 'plan_changed',
                        performedBy: 'Voce',
                        performedAt: new Date().toISOString(),
                        details,
                      },
                      ...prev,
                    ]);
                  }}
                />
```

(Acesso dual `trialDurationDays ?? trial_duration_days` — padrão do projeto para dados que vêm do Supabase sem conversão explícita. `action: 'plan_changed'` reusa o ícone CreditCard da timeline sem alterar o tipo `AdminAction`.)

- [ ] **Step 3: Verificar tipos e lint**

Run: `npx tsc --noEmit 2>&1 | Select-String "TrialPeriodCard|CompanyDetail"`
Expected: nenhum erro novo (CompanyDetail não tem erros pré-existentes).

Run: `npm run lint 2>&1 | Select-String "TrialPeriodCard|CompanyDetail"`
Expected: nenhum erro.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/companies/TrialPeriodCard.tsx src/pages/admin/CompanyDetail.tsx
git commit -m "feat(admin): add per-company trial period control card"
```

---

### Task 8: Verificação final

- [ ] **Step 1: Typecheck completo**

Run: `npx tsc --noEmit 2>&1 | Measure-Object -Line`
Expected: mesmas ~10 linhas pré-existentes de `src/pages/candidato/Profile.tsx` (TS2352) — nenhum erro novo em arquivos tocados.

- [ ] **Step 2: Lint + build**

Run: `npm run lint`
Expected: sem erros novos.

Run: `npm run build`
Expected: `✓ built in ...`

- [ ] **Step 3: Checklist manual (dev server porta 8081, credenciais em CLAUDE.md)**

Admin (`admin@recrutars.com`):
1. `/admin/empresas/:id` → aba Assinatura → card "Período de avaliação" aparece entre "Plano Atual" e créditos.
2. Empresa em trial ativo: faixa cyan com dias restantes + barra de progresso; botão diz "Estender avaliação"; preview = término atual + dias.
3. Chips +7/+15/+30/+90 só mudam o input (não disparam ação).
4. "Estender avaliação" → dialog → confirmar → toast de sucesso → faixa atualiza → entrada na aba Histórico.
5. "Encerrar agora" → dialog vermelho → confirmar → faixa vira "Avaliação expirada".
6. Liberar de novo → faixa volta a "Em avaliação".
7. Verificar no banco: `SELECT trial_end_date, trial_released_at FROM subscriptions WHERE user_id = '<id>'`.
8. Verificar notificação: logar como a empresa e conferir o sino.

Empresa nova (cadastro novo OU simular com `UPDATE subscriptions SET trial_released_at = NULL, trial_end_date = NOW(), end_date = NOW(), renewal_date = NOW() WHERE user_id = '<id de teste>'`):
9. Login → página "Sua conta foi criada com sucesso!" (hero emerald, timeline 3 passos, planos abaixo).
10. `/empresa/configuracoes` acessível; demais rotas mostram a página de aguardando.
11. Admin libera N dias → empresa recarrega → app desbloqueado + notificação no sino.

Regressão:
12. Empresa com assinatura paga: card mostra "Assinante ativo" + nota, sem controles.
13. Empresa com trial expirado de verdade (liberado no passado): continua vendo a `TrialExpired` antiga.
14. "Alterar Plano" do admin continua funcionando.
15. Candidato faz login normalmente (TrialGuard não afeta candidatos).

- [ ] **Step 4: Commit final (se houver ajustes) — depois rodar versionamento via skill quando o usuário pedir**

---

## Self-review notes

- **Spec coverage:** §1 migration → Task 1; §2 tipos → Task 2; §3 service+hooks → Tasks 3-4; §4 card admin → Task 7; §5 tela aguardando + guard → Tasks 5-6; §6 notificação → Task 3 (RPC best-effort); §7-9 cobertos pelo checklist da Task 8.
- **RLS:** nenhuma policy nova — `subscriptions_update`/`subscriptions_insert` já permitem admin (verificado no banco em 2026-06-10).
- **Tipos cruzados:** `trialReleasedAt` definido na Task 2 e consumido nas Tasks 5 (`useTrialStatus`) e 7 (`TrialPeriodCard`); `adminSetTrialPeriod(userId, days)` consistente entre interface (T3), impl (T3) e hook (T4).
