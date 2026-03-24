/**
 * ReactivateModal
 * PRD-090 Phase 2: Dialog for rehiring a terminated team member.
 *
 * Includes department/position selection, date, optional notes,
 * and a toggle for keeping the existing Gauge-Pro profile.
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useReactivateMember } from '@/hooks/useTeamLifecycleMutation';
import { useDepartments, usePositions } from '@/hooks/useTeamsQuery';
import type { TeamMember } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReactivateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  companyId: string;
  performedBy: string;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns true if the last test date is more than 12 months ago.
 */
function isTestOlderThan12Months(lastTestDate?: string): boolean {
  if (!lastTestDate) return false;
  const testDate = new Date(lastTestDate);
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - 12);
  return testDate < threshold;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReactivateModal({
  open,
  onOpenChange,
  member,
  companyId,
  performedBy,
  onSuccess,
}: ReactivateModalProps) {
  const [hireDate, setHireDate] = useState(todayISO());
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [notes, setNotes] = useState('');
  const [keepGaugeProfile, setKeepGaugeProfile] = useState(true);

  // Hooks
  const reactivateMutation = useReactivateMember();
  const { data: departments = [] } = useDepartments(companyId);
  const { data: positions = [] } = usePositions(departmentId);

  const activeDepartments = useMemo(
    () => departments.filter((d) => d.isActive ?? (d as Record<string, unknown>).is_active),
    [departments],
  );

  const activePositions = useMemo(
    () => positions.filter((p) => p.isActive ?? (p as Record<string, unknown>).is_active),
    [positions],
  );

  const testIsOld = isTestOlderThan12Months(member.lastTestDate ?? member.lastTestDate);

  const isValid = hireDate !== '' && departmentId !== '' && positionId !== '';

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setHireDate(todayISO());
    setDepartmentId('');
    setPositionId('');
    setNotes('');
    setKeepGaugeProfile(true);
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  function handleDepartmentChange(id: string) {
    setDepartmentId(id);
    setPositionId(''); // reset position when department changes
  }

  async function handleSubmit() {
    if (!isValid) return;

    try {
      await reactivateMutation.mutateAsync({
        teamMemberId: member.id,
        hireDate,
        departmentId,
        positionId,
        notes: notes || undefined,
        keepGaugeProfile,
        performedBy,
      });

      toast.success(`${member.name} foi recontratado(a) com sucesso`);
      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao recontratar colaborador. Tente novamente.');
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
            <UserPlus className="h-5 w-5 text-green-500" />
            Recontratar Colaborador
          </DialogTitle>
          <DialogDescription>
            Readmitir <span className="font-semibold">{member.name}</span> na empresa
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Hire date */}
          <div className="space-y-2">
            <Label htmlFor="reactivate-date">
              Data de readmissão <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="reactivate-date"
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              required
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="reactivate-dept">
              Departamento <span aria-hidden="true">*</span>
            </Label>
            <Select value={departmentId} onValueChange={handleDepartmentChange}>
              <SelectTrigger id="reactivate-dept">
                <SelectValue placeholder="Selecione o departamento" />
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

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="reactivate-pos">
              Cargo <span aria-hidden="true">*</span>
            </Label>
            <Select
              value={positionId}
              onValueChange={setPositionId}
              disabled={!departmentId}
            >
              <SelectTrigger id="reactivate-pos">
                <SelectValue
                  placeholder={departmentId ? 'Selecione o cargo' : 'Selecione um departamento primeiro'}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="reactivate-notes">Observações</Label>
            <Textarea
              id="reactivate-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a recontratação..."
              className="min-h-[80px]"
            />
          </div>

          {/* Old test warning */}
          {testIsOld && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                O perfil Gauge-Pro deste colaborador tem mais de 12 meses. Recomendamos solicitar
                um novo teste apos a readmissão.
              </AlertDescription>
            </Alert>
          )}

          {/* Keep Gauge-Pro toggle */}
          <div className="flex items-center justify-between rounded-md border p-3 bg-muted/20">
            <div>
              <Label htmlFor="keep-gauge" className="text-sm">
                Manter perfil Gauge-Pro atual
              </Label>
              <p className="text-xs text-muted-foreground">
                Se desativado, o perfil comportamental sera removido
              </p>
            </div>
            <Switch
              id="keep-gauge"
              checked={keepGaugeProfile}
              onCheckedChange={setKeepGaugeProfile}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || reactivateMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {reactivateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Recontratar Colaborador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
