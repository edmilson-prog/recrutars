/**
 * GaugePro Radar Chart
 * PRD-053: Radar 5 dimensões (D1-D5) com overlay ideal
 */

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension, type DimensionScores } from '@/types/gaugePro';

interface GaugeProRadarChartProps {
  scores: DimensionScores;
  idealWeights?: Record<GaugeProDimension, number>;
  candidateName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 200, md: 300, lg: 400 };
const outerRadiusMap = { sm: '50%', md: '55%', lg: '56%' };
const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export function GaugeProRadarChart({ scores, idealWeights, candidateName, size = 'md' }: GaugeProRadarChartProps) {
  const data = DIMENSIONS.map(dim => ({
    dimension: DIMENSION_SHORT_NAMES[dim],
    score: scores[dim],
    ideal: idealWeights ? idealWeights[dim] * 50 : undefined,
  }));

  const px = sizeMap[size];

  return (
    <div style={{ width: px, height: px }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius={outerRadiusMap[size]}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="dimension"
            tick={({ x, y, payload, cx, cy }: any) => {
              const fs = size === 'sm' ? 8 : size === 'md' ? 10 : 12;
              const anchor = x > cx + 2 ? 'start' : x < cx - 2 ? 'end' : 'middle';
              const dy = y < cy ? -4 : y > cy + 2 ? 12 : 4;
              return (
                <text x={x} y={y} dy={dy} textAnchor={anchor} fontSize={fs} fill="hsl(var(--muted-foreground))">
                  {payload.value}
                </text>
              );
            }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${Math.round(value)}${name === 'ideal' ? 'x' : ''}`,
              name === 'ideal' ? 'Perfil Ideal' : (candidateName || 'Score'),
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          {idealWeights && (
            <Radar
              name="ideal"
              dataKey="ideal"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.1}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
          )}
          <Radar
            name="score"
            dataKey="score"
            stroke="#0891b2"
            fill="#0891b2"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          {idealWeights && size !== 'sm' && (
            <Legend
              formatter={(value) => value === 'ideal' ? 'Perfil Ideal' : (candidateName || 'Candidato')}
              wrapperStyle={{ fontSize: 11 }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
