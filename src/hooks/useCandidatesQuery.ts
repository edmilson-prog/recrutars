/**
 * React Query Hooks — Candidates
 * PRD-066: Service Layer Pattern
 *
 * Provides data-fetching hooks for candidate operations,
 * backed by the candidates service (mock or Supabase).
 */

import { useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { Candidate } from '@/types/candidate';
import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types';
import {
  getCandidatesService,
  type CandidateFilters,
} from '@/services/candidates/candidatesService';
import { fetchAllPages } from '@/lib/fetchAllPages';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters?: CandidateFilters, pagination?: PaginationConfig, sort?: SortConfig) =>
    [...candidateKeys.lists(), { filters, pagination, sort }] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
  byIds: (ids: string[]) => [...candidateKeys.all, 'byIds', ids] as const,
  byProfile: (profileId: string) =>
    [...candidateKeys.all, 'byProfile', profileId] as const,
};

// ---------------------------------------------------------------------------
// useCandidates — paginated list
// ---------------------------------------------------------------------------

export function useCandidates(
  filters?: CandidateFilters,
  pagination?: PaginationConfig,
  sort?: SortConfig,
  options?: Omit<
    UseQueryOptions<PaginatedResult<Candidate>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PaginatedResult<Candidate>>({
    queryKey: candidateKeys.list(filters, pagination, sort),
    queryFn: async () => {
      const service = await getCandidatesService();
      return service.getCandidates(filters, pagination, sort);
    },
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useCandidate — single by id
// ---------------------------------------------------------------------------

export function useCandidate(
  id: string,
  options?: Omit<
    UseQueryOptions<Candidate | null>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<Candidate | null>({
    queryKey: candidateKeys.detail(id),
    queryFn: async () => {
      const service = await getCandidatesService();
      return service.getCandidate(id);
    },
    enabled: !!id,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useCandidatesByIds — resolves a known, bounded set of candidates by id.
// Prefer this over fetching the whole table when a screen only needs to join
// candidate data (name, avatar...) onto records it already holds — e.g.
// applications, conversations, interviews or favorites. Fetching a capped
// page and filtering client-side silently drops candidates outside that page.
// ---------------------------------------------------------------------------

export function useCandidatesByIds(
  ids: string[],
  options?: Omit<UseQueryOptions<Candidate[]>, 'queryKey' | 'queryFn'>,
) {
  // Deduped + sorted so the cache key is stable regardless of input order,
  // and so re-renders with an equivalent id list reuse the same query.
  const normalizedIds = useMemo(
    () => Array.from(new Set(ids.filter(Boolean))).sort(),
    [ids],
  );

  return useQuery<Candidate[]>({
    queryKey: candidateKeys.byIds(normalizedIds),
    queryFn: async () => {
      const service = await getCandidatesService();
      return service.getCandidatesByIds(normalizedIds);
    },
    enabled: normalizedIds.length > 0,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useCandidateByProfile — single by profile/user id
// ---------------------------------------------------------------------------

export function useCandidateByProfile(
  profileId: string,
  options?: Omit<
    UseQueryOptions<Candidate | null>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<Candidate | null>({
    queryKey: candidateKeys.byProfile(profileId),
    queryFn: async () => {
      const service = await getCandidatesService();
      return service.getCandidateByProfileId(profileId);
    },
    enabled: !!profileId,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useUpdateCandidate — mutation
// ---------------------------------------------------------------------------

export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Candidate>;
    }) => {
      const service = await getCandidatesService();
      return service.updateCandidate(id, updates);
    },
    onSuccess: (updated) => {
      // Update the detail cache for this candidate
      queryClient.setQueryData(candidateKeys.detail(updated.id), updated);
      // Invalidate list queries so they refetch
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      // Invalidate byProfile (userId always exists in Candidate type)
      queryClient.invalidateQueries({
        queryKey: candidateKeys.byProfile(updated.userId),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// useAllCandidates — fetches every candidate matching filters, no hardcoded
// page-size cap. Use ONLY when the screen genuinely needs the full dataset
// in memory (e.g. client-side match scoring in the Talent Pool) — for
// paginated lists, use useCandidates with real page/pageSize instead.
// ---------------------------------------------------------------------------

export function useAllCandidates(
  filters?: CandidateFilters,
  sort?: SortConfig,
  options?: Omit<UseQueryOptions<Candidate[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Candidate[]>({
    queryKey: [...candidateKeys.lists(), 'all', { filters, sort }],
    queryFn: async () => {
      const service = await getCandidatesService();
      return fetchAllPages((pagination) => service.getCandidates(filters, pagination, sort));
    },
    ...options,
  });
}
