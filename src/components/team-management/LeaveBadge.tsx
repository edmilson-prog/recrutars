/**
 * LeaveBadge
 * PRD-090 Phase 3: Badge showing leave status for a team member.
 * Follows the same pattern as GaugeStatusBadge and TerminatedBadge.
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeaveBadgeProps {
  startDate: string;
  expectedReturn?: string;
  className?: string;
}

function formatDateBR(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function LeaveBadge({ startDate, expectedReturn, className }: LeaveBadgeProps) {
  const label = expectedReturn
    ? `Afastado desde ${formatDateBR(startDate)} — Retorno previsto: ${formatDateBR(expectedReturn)}`
    : `Afastado desde ${formatDateBR(startDate)}`;

  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center gap-1.5 border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        className,
      )}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
        aria-hidden="true"
      />
      {label}
    </Badge>
  );
}
