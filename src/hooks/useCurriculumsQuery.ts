/**
 * React Query hooks for Professional Profile service
 * PRD-073: Perfil Profissional Unificado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurriculumsService } from '@/services/curriculums/curriculumsService';
import type { Curriculum } from '@/types/curriculum';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const profileKeys = {
  all: ['profile'] as const,
  byCandidate: (candidateId: string) => [...profileKeys.all, candidateId] as const,
  detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch the single professional profile for a candidate */
export function useProfile(candidateId: string) {
  return useQuery({
    queryKey: profileKeys.byCandidate(candidateId),
    queryFn: async () => {
      const service = await getCurriculumsService();
      return service.getProfile(candidateId);
    },
    enabled: !!candidateId,
  });
}

/** Fetch a single curriculum by id */
export function useCurriculum(id: string) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: async () => {
      const service = await getCurriculumsService();
      return service.getCurriculum(id);
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Ensure the profile exists (create if not found) */
export function useEnsureProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, initialData }: { candidateId: string; initialData?: Partial<Curriculum> }) => {
      const service = await getCurriculumsService();
      return service.ensureProfile(candidateId, initialData);
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.byCandidate(created.candidateId) });
    },
  });
}

/** Update an existing curriculum/profile */
export function useUpdateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Curriculum> }) => {
      const service = await getCurriculumsService();
      return service.updateCurriculum(id, updates);
    },
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
