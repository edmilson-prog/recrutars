/**
 * FunnelChart component
 * PRD-059: Relatorios "Radar"
 *
 * Horizontal funnel visualization with decreasing bars,
 * values, and inter-stage conversion rates.
 */

import { motion } from 'framer-motion';
import type { FunnelStage } from '@/types';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/formatters';

interface FunnelChartProps {
  stages: FunnelStage[];
}

const FUNNEL_COLORS = [
  'bg-blue-500',
  'bg-blue-400',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-green-500',
];

export function FunnelChart({ stages }: FunnelChartProps) {
  if (stages.length === 0) return null;

  const maxValue = stages[0].value;

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const widthPercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
        const prevStage = index > 0 ? stages[index - 1] : null;
        const stageConversion = prevStage && prevStage.value > 0
          ? Math.round((stage.value / prevStage.value) * 100)
          : null;

        return (
          <div key={stage.name}>
            {/* Conversion rate between stages */}
            {stageConversion !== null && (
              <div className="flex items-center justify-center mb-1">
                <div className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                  {stageConversion}% conversao
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Stage label */}
              <div className="w-32 text-sm font-medium text-foreground text-right shrink-0">
                {stage.name}
              </div>

              {/* Bar */}
              <div className="flex-1 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={cn(
                    'h-10 rounded-lg flex items-center justify-end pr-3',
                    FUNNEL_COLORS[index % FUNNEL_COLORS.length]
                  )}
                  style={{ minWidth: widthPercent > 0 ? '60px' : '0px' }}
                >
                  <span className="text-sm font-bold text-white">
                    {formatNumber(stage.value)}
                  </span>
                </motion.div>
              </div>

              {/* Overall conversion rate */}
              <div className="w-16 text-right shrink-0">
                <span className="text-sm font-medium text-muted-foreground">
                  {stage.conversionRate !== undefined ? `${stage.conversionRate}%` : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
