import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface EditWeightsConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  activeApplicationsCount: number;
  onConfirm: () => Promise<void>;
}

type Stage = 'impact' | 'typing' | 'submitting';

export function EditWeightsConfirmDialog({
  open,
  onOpenChange,
  jobTitle,
  activeApplicationsCount,
  onConfirm,
}: EditWeightsConfirmDialogProps) {
  const [stage, setStage] = useState<Stage>('impact');
  const [typedTitle, setTypedTitle] = useState('');

  const titleMatches = typedTitle.trim() === jobTitle.trim();

  function handleClose() {
    setStage('impact');
    setTypedTitle('');
    onOpenChange(false);
  }

  async function handleConfirm(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!titleMatches || stage === 'submitting') return;
    setStage('submitting');
    try {
      await onConfirm();
      handleClose();
    } catch {
      setStage('typing');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AlertDialogContent>
        {stage === 'impact' && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Atenção: {activeApplicationsCount} candidatura{activeApplicationsCount > 1 ? 's' : ''} ativa{activeApplicationsCount > 1 ? 's' : ''}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm">
                  <p>Alterar os pesos desta vaga vai:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Recalcular o match de <strong>todos os {activeApplicationsCount} candidatos</strong></li>
                    <li>Notificar cada candidato sobre a mudança</li>
                    <li>Registrar a alteração no histórico da vaga (visível ao candidato)</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => { e.preventDefault(); setStage('typing'); }}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}

        {(stage === 'typing' || stage === 'submitting') && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
              <AlertDialogDescription>
                Para confirmar, digite o título da vaga: <strong>{jobTitle}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="job-title-confirm" className="sr-only">Título da vaga</Label>
              <Input
                id="job-title-confirm"
                value={typedTitle}
                onChange={(e) => setTypedTitle(e.target.value)}
                placeholder={jobTitle}
                disabled={stage === 'submitting'}
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose} disabled={stage === 'submitting'}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={!titleMatches || stage === 'submitting'}
                className="bg-destructive hover:bg-destructive/90"
              >
                {stage === 'submitting' ? 'Aplicando...' : 'Confirmar alteração'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
