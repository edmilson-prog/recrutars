/**
 * BadgeCard Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { motion } from "framer-motion";
import {
  Footprints,
  UserCheck,
  Brain,
  Send,
  Target,
  Rocket,
  TrendingUp,
  Eye,
  Flame,
  Calendar,
  FileCheck,
  Trophy,
  Sunrise,
  Moon,
  Search,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Badge, UnlockedBadge } from "@/types/gamification";
import { getRarityColor, getRarityLabel } from "@/data/gamificationConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap: Record<string, LucideIcon> = {
  Footprints,
  UserCheck,
  Brain,
  Send,
  Target,
  Rocket,
  TrendingUp,
  Eye,
  Flame,
  Calendar,
  FileCheck,
  Trophy,
  Sunrise,
  Moon,
  Search,
};

interface BadgeCardProps {
  badge: Badge;
  unlocked?: UnlockedBadge | null;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BadgeCard({
  badge,
  unlocked,
  size = "md",
  showTooltip = true,
  onClick,
  className,
}: BadgeCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = iconMap[badge.icon] || Trophy;
  const isUnlocked = !!unlocked;
  const rarityColors = getRarityColor(badge.rarity);

  const sizeClasses = {
    sm: {
      container: "w-16 h-16",
      icon: "h-6 w-6",
      padding: "p-2",
    },
    md: {
      container: "w-20 h-20",
      icon: "h-8 w-8",
      padding: "p-3",
    },
    lg: {
      container: "w-24 h-24",
      icon: "h-10 w-10",
      padding: "p-4",
    },
  };

  const sizes = sizeClasses[size];

  const card = (
    <motion.div
      whileHover={
        prefersReducedMotion
          ? {}
          : { scale: 1.05, y: -2 }
      }
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      className={cn(
        "relative rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer",
        sizes.container,
        sizes.padding,
        isUnlocked
          ? cn(rarityColors.bg, rarityColors.border)
          : "bg-muted/50 border-muted grayscale",
        onClick && "hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      {isUnlocked ? (
        <Icon className={cn(sizes.icon, rarityColors.text)} />
      ) : (
        <div className="relative">
          <Icon className={cn(sizes.icon, "text-muted-foreground/50")} />
          <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Legendary glow effect */}
      {isUnlocked && badge.rarity === "legendary" && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-amber-500/20"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );

  if (!showTooltip) {
    return card;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{badge.name}</span>
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  rarityColors.bg,
                  rarityColors.text
                )}
              >
                {getRarityLabel(badge.rarity)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            {isUnlocked && unlocked && (
              <p className="text-xs text-muted-foreground">
                Desbloqueado em{" "}
                {new Date(unlocked.unlockedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
            {!isUnlocked && (
              <p className="text-xs text-primary">+{badge.xpReward} XP ao desbloquear</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BadgeCardDetailedProps {
  badge: Badge;
  unlocked?: UnlockedBadge | null;
  className?: string;
}

export function BadgeCardDetailed({
  badge,
  unlocked,
  className,
}: BadgeCardDetailedProps) {
  const Icon = iconMap[badge.icon] || Trophy;
  const isUnlocked = !!unlocked;
  const rarityColors = getRarityColor(badge.rarity);

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
        isUnlocked
          ? cn(rarityColors.bg, rarityColors.border)
          : "bg-muted/50 border-muted",
        className
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-lg flex items-center justify-center",
          isUnlocked ? "bg-background/50" : "bg-muted"
        )}
      >
        {isUnlocked ? (
          <Icon className={cn("h-7 w-7", rarityColors.text)} />
        ) : (
          <div className="relative">
            <Icon className="h-7 w-7 text-muted-foreground/50" />
            <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={cn(
              "font-semibold truncate",
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {badge.name}
          </h4>
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded whitespace-nowrap",
              rarityColors.bg,
              rarityColors.text
            )}
          >
            {getRarityLabel(badge.rarity)}
          </span>
        </div>
        <p
          className={cn(
            "text-sm line-clamp-2",
            isUnlocked ? "text-muted-foreground" : "text-muted-foreground/70"
          )}
        >
          {badge.description}
        </p>
        {isUnlocked && unlocked && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(unlocked.unlockedAt).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      {!isUnlocked && (
        <div className="text-right">
          <span className="text-sm font-medium text-primary">
            +{badge.xpReward} XP
          </span>
        </div>
      )}
    </div>
  );
}

export default BadgeCard;
