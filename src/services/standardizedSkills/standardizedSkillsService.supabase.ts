/**
 * Standardized Skills Service — Supabase Implementation
 * Sistema padronizado de habilidades/competencias
 */

import { supabase } from '@/lib/supabase';
import type { StandardizedSkill, CandidateStandardizedSkill, JobStandardizedSkill } from '@/types/standardizedSkill';
import type { IStandardizedSkillsService, SkillSelection } from './standardizedSkillsService';

export class StandardizedSkillsServiceSupabase implements IStandardizedSkillsService {

  async getAllSkills(): Promise<StandardizedSkill[]> {
    const { data, error } = await supabase
      .from('standardized_skills')
      .select('*')
      .order('type')
      .order('category')
      .order('sort_order');

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.type as 'technical' | 'behavioral',
      category: row.category,
      sortOrder: row.sort_order,
    }));
  }

  async getCandidateSkills(candidateId: string): Promise<CandidateStandardizedSkill[]> {
    const { data, error } = await supabase
      .from('candidate_standardized_skills')
      .select('*, skill:standardized_skills(*)')
      .eq('candidate_id', candidateId)
      .order('priority');

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      candidateId: row.candidate_id,
      skillId: row.skill_id,
      priority: row.priority,
      skill: row.skill ? {
        id: row.skill.id,
        name: row.skill.name,
        slug: row.skill.slug,
        type: row.skill.type as 'technical' | 'behavioral',
        category: row.skill.category,
        sortOrder: row.skill.sort_order,
      } : undefined,
    }));
  }

  async getSkillsForCandidates(candidateIds: string[]): Promise<CandidateStandardizedSkill[]> {
    if (candidateIds.length === 0) return [];

    // PostgREST sends .in() as a GET request with every id in the query
    // string — large candidate lists (300+, as in the Banco de Talentos)
    // build a URL long enough to be rejected with a 400 by the server/proxy.
    // Chunking keeps each request well under that limit.
    const CHUNK_SIZE = 100;
    const chunks: string[][] = [];
    for (let i = 0; i < candidateIds.length; i += CHUNK_SIZE) {
      chunks.push(candidateIds.slice(i, i + CHUNK_SIZE));
    }

    const chunkResults = await Promise.all(
      chunks.map(async (chunk) => {
        const { data, error } = await supabase
          .from('candidate_standardized_skills')
          .select('*, skill:standardized_skills(*)')
          .in('candidate_id', chunk)
          .order('priority');

        if (error) throw error;
        return data ?? [];
      }),
    );

    const data = chunkResults.flat();

    return data.map((row) => ({
      id: row.id,
      candidateId: row.candidate_id,
      skillId: row.skill_id,
      priority: row.priority,
      skill: row.skill ? {
        id: row.skill.id,
        name: row.skill.name,
        slug: row.skill.slug,
        type: row.skill.type as 'technical' | 'behavioral',
        category: row.skill.category,
        sortOrder: row.skill.sort_order,
      } : undefined,
    }));
  }

  async setCandidateSkills(candidateId: string, skills: SkillSelection[]): Promise<void> {
    // Delete existing
    const { error: deleteError } = await supabase
      .from('candidate_standardized_skills')
      .delete()
      .eq('candidate_id', candidateId)
      .select();

    if (deleteError) throw deleteError;

    // Insert new selections
    if (skills.length > 0) {
      const rows = skills.map((s) => ({
        candidate_id: candidateId,
        skill_id: s.skillId,
        priority: s.priority,
      }));

      const { error: insertError } = await supabase
        .from('candidate_standardized_skills')
        .insert(rows);

      if (insertError) throw insertError;
    }

    // Sync candidates.skills TEXT[] for backward compatibility
    await this.syncCandidateSkillsArray(candidateId, skills);
  }

  async getJobSkills(jobId: string): Promise<JobStandardizedSkill[]> {
    const { data, error } = await supabase
      .from('job_standardized_skills')
      .select('*, skill:standardized_skills(*)')
      .eq('job_id', jobId)
      .order('priority');

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      jobId: row.job_id,
      skillId: row.skill_id,
      priority: row.priority,
      skill: row.skill ? {
        id: row.skill.id,
        name: row.skill.name,
        slug: row.skill.slug,
        type: row.skill.type as 'technical' | 'behavioral',
        category: row.skill.category,
        sortOrder: row.skill.sort_order,
      } : undefined,
    }));
  }

  async getSkillsForJobs(jobIds: string[]): Promise<JobStandardizedSkill[]> {
    if (jobIds.length === 0) return [];

    const { data, error } = await supabase
      .from('job_standardized_skills')
      .select('*, skill:standardized_skills(*)')
      .in('job_id', jobIds)
      .order('priority');

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      jobId: row.job_id,
      skillId: row.skill_id,
      priority: row.priority,
      skill: row.skill ? {
        id: row.skill.id,
        name: row.skill.name,
        slug: row.skill.slug,
        type: row.skill.type as 'technical' | 'behavioral',
        category: row.skill.category,
        sortOrder: row.skill.sort_order,
      } : undefined,
    }));
  }

  async setJobSkills(jobId: string, skills: SkillSelection[]): Promise<void> {
    // Delete existing
    const { error: deleteError } = await supabase
      .from('job_standardized_skills')
      .delete()
      .eq('job_id', jobId)
      .select();

    if (deleteError) throw deleteError;

    // Insert new selections
    if (skills.length > 0) {
      const rows = skills.map((s) => ({
        job_id: jobId,
        skill_id: s.skillId,
        priority: s.priority,
      }));

      const { error: insertError } = await supabase
        .from('job_standardized_skills')
        .insert(rows);

      if (insertError) throw insertError;
    }
  }

  /**
   * Syncs standardized skill names into candidates.skills TEXT[]
   * for backward compatibility with existing search/filter/match systems.
   */
  private async syncCandidateSkillsArray(candidateId: string, selections: SkillSelection[]): Promise<void> {
    if (selections.length === 0) {
      await supabase
        .from('candidates')
        .update({ skills: [] })
        .eq('id', candidateId);
      return;
    }

    // Fetch skill names for the selected IDs
    const skillIds = selections.map((s) => s.skillId);
    const { data: skillRows } = await supabase
      .from('standardized_skills')
      .select('id, name')
      .in('id', skillIds);

    if (!skillRows) return;

    // Build name array ordered by priority
    const idToName = new Map(skillRows.map((r) => [r.id, r.name]));
    const sortedSelections = [...selections].sort((a, b) => a.priority - b.priority);
    const skillNames = sortedSelections
      .map((s) => idToName.get(s.skillId))
      .filter(Boolean) as string[];

    await supabase
      .from('candidates')
      .update({ skills: skillNames })
      .eq('id', candidateId);
  }
}
