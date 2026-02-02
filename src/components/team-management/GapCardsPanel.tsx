/**
 * GapCardsPanel
 * PRD-056: Cards showing behavioural gaps and excesses in the team.
 */

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import { getGapSeverityColor } from '@/utils/gapAnalysis';
import type { GapItem } from '@/types/teamManagement';

interface GapCardsPanelProps {
  gaps: GapItem[];
  excesses: GapItem[];
}

const SEVERITY_ICONS = {
  critical: AlertCircle,
  moderate: AlertTriangle,
  minor: Info,
} as const;

const SEVERITY_LABELS = {
  critical: 'Critico',
  moderate: 'Moderado',
  minor: 'Leve',
} as const;

function GapCard({
  item,
  type,
}: {
  item: GapItem;
  type: 'gap' | 'excess';
}) {
  const color = getGapSeverityColor(item.severity);
  const SeverityIcon = SEVERITY_ICONS[item.severity];
  const dimensionName = DIMENSION_SHORT_NAMES[item.dimension];
  const magnitude = Math.abs(item.gap);

  return (
    <motion.div variants={staggerItem}>
      <Card
        className={cn(
          'border-l-4 transition-all hover:shadow-sm',
          type === 'gap' ? 'border-l-red-400' : 'border-l-amber-400',
        )}
      >
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <SeverityIcon
              className="h-4 w-4 mt-0.5 shrink-0"
              style={{ color }}
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{dimensionName}</p>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono shrink-0"
                  style={{
                    borderColor: color,
                    color,
                    backgroundColor: `${color}15`,
                  }}
                >
                  {SEVERITY_LABELS[item.severity]}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>
                  Media atual:{' '}
                  <span className="font-mono font-medium text-foreground">
                    {item.currentAverage.toFixed(1)}
                  </span>
                </p>
                <p>
                  Faixa ideal:{' '}
                  <span className="font-mono">
                    {item.idealRange.min} - {item.idealRange.max}
                  </span>
                </p>
                <p>
                  {type === 'gap' ? 'Deficit' : 'Excesso'}:{' '}
                  <span className="font-mono font-semibold" style={{ color }}>
                    {type === 'gap' ? '-' : '+'}{magnitude.toFixed(1)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GapCardsPanel({ gaps, excesses }: GapCardsPanelProps) {
  const hasGaps = gaps.length > 0;
  const hasExcesses = excesses.length > 0;

  if (!hasGaps && !hasExcesses) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Todas as dimensoes estao dentro da faixa ideal. Equipe equilibrada!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gaps section */}
      {hasGaps && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Lacunas
            <span className="text-xs font-normal text-muted-foreground">
              ({gaps.length})
            </span>
          </h4>
          <motion.div
            className="grid gap-3 sm:grid-cols-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {gaps.map((item) => (
              <GapCard
                key={`gap-${item.dimension}`}
                item={item}
                type="gap"
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Excesses section */}
      {hasExcesses && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Excessos
            <span className="text-xs font-normal text-muted-foreground">
              ({excesses.length})
            </span>
          </h4>
          <motion.div
            className="grid gap-3 sm:grid-cols-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {excesses.map((item) => (
              <GapCard
                key={`excess-${item.dimension}`}
                item={item}
                type="excess"
              />
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
