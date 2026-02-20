/**
 * SLASemaphore Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Visual indicator (green/amber/red) for SLA status.
 */

import { Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SLAStatus } from '@/types/help';

interface SLASemaphoreProps {
  slaDeadline?: string;
  resolvedAt?: string;
  className?: string;
  showLabel?: boolean;
}

export function getSLAStatus(slaDeadline?: string, resolvedAt?: string): SLAStatus {
  if (!slaDeadline) return 'on_track';
  if (resolvedAt) return 'on_track';

  const now = Date.now();
  const deadline = new Date(slaDeadline).getTime();
  const timeLeft = deadline - now;

  if (timeLeft <= 0) return 'breached';
  if (timeLeft < 30 * 60 * 1000) return 'warning';
  return 'on_track';
}

export function getTimeRemaining(slaDeadline: string): string {
  const now = Date.now();
  const deadline = new Date(slaDeadline).getTime();
  const diff = deadline - now;

  if (diff <= 0) {
    const overdue = Math.abs(diff);
    const hours = Math.floor(overdue / (1000 * 60 * 60));
    const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}min atrasado`;
    return `${minutes}min atrasado`;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}min restantes`;
  return `${minutes}min restantes`;
}

const statusConfig: Record<SLAStatus, { color: string; icon: typeof Clock; label: string }> = {
  on_track: {
    color: 'text-emerald-500',
    icon: Clock,
    label: 'No prazo',
  },
  warning: {
    color: 'text-amber-500',
    icon: AlertTriangle,
    label: 'Atenção',
  },
  breached: {
    color: 'text-red-500',
    icon: XCircle,
    label: 'SLA Violado',
  },
};

export function SLASemaphore({ slaDeadline, resolvedAt, className, showLabel }: SLASemaphoreProps) {
  const status = getSLAStatus(slaDeadline, resolvedAt);
  const config = statusConfig[status];
  const Icon = config.icon;

  const timeInfo = slaDeadline ? getTimeRemaining(slaDeadline) : 'Sem SLA';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex items-center gap-1.5', className)}>
          <Icon className={cn('h-4 w-4', config.color)} />
          {showLabel && (
            <span className={cn('text-xs font-medium', config.color)}>
              {config.label}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{resolvedAt ? 'Resolvido dentro do SLA' : timeInfo}</p>
      </TooltipContent>
    </Tooltip>
  );
}
