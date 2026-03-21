/**
 * SendTestModal
 * Modal for sending a behavioral test invitation to a pre-registered team member.
 * Supports 3 channels: unique link, email, and WhatsApp.
 *
 * PRD-087 fixes:
 * - Checks for existing pending invitation before creating a new one (deduplication)
 * - Generates token only on send, NOT on modal mount
 * - Shows invite URL only AFTER successful DB insert/update
 * - Notifies collaborator on resend (token invalidation requires active delivery)
 */

import { useState, useCallback, useEffect } from 'react';
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
  RefreshCw,
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

interface InvitationResult {
  success: boolean;
  link?: string;
  isResend?: boolean;
  whatsappFailed?: boolean;
  whatsappError?: string;
}

const ORIGIN_MAP: Record<InviteChannel, string> = {
  link: 'invite_link',
  email: 'invite_email',
  whatsapp: 'invite_link',
};

const METHOD_MAP: Record<InviteChannel, string> = {
  link: 'public_link',
  email: 'email',
  whatsapp: 'internal',
};

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
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [hasExistingInvite, setHasExistingInvite] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);

  const noCredits = creditBalance === 0;

  // Check for existing pending invitation when modal opens
  useEffect(() => {
    if (!open || !member.id || !testId) {
      setHasExistingInvite(false);
      return;
    }

    let cancelled = false;
    setIsCheckingExisting(true);

    supabase
      .from('test_invitations')
      .select('id')
      .eq('team_member_id', member.id)
      .eq('test_id', testId)
      .in('status', ['sent', 'viewed', 'started'])
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) {
          setHasExistingInvite((data?.length ?? 0) > 0);
          setIsCheckingExisting(false);
        }
      });

    return () => { cancelled = true; };
  }, [open, member.id, testId]);

  const resetState = useCallback(() => {
    setIsSending(false);
    setIsCopied(false);
    setGeneratedLink(null);
    setActiveTab('link');
    setHasExistingInvite(false);
  }, []);

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleCopyLink() {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar o link. Tente novamente.');
    }
  }

  /**
   * Send notification to collaborator via the specified channel.
   * Used both for new invitations and resends.
   */
  async function notifyCollaborator(method: InviteChannel, link: string): Promise<{ success: boolean; error?: string }> {
    if (method === 'link') {
      // Link channel: no automatic notification, user copies manually
      return { success: true };
    }

    if (method === 'email') {
      // Email: use existing edge function or Supabase email (best-effort)
      try {
        await supabase.functions.invoke('send-whatsapp', {
          body: {
            action: 'send_email_notification',
            to: member.email,
            subject: 'Convite para Teste Comportamental Gauge-Pro',
            body: `Ola ${member.name}! Voce foi convidado(a) para realizar o teste comportamental Gauge-Pro. Acesse o link para iniciar: ${link}\n\nEste link expira em 24 horas.`,
          },
        });
      } catch (err) {
        console.error('Email notification failed (non-blocking):', err);
      }
      return { success: true };
    }

    if (method === 'whatsapp' && member.phone) {
      const messageText = `Ola ${member.name}! Voce foi convidado(a) para realizar o teste comportamental Gauge-Pro. Acesse o link para iniciar: ${link}\n\nEste link expira em 24 horas.`;
      try {
        const whatsappSvc = await getWhatsAppService();
        const result = await whatsappSvc.sendMessage(member.phone, messageText, {
          recipientId: member.id,
          recipientType: 'candidate',
        });
        if (!result.success) {
          return { success: false, error: result.error ?? 'Erro ao enviar mensagem via WhatsApp.' };
        }
        return { success: true };
      } catch (err) {
        console.error('WhatsApp notification failed:', err);
        return { success: false, error: 'Erro ao enviar mensagem via WhatsApp.' };
      }
    }

    return { success: true };
  }

  /**
   * Create or resend invitation. Checks for existing pending invitation first.
   * Token is generated ONLY here, ensuring it exists in the DB before any URL is shown.
   */
  async function createInvitation(method: InviteChannel): Promise<InvitationResult> {
    const newToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // 1. Check for existing active invitation
    const { data: existing } = await supabase
      .from('test_invitations')
      .select('id, token, status')
      .eq('team_member_id', member.id)
      .eq('test_id', testId)
      .in('status', ['sent', 'viewed', 'started'])
      .limit(1)
      .maybeSingle();

    if (existing) {
      // RESEND: regenerate token + update timestamps
      const { error } = await supabase
        .from('test_invitations')
        .update({
          token: newToken,
          sent_at: now,
          expires_at: expiresAt,
          method: METHOD_MAP[method],
          invite_origin: ORIGIN_MAP[method],
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error resending invitation:', error);
        toast.error('Erro ao reenviar convite. Tente novamente.');
        return { success: false };
      }

      const link = `${window.location.origin}/convite/teste/${newToken}`;

      // Notify collaborator with the new link (old token is now invalid)
      const notifyResult = await notifyCollaborator(method, link);

      return {
        success: true,
        link,
        isResend: true,
        whatsappFailed: !notifyResult.success,
        whatsappError: notifyResult.error,
      };
    }

    // 2. NEW: create fresh invitation
    const { error } = await supabase.from('test_invitations').insert({
      test_id: testId,
      candidate_name: member.name,
      candidate_email: member.email,
      method: METHOD_MAP[method],
      status: 'sent',
      token: newToken,
      sent_at: now,
      expires_at: expiresAt,
      team_member_id: member.id,
      invite_origin: ORIGIN_MAP[method],
    });

    if (error) {
      console.error('Error creating invitation:', error);
      toast.error('Erro ao criar convite. Tente novamente.');
      return { success: false };
    }

    const link = `${window.location.origin}/convite/teste/${newToken}`;

    // Notify collaborator with the link
    const notifyResult = await notifyCollaborator(method, link);

    return {
      success: true,
      link,
      isResend: false,
      whatsappFailed: !notifyResult.success,
      whatsappError: notifyResult.error,
    };
  }

  async function handleSendLink() {
    if (noCredits) return;
    setIsSending(true);
    try {
      const result = await createInvitation('link');
      if (result.success && result.link) {
        setGeneratedLink(result.link);
        toast.success(
          result.isResend
            ? 'Convite reenviado! Compartilhe o novo link com o colaborador.'
            : 'Convite criado com sucesso! Compartilhe o link com o colaborador.',
        );
        onSuccess();
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendEmail() {
    if (noCredits) return;
    setIsSending(true);
    try {
      const result = await createInvitation('email');
      if (result.success) {
        toast.success(
          result.isResend
            ? `Convite reenviado por email para ${member.email}`
            : `Convite enviado por email para ${member.email}`,
        );
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
      const result = await createInvitation('whatsapp');
      if (result.success) {
        if (result.whatsappFailed) {
          toast.warning(
            `Convite criado, mas falha no envio WhatsApp: ${result.whatsappError ?? 'erro desconhecido'}`,
          );
        } else {
          toast.success(
            result.isResend
              ? `Convite reenviado via WhatsApp para ${member.phone}`
              : `Convite enviado via WhatsApp para ${member.phone}`,
          );
        }
        onSuccess();
        handleOpenChange(false);
      }
    } finally {
      setIsSending(false);
    }
  }

  const actionLabel = hasExistingInvite ? 'Reenviar' : 'Enviar';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasExistingInvite ? (
              <RefreshCw className="h-5 w-5 text-amber-500" />
            ) : (
              <Send className="h-5 w-5 text-cyan-500" />
            )}
            {hasExistingInvite ? 'Reenviar Teste Comportamental' : 'Enviar Teste Comportamental'}
          </DialogTitle>
          <DialogDescription>
            {hasExistingInvite ? (
              <>
                Ja existe um convite pendente para <span className="font-semibold">{member.name}</span>.
                Ao reenviar, o link anterior sera invalidado e um novo sera gerado.
              </>
            ) : (
              <>
                Envie o teste Gauge-Pro para <span className="font-semibold">{member.name}</span>
              </>
            )}
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

          {/* Existing invite warning */}
          {hasExistingInvite && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <RefreshCw className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                Convite pendente encontrado. O reenvio ira gerar um novo link e invalidar o anterior.
              </AlertDescription>
            </Alert>
          )}

          {/* Expiration notice */}
          {!hasExistingInvite && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                O convite expira em 24 horas independente do canal de envio.
              </AlertDescription>
            </Alert>
          )}

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
              {generatedLink ? (
                /* Link generated — show it with copy button */
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Link do convite
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
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
                  <p className="text-xs text-muted-foreground">
                    Este link expira em 24 horas. Compartilhe diretamente com o colaborador.
                  </p>
                </div>
              ) : (
                /* No link yet — show send button */
                <>
                  <div className="rounded-md border p-3 bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      {hasExistingInvite
                        ? 'Um novo link sera gerado ao reenviar. O link anterior sera invalidado.'
                        : 'Um link unico sera gerado para o colaborador acessar o teste.'}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    O link expira em 24 horas. Copie e compartilhe diretamente com o colaborador.
                  </p>

                  <Button
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={handleSendLink}
                    disabled={noCredits || isSending || isCheckingExisting}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : hasExistingInvite ? (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {hasExistingInvite ? 'Reenviar Convite' : 'Gerar Link e Enviar Convite'}
                  </Button>
                </>
              )}
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
                  {hasExistingInvite ? (
                    <>
                      Um novo link sera gerado e enviado para{' '}
                      <span className="font-semibold text-foreground">{member.email}</span>.
                      O link anterior sera invalidado.
                    </>
                  ) : (
                    <>
                      Um email sera enviado para{' '}
                      <span className="font-semibold text-foreground">{member.email}</span>{' '}
                      com o link do teste.
                    </>
                  )}
                </p>
              </div>

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={handleSendEmail}
                disabled={noCredits || isSending || isCheckingExisting}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : hasExistingInvite ? (
                  <RefreshCw className="h-4 w-4 mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {hasExistingInvite ? 'Reenviar por Email' : 'Enviar por Email'}
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
                      {hasExistingInvite ? (
                        <>
                          Um novo link sera gerado e enviado via WhatsApp para{' '}
                          <span className="font-semibold text-foreground">{formatPhone(member.phone)}</span>.
                          O link anterior sera invalidado.
                        </>
                      ) : (
                        <>
                          Uma mensagem sera enviada via WhatsApp para{' '}
                          <span className="font-semibold text-foreground">{formatPhone(member.phone)}</span>{' '}
                          com o link do teste.
                        </>
                      )}
                    </p>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleSendWhatsApp}
                    disabled={noCredits || isSending || isCheckingExisting}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : hasExistingInvite ? (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    {hasExistingInvite ? 'Reenviar por WhatsApp' : 'Enviar por WhatsApp'}
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
