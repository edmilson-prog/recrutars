/**
 * Competency Radar Chart
 * 6-axis radar derived from D1-D5
 */

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deriveCompetencyScores } from '@/utils/competencyRadar';
import { COMPETENCY_LABELS, type CompetencyName } from '@/types/companyTest';
import type { DimensionScores } from '@/types/gaugePro';

interface CompetencyRadarChartProps {
  scores: DimensionScores;
}

const COMPETENCY_ORDER: CompetencyName[] = [
  'lideranca', 'comunicacao', 'trabalhoEquipe', 'analiseCritica', 'organizacao', 'inovacao',
];

export function CompetencyRadarChart({ scores }: CompetencyRadarChartProps) {
  const competencies = deriveCompetencyScores(scores);

  const data = COMPETENCY_ORDER.map(key => ({
    competency: COMPETENCY_LABELS[key],
    value: competencies[key],
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Radar de Competências</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div style={{ width: 380, height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="competency" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip
                formatter={(value: number) => [`${Math.round(value)}`, 'Score']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Radar
                name="competency"
                dataKey="value"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
