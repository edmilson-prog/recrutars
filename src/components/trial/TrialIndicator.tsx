/**
 * TrialIndicator Component
 * PRD-074: Wrapper that selects the correct trial component based on warning level.
 *
 * Renders TrialBanner for medium, TrialAlert for high/urgent,
 * or nothing for low (low is handled separately as TrialBadge in the header).
 */

import { TrialBanner } from './TrialBanner';
import { TrialAlert } from './TrialAlert';
import { isDismissable } from '@/lib/trialRules';
import type { TrialWarningLevel } from '@/lib/trialRules';

interface TrialIndicatorProps {
  warningLevel: TrialWarningLevel;
  daysRemaining: number;
  className?: string;
}

export function TrialIndicator({
  warningLevel,
  daysRemaining,
  className,
}: TrialIndicatorProps) {
  switch (warningLevel) {
    case 'medium':
      return (
        <TrialBanner
          daysRemaining={daysRemaining}
          dismissable={isDismissable(warningLevel)}
          className={className}
        />
      );

    case 'high':
    case 'urgent':
      return (
        <TrialAlert
          level={warningLevel}
          daysRemaining={daysRemaining}
          className={className}
        />
      );

    case 'low':
    case 'expired':
    default:
      return null;
  }
}
