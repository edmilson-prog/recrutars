/**
 * GapRecommendation
 * PRD-056: Recommended ideal profile for the next hire based on gap analysis.
 */

import { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserPlus, Target } from 'lucide-react';
import {
  DIMENSION_SHORT_NAMES,
  type GaugeProDimension,
  type DimensionScores,
} from '@/types/gaugePro';

interface GapRecommendationProps {
  idealProfile: DimensionScores;
  recommendedArchetype: string;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

const DIMENSION_BAR_COLORS: Record<GaugeProDimension, string> = {
  D1: 'bg-red-500',
  D2: 'bg-amber-500',
  D3: 'bg-green-500',
  D4: 'bg-blue-500',
  D5: 'bg-purple-500',
};

export default function GapRecommendation({
  idealProfile,
  recommendedArchetype,
}: GapRecommendationProps) {
  const { toast } = useToast();

  const radarData = useMemo(
    () =>
      DIMENSIONS.map((dim) => ({
        dimension: DIMENSION_SHORT_NAMES[dim],
        score: idealProfile[dim],
      })),
    [idealProfile],
  );

  const handleCreateTest = () => {
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description:
        'Em breve sera possivel criar testes com base no perfil ideal identificado pela analise de gaps.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Perfil Ideal para Proxima Contratacao
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Small radar chart */}
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Perfil Ideal"
              dataKey="score"
              stroke="#0891b2"
              fill="#0891b2"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Dimension bars */}
        <div className="space-y-2">
          {DIMENSIONS.map((dim) => {
            const score = idealProfile[dim];
            return (
              <div key={dim} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-[60px] text-left truncate">
                  {DIMENSION_SHORT_NAMES[dim]}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      DIMENSION_BAR_COLORS[dim],
                    )}
                    style={{ width: `${Math.max(score, 3)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                  {Math.round(score)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Recommended archetype */}
        <div className="flex items-center justify-center">
          <Badge
            variant="outline"
            className="text-xs px-3 py-1 border-primary/30 text-primary bg-primary/5"
          >
            {recommendedArchetype}
          </Badge>
        </div>

        {/* CTA button */}
        <Button
          className="w-full"
          variant="outline"
          onClick={handleCreateTest}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Criar Teste com Base no Gap
        </Button>
      </CardContent>
    </Card>
  );
}
