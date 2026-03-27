/**
 * Department Archetype Chart
 * PRD-055: Mapa Comportamental — Distribuicao de arquetipos por departamento (stacked bar)
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamMember, Department } from '@/types/teamManagement';
import { getArchetypeDisplayName } from '@/data/gaugeProArchetypes';

/** PRD-090: Filter members eligible for metrics. */
function isEligibleForMetrics(m: TeamMember): boolean {
  const status = m.status ?? (m.isActive ? 'active' : 'inactive');
  return status === 'active' || (status === 'on_leave' && !!m.leaveIncludeMetrics);
}

const PALETTE = [
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#0284c7',
  '#65a30d',
  '#ea580c',
  '#6366f1',
];

interface DepartmentArchetypeChartProps {
  members: TeamMember[];
  departments: Department[];
}

export default function DepartmentArchetypeChart({
  members,
  departments,
}: DepartmentArchetypeChartProps) {
  const { chartData, archetypeList, archetypeColors } = useMemo(() => {
    // Collect all unique archetypes (translated to Portuguese)
    const archetypeSet = new Set<string>();
    members.forEach((m) => {
      if (m.archetype) archetypeSet.add(getArchetypeDisplayName(m.archetype));
    });
    const allArchetypes = Array.from(archetypeSet).sort();

    // Build color map
    const colors: Record<string, string> = {};
    allArchetypes.forEach((arch, i) => {
      colors[arch] = PALETTE[i % PALETTE.length];
    });

    // Build data per department
    const data = departments.map((dept) => {
      const deptMembers = members.filter((m) => m.departmentId === dept.id && isEligibleForMetrics(m));
      const row: Record<string, string | number> = {
        department: dept.name,
      };
      allArchetypes.forEach((arch) => {
        row[arch] = deptMembers.filter(
          (m) => m.archetype && getArchetypeDisplayName(m.archetype) === arch
        ).length;
      });
      return row;
    });

    return {
      chartData: data,
      archetypeList: allArchetypes,
      archetypeColors: colors,
    };
  }, [members, departments]);

  if (archetypeList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado de arquétipo disponível.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição por Departamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="department"
              tick={{ fontSize: 11 }}
              interval={0}
              tickFormatter={(value: string) =>
                value.length > 14 ? `${value.slice(0, 12)}...` : value
              }
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {archetypeList.map((arch) => (
              <Bar
                key={arch}
                dataKey={arch}
                stackId="archetypes"
                fill={archetypeColors[arch]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
