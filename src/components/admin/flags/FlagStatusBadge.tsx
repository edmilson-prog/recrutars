/**
 * FlagStatusBadge Component
 * PRD-062: Feature Flags "Switch"
 *
 * Visual badge for flag status with kill switch indicator.
 */

import { Skull } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FlagStatus } from '@/types';

interface FlagStatusBadgeProps {
  status: FlagStatus;
  isKillSwitched: boolean;
}

const statusConfig: Record<FlagStatus, { label: string; className: string }> = {
  active: {
    label: 'Ativa',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  inactive: {
    label: 'Inativa',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  },
  killed: {
    label: 'Kill Switch',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  },
};

export function FlagStatusBadge({ status, isKillSwitched }: FlagStatusBadgeProps) {
  const effectiveStatus = isKillSwitched ? 'killed' : status;
  const config = statusConfig[effectiveStatus];

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 font-medium', config.className)}
    >
      {isKillSwitched && <Skull className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
}
