/**
 * TrialAlert Component
 * PRD-074: Non-dismissable alert for high/urgent urgency levels.
 *
 * - high (2-7 days): amber/warning color with prominent CTA
 * - urgent (0-1 days): red/destructive color with urgent messaging
 */

import { Link } from 'react-router-dom';
import { AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getWarningMessage } from '@/lib/trialRules';
import type { TrialWarningLevel } from '@/lib/trialRules';

interface TrialAlertProps {
  level: Extract<TrialWarningLevel, 'high' | 'urgent'>;
  daysRemaining: number;
  className?: string;
}

export function TrialAlert({ level, daysRemaining, className }: TrialAlertProps) {
  const isUrgent = level === 'urgent';
  const message = getWarningMessage(level, daysRemaining);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        isUrgent
          ? 'bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
          : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200',
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      {isUrgent ? (
        <Zap className="w-5 h-5 flex-shrink-0 text-red-500" />
      ) : (
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
      )}
      <p className="flex-1 text-sm font-medium">
        {message}
      </p>
      <Link to="/planos">
        <Button
          size="sm"
          className={cn(
            'gap-1 font-semibold',
            isUrgent
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white',
          )}
        >
          Assine agora
        </Button>
      </Link>
    </div>
  );
}
