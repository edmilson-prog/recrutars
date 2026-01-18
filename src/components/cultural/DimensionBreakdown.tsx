/**
 * Dimension Breakdown Component
 * PRD-042: Fit Cultural
 *
 * Shows detailed breakdown by cultural dimension
 */

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { CulturalDimension, CulturalCompatibility } from '@/types/culturalFit';
import { DIMENSION_LABELS, DIMENSION_ICONS } from '@/types/culturalFit';
import { culturalDimensions } from '@/data/culturalDimensions';

interface DimensionBreakdownProps {
  compatibility: CulturalCompatibility;
  className?: string;
}

const DIMENSIONS: CulturalDimension[] = [
  'innovation',
  'collaboration',
  'hierarchy',
  'pace',
  'direction',
];

export function DimensionBreakdown({
  compatibility,
  className,
}: DimensionBreakdownProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          Compatibilidade por Dimensão
        </CardTitle>
        <CardDescription>
          Análise detalhada de cada aspecto cultural
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {DIMENSIONS.map((dimension, index) => {
          const score = compatibility.dimensionScores[dimension];
          const dimDef = culturalDimensions.find(d => d.id === dimension);
          const isStrength = compatibility.strengths.includes(dimension);
          const isWatchPoint = compatibility.watchPoints.includes(dimension);

          return (
            <motion.div
              key={dimension}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{DIMENSION_ICONS[dimension]}</span>
                  <span className="font-medium text-foreground">
                    {DIMENSION_LABELS[dimension]}
                  </span>
                </div>
                <span
                  className={cn(
                    'font-semibold',
                    score >= 75
                      ? 'text-green-600'
                      : score >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  )}
                >
                  {score}%
                </span>
              </div>

              <Progress
                value={score}
                className={cn(
                  'h-2',
                  score >= 75
                    ? '[&>div]:bg-green-500'
                    : score >= 50
                      ? '[&>div]:bg-yellow-500'
                      : '[&>div]:bg-red-500'
                )}
              />

              {dimDef && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{dimDef.lowLabel}</span>
                  <span>{dimDef.highLabel}</span>
                </div>
              )}

              {(isStrength || isWatchPoint) && (
                <p
                  className={cn(
                    'text-xs',
                    isStrength ? 'text-green-600' : 'text-yellow-600'
                  )}
                >
                  {isStrength
                    ? 'Excelente alinhamento nesta dimensão'
                    : 'Pode requerer adaptação'}
                </p>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
