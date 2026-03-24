/**
 * TerminatedBadge
 * PRD-090 Phase 2: Badge showing the termination date for a team member.
 * Follows the same pattern as GaugeStatusBadge.
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TerminatedBadgeProps {
  date: string;
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

export function TerminatedBadge({ date, className }: TerminatedBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center gap-1.5 border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        className,
      )}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-red-500"
        aria-hidden="true"
      />
      Desligado em {formatDateBR(date)}
    </Badge>
  );
}
