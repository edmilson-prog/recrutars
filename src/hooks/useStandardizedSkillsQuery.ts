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
  jobSkills: (jobId: string) => [...standardizedSkillKeys.all, 'job', jobId] as const,
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
