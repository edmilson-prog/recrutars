/**
 * Fit Score Display
 * PRD-053: Score de Fit (barra + classificação)
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { FitClassification } from '@/types/companyTest';
import { getFitScoreLabel, getFitScoreColor } from '@/utils/fitScore';

interface FitScoreDisplayProps {
  score: number;
  classification: FitClassification;
  compact?: boolean;
}

export function FitScoreDisplay({ score, classification, compact }: FitScoreDisplayProps) {
  const label = getFitScoreLabel(classification);
  const color = getFitScoreColor(classification);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-semibold" style={{ color }}>
          {score.toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Score de Fit</span>
          <Badge
            variant="outline"
            style={{ color, borderColor: color }}
            className="font-bold"
          >
            {label}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Progress
              value={score}
              className="h-3"
              style={{
                '--progress-background': color,
              } as React.CSSProperties}
            />
          </div>
          <span className="text-2xl font-bold" style={{ color }}>
            {score.toFixed(1)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Compatibilidade com o perfil ideal da vaga
        </p>
      </CardContent>
    </Card>
  );
}
