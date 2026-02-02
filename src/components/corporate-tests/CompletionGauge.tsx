/**
 * Completion Gauge
 * PRD-054: Gauge circular (taxa conclusão/abandono)
 */

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface CompletionGaugeProps {
  label: string;
  value: number; // 0-100
  color: string;
}

export function CompletionGauge({ label, value, color }: CompletionGaugeProps) {
  const data = [
    { name: 'Value', value },
    { name: 'Remaining', value: 100 - value },
  ];

  return (
    <Card>
      <CardContent className="pt-4 pb-4 flex flex-col items-center">
        <div className="w-[120px] h-[120px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill={color} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold" style={{ color }}>{value}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">{label}</p>
      </CardContent>
    </Card>
  );
}
