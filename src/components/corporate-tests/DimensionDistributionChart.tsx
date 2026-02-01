/**
 * Dimension Distribution Chart
 * PRD-054: Histograma de scores por dimensão
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { CompanyTestResult } from '@/types/companyTest';

interface DimensionDistributionChartProps {
  results: CompanyTestResult[];
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export function DimensionDistributionChart({ results }: DimensionDistributionChartProps) {
  const data = DIMENSIONS.map(dim => {
    const scores = results.map(r => r.scores[dim]);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      dimension: DIMENSION_SHORT_NAMES[dim],
      media: avg,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Média por Dimensão (Empresa)</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="w-[280px] h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip
                formatter={(value: number) => [value, 'Média']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Radar dataKey="media" stroke="#0891b2" fill="#0891b2" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
