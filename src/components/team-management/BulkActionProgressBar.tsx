/**
 * BulkActionProgressBar
 * PRD-090 Phase 6: Reusable progress feedback for bulk operations.
 *
 * Shows animated progress during processing, then a success/error summary.
 */

import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BulkActionProgressBarProps {
  current: number;
  total: number;
  isComplete: boolean;
  errorCount?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkActionProgressBar({
  current,
  total,
  isComplete,
  errorCount = 0,
  className,
}: BulkActionProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const successCount = current - errorCount;
  const hasErrors = errorCount > 0;

  return (
    <div className={cn('space-y-2', className)} role="status" aria-live="polite">
      {/* Progress bar */}
      <Progress
        value={percentage}
        className={cn(
          'h-2',
          isComplete && hasErrors && '[&>div]:bg-amber-500',
          isComplete && !hasErrors && '[&>div]:bg-green-500',
        )}
      />

      {/* Status text */}
      <div className="flex items-center gap-2 text-sm">
        {!isComplete && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-muted-foreground">
              Processando {current} de {total}...
            </span>
          </>
        )}

        {isComplete && !hasErrors && (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-green-700 dark:text-green-400">
              Concluído! {successCount} de {total} processados com sucesso
            </span>
          </>
        )}

        {isComplete && hasErrors && (
          <>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-400">
              Concluído com erros: {successCount} {successCount === 1 ? 'sucesso' : 'sucessos'},{' '}
              {errorCount} {errorCount === 1 ? 'falha' : 'falhas'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
