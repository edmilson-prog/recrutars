/**
 * Dimension Bars GaugePro
 * PRD-053: Barras horizontais com código de cores
 */

import { DIMENSION_NAMES, DIMENSION_SHORT_NAMES, DIMENSION_DESCRIPTIONS, type GaugeProDimension, type DimensionScores } from '@/types/gaugePro';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DimensionBarsGaugeProProps {
  scores: DimensionScores;
  compact?: boolean;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

function getBarColor(score: number): string {
  if (score >= 67) return 'bg-green-500';
  if (score >= 34) return 'bg-amber-500';
  return 'bg-red-500';
}

function getBarColorHex(score: number): string {
  if (score >= 67) return '#22c55e';
  if (score >= 34) return '#f59e0b';
  return '#ef4444';
}

export function DimensionBarsGaugePro({ scores, compact }: DimensionBarsGaugeProProps) {
  return (
    <div className="space-y-3">
      {DIMENSIONS.map(dim => {
        const score = scores[dim];
        const color = getBarColor(score);
        return (
          <div key={dim} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium cursor-help">
                    {compact ? DIMENSION_SHORT_NAMES[dim] : `${dim} - ${DIMENSION_NAMES[dim]}`}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                  <p className="font-semibold mb-1">{DIMENSION_NAMES[dim]}</p>
                  <p>{DIMENSION_DESCRIPTIONS[dim]}</p>
                </TooltipContent>
              </Tooltip>
              <span className="font-semibold" style={{ color: getBarColorHex(score) }}>
                {score}
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${color}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
