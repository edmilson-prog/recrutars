/**
 * React Query hooks for Curriculums service
 * PRD-066: Service Layer hooks for curriculum management (PRD-022)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurriculumsService } from '@/services/curriculums/curriculumsService';
import type { Curriculum } from '@/types/curriculum';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const curriculumKeys = {
  all: ['curriculums'] as const,
  lists: () => [...curriculumKeys.all, 'list'] as const,
  list: (candidateId: string) => [...curriculumKeys.lists(), candidateId] as const,
  details: () => [...curriculumKeys.all, 'detail'] as const,
  detail: (id: string) => [...curriculumKeys.details(), id] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all curriculums for a candidate */
export function useCurriculums(candidateId: string) {
  return useQuery({
    queryKey: curriculumKeys.list(candidateId),
    queryFn: async () => {
      const service = await getCurriculumsService();
      return service.getCurriculums(candidateId);
    },
    enabled: !!candidateId,
  });
}

/** Fetch a single curriculum by id */
export function useCurriculum(id: string) {
  return useQuery({
    queryKey: curriculumKeys.detail(id),
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

/** Create a new curriculum */
export function useCreateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Curriculum, 'id' | 'createdAt' | 'updatedAt'>) => {
      const service = await getCurriculumsService();
      return service.createCurriculum(data);
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.list(created.candidateId) });
    },
  });
}

/** Update an existing curriculum */
export function useUpdateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Curriculum> }) => {
      const service = await getCurriculumsService();
      return service.updateCurriculum(id, updates);
    },
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: curriculumKeys.lists() });
    },
  });
}

/** Delete a curriculum */
export function useDeleteCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const service = await getCurriculumsService();
      return service.deleteCurriculum(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.all });
    },
  });
}

/** Set a curriculum as the default for a candidate */
export function useSetDefaultCurriculum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      candidateId,
      curriculumId,
    }: {
      candidateId: string;
      curriculumId: string;
    }) => {
      const service = await getCurriculumsService();
      return service.setDefault(candidateId, curriculumId);
    },
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: curriculumKeys.list(candidateId) });
      queryClient.invalidateQueries({ queryKey: curriculumKeys.details() });
    },
  });
}
