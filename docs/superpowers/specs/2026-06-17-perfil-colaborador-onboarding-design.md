# Design — Fase 2: Perfil do colaborador + gate de onboarding

**Data:** 2026-06-17
**Status:** Aprovado (design)
**Épico:** Onboarding de colaboradores convidados
**Fase:** 2 de 4 — *Perfil do colaborador*

---

## 1. Contexto e problema

A Fase 1 garantiu que todo colaborador consegue definir a própria senha. Mas o
colaborador convidado entra na plataforma **sem perfil**: não há cargo/função,
telefone pessoal nem foto. A aba "Equipe" e os relatórios ficam com pessoas sem
identificação, e não existe nenhum lugar onde o colaborador (ou o dono) preencha
esses dados.

Dois grupos precisam ser cobertos:

1. **Novos convidados** — a partir de agora, todo convite deve levar a pessoa a
   preencher o perfil antes de usar o painel.
2. **Colaboradores "no limbo"** — membros que já entraram via convite e nunca
   tiveram um passo de perfil. Devem ser levados ao mesmo fluxo no próximo acesso.

Os **donos da empresa** (cadastro via CNPJ) ficam **isentos** do gate — já
configuraram a empresa — mas ganham o mesmo lugar de edição para preencher os
próprios dados pessoais quando quiserem.

---

## 2. Objetivo da Fase 2

- Capturar **cargo/função** e **telefone** (obrigatórios) e **foto** (opcional)
  de todo colaborador, via um passo único de onboarding gateado.
- Dar a colaboradores e donos uma aba **"Meu Perfil"** para editar esses dados a
  qualquer momento.

Fora de escopo (Fases 3–4): preferências (tema, notificações e-mail/WhatsApp,
opt-in), tour guiado interativo. O `onboarding_step` é desenhado para crescer
(novos valores em fases futuras), mas nesta fase só existem `profile` e
`completed`.

---

## 3. Decisões de produto (travadas)

| Decisão | Escolha |
|---------|---------|
| Quem é gateado | Novos convidados **+** membros no limbo; donos isentos |
| Campos obrigatórios | Cargo + telefone (foto opcional) |
| Edição posterior | Nova aba "Meu Perfil" no Settings (colaboradores **e** donos) |
| Local do guard | Por rota, envolvendo cada `/empresa/*` (espelha `OnboardingGuard`) |

---

## 4. Modelo de dados — migração `109_collaborator_profile_onboarding.sql`

Três colunas novas. A foto reutiliza `profiles.avatar_url` (já existe).

- `company_users.job_title TEXT` — cargo/função (específico da relação pessoa↔empresa).
- `company_users.onboarding_step TEXT NOT NULL DEFAULT 'completed'`
  `CHECK (onboarding_step IN ('profile','completed'))`.
- `profiles.phone TEXT` — telefone pessoal.

**Por que esses locais:** o cargo pertence ao vínculo com a empresa
(`company_users`); o telefone é dado pessoal e mora em `profiles` (tabela
compartilhada do usuário, onde já vive `avatar_url`/`name`). O `onboarding_step`
é por vínculo, então mora em `company_users` (espelha `candidates.onboarding_step`).

**Backfill (ordem importa):** a coluna nasce `'completed'` — assim o `ALTER TABLE`
não perturba ninguém por acidente. Em seguida, marcamos como `'profile'` todos os
vínculos **não-donos**:

```sql
UPDATE public.company_users cu
SET onboarding_step = 'profile'
WHERE NOT EXISTS (
  SELECT 1 FROM public.companies c
  WHERE c.id = cu.company_id AND c.profile_id = cu.profile_id
);
```

O `NOT EXISTS` identifica o dono pela igualdade `companies.profile_id = profile_id`
para aquela empresa — qualquer vínculo que não seja o do dono é tratado como
convidado e entra no gate.

**Atualização do trigger `handle_new_user()`** (na mesma migração): no ramo do
membro convidado, o `INSERT INTO public.company_users` passa a incluir
`onboarding_step = 'profile'`, para que o convidado que se cadastra do zero já
caia no gate. Toda a demais lógica do trigger é preservada integralmente (CNPJ,
candidato, dono, company_users, subscription trial) — ver memória do projeto sobre
o cuidado com esse trigger.

---

## 5. Novos convidados recebem `onboarding_step = 'profile'`

Há **dois** pontos que criam o vínculo `company_users` para um convidado; ambos
precisam setar `'profile'` (sem isso, o default `'completed'` faria o convidado
pular o gate):

1. **Trigger `handle_new_user()`** — convidado que se cadastra do zero (seção 4).
2. **Edge Function `invite-team-member`** — quando vincula um **perfil
   pré-existente** via `linkExistingMember()`. O `upsert` em `company_users`
   (hoje `{ company_id, profile_id, role }`) passa a incluir
   `onboarding_step: 'profile'`. O `ignoreDuplicates: true` é mantido — relink de
   quem já existe não reseta o passo (idempotência preservada). Redeploy com
   `verify_jwt = false` (padrão do projeto).

---

## 6. AuthContext expõe o passo

`loadUserData` já consulta `company_users` para descobrir o `role` (tanto no ramo
do dono quanto no do membro). Essa mesma consulta passa a trazer também
`onboarding_step`, alimentando um novo estado/campo do contexto:

- Novo campo: `companyOnboardingStep: 'profile' | 'completed' | null`.
- `refreshCurrentCompany()` atualiza o campo junto (usado após concluir o passo).
- Durante impersonação o contexto expõe `null` para esse campo (o guard também
  faz bypass em impersonação, espelhando o `OnboardingGuard`), evitando que o
  admin impersonando seja redirecionado.

O campo é derivado do `company_users` do **usuário real**; donos terão
`'completed'` (backfill) e passam direto.

---

## 7. Guard + rota de onboarding

### 7.1 `CompanyOnboardingGuard`

Novo `src/components/auth/CompanyOnboardingGuard.tsx`, espelhando
`OnboardingGuard`:

```tsx
if (loading) return <Spinner />;
if (isImpersonationActive) return <>{children}</>;
if (!user || user.type !== 'company') return <>{children}</>;
if (!companyOnboardingStep || companyOnboardingStep === 'completed') return <>{children}</>;
if (companyOnboardingStep === 'profile') return <Navigate to="/empresa/onboarding/perfil" replace />;
return <>{children}</>;
```

### 7.2 Aplicação por rota

Cada rota `/empresa/*` em `App.tsx` passa a aninhar o guard **dentro** do
`ProtectedRoute`, exatamente como os candidatos fazem:

```tsx
<Route path="/empresa/vagas" element={
  <ProtectedRoute allowedTypes={['company']}>
    <CompanyOnboardingGuard>
      <CompanyJobs />
    </CompanyOnboardingGuard>
  </ProtectedRoute>
} />
```

A rota de destino `/empresa/onboarding/perfil` fica **fora** do guard (só
`ProtectedRoute`), evitando loop de redirecionamento.

---

## 8. Página `src/pages/empresa/OnboardingProfile.tsx`

Full-screen (sem `DashboardLayout`, como `OnboardingPersonalProfile`). Reusa o
padrão de avatar com `react-easy-crop` e o bucket `avatars`
(`${user.id}/${Date.now()}.jpg`).

**Campos:**

- **Foto** (opcional) — upload + crop redondo, mesma UX dos candidatos.
- **Cargo/função** (obrigatório) — `Input` de texto.
- **Telefone** (obrigatório) — `Input` com máscara via `formatPhone` (seção 10).

**Submit (`handleConcluir`):**

1. `UPDATE company_users SET job_title = ..., onboarding_step = 'completed'` no
   vínculo do usuário (`company_id = currentCompany.id AND profile_id = user.id`).
2. `UPDATE profiles SET phone = ..., avatar_url = ...` (`id = user.id`).
3. `await refreshCurrentCompany()` → o guard passa a deixar passar.
4. `navigate('/empresa', { replace: true })` com toast de sucesso.

**Validação:** cargo não vazio e telefone com dígitos suficientes (>= 10 dígitos)
bloqueiam o submit antes de chamar o banco. O nome (`profiles.name`) é exibido,
porém **não editável** aqui (vem do convite; fora de escopo).

---

## 9. Aba "Meu Perfil" no Settings

`src/pages/empresa/Settings.tsx`: novo `TabsTrigger value="meu-perfil"` e
`TabsContent` correspondente, com os mesmos três campos, **editáveis a qualquer
momento**. Reusa o upload de avatar e `formatPhone`. Salva nos mesmos destinos da
seção 8 (sem mexer em `onboarding_step` — aqui é só edição). Serve colaboradores
(que já concluíram) e donos (que nunca passaram pelo gate). Carrega os valores
atuais de `currentCompany`/`company_users` (job_title) e `user`/`profiles`
(phone, avatar).

A aba existente **"Perfil"** continua sendo o perfil **da empresa** — não se
confunde com "Meu Perfil" (perfil pessoal do colaborador).

---

## 10. `formatPhone` compartilhado (DRY)

Hoje `formatPhone` está duplicado localmente em `src/pages/candidato/Profile.tsx`.
Extrair para `src/lib/formatters.ts` e reutilizar em: a página de onboarding
(seção 8), a aba "Meu Perfil" (seção 9) e `candidato/Profile.tsx` (que passa a
importar em vez de declarar). Comportamento idêntico ao atual:
`(XX) XXXXX-XXXX` (celular) / `(XX) XXXX-XXXX` (fixo), limitado a 11 dígitos.

---

## 11. RLS / segurança

Nenhuma policy nova:

- `profiles_update_own` (`USING (auth.uid() = id)`) cobre o update de `phone` e
  `avatar_url` (colunas da própria tabela).
- `company_users_update_own_company` (`USING (company_id = get_company_id(auth.uid()))`)
  cobre o update de `job_title`/`onboarding_step` do próprio vínculo.
- Upload no bucket `avatars` em `${user.id}/...` segue o mesmo padrão já usado
  pelos candidatos (validar na execução que colaboradores autenticados gravam
  na própria pasta).

---

## 12. Tratamento de erros e edge cases

- **Dono da empresa:** `onboarding_step = 'completed'` (backfill) → passa direto;
  edita perfil pessoal opcionalmente via "Meu Perfil".
- **Impersonação:** guard faz bypass; `companyOnboardingStep` exposto como `null`.
- **Relink idempotente:** `ignoreDuplicates: true` no Edge Function não reseta o
  passo de quem já é membro.
- **Falha no upload da foto:** toast de erro; como a foto é opcional, o usuário
  pode concluir sem ela.
- **Falha no submit:** toast de erro, estado de loading desfeito, sem avançar.
- **Membro tenta navegar para outra `/empresa/*` antes de concluir:** o guard por
  rota redireciona de volta ao passo.

---

## 13. Plano de testes (manual + automatizado disponível)

Sem framework de teste no projeto → verificação por `npm run lint` +
`npm run build` + validação no preview (porta 3000). Roteiro manual:

1. **Membro no limbo:** login de um membro existente → é levado a
   `/empresa/onboarding/perfil` → preenche cargo + telefone → conclui → cai em
   `/empresa`; relogar não pede de novo.
2. **Novo convidado:** convidar e-mail novo → após definir senha (Fase 1) → cai
   no passo de perfil → conclui → acessa o painel.
3. **Convidado pré-existente:** vincular um perfil que já existe → no próximo
   acesso passa pelo gate.
4. **Dono:** login do dono → vai direto ao painel (sem gate) → consegue editar
   "Meu Perfil".
5. **Edição posterior:** alterar cargo/telefone/foto em "Meu Perfil" → persiste.
6. **Impersonação:** admin impersona colaborador no limbo → não é redirecionado
   ao gate.

---

## 14. Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `sql/migrations/109_collaborator_profile_onboarding.sql` | **novo** — colunas + backfill + trigger |
| `supabase/functions/invite-team-member/index.ts` | **edição** — `onboarding_step:'profile'` no upsert; redeploy |
| `src/contexts/AuthContext.tsx` | **edição** — carregar/expor `companyOnboardingStep` + refresh |
| `src/components/auth/CompanyOnboardingGuard.tsx` | **novo** — guard por rota |
| `src/App.tsx` | **edição** — aninhar guard nas rotas `/empresa/*` + rota de onboarding |
| `src/pages/empresa/OnboardingProfile.tsx` | **novo** — passo de perfil full-screen |
| `src/pages/empresa/Settings.tsx` | **edição** — aba "Meu Perfil" |
| `src/lib/formatters.ts` | **novo** — `formatPhone` compartilhado |
| `src/pages/candidato/Profile.tsx` | **edição** — importar `formatPhone` (DRY) |
| `src/types/database.ts` | **edição** — tipos das colunas novas |

---

## 15. Critérios de aceite

- [ ] Migração 109 aplicada: `job_title`, `onboarding_step` (default `completed`),
      `profiles.phone`; backfill marca não-donos como `profile`.
- [ ] Trigger `handle_new_user()` seta `profile` para convidado novo, preservando
      toda a lógica existente.
- [ ] Edge Function vincula pré-existente com `onboarding_step:'profile'`
      (redeploy `verify_jwt=false`).
- [ ] Colaborador no limbo e novo convidado são levados ao passo e só saem ao
      concluir cargo + telefone.
- [ ] Dono não é gateado e consegue editar "Meu Perfil".
- [ ] Foto opcional funciona (upload + crop) e persiste em `profiles.avatar_url`.
- [ ] `formatPhone` extraído e reusado nos três pontos.
- [ ] Impersonação não dispara o gate.
- [ ] `npm run lint` e `npm run build` sem erros novos.
