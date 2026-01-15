/**
 * SuggestAlternativeModal Component
 * PRD-027: Agendamento de Entrevistas (Candidato)
 */

import { useState } from 'react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, AlertCircle, Send, Plus, X } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Interview } from '@/types/interview';

interface SuggestAlternativeModalProps {
  interview: Interview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggest: (slots: string[], reason?: string) => void;
}

interface SlotInput {
  date: string;
  time: string;
}

// Generate time options (8:00 to 18:00, every 30 min)
const timeOptions = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

// Get min date (tomorrow)
const getMinDate = () => {
  const tomorrow = addDays(new Date(), 1);
  return format(tomorrow, 'yyyy-MM-dd');
};

export function SuggestAlternativeModal({
  interview,
  open,
  onOpenChange,
  onSuggest,
}: SuggestAlternativeModalProps) {
  const [slots, setSlots] = useState<SlotInput[]>([
    { date: '', time: '' },
  ]);
  const [reason, setReason] = useState('');

  const handleAddSlot = () => {
    if (slots.length < 3) {
      setSlots([...slots, { date: '', time: '' }]);
    }
  };

  const handleRemoveSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const handleSlotChange = (index: number, field: 'date' | 'time', value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const handleConfirm = () => {
    // Filter valid slots and convert to ISO strings
    const validSlots = slots
      .filter(slot => slot.date && slot.time)
      .map(slot => {
        const [hours, minutes] = slot.time.split(':').map(Number);
        const date = new Date(slot.date);
        return setMinutes(setHours(date, hours), minutes).toISOString();
      });

    if (validSlots.length > 0) {
      onSuggest(validSlots, reason.trim() || undefined);
      // Reset state
      setSlots([{ date: '', time: '' }]);
      setReason('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSlots([{ date: '', time: '' }]);
      setReason('');
    }
    onOpenChange(newOpen);
  };

  const isValid = slots.some(slot => slot.date && slot.time);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Sugerir Horário Alternativo
          </DialogTitle>
          <DialogDescription>
            Nenhum dos horários propostos funciona para você? Sugira até 3 horários alternativos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Slots */}
          {slots.map((slot, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Horário {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                  {index > 0 && <span className="text-muted-foreground text-xs ml-1">(opcional)</span>}
                </Label>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveSlot(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  min={getMinDate()}
                  value={slot.date}
                  onChange={(e) => handleSlotChange(index, 'date', e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={slot.time}
                  onValueChange={(value) => handleSlotChange(index, 'time', value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          {/* Add Slot Button */}
          {slots.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddSlot}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar outro horário
            </Button>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Tenho compromisso nos horários propostos. Os horários acima funcionam melhor para mim."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning */}
          <Alert variant="default" className="border-yellow-500/30 bg-yellow-500/5">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm">
              A empresa precisará confirmar o novo horário. Você será notificado quando houver uma resposta.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="gradient-primary"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Sugestão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
