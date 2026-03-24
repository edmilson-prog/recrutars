/**
 * PositionChangeModal
 * PRD-090 Phase 4: Dialog for a lateral position change (not a promotion).
 *
 * Lists positions within the member's current department, excluding
 * the current position.
 */

import { useState, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useChangePosition } from '@/hooks/useTeamLifecycleMutation';
import { usePositions } from '@/hooks/useTeamsQuery';
import type { TeamMember, Position } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PositionChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  currentPosition?: Position;
  performedBy: string;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PositionChangeModal({
  open,
  onOpenChange,
  member,
  currentPosition,
  performedBy,
  onSuccess,
}: PositionChangeModalProps) {
  const [newPositionId, setNewPositionId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayISO());
  const [reason, setReason] = useState('');

  // Hooks
  const changeMutation = useChangePosition();
  const { data: positions = [] } = usePositions(member.departmentId);

  // Exclude the current position from the list
  const availablePositions = useMemo(
    () =>
      positions
        .filter((p) => p.isActive ?? (p as Record<string, unknown>).is_active)
        .filter((p) => p.id !== member.positionId),
    [positions, member.positionId],
  );

  const isValid = newPositionId !== '' && effectiveDate !== '';

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setNewPositionId('');
    setEffectiveDate(todayISO());
    setReason('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (!newPositionId || !effectiveDate) return;

    try {
      await changeMutation.mutateAsync({
        teamMemberId: member.id,
        newPositionId,
        effectiveDate,
        reason: reason || undefined,
        performedBy,
      });

      toast.success(`Cargo de ${member.name} alterado com sucesso`);
      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao alterar cargo. Tente novamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-violet-500" />
            Alterar Cargo
          </DialogTitle>
          <DialogDescription>
            Alterar cargo de{' '}
            <span className="font-semibold">{member.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current position (read-only) */}
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p>
              <span className="text-muted-foreground">Cargo atual:</span>{' '}
              <span className="font-medium">
                {currentPosition?.title ?? 'Não definido'}
              </span>
            </p>
          </div>

          {/* New position (required) */}
          <div className="space-y-2">
            <Label htmlFor="change-pos">
              Novo cargo <span aria-hidden="true">*</span>
            </Label>
            <Select value={newPositionId} onValueChange={setNewPositionId}>
              <SelectTrigger id="change-pos">
                <SelectValue placeholder="Selecione o novo cargo" />
              </SelectTrigger>
              <SelectContent>
                {availablePositions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Effective date */}
          <div className="space-y-2">
            <Label htmlFor="change-date">
              Data efetiva <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="change-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="change-reason">Motivo</Label>
            <Textarea
              id="change-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo da mudança de cargo..."
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
            disabled={!isValid || changeMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {changeMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Alterar Cargo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
