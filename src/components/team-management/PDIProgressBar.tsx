/**
 * PDIProgressBar
 * PRD-057: Barra de progresso do Plano de Desenvolvimento Individual.
 * Calcula progresso com base nos objetivos concluidos vs total.
 */

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { DevelopmentPlan } from '@/types/teamManagement';

interface PDIProgressBarProps {
  plan: DevelopmentPlan;
}

export default function PDIProgressBar({ plan }: PDIProgressBarProps) {
  const total = plan.objectives.length;
  const completed = plan.objectives.filter((o) => o.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const colorClass =
    percentage >= 75
      ? '[&>div]:bg-green-500'
      : percentage >= 50
        ? '[&>div]:bg-amber-500'
        : '[&>div]:bg-red-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progresso do PDI</span>
        <span
          className={cn(
            'font-bold',
            percentage >= 75
              ? 'text-green-600'
              : percentage >= 50
                ? 'text-amber-600'
                : 'text-red-600',
          )}
        >
          {percentage}% ({completed}/{total})
        </span>
      </div>
      <Progress value={percentage} className={cn('h-3', colorClass)} />
    </div>
  );
}
