/**
 * LevelBadge Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { motion } from "framer-motion";
import {
  Sprout,
  Compass,
  Zap,
  Award,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Level } from "@/types/gamification";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const iconMap: Record<string, LucideIcon> = {
  Sprout,
  Compass,
  Zap,
  Award,
  Crown,
};

interface LevelBadgeProps {
  level: Level;
  xp: number;
  size?: "sm" | "md" | "lg";
  showXP?: boolean;
  showName?: boolean;
  className?: string;
}

export function LevelBadge({
  level,
  xp,
  size = "md",
  showXP = true,
  showName = true,
  className,
}: LevelBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = iconMap[level.icon] || Sprout;

  const sizeClasses = {
    sm: {
      container: "gap-1.5",
      icon: "h-4 w-4",
      iconWrapper: "h-6 w-6",
      name: "text-xs",
      xp: "text-[10px]",
    },
    md: {
      container: "gap-2",
      icon: "h-5 w-5",
      iconWrapper: "h-8 w-8",
      name: "text-sm",
      xp: "text-xs",
    },
    lg: {
      container: "gap-3",
      icon: "h-6 w-6",
      iconWrapper: "h-10 w-10",
      name: "text-base",
      xp: "text-sm",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("flex items-center", sizes.container, className)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          level.bgColor,
          sizes.iconWrapper
        )}
      >
        <Icon className={cn(level.color, sizes.icon)} />
      </div>
      <div className="flex flex-col">
        {showName && (
          <span className={cn("font-semibold", level.color, sizes.name)}>
            {level.name}
          </span>
        )}
        {showXP && (
          <span className={cn("text-muted-foreground", sizes.xp)}>
            {xp.toLocaleString()} XP
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface LevelBadgeCompactProps {
  level: Level;
  className?: string;
}

export function LevelBadgeCompact({ level, className }: LevelBadgeCompactProps) {
  const Icon = iconMap[level.icon] || Sprout;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        level.bgColor,
        level.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{level.name}</span>
    </div>
  );
}

export default LevelBadge;
