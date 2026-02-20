/**
 * TestCompletionActivation
 * PRD-081: Post-test completion screen with optional account activation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, ArrowRight, Mail, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface TestCompletionActivationProps {
  isNewUser: boolean;
  candidateName: string;
  candidateEmail: string;
  companyName: string;
  userId?: string;
  invitationId?: string;
}

export function TestCompletionActivation({
  isNewUser,
  candidateName,
  candidateEmail,
  companyName,
  userId,
  invitationId,
}: TestCompletionActivationProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
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

    setActivating(true);
    try {
      // Set password
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;

      // Activate profile via Edge Function
      if (userId) {
        await supabase.functions.invoke('process-collaborator-invite', {
          body: { action: 'activate', user_id: userId },
        });
      }

      toast({
        title: 'Conta ativada com sucesso!',
        description: 'Redirecionando para o seu resultado...',
      });

      setTimeout(() => {
        navigate('/candidato/gauge-pro/resultado', { state: { analysisGenerating: true } });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ativar conta. Tente novamente.');
    } finally {
      setActivating(false);
    }
  };

  const handleActivateLater = async () => {
    setSendingEmail(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('process-collaborator-invite', {
        body: {
          action: 'send_activation_email',
          email: candidateEmail,
          invitation_token: invitationId,
        },
      });

      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);

      setEmailSent(true);
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para ativar sua conta.',
      });
    } catch {
      toast({
        title: 'Erro ao enviar email',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleViewResult = () => {
    navigate('/candidato/gauge-pro/resultado', { state: { analysisGenerating: true } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      <div className="bg-card rounded-2xl p-8 shadow-soft space-y-6">
        {/* Success header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Avaliacao concluida!
          </h1>
          <p className="text-muted-foreground text-sm">
            Seu perfil comportamental esta sendo processado. Em breve voce descobrira seus pontos fortes.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-mono text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Processando analise Gauge-Pro
          </div>
        </div>

        {/* Readonly info */}
        <div className="space-y-3 bg-muted/50 rounded-xl p-4">
          <div>
            <p className="text-xs text-muted-foreground">Nome</p>
            <p className="text-sm font-medium">{candidateName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{candidateEmail}</p>
          </div>
        </div>

        {/* Transparency note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm">
          <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-blue-700 dark:text-blue-300">
            Seu perfil comportamental foi compartilhado com <strong>{companyName}</strong>.
          </p>
        </div>

        {isNewUser ? (
          emailSent ? (
            /* Email sent confirmation */
            <div className="text-center space-y-3 py-4">
              <Mail className="w-10 h-10 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                Enviamos um email para <strong>{candidateEmail}</strong> com o link para ativar sua conta.
                O link expira em 72 horas.
              </p>
            </div>
          ) : (
            /* Password form for new users */
            <form onSubmit={handleActivate} className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground text-center">
                Ative sua conta para ver o resultado
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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

              <Button type="submit" className="w-full" size="lg" disabled={activating}>
                {activating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Ativar minha conta e ver resultado
                {!activating && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>

              <button
                type="button"
                onClick={handleActivateLater}
                disabled={sendingEmail}
                className="w-full text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
              >
                {sendingEmail ? 'Enviando...' : 'Prefiro ativar depois por email'}
              </button>
            </form>
          )
        ) : (
          /* Existing user — no password form */
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Sua conta ja esta ativa. Clique abaixo para ver seu resultado.
            </p>
            <Button onClick={handleViewResult} className="w-full" size="lg">
              Ver Meu Resultado
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
