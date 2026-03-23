/**
 * ResendInvitationModal
 * Modal for resending test invitations with channel selection (Link/Email/WhatsApp).
 * Regenerates the token via Edge Function and delivers via the selected channel.
 *
 * Follows the tab/channel pattern established by SendTestModal.
 */

import { useState, useEffect, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCw,
  Link2,
  Mail,
  MessageCircle,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useResendInvitation } from '@/hooks/useInvitationManagerQuery';
import type { TestInvitation } from '@/types/companyTest';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResendInvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: TestInvitation | null;
  onSuccess: () => void;
}

type ResendChannel = 'link' | 'email' | 'whatsapp';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format phone digits as (XX) XXXXX-XXXX or (XX) XXXX-XXXX for display */
function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Remove country code if present
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return phone;
}

/** Resolve the initial tab from invitation data */
function resolveInitialTab(invitation: TestInvitation | null): ResendChannel {
  if (!invitation) return 'link';

  // Prefer explicit deliveryChannel when available
  if (invitation.deliveryChannel) {
    if (invitation.deliveryChannel === 'email') return 'email';
    if (invitation.deliveryChannel === 'whatsapp') return 'whatsapp';
    if (invitation.deliveryChannel === 'link') return 'link';
  }

  // Fallback: map from method
  if (invitation.method === 'email') return 'email';
  if (invitation.method === 'public_link') return 'link';
  return 'link';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResendInvitationModal({
  open,
  onOpenChange,
  invitation,
  onSuccess,
}: ResendInvitationModalProps) {
  const { toast } = useToast();
  const resendMutation = useResendInvitation();

  // UI state
  const [activeTab, setActiveTab] = useState<ResendChannel>('link');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // WhatsApp phone fetching
  const [memberPhone, setMemberPhone] = useState<string | null>(null);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);

  // -----------------------------------------------------------------------
  // Effects
  // -----------------------------------------------------------------------

  // Set initial tab when invitation changes / modal opens
  useEffect(() => {
    if (open && invitation) {
      setActiveTab(resolveInitialTab(invitation));
    }
  }, [open, invitation]);

  // Fetch phone for WhatsApp tab
  useEffect(() => {
    if (!open || !invitation?.teamMemberId) {
      setMemberPhone(null);
      return;
    }

    let cancelled = false;
    setIsLoadingPhone(true);

    supabase
      .from('team_members')
      .select('phone')
      .eq('id', invitation.teamMemberId)
      .single()
      .then(({ data }) => {
        if (!cancelled) {
          setMemberPhone(data?.phone ?? null);
          setIsLoadingPhone(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, invitation?.teamMemberId]);

  // -----------------------------------------------------------------------
  // Reset state on close
  // -----------------------------------------------------------------------

  const resetState = useCallback(() => {
    setGeneratedLink(null);
    setIsCopied(false);
    setActiveTab('link');
    setMemberPhone(null);
    setIsLoadingPhone(false);
  }, []);

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  async function handleCopyLink() {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      toast({ title: 'Link copiado!' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({ title: 'Erro ao copiar o link. Tente novamente.', variant: 'destructive' });
    }
  }

  async function handleResend(channel: ResendChannel) {
    if (!invitation) return;

    try {
      const result = await resendMutation.mutateAsync({
        invitationId: invitation.id,
        channel,
      });

      // Handle delivery error (token was regenerated, but notification failed)
      if (result.deliveryError) {
        toast({
          title: 'Link regenerado, mas houve um problema na entrega',
          description: result.deliveryError,
          variant: 'destructive',
        });
      }

      if (channel === 'link') {
        // Show the generated link inline — keep modal open
        setGeneratedLink(result.link);
        toast({ title: 'Novo link gerado! Copie e compartilhe com o colaborador.' });
        onSuccess();
      } else if (channel === 'email') {
        const targetEmail = result.deliveryTarget || invitation.candidateEmail;
        if (!result.deliveryError) {
          toast({ title: `Convite reenviado por email para ${targetEmail}` });
        }
        onSuccess();
        handleOpenChange(false);
      } else if (channel === 'whatsapp') {
        const targetPhone = result.deliveryTarget || memberPhone;
        if (!result.deliveryError) {
          toast({
            title: `Convite reenviado via WhatsApp para ${targetPhone ? formatPhoneDisplay(targetPhone) : 'o colaborador'}`,
          });
        }
        onSuccess();
        handleOpenChange(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao reenviar convite',
        description: message,
        variant: 'destructive',
      });
    }
  }

  // -----------------------------------------------------------------------
  // Guard
  // -----------------------------------------------------------------------

  if (!invitation) return null;

  const isPending = resendMutation.isPending;
  const candidateName = invitation.candidateName;
  const candidateEmail = invitation.candidateEmail;
  const hasTeamMember = !!invitation.teamMemberId;
  const hasPhone = !!memberPhone;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-500" />
            Reenviar Convite
          </DialogTitle>
          <DialogDescription>
            Escolha como reenviar para{' '}
            <span className="font-semibold">{candidateName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Warning alert */}
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Um novo link será gerado e o anterior será invalidado.
            </AlertDescription>
          </Alert>

          {/* Channel tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ResendChannel)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link" className="flex items-center gap-1.5 text-xs">
                <Link2 className="h-3.5 w-3.5" />
                Link Único
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

            {/* Tab 1: Link Único */}
            <TabsContent value="link" className="space-y-4 mt-4">
              {generatedLink ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Novo link do convite
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="bg-muted/50 text-xs font-mono"
                      aria-label="Link do convite"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="shrink-0"
                      aria-label={isCopied ? 'Link copiado' : 'Copiar link'}
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
                <>
                  <div className="rounded-md border p-3 bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      Um novo link será gerado ao reenviar. O link anterior será invalidado.
                    </p>
                  </div>

                  <Button
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={() => handleResend('link')}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Gerar Novo Link
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
                  value={candidateEmail}
                  readOnly
                  className="bg-muted/50"
                  aria-label="Email do colaborador"
                />
              </div>

              <div className="rounded-md border p-3 bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Um novo link será gerado e enviado para{' '}
                  <span className="font-semibold text-foreground">{candidateEmail}</span>.
                </p>
              </div>

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => handleResend('email')}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Reenviar por Email
              </Button>
            </TabsContent>

            {/* Tab 3: WhatsApp */}
            <TabsContent value="whatsapp" className="space-y-4 mt-4">
              {isLoadingPhone ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Buscando telefone...</span>
                </div>
              ) : hasTeamMember && hasPhone ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Telefone do colaborador
                    </label>
                    <Input
                      value={formatPhoneDisplay(memberPhone!)}
                      readOnly
                      className="bg-muted/50"
                      aria-label="Telefone do colaborador"
                    />
                  </div>

                  <div className="rounded-md border p-3 bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      Um novo link será gerado e enviado via WhatsApp para{' '}
                      <span className="font-semibold text-foreground">
                        {formatPhoneDisplay(memberPhone!)}
                      </span>.
                    </p>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleResend('whatsapp')}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Reenviar por WhatsApp
                  </Button>
                </>
              ) : (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    {!hasTeamMember
                      ? 'Este convite não está vinculado a um colaborador da equipe. Utilize outro canal para reenviar.'
                      : 'Telefone não cadastrado para este colaborador. Edite o perfil do colaborador para adicionar um número de telefone.'}
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
