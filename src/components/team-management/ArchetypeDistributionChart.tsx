import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = [
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#db2777",
  "#0284c7",
  "#65a30d",
  "#ea580c",
  "#6366f1",
];

interface ArchetypeDistributionChartProps {
  members: Array<{ archetype?: string; departmentId: string }>;
  departments: Array<{ id: string; name: string }>;
}

interface ArchetypeData {
  name: string;
  count: number;
  color: string;
}

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ArchetypeData }[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Quantidade: <span className="font-medium">{data.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#888"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ArchetypeDistributionChart({
  members,
  departments,
}: ArchetypeDistributionChartProps) {
  const archetypeData: ArchetypeData[] = useMemo(() => {
    const counts: Record<string, number> = {};

    members.forEach((member) => {
      const archetype = member.archetype || "Não definido";
      counts[archetype] = (counts[archetype] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count], index) => ({
        name,
        count,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [members]);

  if (archetypeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição de Arquétipos</CardTitle>
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
        <CardTitle className="text-base">Distribuição de Arquétipos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pizza">
          <TabsList className="mb-4">
            <TabsTrigger value="pizza">Pizza</TabsTrigger>
            <TabsTrigger value="barras">Barras</TabsTrigger>
          </TabsList>

          <TabsContent value="pizza">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={archetypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                  label={renderPieLabel}
                  isAnimationActive={true}
                >
                  {archetypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="barras">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={archetypeData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={75}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Quantidade"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {archetypeData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
