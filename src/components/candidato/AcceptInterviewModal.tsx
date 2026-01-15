/**
 * AcceptInterviewModal Component
 * PRD-027: Agendamento de Entrevistas (Candidato)
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Calendar, Clock, Video, Phone, MapPin } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Interview } from '@/types/interview';
import { interviewTypeLabels } from '@/types/interview';

interface AcceptInterviewModalProps {
  interview: Interview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (slotIndex: number, message?: string) => void;
}

const typeIcons = {
  video: Video,
  phone: Phone,
  in_person: MapPin,
};

export function AcceptInterviewModal({
  interview,
  open,
  onOpenChange,
  onAccept,
}: AcceptInterviewModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [message, setMessage] = useState('');

  const TypeIcon = typeIcons[interview.type];

  const handleConfirm = () => {
    const slotIndex = parseInt(selectedSlot, 10);
    if (!isNaN(slotIndex)) {
      onAccept(slotIndex, message.trim() || undefined);
      // Reset state
      setSelectedSlot('');
      setMessage('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedSlot('');
      setMessage('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Confirmar Entrevista
          </DialogTitle>
          <DialogDescription>
            Selecione o horário de sua preferência para a entrevista.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Slots */}
          <div className="space-y-2">
            <Label>Escolha um horário:</Label>
            <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
              {interview.proposedSlots?.map((slot, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    selectedSlot === String(idx)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={String(idx)} id={`slot-${idx}`} />
                  <Label
                    htmlFor={`slot-${idx}`}
                    className="flex-1 cursor-pointer flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(slot.datetime), "EEEE, dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </Label>
                  {selectedSlot === String(idx) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Interview Info */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TypeIcon className="h-4 w-4" />
              {interviewTypeLabels[interview.type]}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {interview.duration} min
            </span>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem para a empresa (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Ex: Confirmo presença! Estou ansioso para a entrevista."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSlot}
            className="gradient-primary"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar Horário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
