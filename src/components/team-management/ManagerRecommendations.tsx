import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Users,
  CheckCircle2,
  RefreshCw,
  Building2,
  TrendingUp,
  TrendingDown,
  Heart,
  AlertTriangle,
  Puzzle,
  Sparkles,
  CheckCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { calculateTeamAverage } from "@/utils/gapAnalysis";
import { DIMENSION_SHORT_NAMES } from "@/types/gaugePro";
import type { GaugeProDimension } from "@/types/gaugePro";
import type { TeamMember, Department, TeamAlert } from "@/types/teamManagement";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RecommendationPriority = "positive" | "attention" | "informational";

interface ManagerRecommendation {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  priority: RecommendationPriority;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const IDEAL_ZONE_MIN = 40;
const IDEAL_ZONE_MAX = 75;
const DIMENSIONS: GaugeProDimension[] = ["D1", "D2", "D3", "D4", "D5"];

const priorityConfig: Record<
  RecommendationPriority,
  {
    badgeLabel: string;
    badgeClassName: string;
    iconBgColor: string;
    iconColor: string;
  }
> = {
  positive: {
    badgeLabel: "Positivo",
    badgeClassName:
      "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  attention: {
    badgeLabel: "Atenção",
    badgeClassName:
      "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
    iconBgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  informational: {
    badgeLabel: "Dica",
    badgeClassName:
      "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
};

const DIMENSION_RECOMMENDATIONS: Record<
  GaugeProDimension,
  {
    highTitle: string;
    highDesc: (avg: number) => string;
    lowTitle: string;
    lowDesc: (avg: number) => string;
  }
> = {
  D1: {
    highTitle: "Equilibre liderança com colaboração",
    highDesc: (avg) =>
      `A equipe apresenta alta ${DIMENSION_SHORT_NAMES.D1} média (${avg}). Considere incorporar perfis mais colaborativos para evitar conflitos de autoridade.`,
    lowTitle: "Estimule maior assertividade na equipe",
    lowDesc: (avg) =>
      `A média de ${DIMENSION_SHORT_NAMES.D1} está baixa (${avg}). Invista em treinamentos de protagonismo e tomada de decisão.`,
  },
  D2: {
    highTitle: "Equilibre sociabilidade com foco",
    highDesc: (avg) =>
      `Alta ${DIMENSION_SHORT_NAMES.D2} média (${avg}) pode dispersar o foco. Considere processos mais estruturados para canalizar a energia social.`,
    lowTitle: "Estimule a comunicação na equipe",
    lowDesc: (avg) =>
      `${DIMENSION_SHORT_NAMES.D2} média baixa (${avg}). Promova atividades de integração e comunicação para melhorar a dinâmica.`,
  },
  D3: {
    highTitle: "Adicione dinamismo à equipe",
    highDesc: (avg) =>
      `${DIMENSION_SHORT_NAMES.D3} médio elevado (${avg}). A equipe pode estar muito cautelosa. Considere perfis mais ágeis para acelerar entregas.`,
    lowTitle: "Melhore a consistência de entregas",
    lowDesc: (avg) =>
      `${DIMENSION_SHORT_NAMES.D3} médio baixo (${avg}). Estruture cadências de entrega e acompanhe prazos para melhorar a previsibilidade.`,
  },
  D4: {
    highTitle: "Flexibilize processos quando possível",
    highDesc: (avg) =>
      `${DIMENSION_SHORT_NAMES.D4} média elevada (${avg}). Excesso de rigidez pode inibir inovação. Equilibre com perfis mais criativos.`,
    lowTitle: "Estruture processos e padrões",
    lowDesc: (avg) =>
      `${DIMENSION_SHORT_NAMES.D4} média baixa (${avg}). Implemente frameworks e checklists para melhorar a organização e qualidade.`,
  },
  D5: {
    highTitle: "Equilibre empatia com objetividade",
    highDesc: (avg) =>
      `${DIMENSION_SHORT_NAMES.D5} média alta (${avg}). A equipe pode evitar confrontos necessários. Estimule feedback direto.`,
    lowTitle: "Fortaleça os laços da equipe",
    lowDesc: (avg) =>
      `${DIMENSION_SHORT_NAMES.D5} média baixa (${avg}). Invista em programas de inteligência emocional e team building.`,
  },
};

// ---------------------------------------------------------------------------
// Hook: generate recommendations
// ---------------------------------------------------------------------------

function useRecommendations(
  members: TeamMember[],
  _departments: Department[],
  alerts: TeamAlert[]
): ManagerRecommendation[] {
  return useMemo(() => {
    const recs: ManagerRecommendation[] = [];

    const activeMembers = members.filter((m) => m.isActive);
    const totalActive = activeMembers.length;
    const mappedMembers = activeMembers.filter(
      (m) => m.gaugeStatus === "mapped"
    );
    const mappedCount = mappedMembers.length;
    const mappingRate = totalActive > 0 ? mappedCount / totalActive : 0;
    const mappingPct = Math.round(mappingRate * 100);

    // Rule 1: Mapping coverage
    if (mappingRate < 0.5) {
      recs.push({
        id: "rec-mapping",
        icon: Users,
        title: "Complete o mapeamento da equipe",
        description: `Apenas ${mappingPct}% da equipe possui perfil comportamental mapeado. Um mapeamento acima de 70% é essencial para análises confiáveis de compatibilidade e cultura.`,
        priority: "attention",
        sortOrder: 10,
      });
    } else if (mappingRate < 0.7) {
      recs.push({
        id: "rec-mapping",
        icon: Users,
        title: "Amplie a cobertura do mapeamento",
        description: `${mappingPct}% da equipe está mapeada. Alcance 70% para desbloquear insights mais robustos de compatibilidade e gap analysis.`,
        priority: "informational",
        sortOrder: 10,
      });
    } else {
      recs.push({
        id: "rec-mapping",
        icon: CheckCircle2,
        title: "Boa cobertura de mapeamento",
        description: `${mappingPct}% da equipe está mapeada. Continue acompanhando novos colaboradores para manter a cobertura.`,
        priority: "positive",
        sortOrder: 10,
      });
    }

    // Rule 2: Archetype diversity
    const archetypeCounts: Record<string, number> = {};
    mappedMembers.forEach((m) => {
      if (m.archetype) {
        archetypeCounts[m.archetype] =
          (archetypeCounts[m.archetype] || 0) + 1;
      }
    });
    const totalMapped = mappedCount;
    const archetypeEntries = Object.entries(archetypeCounts);
    const uniqueArchetypes = archetypeEntries.length;

    if (totalMapped > 0) {
      const [dominantArchetype, maxCount] = archetypeEntries.sort(
        ([, a], [, b]) => b - a
      )[0] ?? ["", 0];
      const dominantRatio = maxCount / totalMapped;

      if (dominantRatio > 0.4) {
        recs.push({
          id: "rec-diversity",
          icon: Puzzle,
          title: "Diversifique perfis comportamentais",
          description: `O arquétipo "${dominantArchetype}" representa ${Math.round(dominantRatio * 100)}% da equipe mapeada. Busque perfis complementares para equilibrar a dinâmica do time.`,
          priority: "attention",
          sortOrder: 20,
        });
      } else if (uniqueArchetypes >= 4) {
        recs.push({
          id: "rec-diversity",
          icon: Sparkles,
          title: "Boa diversidade de arquétipos",
          description: `A equipe possui ${uniqueArchetypes} arquétipos diferentes, indicando diversidade comportamental saudável.`,
          priority: "positive",
          sortOrder: 25,
        });
      }
    }

    // Rule 3: Dimension imbalance
    if (mappedCount >= 3) {
      const scores = mappedMembers
        .filter((m) => m.gaugeScores)
        .map((m) => m.gaugeScores!);

      if (scores.length > 0) {
        const teamAvg = calculateTeamAverage(scores);

        let worstDim: GaugeProDimension | null = null;
        let worstDeviation = 0;
        let isExcess = false;

        for (const dim of DIMENSIONS) {
          const avg = teamAvg[dim];
          if (avg > IDEAL_ZONE_MAX) {
            const dev = avg - IDEAL_ZONE_MAX;
            if (dev > worstDeviation) {
              worstDeviation = dev;
              worstDim = dim;
              isExcess = true;
            }
          } else if (avg < IDEAL_ZONE_MIN) {
            const dev = IDEAL_ZONE_MIN - avg;
            if (dev > worstDeviation) {
              worstDeviation = dev;
              worstDim = dim;
              isExcess = false;
            }
          }
        }

        if (worstDim) {
          const config = DIMENSION_RECOMMENDATIONS[worstDim];
          const roundedAvg = Math.round(teamAvg[worstDim]);

          recs.push({
            id: "rec-dimension",
            icon: isExcess ? TrendingUp : TrendingDown,
            title: isExcess ? config.highTitle : config.lowTitle,
            description: isExcess
              ? config.highDesc(roundedAvg)
              : config.lowDesc(roundedAvg),
            priority: worstDeviation > 15 ? "attention" : "informational",
            sortOrder: 30,
          });
        }
      }
    }

    // Rule 4: Old / retest tests
    const oldTestAlerts = alerts.filter((a) => a.type === "old_test");
    const retestAlerts = alerts.filter((a) => a.type === "retest_due");
    const outdatedTotal = oldTestAlerts.length + retestAlerts.length;

    if (outdatedTotal > 0) {
      recs.push({
        id: "rec-outdated",
        icon: RefreshCw,
        title: "Atualize mapeamentos desatualizados",
        description: `${outdatedTotal} colaborador${outdatedTotal > 1 ? "es" : ""} possui${outdatedTotal > 1 ? "em" : ""} testes com mais de 12 meses ou retestes pendentes. Mapeamentos atualizados garantem análises mais precisas.`,
        priority: outdatedTotal >= 3 ? "attention" : "informational",
        sortOrder: 40,
      });
    }

    // Rule 5: Unmapped departments
    const deptUnmappedAlerts = alerts.filter(
      (a) => a.type === "dept_unmapped"
    );

    if (deptUnmappedAlerts.length > 0) {
      recs.push({
        id: "rec-depts",
        icon: Building2,
        title: "Mapeie departamentos descobertos",
        description: `${deptUnmappedAlerts.length} departamento${deptUnmappedAlerts.length > 1 ? "s" : ""} possui${deptUnmappedAlerts.length > 1 ? "em" : ""} menos de 50% dos colaboradores mapeados. Priorize esses departamentos para uma visão completa.`,
        priority: "attention",
        sortOrder: 50,
      });
    }

    // Rule 6: Overall health (always)
    const alertCount = alerts.length;

    if (mappingRate >= 0.8 && alertCount <= 2) {
      recs.push({
        id: "rec-health",
        icon: Heart,
        title: "Equipe em ótimo estado",
        description:
          "A equipe está bem mapeada e com poucos alertas. Continue monitorando a evolução dos perfis periodicamente.",
        priority: "positive",
        sortOrder: 60,
      });
    } else if (mappingRate >= 0.6 && alertCount <= 5) {
      recs.push({
        id: "rec-health",
        icon: Lightbulb,
        title: "Equipe em bom caminho",
        description:
          "A equipe está progredindo. Resolva os alertas pendentes para otimizar a gestão comportamental.",
        priority: "informational",
        sortOrder: 60,
      });
    } else {
      recs.push({
        id: "rec-health",
        icon: AlertTriangle,
        title: "Ação necessária para a equipe",
        description: `Existem ${alertCount} alertas ativos e a cobertura de mapeamento pode melhorar. Priorize as recomendações acima.`,
        priority: "attention",
        sortOrder: 60,
      });
    }

    return recs.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [members, _departments, alerts]);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ManagerRecommendationsProps {
  members: TeamMember[];
  departments: Department[];
  alerts: TeamAlert[];
}

export function ManagerRecommendations({
  members,
  departments,
  alerts,
}: ManagerRecommendationsProps) {
  const recommendations = useRecommendations(members, departments, alerts);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recomendações para Gestores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
            <p className="text-sm font-medium">
              Nenhuma recomendação pendente
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {recommendations.map((rec) => {
              const config = priorityConfig[rec.priority];
              const Icon = rec.icon;

              return (
                <motion.div
                  key={rec.id}
                  variants={staggerItem}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      config.iconBgColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium leading-snug">
                          {rec.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {rec.description}
                        </p>
                      </div>
                      <Badge
                        className={cn("shrink-0", config.badgeClassName)}
                      >
                        {config.badgeLabel}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
