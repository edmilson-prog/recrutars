/**
 * React Query Hooks — Companies
 * PRD-066: Service Layer Pattern
 *
 * Provides data-fetching hooks for company operations,
 * backed by the companies service (mock or Supabase).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { Company } from '@/types/company';
import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types';
import {
  getCompaniesService,
  type CompanyFilters,
} from '@/services/companies/companiesService';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters?: CompanyFilters, pagination?: PaginationConfig, sort?: SortConfig) =>
    [...companyKeys.lists(), { filters, pagination, sort }] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  byProfile: (profileId: string) =>
    [...companyKeys.all, 'byProfile', profileId] as const,
};

// ---------------------------------------------------------------------------
// useCompanies — paginated list
// ---------------------------------------------------------------------------

export function useCompanies(
  filters?: CompanyFilters,
  pagination?: PaginationConfig,
  sort?: SortConfig,
  options?: Omit<
    UseQueryOptions<PaginatedResult<Company>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PaginatedResult<Company>>({
    queryKey: companyKeys.list(filters, pagination, sort),
    queryFn: async () => {
      const service = await getCompaniesService();
      return service.getCompanies(filters, pagination, sort);
    },
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useCompany — single by id
// ---------------------------------------------------------------------------

export function useCompany(
  id: string,
  options?: Omit<
    UseQueryOptions<Company | null>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<Company | null>({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const service = await getCompaniesService();
      return service.getCompany(id);
    },
    enabled: !!id,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useCompanyByProfile — single by profile/user id
// ---------------------------------------------------------------------------

export function useCompanyByProfile(
  profileId: string,
  options?: Omit<
    UseQueryOptions<Company | null>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<Company | null>({
    queryKey: companyKeys.byProfile(profileId),
    queryFn: async () => {
      const service = await getCompaniesService();
      return service.getCompanyByProfileId(profileId);
    },
    enabled: !!profileId,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useUpdateCompany — mutation
// ---------------------------------------------------------------------------

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Company>;
    }) => {
      const service = await getCompaniesService();
      return service.updateCompany(id, updates);
    },
    onSuccess: (updated) => {
      // Update the detail cache for this company
      queryClient.setQueryData(companyKeys.detail(updated.id), updated);
      // Invalidate list queries so they refetch
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      // Invalidate byProfile if userId is known
      if (updated.userId) {
        queryClient.invalidateQueries({
          queryKey: companyKeys.byProfile(updated.userId),
        });
      }
    },
  });
}
