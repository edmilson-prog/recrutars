/**
 * Match Breakdown Component
 * PRD-002-dgn: Visualização DISC e Match Score
 *
 * Exibe o breakdown completo do match score por categorias
 * Inclui score total, categorias com pesos, e visualização detalhada
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MatchCategory } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MatchScoreCircle } from "./MatchScoreCircle";
import { MatchProgressStack } from "./MatchProgressBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Configuração padrão das categorias de match (pesos somam 100%)
export const DEFAULT_MATCH_CATEGORIES = [
  {
    id: "skills",
    name: "Skills Técnicas",
    weight: 40,
    description: "Correspondência entre suas habilidades técnicas e os requisitos da vaga",
  },
  {
    id: "experience",
    name: "Experiência",
    weight: 30,
    description: "Tempo de experiência e senioridade compatíveis com a posição",
  },
  {
    id: "behavioral",
    name: "Perfil Comportamental",
    weight: 20,
    description: "Alinhamento do seu perfil DISC com o perfil ideal da posição",
  },
  {
    id: "location",
    name: "Localização",
    weight: 10,
    description: "Compatibilidade entre sua localização e o modelo de trabalho da vaga",
  },
];

interface MatchBreakdownProps {
  totalScore: number;
  categories: MatchCategory[];
  title?: string;
  showTotal?: boolean;
  layout?: "vertical" | "horizontal";
  animated?: boolean;
  className?: string;
}

export function MatchBreakdown({
  totalScore,
  categories,
  title = "Compatibilidade",
  showTotal = true,
  layout = "vertical",
  animated = true,
  className,
}: MatchBreakdownProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  // Preparar dados para o stack de progresso
  const progressData = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    score: cat.score,
    weight: cat.weight,
    description: cat.description,
  }));

  if (layout === "horizontal") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-8">
            {/* Score total */}
            {showTotal && (
              <motion.div
                className="flex flex-col items-center shrink-0"
                initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : {}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MatchScoreCircle
                  score={totalScore}
                  size="lg"
                  label="Match Total"
                  animated={animated}
                />
              </motion.div>
            )}

            {/* Breakdown por categorias */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-4">{title}</h3>
              <MatchProgressStack
                categories={progressData}
                animated={animated}
                showWeights
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Layout vertical (padrão)
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score total centralizado */}
        {showTotal && (
          <motion.div
            className="flex justify-center"
            initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MatchScoreCircle
              score={totalScore}
              size="xl"
              label="Match Total"
              animated={animated}
            />
          </motion.div>
        )}

        {/* Breakdown por categorias */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Breakdown por Categoria
          </h4>
          <MatchProgressStack
            categories={progressData}
            animated={animated}
            showWeights
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Versão compacta para cards de vagas
interface MatchBreakdownCompactProps {
  totalScore: number;
  categories: MatchCategory[];
  className?: string;
}

export function MatchBreakdownCompact({
  totalScore,
  categories,
  className,
}: MatchBreakdownCompactProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <MatchScoreCircle
        score={totalScore}
        size="sm"
        showLabel={false}
        animated={false}
      />
      <div className="flex-1 space-y-2">
        {categories.slice(0, 2).map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 truncate">
              {cat.name}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
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
            <span className="font-medium w-8 text-right">{cat.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Resumo textual do match
interface MatchSummaryProps {
  totalScore: number;
  dominantCategory?: MatchCategory;
  weakestCategory?: MatchCategory;
  className?: string;
}

export function MatchSummary({
  totalScore,
  dominantCategory,
  weakestCategory,
  className,
}: MatchSummaryProps) {
  const level =
    totalScore >= 80
      ? "excelente"
      : totalScore >= 60
      ? "boa"
      : "baixa";

  const levelColor =
    totalScore >= 80
      ? "text-green-600"
      : totalScore >= 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className={cn("text-sm", className)}>
      <p>
        Você tem uma compatibilidade{" "}
        <span className={cn("font-semibold", levelColor)}>{level}</span> com
        esta vaga ({totalScore}%).
      </p>
      {dominantCategory && (
        <p className="mt-1 text-muted-foreground">
          Destaque em{" "}
          <span className="font-medium text-foreground">
            {dominantCategory.name}
          </span>{" "}
          ({dominantCategory.score}%).
        </p>
      )}
      {weakestCategory && weakestCategory.score < 70 && (
        <p className="mt-1 text-muted-foreground">
          Oportunidade de melhoria em{" "}
          <span className="font-medium text-foreground">
            {weakestCategory.name}
          </span>{" "}
          ({weakestCategory.score}%).
        </p>
      )}
    </div>
  );
}
