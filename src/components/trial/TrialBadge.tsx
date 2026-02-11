/**
 * TrialBadge Component
 * PRD-074: Subtle badge shown in the header for companies in trial (low urgency).
 *
 * Displays "Periodo de teste — X dias restantes" as a clickable badge
 * that links to the plans page.
 */

import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrialBadgeProps {
  daysRemaining: number;
  className?: string;
}

export function TrialBadge({ daysRemaining, className }: TrialBadgeProps) {
  return (
    <Link to="/planos" className={cn('no-underline', className)}>
      <Badge
        variant="outline"
        className={cn(
          'gap-1.5 px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors',
          'border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary',
        )}
      >
        <Clock className="w-3 h-3" />
        <span className="hidden sm:inline">
          Periodo de teste &mdash; {daysRemaining} dias restantes
        </span>
        <span className="sm:hidden">
          {daysRemaining}d restantes
        </span>
      </Badge>
    </Link>
  );
}
