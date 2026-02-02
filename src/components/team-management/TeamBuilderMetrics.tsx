/**
 * TeamBuilderMetrics
 * PRD-056: Side panel showing metrics for all teams in the Team Builder.
 */

import { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { GaugeProDimension } from '@/types/gaugePro';
import type { TeamMember } from '@/types/teamManagement';
import {
  calculateTeamMetrics,
  getBalanceColor,
  getBalanceLabel,
  type TeamMetrics,
} from '@/utils/teamBalance';

interface TeamBuilderMetricsProps {
  teams: Array<{ id: string; name: string; memberIds: string[] }>;
  allMembers: TeamMember[];
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const TEAM_COLORS = [
  '#0891b2', // cyan
  '#7c3aed', // violet
  '#ea580c', // orange
  '#16a34a', // green
  '#dc2626', // red
  '#ca8a04', // yellow
];

interface TeamWithMetrics {
  team: { id: string; name: string; memberIds: string[] };
  metrics: TeamMetrics | null;
  membersWithScores: TeamMember[];
}

export default function TeamBuilderMetrics({
  teams,
  allMembers,
}: TeamBuilderMetricsProps) {
  const memberMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    allMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, [allMembers]);

  const teamsWithMetrics: TeamWithMetrics[] = useMemo(() => {
    return teams.map((team) => {
      const members = team.memberIds
        .map((id) => memberMap.get(id))
        .filter((m): m is TeamMember => !!m && !!m.gaugeScores);

      const metrics =
        members.length > 0
          ? calculateTeamMetrics(members.map((m) => m.gaugeScores!))
          : null;

      return { team, metrics, membersWithScores: members };
    });
  }, [teams, memberMap]);

  // Find best balanced team
  const bestTeam = useMemo(() => {
    let best: TeamWithMetrics | null = null;
    for (const t of teamsWithMetrics) {
      if (!t.metrics) continue;
      if (!best || !best.metrics || t.metrics.balanceScore > best.metrics.balanceScore) {
        best = t;
      }
    }
    return best;
  }, [teamsWithMetrics]);

  // Build radar comparison data for overlay chart (when 2+ teams have metrics)
  const teamsForComparison = useMemo(
    () => teamsWithMetrics.filter((t) => t.metrics !== null),
    [teamsWithMetrics],
  );

  const comparisonRadarData = useMemo(() => {
    if (teamsForComparison.length < 2) return [];
    return DIMENSIONS.map((dim) => {
      const point: Record<string, string | number> = {
        dimension: DIMENSION_SHORT_NAMES[dim],
      };
      teamsForComparison.forEach((t) => {
        if (t.metrics) {
          point[t.team.name] = Math.round(t.metrics.averages[dim]);
        }
      });
      return point;
    });
  }, [teamsForComparison]);

  const hasAnyMetrics = teamsWithMetrics.some((t) => t.metrics !== null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Metricas dos Times
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {!hasAnyMetrics ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Adicione membros aos times para visualizar metricas.
          </p>
        ) : (
          <>
            {/* Per-team metrics */}
            <div className="space-y-3">
              {teamsWithMetrics.map((t, idx) => {
                if (!t.metrics) return null;
                const color = getBalanceColor(t.metrics.balanceScore);
                const label = getBalanceLabel(t.metrics.balanceScore);
                const isBest = bestTeam?.team.id === t.team.id && teamsForComparison.length >= 2;

                return (
                  <div
                    key={t.team.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isBest && (
                          <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold truncate">
                          {t.team.name}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] shrink-0"
                        style={{
                          borderColor: color,
                          color: color,
                          backgroundColor: `${color}15`,
                        }}
                      >
                        {Math.round(t.metrics.balanceScore)}% {label}
                      </Badge>
                    </div>

                    {/* Strongest / Weakest */}
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          {DIMENSION_SHORT_NAMES[t.metrics.strongestDimension]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-red-500">
                        <TrendingDown className="h-3 w-3" />
                        <span>
                          {DIMENSION_SHORT_NAMES[t.metrics.weakestDimension]}
                        </span>
                      </div>
                      <span className="text-muted-foreground ml-auto">
                        {t.membersWithScores.length} membro(s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall comparison: best balanced */}
            {bestTeam && teamsForComparison.length >= 2 && (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">Melhor Equilibrado</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  <strong>{bestTeam.team.name}</strong> possui o melhor balanco
                  com {Math.round(bestTeam.metrics!.balanceScore)}% de equilibrio.
                </p>
              </div>
            )}

            {/* Overlaid radar comparison chart */}
            {comparisonRadarData.length > 0 && (
              <div className="pt-2 border-t">
                <h4 className="text-xs font-semibold mb-2">Comparativo</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={comparisonRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`${Math.round(value)}`, '']}
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    />
                    {teamsForComparison.map((t, idx) => (
                      <Radar
                        key={t.team.id}
                        name={t.team.name}
                        dataKey={t.team.name}
                        stroke={TEAM_COLORS[idx % TEAM_COLORS.length]}
                        fill={TEAM_COLORS[idx % TEAM_COLORS.length]}
                        fillOpacity={0.1}
                        strokeWidth={1.5}
                        strokeDasharray={idx > 0 ? '4 4' : undefined}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
