/**
 * Gamification Components Index
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

// Level Components
export { LevelBadge, LevelBadgeCompact } from "./LevelBadge";

// XP Components
export { XPProgress, XPProgressCompact } from "./XPProgress";
export {
  XPGainAnimation,
  useXPAnimation,
  emitXPGain,
} from "./XPGainAnimation";
export { LevelUpModal } from "./LevelUpModal";

// Badge Components
export { BadgeCard, BadgeCardDetailed } from "./BadgeCard";
export { BadgeGallery, BadgeCounter } from "./BadgeGallery";
export { BadgeUnlockModal } from "./BadgeUnlockModal";

// Streak Components
export { StreakCounter, StreakBanner } from "./StreakCounter";
export { StreakCalendar, StreakCalendarCompact } from "./StreakCalendar";

// Progress Components
export { ProgressRing, ProgressRingCompact } from "./ProgressRing";

// Achievement Components
export { NextAchievements } from "./NextAchievements";

// Dashboard Components
export {
  GamificationCard,
  GamificationMiniCard,
  GamificationSidebarWidget,
} from "./GamificationCard";
