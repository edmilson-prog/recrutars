/**
 * Interviews Query Hooks
 * PRD-067: Service Layer — Specialized Modules
 *
 * React Query hooks for interview scheduling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Interview } from '@/types/interview';
import {
  getInterviewsService,
  type InterviewFilters,
} from '@/services/interviews/interviewsService';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  all: ['interviews'] as const,
  list: (filters?: InterviewFilters) => ['interviews', 'list', filters] as const,
  detail: (id: string) => ['interviews', 'detail', id] as const,
  byCandidate: (candidateId: string) =>
    ['interviews', 'candidate', candidateId] as const,
  byCompany: (companyId: string) => ['interviews', 'company', companyId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch interviews with optional filters */
export function useInterviews(filters?: InterviewFilters) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: async () => {
      const service = await getInterviewsService();
      return service.getInterviews(filters);
    },
  });
}

/** Fetch a single interview by ID */
export function useInterview(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => {
      const service = await getInterviewsService();
      return service.getInterview(id);
    },
    enabled: !!id,
  });
}

/** Fetch interviews for a candidate */
export function useInterviewsByCandidate(candidateId: string) {
  return useQuery({
    queryKey: KEYS.byCandidate(candidateId),
    queryFn: async () => {
      const service = await getInterviewsService();
      return service.getInterviewsByCandidate(candidateId);
    },
    enabled: !!candidateId,
  });
}

/** Fetch interviews for a company */
export function useInterviewsByCompany(companyId: string) {
  return useQuery({
    queryKey: KEYS.byCompany(companyId),
    queryFn: async () => {
      const service = await getInterviewsService();
      return service.getInterviewsByCompany(companyId);
    },
    enabled: !!companyId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new interview */
export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Interview>) => {
      const service = await getInterviewsService();
      return service.createInterview(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Update an existing interview */
export function useUpdateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Interview> }) => {
      const service = await getInterviewsService();
      return service.updateInterview(id, updates);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Confirm an interview with a chosen datetime */
export function useConfirmInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, datetime }: { id: string; datetime: string }) => {
      const service = await getInterviewsService();
      return service.confirmInterview(id, datetime);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Cancel an interview */
export function useCancelInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
      details,
    }: {
      id: string;
      reason: string;
      details?: string;
    }) => {
      const service = await getInterviewsService();
      return service.cancelInterview(id, reason, details);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
