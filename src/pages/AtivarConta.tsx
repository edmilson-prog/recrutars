/**
 * AtivarConta
 * PRD-081: Account activation page via email fallback link
 * Route: /ativar-conta?token_hash=xxx
 * Pattern: Same as AceitarConvite.tsx (loading → set-password → success → error)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrengthIndicator } from '@/components/invite/PasswordStrengthIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';

type PageState = 'loading' | 'set-password' | 'success' | 'error';

export default function AtivarConta() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenHash = searchParams.get('token_hash');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestingNewLink, setRequestingNewLink] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      setPageState('set-password');
      return;
    }

    if (!tokenHash) {
      setPageState('error');
      return;
    }

    // Verify OTP from the token_hash
    async function verifyToken() {
      try {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: 'magiclink',
        });

        if (otpError) {
          setPageState('error');
          return;
        }

        setPageState('set-password');
      } catch {
        setPageState('error');
      }
    }

    // Small delay to allow auth state to settle
    const timeout = setTimeout(() => {
      if (!user) verifyToken();
    }, 500);

    return () => clearTimeout(timeout);
  }, [user, loading, tokenHash]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha deve ter no minimo 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // Activate profile
      if (user?.id) {
        await supabase.functions.invoke('process-collaborator-invite', {
          body: { action: 'activate', user_id: user.id },
        });
      }

      setPageState('success');
      setTimeout(() => navigate('/candidato/gauge-pro/resultado', { replace: true }), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao definir senha. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestNewLink = async () => {
    setRequestingNewLink(true);
    // We don't have the email here, so redirect to login
    // In production, we'd show an email input field
    navigate('/login');
  };

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Validando seu acesso...</h1>
            <p className="text-muted-foreground">Aguarde enquanto verificamos seu link de ativacao.</p>
          </div>
        );

      case 'set-password':
        return (
          <>
            <h1 className="text-3xl font-bold text-foreground mb-2">Ative sua conta</h1>
            <p className="text-muted-foreground mb-8">
              Defina uma senha para acessar seus resultados e a plataforma RecrutaRS.
            </p>

            <form onSubmit={handleSetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimo 8 caracteres"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Ativando conta...' : 'Ativar conta e ver resultado'}
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Conta ativada com sucesso!</h1>
            <p className="text-muted-foreground">
              Redirecionando para o seu resultado...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Link invalido ou expirado</h1>
            <p className="text-muted-foreground mb-6">
              Este link de ativacao pode ter expirado ou ja foi utilizado.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleRequestNewLink} disabled={requestingNewLink}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Solicitar novo link
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">
                  Ir para o login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
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
                alt="RecrutaRS - Consultoria e Gestao"
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
            alt="Profissionais de negocios"
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
                Seu perfil comportamental esta pronto
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-md mx-auto">
                Ative sua conta para acessar seus resultados e explorar a plataforma.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
