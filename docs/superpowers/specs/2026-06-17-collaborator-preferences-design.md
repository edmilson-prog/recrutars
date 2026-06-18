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
- Helper reutilizável `getChannelConsent(companyId, profileId)` no serviço, pronto para
  qualquer remetente futuro consultar o consentimento do colaborador.

> **Decisão de escopo (confirmada após inspeção do código):** não há hoje nenhum
> envio não-transacional que mire um colaborador logado (`company_users`). O
> `SendTestModal` mira `team_members` (organograma de teste), que **não têm
> `profile_id`** e são população diferente. Portanto **não** se adiciona gate ao
> `SendTestModal` — seria a população errada e semanticamente incorreto. O opt-in fica
> como registro de consentimento persistido + helper pronto. Quando um remetente real
> para colaboradores existir, ele consulta o helper.

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

Quatro policies (escrita só na própria linha; leitura na própria empresa, para o helper):

- **SELECT** — `profile_id = auth.uid()` **OU** `company_id = public.get_company_id(auth.uid())`.
  Permite ao próprio colaborador ler sua linha e a um remetente em contexto de empresa
  ler a do colaborador alvo (uso futuro do helper). Usa só `get_company_id` (SECURITY
  DEFINER) — evita subconsulta sujeita a RLS de `company_users`.
- **INSERT** — WITH CHECK `profile_id = auth.uid()` AND `company_id = public.get_company_id(auth.uid())`.
- **UPDATE** — USING e WITH CHECK `profile_id = auth.uid()`.
- **DELETE** — USING `profile_id = auth.uid()` (raramente usado; incluído para completude do CRUD).

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

### Helper de consentimento (ponto de extensão futuro)

`getChannelConsent(companyId, profileId): Promise<{ email: boolean; whatsapp: boolean }>`
— método do mesmo serviço, wrapper fino sobre `getPreferences` mapeando para
`{ email, whatsapp }`. Sem consumidor hoje (ver §7); existe para remetentes futuros.

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

## 7. Helper de consentimento (sem consumidor atual)

Em vez de gate no `SendTestModal` (população errada — ver decisão de escopo na §1), o
serviço expõe:

`getChannelConsent(companyId, profileId): Promise<{ email: boolean; whatsapp: boolean }>`
— wrapper fino sobre `getPreferences` que retorna os dois flags. Definido e disponível,
porém **não consumido** por nenhuma UI/serviço hoje (nenhum remetente para colaboradores
logados existe). É o ponto de extensão para fases/recursos futuros (ex.: um motor de
notificações ou um digest por e-mail). A RLS de SELECT permite leitura por qualquer
membro da mesma empresa (via `get_company_id`), então um remetente em contexto de
empresa conseguirá consultar o consentimento do colaborador alvo.

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
1. Login como colaborador → Configurações → Conta → seção Notificações mostra defaults
   (e-mail ligado, WhatsApp desligado).
2. Desligar/ligar os switches — salva, recarrega a página, persiste (checar no banco via
   MCP que a linha existe com os valores certos).
3. Sob impersonação → switches read-only (desabilitados).
4. Confirmar que os toggles mortos antigos (newApplications/messages/testsCompleted/
   weeklyDigest) sumiram e não há import/variável órfã (lint limpo).

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
