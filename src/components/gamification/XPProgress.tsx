/**
 * XPProgress Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Level } from "@/types/gamification";
import { getXPProgressToNextLevel, getNextLevel } from "@/data/gamificationConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface XPProgressProps {
  xp: number;
  level: Level;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function XPProgress({
  xp,
  level,
  showLabels = true,
  size = "md",
  className,
}: XPProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const progress = getXPProgressToNextLevel(xp, level);
  const nextLevel = getNextLevel(level);

  const sizeClasses = {
    sm: {
      bar: "h-1.5",
      text: "text-xs",
    },
    md: {
      bar: "h-2",
      text: "text-sm",
    },
    lg: {
      bar: "h-3",
      text: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn("w-full", className)}>
      {showLabels && (
        <div className="flex justify-between items-center mb-1">
          <span className={cn("font-medium", level.color, sizes.text)}>
            {level.name}
          </span>
          {nextLevel && (
            <span className={cn("text-muted-foreground", sizes.text)}>
              {progress.current.toLocaleString()} / {progress.max.toLocaleString()} XP
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full rounded-full bg-muted overflow-hidden",
          sizes.bar
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            level.id === 5
              ? "bg-gradient-to-r from-yellow-400 to-amber-500"
              : "bg-gradient-to-r from-primary to-secondary"
          )}
          initial={prefersReducedMotion ? { width: `${progress.percentage}%` } : { width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>

      {showLabels && nextLevel && (
        <div className="flex justify-end mt-1">
          <span className={cn("text-muted-foreground", sizes.text)}>
            Próximo: {nextLevel.name}
          </span>
        </div>
      )}

      {showLabels && !nextLevel && (
        <div className="flex justify-center mt-1">
          <span className={cn("text-yellow-600 font-medium", sizes.text)}>
            Nível máximo atingido!
          </span>
        </div>
      )}
    </div>
  );
}

interface XPProgressCompactProps {
  xp: number;
  level: Level;
  className?: string;
}

export function XPProgressCompact({ xp, level, className }: XPProgressCompactProps) {
  const progress = getXPProgressToNextLevel(xp, level);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {Math.round(progress.percentage)}%
      </span>
    </div>
  );
}

export default XPProgress;
