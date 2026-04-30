# PRD-092 — CRUD de Templates de Pesos do Match

> **Status:** ⏳ Backlog (futuro) — implementação postergada
> **Origem:** Sessão de brainstorming "match-skills-pesos-design" (abril/2026)
> **Pré-requisito:** PRD anterior que introduz `weight_*` em `jobs` e os 6 templates hardcoded
> **Prioridade:** Média — depende da demanda real de empresas pedindo templates customizados
> **Referência:** decisão tomada na opção A do brainstorm (templates hardcoded para entrega rápida); este PRD cobre a evolução para opção D (CRUD híbrido sistema + por empresa)

---

## 1. Contexto

A primeira versão da feature de pesos por vaga entregou 6 templates **hardcoded em código** (`src/lib/matchWeightTemplates.ts`):

- Operacional · Industrial · Administrativo · Técnico · Liderança · Comercial

Esses templates funcionam como atalhos no formulário de criação de vaga: empresa clica num template e os 5 sliders (Skills Técnicas, Skills Comportamentais, Experiência, Perfil Comportamental, Localização) são pré-preenchidos. A empresa pode ajustar os sliders depois.

**Limitação atual:** mudar um template, criar um novo (ex.: "Hospitalar", "Educação", "Logística") ou ajustar para a realidade de uma empresa específica exige PR de dev. Não escala.

**Objetivo deste PRD:** permitir CRUD de templates em duas camadas — sistema (oficiais, geridos por admin) e por empresa (customizados, geridos pelo próprio usuário).

---

## 2. Modelo de dados

### 2.1 Tabela principal

```sql
CREATE TABLE match_weight_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NULL REFERENCES companies(id) ON DELETE CASCADE,
  -- NULL = template oficial do sistema, não vinculado a empresa
  name text NOT NULL,
  description text,
  examples text,                                  -- "Caixa, Estoquista, Operador"
  weight_skills_technical smallint NOT NULL,
  weight_skills_behavioral smallint NOT NULL,
  weight_experience smallint NOT NULL,
  weight_gauge_pro smallint NOT NULL,
  weight_location smallint NOT NULL,
  is_system boolean NOT NULL DEFAULT false,       -- bloqueia edição quando true
  is_archived boolean NOT NULL DEFAULT false,     -- soft-delete
  sort_order smallint,                            -- ordenação na UI
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT match_weight_templates_sum_check
    CHECK (
      weight_skills_technical + weight_skills_behavioral +
      weight_experience + weight_gauge_pro + weight_location = 100
    ),

  CONSTRAINT match_weight_templates_range_check
    CHECK (
      weight_skills_technical BETWEEN 0 AND 70 AND
      weight_skills_behavioral BETWEEN 0 AND 70 AND
      weight_experience BETWEEN 0 AND 70 AND
      weight_gauge_pro BETWEEN 0 AND 70 AND
      weight_location BETWEEN 0 AND 70
    ),

  CONSTRAINT match_weight_templates_system_company_check
    CHECK (NOT (is_system = true AND company_id IS NOT NULL))
    -- Templates de sistema não podem ter company_id
);

CREATE INDEX idx_match_weight_templates_company
  ON match_weight_templates(company_id) WHERE is_archived = false;

CREATE INDEX idx_match_weight_templates_system
  ON match_weight_templates(is_system, sort_order) WHERE is_archived = false AND is_system = true;
```

### 2.2 Trigger de updated_at

```sql
CREATE OR REPLACE FUNCTION set_match_weight_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_weight_templates_updated_at
  BEFORE UPDATE ON match_weight_templates
  FOR EACH ROW EXECUTE FUNCTION set_match_weight_templates_updated_at();
```

### 2.3 Migration dos 6 templates hardcoded

Inserir os 6 oficiais como `is_system = true, company_id = NULL`:

```sql
INSERT INTO match_weight_templates
  (name, description, examples, weight_skills_technical, weight_skills_behavioral,
   weight_experience, weight_gauge_pro, weight_location, is_system, sort_order)
VALUES
  ('Operacional', 'Comportamental e localização pesam mais; técnica importa pouco. Vagas que dependem de presença, atitude e disposição.', 'Caixa, Estoquista, Operador, Auxiliar de loja', 10, 30, 15, 25, 20, true, 1),
  ('Industrial', 'Domínio de máquina e tempo de casa pesam; cliente final ausente reduz comportamental.', 'Op. de Balancim, Costureira, Soldador, Produção', 25, 15, 30, 15, 15, true, 2),
  ('Administrativo', 'Distribuição equilibrada com leve viés para Gauge-Pro. Atendimento interno e externo.', 'Aux. Administrativo, Recepcionista, Secretária', 20, 20, 20, 25, 15, true, 3),
  ('Técnico', 'Skills técnicas e experiência dominam; localização pouco relevante (remoto/híbrido).', 'Dev, Analista, Designer, Engenheiro', 45, 10, 25, 15, 5, true, 4),
  ('Liderança', 'Experiência e perfil de gestão são críticos; técnica e comportamental balanceadas.', 'Gerente, Coordenador, Supervisor', 20, 20, 30, 25, 5, true, 5),
  ('Comercial', 'Perfil Gauge-Pro e comportamental dominam — vender é mais sobre pessoa do que técnica.', 'Vendedor, SDR, Atendimento, Caixa+vendas', 15, 25, 15, 30, 15, true, 6);
```

### 2.4 RLS Policies

```sql
ALTER TABLE match_weight_templates ENABLE ROW LEVEL SECURITY;

-- SELECT: usuários veem templates do sistema + da própria empresa
CREATE POLICY "Users see system templates and own company templates"
  ON match_weight_templates FOR SELECT
  USING (
    is_archived = false AND (
      company_id IS NULL OR
      company_id = public.get_company_id() OR
      public.get_user_type(auth.uid()) = 'admin'
    )
  );

-- INSERT: empresa cria seus próprios; admin cria de sistema
CREATE POLICY "Companies create own templates, admin creates system"
  ON match_weight_templates FOR INSERT
  WITH CHECK (
    (
      company_id = public.get_company_id() AND
      is_system = false
    ) OR (
      public.get_user_type(auth.uid()) = 'admin'
    )
  );

-- UPDATE: empresa edita seus próprios não-arquivados; admin edita system templates
CREATE POLICY "Companies edit own templates, admin edits system"
  ON match_weight_templates FOR UPDATE
  USING (
    (
      company_id = public.get_company_id() AND
      is_system = false AND
      is_archived = false
    ) OR (
      public.get_user_type(auth.uid()) = 'admin'
    )
  );

-- DELETE: nenhum, usar UPDATE is_archived = true (soft delete)
-- Hard delete só via SUPABASE_SERVICE_ROLE_KEY em scripts manuais
CREATE POLICY "No direct deletes — use archive"
  ON match_weight_templates FOR DELETE
  USING (false);
```

---

## 3. Telas e fluxos

### 3.1 Admin · Gestão de templates de sistema

**Rota:** `/admin/configuracoes/templates-match`

**Componentes:**
- `AdminMatchTemplatesPage.tsx` — listagem
- `AdminMatchTemplateForm.tsx` — formulário criar/editar
- `MatchTemplatePreview.tsx` — visualização das 5 barras (reutilizado da empresa)

**Capacidades:**
- Listar todos os templates de sistema (`is_system = true`)
- Criar novo template de sistema
- Editar nome, descrição, exemplos, pesos, sort_order
- Arquivar (soft delete) — confirma se há vagas usando os pesos derivados
- Reativar template arquivado
- **Não pode excluir definitivamente** via UI

### 3.2 Empresa · Gestão de templates próprios

**Rota:** `/empresa/configuracoes/templates-match`

**Componentes:**
- `CompanyMatchTemplatesPage.tsx` — listagem com 2 seções: "Do sistema" (read-only) e "Meus templates"
- `CompanyMatchTemplateForm.tsx` — formulário
- Botão "Clonar template oficial" — copia um template de sistema como base para customização

**Capacidades:**
- Ver templates de sistema (read-only, badge "Oficial")
- Criar template próprio do zero
- Clonar template de sistema → vira template próprio editável
- Editar templates próprios
- Arquivar templates próprios
- Reativar templates arquivados

### 3.3 Formulário de criação de vaga

**Atualização do componente atual** que renderiza os botões de templates:

- Substituir array hardcoded por chamada ao hook `useMatchWeightTemplates()` (carrega templates de sistema + próprios)
- Mostrar duas seções no select: "Templates oficiais" e "Meus templates"
- Botão "+ Criar novo template a partir desses pesos" — atalho que sai dos sliders atuais e abre o form de criação pré-preenchido
- Botão "Salvar como template" após ajuste fino dos sliders — salva como template próprio sem sair da página

---

## 4. Componentes e arquivos a criar

```
src/
├── types/
│   └── matchWeightTemplate.ts              -- tipo MatchWeightTemplate
├── services/
│   └── matchWeightTemplates/
│       ├── matchWeightTemplatesService.ts          -- interface
│       └── matchWeightTemplatesService.supabase.ts -- impl
├── hooks/
│   └── useMatchWeightTemplatesQuery.ts     -- list, create, update, archive, clone
├── components/
│   ├── match/
│   │   └── MatchTemplatePreview.tsx        -- visualização das 5 barras
│   └── empresa/
│       └── MatchTemplateForm.tsx           -- formulário compartilhado admin/empresa
└── pages/
    ├── admin/
    │   └── MatchTemplatesAdmin.tsx
    └── empresa/
        └── MatchTemplatesCompany.tsx
```

---

## 5. Validações

### 5.1 Backend (CHECK constraints + RLS)
- Soma dos 5 pesos = 100 (já no CHECK)
- Cada peso entre 0 e 70 (já no CHECK)
- Templates de sistema não podem ter `company_id` (já no CHECK)
- Empresa só edita seus templates (RLS)
- Admin edita só system templates (RLS)

### 5.2 Frontend (Zod)
```typescript
const matchTemplateSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(280).optional(),
  examples: z.string().max(140).optional(),
  weights: z.object({
    skillsTechnical: z.number().int().min(0).max(70),
    skillsBehavioral: z.number().int().min(0).max(70),
    experience: z.number().int().min(0).max(70),
    gaugePro: z.number().int().min(0).max(70),
    location: z.number().int().min(0).max(70),
  }).refine(w =>
    w.skillsTechnical + w.skillsBehavioral + w.experience + w.gaugePro + w.location === 100,
    'A soma dos pesos deve ser 100%'
  ),
});
```

### 5.3 UX
- Slider em tempo real recalcula o "restante" — empresa não pode submeter se soma ≠ 100
- Indicador visual: barra horizontal mostrando 100% completos (verde) ou faltam X% (laranja)
- Avisar antes de arquivar: "Este template não afetará vagas já criadas, mas não estará mais disponível para novas vagas"

---

## 6. Edge cases

### 6.1 Template em uso por vagas
- Templates **não são** referenciados por `jobs` (vaga só copia os pesos no momento da criação)
- Logo, arquivar um template **não afeta vagas existentes** — a vaga já tem seus `weight_*` materializados
- Apenas remove a opção do menu para futuras criações

### 6.2 Empresa arquiva, depois quer voltar
- `is_archived` é reversível via UI
- Manter histórico de quem criou/quem arquivou pra auditoria

### 6.3 Admin edita template de sistema com templates clonados
- Empresas que clonaram não recebem mudanças (clone é cópia, não link)
- Decisão de produto: aceitar essa divergência (templates próprios são "fork", não "extend")

### 6.4 Nome duplicado
- Permitir dentro da mesma empresa? Recomendo proibir (UNIQUE constraint em `(company_id, lower(name))`)
- Sistema templates: UNIQUE em `(name) WHERE is_system = true`

---

## 7. Considerações de segurança

- RLS garante isolamento entre empresas
- `is_system` só editável via SECURITY DEFINER função
- Auditoria: registrar `created_by` e `updated_at` para rastreio
- Limites por empresa: máximo 20 templates próprios (constraint via trigger ou função RPC)

---

## 8. Migração e desativação dos templates hardcoded

### Estado atual (após PRD anterior)
```typescript
// src/lib/matchWeightTemplates.ts
export const MATCH_WEIGHT_TEMPLATES: MatchWeightTemplate[] = [
  { id: 'operacional', name: 'Operacional', ... },
  // ... 6 templates
];
```

### Após este PRD
1. Migration insere os 6 como `is_system = true` no banco
2. `useMatchWeightTemplates()` passa a buscar do banco
3. Constante hardcoded vira fallback offline ou é removida
4. Componente de seleção de template passa a usar dados dinâmicos

### Versionamento
- Versão MINOR (CRUD de templates é feature, não breaking)
- Codename sugerido: "Atelier" (oficina onde se molda os pesos)

---

## 9. Esforço estimado

| Item | Estimativa |
|---|---|
| Migration + RLS + seeds | 2h |
| Service + hooks | 3h |
| Tela admin (listagem + form) | 6h |
| Tela empresa (listagem + form + clone) | 8h |
| Atualizar formulário de vaga para usar dados dinâmicos | 3h |
| Validações + edge cases | 3h |
| Testes (unit + integração) | 4h |
| Changelog + docs | 1h |
| **Total** | **~30h** |

---

## 10. Critérios de aceite

- [ ] Admin pode criar/editar/arquivar templates de sistema
- [ ] Empresa pode criar/editar/arquivar templates próprios
- [ ] Empresa pode clonar template oficial para customização
- [ ] Formulário de vaga lista templates de sistema + próprios da empresa
- [ ] Soma dos 5 pesos sempre = 100 (validação backend e frontend)
- [ ] Template arquivado não aparece para novas vagas
- [ ] Vagas existentes não são afetadas por arquivamento
- [ ] RLS isola dados entre empresas
- [ ] Performance: listagem < 200ms para até 100 templates
- [ ] Cobertura de testes ≥ 80% nos services/hooks
