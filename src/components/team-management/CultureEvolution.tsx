/**
 * Culture Evolution Comparison
 * PRD-057: Comparacao side-by-side de snapshots culturais ao longo do tempo
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
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DIMENSION_SHORT_NAMES,
  type GaugeProDimension,
} from '@/types/gaugePro';
import type { CompanyCultureSnapshot } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CultureEvolutionProps {
  snapshots: CompanyCultureSnapshot[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CultureEvolution({ snapshots }: CultureEvolutionProps) {
  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [snapshots],
  );

  if (sorted.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolucao Cultural</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Dados insuficientes para comparacao. Sao necessarios pelo menos 2 snapshots culturais.
          </p>
        </CardContent>
      </Card>
    );
  }

  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  const radarData = DIMENSIONS.map((dim) => ({
    dimension: DIMENSION_SHORT_NAMES[dim],
    old: Math.round(oldest.dnaScores[dim] * 10) / 10,
    new: Math.round(newest.dnaScores[dim] * 10) / 10,
  }));

  const deltas = DIMENSIONS.map((dim) => {
    const oldVal = oldest.dnaScores[dim];
    const newVal = newest.dnaScores[dim];
    const change = Math.round((newVal - oldVal) * 100) / 100;
    return {
      dim,
      label: DIMENSION_SHORT_NAMES[dim],
      old: Math.round(oldVal * 10) / 10,
      new: Math.round(newVal * 10) / 10,
      change,
    };
  });

  const memberChange = newest.mappedMembers - oldest.mappedMembers;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Evolucao Cultural</CardTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Comparando {formatDate(oldest.date)} vs {formatDate(newest.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>
              {oldest.mappedMembers} &rarr; {newest.mappedMembers} mapeados
              {memberChange !== 0 && (
                <span className={cn(
                  'ml-1 font-medium',
                  memberChange > 0 ? 'text-green-600' : 'text-red-600',
                )}>
                  ({memberChange > 0 ? '+' : ''}{memberChange})
                </span>
              )}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overlaid Radar Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 11, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${Math.round(value)}`,
                    name === 'old' ? formatDate(oldest.date) : formatDate(newest.date),
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Radar
                  name="old"
                  dataKey="old"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.15}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Radar
                  name="new"
                  dataKey="new"
                  stroke="#0891b2"
                  fill="#0891b2"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Legend
                  formatter={(value: string) =>
                    value === 'old' ? formatDate(oldest.date) : formatDate(newest.date)
                  }
                  wrapperStyle={{ fontSize: 11 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Delta Table */}
          <div className="flex flex-col justify-center">
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium text-xs">Dimensao</th>
                    <th className="text-center px-3 py-2 font-medium text-xs">Anterior</th>
                    <th className="text-center px-3 py-2 font-medium text-xs">Atual</th>
                    <th className="text-center px-3 py-2 font-medium text-xs">Variacao</th>
                  </tr>
                </thead>
                <tbody>
                  {deltas.map((d) => (
                    <tr key={d.dim} className="border-t">
                      <td className="px-3 py-2 text-xs font-medium">{d.label}</td>
                      <td className="px-3 py-2 text-xs text-center tabular-nums text-muted-foreground">
                        {d.old}
                      </td>
                      <td className="px-3 py-2 text-xs text-center tabular-nums font-medium">
                        {d.new}
                      </td>
                      <td className="px-3 py-2 text-xs text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 font-medium tabular-nums',
                            d.change > 0 && 'text-green-600',
                            d.change < 0 && 'text-red-600',
                            d.change === 0 && 'text-muted-foreground',
                          )}
                        >
                          {d.change > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : d.change < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {d.change > 0 ? '+' : ''}
                          {d.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
