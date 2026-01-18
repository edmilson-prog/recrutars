/**
 * Job Score Ring Component
 * PRD-039: SVG ring showing job quality score
 */

import { cn } from '@/lib/utils';
import { getJobScoreLevel } from '@/types/jobAnalyzer';

interface JobScoreRingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    diameter: 48,
    strokeWidth: 4,
    fontSize: 'text-sm',
    labelSize: 'text-[8px]',
  },
  md: {
    diameter: 72,
    strokeWidth: 5,
    fontSize: 'text-lg',
    labelSize: 'text-[10px]',
  },
  lg: {
    diameter: 96,
    strokeWidth: 6,
    fontSize: 'text-2xl',
    labelSize: 'text-xs',
  },
};

export function JobScoreRing({
  score,
  maxScore = 100,
  size = 'md',
  showLabel = true,
  className,
}: JobScoreRingProps) {
  const config = SIZE_CONFIG[size];
  const { diameter, strokeWidth } = config;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  const level = getJobScoreLevel(score);

  // Color based on score level
  const strokeColor = {
    low: 'stroke-red-500',
    medium: 'stroke-yellow-500',
    high: 'stroke-green-500',
  }[level];

  const textColor = {
    low: 'text-red-500',
    medium: 'text-yellow-500',
    high: 'text-green-500',
  }[level];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(strokeColor, 'transition-all duration-500 ease-out')}
        />
      </svg>
      {/* Score text in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', config.fontSize, textColor)}>
          {Math.round(score)}
        </span>
        {showLabel && (
          <span className={cn('text-muted-foreground', config.labelSize)}>
            pontos
          </span>
        )}
      </div>
    </div>
  );
}

// Compact version for inline display
export function JobScoreInline({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const level = getJobScoreLevel(score);

  const bgColor = {
    low: 'bg-red-500/10 text-red-600',
    medium: 'bg-yellow-500/10 text-yellow-600',
    high: 'bg-green-500/10 text-green-600',
  }[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium',
        bgColor,
        className
      )}
    >
      <span className="font-bold">{Math.round(score)}</span>
      <span className="text-xs opacity-75">pts</span>
    </span>
  );
}
