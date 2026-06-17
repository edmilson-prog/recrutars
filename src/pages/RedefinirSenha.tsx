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
