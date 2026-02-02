/**
 * Match Comparison Component
 * PRD-002-dgn: Visualização Comportamental e Match Score
 *
 * Comparação visual do perfil do candidato vs perfil ideal da vaga
 * Mostra radar chart com overlay e destaque de gaps
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BehavioralProfile, MatchResult } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DISCRadarChart } from "../disc/DISCRadarChart";
import { DISCLegendCompact } from "../disc/DISCLegend";
import { MatchScoreCircle } from "./MatchScoreCircle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, User, AlertCircle } from "lucide-react";

interface MatchComparisonProps {
  candidateProfile: BehavioralProfile;
  idealProfile?: BehavioralProfile;
  matchScore?: number;
  title?: string;
  showLegend?: boolean;
  showGaps?: boolean;
  className?: string;
}

export function MatchComparison({
  candidateProfile,
  idealProfile,
  matchScore,
  title = "Comparação de Perfis",
  showLegend = true,
  showGaps = true,
  className,
}: MatchComparisonProps) {
  const prefersReducedMotion = useReducedMotion();

  // Calcular gaps entre perfis
  const gaps = idealProfile
    ? {
        d: Math.abs(candidateProfile.d - idealProfile.d),
        i: Math.abs(candidateProfile.i - idealProfile.i),
        s: Math.abs(candidateProfile.s - idealProfile.s),
        c: Math.abs(candidateProfile.c - idealProfile.c),
      }
    : null;

  // Identificar maiores gaps
  const significantGaps =
    gaps &&
    Object.entries(gaps)
      .filter(([, value]) => value > 15)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {matchScore !== undefined && (
            <MatchScoreCircle
              score={matchScore}
              size="sm"
              showLabel={false}
              animated={!prefersReducedMotion}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Radar chart com overlay */}
        <div className="relative">
          <DISCRadarChart
            profile={candidateProfile}
            idealProfile={idealProfile}
            size="md"
            showLabels
            showGrid
          />

          {/* Legenda de perfis */}
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-0.5 bg-primary rounded-full" />
              <span className="text-muted-foreground">Seu perfil</span>
            </div>
            {idealProfile && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-muted-foreground" />
                <span className="text-muted-foreground">Perfil ideal</span>
              </div>
            )}
          </div>
        </div>

        {/* Legenda Comportamental */}
        {showLegend && (
          <div className="pt-2 border-t">
            <DISCLegendCompact profile={candidateProfile} />
          </div>
        )}

        {/* Gaps significativos */}
        {showGaps && significantGaps && significantGaps.length > 0 && (
          <motion.div
            className="pt-3 border-t space-y-2"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Principais diferenças
            </h4>
            <div className="space-y-1.5">
              {significantGaps.map(([dimension, gap]) => {
                const dimName = {
                  d: "Dominância",
                  i: "Influência",
                  s: "Estabilidade",
                  c: "Conformidade",
                }[dimension as keyof typeof gaps];

                const candidateValue =
                  candidateProfile[dimension as keyof BehavioralProfile];
                const idealValue =
                  idealProfile![dimension as keyof BehavioralProfile];
                const isHigher = candidateValue > idealValue;

                return (
                  <div
                    key={dimension}
                    className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                  >
                    <Badge
                      variant="outline"
                      className="uppercase w-6 justify-center"
                    >
                      {dimension}
                    </Badge>
                    <span className="text-muted-foreground">{dimName}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {isHigher ? `${gap} pontos acima` : `${gap} pontos abaixo`}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Estado quando não há perfil ideal */}
        {!idealProfile && (
          <div className="text-center py-4 text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Esta vaga não possui perfil comportamental ideal definido.
            </p>
            <p className="text-xs mt-1">
              Apenas o seu perfil está sendo exibido.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Comparação lado a lado simples (dois cards)
interface MatchComparisonSideBySideProps {
  candidateProfile: BehavioralProfile;
  idealProfile: BehavioralProfile;
  candidateName?: string;
  className?: string;
}

export function MatchComparisonSideBySide({
  candidateProfile,
  idealProfile,
  candidateName = "Você",
  className,
}: MatchComparisonSideBySideProps) {
  const dimensions = ["d", "i", "s", "c"] as const;
  const dimLabels = {
    d: "Dominância",
    i: "Influência",
    s: "Estabilidade",
    c: "Conformidade",
  };
  const dimColors = {
    d: "text-red-600",
    i: "text-yellow-600",
    s: "text-green-600",
    c: "text-blue-600",
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 font-medium">Dimensão</th>
            <th className="text-center py-2 px-3 font-medium">
              <div className="flex items-center justify-center gap-1">
                <User className="w-4 h-4" />
                {candidateName}
              </div>
            </th>
            <th className="text-center py-2 px-3 font-medium">
              <div className="flex items-center justify-center gap-1">
                <Target className="w-4 h-4" />
                Ideal
              </div>
            </th>
            <th className="text-center py-2 px-3 font-medium">Gap</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim) => {
            const candidateValue = candidateProfile[dim];
            const idealValue = idealProfile[dim];
            const gap = Math.abs(candidateValue - idealValue);
            const isMatch = gap <= 10;

            return (
              <tr key={dim} className="border-b last:border-0">
                <td className="py-2 px-3">
                  <span className={cn("font-medium", dimColors[dim])}>
                    {dim.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {dimLabels[dim]}
                  </span>
                </td>
                <td className="text-center py-2 px-3 font-medium">
                  {candidateValue}
                </td>
                <td className="text-center py-2 px-3 text-muted-foreground">
                  {idealValue}
                </td>
                <td className="text-center py-2 px-3">
                  <Badge
                    variant={isMatch ? "secondary" : "outline"}
                    className={cn(
                      "font-mono",
                      isMatch
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : gap > 20
                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        : ""
                    )}
                  >
                    {gap === 0 ? "=" : `${candidateValue > idealValue ? "+" : "-"}${gap}`}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Card de match completo com todas as informações
export function MatchCard({
  matchResult,
  showComparison = true,
  className,
}: {
  matchResult: MatchResult;
  showComparison?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Score e breakdown */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <MatchScoreCircle
              score={matchResult.totalScore}
              size="lg"
              label="Match Total"
            />
            <div className="flex-1 space-y-3">
              {matchResult.categories.slice(0, 3).map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className="font-medium">{cat.score}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        cat.score >= 80
                          ? "bg-green-500"
                          : cat.score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      )}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação visual */}
      {showComparison && matchResult.idealProfile && (
        <MatchComparison
          candidateProfile={matchResult.candidateProfile}
          idealProfile={matchResult.idealProfile}
          matchScore={matchResult.totalScore}
        />
      )}
    </div>
  );
}
