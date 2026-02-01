/**
 * Match Progress Bar Component
 * PRD-002-dgn: Visualização Comportamental e Match Score
 *
 * Barra de progresso para cada categoria do match
 * Com tooltip explicativo e cores semânticas
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getMatchScoreColor } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface MatchProgressBarProps {
  label: string;
  score: number;
  weight: number;
  description?: string;
  showWeight?: boolean;
  showValue?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MatchProgressBar({
  label,
  score,
  weight,
  description,
  showWeight = true,
  showValue = true,
  animated = true,
  size = "md",
  className,
}: MatchProgressBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;
  const colors = getMatchScoreColor(score);

  // Configurações de tamanho
  const sizeConfig = {
    sm: { height: "h-1.5", text: "text-xs", gap: "gap-1" },
    md: { height: "h-2", text: "text-sm", gap: "gap-1.5" },
    lg: { height: "h-3", text: "text-base", gap: "gap-2" },
  };

  const config = sizeConfig[size];

  // Cores de preenchimento baseadas no score
  const fillColors = {
    high: "bg-green-500",
    medium: "bg-yellow-500",
    low: "bg-red-500",
  };

  const level = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

  return (
    <TooltipProvider>
      <div className={cn("w-full", config.gap, className)}>
        {/* Label e valor */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={cn("font-medium text-foreground", config.text)}>
              {label}
            </span>
            {showWeight && (
              <span className="text-xs text-muted-foreground">({weight}%)</span>
            )}
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Peso no cálculo: {weight}%
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {showValue && (
            <span className={cn("font-semibold", config.text, colors.text)}>
              {score}%
            </span>
          )}
        </div>

        {/* Barra de progresso */}
        <div
          className={cn(
            "w-full bg-muted rounded-full overflow-hidden",
            config.height
          )}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${score}%`}
        >
          <motion.div
            className={cn("h-full rounded-full", fillColors[level])}
            initial={shouldAnimate ? { width: 0 } : { width: `${score}%` }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

// Versão simplificada sem labels
export function MatchProgressBarSimple({
  score,
  size = "sm",
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  const fillColors =
    score >= 80
      ? "bg-green-500"
      : score >= 60
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div
      className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeConfig[size],
        className
      )}
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full", fillColors)}
        initial={prefersReducedMotion ? { width: `${score}%` } : { width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

// Grupo de barras de progresso empilhadas
interface MatchProgressStackProps {
  categories: Array<{
    id: string;
    label: string;
    score: number;
    weight: number;
    description?: string;
  }>;
  animated?: boolean;
  showWeights?: boolean;
  className?: string;
}

export function MatchProgressStack({
  categories,
  animated = true,
  showWeights = true,
  className,
}: MatchProgressStackProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("space-y-4", className)}>
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={
            animated && !prefersReducedMotion
              ? { opacity: 0, x: -20 }
              : {}
          }
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <MatchProgressBar
            label={category.label}
            score={category.score}
            weight={category.weight}
            description={category.description}
            showWeight={showWeights}
            animated={animated}
          />
        </motion.div>
      ))}
    </div>
  );
}
