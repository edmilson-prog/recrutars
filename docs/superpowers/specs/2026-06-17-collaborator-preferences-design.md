# Fase 3 — Preferências de notificação do colaborador (Design)

> Épico: onboarding de colaboradores convidados. Fase 1 (acesso por senha) e Fase 2
> (perfil + gate) concluídas. Esta é a **Fase 3**: dar a cada colaborador controle
> persistido sobre por quais canais externos (e-mail / WhatsApp) ele aceita ser
> contatado, e respeitar essa escolha onde o app já envia mensagens a colaboradores.

**Data:** 2026-06-17
**Branch alvo:** nova branch a partir de `main` (após merge da Fase 2) — `feat/collaborator-preferences`

---

## 1. Objetivo e escopo

### Dentro do escopo
- Tabela `collaborator_preferences` com opt-in por canal (e-mail, WhatsApp).
- Camada de serviço + hook React Query (espelha o módulo `notifications`).
- UI na aba **"Conta"** do Settings da empresa: substitui os toggles de notificação
  que hoje são apenas estado local (não persistem) por switches reais persistidos.
- Aplicação do opt-in como **gate** no `SendTestModal`: canais recusados ficam
  desabilitados (com aviso) ao enviar teste a um colaborador registrado.
- Helper reutilizável `getCollaboratorChannelConsent` para futuros remetentes.

### Fora do escopo (explicitamente)
- **Motor de notificações por evento** (triggers + dispatch automático e-mail/
  WhatsApp/in-app quando "nova candidatura", "novo teste", etc.). Não existe hoje
  (`createNotification` não tem call site no frontend) e **não** será construído aqui.
- **Persistência de tema no banco.** Tema continua em `localStorage` via `next-themes`
  (chave `recrutars-theme`), aba "Aparência" inalterada.
- Preferências de candidato (esta fase é só colaborador/`company_users`).
- Sends transacionais (convite de equipe, reset de senha, ativação) — **nunca** gateados.

### Decisões de produto (confirmadas com o usuário)
- Granularidade: **opt-in por canal** (não matriz evento × canal).
- Gate no `SendTestModal`: **desabilitar** o canal recusado, com aviso (não só avisar).
- UI: aba **"Conta"** (substituindo os toggles mortos), não nova aba.

---

## 2. Modelo de dados

Migração `sql/migrations/110_collaborator_preferences.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.collaborator_preferences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  email_opt_in    boolean NOT NULL DEFAULT true,
  whatsapp_opt_in boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collaborator_preferences_company_profile_unique
    UNIQUE (company_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_collaborator_preferences_profile
  ON public.collaborator_preferences (profile_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_preferences_company
  ON public.collaborator_preferences (company_id);
```

**Defaults e racional:**
- `email_opt_in = true` — comunicações operacionais por e-mail são esperadas por
  padrão; o usuário pode desligar. (Transacionais são separados e nunca gateados.)
- `whatsapp_opt_in = false` — WhatsApp exige consentimento explícito (LGPD): o
  colaborador precisa ligar ativamente.

**Sem backfill e sem alterar `handle_new_user`.** A linha nasce por *lazy upsert* na
primeira leitura/salvamento. Leitura sem linha retorna os defaults acima.

### updated_at
Reusar o padrão de trigger `set_updated_at` se já existir no schema; caso não exista um
trigger genérico reaproveitável, criar `trigger_collaborator_preferences_updated_at`
chamando uma função `set_current_timestamp_updated_at()` (verificar no schema antes de
duplicar — o plano confirmará qual já existe).

### RLS

```sql
ALTER TABLE public.collaborator_preferences ENABLE ROW LEVEL SECURITY;
```

Quatro policies, todas escopadas ao próprio colaborador (consistente com o padrão do
projeto: o colaborador gerencia a sua linha):

- **SELECT** — `profile_id = auth.uid()` **OU** admin da company
  (`public.get_user_type(auth.uid()) = 'admin'`) **OU** dono/admin da empresa lê a dos
  membros (`company_id = public.get_company_id(auth.uid())`). O gate do `SendTestModal`
  precisa que o admin/empresa consiga ler a preferência do membro → a leitura por
  `company_id = get_company_id(auth.uid())` cobre isso.
- **INSERT** — `profile_id = auth.uid()` AND `company_id = public.get_company_id(auth.uid())`.
- **UPDATE** — `profile_id = auth.uid()` (USING e WITH CHECK).
- **DELETE** — `profile_id = auth.uid()` (raramente usado; incluído para completude do CRUD).

> Lembrete do projeto: `.delete()/.update()` bloqueados por RLS retornam sem erro
> (0 linhas). O serviço deve usar `.select()` no retorno de upsert/update e validar.
> Sempre `get_company_id(auth.uid())` (assinatura exige uuid).

Impersonação: como `auth.uid()` é o admin durante impersonação, escrita na linha de
outro perfil falha por RLS (esperado — preferências são read-only sob impersonação).

---

## 3. Tipos

`src/types/database.ts` — adicionar `collaborator_preferences` em
`Database['public']['Tables']` com `Row`/`Insert`/`Update` (campos acima). Edição
cirúrgica, sem regenerar o arquivo inteiro.

Tipo de domínio em `src/types/` (ou reaproveitar arquivo existente de prefs se houver):

```ts
export interface CollaboratorPreferences {
  id: string;
  companyId: string;
  profileId: string;
  emailOptIn: boolean;
  whatsappOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannel = 'email' | 'whatsapp';
```

Conversor explícito em `src/lib/supabaseConverters.ts`:
`collaboratorPreferencesRowToPreferences(row)` (sem `as unknown as`).

---

## 4. Camada de serviço

Espelha o módulo `notifications` (o mais enxuto do projeto).

`src/services/collaboratorPreferences/collaboratorPreferencesService.ts`:

```ts
export interface ICollaboratorPreferencesService {
  /** Retorna a linha do colaborador; se não existir, retorna os defaults (sem criar). */
  getPreferences(companyId: string, profileId: string): Promise<CollaboratorPreferences>;
  /** Upsert por (company_id, profile_id); retorna a linha persistida. */
  savePreferences(params: {
    companyId: string;
    profileId: string;
    emailOptIn: boolean;
    whatsappOptIn: boolean;
  }): Promise<CollaboratorPreferences>;
}

// factory singleton com import preguiçoso + resetCollaboratorPreferencesService()
```

`…/collaboratorPreferencesService.supabase.ts`:
- `getPreferences`: `.select().eq(company_id).eq(profile_id).maybeSingle()`; se `null`,
  retorna objeto de defaults (não persiste).
- `savePreferences`: `.upsert({...}, { onConflict: 'company_id,profile_id' }).select().single()`;
  valida retorno; lança erro com mensagem se RLS bloquear (0 linhas).

### Helper de consentimento (consumido pelo gate)

`getCollaboratorChannelConsent(companyId, profileId): Promise<{ email: boolean; whatsapp: boolean }>`
— wrapper fino sobre `getPreferences` mapeando para `{ email, whatsapp }`. Usado pelo
`SendTestModal`. Exposto pelo mesmo service (método) ou util dedicado; o plano fixa o local.

---

## 5. Hook React Query

`src/hooks/useCollaboratorPreferencesQuery.ts` (padrão `useNotificationsQuery`):

```ts
const KEYS = {
  byCollaborator: (companyId: string, profileId: string) =>
    ['collaboratorPreferences', companyId, profileId] as const,
};

export function useCollaboratorPreferences(companyId?: string, profileId?: string) {
  return useQuery({
    queryKey: KEYS.byCollaborator(companyId ?? '', profileId ?? ''),
    queryFn: async () => (await getCollaboratorPreferencesService())
      .getPreferences(companyId!, profileId!),
    enabled: !!companyId && !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveCollaboratorPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p) => (await getCollaboratorPreferencesService()).savePreferences(p),
    onSuccess: (_d, p) =>
      qc.invalidateQueries({ queryKey: KEYS.byCollaborator(p.companyId, p.profileId) }),
  });
}
```

---

## 6. UI — aba "Conta"

`src/pages/empresa/Settings.tsx`, aba `conta`:
- **Remover** o estado local `CompanyNotificationPreferences` (newApplications, messages,
  testsCompleted, weeklyDigest) e seus toggles — código morto que nunca persistiu.
- **Adicionar** uma seção "Notificações" com dois `Switch`:
  - "Receber notificações por e-mail" → `emailOptIn`
  - "Receber notificações por WhatsApp" → `whatsappOptIn`
  - microcopy de consentimento sob cada switch.
- Componente dedicado `src/components/settings/NotificationPreferencesSection.tsx`
  (carregado via `useCollaboratorPreferences(currentCompany.id, user.id)`; salva via
  `useSaveCollaboratorPreferences`; toasts via sonner; estado de loading/saving).
- Funciona para qualquer colaborador (member ou owner) — é a preferência da própria
  pessoa. Sob impersonação: somente leitura (switches desabilitados).

> O resto da aba "Conta" (e-mail, senha, danger zone) permanece intacto.

---

## 7. Aplicação do opt-in — `SendTestModal`

`src/components/team-management/SendTestModal.tsx` envia teste a um `member` via
e-mail (`send_invitation_email`) ou WhatsApp (`sendMessage(member.phone, …)`).

Comportamento novo:
- Ao abrir/selecionar o membro, buscar o consentimento dele via
  `getCollaboratorChannelConsent(companyId, member.profileId)` **somente quando o membro
  for um colaborador registrado** (tem `profile_id`). Membros externos/pendentes (sem
  `profile_id`) → sem gate, todos os canais liberados (comportamento atual).
- Canal recusado fica **desabilitado** no seletor de método, com aviso explicativo
  ("Este colaborador optou por não receber WhatsApp.").
- Se ambos recusados → mostrar aviso e impedir envio externo (orientar o admin).
- Transacional não se aplica aqui; este é envio de teste (operacional), exatamente o
  caso que o opt-in cobre.

> Verificar no plano o shape real de `member` no `SendTestModal` (se traz `profile_id`/
> `id` do profile e `phone`) para resolver o `companyId`/`profileId` corretamente. Se o
> objeto não expõe `profile_id`, o plano define como obtê-lo (via `team_members` →
> `company_users`/`profiles`).

---

## 8. Edge cases

- **Sem linha de preferência** → defaults (email on, whatsapp off); UI mostra defaults;
  primeiro save cria a linha.
- **Impersonação** → leitura ok; escrita bloqueada por RLS (esperado); UI desabilita
  os switches quando `isImpersonationActive`.
- **Membro sem `profile_id`** (convite externo pendente) → sem gate no SendTestModal.
- **Owner** → tem `profile_id` e linha própria; pode definir as próprias preferências.
- **Concorrência** → upsert por `onConflict (company_id, profile_id)` evita duplicatas.

---

## 9. Testes (sem framework de teste no projeto)

Verificação = `npm run lint` + `npm run build` + e2e no preview (porta 3000):
1. Login como colaborador → Configurações → Conta → seção Notificações mostra defaults.
2. Desligar WhatsApp / ligar — salva, recarrega, persiste (checar no banco via MCP que a
   linha existe com os valores certos).
3. `SendTestModal` para esse colaborador → canal WhatsApp desabilitado com aviso.
4. Religar WhatsApp → canal volta a ficar habilitado no SendTestModal.
5. Membro externo (sem profile) → SendTestModal sem restrição.
6. Sob impersonação → switches read-only.

> Usar conta de teste (`rh@techsolutions.com` + um membro de teste), **nunca** contas de
> clientes reais. Restaurar o estado ao fim.

---

## 10. Constraints globais (herdadas)

- Edge Functions sempre `verify_jwt=false` (n/a aqui — sem nova function).
- RLS: nunca `EXISTS(SELECT 1 FROM public.users …)` (tabela não existe); usar
  `get_user_type`/`get_company_id(auth.uid())`. Validar as 4 policies (SELECT/INSERT/
  UPDATE/DELETE). `.delete()/.update()` + `.select()` para detectar bloqueio silencioso.
- snake_case (DB) ↔ camelCase (TS) via conversor explícito.
- Migração aplicada na Supabase compartilhada fica inerte em produção até o deploy do
  front que a lê.
- changelog/versionamento ao final (MINOR — novo codename).
- UI em pt-BR com acentuação correta; identificadores em inglês.
