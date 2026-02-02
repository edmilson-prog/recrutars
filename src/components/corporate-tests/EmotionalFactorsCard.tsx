/**
 * Emotional Factors Card
 * 5 horizontal bars for emotional dimensions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deriveEmotionalFactors } from '@/utils/emotionalFactors';
import { EMOTIONAL_FACTOR_LABELS, type EmotionalFactorName } from '@/types/companyTest';
import type { DimensionScores } from '@/types/gaugePro';

interface EmotionalFactorsCardProps {
  scores: DimensionScores;
}

const FACTOR_ORDER: EmotionalFactorName[] = [
  'empatia', 'autocontrole', 'sociabilidade', 'resiliencia', 'inteligenciaEmocional',
];

function getBarColor(value: number): string {
  if (value >= 70) return '#16a34a';
  if (value >= 50) return '#2563eb';
  if (value >= 35) return '#ca8a04';
  return '#dc2626';
}

export function EmotionalFactorsCard({ scores }: EmotionalFactorsCardProps) {
  const factors = deriveEmotionalFactors(scores);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Fatores Emocionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {FACTOR_ORDER.map(key => {
          const value = factors[key];
          const color = getBarColor(value);
          const isAggregate = key === 'inteligenciaEmocional';

          return (
            <div key={key} className={isAggregate ? 'pt-2 border-t' : ''}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm ${isAggregate ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {EMOTIONAL_FACTOR_LABELS[key]}
                </span>
                <span className="text-sm font-medium" style={{ color }}>
                  {value}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${value}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
