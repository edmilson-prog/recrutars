/**
 * AcceptSuggestionModal Component
 * PRD-034: Agendamento de Entrevistas (Empresa)
 * Modal para aceitar sugestao de horario do candidato
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Check, Clock } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { Interview } from '@/types/interview';
import { interviewTypeLabels } from '@/types/interview';

interface AcceptSuggestionModalProps {
  interview: Interview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (slotIndex: number) => void;
}

export function AcceptSuggestionModal({
  interview,
  open,
  onOpenChange,
  onAccept,
}: AcceptSuggestionModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<number>(0);

  const handleAccept = () => {
    onAccept(selectedSlot);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Aceitar Sugestao de Horario
          </DialogTitle>
          <DialogDescription>
            {interview.title} - {interview.jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            O candidato sugeriu os seguintes horarios. Selecione o que melhor funciona para voce:
          </p>

          {interview.suggestionReason && (
            <div className="p-3 rounded-md bg-muted/50 mb-4">
              <p className="text-sm italic text-muted-foreground">
                "{interview.suggestionReason}"
              </p>
            </div>
          )}

          <RadioGroup
            value={selectedSlot.toString()}
            onValueChange={(v) => setSelectedSlot(parseInt(v))}
            className="space-y-3"
          >
            {interview.suggestedSlots?.map((slot, idx) => {
              const date = new Date(slot);
              return (
                <Label
                  key={idx}
                  htmlFor={`slot-${idx}`}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                    selectedSlot === idx
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  )}
                >
                  <RadioGroupItem value={idx.toString()} id={`slot-${idx}`} />
                  <div className="flex-1">
                    <p className="font-medium">
                      {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(date, 'HH:mm', { locale: ptBR })}
                      </span>
                      <span>{interview.duration} min</span>
                      <span>{interviewTypeLabels[interview.type]}</span>
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAccept}>
            <Check className="h-4 w-4 mr-2" />
            Confirmar Horario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
