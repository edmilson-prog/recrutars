/**
 * Cultural Fit Badge
 * PRD-057: Badge visual indicando o nivel de fit cultural
 */

import { cn } from '@/lib/utils';
import { getFitLabel } from '@/utils/culturalFit';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CulturalFitBadgeProps {
  fitScore: number;
  fitLevel: 'excellent' | 'good' | 'moderate' | 'low';
  showScore?: boolean;
  size?: 'sm' | 'md';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEVEL_STYLES: Record<CulturalFitBadgeProps['fitLevel'], string> = {
  excellent:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
  good:
    'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950 dark:text-lime-300 dark:border-lime-900',
  moderate:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  low:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
};

const SIZE_STYLES: Record<NonNullable<CulturalFitBadgeProps['size']>, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CulturalFitBadge({
  fitScore,
  fitLevel,
  showScore = true,
  size = 'md',
}: CulturalFitBadgeProps) {
  const label = getFitLabel(fitLevel);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold tabular-nums',
        LEVEL_STYLES[fitLevel],
        SIZE_STYLES[size],
      )}
    >
      {showScore && <span>{Math.round(fitScore)}%</span>}
      <span>{label}</span>
    </span>
  );
}
