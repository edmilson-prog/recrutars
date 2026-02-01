/**
 * Profile Distribution Chart
 * PRD-054: Gráfico distribuição de perfis
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CompanyTestResult } from '@/types/companyTest';

interface ProfileDistributionChartProps {
  results: CompanyTestResult[];
}

export function ProfileDistributionChart({ results }: ProfileDistributionChartProps) {
  // Count archetypes
  const counts: Record<string, number> = {};
  results.forEach(r => {
    const name = r.archetype.name.replace('O ', '').replace('A ', '');
    counts[name] = (counts[name] || 0) + 1;
  });

  const data = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Distribuição de Perfis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="name" fontSize={10} width={90} />
              <Tooltip
                formatter={(value: number) => [value, 'Candidatos']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
