/**
 * Match Score Circle Component
 * PRD-002-dgn: Visualização DISC e Match Score
 *
 * Exibe o score total de compatibilidade em um círculo visual
 * Cores semânticas: ≥80% verde, 60-79% amarelo, <60% vermelho
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getMatchScoreLevel, getMatchScoreColor } from "@/types/disc";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MatchScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export function MatchScoreCircle({
  score,
  size = "md",
  showLabel = true,
  label = "Match Score",
  animated = true,
  className,
}: MatchScoreCircleProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      container: "w-20 h-20",
      strokeWidth: 4,
      radius: 36,
      fontSize: "text-xl",
      labelSize: "text-xs",
    },
    md: {
      container: "w-28 h-28",
      strokeWidth: 5,
      radius: 50,
      fontSize: "text-2xl",
      labelSize: "text-xs",
    },
    lg: {
      container: "w-36 h-36",
      strokeWidth: 6,
      radius: 64,
      fontSize: "text-3xl",
      labelSize: "text-sm",
    },
    xl: {
      container: "w-44 h-44",
      strokeWidth: 8,
      radius: 78,
      fontSize: "text-4xl",
      labelSize: "text-sm",
    },
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const progress = (score / 100) * circumference;
  const colors = getMatchScoreColor(score);
  const level = getMatchScoreLevel(score);

  // Cores do stroke baseadas no nível
  const strokeColors = {
    high: "stroke-green-500",
    medium: "stroke-yellow-500",
    low: "stroke-red-500",
  };

  // Aria label
  const ariaLabel = `Compatibilidade ${score}%. Nível: ${
    level === "high" ? "alto" : level === "medium" ? "médio" : "baixo"
  }`;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        config.container,
        className
      )}
      role="img"
      aria-label={ariaLabel}
    >
      {/* SVG do círculo */}
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${(config.radius + config.strokeWidth) * 2} ${
          (config.radius + config.strokeWidth) * 2
        }`}
      >
        {/* Círculo de fundo */}
        <circle
          cx={config.radius + config.strokeWidth}
          cy={config.radius + config.strokeWidth}
          r={config.radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          className="stroke-muted"
        />

        {/* Círculo de progresso */}
        <motion.circle
          cx={config.radius + config.strokeWidth}
          cy={config.radius + config.strokeWidth}
          r={config.radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className={strokeColors[level]}
          strokeDasharray={circumference}
          initial={
            shouldAnimate
              ? { strokeDashoffset: circumference }
              : { strokeDashoffset: circumference - progress }
          }
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>

      {/* Conteúdo central */}
      <div className="relative flex flex-col items-center justify-center">
        <motion.span
          className={cn("font-bold", config.fontSize, colors.text)}
          initial={shouldAnimate ? { opacity: 0, scale: 0.5 } : {}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {score}%
        </motion.span>
        {showLabel && (
          <span
            className={cn(
              "text-muted-foreground text-center",
              config.labelSize
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// Versão compacta inline
export function MatchScoreInline({
  score,
  showIcon = true,
  className,
}: {
  score: number;
  showIcon?: boolean;
  className?: string;
}) {
  const colors = getMatchScoreColor(score);
  const level = getMatchScoreLevel(score);

  const icons = {
    high: "✓",
    medium: "~",
    low: "!",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      {showIcon && <span>{icons[level]}</span>}
      {score}%
    </span>
  );
}

// Badge de compatibilidade para cards
export function MatchScoreBadge({
  score,
  size = "md",
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const colors = getMatchScoreColor(score);
  const level = getMatchScoreLevel(score);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const labels = {
    high: "Alta compatibilidade",
    medium: "Compatibilidade média",
    low: "Baixa compatibilidade",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center rounded-lg border",
        colors.bg,
        colors.border,
        sizeClasses[size],
        className
      )}
    >
      <span className={cn("font-bold", colors.text)}>{score}%</span>
      <span className="text-xs text-muted-foreground">{labels[level]}</span>
    </div>
  );
}
