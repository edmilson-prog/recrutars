import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, AlertCircle, ArrowLeft, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';

type View = 'login' | 'magic-link' | 'reset';

export default function Login() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithMagicLink, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      localStorage.setItem('rememberMe', String(rememberMe));
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      await login(email, password);
      // Redirect handled by AuthContext + RedirectIfAuthenticated
    } catch {
      setError('Email ou senha incorretos. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Informe seu email.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      setError('Erro ao enviar email de recuperacao. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Informe seu email.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await loginWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('Signups not allowed for otp') || message.includes('not allowed')) {
        setError('Nenhuma conta encontrada com este email. Cadastre-se primeiro.');
      } else {
        setError('Erro ao enviar link magico. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchToReset = () => {
    setView('reset');
    setError('');
    setResetSent(false);
  };

  const switchToMagicLink = () => {
    setView('magic-link');
    setError('');
    setMagicLinkSent(false);
  };

  const switchToLogin = () => {
    setView('login');
    setError('');
    setResetSent(false);
    setMagicLinkSent(false);
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

            {view === 'login' ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo de volta</h1>
                <p className="text-muted-foreground mb-8">
                  Entre com seu email e senha para acessar a plataforma.
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Senha</Label>
                      <button
                        type="button"
                        onClick={switchToReset}
                        className="text-sm text-secondary hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(v) => {
                        const checked = !!v;
                        setRememberMe(checked);
                        if (!checked) {
                          localStorage.removeItem('savedEmail');
                        }
                      }}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      Lembrar-me
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Entrando...' : 'Entrar'}
                    {!submitting && <ArrowRight className="w-5 h-5" />}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={switchToMagicLink}
                  disabled
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Entrar com link magico
                </Button>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Nao tem uma conta?{' '}
                  <Link to="/cadastro" className="text-primary font-medium hover:underline">
                    Cadastre-se
                  </Link>
                </p>
              </>
            ) : view === 'magic-link' ? (
              <>
                <button
                  onClick={switchToLogin}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para login
                </button>

                <h1 className="text-3xl font-bold text-foreground mb-2">Link magico</h1>
                <p className="text-muted-foreground mb-8">
                  Receba um link de acesso direto no seu email — sem precisar de senha.
                </p>

                {magicLinkSent ? (
                  <div className="p-6 bg-muted/50 rounded-xl text-center">
                    <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="text-foreground font-medium mb-2">Link enviado!</p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Verifique sua caixa de entrada em <strong>{email}</strong>.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Clique no link do email para acessar a plataforma automaticamente.
                    </p>
                    <Button
                      variant="outline"
                      onClick={switchToLogin}
                      className="mt-4"
                    >
                      Voltar para login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleMagicLink} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="magic-email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.trim())}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? 'Enviando...' : 'Enviar link magico'}
                      {!submitting && <ArrowRight className="w-5 h-5" />}
                    </Button>
                  </form>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={switchToLogin}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para login
                </button>

                <h1 className="text-3xl font-bold text-foreground mb-2">Recuperar senha</h1>
                <p className="text-muted-foreground mb-8">
                  Informe seu email para receber instrucoes de recuperacao.
                </p>

                {resetSent ? (
                  <div className="p-6 bg-muted/50 rounded-xl text-center">
                    <p className="text-foreground font-medium mb-2">Email enviado!</p>
                    <p className="text-sm text-muted-foreground">
                      Se o email existir em nossa base, voce recebera instrucoes para redefinir sua senha.
                    </p>
                    <Button
                      variant="outline"
                      onClick={switchToLogin}
                      className="mt-4"
                    >
                      Voltar para login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reset-email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value.trim())}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? 'Enviando...' : 'Enviar instrucoes'}
                      {!submitting && <ArrowRight className="w-5 h-5" />}
                    </Button>
                  </form>
                )}
              </>
            )}
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
                Conecte-se aos melhores talentos
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-md mx-auto">
                Plataforma completa de recrutamento com avaliacao comportamental e matching inteligente.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
