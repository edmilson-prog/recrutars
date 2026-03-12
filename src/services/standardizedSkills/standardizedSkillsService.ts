/**
 * Standardized Skills Service — Interface + Factory
 * Sistema padronizado de habilidades/competencias
 */

import type { StandardizedSkill, CandidateStandardizedSkill, JobStandardizedSkill } from '@/types/standardizedSkill';

export interface SkillSelection {
  skillId: string;
  priority: number;
}

export interface IStandardizedSkillsService {
  /** Get all 80 standardized skills (cached — rarely changes) */
  getAllSkills(): Promise<StandardizedSkill[]>;

  /** Get candidate's selected standardized skills ordered by priority */
  getCandidateSkills(candidateId: string): Promise<CandidateStandardizedSkill[]>;

  /** Replace all candidate standardized skills (delete-all + insert) */
  setCandidateSkills(candidateId: string, skills: SkillSelection[]): Promise<void>;

  /** Get job's selected standardized skills ordered by priority */
  getJobSkills(jobId: string): Promise<JobStandardizedSkill[]>;

  /** Replace all job standardized skills (delete-all + insert) */
  setJobSkills(jobId: string, skills: SkillSelection[]): Promise<void>;
}

let _instance: IStandardizedSkillsService | null = null;

export async function getStandardizedSkillsService(): Promise<IStandardizedSkillsService> {
  if (_instance) return _instance;

  const { StandardizedSkillsServiceSupabase } = await import('./standardizedSkillsService.supabase');
  _instance = new StandardizedSkillsServiceSupabase();
  return _instance;
}

export function resetStandardizedSkillsService(): void {
  _instance = null;
}
