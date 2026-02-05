/**
 * Gamification Service — Interface
 * PRD-066: Service Layer Pattern
 *
 * Manages levels, badges, XP actions, and user gamification state.
 */

import type { Level, Badge, XPAction } from '@/types/gamification';

/** User gamification state persisted in the database. */
export interface UserGamification {
  userId: string;
  xp: number;
  levelId: number;
  badges: string[];
  streakCurrent: number;
  streakLastLoginDate: string | null;
  stats: {
    totalApplications: number;
    totalJobsViewed: number;
    totalInterviews: number;
    profileCompleteness: number;
    testCompleted: boolean;
    profileViews: number;
  };
  updatedAt: string;
}

export interface IGamificationService {
  /** List all levels. */
  getLevels(): Promise<Level[]>;

  /** List all badges. */
  getBadges(): Promise<Badge[]>;

  /** List all XP action definitions. */
  getXPActions(): Promise<XPAction[]>;

  /** Get gamification state for a specific user. */
  getUserGamification(userId: string): Promise<UserGamification | null>;

  /** Award XP for a completed action. Returns updated state. */
  awardXP(userId: string, actionType: string): Promise<UserGamification>;

  /** Award a badge to a user. Returns updated state. */
  awardBadge(userId: string, badgeId: string): Promise<UserGamification>;

  /** Update user streak. Returns updated state. */
  updateStreak(userId: string): Promise<UserGamification>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IGamificationService | null = null;

export async function getGamificationService(): Promise<IGamificationService> {
  if (_instance) return _instance;

  const { SupabaseGamificationService } = await import(
    './gamificationService.supabase'
  );
  _instance = new SupabaseGamificationService();
  return _instance;
}
