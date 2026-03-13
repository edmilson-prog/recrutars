/**
 * PasswordManagementSection
 * Admin: set password or send reset email for a user
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, KeyRound, Eye, EyeOff, Mail, Send, Loader2, Info,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PasswordStrengthIndicator } from '@/components/invite/PasswordStrengthIndicator';
import { useSetUserPassword, useSendPasswordResetEmail } from '@/hooks/useUsersQuery';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PasswordManagementSectionProps {
  userId: string;
  userEmail: string;
  userName: string;
}

function evaluatePasswordScore(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

export function PasswordManagementSection({
  userId,
  userEmail,
  userName,
}: PasswordManagementSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const setPasswordMutation = useSetUserPassword();
  const sendResetMutation = useSendPasswordResetEmail();

  // Set password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [setPasswordDialogOpen, setSetPasswordDialogOpen] = useState(false);

  // Send reset email state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const passwordScore = evaluatePasswordScore(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSetPassword = passwordScore >= 3 && passwordsMatch;

  const resetForm = useCallback(() => {
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
  }, []);

  const handleSetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id || !canSetPassword) return;

    try {
      await setPasswordMutation.mutateAsync({
        userId,
        password: newPassword,
        adminId: user.id,
      });

      toast({
        title: 'Senha redefinida',
        description: `A senha de ${userName} foi atualizada com sucesso.`,
      });

      resetForm();
      setSetPasswordDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao redefinir senha',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      setSetPasswordDialogOpen(false);
    }
  };

  const handleSendResetEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      await sendResetMutation.mutateAsync({
        userId,
        adminId: user.id,
      });

      toast({
        title: 'E-mail enviado',
        description: `O link de redefinição foi enviado para ${userEmail}.`,
      });

      setCooldown(60);
      setResetDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao enviar e-mail',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      setResetDialogOpen(false);
    }
  };

  return (
    <Card className="border-amber-300 dark:border-amber-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-semibold">Gerenciamento de Senha</h3>
          <Badge
            variant="outline"
            className="text-amber-800 bg-amber-100 border-amber-300 dark:text-amber-200 dark:bg-amber-900/30 dark:border-amber-700"
          >
            Ação sensível
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Redefina a senha do usuário ou envie um link de redefinição por e-mail.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A — Set password directly */}
          <div className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-500" />
              <h4 className="text-base font-medium">Definir Nova Senha</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Defina uma nova senha diretamente. O usuário precisará usar esta senha no próximo login.
            </p>

            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <PasswordStrengthIndicator password={newPassword} />
              {newPassword && passwordScore < 3 && (
                <p className="text-xs text-muted-foreground">
                  A senha deve ser pelo menos &quot;Boa&quot; para prosseguir.
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  className={cn(
                    'pr-10',
                    confirmPassword && !passwordsMatch && 'border-destructive',
                  )}
                  aria-invalid={confirmPassword ? !passwordsMatch : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive" role="alert" aria-live="polite">
                  As senhas não coincidem.
                </p>
              )}
            </div>

            {/* Set password button + confirmation dialog */}
            <AlertDialog open={setPasswordDialogOpen} onOpenChange={setSetPasswordDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full"
                  disabled={!canSetPassword || setPasswordMutation.isPending}
                >
                  {setPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Redefinir Senha
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar redefinição de senha</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você está prestes a redefinir a senha de{' '}
                    <span className="font-semibold text-foreground">{userName}</span>{' '}
                    (<span className="font-mono text-foreground">{userEmail}</span>).
                    O usuário precisará usar a nova senha no próximo login. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={setPasswordMutation.isPending}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSetPassword}
                    disabled={setPasswordMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {setPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redefinindo...
                      </>
                    ) : (
                      'Sim, Redefinir Senha'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Option B — Send reset email */}
          <div className="rounded-lg border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-500" />
              <h4 className="text-base font-medium">Enviar Link por E-mail</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Envia um e-mail com link seguro para o usuário redefinir a própria senha. O link expira em 24 horas.
            </p>

            {/* Destination email (read-only) */}
            <div className="space-y-2">
              <Label>E-mail de destino</Label>
              <div className="bg-muted rounded-md px-3 py-2 text-sm font-mono">
                {userEmail}
              </div>
            </div>

            {/* Send email button + confirmation dialog */}
            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={cooldown > 0 || sendResetMutation.isPending}
                >
                  {sendResetMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Aguarde {cooldown}s
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar E-mail de Redefinição
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar envio de e-mail</AlertDialogTitle>
                  <AlertDialogDescription>
                    Um e-mail de redefinição de senha será enviado para{' '}
                    <span className="font-mono font-semibold text-foreground">{userEmail}</span>.
                    O link expira em 24 horas. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={sendResetMutation.isPending}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSendResetEmail}
                    disabled={sendResetMutation.isPending}
                  >
                    {sendResetMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Sim, Enviar E-mail'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Audit note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Todas as ações de senha são registradas na timeline do usuário.</span>
        </div>
      </CardContent>
    </Card>
  );
}
