# Perfil do Colaborador + Gate de Onboarding (Fase 2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capturar cargo + telefone (foto opcional) de todo colaborador via um passo único de onboarding gateado, com uma aba "Meu Perfil" para edição posterior; donos isentos do gate.

**Architecture:** Três colunas novas (`company_users.job_title`, `company_users.onboarding_step`, `profiles.phone`) via migração 109. O `AuthContext` passa a expor `companyOnboardingStep`; um `CompanyOnboardingGuard` por rota (espelhando o `OnboardingGuard` dos candidatos) redireciona membros pendentes para uma página de onboarding full-screen. Novos convidados recebem `onboarding_step='profile'` via trigger `handle_new_user()` e via Edge Function `invite-team-member`. Avatar+crop e máscara de telefone viram unidades reutilizáveis.

**Tech Stack:** React 18 + TypeScript + Vite, React Router v6, Supabase (Postgres + RLS + Storage + Edge Functions Deno), shadcn/ui, framer-motion, react-easy-crop, sonner.

## Global Constraints

- **Sem framework de teste** no projeto (sem vitest/jest, sem script `test`). Verificação de CADA task = `npm run lint` + `npm run build` sem erros novos, **mais** verificação manual no preview (porta 3000) quando o comportamento só é observável em runtime. **Não** escrever testes automatizados.
- **Strings de UI em português do Brasil** com acentos corretos (ã, ç, é, í, ó, ú, â, ê, ô). Código/identificadores em inglês.
- **Trigger `handle_new_user()`:** preservar TODA a lógica existente (CPF, candidato, dono CNPJ, company_users, subscription trial). A migração reproduz a definição viva e muda **apenas** o `INSERT` do membro convidado (adiciona `onboarding_step`).
- **Edge Functions** sempre deploy com `verify_jwt: false` (chamadas via `supabase.functions.invoke()`).
- **Migração additiva e segura:** colunas nuláveis ou com default; `onboarding_step` nasce `'completed'` (ninguém é perturbado), backfill marca não-donos como `'profile'`.
- **Donos isentos:** o gate só atinge `onboarding_step='profile'`; donos ficam `'completed'`.
- **DRY:** `formatPhone` único em `src/lib/formatters.ts`; avatar+crop único em `src/components/profile/AvatarCropUpload.tsx`.
- **snake_case no banco / camelCase no TS.** Acesso direto ao Supabase no service/UI usa as colunas snake_case.
- **Supabase project ref:** `filackbesialiapjwijb`. Migração aplicada via MCP `apply_migration`; Edge Function via MCP `deploy_edge_function`.
- **Impersonação:** o guard faz bypass; `companyOnboardingStep` é exposto como `null` durante impersonação.

---

## File Structure

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/lib/formatters.ts` | **novo** — `formatPhone(value)` compartilhado |
| `sql/migrations/109_collaborator_profile_onboarding.sql` | **novo** — colunas + backfill + trigger |
| `src/types/database.ts` | **edição** — tipos das colunas novas |
| `supabase/functions/invite-team-member/index.ts` | **edição** — `onboarding_step:'profile'` no upsert |
| `src/contexts/AuthContext.tsx` | **edição** — carregar/expor `companyOnboardingStep` |
| `src/components/profile/AvatarCropUpload.tsx` | **novo** — avatar + crop + upload reutilizável |
| `src/pages/empresa/OnboardingProfile.tsx` | **novo** — passo de perfil full-screen |
| `src/components/auth/CompanyOnboardingGuard.tsx` | **novo** — guard por rota |
| `src/App.tsx` | **edição** — guard nas rotas `/empresa/*` + rota de onboarding |
| `src/components/settings/MyProfileTab.tsx` | **novo** — conteúdo da aba "Meu Perfil" |
| `src/pages/empresa/Settings.tsx` | **edição** — registrar a aba "Meu Perfil" |

---

## Task 1: `formatPhone` compartilhado (DRY)

**Files:**
- Create: `src/lib/formatters.ts`
- Modify: `src/pages/candidato/Profile.tsx` (remove cópia local, importa a compartilhada)

**Interfaces:**
- Produces: `export function formatPhone(value: string): string` — máscara BR `(XX) XXXXX-XXXX` (celular) / `(XX) XXXX-XXXX` (fixo), limitada a 11 dígitos.

- [ ] **Step 1: Criar `src/lib/formatters.ts`**

```ts
// Shared formatting helpers.

/**
 * Formata telefone brasileiro: (XX) XXXXX-XXXX (celular) ou (XX) XXXX-XXXX (fixo).
 * Aceita entrada com ou sem máscara; ignora não-dígitos e limita a 11 dígitos.
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    // Fixo: (XX) XXXX-XXXX
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  // Celular: (XX) XXXXX-XXXX
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}
```

- [ ] **Step 2: Refatorar `src/pages/candidato/Profile.tsx`**

Remover o bloco local (comentário + função `formatPhone`, linhas ~120-133):

```ts
// Formata telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}
```

E adicionar o import junto aos demais imports do topo do arquivo:

```ts
import { formatPhone } from '@/lib/formatters';
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: sem erros novos (em especial nenhum "formatPhone is not defined" ou "declared but never used" em `Profile.tsx`).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build conclui sem erros de TypeScript.

- [ ] **Step 5: Commit**

```bash
git add src/lib/formatters.ts src/pages/candidato/Profile.tsx
git commit -m "refactor: extract shared formatPhone to lib/formatters"
```

---

## Task 2: Migração 109 — colunas, backfill, trigger + tipos

**Files:**
- Create: `sql/migrations/109_collaborator_profile_onboarding.sql`
- Modify: `src/types/database.ts` (tipos de `company_users` e `profiles`)
- Aplicar no banco via MCP `apply_migration`

**Interfaces:**
- Produces: colunas `company_users.job_title TEXT`, `company_users.onboarding_step TEXT NOT NULL DEFAULT 'completed' CHECK IN ('profile','completed')`, `profiles.phone TEXT`. Trigger `handle_new_user()` seta `onboarding_step='profile'` no INSERT do membro convidado.

> **ATENÇÃO ao trigger:** o corpo abaixo é a definição **viva** do banco (capturada via `pg_get_functiondef`). A ÚNICA mudança em relação ao atual é o `INSERT INTO public.company_users` do ramo do membro convidado, que passa a incluir a coluna `onboarding_step` com valor `'profile'`. Não altere mais nada do corpo.

- [ ] **Step 1: Criar `sql/migrations/109_collaborator_profile_onboarding.sql`**

```sql
-- =====================================================
-- RecrutaRS: Collaborator Profile + Onboarding Gate
-- Fase 2 do épico de onboarding de colaboradores
-- =====================================================
-- Adds job_title + onboarding_step to company_users and
-- phone to profiles. Backfills non-owners to 'profile'.
-- Updates handle_new_user() to gate new invited members.
-- =====================================================

-- 1. New columns -----------------------------------------------------

ALTER TABLE public.company_users
  ADD COLUMN IF NOT EXISTS job_title TEXT;

ALTER TABLE public.company_users
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT NOT NULL DEFAULT 'completed'
  CHECK (onboarding_step IN ('profile', 'completed'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

COMMENT ON COLUMN public.company_users.job_title IS 'Collaborator job title/role within the company (Fase 2)';
COMMENT ON COLUMN public.company_users.onboarding_step IS 'Collaborator onboarding step: profile | completed (Fase 2)';
COMMENT ON COLUMN public.profiles.phone IS 'Personal phone of the user (Fase 2)';

-- 2. Backfill: mark invited (non-owner) members as needing profile ----
-- Owner = company_users row whose profile owns that company.
UPDATE public.company_users cu
SET onboarding_step = 'profile'
WHERE cu.onboarding_step = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = cu.company_id AND c.profile_id = cu.profile_id
  );

-- 3. Update handle_new_user() ----------------------------------------
-- Live definition reproduced verbatim; ONLY change is the invited-member
-- company_users INSERT, which now sets onboarding_step = 'profile'.
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
      INSERT INTO public.company_users (company_id, profile_id, role, onboarding_step)
      VALUES (_invited_company_id::UUID, NEW.id, _invited_role, 'profile');

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

- [ ] **Step 2: Aplicar a migração via MCP**

Use a ferramenta MCP `apply_migration` com:
- `name`: `collaborator_profile_onboarding`
- `query`: o conteúdo SQL do Step 1.

Expected: sucesso, sem erro. (É idempotente para colunas via `ADD COLUMN IF NOT EXISTS`; o `CREATE OR REPLACE FUNCTION` é seguro re-rodar.)

- [ ] **Step 3: Verificar colunas e backfill via MCP `execute_sql`**

```sql
SELECT
  (SELECT COUNT(*) FROM public.company_users WHERE onboarding_step = 'profile') AS pendentes,
  (SELECT COUNT(*) FROM public.company_users WHERE onboarding_step = 'completed') AS completos;
```
Expected: a soma bate com o total de `company_users`; donos contam em `completos`.

- [ ] **Step 4: Atualizar `src/types/database.ts`**

Em `company_users.Row` adicionar (mantendo ordem alfabética, após `invited_by`):
```ts
          job_title: string | null
          onboarding_step: string
```
Em `company_users.Insert` adicionar:
```ts
          job_title?: string | null
          onboarding_step?: string
```
Em `company_users.Update` adicionar:
```ts
          job_title?: string | null
          onboarding_step?: string
```
Em `profiles.Row` adicionar (após `name`):
```ts
          phone: string | null
```
Em `profiles.Insert` adicionar:
```ts
          phone?: string | null
```
Em `profiles.Update` adicionar:
```ts
          phone?: string | null
```

- [ ] **Step 5: Lint + Build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add sql/migrations/109_collaborator_profile_onboarding.sql src/types/database.ts
git commit -m "feat(db): collaborator job_title, onboarding_step, profiles.phone (migration 109)"
```

---

## Task 3: Edge Function — gate de novos convidados pré-existentes

**Files:**
- Modify: `supabase/functions/invite-team-member/index.ts` (função `linkExistingMember`, ~linha 85-90)
- Deploy via MCP `deploy_edge_function` com `verify_jwt: false`

**Interfaces:**
- Consumes: coluna `company_users.onboarding_step` (Task 2).
- Produces: vínculo de membro pré-existente nasce com `onboarding_step='profile'`.

- [ ] **Step 1: Editar o upsert em `linkExistingMember`**

Trocar:
```ts
  const { error: linkError } = await supabase
    .from("company_users")
    .upsert(
      { company_id: companyId, profile_id: profile.id, role },
      { onConflict: "company_id,profile_id", ignoreDuplicates: true },
    );
```
Por:
```ts
  const { error: linkError } = await supabase
    .from("company_users")
    .upsert(
      { company_id: companyId, profile_id: profile.id, role, onboarding_step: "profile" },
      { onConflict: "company_id,profile_id", ignoreDuplicates: true },
    );
```

> `ignoreDuplicates: true` é mantido: relink de quem já é membro NÃO reseta o passo (idempotência).

- [ ] **Step 2: Deploy via MCP**

Use `deploy_edge_function` com:
- `name`: `invite-team-member`
- `verify_jwt`: `false`
- arquivo: o `index.ts` atualizado (e quaisquer outros arquivos já existentes na função).

Expected: deploy `ACTIVE`/sucesso.

- [ ] **Step 3: Lint (repo)**

Run: `npm run lint`
Expected: sem erros novos (a função Deno não entra no build do Vite; o lint do repo não deve quebrar).

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/invite-team-member/index.ts
git commit -m "feat(invite): new linked members start with onboarding_step=profile"
```

---

## Task 4: AuthContext expõe `companyOnboardingStep`

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

**Interfaces:**
- Consumes: coluna `company_users.onboarding_step` (Task 2).
- Produces: `companyOnboardingStep: 'profile' | 'completed' | null` no contexto; atualizado por `loadUserData` e `refreshCurrentCompany`; `null` durante impersonação.

- [ ] **Step 1: Adicionar o campo à interface**

Em `interface AuthContextType`, após `companyRole: TeamMemberRole | null;` adicionar:
```ts
  companyOnboardingStep: 'profile' | 'completed' | null;
```

- [ ] **Step 2: Adicionar o estado**

Após `const [companyRole, setCompanyRole] = useState<TeamMemberRole | null>(null);` adicionar:
```ts
  const [companyOnboardingStep, setCompanyOnboardingStep] = useState<'profile' | 'completed' | null>(null);
```

- [ ] **Step 3: Resetar o estado em todos os ramos não-empresa de `loadUserData`**

Adicionar `setCompanyOnboardingStep(null);` em CADA bloco que hoje faz `setCompanyRole(null)` ou limpa estado:
- ramo `if (!session?.user)` (início)
- ramo `if (profileError || !profileData)`
- ramo `userProfile.type === 'candidate'`
- ramo `else` (admin)
- bloco `catch`

- [ ] **Step 4: Computar o passo no ramo empresa de `loadUserData`**

Substituir todo o bloco `else if (userProfile.type === 'company') { ... }` por:
```ts
      } else if (userProfile.type === 'company') {
        // Try as owner first
        let { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('profile_id', session.user.id)
          .single();

        let role: TeamMemberRole = 'admin';
        let step: 'profile' | 'completed' | null = null;

        if (!companyData) {
          // Not an owner — check company_users (invited member)
          const { data: memberData } = await supabase
            .from('company_users')
            .select('company_id, role, onboarding_step')
            .eq('profile_id', session.user.id)
            .single();

          if (memberData) {
            role = memberData.role as TeamMemberRole;
            step = (memberData.onboarding_step as 'profile' | 'completed') ?? 'completed';
            const { data: memberCompanyData } = await supabase
              .from('companies')
              .select('*')
              .eq('id', memberData.company_id)
              .single();
            companyData = memberCompanyData;
          }
        } else {
          // Owner — get role from company_users
          const { data: ownerRole } = await supabase
            .from('company_users')
            .select('role, onboarding_step')
            .eq('profile_id', session.user.id)
            .single();
          if (ownerRole) {
            role = ownerRole.role as TeamMemberRole;
            step = (ownerRole.onboarding_step as 'profile' | 'completed') ?? 'completed';
          }
        }

        setCurrentCompany(companyData ? companyRowToCompany(companyData) : null);
        setCompanyRole(companyData ? role : null);
        setCompanyOnboardingStep(companyData ? step : null);
        setCurrentCandidate(null);
      }
```

- [ ] **Step 5: Atualizar `refreshCurrentCompany` da mesma forma**

Substituir o corpo de `refreshCurrentCompany` por:
```ts
  const refreshCurrentCompany = useCallback(async () => {
    if (!user || user.type !== 'company') return;

    // Try as owner first
    let { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('profile_id', user.id)
      .single();

    let role: TeamMemberRole = 'admin';
    let step: 'profile' | 'completed' | null = null;

    if (!companyData) {
      const { data: memberData } = await supabase
        .from('company_users')
        .select('company_id, role, onboarding_step')
        .eq('profile_id', user.id)
        .single();

      if (memberData) {
        role = memberData.role as TeamMemberRole;
        step = (memberData.onboarding_step as 'profile' | 'completed') ?? 'completed';
        const { data: memberCompanyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', memberData.company_id)
          .single();
        companyData = memberCompanyData;
      }
    } else {
      const { data: ownerRole } = await supabase
        .from('company_users')
        .select('role, onboarding_step')
        .eq('profile_id', user.id)
        .single();
      if (ownerRole) {
        role = ownerRole.role as TeamMemberRole;
        step = (ownerRole.onboarding_step as 'profile' | 'completed') ?? 'completed';
      }
    }

    setCurrentCompany(companyData ? companyRowToCompany(companyData) : null);
    setCompanyRole(companyData ? role : null);
    setCompanyOnboardingStep(companyData ? step : null);
  }, [user]);
```

- [ ] **Step 6: Expor no value do Provider**

No objeto passado a `AuthContext.Provider value={{ ... }}`, após a linha `companyRole: isImpersonationActive ? impersonatingCompanyRole : companyRole,` adicionar:
```ts
        companyOnboardingStep: isImpersonationActive ? null : companyOnboardingStep,
```

- [ ] **Step 7: Lint + Build**

Run: `npm run lint && npm run build`
Expected: sem erros (o `AuthContextType` agora exige `companyOnboardingStep`; nenhum consumidor quebra porque é um campo novo no value).

- [ ] **Step 8: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "feat(auth): expose companyOnboardingStep from company_users"
```

---

## Task 5: Componente reutilizável `AvatarCropUpload`

**Files:**
- Create: `src/components/profile/AvatarCropUpload.tsx`

**Interfaces:**
- Produces:
  ```ts
  interface AvatarCropUploadProps {
    userId: string;
    currentUrl?: string;
    fallback: string;           // iniciais para o AvatarFallback
    onUploaded: (publicUrl: string) => void;  // caller persiste no banco
    className?: string;         // classes opcionais do Avatar
  }
  export function AvatarCropUpload(props: AvatarCropUploadProps): JSX.Element
  ```
- Comportamento: seleção de arquivo (valida tipo JPG/PNG/WebP e tamanho ≤ 2MB), modal de crop redondo (`react-easy-crop`), upload ao bucket `avatars` em `${userId}/${Date.now()}.jpg`, chama `onUploaded(publicUrl)`. **Não** persiste no banco (responsabilidade do caller).

- [ ] **Step 1: Criar `src/components/profile/AvatarCropUpload.tsx`**

```tsx
/**
 * AvatarCropUpload
 * Reusable avatar picker with round crop + upload to the `avatars` bucket.
 * The caller persists the returned public URL wherever it belongs.
 */

import { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { Camera, Loader2, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx?.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error('Canvas is empty')); },
      'image/jpeg',
      0.9,
    );
  });
}

interface AvatarCropUploadProps {
  userId: string;
  currentUrl?: string;
  fallback: string;
  onUploaded: (publicUrl: string) => void;
  className?: string;
}

export function AvatarCropUpload({ userId, currentUrl, fallback, onUploaded, className }: AvatarCropUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!cropperImage || !croppedAreaPixels) return;

    setUploading(true);
    setShowCropModal(false);

    try {
      const croppedBlob = await getCroppedImg(cropperImage, croppedAreaPixels);
      const fileName = `${userId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      onUploaded(urlData.publicUrl);
      toast.success('Foto atualizada com sucesso!');
    } catch {
      toast.error('Erro ao enviar foto. Tente novamente.');
    } finally {
      setUploading(false);
      setCropperImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className={cn('w-24 h-24 border-2 border-muted', className)}>
          <AvatarImage src={currentUrl} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">{fallback}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          className={cn(
            'absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors',
            uploading && 'opacity-50 pointer-events-none',
          )}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>
        {currentUrl && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajustar foto</DialogTitle>
            <DialogDescription>
              Arraste para posicionar e use o zoom para enquadrar seu rosto.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-64 w-full bg-muted rounded-lg overflow-hidden">
            {cropperImage && (
              <Cropper
                image={cropperImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Zoom</Label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCropConfirm} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 2: Lint + Build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/profile/AvatarCropUpload.tsx
git commit -m "feat(profile): reusable AvatarCropUpload component"
```

---

## Task 6: Página `OnboardingProfile`

**Files:**
- Create: `src/pages/empresa/OnboardingProfile.tsx`

**Interfaces:**
- Consumes: `formatPhone` (Task 1), `AvatarCropUpload` (Task 5), colunas da Task 2, `refreshCurrentCompany` (já existe), `companyOnboardingStep` indireto via guard (Task 7).
- Produces: componente default-export `OnboardingProfile` montado na rota `/empresa/onboarding/perfil`.

- [ ] **Step 1: Criar `src/pages/empresa/OnboardingProfile.tsx`**

```tsx
/**
 * OnboardingProfile
 * Fase 2: passo único de perfil do colaborador (cargo + telefone obrigatórios,
 * foto opcional). Full-screen, sem DashboardLayout — espelha o onboarding do
 * candidato. Ao concluir, marca company_users.onboarding_step = 'completed'.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AvatarCropUpload } from '@/components/profile/AvatarCropUpload';
import { formatPhone } from '@/lib/formatters';
import { toast } from 'sonner';

export default function OnboardingProfile() {
  const { user, currentCompany, refreshCurrentCompany } = useAuth();
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '');
  const isValid = jobTitle.trim().length > 0 && phoneDigits.length >= 10;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleConcluir = async () => {
    if (!user || !currentCompany) return;
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setError('');
    setSaving(true);

    try {
      const { error: cuError } = await supabase
        .from('company_users')
        .update({ job_title: jobTitle.trim(), onboarding_step: 'completed' })
        .eq('company_id', currentCompany.id)
        .eq('profile_id', user.id);
      if (cuError) throw cuError;

      const { error: pError } = await supabase
        .from('profiles')
        .update({ phone: phoneDigits, avatar_url: avatarUrl || null })
        .eq('id', user.id);
      if (pError) throw pError;

      await refreshCurrentCompany();
      toast.success('Perfil concluído!');
      navigate('/empresa', { replace: true });
    } catch {
      setError('Erro ao salvar dados. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <img src="/images/logo-horizontal.png" alt="RecrutaRS" className="h-10 w-auto" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Complete seu perfil</h1>
          <p className="text-muted-foreground mb-8">
            Precisamos de algumas informações para concluir seu acesso.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <AvatarCropUpload
              userId={user?.id ?? ''}
              currentUrl={avatarUrl}
              fallback={initials}
              onUploaded={setAvatarUrl}
            />
            <p className="text-xs text-muted-foreground text-center -mt-1">
              Foto opcional (JPG, PNG ou WebP, máx 2MB)
            </p>

            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" />
                Cargo / função
              </Label>
              <Input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex.: Analista de RH"
                className={cn(showErrors && !jobTitle.trim() && 'border-destructive')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary" />
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className={cn(showErrors && phoneDigits.length < 10 && 'border-destructive')}
              />
              {showErrors && phoneDigits.length < 10 && (
                <p className="text-xs text-destructive" role="alert">Informe um telefone válido com DDD.</p>
              )}
            </div>

            <Button className="w-full" size="lg" onClick={handleConcluir} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Concluir
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint + Build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/pages/empresa/OnboardingProfile.tsx
git commit -m "feat(empresa): collaborator onboarding profile page"
```

---

## Task 7: `CompanyOnboardingGuard` + wiring no `App.tsx`

**Files:**
- Create: `src/components/auth/CompanyOnboardingGuard.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `companyOnboardingStep` (Task 4), página `OnboardingProfile` (Task 6).
- Produces: `<CompanyOnboardingGuard>` aninhado nas rotas `/empresa/*`; rota `/empresa/onboarding/perfil`.

- [ ] **Step 1: Criar `src/components/auth/CompanyOnboardingGuard.tsx`**

```tsx
/**
 * CompanyOnboardingGuard
 * Fase 2: redireciona colaboradores com onboarding pendente para o passo de perfil.
 * Donos (onboarding_step='completed') e impersonação passam direto.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyOnboardingGuardProps {
  children: React.ReactNode;
}

export function CompanyOnboardingGuard({ children }: CompanyOnboardingGuardProps) {
  const { user, companyOnboardingStep, loading, isImpersonationActive } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Impersonação bypassa o gate
  if (isImpersonationActive) {
    return <>{children}</>;
  }

  // Só se aplica a empresas
  if (!user || user.type !== 'company') {
    return <>{children}</>;
  }

  // Concluído ou sem info — passa
  if (!companyOnboardingStep || companyOnboardingStep === 'completed') {
    return <>{children}</>;
  }

  if (companyOnboardingStep === 'profile') {
    return <Navigate to="/empresa/onboarding/perfil" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Importar guard e página em `src/App.tsx`**

Após `import { OnboardingGuard } from "@/components/auth/OnboardingGuard";` adicionar:
```tsx
import { CompanyOnboardingGuard } from "@/components/auth/CompanyOnboardingGuard";
```
Junto aos imports de páginas `./pages/empresa/...` adicionar:
```tsx
import CompanyOnboardingProfile from "./pages/empresa/OnboardingProfile";
```

- [ ] **Step 3: Adicionar a rota de onboarding (FORA do guard)**

Antes da rota `path="/empresa"` (dashboard), adicionar:
```tsx
            <Route path="/empresa/onboarding/perfil" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyOnboardingProfile />
              </ProtectedRoute>
            } />
```

- [ ] **Step 4: Aninhar o guard em TODAS as rotas `/empresa/*` (exceto a de onboarding)**

Para cada `<Route path="/empresa...">` cujo elemento é `<ProtectedRoute allowedTypes={['company']}> <Pagina /> </ProtectedRoute>`, envolver a página com o guard. Exemplo:

Antes:
```tsx
            <Route path="/empresa/vagas" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyJobs />
              </ProtectedRoute>
            } />
```
Depois:
```tsx
            <Route path="/empresa/vagas" element={
              <ProtectedRoute allowedTypes={['company']}>
                <CompanyOnboardingGuard>
                  <CompanyJobs />
                </CompanyOnboardingGuard>
              </ProtectedRoute>
            } />
```

Regra: aplicar a TODA rota cujo `path` começa com `/empresa`, **exceto** `/empresa/onboarding/perfil`. Não tocar em rotas com `allowedTypes` que incluam `candidate`/`admin` (rotas compartilhadas fora de `/empresa`). Ao terminar, rodar `grep -c "CompanyOnboardingGuard" src/App.tsx` e confirmar que o número de aberturas == número de rotas `/empresa/*` gateadas + 1 (o import).

- [ ] **Step 5: Lint + Build**

Run: `npm run lint && npm run build`
Expected: sem erros; nenhuma rota `/empresa/*` (exceto onboarding) sem o guard.

- [ ] **Step 6: Verificação manual (preview porta 3000)**

Com o dev server na 3000, logar como membro/colaborador de teste (ver credenciais do CLAUDE.md, ex.: empresa com membro). Forçar `onboarding_step='profile'` no banco para esse vínculo (via MCP `execute_sql`) e confirmar que qualquer rota `/empresa/*` redireciona para `/empresa/onboarding/perfil`; concluir o passo e confirmar acesso normal. Logar como **dono** e confirmar que entra direto.

- [ ] **Step 7: Commit**

```bash
git add src/components/auth/CompanyOnboardingGuard.tsx src/App.tsx
git commit -m "feat(auth): CompanyOnboardingGuard gates /empresa routes"
```

---

## Task 8: Aba "Meu Perfil" no Settings

**Files:**
- Create: `src/components/settings/MyProfileTab.tsx`
- Modify: `src/pages/empresa/Settings.tsx`

**Interfaces:**
- Consumes: `formatPhone` (Task 1), `AvatarCropUpload` (Task 5), colunas da Task 2.
- Produces: componente `MyProfileTab` renderizado numa nova aba `meu-perfil` do Settings.

- [ ] **Step 1: Criar `src/components/settings/MyProfileTab.tsx`**

```tsx
/**
 * MyProfileTab
 * Fase 2: edição do perfil pessoal do colaborador (cargo, telefone, foto).
 * Não altera onboarding_step — apenas edição. Serve colaboradores e donos.
 */

import { useState, useEffect } from 'react';
import { Briefcase, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AvatarCropUpload } from '@/components/profile/AvatarCropUpload';
import { formatPhone } from '@/lib/formatters';
import { toast } from 'sonner';

export function MyProfileTab() {
  const { user, currentCompany } = useAuth();

  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !currentCompany) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data: cu } = await supabase
        .from('company_users')
        .select('job_title')
        .eq('company_id', currentCompany.id)
        .eq('profile_id', user.id)
        .single();
      const { data: p } = await supabase
        .from('profiles')
        .select('phone, avatar_url')
        .eq('id', user.id)
        .single();
      if (!active) return;
      if (cu?.job_title) setJobTitle(cu.job_title);
      if (p?.phone) setPhone(formatPhone(p.phone));
      if (p?.avatar_url) setAvatarUrl(p.avatar_url);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user, currentCompany]);

  const phoneDigits = phone.replace(/\D/g, '');

  const handleSave = async () => {
    if (!user || !currentCompany) return;
    setSaving(true);
    try {
      const { error: cuError } = await supabase
        .from('company_users')
        .update({ job_title: jobTitle.trim() || null })
        .eq('company_id', currentCompany.id)
        .eq('profile_id', user.id);
      if (cuError) throw cuError;

      const { error: pError } = await supabase
        .from('profiles')
        .update({ phone: phoneDigits || null, avatar_url: avatarUrl || null })
        .eq('id', user.id);
      if (pError) throw pError;

      toast.success('Perfil atualizado com sucesso!');
    } catch {
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
        <CardDescription>Seus dados pessoais como colaborador desta empresa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarCropUpload
          userId={user?.id ?? ''}
          currentUrl={avatarUrl}
          fallback={initials}
          onUploaded={setAvatarUrl}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="my-job-title" className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-primary" />
              Cargo / função
            </Label>
            <Input
              id="my-job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex.: Analista de RH"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="my-phone" className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary" />
              Telefone
            </Label>
            <Input
              id="my-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar alterações'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Registrar a aba em `src/pages/empresa/Settings.tsx`**

Adicionar o import (junto aos demais imports de componentes):
```tsx
import { MyProfileTab } from '@/components/settings/MyProfileTab';
import { UserCircle } from 'lucide-react';
```
> Se `UserCircle` já estiver importado de `lucide-react`, apenas adicione-o à lista existente em vez de criar novo import.

Mudar a `TabsList` de `grid-cols-5` para `grid-cols-6`:
```tsx
          <TabsList className="grid w-full grid-cols-6">
```

Adicionar o `TabsTrigger` como **primeiro** item da `TabsList` (antes de "perfil"):
```tsx
            <TabsTrigger value="meu-perfil" className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Meu Perfil</span>
            </TabsTrigger>
```

Adicionar o `TabsContent` correspondente (junto aos demais `TabsContent`, ex.: logo após a abertura do bloco de tabs/antes de "perfil"):
```tsx
          {/* Tab: Meu Perfil (colaborador) */}
          <TabsContent value="meu-perfil" className="space-y-6">
            <MyProfileTab />
          </TabsContent>
```

- [ ] **Step 3: Lint + Build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 4: Verificação manual (preview porta 3000)**

Logar como colaborador (ou dono), abrir Configurações → aba "Meu Perfil", editar cargo/telefone/foto, salvar e recarregar para confirmar persistência.

- [ ] **Step 5: Commit**

```bash
git add src/components/settings/MyProfileTab.tsx src/pages/empresa/Settings.tsx
git commit -m "feat(settings): Meu Perfil tab for collaborator personal data"
```

---

## Ordem de execução e dependências

1. **Task 1** (formatPhone) — base, sem dependências.
2. **Task 2** (migração + tipos) — base de dados.
3. **Task 3** (Edge Function) — depende da coluna (Task 2).
4. **Task 4** (AuthContext) — depende dos tipos/colunas (Task 2).
5. **Task 5** (AvatarCropUpload) — sem dependências de runtime.
6. **Task 6** (OnboardingProfile) — depende de Task 1 e Task 5.
7. **Task 7** (Guard + rotas) — depende de Task 4 e Task 6.
8. **Task 8** (Meu Perfil) — depende de Task 1 e Task 5.

---

## Self-Review (autor)

**Cobertura da spec:**
- §4 colunas/backfill/trigger → Task 2 ✓
- §5 novos convidados (trigger + Edge Function) → Task 2 + Task 3 ✓
- §6 AuthContext expõe passo → Task 4 ✓
- §7 guard + rota → Task 7 ✓
- §8 página de onboarding → Task 6 (+ Task 5 para avatar) ✓
- §9 aba "Meu Perfil" → Task 8 ✓
- §10 formatPhone DRY → Task 1 ✓
- §11 RLS (sem policy nova) → coberto pelas policies existentes; nenhum passo de migração de RLS necessário ✓
- §12 edge cases (dono/impersonação/idempotência/falha) → Task 7 guard + Task 3 idempotência + toasts ✓

**Placeholders:** nenhum "TBD/TODO"; todo passo de código tem código completo. A única instrução por-regra (Task 7 Step 4, ~40 rotas idênticas) traz exemplo before/after completo + regra de verificação por grep — fiel à natureza mecânica e repetitiva.

**Consistência de tipos/nomes:** `companyOnboardingStep: 'profile' | 'completed' | null` idêntico em interface, estado, provider e guard. `formatPhone` assinatura única. `AvatarCropUpload` props consumidas igual em Task 6 e Task 8. Colunas `job_title`/`onboarding_step`/`phone` idênticas entre migração, tipos, AuthContext, páginas.
