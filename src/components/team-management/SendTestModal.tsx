/**
 * SendTestModal
 * Modal for sending a behavioral test invitation to a pre-registered team member.
 * Supports 3 channels: unique link, email, and WhatsApp.
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Link2,
  Mail,
  MessageCircle,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Send,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { getWhatsAppService } from '@/services/whatsapp/whatsappService';
import type { TeamMember } from '@/types/teamManagement';

interface SendTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  companyId: string;
  testId: string;
  creditBalance: number;
  onSuccess: () => void;
}

type InviteChannel = 'link' | 'email' | 'whatsapp';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export default function SendTestModal({
  open,
  onOpenChange,
  member,
  companyId,
  testId,
  creditBalance,
  onSuccess,
}: SendTestModalProps) {
  const [activeTab, setActiveTab] = useState<InviteChannel>('link');
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const noCredits = creditBalance === 0;

  const token = generatedToken ?? crypto.randomUUID();
  const inviteLink = `${window.location.origin}/convite/teste/${token}`;

  const resetState = useCallback(() => {
    setIsSending(false);
    setIsCopied(false);
    setGeneratedToken(null);
    setActiveTab('link');
  }, []);

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar o link. Tente novamente.');
    }
  }

  async function createInvitation(method: InviteChannel): Promise<boolean> {
    const inviteToken = generatedToken ?? token;
    if (!generatedToken) {
      setGeneratedToken(inviteToken);
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('test_invitations').insert({
      test_id: testId,
      candidate_name: member.name,
      candidate_email: member.email,
      method,
      status: 'sent',
      token: inviteToken,
      sent_at: new Date().toISOString(),
      expires_at: expiresAt,
      team_member_id: member.id,
      invite_origin: 'team_management',
    });

    if (error) {
      console.error('Error creating invitation:', error);
      toast.error('Erro ao criar convite. Tente novamente.');
      return false;
    }

    return true;
  }

  async function handleSendLink() {
    if (noCredits) return;
    setIsSending(true);
    try {
      const success = await createInvitation('link');
      if (success) {
        toast.success('Convite criado com sucesso! Compartilhe o link com o colaborador.');
        onSuccess();
        handleOpenChange(false);
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendEmail() {
    if (noCredits) return;
    setIsSending(true);
    try {
      const success = await createInvitation('email');
      if (success) {
        toast.success(`Convite enviado por email para ${member.email}`);
        onSuccess();
        handleOpenChange(false);
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendWhatsApp() {
    if (noCredits || !member.phone) return;
    setIsSending(true);
    try {
      const success = await createInvitation('whatsapp');
      if (!success) return;

      const messageText = `Ola ${member.name}! Voce foi convidado(a) para realizar o teste comportamental Gauge-Pro. Acesse o link para iniciar: ${inviteLink}\n\nEste link expira em 24 horas.`;

      const whatsappSvc = await getWhatsAppService();
      const result = await whatsappSvc.sendMessage(member.phone, messageText, {
        recipientId: member.id,
        recipientType: 'candidate',
      });

      if (!result.success) {
        toast.error(result.error ?? 'Erro ao enviar mensagem via WhatsApp.');
        return;
      }

      toast.success(`Convite enviado via WhatsApp para ${member.phone}`);
      onSuccess();
      handleOpenChange(false);
    } catch (err) {
      console.error('Error sending WhatsApp:', err);
      toast.error('Erro ao enviar mensagem via WhatsApp. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-cyan-500" />
            Enviar Teste Comportamental
          </DialogTitle>
          <DialogDescription>
            Envie o teste Gauge-Pro para <span className="font-semibold">{member.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Credit balance */}
          <div className="flex items-center justify-between rounded-md border p-3 bg-muted/30">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Creditos disponiveis:</span>
            </div>
            <Badge
              variant={noCredits ? 'destructive' : 'secondary'}
              className={cn(
                'text-sm font-semibold',
                !noCredits && 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
              )}
            >
              {creditBalance}
            </Badge>
          </div>

          {/* No credits warning */}
          {noCredits && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                Sem creditos disponiveis. Adquira pacotes de testes para enviar convites.
              </AlertDescription>
            </Alert>
          )}

          {/* Expiration notice */}
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              O convite expira em 24 horas independente do canal de envio.
            </AlertDescription>
          </Alert>

          {/* Channel tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as InviteChannel)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link" className="flex items-center gap-1.5 text-xs">
                <Link2 className="h-3.5 w-3.5" />
                Link Unico
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" />
                Email
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-1.5 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Link Unico */}
            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Link do convite
                </label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="bg-muted/50 text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Este link expira em 24 horas. Compartilhe diretamente com o colaborador.
              </p>

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={handleSendLink}
                disabled={noCredits || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Convite
              </Button>
            </TabsContent>

            {/* Tab 2: Email */}
            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Email do colaborador
                </label>
                <Input
                  value={member.email}
                  readOnly
                  className="bg-muted/50"
                />
              </div>

              <div className="rounded-md border p-3 bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Um email sera enviado para{' '}
                  <span className="font-semibold text-foreground">{member.email}</span>{' '}
                  com o link do teste.
                </p>
              </div>

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={handleSendEmail}
                disabled={noCredits || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Enviar por Email
              </Button>
            </TabsContent>

            {/* Tab 3: WhatsApp */}
            <TabsContent value="whatsapp" className="space-y-4 mt-4">
              {member.phone ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Telefone do colaborador
                    </label>
                    <Input
                      value={formatPhone(member.phone)}
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="rounded-md border p-3 bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      Uma mensagem sera enviada via WhatsApp para{' '}
                      <span className="font-semibold text-foreground">{formatPhone(member.phone)}</span>{' '}
                      com o link do teste.
                    </p>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSendWhatsApp}
                    disabled={noCredits || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Enviar por WhatsApp
                  </Button>
                </>
              ) : (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Telefone nao cadastrado. Edite o perfil do colaborador para adicionar.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
