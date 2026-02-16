/**
 * JobClosureModal — Modal de encerramento de vaga após contratação
 * PRD-077: Fluxo de Contratação e Transição para Gestão de Equipes
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Users, XCircle, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCloseJobWithRemaining } from '@/hooks/useHiringsQuery';
import type { CloseJobData } from '@/types/hiring';

interface JobClosureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  hiredCount: number;
  positionsCount: number;
  onClosed: () => void;
}

type ClosureAction = 'talent_pool_notify' | 'talent_pool_silent' | 'keep_active';

export function JobClosureModal({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  hiredCount,
  positionsCount,
  onClosed,
}: JobClosureModalProps) {
  const [action, setAction] = useState<ClosureAction>('talent_pool_notify');
  const closeMutation = useCloseJobWithRemaining();

  const handleConfirm = async () => {
    let data: CloseJobData;

    switch (action) {
      case 'talent_pool_notify':
        data = { jobId, action: 'talent_pool', notify: true };
        break;
      case 'talent_pool_silent':
        data = { jobId, action: 'talent_pool', notify: false };
        break;
      case 'keep_active':
        data = { jobId, action: 'keep_active', notify: false };
        break;
    }

    try {
      const result = await closeMutation.mutateAsync(data);

      if (result.jobClosed) {
        toast.success(`Vaga "${jobTitle}" encerrada. ${result.affectedApplications} candidato(s) atualizados.`);
      } else {
        toast.info(`Vaga "${jobTitle}" mantida aberta.`);
      }
      onClosed();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao encerrar vaga';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <DialogTitle>Todas as posições foram preenchidas!</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Opções de encerramento da vaga
          </DialogDescription>
        </DialogHeader>

        <Badge variant="secondary">
          {hiredCount} de {positionsCount} {positionsCount === 1 ? 'posição preenchida' : 'posições preenchidas'}
        </Badge>

        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-4">
            A vaga <strong>"{jobTitle}"</strong> teve todas as posições preenchidas.
            O que deseja fazer com os candidatos restantes no pipeline?
          </p>

          <RadioGroup value={action} onValueChange={(v) => setAction(v as ClosureAction)} className="space-y-3">
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="talent_pool_notify" id="opt1" className="mt-0.5" />
              <Label htmlFor="opt1" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Encerrar vaga e notificar candidatos
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Candidatos vão para o banco de talentos e recebem notificação.
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="talent_pool_silent" id="opt2" className="mt-0.5" />
              <Label htmlFor="opt2" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-medium">
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  Encerrar vaga sem notificar
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Candidatos vão para o banco de talentos silenciosamente.
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="keep_active" id="opt3" className="mt-0.5" />
              <Label htmlFor="opt3" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-medium">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Manter vaga aberta
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  O pipeline continua ativo para novas candidaturas ou banco de talentos.
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={closeMutation.isPending}
          >
            {closeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
