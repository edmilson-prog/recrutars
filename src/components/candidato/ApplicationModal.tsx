/**
 * Application Modal Component
 * PRD-007: Candidatura a Vagas
 */

import { useState } from 'react';
import { Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Job } from '@/types';

const MAX_MESSAGE_LENGTH = 500;

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message?: string) => void;
}

export function ApplicationModal({ job, isOpen, onClose, onConfirm }: ApplicationModalProps) {
  const [includeMessage, setIncludeMessage] = useState(false);
  const [message, setMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(includeMessage && message.trim() ? message.trim() : undefined);
    setMessage('');
    setIncludeMessage(false);
  };

  const handleClose = () => {
    setMessage('');
    setIncludeMessage(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Candidatura</DialogTitle>
          <DialogDescription>
            Seu perfil será enviado para análise pela empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Job Summary */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.companyName}</p>
            </div>
          </div>

          {/* Optional Message Checkbox */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="include-message"
              checked={includeMessage}
              onCheckedChange={(checked) => setIncludeMessage(checked === true)}
            />
            <Label htmlFor="include-message" className="cursor-pointer">
              Adicionar mensagem ao recrutador
            </Label>
          </div>

          {/* Message Field */}
          {includeMessage && (
            <div className="space-y-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Escreva uma mensagem personalizada para o recrutador..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-sm text-muted-foreground text-right">
                {message.length}/{MAX_MESSAGE_LENGTH}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="gradient-primary">
            Confirmar Candidatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
