# Consentimento LGPD de Dados Sensíveis do Candidato — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantir que os dados sensíveis do candidato (CPF, e-mail, telefone, data de nascimento, endereço) só cheguem à empresa após a aprovação no processo seletivo (status `offer`) e o consentimento explícito, auditável e revogável do candidato — com proteção real server-side, não cosmética.

**Architecture:** Defesa em profundidade no Supabase. A empresa perde o SELECT direto em `candidates`/`curriculums` e passa a ler por views `SECURITY DEFINER` que reaplicam a visibilidade atual e mascaram as colunas sensíveis via `company_has_data_consent`. Uma tabela `candidate_data_disclosures` modela o ciclo de vida do consentimento por candidatura×empresa; triggers bloqueiam a contratação sem aceite e criam o pedido na transição para `offer`; uma Edge Function `manage-data-consent` registra aceite/recusa/revogação (com IP/hash/versão) e dispara notificações in-app + e-mail. O frontend consome as views/RPC, exibe o modal de aceite ao candidato e o termo imprimível (HTML + PDF).

**Tech Stack:** React 18 + TypeScript + Vite; Supabase (Postgres + RLS + Edge Functions Deno); React Query; @react-pdf/renderer; vitest (novo, apenas para lógica pura).

## Global Constraints

- **Commits:** Conventional Commits em **inglês**, atômicos (uma mudança lógica por commit). Terminar SEMPRE a mensagem com a linha: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- **UI/textos ao usuário** em **português do Brasil** com acentos corretos (ã, ç, é, í, ó, ú, â, ê, ô). Código e identificadores em inglês.
- **Edge Functions** deployadas com `verify_jwt=false` (o relay JWT do Supabase rejeita o token, causando 401). Segurança via `SUPABASE_SERVICE_ROLE_KEY` interno + verificação do usuário via `supabase.auth.getUser(jwt)`.
- `supabase.functions.invoke` trata HTTP não-2xx como `FunctionsHttpError` com `data=null` — ler `error.context.json()` para a mensagem específica.
- **RLS:** usar `public.get_user_type(auth.uid())` e `get_company_id(auth.uid())` (SEMPRE com argumento uuid). A tabela `public.users` NÃO existe. Após `.delete()`, verificar linhas retornadas com `.select()`.
- **Supabase client em Edge:** `https://esm.sh/@supabase/supabase-js@2`. Tipos do banco em `src/types/database.ts` (regenerar após migrations).
- **Estratégia de testes (híbrida):** unit tests (vitest) só para lógica pura (máscaras de PII, hash do termo, tolerância do converter, helpers de estado); DB/RLS/RPC via SQL adversarial (Supabase MCP, §13 do spec); UI no preview. Typecheck via `npm run build`; lint via `npm run lint`.
- **Worktree:** todo o trabalho ocorre em `D:/claude/recrutars-maike/.claude/worktrees/lgpd-consent` (branch `worktree-lgpd-consent`, a partir de `origin/main`).

## Nota de arquitetura — mecanismo de proteção de coluna (abordagem B)

RLS no Postgres é por **linha**, não por **coluna**, e o Supabase usa um único papel `authenticated` para todos os tipos de usuário (não dá para usar GRANT por coluna por papel). Por isso, a proteção real exige que a **empresa não tenha SELECT direto** em `candidates`/`curriculums`: toda leitura da empresa passa por views `SECURITY DEFINER` (`candidates_for_company`, `curriculums_for_company`) que reaplicam a visibilidade e mascaram as colunas sensíveis conforme o consentimento. **Consequência:** os embeds PostgREST que hoje trazem `candidates(name, avatar_url)` (em `applications` e `conversations`) seguem a RLS da tabela base e quebrariam — a migração de embeds (descrita nas seções B e C) garante que o nome/avatar do candidato continuem aparecendo nas telas. Candidato (own) e admin mantêm acesso direto.

## Ordem de execução

Implementar **em ordem**: **A** (setup de testes + helpers puros) → **B** (migrations DB: tabela, RLS, views, triggers) → **C** (tipos, converter, serviços) → **D** (Edge Function + e-mail) → **E** (hooks) → **F** (UI empresa) → **G** (UI candidato + termo) → **H** (auditoria + verificação adversarial). Cada Task termina com deliverable testável e um commit.

---


## Task A1 · Configurar vitest + fazer o teste órfão cnpj.test.ts rodar

**Files:**
- Modify `package.json:7-13` (bloco `scripts`) e `package.json:79-98` (bloco `devDependencies`)
- Create `vitest.config.ts`
- Test (alvo de verificação, já existe): `src/lib/__tests__/cnpj.test.ts`

**Interfaces:**
- Consumes: `src/lib/cnpj.ts` (`lookupCNPJ`, `isValidCNPJ`, `formatCNPJ`, `maskCNPJInput`), alias `@` -> `./src`.
- Produces: scripts `test` / `test:watch`; runner vitest com ambiente `node` e resolução do alias `@`.

**Passos:**

- [ ] Instalar vitest como devDependency: rodar `npm install -D vitest@^2.1.9`
- [ ] Verificar que instalou: rodar `npx vitest --version` (deve imprimir uma versão 2.x, sem erro)
- [ ] Criar `vitest.config.ts` standalone (ambiente node + alias `@`) com o conteúdo COMPLETO:
```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

// Standalone Vitest config (does not import vite.config.ts to avoid the dev
// proxy / SWC plugin). Pure-logic unit tests only — node environment.
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```
- [ ] Adicionar os scripts em `package.json` — substituir o bloco `scripts` (linhas 7-13) para incluir `test` e `test:watch`:
```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```
- [ ] Rodar o teste órfão e ver passar: `npx vitest run src/lib/__tests__/cnpj.test.ts` (todos os `describe`/`it` verdes; nenhum erro de resolução de `@/lib/supabase` nem de `@/lib/cnpj`)
- [ ] Confirmar que o script `npm test` funciona ponta a ponta: rodar `npm test` (executa `vitest run` e termina com exit 0)
- [ ] Verificar import/sintaxe do config não quebra o build: rodar `npm run build` (conclui sem erro de import/sintaxe; `vitest.config.ts` não entra no bundle)
- [ ] Commit: `git add package.json package-lock.json vitest.config.ts && git commit -m "$(printf 'test: add vitest runner and wire up orphan cnpj test\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"`

---

## Task A2 · Helper puro piiMask.ts (maskCpfPartial, maskIpPartial) via TDD

**Files:**
- Create `src/lib/__tests__/piiMask.test.ts`
- Create `src/lib/piiMask.ts`

**Interfaces:**
- Produces: `maskCpfPartial(cpf: string): string` — `'093.740.429-24'` -> `'***.740.429-**'`; `maskIpPartial(ip: string): string` — `'187.61.10.20'` -> `'187.61.xx.xx'`.
- Consumes: nada (lógica pura, sem Supabase).

**Passos:**

- [ ] Escrever o teste `src/lib/__tests__/piiMask.test.ts` com o conteúdo COMPLETO:
```ts
import { describe, it, expect } from 'vitest';
import { maskCpfPartial, maskIpPartial } from '@/lib/piiMask';

describe('maskCpfPartial', () => {
  it('masks first block and check digits of a formatted CPF', () => {
    expect(maskCpfPartial('093.740.429-24')).toBe('***.740.429-**');
  });
  it('formats and masks a raw 11-digit CPF', () => {
    expect(maskCpfPartial('09374042924')).toBe('***.740.429-**');
  });
  it('returns the masked placeholder for empty/invalid input', () => {
    expect(maskCpfPartial('')).toBe('***.***.***-**');
    expect(maskCpfPartial('123')).toBe('***.***.***-**');
  });
});

describe('maskIpPartial', () => {
  it('keeps the first two octets and masks the last two', () => {
    expect(maskIpPartial('187.61.10.20')).toBe('187.61.xx.xx');
  });
  it('returns a full placeholder for empty/invalid input', () => {
    expect(maskIpPartial('')).toBe('xxx.xxx.xx.xx');
    expect(maskIpPartial('not-an-ip')).toBe('xxx.xxx.xx.xx');
  });
});
```
- [ ] Rodar e ver FALHAR (módulo não existe ainda): `npx vitest run src/lib/__tests__/piiMask.test.ts` (erro de import / Cannot find module `@/lib/piiMask`)
- [ ] Implementar o mínimo em `src/lib/piiMask.ts` com o conteúdo COMPLETO:
```ts
/**
 * Partial PII masking helpers for LGPD consent display.
 * Pure functions — no Supabase, no side effects.
 */

/**
 * Mask a CPF showing only the middle blocks: '093.740.429-24' -> '***.740.429-**'.
 * Accepts formatted or raw (11-digit) input. Returns a full placeholder when
 * the input does not contain 11 digits.
 */
export function maskCpfPartial(cpf: string): string {
  const digits = (cpf ?? '').replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  const b2 = digits.slice(3, 6);
  const b3 = digits.slice(6, 9);
  return `***.${b2}.${b3}-**`;
}

/**
 * Mask an IPv4 address keeping the first two octets:
 * '187.61.10.20' -> '187.61.xx.xx'. Returns a full placeholder when the input
 * is not a 4-octet IPv4 string.
 */
export function maskIpPartial(ip: string): string {
  const parts = (ip ?? '').trim().split('.');
  if (parts.length !== 4 || parts.some((p) => p === '' || !/^\d{1,3}$/.test(p))) {
    return 'xxx.xxx.xx.xx';
  }
  return `${parts[0]}.${parts[1]}.xx.xx`;
}
```
- [ ] Rodar e ver PASSAR: `npx vitest run src/lib/__tests__/piiMask.test.ts` (todos verdes)
- [ ] Verificar que não introduziu novo erro de tipo: `npx tsc --noEmit 2>&1 | grep piiMask` (saída VAZIA)
- [ ] Commit: `git add src/lib/piiMask.ts src/lib/__tests__/piiMask.test.ts && git commit -m "$(printf 'feat(consent): add partial PII masking helpers (TDD)\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"`

---

## Task A3 · Helper puro consentTerm.ts (computeTermHash, CONSENT_TERM_VERSION, texto canônico) via TDD

**Files:**
- Create `src/lib/__tests__/consentTerm.test.ts`
- Create `src/lib/consentTerm.ts`

**Interfaces:**
- Produces: `export async function computeTermHash(text: string): Promise<string>` (SHA-256 via `crypto.subtle`, hex minúsculo de 64 chars); `export const CONSENT_TERM_VERSION = '1.0'`; `export const CONSENT_TERM_TEXT: string` (texto canônico do termo, pt-BR com acentos).
- Consumes: `globalThis.crypto.subtle` (disponível em Node 20+, ambiente do vitest).

**Passos:**

- [ ] Escrever o teste `src/lib/__tests__/consentTerm.test.ts` com o conteúdo COMPLETO:
```ts
import { describe, it, expect } from 'vitest';
import { computeTermHash, CONSENT_TERM_VERSION, CONSENT_TERM_TEXT } from '@/lib/consentTerm';

describe('CONSENT_TERM_VERSION', () => {
  it('is the canonical version 1.0', () => {
    expect(CONSENT_TERM_VERSION).toBe('1.0');
  });
});

describe('CONSENT_TERM_TEXT', () => {
  it('is a non-empty Portuguese term mentioning the sensitive data and LGPD', () => {
    expect(CONSENT_TERM_TEXT.length).toBeGreaterThan(100);
    expect(CONSENT_TERM_TEXT).toContain('CPF');
    expect(CONSENT_TERM_TEXT).toMatch(/LGPD|consentimento/i);
  });
});

describe('computeTermHash', () => {
  it('returns a 64-char lowercase hex SHA-256 digest', async () => {
    const hash = await computeTermHash('hello');
    // Known SHA-256 of 'hello'
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('is deterministic for the same input', async () => {
    const a = await computeTermHash(CONSENT_TERM_TEXT);
    const b = await computeTermHash(CONSENT_TERM_TEXT);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs for different inputs', async () => {
    const a = await computeTermHash('a');
    const b = await computeTermHash('b');
    expect(a).not.toBe(b);
  });
});
```
- [ ] Rodar e ver FALHAR (módulo não existe ainda): `npx vitest run src/lib/__tests__/consentTerm.test.ts` (erro de import / Cannot find module `@/lib/consentTerm`)
- [ ] Implementar o mínimo em `src/lib/consentTerm.ts` com o conteúdo COMPLETO:
```ts
/**
 * Canonical LGPD data-sharing consent term + SHA-256 hashing helper.
 * Pure module — safe to import on client and inside Edge Functions.
 */

export const CONSENT_TERM_VERSION = '1.0';

/**
 * Canonical term text. Any change to this text MUST bump CONSENT_TERM_VERSION,
 * because the stored term_hash binds an acceptance to this exact wording.
 */
export const CONSENT_TERM_TEXT = `TERMO DE CONSENTIMENTO PARA COMPARTILHAMENTO DE DADOS PESSOAIS

Nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD), você, candidato(a), autoriza o compartilhamento dos seus dados pessoais sensíveis com a empresa responsável por esta vaga, exclusivamente para fins de condução do processo seletivo e eventual contratação.

DADOS COMPARTILHADOS
Mediante este consentimento, a empresa passará a ter acesso aos seguintes dados: CPF, e-mail, telefone, data de nascimento e endereço (cidade e estado já são públicos no processo).

FINALIDADE
Os dados serão utilizados unicamente para contato, verificação de identidade, elaboração de proposta e formalização de eventual contratação relacionada a esta candidatura específica.

SEUS DIREITOS
Você pode, a qualquer momento, revogar este consentimento, solicitar a confirmação do tratamento, o acesso, a correção ou a eliminação dos seus dados, conforme os artigos 9º e 18 da LGPD. A revogação não compromete a legalidade do tratamento realizado enquanto o consentimento esteve vigente.

VALIDADE
Este consentimento é específico para esta candidatura e empresa, sendo registrado de forma auditável (data, hora, versão do termo e identificação técnica da sessão).`;

/**
 * Compute the SHA-256 hex digest of a string using Web Crypto (crypto.subtle).
 * Returns a 64-char lowercase hex string. Works in browser and Node 20+.
 */
export async function computeTermHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
```
- [ ] Rodar e ver PASSAR: `npx vitest run src/lib/__tests__/consentTerm.test.ts` (todos verdes, incluindo o hash conhecido de `'hello'`)
- [ ] Verificar que não introduziu novo erro de tipo: `npx tsc --noEmit 2>&1 | grep consentTerm` (saída VAZIA)
- [ ] Verificar import/sintaxe geral: `npm run build` (conclui sem erro de import/sintaxe)
- [ ] Commit: `git add src/lib/consentTerm.ts src/lib/__tests__/consentTerm.test.ts && git commit -m "$(printf 'feat(consent): add canonical consent term and SHA-256 hash helper (TDD)\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"`


## Task B1 — Migration: tabela `candidate_data_disclosures` + RLS + índices + `company_has_data_consent` + estender CHECK de `test_audit_logs.resource_type`

**Files**
- Create `sql/migrations/112_candidate_data_disclosures.sql`
- Modify (regenerate) `src/types/database.ts`
- Test: SQL adversarial via Supabase MCP (`mcp__supabase__execute_sql`)

**Interfaces**
- Produces (DB): `public.candidate_data_disclosures` (colunas conforme contrato), `public.company_has_data_consent(p_company_id uuid, p_candidate_id uuid) returns boolean` (STABLE SECURITY DEFINER), e o valor `'consent'` adicionado ao CHECK `test_audit_logs_resource_type_check` (de `['test','invitation','result','report']` para `['test','invitation','result','report','consent']`).
- Consumes (DB existentes, confirmados): `public.get_user_type(auth.uid())`, `public.get_company_id(auth.uid())` (arg uuid), `public.get_candidate_id(auth.uid())` (arg uuid), `applications(id)`, `candidates(id)`, `companies(id)`. Role alvo dos GRANTs = `authenticated` (não existe role `company` separada).
- `company_has_data_consent` é consumida por B2 (views) e pela Edge `manage-data-consent` (Seção D/E).

**Contexto confirmado no código real**
- `candidates` tem coluna `cpf` (confirmado em information_schema). Sensíveis no escopo: `cpf, email, phone, date_of_birth`.
- `applications.status` CHECK já inclui `'offer'` e `'hired'` (confirmado).
- CHECK atual: `test_audit_logs_resource_type_check = CHECK (resource_type = ANY (ARRAY['test','invitation','result','report']))`.
- Próximo número de migration = 112 (último é `111_collaborator_tour.sql`; confirmar com `ls sql/migrations/ | sort | tail -1`).

**Passos**

- [ ] Confirmar o próximo número rodando `ls "D:/claude/recrutars-maike/.claude/worktrees/lgpd-consent/sql/migrations/" | sort | tail -1` — deve mostrar `111_collaborator_tour.sql`; logo o novo arquivo é `112_*`.

- [ ] Criar `sql/migrations/112_candidate_data_disclosures.sql` com o conteúdo COMPLETO abaixo:

```sql
-- Migration 112: candidate_data_disclosures (LGPD per-application consent)
-- Creates the disclosure table + RLS + indexes, the consent-check function,
-- and extends test_audit_logs.resource_type CHECK to include 'consent'.

-- =====================================================
-- TABLE: candidate_data_disclosures
-- One consent record per (application, company) for revealing
-- the candidate's sensitive contact/identity data.
-- =====================================================
CREATE TABLE IF NOT EXISTS public.candidate_data_disclosures (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'refused', 'revoked')),
  term_version  TEXT,
  term_hash     TEXT,
  accepted_at   TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  ip            TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT candidate_data_disclosures_app_company_unique UNIQUE (application_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_cdd_application_id ON public.candidate_data_disclosures(application_id);
CREATE INDEX IF NOT EXISTS idx_cdd_company_id     ON public.candidate_data_disclosures(company_id);
CREATE INDEX IF NOT EXISTS idx_cdd_candidate_id   ON public.candidate_data_disclosures(candidate_id);
-- Fast consent lookups by (company, candidate, status)
CREATE INDEX IF NOT EXISTS idx_cdd_company_candidate_status
  ON public.candidate_data_disclosures(company_id, candidate_id, status);

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS update_candidate_data_disclosures_updated_at ON public.candidate_data_disclosures;
CREATE TRIGGER update_candidate_data_disclosures_updated_at
  BEFORE UPDATE ON public.candidate_data_disclosures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.candidate_data_disclosures ENABLE ROW LEVEL SECURITY;

-- Candidate (own): can SELECT and UPDATE their own disclosures (accept/refuse/revoke).
-- Note: the canonical write path is the Edge Function (service role), which captures
-- IP/user_agent server-side. These policies keep the candidate able to read state and
-- allow direct UPDATE as a fallback. No INSERT for candidate (created by trigger/service).
CREATE POLICY "cdd_select_candidate_own"
  ON public.candidate_data_disclosures FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

CREATE POLICY "cdd_update_candidate_own"
  ON public.candidate_data_disclosures FOR UPDATE
  USING (candidate_id = public.get_candidate_id(auth.uid()))
  WITH CHECK (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can SELECT only its own disclosures (gate the Contratar button by status).
CREATE POLICY "cdd_select_company"
  ON public.candidate_data_disclosures FOR SELECT
  USING (
    public.get_user_type(auth.uid()) = 'company'
    AND company_id = public.get_company_id(auth.uid())
  );

-- Admin: full read.
CREATE POLICY "cdd_select_admin"
  ON public.candidate_data_disclosures FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- =====================================================
-- FUNCTION: company_has_data_consent
-- TRUE when an 'accepted' disclosure exists for (company, candidate).
-- SECURITY DEFINER so it can be used inside the SECURITY DEFINER views (B2)
-- and from the masking CASE WHEN expression without exposing the table to company role.
-- =====================================================
CREATE OR REPLACE FUNCTION public.company_has_data_consent(
  p_company_id UUID,
  p_candidate_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.candidate_data_disclosures d
    WHERE d.company_id = p_company_id
      AND d.candidate_id = p_candidate_id
      AND d.status = 'accepted'
  );
$$;

GRANT EXECUTE ON FUNCTION public.company_has_data_consent(UUID, UUID) TO authenticated;

-- =====================================================
-- Extend test_audit_logs.resource_type CHECK to include 'consent'
-- (consent audit always uses resource_type='consent')
-- =====================================================
ALTER TABLE public.test_audit_logs
  DROP CONSTRAINT IF EXISTS test_audit_logs_resource_type_check;
ALTER TABLE public.test_audit_logs
  ADD CONSTRAINT test_audit_logs_resource_type_check
  CHECK (resource_type IN ('test', 'invitation', 'result', 'report', 'consent'));

COMMENT ON TABLE public.candidate_data_disclosures IS
  'Per (application,company) LGPD consent for revealing candidate sensitive data (cpf,email,phone,date_of_birth)';
COMMENT ON FUNCTION public.company_has_data_consent(UUID, UUID) IS
  'TRUE when an accepted disclosure exists for the given company+candidate (LGPD gate)';
```

- [ ] Aplicar a migration via Supabase MCP: `mcp__supabase__apply_migration` com `name='112_candidate_data_disclosures'` e `query` = conteúdo do arquivo.

- [ ] Verificar (SQL adversarial via `mcp__supabase__execute_sql`) que a tabela, função, índice único e CHECK existem:
```sql
SELECT to_regclass('public.candidate_data_disclosures') IS NOT NULL AS table_ok,
       EXISTS(SELECT 1 FROM pg_proc WHERE proname='company_has_data_consent') AS fn_ok,
       (SELECT pg_get_constraintdef(oid) FROM pg_constraint
         WHERE conname='test_audit_logs_resource_type_check') AS audit_check,
       EXISTS(SELECT 1 FROM pg_constraint
              WHERE conname='candidate_data_disclosures_app_company_unique') AS unique_ok;
```
Esperado: `table_ok=t`, `fn_ok=t`, `audit_check` contém `'consent'`, `unique_ok=t`.

- [ ] Verificar (adversarial) que a unicidade `(application_id, company_id)` impede duplicata e que `company_has_data_consent` retorna `false` sem disclosure aceito:
```sql
-- pegar uma application real
WITH a AS (
  SELECT ap.id AS app_id, ap.candidate_id, j.company_id
  FROM public.applications ap JOIN public.jobs j ON j.id = ap.job_id LIMIT 1
)
INSERT INTO public.candidate_data_disclosures(application_id, candidate_id, company_id, status)
SELECT app_id, candidate_id, company_id, 'pending' FROM a
ON CONFLICT (application_id, company_id) DO NOTHING
RETURNING id;
-- segunda tentativa com mesmo par deve violar unique (rodar de novo sem ON CONFLICT):
-- SELECT public.company_has_data_consent(company_id, candidate_id) deve ser false (status=pending)
SELECT public.company_has_data_consent(
  (SELECT company_id FROM public.candidate_data_disclosures LIMIT 1),
  (SELECT candidate_id FROM public.candidate_data_disclosures LIMIT 1)
) AS should_be_false;
```
Esperado: `should_be_false = f`. Depois `UPDATE ... SET status='accepted'` no registro e re-rodar → `t`. Limpar o registro de teste ao final (`DELETE FROM public.candidate_data_disclosures WHERE status IN ('pending','accepted')` apenas os de teste).

- [ ] Regenerar tipos: `mcp__supabase__generate_typescript_types` e salvar o resultado em `src/types/database.ts` (substituir o arquivo). Confirmar que `candidate_data_disclosures` aparece em `Database['public']['Tables']`.

- [ ] Verificar tipo do arquivo tocado: `npx tsc --noEmit 2>&1 | grep src/types/database.ts` (deve vir VAZIO).

- [ ] Commit: `git commit -m "feat(db): add candidate_data_disclosures table, RLS, consent-check fn and consent audit type"` (mensagem terminando com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).

---

## Task B2 — Migration: abordagem B (restringir select direto da empresa) + views `candidates_for_company` e `curriculums_for_company` (mascaradas, SECURITY DEFINER)

**Files**
- Create `sql/migrations/113_company_masked_views.sql`
- Modify (regenerate) `src/types/database.ts`
- Test: SQL adversarial via Supabase MCP

**Interfaces**
- Produces (DB): views `public.candidates_for_company` e `public.curriculums_for_company` (ambas `security_invoker=off`, i.e. SECURITY DEFINER por padrão de view), GRANT SELECT a `authenticated`; DROP da policy `curriculums_select_company` e substituição da policy `candidates_select_company` por uma versão que NÃO devolve mais a linha sensível diretamente à empresa.
- Consumes: `public.company_has_data_consent(uuid, uuid)` (B1), `public.get_user_type(auth.uid())`, `public.get_company_id(auth.uid())`.
- **Consequência obrigatória nos embeds (implementada pela Seção C, não aqui):** ao remover o SELECT direto da empresa em `candidates`, os embeds PostgREST `candidates!applications_candidate_id_fkey(name, avatar_url)` em `APPLICATION_SELECT` (`applicationsService.supabase.ts` L99-103) e `candidates(name)` em `CONVERSATION_SELECT` (`messagesService.supabase.ts` L15) **passam a retornar NULL para a empresa** (embeds seguem a RLS da tabela base). DECISÃO FIXA = OPÇÃO (ii): a Seção C (a) REMOVE esses embeds dos SELECT; (b) os mappers param de ler `name`/`avatar_url` do embed; (c) `candidateName`/`candidateAvatar` são populados NO CLIENTE a partir do mapa de `useCandidates` (que passa a ler `candidates_for_company`). Esta migration NÃO mantém o select direto da empresa — o nome do candidato volta a aparecer via a view, não via embed.
- **Currículo (decisão fixa):** `curriculums_for_company` expõe SOMENTE o registro PAI mascarado. Os filhos (`curriculum_experiences/education/skills/courses`) NÃO entram na view (embed de filhos através de view falha no PostgREST). As policies `*_select_company` dos filhos permanecem INALTERADAS; a Seção C lê os filhos em queries separadas por `curriculum_id` em `getProfileForCompany`.

**Contexto confirmado no código real (definições LIVE das policies)**
- `candidates_select_company` USING atual (live): `get_user_type='company' AND ( visibility_mode IS DISTINCT FROM 'private' OR EXISTS(applications a JOIN jobs j WHERE a.candidate_id=candidates.id AND j.company_id=get_company_id(auth.uid())) OR EXISTS(team_members tm WHERE (tm.imported_from_candidate_id=candidates.id OR tm.email=(SELECT profiles.email FROM profiles WHERE profiles.id=candidates.profile_id)) AND tm.company_id=get_company_id(auth.uid()) AND tm.is_active) )`. Este predicado de visibilidade é REAPLICADO na view.
- `curriculums_select_company` USING atual (live): `get_user_type='company'` (totalmente aberta — vazamento). Será DROPPADA.
- `candidates` tem RLS habilitado (não forçado). Sensíveis: `cpf, email, phone, date_of_birth`. Sempre visíveis: `name, location` (cidade/estado), avatar etc.
- `curriculums` sensíveis a mascarar: `email, phone`. `location` (cidade/estado) permanece visível.
- Role alvo = `authenticated`.

**Decisão de mecanismo (importante):** como não há role `company` separada para fazer REVOKE de coluna, a restrição se dá por REESCRITA da policy `candidates_select_company`: a empresa deixa de ter SELECT direto às LINHAS de candidatos via talent pool — passa a enxergar candidatos apenas pela view `candidates_for_company`. A policy de candidato `own` e a de admin permanecem. Como a view é SECURITY DEFINER, ela ignora a RLS da base e reaplica visibilidade + mascaramento.

**Passos**

- [ ] Criar `sql/migrations/113_company_masked_views.sql` com o conteúdo COMPLETO abaixo:

```sql
-- Migration 113: Approach B — restrict company direct SELECT on candidates/curriculums,
-- expose masked SECURITY DEFINER views candidates_for_company and curriculums_for_company.
--
-- CONSEQUENCE (handled in service layer, Section C): dropping the company's direct row
-- access means PostgREST embeds candidates(name,avatar_url) in APPLICATION_SELECT and
-- candidates(name) in CONVERSATION_SELECT now return NULL for company users (embeds follow
-- base-table RLS). Those embeds are removed and candidateName/candidateAvatar are populated
-- client-side from useCandidates (which reads candidates_for_company).

-- =====================================================
-- 1. CANDIDATES: replace the company talent-pool SELECT policy
--    with one that NO LONGER returns candidate rows directly to the company.
--    (Company reads candidates only through candidates_for_company.)
-- =====================================================
DROP POLICY IF EXISTS "candidates_select_company" ON public.candidates;
-- Intentionally NOT recreating a direct company SELECT policy.
-- Candidate own (candidates_update_own / candidates_insert_own) and
-- candidates_select_admin remain untouched and keep direct access.

-- =====================================================
-- 2. CURRICULUMS: drop the wide-open company SELECT policy.
--    (Company reads the parent curriculum only through curriculums_for_company.
--     Child tables keep their existing *_select_company policies — used by the
--     per-curriculum_id queries in getProfileForCompany.)
-- =====================================================
DROP POLICY IF EXISTS "curriculums_select_company" ON public.curriculums;

-- =====================================================
-- 3. VIEW: candidates_for_company
--    Same shape as candidates, but:
--      - reapplies the visibility predicate (non-private OR applicant-of-company
--        OR active team_member-of-company),
--      - masks cpf/email/phone/date_of_birth unless company_has_data_consent is true.
--    SECURITY DEFINER (security_invoker = off) so it bypasses base RLS and applies
--    its own predicate. GRANTed to authenticated; the WHERE clause restricts to
--    company users and their visible candidates.
-- =====================================================
CREATE OR REPLACE VIEW public.candidates_for_company
WITH (security_invoker = off) AS
SELECT
  c.id,
  c.profile_id,
  c.name,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.email ELSE NULL END AS email,
  c.avatar_url,
  c.title,
  c.location,
  c.city,
  c.state,
  c.experience_years,
  c.education,
  c.skills,
  c.salary_min,
  c.salary_max,
  c.salary_currency,
  c.availability,
  c.profile_completion,
  c.has_test,
  c.status,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.phone ELSE NULL END AS phone,
  c.linkedin,
  c.about,
  c.plan,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.date_of_birth ELSE NULL END AS date_of_birth,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.cpf ELSE NULL END AS cpf,
  c.visibility_mode,
  c.anonymous_id,
  c.created_at,
  c.deactivated_at,
  c.updated_at
FROM public.candidates c
WHERE public.get_user_type(auth.uid()) = 'company'
  AND (
    c.visibility_mode IS DISTINCT FROM 'private'
    OR EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE a.candidate_id = c.id
        AND j.company_id = public.get_company_id(auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE (
              tm.imported_from_candidate_id = c.id
              OR tm.email = (SELECT p.email FROM public.profiles p WHERE p.id = c.profile_id)
            )
        AND tm.company_id = public.get_company_id(auth.uid())
        AND tm.is_active = TRUE
    )
  );

GRANT SELECT ON public.candidates_for_company TO authenticated;

-- =====================================================
-- 4. VIEW: curriculums_for_company  (PARENT ONLY, no child embeds)
--    Masks email/phone unless consent; cidade/estado (location) stays visible.
--    Visibility reapplied via the candidate's visibility predicate.
-- =====================================================
CREATE OR REPLACE VIEW public.curriculums_for_company
WITH (security_invoker = off) AS
SELECT
  cu.id,
  cu.candidate_id,
  cu.name,
  cu.title,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.email ELSE NULL END AS email,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.phone ELSE NULL END AS phone,
  cu.location,
  cu.city,
  cu.state,
  cu.linkedin,
  cu.about,
  cu.availability,
  cu.salary_min,
  cu.salary_max,
  cu.is_default,
  cu.is_archived,
  cu.created_at,
  cu.updated_at
FROM public.curriculums cu
JOIN public.candidates c ON c.id = cu.candidate_id
WHERE public.get_user_type(auth.uid()) = 'company'
  AND (
    c.visibility_mode IS DISTINCT FROM 'private'
    OR EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE a.candidate_id = c.id
        AND j.company_id = public.get_company_id(auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE (
              tm.imported_from_candidate_id = c.id
              OR tm.email = (SELECT p.email FROM public.profiles p WHERE p.id = c.profile_id)
            )
        AND tm.company_id = public.get_company_id(auth.uid())
        AND tm.is_active = TRUE
    )
  );

GRANT SELECT ON public.curriculums_for_company TO authenticated;

COMMENT ON VIEW public.candidates_for_company IS
  'Masked talent-pool view for company role: sensitive cols (cpf,email,phone,date_of_birth) NULL unless accepted disclosure exists';
COMMENT ON VIEW public.curriculums_for_company IS
  'Masked parent curriculum view for company role (no child embeds): email/phone NULL unless accepted disclosure';
```

- [ ] Aplicar via `mcp__supabase__apply_migration` (`name='113_company_masked_views'`).

- [ ] Verificar (adversarial) que as policies foram dropadas e as views existem com GRANT:
```sql
SELECT NOT EXISTS(SELECT 1 FROM pg_policy WHERE polname='candidates_select_company') AS cand_policy_dropped,
       NOT EXISTS(SELECT 1 FROM pg_policy WHERE polname='curriculums_select_company') AS curr_policy_dropped,
       to_regclass('public.candidates_for_company') IS NOT NULL AS cand_view_ok,
       to_regclass('public.curriculums_for_company') IS NOT NULL AS curr_view_ok,
       has_table_privilege('authenticated','public.candidates_for_company','SELECT') AS cand_grant_ok,
       has_table_privilege('authenticated','public.curriculums_for_company','SELECT') AS curr_grant_ok;
```
Esperado: todos `t`.

- [ ] Verificar (adversarial) que a view continua tendo o MESMO conjunto de colunas-chave que o consumidor espera (`cpf, email, phone, date_of_birth, name, location` presentes):
```sql
SELECT array_agg(column_name ORDER BY column_name) AS cols
FROM information_schema.columns
WHERE table_schema='public' AND table_name='candidates_for_company'
  AND column_name IN ('cpf','email','phone','date_of_birth','name','location');
```
Esperado: array com os 6 nomes.

- [ ] Verificar (adversarial — mascaramento real) impersonando uma empresa via JWT claims. Rodar com `SET request.jwt.claims` para um `auth.uid()` de empresa real e um candidato applicant SEM disclosure aceito, depois COM. Exemplo (substituir UUIDs reais obtidos de uma query prévia de uma application em `offer`):
```sql
-- 1) descobrir um trio empresa(profile_id)/company_id/candidate_id de uma application existente
SELECT j.company_id, co.profile_id AS company_profile_id, a.candidate_id, a.id AS application_id
FROM public.applications a
JOIN public.jobs j ON j.id=a.job_id
JOIN public.companies co ON co.id=j.company_id
LIMIT 1;
-- 2) impersonar a empresa e ler a view SEM disclosure aceito
BEGIN;
SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
SET LOCAL role authenticated;
SELECT id, name, email, phone, cpf, date_of_birth, location
FROM public.candidates_for_company WHERE id='<candidate_id>';
ROLLBACK;
```
Esperado: linha retorna (visível por ser applicant da empresa), `name` e `location` preenchidos, `email/phone/cpf/date_of_birth` = NULL.

- [ ] Verificar (adversarial — revelação) inserindo disclosure `accepted` para o par e relendo:
```sql
INSERT INTO public.candidate_data_disclosures(application_id, candidate_id, company_id, status, accepted_at)
VALUES ('<application_id>','<candidate_id>','<company_id>','accepted', now())
ON CONFLICT (application_id, company_id) DO UPDATE SET status='accepted', accepted_at=now();
BEGIN;
SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
SET LOCAL role authenticated;
SELECT email, phone, cpf, date_of_birth FROM public.candidates_for_company WHERE id='<candidate_id>';
ROLLBACK;
-- limpeza
DELETE FROM public.candidate_data_disclosures WHERE application_id='<application_id>' AND company_id='<company_id>';
```
Esperado: agora `email/phone/cpf/date_of_birth` vêm preenchidos. Após o DELETE, repetir a leitura confirma que voltam a NULL (revogação re-oculta).

- [ ] Verificar (adversarial — cross-empresa) que uma empresa B (outro `company_profile_id`) NÃO vê os dados liberados para a empresa A: repetir a leitura impersonando a empresa B com o disclosure `accepted` da empresa A presente → `email/phone/cpf` = NULL (ou linha ausente se B não tem visibilidade).

- [ ] Verificar (adversarial — currículo) que `curriculums_for_company` mascara email/phone sem consentimento e mantém `location`:
```sql
BEGIN;
SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
SET LOCAL role authenticated;
SELECT email, phone, location FROM public.curriculums_for_company WHERE candidate_id='<candidate_id>';
ROLLBACK;
```
Esperado: `email`/`phone` = NULL sem disclosure, `location` preenchido.

- [ ] Regenerar tipos: `mcp__supabase__generate_typescript_types` → salvar em `src/types/database.ts`. Confirmar que `candidates_for_company` e `curriculums_for_company` aparecem em `Database['public']['Views']`.

- [ ] Verificar tipo do arquivo tocado: `npx tsc --noEmit 2>&1 | grep src/types/database.ts` (VAZIO).

- [ ] Commit: `git commit -m "feat(db): restrict company direct read, add masked candidates/curriculums views"` (terminar com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).

---

## Task B3 — Migration: triggers `enforce_hire_consent` (BEFORE UPDATE) e `create_disclosure_on_offer` (AFTER UPDATE) em `applications`

**Files**
- Create `sql/migrations/114_consent_triggers.sql`
- Modify (regenerate) `src/types/database.ts` (sem mudança de tabela, mas regenerar por consistência se houver drift — opcional)
- Test: SQL adversarial via Supabase MCP

**Interfaces**
- Produces (DB): `public.enforce_hire_consent()` (trigger fn) + trigger BEFORE UPDATE em `applications`; `public.create_disclosure_on_offer()` (trigger fn) + trigger AFTER UPDATE em `applications`.
- Consumes: `public.candidate_data_disclosures` (B1), colunas `applications.status`, `applications.candidate_id`, `applications.job_id`, `jobs.company_id`.

**Contexto confirmado no código real**
- `applications.status` CHECK inclui `'offer'` e `'hired'` (confirmado live).
- `applicationsService.updateApplicationStatus` (`applications/applicationsService.supabase.ts` L263-307) é JS puro e NÃO valida transições — o enforcement real é o trigger.
- A empresa de uma application deriva de `jobs.company_id` via `applications.job_id` (não há `company_id` direto em `applications`).
- `create_disclosure_on_offer` é idempotente via UNIQUE `(application_id, company_id)` de B1.

**Passos**

- [ ] Criar `sql/migrations/114_consent_triggers.sql` com o conteúdo COMPLETO abaixo:

```sql
-- Migration 114: consent enforcement triggers on applications.
--   enforce_hire_consent     (BEFORE UPDATE): block ->hired without accepted disclosure.
--   create_disclosure_on_offer (AFTER UPDATE): on ->offer, create a pending disclosure
--                                              (idempotent via unique(application_id,company_id)).

-- =====================================================
-- FUNCTION + TRIGGER: enforce_hire_consent (BEFORE UPDATE)
-- Raises if transitioning to 'hired' without an accepted disclosure for the
-- application's company+candidate.
-- =====================================================
CREATE OR REPLACE FUNCTION public.enforce_hire_consent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF NEW.status = 'hired' AND OLD.status IS DISTINCT FROM 'hired' THEN
    SELECT j.company_id INTO v_company_id
    FROM public.jobs j
    WHERE j.id = NEW.job_id;

    IF NOT EXISTS (
      SELECT 1 FROM public.candidate_data_disclosures d
      WHERE d.application_id = NEW.id
        AND d.company_id = v_company_id
        AND d.status = 'accepted'
    ) THEN
      RAISE EXCEPTION 'Contratação bloqueada: o candidato ainda não autorizou o compartilhamento dos dados (LGPD).'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_hire_consent ON public.applications;
CREATE TRIGGER trg_enforce_hire_consent
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_hire_consent();

-- =====================================================
-- FUNCTION + TRIGGER: create_disclosure_on_offer (AFTER UPDATE)
-- On transition to 'offer', insert a pending disclosure (idempotent).
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_disclosure_on_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF NEW.status = 'offer' AND OLD.status IS DISTINCT FROM 'offer' THEN
    SELECT j.company_id INTO v_company_id
    FROM public.jobs j
    WHERE j.id = NEW.job_id;

    IF v_company_id IS NOT NULL THEN
      INSERT INTO public.candidate_data_disclosures(application_id, candidate_id, company_id, status)
      VALUES (NEW.id, NEW.candidate_id, v_company_id, 'pending')
      ON CONFLICT (application_id, company_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_disclosure_on_offer ON public.applications;
CREATE TRIGGER trg_create_disclosure_on_offer
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_disclosure_on_offer();

COMMENT ON FUNCTION public.enforce_hire_consent() IS
  'Blocks applications.status -> hired without an accepted LGPD disclosure';
COMMENT ON FUNCTION public.create_disclosure_on_offer() IS
  'Creates a pending disclosure when applications.status -> offer (idempotent)';
```

- [ ] Aplicar via `mcp__supabase__apply_migration` (`name='114_consent_triggers'`).

- [ ] Verificar (adversarial) que as funções e triggers existem:
```sql
SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname='enforce_hire_consent') AS fn1,
       EXISTS(SELECT 1 FROM pg_proc WHERE proname='create_disclosure_on_offer') AS fn2,
       EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='trg_enforce_hire_consent') AS t1,
       EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='trg_create_disclosure_on_offer') AS t2;
```
Esperado: todos `t`.

- [ ] Verificar (adversarial — create_disclosure_on_offer) que mover para `offer` cria o disclosure pending idempotente. Usar uma application real e restaurar o status ao final:
```sql
WITH a AS (
  SELECT ap.id, ap.status FROM public.applications ap
  WHERE ap.status NOT IN ('offer','hired') LIMIT 1
)
SELECT id, status FROM a;  -- anotar o status original
-- transição para offer
UPDATE public.applications SET status='offer' WHERE id='<app_id>';
SELECT status FROM public.candidate_data_disclosures WHERE application_id='<app_id>'; -- esperado: 'pending'
-- idempotência: repetir a transição não deve duplicar (unique já garante; force re-run)
UPDATE public.applications SET status='reviewing' WHERE id='<app_id>';
UPDATE public.applications SET status='offer' WHERE id='<app_id>';
SELECT count(*) FROM public.candidate_data_disclosures WHERE application_id='<app_id>'; -- esperado: 1
-- restaurar
UPDATE public.applications SET status='<status_original>' WHERE id='<app_id>';
DELETE FROM public.candidate_data_disclosures WHERE application_id='<app_id>';
```
Esperado: disclosure criado com `status='pending'`, count = 1.

- [ ] Verificar (adversarial — enforce_hire_consent BLOQUEIA) que `->hired` sem disclosure accepted levanta exceção:
```sql
-- garantir que NÃO há disclosure accepted para a app
DELETE FROM public.candidate_data_disclosures WHERE application_id='<app_id>';
UPDATE public.applications SET status='offer' WHERE id='<app_id>'; -- cria pending de novo
-- tentar hired deve falhar:
UPDATE public.applications SET status='hired' WHERE id='<app_id>';
```
Esperado: ERRO `check_violation` com a mensagem "Contratação bloqueada...".

- [ ] Verificar (adversarial — enforce_hire_consent PERMITE com accepted):
```sql
UPDATE public.candidate_data_disclosures SET status='accepted', accepted_at=now()
WHERE application_id='<app_id>';
UPDATE public.applications SET status='hired' WHERE id='<app_id>'; -- deve SUCEDER
SELECT status FROM public.applications WHERE id='<app_id>'; -- 'hired'
-- restaurar estado original
UPDATE public.applications SET status='<status_original>' WHERE id='<app_id>';
DELETE FROM public.candidate_data_disclosures WHERE application_id='<app_id>';
```
Esperado: update para `hired` sucede.

- [ ] (Opcional) Regenerar tipos: `mcp__supabase__generate_typescript_types` → `src/types/database.ts`, e `npx tsc --noEmit 2>&1 | grep src/types/database.ts` (VAZIO). Pular se não houver drift de schema.

- [ ] Commit: `git commit -m "feat(db): add hire-consent enforcement and on-offer disclosure triggers"` (terminar com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).


## Seção C · Tipos, converter, serviços + migração de embeds

> Pré-requisitos de DB assumidos prontos das Seções A/B antes das tasks C que tocam o banco em runtime: tabela `public.candidate_data_disclosures`, views `public.candidates_for_company` / `public.curriculums_for_company`, função `public.company_has_data_consent`, e Edge Function `manage-data-consent`. As tasks desta seção (TS puro) **não bloqueiam** nesses recursos — `tsc`/vitest/build não tocam o banco. SQL adversarial real só é exigido onde indicado, e pode rodar depois que B estiver aplicada.
>
> Convenção de verificação de tipo (baseline sujo): `npx tsc --noEmit 2>&1 | grep <arquivo>` deve vir **vazio** (nenhum novo erro introduzido pelo arquivo tocado). `npm run build` serve **apenas** para pegar import/sintaxe/JSX quebrado — nunca como prova de tipos. Vitest roda 1 arquivo: `npx vitest run <path>`.

---

### Task C1 — `src/types/consent.ts` (tipos de disclosure)

**Files**
- Create: `src/types/consent.ts`

**Interfaces**
- Produces: `type DisclosureStatus = 'pending'|'accepted'|'refused'|'revoked'`; `interface DataDisclosure`; `const CONSENT_TERM_VERSION = '1.0'`.
- Consumes: nada.

**Steps**
- [ ] Criar `src/types/consent.ts` com o conteúdo completo:
```ts
/**
 * Types for LGPD data-disclosure consent (candidate × company × application).
 * Sensitive candidate data is only revealed to the company after the candidate
 * accepts a disclosure for a specific application that reached 'offer'.
 */

export type DisclosureStatus = 'pending' | 'accepted' | 'refused' | 'revoked';

export interface DataDisclosure {
  id: string;
  applicationId: string;
  candidateId: string;
  companyId: string;
  status: DisclosureStatus;
  termVersion?: string;
  termHash?: string;
  acceptedAt?: string;
  revokedAt?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

/** Current canonical version of the consent term text. */
export const CONSENT_TERM_VERSION = '1.0';
```
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep "types/consent.ts"` (vazio = ok).
- [ ] Commit: `feat(consent): add DataDisclosure types and CONSENT_TERM_VERSION`

---

### Task C2 — Relaxar `Candidate.email`/`location` + tolerância no converter (TDD)

**Files**
- Modify: `src/types/candidate.ts` (L60 `email`, L63 `location`)
- Modify: `src/lib/supabaseConverters.ts` (`candidateRowToCandidate`, L40-97 — campos sensíveis `email`/`phone`/`cpf`/`date_of_birth`/`location` quando `null`)
- Test: `src/lib/__tests__/supabaseConverters.test.ts` (novo)

**Interfaces**
- Consumes: `Database['public']['Tables']['candidates']['Row']` (a view `candidates_for_company` devolve o mesmo shape com sensíveis em `null`).
- Produces: `candidateRowToCandidate(row): Candidate` com `email?/location?` `string|undefined` e sensíveis `undefined` quando a coluna vem `null`.

**Steps**
- [ ] Escrever teste em `src/lib/__tests__/supabaseConverters.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { candidateRowToCandidate } from '@/lib/supabaseConverters';

// Minimal masked row as the company-facing view returns it:
// sensitive columns come back as null when there is no accepted disclosure.
const maskedRow = {
  id: 'cand-1',
  profile_id: 'prof-1',
  name: 'MARIA OLIVEIRA',
  email: null,
  avatar_url: null,
  title: 'Desenvolvedora',
  location: 'São Paulo, SP',
  experience_years: 5,
  education: 'Superior',
  skills: ['react'],
  salary_min: 3000,
  salary_max: 6000,
  availability: 'imediata',
  profile_completion: 80,
  has_test: false,
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  deactivated_at: null,
  phone: null,
  cpf: null,
  linkedin: null,
  about: null,
  plan: null,
  date_of_birth: null,
  visibility_mode: null,
  anonymous_id: null,
  display_name: null,
  city: 'São Paulo',
  state: 'SP',
  open_to_relocation: null,
} as never;

describe('candidateRowToCandidate — masked (no consent) row', () => {
  const c = candidateRowToCandidate(maskedRow);

  it('keeps name and city/state visible', () => {
    expect(c.name).toBe('MARIA OLIVEIRA');
    expect(c.city).toBe('São Paulo');
    expect(c.state).toBe('SP');
    expect(c.location).toBe('São Paulo, SP');
  });

  it('maps masked sensitive columns to undefined (not null)', () => {
    expect(c.email).toBeUndefined();
    expect(c.phone).toBeUndefined();
    expect(c.cpf).toBeUndefined();
    expect(c.dateOfBirth).toBeUndefined();
  });

  it('never yields the literal null for email/phone', () => {
    expect(c.email).not.toBeNull();
    expect(c.phone).not.toBeNull();
  });
});

describe('candidateRowToCandidate — full (consented) row', () => {
  it('passes through revealed sensitive fields', () => {
    const full = candidateRowToCandidate({
      ...(maskedRow as object),
      email: 'maria@email.com',
      phone: '11999998888',
      cpf: '09374042924',
      date_of_birth: '1990-05-10',
    } as never);
    expect(full.email).toBe('maria@email.com');
    expect(full.phone).toBe('11999998888');
    expect(full.cpf).toBe('09374042924');
    expect(full.dateOfBirth).toBe('1990-05-10');
  });
});
```
- [ ] Rodar e ver **falhar** (`location`/`email` ainda `string` no tipo e converter não nulifica): `npx vitest run src/lib/__tests__/supabaseConverters.test.ts`
- [ ] Em `src/types/candidate.ts`, relaxar os dois campos. Trocar L60 `email: string;` por:
```ts
  email?: string;
```
e L63 `location: string;` por:
```ts
  location?: string;
```
- [ ] Em `src/lib/supabaseConverters.ts`, ajustar `candidateRowToCandidate` para nulificar→undefined os campos sensíveis e `location`. Substituir as linhas L43 (`email: row.email,`), L47 (`location: row.location,`) e L60-62 (`deactivatedAt`/`phone`/`cpf`) por:
```ts
    email: row.email ?? undefined,
```
```ts
    location: row.location ?? undefined,
```
e o bloco de sensíveis:
```ts
    deactivatedAt: row.deactivated_at ?? undefined,
    phone: row.phone ?? undefined,
    cpf: (row as CandidateRow & { cpf?: string | null }).cpf ?? undefined,
```
(a linha L66 `dateOfBirth: row.date_of_birth ?? undefined,` já tolera `null` — confirmar que permanece com `?? undefined`).
- [ ] Rodar e ver **passar**: `npx vitest run src/lib/__tests__/supabaseConverters.test.ts`
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep -E "supabaseConverters.ts|types/candidate.ts"` (vazio = ok).
- [ ] Verificar import/sintaxe: `npm run build` (sem erro de import/JSX).
- [ ] Commit: `refactor(consent): tolerate masked sensitive columns in candidate converter`

---

### Task C3 — Estender o union `AuditAction` (consent)

**Files**
- Modify: `src/types/companyTest.ts` (union `AuditAction` L138-170; `AuditResourceType` L172)

**Interfaces**
- Produces: `AuditAction` agora inclui `'consent_granted'|'consent_revoked'|'sensitive_data_revealed'`; `AuditResourceType` inclui `'consent'`.
- Consumes: nada. (Esta extensão precede F/G — eles assumem o tipo já estendido.)

**Steps**
- [ ] Em `src/types/companyTest.ts`, na cauda do union `AuditAction`, trocar a última linha `  | 'invite_updated';` (L170) por:
```ts
  | 'invite_updated'
  | 'consent_granted'
  | 'consent_revoked'
  | 'sensitive_data_revealed';
```
- [ ] Estender `AuditResourceType` (L172) acrescentando `'consent'` ao union:
```ts
export type AuditResourceType = 'test' | 'invitation' | 'result' | 'report' | 'assessment' | 'ai_analysis' | 'credit_transaction' | 'team_member' | 'retest_schedule' | 'consent';
```
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep "types/companyTest.ts"` (vazio = ok).
- [ ] Commit: `feat(consent): extend AuditAction/AuditResourceType union with consent actions`

---

### Task C4 — `consentService` (interface + factory + supabase)

**Files**
- Create: `src/services/consent/consentService.ts` (interface + factory)
- Create: `src/services/consent/consentService.supabase.ts` (implementação)

**Interfaces**
- Produces: `IConsentService`, `getConsentService()`, `resetConsentService()`. Métodos:
  - `getDisclosure(applicationId: string): Promise<DataDisclosure | null>`
  - `listDisclosuresByCandidate(candidateId: string): Promise<DataDisclosure[]>`
  - `accept(input: { applicationId: string; termVersion: string; termHash: string }): Promise<DataDisclosure>`
  - `refuse(applicationId: string): Promise<DataDisclosure>`
  - `revoke(applicationId: string): Promise<DataDisclosure>`
- Consumes: tabela `candidate_data_disclosures` (leitura direta) e Edge Function `manage-data-consent` (mutações; `error.context.json()` em não-2xx, padrão de `src/lib/cnpj.ts` L136-149). `FunctionsHttpError` de `@supabase/supabase-js`.

> Nota: `candidate_data_disclosures` ainda não existe em `src/types/database.ts` (regenerar é task de A/B). A implementação usa `supabase.from('candidate_data_disclosures' as never)` e tipa o retorno via mapper local, mantendo `tsc` limpo sem depender da regeneração.

**Steps**
- [ ] Criar `src/services/consent/consentService.ts`:
```ts
/**
 * Consent Service — Interface & Factory
 * LGPD data-disclosure consent (candidate × company × application).
 */

import type { DataDisclosure } from '@/types/consent';

export interface AcceptConsentInput {
  applicationId: string;
  termVersion: string;
  termHash: string;
}

export interface IConsentService {
  /** Disclosure for a single application (company gate + candidate decision). */
  getDisclosure(applicationId: string): Promise<DataDisclosure | null>;
  /** All disclosures for a candidate, keyed later by applicationId in hooks. */
  listDisclosuresByCandidate(candidateId: string): Promise<DataDisclosure[]>;
  /** Candidate accepts: records term version/hash + IP/user-agent server-side. */
  accept(input: AcceptConsentInput): Promise<DataDisclosure>;
  /** Candidate refuses an offered disclosure. */
  refuse(applicationId: string): Promise<DataDisclosure>;
  /** Candidate revokes a previously accepted disclosure (re-hides data). */
  revoke(applicationId: string): Promise<DataDisclosure>;
}

let _instance: IConsentService | null = null;

export async function getConsentService(): Promise<IConsentService> {
  if (_instance) return _instance;
  const { ConsentServiceSupabase } = await import('./consentService.supabase');
  _instance = new ConsentServiceSupabase();
  return _instance;
}

export function resetConsentService(): void {
  _instance = null;
}
```
- [ ] Criar `src/services/consent/consentService.supabase.ts`:
```ts
/**
 * Consent Service — Supabase Implementation
 *
 * Reads candidate_data_disclosures directly (RLS scoped to candidate-own / company).
 * Mutations go through the manage-data-consent Edge Function so that IP/user-agent
 * and audit logging happen server-side with the service role.
 */

import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import type { DataDisclosure } from '@/types/consent';
import type {
  IConsentService,
  AcceptConsentInput,
} from './consentService';

type DisclosureRow = {
  id: string;
  application_id: string;
  candidate_id: string;
  company_id: string;
  status: DataDisclosure['status'];
  term_version: string | null;
  term_hash: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

function rowToDisclosure(r: DisclosureRow): DataDisclosure {
  return {
    id: r.id,
    applicationId: r.application_id,
    candidateId: r.candidate_id,
    companyId: r.company_id,
    status: r.status,
    termVersion: r.term_version ?? undefined,
    termHash: r.term_hash ?? undefined,
    acceptedAt: r.accepted_at ?? undefined,
    revokedAt: r.revoked_at ?? undefined,
    ip: r.ip ?? undefined,
    userAgent: r.user_agent ?? undefined,
    createdAt: r.created_at,
  };
}

const DISCLOSURE_COLUMNS =
  'id, application_id, candidate_id, company_id, status, term_version, term_hash, accepted_at, revoked_at, ip, user_agent, created_at';

// manage-data-consent table is not yet in the generated Database types; cast the
// table name so tsc stays clean until src/types/database.ts is regenerated.
const DISCLOSURES_TABLE = 'candidate_data_disclosures' as never;

/** Invoke manage-data-consent, recovering the specific error body on non-2xx. */
async function invokeConsent(
  action: 'accept' | 'refuse' | 'revoke',
  payload: Record<string, unknown>,
): Promise<DataDisclosure> {
  const { data, error } = await supabase.functions.invoke('manage-data-consent', {
    body: { action, ...payload },
  });

  if (error) {
    let message = 'Erro ao processar o consentimento. Tente novamente.';
    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json();
        if (body?.message) message = body.message as string;
      } catch {
        // Body was not JSON — keep the generic message.
      }
    }
    throw new Error(message);
  }

  if (!data?.disclosure) {
    throw new Error('Resposta inesperada do serviço de consentimento.');
  }
  return rowToDisclosure(data.disclosure as DisclosureRow);
}

export class ConsentServiceSupabase implements IConsentService {
  async getDisclosure(applicationId: string): Promise<DataDisclosure | null> {
    const { data, error } = await supabase
      .from(DISCLOSURES_TABLE)
      .select(DISCLOSURE_COLUMNS)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch disclosure: ${error.message}`);
    }
    return data ? rowToDisclosure(data as unknown as DisclosureRow) : null;
  }

  async listDisclosuresByCandidate(candidateId: string): Promise<DataDisclosure[]> {
    const { data, error } = await supabase
      .from(DISCLOSURES_TABLE)
      .select(DISCLOSURE_COLUMNS)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch disclosures: ${error.message}`);
    }
    return (data ?? []).map((r) => rowToDisclosure(r as unknown as DisclosureRow));
  }

  async accept(input: AcceptConsentInput): Promise<DataDisclosure> {
    return invokeConsent('accept', {
      applicationId: input.applicationId,
      termVersion: input.termVersion,
      termHash: input.termHash,
    });
  }

  async refuse(applicationId: string): Promise<DataDisclosure> {
    return invokeConsent('refuse', { applicationId });
  }

  async revoke(applicationId: string): Promise<DataDisclosure> {
    return invokeConsent('revoke', { applicationId });
  }
}
```
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep "services/consent/"` (vazio = ok).
- [ ] Verificar import/sintaxe: `npm run build`.
- [ ] Commit: `feat(consent): add consentService (interface, factory, supabase impl)`

---

### Task C5 — `candidatesService` lê a view `candidates_for_company`

**Files**
- Modify: `src/services/candidates/candidatesService.supabase.ts` (`getCandidates` L39; `getCandidate` L110-115). **Não** alterar `getCandidateByProfileId` (caminho do candidato own) nem `updateCandidate`.

**Interfaces**
- Consumes: view `public.candidates_for_company` (mesmo shape de `candidates`, sensíveis mascarados pela view via `company_has_data_consent`).
- Produces: `getCandidates`/`getCandidate` retornam `Candidate` já mascarado para a empresa.

> A view tem o mesmo shape colunar de `candidates`, então `candidateRowToCandidate` (C2) mapeia sem alteração. `supabase.from('candidates_for_company' as never)` evita depender da regeneração de tipos.

**Steps**
- [ ] Em `getCandidates`, trocar L39:
```ts
    let query = supabase.from('candidates').select('*', { count: 'exact' });
```
por:
```ts
    // Company-facing view: same shape as `candidates`, with cpf/email/phone/
    // date_of_birth masked to NULL unless an accepted disclosure exists.
    let query = supabase
      .from('candidates_for_company' as never)
      .select('*', { count: 'exact' });
```
- [ ] Em `getCandidate`, trocar L111-115:
```ts
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .maybeSingle();
```
por:
```ts
    const { data, error } = await supabase
      .from('candidates_for_company' as never)
      .select('*')
      .eq('id', id)
      .maybeSingle();
```
- [ ] Ajustar a conversão final em ambos (o cast `as never` da tabela faz `data` perder o tipo de Row): em `getCandidates`, a linha L95 `const candidates = (data ?? []).map(candidateRowToCandidate);` vira:
```ts
    const candidates = ((data ?? []) as unknown as Parameters<typeof candidateRowToCandidate>[0][]).map(candidateRowToCandidate);
```
e em `getCandidate`, a linha L121 `return data ? candidateRowToCandidate(data) : null;` vira:
```ts
    return data ? candidateRowToCandidate(data as unknown as Parameters<typeof candidateRowToCandidate>[0]) : null;
```
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep "candidatesService.supabase.ts"` (vazio = ok).
- [ ] Verificar import/sintaxe: `npm run build`.
- [ ] SQL adversarial (após B aplicada; uma empresa autenticada via Supabase MCP `execute_sql` com `set local role` simulando `auth.uid()` da empresa, conforme §13): `select id, email, phone, cpf, date_of_birth from public.candidates_for_company where id = '<cand sem disclosure accepted>'` → `email/phone/cpf/date_of_birth` vêm `NULL`; `name`/`city`/`state` preenchidos. Repetir para um candidato **com** disclosure `accepted` da empresa → sensíveis revelados.
- [ ] Commit: `feat(consent): read candidates_for_company view in candidatesService`

---

### Task C6 — `getProfileForCompany` no curriculumsService + `useProfileForCompany`

**Files**
- Modify: `src/services/curriculums/curriculumsService.ts` (interface `ICurriculumsService` — novo método)
- Modify: `src/services/curriculums/curriculumsService.supabase.ts` (novo `getProfileForCompany`; `getProfile` L198-210 inalterado)
- Modify: `src/hooks/useCurriculumsQuery.ts` (novo hook `useProfileForCompany` + query key; `useProfile` inalterado)
- Modify: `src/pages/empresa/CandidateProfile.tsx` (L76 import; L315 troca de `useProfile` por `useProfileForCompany`)

**Interfaces**
- Produces: `ICurriculumsService.getProfileForCompany(candidateId: string): Promise<Curriculum | null>`; hook `useProfileForCompany(candidateId)`.
- Consumes: view `public.curriculums_for_company` (pai, **sem embeds**) + tabelas filhas `curriculum_experiences`/`curriculum_education`/`curriculum_skills`/`curriculum_courses` por `curriculum_id` (policies `*_select_company` dos filhos seguem como estão).

> Embed de filhos **através de view** falha no PostgREST — por isso o pai é lido sem embed e os filhos em queries separadas. `getProfile` (candidato own) e os callers em `candidato/Profile.tsx`, `candidato/ProfessionalProfile.tsx`, `admin/CandidateDetail.tsx` **não mudam** (mantêm acesso direto).

**Steps**
- [ ] Na interface `src/services/curriculums/curriculumsService.ts`, acrescentar dentro de `ICurriculumsService` (após L17 `getProfile`):
```ts
  /** Company-facing read: pai via view mascarada + filhos por curriculum_id. */
  getProfileForCompany(candidateId: string): Promise<Curriculum | null>;
```
- [ ] Em `src/services/curriculums/curriculumsService.supabase.ts`, adicionar o método dentro de `SupabaseCurriculumsService` (após `getProfile`, antes de `ensureProfile`). Reusa os mappers `rowToExperience`/`rowToEducation`/`rowToSkill`/`rowToCourse`/`rowToCurriculum` já existentes:
```ts
  async getProfileForCompany(candidateId: string): Promise<Curriculum | null> {
    // 1) Parent row from the masked view — NO embeds (embedding children
    //    through a view is unsupported by PostgREST).
    const { data: parent, error: parentError } = await supabase
      .from('curriculums_for_company' as never)
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (parentError) {
      throw new Error(`Failed to fetch company profile: ${parentError.message}`);
    }
    if (!parent) return null;

    const parentRow = parent as Record<string, unknown>;
    const curriculumId = parentRow.id as string;

    // 2) Children in separate queries by curriculum_id (their *_select_company
    //    policies remain in place and govern visibility).
    const [expRes, eduRes, skillRes, courseRes] = await Promise.all([
      supabase.from('curriculum_experiences').select('*').eq('curriculum_id', curriculumId).order('sort_order', { ascending: true }),
      supabase.from('curriculum_education').select('*').eq('curriculum_id', curriculumId).order('sort_order', { ascending: true }),
      supabase.from('curriculum_skills').select('*').eq('curriculum_id', curriculumId),
      supabase.from('curriculum_courses').select('*').eq('curriculum_id', curriculumId),
    ]);

    if (expRes.error) throw new Error(`Failed to fetch experiences: ${expRes.error.message}`);
    if (eduRes.error) throw new Error(`Failed to fetch education: ${eduRes.error.message}`);
    if (skillRes.error) throw new Error(`Failed to fetch skills: ${skillRes.error.message}`);
    if (courseRes.error) throw new Error(`Failed to fetch courses: ${courseRes.error.message}`);

    // 3) Assemble manually: reuse rowToCurriculum by injecting children under
    //    the keys it expects (curriculum_experiences, etc.).
    return rowToCurriculum({
      ...parentRow,
      curriculum_experiences: expRes.data ?? [],
      curriculum_education: eduRes.data ?? [],
      curriculum_skills: skillRes.data ?? [],
      curriculum_courses: courseRes.data ?? [],
    });
  }
```
- [ ] Em `src/hooks/useCurriculumsQuery.ts`, acrescentar a query key e o hook. Após a definição de `profileKeys` (L18), adicionar a chave:
```ts
  forCompany: (candidateId: string) => [...profileKeys.all, 'forCompany', candidateId] as const,
```
(inserir como nova propriedade do objeto `profileKeys`, antes do fechamento `};`).
- [ ] No mesmo arquivo, após `useProfile` (L34), adicionar o hook:
```ts
/** Company-facing profile: served from curriculums_for_company (masked) + children. */
export function useProfileForCompany(candidateId: string) {
  return useQuery({
    queryKey: profileKeys.forCompany(candidateId),
    queryFn: async () => {
      const service = await getCurriculumsService();
      return service.getProfileForCompany(candidateId);
    },
    enabled: !!candidateId,
  });
}
```
- [ ] Em `src/pages/empresa/CandidateProfile.tsx`, trocar o import L76:
```ts
import { useProfile } from '@/hooks/useCurriculumsQuery';
```
por:
```ts
import { useProfileForCompany } from '@/hooks/useCurriculumsQuery';
```
- [ ] No mesmo arquivo, trocar a chamada L315:
```ts
  const { data: profile } = useProfile(candidate?.id || '');
```
por:
```ts
  const { data: profile } = useProfileForCompany(candidate?.id || '');
```
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep -E "curriculumsService.supabase.ts|curriculumsService.ts|useCurriculumsQuery.ts|empresa/CandidateProfile.tsx"` (vazio = ok).
- [ ] Verificar import/sintaxe: `npm run build`.
- [ ] SQL adversarial (após B; empresa autenticada): `select email, phone, city, state from public.curriculums_for_company where candidate_id = '<sem disclosure>'` → `email`/`phone` `NULL`, `city`/`state` preenchidos; com disclosure `accepted` da empresa → `email`/`phone` revelados. Confirmar que `select * from curriculum_experiences where curriculum_id = '<id>'` retorna linhas para a empresa (policy filha intacta).
- [ ] Commit: `feat(consent): serve company profile via curriculums_for_company view + separate children queries`

---

### Task C7 — Migração dos embeds (`candidates(...)` removidos de applications e conversations)

**Files**
- Modify: `src/services/applications/applicationsService.supabase.ts` (`APPLICATION_SELECT` L99-103; tipo `ApplicationWithJoins` L32-42; `applicationRowToApplication` L55-72)
- Modify: `src/services/messages/messagesService.supabase.ts` (`CONVERSATION_SELECT` L15; `mapConversation` L189-201)
- Modify: `src/pages/empresa/Applications.tsx` (popular `candidateName`/`candidateAvatar` no cliente a partir do mapa de `useCandidates`)
- Modify: lista de Mensagens da empresa (popular `candidateName` no cliente a partir do mapa de `useCandidates`)

**Interfaces**
- Consumes: `useCandidates(...)` (já lê a view mascarada após C5) → mapa `candidateId → Candidate`. `Candidate.name`/`Candidate.avatar` permanecem sempre visíveis (não são sensíveis).
- Produces: `applicationRowToApplication` e `mapConversation` deixam de ler `name`/`avatar_url` do embed (`candidateName`/`candidateAvatar` saem **vazios** do service; preenchidos no cliente).

> Por que: ao dropar `candidates_select_company` (Seção B), os embeds PostgREST seguem a RLS da base e passariam a retornar `NULL`. Decisão fixa = OPÇÃO (ii): remover os embeds e popular nome/avatar no cliente. O nome do candidato **não pode sumir** das telas (critério de regressão).

**Steps — applicationsService**
- [ ] Em `applicationsService.supabase.ts`, trocar `APPLICATION_SELECT` (L99-103) por (sem o embed de `candidates`):
```ts
const APPLICATION_SELECT = [
  '*',
  'jobs!applications_job_id_fkey(title, company_id, companies!jobs_company_id_fkey(name))',
].join(', ');
```
- [ ] No tipo `ApplicationWithJoins` (L32-42), remover o bloco `candidates?: { name; avatar_url } | null`. Resultado:
```ts
type ApplicationWithJoins = ApplicationRow & {
  jobs?: {
    title: string;
    company_id: string;
    companies?: { name: string } | null;
  } | null;
};
```
- [ ] Em `applicationRowToApplication` (L55-72), trocar as linhas que liam o embed (L58-59):
```ts
    candidateName: row.candidates?.name ?? '',
    candidateAvatar: row.candidates?.avatar_url ?? undefined,
```
por (preenchido no cliente):
```ts
    candidateName: '', // populated client-side from useCandidates map
    candidateAvatar: undefined, // populated client-side from useCandidates map
```
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep "applicationsService.supabase.ts"` (vazio = ok).

**Steps — messagesService**
- [ ] Em `messagesService.supabase.ts`, trocar `CONVERSATION_SELECT` (L15) por (sem `candidates(name)`):
```ts
const CONVERSATION_SELECT = '*, companies(name), jobs(title)';
```
- [ ] Em `mapConversation` (L189-201), trocar L193:
```ts
      candidateName: row.candidates?.name ?? '',
```
por:
```ts
      candidateName: '', // populated client-side from useCandidates map
```
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep "messagesService.supabase.ts"` (vazio = ok).

**Steps — Kanban (pages/empresa/Applications.tsx)**
- [ ] Localizar onde `useCandidates`/lista de candidaturas é consumida (já existe `useCandidates(undefined, { page: 1, pageSize: 1000 })` em outras telas da empresa). Confirmar com: `grep -nE "useCandidates|useApplications|\.candidateName|\.candidateAvatar" src/pages/empresa/Applications.tsx`.
- [ ] Garantir o import do hook (se ausente): `import { useCandidates } from '@/hooks/useCandidatesQuery';` e a consulta `const { data: candidatesResult } = useCandidates(undefined, { page: 1, pageSize: 1000 });`.
- [ ] Construir o mapa e enriquecer as applications logo após obter `applications` (substituir o array bruto pelo enriquecido onde é renderizado o Kanban):
```ts
const candidatesById = useMemo(() => {
  const map = new Map<string, { name: string; avatar?: string }>();
  for (const c of candidatesResult?.data ?? []) {
    map.set(c.id, { name: c.name, avatar: c.avatar });
  }
  return map;
}, [candidatesResult]);

const applicationsWithCandidate = useMemo(
  () =>
    applications.map((app) => {
      const c = candidatesById.get(app.candidateId);
      return {
        ...app,
        candidateName: c?.name ?? app.candidateName ?? '',
        candidateAvatar: c?.avatar ?? app.candidateAvatar,
      };
    }),
  [applications, candidatesById],
);
```
(usar `applicationsWithCandidate` em vez do array original na renderização das colunas/cards; ajustar o nome da variável-fonte `applications` ao que já existe na tela). Importar `useMemo` se ainda não importado.
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep "empresa/Applications.tsx"` (vazio = ok).

**Steps — lista de Mensagens da empresa**
- [ ] Identificar a tela: `grep -rln "useConversations\|candidateName" src/pages/empresa` para localizar a lista de mensagens da empresa (ex.: `pages/empresa/Messages.tsx`).
- [ ] No componente, importar/consultar `useCandidates(undefined, { page: 1, pageSize: 1000 })` e montar `candidatesById` (mesmo padrão acima).
- [ ] Para conversas onde `userType === 'company'`, preencher `candidateName` no cliente a partir do mapa, ex.:
```ts
const conversationsWithCandidate = useMemo(
  () =>
    conversations.map((conv) => ({
      ...conv,
      candidateName: candidatesById.get(conv.candidateId)?.name ?? conv.candidateName ?? '',
    })),
  [conversations, candidatesById],
);
```
(usar `conversationsWithCandidate` na renderização da lista).
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep -E "empresa/Messages.tsx|<arquivo da lista de mensagens>"` (vazio = ok).
- [ ] Verificar import/sintaxe geral: `npm run build`.
- [ ] Preview: abrir Kanban de candidaturas e lista de mensagens como empresa → nome (e avatar no Kanban) do candidato **aparecem**; dado sensível continua oculto. (Critério de regressão: nome não pode sumir.)
- [ ] Commit: `refactor(consent): drop candidate embeds and populate candidate name/avatar client-side`

---

### Task C8 — `updateApplicationStatus` dispara `notify_request` no offer

**Files**
- Modify: `src/services/applications/applicationsService.supabase.ts` (`updateApplicationStatus` L263-307; imports L10)

**Interfaces**
- Consumes: Edge Function `manage-data-consent` action `notify_request` (cria/garante disclosure `pending` + notificação + e-mail). `FunctionsHttpError` de `@supabase/supabase-js` (ler `error.context.json()`).
- Produces: efeito colateral best-effort após a transição `→ offer` (não regride o retorno de `updateApplicationStatus`).

> Disparo só quando `status === 'offer' && previousStatus !== 'offer'`. Falha do invoke **não** deve quebrar a atualização de status (best-effort, log no console) — o registro do disclosure é garantido pelo trigger `create_disclosure_on_offer` (Seção B); o invoke cuida de e-mail/notificação.

**Steps**
- [ ] Em `applicationsService.supabase.ts`, garantir o import de `FunctionsHttpError`. Trocar L10:
```ts
import { supabase } from '@/lib/supabase';
```
por:
```ts
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
```
- [ ] Em `updateApplicationStatus`, antes do `return applicationRowToApplication(data);` final (L306), inserir o disparo best-effort:
```ts
    // On approval (→ offer), request data-disclosure consent: ensures a pending
    // disclosure exists and notifies/e-mails the candidate. Best-effort: a failure
    // here must not roll back the status change (the trigger guarantees the
    // disclosure row; this invoke only drives notification + e-mail).
    if (status === 'offer' && previousStatus !== 'offer') {
      try {
        const { error: consentError } = await supabase.functions.invoke(
          'manage-data-consent',
          { body: { action: 'notify_request', applicationId: id } },
        );
        if (consentError) {
          let detail = consentError.message;
          if (consentError instanceof FunctionsHttpError) {
            try {
              const body = await consentError.context.json();
              if (body?.message) detail = body.message as string;
            } catch {
              // Body was not JSON — keep the original message.
            }
          }
          console.error('[consent] notify_request failed:', detail);
        }
      } catch (err) {
        console.error('[consent] notify_request threw:', err);
      }
    }

    return applicationRowToApplication(data);
```
(remover o `return applicationRowToApplication(data);` antigo da L306 ao colar o bloco acima, evitando duplicação).
- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep "applicationsService.supabase.ts"` (vazio = ok).
- [ ] Verificar import/sintaxe: `npm run build`.
- [ ] Preview/runtime (após Edge deployada na Seção E): mover uma candidatura para "Aprovado" (offer) e confirmar no DB que um disclosure `pending` existe e que a notificação foi criada; mover de novo (já em offer) não re-dispara.
- [ ] Commit: `feat(consent): trigger notify_request on application offer transition`


## Task D1 — Edge Function `manage-data-consent`

**Files**
- Create: `supabase/functions/manage-data-consent/index.ts`
- Verify (no vitest — Deno/server): SQL adversarial via Supabase MCP + example `invoke` with `error.context.json()` handling.

**Interfaces**
- Consumes (request body): `{ action: 'notify_request' | 'accept' | 'refuse' | 'revoke', applicationId: string, termVersion?: string, termHash?: string }` + `Authorization: Bearer <jwt>` header.
- Consumes (DB, confirmed in `src/types/database.ts`):
  - `applications(id, candidate_id, job_id, status)` — note: **no `company_id`** column; derive via `job_id → jobs.company_id`.
  - `jobs(id, company_id, title)`; `companies(id, profile_id, name)`; `candidates(id, profile_id, name, email)`.
  - `candidate_data_disclosures(id, application_id, candidate_id, company_id, status, term_version, term_hash, accepted_at, revoked_at, ip, user_agent, created_at, updated_at)` — created by Section B; `unique(application_id, company_id)`.
  - `test_audit_logs(action, company_id, created_at, details, id, resource_id, resource_name, resource_type, user_id, user_name)` — `resource_type='consent'`; `user_name`/`user_id`/`company_id`/`resource_id` are NOT NULL.
  - `notifications(user_id, type, title, description, action_url, metadata)`.
- Produces (response): `{ success: boolean, data?: {...}, error?: string }` — non-2xx on validation/auth failure (caller reads `error.context.json()`).
- Produces (side effects): writes `candidate_data_disclosures` (service role), `test_audit_logs` (actions `consent_granted`/`consent_revoked`/`sensitive_data_revealed`, `resource_type='consent'`), `notifications`, and on `notify_request` calls `send-email` action `send_consent_request_email` (D2).

**Steps**
- [ ] Verify the disclosure table exists (Section B applied) before writing the function:
  - Run via Supabase MCP `execute_sql`: `select column_name from information_schema.columns where table_schema='public' and table_name='candidate_data_disclosures' order by 1;` — expect the 14 columns above. If empty, STOP (Section B not yet applied) and proceed assuming the contract.
- [ ] Create `supabase/functions/manage-data-consent/index.ts` with the COMPLETE code below:

```ts
/**
 * Edge Function: manage-data-consent
 * LGPD: manage candidate_data_disclosures lifecycle for per-application×company consent.
 *
 * Actions:
 *   - notify_request: company side — ensure a 'pending' disclosure exists for an
 *     application in 'offer', notify the candidate (in-app + email).
 *   - accept:  candidate side — disclosure -> 'accepted' (records term_version/hash,
 *     ip, user_agent); audit consent_granted; notify the company.
 *   - refuse:  candidate side — disclosure -> 'refused'; notify the company.
 *   - revoke:  candidate side — disclosure -> 'revoked' (records revoked_at);
 *     audit consent_revoked; notify the company.
 *
 * verify_jwt = false (config.toml). The caller JWT is validated manually via
 * supabase.auth.getUser(token). Writes use the service role (bypasses RLS).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400): Response {
  console.error(`[manage-data-consent] Error (${status}): ${message}`);
  return json({ success: false, error: message }, status);
}

/** Extract the first client IP from x-forwarded-for (mascaramento is done na exibição). */
function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip');
}

/** Best-effort audit log; never blocks the main flow. resource_type is always 'consent'. */
async function writeAudit(
  supabase: ReturnType<typeof createClient>,
  params: {
    action: 'consent_granted' | 'consent_revoked' | 'sensitive_data_revealed';
    companyId: string;
    userId: string;
    userName: string;
    resourceId: string;
    resourceName?: string | null;
    details?: string | null;
  },
): Promise<void> {
  try {
    await supabase.from('test_audit_logs').insert({
      action: params.action,
      resource_type: 'consent',
      resource_id: params.resourceId,
      resource_name: params.resourceName ?? null,
      company_id: params.companyId,
      user_id: params.userId,
      user_name: params.userName,
      details: params.details ?? null,
    });
  } catch (err) {
    console.error('[manage-data-consent] writeAudit failed (non-blocking):', err);
  }
}

/** Best-effort in-app notification; never blocks the main flow. */
async function notify(
  supabase: ReturnType<typeof createClient>,
  params: {
    userId: string;
    type: string;
    title: string;
    description: string;
    actionUrl: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      description: params.description,
      action_url: params.actionUrl,
      metadata: params.metadata ?? null,
    });
  } catch (err) {
    console.error('[manage-data-consent] notify failed (non-blocking):', err);
  }
}

interface ResolvedContext {
  application: { id: string; candidate_id: string; job_id: string; status: string };
  candidate: { id: string; profile_id: string; name: string; email: string };
  company: { id: string; profile_id: string; name: string };
  job: { id: string; company_id: string; title: string };
}

/** Resolve application -> candidate, job, company (applications has no company_id). */
async function resolveContext(
  supabase: ReturnType<typeof createClient>,
  applicationId: string,
): Promise<ResolvedContext | null> {
  const { data: application } = await supabase
    .from('applications')
    .select('id, candidate_id, job_id, status')
    .eq('id', applicationId)
    .maybeSingle();
  if (!application) return null;

  const { data: job } = await supabase
    .from('jobs')
    .select('id, company_id, title')
    .eq('id', application.job_id)
    .maybeSingle();
  if (!job) return null;

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, profile_id, name, email')
    .eq('id', application.candidate_id)
    .maybeSingle();
  if (!candidate) return null;

  const { data: company } = await supabase
    .from('companies')
    .select('id, profile_id, name')
    .eq('id', job.company_id)
    .maybeSingle();
  if (!company) return null;

  return {
    application: application as ResolvedContext['application'],
    candidate: candidate as ResolvedContext['candidate'],
    company: company as ResolvedContext['company'],
    job: job as ResolvedContext['job'],
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return errorResponse('Método não permitido. Use POST.', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return errorResponse('Variáveis de ambiente ausentes (SUPABASE_URL / SERVICE_ROLE_KEY).', 500);
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // --- Manual JWT validation (verify_jwt is disabled) ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse('Cabeçalho Authorization obrigatório.', 401);
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !caller) {
    return errorResponse('Token inválido.', 401);
  }

  let body: { action?: string; applicationId?: string; termVersion?: string; termHash?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse('JSON inválido no corpo da requisição.');
  }

  const { action, applicationId } = body;
  if (!action) return errorResponse('Campo obrigatório ausente: action.');
  if (!applicationId) return errorResponse('Campo obrigatório ausente: applicationId.');

  console.log(`[manage-data-consent] action=${action} applicationId=${applicationId} caller=${caller.id}`);

  const ctx = await resolveContext(supabase, applicationId);
  if (!ctx) {
    return errorResponse('Candidatura, vaga, candidato ou empresa não encontrados.', 404);
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent');
  const nowIso = new Date().toISOString();

  try {
    switch (action) {
      // ------------------------------------------------------------------
      // notify_request (company side): ensure a pending disclosure + notify
      // ------------------------------------------------------------------
      case 'notify_request': {
        // Idempotent upsert on the unique (application_id, company_id) pair.
        const { data: existing } = await supabase
          .from('candidate_data_disclosures')
          .select('id, status')
          .eq('application_id', ctx.application.id)
          .eq('company_id', ctx.company.id)
          .maybeSingle();

        if (!existing) {
          const { error: insertErr } = await supabase
            .from('candidate_data_disclosures')
            .insert({
              application_id: ctx.application.id,
              candidate_id: ctx.candidate.id,
              company_id: ctx.company.id,
              status: 'pending',
            });
          // Unique violation = trigger create_disclosure_on_offer já criou: tolerar.
          if (insertErr && !String(insertErr.message).includes('duplicate')) {
            return errorResponse('Erro ao registrar solicitação: ' + insertErr.message, 500);
          }
        } else if (existing.status === 'refused' || existing.status === 'revoked') {
          // Re-solicitação: volta para pending.
          await supabase
            .from('candidate_data_disclosures')
            .update({ status: 'pending', accepted_at: null, revoked_at: null, updated_at: nowIso })
            .eq('id', existing.id);
        }

        // In-app notification to the candidate.
        await notify(supabase, {
          userId: ctx.candidate.profile_id,
          type: 'consent_request',
          title: 'Você foi aprovado — autorize o compartilhamento',
          description: `A empresa ${ctx.company.name} solicitou autorização para acessar seus dados de contato na vaga "${ctx.job.title}".`,
          actionUrl: '/candidato/candidaturas',
          metadata: { applicationId: ctx.application.id, companyId: ctx.company.id },
        });

        // Email aviso (best-effort, lê resposta não-2xx do send-email).
        try {
          const emailResp = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'send_consent_request_email',
              to: ctx.candidate.email,
              candidateName: ctx.candidate.name,
              companyName: ctx.company.name,
              jobTitle: ctx.job.title,
              actionLink: 'https://recrutars.com/candidato/candidaturas',
            }),
          });
          const emailResult = await emailResp.json().catch(() => ({}));
          if (!emailResp.ok || emailResult?.error) {
            console.error('[manage-data-consent] send-email failed:', emailResult?.error || emailResp.status);
          }
        } catch (err) {
          console.error('[manage-data-consent] send-email fetch failed (non-blocking):', err);
        }

        return json({ success: true, data: { status: 'pending' } });
      }

      // ------------------------------------------------------------------
      // accept (candidate side)
      // ------------------------------------------------------------------
      case 'accept': {
        const { data: updated, error: updErr } = await supabase
          .from('candidate_data_disclosures')
          .update({
            status: 'accepted',
            accepted_at: nowIso,
            revoked_at: null,
            term_version: body.termVersion ?? null,
            term_hash: body.termHash ?? null,
            ip,
            user_agent: userAgent,
            updated_at: nowIso,
          })
          .eq('application_id', ctx.application.id)
          .eq('company_id', ctx.company.id)
          .select('id, status')
          .maybeSingle();

        if (updErr) return errorResponse('Erro ao registrar aceite: ' + updErr.message, 500);
        if (!updated) return errorResponse('Nenhuma solicitação de consentimento encontrada para aceitar.', 404);

        await writeAudit(supabase, {
          action: 'consent_granted',
          companyId: ctx.company.id,
          userId: ctx.candidate.profile_id,
          userName: ctx.candidate.name,
          resourceId: ctx.application.id,
          resourceName: ctx.job.title,
          details: `Consentimento concedido por ${ctx.candidate.name} (versão ${body.termVersion ?? '?'}).`,
        });

        await notify(supabase, {
          userId: ctx.company.profile_id,
          type: 'consent_granted',
          title: 'Consentimento concedido',
          description: `${ctx.candidate.name} autorizou o compartilhamento dos dados na vaga "${ctx.job.title}".`,
          actionUrl: '/empresa/candidatos',
          metadata: { applicationId: ctx.application.id, candidateId: ctx.candidate.id },
        });

        return json({ success: true, data: { status: 'accepted' } });
      }

      // ------------------------------------------------------------------
      // refuse (candidate side)
      // ------------------------------------------------------------------
      case 'refuse': {
        const { data: updated, error: updErr } = await supabase
          .from('candidate_data_disclosures')
          .update({ status: 'refused', updated_at: nowIso })
          .eq('application_id', ctx.application.id)
          .eq('company_id', ctx.company.id)
          .select('id, status')
          .maybeSingle();

        if (updErr) return errorResponse('Erro ao registrar recusa: ' + updErr.message, 500);
        if (!updated) return errorResponse('Nenhuma solicitação de consentimento encontrada para recusar.', 404);

        await notify(supabase, {
          userId: ctx.company.profile_id,
          type: 'consent_refused',
          title: 'Consentimento não autorizado',
          description: `${ctx.candidate.name} não autorizou o compartilhamento dos dados na vaga "${ctx.job.title}".`,
          actionUrl: '/empresa/candidatos',
          metadata: { applicationId: ctx.application.id, candidateId: ctx.candidate.id },
        });

        return json({ success: true, data: { status: 'refused' } });
      }

      // ------------------------------------------------------------------
      // revoke (candidate side, from accepted)
      // ------------------------------------------------------------------
      case 'revoke': {
        const { data: updated, error: updErr } = await supabase
          .from('candidate_data_disclosures')
          .update({ status: 'revoked', revoked_at: nowIso, updated_at: nowIso })
          .eq('application_id', ctx.application.id)
          .eq('company_id', ctx.company.id)
          .select('id, status')
          .maybeSingle();

        if (updErr) return errorResponse('Erro ao registrar revogação: ' + updErr.message, 500);
        if (!updated) return errorResponse('Nenhuma solicitação de consentimento encontrada para revogar.', 404);

        await writeAudit(supabase, {
          action: 'consent_revoked',
          companyId: ctx.company.id,
          userId: ctx.candidate.profile_id,
          userName: ctx.candidate.name,
          resourceId: ctx.application.id,
          resourceName: ctx.job.title,
          details: `Consentimento revogado por ${ctx.candidate.name}.`,
        });

        await notify(supabase, {
          userId: ctx.company.profile_id,
          type: 'consent_revoked',
          title: 'Consentimento revogado',
          description: `${ctx.candidate.name} revogou o compartilhamento dos dados na vaga "${ctx.job.title}". Os dados foram ocultados novamente.`,
          actionUrl: '/empresa/candidatos',
          metadata: { applicationId: ctx.application.id, candidateId: ctx.candidate.id },
        });

        return json({ success: true, data: { status: 'revoked' } });
      }

      default:
        return errorResponse(
          `Ação desconhecida: ${action}. Ações válidas: notify_request, accept, refuse, revoke.`,
        );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[manage-data-consent] Handler crash for ${action}: ${msg}`);
    return errorResponse(`Erro interno: ${msg}`, 500);
  }
});
```

- [ ] Type/syntax sanity (Deno file is not type-checked by the project tsc, so only validate it is valid by deploying it in D3). For now confirm no obvious import/parse issue by checking the file was written and the imports use `https://esm.sh/@supabase/supabase-js@2` (matches manage-team-anonymization pattern). Run: `npx tsc --noEmit 2>&1 | grep manage-data-consent` — expect EMPTY (this file is under `supabase/functions`, excluded from the app tsconfig; empty grep = it introduced no new project-level type error).
- [ ] Commit:
  - `feat(consent): add manage-data-consent edge function (notify/accept/refuse/revoke)`
  - body explains: validates JWT via getUser, service-role writes to candidate_data_disclosures, audit resource_type='consent', notifications + send-email on notify_request.
  - end message with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

## Task D2 — `send_consent_request_email` action in `send-email`

**Files**
- Modify: `supabase/functions/send-email/index.ts` — add `SendConsentRequestBody` type (after `SendActivationBody`, ~L44), add `buildConsentRequestEmailHtml` (after `buildActivationEmailHtml`, ~L348), add `handleSendConsentRequestEmail` (after `handleSendActivationEmail`, ~L498), add `case 'send_consent_request_email'` to the switch (~L604) and to the `default` message + `RequestBody` union (L51).
- Verify: `npx tsc --noEmit 2>&1 | grep send-email` (empty — file excluded from app tsconfig, proves no project regression) + deploy in D3.

**Interfaces**
- Consumes (request body): `{ action: 'send_consent_request_email', to: string, candidateName: string, companyName: string, jobTitle: string, actionLink: string }`.
- Produces: `{ success: boolean, messageId?: string, error?: string }` (mirrors `handleSendInvitationEmail`).

**Steps**
- [ ] Add the body type to the union. Replace the `RequestBody` type line (L51):

```ts
type RequestBody = SendInvitationBody | SendActivationBody | SendConsentRequestBody | TestConnectionBody;
```

- [ ] Insert the new interface immediately after `SendActivationBody` (after L44):

```ts
interface SendConsentRequestBody {
  action: 'send_consent_request_email';
  to: string;
  candidateName: string;
  companyName: string;
  jobTitle: string;
  actionLink: string;
}
```

- [ ] Insert the HTML builder after `buildActivationEmailHtml` (after L348). It reuses the exact card/Header/Footer markup of `buildInvitationEmailHtml`:

```ts
function buildConsentRequestEmailHtml(params: {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  actionLink: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Autorize o compartilhamento dos seus dados — RecrutaRS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #06b6d4; letter-spacing: 1px;">RecrutaRS</h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">Recrutamento Inteligente</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 8px; font-size: 22px; color: #0f172a;">Parabéns, ${escapeHtml(params.candidateName)}!</h2>
              <p style="margin: 0 0 24px; font-size: 16px; color: #475569; line-height: 1.6;">
                Você foi aprovado(a)${params.companyName ? ` pela <strong style="color: #0f172a;">${escapeHtml(params.companyName)}</strong>` : ''} na vaga <strong style="color: #0f172a;">${escapeHtml(params.jobTitle)}</strong>.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; color: #475569; line-height: 1.6;">
                Para avançar, a empresa precisa da sua autorização para acessar seus dados de contato (CPF, e-mail, telefone, data de nascimento e endereço). Você decide: pode autorizar ou recusar, e pode revogar a qualquer momento.
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(params.actionLink)}" target="_blank" style="display: inline-block; background-color: #06b6d4; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 8px; letter-spacing: 0.3px;">
                      Revisar e autorizar
                    </a>
                  </td>
                </tr>
              </table>
              <!-- LGPD note -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 6px 6px 0;">
                    <p style="margin: 0; font-size: 14px; color: #065f46; line-height: 1.5;">
                      <strong>Seus direitos:</strong> o compartilhamento é opcional e reversível. Um termo de consentimento registrado (data, hora e versão) fica disponível para você imprimir.
                    </p>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin: 32px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <a href="${escapeHtml(params.actionLink)}" style="color: #06b6d4; word-break: break-all;">${escapeHtml(params.actionLink)}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                <strong style="color: #64748b;">RecrutaRS</strong> — Recrutamento Inteligente
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #cbd5e1;">
                Este é um email automático. Por favor, não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

- [ ] Insert the handler after `handleSendActivationEmail` (after L498):

```ts
async function handleSendConsentRequestEmail(
  config: ResendConfig,
  body: SendConsentRequestBody,
): Promise<Response> {
  const { to, candidateName, companyName, jobTitle, actionLink } = body;

  if (!to || typeof to !== 'string' || !to.trim()) {
    return errorResponse('Campo obrigatório ausente: to (email do destinatário)');
  }
  if (!candidateName) {
    return errorResponse('Campo obrigatório ausente: candidateName');
  }
  if (!actionLink) {
    return errorResponse('Campo obrigatório ausente: actionLink');
  }

  console.log(`[send-email] === send_consent_request_email START === to=${to}, job=${jobTitle}`);

  const html = buildConsentRequestEmailHtml({
    candidateName,
    companyName: companyName || '',
    jobTitle: jobTitle || 'vaga',
    actionLink,
  });

  const result = await sendEmail(config, {
    to,
    subject: companyName
      ? `Autorize o compartilhamento dos seus dados — ${companyName}`
      : 'Autorize o compartilhamento dos seus dados — RecrutaRS',
    html,
  });

  if (!result.success) {
    console.log('[send-email] === send_consent_request_email END (FAILED) ===');
    return jsonResponse({ success: false, error: result.error }, 200);
  }

  console.log('[send-email] === send_consent_request_email END (OK) ===');
  return jsonResponse({ success: true, messageId: result.messageId });
}
```

- [ ] Add the case to the switch (after the `send_activation_email` case, ~L604):

```ts
        case 'send_consent_request_email':
          result = await handleSendConsentRequestEmail(config, body as SendConsentRequestBody);
          break;
```

- [ ] Update the `default` branch valid-actions message (L611-613) to list the new action:

```ts
        default:
          result = errorResponse(
            `Ação desconhecida: ${(body as Record<string, unknown>).action}. Ações válidas: send_invitation_email, send_activation_email, send_consent_request_email, test_connection`,
          );
```

- [ ] Verify no project-level type regression: `npx tsc --noEmit 2>&1 | grep send-email` — expect EMPTY.
- [ ] Commit:
  - `feat(consent): add send_consent_request_email action to send-email`
  - end message with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

## Task D3 — `config.toml` entry + deploy both functions

**Files**
- Modify: `supabase/config.toml` — append `[functions.manage-data-consent] verify_jwt = false`.
- Deploy: `manage-data-consent` (new) and `send-email` (updated) via Supabase MCP `deploy_edge_function`.
- Verify: example `invoke` + adversarial SQL.

**Interfaces**
- Consumes: the two function source files from D1/D2.
- Produces: deployed functions; `config.toml` flag so local `supabase functions serve` and any future `supabase deploy` keep `verify_jwt=false`.

**Steps**
- [ ] Append to `supabase/config.toml` (after the `migrate-certificates-to-storage` block, end of file). The `send-email` block already exists at L24-25 with `verify_jwt = false` — do NOT duplicate it. Add only:

```toml
[functions.manage-data-consent]
verify_jwt = false
```

- [ ] Verify the toml is still valid by reading it back and confirming exactly one `[functions.manage-data-consent]` block and one `[functions.send-email]` block exist:
  - `grep -c "functions.manage-data-consent" supabase/config.toml` → expect `1`
  - `grep -c "functions.send-email\]" supabase/config.toml` → expect `1`
- [ ] Deploy `manage-data-consent` via Supabase MCP `deploy_edge_function` with `name: "manage-data-consent"` and the file contents from D1; pass the deploy option equivalent to `--no-verify-jwt` (MCP defaults to verify_jwt=false). Expected output: a function record with `status: "ACTIVE"` (or `"deployed"`) and the function slug `manage-data-consent`.
- [ ] Deploy `send-email` via Supabase MCP `deploy_edge_function` with `name: "send-email"` and the updated file contents from D2. Expected output: `send-email` function record `ACTIVE`/version incremented.
- [ ] Confirm both are listed: Supabase MCP `list_edge_functions` — expect entries for `manage-data-consent` and `send-email`, both with `verify_jwt = false`.
- [ ] Smoke test the new function end-to-end with a real `offer` application id (replace `<APP_ID>` with a known application currently in `offer`). From the app (or a scratch node/ts snippet with an authenticated company session), call:

```ts
const { data, error } = await supabase.functions.invoke('manage-data-consent', {
  body: { action: 'notify_request', applicationId: '<APP_ID>' },
});
if (error) {
  // functions.invoke treats non-2xx as FunctionsHttpError with data=null
  const detail = await error.context.json().catch(() => null);
  console.error('manage-data-consent failed:', detail ?? error.message);
} else {
  console.log('ok', data); // { success: true, data: { status: 'pending' } }
}
```

- [ ] Adversarial DB verification via Supabase MCP `execute_sql` after the `notify_request` smoke test:
  - `select status, application_id, company_id from candidate_data_disclosures where application_id = '<APP_ID>';` → expect one row `status='pending'`.
  - `select action, resource_type from test_audit_logs where resource_id = '<APP_ID>' and resource_type='consent' order by created_at desc limit 5;` → after an `accept` invoke, expect `consent_granted`; after a `revoke` invoke, expect `consent_revoked`. (`notify_request` writes no audit row by design — only a pending disclosure + notification.)
  - `select user_id, type, title from notifications where (metadata->>'applicationId') = '<APP_ID>' order by created_at desc limit 5;` → expect a `consent_request` row targeting the candidate profile after `notify_request`.
- [ ] Commit:
  - `chore(consent): register manage-data-consent in config.toml (verify_jwt=false)`
  - end message with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  - (Deploys are operational, not file changes; the only committed file in D3 is `config.toml`.)


## Task E1 — useConsentStatus (empresa: gate do botão Contratar)

**Files**
- Create: `src/hooks/useConsentStatus.ts`
- Test: none (UI/integration hook; verification via `tsc` grep + build)

**Interfaces**
- Consumes (from Section C): `import { getConsentService } from '@/services/consent/consentService'`; `IConsentService.getDisclosure(applicationId: string): Promise<DataDisclosure | null>`; types `import type { DataDisclosure, DisclosureStatus } from '@/types/consent'`.
- Produces: `export const consentKeys`; `export function useConsentStatus(applicationId: string): UseQueryResult<DisclosureStatus | null>` — `data` é o `status` do disclosure (ou `null` se inexistente).

**Steps**
- [ ] Implementar o hook com código completo:

```ts
/**
 * Consent status hook (company side).
 * Gates the "Contratar" button: the company can only hire once the candidate
 * has accepted the data disclosure for the application.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getConsentService } from '@/services/consent/consentService';
import type { DisclosureStatus } from '@/types/consent';

// --- Query Key Factory ---

export const consentKeys = {
  all: ['consent'] as const,
  disclosure: (applicationId: string) =>
    [...consentKeys.all, 'disclosure', applicationId] as const,
  byCandidate: (candidateId: string) =>
    [...consentKeys.all, 'byCandidate', candidateId] as const,
};

/**
 * Returns the disclosure status for an application (company view).
 * `data` is the disclosure status ('pending' | 'accepted' | 'refused' | 'revoked')
 * or `null` when no disclosure exists yet.
 */
export function useConsentStatus(
  applicationId: string,
): UseQueryResult<DisclosureStatus | null> {
  return useQuery<DisclosureStatus | null>({
    queryKey: consentKeys.disclosure(applicationId),
    queryFn: async () => {
      const service = await getConsentService();
      const disclosure = await service.getDisclosure(applicationId);
      return disclosure?.status ?? null;
    },
    enabled: !!applicationId,
  });
}
```

- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep useConsentStatus.ts` (vazio = ok; ignorar erros de baseline em outros arquivos). Se acusar que `@/services/consent/consentService` ou `@/types/consent` não existem, a Section C ainda não mergeou — confirmar que o contrato de assinaturas bate e seguir (o módulo será resolvido no merge).
- [ ] Verificar import/sintaxe: `npm run build` (não deve falhar por este arquivo).
- [ ] Commit:

```
git add src/hooks/useConsentStatus.ts
git commit -m "feat(consent): add useConsentStatus hook for company hire gate

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task E2 — useCandidateDisclosures (candidato: mapa applicationId -> DataDisclosure)

**Files**
- Create: `src/hooks/useCandidateDisclosures.ts`
- Test: none (verification via `tsc` grep + build)

**Interfaces**
- Consumes (from Section C): `getConsentService`; `IConsentService.listDisclosuresByCandidate(candidateId: string): Promise<DataDisclosure[]>`; `import type { DataDisclosure } from '@/types/consent'`. Reusa `consentKeys` da Task E1.
- Produces: `export function useCandidateDisclosures(candidateId: string): UseQueryResult<Record<string, DataDisclosure>>` — chave do mapa = `disclosure.applicationId`.

**Steps**
- [ ] Implementar o hook com código completo:

```ts
/**
 * Candidate disclosures hook.
 * Returns a map of applicationId -> DataDisclosure for the logged-in candidate,
 * so each application card can resolve its own consent state.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getConsentService } from '@/services/consent/consentService';
import { consentKeys } from '@/hooks/useConsentStatus';
import type { DataDisclosure } from '@/types/consent';

/**
 * Map of applicationId -> DataDisclosure for the given candidate.
 * Built from listDisclosuresByCandidate; empty object when none exist.
 */
export function useCandidateDisclosures(
  candidateId: string,
): UseQueryResult<Record<string, DataDisclosure>> {
  return useQuery<Record<string, DataDisclosure>>({
    queryKey: consentKeys.byCandidate(candidateId),
    queryFn: async () => {
      const service = await getConsentService();
      const disclosures = await service.listDisclosuresByCandidate(candidateId);
      return disclosures.reduce<Record<string, DataDisclosure>>(
        (map, disclosure) => {
          map[disclosure.applicationId] = disclosure;
          return map;
        },
        {},
      );
    },
    enabled: !!candidateId,
  });
}
```

- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep useCandidateDisclosures.ts` (vazio = ok).
- [ ] Verificar import/sintaxe: `npm run build`.
- [ ] Commit:

```
git add src/hooks/useCandidateDisclosures.ts
git commit -m "feat(consent): add useCandidateDisclosures hook (applicationId map)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task E3 — useConsentDecision (candidato: accept/refuse/revoke com invalidação)

**Files**
- Create: `src/hooks/useConsentDecision.ts`
- Test: none (verification via `tsc` grep + build)

**Interfaces**
- Consumes (from Section C): `getConsentService`; `IConsentService.accept(input: { applicationId: string; termVersion: string; termHash: string }): Promise<DataDisclosure>`, `refuse(applicationId: string): Promise<DataDisclosure>`, `revoke(applicationId: string): Promise<DataDisclosure>`; `import type { DataDisclosure } from '@/types/consent'`.
- Consumes (existentes — confirmado nos arquivos): `applicationKeys` de `@/hooks/useApplicationsQuery` (linha 19); `candidateKeys` de `@/hooks/useCandidatesQuery` (linha 26); `consentKeys` de `@/hooks/useConsentStatus`; `useAuth` de `@/contexts/AuthContext` (expõe `currentCandidate: Candidate | null`, linha 62); `toast` de `sonner`.
- Produces: `export function useConsentDecision()` retornando `{ accept, refuse, revoke }` (três `UseMutationResult`).

**Steps**
- [ ] Implementar o hook com código completo:

```ts
/**
 * Consent decision hook (candidate side).
 * Exposes accept / refuse / revoke mutations. On success each invalidates the
 * consent caches plus applications and candidates so the company-facing gate
 * and the candidate list refetch fresh state.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getConsentService } from '@/services/consent/consentService';
import { applicationKeys } from '@/hooks/useApplicationsQuery';
import { candidateKeys } from '@/hooks/useCandidatesQuery';
import { consentKeys } from '@/hooks/useConsentStatus';
import { useAuth } from '@/contexts/AuthContext';

export function useConsentDecision() {
  const queryClient = useQueryClient();
  const { currentCandidate } = useAuth();

  const invalidateAll = (applicationId: string) => {
    queryClient.invalidateQueries({
      queryKey: consentKeys.disclosure(applicationId),
    });
    if (currentCandidate?.id) {
      queryClient.invalidateQueries({
        queryKey: consentKeys.byCandidate(currentCandidate.id),
      });
    }
    // Refetch applications so the "offer/hired" flow and the company hire gate
    // pick up the new disclosure state.
    queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    // Refetch candidates so the company list re-reads masked/unmasked PII.
    queryClient.invalidateQueries({ queryKey: candidateKeys.all });
  };

  const accept = useMutation({
    mutationFn: async (input: {
      applicationId: string;
      termVersion: string;
      termHash: string;
    }) => {
      const service = await getConsentService();
      return service.accept(input);
    },
    onSuccess: (disclosure) => {
      invalidateAll(disclosure.applicationId);
      toast.success('Consentimento autorizado', {
        description: 'Seus dados foram liberados para a empresa.',
      });
    },
    onError: (e: Error) =>
      toast.error('Erro ao autorizar', { description: e.message }),
  });

  const refuse = useMutation({
    mutationFn: async (applicationId: string) => {
      const service = await getConsentService();
      return service.refuse(applicationId);
    },
    onSuccess: (disclosure) => {
      invalidateAll(disclosure.applicationId);
      toast.success('Compartilhamento recusado');
    },
    onError: (e: Error) =>
      toast.error('Erro ao recusar', { description: e.message }),
  });

  const revoke = useMutation({
    mutationFn: async (applicationId: string) => {
      const service = await getConsentService();
      return service.revoke(applicationId);
    },
    onSuccess: (disclosure) => {
      invalidateAll(disclosure.applicationId);
      toast.success('Consentimento revogado', {
        description: 'A empresa não tem mais acesso aos seus dados sensíveis.',
      });
    },
    onError: (e: Error) =>
      toast.error('Erro ao revogar', { description: e.message }),
  });

  return { accept, refuse, revoke };
}
```

- [ ] Verificar tipo: `npx tsc --noEmit 2>&1 | grep useConsentDecision.ts` (vazio = ok). Confirmar que `currentCandidate.id` existe no tipo `Candidate` (campo `id` é base do tipo); se `tsc` reclamar do acesso, ajustar para `currentCandidate?.id`.
- [ ] Verificar import/sintaxe: `npm run build`.
- [ ] Commit:

```
git add src/hooks/useConsentDecision.ts
git commit -m "feat(consent): add useConsentDecision hook (accept/refuse/revoke)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```


## Seção F · UI empresa

> **Pré-requisitos de outras seções que estas tasks consomem (contratos fixos, não reimplementar aqui):**
> - **Seção C (tipos/converter):** `Candidate.email`, `Candidate.phone`, `Candidate.cpf`, `Candidate.dateOfBirth`, `Candidate.location` já chegam `undefined` quando mascarados pela view `candidates_for_company` (consumida por `useCandidates`). `Candidate.city`/`Candidate.state`/`Candidate.name` permanecem sempre presentes. A `AuditAction` já inclui `'sensitive_data_revealed'` e `AuditResourceType` já inclui `'consent'` em `src/types/companyTest.ts`.
> - **Seção G:** componente reutilizável `ConsentTermDialog` em `src/components/consent/ConsentTermDialog.tsx`, com props `{ open: boolean; onOpenChange: (v: boolean) => void; disclosure: DataDisclosure; parties: ConsentTermParties }` (onde `ConsentTermParties` vem de `@/components/consent/consentTermHtml`).
> - **Seção H (hooks/serviço):** `useConsentStatus(applicationId: string)` → `{ data: DisclosureStatus | null }` em `src/hooks/useConsentStatus.ts`; `getConsentService().getDisclosure(applicationId)` → `Promise<DataDisclosure | null>` (para a faixa "Liberado em"). `maskCpfPartial`/`maskIpPartial` em `src/lib/piiMask.ts`.
>
> Estas tasks (F1–F3) tocam **apenas UI da empresa**. Não criam tabela, RPC, view, hook ou serviço — apenas os consomem. Se um contrato acima ainda não existir no momento de rodar a task, a verificação `npm run build` acusará import quebrado e a task deve aguardar a seção dona.

---

### Task F1 — `CandidateProfile`: remover máscara cosmética e gate `hasActiveApplication`; consumir campos já mascarados (header + bloco de currículo) com cadeado/revelação + faixa "Liberado em" + botão do termo

**Files**
- Modify `src/pages/empresa/CandidateProfile.tsx` (remover `maskEmail`/`maskPhone` L204-217; remover `hasActiveApplication` L345-349; header de contato L790-836; importar e usar `useConsentStatus`, `getConsentService`, `ConsentTermDialog`, `maskIpPartial`; novo estado `consentTermOpen`; faixa "Liberado em" + botão "Ver termo")
- Test: sem unit test (UI). Verificação = `npx tsc --noEmit 2>&1 | grep "CandidateProfile.tsx"` vazio + `npm run build` (import/sintaxe) + preview.

**Interfaces**
- Consumes: `useConsentStatus(applicationId: string): { data: DisclosureStatus | null }`; `getConsentService().getDisclosure(applicationId: string): Promise<DataDisclosure | null>`; `ConsentTermDialog` (props acima); `Candidate.email/phone/cpf/dateOfBirth` (`string | undefined`).
- Produces: nada exportado novo (mudança interna de render).

**Passos**

- [ ] Remover as funções `maskEmail` (L204-209) e `maskPhone` (L211-217) inteiras de `CandidateProfile.tsx` (não são mais usadas: a fonte já entrega mascarado).

- [ ] Remover o bloco `const activeStatuses` + `const hasActiveApplication = useMemo(...)` (L345-349). Ele revelava cedo demais (incluía `pending`); a revelação agora é por consentimento.

- [ ] Adicionar imports no topo (junto aos demais hooks/componentes, após a linha `import { useProfile } from '@/hooks/useCurriculumsQuery';` L76):
```tsx
import { useConsentStatus } from '@/hooks/useConsentStatus';
import { useQuery } from '@tanstack/react-query';
import { getConsentService } from '@/services/consent/consentService';
import { ConsentTermDialog } from '@/components/consent/ConsentTermDialog';
import { maskIpPartial } from '@/lib/piiMask';
import { Lock, ScrollText } from 'lucide-react';
import type { DataDisclosure } from '@/types/consent';
```

- [ ] Adicionar estado e derivações de consentimento logo após `const selectedApplication = useMemo(...)` (após L368). O gate de revelação é o status `accepted` da candidatura selecionada:
```tsx
  // LGPD: estado de consentimento da candidatura selecionada
  const [consentTermOpen, setConsentTermOpen] = useState(false);
  const consentApplicationId = selectedApplication?.id ?? '';
  const { data: consentStatus } = useConsentStatus(consentApplicationId);
  const isPiiRevealed = consentStatus === 'accepted';

  // Disclosure completo (faixa "Liberado em" + termo) — só busca quando aceito
  const { data: consentDisclosure } = useQuery<DataDisclosure | null>({
    queryKey: ['consent', 'disclosure', consentApplicationId],
    queryFn: () => getConsentService().getDisclosure(consentApplicationId),
    enabled: isPiiRevealed && !!consentApplicationId,
  });

  const consentReleasedLabel = consentDisclosure?.acceptedAt
    ? new Date(consentDisclosure.acceptedAt).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;
```

- [ ] Substituir o `<span>` de e-mail no header (L801-804, hoje `{hasActiveApplication ? candidate.email : maskEmail(candidate.email)}`) por revelação condicional com cadeado:
```tsx
                    {isPiiRevealed && candidate.email ? (
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {candidate.email}
                      </span>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 cursor-default text-muted-foreground/70">
                            <Lock className="w-3.5 h-3.5" />
                            E-mail oculto
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Liberado apenas após o candidato autorizar o compartilhamento (LGPD)</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
```

- [ ] Substituir todo o bloco de telefone do header (L805-836, o `{candidate.phone && (hasActiveApplication ? ... : ...)}`) por revelação por consentimento:
```tsx
                    {isPiiRevealed && candidate.phone ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`https://wa.me/55${candidate.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground hover:underline transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {formatPhone(candidate.phone)}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Abrir WhatsApp — liberado pelo consentimento do candidato</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 cursor-default text-muted-foreground/70">
                            <Lock className="w-3.5 h-3.5" />
                            Telefone oculto
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Liberado apenas após o candidato autorizar o compartilhamento (LGPD)</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
```

- [ ] Adicionar, imediatamente após o fechamento do bloco de telefone acima (ainda dentro do `<div className="flex flex-wrap gap-3 mt-3 ...">`), os campos `cpf` e `dateOfBirth` com o mesmo padrão de cadeado (sempre sensíveis):
```tsx
                    {isPiiRevealed && candidate.cpf ? (
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        CPF: {candidate.cpf}
                      </span>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 cursor-default text-muted-foreground/70">
                            <Lock className="w-3.5 h-3.5" />
                            CPF oculto
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Liberado apenas após o candidato autorizar o compartilhamento (LGPD)</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {isPiiRevealed && candidate.dateOfBirth ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(candidate.dateOfBirth).toLocaleDateString('pt-BR')}
                      </span>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 cursor-default text-muted-foreground/70">
                            <Lock className="w-3.5 h-3.5" />
                            Nascimento oculto
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Liberado apenas após o candidato autorizar o compartilhamento (LGPD)</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
```

- [ ] Adicionar a faixa "Liberado em" + botão "Ver termo", logo após o fechamento do `<div className="flex flex-wrap gap-3 mt-3 ...">` (antes do bloco `{/* Application badges */}` em L839). Só aparece quando há consentimento aceito:
```tsx
                  {isPiiRevealed && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>
                        Dados liberados pelo candidato
                        {consentReleasedLabel ? ` em ${consentReleasedLabel}` : ''}
                      </span>
                      {consentDisclosure && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-emerald-700 dark:text-emerald-400 underline"
                          onClick={() => setConsentTermOpen(true)}
                        >
                          <ScrollText className="w-3.5 h-3.5 mr-1" />
                          Ver termo
                        </Button>
                      )}
                    </div>
                  )}
```

- [ ] No bloco de currículo da ficha, ocultar email/phone do currículo sem consentimento. Localizar a `PersonalInfoSection`/exibição de contato do currículo na ficha (não confundir com PDF). Como a ficha não renderiza email/phone do currículo no JSX atual (o currículo é exibido só como experiência/educação/skills via `profile`), o campo de contato do currículo só aparece no PDF (tratado na Task F3). Verificar via grep que não há leitura direta de `profile?.email`/`profile?.phone` no JSX da ficha:
```bash
grep -nE "profile\?\.(email|phone)|curriculum\?\.(email|phone)" src/pages/empresa/CandidateProfile.tsx
```
Se o grep retornar linhas, envolver cada uma em `{isPiiRevealed && (...)}`; se vazio (esperado), nenhuma alteração adicional na ficha — o gate do currículo fica concentrado no PDF (Task F3).

- [ ] Renderizar o `ConsentTermDialog` no final do componente, junto aos outros modais (após o `ExportCandidateProfileModal` em L1904-1911, antes do `</DashboardLayout>`):
```tsx
      {/* LGPD: Termo de consentimento (inline, reutilizável) */}
      {consentDisclosure && (
        <ConsentTermDialog
          open={consentTermOpen}
          onOpenChange={setConsentTermOpen}
          disclosure={consentDisclosure}
          parties={{
            candidateName: getCandidateDisplayName(candidate),
            candidateCpf: candidate.cpf,
            companyName: currentCompany?.name ?? '',
            companyLogo: currentCompany?.logo ?? null,
            jobTitle: selectedApplication?.jobTitle ?? '',
            operatorName: 'RecrutaRS',
          }}
        />
      )}
```

- [ ] Rodar `npx tsc --noEmit 2>&1 | grep "CandidateProfile.tsx"` e confirmar saída vazia (nenhum novo erro de tipo introduzido).

- [ ] Rodar `npm run build` e confirmar que compila sem erro de import/sintaxe.

- [ ] Preview: abrir uma ficha de candidato com candidatura em status anterior a aceite → e-mail/telefone/CPF/nascimento aparecem como "🔒 oculto"; nome e localização visíveis. Abrir candidatura com disclosure `accepted` → dados revelados + faixa "Dados liberados … em DD/MM/AAAA, HH:MM" + botão "Ver termo" abre o `ConsentTermDialog` inline (sem navegação de rota).

- [ ] Commit:
```
feat(empresa): gate candidate PII by consent in profile header

Remove cosmetic client-side email/phone masking and the early-reveal
hasActiveApplication gate. Consume already-masked fields from the
company view and reveal cpf/email/phone/date_of_birth only when the
selected application has an accepted data disclosure, with a
"liberado em" banner and an inline consent term dialog.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

---

### Task F2 — `Applications`/`HiringModal`: desabilitar "Contratar" sem `useConsentStatus` aceito, com aviso "Aguardando consentimento"

**Files**
- Modify `src/pages/empresa/Applications.tsx` (importar `useConsentStatus`; derivar `selectedConsentStatus` da `selectedApplication`; passar `consentAccepted` ao `HiringModal`; bloquear o botão "Contratar" L1509-1524 com tooltip pt-BR). O nome do candidato no Kanban segue vindo do `candidatesMap` (seção C7) — não tocar nessa fonte.
- Modify `src/components/empresa/HiringModal.tsx` (nova prop opcional `consentAccepted?: boolean`; incluir em `canSubmit`; `Alert` de aviso quando não aceito).
- Test: sem unit test (UI). Verificação = `npx tsc --noEmit 2>&1 | grep -E "Applications.tsx|HiringModal.tsx"` vazio + `npm run build` + preview.

**Interfaces**
- Consumes: `useConsentStatus(applicationId: string): { data: DisclosureStatus | null }`.
- Produces: `HiringModal` ganha prop `consentAccepted?: boolean`.

**Passos**

- [ ] Em `HiringModal.tsx`, adicionar a prop na interface `HiringModalProps` (após `candidateHasTest?: boolean;` L58):
```tsx
  consentAccepted?: boolean;
```

- [ ] Em `HiringModal.tsx`, adicionar `consentAccepted` ao destructuring de props (após `candidateHasTest,` L71):
```tsx
  consentAccepted,
```

- [ ] Em `HiringModal.tsx`, incluir o consentimento na guarda `canSubmit` (L91-95). Tratar `undefined` como "não exigir" só quando a prop não for passada não é seguro aqui — exigir aceite explícito:
```tsx
  const canSubmit =
    departmentId.length > 0 &&
    positionTitle.trim().length > 0 &&
    hireDate.length > 0 &&
    consentAccepted === true &&
    !hireMutation.isPending;
```

- [ ] Em `HiringModal.tsx`, adicionar um `Alert` de aviso logo após o bloco "Candidate summary" (após `</div>` de L198, antes de `{/* Form */}` L200):
```tsx
          {consentAccepted !== true && (
            <Alert className="border-amber-500/40 bg-amber-500/10">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                Aguardando consentimento do candidato. A contratação só é
                liberada após o candidato autorizar o compartilhamento dos
                dados (LGPD).
              </AlertDescription>
            </Alert>
          )}
```

- [ ] Em `Applications.tsx`, importar o hook (junto aos demais imports de hooks, perto de `import { useCandidates } from '@/hooks/useCandidatesQuery';` L92):
```tsx
import { useConsentStatus } from '@/hooks/useConsentStatus';
```

- [ ] Em `Applications.tsx`, derivar o status do consentimento da candidatura selecionada, logo após `const selectedCandidate = ...` (após L742):
```tsx
  // LGPD: consentimento da candidatura selecionada (gate de UI do "Contratar")
  const { data: selectedConsentStatus } = useConsentStatus(
    selectedApplication?.id ?? ''
  );
  const selectedConsentAccepted = selectedConsentStatus === 'accepted';
```

- [ ] Em `Applications.tsx`, bloquear o botão "Contratar" (L1509-1524) quando não houver aceite, com tooltip explicativo. Substituir o bloco do botão por:
```tsx
                    {/* PRD-077: Botão de contratar (apenas para status offer/aprovado) */}
                    {selectedApplication.status === 'offer' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block w-full">
                            <Button
                              onClick={() => {
                                if (duplicateCheck?.exists) {
                                  setDuplicateWarningOpen(true);
                                } else {
                                  setHiringModalOpen(true);
                                }
                              }}
                              disabled={!selectedConsentAccepted}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                              size="sm"
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              Contratar
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!selectedConsentAccepted && (
                          <TooltipContent>
                            <p>Aguardando consentimento do candidato para liberar a contratação</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )}
```

- [ ] Verificar que `Tooltip`, `TooltipTrigger`, `TooltipContent` já estão importados em `Applications.tsx`:
```bash
grep -nE "TooltipContent|TooltipTrigger|^import.*tooltip" src/pages/empresa/Applications.tsx | head
```
Se faltar algum, adicionar ao import existente de `@/components/ui/tooltip` (ou criar o import). Garantir também que existe um `TooltipProvider` ancestral; se o componente não estiver dentro de um, envolver o botão com `<TooltipProvider>` local.

- [ ] Em `Applications.tsx`, passar a prop ao `HiringModal` (no JSX L1783-1804, após `candidateHasTest={selectedCandidate.hasTest}` L1792):
```tsx
          consentAccepted={selectedConsentAccepted}
```

- [ ] Rodar `npx tsc --noEmit 2>&1 | grep -E "Applications.tsx|HiringModal.tsx"` e confirmar saída vazia.

- [ ] Rodar `npm run build` e confirmar compilação sem erro de import/sintaxe.

- [ ] Preview: candidatura em `offer` **sem** disclosure aceito → botão "Contratar" desabilitado com tooltip "Aguardando consentimento…"; ao abrir o modal (se acessível por outro caminho), o `Alert` âmbar aparece e "Confirmar Contratação" fica desabilitado. Com disclosure `accepted` → botão habilitado e modal sem aviso. Verificar que o nome do candidato no Kanban e no drawer continua aparecendo (vem do `candidatesMap` — não regrediu).

- [ ] Commit:
```
feat(empresa): block hiring until candidate consent is accepted

Gate the "Contratar" button and HiringModal submit on an accepted
data disclosure for the selected application, with pt-BR tooltips and
an in-modal warning. Real enforcement is the BEFORE UPDATE trigger;
this is the UX layer.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

---

### Task F3 — PDF/Excel: injetar dados já mascarados, gate da seção `personalInfo` por consentimento, fechar fallback `curriculum?.email/phone`, auditar `sensitive_data_revealed` ao exportar PII

**Files**
- Modify `src/components/empresa/pdf/sections/CurriculumSections.tsx` (`PersonalInfoSection`: remover fallback `candidate.email ?? curriculum?.email` e `candidate.phone ?? curriculum?.phone` — usar só os campos do `candidate`, que já chegam mascarados; manter city/state/linkedin/title)
- Modify `src/components/empresa/pdf/ExportCandidateProfileModal.tsx` (gate de `isAvailable` da seção `personalInfo` por presença de PII; adicionar prop `onPiiExported?: () => void` chamada quando o PDF gerado incluir `personalInfo` com PII)
- Modify `src/pages/empresa/CandidateProfile.tsx` (`exportData` L562-572: injetar `candidate.email`/`candidate.phone` apenas quando `isPiiRevealed`, senão `undefined`; passar `onPiiExported` que registra auditoria `sensitive_data_revealed` via `useAddTestAuditLog`)
- Modify `src/components/export/exportToExcel.ts` (não usar `candidateIsAnonymous ? '-' : candidate.email`; herdar máscara da fonte: `candidate.email ?? '-'` / `candidate.phone ?? '-'`, pois a fonte já entrega `undefined` sem consentimento)
- Test: sem unit test (UI/export). Verificação = `npx tsc --noEmit 2>&1 | grep -E "CurriculumSections.tsx|ExportCandidateProfileModal.tsx|CandidateProfile.tsx|exportToExcel.ts"` vazio + `npm run build` + preview (gerar PDF/Excel sem e com consentimento).

**Interfaces**
- Consumes: `useAddTestAuditLog()` (mutation, payload `Omit<AuditLog,'id'|'timestamp'>` com `action: 'sensitive_data_revealed'`, `resourceType: 'consent'`, `resourceId`, `userId`, `userName`, `companyId`); `Candidate.email/phone` (`string | undefined`, já mascarados).
- Produces: `ExportCandidateProfileModal` ganha prop opcional `onPiiExported?: () => void`.

**Passos**

- [ ] Em `CurriculumSections.tsx`, fechar o fallback de PII na `PersonalInfoSection` (L22-23). Substituir:
```tsx
  const email = candidate.email ?? curriculum?.email;
  const phone = candidate.phone ?? curriculum?.phone;
```
por (usar somente o que o `candidate` mascarado entrega; nunca cair no currículo cru):
```tsx
  // LGPD: nunca derivar do currículo cru — a fonte (candidate) já vem mascarada.
  const email = candidate.email;
  const phone = candidate.phone;
```
(manter `city`/`state` lendo de `candidate ?? curriculum`, pois cidade/estado permanecem visíveis.)

- [ ] Em `ExportCandidateProfileModal.tsx`, tornar a seção `personalInfo` indisponível quando não houver PII. Substituir a entrada do array `SECTIONS` (L42):
```tsx
  { key: 'personalInfo',       label: 'Informações pessoais',         group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
```
por:
```tsx
  { key: 'personalInfo',       label: 'Informações pessoais',         group: 'base',    isAvailable: d => !!(d.candidate.email || d.candidate.phone),  unavailableHint: 'Liberado apenas após consentimento do candidato (LGPD)' },
```

- [ ] Em `ExportCandidateProfileModal.tsx`, adicionar a prop de auditoria na interface `Props` (L18-22):
```tsx
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PDFEmpresaData;
  onPiiExported?: () => void;
}
```

- [ ] Em `ExportCandidateProfileModal.tsx`, destructurar a prop nova (L72):
```tsx
export function ExportCandidateProfileModal({ open, onOpenChange, data, onPiiExported }: Props) {
```

- [ ] Em `ExportCandidateProfileModal.tsx`, dentro de `handleDownload`, após o `toast.success('PDF gerado', ...)` (L117) e antes de `onOpenChange(false)` (L118), disparar a auditoria quando o PDF realmente incluiu PII:
```tsx
      const exportedPii =
        sections.personalInfo && !!(data.candidate.email || data.candidate.phone);
      if (exportedPii) {
        onPiiExported?.();
      }
```

- [ ] Em `CandidateProfile.tsx`, no `exportData` (L562-572), injetar email/phone apenas quando revelado. Substituir o objeto `candidate: { ... }`:
```tsx
      candidate: {
        id: candidate.id,
        name: getCandidateDisplayName(candidate),
        email: isPiiRevealed ? candidate.email : undefined,
        phone: isPiiRevealed ? candidate.phone : undefined,
        avatar: candidate.avatar,
        city: candidate.city,
        state: candidate.state,
      },
```

- [ ] Em `CandidateProfile.tsx`, garantir que `isPiiRevealed` está na lista de dependências do `useMemo` de `exportData`. Adicionar `isPiiRevealed,` ao array de deps (L616-632, junto a `candidate,`).

- [ ] Em `CandidateProfile.tsx`, importar o hook de auditoria (junto aos imports de hooks, perto de L103 `import { useCandidateNotes } ...`):
```tsx
import { useAddTestAuditLog } from '@/hooks/useCompanyTestsQuery';
```

- [ ] Em `CandidateProfile.tsx`, instanciar o hook junto aos demais (após `const addNoteMutation = useAddApplicationNote();` L363):
```tsx
  const addAuditLog = useAddTestAuditLog();
```

- [ ] Em `CandidateProfile.tsx`, passar `onPiiExported` ao `ExportCandidateProfileModal` (L1905-1910). Substituir o JSX por:
```tsx
      {exportData && (
        <ExportCandidateProfileModal
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
          data={exportData}
          onPiiExported={() => {
            if (!currentCompany || !user) return;
            addAuditLog.mutate({
              action: 'sensitive_data_revealed',
              userId: user.id,
              userName: currentCompany.name ?? 'Empresa',
              resourceType: 'consent',
              resourceId: candidate.id,
              resourceName: getCandidateDisplayName(candidate),
              details: `PDF do dossiê exportado com dados pessoais (candidatura ${selectedApplication?.id ?? '—'})`,
              companyId: currentCompany.id,
            });
          }}
        />
      )}
```

- [ ] Em `exportToExcel.ts`, fechar o leak/`'-'` cosmético na `candidateToRow` (L115-116). Substituir:
```tsx
    row['email'] = candidateIsAnonymous ? '-' : candidate.email;
    row['phone'] = candidateIsAnonymous ? '-' : candidate.phone || '-';
```
por (a fonte já mascara: `undefined` sem consentimento → exportar `-`):
```tsx
    // LGPD: a fonte (candidates_for_company) já mascara PII sem consentimento.
    row['email'] = candidate.email ?? '-';
    row['phone'] = candidate.phone ?? '-';
```

- [ ] Verificar se `candidateIsAnonymous` ainda é usado em `candidateToRow` após a troca:
```bash
grep -n "candidateIsAnonymous" src/components/export/exportToExcel.ts
```
Se a única referência restante for a declaração `const candidateIsAnonymous = isAnonymous(candidate);` (L108), removê-la para não deixar variável morta (e remover o import `isAnonymous` se ele ficar sem uso — confirmar com grep `isAnonymous`).

- [ ] Rodar `npx tsc --noEmit 2>&1 | grep -E "CurriculumSections.tsx|ExportCandidateProfileModal.tsx|CandidateProfile.tsx|exportToExcel.ts"` e confirmar saída vazia.

- [ ] Rodar `npm run build` e confirmar compilação sem erro de import/sintaxe.

- [ ] Preview: na ficha de candidato **sem** consentimento, abrir "Exportar Perfil" → seção "Informações pessoais" aparece desabilitada com hint LGPD; gerar PDF → sem e-mail/telefone na seção pessoal; gerar Excel da lista → colunas Email/Telefone com "-". Com consentimento `accepted` → seção pessoal disponível, PDF traz e-mail/telefone, Excel traz os valores, e um evento `sensitive_data_revealed` (resource_type `consent`) é registrado ao baixar o PDF (verificável no LGPDReport / `test_audit_logs`).

- [ ] Commit:
```
feat(empresa): mask PII in PDF/Excel exports and audit reveals

Drop the curriculum email/phone fallback in the PDF personal-info
section, gate that section on consent, inherit the source mask in the
Excel export, and log a sensitive_data_revealed audit event
(resource_type=consent) whenever a dossier PDF is exported with PII.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```


## Seção G · UI candidato + termo (ConsentTermDialog)

> **Dependências de upstream (contratos consumidos — NÃO criados aqui):**
> - **C (tipos):** `src/types/consent.ts` → `DisclosureStatus`, `DataDisclosure`, `CONSENT_TERM_VERSION`; `Candidate.email`/`Candidate.location` já relaxados para `string | undefined`.
> - **C/helpers:** `src/lib/piiMask.ts` → `maskCpfPartial`, `maskIpPartial`; `src/lib/consentTerm.ts` → `computeTermHash`, `CONSENT_TERM_VERSION`, texto canônico do termo.
> - **E (hooks):** `src/hooks/useCandidateDisclosures.ts` → `useCandidateDisclosures(candidateId): { data: Record<string, DataDisclosure> }`; `src/hooks/useConsentDecision.ts` → `useConsentDecision()` retornando `{ accept, refuse, revoke }` (mutations). Confirmadas as assinaturas: `accept.mutateAsync({ applicationId, termVersion, termHash })`, `refuse.mutateAsync(applicationId)`, `revoke.mutateAsync(applicationId)`.
>
> Se um arquivo de upstream ainda não existir ao iniciar uma task G, ele será fornecido pela seção correspondente — não recriar. Cada task G abaixo só toca os arquivos listados em **Files**.

Reuso confirmado pela leitura do código real:
- `Footer` exige `companyName: string` e `generatedAt: string` (`src/components/empresa/pdf/sections/Footer.tsx`).
- `Header` aceita `companyName: string`, `companyLogo?: string | null`, `candidateName?: string` (`src/components/empresa/pdf/sections/Header.tsx`).
- `empresaStyles` + `empresaColors` em `src/components/empresa/pdf/styles.ts`.
- `Company.logo` (campo `logo`, **não** `logoUrl`) em `src/types/company.ts`.
- Pipeline `pdf(doc).toBlob()` + download via `URL.createObjectURL` em `ExportCandidateProfileModal.tsx`.
- `AuthContext` expõe `currentCandidate: Candidate | null` e `currentCompany: Company | null`.

---

### Task G1 — `ConsentTermDocument` (react-pdf) + helper de HTML imprimível

**Files**
- Create `src/components/consent/ConsentTermDocument.tsx` (componente react-pdf que renderiza o `<Document>` do termo)
- Create `src/components/consent/consentTermHtml.ts` (gera o HTML imprimível do mesmo termo + `printConsentTermHtml`)
- Test `src/components/consent/consentTermHtml.test.ts` (vitest — lógica pura de montagem do HTML/máscaras)

**Interfaces**
- Consumes: `DataDisclosure` (`@/types/consent`); `maskCpfPartial`, `maskIpPartial` (`@/lib/piiMask`); `CONSENT_TERM_VERSION` (`@/lib/consentTerm`); `Footer`, `Header`, `empresaStyles`, `empresaColors` (`@/components/empresa/pdf/...`).
- Produces:
  - `interface ConsentTermParties { candidateName: string; candidateCpf?: string; companyName: string; companyLogo?: string | null; jobTitle: string; operatorName: string }`
  - `interface ConsentTermData { disclosure: DataDisclosure; parties: ConsentTermParties }`
  - `function ConsentTermDocument(props: ConsentTermData): JSX.Element`
  - `function buildConsentTermHtml(data: ConsentTermData): string`
  - `function printConsentTermHtml(data: ConsentTermData): void`

**Passos**
- [ ] Escrever `src/components/consent/consentTermHtml.test.ts` cobrindo: (a) `buildConsentTermHtml` inclui `data-testid="term-version"` com `CONSENT_TERM_VERSION`; (b) quando `disclosure.acceptedAt` presente, o HTML contém a string `'Liberado em'` e o IP mascarado (`maskIpPartial`); (c) CPF aparece parcial via `maskCpfPartial` quando `candidateCpf` informado; (d) sem `acceptedAt`, o HTML contém `'Aguardando aceite'` e NÃO contém `'Liberado em'`.

```ts
// src/components/consent/consentTermHtml.test.ts
import { describe, it, expect } from 'vitest';
import { buildConsentTermHtml, type ConsentTermData } from './consentTermHtml';
import { CONSENT_TERM_VERSION } from '@/lib/consentTerm';

const base: ConsentTermData = {
  disclosure: {
    id: 'd1',
    applicationId: 'app1',
    candidateId: 'cand1',
    companyId: 'comp1',
    status: 'accepted',
    termVersion: CONSENT_TERM_VERSION,
    termHash: 'abc123hashvalue',
    acceptedAt: '2026-06-21T13:45:00.000Z',
    ip: '187.61.10.20',
    createdAt: '2026-06-20T10:00:00.000Z',
  } as ConsentTermData['disclosure'],
  parties: {
    candidateName: 'João Santos',
    candidateCpf: '093.740.429-24',
    companyName: 'Tech Solutions',
    companyLogo: null,
    jobTitle: 'Desenvolvedor Backend',
    operatorName: 'RecrutaRS',
  },
};

describe('buildConsentTermHtml', () => {
  it('inclui a versão do termo', () => {
    const html = buildConsentTermHtml(base);
    expect(html).toContain(`data-testid="term-version"`);
    expect(html).toContain(CONSENT_TERM_VERSION);
  });

  it('mascara o IP e mostra "Liberado em" quando aceito', () => {
    const html = buildConsentTermHtml(base);
    expect(html).toContain('187.61.xx.xx');
    expect(html).toContain('Liberado em');
  });

  it('mascara o CPF de forma parcial', () => {
    const html = buildConsentTermHtml(base);
    expect(html).toContain('***.740.429-**');
    expect(html).not.toContain('093.740.429-24');
  });

  it('mostra "Aguardando aceite" quando pendente', () => {
    const pending: ConsentTermData = {
      ...base,
      disclosure: { ...base.disclosure, status: 'pending', acceptedAt: undefined, ip: undefined },
    };
    const html = buildConsentTermHtml(pending);
    expect(html).toContain('Aguardando aceite');
    expect(html).not.toContain('Liberado em');
  });
});
```

- [ ] Rodar `npx vitest run src/components/consent/consentTermHtml.test.ts` e ver FALHAR (módulo inexistente).
- [ ] Implementar `src/components/consent/consentTermHtml.ts` (mínimo para passar):

```ts
// src/components/consent/consentTermHtml.ts
import { maskCpfPartial, maskIpPartial } from '@/lib/piiMask';
import { CONSENT_TERM_VERSION } from '@/lib/consentTerm';
import type { DataDisclosure } from '@/types/consent';

export interface ConsentTermParties {
  candidateName: string;
  candidateCpf?: string;
  companyName: string;
  companyLogo?: string | null;
  jobTitle: string;
  operatorName: string;
}

export interface ConsentTermData {
  disclosure: DataDisclosure;
  parties: ConsentTermParties;
}

const SHARED_DATA = ['CPF', 'E-mail', 'Telefone', 'Data de nascimento', 'Endereço'];

function formatDateBR(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

export function buildConsentTermHtml(data: ConsentTermData): string {
  const { disclosure, parties } = data;
  const accepted = disclosure.status === 'accepted' && !!disclosure.acceptedAt;
  const docNumber = `TC-${disclosure.id.slice(0, 8).toUpperCase()}`;
  const cpf = parties.candidateCpf ? maskCpfPartial(parties.candidateCpf) : '—';
  const ip = disclosure.ip ? maskIpPartial(disclosure.ip) : '—';
  const userAgent = disclosure.userAgent ?? '—';

  const auditBlock = accepted
    ? `
      <p><strong>Liberado em:</strong> ${escapeHtml(formatDateBR(disclosure.acceptedAt))}</p>
      <p><strong>IP de origem:</strong> ${escapeHtml(ip)}</p>
      <p><strong>Navegador:</strong> ${escapeHtml(userAgent)}</p>
    `
    : `<p><strong>Status:</strong> Aguardando aceite do titular.</p>`;

  const dataItems = SHARED_DATA.map((d) => `<li>${escapeHtml(d)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<title>Termo de Consentimento ${escapeHtml(docNumber)}</title>
<style>
  body { font-family: 'Roboto Mono', monospace; color: #1E293B; max-width: 720px; margin: 32px auto; padding: 0 24px; line-height: 1.6; }
  h1 { font-size: 20px; color: #0F172A; }
  h2 { font-size: 14px; color: #0F172A; border-bottom: 2px solid #06B6D4; padding-bottom: 4px; margin-top: 24px; }
  .muted { color: #64748B; font-size: 12px; }
  .badge { display: inline-block; background: #F1F5F9; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  @media print { body { margin: 0; } }
</style></head>
<body>
  <h1>Termo de Consentimento para Compartilhamento de Dados Pessoais</h1>
  <p class="muted">Documento nº <strong>${escapeHtml(docNumber)}</strong> ·
     Versão <span data-testid="term-version" class="badge">${escapeHtml(CONSENT_TERM_VERSION)}</span></p>

  <h2>1. Partes</h2>
  <p><strong>Titular dos dados:</strong> ${escapeHtml(parties.candidateName)} (CPF ${escapeHtml(cpf)})</p>
  <p><strong>Controladora:</strong> ${escapeHtml(parties.companyName)} — vaga "${escapeHtml(parties.jobTitle)}"</p>
  <p><strong>Operadora:</strong> ${escapeHtml(parties.operatorName)}</p>

  <h2>2. Objeto</h2>
  <p>Autorização para que a Controladora acesse os dados pessoais do Titular,
     no âmbito do processo seletivo da vaga indicada, após aprovação da candidatura.</p>

  <h2>3. Dados compartilhados</h2>
  <ul>${dataItems}</ul>

  <h2>4. Finalidade e base legal</h2>
  <p>Finalidade: condução do processo de contratação (contato, verificação de identidade e formalização).
     Base legal: consentimento do titular (Art. 7º, I, da Lei nº 13.709/2018 — LGPD).</p>

  <h2>5. Direitos do titular</h2>
  <p>O Titular pode revogar este consentimento a qualquer momento, hipótese em que os dados sensíveis
     voltam a ser ocultados para a Controladora. Artefatos já exportados (PDF/Excel) podem não ser
     recolhíveis. O Titular pode solicitar a impressão deste termo a qualquer tempo.</p>

  <h2>6. Auditoria do aceite</h2>
  ${auditBlock}
  <p><strong>Versão do termo:</strong> ${escapeHtml(disclosure.termVersion ?? CONSENT_TERM_VERSION)}</p>
  <p><strong>Hash do conteúdo (SHA-256):</strong> ${escapeHtml(disclosure.termHash ?? '—')}</p>

  <p class="muted">Gerado em ${escapeHtml(formatDateBR(new Date().toISOString()))}.</p>
</body></html>`;
}

export function printConsentTermHtml(data: ConsentTermData): void {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
  if (!win) return;
  win.document.open();
  win.document.write(buildConsentTermHtml(data));
  win.document.close();
  win.focus();
  win.print();
}
```

- [ ] Rodar `npx vitest run src/components/consent/consentTermHtml.test.ts` e ver PASSAR.
- [ ] Implementar `src/components/consent/ConsentTermDocument.tsx` (react-pdf, reusando `Header`/`Footer`/`empresaStyles`):

```tsx
// src/components/consent/ConsentTermDocument.tsx
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '@/components/empresa/pdf/styles';
import { Header } from '@/components/empresa/pdf/sections/Header';
import { Footer } from '@/components/empresa/pdf/sections/Footer';
import { maskCpfPartial, maskIpPartial } from '@/lib/piiMask';
import { CONSENT_TERM_VERSION } from '@/lib/consentTerm';
import type { ConsentTermData } from './consentTermHtml';

const SHARED_DATA = ['CPF', 'E-mail', 'Telefone', 'Data de nascimento', 'Endereço'];

function formatDateBR(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ConsentTermDocument({ disclosure, parties }: ConsentTermData) {
  const accepted = disclosure.status === 'accepted' && !!disclosure.acceptedAt;
  const docNumber = `TC-${disclosure.id.slice(0, 8).toUpperCase()}`;
  const cpf = parties.candidateCpf ? maskCpfPartial(parties.candidateCpf) : '—';
  const ip = disclosure.ip ? maskIpPartial(disclosure.ip) : '—';
  const generatedAt = new Date().toLocaleString('pt-BR');

  return (
    <Document
      title={`Termo de Consentimento ${docNumber}`}
      author={parties.operatorName}
      subject="Termo de Consentimento LGPD"
    >
      <Page size="A4" style={empresaStyles.page}>
        <Header
          companyName={parties.companyName}
          companyLogo={parties.companyLogo ?? null}
          candidateName={parties.candidateName}
        />

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.coverTitle}>Termo de Consentimento</Text>
          <Text style={empresaStyles.paragraph}>
            Documento nº {docNumber} · Versão {CONSENT_TERM_VERSION}
          </Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>1. Partes</Text>
          <Text style={empresaStyles.paragraph}>
            Titular dos dados: {parties.candidateName} (CPF {cpf})
          </Text>
          <Text style={empresaStyles.paragraph}>
            Controladora: {parties.companyName} — vaga "{parties.jobTitle}"
          </Text>
          <Text style={empresaStyles.paragraph}>Operadora: {parties.operatorName}</Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>2. Objeto</Text>
          <Text style={empresaStyles.paragraph}>
            Autorização para que a Controladora acesse os dados pessoais do Titular, no âmbito do
            processo seletivo da vaga indicada, após aprovação da candidatura.
          </Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>3. Dados compartilhados</Text>
          {SHARED_DATA.map((d) => (
            <Text key={d} style={empresaStyles.bullet}>• {d}</Text>
          ))}
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>4. Finalidade e base legal</Text>
          <Text style={empresaStyles.paragraph}>
            Finalidade: condução do processo de contratação (contato, verificação de identidade e
            formalização). Base legal: consentimento do titular (Art. 7º, I, da Lei nº 13.709/2018 —
            LGPD).
          </Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>5. Direitos do titular</Text>
          <Text style={empresaStyles.paragraph}>
            O Titular pode revogar este consentimento a qualquer momento, hipótese em que os dados
            sensíveis voltam a ser ocultados para a Controladora. Artefatos já exportados (PDF/Excel)
            podem não ser recolhíveis.
          </Text>
        </View>

        <View style={empresaStyles.sectionContainer}>
          <Text style={empresaStyles.sectionTitle}>6. Auditoria do aceite</Text>
          {accepted ? (
            <>
              <Text style={empresaStyles.paragraph}>
                Liberado em: {formatDateBR(disclosure.acceptedAt)}
              </Text>
              <Text style={empresaStyles.paragraph}>IP de origem: {ip}</Text>
              <Text style={empresaStyles.paragraph}>
                Navegador: {disclosure.userAgent ?? '—'}
              </Text>
            </>
          ) : (
            <Text style={{ ...empresaStyles.paragraph, color: empresaColors.warning }}>
              Status: Aguardando aceite do titular.
            </Text>
          )}
          <Text style={empresaStyles.paragraph}>
            Versão do termo: {disclosure.termVersion ?? CONSENT_TERM_VERSION}
          </Text>
          <Text style={empresaStyles.paragraph}>
            Hash do conteúdo (SHA-256): {disclosure.termHash ?? '—'}
          </Text>
        </View>

        <Footer companyName={parties.companyName} generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}
```

- [ ] Rodar `npx tsc --noEmit 2>&1 | grep "components/consent/ConsentTermDocument"` e ver VAZIO.
- [ ] Rodar `npx tsc --noEmit 2>&1 | grep "components/consent/consentTermHtml"` e ver VAZIO.
- [ ] Rodar `npm run build` e confirmar sem erro de import/sintaxe.
- [ ] Commit: `feat(consent): add ConsentTermDocument (react-pdf) and printable HTML term`

> Nota de tipo: `disclosure.userAgent` é lido acima. Se `DataDisclosure` (seção C) **não** expuser `userAgent` opcional, trocar `disclosure.userAgent ?? '—'` por `'—'` em ambos os arquivos antes do commit (o contrato em §TIPOS não lista `userAgent` na interface; o `'—'` fixo é o fallback seguro). Decisão default: usar `'—'` fixo se o campo não existir no tipo.

---

### Task G2 — `ConsentTermDialog` reutilizável (candidato + empresa)

**Files**
- Create `src/components/consent/ConsentTermDialog.tsx`

**Interfaces**
- Consumes: `DataDisclosure` (`@/types/consent`); `ConsentTermDocument`, `printConsentTermHtml`, `ConsentTermParties` (`./ConsentTermDocument` / `./consentTermHtml`); `pdf` (`@react-pdf/renderer`); `Dialog*` (`@/components/ui/dialog`); `Button`; `toast` (`sonner`).
- Produces:
  - `interface ConsentTermDialogProps { open: boolean; onOpenChange: (open: boolean) => void; disclosure: DataDisclosure; parties: ConsentTermParties }`
  - `function ConsentTermDialog(props: ConsentTermDialogProps): JSX.Element`

**Passos**
- [ ] Implementar `src/components/consent/ConsentTermDialog.tsx` (sem unit test — verificação por tsc/build/preview):

```tsx
// src/components/consent/ConsentTermDialog.tsx
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileDown, Printer, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { maskCpfPartial, maskIpPartial } from '@/lib/piiMask';
import { CONSENT_TERM_VERSION } from '@/lib/consentTerm';
import { ConsentTermDocument } from './ConsentTermDocument';
import { printConsentTermHtml, type ConsentTermParties } from './consentTermHtml';
import type { DataDisclosure } from '@/types/consent';

export interface ConsentTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disclosure: DataDisclosure;
  parties: ConsentTermParties;
}

function formatDateBR(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ConsentTermDialog({
  open,
  onOpenChange,
  disclosure,
  parties,
}: ConsentTermDialogProps) {
  const [generating, setGenerating] = useState(false);
  const accepted = disclosure.status === 'accepted' && !!disclosure.acceptedAt;
  const docNumber = `TC-${disclosure.id.slice(0, 8).toUpperCase()}`;
  const data = { disclosure, parties };

  const handlePrint = () => {
    printConsentTermHtml(data);
  };

  const handleDownloadPdf = async () => {
    setGenerating(true);
    try {
      const blob = await pdf(<ConsentTermDocument disclosure={disclosure} parties={parties} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Termo_Consentimento_${docNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Termo gerado', { description: `Arquivo Termo_Consentimento_${docNumber}.pdf baixado.` });
    } catch (e) {
      console.error('Erro ao gerar termo:', e);
      toast.error('Erro ao gerar o termo', { description: 'Tente novamente em alguns instantes.' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Termo de Consentimento
          </DialogTitle>
          <DialogDescription>
            Documento nº {docNumber} · Versão {CONSENT_TERM_VERSION}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div>
            <p className="font-medium text-foreground">Partes</p>
            <p className="text-muted-foreground">
              Titular: {parties.candidateName}
              {parties.candidateCpf ? ` (CPF ${maskCpfPartial(parties.candidateCpf)})` : ''}
            </p>
            <p className="text-muted-foreground">
              Controladora: {parties.companyName} — vaga "{parties.jobTitle}"
            </p>
            <p className="text-muted-foreground">Operadora: {parties.operatorName}</p>
          </div>

          <Separator />

          <div>
            <p className="font-medium text-foreground">Dados compartilhados</p>
            <p className="text-muted-foreground">
              CPF, e-mail, telefone, data de nascimento e endereço.
            </p>
          </div>

          <Separator />

          <div>
            <p className="font-medium text-foreground">Base legal</p>
            <p className="text-muted-foreground">
              Consentimento do titular — Art. 7º, I, da Lei nº 13.709/2018 (LGPD).
            </p>
          </div>

          <Separator />

          <div>
            <p className="font-medium text-foreground">Auditoria</p>
            {accepted ? (
              <>
                <p className="text-muted-foreground">Liberado em: {formatDateBR(disclosure.acceptedAt)}</p>
                <p className="text-muted-foreground">
                  IP de origem: {disclosure.ip ? maskIpPartial(disclosure.ip) : '—'}
                </p>
              </>
            ) : (
              <p className="text-warning">Aguardando aceite do titular.</p>
            )}
            <p className="text-muted-foreground break-all">
              Hash (SHA-256): {disclosure.termHash ?? '—'}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownloadPdf} disabled={generating}>
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando…</>
            ) : (
              <><FileDown className="h-4 w-4 mr-2" /> Baixar PDF</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] Rodar `npx tsc --noEmit 2>&1 | grep "components/consent/ConsentTermDialog"` e ver VAZIO.
- [ ] Rodar `npm run build` e confirmar sem erro de import/sintaxe.
- [ ] Commit: `feat(consent): add reusable ConsentTermDialog for candidate and company`

---

### Task G3 — Modal de aceite/recusa/revogação em `/candidato/candidaturas`

**Files**
- Modify `src/pages/candidato/Applications.tsx` (cards L173-232; reaproveitar estrutura visual; adicionar Dialog de decisão + botões nos cards `offer`/decididos; usar `ConsentTermDialog`)

**Interfaces**
- Consumes:
  - `useCandidateDisclosures(candidateId): { data: Record<string, DataDisclosure> }` (`@/hooks/useCandidateDisclosures`)
  - `useConsentDecision(): { accept, refuse, revoke }` (`@/hooks/useConsentDecision`) — `accept.mutateAsync({ applicationId, termVersion, termHash })`, `refuse.mutateAsync(applicationId)`, `revoke.mutateAsync(applicationId)`
  - `computeTermHash(text: string): Promise<string>`, `CONSENT_TERM_VERSION`, texto canônico do termo (`@/lib/consentTerm`)
  - `ConsentTermDialog` (`@/components/consent/ConsentTermDialog`)
  - `DataDisclosure`, `DisclosureStatus` (`@/types/consent`)
  - `currentCandidate` (`useAuth`)
- Produces: nenhuma exportação nova (alterações internas da página).

> Premissa de contrato `consentTerm.ts` (seção C): o texto canônico é exportado como `CONSENT_TERM_TEXT` (string). Se a seção C nomear diferente, ajustar o import nesta única linha antes do commit. O hash é calculado sobre esse texto canônico (não sobre o HTML renderizado), garantindo determinismo do `term_hash`.

**Passos**
- [ ] Importar os novos símbolos no topo de `src/pages/candidato/Applications.tsx`:

```tsx
import { useConsentDecision } from '@/hooks/useConsentDecision';
import { useCandidateDisclosures } from '@/hooks/useCandidateDisclosures';
import { ConsentTermDialog } from '@/components/consent/ConsentTermDialog';
import { computeTermHash, CONSENT_TERM_VERSION, CONSENT_TERM_TEXT } from '@/lib/consentTerm';
import type { ConsentTermParties } from '@/components/consent/consentTermHtml';
import { ShieldCheck, ShieldOff, FileText } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
```

- [ ] Dentro de `CandidateApplications`, após `const { applications, isLoading, cancelApplication } = useApplications(candidateId);`, adicionar estado e hooks de consentimento:

```tsx
  const { data: disclosures = {} } = useCandidateDisclosures(candidateId);
  const { accept, refuse, revoke } = useConsentDecision();

  const [consentAppId, setConsentAppId] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [revokeAppId, setRevokeAppId] = useState<string | null>(null);
  const [termAppId, setTermAppId] = useState<string | null>(null);

  const selectedApp = applications.find(a => a.id === consentAppId) ?? null;
  const revokeApp = applications.find(a => a.id === revokeAppId) ?? null;
  const termApp = applications.find(a => a.id === termAppId) ?? null;
  const termDisclosure = termAppId ? disclosures[termAppId] : undefined;

  const buildParties = (appId: string): ConsentTermParties => {
    const app = applications.find(a => a.id === appId);
    return {
      candidateName: currentCandidate?.name ?? app?.candidateName ?? 'Candidato',
      candidateCpf: currentCandidate?.cpf,
      companyName: app?.companyName ?? '',
      companyLogo: null,
      jobTitle: app?.jobTitle ?? '',
      operatorName: 'RecrutaRS',
    };
  };

  const openConsentModal = (appId: string) => {
    setConsentAppId(appId);
    setConsentChecked(false);
  };

  const handleAccept = async () => {
    if (!consentAppId || !consentChecked) return;
    try {
      const termHash = await computeTermHash(CONSENT_TERM_TEXT);
      await accept.mutateAsync({
        applicationId: consentAppId,
        termVersion: CONSENT_TERM_VERSION,
        termHash,
      });
      toast.success('Compartilhamento autorizado');
      setConsentAppId(null);
    } catch {
      toast.error('Não foi possível registrar o consentimento. Tente novamente.');
    }
  };

  const handleRefuse = async () => {
    if (!consentAppId) return;
    try {
      await refuse.mutateAsync(consentAppId);
      toast.success('Você optou por não compartilhar agora');
      setConsentAppId(null);
    } catch {
      toast.error('Não foi possível registrar a recusa. Tente novamente.');
    }
  };

  const handleRevoke = async () => {
    if (!revokeAppId) return;
    try {
      await revoke.mutateAsync(revokeAppId);
      toast.success('Consentimento revogado. Os dados foram novamente ocultados.');
      setRevokeAppId(null);
    } catch {
      toast.error('Não foi possível revogar o consentimento. Tente novamente.');
    }
  };
```

- [ ] No corpo do card (logo após o bloco existente `{canCancel(app.status) && ( ... )}`, ainda dentro da `<div className="flex flex-wrap gap-3 ...">`), inserir as ações de consentimento dirigidas pelo `disclosures[app.id]`:

```tsx
                  {disclosures[app.id]?.status === 'pending' && app.status === 'offer' && (
                    <Button
                      size="sm"
                      className="gradient-primary"
                      onClick={() => openConsentModal(app.id)}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Revisar compartilhamento
                    </Button>
                  )}
                  {disclosures[app.id]?.status === 'accepted' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTermAppId(app.id)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver termo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRevokeAppId(app.id)}
                      >
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Revogar autorização
                      </Button>
                    </>
                  )}
                  {disclosures[app.id]?.status === 'refused' && app.status === 'offer' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConsentModal(app.id)}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Autorizar compartilhamento
                    </Button>
                  )}
```

- [ ] Antes do `</DashboardLayout>` de fechamento (após o `AlertDialog` de cancelamento existente), adicionar o modal de decisão, o `AlertDialog` de revogação e o `ConsentTermDialog`:

```tsx
      {/* Modal de decisão de consentimento (aceitar/recusar) */}
      <Dialog open={!!consentAppId} onOpenChange={(o) => !o && setConsentAppId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Você foi aprovado!
            </DialogTitle>
            <DialogDescription>
              {selectedApp
                ? `${selectedApp.companyName} aprovou sua candidatura para "${selectedApp.jobTitle}". Para prosseguir, autorize o compartilhamento dos seus dados de contato.`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Dados que serão compartilhados</p>
              <ul className="space-y-1 text-muted-foreground">
                {['CPF', 'E-mail', 'Telefone', 'Data de nascimento', 'Endereço'].map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-foreground">Finalidade</p>
              <p className="text-muted-foreground">
                Permitir que a empresa entre em contato e formalize sua contratação. Base legal:
                consentimento (Art. 7º, I, da LGPD).
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-foreground">Seus direitos</p>
              <p className="text-muted-foreground">
                Você pode revogar esta autorização a qualquer momento — os dados voltam a ficar
                ocultos. O termo fica disponível para impressão e download.
              </p>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="consent-acknowledge"
                checked={consentChecked}
                onCheckedChange={(c) => setConsentChecked(c === true)}
              />
              <Label htmlFor="consent-acknowledge" className="text-sm leading-snug cursor-pointer">
                Li e autorizo o compartilhamento dos meus dados pessoais com a empresa para fins de
                contratação.
              </Label>
            </div>

            <p className="text-xs text-muted-foreground">
              O aceite é registrado com data, hora, IP e versão do termo para auditoria.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={handleRefuse}
              disabled={refuse.isPending || accept.isPending}
            >
              Agora não
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!consentChecked || accept.isPending || refuse.isPending}
            >
              {accept.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registrando…</>
              ) : (
                'Autorizar e compartilhar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de revogação */}
      <AlertDialog open={!!revokeAppId} onOpenChange={(o) => !o && setRevokeAppId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar autorização?</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeApp
                ? `Seus dados de contato voltarão a ficar ocultos para ${revokeApp.companyName}. A empresa será notificada. Artefatos já baixados podem não ser recolhíveis.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar revogação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Termo de consentimento */}
      {termApp && termDisclosure && (
        <ConsentTermDialog
          open={!!termAppId}
          onOpenChange={(o) => !o && setTermAppId(null)}
          disclosure={termDisclosure}
          parties={buildParties(termApp.id)}
        />
      )}
```

- [ ] Rodar `npx tsc --noEmit 2>&1 | grep "pages/candidato/Applications"` e ver VAZIO.
- [ ] Rodar `npm run build` e confirmar sem erro de import/sintaxe.
- [ ] Preview: na rota `/candidato/candidaturas`, com uma candidatura em `offer` + disclosure `pending`, confirmar: botão "Revisar compartilhamento" abre o modal; checkbox obrigatório habilita "Autorizar e compartilhar"; "Agora não" registra recusa; após aceite, surgem "Ver termo" (abre `ConsentTermDialog` com imprimir/baixar) e "Revogar autorização" (AlertDialog → revoga). Validar acentos pt-BR nos textos.
- [ ] Commit: `feat(consent): add candidate accept/refuse/revoke flow in My Applications`


## Task H1 — Labels e ícones pt-BR das 3 ações de consentimento em auditLog.ts

**Files**
- Modify `src/utils/auditLog.ts:9-40` (Record `labels` de `getActionLabel`)
- Modify `src/utils/auditLog.ts:45-76` (Record `icons` de `getActionIcon`)
- Modify `src/utils/auditLog.ts:81-96` (Partial Record `colors` de `getActionColor`)

**Interfaces**
- Consumes: `AuditAction` (de `@/types/companyTest`) — já estendido na Seção C com `'consent_granted' | 'consent_revoked' | 'sensitive_data_revealed'`.
- Produces: nenhum símbolo novo; apenas completa os `Record<AuditAction, string>` para manter exaustividade de tipo.

> Sem unit test: a verificação de exaustividade dos `Record<AuditAction, ...>` é feita pelo compilador. O baseline tem erros de tipo pré-existentes NÃO relacionados; portanto a prova é `npx tsc --noEmit 2>&1 | grep auditLog` retornar **vazio** (sua mudança não introduz erro novo nesse arquivo), não `tsc` global limpo.

- [ ] Confirmar que a Seção C já estendeu o union: `npx tsc --noEmit 2>&1 | grep auditLog` — se acusar `Property 'consent_granted' is missing in type` nos Records de `auditLog.ts`, é exatamente o erro que este task fecha (esperado ANTES da edição).
- [ ] Adicionar as 3 entradas ao Record `labels` em `getActionLabel`, logo após `lgpd_report_generated: 'Relatorio LGPD gerado',` (linha 39). Inserir:
```ts
    consent_granted: 'Consentimento concedido',
    consent_revoked: 'Consentimento revogado',
    sensitive_data_revealed: 'Dados sensíveis revelados',
```
- [ ] Adicionar as 3 entradas ao Record `icons` em `getActionIcon`, logo após `lgpd_report_generated: 'Shield',` (linha 75). Inserir (nomes de ícones lucide-react válidos):
```ts
    consent_granted: 'ShieldCheck',
    consent_revoked: 'ShieldOff',
    sensitive_data_revealed: 'Eye',
```
- [ ] Adicionar as 3 entradas ao Partial Record `colors` em `getActionColor`, logo após `retest_triggered: 'text-indigo-500',` (linha 94). Inserir:
```ts
    consent_granted: 'text-green-600',
    consent_revoked: 'text-red-600',
    sensitive_data_revealed: 'text-amber-600',
```
- [ ] Rodar `npx tsc --noEmit 2>&1 | grep auditLog` — deve vir **VAZIO** (exaustividade dos Records satisfeita; nenhum erro novo introduzido).
- [ ] Rodar `npm run lint` e confirmar que `src/utils/auditLog.ts` não acusa novos erros.
- [ ] Commit: `feat(audit): add pt-BR labels and icons for consent audit actions` (mensagem termina com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).

---

## Task H2 — Ligar o botão "Exportar" do LGPDReport ao pipeline PDF

**Files**
- Modify `src/components/corporate-tests/LGPDReport.tsx:14` (import de ícones), `:21-49` (corpo do componente + handler de export), `:87-94` (botão Exportar stub)
- Create `src/components/corporate-tests/LGPDReportPdf.tsx` (documento react-pdf reaproveitando `Footer` + `empresaStyles`)

**Interfaces**
- Consumes:
  - `Footer` de `src/components/empresa/pdf/sections/Footer.tsx` — assinatura **obrigatória** `({ companyName: string; generatedAt: string })` (confirmado no arquivo: linhas 5-8 `interface FooterProps { companyName: string; generatedAt: string }`).
  - `empresaStyles` de `src/components/empresa/pdf/styles.ts`.
  - `useAuth()` → `currentCompany` cujo tipo `Company` tem o campo **`logo`** (NÃO `logoUrl`); usar `currentCompany?.logo ?? null`.
  - `getActionLabel` de `@/utils/auditLog`.
  - `AuditLog` de `@/types/companyTest` (campos reais: `action`, `userName`, `details?`, `timestamp`, `resourceName?`).
  - `pdf` de `@react-pdf/renderer` (geração de Blob).
- Produces: `LGPDReportPdf` (componente `<Document>` react-pdf) e o handler `handleExport` interno.

> A regeneração de PDF não tem unit test puro: a verificação é `npm run build` (pegar import/sintaxe/JSX quebrado), `npx tsc --noEmit 2>&1 | grep LGPDReport` **vazio** (sem novo erro de tipo nos 2 arquivos), e preview manual (clicar "Exportar" baixa um PDF). NÃO usar `npm run build` como prova de tipos.

- [ ] Criar `src/components/corporate-tests/LGPDReportPdf.tsx` com o documento completo (CÓDIGO COMPLETO):
```tsx
// src/components/corporate-tests/LGPDReportPdf.tsx
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '@/components/empresa/pdf/styles';
import { Footer } from '@/components/empresa/pdf/sections/Footer';
import { getActionLabel } from '@/utils/auditLog';
import type { AuditLog } from '@/types/companyTest';

interface LGPDReportPdfProps {
  companyName: string;
  companyLogo: string | null;
  candidateName: string;
  logs: AuditLog[];
  generatedAt: string;
}

export function LGPDReportPdf({
  companyName,
  companyLogo,
  candidateName,
  logs,
  generatedAt,
}: LGPDReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={empresaStyles.page}>
        <View style={{ marginBottom: 16 }}>
          {companyLogo ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
              {companyName}
            </Text>
          ) : (
            <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
              {companyName}
            </Text>
          )}
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>
            Relatório de Conformidade LGPD
          </Text>
          <Text style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>
            Candidato consultado: {candidateName}
          </Text>
          <Text style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
            {logs.length} registro(s) de acesso a dados
          </Text>
        </View>

        <View style={{ borderTop: '1pt solid #e2e8f0', paddingTop: 8 }}>
          {logs.length === 0 ? (
            <Text style={{ fontSize: 10, color: '#64748b' }}>
              Nenhum registro encontrado.
            </Text>
          ) : (
            logs.map((log) => (
              <View
                key={log.id}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 6,
                  borderBottom: '0.5pt solid #f1f5f9',
                }}
              >
                <Text style={{ width: '28%', fontSize: 9, color: '#475569' }}>
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </Text>
                <Text style={{ width: '24%', fontSize: 9, color: '#0f172a' }}>
                  {getActionLabel(log.action)}
                </Text>
                <Text style={{ width: '22%', fontSize: 9, color: '#334155' }}>
                  {log.userName || '—'}
                </Text>
                <Text style={{ width: '26%', fontSize: 9, color: '#64748b' }}>
                  {log.details || '—'}
                </Text>
              </View>
            ))
          )}
        </View>

        <Footer companyName={companyName} generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}
```
- [ ] Em `src/components/corporate-tests/LGPDReport.tsx`, ampliar o import de ícones lucide na linha 14 para incluir o que precisar e importar o helper de PDF. Adicionar abaixo dos imports existentes (após linha 19):
```tsx
import { pdf } from '@react-pdf/renderer';
import { LGPDReportPdf } from './LGPDReportPdf';
```
- [ ] No corpo do componente `LGPDReport` (logo após `const [searched, setSearched] = useState(false);`, linha 28), adicionar o handler de exportação (CÓDIGO COMPLETO):
```tsx
  const handleExport = async () => {
    try {
      const blob = await pdf(
        <LGPDReportPdf
          companyName={currentCompany?.name ?? 'Empresa'}
          companyLogo={currentCompany?.logo ?? null}
          candidateName={candidateName}
          logs={results}
          generatedAt={new Date().toLocaleString('pt-BR')}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-lgpd-${candidateName.trim().replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addAuditLogMutation.mutate({
        action: 'lgpd_report_generated',
        userId: user?.id ?? '',
        userName: user?.user_metadata?.full_name ?? '',
        resourceType: 'result',
        resourceId: candidateName,
        resourceName: candidateName,
        details: 'Exportação PDF do relatório LGPD',
        companyId: currentCompany?.id ?? '',
      });

      toast({ title: 'Relatório exportado', description: 'O PDF foi baixado com sucesso.' });
    } catch {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível gerar o PDF. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
```
- [ ] Substituir o `onClick` stub do botão Exportar (linhas 88-90) ligando ao handler. Trocar:
```tsx
                <Button variant="outline" size="sm" onClick={() => {
                  toast({ title: 'Em desenvolvimento', description: 'Exportação LGPD será implementada.' });
                }}>
```
por:
```tsx
                <Button variant="outline" size="sm" onClick={handleExport} disabled={addAuditLogMutation.isPending}>
```
- [ ] Rodar `npx tsc --noEmit 2>&1 | grep LGPDReport` — deve vir **VAZIO** (sem novo erro de tipo em `LGPDReport.tsx` nem `LGPDReportPdf.tsx`).
- [ ] Rodar `npm run build` — deve compilar sem erro de import/sintaxe/JSX nos dois arquivos novos/alterados.
- [ ] Preview: abrir o card "Relatório de Conformidade LGPD", consultar um candidato com registros e clicar "Exportar"; confirmar download de `relatorio-lgpd-*.pdf` com Footer (nome da empresa + "Gerado em") e linhas de auditoria.
- [ ] Commit: `feat(lgpd): wire LGPD report export button to react-pdf pipeline` (termina com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).

---

## Task H3 — Verificação adversarial RLS (§13) + checklist de regressão

**Files**
- Test (SQL adversarial via Supabase MCP `execute_sql`, autenticando como papel de empresa) + verificação manual de UI. Nenhum arquivo de código alterado.

**Interfaces**
- Consumes (devem existir das seções anteriores):
  - Views `public.candidates_for_company`, `public.curriculums_for_company` (mascaram cpf/email/phone/date_of_birth via `company_has_data_consent`).
  - Função `public.company_has_data_consent(p_company_id uuid, p_candidate_id uuid) returns boolean`.
  - Tabela `public.candidate_data_disclosures` (status `pending|accepted|refused|revoked`, unique `(application_id, company_id)`).
  - Triggers `public.enforce_hire_consent()` (BEFORE UPDATE) e `public.create_disclosure_on_offer()` (AFTER UPDATE) em `applications`.
  - DROP das policies `candidates_select_company` e `curriculums_select_company`.
- Produces: relatório de aprovação/reprovação (esta é a task FINAL de gate da seção; reporta no resumo final do agente, não cria .md).

> Toda query roda autenticada como uma EMPRESA real. Use credenciais de dev (`rh@techsolutions.com` / `Company@123`). Onde for preciso, descubra `company_id` via `select get_company_id(auth.uid())`. Onde a query precisar de um candidato específico, escolha um candidato com candidatura na empresa e SEM disclosure `accepted` (controle negativo) e um COM disclosure `accepted` (controle positivo). Substitua `<CAND_NO_CONSENT>`, `<CAND_WITH_CONSENT>`, `<COMPANY_A_ID>`, `<COMPANY_B_ID>`, `<APP_ID>` pelos UUIDs reais antes de rodar.

### H3.1 — Empresa SEM consentimento não lê PII direto na base
- [ ] (Esperado: ERRO de permissão OU 0 colunas sensíveis, pois a policy `candidates_select_company` foi dropada) Rodar como empresa:
```sql
-- Acesso DIRETO à base deve falhar/retornar vazio para a empresa (policy dropada).
select id, name, cpf, email, phone, date_of_birth
from public.candidates
where id = '<CAND_NO_CONSENT>';
```
  **Resultado esperado:** 0 linhas (RLS da base não concede mais SELECT direto à empresa). Se retornar a linha com cpf/email/phone preenchidos → **REPROVA**.
- [ ] (Esperado: linha com `name`/`city`/`state` presentes, mas `cpf`/`email`/`phone`/`date_of_birth` = NULL) Rodar como empresa pela VIEW:
```sql
select id, name, city, state, cpf, email, phone, date_of_birth
from public.candidates_for_company
where id = '<CAND_NO_CONSENT>';
```
  **Resultado esperado:** 1 linha; `name`, `city`, `state` NÃO nulos; `cpf`, `email`, `phone`, `date_of_birth` **todos NULL**. Qualquer PII não-nula → **REPROVA**.

### H3.2 — Currículo SEM consentimento oculta email/phone
- [ ] Rodar como empresa pela view de currículos:
```sql
select c.id, c.candidate_id, c.email, c.phone
from public.curriculums_for_company c
where c.candidate_id = '<CAND_NO_CONSENT>';
```
  **Resultado esperado:** `email` e `phone` **NULL** (mascarados). Se preenchidos → **REPROVA**.
- [ ] Acesso direto à base de currículos deve falhar/retornar vazio:
```sql
select id, candidate_id, email, phone
from public.curriculums
where candidate_id = '<CAND_NO_CONSENT>';
```
  **Resultado esperado:** 0 linhas (policy `curriculums_select_company` dropada).

### H3.3 — Consentimento `accepted` revela
- [ ] Confirmar disclosure aceito existe:
```sql
select status from public.candidate_data_disclosures
where candidate_id = '<CAND_WITH_CONSENT>' and company_id = get_company_id(auth.uid());
-- esperado: 'accepted'
```
- [ ] Ler pela view e confirmar PII revelada:
```sql
select id, name, cpf, email, phone, date_of_birth
from public.candidates_for_company
where id = '<CAND_WITH_CONSENT>';
```
  **Resultado esperado:** `cpf`, `email`, `phone`, `date_of_birth` **preenchidos** (não nulos). Se nulos com disclosure `accepted` → **REPROVA**.
- [ ] Validar a função diretamente:
```sql
select public.company_has_data_consent(get_company_id(auth.uid()), '<CAND_WITH_CONSENT>') as has_consent,
       public.company_has_data_consent(get_company_id(auth.uid()), '<CAND_NO_CONSENT>') as no_consent;
-- esperado: has_consent = true, no_consent = false
```

### H3.4 — Cross-vaga: empresa B não vê o que foi liberado para empresa A
- [ ] Autenticar como **empresa B** (que NÃO tem disclosure accepted para `<CAND_WITH_CONSENT>`, liberado só para empresa A) e rodar:
```sql
select id, name, cpf, email, phone, date_of_birth
from public.candidates_for_company
where id = '<CAND_WITH_CONSENT>';
```
  **Resultado esperado:** se `<CAND_WITH_CONSENT>` é candidato/visível para B, PII = **NULL**; se não é visível para B, **0 linhas**. PII preenchida para B → **REPROVA** (vazamento cross-empresa).

### H3.5 — UPDATE → 'hired' sem disclosure accepted é rejeitado pelo trigger
- [ ] Escolher uma `application_id` sem disclosure `accepted` e tentar promover a `hired`:
```sql
update public.applications set status = 'hired' where id = '<APP_ID>';
```
  **Resultado esperado:** **EXCEPTION** lançada por `enforce_hire_consent()` (mensagem de consentimento ausente). Se o UPDATE passar → **REPROVA**.
- [ ] (Controle positivo) Inserir/garantir disclosure `accepted` para essa application+company e repetir o UPDATE → deve **passar**. Reverter o status depois (`update ... set status='offer' where id='<APP_ID>'`).

### H3.6 — Embeds (applications/conversations JOIN candidates) nunca trazem colunas sensíveis
- [ ] Como empresa, simular o embed PostgREST de `APPLICATION_SELECT` (apenas colunas não sensíveis devem vir, e como a policy base foi dropada o embed de `candidates` retorna NULL):
```sql
select a.id, a.status,
       (select row_to_json(x) from (
          select cand.name, cand.cpf, cand.email, cand.phone
          from public.candidates cand where cand.id = a.candidate_id
       ) x) as embedded_candidate
from public.applications a
join public.jobs j on j.id = a.job_id
where j.company_id = get_company_id(auth.uid())
limit 5;
```
  **Resultado esperado:** `embedded_candidate` = NULL (RLS base bloqueia) — confirma que o embed direto NÃO vaza PII. O nome do candidato NÃO virá deste embed; deve ser populado no cliente via `useCandidates`/view (validado em H3.8). PII presente no embed → **REPROVA**.

### H3.7 — Revogação volta a ocultar e registra `consent_revoked`
- [ ] Revogar (via Edge Function `manage-data-consent` action `revoke`, ou para teste de RLS, setar `status='revoked'` no disclosure) e reler a view:
```sql
select cpf, email, phone, date_of_birth
from public.candidates_for_company
where id = '<CAND_WITH_CONSENT>';
-- esperado: todos NULL novamente
```
- [ ] Confirmar evento de auditoria:
```sql
select action, resource_type, created_at
from public.test_audit_logs
where resource_type = 'consent' and action = 'consent_revoked'
order by created_at desc limit 1;
-- esperado: 1 linha recente; resource_type SEMPRE 'consent' (nunca 'data_disclosure'/'result')
```

### H3.8 — CHECKLIST DE REGRESSÃO (UI, preview manual obrigatório)
- [ ] **Nome no Kanban:** abrir `pages/empresa/Applications.tsx` (Kanban). Confirmar que o NOME do candidato AINDA aparece em cada card (populado no cliente a partir de `useCandidates`/`candidates_for_company`, já que o embed `candidates(name)` foi removido do `APPLICATION_SELECT`). Nome ausente/vazio → **REPROVA**.
- [ ] **Nome em Mensagens:** abrir a lista de conversas da empresa (`pages/empresa/Messages*`). Confirmar que o nome do candidato aparece em cada conversa (populado no cliente; embed `candidates(name)` removido de `CONVERSATION_SELECT`). Nome ausente → **REPROVA**.
- [ ] **Currículo na ficha:** abrir `CandidateProfile.tsx` (empresa) de um candidato SEM consentimento. Confirmar que o BLOCO de currículo (experiências, formação, skills, cursos) AINDA renderiza via `getProfileForCompany`; apenas email/phone aparecem como placeholder com cadeado. Currículo sumido/vazio → **REPROVA**.
- [ ] **PDF sem PII sem aceite:** exportar o PDF/dossiê da ficha de um candidato SEM consentimento. Confirmar que a seção `personalInfo` NÃO contém cpf/email/phone/data de nascimento. PII presente sem aceite → **REPROVA**.
- [ ] **Excel sem PII sem aceite:** exportar Excel da ficha do mesmo candidato. Confirmar ausência de cpf/email/phone. PII presente → **REPROVA**.
- [ ] **Com aceite + auditoria:** para um candidato COM disclosure `accepted`, exportar PDF/Excel; confirmar PII presente E que foi registrado `sensitive_data_revealed` (`resource_type='consent'`):
```sql
select action, resource_type from public.test_audit_logs
where action = 'sensitive_data_revealed' and resource_type = 'consent'
order by created_at desc limit 1;
-- esperado: 1 linha recente
```
- [ ] **Gate de Contratar:** em `Applications.tsx`/`HiringModal.tsx`, confirmar que o botão "Contratar" fica desabilitado com texto "Aguardando consentimento" quando `useConsentStatus` ≠ `accepted`, e habilitado quando `accepted`.
- [ ] Reportar no resumo final do agente: lista de cada item H3.x com PASSA/REPROVA e os UUIDs usados. Se qualquer item REPROVAR, NÃO marcar a entrega como concluída — sinalizar a seção responsável (B2 para views/policies, C para tipos, D/E para serviços/embeds, F/G para UI).
- [ ] Commit (somente se houver artefatos de verificação versionados; caso contrário pular): `test(lgpd): document adversarial RLS verification results` (termina com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).

