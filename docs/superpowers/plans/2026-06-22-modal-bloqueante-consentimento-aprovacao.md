# Modal Bloqueante de Consentimento na Aprovação — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quando o candidato é aprovado numa vaga (`application.status = 'offer'` com `disclosure.status = 'pending'`), exibir um modal de celebração **bloqueante** que força uma decisão — aceitar a vaga + liberar dados, recusar só os dados, ou recusar a vaga — travando o resto da plataforma do candidato até ele resolver.

**Architecture:** Um componente único `PendingApprovalGate` é montado **uma vez** no topo da árvore autenticada (em `App.tsx`, dentro do Router). Ele detecta aprovações pendentes via `usePendingApprovals` (seleciona `offer` + `disclosure pending` cruzando hooks já existentes) e renderiza `ApprovalConsentModal` (Conceito A) em modo bloqueante (sem `Esc`, sem fechar no overlay, sem botão X). O modal é **extraído** do código inline que já existe em `candidato/Applications.tsx` e reaproveitado nos dois lugares (gate global + página). Nenhuma migration: o backend de consentimento já está deployado e a RLS `applications_update_candidate` já permite `offer → withdrawn`.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind + shadcn/ui (Radix Dialog), React Query, Framer Motion, vitest. Hooks de consentimento e service `manage-data-consent` já existentes.

## Global Constraints

- Idioma de UI: **português do Brasil** com acentuação correta (ã, ç, é, í, ó, ú, â, ê, ô). Código/identificadores em inglês.
- Design system RecrutaRS: Navy (primary) + Cyan (accent), Roboto Mono, dark mode. Usar tokens/CSS vars existentes (`text-foreground`, `bg-card`, `gradient-primary`, `text-success`, `text-destructive` etc.) — **não** hardcodar hex.
- Consentimento LGPD Art. 7º, I: a recusa precisa ter peso visual equivalente ao aceite (não-coercitivo). A "trava" libera com **aceite OU recusa** — nunca força o aceite.
- Acessibilidade: focus-trap (Radix), foco inicial fora do botão de aceite, `prefers-reduced-motion` respeitado na celebração, contraste ≥ 4.5:1, alvos ≥ 44px.
- Sem novas dependências. Sem `any`. Sem migration/RLS/Edge Function (já prontos).
- Não tocar fluxo da empresa nem o `revoke` existente.
- Reaproveitar, não duplicar: o modal de decisão passa a ter **uma** fonte de verdade.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/hooks/usePendingApprovals.ts` (criar) | `selectPendingApprovals()` (puro, testável) + hook `usePendingApprovals(candidateId)` |
| `src/hooks/usePendingApprovals.test.ts` (criar) | Testes vitest da seleção pura |
| `src/components/consent/ApprovalConsentModal.tsx` (criar) | Modal Conceito A (UI + 3 ações), modo `blocking` e não-bloqueante |
| `src/components/auth/PendingApprovalGate.tsx` (criar) | Monta o modal global em modo bloqueante quando há pendência |
| `src/components/ui/dialog.tsx` (modificar) | Prop opcional `hideClose` no `DialogContent` (backward-compatible) |
| `src/App.tsx` (modificar) | Montar `<PendingApprovalGate />` uma vez dentro do `<BrowserRouter>` |
| `src/pages/candidato/Applications.tsx` (modificar) | Trocar o modal inline pelo `ApprovalConsentModal` compartilhado; manter termo + revogação |

---

## Task 1: Detecção de aprovações pendentes (`usePendingApprovals`)

**Files:**
- Create: `src/hooks/usePendingApprovals.ts`
- Test: `src/hooks/usePendingApprovals.test.ts`

**Interfaces:**
- Consumes: `useApplicationsByCandidate` (de `@/hooks/useApplicationsQuery`), `useCandidateDisclosures` (de `@/hooks/useCandidateDisclosures`), tipos `Application` (`@/types`), `DataDisclosure` (`@/types/consent`).
- Produces:
  - `interface PendingApproval { application: Application; disclosure: DataDisclosure }`
  - `selectPendingApprovals(applications: Application[], disclosures: Record<string, DataDisclosure>): PendingApproval[]`
  - `usePendingApprovals(candidateId: string): PendingApproval[]`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/hooks/usePendingApprovals.test.ts
import { describe, it, expect } from 'vitest';
import { selectPendingApprovals } from './usePendingApprovals';
import type { Application } from '@/types';
import type { DataDisclosure } from '@/types/consent';

const app = (id: string, status: Application['status'], updatedAt = '2026-06-20'): Application => ({
  id, jobId: `job-${id}`, candidateId: 'cand-1', candidateName: 'X',
  jobTitle: 'Dev', companyName: 'ACME', status,
  appliedAt: '2026-06-01', updatedAt,
} as Application);

const disc = (applicationId: string, status: DataDisclosure['status']): DataDisclosure => ({
  id: `d-${applicationId}`, applicationId, candidateId: 'cand-1', companyId: 'co-1', status,
  createdAt: '2026-06-20',
} as DataDisclosure);

describe('selectPendingApprovals', () => {
  it('inclui apenas offer + disclosure pending', () => {
    const apps = [app('1', 'offer'), app('2', 'reviewing'), app('3', 'offer'), app('4', 'hired')];
    const discs = { '1': disc('1', 'pending'), '3': disc('3', 'accepted'), '2': disc('2', 'pending') };
    const result = selectPendingApprovals(apps, discs);
    expect(result.map(r => r.application.id)).toEqual(['1']);
  });

  it('retorna vazio quando não há offer com disclosure pending', () => {
    expect(selectPendingApprovals([app('1', 'reviewing')], {})).toEqual([]);
    expect(selectPendingApprovals([app('1', 'offer')], {})).toEqual([]); // sem disclosure
  });

  it('ordena por updatedAt ascendente (mais antiga primeiro)', () => {
    const apps = [app('1', 'offer', '2026-06-21'), app('2', 'offer', '2026-06-19')];
    const discs = { '1': disc('1', 'pending'), '2': disc('2', 'pending') };
    expect(selectPendingApprovals(apps, discs).map(r => r.application.id)).toEqual(['2', '1']);
  });
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm test -- usePendingApprovals`
Expected: FAIL — `selectPendingApprovals` não existe / módulo não encontrado.

- [ ] **Step 3: Implementar o hook + seletor puro**

```ts
// src/hooks/usePendingApprovals.ts
/**
 * Detects "blocking" approvals for the logged-in candidate: applications that
 * reached status 'offer' but whose data-disclosure consent is still 'pending'.
 * The candidate must resolve each one (accept / refuse data / decline job)
 * before the platform unlocks. Pure `selectPendingApprovals` is unit-tested;
 * the hook just wires the two existing queries together.
 */
import { useMemo } from 'react';
import { useApplicationsByCandidate } from '@/hooks/useApplicationsQuery';
import { useCandidateDisclosures } from '@/hooks/useCandidateDisclosures';
import type { Application } from '@/types';
import type { DataDisclosure } from '@/types/consent';

export interface PendingApproval {
  application: Application;
  disclosure: DataDisclosure;
}

export function selectPendingApprovals(
  applications: Application[],
  disclosures: Record<string, DataDisclosure>,
): PendingApproval[] {
  return applications
    .filter(
      (app) => app.status === 'offer' && disclosures[app.id]?.status === 'pending',
    )
    .map((app) => ({ application: app, disclosure: disclosures[app.id] }))
    .sort(
      (a, b) =>
        new Date(a.application.updatedAt).getTime() -
        new Date(b.application.updatedAt).getTime(),
    );
}

export function usePendingApprovals(candidateId: string): PendingApproval[] {
  const { data: applications = [] } = useApplicationsByCandidate(candidateId);
  const { data: disclosures = {} } = useCandidateDisclosures(candidateId);
  return useMemo(
    () => selectPendingApprovals(applications, disclosures),
    [applications, disclosures],
  );
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npm test -- usePendingApprovals`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePendingApprovals.ts src/hooks/usePendingApprovals.test.ts
git commit -m "feat(consent): add usePendingApprovals detection hook (TDD)"
```

---

## Task 2: Prop `hideClose` no `DialogContent`

**Files:**
- Modify: `src/components/ui/dialog.tsx`

**Interfaces:**
- Produces: `DialogContent` aceita `hideClose?: boolean` (default `false`) — quando `true`, o botão X embutido não é renderizado. Mudança backward-compatible (todos os usos atuais continuam com o X).

- [ ] **Step 1: Ler o arquivo e localizar o botão de fechar embutido**

Run: abrir `src/components/ui/dialog.tsx`. Confirmar que `DialogContent` renderiza um `<DialogPrimitive.Close>` fixo (X no canto). Anotar a assinatura atual de props.

- [ ] **Step 2: Adicionar a prop e condicionar o X**

Adicionar `hideClose` ao tipo das props do `DialogContent` e envolver o `<DialogPrimitive.Close>` embutido em `{!hideClose && ( ... )}`. Exemplo do padrão (ajustar nomes ao arquivo real):

```tsx
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn(/* ...existing... */, className)} {...props}>
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 /* ...existing classes... */">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
```

- [ ] **Step 3: Verificar typecheck do arquivo**

Run: `npx tsc --noEmit 2>&1 | grep dialog.tsx`
Expected: vazio (sem novos erros).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/dialog.tsx
git commit -m "feat(ui): add hideClose prop to DialogContent (backward-compatible)"
```

---

## Task 3: `ApprovalConsentModal` (Conceito A, reutilizável)

**Files:**
- Create: `src/components/consent/ApprovalConsentModal.tsx`

**Interfaces:**
- Consumes: `useConsentDecision` (`accept`, `refuse` mutations), `useUpdateApplicationStatus` (`@/hooks/useApplicationsQuery`), `computeTermHash`/`CONSENT_TERM_VERSION`/`CONSENT_TERM_TEXT` (`@/lib/consentTerm`), `useAuth`, `Dialog`/`DialogContent` (com `hideClose`), `AlertDialog` (confirmação de recusar vaga), `Application`, `DataDisclosure`.
- Produces:
```ts
interface ApprovalConsentModalProps {
  open: boolean;
  application: Application;
  disclosure: DataDisclosure;
  blocking?: boolean;          // default false — true desabilita Esc/overlay/X
  queueIndex?: number;         // 1-based, p/ "1 de N"
  queueTotal?: number;
  onOpenChange?: (open: boolean) => void;
  onResolved?: () => void;     // chamado após aceitar/recusar dados/recusar vaga
}
export function ApprovalConsentModal(props: ApprovalConsentModalProps): JSX.Element
```

- [ ] **Step 1: Implementar o componente (UI Conceito A + 3 ações)**

Pontos obrigatórios:
- **Ações:**
  - `handleAccept`: exige `consentChecked`; `const termHash = await computeTermHash(CONSENT_TERM_TEXT)`; `await accept.mutateAsync({ applicationId: application.id, termVersion: CONSENT_TERM_VERSION, termHash })`; no sucesso → `onResolved?.()` + `onOpenChange?.(false)`.
  - `handleRefuseData`: `await refuse.mutateAsync(application.id)` (mantém a vaga, oculta dados, destrava). Sucesso → `onResolved?.()` + fechar.
  - `handleDeclineJob`: abre `AlertDialog` de confirmação; ao confirmar, `await updateStatus.mutateAsync({ id: application.id, status: 'withdrawn', reason: 'Candidato recusou a proposta' })`. Sucesso → `onResolved?.()` + fechar.
- **Modo blocking:** no `<DialogContent hideClose={blocking} onEscapeKeyDown / onPointerDownOutside / onInteractOutside>` com `e.preventDefault()` **somente quando `blocking`**. Quando não-blocking, comportamento normal (X + Esc).
- **Acessibilidade/motion:** foco inicial no `DialogTitle` (usar `autoFocus` num elemento não-destrutivo ou `onOpenAutoFocus` apontando o título); animação da medalha via Framer Motion `scale-in` **dentro de** `useReducedMotion()` (sem animação se reduzido).
- **Parties p/ o termo:** construir `ConsentTermParties` a partir de `currentCandidate` + `application` (mesma lógica do `buildParties` atual em Applications.tsx). Incluir botão "Ver termo completo" abrindo `ConsentTermDialog` (reusar componente existente) — para `disclosure.status === 'accepted'` o termo é o registrado; aqui (pending) o botão mostra a **prévia** do termo (`CONSENT_TERM_TEXT`).
- **Copy** (pt-BR, acentos corretos): título "Parabéns! Você foi aprovado", subtítulo `"${companyName} aprovou sua candidatura para "${jobTitle}". Conclua para concretizar."`; chips dos 5 dados (CPF, E-mail, Telefone, Data de nascimento, Endereço); base legal "Base legal: consentimento — LGPD Art. 7º, I"; checkbox "Li e autorizo o compartilhamento dos meus dados pessoais com a empresa para fins de contratação."; nota de auditoria "Registramos data, hora, IP e versão do termo."; rodapé com **dois** botões de recusa: "Recusar dados" (ghost, mantém vaga) e "Recusar vaga" (ghost destrutivo, desiste); microcópia "Você pode recusar livremente — sua decisão é registrada e seus dados seguem ocultos até você autorizar."
- **Fila:** se `queueTotal && queueTotal > 1`, mostrar badge "Aprovação {queueIndex} de {queueTotal}".
- **Estados de loading:** botões desabilitados + spinner enquanto `accept.isPending || refuse.isPending || updateStatus.isPending`.

Visual de referência: Conceito A aprovado (medalha cyan, header celebração, 2 etapas, chips, checkbox, rodapé com primário verde "Aceitar vaga e liberar dados" + recusas). Usar tokens do tema (`text-success`, `text-primary`, `bg-card`, `text-destructive`), não hex.

- [ ] **Step 2: Verificar typecheck do componente**

Run: `npx tsc --noEmit 2>&1 | grep ApprovalConsentModal`
Expected: vazio.

- [ ] **Step 3: Commit**

```bash
git add src/components/consent/ApprovalConsentModal.tsx
git commit -m "feat(consent): add reusable ApprovalConsentModal (Concept A) with accept / refuse-data / decline-job"
```

---

## Task 4: `PendingApprovalGate` (trava global)

**Files:**
- Create: `src/components/auth/PendingApprovalGate.tsx`

**Interfaces:**
- Consumes: `useAuth`, `usePendingApprovals`, `ApprovalConsentModal`.
- Produces: `export function PendingApprovalGate(): JSX.Element | null`

- [ ] **Step 1: Implementar o gate**

```tsx
// src/components/auth/PendingApprovalGate.tsx
/**
 * Global gate (mounted once in App). When the logged-in candidate has an
 * approval whose data consent is still pending, renders a BLOCKING modal that
 * locks the rest of the platform until they accept, refuse data, or decline
 * the job. Mirrors OnboardingGuard's bypass rules (loading / impersonation /
 * non-candidate). Resolving one pending item reveals the next (queue).
 */
import { useAuth } from '@/contexts/AuthContext';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { ApprovalConsentModal } from '@/components/consent/ApprovalConsentModal';

export function PendingApprovalGate() {
  const { user, currentCandidate, loading, isImpersonationActive } = useAuth();
  const candidateId = currentCandidate?.id ?? '';
  const pending = usePendingApprovals(candidateId);

  if (loading || isImpersonationActive) return null;
  if (!user || user.type !== 'candidate' || !currentCandidate) return null;
  if (pending.length === 0) return null;

  const current = pending[0];
  return (
    <ApprovalConsentModal
      open
      blocking
      application={current.application}
      disclosure={current.disclosure}
      queueIndex={1}
      queueTotal={pending.length}
    />
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc --noEmit 2>&1 | grep PendingApprovalGate`
Expected: vazio.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/PendingApprovalGate.tsx
git commit -m "feat(consent): add PendingApprovalGate that locks the candidate platform on pending approval"
```

---

## Task 5: Montar o gate em `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `PendingApprovalGate`. Montado **dentro** do `<BrowserRouter>` (precisa do Router p/ contexto) e **sob** os providers `AuthProvider` + `QueryClientProvider` (já são ancestrais do Router).

- [ ] **Step 1: Importar e montar uma vez, antes de `<Routes>`**

Adicionar o import junto aos outros guards:
```tsx
import { PendingApprovalGate } from "@/components/auth/PendingApprovalGate";
```
E dentro do `<BrowserRouter>` (ou `<Router>`), imediatamente antes de `<Routes>`:
```tsx
<PendingApprovalGate />
<Routes>
  {/* ...rotas... */}
</Routes>
```
Confirmar que `AuthProvider` e `QueryClientProvider` envolvem o `BrowserRouter` (se o `BrowserRouter` estiver acima do `AuthProvider`, montar o gate logo abaixo do `AuthProvider` em vez de antes de `<Routes>`). O gate **não** pode ficar fora do `AuthProvider`.

- [ ] **Step 2: Verificar build + typecheck**

Run: `npx tsc --noEmit 2>&1 | grep App.tsx` → vazio
Run: `npm run build` → sem erros

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(consent): mount PendingApprovalGate globally for candidates"
```

---

## Task 6: Refatorar `candidato/Applications.tsx` para reusar o modal

**Files:**
- Modify: `src/pages/candidato/Applications.tsx`

**Interfaces:**
- Consumes: `ApprovalConsentModal`. Mantém `ConsentTermDialog` (ver termo) e o `AlertDialog` de **revogação** existentes.

- [ ] **Step 1: Substituir o `<Dialog>` inline de decisão pelo componente compartilhado**

- Remover o `<Dialog open={!!consentAppId}>...</Dialog>` inline (linhas do modal de decisão) e os handlers `handleAccept`/`handleRefuse` locais + estados `consentChecked` (migram para dentro do `ApprovalConsentModal`).
- Manter `consentAppId` para controlar qual app está aberto. Renderizar:
```tsx
{consentApp && consentDisclosure && (
  <ApprovalConsentModal
    open={!!consentAppId}
    application={consentApp}
    disclosure={consentDisclosure}
    onOpenChange={(o) => !o && setConsentAppId(null)}
    onResolved={() => setConsentAppId(null)}
  />
)}
```
onde `consentApp = applications.find(a => a.id === consentAppId)` e `consentDisclosure = consentAppId ? disclosures[consentAppId] : undefined`.
- Os botões de card existentes ("Revisar compartilhamento" p/ pending+offer; "Autorizar compartilhamento" p/ refused+offer) continuam chamando `openConsentModal(app.id)` → agora abrem o modal compartilhado (modo **não-blocking**, com X/Esc).
- **Manter intactos**: `ConsentTermDialog` (Ver termo) e o `AlertDialog` de revogação (`revokeAppId` + `handleRevoke`).

- [ ] **Step 2: Verificar typecheck do arquivo**

Run: `npx tsc --noEmit 2>&1 | grep "candidato/Applications"`
Expected: vazio.

- [ ] **Step 3: Verificação visual no preview (evidência)**

Subir o dev server (worktree) e validar com candidato `joao.santos@email.com` / `Candidate@123`:
- (a) Com uma `offer` + disclosure `pending`: ao logar/navegar em `/candidato/*`, o modal bloqueante abre sozinho; `Esc`/clique fora **não** fecham; não há X.
- (b) "Aceitar vaga e liberar dados" → toast de sucesso, modal fecha, plataforma destrava, empresa passa a ver os dados.
- (c) "Recusar dados" → fecha, destrava, vaga continua como Proposta, dados seguem ocultos; botão "Autorizar compartilhamento" reaparece no card.
- (d) "Recusar vaga" → confirma no AlertDialog → candidatura vira Desistência, destrava.
- Conferir em viewport 375px e dark mode.

Registrar evidências com `preview_screenshot` (modal aberto) + `preview_console_logs` (sem erros).

- [ ] **Step 4: Commit**

```bash
git add src/pages/candidato/Applications.tsx
git commit -m "refactor(consent): reuse ApprovalConsentModal in candidate Applications page"
```

---

## Verificação final (pós-implementação — evidência, não teatro)

```
[ ] npm test               → consentTerm/piiMask/converters + usePendingApprovals verdes
[ ] npx tsc --noEmit       → sem NOVOS erros nos arquivos tocados (baseline pré-existente do projeto é sujo; comparar só os arquivos do diff)
[ ] npm run lint           → sem novos warnings
[ ] npm run build          → build verde
[ ] git diff --stat        → apenas os 7 arquivos previstos
[ ] Preview: cenários (a)-(d) do Task 6 + 375px + dark mode, console limpo
[ ] Revisão ortográfica PT de toda copy nova (Anexo A do pre-task)
```

## Code review final (tier Médio)

Após a verificação, rodar `superpowers:requesting-code-review` (ou `Agent` com `subagent_type: superpowers:code-reviewer`) com o diff + este plano. Briefing: regressões no fluxo de consentimento já existente (aceite/recusa/revogação na página), vazamento da trava (consegue contornar?), coerção (recusa tem peso real?), `any`/hardcoded colors, a11y do modal bloqueante.

---

## Self-Review (executado na escrita do plano)

1. **Cobertura do pedido do usuário:**
   - "modal avisando sobre a aprovação" → Task 3 (Conceito A, header celebração). ✓
   - "aceite da vaga + liberação dos dados" → Task 3 (`handleAccept` faz as duas coisas: aceita a proposta e registra consentimento; a contratação fica liberada). ✓
   - "travar os demais acessos enquanto não resolver" → Tasks 4+5 (gate global bloqueante). ✓
   - "sai com aceita OU recusa" → Task 3 (3 ações, todas destravam). ✓
   - Dois botões separados (decisão do usuário) → Task 3 ("Recusar dados" + "Recusar vaga"). ✓
   - Ênfase visual (Conceito A) → Task 3. ✓
2. **Placeholders:** os passos de lógica pura têm código real (Task 1). Tasks de UI (3) descrevem requisitos + copy exata + assinaturas; o JSX completo é montado na execução a partir do componente inline já existente (DRY) — aceitável por ser refactor de código existente, não invenção.
3. **Consistência de tipos:** `selectPendingApprovals`/`usePendingApprovals`/`PendingApproval` batem entre Tasks 1, 4. `ApprovalConsentModalProps` consistente entre Tasks 3, 4, 6. `hideClose` (Task 2) consumido na Task 3. Ações usam assinaturas reais já verificadas (`accept.mutateAsync({applicationId, termVersion, termHash})`, `refuse.mutateAsync(id)`, `updateStatus.mutateAsync({id, status, reason})`).
4. **Sem migration/RLS:** confirmado — `applications_update_candidate` permite `offer → withdrawn`; backend de consentimento já deployado.

## Setup de execução (Task 0, no início da execução)

Trabalho **não** pode sair de `feat/financial-entries` (não contém o código LGPD). Criar worktree isolado a partir da `main` atualizada (`9203593`):
- Usar `superpowers:using-git-worktrees` para criar worktree de `main` com branch `feat/consent-blocking-modal`.
- Copiar/regravar este plano dentro do worktree em `docs/superpowers/plans/`.
- Rodar `npm install` se o worktree não herdar `node_modules`.
