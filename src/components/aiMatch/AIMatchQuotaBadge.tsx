/**
 * AIMatchQuotaBadge — "X de N utilizadas" (ou "Ilimitado")
 */

import { cn } from '@/lib/utils';
import type { AIMatchQuotaStatus } from '@/types/aiMatch';

interface AIMatchQuotaBadgeProps {
  status: AIMatchQuotaStatus | undefined;
  className?: string;
}

export function AIMatchQuotaBadge({ status, className }: AIMatchQuotaBadgeProps) {
  if (!status) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground', className)}>
        carregando…
      </span>
    );
  }

  if (status.unlimited) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-300', className)}>
        ✨ Ilimitado
      </span>
    );
  }

  const isExhausted = status.remaining === 0;
  const isLow = status.remaining > 0 && status.remaining <= 1;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isExhausted && 'bg-red-500/15 text-red-700 dark:text-red-300',
        isLow && 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        !isExhausted && !isLow && 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
        className,
      )}
      aria-label={`${status.used} de ${status.total} análises IA utilizadas este mês`}
    >
      {status.used} de {status.total} utilizadas
    </span>
  );
}
