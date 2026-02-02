/**
 * ComparisonRadar Component
 * PRD-048: Teste por Vaga
 *
 * Gráfico radar comparativo de candidatos
 */

import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { assessmentCategories } from '@/data/assessmentData';

interface CandidateData {
  id: string;
  name: string;
  color: string;
  scores: Record<string, number>; // categoryId -> score
}

interface ComparisonRadarProps {
  candidates: CandidateData[];
  competencyIds: string[];
  className?: string;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

function getCategoryName(categoryId: string): string {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

export function ComparisonRadar({
  candidates,
  competencyIds,
  className,
}: ComparisonRadarProps) {
  // Prepare data for radar chart
  const chartData = useMemo(() => {
    return competencyIds.map((compId) => {
      const dataPoint: Record<string, unknown> = {
        competency: getCategoryName(compId),
        fullMark: 100,
      };

      candidates.forEach((candidate) => {
        dataPoint[candidate.id] = candidate.scores[compId] || 0;
      });

      return dataPoint;
    });
  }, [candidates, competencyIds]);

  // Assign colors to candidates
  const candidatesWithColors = useMemo(() => {
    return candidates.map((c, index) => ({
      ...c,
      color: c.color || COLORS[index % COLORS.length],
    }));
  }, [candidates]);

  if (candidates.length === 0 || competencyIds.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[400px] text-muted-foreground', className)}>
        Selecione candidatos e competências para comparar
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="competency"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />

          {candidatesWithColors.map((candidate) => (
            <Radar
              key={candidate.id}
              name={candidate.name}
              dataKey={candidate.id}
              stroke={candidate.color}
              fill={candidate.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}

          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
            }}
            itemStyle={{
              color: 'hsl(var(--muted-foreground))',
            }}
            formatter={(value: number) => [`${value}%`, '']}
          />

          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
            formatter={(value) => (
              <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
