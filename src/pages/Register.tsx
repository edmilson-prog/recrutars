import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, ArrowRight, ArrowLeft, Mail, Lock, UserIcon, Phone, AlertCircle, CheckCircle2, RefreshCw, Search, Loader2, MapPin, Timer, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';
import { maskCNPJInput, stripCNPJ, isValidCNPJ, lookupCNPJ } from '@/lib/cnpj';
import type { CnpjLookupData } from '@/lib/cnpj';
import { CandidateRegistrationForm } from '@/components/onboarding/CandidateRegistrationForm';

type AccountType = 'company' | 'candidate';
type CompanyStep = 'cnpj' | 'confirm' | 'credentials';

const COOLDOWN_SECONDS = 15;

export default function Register() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  // Shared credentials
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Email verification
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  // Candidate only (name state kept for company flow display name fallback)
  const [name] = useState('');
  // Company CNPJ flow (PRD-078)
  const [companyStep, setCompanyStep] = useState<CompanyStep>('cnpj');
  const [cnpjInput, setCnpjInput] = useState('');
  const [cnpjData, setCnpjData] = useState<CnpjLookupData | null>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // ── Cooldown timer ──
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // ── Reset company state when switching type ──
  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    setError('');
    setCnpjError('');
    if (type === 'company') {
      setCompanyStep('cnpj');
      setCnpjData(null);
      setCnpjInput('');
    }
  };

  // ── CNPJ input handler with mask ──
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJInput(e.target.value);
    setCnpjInput(masked);
    setCnpjError('');
  };

  // ── Start cooldown ──
  const startCooldown = useCallback(() => {
    setCooldownSeconds(COOLDOWN_SECONDS);
  }, []);

  // ── Lookup CNPJ ──
  const handleCnpjLookup = async () => {
    setCnpjError('');
    const digits = stripCNPJ(cnpjInput);

    if (digits.length !== 14) {
      setCnpjError('CNPJ deve ter 14 digitos.');
      return;
    }

    if (!isValidCNPJ(digits)) {
      setCnpjError('CNPJ invalido. Verifique os digitos.');
      return;
    }

    setCnpjLoading(true);

    try {
      const result = await lookupCNPJ(digits);

      if (!result.success) {
        setCnpjError(result.message);
        startCooldown();
        return;
      }

      // Check if company is active (codigo 2 = ATIVA)
      if (result.data.codigoSituacaoCadastral !== 2) {
        setCnpjData(result.data);
        setCnpjError(
          `Esta empresa consta como "${result.data.situacaoCadastral}" na Receita Federal. Apenas empresas com situacao ATIVA podem se cadastrar.`
        );
        startCooldown();
        return;
      }

      // Success — advance to confirm step
      setCnpjData(result.data);
      setCompanyStep('confirm');
      startCooldown();
    } catch {
      setCnpjError('Erro inesperado. Tente novamente.');
      startCooldown();
    } finally {
      setCnpjLoading(false);
    }
  };

  // ── Handle "try another CNPJ" ──
  const handleTryAnotherCnpj = () => {
    setCnpjData(null);
    setCnpjInput('');
    setCnpjError('');
    setCompanyStep('cnpj');
    startCooldown();
  };

  // ── Company: confirm data and proceed to credentials ──
  const handleConfirmCompanyData = () => {
    setCompanyStep('credentials');
    setError('');
  };

  // ── Company: go back from credentials to confirm ──
  const handleBackToConfirm = () => {
    setCompanyStep('confirm');
    setError('');
  };

  // ── Submit registration ──
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
      const signUpName = accountType === 'company' && cnpjData
        ? (cnpjData.nomeFantasia || cnpjData.razaoSocial)
        : name;

      const result = await signUp({
        email,
        password,
        name: signUpName,
        phone: phone || undefined,
        type: accountType,
        cnpjData: accountType === 'company' && cnpjData ? {
          cnpj: cnpjData.cnpj,
          razaoSocial: cnpjData.razaoSocial,
          nomeFantasia: cnpjData.nomeFantasia,
          cep: cnpjData.cep,
          logradouro: cnpjData.logradouro,
          numero: cnpjData.numero,
          complemento: cnpjData.complemento,
          bairro: cnpjData.bairro,
          city: cnpjData.city,
          state: cnpjData.state,
          address: cnpjData.address,
          situacaoCadastral: cnpjData.situacaoCadastral,
          industry: cnpjData.industry,
          size: cnpjData.size,
        } : undefined,
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
        setError('Este email ja possui uma conta. Use a pagina de login ou clique em "Esqueci minha senha" para recuperar o acesso.');
      } else if (message.includes('Invalid email')) {
        setError('Email invalido. Verifique o formato.');
      } else if (message.includes('Password') || message.includes('password')) {
        setError('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else if (message.includes('cnpj') || message.includes('companies_cnpj_unique')) {
        setError('Este CNPJ ja esta vinculado a outra conta.');
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
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (resendError) throw resendError;
      setResendSuccess(true);
    } catch {
      setError('Erro ao reenviar email. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  // ── Company CNPJ Step UI ──
  const renderCompanyCnpjStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ da empresa</Label>
        <div className={cn("relative", (cnpjLoading || cooldownSeconds > 0) && "cursor-not-allowed")}>
          {cooldownSeconds > 0 ? (
            <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          )}
          <Input
            id="cnpj"
            type="text"
            inputMode="numeric"
            placeholder={cooldownSeconds > 0
              ? `Aguarde ${cooldownSeconds}s para nova consulta`
              : "00.000.000/0000-00"}
            className={cn(
              "pl-10",
              cooldownSeconds > 0 && "border-muted-foreground/30 bg-muted/50"
            )}
            value={cnpjInput}
            onChange={handleCnpjChange}
            disabled={cnpjLoading || cooldownSeconds > 0}
            aria-describedby="cnpj-helper"
            autoFocus
          />
        </div>
        <p id="cnpj-helper" className="text-xs text-muted-foreground">
          Informe o CNPJ para consultar os dados oficiais da empresa na Receita Federal.
        </p>
      </div>

      {cnpjError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{cnpjError}</AlertDescription>
        </Alert>
      )}

      {/* Inactive company data display */}
      {cnpjData && cnpjData.codigoSituacaoCadastral !== 2 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-medium">
            <XCircle className="w-4 h-4" />
            Situacao: {cnpjData.situacaoCadastral}
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Razao Social:</strong> {cnpjData.razaoSocial}
          </p>
          {cnpjData.nomeFantasia && (
            <p className="text-sm text-muted-foreground">
              <strong>Nome Fantasia:</strong> {cnpjData.nomeFantasia}
            </p>
          )}
        </div>
      )}

      <Button
        type="button"
        className="w-full"
        size="lg"
        onClick={handleCnpjLookup}
        disabled={stripCNPJ(cnpjInput).length !== 14 || cnpjLoading || cooldownSeconds > 0}
      >
        {cnpjLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Consultando...
          </>
        ) : (
          <>
            Consultar CNPJ
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </div>
  );

  // ── Company Confirm Step UI ──
  const renderCompanyConfirmStep = () => {
    if (!cnpjData) return null;

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary font-medium">
            <ShieldCheck className="w-5 h-5" />
            Dados verificados na Receita Federal
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">CNPJ:</span>{' '}
              <span className="font-medium">{cnpjData.cnpj}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Razao Social:</span>{' '}
              <span className="font-medium">{cnpjData.razaoSocial}</span>
            </div>
            {cnpjData.nomeFantasia && (
              <div>
                <span className="text-muted-foreground">Nome Fantasia:</span>{' '}
                <span className="font-medium">{cnpjData.nomeFantasia}</span>
              </div>
            )}
            <div className="flex items-start gap-1">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="font-medium">{cnpjData.address}</span>
            </div>
            {cnpjData.industry && (
              <div>
                <span className="text-muted-foreground">Atividade:</span>{' '}
                <span className="font-medium">{cnpjData.industry}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-700">Situacao: {cnpjData.situacaoCadastral}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleTryAnotherCnpj}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Outro CNPJ
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleConfirmCompanyData}
          >
            Confirmar dados
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  // ── Company Credentials Step UI ──
  const renderCompanyCredentialsStep = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      {cnpjData && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Building2 className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{cnpjData.displayName} ({cnpjData.cnpj})</span>
        </div>
      )}

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
            placeholder="seu@empresa.com"
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

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBackToConfirm}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          type="submit"
          className="flex-1"
          size="lg"
          disabled={submitting}
        >
          {submitting ? 'Criando conta...' : 'Criar conta'}
          {!submitting && <ArrowRight className="w-5 h-5" />}
        </Button>
      </div>
    </form>
  );

  // ── Candidate Form (PRD-083: Replaced with progressive registration) ──
  const renderCandidateForm = () => (
    <CandidateRegistrationForm onBack={() => setAccountType(null)} />
  );

  // ── Company step title/subtitle ──
  const getCompanyStepInfo = () => {
    switch (companyStep) {
      case 'cnpj':
        return { title: 'Cadastro de Empresa', subtitle: 'Informe o CNPJ para comecar.' };
      case 'confirm':
        return { title: 'Confirme os dados', subtitle: 'Verifique se os dados da empresa estao corretos.' };
      case 'credentials':
        return { title: 'Crie sua conta', subtitle: 'Preencha seus dados de acesso.' };
    }
  };

  // ── Render ──
  return (
    <>
      <ForceLightTheme />
      {showEmailVerification ? (
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
      ) : (
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

            {/* Title depends on type and step */}
            {accountType === 'company' ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {getCompanyStepInfo().title}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {getCompanyStepInfo().subtitle}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-2">Criar conta</h1>
                <p className="text-muted-foreground mb-6">
                  Escolha seu tipo de conta para comecar.
                </p>
              </>
            )}

            {/* Account Type Selection — hidden once company flow advances past CNPJ */}
            {!(accountType === 'company' && companyStep !== 'cnpj') && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => handleSelectType('company')}
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
                  onClick={() => handleSelectType('candidate')}
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
            )}

            {/* Step indicator for company flow */}
            {accountType === 'company' && (
              <div className="flex items-center gap-2 mb-6">
                {(['cnpj', 'confirm', 'credentials'] as CompanyStep[]).map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      companyStep === step
                        ? "bg-primary text-primary-foreground"
                        : (['cnpj', 'confirm', 'credentials'].indexOf(companyStep) > i)
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}>
                      {i + 1}
                    </div>
                    {i < 2 && <div className="w-8 h-0.5 bg-muted" />}
                  </div>
                ))}
              </div>
            )}

            {/* Content based on type + step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={accountType === 'company' ? `company-${companyStep}` : 'candidate'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {accountType === 'company' && companyStep === 'cnpj' && renderCompanyCnpjStep()}
                {accountType === 'company' && companyStep === 'confirm' && renderCompanyConfirmStep()}
                {accountType === 'company' && companyStep === 'credentials' && renderCompanyCredentialsStep()}
                {accountType === 'candidate' && renderCandidateForm()}
              </motion.div>
            </AnimatePresence>

            {/* No form shown if no type selected yet */}
            {!accountType && (
              <p className="text-center text-sm text-muted-foreground">
                Selecione o tipo de conta acima para continuar.
              </p>
            )}

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
      )}
    </>
  );
}
