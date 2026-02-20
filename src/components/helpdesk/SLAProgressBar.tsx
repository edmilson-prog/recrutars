/**
 * SLAProgressBar Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Visual bar showing SLA time remaining with extend button.
 */

import { Clock, AlertTriangle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getSLAStatus, getTimeRemaining } from './SLASemaphore';
import { cn } from '@/lib/utils';

interface SLAProgressBarProps {
  slaDeadline?: string;
  resolvedAt?: string;
  createdAt: string;
  onExtend: () => void;
}

export function SLAProgressBar({ slaDeadline, resolvedAt, createdAt, onExtend }: SLAProgressBarProps) {
  if (!slaDeadline) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <Clock className="h-3.5 w-3.5" />
        <span>SLA não definido</span>
      </div>
    );
  }

  const status = getSLAStatus(slaDeadline, resolvedAt);
  const timeRemaining = getTimeRemaining(slaDeadline);
  const isResolved = !!resolvedAt;

  // Calculate progress percentage
  const total = new Date(slaDeadline).getTime() - new Date(createdAt).getTime();
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);

  const colorConfig = {
    on_track: {
      bar: 'bg-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: Clock,
    },
    warning: {
      bar: 'bg-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-400',
      icon: AlertTriangle,
    },
    breached: {
      bar: 'bg-red-500',
      bg: 'bg-red-50 dark:bg-red-950/30',
      text: 'text-red-700 dark:text-red-400',
      icon: AlertTriangle,
    },
  };

  const config = colorConfig[status];
  const Icon = config.icon;

  if (isResolved) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2">
        <Clock className="h-3.5 w-3.5" />
        <span>Resolvido dentro do SLA</span>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg px-3 py-2 space-y-1.5', config.bg)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-3.5 w-3.5', config.text)} />
          <span className={cn('text-xs font-medium', config.text)}>
            {timeRemaining}
          </span>
        </div>
        {!isResolved && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1"
            onClick={onExtend}
          >
            <Timer className="h-3 w-3" />
            Estender
          </Button>
        )}
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
