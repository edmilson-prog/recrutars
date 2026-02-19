/**
 * Public Test Landing Page
 * Accessed via /teste/:slug — allows external candidates to take a test
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useTestBySlug } from '@/hooks/useCompanyTestsQuery';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function PublicTestLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: test, isLoading, error } = useTestBySlug(slug);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test || !name.trim() || !email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: 'Email inválido', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-test-invitation', {
        body: {
          action: 'send_invitations',
          test_id: test.id,
          invitations: [{
            candidateName: name.trim(),
            candidateEmail: email.trim(),
            method: 'public_link',
          }],
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const invitation = data?.invitations?.[0];
      if (invitation?.token) {
        toast({ title: 'Cadastro realizado!', description: 'Redirecionando para o teste...' });
        // Future: redirect to test session page with token
        // navigate(`/teste/${slug}/responder?token=${invitation.token}`);
        // For now, show success
        toast({
          title: 'Convite registrado com sucesso!',
          description: 'Em breve você receberá instruções para realizar o teste.',
        });
      }
    } catch (err) {
      toast({
        title: 'Erro ao registrar',
        description: 'Não foi possível registrar sua participação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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
              <h2 className="text-lg font-semibold">Link indisponível</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Este link de teste não está mais ativo ou não existe.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Voltar ao início
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
            <Button type="submit" className="w-full" disabled={submitting || !name.trim() || !email.trim()}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Iniciar Avaliação
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
