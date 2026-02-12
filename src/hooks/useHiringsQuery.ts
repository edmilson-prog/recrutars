/**
 * React Query hooks for Hirings
 * PRD-077: Fluxo de Contratacao e Transicao para Gestao de Equipes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHiringsService } from '@/services/hirings/hiringsService';
import type { HireCandidateData, CloseJobData } from '@/types/hiring';
import { applicationKeys } from './useApplicationsQuery';
import { jobKeys } from './useJobsQuery';
import { teamKeys } from './useTeamsQuery';

// ---------------------------------------------------------------------------
// Query Key Factory
// ---------------------------------------------------------------------------

export const hiringKeys = {
  all: ['hirings'] as const,
  byJob: (jobId: string) => [...hiringKeys.all, 'job', jobId] as const,
  countByJob: (jobId: string) => [...hiringKeys.all, 'count', jobId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useHiringsByJob(jobId: string) {
  return useQuery({
    queryKey: hiringKeys.byJob(jobId),
    queryFn: async () => {
      const service = await getHiringsService();
      return service.getHiringsByJob(jobId);
    },
    enabled: !!jobId,
  });
}

export function useHiredCountForJob(jobId: string) {
  return useQuery({
    queryKey: hiringKeys.countByJob(jobId),
    queryFn: async () => {
      const service = await getHiringsService();
      return service.getHiredCountForJob(jobId);
    },
    enabled: !!jobId,
  });
}

export function useIsAlreadyTeamMember(candidateId: string, companyId: string) {
  return useQuery({
    queryKey: [...hiringKeys.all, 'duplicate', candidateId, companyId] as const,
    queryFn: async () => {
      const service = await getHiringsService();
      return service.isAlreadyTeamMember(candidateId, companyId);
    },
    enabled: !!candidateId && !!companyId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useHireCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: HireCandidateData) => {
      const service = await getHiringsService();
      return service.hireCandidate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: hiringKeys.all });
    },
  });
}

export function useCloseJobWithRemaining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CloseJobData) => {
      const service = await getHiringsService();
      return service.closeJobWithRemaining(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.invalidateQueries({ queryKey: hiringKeys.all });
    },
  });
}
