/**
 * CompanyCancelInterviewModal Component
 * PRD-034: Agendamento de Entrevistas (Empresa)
 * Modal para cancelar entrevista pela empresa
 */

import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Interview } from '@/types/interview';
import type { CompanyCancellationReason } from '@/hooks/useCompanyInterviews';
import { companyCancellationReasonLabels } from '@/hooks/useCompanyInterviews';

interface CompanyCancelInterviewModalProps {
  interview: Interview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: CompanyCancellationReason, details?: string) => void;
}

const CANCELLATION_REASONS: CompanyCancellationReason[] = [
  'position_filled',
  'candidate_withdrew',
  'schedule_conflict',
  'internal_changes',
  'other',
];

export function CompanyCancelInterviewModal({
  interview,
  open,
  onOpenChange,
  onCancel,
}: CompanyCancelInterviewModalProps) {
  const [reason, setReason] = useState<CompanyCancellationReason>('schedule_conflict');
  const [details, setDetails] = useState('');

  const handleCancel = () => {
    onCancel(reason, details || undefined);
    onOpenChange(false);
    // Reset form
    setReason('schedule_conflict');
    setDetails('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <X className="h-5 w-5" />
            Cancelar Entrevista
          </DialogTitle>
          <DialogDescription>
            {interview.title} - {interview.jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O candidato sera notificado sobre o cancelamento. Esta acao nao pode ser desfeita.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label>Motivo do cancelamento *</Label>
            <RadioGroup
              value={reason}
              onValueChange={(v) => setReason(v as CompanyCancellationReason)}
              className="space-y-2"
            >
              {CANCELLATION_REASONS.map((r) => (
                <Label
                  key={r}
                  htmlFor={r}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem value={r} id={r} />
                  <span className="text-sm">{companyCancellationReasonLabels[r]}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Detalhes adicionais (opcional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Adicione mais informacoes se desejar..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
