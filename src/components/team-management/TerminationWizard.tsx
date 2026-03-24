/**
 * TerminationWizard
 * PRD-090 Phase 2: 3-step wizard for employee termination.
 *
 * Step 1 — Motivo & Data
 * Step 2 — Checklist & Observações
 * Step 3 — Resumo & Confirmacao
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
import { UserMinus, Loader2, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTerminateMember } from '@/hooks/useTeamLifecycleMutation';
import { useOffboardingTemplates } from '@/hooks/useTeamMemberEventsQuery';
import type { TeamMember, TerminationReason } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TerminationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  companyId: string;
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

const STEP_LABELS = ['Motivo', 'Detalhes', 'Confirmação'] as const;

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Progresso do wizard" className="flex items-center justify-center gap-3 pb-2">
      {STEP_LABELS.map((label, idx) => {
        const isActive = idx === current;
        const isDone = idx < current;

        return (
          <div key={label} className="flex items-center gap-2">
            {idx > 0 && (
              <div
                className={cn(
                  'h-px w-6',
                  isDone ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isDone && 'bg-primary/20 text-primary',
                  !isActive && !isDone && 'bg-muted text-muted-foreground',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] leading-none',
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TerminationWizard({
  open,
  onOpenChange,
  member,
  companyId,
  performedBy,
  onSuccess,
}: TerminationWizardProps) {
  // Step state
  const [step, setStep] = useState(0);

  // Step 1
  const [reason, setReason] = useState<TerminationReason | ''>('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(todayISO());

  // Step 2
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [confidentialNotes, setConfidentialNotes] = useState('');
  const [notifyCollaborator, setNotifyCollaborator] = useState(false);

  // Step 3
  const [confirmed, setConfirmed] = useState(false);

  // Hooks
  const terminateMutation = useTerminateMember();
  const { data: templates = [] } = useOffboardingTemplates(companyId);

  const activeTemplates = useMemo(
    () => templates.filter((t) => t.isActive ?? t.is_active),
    [templates],
  );

  const isFutureDate = effectiveDate > todayISO();

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const step1Valid = reason !== '' && effectiveDate !== '' && (reason !== 'other' || reasonDetail.trim().length > 0);
  const step3Valid = confirmed;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setStep(0);
    setReason('');
    setReasonDetail('');
    setEffectiveDate(todayISO());
    setCheckedItems(new Set());
    setConfidentialNotes('');
    setNotifyCollaborator(false);
    setConfirmed(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  function handleToggleCheckItem(itemId: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (!reason) return;

    try {
      await terminateMutation.mutateAsync({
        teamMemberId: member.id,
        terminationReason: reason,
        terminationReasonDetail: reason === 'other' ? reasonDetail : undefined,
        terminationDate: effectiveDate,
        terminationNotes: confidentialNotes || undefined,
        notifyCollaborator,
        offboardingItems: Array.from(checkedItems),
        performedBy,
      });

      toast.success(
        isFutureDate
          ? `Desligamento de ${member.name} programado para ${formatDateBR(effectiveDate)}`
          : `${member.name} foi desligado(a) com sucesso`,
      );

      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao processar desligamento. Tente novamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // Reason label helper
  // ---------------------------------------------------------------------------

  function getReasonLabel(r: TerminationReason): string {
    return TERMINATION_REASONS.find((opt) => opt.value === r)?.label ?? r;
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
            Desligar Colaborador
          </DialogTitle>
          <DialogDescription>
            Processo de desligamento de <span className="font-semibold">{member.name}</span>
          </DialogDescription>
        </DialogHeader>

        <StepIndicator current={step} />

        <Separator />

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* ---------------------------------------------------------------- */}
          {/* STEP 1 — Motivo & Data                                          */}
          {/* ---------------------------------------------------------------- */}
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="termination-reason">Motivo do desligamento</Label>
                <Select
                  value={reason}
                  onValueChange={(v) => setReason(v as TerminationReason)}
                >
                  <SelectTrigger id="termination-reason">
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
                  <Label htmlFor="reason-detail">
                    Detalhe do motivo <span aria-hidden="true">*</span>
                  </Label>
                  <Textarea
                    id="reason-detail"
                    value={reasonDetail}
                    onChange={(e) => setReasonDetail(e.target.value)}
                    placeholder="Descreva o motivo do desligamento..."
                    className="min-h-[80px]"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="effective-date">Data efetiva</Label>
                <Input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
                {isFutureDate && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Data futura selecionada. O desligamento sera programado.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 2 — Checklist & Observações                                */}
          {/* ---------------------------------------------------------------- */}
          {step === 1 && (
            <>
              {activeTemplates.length > 0 ? (
                <div className="space-y-3">
                  <Label>Checklist de offboarding</Label>
                  <div className="space-y-2 rounded-md border p-3">
                    {activeTemplates.map((tpl) => {
                      const tplId = tpl.id;
                      const label = String(tpl.itemLabel ?? (tpl as Record<string, unknown>).item_label ?? tplId);
                      return (
                        <div key={tplId} className="flex items-center gap-2">
                          <Checkbox
                            id={`tpl-${tplId}`}
                            checked={checkedItems.has(label)}
                            onCheckedChange={() => handleToggleCheckItem(label)}
                          />
                          <label
                            htmlFor={`tpl-${tplId}`}
                            className="text-sm leading-none cursor-pointer"
                          >
                            {String(label)}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {checkedItems.size} de {activeTemplates.length} itens selecionados
                  </p>
                </div>
              ) : (
                <Alert className="border-muted">
                  <AlertDescription className="text-muted-foreground text-sm">
                    Nenhum modelo de checklist configurado para esta empresa. Voce pode configurar
                    modelos em Configuracoes &gt; Offboarding.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="confidential-notes">Observações confidenciais</Label>
                <Textarea
                  id="confidential-notes"
                  value={confidentialNotes}
                  onChange={(e) => setConfidentialNotes(e.target.value)}
                  placeholder="Notas visiveis apenas para gestores..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="notify-collaborator"
                  checked={notifyCollaborator}
                  onCheckedChange={(v) => setNotifyCollaborator(v === true)}
                />
                <label
                  htmlFor="notify-collaborator"
                  className="text-sm leading-none cursor-pointer"
                >
                  Notificar colaborador
                </label>
              </div>
            </>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 3 — Resumo & Confirmacao                                   */}
          {/* ---------------------------------------------------------------- */}
          {step === 2 && (
            <>
              <div className="space-y-3 rounded-md border p-4 bg-muted/30">
                <h4 className="text-sm font-semibold">Resumo do desligamento</h4>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Colaborador</span>
                  <span className="font-medium">{member.name}</span>

                  <span className="text-muted-foreground">Motivo</span>
                  <span className="font-medium">
                    {reason ? getReasonLabel(reason) : ''}
                    {reason === 'other' && reasonDetail ? ` - ${reasonDetail}` : ''}
                  </span>

                  <span className="text-muted-foreground">Data efetiva</span>
                  <span className="font-medium">{formatDateBR(effectiveDate)}</span>

                  {confidentialNotes && (
                    <>
                      <span className="text-muted-foreground">Observações</span>
                      <span className="font-medium line-clamp-2">{confidentialNotes}</span>
                    </>
                  )}

                  <span className="text-muted-foreground">Checklist</span>
                  <span className="font-medium">
                    {checkedItems.size} de {activeTemplates.length} itens
                  </span>
                </div>
              </div>

              {isFutureDate && (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Este e um desligamento programado. O status sera alterado automaticamente em{' '}
                    <span className="font-semibold">{formatDateBR(effectiveDate)}</span>.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="confirm-termination"
                  checked={confirmed}
                  onCheckedChange={(v) => setConfirmed(v === true)}
                />
                <label
                  htmlFor="confirm-termination"
                  className="text-sm leading-snug cursor-pointer"
                >
                  Confirmo o desligamento de{' '}
                  <span className="font-semibold">{member.name}</span> com efeito em{' '}
                  <span className="font-semibold">{formatDateBR(effectiveDate)}</span>
                </label>
              </div>
            </>
          )}
        </div>

        <Separator />

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={terminateMutation.isPending}
            >
              Voltar
            </Button>
          )}

          {step < 2 && (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !step1Valid}
            >
              Próximo
            </Button>
          )}

          {step === 2 && (
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!step3Valid || terminateMutation.isPending}
            >
              {terminateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4 mr-2" />
              )}
              Desligar Colaborador
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
