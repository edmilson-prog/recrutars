/**
 * DepartmentTransferModal
 * PRD-090 Phase 4: Dialog for transferring a team member to a different department.
 *
 * The current department is excluded from the selection.
 * When a new department is selected, an optional position select loads
 * positions for that department.
 */

import { useState, useMemo, useEffect } from 'react';
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
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTransferDepartment } from '@/hooks/useTeamLifecycleMutation';
import { useDepartments, usePositions } from '@/hooks/useTeamsQuery';
import type { TeamMember, Department } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DepartmentTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  companyId: string;
  currentDepartment?: Department;
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

export function DepartmentTransferModal({
  open,
  onOpenChange,
  member,
  companyId,
  currentDepartment,
  performedBy,
  onSuccess,
}: DepartmentTransferModalProps) {
  const [newDeptId, setNewDeptId] = useState('');
  const [newPositionId, setNewPositionId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayISO());
  const [reason, setReason] = useState('');

  // Hooks
  const transferMutation = useTransferDepartment();
  const { data: departments = [] } = useDepartments(companyId);
  const { data: positions = [] } = usePositions(newDeptId);

  // Filter out current department from options
  const availableDepartments = useMemo(
    () =>
      departments
        .filter((d) => d.isActive ?? (d as Record<string, unknown>).is_active)
        .filter((d) => d.id !== member.departmentId),
    [departments, member.departmentId],
  );

  const activePositions = useMemo(
    () => positions.filter((p) => p.isActive ?? (p as Record<string, unknown>).is_active),
    [positions],
  );

  const isValid = newDeptId !== '' && effectiveDate !== '';

  // Reset position when department changes
  useEffect(() => {
    setNewPositionId('');
  }, [newDeptId]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setNewDeptId('');
    setNewPositionId('');
    setEffectiveDate(todayISO());
    setReason('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (!newDeptId || !effectiveDate) return;

    try {
      await transferMutation.mutateAsync({
        teamMemberId: member.id,
        newDepartmentId: newDeptId,
        newPositionId: newPositionId || undefined,
        effectiveDate,
        reason: reason || undefined,
        performedBy,
      });

      toast.success(`Transferência de ${member.name} registrada com sucesso`);
      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao registrar transferência. Tente novamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
            Transferir Departamento
          </DialogTitle>
          <DialogDescription>
            Transferir <span className="font-semibold">{member.name}</span> para
            outro departamento
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Current department (read-only) */}
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p>
              <span className="text-muted-foreground">Departamento atual:</span>{' '}
              <span className="font-medium">
                {currentDepartment?.name ?? 'Não definido'}
              </span>
            </p>
          </div>

          {/* New department (required) */}
          <div className="space-y-2">
            <Label htmlFor="transfer-dept">
              Novo departamento <span aria-hidden="true">*</span>
            </Label>
            <Select value={newDeptId} onValueChange={setNewDeptId}>
              <SelectTrigger id="transfer-dept">
                <SelectValue placeholder="Selecione o departamento" />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New position (optional) */}
          <div className="space-y-2">
            <Label htmlFor="transfer-pos">Novo cargo</Label>
            <Select
              value={newPositionId}
              onValueChange={setNewPositionId}
              disabled={!newDeptId}
            >
              <SelectTrigger id="transfer-pos">
                <SelectValue
                  placeholder={
                    newDeptId
                      ? 'Selecione o cargo (opcional)'
                      : 'Selecione um departamento primeiro'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {activePositions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Effective date */}
          <div className="space-y-2">
            <Label htmlFor="transfer-date">
              Data efetiva <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="transfer-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="transfer-reason">Motivo</Label>
            <Textarea
              id="transfer-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo da transferência..."
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
            disabled={!isValid || transferMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {transferMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRightLeft className="h-4 w-4 mr-2" />
            )}
            Transferir Departamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
