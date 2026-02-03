/**
 * RejectionDialog Component
 * PRD-058: Dialog para rejeicao de vaga com motivo obrigatorio
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RejectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  reasons: string[];
}

export function RejectionDialog({ open, onClose, onConfirm, reasons }: RejectionDialogProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const isOther = selectedReason === '__other__';
  const finalReason = isOther ? customReason : selectedReason;
  const canConfirm = finalReason.trim().length > 0;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(finalReason);
      setSelectedReason('');
      setCustomReason('');
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rejeitar Vaga</DialogTitle>
          <DialogDescription>
            Selecione o motivo da rejeicao. A empresa sera notificada.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {reasons.map((reason) => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={`reason-${reason}`} />
                <Label htmlFor={`reason-${reason}`} className="cursor-pointer text-sm">
                  {reason}
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="__other__" id="reason-other" />
              <Label htmlFor="reason-other" className="cursor-pointer text-sm">
                Outro
              </Label>
            </div>
          </RadioGroup>

          {isOther && (
            <Textarea
              placeholder="Descreva o motivo da rejeicao..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            Confirmar Rejeicao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
