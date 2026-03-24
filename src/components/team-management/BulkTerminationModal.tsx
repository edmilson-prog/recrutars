/**
 * BulkTerminationModal
 * PRD-090 Phase 6: Dialog for batch termination of multiple team members.
 *
 * Shows selected member names, collects termination reason, date,
 * optional notes, and requires explicit confirmation before processing.
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserMinus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useBulkTerminate } from '@/hooks/useTeamLifecycleMutation';
import { BulkActionProgressBar } from './BulkActionProgressBar';
import type { TeamMember, TerminationReason } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BulkTerminationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  performedBy: string;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TERMINATION_REASONS: { value: TerminationReason; label: string }[] = [
  { value: 'voluntary', label: 'Pedido de demissão' },
  { value: 'involuntary', label: 'Demissão pela empresa' },
  { value: 'contract_end', label: 'Término de contrato' },
  { value: 'retirement', label: 'Aposentadoria' },
  { value: 'mutual_agreement', label: 'Acordo mútuo' },
  { value: 'other', label: 'Outro' },
];

const MAX_VISIBLE_MEMBERS = 5;

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkTerminationModal({
  open,
  onOpenChange,
  members,
  performedBy,
  onSuccess,
}: BulkTerminationModalProps) {
  // Form state
  const [reason, setReason] = useState<TerminationReason | ''>('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Progress state
  const [showProgress, setShowProgress] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Mutation
  const bulkTerminate = useBulkTerminate();

  const count = members.length;
  const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS);
  const hiddenCount = count - MAX_VISIBLE_MEMBERS;

  const isValid =
    reason !== '' &&
    effectiveDate !== '' &&
    confirmed &&
    (reason !== 'other' || reasonDetail.trim().length > 0);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setReason('');
    setReasonDetail('');
    setEffectiveDate(todayISO());
    setNotes('');
    setConfirmed(false);
    setShowProgress(false);
    setProgressComplete(false);
    setErrorCount(0);
  }

  function handleOpenChange(value: boolean) {
    if (!value && bulkTerminate.isPending) return;
    if (!value) resetState();
    onOpenChange(value);
  }

  async function handleSubmit() {
    if (!reason || !effectiveDate) return;

    setShowProgress(true);
    setProgressComplete(false);
    setErrorCount(0);

    try {
      await bulkTerminate.mutateAsync({
        teamMemberIds: members.map((m) => m.id),
        terminationReason: reason,
        terminationReasonDetail: reason === 'other' ? reasonDetail : undefined,
        terminationDate: effectiveDate,
        terminationNotes: notes || undefined,
        performedBy,
      });

      setProgressComplete(true);
      toast.success(`${count} colaborador${count > 1 ? 'es' : ''} desligado${count > 1 ? 's' : ''} com sucesso`);

      // Close after brief delay to show success state
      setTimeout(() => {
        handleOpenChange(false);
        onSuccess?.();
      }, 1200);
    } catch {
      setProgressComplete(true);
      setErrorCount(count);
      toast.error('Erro ao processar desligamento em lote. Tente novamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-red-500" />
            Desligar {count} Colaborador{count > 1 ? 'es' : ''}
          </DialogTitle>
          <DialogDescription>
            Processo de desligamento em lote para os colaboradores selecionados
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
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" aria-hidden="true" />
                    <span>{m.name}</span>
                    <span className="text-muted-foreground text-xs">({m.email})</span>
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

          {/* Termination reason */}
          <div className="space-y-2">
            <Label htmlFor="bulk-term-reason">
              Motivo do desligamento <span aria-hidden="true">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as TerminationReason)}
              disabled={bulkTerminate.isPending}
            >
              <SelectTrigger id="bulk-term-reason">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {TERMINATION_REASONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="bulk-term-reason-detail">
                Detalhe do motivo <span aria-hidden="true">*</span>
              </Label>
              <Textarea
                id="bulk-term-reason-detail"
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="Descreva o motivo do desligamento..."
                className="min-h-[80px]"
                disabled={bulkTerminate.isPending}
                required
              />
            </div>
          )}

          {/* Effective date */}
          <div className="space-y-2">
            <Label htmlFor="bulk-term-date">
              Data efetiva <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="bulk-term-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              disabled={bulkTerminate.isPending}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="bulk-term-notes">Observações</Label>
            <Textarea
              id="bulk-term-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações compartilhadas para todos os desligamentos..."
              className="min-h-[80px]"
              disabled={bulkTerminate.isPending}
            />
          </div>

          {/* Warning */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-400">
              Voce esta prestes a desligar{' '}
              <span className="font-semibold">{count} colaborador{count > 1 ? 'es' : ''}</span>.
              Esta acao nao pode ser desfeita automaticamente.
            </AlertDescription>
          </Alert>

          {/* Confirmation checkbox */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="bulk-term-confirm"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
              disabled={bulkTerminate.isPending}
            />
            <label
              htmlFor="bulk-term-confirm"
              className="text-sm leading-snug cursor-pointer"
            >
              Confirmo o desligamento dos{' '}
              <span className="font-semibold">{count} colaborador{count > 1 ? 'es' : ''}</span>{' '}
              selecionados
            </label>
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
            disabled={bulkTerminate.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isValid || bulkTerminate.isPending}
          >
            {bulkTerminate.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserMinus className="h-4 w-4 mr-2" />
            )}
            Desligar Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
