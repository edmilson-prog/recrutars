/**
 * Public Test Landing Page
 * Accessed via /teste/:slug — allows external candidates to take a test
 * PRD-081: Extended with department selector + collaborator invite flow
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, Clock, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { useTestBySlug } from '@/hooks/useCompanyTestsQuery';
import { useDepartmentsByTestSlug } from '@/hooks/useCompanyTestsQuery';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function PublicTestLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: test, isLoading, error } = useTestBySlug(slug);
  const { data: departments = [] } = useDepartmentsByTestSlug(slug);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [pendingInvitationToken, setPendingInvitationToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test || !name.trim() || !email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: 'Email invalido', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('process-collaborator-invite', {
        body: {
          action: 'identify',
          test_id: test.id,
          name: name.trim(),
          email: email.trim(),
          department_id: departmentId || null,
          method: 'public_link',
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      if (data.isNewUser) {
        // Silent auth via magic link
        if (data.tokenHash) {
          await supabase.auth.verifyOtp({
            token_hash: data.tokenHash,
            type: 'magiclink',
          });
        }

        // Redirect to standalone test page
        const targetToken = data.invitationToken;
        if (targetToken) {
          navigate(`/convite/teste/${targetToken}`, { state: { isNewUser: true } });
        }
      } else if (data.needsLogin) {
        // User already exists, prompt for login
        setNeedsLogin(true);
        setPendingInvitationToken(data.invitationToken);
      }
    } catch (err) {
      toast({
        title: 'Erro ao registrar',
        description: err instanceof Error ? err.message : 'Nao foi possivel registrar sua participacao. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: loginPassword,
      });

      if (error) throw error;

      // Redirect to standalone test page
      if (pendingInvitationToken) {
        navigate(`/convite/teste/${pendingInvitationToken}`, { state: { isNewUser: false } });
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Credenciais invalidas.');
    } finally {
      setLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-lg font-semibold">Link indisponivel</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Este link de teste nao esta mais ativo ou nao existe.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Voltar ao inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <Badge variant="outline">Teste Comportamental</Badge>
          </div>
          <CardTitle>{test.name}</CardTitle>
          {test.description && (
            <CardDescription>{test.description}</CardDescription>
          )}
          {test.instructions && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1.5" />
              {test.instructions}
            </div>
          )}
          {test.deadline && (
            <p className="text-xs text-muted-foreground mt-2">
              Prazo: {new Date(test.deadline).toLocaleDateString('pt-BR')}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {needsLogin ? (
            /* Login prompt for existing users */
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <LogIn className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Este email ja possui conta no RecrutaRS. Faca login para continuar.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <Input id="loginEmail" value={email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Senha</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    autoFocus
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loggingIn}>
                  {loggingIn ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Fazer login e iniciar teste
                </Button>

                <button
                  type="button"
                  onClick={() => { setNeedsLogin(false); setLoginError(''); }}
                  className="w-full text-sm text-muted-foreground hover:underline"
                >
                  Usar outro email
                </button>
              </form>
            </div>
          ) : (
            /* Identification form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  required
                  disabled={submitting}
                />
              </div>

              {departments.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select
                    value={departmentId}
                    onValueChange={setDepartmentId}
                    disabled={submitting}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting || !name.trim() || !email.trim()}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Iniciar Avaliacao
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
