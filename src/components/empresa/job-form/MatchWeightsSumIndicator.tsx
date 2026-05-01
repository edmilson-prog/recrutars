import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { sumWeights, type MatchWeights } from '@/types/matchWeights';
import { cn } from '@/lib/utils';

export interface MatchWeightsSumIndicatorProps {
  weights: MatchWeights;
  onDistributeRemaining: () => void;
  onNormalize: () => void;
  onResetDefaults: () => void;
  disabled?: boolean;
}

export function MatchWeightsSumIndicator({
  weights,
  onDistributeRemaining,
  onNormalize,
  onResetDefaults,
  disabled,
}: MatchWeightsSumIndicatorProps) {
  const sum = sumWeights(weights);
  const state = sum === 100 ? 'valid' : sum < 100 ? 'incomplete' : 'excess';

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-muted/40"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="w-32">
          <Progress
            value={Math.min(100, sum)}
            className={cn(
              state === 'valid' && '[&>div]:bg-cyan-500',
              state === 'incomplete' && '[&>div]:bg-amber-500',
              state === 'excess' && '[&>div]:bg-destructive',
            )}
          />
        </div>
        {state === 'valid' && (
          <span className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
            <CheckCircle2 className="w-3 h-3" /> Soma 100%
          </span>
        )}
        {state === 'incomplete' && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded" role="alert">
            <AlertTriangle className="w-3 h-3" /> Faltam {100 - sum}% para distribuir
          </span>
        )}
        {state === 'excess' && (
          <span className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded" role="alert">
            <XCircle className="w-3 h-3" /> Excedeu em {sum - 100}%
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {state === 'incomplete' && (
          <Button type="button" variant="outline" size="sm" onClick={onDistributeRemaining} disabled={disabled}>
            Distribuir restante
          </Button>
        )}
        {state === 'excess' && (
          <Button type="button" variant="outline" size="sm" onClick={onNormalize} disabled={disabled}>
            Normalizar
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onResetDefaults} disabled={disabled}>
          ↺ Restaurar padrão
        </Button>
      </div>
    </div>
  );
}
