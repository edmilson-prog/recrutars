/**
 * Dimension Heatmap
 * PRD-055: Mapa Comportamental — Heatmap dimensional por departamento
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DIMENSION_SHORT_NAMES,
  type GaugeProDimension,
  type DimensionScores,
} from '@/types/gaugePro';
import type { TeamMember, Department } from '@/types/teamManagement';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

interface DimensionHeatmapProps {
  members: TeamMember[];
  departments: Department[];
}

interface DeptRow {
  id: string;
  name: string;
  averages: Partial<DimensionScores>;
  hasMapped: boolean;
}

function getCellClasses(score: number | undefined): string {
  if (score === undefined) {
    return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500';
  }
  if (score > 75) {
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  }
  if (score >= 50) {
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  }
  return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
}

export default function DimensionHeatmap({
  members,
  departments,
}: DimensionHeatmapProps) {
  const { deptRows, overallAverages } = useMemo(() => {
    const rows: DeptRow[] = departments.map((dept) => {
      const deptMembers = members.filter(
        (m) =>
          m.departmentId === dept.id &&
          m.gaugeStatus === 'mapped' &&
          m.gaugeScores,
      );

      if (deptMembers.length === 0) {
        return { id: dept.id, name: dept.name, averages: {}, hasMapped: false };
      }

      const totals: Record<string, number> = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };
      deptMembers.forEach((m) => {
        DIMENSIONS.forEach((dim) => {
          totals[dim] += m.gaugeScores![dim];
        });
      });

      const avg = {} as DimensionScores;
      DIMENSIONS.forEach((dim) => {
        avg[dim] = Math.round(totals[dim] / deptMembers.length);
      });

      return { id: dept.id, name: dept.name, averages: avg, hasMapped: true };
    });

    // Overall averages
    const allMapped = members.filter(
      (m) => m.gaugeStatus === 'mapped' && m.gaugeScores,
    );
    const overall = {} as Partial<DimensionScores>;
    if (allMapped.length > 0) {
      const totals: Record<string, number> = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };
      allMapped.forEach((m) => {
        DIMENSIONS.forEach((dim) => {
          totals[dim] += m.gaugeScores![dim];
        });
      });
      DIMENSIONS.forEach((dim) => {
        (overall as DimensionScores)[dim] = Math.round(totals[dim] / allMapped.length);
      });
    }

    return { deptRows: rows, overallAverages: overall };
  }, [members, departments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Heatmap Dimensional</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">
                  Departamento
                </th>
                {DIMENSIONS.map((dim) => (
                  <th
                    key={dim}
                    className="px-3 py-2 text-center font-semibold text-muted-foreground"
                  >
                    {dim} ({DIMENSION_SHORT_NAMES[dim]})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptRows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    {row.name}
                  </td>
                  {DIMENSIONS.map((dim) => {
                    const score = row.averages[dim];
                    return (
                      <td key={dim} className="px-1 py-1">
                        <div
                          className={cn(
                            'px-3 py-2 text-center font-mono font-semibold rounded-md',
                            getCellClasses(score),
                          )}
                        >
                          {score !== undefined ? score : '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Overall average row */}
              <tr className="border-t-2 border-border">
                <td className="px-3 py-2 font-bold whitespace-nowrap">
                  Média Geral
                </td>
                {DIMENSIONS.map((dim) => {
                  const score = overallAverages[dim];
                  return (
                    <td key={dim} className="px-1 py-1">
                      <div
                        className={cn(
                          'px-3 py-2 text-center font-mono font-semibold rounded-md',
                          getCellClasses(score),
                        )}
                      >
                        {score !== undefined ? score : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
