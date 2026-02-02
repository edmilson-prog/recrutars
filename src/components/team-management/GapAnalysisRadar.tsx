/**
 * GapAnalysisRadar
 * PRD-056: Radar chart with ideal zone shading and team average overlay.
 */

import { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DIMENSION_SHORT_NAMES,
  type GaugeProDimension,
  type DimensionScores,
} from '@/types/gaugePro';

interface GapAnalysisRadarProps {
  teamAverage: DimensionScores;
  idealMin?: number;
  idealMax?: number;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export default function GapAnalysisRadar({
  teamAverage,
  idealMin = 40,
  idealMax = 75,
}: GapAnalysisRadarProps) {
  const data = useMemo(
    () =>
      DIMENSIONS.map((dim) => ({
        dimension: DIMENSION_SHORT_NAMES[dim],
        average: teamAverage[dim],
        idealMax,
        idealMin,
      })),
    [teamAverage, idealMin, idealMax],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Radar de Gaps</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  idealMax: 'Limite Superior',
                  idealMin: 'Limite Inferior',
                  average: 'Media da Equipe',
                };
                return [`${Math.round(value)}`, labels[name] || name];
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />

            {/* Ideal zone — upper boundary (green shaded area) */}
            <Radar
              name="idealMax"
              dataKey="idealMax"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.1}
              strokeWidth={1}
              strokeDasharray="6 4"
            />

            {/* Ideal zone — lower boundary (creates a visual band) */}
            <Radar
              name="idealMin"
              dataKey="idealMin"
              stroke="#22c55e"
              fill="#ffffff"
              fillOpacity={0.6}
              strokeWidth={1}
              strokeDasharray="6 4"
            />

            {/* Team average — solid cyan line */}
            <Radar
              name="average"
              dataKey="average"
              stroke="#0891b2"
              fill="#0891b2"
              fillOpacity={0.2}
              strokeWidth={2}
            />

            <Legend
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  idealMax: 'Zona Ideal (max)',
                  idealMin: 'Zona Ideal (min)',
                  average: 'Media da Equipe',
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: 11 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
