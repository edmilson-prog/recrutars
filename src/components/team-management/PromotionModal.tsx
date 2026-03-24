/**
 * PromotionModal
 * PRD-090 Phase 4: Dialog for registering a team member promotion.
 *
 * Allows selecting a new position (required) and optionally a new department.
 * When the department changes, the position select resets and reloads
 * positions for the new department.
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
import { TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePromoteMember } from '@/hooks/useTeamLifecycleMutation';
import { useDepartments, usePositions } from '@/hooks/useTeamsQuery';
import type { TeamMember, Department, Position } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PromotionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  companyId: string;
  currentDepartment?: Department;
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

export function PromotionModal({
  open,
  onOpenChange,
  member,
  companyId,
  currentDepartment,
  currentPosition,
  performedBy,
  onSuccess,
}: PromotionModalProps) {
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [newPositionId, setNewPositionId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayISO());
  const [justification, setJustification] = useState('');

  // The department used for loading positions: selected dept or current dept
  const positionsDeptId = selectedDeptId || member.departmentId;

  // Hooks
  const promoteMutation = usePromoteMember();
  const { data: departments = [] } = useDepartments(companyId);
  const { data: positions = [] } = usePositions(positionsDeptId);

  const activeDepartments = useMemo(
    () => departments.filter((d) => d.isActive ?? (d as Record<string, unknown>).is_active),
    [departments],
  );

  const activePositions = useMemo(
    () => positions.filter((p) => p.isActive ?? (p as Record<string, unknown>).is_active),
    [positions],
  );

  const isValid = newPositionId !== '' && effectiveDate !== '';

  // Reset position when department changes
  useEffect(() => {
    setNewPositionId('');
  }, [selectedDeptId]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setSelectedDeptId('');
    setNewPositionId('');
    setEffectiveDate(todayISO());
    setJustification('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (!newPositionId || !effectiveDate) return;

    try {
      await promoteMutation.mutateAsync({
        teamMemberId: member.id,
        newPositionId,
        newDepartmentId: selectedDeptId || undefined,
        effectiveDate,
        justification: justification || undefined,
        performedBy,
      });

      toast.success(`Promoção de ${member.name} registrada com sucesso`);
      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao registrar promoção. Tente novamente.');
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
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Registrar Promoção
          </DialogTitle>
          <DialogDescription>
            Registrar promoção de{' '}
            <span className="font-semibold">{member.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Current info (read-only) */}
          <div className="rounded-md border bg-muted/30 p-3 space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Cargo atual:</span>{' '}
              <span className="font-medium">
                {currentPosition?.title ?? 'Não definido'}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Departamento atual:</span>{' '}
              <span className="font-medium">
                {currentDepartment?.name ?? 'Não definido'}
              </span>
            </p>
          </div>

          {/* New department (optional) */}
          <div className="space-y-2">
            <Label htmlFor="promo-dept">Novo departamento</Label>
            <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
              <SelectTrigger id="promo-dept">
                <SelectValue placeholder="Manter departamento atual" />
              </SelectTrigger>
              <SelectContent>
                {activeDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New position (required) */}
          <div className="space-y-2">
            <Label htmlFor="promo-pos">
              Novo cargo <span aria-hidden="true">*</span>
            </Label>
            <Select value={newPositionId} onValueChange={setNewPositionId}>
              <SelectTrigger id="promo-pos">
                <SelectValue placeholder="Selecione o novo cargo" />
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
            <Label htmlFor="promo-date">
              Data efetiva <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="promo-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="promo-justification">Justificativa</Label>
            <Textarea
              id="promo-justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Justificativa para a promoção..."
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
            disabled={!isValid || promoteMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {promoteMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Registrar Promoção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
