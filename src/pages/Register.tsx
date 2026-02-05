import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, ArrowRight, Mail, Lock, UserIcon, Phone, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';

type AccountType = 'company' | 'candidate';

export default function Register() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountType) {
      setError('Selecione o tipo de conta.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await signUp({
        email,
        password,
        name,
        phone: phone || undefined,
        type: accountType,
      });

      if (result.needsEmailConfirmation) {
        setRegisteredEmail(email);
        setShowEmailVerification(true);
        return;
      }

      const redirectPath = accountType === 'candidate' ? '/candidato' : '/empresa';
      navigate(redirectPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';

      if (message.includes('already registered') || message.includes('already been registered')) {
        setError('Este email ja esta cadastrado. Faca login.');
      } else if (message.includes('Invalid email')) {
        setError('Email invalido. Verifique o formato.');
      } else if (message.includes('Password') || message.includes('password')) {
        setError('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      });
      if (resendError) throw resendError;
      setResendSuccess(true);
    } catch {
      setError('Erro ao reenviar email. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  // ── Email Verification Screen ──
  if (showEmailVerification) {
    return (
      <>
        <ForceLightTheme />
        <div className="h-screen flex overflow-hidden">
          <div className="hidden lg:block flex-1 relative overflow-hidden">
            <img
              src="/images/register-bg.jpg"
              alt="Empresaria usando interface de rede social"
              className="absolute inset-0 w-full h-full object-cover object-[80%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/75 to-primary/50" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-background" />
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md text-center"
            >
              <Link to="/" className="flex items-center justify-center mb-8">
                <img
                  src="/images/logo-horizontal.png"
                  alt="RecrutaRS - Consultoria e Gestao"
                  className="h-12 w-auto"
                />
              </Link>

              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">Verifique seu email</h1>
              <p className="text-muted-foreground mb-2">
                Enviamos um link de confirmacao para:
              </p>
              <p className="font-semibold text-foreground mb-6">{registeredEmail}</p>
              <p className="text-sm text-muted-foreground mb-8">
                Clique no link do email para ativar sua conta. Verifique tambem a pasta de spam.
              </p>

              {resendSuccess && (
                <Alert className="mb-4 text-left">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>Email reenviado com sucesso!</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-4 text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={resending}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", resending && "animate-spin")} />
                  {resending ? 'Reenviando...' : 'Reenviar email'}
                </Button>

                <Button asChild className="w-full">
                  <Link to="/login">
                    Ja confirmei, ir para login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Usou o email errado?{' '}
                <button
                  type="button"
                  onClick={() => { setShowEmailVerification(false); setError(''); setResendSuccess(false); }}
                  className="text-primary font-medium hover:underline"
                >
                  Voltar ao cadastro
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // ── Registration Form ──
  return (
    <>
      <ForceLightTheme />
      <div className="h-screen flex overflow-hidden">
        {/* Left - Visual */}
        <div className="hidden lg:block flex-1 relative overflow-hidden">
          <img
            src="/images/register-bg.jpg"
            alt="Empresaria usando interface de rede social"
            className="absolute inset-0 w-full h-full object-cover object-[80%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/75 to-primary/50" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-background" />
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
                Junte-se a milhares de profissionais
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-md mx-auto">
                Crie sua conta e tenha acesso as melhores oportunidades do mercado gaucho.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
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

            <h1 className="text-3xl font-bold text-foreground mb-2">Criar conta</h1>
            <p className="text-muted-foreground mb-6">
              Escolha seu tipo de conta para comecar.
            </p>

            {/* Account Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setAccountType('company')}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                  accountType === 'company'
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                  accountType === 'company' ? "gradient-primary" : "bg-muted"
                )}>
                  <Building2 className={cn(
                    "w-7 h-7",
                    accountType === 'company' ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <span className="font-semibold text-foreground">Empresa</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('candidate')}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                  accountType === 'candidate'
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                  accountType === 'candidate' ? "gradient-primary" : "bg-muted"
                )}>
                  <User className={cn(
                    "w-7 h-7",
                    accountType === 'candidate' ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <span className="font-semibold text-foreground">Candidato</span>
              </button>
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{accountType === 'company' ? 'Nome da empresa' : 'Nome completo'}</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={accountType === 'company' ? 'Sua Empresa Ltda' : 'Joao da Silva'}
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
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
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimo 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
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
                disabled={!accountType || submitting}
              >
                {submitting ? 'Criando conta...' : 'Criar conta'}
                {!submitting && <ArrowRight className="w-5 h-5" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Ja tem uma conta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Fazer login
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Ao criar uma conta, voce concorda com nossos{' '}
              <Link to="/termos-de-uso" className="underline">Termos de Uso</Link> e{' '}
              <Link to="/politica-de-privacidade" className="underline">Politica de Privacidade</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
