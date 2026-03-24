/**
 * LeaveModal
 * PRD-090 Phase 3: Dialog for registering a temporary leave for a team member.
 *
 * Supports multiple leave types (medical, maternity, vacation, etc.),
 * optional expected return date, and a metrics inclusion toggle.
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PauseCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStartLeave } from '@/hooks/useTeamLifecycleMutation';
import type { TeamMember, LeaveType } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  performedBy: string;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'medical_leave', label: 'Licença médica' },
  { value: 'maternity', label: 'Maternidade/Paternidade' },
  { value: 'vacation_extended', label: 'Férias prolongadas' },
  { value: 'unpaid_leave', label: 'Licença sem remuneração' },
  { value: 'sabbatical', label: 'Sabático' },
  { value: 'other', label: 'Outro' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeaveModal({
  open,
  onOpenChange,
  member,
  performedBy,
  onSuccess,
}: LeaveModalProps) {
  const [leaveType, setLeaveType] = useState<LeaveType | ''>('');
  const [startDate, setStartDate] = useState(todayISO());
  const [expectedReturn, setExpectedReturn] = useState('');
  const [includeMetrics, setIncludeMetrics] = useState(false);
  const [notes, setNotes] = useState('');

  const leaveMutation = useStartLeave();

  const isValid = leaveType !== '' && startDate !== '';

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setLeaveType('');
    setStartDate(todayISO());
    setExpectedReturn('');
    setIncludeMetrics(false);
    setNotes('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (!leaveType || !startDate) return;

    try {
      await leaveMutation.mutateAsync({
        teamMemberId: member.id,
        leaveType,
        leaveStartDate: startDate,
        leaveExpectedReturn: expectedReturn || undefined,
        leaveIncludeMetrics: includeMetrics,
        notes: notes || undefined,
        performedBy,
      });

      toast.success(`Afastamento de ${member.name} registrado com sucesso`);
      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao registrar afastamento. Tente novamente.');
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
            <PauseCircle className="h-5 w-5 text-amber-500" />
            Registrar Afastamento
          </DialogTitle>
          <DialogDescription>
            Registrar afastamento temporário de{' '}
            <span className="font-semibold">{member.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Leave type */}
          <div className="space-y-2">
            <Label htmlFor="leave-type">
              Tipo de afastamento <span aria-hidden="true">*</span>
            </Label>
            <Select
              value={leaveType}
              onValueChange={(v) => setLeaveType(v as LeaveType)}
            >
              <SelectTrigger id="leave-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start date */}
          <div className="space-y-2">
            <Label htmlFor="leave-start">
              Data de início <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="leave-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* Expected return */}
          <div className="space-y-2">
            <Label htmlFor="leave-return">Data prevista de retorno</Label>
            <Input
              id="leave-return"
              type="date"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              min={startDate}
            />
          </div>

          {/* Include in metrics toggle */}
          <div className="flex items-center justify-between rounded-md border p-3 bg-muted/20">
            <div className="space-y-0.5 mr-4">
              <Label htmlFor="leave-metrics" className="text-sm">
                Incluir nas métricas durante afastamento
              </Label>
              <p className="text-xs text-muted-foreground">
                Se ativado, este colaborador continuará sendo contabilizado no mapa comportamental
              </p>
            </div>
            <Switch
              id="leave-metrics"
              checked={includeMetrics}
              onCheckedChange={setIncludeMetrics}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="leave-notes">Observações</Label>
            <Textarea
              id="leave-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o afastamento..."
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
            disabled={!isValid || leaveMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {leaveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PauseCircle className="h-4 w-4 mr-2" />
            )}
            Registrar Afastamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
