/**
 * Invitation Detail Sheet
 * Drawer lateral com header, metadados, timeline, audit log e ações
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  RefreshCw, XCircle, CalendarPlus, Pencil, Mail, Link2, MessageSquare,
  Copy, Check, ChevronDown, History, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import { InvitationTimeline } from './InvitationTimeline';
import { useInvitationAuditLogs } from '@/hooks/useInvitationManagerQuery';
import type { TestInvitation, AuditLog } from '@/types/companyTest';

interface InvitationDetailSheetProps {
  invitation: TestInvitation | null;
  open: boolean;
  onClose: () => void;
  onResend: (id: string) => void;
  onCancel: (id: string) => Promise<void>;
  onExtendDeadline: (id: string, newExpiresAt: string) => Promise<void>;
  onUpdateRecipient: (id: string, name?: string, email?: string) => Promise<void>;
}

const methodIcons: Record<string, typeof Mail> = {
  email: Mail,
  internal: MessageSquare,
  public_link: Link2,
};

const methodLabels: Record<string, string> = {
  email: 'Email',
  internal: 'Da base',
  public_link: 'Link público',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getTimeRemaining(expiresAt: string): { label: string; urgent: boolean; expired: boolean } {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return { label: 'Expirado', urgent: true, expired: true };

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) return { label: `${diffDays} dias restantes`, urgent: false, expired: false };
  if (diffDays >= 1) return { label: `${diffDays}d ${diffHours % 24}h restantes`, urgent: diffDays <= 2, expired: false };
  return { label: `${diffHours}h restantes`, urgent: true, expired: false };
}

const auditActionLabels: Record<string, string> = {
  invite_sent: 'Convite enviado',
  invite_resent: 'Convite reenviado',
  invite_cancelled: 'Convite cancelado',
  invite_viewed: 'Link acessado',
  invite_extended: 'Prazo estendido',
  invite_updated: 'Destinatário atualizado',
  test_started: 'Teste iniciado',
  test_completed: 'Teste concluído',
  test_abandoned: 'Teste abandonado',
  credit_consumed: 'Crédito consumido',
  credit_refunded: 'Crédito reembolsado',
  cpf_verified: 'CPF verificado',
  cpf_failed: 'CPF inválido',
};

function canResend(status: string): boolean {
  return ['sent', 'viewed', 'expired'].includes(status);
}
function canCancel(status: string): boolean {
  return ['sent', 'viewed', 'started'].includes(status);
}
function canExtend(status: string): boolean {
  return ['sent', 'viewed', 'started'].includes(status);
}
function canEdit(status: string): boolean {
  return ['sent', 'viewed'].includes(status);
}

export function InvitationDetailSheet({
  invitation,
  open,
  onClose,
  onResend,
  onCancel,
  onExtendDeadline,
  onUpdateRecipient,
}: InvitationDetailSheetProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Extend deadline state
  const [extendOpen, setExtendOpen] = useState(false);
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [isExtending, setIsExtending] = useState(false);

  // Edit recipient state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { data: auditLogs, isLoading: auditLoading } = useInvitationAuditLogs(
    open && auditOpen ? invitation?.id : undefined
  );

  const handleCopyToken = () => {
    if (invitation?.token) {
      navigator.clipboard.writeText(invitation.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!invitation) return;
    setIsCancelling(true);
    try {
      await onCancel(invitation.id);
      onClose();
    } finally {
      setIsCancelling(false);
    }
  };

  const handleExtend = async () => {
    if (!invitation || !newExpiresAt) return;
    setIsExtending(true);
    try {
      await onExtendDeadline(invitation.id, new Date(newExpiresAt).toISOString());
      setExtendOpen(false);
      setNewExpiresAt('');
    } finally {
      setIsExtending(false);
    }
  };

  const handleStartEdit = () => {
    if (!invitation) return;
    setEditName(invitation.candidateName);
    setEditEmail(invitation.candidateEmail);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!invitation) return;
    setIsSavingEdit(true);
    try {
      const nameChanged = editName !== invitation.candidateName ? editName : undefined;
      const emailChanged = editEmail !== invitation.candidateEmail ? editEmail : undefined;
      if (nameChanged || emailChanged) {
        await onUpdateRecipient(invitation.id, nameChanged, emailChanged);
      }
      setEditMode(false);
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (!invitation) return null;

  const MethodIcon = methodIcons[invitation.method] ?? Mail;
  const remaining = getTimeRemaining(invitation.expiresAt);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] overflow-y-auto"
        aria-label={`Detalhes do convite para ${invitation.candidateName}`}
      >
        {/* Header */}
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="text-lg truncate">{invitation.candidateName}</SheetTitle>
              <p className="text-sm text-muted-foreground truncate">{invitation.candidateEmail}</p>
            </div>
            <InvitationStatusBadge status={invitation.status} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {canResend(invitation.status) && (
              <Button variant="outline" size="sm" onClick={() => onResend(invitation.id)} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Reenviar
              </Button>
            )}
            {canExtend(invitation.status) && (
              <Popover open={extendOpen} onOpenChange={setExtendOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Estender prazo
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="start">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Nova data de expiração</p>
                    <div className="flex gap-2">
                      {[7, 14, 30].map((days) => (
                        <Button
                          key={days}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + days);
                            setNewExpiresAt(d.toISOString().split('T')[0]);
                          }}
                        >
                          +{days}d
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="date"
                      value={newExpiresAt}
                      onChange={(e) => setNewExpiresAt(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!newExpiresAt || isExtending}
                      onClick={handleExtend}
                    >
                      {isExtending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                      Confirmar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {canEdit(invitation.status) && !editMode && (
              <Button variant="outline" size="sm" onClick={handleStartEdit} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            )}
            {canCancel(invitation.status) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1.5">
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O convite para <strong>{invitation.candidateName}</strong> será revogado e o link
                      deixará de funcionar. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Manter convite</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isCancelling && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                      Cancelar convite
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </SheetHeader>

        <Separator />

        {/* Edit Mode */}
        {editMode && (
          <>
            <div className="py-4 space-y-3">
              <p className="text-sm font-medium">Editar destinatário</p>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={isSavingEdit}>
                  {isSavingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Salvar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Metadata Grid */}
        <div className="py-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">Canal</dt>
              <dd className="flex items-center gap-1.5 mt-0.5">
                <MethodIcon className="h-4 w-4 text-muted-foreground" />
                {methodLabels[invitation.method]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Enviado em</dt>
              <dd className="mt-0.5">{formatDate(invitation.sentAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Expira em</dt>
              <dd className={cn('mt-0.5', remaining.urgent && 'text-red-500 font-medium')}>
                {remaining.expired ? formatDate(invitation.expiresAt) : remaining.label}
              </dd>
            </div>
            {invitation.testName && (
              <div>
                <dt className="text-muted-foreground text-xs">Teste</dt>
                <dd className="mt-0.5 truncate">{invitation.testName}</dd>
              </div>
            )}
            {invitation.inviteOrigin && (
              <div>
                <dt className="text-muted-foreground text-xs">Origem</dt>
                <dd className="mt-0.5">
                  {invitation.inviteOrigin === 'invite_email' ? 'Email direto' :
                    invitation.inviteOrigin === 'invite_base' ? 'Da base' :
                      invitation.inviteOrigin === 'invite_link' ? 'Link público' :
                        invitation.inviteOrigin}
                </dd>
              </div>
            )}
            {invitation.token && (
              <div className="col-span-2">
                <dt className="text-muted-foreground text-xs">Token</dt>
                <dd className="flex items-center gap-2 mt-0.5">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-[200px]">
                    {invitation.token.substring(0, 16)}...
                  </code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyToken}>
                    {copiedToken ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <Separator />

        {/* Timeline */}
        <div className="py-4">
          <p className="text-sm font-medium mb-4">Jornada do convite</p>
          <InvitationTimeline invitation={invitation} />
        </div>

        <Separator />

        {/* Audit Log (Collapsible) */}
        <Collapsible open={auditOpen} onOpenChange={setAuditOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-sm font-medium hover:text-foreground/80 transition-colors">
            <span className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico de atividades
            </span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', auditOpen && 'rotate-180')} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pb-4 space-y-2">
              {auditLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs border-l-2 border-muted pl-3 py-1">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {auditActionLabels[log.action] ?? log.action}
                      </p>
                      {log.details && (
                        <p className="text-muted-foreground truncate">{log.details}</p>
                      )}
                      <p className="text-muted-foreground/60 mt-0.5">
                        {log.userName} · {formatDate(log.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Nenhuma atividade registrada</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </SheetContent>
    </Sheet>
  );
}
