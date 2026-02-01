/**
 * Ideal Profile Radar
 * PRD-052: Radar chart do perfil ideal (recharts)
 */

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';

interface IdealProfileRadarProps {
  weights: Record<GaugeProDimension, number>;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 180, md: 250, lg: 320 };

export function IdealProfileRadar({ weights, size = 'md' }: IdealProfileRadarProps) {
  const data = (Object.entries(weights) as [GaugeProDimension, number][]).map(([dim, weight]) => ({
    dimension: DIMENSION_SHORT_NAMES[dim],
    weight: weight * 50, // Normalize to 0-100 scale (max weight 2.0 = 100)
    original: weight,
  }));

  const px = sizeMap[size];

  return (
    <div style={{ width: px, height: px }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            formatter={(value: number, _name: string, entry: any) => [
              `${entry.payload.original.toFixed(1)}x`,
              'Peso',
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Radar
            dataKey="weight"
            stroke="#0891b2"
            fill="#0891b2"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
