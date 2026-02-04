/**
 * ComparisonIndicator component
 * PRD-059: Relatorios "Radar"
 *
 * Displays percentage change between current and previous values
 * with directional arrow and color coding.
 */

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonIndicatorProps {
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percent';
  invertColors?: boolean;
}

export function ComparisonIndicator({
  current,
  previous,
  format = 'number',
  invertColors = false,
}: ComparisonIndicatorProps) {
  const change = previous !== 0
    ? ((current - previous) / Math.abs(previous)) * 100
    : current > 0
      ? 100
      : 0;

  const roundedChange = Math.round(change * 10) / 10;
  const isPositive = roundedChange > 0;
  const isNegative = roundedChange < 0;
  const isNeutral = roundedChange === 0;

  // When invertColors is true (e.g. for churn), positive = bad, negative = good
  const isGood = invertColors ? isNegative : isPositive;
  const isBad = invertColors ? isPositive : isNegative;

  const colorClass = isGood
    ? 'text-emerald-600 dark:text-emerald-400'
    : isBad
      ? 'text-red-600 dark:text-red-400'
      : 'text-muted-foreground';

  const formatAbsoluteChange = () => {
    const absChange = Math.abs(current - previous);
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(absChange);
      case 'percent':
        return `${absChange.toFixed(1)}pp`;
      default:
        return new Intl.NumberFormat('pt-BR').format(absChange);
    }
  };

  return (
    <div className={cn('flex items-center gap-1 text-sm font-medium', colorClass)}>
      {isPositive && <ArrowUp className="w-3.5 h-3.5" />}
      {isNegative && <ArrowDown className="w-3.5 h-3.5" />}
      {isNeutral && <Minus className="w-3.5 h-3.5" />}
      <span>{isPositive ? '+' : ''}{roundedChange}%</span>
    </div>
  );
}
