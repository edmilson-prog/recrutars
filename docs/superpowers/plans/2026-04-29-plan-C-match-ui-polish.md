# Plano C — Polimento da UI de Match

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar a experiência de match com (1) edição segura de pesos em vagas com candidaturas (dupla confirmação + histórico + notificação), (2) modal "Ver critérios da vaga" para o candidato, (3) toggle "Combinar skills" para colapsar 5 categorias em 4, (4) tratamento visual dos casos especiais da Q4 (peso=0 oculto, candidato sem teste com flag, vaga sem ideal redistribuído).

**Architecture:** Tabela `jobs_weight_history` com trigger AFTER INSERT que gera notificações a candidatos ativos. Edge Function `update-job-weights` (Deno + Supabase service role) faz o update + INSERT no histórico atomicamente. Modal `MatchCriteriaModal` (shadcn Dialog) renderiza distribuição + comparação + histórico. Toggle local persistido em localStorage controla renderização do `MatchBreakdown`. Calculator ganha função `applyDataAvailability` que processa os casos Q4.

**Tech Stack:** PostgreSQL + Supabase Edge Function (Deno), React 18 + TypeScript, shadcn/ui (Dialog, Switch). Validação por type-check + build + lint + verificação manual.

**Dependências:** **Requer Planos A e B mergeados em main**. Este plano usa o calculator refatorado (A) e as colunas weight_* (B).

**Spec:** [docs/superpowers/specs/2026-04-29-match-skills-pesos-design.md](../specs/2026-04-29-match-skills-pesos-design.md)

---

## File Structure

**Criados:**
- `sql/migrations/093_jobs_weight_history.sql` — tabela + RLS + trigger
- `supabase/functions/update-job-weights/index.ts` — Edge Function
- `src/components/empresa/job-form/EditWeightsConfirmDialog.tsx` — dupla confirmação
- `src/hooks/useJobWeightHistoryQuery.ts` — fetch do histórico
- `src/components/match/MatchCriteriaModal.tsx` — modal Ver critérios
- `src/hooks/useMatchCombineSkills.ts` — localStorage para toggle
- `src/components/match/MatchCombineSkillsToggle.tsx` — switch reutilizável

**Modificados:**
- `src/lib/matchCalculator.ts` — `applyDataAvailability` (casos Q4)
- `src/components/match/MatchBreakdown.tsx` — toggle, esconde peso=0, renderiza dataMissing
- `src/components/match/MatchProgressBar.tsx` — flag "não avaliado"
- `src/pages/candidato/JobDetails.tsx` — botão "Ver critérios" → modal
- `src/hooks/useJobForm.ts` — chama Edge Function quando vaga publicada com candidaturas
- `src/types/notifications.ts` (ou local) — tipo `job_weights_changed`
- `src/pages/candidato/Notifications.tsx` (se existir) — render do tipo novo

---

## Task 1: Migration `jobs_weight_history` com trigger

**Files:**
- Create: `sql/migrations/093_jobs_weight_history.sql`

- [ ] **Step 1: Criar migration**

Conteúdo:

```sql
-- 093_jobs_weight_history.sql
-- Histórico de alterações de pesos de match em vagas + trigger de notificação

CREATE TABLE jobs_weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  old_weights jsonb NOT NULL,
  new_weights jsonb NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  active_applications_count integer NOT NULL DEFAULT 0,
  reason text
);

CREATE INDEX idx_jobs_weight_history_job ON jobs_weight_history(job_id, changed_at DESC);

ALTER TABLE jobs_weight_history ENABLE ROW LEVEL SECURITY;

-- Empresas veem histórico das próprias vagas; candidatos veem histórico de vagas em que se candidataram; admin vê tudo
CREATE POLICY "Companies and candidates see related history"
  ON jobs_weight_history FOR SELECT
  USING (
    job_id IN (SELECT id FROM jobs WHERE company_id = public.get_company_id())
    OR job_id IN (SELECT job_id FROM applications WHERE candidate_id IN (SELECT id FROM candidates WHERE profile_id = auth.uid()))
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- INSERT/UPDATE/DELETE somente via Edge Function (service role bypassa RLS)
CREATE POLICY "No direct inserts" ON jobs_weight_history FOR INSERT WITH CHECK (false);
CREATE POLICY "No updates" ON jobs_weight_history FOR UPDATE USING (false);
CREATE POLICY "No deletes" ON jobs_weight_history FOR DELETE USING (false);

-- Trigger: notifica candidatos ativos quando pesos mudam
CREATE OR REPLACE FUNCTION notify_candidates_on_weight_change()
RETURNS TRIGGER AS $$
DECLARE
  app_record RECORD;
BEGIN
  IF NEW.active_applications_count > 0 THEN
    FOR app_record IN
      SELECT a.candidate_id, c.profile_id, j.title AS job_title
      FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      JOIN jobs j ON j.id = a.job_id
      WHERE a.job_id = NEW.job_id
        AND a.status NOT IN ('rejected', 'hired')
    LOOP
      INSERT INTO notifications (user_id, type, title, message, payload, created_at, read)
      VALUES (
        app_record.profile_id,
        'job_weights_changed',
        'Critérios da vaga foram atualizados',
        'A empresa ajustou os critérios de match da vaga "' || app_record.job_title || '". Seu score foi recalculado.',
        jsonb_build_object('job_id', NEW.job_id, 'changed_at', NEW.changed_at),
        now(),
        false
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER jobs_weight_history_notify
  AFTER INSERT ON jobs_weight_history
  FOR EACH ROW EXECUTE FUNCTION notify_candidates_on_weight_change();
```

- [ ] **Step 2: Aplicar via MCP Supabase `apply_migration`**

```
name: 093_jobs_weight_history
query: <SQL acima>
```

Expected: aplicado com sucesso.

- [ ] **Step 3: Validar estrutura**

Run via MCP `execute_sql`:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'jobs_weight_history' ORDER BY ordinal_position;
```

Expected: 7 colunas (id, job_id, old_weights, new_weights, changed_by, changed_at, active_applications_count, reason).

- [ ] **Step 4: Verificar tabela `notifications` aceita o novo type**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'notifications';
```

Expected: ver coluna `type` (text). Verificar se existe CHECK constraint que limita os types — se sim, ajustar a constraint para incluir `'job_weights_changed'`.

Se não existir tabela `notifications`, criar antes desta migration ou ajustar trigger para inserir em outra tabela existente.

- [ ] **Step 5: Commit**

```bash
git add sql/migrations/093_jobs_weight_history.sql
git commit -m "feat(db): add jobs_weight_history with notification trigger"
```

---

## Task 2: Edge Function `update-job-weights`

**Files:**
- Create: `supabase/functions/update-job-weights/index.ts`

- [ ] **Step 1: Criar arquivo**

Conteúdo (segue padrão das outras 17 functions, com `verify_jwt: false` conforme memória do projeto):

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface UpdateJobWeightsBody {
  jobId: string;
  performedBy: string;  // user id (auth.uid()) — passado pelo cliente
  newWeights: {
    skillsTechnical: number;
    skillsBehavioral: number;
    experience: number;
    gaugePro: number;
    location: number;
  };
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: UpdateJobWeightsBody = await req.json();

    // Validação básica
    const { jobId, performedBy, newWeights } = body;
    if (!jobId || !performedBy) {
      return jsonResponse({ error: 'jobId e performedBy são obrigatórios' }, 400);
    }

    const sum = newWeights.skillsTechnical + newWeights.skillsBehavioral +
                newWeights.experience + newWeights.gaugePro + newWeights.location;
    if (sum !== 100) {
      return jsonResponse({ error: `Soma dos pesos deve ser 100. Recebido: ${sum}` }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Buscar pesos atuais
    const { data: currentJob, error: fetchError } = await supabase
      .from('jobs')
      .select('weight_skills_technical, weight_skills_behavioral, weight_experience, weight_gauge_pro, weight_location, company_id')
      .eq('id', jobId)
      .single();

    if (fetchError || !currentJob) {
      return jsonResponse({ error: 'Vaga não encontrada' }, 404);
    }

    const oldWeights = {
      skillsTechnical: currentJob.weight_skills_technical,
      skillsBehavioral: currentJob.weight_skills_behavioral,
      experience: currentJob.weight_experience,
      gaugePro: currentJob.weight_gauge_pro,
      location: currentJob.weight_location,
    };

    // 2. Contar candidaturas ativas
    const { count: activeAppsCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .not('status', 'in', '(rejected,hired)');

    const activeCount = activeAppsCount ?? 0;

    // 3. Atualizar a vaga
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        weight_skills_technical: newWeights.skillsTechnical,
        weight_skills_behavioral: newWeights.skillsBehavioral,
        weight_experience: newWeights.experience,
        weight_gauge_pro: newWeights.gaugePro,
        weight_location: newWeights.location,
      })
      .eq('id', jobId);

    if (updateError) {
      return jsonResponse({ error: `Erro ao atualizar vaga: ${updateError.message}` }, 500);
    }

    // 4. Inserir histórico (trigger gera notificações)
    const { error: historyError } = await supabase
      .from('jobs_weight_history')
      .insert({
        job_id: jobId,
        old_weights: oldWeights,
        new_weights: newWeights,
        changed_by: performedBy,
        active_applications_count: activeCount,
        reason: body.reason ?? null,
      });

    if (historyError) {
      console.error('Erro ao inserir histórico:', historyError);
      // Não retorna erro — update já foi feito
    }

    return jsonResponse({
      success: true,
      activeApplicationsNotified: activeCount,
    });
  } catch (e) {
    console.error('Erro inesperado:', e);
    return jsonResponse({ error: 'Erro interno' }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

- [ ] **Step 2: Configurar `verify_jwt: false` em `supabase/config.toml`**

Adicionar (ou atualizar) bloco para a nova function:

```toml
[functions.update-job-weights]
verify_jwt = false
```

- [ ] **Step 3: Deploy via MCP Supabase `deploy_edge_function`**

Usar a ferramenta MCP `mcp__supabase__deploy_edge_function` passando o conteúdo do `index.ts` e nome `update-job-weights`.

Expected: deploy com sucesso. URL retornada.

- [ ] **Step 4: Smoke test via curl ou Supabase Studio**

```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/update-job-weights' \
  -H 'Content-Type: application/json' \
  -d '{
    "jobId": "<id-vaga-teste>",
    "performedBy": "<user-id>",
    "newWeights": {"skillsTechnical": 30, "skillsBehavioral": 20, "experience": 25, "gaugePro": 15, "location": 10}
  }'
```

Expected: `{"success": true, "activeApplicationsNotified": <n>}`.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/update-job-weights/index.ts supabase/config.toml
git commit -m "feat(edge): add update-job-weights with history + notifications"
```

---

## Task 3: Hook `useJobWeightHistoryQuery`

**Files:**
- Create: `src/hooks/useJobWeightHistoryQuery.ts`

- [ ] **Step 1: Criar arquivo**

Conteúdo:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface JobWeightHistoryEntry {
  id: string;
  jobId: string;
  oldWeights: {
    skillsTechnical: number;
    skillsBehavioral: number;
    experience: number;
    gaugePro: number;
    location: number;
  };
  newWeights: {
    skillsTechnical: number;
    skillsBehavioral: number;
    experience: number;
    gaugePro: number;
    location: number;
  };
  changedBy: string | null;
  changedAt: string;
  activeApplicationsCount: number;
  reason: string | null;
}

export const jobWeightHistoryKeys = {
  all: ['job-weight-history'] as const,
  byJob: (jobId: string) => [...jobWeightHistoryKeys.all, jobId] as const,
};

export function useJobWeightHistory(jobId: string | undefined) {
  return useQuery({
    queryKey: jobWeightHistoryKeys.byJob(jobId ?? ''),
    queryFn: async (): Promise<JobWeightHistoryEntry[]> => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('jobs_weight_history')
        .select('*')
        .eq('job_id', jobId)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        jobId: row.job_id,
        oldWeights: row.old_weights,
        newWeights: row.new_weights,
        changedBy: row.changed_by,
        changedAt: row.changed_at,
        activeApplicationsCount: row.active_applications_count,
        reason: row.reason,
      }));
    },
    enabled: !!jobId,
  });
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/hooks/useJobWeightHistoryQuery.ts
git commit -m "feat(hooks): add useJobWeightHistory query"
```

---

## Task 4: Componente `EditWeightsConfirmDialog` (dupla confirmação)

**Files:**
- Create: `src/components/empresa/job-form/EditWeightsConfirmDialog.tsx`

- [ ] **Step 1: Criar componente**

Conteúdo:

```typescript
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface EditWeightsConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  activeApplicationsCount: number;
  onConfirm: () => Promise<void>;
}

type Stage = 'impact' | 'typing' | 'submitting';

export function EditWeightsConfirmDialog({
  open,
  onOpenChange,
  jobTitle,
  activeApplicationsCount,
  onConfirm,
}: EditWeightsConfirmDialogProps) {
  const [stage, setStage] = useState<Stage>('impact');
  const [typedTitle, setTypedTitle] = useState('');

  const titleMatches = typedTitle.trim() === jobTitle.trim();

  function handleClose() {
    setStage('impact');
    setTypedTitle('');
    onOpenChange(false);
  }

  async function handleConfirm(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!titleMatches || stage === 'submitting') return;
    setStage('submitting');
    try {
      await onConfirm();
      handleClose();
    } catch {
      setStage('typing');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AlertDialogContent>
        {stage === 'impact' && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Atenção: {activeApplicationsCount} candidatura{activeApplicationsCount > 1 ? 's' : ''} ativa{activeApplicationsCount > 1 ? 's' : ''}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm">
                  <p>Alterar os pesos desta vaga vai:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Recalcular o match de <strong>todos os {activeApplicationsCount} candidatos</strong></li>
                    <li>Notificar cada candidato sobre a mudança</li>
                    <li>Registrar a alteração no histórico da vaga (visível ao candidato)</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => { e.preventDefault(); setStage('typing'); }}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}

        {(stage === 'typing' || stage === 'submitting') && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
              <AlertDialogDescription>
                Para confirmar, digite o título da vaga: <strong>{jobTitle}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="job-title-confirm" className="sr-only">Título da vaga</Label>
              <Input
                id="job-title-confirm"
                value={typedTitle}
                onChange={(e) => setTypedTitle(e.target.value)}
                placeholder={jobTitle}
                disabled={stage === 'submitting'}
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose} disabled={stage === 'submitting'}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={!titleMatches || stage === 'submitting'}
                className="bg-destructive hover:bg-destructive/90"
              >
                {stage === 'submitting' ? 'Aplicando...' : 'Confirmar alteração'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/empresa/job-form/EditWeightsConfirmDialog.tsx
git commit -m "feat(form): add EditWeightsConfirmDialog with double confirmation"
```

---

## Task 5: Wire `EditWeightsConfirmDialog` no `JobForm`

**Files:**
- Modify: `src/pages/empresa/JobForm.tsx`
- Modify: `src/hooks/useJobForm.ts`

- [ ] **Step 1: Adicionar mutation que chama Edge Function**

Em `src/hooks/useJobForm.ts`, adicionar:

```typescript
import { supabase } from '@/lib/supabase';

async function updateWeightsViaEdgeFunction(jobId: string, performedBy: string, newWeights: MatchWeights) {
  const { data, error } = await supabase.functions.invoke('update-job-weights', {
    body: {
      jobId,
      performedBy,
      newWeights: {
        skillsTechnical: newWeights.skillsTechnical,
        skillsBehavioral: newWeights.skillsBehavioral,
        experience: newWeights.experience,
        gaugePro: newWeights.gaugePro,
        location: newWeights.location,
      },
    },
  });
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Detectar caso "vaga publicada com candidaturas"**

Em `useJobForm`, ao salvar (handleSaveJob), verificar:

```typescript
const isWeightsChanged = isEditing && (
  formData.weightSkillsTechnical !== originalWeights.skillsTechnical ||
  // ... outros 4
);

const needsConfirmation = isEditing && jobStatus === 'active' && isWeightsChanged;
// activeApplicationsCount vem do fetch do job ou de useApplications
```

Expor:
- `needsWeightsConfirmation: boolean`
- `pendingWeights: MatchWeights | null`
- `confirmWeightsChange: () => Promise<void>` (chama a Edge Function)
- `cancelWeightsChange: () => void`

- [ ] **Step 3: Renderizar o dialog em `JobForm.tsx`**

```tsx
import { EditWeightsConfirmDialog } from '@/components/empresa/job-form/EditWeightsConfirmDialog';

// dentro do componente:
<EditWeightsConfirmDialog
  open={needsWeightsConfirmation}
  onOpenChange={cancelWeightsChange}
  jobTitle={formData.title}
  activeApplicationsCount={activeApplicationsCount}
  onConfirm={confirmWeightsChange}
/>
```

- [ ] **Step 4: Wiring do flow**

Quando usuário clica "Salvar vaga":

- Se `needsWeightsConfirmation` → abre dialog. Outras alterações (descrição, salário, etc) salvam normal via UPDATE direto, mas pesos só atualizam após confirmação.
- Implementar lógica: salvar campos não-pesos primeiro; se há mudança de pesos e candidaturas ativas, abrir dialog; ao confirmar, chamar Edge Function; ao concluir, navegar para a lista de vagas.

- [ ] **Step 5: Build + verificação manual**

```bash
npm run build
```

Manual:
1. Como empresa, abrir vaga publicada com pelo menos 1 candidatura
2. Aba Match, mexer slider
3. Clicar Salvar → modal aparece com "Atenção: N candidaturas ativas"
4. Continuar → modal pede digitar título
5. Digitar errado → botão Confirmar fica disabled
6. Digitar certo → botão habilita; clicar → Edge Function executa
7. Toast: "Pesos atualizados. N candidatos foram notificados."
8. Verificar SQL: `SELECT * FROM jobs_weight_history ORDER BY changed_at DESC LIMIT 1;` → linha presente
9. Verificar SQL: `SELECT COUNT(*) FROM notifications WHERE type = 'job_weights_changed';` → contagem aumenta

- [ ] **Step 6: Commit**

```bash
git add src/pages/empresa/JobForm.tsx src/hooks/useJobForm.ts
git commit -m "feat(form): wire double confirmation when editing weights of published job"
```

---

## Task 6: Implementar `applyDataAvailability` no calculator (Q4)

**Files:**
- Modify: `src/lib/matchCalculator.ts`

- [ ] **Step 1: Adicionar função helper**

Adicionar antes de `calculateMatchBreakdown`:

```typescript
/**
 * Aplica regras de Q4 sobre as 5 categorias:
 *  - Caso 1 (weight = 0): categoria removida do array
 *  - Caso 2 (weight > 0, dado ausente no lado da vaga): redistribui peso entre as restantes
 *  - Caso 3 (weight > 0, dado ausente no lado do candidato): score = 0, dataMissing = 'candidate-side'
 *  - Caso 4: cálculo normal
 */
function applyDataAvailability(categories: MatchCategory[]): MatchCategory[] {
  // 1. Remove peso=0
  const visible = categories.filter((c) => c.weight > 0);

  // 2. Identifica categorias 'job-side' (vaga não cadastrou dado): redistribuir peso
  const jobSideMissing = visible.filter((c) => c.dataMissing === 'job-side');
  const others = visible.filter((c) => c.dataMissing !== 'job-side');

  if (jobSideMissing.length === 0 || others.length === 0) {
    return visible.map((c) => ({ ...c, effectiveWeight: c.weight }));
  }

  const totalRedistribute = jobSideMissing.reduce((s, c) => s + c.weight, 0);
  const totalOthers = others.reduce((s, c) => s + c.weight, 0);

  return others.map((c) => ({
    ...c,
    effectiveWeight: c.weight + (c.weight / totalOthers) * totalRedistribute,
  }));
}
```

- [ ] **Step 2: Atualizar `calculateMatchBreakdown` para marcar `dataMissing` apropriadamente**

Localizar a montagem do array `categories` (Task 6 do Plano B). Após a criação, identificar:

```typescript
// Marca dataMissing
const gaugeProCategory = categories.find((c) => c.id === 'gauge_pro');
if (gaugeProCategory) {
  if (!idealProfile) {
    gaugeProCategory.dataMissing = 'job-side';
  } else if (!candidateProfile) {
    gaugeProCategory.dataMissing = 'candidate-side';
    gaugeProCategory.score = 0; // Q4 caso 3 — penalidade 0
  }
}

// Aplica regras
const processedCategories = applyDataAvailability(categories);
```

- [ ] **Step 3: Atualizar cálculo do `totalScore` para usar `effectiveWeight`**

Localizar o cálculo:

```typescript
const totalScore = Math.round(
  categories.reduce((sum, cat) => sum + (cat.score * cat.weight) / 100, 0)
);
```

Substituir por:

```typescript
const totalWeight = processedCategories.reduce((s, c) => s + (c.effectiveWeight ?? c.weight), 0);
const totalScore = totalWeight > 0
  ? Math.round(processedCategories.reduce(
      (sum, cat) => sum + (cat.score * (cat.effectiveWeight ?? cat.weight)) / totalWeight,
      0,
    ) * 100 / 100)  // a multiplicação por 100/100 é só pro Math.round; pode ser simplificado
  : 0;

// Substituir o array de categorias por processedCategories no return
```

Cuidado com a fórmula: `effectiveWeight` é o peso ajustado em escala de 0-100 (após redistribuição), então o cálculo de média ponderada usa `score * effectiveWeight / 100` mantendo a mesma escala.

- [ ] **Step 4: Atualizar return**

Trocar `categories` pelo `processedCategories` no objeto retornado pelo `calculateMatchBreakdown`.

- [ ] **Step 5: Build + smoke test no script de auditoria**

```bash
npm run build
npx tsx scripts/match-audit-after-fix.ts
```

Expected: scripts continuam rodando. Para uma vaga sem ideal_profile cadastrado, ver que o gauge_pro some do retorno e os outros pesos ajustam.

- [ ] **Step 6: Commit**

```bash
git add src/lib/matchCalculator.ts
git commit -m "feat(match): apply Q4 data availability rules in calculator"
```

---

## Task 7: Renderizar `dataMissing` no breakdown

**Files:**
- Modify: `src/components/match/MatchBreakdown.tsx`
- Modify: `src/components/match/MatchProgressBar.tsx`

- [ ] **Step 1: Esconder cards com peso=0**

Em `MatchBreakdown.tsx`, no map sobre categorias, garantir que `categories.filter((c) => c.weight > 0)` seja usado (ou já vem filtrado do calculator — ver Task 6).

Sem código novo se calculator já remove. Caso UI receba todas as categorias do legado, filtrar:

```tsx
{categories.filter((c) => c.weight > 0).map((category) => (
  <MatchProgressBar key={category.id} category={category} />
))}
```

- [ ] **Step 2: Estilizar cards com `dataMissing`**

Em `MatchProgressBar.tsx`, modificar o componente para reagir ao campo:

```tsx
import type { MatchCategory } from '@/types/disc';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MatchProgressBar({ category }: { category: MatchCategory }) {
  const isJobMissing = category.dataMissing === 'job-side';
  const isCandidateMissing = category.dataMissing === 'candidate-side';

  return (
    <div className={cn('space-y-1', isJobMissing && 'opacity-60 line-through')}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          {category.name} <span className="text-muted-foreground">({category.weight}%)</span>
          {isCandidateMissing && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3 h-3" /> Candidato não realizou Gauge-Pro
            </span>
          )}
          {isJobMissing && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              Empresa não definiu perfil ideal — não avaliado
            </span>
          )}
        </span>
        <span>{isJobMissing ? '—' : `${category.score}%`}</span>
      </div>
      {!isJobMissing && (
        <div className="h-1.5 bg-muted rounded overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${category.score}%`, backgroundColor: getColorForScore(category.score) }}
          />
        </div>
      )}
    </div>
  );
}
```

(Ajustar `getColorForScore` ou função existente.)

- [ ] **Step 3: Build + manual**

```bash
npm run build
```

Manual: criar vaga sem perfil ideal Gauge-Pro cadastrado e candidatar Sul Santana. Abrir match. Esperado: card "Perfil Comportamental" aparece riscado/cinza com "Empresa não definiu perfil ideal".

- [ ] **Step 4: Commit**

```bash
git add src/components/match/MatchBreakdown.tsx src/components/match/MatchProgressBar.tsx
git commit -m "feat(match): render dataMissing flags and hide zero-weight categories"
```

---

## Task 8: Hook `useMatchCombineSkills` (localStorage)

**Files:**
- Create: `src/hooks/useMatchCombineSkills.ts`

- [ ] **Step 1: Criar arquivo**

Conteúdo:

```typescript
import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'match-breakdown-combined-skills';

export function useMatchCombineSkills(): [boolean, (next: boolean) => void] {
  const [combined, setCombined] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const update = useCallback((next: boolean) => {
    setCombined(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(next));
    }
  }, []);

  // Sync entre tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setCombined(e.newValue === 'true');
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [combined, update];
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/hooks/useMatchCombineSkills.ts
git commit -m "feat(hooks): add useMatchCombineSkills with localStorage persistence"
```

---

## Task 9: Componente `MatchCombineSkillsToggle`

**Files:**
- Create: `src/components/match/MatchCombineSkillsToggle.tsx`

- [ ] **Step 1: Criar componente**

```typescript
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useId } from 'react';

export interface MatchCombineSkillsToggleProps {
  combined: boolean;
  onChange: (next: boolean) => void;
}

export function MatchCombineSkillsToggle({ combined, onChange }: MatchCombineSkillsToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={combined} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-xs text-muted-foreground cursor-pointer">
        Combinar skills
      </Label>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/match/MatchCombineSkillsToggle.tsx
git commit -m "feat(match): add MatchCombineSkillsToggle component"
```

---

## Task 10: Integrar toggle no `MatchBreakdown`

**Files:**
- Modify: `src/components/match/MatchBreakdown.tsx`

- [ ] **Step 1: Importar hook + componente**

```typescript
import { useMatchCombineSkills } from '@/hooks/useMatchCombineSkills';
import { MatchCombineSkillsToggle } from './MatchCombineSkillsToggle';
```

- [ ] **Step 2: Adicionar lógica de combinação**

```typescript
const [combined, setCombined] = useMatchCombineSkills();

const displayCategories = useMemo(() => {
  if (!combined) return categories;
  const tech = categories.find((c) => c.id === 'skills_technical');
  const beh = categories.find((c) => c.id === 'skills_behavioral');
  if (!tech || !beh) return categories;

  const others = categories.filter((c) => c.id !== 'skills_technical' && c.id !== 'skills_behavioral');
  const combinedWeight = tech.weight + beh.weight;
  const combinedScore = combinedWeight > 0
    ? Math.round((tech.score * tech.weight + beh.score * beh.weight) / combinedWeight)
    : 0;

  return [
    {
      id: 'skills_combined',
      name: 'Skills Técnicas',
      weight: combinedWeight,
      score: combinedScore,
      description: 'Inclui skills técnicas e comportamentais combinadas.',
    },
    ...others,
  ];
}, [categories, combined]);
```

- [ ] **Step 3: Renderizar toggle no header do breakdown**

```tsx
<div className="flex justify-between items-center mb-2">
  <span className="text-xs text-muted-foreground uppercase tracking-wider">Breakdown por Categoria</span>
  <MatchCombineSkillsToggle combined={combined} onChange={setCombined} />
</div>
```

E mapear sobre `displayCategories` em vez de `categories`.

- [ ] **Step 4: Build + manual**

```bash
npm run build
```

Manual:
- Login candidato → abrir match de uma vaga
- Toggle OFF: 5 categorias visíveis
- Click toggle → vai pra ON: 4 categorias (Skills + 3 outras)
- Score total não muda
- Recarregar página → toggle persiste

- [ ] **Step 5: Commit**

```bash
git add src/components/match/MatchBreakdown.tsx
git commit -m "feat(match): integrate combine-skills toggle in breakdown"
```

---

## Task 11: Componente `MatchCriteriaModal`

**Files:**
- Create: `src/components/match/MatchCriteriaModal.tsx`

- [ ] **Step 1: Criar componente**

Conteúdo:

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useJobWeightHistory } from '@/hooks/useJobWeightHistoryQuery';
import { DEFAULT_MATCH_WEIGHTS, type MatchWeights } from '@/types/matchWeights';
import { matchTemplate } from '@/lib/matchWeightTemplates';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface MatchCriteriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  weights: MatchWeights;
}

export function MatchCriteriaModal({ open, onOpenChange, jobId, jobTitle, weights }: MatchCriteriaModalProps) {
  const { data: history } = useJobWeightHistory(jobId);
  const isPersonalized =
    weights.skillsTechnical !== DEFAULT_MATCH_WEIGHTS.skillsTechnical ||
    weights.skillsBehavioral !== DEFAULT_MATCH_WEIGHTS.skillsBehavioral ||
    weights.experience !== DEFAULT_MATCH_WEIGHTS.experience ||
    weights.gaugePro !== DEFAULT_MATCH_WEIGHTS.gaugePro ||
    weights.location !== DEFAULT_MATCH_WEIGHTS.location;

  const activeTemplate = matchTemplate(weights);

  const rows = [
    { name: 'Skills Técnicas', current: weights.skillsTechnical, default: DEFAULT_MATCH_WEIGHTS.skillsTechnical, color: 'bg-amber-500' },
    { name: 'Skills Comportamentais', current: weights.skillsBehavioral, default: DEFAULT_MATCH_WEIGHTS.skillsBehavioral, color: 'bg-red-500' },
    { name: 'Experiência', current: weights.experience, default: DEFAULT_MATCH_WEIGHTS.experience, color: 'bg-cyan-500' },
    { name: 'Perfil Comportamental', current: weights.gaugePro, default: DEFAULT_MATCH_WEIGHTS.gaugePro, color: 'bg-violet-400' },
    { name: 'Localização', current: weights.location, default: DEFAULT_MATCH_WEIGHTS.location, color: 'bg-emerald-400' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Critérios desta vaga
            {isPersonalized && <Badge variant="outline" className="text-violet-600 border-violet-400">PERSONALIZADO</Badge>}
            {activeTemplate && <Badge variant="secondary">{activeTemplate.name}</Badge>}
          </DialogTitle>
          <DialogDescription>{jobTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <div className="text-xs uppercase text-muted-foreground mb-2">Distribuição dos pesos</div>
            <div className="flex h-3 rounded overflow-hidden bg-muted">
              {rows.map((r) => (
                <span key={r.name} className={r.color} style={{ width: `${r.current}%` }} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
              {rows.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-sm ${r.color}`} />
                  <span>{r.name} · {r.current}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase text-muted-foreground mb-2">Comparação com o padrão geral</div>
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr><th className="text-left py-1">Categoria</th><th className="text-right">Esta vaga</th><th className="text-right">Padrão</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const delta = r.current - r.default;
                  return (
                    <tr key={r.name} className="border-t">
                      <td className="py-1">{r.name}</td>
                      <td className="text-right">{r.current}%</td>
                      <td className={`text-right ${delta === 0 ? 'text-muted-foreground' : delta > 0 ? 'text-amber-500' : 'text-cyan-500'}`}>
                        {r.default}% {delta > 0 ? `+${delta}` : delta < 0 ? delta : '='}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <div className="text-xs uppercase text-muted-foreground mb-2">Histórico de alterações</div>
            {history && history.length > 0 ? (
              <ul className="space-y-1.5 text-xs">
                {history.map((h) => (
                  <li key={h.id} className="flex gap-3 p-2 bg-muted rounded">
                    <span className="text-muted-foreground min-w-[90px]">
                      {format(new Date(h.changedAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <span>Empresa ajustou os critérios da vaga.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">Sem alterações após publicação.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/match/MatchCriteriaModal.tsx
git commit -m "feat(match): add MatchCriteriaModal with distribution + history"
```

---

## Task 12: Wire `MatchCriteriaModal` no `JobDetails`

**Files:**
- Modify: `src/pages/candidato/JobDetails.tsx`

- [ ] **Step 1: Adicionar state + botão**

```typescript
import { useState } from 'react';
import { MatchCriteriaModal } from '@/components/match/MatchCriteriaModal';
import { Button } from '@/components/ui/button';

const [criteriaOpen, setCriteriaOpen] = useState(false);
```

- [ ] **Step 2: Renderizar botão acima do `MatchBreakdown`**

```tsx
<div className="flex items-center justify-between mb-3">
  <h3 className="text-sm font-semibold">Match com {job.title}</h3>
  <Button variant="outline" size="sm" onClick={() => setCriteriaOpen(true)}>
    Ver critérios da vaga
  </Button>
</div>

<MatchBreakdown ... />

<MatchCriteriaModal
  open={criteriaOpen}
  onOpenChange={setCriteriaOpen}
  jobId={job.id}
  jobTitle={job.title}
  weights={{
    skillsTechnical: job.weightSkillsTechnical ?? DEFAULT_MATCH_WEIGHTS.skillsTechnical,
    skillsBehavioral: job.weightSkillsBehavioral ?? DEFAULT_MATCH_WEIGHTS.skillsBehavioral,
    experience: job.weightExperience ?? DEFAULT_MATCH_WEIGHTS.experience,
    gaugePro: job.weightGaugePro ?? DEFAULT_MATCH_WEIGHTS.gaugePro,
    location: job.weightLocation ?? DEFAULT_MATCH_WEIGHTS.location,
  }}
/>
```

- [ ] **Step 3: Build + manual**

```bash
npm run build
```

Manual: candidato abre vaga, vê botão "Ver critérios da vaga", clica → modal abre com distribuição + comparação + histórico.

- [ ] **Step 4: Commit**

```bash
git add src/pages/candidato/JobDetails.tsx
git commit -m "feat(match): wire MatchCriteriaModal into JobDetails"
```

---

## Task 13: Renderizar tipo de notificação `job_weights_changed`

**Files:**
- Modify: `src/types/notifications.ts` (ou onde os types de notification estão)
- Modify: tela de notificações do candidato

- [ ] **Step 1: Identificar onde notifications são renderizadas**

Run:
```bash
grep -rn "type === 'application_status\|notification.type" src/pages/candidato/ src/components/ 2>&1 | head -10
```

- [ ] **Step 2: Adicionar caso para o novo type**

No componente que renderiza notification items, adicionar:

```tsx
case 'job_weights_changed': {
  const jobId = notification.payload?.job_id;
  return (
    <Link to={`/candidato/vagas/${jobId}`} className="...">
      <div className="font-medium">{notification.title}</div>
      <div className="text-sm text-muted-foreground">{notification.message}</div>
    </Link>
  );
}
```

- [ ] **Step 3: Atualizar lista de tipos válidos (se houver enum)**

```typescript
export type NotificationType =
  | 'application_status'
  | 'message'
  | 'invite'
  | 'job_weights_changed'
  // ...
```

- [ ] **Step 4: Build + manual**

```bash
npm run build
```

Manual:
1. Como empresa, editar pesos de vaga com candidaturas (passar pela dupla confirmação)
2. Logout
3. Login como candidato afetado
4. Sino mostra badge → abrir notificações → ver "Critérios da vaga foram atualizados"
5. Clicar → vai para a vaga → ver Match recalculado

- [ ] **Step 5: Commit**

```bash
git add src/types/notifications.ts <arquivos-de-tela-de-notif>
git commit -m "feat(notifications): render job_weights_changed type"
```

---

## Task 14: Atualizar changelog

**Files:**
- Modify: `public/changelog.json`
- Modify: `src/constants/app.ts`
- Modify: `package.json`

- [ ] **Step 1: Adicionar versão 1.57.0 "Mirror"**

No topo do changelog:

```json
{
  "version": "1.57.0",
  "codename": "Mirror",
  "date": "2026-04-30",
  "isCurrent": true,
  "items": [
    {
      "type": "added",
      "title": "Modal Ver critérios da vaga + toggle Combinar skills",
      "description": "Candidato agora pode abrir um modal com distribuição dos pesos da vaga, comparação com o padrão e histórico de alterações. Toggle local na tela de match permite colapsar Skills Técnicas e Comportamentais numa categoria só.",
      "details": {
        "0": {
          "description": "MatchCriteriaModal usa useJobWeightHistory para mostrar mudanças. Toggle Combinar skills persiste em localStorage e funciona em todas as 7 telas que renderizam MatchBreakdown.",
          "files": [
            "src/components/match/MatchCriteriaModal.tsx",
            "src/components/match/MatchCombineSkillsToggle.tsx",
            "src/components/match/MatchBreakdown.tsx",
            "src/hooks/useMatchCombineSkills.ts",
            "src/hooks/useJobWeightHistoryQuery.ts",
            "src/pages/candidato/JobDetails.tsx"
          ],
          "routes": ["/candidato/vagas/:id", "/empresa/candidatos/:id"]
        }
      }
    },
    {
      "type": "added",
      "title": "Edição segura de pesos com dupla confirmação e notificação",
      "description": "Editar pesos de vaga publicada com candidaturas ativas exige dupla confirmação (digitar título da vaga). Cada alteração é registrada em jobs_weight_history e dispara notificação para todos os candidatos afetados.",
      "details": {
        "0": {
          "description": "Edge Function update-job-weights faz update+history atomicamente. Trigger SQL gera notifications type='job_weights_changed'. Modal EditWeightsConfirmDialog implementa fluxo de 2 etapas.",
          "files": [
            "sql/migrations/093_jobs_weight_history.sql",
            "supabase/functions/update-job-weights/index.ts",
            "src/components/empresa/job-form/EditWeightsConfirmDialog.tsx",
            "src/hooks/useJobForm.ts",
            "src/pages/empresa/JobForm.tsx"
          ],
          "routes": ["/empresa/vagas/:id/editar"]
        }
      }
    },
    {
      "type": "changed",
      "title": "Categorias com peso 0 ficam ocultas no breakdown",
      "description": "Empresa pode definir peso=0 em categorias que não importam (ex: Localização para vaga remota). A categoria some completamente da tela de match em vez de aparecer com 0%.",
      "details": {
        "0": {
          "description": "applyDataAvailability no calculator filtra peso=0 e redistribui peso quando vaga não tem perfil ideal cadastrado. Candidato sem teste Gauge-Pro vê card riscado com flag.",
          "files": [
            "src/lib/matchCalculator.ts",
            "src/components/match/MatchProgressBar.tsx"
          ],
          "routes": ["/candidato/vagas/:id"]
        }
      }
    }
  ]
},
```

E remover `"isCurrent": true` da v1.56.0.

- [ ] **Step 2: Atualizar `src/constants/app.ts` para `1.57.0` "Mirror"**

- [ ] **Step 3: Atualizar `package.json` `version: "1.57.0"`**

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add public/changelog.json src/constants/app.ts package.json
git commit -m "chore: bump version to 1.57.0 Mirror"
```

---

## Task 15: Verificação final

- [ ] **Step 1: Smoke test completo end-to-end**

Cenário cobrindo todas as features deste plano:

1. **Empresa** abre vaga publicada com 2 candidaturas
2. Aba Match → mexer slider → Salvar → modal 1 (impacto) → Continuar → modal 2 (digitar título) → Confirmar
3. SQL: `SELECT * FROM jobs_weight_history WHERE job_id = '<id>';` → 1 linha
4. SQL: `SELECT * FROM notifications WHERE type = 'job_weights_changed';` → 2 linhas (1 por candidato)
5. **Candidato A** loga → sino com badge → click → ve notificação → click → vai pra vaga → match score recalculado
6. **Candidato A** clica "Ver critérios da vaga" → modal mostra distribuição + delta vs padrão + histórico
7. **Candidato A** ativa toggle "Combinar skills" → 5 cards viram 4
8. Recarrega → toggle persiste em ON
9. Desativa toggle → volta pra 5
10. **Empresa** edita vaga e seta `weight_location = 0` → Salvar (sem candidaturas pra esse cenário, ou aceitar dupla confirmação se houver)
11. **Candidato** abre o match dessa vaga → categoria Localização não aparece no breakdown
12. **Empresa** cria vaga sem cadastrar perfil ideal Gauge-Pro
13. **Candidato com Gauge-Pro** abre o match → categoria "Perfil Comportamental" aparece riscada com "Empresa não definiu perfil ideal"
14. **Candidato sem Gauge-Pro** abre uma vaga com perfil ideal → categoria "Perfil Comportamental" aparece com 0% e flag "Candidato não realizou Gauge-Pro"

- [ ] **Step 2: Lint final**

```bash
npm run lint
```

Expected: PASS sem novos warnings.

- [ ] **Step 3: Auditoria empírica**

```bash
npx tsx scripts/match-audit-after-fix.ts
```

Expected: tabela ainda funciona; scores podem ter mudado por causa de redistribuição quando perfil ideal não está cadastrado.

- [ ] **Step 4: Push final**

```bash
git log --oneline -25
git push origin <branch>
```

---

## Critérios de aceite (do spec)

- [x] Tabela `jobs_weight_history` criada com RLS correta
- [x] Edge Function `update-job-weights` valida soma e conta candidaturas
- [x] Trigger gera notificações a candidatos ativos
- [x] Modal "Ver critérios" mostra distribuição + comparação + histórico
- [x] Modal de dupla confirmação requer digitar título exato da vaga
- [x] Toggle "Combinar skills" funciona nas 7 telas com persistência localStorage
- [x] Card peso=0 fica oculto no breakdown
- [x] Card "Não avaliado" aparece quando candidato sem teste

## Notas importantes

- **Edge Function deploy**: lembrar de configurar `verify_jwt = false` no `supabase/config.toml` (memória do projeto). Sem isso, supabase.functions.invoke() falha com 401.
- **Cache**: após edição de pesos, o React Query precisa invalidar caches relacionados a match. A Edge Function não invalida sozinha — clientes precisam ouvir realtime ou refetch ao receber notificação.
- **Performance do trigger**: para vaga com 1000 candidaturas ativas, o trigger insere 1000 notifications de uma vez. Aceitar esse custo (transação atomicamente). Se virar gargalo, mover para job assíncrono via pg_notify.
- **`MatchCriteriaModal` mostra histórico read-only**: quem clicou ver os deltas pode comparar mentalmente com o score atual. Para ver deltas dos pesos antigos vs novos no histórico, expandir o item para mostrar `oldWeights` vs `newWeights` (entrega futura).
