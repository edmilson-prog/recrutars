/**
 * Comparison Radar Overlay
 * PRD-053: Radar sobreposto (2-4 candidatos)
 */

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { CompanyTestResult } from '@/types/companyTest';

interface ComparisonRadarOverlayProps {
  results: CompanyTestResult[];
}

const COLORS = ['#0891b2', '#22c55e', '#f59e0b', '#ef4444'];
const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export function ComparisonRadarOverlay({ results }: ComparisonRadarOverlayProps) {
  const data = DIMENSIONS.map(dim => {
    const point: Record<string, string | number> = {
      dimension: DIMENSION_SHORT_NAMES[dim],
    };
    results.forEach((r, i) => {
      point[`cand${i}`] = r.scores[dim];
    });
    return point;
  });

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number, name: string) => {
              const idx = parseInt(name.replace('cand', ''));
              return [value, results[idx]?.candidateName || name];
            }}
          />
          {results.map((r, i) => (
            <Radar
              key={r.id}
              name={`cand${i}`}
              dataKey={`cand${i}`}
              stroke={COLORS[i]}
              fill={COLORS[i]}
              fillOpacity={0.05}
              strokeWidth={2}
            />
          ))}
          <Legend
            formatter={(value) => {
              const idx = parseInt(value.replace('cand', ''));
              return results[idx]?.candidateName || value;
            }}
            wrapperStyle={{ fontSize: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
