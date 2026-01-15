/**
 * GamificationCard Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { motion } from "framer-motion";
import { ChevronRight, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GamificationState, Badge } from "@/types/gamification";
import { BADGES } from "@/data/gamificationConfig";
import { LevelBadge } from "./LevelBadge";
import { XPProgress } from "./XPProgress";
import { StreakCounter } from "./StreakCounter";
import { BadgeCounter } from "./BadgeGallery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface GamificationCardProps {
  state: GamificationState;
  onViewAll?: () => void;
  className?: string;
}

export function GamificationCard({
  state,
  onViewAll,
  className,
}: GamificationCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const unlockedCount = state.badges.length;
  const totalCount = BADGES.length;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Minha Jornada
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              Ver tudo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level and XP */}
        <div className="flex items-center justify-between">
          <LevelBadge level={state.level} xp={state.xp} size="md" />
          <StreakCounter streak={state.streak} size="md" />
        </div>

        {/* XP Progress */}
        <XPProgress xp={state.xp} level={state.level} size="sm" />

        {/* Badges Progress */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Conquistas</span>
          </div>
          <BadgeCounter
            unlockedCount={unlockedCount}
            totalCount={totalCount}
            className="w-32"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface GamificationMiniCardProps {
  state: GamificationState;
  onClick?: () => void;
  className?: string;
}

export function GamificationMiniCard({
  state,
  onClick,
  className,
}: GamificationMiniCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      onClick={onClick}
    >
      <LevelBadge level={state.level} xp={state.xp} size="sm" showName={false} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{state.level.name}</p>
        <p className="text-xs text-muted-foreground">
          {state.xp.toLocaleString()} XP
        </p>
      </div>
      <StreakCounter streak={state.streak} size="sm" showFreezes={false} />
    </motion.div>
  );
}

interface GamificationSidebarWidgetProps {
  state: GamificationState;
  nextBadges: Badge[];
  onViewAll?: () => void;
  className?: string;
}

export function GamificationSidebarWidget({
  state,
  nextBadges,
  onViewAll,
  className,
}: GamificationSidebarWidgetProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Level Card */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border"
      >
        <div className="flex items-center justify-between mb-3">
          <LevelBadge level={state.level} xp={state.xp} size="sm" />
          <StreakCounter streak={state.streak} size="sm" />
        </div>
        <XPProgress xp={state.xp} level={state.level} size="sm" showLabels={false} />
      </motion.div>

      {/* Next Achievement */}
      {nextBadges.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-lg border bg-card"
        >
          <p className="text-xs text-muted-foreground mb-2">Próxima conquista</p>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium truncate">
              {nextBadges[0].name}
            </span>
          </div>
        </motion.div>
      )}

      {/* View All Button */}
      {onViewAll && (
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          Ver todas conquistas
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}

export default GamificationCard;
