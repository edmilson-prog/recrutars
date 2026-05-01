# Match Calculator: skills padronizadas + pesos por vaga

> **Data:** 2026-04-29
> **Status:** Spec aprovado, pronto para `writing-plans`
> **Autoria:** sessão de brainstorming entre Edmilson + Claude
> **Decisão de escopo:** spec único, plano dividido em 3 etapas sequenciais (A → B → C)

---

## 1. Contexto

### 1.1 Sintoma observado

Auditoria empírica em 20 candidaturas reais ([scripts/match-audit.ts](../../scripts/match-audit.ts), [scripts/match-audit-std.ts](../../scripts/match-audit-std.ts)) mostrou:

```
Skills:       0-19=4   20-39=16  40-100=0   ← TODOS abaixo de 40%
Comportamental: SEMPRE 20 (nenhum candidato fez teste)
TOTAL:        0-29=2   30-49=18  50-100=0   ← NENHUM acima de 40%
```

Caso emblemático: **Sul Santana**, 20 skills financeiras cadastradas, candidatando-se à vaga "Analista Financeiro", recebe **6%** de match em Skills Técnicas. Com std_skills + separação por tipo, o score correto seria **44%** (Tech 49% + Beh 39%, média ponderada).

### 1.2 Causa raiz

Três problemas independentes:

1. **Algoritmo legado de skills é assimétrico**: a vaga é tokenizada palavra-por-palavra, mas o candidato é comparado como string inteira. "Controle Financeiro" (skill) nunca casa com "financeira" (token da vaga).
2. **Caminho padronizado existe mas é código morto**: `calculateStandardizedSkillsScore` em [src/lib/matchCalculator.ts:168](../../src/lib/matchCalculator.ts) só roda quando ambos os lados passam std_skill IDs — mas **nenhum dos 11 call-sites** passa esses parâmetros.
3. **Pesos globais 40/30/20/10 não refletem realidade**: vaga de "Operador de Balancim" e vaga de "Full Stack Developer" usam os mesmos pesos. Comportamental fixo em 20% pune candidatos sem teste em 16 pontos sempre.

### 1.3 Estado atual da infraestrutura

Toda a infraestrutura std_skills já existe:
- [src/services/standardizedSkills/](../../src/services/standardizedSkills/) (interface + impl Supabase)
- [src/hooks/useStandardizedSkillsQuery.ts](../../src/hooks/useStandardizedSkillsQuery.ts) — `useCandidateStandardizedSkills`, `useJobStandardizedSkills`
- [src/types/standardizedSkill.ts](../../src/types/standardizedSkill.ts) com `type: 'technical' | 'behavioral'`
- Tabelas `standardized_skills` (40 técnicas + 40 comportamentais), `candidate_standardized_skills` (priority 1-10), `job_standardized_skills` (priority 1-5)

Falta apenas: ligar tudo isso ao calculator e aos call-sites.

---

## 2. Decisões de produto (8 perguntas resolvidas)

### Q1 · Escopo (decomposição)
- Spec único cobrindo todo o quadro
- Implementação em **3 etapas sequenciais**:
  - **A** — Fix do calculator (algoritmo std_skills + separação tech/beh)
  - **B** — Pesos por vaga (migration, UI, templates)
  - **C** — Polimento (toggle, modal "Ver critérios", esconder peso=0)
- Cada etapa gera plano auto-contido. Risco de paralelizar A+B é alto (conflito no `matchCalculator.ts`); B antes de A amplifica bug.

### Q2 · Estrutura do breakdown
- **5 categorias** visíveis na tela de match (separa Skills Técnicas e Skills Comportamentais)
- **Toggle "Combinar skills"** local na tela:
  - Default OFF (5 cards expandidos)
  - Quando ON, colapsa Skills Técnicas + Comportamentais em "Skills" único (peso = soma, score = média ponderada)
  - Persistência via `localStorage` (chave: `match-breakdown-combined-skills`)
  - Aparece em **todas as 7 telas** que renderizam `MatchBreakdown`

### Q3 · Estrutura de pesos (derivada da Q2)
- 5 dimensões: `weight_skills_technical + weight_skills_behavioral + weight_experience + weight_gauge_pro + weight_location = 100`

### Q4 · Comportamento quando dado falta
| Cenário | weight | Ideal cadastrado | Teste do candidato | Tratamento |
|---|---|---|---|---|
| 1 | `= 0` | irrelevante | irrelevante | Categoria oculta no breakdown |
| 2 | `> 0` | ❌ | qualquer | **Redistribui** peso entre as outras 4 categorias |
| 3 | `> 0` | ✅ | ❌ | **Penaliza com 0**, card visível com aviso "Candidato não realizou Gauge-Pro" |
| 4 | `> 0` | ✅ | ✅ | Cálculo normal (distância euclidiana) |

### Q5 · Templates de pesos (6 presets hardcoded)

| Template | Tech | Beh | Exp | Gauge | Loc | Para |
|---|---|---|---|---|---|---|
| **Operacional** | 10 | 30 | 15 | 25 | 20 | Caixa, Estoquista, Auxiliar |
| **Industrial** | 25 | 15 | 30 | 15 | 15 | Op. Balancim, Costureira, Soldador |
| **Administrativo** | 20 | 20 | 20 | 25 | 15 | Aux. Adm., Recepcionista, Secretária |
| **Técnico** | 45 | 10 | 25 | 15 | 5 | Dev, Designer, Engenheiro |
| **Liderança** | 20 | 20 | 30 | 25 | 5 | Gerente, Coordenador |
| **Comercial** | 15 | 25 | 15 | 30 | 15 | Vendedor, SDR, Atendimento |

### Q5b · CRUD de templates
- Esta entrega: **hardcoded** em `src/lib/matchWeightTemplates.ts`
- Evolução futura registrada em [PRD-092-emp-crud-templates-pesos-match.md](../../prds/PRD-092-emp-crud-templates-pesos-match.md) e referenciada em memória pessoal

### Q6 · Edição de pesos após publicação
| Estado | Comportamento |
|---|---|
| Rascunho (não publicada) | Edita livre, sem rastro |
| Publicada · 0 candidaturas | Edita livre, sem rastro |
| Publicada · ≥ 1 candidatura | **Dupla confirmação**: 1ª modal explica impacto, 2ª modal exige digitar título da vaga; INSERT em `jobs_weight_history`; trigger notifica candidatos |

### Q7 · UI do formulário
- 7ª aba "⚙ Match" no `JobForm` (após Skills)
- Cards horizontais com mini-barra empilhada para templates
- Slider Radix + input numérico por categoria
- Footer sticky com indicador de soma + botões auxiliares
- 3 estados visuais (válido / faltam / excedeu)
- Soft-block: botão "Salvar vaga" desabilitado se soma ≠ 100

### Q8 · Visualização para o candidato
- Botão "Ver critérios da vaga" → modal com:
  - Distribuição em barra empilhada + legenda
  - Comparação com padrão (deltas quando personalizada)
  - Histórico de alterações
- Notificação in-app + badge "Critérios atualizados em DD/MM" + email opcional quando pesos mudam após candidatura

---

## 3. Modelo de dados (etapas B e C)

### 3.1 Migration B · pesos por vaga

```sql
ALTER TABLE jobs
  ADD COLUMN weight_skills_technical  smallint NOT NULL DEFAULT 25,
  ADD COLUMN weight_skills_behavioral smallint NOT NULL DEFAULT 15,
  ADD COLUMN weight_experience        smallint NOT NULL DEFAULT 30,
  ADD COLUMN weight_gauge_pro         smallint NOT NULL DEFAULT 20,
  ADD COLUMN weight_location          smallint NOT NULL DEFAULT 10,

  ADD CONSTRAINT jobs_weights_sum_check
    CHECK (
      weight_skills_technical + weight_skills_behavioral +
      weight_experience + weight_gauge_pro + weight_location = 100
    ),

  ADD CONSTRAINT jobs_weights_range_check
    CHECK (
      weight_skills_technical  BETWEEN 0 AND 70 AND
      weight_skills_behavioral BETWEEN 0 AND 70 AND
      weight_experience        BETWEEN 0 AND 70 AND
      weight_gauge_pro         BETWEEN 0 AND 70 AND
      weight_location          BETWEEN 0 AND 70
    );
```

### 3.2 Migration C · histórico de alterações de pesos

```sql
CREATE TABLE jobs_weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  old_weights jsonb NOT NULL,   -- {skills_technical, skills_behavioral, experience, gauge_pro, location}
  new_weights jsonb NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  active_applications_count integer NOT NULL DEFAULT 0,
  reason text  -- opcional, livre
);

CREATE INDEX idx_jobs_weight_history_job ON jobs_weight_history(job_id, changed_at DESC);

-- RLS
ALTER TABLE jobs_weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies see own job history"
  ON jobs_weight_history FOR SELECT
  USING (
    job_id IN (SELECT id FROM jobs WHERE company_id = public.get_company_id())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- INSERT só via Edge Function (SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "No direct inserts"
  ON jobs_weight_history FOR INSERT WITH CHECK (false);
```

### 3.3 Trigger C · notifica candidatos

```sql
CREATE OR REPLACE FUNCTION notify_candidates_on_weight_change()
RETURNS TRIGGER AS $$
DECLARE
  candidate_record RECORD;
BEGIN
  IF NEW.active_applications_count > 0 THEN
    FOR candidate_record IN
      SELECT a.candidate_id
      FROM applications a
      WHERE a.job_id = NEW.job_id
        AND a.status NOT IN ('rejected', 'hired')
    LOOP
      INSERT INTO notifications (user_id, type, title, message, payload, created_at)
      VALUES (
        candidate_record.candidate_id,
        'job_weights_changed',
        'Critérios da vaga foram atualizados',
        'A empresa ajustou os critérios de match desta vaga. Seu score foi recalculado.',
        jsonb_build_object('job_id', NEW.job_id, 'changed_at', NEW.changed_at),
        now()
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

---

## 4. Algoritmo do calculator (etapa A)

### 4.1 Nova assinatura

```typescript
// src/lib/matchCalculator.ts

interface MatchSkillsInput {
  candidateTechnical: string[];   // skill IDs ordenados por priority
  candidateBehavioral: string[];
  jobTechnical: string[];
  jobBehavioral: string[];
}

interface MatchWeights {
  skillsTechnical: number;
  skillsBehavioral: number;
  experience: number;
  gaugePro: number;
  location: number;
}

export function calculateMatchBreakdown(
  candidate: Partial<Candidate>,
  job: Partial<Job>,
  idealProfile?: BehavioralProfile,
  candidateBehavioralProfile?: BehavioralProfile,
  skillsInput?: MatchSkillsInput,        // novo
  weights?: MatchWeights                  // novo
): MatchResult;
```

### 4.2 Cálculo das 5 categorias

```typescript
const skillsTechnicalScore = calculateStandardizedSkillsScore(
  skillsInput.candidateTechnical,
  skillsInput.jobTechnical
);

const skillsBehavioralScore = calculateStandardizedSkillsScore(
  skillsInput.candidateBehavioral,
  skillsInput.jobBehavioral
);

const experienceScore = calculateExperienceScore(candidate.experience, job.level);

const gaugeProScore = calculateGaugeProScore({
  weight: weights.gaugePro,
  idealProfile,
  candidateProfile: candidateBehavioralProfile,
});
// Retorna { score: number | null, displayMode: 'normal' | 'redistribute' | 'penalize' | 'hidden' }

const locationScore = calculateLocationScore(candidate, job, job.type);
```

### 4.3 Redistribuição quando peso = 0 ou dado falta (Q4 caso 2)

`MatchCategory` ganha campo `dataMissing` para sinalizar ausência de dado:

```typescript
interface MatchCategory {
  id: 'skills_technical' | 'skills_behavioral' | 'experience' | 'gauge_pro' | 'location';
  name: string;
  weight: number;
  effectiveWeight?: number;  // peso após redistribuição (Q4 caso 2)
  score: number;
  description: string;
  dataMissing?: 'job-side' | 'candidate-side' | null;
  // 'job-side' → vaga não cadastrou ideal (Q4 caso 2): redistribuir
  // 'candidate-side' → candidato sem teste (Q4 caso 3): score = 0, exibir flag
}

function applyDataAvailability(
  categories: MatchCategory[],
  weights: MatchWeights
): MatchCategory[] {
  // Caso 1: weight = 0 → categoria oculta (filter out)
  // Caso 2: weight > 0 mas vaga sem ideal Gauge-Pro → redistribuir
  // Caso 3: weight > 0, ideal cadastrado, candidato sem teste → score 0 + flag
  // Caso 4: caminho normal

  const hidden = categories.filter(c => c.weight === 0);
  const redistribute = categories.filter(
    c => c.weight > 0 && c.dataMissing === 'job-side'
  );
  const visible = categories.filter(c => !hidden.includes(c) && !redistribute.includes(c));

  const totalRedistributed = redistribute.reduce((s, c) => s + c.weight, 0);
  const totalVisibleWeight = visible.reduce((s, c) => s + c.weight, 0);

  return visible.map(c => ({
    ...c,
    effectiveWeight: c.weight + (c.weight / totalVisibleWeight) * totalRedistributed,
  }));
}
```

### 4.4 Migração legacy → padronizada

- Quando `skillsInput` não é passado → cai no `calculateSkillsScore` legado (compat)
- Quando passado mas `candidateTechnical.length === 0 && candidateBehavioral.length === 0` → score = 20 (penalidade do candidato sem cadastro)
- Quando passado e parcial (só técnica ou só comportamental) → score isolado, lado faltante = 50 neutro

---

## 5. Componentes e arquivos

### 5.1 Etapa A — Fix do calculator

**Editados:**
- [src/lib/matchCalculator.ts](../../src/lib/matchCalculator.ts) — nova assinatura, novos params
- [src/pages/candidato/JobDetails.tsx](../../src/pages/candidato/JobDetails.tsx) — passar std_skills
- [src/pages/candidato/JobSearch.tsx](../../src/pages/candidato/JobSearch.tsx)
- [src/pages/empresa/Candidates.tsx](../../src/pages/empresa/Candidates.tsx)
- [src/pages/empresa/CandidateProfile.tsx](../../src/pages/empresa/CandidateProfile.tsx)
- [src/pages/empresa/Applications.tsx](../../src/pages/empresa/Applications.tsx)
- [src/pages/empresa/SavedCandidates.tsx](../../src/pages/empresa/SavedCandidates.tsx)
- [src/pages/admin/Dashboard.tsx](../../src/pages/admin/Dashboard.tsx)
- [src/lib/jobRecommendation.ts](../../src/lib/jobRecommendation.ts)
- [src/lib/candidateRecommendation.ts](../../src/lib/candidateRecommendation.ts)

**Criados:**
- `src/hooks/useMatchSkillIds.ts` — combinador de `useCandidateStandardizedSkills` + `useJobStandardizedSkills` retornando `{candidateTechnical, candidateBehavioral, jobTechnical, jobBehavioral}`

**Removido:**
- `calculateSkillsScore` (legado tokenizado) marcado `@deprecated`, mantido temporariamente para fallback

### 5.2 Etapa B — Pesos por vaga

**Migration:**
- `sql/migrations/092_job_weights.sql`

**Criados:**
- `src/lib/matchWeightTemplates.ts` — array dos 6 templates
- `src/types/matchWeights.ts` — tipo `MatchWeights`
- `src/components/empresa/job-form/JobFormMatchWeights.tsx` — aba completa
- `src/components/empresa/job-form/MatchWeightsTemplateCards.tsx` — cards horizontais
- `src/components/empresa/job-form/MatchWeightsSliders.tsx` — 5 sliders + inputs
- `src/components/empresa/job-form/MatchWeightsSumIndicator.tsx` — footer sticky
- `src/components/empresa/job-form/EditWeightsConfirmDialog.tsx` — dupla confirmação

**Editados:**
- [src/pages/empresa/JobForm.tsx](../../src/pages/empresa/JobForm.tsx) — adicionar aba 7
- [src/hooks/useJobForm.ts](../../src/hooks/useJobForm.ts) — campos de peso, dirty tracking
- [src/lib/matchCalculator.ts](../../src/lib/matchCalculator.ts) — ler pesos do `job` em vez de constante
- [src/types/database.ts](../../src/types/database.ts) — incluir colunas weight_*
- [src/lib/supabaseConverters.ts](../../src/lib/supabaseConverters.ts) — converter snake_case ↔ camelCase

### 5.3 Etapa C — Polimento

**Migration:**
- `sql/migrations/093_jobs_weight_history.sql`

**Edge Function:**
- `supabase/functions/update-job-weights/index.ts` — valida soma, conta candidaturas, INSERT em history, atualiza job

**Criados:**
- `src/components/match/MatchCriteriaModal.tsx` — modal "Ver critérios"
- `src/components/match/MatchCombineSkillsToggle.tsx` — toggle local
- `src/hooks/useMatchCombineSkills.ts` — leitura/escrita do localStorage
- `src/hooks/useJobWeightHistoryQuery.ts` — fetch do histórico

**Editados:**
- [src/components/match/MatchBreakdown.tsx](../../src/components/match/MatchBreakdown.tsx) — esconder card peso=0; tratar dataMissing; integrar toggle
- [src/components/match/MatchProgressBar.tsx](../../src/components/match/MatchProgressBar.tsx) — exibir flag "não avaliado" no caso 3
- [src/pages/candidato/JobDetails.tsx](../../src/pages/candidato/JobDetails.tsx) — botão "Ver critérios"
- [src/pages/candidato/Notifications.tsx](../../src/pages/candidato/Notifications.tsx) — renderizar tipo `job_weights_changed`

---

## 6. Fluxos de usuário

### 6.1 Empresa cria nova vaga

1. Abre `/empresa/vagas/nova`, preenche tabs Básicas → Skills
2. Clica na aba "⚙ Match" (último tab)
3. Vê mensagem-banner explicativa + 6 templates em scroll horizontal
4. Clica em "Operacional" → 5 sliders preenchem com 10/30/15/25/20
5. Ajusta Localização para 25 manualmente → footer mostra "Excedeu em 5%" (vermelho)
6. Clica em "Normalizar" → valores recalculam proporcionalmente
7. Footer volta a mostrar "Soma 100%" (cyan)
8. Clica "Salvar vaga"

### 6.2 Empresa edita pesos de vaga publicada com candidaturas

1. Abre `/empresa/vagas/:id/editar`
2. Aba "Match" carrega valores atuais
3. Mexe em sliders → ao tentar Salvar, abre **modal 1**:
   - "Esta vaga tem 12 candidaturas ativas. Alterar os pesos vai recalcular o match de todos os candidatos, notificá-los, e registrar a alteração no histórico."
   - [Cancelar] [Continuar]
4. Continuar → abre **modal 2**:
   - "Para confirmar, digite o título da vaga: 'Analista Financeiro'"
   - Input controlado, botão Confirmar desabilitado até match exato
5. Confirmar → chama Edge Function `update-job-weights`:
   - Atualiza `jobs.weight_*`
   - INSERT em `jobs_weight_history` (com count de active applications)
   - Trigger gera notificação a cada candidato
6. Toast: "Pesos atualizados. 12 candidatos foram notificados."

### 6.3 Candidato vê match com pesos personalizados

1. Abre `/candidato/vagas/:id`
2. Vê breakdown com 5 categorias (toggle OFF default), peso de cada
3. Clica em "Ver critérios da vaga" → modal abre com:
   - Barra empilhada visual
   - Tabela de comparação com defaults (deltas: +15%, -10%)
   - Histórico (1 entrada: "Vaga publicada com critérios padrão")
4. Fecha modal, clica no toggle "Combinar skills" → 5 cards viram 4
5. Total não muda, peso de "Skills Técnicas" passa a ser 40% (25+15), score = média ponderada

### 6.4 Candidato é notificado de mudança

1. Após empresa editar pesos, candidato abre o app
2. Sino mostra badge vermelho com "1 nova"
3. Clica → "A empresa X ajustou os critérios de match da vaga Y. Seu score foi recalculado."
4. Clica na notificação → vai pra `/candidato/vagas/:y` com breakdown atualizado
5. Tela de match exibe badge sutil "Critérios atualizados em 12/05/2026" no header

---

## 7. Testes

### 7.1 Unit tests (etapa A)

`src/lib/matchCalculator.test.ts`:
- `calculateStandardizedSkillsScore` com listas vazias retorna 50 (neutro) ou 20 (penalidade)
- Match exato em ID retorna score alto
- Priority weight aplica corretamente (skill priority 1 vale mais que priority 5)
- Caso 4 da Q4: distância euclidiana correta
- Caso 3 da Q4: candidato sem teste → score 0 com flag
- Caso 2 da Q4: vaga sem ideal → redistribuição correta entre 4 categorias
- Caso 1 da Q4: weight=0 → categoria filtrada do retorno

### 7.2 Integration tests (etapa B)

`src/components/empresa/job-form/JobFormMatchWeights.test.tsx`:
- Aplicar template preenche os 5 sliders corretamente
- Editar slider individual atualiza soma em tempo real
- Soma ≠ 100 desabilita botão Salvar
- Botão "Distribuir restante" só aparece quando soma < 100
- Botão "Normalizar" só aparece quando soma ≠ 100
- Card "Personalizado" aparece quando valores divergem do template aplicado

### 7.3 E2E (etapa C)

Cenário: empresa edita pesos com candidaturas ativas
- Modal 1 mostra count correto de candidatos
- Modal 2 valida exatamente o título da vaga
- Após confirmar, INSERT em `jobs_weight_history` e candidatos recebem notificação

### 7.4 Auditoria empírica

`scripts/match-audit.ts` é re-executado pós-fix para confirmar que os scores das 20 candidaturas reais saem do range 0-49% para distribuição mais ampla.

---

## 8. Migração e rollout

### 8.1 Etapa A
- Sem migration de banco
- Deploy imediato após merge — corrige scores de produção sem mudança de schema
- **Pesos durante A**: continuam usando a constante global `CATEGORY_WEIGHTS` (40/30/20/10). A redistribuição para 5 categorias acontece **só na etapa B**, quando a migration cria as colunas. Durante A, "Skills" continua sendo 40% combinado (mesmo cálculo de hoje, mas com algoritmo correto)
- Feature flag opcional: `useStandardizedMatchSkills` para rollback rápido se necessário

### 8.2 Etapa B
- Migration `092_job_weights.sql` adiciona 5 colunas com defaults 25/15/30/20/10
- Todas as 19 vagas existentes recebem defaults (reflete proporção 40/30/20/10 atual)
- Aba "Match" no JobForm fica disponível imediatamente
- Calculator passa a ler pesos do `job` em vez de constante (após confirmação que defaults foram aplicados)

### 8.3 Etapa C
- Migration `093_jobs_weight_history.sql` cria tabela + trigger
- Edge Function `update-job-weights` deployada com `verify_jwt: false` (segue padrão das outras 17)
- Modal "Ver critérios" e toggle "Combinar skills" disponíveis em todas as 7 telas

### 8.4 Versionamento
- Etapa A → MINOR (correção de bug significativa, mas sem breaking change para consumidores) — sugestão: v1.55.0 "Compass" (orientação correta do match)
- Etapa B → MINOR — sugestão: v1.56.0 "Tailor" (alfaiataria dos pesos)
- Etapa C → PATCH ou MINOR — sugestão: v1.56.x se patches; v1.57.0 "Mirror" se MINOR (transparência ao candidato)

---

## 9. Critérios de aceite

### Etapa A
- [ ] `calculateMatchBreakdown` aceita `MatchSkillsInput`
- [ ] Cálculo de skills retorna técnica e comportamental separadas
- [ ] Os 11 call-sites passam std_skills (via `useMatchSkillIds`)
- [ ] Sul Santana sai de 6% para ~44% no caso de teste real
- [ ] Auditoria empírica em 20 pares mostra distribuição mais ampla
- [ ] `calculateSkillsScore` legado marcado `@deprecated`
- [ ] Cobertura unit ≥ 85% no `matchCalculator.ts`

### Etapa B
- [ ] Migration aplicada, 19 vagas com defaults 25/15/30/20/10
- [ ] CHECK constraints validam soma=100 e range 0-70
- [ ] Aba "Match" renderiza no `JobForm` com 6 templates
- [ ] Sliders Radix + inputs numéricos funcionam (teclado, mouse)
- [ ] Footer sticky mostra 3 estados de validação
- [ ] Calculator lê pesos do `job` em vez de constante
- [ ] Salvar desabilitado quando soma ≠ 100
- [ ] Card "Personalizado" aparece quando ajusta após template

### Etapa C
- [ ] Tabela `jobs_weight_history` criada com RLS correta
- [ ] Edge Function `update-job-weights` valida soma e conta candidaturas
- [ ] Trigger gera notificações a candidatos ativos
- [ ] Modal "Ver critérios" mostra distribuição + comparação + histórico
- [ ] Modal de dupla confirmação requer digitar título exato da vaga
- [ ] Toggle "Combinar skills" funciona nas 7 telas com persistência localStorage
- [ ] Card peso=0 fica oculto no breakdown
- [ ] Card "Não avaliado" aparece quando candidato sem teste

---

## 10. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Calculator quebra em call-site não migrado | Média | Alto | Etapa A migra todos 11 sites num PR único; não dividir |
| Empresa edita pesos repetidamente, gera notif spam | Baixa | Médio | Considerar debounce no trigger ou agregar mudanças em janela 1h |
| Default 25/15/30/20/10 não satisfaz vagas legadas | Baixa | Baixo | Empresa pode editar livremente em vagas sem candidaturas |
| Modal de dupla confirmação fricção excessiva | Média | Baixo | Telemetria pra medir abandonment; ajustar UX se >30% cancelarem |
| Cache de score de match em React Query fica stale após mudança de pesos | Alta | Médio | Edge Function invalida queries via realtime após update |

---

## 11. Plano de execução (ordem mandatória)

```
A → B → C  (sessões separadas, dependências declaradas)
```

- **Plano A** auto-contido — conserta o bug do calculator independente de B/C
- **Plano B** declara dependência: requer A mergeado em main
- **Plano C** declara dependência: requer B mergeado em main

Estimativa total:
- Etapa A: ~16h
- Etapa B: ~24h
- Etapa C: ~20h
- **Total: ~60h**

---

## 12. Referências

- Auditoria empírica: [scripts/match-audit.ts](../../../scripts/match-audit.ts), [scripts/match-audit-std.ts](../../../scripts/match-audit-std.ts)
- Mockups da sessão: `.superpowers/brainstorm/519-1777510714/content/`
- PRD futuro de CRUD de templates: [PRD-092-emp-crud-templates-pesos-match.md](../../prds/PRD-092-emp-crud-templates-pesos-match.md)
- Calculator atual: [src/lib/matchCalculator.ts](../../../src/lib/matchCalculator.ts)
- Componente atual de breakdown: [src/components/match/MatchBreakdown.tsx](../../../src/components/match/MatchBreakdown.tsx)
