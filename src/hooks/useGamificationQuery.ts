/**
 * Gamification Query Hooks
 * PRD-066: Service Layer — React Query integration for Gamification module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGamificationService } from '@/services/gamification/gamificationService';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const gamificationKeys = {
  all: ['gamification'] as const,
  levels: () => [...gamificationKeys.all, 'levels'] as const,
  badges: () => [...gamificationKeys.all, 'badges'] as const,
  xpActions: () => [...gamificationKeys.all, 'xpActions'] as const,
  user: (userId: string) => [...gamificationKeys.all, 'user', userId] as const,
};

/** Stale time for static reference data (levels, badges, xp actions): 1 hour */
const STATIC_STALE_TIME = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Static / Reference Data Hooks
// ---------------------------------------------------------------------------

export function useGamificationLevels() {
  return useQuery({
    queryKey: gamificationKeys.levels(),
    queryFn: async () => {
      const svc = await getGamificationService();
      return svc.getLevels();
    },
    staleTime: STATIC_STALE_TIME,
  });
}

export function useGamificationBadges() {
  return useQuery({
    queryKey: gamificationKeys.badges(),
    queryFn: async () => {
      const svc = await getGamificationService();
      return svc.getBadges();
    },
    staleTime: STATIC_STALE_TIME,
  });
}

export function useGamificationXPActions() {
  return useQuery({
    queryKey: gamificationKeys.xpActions(),
    queryFn: async () => {
      const svc = await getGamificationService();
      return svc.getXPActions();
    },
    staleTime: STATIC_STALE_TIME,
  });
}

// ---------------------------------------------------------------------------
// User Gamification State
// ---------------------------------------------------------------------------

export function useUserGamification(userId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.user(userId ?? ''),
    queryFn: async () => {
      if (!userId) return null;
      const svc = await getGamificationService();
      return svc.getUserGamification(userId);
    },
    enabled: !!userId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useAwardXP() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, actionType }: { userId: string; actionType: string }) => {
      const svc = await getGamificationService();
      return svc.awardXP(userId, actionType);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: gamificationKeys.user(variables.userId) });
    },
  });
}

export function useAwardBadge() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string; badgeId: string }) => {
      const svc = await getGamificationService();
      return svc.awardBadge(userId, badgeId);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: gamificationKeys.user(variables.userId) });
    },
  });
}

export function useUpdateStreak() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const svc = await getGamificationService();
      return svc.updateStreak(userId);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: gamificationKeys.user(variables.userId) });
    },
  });
}
