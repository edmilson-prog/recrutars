/**
 * AnonymizationModal
 * PRD-090 Phase 7: Two-phase confirmation dialog for LGPD anonymization.
 * Phase 1 — Review what will be anonymized/preserved + justification if retention not met.
 * Phase 2 — Type "ANONIMIZAR" to confirm irreversible action.
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ShieldAlert, Loader2, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAnonymizeMember } from '@/hooks/useTeamLifecycleMutation';
import { useDataRetentionSettings } from '@/hooks/useTeamMemberEventsQuery';
import type { TeamMember } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AnonymizationModalProps {
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

const ANONYMIZED_FIELDS = [
  'Nome',
  'Email',
  'CPF',
  'Telefone',
  'Foto',
  'Observações confidenciais',
];

const PRESERVED_FIELDS = [
  'Scores Gauge-Pro',
  'Arquétipo',
  'Departamento',
  'Cargo',
  'Período de vínculo',
];

const CONFIRMATION_WORD = 'ANONIMIZAR';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnonymizationModal({
  open,
  onOpenChange,
  member,
  companyId,
  performedBy,
  onSuccess,
}: AnonymizationModalProps) {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [justification, setJustification] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const anonymizeMutation = useAnonymizeMember();
  const { data: retentionSettings } = useDataRetentionSettings(companyId);

  // Calculate retention end date
  const retentionInfo = useMemo(() => {
    const retentionYears = retentionSettings?.retentionYears ?? 5;
    const terminationDate = member.terminationDate || member.hireDate || new Date().toISOString();
    const endDate = new Date(terminationDate);
    endDate.setFullYear(endDate.getFullYear() + retentionYears);
    const withinRetention = endDate > new Date();
    return { retentionYears, endDate, withinRetention };
  }, [retentionSettings, member.terminationDate, member.hireDate]);

  const needsJustification = retentionInfo.withinRetention;
  const isPhase1Valid =
    acknowledged &&
    (!needsJustification || justification.trim().length > 0);
  const isPhase2Valid = confirmText === CONFIRMATION_WORD;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function resetState() {
    setPhase(1);
    setAcknowledged(false);
    setJustification('');
    setConfirmText('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  function handleProceed() {
    if (!isPhase1Valid) return;
    setPhase(2);
  }

  function handleBack() {
    setConfirmText('');
    setPhase(1);
  }

  async function handleSubmit() {
    if (!isPhase2Valid) return;

    try {
      const result = await anonymizeMutation.mutateAsync({
        teamMemberId: member.id,
        performedBy,
        justification: needsJustification ? justification : undefined,
        forceOverride: needsJustification,
      });

      if (result?.success === false) {
        if (result.error === 'retention_not_met') {
          toast.error('Período de retenção não atingido. Forneça uma justificativa.');
        } else {
          toast.error(result.error || 'Erro ao anonimizar colaborador.');
        }
        return;
      }

      toast.success('Dados pessoais anonimizados com sucesso');
      handleOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Erro ao anonimizar colaborador. Tente novamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {phase === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                Solicitar Anonimização LGPD
              </DialogTitle>
              <DialogDescription>
                Anonimizar dados pessoais de{' '}
                <span className="font-semibold">{member.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Irreversibility warning */}
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
                  Esta ação é irreversível. Os dados pessoais do colaborador serão permanentemente
                  removidos.
                </AlertDescription>
              </Alert>

              <Separator />

              {/* What will be anonymized */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Dados que serão anonimizados:</p>
                <ul className="space-y-1">
                  {ANONYMIZED_FIELDS.map((field) => (
                    <li key={field} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <X className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      {field}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What will be preserved */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Dados que serão preservados:</p>
                <ul className="space-y-1">
                  {PRESERVED_FIELDS.map((field) => (
                    <li key={field} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      {field}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Retention period warning */}
              {needsJustification && (
                <>
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                      O período de retenção ainda não foi atingido. Dados podem ser anonimizados a
                      partir de{' '}
                      <span className="font-semibold">
                        {formatDateBR(retentionInfo.endDate.toISOString())}
                      </span>
                      . Para prosseguir antes do prazo, é necessária uma justificativa.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="anonymize-justification">
                      Justificativa <span aria-hidden="true">*</span>
                    </Label>
                    <Textarea
                      id="anonymize-justification"
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Descreva o motivo para anonimização antecipada..."
                      className="min-h-[80px]"
                      required
                    />
                  </div>
                </>
              )}

              {/* Acknowledgment checkbox */}
              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="anonymize-acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked === true)}
                />
                <Label
                  htmlFor="anonymize-acknowledge"
                  className="text-sm leading-snug cursor-pointer"
                >
                  Entendo que esta ação é irreversível e que os dados pessoais não podem ser
                  recuperados
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleProceed}
                disabled={!isPhase1Valid}
              >
                Prosseguir
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                Confirmar Anonimização
              </DialogTitle>
              <DialogDescription>
                Confirmação final para anonimizar{' '}
                <span className="font-semibold">{member.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Para confirmar, digite{' '}
                <span className="font-mono font-bold text-foreground">{CONFIRMATION_WORD}</span>{' '}
                no campo abaixo:
              </p>

              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRMATION_WORD}
                className={cn(
                  'font-mono',
                  confirmText.length > 0 && confirmText !== CONFIRMATION_WORD &&
                    'border-red-300 focus-visible:ring-red-500',
                  confirmText === CONFIRMATION_WORD &&
                    'border-green-300 focus-visible:ring-green-500',
                )}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={!isPhase2Valid || anonymizeMutation.isPending}
              >
                {anonymizeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShieldAlert className="h-4 w-4 mr-2" />
                )}
                Anonimizar Dados
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
