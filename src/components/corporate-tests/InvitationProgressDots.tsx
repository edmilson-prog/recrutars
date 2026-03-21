/**
 * Invitation Progress Dots
 * Indicador visual de 4 etapas: sent → viewed → started → completed
 */

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { InvitationStatus } from '@/types/companyTest';

interface InvitationProgressDotsProps {
  status: InvitationStatus;
}

const steps = [
  { key: 'sent', label: 'Enviado', color: 'bg-blue-500' },
  { key: 'viewed', label: 'Acessado', color: 'bg-cyan-500' },
  { key: 'started', label: 'Iniciado', color: 'bg-amber-500' },
  { key: 'completed', label: 'Concluído', color: 'bg-emerald-500' },
] as const;

const statusOrder: Record<string, number> = {
  sent: 1,
  viewed: 2,
  started: 3,
  completed: 4,
  expired: 0,
  cancelled: 0,
  abandoned: 3, // started but not completed
};

export function InvitationProgressDots({ status }: InvitationProgressDotsProps) {
  const currentStep = statusOrder[status] ?? 0;
  const isTerminal = ['expired', 'cancelled', 'abandoned'].includes(status);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-1.5"
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label={`Progresso: ${currentStep} de 4 etapas concluídas`}
          >
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber <= currentStep;
              const isCurrent = stepNumber === currentStep && !isTerminal;

              return (
                <div
                  key={step.key}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    isCompleted
                      ? step.color
                      : 'bg-muted-foreground/20',
                    isCurrent && 'ring-2 ring-offset-1 ring-offset-background',
                    isCurrent && step.color.replace('bg-', 'ring-'),
                  )}
                />
              );
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{currentStep} de 4 etapas</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
