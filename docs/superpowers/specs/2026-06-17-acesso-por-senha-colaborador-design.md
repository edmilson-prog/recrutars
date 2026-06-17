# Design — Fase 1: Acesso por senha (onboarding de colaboradores)

**Data:** 2026-06-17
**Status:** Aprovado (design)
**Épico:** Onboarding de colaboradores convidados
**Fase:** 1 de 4 — *Acesso por senha*

---

## 1. Contexto e problema

Colaboradores convidados por e-mail entram na plataforma por um link que faz **login automático**, sem nunca definirem uma senha. Resultado: o usuário fica logado mas não conhece a própria senha. Ao usar "Esqueci a senha", o e-mail chega, mas o link de redefinição **cai na home do site** e nada acontece — o usuário fica sem qualquer caminho para criar sua senha.

Causa raiz (duas partes):

1. **`resetPassword` redireciona para uma rota sem formulário de senha.** `AuthContext.resetPassword` envia `redirectTo: ${origin}/login`. A tela `/login` não captura a sessão de recuperação nem oferece o campo de nova senha.
2. **Não existe rota de redefinição de senha.** Não há `/redefinir-senha`. Como o destino do link de recovery não está na allowlist de *Redirect URLs* do Supabase, o Auth aplica o fallback para o **Site URL** (a home).

O cliente Supabase usa **flow implícito** (`src/lib/supabase.ts` não define `flowType`, e `detectSessionInUrl: true`). Logo, os links de recovery/invite chegam como **hash fragment** (`#access_token=...&type=recovery`) e o `supabase-js` cria a sessão automaticamente ao carregar a página de destino, disparando o evento `PASSWORD_RECOVERY` no `onAuthStateChange`.

---

## 2. Objetivo da Fase 1

Garantir que **todo usuário consiga definir/redefinir a própria senha**, cobrindo dois fluxos:

- **Reset de senha** ("Esqueci a senha") → cai numa tela dedicada com formulário de nova senha.
- **Convite de colaborador** → cai na tela de definição de senha já existente (`/aceitar-convite`), em vez da home.

Fora de escopo desta fase (vão para 2–4): perfil do colaborador (cargo/telefone/foto), preferências (tema/notificações/WhatsApp), tour guiado, `onboarding_step`/guard para membros.

---

## 3. Pré-requisito de configuração (painel Supabase)

Aplicado manualmente pelo usuário em **Authentication → URL Configuration**. Sem isto, os links continuam caindo na home (fallback para Site URL).

- **Site URL:** confirmar que aponta para produção (`https://recrutars.com.br`).
- **Redirect URLs (allowlist)** — adicionar, em produção e em dev:
  - `https://recrutars.com.br/redefinir-senha`
  - `https://recrutars.com.br/aceitar-convite`
  - `https://recrutars.com.br/auth/confirm`
  - `http://localhost:3000/redefinir-senha`
  - `http://localhost:3000/aceitar-convite`
  - `http://localhost:3000/auth/confirm`

> O Supabase só redireciona para URLs que casam com a allowlist; qualquer outra recai no Site URL. Por isso o reset hoje "cai na home".

---

## 4. Arquitetura da solução

### 4.1 Nova rota pública `/redefinir-senha`

Nova página `src/pages/RedefinirSenha.tsx`, registrada como rota **pública** no `App.tsx` (junto de `/auth/confirm` e `/aceitar-convite`, por volta da linha 253–256). Espelha o visual de `AceitarConvite` (mesmo layout, tema forçado claro se aplicável, indicador de força de senha reutilizado de `src/components/invite/PasswordStrengthIndicator`).

**Responsabilidade única:** capturar a sessão de recuperação e permitir que o usuário defina uma nova senha. Não cuida de convite, não cuida de login normal.

**Máquina de estados:**

| Estado | Quando | UI |
|--------|--------|-----|
| `loading` | montagem, aguardando o `detectSessionInUrl`/evento `PASSWORD_RECOVERY` resolver | spinner |
| `set-password` | sessão de recuperação válida detectada | formulário: nova senha + confirmar senha + força |
| `success` | `updateUser` ok | confirmação + redireciona ao dashboard correto |
| `error` | sem sessão válida / link expirado ou já usado | mensagem + botão "Solicitar novo link" (volta ao fluxo de reset) |

**Detecção da sessão:** a página assina `supabase.auth.onAuthStateChange` localmente e também checa `supabase.auth.getSession()` na montagem (cobre a corrida em que o evento dispara antes do componente montar). Há um *timeout* curto (ex.: 3 s) — se nenhuma sessão de recuperação surgir, vai para `error`.

**Submit:** `supabase.auth.updateUser({ password })`. Em sucesso, o usuário já está autenticado pela sessão de recuperação; redireciona para o dashboard conforme o tipo de usuário (mesma lógica de destino pós-login já usada no projeto), com toast de sucesso. (Decisão: **não** forçar re-login — fluxo mais curto; a sessão de recuperação é legítima.)

### 4.2 `AuthContext.resetPassword` → novo destino

`src/contexts/AuthContext.tsx` (linhas 443–448): trocar
`redirectTo: ${window.location.origin}/login` por
`redirectTo: ${window.location.origin}/redefinir-senha`.

### 4.3 Convite → tela de senha (sem mudança de código)

O serviço já envia `redirect_url: ${origin}/aceitar-convite` (`companyInvitesService.ts`), e `/aceitar-convite` já tem o formulário de definição de senha (`pageState === 'set-password'` → `updateUser({ password })`). Com a allowlist corrigida (seção 3), o link para de cair na home. **Apenas validar**; nenhum código novo é necessário aqui, salvo ajuste pontual de robustez se a validação revelar problema.

### 4.4 `onAuthStateChange` global — não interferir

O `onAuthStateChange` global (`AuthContext`, linhas 357–360) apenas chama `loadUserData(session)` e **não** redireciona. Como `/redefinir-senha` é rota pública (sem `ProtectedRoute`), o usuário não é levado para fora da página ao receber a sessão de recuperação. O componente controla a UI localmente. **Nenhuma mudança no handler global é necessária.**

---

## 5. Tratamento de erros e edge cases

- **Link expirado / já usado / inválido:** estado `error` com mensagem clara e botão "Solicitar novo link" (reabre o fluxo de "Esqueci a senha").
- **Sessão de recuperação não chega (timeout):** mesmo estado `error`.
- **Duplo clique no link / página recarregada após uso:** tratado pelo timeout + ausência de sessão → `error`.
- **Colaborador do "limbo" sem e-mail confirmado:** não usa o reset; usa o **convite** (`/aceitar-convite`), que define a senha e confirma o e-mail no mesmo passo.
- **Senha fraca:** validação no formulário (indicador de força + regra mínima), bloqueando o submit antes de chamar `updateUser`.

---

## 6. Plano de testes (manual, ambiente real)

1. **Reset de senha (usuário existente):**
   Logout → "Esqueci a senha" → e-mail chega → clicar no link → cai em `/redefinir-senha` → definir nova senha → redireciona ao dashboard → logout → login com a nova senha funciona.
2. **Convite de colaborador novo:**
   Convidar e-mail novo → e-mail chega → clicar no botão → cai em `/aceitar-convite` (não na home) → definir senha → entra na empresa.
3. **Link inválido/expirado:**
   Abrir `/redefinir-senha` sem token (ou com token usado) → estado `error` com "Solicitar novo link".
4. **Dev (localhost:3000):** repetir 1 e 2 com as URLs de dev na allowlist.

---

## 7. Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/RedefinirSenha.tsx` | **novo** — página de redefinição de senha |
| `src/App.tsx` | **edição** — registrar rota pública `/redefinir-senha` (~linha 256) |
| `src/contexts/AuthContext.tsx` | **edição** — `resetPassword.redirectTo` → `/redefinir-senha` (linha 444–445) |
| `src/pages/AceitarConvite.tsx` | **validar** — ajuste pontual só se necessário |
| Painel Supabase (Auth → URL Configuration) | **config manual** — Site URL + Redirect URLs (seção 3) |

---

## 8. Critérios de aceite

- [ ] Reset de senha leva a `/redefinir-senha` com formulário funcional; nova senha permite login.
- [ ] Convite leva a `/aceitar-convite` (não à home); senha definida dá acesso à empresa.
- [ ] Link inválido/expirado mostra erro com opção de solicitar novo link.
- [ ] Allowlist de Redirect URLs documentada e aplicada pelo usuário.
- [ ] Nenhuma regressão no login normal nem no `onAuthStateChange` global.
