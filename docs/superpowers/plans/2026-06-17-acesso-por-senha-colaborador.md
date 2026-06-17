# Acesso por senha (onboarding Fase 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que qualquer usuário defina/redefina a própria senha, corrigindo o reset quebrado (que caía na home) e garantindo que o convite caia na tela de definição de senha.

**Architecture:** Nova página pública `/redefinir-senha` que captura a sessão de recuperação criada pelo `detectSessionInUrl` (flow implícito) e mostra um formulário de nova senha via `supabase.auth.updateUser`. O `AuthContext.resetPassword` passa a apontar para essa rota. O convite continua usando a tela existente `/aceitar-convite`; o que destrava ambos os fluxos é corrigir a allowlist de Redirect URLs no painel Supabase.

**Tech Stack:** React 18 + TypeScript + Vite, React Router v6, Supabase Auth (`@supabase/supabase-js` flow implícito, `detectSessionInUrl: true`), shadcn/ui, framer-motion.

## Global Constraints

- **Pré-requisito de config (painel Supabase, ação do usuário):** Authentication → URL Configuration. Site URL = `https://recrutars.com.br`. Redirect URLs (allowlist) deve conter, em produção e dev: `https://recrutars.com.br/redefinir-senha`, `https://recrutars.com.br/aceitar-convite`, `https://recrutars.com.br/auth/confirm`, `http://localhost:3000/redefinir-senha`, `http://localhost:3000/aceitar-convite`, `http://localhost:3000/auth/confirm`. Sem isso o Supabase recai no Site URL (home) e os links continuam quebrados.
- **Flow implícito:** o cliente em `src/lib/supabase.ts` não define `flowType` e usa `detectSessionInUrl: true`. Logo o link de recovery chega como hash (`#access_token=...&type=recovery`) e a sessão é criada automaticamente ao carregar a página — `useAuth().user` torna-se truthy. Não usar `verifyOtp` nem PKCE.
- **Copy em pt-BR com acentuação correta** (ã, ç, é, í, ó, ú, â, ê, ô) — UTF-8. Esta página nova deve usar acentos corretos.
- **Sem framework de testes** no projeto (sem `vitest`/`jest`, sem script `test`). Verificação por tarefa = `npm run lint` + `npm run build` (checagem TypeScript) + verificação no browser preview (dev server já roda em `http://localhost:3000`).
- **Seguir os padrões existentes** de `src/pages/AceitarConvite.tsx` (layout, máquina de estados, `ForceLightTheme`) e `src/pages/AuthConfirm.tsx` (redirect por `user_metadata.type`).
- **Imports diretos** no `App.tsx` (não lazy), como `import AceitarConvite from "./pages/AceitarConvite";`.

---

### Task 0: Configurar Redirect URLs no painel Supabase (ação manual do usuário)

Não há código nesta tarefa — é a configuração que destrava todos os fluxos. Deve ser feita antes da validação end-to-end das Tasks 1 e 2, mas pode ser feita em paralelo ao desenvolvimento.

- [ ] **Step 1: Aplicar a configuração no painel**

No painel Supabase do projeto `filackbesialiapjwijb` → **Authentication → URL Configuration**:
1. Confirmar **Site URL** = `https://recrutars.com.br`.
2. Em **Redirect URLs**, adicionar (se ainda não existirem):
   - `https://recrutars.com.br/redefinir-senha`
   - `https://recrutars.com.br/aceitar-convite`
   - `https://recrutars.com.br/auth/confirm`
   - `http://localhost:3000/redefinir-senha`
   - `http://localhost:3000/aceitar-convite`
   - `http://localhost:3000/auth/confirm`
3. Salvar.

Expected: a lista de Redirect URLs contém as 6 entradas acima.

---

### Task 1: Criar a página `RedefinirSenha` e registrar a rota `/redefinir-senha`

**Files:**
- Create: `src/pages/RedefinirSenha.tsx`
- Modify: `src/App.tsx` (import junto à linha 28; `<Route>` junto à linha 256)

**Interfaces:**
- Consumes:
  - `useAuth(): { user: User | null; loading: boolean }` de `@/contexts/AuthContext`
  - `PasswordStrengthIndicator({ password: string })` (named export) de `@/components/invite/PasswordStrengthIndicator`
  - `supabase.auth.updateUser({ password })` e `supabase.auth.getUser()` de `@/lib/supabase`
  - `ForceLightTheme` de `@/components/theme/ForceLightTheme`
- Produces:
  - Rota pública `GET /redefinir-senha` renderizando `RedefinirSenha` (default export)

- [ ] **Step 1: Criar `src/pages/RedefinirSenha.tsx`**

```tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';
import { PasswordStrengthIndicator } from '@/components/invite/PasswordStrengthIndicator';

type PageState = 'loading' | 'set-password' | 'success' | 'error';

export default function RedefinirSenha() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      // detectSessionInUrl já processou o hash de recuperação e criou a sessão.
      setPageState('set-password');
    } else {
      // Dá tempo extra para o detectSessionInUrl processar o hash.
      const timeout = setTimeout(() => {
        if (!user) setPageState('error');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [user, loading]);

  const redirectByType = async () => {
    const { data } = await supabase.auth.getUser();
    const userType = data?.user?.user_metadata?.type as string | undefined;
    if (userType === 'company') navigate('/empresa', { replace: true });
    else if (userType === 'admin') navigate('/admin', { replace: true });
    else navigate('/candidato', { replace: true });
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPageState('success');
      setTimeout(() => { void redirectByType(); }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao redefinir a senha. Tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Validando o link...</h1>
            <p className="text-muted-foreground">Aguarde enquanto preparamos a redefinição de senha.</p>
          </div>
        );

      case 'set-password':
        return (
          <>
            <h1 className="text-3xl font-bold text-foreground mb-2">Redefinir senha</h1>
            <p className="text-muted-foreground mb-8">
              Escolha uma nova senha para acessar sua conta.
            </p>

            <form onSubmit={handleSetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>
                <PasswordStrengthIndicator password={password} />
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? 'Redefinindo...' : 'Redefinir senha'}
                {!submitting && <ArrowRight className="w-5 h-5" />}
              </Button>
            </form>
          </>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Senha redefinida com sucesso!</h1>
            <p className="text-muted-foreground">
              Redirecionando para o painel...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Link inválido ou expirado</h1>
            <p className="text-muted-foreground mb-6">
              Este link de redefinição pode ter expirado ou já foi utilizado. Solicite um novo link para continuar.
            </p>
            <Button asChild>
              <Link to="/login">
                Solicitar novo link
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <ForceLightTheme />
      <div className="min-h-screen flex">
        {/* Left - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Link to="/" className="flex items-center mb-8">
              <img
                src="/images/logo-horizontal.png"
                alt="RecrutaRS - Consultoria e Gestão"
                className="h-12 w-auto"
              />
            </Link>

            {renderContent()}
          </motion.div>
        </div>

        {/* Right - Visual */}
        <div className="hidden lg:block flex-1 relative overflow-hidden">
          <img
            src="/images/login-bg.jpg"
            alt="Profissionais de negócios"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/75 to-primary/50" />
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="text-center text-primary-foreground"
            >
              <h2 className="text-4xl font-bold mb-4">
                Acesse sua conta com segurança
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-md mx-auto">
                Defina uma nova senha e retome o acesso à plataforma.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Registrar o import no `src/App.tsx`**

Logo após a linha 28 (`import AceitarConvite from "./pages/AceitarConvite";`), adicionar:

```tsx
import RedefinirSenha from "./pages/RedefinirSenha";
```

- [ ] **Step 3: Registrar a rota no `src/App.tsx`**

Logo após a linha 256 (`<Route path="/aceitar-convite" element={<AceitarConvite />} />`), adicionar:

```tsx
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
```

- [ ] **Step 4: Rodar o lint**

Run: `npm run lint`
Expected: sem novos erros relacionados a `RedefinirSenha.tsx` ou `App.tsx`.

- [ ] **Step 5: Rodar o build (checagem TypeScript)**

Run: `npm run build`
Expected: build conclui sem erros de tipo.

- [ ] **Step 6: Verificar no browser preview**

Navegar para `http://localhost:3000/redefinir-senha` (sem token de recuperação).
Expected: estado `loading` por ~3s e depois o estado `error` ("Link inválido ou expirado") com o botão "Solicitar novo link" apontando para `/login`. Sem erros no console. Layout idêntico ao `/aceitar-convite` (painel visual à direita, logo, `ForceLightTheme`).

- [ ] **Step 7: Commit**

```bash
git add src/pages/RedefinirSenha.tsx src/App.tsx
git commit -m "feat(auth): add /redefinir-senha page for password recovery"
```

---

### Task 2: Apontar `resetPassword` para `/redefinir-senha` e validar os fluxos

**Files:**
- Modify: `src/contexts/AuthContext.tsx:444-445`

**Interfaces:**
- Consumes: a rota `/redefinir-senha` criada na Task 1.
- Produces: o e-mail de "Esqueci a senha" passa a redirecionar para `/redefinir-senha`.

- [ ] **Step 1: Alterar o `redirectTo` do `resetPassword`**

Em `src/contexts/AuthContext.tsx`, no método `resetPassword` (linhas 443-448), trocar:

```tsx
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };
```

por:

```tsx
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) throw error;
  };
```

- [ ] **Step 2: Rodar o lint**

Run: `npm run lint`
Expected: sem novos erros em `AuthContext.tsx`.

- [ ] **Step 3: Rodar o build (checagem TypeScript)**

Run: `npm run build`
Expected: build conclui sem erros de tipo.

- [ ] **Step 4: Verificar que o reset dispara com o novo destino**

No browser preview: ir para `http://localhost:3000/login` → "Esqueci a senha" → informar um e-mail → enviar. Na aba Network, confirmar a chamada `POST .../auth/v1/recover` com corpo contendo `redirect_to` apontando para `.../redefinir-senha`.
Expected: a requisição usa `/redefinir-senha` como `redirect_to`.

- [ ] **Step 5: Validação end-to-end manual (depende da Task 0 aplicada)**

Com a allowlist da Task 0 já configurada:
1. **Reset:** logout → "Esqueci a senha" com um e-mail real → abrir o link do e-mail → deve cair em `/redefinir-senha` (estado `set-password`) → definir nova senha → redireciona ao painel → logout → login com a nova senha funciona.
2. **Convite:** convidar um e-mail novo pela tela de equipe → abrir o link do e-mail → deve cair em `/aceitar-convite` (não na home) → definir senha → acessa a empresa.
3. **Link inválido:** abrir um link de reset já usado → estado `error` com "Solicitar novo link".

Expected: os três cenários passam. (Este passo é manual e depende de e-mail real + Task 0; documentar o resultado no PR.)

- [ ] **Step 6: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "fix(auth): point password reset redirect to /redefinir-senha"
```

---

## Notas de escopo

- **`/aceitar-convite` não muda.** A tela de convite já tem o formulário de senha (`pageState === 'set-password'`). O que a destrava é a Task 0 (allowlist). A validação está no Step 5 da Task 2.
- **"Solicitar novo link" aponta para `/login`** (mesmo padrão do estado de erro do `AceitarConvite`), onde o usuário usa "Esqueci a senha". Deep-link direto para a view de reset do `Login` fica fora de escopo para manter a mudança mínima.
- **Redirect por tipo de usuário** no sucesso usa `supabase.auth.getUser().user_metadata.type` (mesmo padrão do `AuthConfirm`), cobrindo reset de candidato, empresa e admin.
