/**
 * CompatibilityCell
 * PRD-056: Single cell in the compatibility matrix showing pairwise score.
 */

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  getCompatibilityColor,
  getCompatibilityLabel,
} from '@/utils/compatibilityScore';
import type { CompatibilityLevel } from '@/types/teamManagement';

interface CompatibilityCellProps {
  score: number;
  level: CompatibilityLevel;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-14 h-14 text-sm',
} as const;

export default function CompatibilityCell({
  score,
  level,
  onClick,
  size = 'md',
}: CompatibilityCellProps) {
  const color = getCompatibilityColor(level);
  const label = getCompatibilityLabel(level);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(e) => {
              if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick();
              }
            }}
            className={cn(
              'flex items-center justify-center rounded-md font-mono font-semibold transition-all select-none',
              SIZE_CLASSES[size],
              onClick && 'cursor-pointer hover:ring-2 hover:ring-primary',
            )}
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {score}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-xs">
            {label} ({score}%)
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
