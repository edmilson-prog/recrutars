/**
 * DISC Radar Chart Component
 * PRD-002-dgn: Visualização DISC e Match Score
 *
 * Radar chart interativo com 4 eixos (D, I, S, C)
 * Suporta overlay de perfil ideal para comparação
 */

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import type { DISCProfile } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// Cores DISC conforme PRD
const DISC_COLORS = {
  d: "#EF4444", // Vermelho - Dominância
  i: "#F59E0B", // Amarelo - Influência
  s: "#22C55E", // Verde - Estabilidade
  c: "#3B82F6", // Azul - Conformidade
};

const DISC_LABELS = {
  d: { short: "D", full: "Dominância", description: "Assertividade e orientação a resultados" },
  i: { short: "I", full: "Influência", description: "Sociabilidade e persuasão" },
  s: { short: "S", full: "Estabilidade", description: "Paciência e cooperação" },
  c: { short: "C", full: "Conformidade", description: "Precisão e análise" },
};

interface DISCRadarChartProps {
  profile: DISCProfile;
  idealProfile?: DISCProfile;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showGrid?: boolean;
  className?: string;
}

interface ChartDataPoint {
  dimension: string;
  fullName: string;
  description: string;
  value: number;
  ideal?: number;
  color: string;
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint; dataKey: string; value: number }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-foreground flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        {data.fullName} ({data.dimension})
      </p>
      <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
      <div className="mt-2 space-y-1">
        <p className="text-sm">
          <span className="text-muted-foreground">Seu valor:</span>{" "}
          <span className="font-medium text-foreground">{data.value}</span>
        </p>
        {data.ideal !== undefined && (
          <p className="text-sm">
            <span className="text-muted-foreground">Ideal da vaga:</span>{" "}
            <span className="font-medium text-foreground">{data.ideal}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function DISCRadarChart({
  profile,
  idealProfile,
  size = "md",
  showLabels = true,
  showGrid = true,
  className,
}: DISCRadarChartProps) {
  const prefersReducedMotion = useReducedMotion();

  // Transformar dados para formato do Recharts
  const chartData: ChartDataPoint[] = [
    {
      dimension: "D",
      fullName: DISC_LABELS.d.full,
      description: DISC_LABELS.d.description,
      value: profile.d,
      ideal: idealProfile?.d,
      color: DISC_COLORS.d,
    },
    {
      dimension: "I",
      fullName: DISC_LABELS.i.full,
      description: DISC_LABELS.i.description,
      value: profile.i,
      ideal: idealProfile?.i,
      color: DISC_COLORS.i,
    },
    {
      dimension: "S",
      fullName: DISC_LABELS.s.full,
      description: DISC_LABELS.s.description,
      value: profile.s,
      ideal: idealProfile?.s,
      color: DISC_COLORS.s,
    },
    {
      dimension: "C",
      fullName: DISC_LABELS.c.full,
      description: DISC_LABELS.c.description,
      value: profile.c,
      ideal: idealProfile?.c,
      color: DISC_COLORS.c,
    },
  ];

  // Tamanhos responsivos
  const sizeConfig = {
    sm: { height: 200, outerRadius: "70%" },
    md: { height: 300, outerRadius: "75%" },
    lg: { height: 400, outerRadius: "80%" },
  };

  const { height, outerRadius } = sizeConfig[size];

  // Aria label descritivo
  const ariaLabel = `Perfil DISC: Dominância ${profile.d}%, Influência ${profile.i}%, Estabilidade ${profile.s}%, Conformidade ${profile.c}%${
    idealProfile
      ? `. Perfil ideal: D ${idealProfile.d}%, I ${idealProfile.i}%, S ${idealProfile.s}%, C ${idealProfile.c}%`
      : ""
  }`;

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData} outerRadius={outerRadius}>
          {showGrid && (
            <PolarGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
          )}
          <PolarAngleAxis
            dataKey="dimension"
            tick={showLabels ? {
              fill: "hsl(var(--foreground))",
              fontSize: size === "sm" ? 12 : 14,
              fontWeight: 600,
            } : false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={showLabels ? {
              fill: "hsl(var(--muted-foreground))",
              fontSize: 10,
            } : false}
            axisLine={false}
          />

          {/* Perfil ideal (se fornecido) - renderizado primeiro para ficar atrás */}
          {idealProfile && (
            <Radar
              name="Perfil Ideal"
              dataKey="ideal"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted))"
              fillOpacity={0.2}
              strokeWidth={2}
              strokeDasharray="5 5"
              isAnimationActive={!prefersReducedMotion}
              animationDuration={500}
            />
          )}

          {/* Perfil do candidato */}
          <Radar
            name="Seu Perfil"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={500}
          />

          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Versão compacta para cards e listas
export function DISCRadarChartMini({
  profile,
  className,
}: {
  profile: DISCProfile;
  className?: string;
}) {
  return (
    <DISCRadarChart
      profile={profile}
      size="sm"
      showLabels={true}
      showGrid={true}
      className={className}
    />
  );
}

export { DISC_COLORS, DISC_LABELS };
