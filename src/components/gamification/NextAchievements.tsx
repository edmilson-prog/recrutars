/**
 * NextAchievements Component
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
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Badge, GamificationStats, StreakState } from "@/types/gamification";
import { getRarityColor } from "@/data/gamificationConfig";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Progress } from "@/components/ui/progress";

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

interface NextAchievementsProps {
  badges: Badge[];
  stats: GamificationStats;
  streak: StreakState;
  onBadgeClick?: (badge: Badge) => void;
  className?: string;
}

export function NextAchievements({
  badges,
  stats,
  streak,
  onBadgeClick,
  className,
}: NextAchievementsProps) {
  const prefersReducedMotion = useReducedMotion();

  const getBadgeProgress = (badge: Badge): { current: number; max: number; percentage: number } => {
    const { criteria } = badge;

    switch (criteria.type) {
      case "applications_count":
        return {
          current: stats.totalApplications,
          max: criteria.value || 1,
          percentage: Math.min((stats.totalApplications / (criteria.value || 1)) * 100, 100),
        };
      case "streak_days":
        return {
          current: streak.current,
          max: criteria.value || 1,
          percentage: Math.min((streak.current / (criteria.value || 1)) * 100, 100),
        };
      case "jobs_viewed":
        return {
          current: stats.totalJobsViewed,
          max: criteria.value || 1,
          percentage: Math.min((stats.totalJobsViewed / (criteria.value || 1)) * 100, 100),
        };
      case "profile_complete":
        return {
          current: stats.profileCompleteness,
          max: 100,
          percentage: stats.profileCompleteness,
        };
      case "profile_views":
        return {
          current: stats.profileViews,
          max: criteria.value || 1,
          percentage: Math.min((stats.profileViews / (criteria.value || 1)) * 100, 100),
        };
      case "interview_received":
        return {
          current: stats.totalInterviews,
          max: criteria.value || 1,
          percentage: Math.min((stats.totalInterviews / (criteria.value || 1)) * 100, 100),
        };
      default:
        return { current: 0, max: 1, percentage: 0 };
    }
  };

  const getProgressLabel = (badge: Badge): string => {
    const { criteria } = badge;
    switch (criteria.type) {
      case "applications_count":
        return `${stats.totalApplications}/${criteria.value} candidaturas`;
      case "streak_days":
        return `${streak.current}/${criteria.value} dias`;
      case "jobs_viewed":
        return `${stats.totalJobsViewed}/${criteria.value} vagas`;
      case "profile_complete":
        return `${stats.profileCompleteness}% completo`;
      case "profile_views":
        return `${stats.profileViews}/${criteria.value} visualizações`;
      case "interview_received":
        return `${stats.totalInterviews}/${criteria.value} entrevistas`;
      case "test_complete":
        return stats.testCompleted ? "Completo!" : "Complete o teste";
      default:
        return "";
    }
  };

  if (badges.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground">
          Parabéns! Você desbloqueou todas as conquistas disponíveis.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : staggerContainer}
      initial="initial"
      animate="animate"
      className={cn("space-y-3", className)}
    >
      {badges.map((badge) => {
        const Icon = iconMap[badge.icon] || Trophy;
        const rarityColors = getRarityColor(badge.rarity);
        const progress = getBadgeProgress(badge);
        const progressLabel = getProgressLabel(badge);

        return (
          <motion.div
            key={badge.id}
            variants={prefersReducedMotion ? {} : staggerItem}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
              onBadgeClick && "cursor-pointer"
            )}
            onClick={() => onBadgeClick?.(badge)}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                rarityColors.bg
              )}
            >
              <Icon className={cn("h-5 w-5", rarityColors.text)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{badge.name}</h4>
                <span className="text-xs text-primary whitespace-nowrap">
                  +{badge.xpReward} XP
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={progress.percentage} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {progressLabel}
                </span>
              </div>
            </div>

            {onBadgeClick && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default NextAchievements;
