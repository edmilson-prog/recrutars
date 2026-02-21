/**
 * React Query Hooks — Cultural Profiles
 * PRD-042: Cultural Fit — Supabase Migration
 *
 * Provides data-fetching hooks for company cultural profile operations,
 * backed by the culturalProfiles service (Supabase).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { CompanyCulturalProfile } from '@/types/culturalFit';
import {
  getCulturalProfilesService,
  type UpsertCulturalProfilePayload,
} from '@/services/culturalProfiles/culturalProfilesService';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const culturalProfileKeys = {
  all: ['culturalProfiles'] as const,
  details: () => [...culturalProfileKeys.all, 'detail'] as const,
  detail: (companyId: string) =>
    [...culturalProfileKeys.details(), companyId] as const,
};

// ---------------------------------------------------------------------------
// useCulturalProfile — fetch cultural profile for a company
// ---------------------------------------------------------------------------

export function useCulturalProfile(
  companyId: string,
  options?: Omit<
    UseQueryOptions<CompanyCulturalProfile | null>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<CompanyCulturalProfile | null>({
    queryKey: culturalProfileKeys.detail(companyId),
    queryFn: async () => {
      const service = await getCulturalProfilesService();
      return service.getCulturalProfile(companyId);
    },
    enabled: !!companyId,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useUpsertCulturalProfile — save/update cultural profile
// ---------------------------------------------------------------------------

export function useUpsertCulturalProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertCulturalProfilePayload) => {
      const service = await getCulturalProfilesService();
      return service.upsertCulturalProfile(payload);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        culturalProfileKeys.detail(updated.companyId),
        updated,
      );
    },
  });
}
