/**
 * Test Funnel
 * PRD-052: Funil visual (Convites -> Iniciados -> Concluídos -> Analisados)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { FunnelData } from '@/types/companyTest';

interface TestFunnelProps {
  data: FunnelData;
}

const FUNNEL_COLORS = ['#64748b', '#3b82f6', '#22c55e', '#0891b2'];

export function TestFunnel({ data }: TestFunnelProps) {
  const chartData = [
    { name: 'Convidados', value: data.invited },
    { name: 'Iniciados', value: data.started },
    { name: 'Concluídos', value: data.completed },
    { name: 'Analisados', value: data.analyzed },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={80} />
              <Tooltip
                formatter={(value: number) => [value, 'Total']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={FUNNEL_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
