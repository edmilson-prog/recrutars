/**
 * Standardized Skills React Query Hooks
 * Sistema padronizado de habilidades/competencias
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStandardizedSkillsService } from '@/services/standardizedSkills/standardizedSkillsService';
import type { SkillSelection } from '@/services/standardizedSkills/standardizedSkillsService';

export const standardizedSkillKeys = {
  all: ['standardized-skills'] as const,
  catalog: () => [...standardizedSkillKeys.all, 'catalog'] as const,
  candidateSkills: (candidateId: string) => [...standardizedSkillKeys.all, 'candidate', candidateId] as const,
  candidateSkillsBulk: (candidateIds: string[]) =>
    [...standardizedSkillKeys.all, 'candidates-bulk', [...candidateIds].sort()] as const,
  jobSkills: (jobId: string) => [...standardizedSkillKeys.all, 'job', jobId] as const,
  jobSkillsBulk: (jobIds: string[]) =>
    [...standardizedSkillKeys.all, 'jobs-bulk', [...jobIds].sort()] as const,
};

/** Fetch the full catalog of 80 standardized skills (cached for the session) */
export function useSkillCatalog() {
  return useQuery({
    queryKey: standardizedSkillKeys.catalog(),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getAllSkills();
    },
    staleTime: Infinity, // Static data — never refetch unless invalidated
  });
}

/** Fetch a candidate's selected standardized skills */
export function useCandidateStandardizedSkills(candidateId: string) {
  return useQuery({
    queryKey: standardizedSkillKeys.candidateSkills(candidateId),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getCandidateSkills(candidateId);
    },
    enabled: !!candidateId,
  });
}

/** Fetch a job's selected standardized skills */
export function useJobStandardizedSkills(jobId: string) {
  return useQuery({
    queryKey: standardizedSkillKeys.jobSkills(jobId),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getJobSkills(jobId);
    },
    enabled: !!jobId,
  });
}

/**
 * Bulk fetch standardized skills for many candidates in a single query.
 * Use this instead of mapping useCandidateStandardizedSkills over a list —
 * one query per candidate causes an N+1 request storm on list pages.
 */
export function useCandidatesStandardizedSkills(candidateIds: string[]) {
  return useQuery({
    queryKey: standardizedSkillKeys.candidateSkillsBulk(candidateIds),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getSkillsForCandidates(candidateIds);
    },
    enabled: candidateIds.length > 0,
  });
}

/**
 * Bulk fetch standardized skills for many jobs in a single query.
 * Use this instead of mapping useJobStandardizedSkills over a list —
 * one query per job causes an N+1 request storm on list pages.
 */
export function useJobsStandardizedSkills(jobIds: string[]) {
  return useQuery({
    queryKey: standardizedSkillKeys.jobSkillsBulk(jobIds),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getSkillsForJobs(jobIds);
    },
    enabled: jobIds.length > 0,
  });
}

/** Mutation to set/replace all candidate standardized skills */
export function useSetCandidateSkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, skills }: { candidateId: string; skills: SkillSelection[] }) => {
      const service = await getStandardizedSkillsService();
      return service.setCandidateSkills(candidateId, skills);
    },
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: standardizedSkillKeys.candidateSkills(candidateId) });
      // Also invalidate candidate profile queries for backward compatibility
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

/** Mutation to set/replace all job standardized skills */
export function useSetJobSkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, skills }: { jobId: string; skills: SkillSelection[] }) => {
      const service = await getStandardizedSkillsService();
      return service.setJobSkills(jobId, skills);
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: standardizedSkillKeys.jobSkills(jobId) });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
