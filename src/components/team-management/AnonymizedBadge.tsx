/**
 * AnonymizedBadge
 * PRD-090 Phase 7: Badge indicating personal data has been anonymized (LGPD).
 * Follows the same pattern as TerminatedBadge.
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnonymizedBadgeProps {
  className?: string;
}

export function AnonymizedBadge({ className }: AnonymizedBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center gap-1.5 border-transparent bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
        className,
      )}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-slate-500"
        aria-hidden="true"
      />
      Dados Anonimizados
    </Badge>
  );
}
