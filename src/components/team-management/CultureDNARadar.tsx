/**
 * Culture DNA Radar Chart
 * PRD-057: Radar chart exibindo o DNA cultural da empresa
 */

import { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension, type DimensionScores } from '@/types/gaugePro';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CultureDNARadarProps {
  dnaScores: DimensionScores;
  companyName?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CultureDNARadar({ dnaScores, companyName }: CultureDNARadarProps) {
  const data = useMemo(() => {
    return DIMENSIONS.map((dim) => ({
      dimension: DIMENSION_SHORT_NAMES[dim],
      score: Math.round(dnaScores[dim] * 10) / 10,
    }));
  }, [dnaScores]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Dna className="h-5 w-5 text-cyan-600" />
          <div>
            <CardTitle className="text-base">DNA Cultural</CardTitle>
            {companyName && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {companyName}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9 }}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value}`, 'Score']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Radar
              name="DNA Cultural"
              dataKey="score"
              stroke="#0891b2"
              fill="#0891b2"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ r: 4, fill: '#0891b2' }}
              label={{
                position: 'outside',
                fontSize: 10,
                fontWeight: 600,
                fill: '#0891b2',
                formatter: (value: number) => Math.round(value),
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
