/**
 * Modal de Feedback "Não Tenho Interesse"
 * PRD-036: Permite o candidato informar o motivo do desinteresse
 */

import { useState } from 'react';
import { ThumbsDown, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { NotInterestedReason, NOT_INTERESTED_REASONS } from '@/hooks/useJobFeedback';

interface NotInterestedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  companyName: string;
  onConfirm: (reason?: NotInterestedReason) => void;
  onSkip: () => void;
}

export function NotInterestedModal({
  open,
  onOpenChange,
  jobTitle,
  companyName,
  onConfirm,
  onSkip,
}: NotInterestedModalProps) {
  const [selectedReason, setSelectedReason] = useState<NotInterestedReason | null>(null);

  const handleConfirm = () => {
    onConfirm(selectedReason || undefined);
    setSelectedReason(null);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip();
    setSelectedReason(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <ThumbsDown className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle>Não tenho interesse</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Você não verá mais esta vaga nas recomendações
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-medium text-foreground">{jobTitle}</span>
            {' '}em{' '}
            <span className="font-medium text-foreground">{companyName}</span>
          </p>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Pode nos contar o motivo? (opcional)
            </p>

            <RadioGroup
              value={selectedReason || ''}
              onValueChange={(value) => setSelectedReason(value as NotInterestedReason)}
              className="space-y-2"
            >
              {(Object.entries(NOT_INTERESTED_REASONS) as [NotInterestedReason, string][]).map(
                ([value, label]) => (
                  <div
                    key={value}
                    className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedReason(value)}
                  >
                    <RadioGroupItem value={value} id={`reason-${value}`} />
                    <Label
                      htmlFor={`reason-${value}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {label}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            Pular
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto"
          >
            {selectedReason ? 'Enviar feedback' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
