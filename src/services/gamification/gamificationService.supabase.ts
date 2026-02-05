/**
 * Gamification Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 *
 * Queries gamification_levels, gamification_badges, gamification_xp_actions,
 * and user_gamification tables. Falls back to bundled constants when
 * reference-data tables are empty.
 */

import { supabase } from '@/lib/supabase';
import type { Level, Badge, XPAction } from '@/types/gamification';
import type { IGamificationService, UserGamification } from './gamificationService';
import { LEVELS, BADGES, XP_ACTIONS, getLevelByXP } from '@/data/gamificationConfig';

// ---------------------------------------------------------------------------
// Row → Domain converters (snake_case → camelCase)
// ---------------------------------------------------------------------------

function rowToLevel(row: Record<string, unknown>): Level {
  return {
    id: row.id as number,
    name: row.name as string,
    minXP: row.min_xp as number,
    maxXP: row.max_xp as number,
    icon: row.icon as string,
    color: row.color as string,
    bgColor: row.bg_color as string,
  };
}

function rowToBadge(row: Record<string, unknown>): Badge {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    icon: row.icon as string,
    rarity: row.rarity as Badge['rarity'],
    category: row.category as Badge['category'],
    criteria: row.criteria as Badge['criteria'],
    xpReward: row.xp_reward as number,
  };
}

function rowToXPAction(row: Record<string, unknown>): XPAction {
  return {
    type: row.type as string,
    xp: row.xp as number,
    description: row.description as string,
    ...(row.max_per_day != null ? { maxPerDay: row.max_per_day as number } : {}),
  };
}

function rowToUserGamification(row: Record<string, unknown>): UserGamification {
  const stats = (row.stats as Record<string, unknown>) ?? {};
  return {
    userId: row.user_id as string,
    xp: row.xp as number,
    levelId: row.level_id as number,
    badges: (row.badges as string[]) ?? [],
    streakCurrent: row.streak_current as number,
    streakLastLoginDate: row.streak_last_login
      ? (row.streak_last_login as string)
      : null,
    stats: {
      totalApplications: (stats.totalApplications as number) ?? 0,
      totalJobsViewed: (stats.totalJobsViewed as number) ?? 0,
      totalInterviews: (stats.totalInterviews as number) ?? 0,
      profileCompleteness: (stats.profileCompleteness as number) ?? 0,
      testCompleted: (stats.testCompleted as boolean) ?? false,
      profileViews: (stats.profileViews as number) ?? 0,
    },
    updatedAt: row.updated_at as string,
  };
}

// ---------------------------------------------------------------------------
// Default user gamification state for new users
// ---------------------------------------------------------------------------

function createDefaultState(userId: string): UserGamification {
  return {
    userId,
    xp: 0,
    levelId: 1,
    badges: [],
    streakCurrent: 0,
    streakLastLoginDate: null,
    stats: {
      totalApplications: 0,
      totalJobsViewed: 0,
      totalInterviews: 0,
      profileCompleteness: 0,
      testCompleted: false,
      profileViews: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class SupabaseGamificationService implements IGamificationService {
  // -------------------------------------------------------------------------
  // Static / Reference Data (with fallback to bundled constants)
  // -------------------------------------------------------------------------

  async getLevels(): Promise<Level[]> {
    const { data, error } = await supabase
      .from('gamification_levels')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((row) => rowToLevel(row as unknown as Record<string, unknown>));
    }

    // Fallback to bundled constants when table is empty
    return LEVELS;
  }

  async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('gamification_badges')
      .select('*')
      .order('name');

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((row) => rowToBadge(row as unknown as Record<string, unknown>));
    }

    // Fallback to bundled constants when table is empty
    return BADGES;
  }

  async getXPActions(): Promise<XPAction[]> {
    const { data, error } = await supabase
      .from('gamification_xp_actions')
      .select('*')
      .order('type');

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((row) => rowToXPAction(row as unknown as Record<string, unknown>));
    }

    // Fallback to bundled constants when table is empty
    return Object.values(XP_ACTIONS);
  }

  // -------------------------------------------------------------------------
  // User Gamification State
  // -------------------------------------------------------------------------

  async getUserGamification(userId: string): Promise<UserGamification | null> {
    const { data, error } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return rowToUserGamification(data as unknown as Record<string, unknown>);
  }

  async awardXP(userId: string, actionType: string): Promise<UserGamification> {
    // Resolve XP value: try database first, then fallback to constant
    let xpAmount: number;

    const { data: actionRow } = await supabase
      .from('gamification_xp_actions')
      .select('xp')
      .eq('type', actionType)
      .maybeSingle();

    if (actionRow) {
      xpAmount = (actionRow as unknown as Record<string, unknown>).xp as number;
    } else {
      const fallbackAction = XP_ACTIONS[actionType];
      if (!fallbackAction) throw new Error(`Unknown XP action: ${actionType}`);
      xpAmount = fallbackAction.xp;
    }

    // Get or create user gamification state
    let state = await this.getUserGamification(userId);
    if (!state) {
      state = createDefaultState(userId);
    }

    // Calculate new XP and level
    const newXP = state.xp + xpAmount;
    const newLevel = getLevelByXP(newXP);
    const now = new Date().toISOString();

    // Upsert user gamification row
    const { data, error } = await supabase
      .from('user_gamification')
      .upsert(
        {
          user_id: userId,
          xp: newXP,
          level_id: newLevel.id,
          badges: state.badges,
          streak_current: state.streakCurrent,
          streak_last_login: state.streakLastLoginDate,
          stats: state.stats,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return rowToUserGamification(data as unknown as Record<string, unknown>);
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserGamification> {
    // Validate badge exists: try database first, then fallback
    let badgeXPReward: number;

    const { data: badgeRow } = await supabase
      .from('gamification_badges')
      .select('xp_reward')
      .eq('id', badgeId)
      .maybeSingle();

    if (badgeRow) {
      badgeXPReward = (badgeRow as unknown as Record<string, unknown>).xp_reward as number;
    } else {
      const fallbackBadge = BADGES.find((b) => b.id === badgeId);
      if (!fallbackBadge) throw new Error(`Badge "${badgeId}" not found`);
      badgeXPReward = fallbackBadge.xpReward;
    }

    // Get or create user gamification state
    let state = await this.getUserGamification(userId);
    if (!state) {
      state = createDefaultState(userId);
    }

    // Only award if badge not already unlocked
    let newXP = state.xp;
    const newBadges = [...state.badges];

    if (!newBadges.includes(badgeId)) {
      newBadges.push(badgeId);
      newXP += badgeXPReward;
    }

    const newLevel = getLevelByXP(newXP);
    const now = new Date().toISOString();

    // Upsert user gamification row
    const { data, error } = await supabase
      .from('user_gamification')
      .upsert(
        {
          user_id: userId,
          xp: newXP,
          level_id: newLevel.id,
          badges: newBadges,
          streak_current: state.streakCurrent,
          streak_last_login: state.streakLastLoginDate,
          stats: state.stats,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return rowToUserGamification(data as unknown as Record<string, unknown>);
  }

  async updateStreak(userId: string): Promise<UserGamification> {
    // Get or create user gamification state
    let state = await this.getUserGamification(userId);
    if (!state) {
      state = createDefaultState(userId);
    }

    const today = new Date().toISOString().split('T')[0];
    const lastLogin = state.streakLastLoginDate;

    // Already logged in today — no change
    if (lastLogin === today) {
      return state;
    }

    let newStreak: number;

    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffMs = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = state.streakCurrent + 1;
      } else {
        // Streak broken — reset to 1
        newStreak = 1;
      }
    } else {
      // First ever login
      newStreak = 1;
    }

    const now = new Date().toISOString();

    // Upsert user gamification row
    const { data, error } = await supabase
      .from('user_gamification')
      .upsert(
        {
          user_id: userId,
          xp: state.xp,
          level_id: state.levelId,
          badges: state.badges,
          streak_current: newStreak,
          streak_last_login: today,
          stats: state.stats,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return rowToUserGamification(data as unknown as Record<string, unknown>);
  }
}
