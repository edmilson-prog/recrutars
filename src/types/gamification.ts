/**
 * Gamification Types
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type BadgeCategory =
  | "profile"
  | "activity"
  | "tests"
  | "applications"
  | "special";

export interface Level {
  id: number;
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
  bgColor: string;
}

export interface BadgeCriteria {
  type:
    | "profile_complete"
    | "applications_count"
    | "streak_days"
    | "test_complete"
    | "jobs_viewed"
    | "interview_received"
    | "proposal_received"
    | "hired"
    | "time_of_day"
    | "profile_views"
    | "first_login";
  value?: number;
  timeRange?: { start: number; end: number }; // hours for time_of_day
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  criteria: BadgeCriteria;
  xpReward: number;
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string; // ISO date
}

export interface StreakState {
  current: number;
  lastLoginDate: string | null; // ISO date
  freezesAvailable: number;
  freezeUsedThisWeek: boolean;
  weekStartDate: string | null; // ISO date for freeze reset
}

export interface GamificationStats {
  totalApplications: number;
  totalJobsViewed: number;
  totalInterviews: number;
  profileCompleteness: number;
  testCompleted: boolean;
  profileViews: number;
}

export interface GamificationState {
  xp: number;
  level: Level;
  badges: UnlockedBadge[];
  streak: StreakState;
  stats: GamificationStats;
  initialized: boolean;
}

export interface XPAction {
  type: string;
  xp: number;
  description: string;
  maxPerDay?: number;
}

export type XPActionType =
  | "daily_login"
  | "profile_field"
  | "profile_complete"
  | "test_complete"
  | "application_sent"
  | "job_viewed"
  | "profile_view_received"
  | "interview_received"
  | "proposal_received";
