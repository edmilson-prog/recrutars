/**
 * Application Success Modal Component
 * PRD-007: Candidatura a Vagas
 */

import { CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ApplicationSuccessModalProps {
  isOpen: boolean;
  onViewApplications: () => void;
  onContinueBrowsing: () => void;
}

export function ApplicationSuccessModal({
  isOpen,
  onViewApplications,
  onContinueBrowsing,
}: ApplicationSuccessModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <DialogTitle className="text-xl">Candidatura Enviada!</DialogTitle>
          <DialogDescription className="text-center">
            Sua candidatura foi enviada com sucesso.
            <br />
            Acompanhe o status em "Minhas Candidaturas".
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={onViewApplications} className="w-full gradient-primary">
            Ver Minhas Candidaturas
          </Button>
          <Button variant="outline" onClick={onContinueBrowsing} className="w-full">
            Continuar Buscando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
