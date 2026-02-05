/**
 * React Query hooks for Behavioral Tests service
 * PRD-066: Service Layer hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BehavioralTest, TestResult } from '@/types/test';
import type { BehavioralTestFilters } from '@/services/behavioralTests/behavioralTestsService';
import { getBehavioralTestsService } from '@/services/behavioralTests/behavioralTestsService';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const behavioralTestsKeys = {
  all: ['behavioralTests'] as const,
  lists: () => [...behavioralTestsKeys.all, 'list'] as const,
  list: (filters?: BehavioralTestFilters) =>
    [...behavioralTestsKeys.lists(), filters ?? {}] as const,
  details: () => [...behavioralTestsKeys.all, 'detail'] as const,
  detail: (id: string) => [...behavioralTestsKeys.details(), id] as const,
  byCandidate: (candidateId: string) =>
    [...behavioralTestsKeys.all, 'candidate', candidateId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useBehavioralTests(filters?: BehavioralTestFilters) {
  return useQuery({
    queryKey: behavioralTestsKeys.list(filters),
    queryFn: async () => {
      const svc = await getBehavioralTestsService();
      return svc.getTests(filters);
    },
  });
}

export function useBehavioralTest(id: string) {
  return useQuery({
    queryKey: behavioralTestsKeys.detail(id),
    queryFn: async () => {
      const svc = await getBehavioralTestsService();
      return svc.getTest(id);
    },
    enabled: !!id,
  });
}

export function useBehavioralTestsByCandidate(candidateId: string) {
  return useQuery({
    queryKey: behavioralTestsKeys.byCandidate(candidateId),
    queryFn: async () => {
      const svc = await getBehavioralTestsService();
      return svc.getTestsByCandidate(candidateId);
    },
    enabled: !!candidateId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateBehavioralTest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<BehavioralTest, 'id'>) => {
      const svc = await getBehavioralTestsService();
      return svc.createTest(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: behavioralTestsKeys.lists() });
    },
  });
}

export function useUpdateBehavioralTest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<BehavioralTest>;
    }) => {
      const svc = await getBehavioralTestsService();
      return svc.updateTest(id, updates);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: behavioralTestsKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: behavioralTestsKeys.lists() });
    },
  });
}

export function useCompleteBehavioralTest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, result }: { id: string; result: TestResult }) => {
      const svc = await getBehavioralTestsService();
      return svc.completeTest(id, result);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: behavioralTestsKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: behavioralTestsKeys.lists() });
    },
  });
}
