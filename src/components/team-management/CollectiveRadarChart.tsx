/**
 * Collective Radar Chart
 * PRD-055: Mapa Comportamental — Radar coletivo com overlay por departamento
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
import {
  DIMENSION_SHORT_NAMES,
  type GaugeProDimension,
  type DimensionScores,
} from '@/types/gaugePro';
import type { TeamMember, Department } from '@/types/teamManagement';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

interface CollectiveRadarChartProps {
  members: TeamMember[];
  departments: Department[];
  selectedDepartmentId?: string | null;
}

function calcAverage(
  memberList: TeamMember[],
): DimensionScores | null {
  const mapped = memberList.filter(
    (m) => m.gaugeStatus === 'mapped' && m.gaugeScores,
  );
  if (mapped.length === 0) return null;

  const totals: Record<string, number> = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };
  mapped.forEach((m) => {
    DIMENSIONS.forEach((dim) => {
      totals[dim] += m.gaugeScores![dim];
    });
  });

  const avg = {} as DimensionScores;
  DIMENSIONS.forEach((dim) => {
    avg[dim] = Math.round((totals[dim] / mapped.length) * 10) / 10;
  });
  return avg;
}

export default function CollectiveRadarChart({
  members,
  departments,
  selectedDepartmentId,
}: CollectiveRadarChartProps) {
  const teamAverages = useMemo(() => calcAverage(members), [members]);

  const departmentAverage = useMemo(() => {
    if (!selectedDepartmentId) return null;
    const deptMembers = members.filter(
      (m) => m.departmentId === selectedDepartmentId,
    );
    return calcAverage(deptMembers);
  }, [members, selectedDepartmentId]);

  const selectedDept = useMemo(
    () => departments.find((d) => d.id === selectedDepartmentId),
    [departments, selectedDepartmentId],
  );

  const data = useMemo(() => {
    return DIMENSIONS.map((dim) => ({
      dimension: DIMENSION_SHORT_NAMES[dim],
      teamAverage: teamAverages ? teamAverages[dim] : 0,
      ...(departmentAverage ? { deptAverage: departmentAverage[dim] } : {}),
    }));
  }, [teamAverages, departmentAverage]);

  if (!teamAverages) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Radar Coletivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum membro mapeado para exibir o radar coletivo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Radar Coletivo</CardTitle>
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
              formatter={(value: number, name: string) => [
                `${Math.round(value)}`,
                name === 'deptAverage'
                  ? (selectedDept?.name || 'Departamento')
                  : 'Média Geral',
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Radar
              name="teamAverage"
              dataKey="teamAverage"
              stroke="#0891b2"
              fill="#0891b2"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {departmentAverage && (
              <Radar
                name="deptAverage"
                dataKey="deptAverage"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.15}
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            {departmentAverage && (
              <Legend
                formatter={(value: string) =>
                  value === 'deptAverage'
                    ? (selectedDept?.name || 'Departamento')
                    : 'Média Geral'
                }
                wrapperStyle={{ fontSize: 11 }}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
