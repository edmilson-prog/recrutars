/**
 * Jobs React Query Hooks
 * PRD-066: Service Layer Core
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobsService } from '@/services/jobs/jobsService';
import type { JobFilters } from '@/services/jobs/jobsService';
import type { PaginationConfig, SortConfig } from '@/services/types';
import type { Job } from '@/types';

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters?: JobFilters, pagination?: PaginationConfig, sort?: SortConfig) =>
    [...jobKeys.lists(), { filters, pagination, sort }] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  byCompany: (companyId: string) => [...jobKeys.all, 'company', companyId] as const,
  search: (query: string, filters?: JobFilters) => [...jobKeys.all, 'search', query, filters] as const,
};

export function useJobs(filters?: JobFilters, pagination?: PaginationConfig, sort?: SortConfig) {
  return useQuery({
    queryKey: jobKeys.list(filters, pagination, sort),
    queryFn: async () => {
      const service = await getJobsService();
      return service.getJobs(filters, pagination, sort);
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async () => {
      const service = await getJobsService();
      return service.getJob(id);
    },
    enabled: !!id,
  });
}

export function useJobsByCompany(companyId: string) {
  return useQuery({
    queryKey: jobKeys.byCompany(companyId),
    queryFn: async () => {
      const service = await getJobsService();
      return service.getJobsByCompany(companyId);
    },
    enabled: !!companyId,
  });
}

export function useSearchJobs(query: string, filters?: JobFilters) {
  return useQuery({
    queryKey: jobKeys.search(query, filters),
    queryFn: async () => {
      const service = await getJobsService();
      return service.searchJobs(query, filters);
    },
    enabled: query.length > 0,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (job: Partial<Job>) => {
      const service = await getJobsService();
      return service.createJob(job);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Job> }) => {
      const service = await getJobsService();
      return service.updateJob(id, updates);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const service = await getJobsService();
      return service.deleteJob(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}
