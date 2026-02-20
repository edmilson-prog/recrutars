/**
 * Admin Helpdesk Ticket Detail Page
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Layout: header + thread (center) + context panel (sidebar).
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TicketHeader } from '@/components/helpdesk/TicketHeader';
import { AdminTicketThread } from '@/components/helpdesk/AdminTicketThread';
import { AdminReplyComposer } from '@/components/helpdesk/AdminReplyComposer';
import { RequesterContextPanel } from '@/components/helpdesk/RequesterContextPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminTicket,
  useUpdateTicketStatusAdmin,
  useUpdateTicketPriority,
  useSendAdminReply,
  useAddInternalNote,
  useLogTicketAction,
  useExtendSLA,
  useRequesterContext,
} from '@/hooks/useAdminTicketsQuery';
import type { TicketStatus, TicketPriority } from '@/types/help';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function TicketDetailContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: ticket, isLoading } = useAdminTicket(id ?? '');
  const { data: requesterContext, isLoading: contextLoading } = useRequesterContext(
    ticket?.userId ?? ''
  );

  const updateStatus = useUpdateTicketStatusAdmin();
  const updatePriority = useUpdateTicketPriority();
  const sendReply = useSendAdminReply();
  const addNote = useAddInternalNote();
  const logAction = useLogTicketAction();
  const extendSLAMutation = useExtendSLA();

  const [slaDialogOpen, setSlaDialogOpen] = useState(false);
  const [slaHours, setSlaHours] = useState('2');
  const [slaReason, setSlaReason] = useState('');

  const isUpdating = updateStatus.isPending || updatePriority.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground mb-4">Ticket não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/admin/helpdesk')}>
          Voltar para Helpdesk
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (status: TicketStatus) => {
    const oldStatus = ticket.status;
    try {
      await updateStatus.mutateAsync({ id: ticket.id, status });
      await logAction.mutateAsync({
        ticketId: ticket.id,
        action: 'status_changed',
        performedBy: user!.id,
        performedByName: user!.name,
        oldValue: oldStatus,
        newValue: status,
      });
      toast({ title: 'Status atualizado' });
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    const oldPriority = ticket.priority;
    try {
      await updatePriority.mutateAsync({ id: ticket.id, priority });
      await logAction.mutateAsync({
        ticketId: ticket.id,
        action: 'priority_changed',
        performedBy: user!.id,
        performedByName: user!.name,
        oldValue: oldPriority,
        newValue: priority,
      });
      toast({ title: 'Prioridade atualizada' });
    } catch {
      toast({ title: 'Erro ao atualizar prioridade', variant: 'destructive' });
    }
  };

  const handleSendReply = async (content: string) => {
    try {
      await sendReply.mutateAsync({
        ticketId: ticket.id,
        content,
        senderId: user!.id,
      });
      await logAction.mutateAsync({
        ticketId: ticket.id,
        action: 'reply_sent',
        performedBy: user!.id,
        performedByName: user!.name,
      });
      toast({ title: 'Resposta enviada' });
    } catch {
      toast({ title: 'Erro ao enviar resposta', variant: 'destructive' });
    }
  };

  const handleAddNote = async (content: string) => {
    try {
      await addNote.mutateAsync({
        ticketId: ticket.id,
        content,
        senderId: user!.id,
      });
      await logAction.mutateAsync({
        ticketId: ticket.id,
        action: 'internal_note_added',
        performedBy: user!.id,
        performedByName: user!.name,
      });
      toast({ title: 'Nota interna adicionada' });
    } catch {
      toast({ title: 'Erro ao adicionar nota', variant: 'destructive' });
    }
  };

  const handleExtendSLA = async () => {
    if (!slaReason.trim()) return;

    const hours = parseInt(slaHours);
    if (isNaN(hours) || hours < 1) return;

    const newDeadline = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    try {
      await extendSLAMutation.mutateAsync({
        id: ticket.id,
        newDeadline,
        reason: slaReason.trim(),
      });
      toast({ title: `SLA estendido em ${hours}h` });
      setSlaDialogOpen(false);
      setSlaReason('');
      setSlaHours('2');
    } catch {
      toast({ title: 'Erro ao estender SLA', variant: 'destructive' });
    }
  };

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <TicketHeader
          ticket={ticket}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onExtendSLA={() => setSlaDialogOpen(true)}
          isUpdating={isUpdating}
        />

        {/* Main content: Thread + Context sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Thread + Reply */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 max-h-[60vh] overflow-y-auto">
              <AdminTicketThread messages={ticket.messages} />
            </div>

            {!isResolved && (
              <AdminReplyComposer
                onSendReply={handleSendReply}
                onAddNote={handleAddNote}
                disabled={sendReply.isPending || addNote.isPending}
              />
            )}

            {isResolved && (
              <div className="rounded-lg border border-border/50 bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Este ticket está {ticket.status === 'closed' ? 'fechado' : 'resolvido'}.
                </p>
              </div>
            )}
          </div>

          {/* Context Panel */}
          <div className="hidden lg:block">
            <RequesterContextPanel
              context={requesterContext}
              isLoading={contextLoading}
            />
          </div>
        </div>

        {/* Audit Log (collapsed) */}
        {ticket.auditLog && ticket.auditLog.length > 0 && (
          <details className="rounded-lg border border-border/50 bg-card/50">
            <summary className="px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
              Registro de Auditoria ({ticket.auditLog.length} entradas)
            </summary>
            <div className="px-4 pb-3 space-y-2">
              {ticket.auditLog.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">
                    {new Date(entry.createdAt).toLocaleString('pt-BR')}
                  </span>
                  <span>—</span>
                  <span>
                    <span className="font-medium">{entry.performedByName ?? 'Sistema'}</span>
                    {': '}
                    {entry.action.replace(/_/g, ' ')}
                    {entry.oldValue && entry.newValue && (
                      <> ({entry.oldValue} → {entry.newValue})</>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* SLA Extension Dialog */}
      <Dialog open={slaDialogOpen} onOpenChange={setSlaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estender SLA</DialogTitle>
            <DialogDescription>
              Defina o novo prazo e justifique a extensão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Horas adicionais</Label>
              <Input
                type="number"
                min="1"
                max="72"
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
              />
            </div>
            <div>
              <Label>Justificativa</Label>
              <Textarea
                placeholder="Motivo da extensão do SLA..."
                value={slaReason}
                onChange={(e) => setSlaReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleExtendSLA}
              disabled={!slaReason.trim() || extendSLAMutation.isPending}
            >
              Estender
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminHelpdeskTicketDetail() {
  return (
    <DashboardLayout userType="admin">
      <TicketDetailContent />
    </DashboardLayout>
  );
}
