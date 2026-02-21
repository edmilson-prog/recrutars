/**
 * CandidateRegistrationForm
 * PRD-083: Progressive 4-step candidate registration form
 * Steps: CPF → Data → Password → Terms
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  UserIcon,
  Phone,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Shield,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { maskCPFInput, stripCPF, isValidCPF, checkCPFExists } from '@/lib/cpf';
import { PasswordStrengthIndicator } from '@/components/invite/PasswordStrengthIndicator';

type RegistrationStep = 'cpf' | 'data' | 'password' | 'terms';

const STEP_ORDER: RegistrationStep[] = ['cpf', 'data', 'password', 'terms'];

function maskPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  let masked = digits;
  if (digits.length > 0) masked = '(' + digits;
  if (digits.length > 2) masked = '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
  if (digits.length > 7) masked = '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  return masked;
}

function evaluatePasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 1;
  if (score === 2) return 2;
  if (score === 3) return 3;
  return 4;
}

interface CandidateRegistrationFormProps {
  onBack: () => void;
}

export function CandidateRegistrationForm({ onBack }: CandidateRegistrationFormProps) {
  const [step, setStep] = useState<RegistrationStep>('cpf');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // CPF step
  const [cpfInput, setCpfInput] = useState('');
  const [cpfChecking, setCpfChecking] = useState(false);
  const [cpfError, setCpfError] = useState('');

  // Data step
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password step
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Terms step
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const currentStepIndex = STEP_ORDER.indexOf(step);

  // ── CPF Step Handlers ──

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpfInput(maskCPFInput(e.target.value));
    setCpfError('');
  };

  const handleCpfNext = async () => {
    const digits = stripCPF(cpfInput);

    if (digits.length !== 11) {
      setCpfError('CPF deve ter 11 digitos.');
      return;
    }

    if (!isValidCPF(digits)) {
      setCpfError('CPF invalido. Verifique os digitos.');
      return;
    }

    setCpfChecking(true);
    setCpfError('');

    try {
      const exists = await checkCPFExists(digits);
      if (exists) {
        setCpfError('CPF ja cadastrado. Faca login ou recupere sua senha.');
        return;
      }
      setStep('data');
    } catch {
      setCpfError('Erro ao verificar CPF. Tente novamente.');
    } finally {
      setCpfChecking(false);
    }
  };

  // ── Data Step Validation ──

  const isNameValid = () => {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 && parts.every(p => p.length >= 1);
  };

  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPhoneValid = () => phone.replace(/\D/g, '').length >= 10;

  const canAdvanceData = isNameValid() && isEmailValid() && isPhoneValid();

  // ── Password Step Validation ──

  const passwordStrength = evaluatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canAdvancePassword = passwordStrength === 4 && passwordsMatch;

  // ── Terms Step Validation ──

  const canSubmit = termsAccepted && privacyAccepted && lgpdAccepted;

  // ── Submit ──

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const result = await signUp({
        email,
        password,
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        type: 'candidate',
        cpf: stripCPF(cpfInput),
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        lgpdConsentAt: now,
      });

      if (result.needsEmailConfirmation) {
        // This shouldn't happen in development (email confirm disabled)
        // but handle gracefully
        navigate('/login');
        return;
      }

      // Save consent timestamps on the candidate record (fire-and-forget)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('candidates')
          .update({
            terms_accepted_at: now,
            privacy_accepted_at: now,
            lgpd_consent_at: now,
          })
          .eq('profile_id', authUser.id);
      }

      // Redirect to personal profile onboarding step
      navigate('/candidato/onboarding/perfil-pessoal');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';

      if (message.includes('already registered') || message.includes('already been registered')) {
        setError('Este email ja possui uma conta. Use a pagina de login ou clique em "Esqueci minha senha".');
      } else if (message.includes('Invalid email')) {
        setError('Email invalido. Verifique o formato.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step Navigation ──

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEP_ORDER[prevIndex]);
      setError('');
    } else {
      onBack();
    }
  };

  // ── Step indicator ──

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-6">
      {STEP_ORDER.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
            step === s
              ? 'bg-primary text-primary-foreground'
              : currentStepIndex > i
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
          )}>
            {i + 1}
          </div>
          {i < STEP_ORDER.length - 1 && <div className="w-8 h-0.5 bg-muted" />}
        </div>
      ))}
    </div>
  );

  // ── Step 1: CPF ──

  const renderCpfStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpfInput}
          onChange={handleCpfChange}
          disabled={cpfChecking}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Seu CPF sera usado como identificacao unica na plataforma.
        </p>
      </div>

      {cpfError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {cpfError}
            {cpfError.includes('ja cadastrado') && (
              <span className="block mt-1">
                <Link to="/login" className="font-medium underline">Fazer login</Link>
                {' ou '}
                <Link to="/login" className="font-medium underline">recuperar senha</Link>
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleCpfNext}
          disabled={stripCPF(cpfInput).length !== 11 || cpfChecking}
        >
          {cpfChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              Proximo
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // ── Step 2: Data ──

  const renderDataStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Joao da Silva"
            className="pl-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            autoComplete="name"
          />
        </div>
        {name && !isNameValid() && (
          <p className="text-xs text-destructive">Informe nome e sobrenome.</p>
        )}
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
            onChange={(e) => setPhone(maskPhoneInput(e.target.value))}
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() => { setStep('password'); setError(''); }}
          disabled={!canAdvanceData}
        >
          Proximo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // ── Step 3: Password ──

  const renderPasswordStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Crie uma senha forte"
            className="pl-10 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoFocus
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrengthIndicator password={password} />
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p className={cn(password.length >= 8 && 'text-green-600')}>
            {password.length >= 8 ? '\u2713' : '\u2022'} Minimo 8 caracteres
          </p>
          <p className={cn(/[A-Z]/.test(password) && 'text-green-600')}>
            {/[A-Z]/.test(password) ? '\u2713' : '\u2022'} Uma letra maiuscula
          </p>
          <p className={cn(/[a-z]/.test(password) && 'text-green-600')}>
            {/[a-z]/.test(password) ? '\u2713' : '\u2022'} Uma letra minuscula
          </p>
          <p className={cn(/[0-9]/.test(password) && 'text-green-600')}>
            {/[0-9]/.test(password) ? '\u2713' : '\u2022'} Um numero
          </p>
          <p className={cn(/[^A-Za-z0-9]/.test(password) && 'text-green-600')}>
            {/[^A-Za-z0-9]/.test(password) ? '\u2713' : '\u2022'} Um caractere especial
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repita a senha"
            className="pl-10 pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Ocultar confirmacao de senha' : 'Mostrar confirmacao de senha'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-destructive">As senhas nao coincidem.</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() => { setStep('terms'); setError(''); }}
          disabled={!canAdvancePassword}
        >
          Proximo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // ── Step 4: Terms ──

  const renderTermsStep = () => (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <div className="grid gap-1 leading-none">
            <label htmlFor="terms" className="text-sm font-medium leading-snug cursor-pointer flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              Termos de Uso
            </label>
            <p className="text-xs text-muted-foreground">
              Li e aceito os{' '}
              <Link to="/termos-de-uso" target="_blank" className="text-primary underline">
                Termos de Uso
              </Link>{' '}
              da plataforma RecrutaRS.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
          <Checkbox
            id="privacy"
            checked={privacyAccepted}
            onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
          />
          <div className="grid gap-1 leading-none">
            <label htmlFor="privacy" className="text-sm font-medium leading-snug cursor-pointer flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              Politica de Privacidade
            </label>
            <p className="text-xs text-muted-foreground">
              Li e aceito a{' '}
              <Link to="/politica-de-privacidade" target="_blank" className="text-primary underline">
                Politica de Privacidade
              </Link>{' '}
              e o tratamento dos meus dados pessoais.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
          <Checkbox
            id="lgpd"
            checked={lgpdAccepted}
            onCheckedChange={(checked) => setLgpdAccepted(checked === true)}
          />
          <div className="grid gap-1 leading-none">
            <label htmlFor="lgpd" className="text-sm font-medium leading-snug cursor-pointer flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-primary flex-shrink-0" />
              Consentimento LGPD
            </label>
            <p className="text-xs text-muted-foreground">
              Autorizo o tratamento dos meus dados pessoais conforme a{' '}
              <Link to="/lgpd" target="_blank" className="text-primary underline">
                Lei Geral de Protecao de Dados (LGPD - Lei 13.709/2018)
              </Link>{' '}
              para fins de recrutamento e selecao.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className="flex-1"
          size="lg"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            <>
              Criar conta
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // ── Step titles ──

  const getStepInfo = () => {
    switch (step) {
      case 'cpf':
        return { title: 'Cadastro de Candidato', subtitle: 'Informe seu CPF para comecar.' };
      case 'data':
        return { title: 'Seus dados', subtitle: 'Preencha suas informacoes basicas.' };
      case 'password':
        return { title: 'Crie sua senha', subtitle: 'Sua senha deve ser forte e segura.' };
      case 'terms':
        return { title: 'Termos e consentimentos', subtitle: 'Leia e aceite os termos para continuar.' };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">{stepInfo.title}</h1>
      <p className="text-muted-foreground mb-6">{stepInfo.subtitle}</p>

      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'cpf' && renderCpfStep()}
          {step === 'data' && renderDataStep()}
          {step === 'password' && renderPasswordStep()}
          {step === 'terms' && renderTermsStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
