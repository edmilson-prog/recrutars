# Controle de Período de Avaliação por Empresa (Admin)

**Data:** 2026-06-10
**Status:** Aprovado em brainstorming — aguardando plano de implementação

## Objetivo

Dar ao admin o controle individual dos dias de avaliação (trial) de cada empresa, dentro de `/admin/empresas/:id` (aba Assinatura), e mudar o padrão de novos cadastros: empresa nova **nasce travada** ("aguardando liberação") em vez de receber dias automáticos.

## Decisões de produto (confirmadas com o usuário)

1. **Novo cadastro travado:** após o primeiro login, a empresa vê uma tela de **"Aguardando liberação"** (acolhedora, não punitiva) — com opção de assinar um plano direto sem esperar.
2. **Controle do admin:** campo "dias de avaliação a partir de hoje" + atalhos rápidos (+7, +15, +30, +90) + preview da data de término + "Encerrar agora".
3. **Retroatividade:** empresas que JÁ estão em trial **não são afetadas** — mantêm a data atual. O admin pode estender/encerrar individualmente.
4. **Notificação:** ao liberar/estender, a empresa recebe notificação in-app ("Sua avaliação foi liberada até DD/MM/AAAA").

## Arquitetura escolhida (Abordagem A — Frontend + RLS admin)

A fonte de verdade do trial continua sendo `subscriptions.trial_end_date`. O admin grava direto via service layer + React Query hook, protegido por policy RLS de admin — mesmo padrão do fluxo "Alterar Plano" existente (`handleChangePlan` em `CompanyDetail.tsx` + migration 100).

Abordagens descartadas: RPC `SECURITY DEFINER` (lógica de negócio sairia do service layer, fora do padrão do projeto) e Edge Function (sem serviço externo envolvido).

## 1. Banco de dados (1 migration)

### 1.1 Nova coluna

```sql
ALTER TABLE public.subscriptions
  ADD COLUMN trial_released_at timestamptz;
```

Semântica:
- `NULL` + `is_trial = true` → empresa **nunca liberada** → tela "Aguardando liberação".
- Preenchida + trial expirado → tela "Trial expirado" (atual `TrialExpired`).
- Preenchida + trial ativo → app normal com banners de aviso (comportamento atual).

### 1.2 Backfill (proteção das empresas existentes)

```sql
UPDATE public.subscriptions
SET trial_released_at = trial_start_date
WHERE is_trial = true AND trial_released_at IS NULL;
```

Todas as assinaturas trial existentes são consideradas "já liberadas" — nada muda para elas.

### 1.3 Atualizar trigger `handle_new_user()`

⚠️ **CUIDADO (memória do projeto):** o trigger foi sobrescrito várias vezes. **Preservar TODA a lógica existente** (CPF, CNPJ, company_users, invited metadata, UPPER() em nomes, onboarding_step). Mudança cirúrgica apenas no INSERT da subscription trial de empresa:

- `trial_end_date`, `end_date`, `renewal_date` → `NOW()` (sem dias automáticos).
- `trial_released_at` → fica `NULL` (não incluir na lista de colunas).
- O restante do INSERT permanece idêntico (`status='trial'`, `is_trial=true`, `trial_start_date=NOW()`, etc.).

`plans.trial_duration_days` **deixa de conceder dias automáticos** a novos cadastros — passa a ser apenas o **valor default sugerido** no input do admin.

### 1.4 RLS

- Verificar se já existe policy de UPDATE admin em `subscriptions` (o fluxo "Alterar Plano" do admin já atualiza subscriptions — provavelmente existe). **Criar apenas se faltar**, no padrão da migration 100:

```sql
CREATE POLICY subscriptions_update_admin ON public.subscriptions
  FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');
```

- Conferir as 4 policies de `notifications` para INSERT por admin (o fluxo "Enviar Notificação" manual já funciona — reusar o mesmo caminho).
- Sempre usar `.select()` após `.update()` para detectar bloqueio silencioso de RLS (memória do projeto).

## 2. Tipos e converters

- `Subscription` (TS): adicionar `trialReleasedAt: string | null`.
- `supabaseConverters.ts` / camada de leitura: mapear `trial_released_at` → `trialReleasedAt`.
- `src/types/database.ts`: adicionar a coluna ao schema da tabela `subscriptions`.

## 3. Service layer + hook

### 3.1 `plansService` — novas operações

```
adminSetTrialPeriod(userId: string, days: number): Promise<Subscription>
adminEndTrial(userId: string): Promise<Subscription>
```

**`adminSetTrialPeriod`** (libera ou estende):
1. Busca a subscription trial do usuário.
   - **Se não existir subscription** (empresa antiga sem registro): cria uma via lógica equivalente ao `createTrialSubscription` existente, com os dias informados pelo admin e `trial_released_at = NOW()`.
2. Calcula a nova data de término:
   - Trial **aguardando ou expirado**: `trial_start_date = hoje`, `trial_end_date = hoje + days`.
   - Trial **ativo**: estende — `trial_end_date = término_atual + days` (start preservado).
3. UPDATE em `subscriptions`: `trial_end_date`, `end_date`, `renewal_date`, `status='trial'`, `is_trial=true`, e `trial_released_at = NOW()` se ainda for NULL. Com `.select()` e erro se 0 linhas.
4. Best-effort (não falha a operação): INSERT em `subscription_history` (auditoria) e INSERT de notificação in-app para o usuário da empresa ("Sua avaliação foi liberada até DD/MM/AAAA" / "...estendida até...").

**`adminEndTrial`** (encerrar agora):
- UPDATE: `trial_end_date = ontem` (precisa ser < hoje, pois `isExpired = daysRemaining < 0` em `trialRules.ts`), `end_date`/`renewal_date` idem. Mantém `trial_released_at` (empresa cai na tela `TrialExpired`, não na de aguardando).
- Best-effort: `subscription_history`.
- Sem notificação automática (encerramento é comunicado por fora, a critério do admin).

### 3.2 Hook React Query

`useAdminSetTrialPeriod` / `useAdminEndTrial` em `usePlansQuery.ts` (ou hook novo), com invalidação de cache: query keys de subscription do usuário + empresa (mesmo padrão do `useChangeSubscriptionPlan`).

## 4. UI 1 — Card "Período de Avaliação" no admin

**Local:** `CompanyDetail.tsx` → aba Assinatura, **entre** o card "Plano Atual" e o `CompanySubscriptionTab`.
**Novo componente:** `src/components/admin/companies/TrialPeriodCard.tsx` (recebe `userId`, `companyName`, `planTrialDefaultDays`).

### 4.1 Estrutura em 3 faixas (recomendação do design-specialist: "informar antes de pedir ação")

**Faixa 1 — Estado atual** (topo, alto contraste). Variantes derivadas de `calculateTrialStatus`/`getWarningLevel` de `@/lib/trialRules` + `trialReleasedAt`:

| Estado | Cor | Ícone | Título | Apoio |
|---|---|---|---|---|
| Aguardando liberação (`trialReleasedAt` NULL) | neutro/`muted` | `Clock` | "Aguardando liberação" | "Esta empresa ainda não teve o período de avaliação liberado." |
| Em avaliação (low/medium) | `cyan` | `CalendarCheck` | "Em avaliação" | "{N} dias restantes · termina em {DD/MM/AAAA}" + barra de progresso fina (`daysElapsed`/`totalDays`) |
| Expirando (high/urgent) | `amber`/`red` (espelha `TrialAlert`) | `AlertTriangle`/`Zap` | "Avaliação terminando" | "Faltam {N} dias. Termina em {DD/MM/AAAA}." |
| Expirado | `red` | `CalendarX` | "Avaliação expirada" | "Encerrou em {DD/MM/AAAA}. A empresa está bloqueada." |
| Assinante pago (`!isTrial`) | `emerald` | `BadgeCheck` | "Assinante ativo" | "Controle de avaliação não se aplica a assinantes pagos." |

Padrão visual: faixa `rounded-lg border border-{cor}-500/30 bg-{cor}-500/5 p-4` com ícone em círculo `bg-{cor}-500/10`. Texto colorido sempre `text-{cor}-600 dark:text-{cor}-400` (contraste WCAG); `text-{cor}-500` só em ícones. Faixa com `role="status"`.

**Faixa 2 — Controles** (escondidos/colapsados no estado "Assinante pago", substituídos por nota em borda tracejada: "Esta empresa possui assinatura paga ativa. O período de avaliação não se aplica."):
- Label: "Dias de avaliação a partir de hoje" (estado aguardando/expirado) ou "Estender em mais X dias" (trial ativo).
- `Input type="number"` `min=1 max=365` `inputMode="numeric"`, default = `plans.trial_duration_days` do plano básico, `aria-describedby` apontando para o preview.
- Chips +7/+15/+30/+90: **definem o valor do input** (toggles com `aria-pressed`), nunca disparam ação. `role="group"` `aria-label="Atalhos de período"`.
- Preview sempre visível antes de confirmar: "Novo término: DD/MM/AAAA" com `aria-live="polite"`. Trial ativo → preview = término atual + dias; senão → hoje + dias. Animação de recomputo via `key={previewDate}` (respeitando `prefers-reduced-motion`).
- Botão primário: "Liberar avaliação" (aguardando/expirado) ou "Estender avaliação" (ativo).
- Micro-legenda: "Esta ação será registrada no histórico da empresa." (`text-xs text-muted-foreground` + ícone `Info`).

**Faixa 3 — Ação destrutiva** (rodapé, `border-t`, recuada): botão "Encerrar agora" estilo `border-red-500/50 text-red-500 hover:bg-red-500/10`. Visível apenas quando o trial está ativo (liberado e não expirado).

### 4.2 Confirmações (AlertDialog shadcn)

- **Liberar:** "Liberar período de avaliação?" / "A empresa terá acesso completo até {DD/MM/AAAA} e receberá uma notificação no app." / ação "Confirmar liberação".
- **Estender:** "Estender avaliação até {DD/MM/AAAA}?"
- **Encerrar:** "Encerrar avaliação agora?" / "A empresa perderá o acesso imediatamente e verá a tela de bloqueio. Esta ação pode ser revertida liberando um novo período." / ação "Encerrar acesso" (vermelho) / cancelar "Manter avaliação".
- ⚠️ Memória do projeto: `AlertDialogAction` fecha sozinho — handler async usa `e.preventDefault()` e fecha no `finally`.

### 4.3 Feedback

- Toasts sonner: "Avaliação liberada até {data}." · "Avaliação estendida até {data}." · "Avaliação encerrada." · erro "Não foi possível atualizar o período. Tente novamente."
- Registrar `AdminAction` na timeline local da aba Histórico (mesmo padrão do `handleChangePlan`), ex.: "Avaliação liberada por 30 dias (até 10/07/2026)".

## 5. UI 2 — Tela "Aguardando liberação"

**Novo arquivo:** `src/pages/empresa/AwaitingRelease.tsx` (lazy, como `TrialExpired`).

### 5.1 Roteamento no guard

`TrialGuard.tsx` ganha uma ramificação ANTES da checagem de expirado:

```
isTrial && trialReleasedAt == null  → AwaitingRelease (bloqueia, mesmas rotas liberadas)
isTrial && isExpired                → TrialExpired (atual)
```

`useTrialStatus` passa a expor `trialReleasedAt`/`awaitingRelease` (lido da subscription que o hook já carrega). `ALLOWED_EXPIRED_PATHS` vale para os dois bloqueios.

### 5.2 Visual (recomendações do design-specialist — separar "ainda não" de "acabou")

Reaproveita o esqueleto do `TrialExpired` (container, seletor de período, grid de 3 planos pagos com `CheckoutButton`). Muda hero, bloco intermediário e copy:

1. **Hero acolhedor:** gradiente suave `from-cyan-500/10 via-background to-emerald-500/10`, ícone `CircleCheckBig` emerald em círculo `bg-emerald-500/10` (NUNCA cadeado/vermelho), `h1` "Sua conta foi criada com sucesso!" em `text-foreground`, subtítulo "Nossa equipe vai liberar seu período de avaliação em instantes. Você receberá um aviso assim que estiver tudo pronto."
2. **Timeline de 3 passos** (`<ol>` semântica, dots no padrão do Histórico): "Conta criada" (✓ emerald) → "Aguardando liberação" (dot cyan com `animate-ping` + `motion-reduce:hidden`) → "Acesso completo" (cinza, `opacity-60`). Nota opcional: "Liberações costumam levar poucos minutos em horário comercial."
3. **Divisor + planos:** "Não quer esperar? Assine um plano e comece a recrutar agora mesmo." + grid idêntico ao `TrialExpired`.
4. **Rodapé:** link "Acessar configurações da conta" (mantido) + opção de sair.

Vocabulário proibido nesta tela: "bloqueado", "encerrado", "expirado", "não perca". Tom = espera e oportunidade.

Acessibilidade: um único `h1` com foco programático ao montar (`tabIndex={-1}` + focus), seções em `h2`, estado dos passos não depende só de cor (✓/número/opacity).

## 6. Notificação in-app

Ao liberar/estender, inserir notificação para o usuário da empresa pelo mesmo caminho do "Enviar Notificação" manual do admin (infra existente — `useSendManualNotification`/service de notificações):
- Título: "Período de avaliação liberado" / "Período de avaliação estendido"
- Mensagem: "Sua avaliação foi liberada até DD/MM/AAAA. Bom recrutamento!"
- Best-effort: falha na notificação não desfaz a liberação.

## 7. O que NÃO muda

- `src/lib/trialRules.ts` (limiares, mensagens, cálculo) — intocado.
- Comportamento do `TrialGuard` para trials liberados/expirados normais.
- Empresas atualmente em trial (backfill as protege).
- Candidatos (não têm trial) e fluxo Stripe/checkout.
- `TrialExpired.tsx` permanece como está (continua atendendo trials que expiraram de verdade).

## 8. Edge cases

| Caso | Comportamento |
|---|---|
| Empresa sem registro em `subscriptions` | Card mostra "Aguardando liberação"; "Liberar avaliação" cria a subscription trial com os dias informados |
| Admin libera empresa que está logada na tela de aguardando | Próximo refetch da subscription (focus/invalidate) libera o app; notificação in-app chega pelo sino |
| Dias fora de 1–365 | Validação inline no input (`aria-invalid`), botão desabilitado |
| Assinante pago | Faixa emerald + controles substituídos por nota explicativa (não esconder o card) |
| "Encerrar agora" em trial ativo | `trial_end_date = ontem` → `isExpired` verdadeiro → cai na `TrialExpired` (não na de aguardando, pois `trial_released_at` permanece) |
| RLS bloqueando UPDATE silenciosamente | `.select()` após update; 0 linhas → erro + toast |
| Empresa convidada (team member, `invited` metadata) | Trigger não cria subscription para membros — fluxo inalterado |

## 9. Riscos

- **Trigger `handle_new_user()`:** historicamente sobrescrito com perda de lógica. Mitigação: partir da versão deployada atual (ler do banco via MCP antes de editar), diff cirúrgico.
- **Conversão snake_case/camelCase:** `trialReleasedAt` precisa estar no converter; em componentes que consomem direto, usar acesso dual (`sub.trial_released_at ?? sub.trialReleasedAt`).
- **Cache do React Query:** liberar trial precisa invalidar a query de subscription usada pelo `useTrialStatus` da empresa (chave por `user.id`) — garantir que a invalidação no admin não conflite com a sessão da empresa (são sessões separadas; o refetch da empresa acontece por `refetchOnWindowFocus`/staleTime).
