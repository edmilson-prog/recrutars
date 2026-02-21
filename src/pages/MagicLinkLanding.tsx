/**
 * MagicLinkLanding Page
 * PRD-048: Teste por Vaga
 *
 * Landing page para candidatos externos acessarem via link mágico
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Clock,
  FileQuestion,
  AlertTriangle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMagicLink } from '@/hooks/useMagicLink';

type PageState = 'loading' | 'valid' | 'expired' | 'completed' | 'form' | 'test';

export default function MagicLinkLanding() {
  const { token } = useParams<{ token: string }>();
  const { invite, isLoading, isError } = useMagicLink(token || '');

  const [pageState, setPageState] = useState<PageState>('loading');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive page state from invite data
  useEffect(() => {
    if (isLoading) {
      setPageState('loading');
      return;
    }

    if (!token || isError || !invite) {
      setPageState('expired');
      return;
    }

    // Check if expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      setPageState('expired');
      return;
    }

    // Check if already completed
    if (invite.status === 'completed') {
      setPageState('completed');
      return;
    }

    // Pre-fill name/email if available
    if (invite.externalName) setName(invite.externalName);
    if (invite.externalEmail) setEmail(invite.externalEmail);

    setPageState('valid');
  }, [token, invite, isLoading, isError]);

  const handleStartTest = () => {
    if (invite?.externalName && invite?.externalEmail) {
      // Já tem dados, ir direto para o teste
      setPageState('test');
    } else {
      // Precisa preencher formulário
      setPageState('form');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !acceptTerms) return;

    setIsSubmitting(true);

    // Simular criação de conta
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Em produção: criar conta, associar ao convite, redirecionar para teste
    setPageState('test');
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validando seu acesso...</p>
        </motion.div>
      </div>
    );
  }

  // Expired state
  if (pageState === 'expired') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Link Expirado
          </h1>
          <p className="text-muted-foreground mb-6">
            Este link de avaliação não é mais válido. Ele pode ter expirado ou
            já foi utilizado.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com o recrutador para solicitar um novo link.
          </p>
        </motion.div>
      </div>
    );
  }

  // Completed state
  if (pageState === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-success/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Avaliação Concluída
          </h1>
          <p className="text-muted-foreground mb-6">
            Você já completou esta avaliação. O recrutador entrará em contato
            com você em breve.
          </p>
        </motion.div>
      </div>
    );
  }

  // Form state
  if (pageState === 'form' && invite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-card rounded-2xl p-6 border shadow-lg">
            <div className="text-center mb-6">
              <Building2 className="w-12 h-12 mx-auto text-primary mb-3" />
              <h1 className="text-xl font-bold text-foreground">
                Bem-vindo(a)!
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete seus dados para iniciar a avaliação
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome completo *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone (opcional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(v) => setAcceptTerms(v === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Concordo com os{' '}
                  <a href="#" className="text-primary hover:underline">
                    termos de uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-primary hover:underline">
                    política de privacidade
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                disabled={!name || !email || !acceptTerms || isSubmitting}
                className="w-full gradient-primary"
              >
                {isSubmitting ? 'Criando sua conta...' : 'Continuar para o teste'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Test state - redirect to test page
  if (pageState === 'test') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Preparando sua avaliação...</p>
        </motion.div>
      </div>
    );
  }

  // Valid state - show intro
  // TODO: Enrich invite data with job/assessment details via Edge Function or join query
  if (pageState === 'valid' && invite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <div className="bg-card rounded-2xl p-6 border shadow-lg">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Avaliação Comportamental
              </h1>
              <p className="text-muted-foreground mt-1">Teste por Vaga</p>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <FileQuestion className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold text-foreground">
                  15-25
                </div>
                <div className="text-xs text-muted-foreground">Perguntas</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold text-foreground">
                  ~20
                </div>
                <div className="text-xs text-muted-foreground">Minutos</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-foreground mb-2">Antes de começar:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Escolha um ambiente tranquilo e sem distrações</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Responda com sinceridade, não existe certo ou errado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Você pode pausar e retomar depois se necessário</span>
                </li>
              </ul>
            </div>

            {/* Expiration warning */}
            {invite.expiresAt && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 rounded-lg p-3 mb-6">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Este link expira em{' '}
                  <strong>{formatDate(invite.expiresAt)}</strong>
                </span>
              </div>
            )}

            {/* Start button */}
            <Button onClick={handleStartTest} className="w-full gradient-primary">
              Iniciar Avaliação
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
