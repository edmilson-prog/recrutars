/**
 * BadgeGallery Component
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Badge, UnlockedBadge, BadgeCategory } from "@/types/gamification";
import { BADGES, getBadgesByCategory } from "@/data/gamificationConfig";
import { BadgeCard, BadgeCardDetailed } from "./BadgeCard";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  profile: "Perfil",
  activity: "Atividade",
  tests: "Testes",
  applications: "Candidaturas",
  special: "Especiais",
};

interface BadgeGalleryProps {
  unlockedBadges: UnlockedBadge[];
  onBadgeClick?: (badge: Badge) => void;
  view?: "grid" | "list";
  showCategories?: boolean;
  showLockedBadges?: boolean;
  className?: string;
}

export function BadgeGallery({
  unlockedBadges,
  onBadgeClick,
  view = "grid",
  showCategories = true,
  showLockedBadges = true,
  className,
}: BadgeGalleryProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<BadgeCategory | "all">("all");

  const unlockedIds = new Set(unlockedBadges.map((b) => b.badgeId));

  const getUnlockedBadge = (badgeId: string): UnlockedBadge | undefined => {
    return unlockedBadges.find((b) => b.badgeId === badgeId);
  };

  const filteredBadges =
    activeCategory === "all"
      ? BADGES
      : getBadgesByCategory(activeCategory);

  const displayBadges = showLockedBadges
    ? filteredBadges
    : filteredBadges.filter((b) => unlockedIds.has(b.id));

  // Sort: unlocked first, then by rarity
  const sortedBadges = [...displayBadges].sort((a, b) => {
    const aUnlocked = unlockedIds.has(a.id);
    const bUnlocked = unlockedIds.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  const categories: (BadgeCategory | "all")[] = [
    "all",
    "profile",
    "activity",
    "tests",
    "applications",
    "special",
  ];

  const content = (
    <motion.div
      variants={prefersReducedMotion ? {} : staggerContainer}
      initial="initial"
      animate="animate"
      className={cn(
        view === "grid"
          ? "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3"
          : "space-y-3",
        className
      )}
    >
      {sortedBadges.map((badge) => (
        <motion.div
          key={badge.id}
          variants={prefersReducedMotion ? {} : staggerItem}
        >
          {view === "grid" ? (
            <BadgeCard
              badge={badge}
              unlocked={getUnlockedBadge(badge.id)}
              size="md"
              onClick={onBadgeClick ? () => onBadgeClick(badge) : undefined}
            />
          ) : (
            <BadgeCardDetailed
              badge={badge}
              unlocked={getUnlockedBadge(badge.id)}
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );

  if (!showCategories) {
    return content;
  }

  return (
    <Tabs
      value={activeCategory}
      onValueChange={(v) => setActiveCategory(v as BadgeCategory | "all")}
    >
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        {categories.map((cat) => {
          const count =
            cat === "all"
              ? BADGES.filter((b) => unlockedIds.has(b.id)).length
              : getBadgesByCategory(cat).filter((b) => unlockedIds.has(b.id)).length;
          const total = cat === "all" ? BADGES.length : getBadgesByCategory(cat).length;

          return (
            <TabsTrigger key={cat} value={cat} className="text-xs">
              {cat === "all" ? "Todos" : CATEGORY_LABELS[cat]}
              <span className="ml-1 text-muted-foreground">
                ({count}/{total})
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value={activeCategory} className="mt-0">
        {content}
      </TabsContent>
    </Tabs>
  );
}

interface BadgeCounterProps {
  unlockedCount: number;
  totalCount: number;
  className?: string;
}

export function BadgeCounter({
  unlockedCount,
  totalCount,
  className,
}: BadgeCounterProps) {
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {unlockedCount}/{totalCount}
      </span>
    </div>
  );
}

export default BadgeGallery;
