/**
 * ScheduledTerminationBanner
 * PRD-090 Phase 2: Alert banner shown in member profile when termination is scheduled.
 * Amber/warning alert with cancel button.
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CalendarClock, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledTerminationBannerProps {
  date: string;
  onCancel: () => void;
  isCancelling?: boolean;
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

export function ScheduledTerminationBanner({
  date,
  onCancel,
  isCancelling,
  className,
}: ScheduledTerminationBannerProps) {
  return (
    <Alert
      className={cn(
        'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50',
        className,
      )}
    >
      <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="text-amber-800 dark:text-amber-300">
          Desligamento previsto para <strong>{formatDateBR(date)}</strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isCancelling}
          className="ml-4 shrink-0"
        >
          {isCancelling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : (
            <X className="h-3.5 w-3.5 mr-1" />
          )}
          Cancelar Desligamento
        </Button>
      </AlertDescription>
    </Alert>
  );
}
