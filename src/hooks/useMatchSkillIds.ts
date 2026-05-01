/**
 * useMatchSkillIds — combina os hooks de skills padronizadas do candidato e da vaga,
 * separando por tipo (technical/behavioral) e ordenando por priority.
 *
 * Retorna o input pronto para `calculateMatchBreakdown`.
 */
import { useMemo } from 'react';
import {
  useCandidateStandardizedSkills,
  useJobStandardizedSkills,
} from '@/hooks/useStandardizedSkillsQuery';
import type { MatchSkillsInput } from '@/types/disc';

export interface UseMatchSkillIdsResult {
  skillsInput: MatchSkillsInput | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function useMatchSkillIds(
  candidateId: string | undefined,
  jobId: string | undefined,
): UseMatchSkillIdsResult {
  const candidateQuery = useCandidateStandardizedSkills(candidateId ?? '');
  const jobQuery = useJobStandardizedSkills(jobId ?? '');

  const skillsInput = useMemo<MatchSkillsInput | undefined>(() => {
    if (!candidateQuery.data || !jobQuery.data) return undefined;

    const candTech = candidateQuery.data
      .filter((s) => s.skill?.type === 'technical')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);

    const candBeh = candidateQuery.data
      .filter((s) => s.skill?.type === 'behavioral')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);

    const jobTech = jobQuery.data
      .filter((s) => s.skill?.type === 'technical')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);

    const jobBeh = jobQuery.data
      .filter((s) => s.skill?.type === 'behavioral')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);

    return {
      candidateTechnical: candTech,
      candidateBehavioral: candBeh,
      jobTechnical: jobTech,
      jobBehavioral: jobBeh,
    };
  }, [candidateQuery.data, jobQuery.data]);

  return {
    skillsInput,
    isLoading: candidateQuery.isLoading || jobQuery.isLoading,
    isError: candidateQuery.isError || jobQuery.isError,
  };
}
