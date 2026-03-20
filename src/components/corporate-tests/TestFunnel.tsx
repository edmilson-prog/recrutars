/**
 * Test Funnel
 * PRD-052 + PRD-089: Funil visual 5 etapas com percentuais
 * (Convidados -> Visualizados -> Iniciados -> Concluídos -> Analisados)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { FunnelData } from '@/types/companyTest';

interface TestFunnelProps {
  data: FunnelData;
}

const FUNNEL_COLORS = ['#64748b', '#06b6d4', '#3b82f6', '#22c55e', '#0891b2'];

export function TestFunnel({ data }: TestFunnelProps) {
  const total = data.invited || 1;
  const chartData = [
    { name: 'Convidados', value: data.invited, pct: '100%' },
    { name: 'Visualizados', value: data.viewed, pct: `${Math.round(data.viewed / total * 100)}%` },
    { name: 'Iniciados', value: data.started, pct: `${Math.round(data.started / total * 100)}%` },
    { name: 'Concluídos', value: data.completed, pct: `${Math.round(data.completed / total * 100)}%` },
    { name: 'Analisados', value: data.analyzed, pct: `${Math.round(data.analyzed / total * 100)}%` },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={11} width={90} />
              <Tooltip
                formatter={(value: number, _name: string, entry: { payload: { pct: string } }) => [
                  `${value} (${entry.payload.pct})`,
                  'Total',
                ]}
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={FUNNEL_COLORS[index]} />
                ))}
                <LabelList dataKey="pct" position="right" fontSize={11} fill="hsl(var(--muted-foreground))" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
