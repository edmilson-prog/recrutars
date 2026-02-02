/**
 * Nine-Box Behavioral Chart
 * PRD-057: Grafico Nine-Box usando Recharts ScatterChart
 *
 * X = (D1 + D3) / 2  (Entrega / Execution)
 * Y = (D2 + D5) / 2  (Potencial Relacional)
 */

import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  Label,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamMember } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NineBoxChartProps {
  members: TeamMember[];
}

interface MemberPoint {
  id: string;
  name: string;
  initials: string;
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getZoneColor(x: number, y: number): string {
  const col = x < 33 ? 0 : x < 67 ? 1 : 2;
  const row = y < 33 ? 0 : y < 67 ? 1 : 2;

  // Row 2 (top), Row 1 (mid), Row 0 (bottom)
  // Col 0 (left), Col 1 (center), Col 2 (right)
  const colors: Record<string, string> = {
    '0-0': '#ef4444', // low/low - red
    '1-0': '#f59e0b', // mid/low - amber
    '2-0': '#84cc16', // high/low - lime
    '0-1': '#f59e0b', // low/mid - amber
    '1-1': '#eab308', // mid/mid - yellow
    '2-1': '#22c55e', // high/mid - green
    '0-2': '#84cc16', // low/high - lime
    '1-2': '#22c55e', // mid/high - green
    '2-2': '#059669', // high/high - emerald
  };

  return colors[`${col}-${row}`] ?? '#6b7280';
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: MemberPoint }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload as MemberPoint;

  return (
    <div className="bg-popover text-popover-foreground border rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold mb-1">{data.name}</p>
      <p>Entrega (D1+D3)/2: <span className="font-medium">{data.x.toFixed(1)}</span></p>
      <p>Potencial (D2+D5)/2: <span className="font-medium">{data.y.toFixed(1)}</span></p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom Scatter Label
// ---------------------------------------------------------------------------

function renderCustomLabel(props: { cx: number; cy: number; payload?: MemberPoint }) {
  const { cx, cy, payload } = props;
  if (!payload) return null;

  return (
    <text
      x={cx}
      y={cy - 12}
      textAnchor="middle"
      fontSize={9}
      fontWeight={600}
      fill="currentColor"
      className="text-foreground"
    >
      {payload.initials}
    </text>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NineBoxChart({ members }: NineBoxChartProps) {
  const points: MemberPoint[] = useMemo(() => {
    return members
      .filter((m) => m.gaugeStatus === 'mapped' && m.gaugeScores)
      .map((m) => {
        const s = m.gaugeScores!;
        return {
          id: m.id,
          name: m.name,
          initials: getInitials(m.name),
          x: (s.D1 + s.D3) / 2,
          y: (s.D2 + s.D5) / 2,
        };
      });
  }, [members]);

  if (points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nine-Box Comportamental</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum membro mapeado para exibir o grafico Nine-Box.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Nine-Box Comportamental</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Posicionamento dos colaboradores por Entrega vs Potencial Relacional
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Alto/Alto
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
              Medio
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
              Baixo/Baixo
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
            {/* Background zones */}
            <ReferenceArea x1={0} x2={33} y1={0} y2={33} fill="#ef4444" fillOpacity={0.08} />
            <ReferenceArea x1={33} x2={67} y1={0} y2={33} fill="#f59e0b" fillOpacity={0.06} />
            <ReferenceArea x1={67} x2={100} y1={0} y2={33} fill="#84cc16" fillOpacity={0.06} />
            <ReferenceArea x1={0} x2={33} y1={33} y2={67} fill="#f59e0b" fillOpacity={0.06} />
            <ReferenceArea x1={33} x2={67} y1={33} y2={67} fill="#eab308" fillOpacity={0.06} />
            <ReferenceArea x1={67} x2={100} y1={33} y2={67} fill="#22c55e" fillOpacity={0.06} />
            <ReferenceArea x1={0} x2={33} y1={67} y2={100} fill="#84cc16" fillOpacity={0.06} />
            <ReferenceArea x1={33} x2={67} y1={67} y2={100} fill="#22c55e" fillOpacity={0.06} />
            <ReferenceArea x1={67} x2={100} y1={67} y2={100} fill="#059669" fillOpacity={0.1} />

            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              tickLine={false}
            >
              <Label
                value="Entrega (D1+D3)/2"
                position="bottom"
                offset={10}
                style={{ fontSize: 11, fill: 'var(--muted-foreground, #6b7280)' }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              tickLine={false}
            >
              <Label
                value="Potencial Relacional (D2+D5)/2"
                angle={-90}
                position="left"
                offset={0}
                style={{ fontSize: 11, fill: 'var(--muted-foreground, #6b7280)' }}
              />
            </YAxis>

            <ReferenceLine x={33} stroke="#d1d5db" strokeDasharray="4 4" />
            <ReferenceLine x={67} stroke="#d1d5db" strokeDasharray="4 4" />
            <ReferenceLine y={33} stroke="#d1d5db" strokeDasharray="4 4" />
            <ReferenceLine y={67} stroke="#d1d5db" strokeDasharray="4 4" />

            <Tooltip content={<CustomTooltip />} />

            <Scatter
              data={points}
              label={renderCustomLabel}
            >
              {points.map((point) => (
                <Cell
                  key={point.id}
                  fill={getZoneColor(point.x, point.y)}
                  stroke={getZoneColor(point.x, point.y)}
                  strokeWidth={2}
                  r={6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
