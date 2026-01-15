/**
 * useGamification Hook
 * PRD-001-dgn: Sistema de Gamificação - XP, Badges e Níveis
 */

import { useState, useCallback, useEffect } from "react";
import {
  differenceInHours,
  differenceInDays,
  startOfWeek,
  isAfter,
  parseISO,
  formatISO,
} from "date-fns";
import type {
  GamificationState,
  Badge,
  UnlockedBadge,
  GamificationStats,
  XPActionType,
} from "@/types/gamification";
import {
  LEVELS,
  BADGES,
  XP_ACTIONS,
  INITIAL_GAMIFICATION_STATE,
  STORAGE_KEY,
  getLevelByXP,
  getNextLevel,
} from "@/data/gamificationConfig";

interface XPGainEvent {
  amount: number;
  action: string;
  timestamp: number;
}

interface BadgeUnlockEvent {
  badge: Badge;
  timestamp: number;
}

interface LevelUpEvent {
  newLevel: typeof LEVELS[number];
  timestamp: number;
}

interface UseGamificationReturn {
  state: GamificationState;
  addXP: (actionType: XPActionType, multiplier?: number) => XPGainEvent | null;
  checkAndUnlockBadges: () => BadgeUnlockEvent[];
  updateStats: (stats: Partial<GamificationStats>) => void;
  checkStreak: () => { protected: boolean; reset: boolean; message: string };
  getNextBadges: (count?: number) => Badge[];
  getUnlockedBadges: () => Badge[];
  isLevelUp: () => LevelUpEvent | null;
  resetGamification: () => void;
}

export function useGamification(): UseGamificationReturn {
  const [state, setState] = useState<GamificationState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure level object is properly reconstructed
        const level = getLevelByXP(parsed.xp || 0);
        return { ...INITIAL_GAMIFICATION_STATE, ...parsed, level, initialized: true };
      }
    } catch (error) {
      console.error("Error loading gamification state:", error);
    }
    return { ...INITIAL_GAMIFICATION_STATE, initialized: true };
  });

  const [pendingLevelUp, setPendingLevelUp] = useState<LevelUpEvent | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    if (state.initialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Error saving gamification state:", error);
      }
    }
  }, [state]);

  // Add XP and check for level up
  const addXP = useCallback(
    (actionType: XPActionType, multiplier = 1): XPGainEvent | null => {
      const action = XP_ACTIONS[actionType];
      if (!action) {
        console.warn(`Unknown XP action: ${actionType}`);
        return null;
      }

      const xpAmount = Math.floor(action.xp * multiplier);
      const previousLevel = state.level;

      setState((prev) => {
        const newXP = prev.xp + xpAmount;
        const newLevel = getLevelByXP(newXP);

        // Check for level up
        if (newLevel.id > previousLevel.id) {
          setPendingLevelUp({ newLevel, timestamp: Date.now() });
        }

        return {
          ...prev,
          xp: newXP,
          level: newLevel,
        };
      });

      return {
        amount: xpAmount,
        action: action.description,
        timestamp: Date.now(),
      };
    },
    [state.level]
  );

  // Check and unlock badges based on current stats
  const checkAndUnlockBadges = useCallback((): BadgeUnlockEvent[] => {
    const unlockedEvents: BadgeUnlockEvent[] = [];
    const unlockedBadgeIds = new Set(state.badges.map((b) => b.badgeId));
    const currentHour = new Date().getHours();

    BADGES.forEach((badge) => {
      if (unlockedBadgeIds.has(badge.id)) return;

      let shouldUnlock = false;
      const { criteria } = badge;

      switch (criteria.type) {
        case "first_login":
          shouldUnlock = state.initialized;
          break;
        case "profile_complete":
          shouldUnlock = state.stats.profileCompleteness >= (criteria.value || 100);
          break;
        case "applications_count":
          shouldUnlock = state.stats.totalApplications >= (criteria.value || 0);
          break;
        case "streak_days":
          shouldUnlock = state.streak.current >= (criteria.value || 0);
          break;
        case "test_complete":
          shouldUnlock = state.stats.testCompleted;
          break;
        case "jobs_viewed":
          shouldUnlock = state.stats.totalJobsViewed >= (criteria.value || 0);
          break;
        case "interview_received":
          shouldUnlock = state.stats.totalInterviews >= (criteria.value || 0);
          break;
        case "profile_views":
          shouldUnlock = state.stats.profileViews >= (criteria.value || 0);
          break;
        case "time_of_day":
          if (criteria.timeRange) {
            shouldUnlock =
              currentHour >= criteria.timeRange.start &&
              currentHour < criteria.timeRange.end;
          }
          break;
        // proposal_received and hired are manually triggered
        default:
          break;
      }

      if (shouldUnlock) {
        const newBadge: UnlockedBadge = {
          badgeId: badge.id,
          unlockedAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          badges: [...prev.badges, newBadge],
          xp: prev.xp + badge.xpReward,
          level: getLevelByXP(prev.xp + badge.xpReward),
        }));

        unlockedEvents.push({ badge, timestamp: Date.now() });
      }
    });

    return unlockedEvents;
  }, [state.badges, state.stats, state.streak, state.initialized]);

  // Update stats
  const updateStats = useCallback((newStats: Partial<GamificationStats>) => {
    setState((prev) => ({
      ...prev,
      stats: { ...prev.stats, ...newStats },
    }));
  }, []);

  // Check and update streak
  const checkStreak = useCallback((): {
    protected: boolean;
    reset: boolean;
    message: string;
  } => {
    const now = new Date();
    const today = formatISO(now, { representation: "date" });

    // Check if week needs to reset for freeze
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekStartStr = formatISO(currentWeekStart, { representation: "date" });

    setState((prev) => {
      // Reset freeze at start of new week
      let newFreezes = prev.streak.freezesAvailable;
      let newFreezeUsed = prev.streak.freezeUsedThisWeek;

      if (
        !prev.streak.weekStartDate ||
        isAfter(currentWeekStart, parseISO(prev.streak.weekStartDate))
      ) {
        newFreezes = 1;
        newFreezeUsed = false;
      }

      // No previous login, start fresh
      if (!prev.streak.lastLoginDate) {
        return {
          ...prev,
          streak: {
            current: 1,
            lastLoginDate: today,
            freezesAvailable: newFreezes,
            freezeUsedThisWeek: newFreezeUsed,
            weekStartDate: weekStartStr,
          },
        };
      }

      const lastLogin = parseISO(prev.streak.lastLoginDate);
      const hoursSinceLastLogin = differenceInHours(now, lastLogin);
      const daysSinceLastLogin = differenceInDays(now, lastLogin);

      // Same day login, no change
      if (daysSinceLastLogin === 0) {
        return prev;
      }

      // Consecutive day login (within 24-48h)
      if (daysSinceLastLogin === 1) {
        return {
          ...prev,
          streak: {
            ...prev.streak,
            current: prev.streak.current + 1,
            lastLoginDate: today,
            freezesAvailable: newFreezes,
            freezeUsedThisWeek: newFreezeUsed,
            weekStartDate: weekStartStr,
          },
        };
      }

      // Missed one day (24-48h), try to use freeze
      if (hoursSinceLastLogin >= 24 && hoursSinceLastLogin < 48 && newFreezes > 0 && !newFreezeUsed) {
        return {
          ...prev,
          streak: {
            ...prev.streak,
            lastLoginDate: today,
            freezesAvailable: newFreezes - 1,
            freezeUsedThisWeek: true,
            weekStartDate: weekStartStr,
          },
        };
      }

      // Streak broken - reset
      return {
        ...prev,
        streak: {
          current: 1,
          lastLoginDate: today,
          freezesAvailable: newFreezes,
          freezeUsedThisWeek: newFreezeUsed,
          weekStartDate: weekStartStr,
        },
      };
    });

    // Return status message
    const lastLogin = state.streak.lastLoginDate
      ? parseISO(state.streak.lastLoginDate)
      : null;

    if (!lastLogin) {
      return { protected: false, reset: false, message: "Bem-vindo! Sua jornada começa agora." };
    }

    const hoursSince = differenceInHours(now, lastLogin);
    const daysSince = differenceInDays(now, lastLogin);

    if (daysSince === 0) {
      return { protected: false, reset: false, message: "" };
    }

    if (daysSince === 1) {
      return {
        protected: false,
        reset: false,
        message: `Streak de ${state.streak.current + 1} dias! Continue assim!`,
      };
    }

    if (hoursSince >= 24 && hoursSince < 48 && state.streak.freezesAvailable > 0) {
      return {
        protected: true,
        reset: false,
        message: "Streak protegido! Seu freeze foi usado automaticamente.",
      };
    }

    return {
      protected: false,
      reset: true,
      message: "Novo começo! Vamos construir um novo streak.",
    };
  }, [state.streak]);

  // Get next badges to unlock
  const getNextBadges = useCallback(
    (count = 3): Badge[] => {
      const unlockedIds = new Set(state.badges.map((b) => b.badgeId));
      const lockedBadges = BADGES.filter((b) => !unlockedIds.has(b.id));

      // Sort by proximity to unlocking (simple heuristic based on criteria)
      const sortedBadges = lockedBadges.sort((a, b) => {
        const getProgress = (badge: Badge): number => {
          const { criteria } = badge;
          switch (criteria.type) {
            case "applications_count":
              return state.stats.totalApplications / (criteria.value || 1);
            case "streak_days":
              return state.streak.current / (criteria.value || 1);
            case "jobs_viewed":
              return state.stats.totalJobsViewed / (criteria.value || 1);
            case "profile_complete":
              return state.stats.profileCompleteness / 100;
            case "profile_views":
              return state.stats.profileViews / (criteria.value || 1);
            default:
              return 0;
          }
        };
        return getProgress(b) - getProgress(a);
      });

      return sortedBadges.slice(0, count);
    },
    [state.badges, state.stats, state.streak]
  );

  // Get unlocked badges
  const getUnlockedBadges = useCallback((): Badge[] => {
    return state.badges
      .map((ub) => BADGES.find((b) => b.id === ub.badgeId))
      .filter((b): b is Badge => b !== undefined);
  }, [state.badges]);

  // Check for pending level up event
  const isLevelUp = useCallback((): LevelUpEvent | null => {
    const event = pendingLevelUp;
    if (event) {
      setPendingLevelUp(null);
    }
    return event;
  }, [pendingLevelUp]);

  // Reset gamification (for testing)
  const resetGamification = useCallback(() => {
    setState({ ...INITIAL_GAMIFICATION_STATE, initialized: true });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    addXP,
    checkAndUnlockBadges,
    updateStats,
    checkStreak,
    getNextBadges,
    getUnlockedBadges,
    isLevelUp,
    resetGamification,
  };
}

export default useGamification;
