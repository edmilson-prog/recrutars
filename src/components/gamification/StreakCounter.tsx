/**
 * StreakCounter Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { motion } from "framer-motion";
import { Flame, Shield, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreakState } from "@/types/gamification";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakCounterProps {
  streak: StreakState;
  size?: "sm" | "md" | "lg";
  showFreezes?: boolean;
  className?: string;
}

export function StreakCounter({
  streak,
  size = "md",
  showFreezes = true,
  className,
}: StreakCounterProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: {
      icon: "h-4 w-4",
      text: "text-sm",
      container: "gap-1",
    },
    md: {
      icon: "h-5 w-5",
      text: "text-base",
      container: "gap-1.5",
    },
    lg: {
      icon: "h-6 w-6",
      text: "text-lg",
      container: "gap-2",
    },
  };

  const sizes = sizeClasses[size];

  // Color based on streak length
  const getStreakColor = () => {
    if (streak.current >= 30) return "text-orange-500";
    if (streak.current >= 7) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center",
              sizes.container,
              className
            )}
          >
            <motion.div
              animate={
                prefersReducedMotion || streak.current === 0
                  ? {}
                  : {
                      scale: [1, 1.1, 1],
                    }
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Flame className={cn(sizes.icon, getStreakColor())} />
            </motion.div>
            <span className={cn("font-bold", sizes.text, getStreakColor())}>
              {streak.current}
            </span>

            {showFreezes && streak.freezesAvailable > 0 && (
              <div className="flex items-center gap-0.5 ml-1">
                <Snowflake className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-blue-400">
                  {streak.freezesAvailable}
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">
              Streak de {streak.current} {streak.current === 1 ? "dia" : "dias"}
            </p>
            {streak.freezesAvailable > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Snowflake className="h-3 w-3" />
                {streak.freezesAvailable} freeze disponível
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Continue acessando diariamente!
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface StreakBannerProps {
  streak: StreakState;
  message?: string;
  className?: string;
}

export function StreakBanner({
  streak,
  message,
  className,
}: StreakBannerProps) {
  const prefersReducedMotion = useReducedMotion();

  // Determine banner variant based on streak
  const getBannerVariant = () => {
    if (streak.current >= 30) {
      return {
        bg: "bg-gradient-to-r from-orange-500/10 to-red-500/10",
        border: "border-orange-500/30",
        icon: "text-orange-500",
      };
    }
    if (streak.current >= 7) {
      return {
        bg: "bg-gradient-to-r from-yellow-500/10 to-orange-500/10",
        border: "border-yellow-500/30",
        icon: "text-yellow-500",
      };
    }
    return {
      bg: "bg-muted/50",
      border: "border-muted",
      icon: "text-muted-foreground",
    };
  };

  const variant = getBannerVariant();

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        variant.bg,
        variant.border,
        className
      )}
    >
      <motion.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 1.15, 1],
              }
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Flame className={cn("h-8 w-8", variant.icon)} />
      </motion.div>
      <div className="flex-1">
        <p className="font-semibold">
          {streak.current} {streak.current === 1 ? "dia" : "dias"} de streak!
        </p>
        <p className="text-sm text-muted-foreground">
          {message || "Continue assim para desbloquear conquistas!"}
        </p>
      </div>
      {streak.freezesAvailable > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/30">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-500">
                  {streak.freezesAvailable}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Streak freeze disponível</p>
              <p className="text-xs text-muted-foreground">
                Protege seu streak se você esquecer de logar um dia
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export default StreakCounter;
