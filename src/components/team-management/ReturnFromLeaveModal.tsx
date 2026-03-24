/**
 * ReturnFromLeaveModal
 * PRD-090 Phase 3: Simple dialog for registering a team member's return from leave.
 *
 * Displays a summary of the current leave and collects the actual return date.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useReturnFromLeave } from '@/hooks/useTeamLifecycleMutation';
import type { TeamMember, LeaveType } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReturnFromLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  performedBy: string;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDateBR(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  medical_leave: 'Licença médica',
  maternity: 'Maternidade/Paternidade',
  vacation_extended: 'Férias prolongadas',
  unpaid_leave: 'Licença sem remuneração',
  sabbatical: 'Sabático',
  other: 'Outro',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReturnFromLeaveModal({
  open,
  onOpenChange,
  member,
  performedBy,
  onSuccess,
}: ReturnFromLeaveModalProps) {
  const [returnDate, setReturnDate] = useState(todayISO());
  const [notes, setNotes] = useState('');

  const returnMutation = useReturnFromLeave();

  const isValid = returnDate !== '';

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setReturnDate(todayISO());
    setNotes('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (!returnDate) return;

    try {
      await returnMutation.mutateAsync({
        teamMemberId: member.id,
        returnDate,
        notes: notes || undefined,
        performedBy,
      });

      toast.success(`Retorno de ${member.name} registrado com sucesso`);
      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao registrar retorno. Tente novamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const leaveTypeLabel = member.leaveType
    ? LEAVE_TYPE_LABELS[member.leaveType] ?? member.leaveType
    : 'Não informado';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-green-500" />
            Registrar Retorno
          </DialogTitle>
          <DialogDescription>
            Registrar retorno de afastamento de{' '}
            <span className="font-semibold">{member.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Leave summary */}
          <div className="rounded-md border bg-muted/30 p-3 space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Colaborador:</span>{' '}
              <span className="font-medium">{member.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Afastado desde:</span>{' '}
              <span className="font-medium">
                {member.leaveStartDate ? formatDateBR(member.leaveStartDate) : 'Não informado'}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Tipo:</span>{' '}
              <span className="font-medium">{leaveTypeLabel}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Retorno previsto:</span>{' '}
              <span className="font-medium">
                {member.leaveExpectedReturn
                  ? formatDateBR(member.leaveExpectedReturn)
                  : 'Não informado'}
              </span>
            </p>
          </div>

          {/* Return date */}
          <div className="space-y-2">
            <Label htmlFor="return-date">
              Data de retorno <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="return-date"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="return-notes">Observações</Label>
            <Textarea
              id="return-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o retorno..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || returnMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {returnMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            Registrar Retorno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
