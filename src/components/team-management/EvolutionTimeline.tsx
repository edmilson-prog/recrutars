/**
 * EvolutionTimeline
 * PRD-057: Grafico de linha temporal da evolucao comportamental (D1-D5).
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import type { TestHistoryEntry, EvolutionAnnotation } from '@/types/teamManagement';

interface EvolutionTimelineProps {
  history: TestHistoryEntry[];
  annotations?: EvolutionAnnotation[];
}

const DIMENSION_COLORS: Record<GaugeProDimension, string> = {
  D1: '#0891b2',
  D2: '#7c3aed',
  D3: '#059669',
  D4: '#d97706',
  D5: '#db2777',
};

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export default function EvolutionTimeline({
  history,
  annotations,
}: EvolutionTimelineProps) {
  const chartData = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    );

    return sorted.map((entry) => ({
      date: format(new Date(entry.completedAt), 'dd/MM/yy', { locale: ptBR }),
      dateRaw: entry.completedAt,
      D1: entry.scores.D1,
      D2: entry.scores.D2,
      D3: entry.scores.D3,
      D4: entry.scores.D4,
      D5: entry.scores.D5,
    }));
  }, [history]);

  // Find annotation markers mapped to chart data points
  const annotationMarkers = useMemo(() => {
    if (!annotations || annotations.length === 0 || chartData.length === 0) return [];

    return annotations.map((annot) => {
      // Find the closest data point to the annotation date
      const annotDate = new Date(annot.date).getTime();
      let closestIdx = 0;
      let closestDiff = Infinity;

      chartData.forEach((point, idx) => {
        const diff = Math.abs(new Date(point.dateRaw).getTime() - annotDate);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIdx = idx;
        }
      });

      return {
        ...annot,
        dataIndex: closestIdx,
        dateLabel: chartData[closestIdx]?.date,
      };
    });
  }, [annotations, chartData]);

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum histórico de testes encontrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Linha do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickMargin={4}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value: number, name: string) => [
                value,
                DIMENSION_SHORT_NAMES[name as GaugeProDimension] || name,
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Legend
              formatter={(value: string) =>
                DIMENSION_SHORT_NAMES[value as GaugeProDimension] || value
              }
              wrapperStyle={{ fontSize: 11 }}
            />
            {DIMENSIONS.map((dim) => (
              <Line
                key={dim}
                type="monotone"
                dataKey={dim}
                stroke={DIMENSION_COLORS[dim]}
                strokeWidth={2}
                dot={{ r: 4, fill: DIMENSION_COLORS[dim] }}
                activeDot={{ r: 6, fill: DIMENSION_COLORS[dim] }}
              />
            ))}
            {/* Annotation markers shown as reference dots on D1 line */}
            {annotationMarkers.map((marker) => {
              const dataPoint = chartData[marker.dataIndex];
              if (!dataPoint) return null;
              return (
                <ReferenceDot
                  key={marker.id}
                  x={dataPoint.date}
                  y={dataPoint.D1}
                  r={8}
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>

        {/* Annotation legend */}
        {annotationMarkers.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-3 w-3 rounded-full bg-amber-400 border border-white shadow-sm" />
            <span>Marcadores indicam anotações de evolução</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
