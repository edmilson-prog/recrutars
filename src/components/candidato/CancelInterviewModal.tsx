/**
 * CancelInterviewModal Component
 * PRD-027: Agendamento de Entrevistas (Candidato)
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, AlertTriangle, Calendar, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Interview, CancellationReason } from '@/types/interview';
import { cancellationReasonLabels } from '@/types/interview';

interface CancelInterviewModalProps {
  interview: Interview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: CancellationReason, details?: string) => void;
}

const cancellationReasons: CancellationReason[] = [
  'accepted_other',
  'schedule_conflict',
  'withdrew',
  'personal',
  'other',
];

export function CancelInterviewModal({
  interview,
  open,
  onOpenChange,
  onCancel,
}: CancelInterviewModalProps) {
  const [reason, setReason] = useState<CancellationReason | ''>('');
  const [details, setDetails] = useState('');

  const handleConfirm = () => {
    if (reason) {
      onCancel(reason, details.trim() || undefined);
      // Reset state
      setReason('');
      setDetails('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason('');
      setDetails('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <X className="h-5 w-5" />
            Cancelar Entrevista
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar esta entrevista? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Interview Info */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-semibold">{interview.title}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{interview.companyName} • {interview.jobTitle}</span>
            </div>
            {interview.confirmedDatetime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(interview.confirmedDatetime), "EEEE, dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo do cancelamento <span className="text-red-500">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as CancellationReason)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {cancellationReasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {cancellationReasonLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Detalhes (opcional)</Label>
            <Textarea
              id="details"
              placeholder="Adicione mais detalhes se desejar..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning */}
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Cancelar entrevistas pode impactar negativamente sua reputação na plataforma. A empresa será notificada sobre o cancelamento.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason}
          >
            <X className="h-4 w-4 mr-2" />
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
