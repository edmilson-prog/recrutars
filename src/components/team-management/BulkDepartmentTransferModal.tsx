/**
 * BulkDepartmentTransferModal
 * PRD-090 Phase 6: Dialog for batch department transfer of multiple team members.
 *
 * Shows selected member names, collects destination department, effective date,
 * and optional reason before processing the bulk transfer.
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useBulkTransferDepartment } from '@/hooks/useTeamLifecycleMutation';
import { useDepartments } from '@/hooks/useTeamsQuery';
import { BulkActionProgressBar } from './BulkActionProgressBar';
import type { TeamMember } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BulkDepartmentTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  companyId: string;
  performedBy: string;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_VISIBLE_MEMBERS = 5;

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkDepartmentTransferModal({
  open,
  onOpenChange,
  members,
  companyId,
  performedBy,
  onSuccess,
}: BulkDepartmentTransferModalProps) {
  // Form state
  const [newDeptId, setNewDeptId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayISO());
  const [reason, setReason] = useState('');

  // Progress state
  const [showProgress, setShowProgress] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Hooks
  const bulkTransfer = useBulkTransferDepartment();
  const { data: departments = [] } = useDepartments(companyId);

  const count = members.length;
  const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS);
  const hiddenCount = count - MAX_VISIBLE_MEMBERS;

  // Collect department IDs that the selected members currently belong to
  const memberDeptIds = useMemo(
    () => new Set(members.map((m) => m.departmentId)),
    [members],
  );

  // Show all active departments (user may transfer members from mixed depts)
  const availableDepartments = useMemo(
    () =>
      departments.filter(
        (d) => (d.isActive ?? (d as Record<string, unknown>).is_active),
      ),
    [departments],
  );

  // Warn when destination matches some members' current department
  const hasOverlap = newDeptId !== '' && memberDeptIds.has(newDeptId);

  const isValid = newDeptId !== '' && effectiveDate !== '';

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setNewDeptId('');
    setEffectiveDate(todayISO());
    setReason('');
    setShowProgress(false);
    setProgressComplete(false);
    setErrorCount(0);
  }

  function handleOpenChange(value: boolean) {
    if (!value && bulkTransfer.isPending) return;
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (!newDeptId || !effectiveDate) return;

    setShowProgress(true);
    setProgressComplete(false);
    setErrorCount(0);

    try {
      await bulkTransfer.mutateAsync({
        teamMemberIds: members.map((m) => m.id),
        newDepartmentId: newDeptId,
        effectiveDate,
        reason: reason || undefined,
        performedBy,
      });

      setProgressComplete(true);
      toast.success(
        `${count} colaborador${count > 1 ? 'es' : ''} transferido${count > 1 ? 's' : ''} com sucesso`,
      );

      setTimeout(() => {
        handleOpenChange(false);
        onSuccess?.();
      }, 1200);
    } catch {
      setProgressComplete(true);
      setErrorCount(count);
      toast.error('Erro ao processar transferencia em lote. Tente novamente.');
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
            Transferir {count} Colaborador{count > 1 ? 'es' : ''} de Departamento
          </DialogTitle>
          <DialogDescription>
            Transferir os colaboradores selecionados para outro departamento
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Selected member list */}
          <div className="space-y-2">
            <Label>Colaboradores selecionados</Label>
            <ScrollArea className={cn('rounded-md border p-3', count > MAX_VISIBLE_MEMBERS && 'max-h-[140px]')}>
              <ul className="space-y-1" aria-label="Colaboradores selecionados">
                {visibleMembers.map((m) => (
                  <li key={m.id} className="text-sm flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" aria-hidden="true" />
                    <span>{m.name}</span>
                  </li>
                ))}
                {hiddenCount > 0 && (
                  <li className="text-sm text-muted-foreground font-medium pt-1">
                    +{hiddenCount} mais
                  </li>
                )}
              </ul>
            </ScrollArea>
          </div>

          {/* Destination department */}
          <div className="space-y-2">
            <Label htmlFor="bulk-transfer-dept">
              Departamento de destino <span aria-hidden="true">*</span>
            </Label>
            <Select
              value={newDeptId}
              onValueChange={setNewDeptId}
              disabled={bulkTransfer.isPending}
            >
              <SelectTrigger id="bulk-transfer-dept">
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
            {hasOverlap && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Alguns colaboradores ja pertencem a este departamento e serao ignorados.
              </p>
            )}
          </div>

          {/* Effective date */}
          <div className="space-y-2">
            <Label htmlFor="bulk-transfer-date">
              Data efetiva <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="bulk-transfer-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              disabled={bulkTransfer.isPending}
              required
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="bulk-transfer-reason">Motivo</Label>
            <Textarea
              id="bulk-transfer-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Reestruturação organizacional..."
              className="min-h-[80px]"
              disabled={bulkTransfer.isPending}
            />
          </div>

          {/* Progress bar */}
          {showProgress && (
            <BulkActionProgressBar
              current={progressComplete ? count : Math.floor(count * 0.6)}
              total={count}
              isComplete={progressComplete}
              errorCount={errorCount}
            />
          )}
        </div>

        <Separator />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={bulkTransfer.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || bulkTransfer.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {bulkTransfer.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRightLeft className="h-4 w-4 mr-2" />
            )}
            Transferir Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
