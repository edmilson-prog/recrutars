/**
 * Hirings Service — Supabase Implementation
 * PRD-077: Fluxo de Contratacao e Transicao para Gestao de Equipes
 *
 * Uses PostgreSQL RPC functions for atomic operations.
 */

import { supabase } from '@/lib/supabase';
import type { Hiring, HireResult, HireCandidateData, CloseJobResult, CloseJobData } from '@/types/hiring';
import type { IHiringsService } from './hiringsService';

export class HiringsServiceSupabase implements IHiringsService {
  async hireCandidate(data: HireCandidateData): Promise<HireResult> {
    const { data: result, error } = await supabase.rpc('hire_candidate', {
      p_application_id: data.applicationId,
      p_department_id: data.departmentId,
      p_position_title: data.positionTitle,
      p_hire_date: data.hireDate,
      p_salary: data.salary ?? null,
      p_notes: data.notes ?? null,
    });

    if (error) throw new Error(error.message);

    const r = result as Record<string, unknown>;
    return {
      hiringId: r.hiring_id as string,
      teamMemberId: r.team_member_id as string,
      hiredCount: r.hired_count as number,
      positionsCount: r.positions_count as number,
      allPositionsFilled: r.all_positions_filled as boolean,
      jobId: r.job_id as string,
      jobTitle: r.job_title as string,
      candidateName: r.candidate_name as string,
    };
  }

  async closeJobWithRemaining(data: CloseJobData): Promise<CloseJobResult> {
    const { data: result, error } = await supabase.rpc('close_job_with_remaining', {
      p_job_id: data.jobId,
      p_action: data.action,
      p_notify: data.notify,
    });

    if (error) throw new Error(error.message);

    const r = result as Record<string, unknown>;
    return {
      jobId: r.job_id as string,
      action: r.action as CloseJobResult['action'],
      affectedApplications: r.affected_applications as number,
      jobClosed: r.job_closed as boolean,
    };
  }

  async getHiringsByJob(jobId: string): Promise<Hiring[]> {
    const { data, error } = await supabase
      .from('hirings')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(this.mapHiring);
  }

  async getHiredCountForJob(jobId: string): Promise<number> {
    const { count, error } = await supabase
      .from('hirings')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async isAlreadyTeamMember(
    candidateId: string,
    companyId: string,
  ): Promise<{ exists: boolean; hireDate?: string }> {
    const { data, error } = await supabase
      .from('team_members')
      .select('id, hire_date')
      .eq('imported_from_candidate_id', candidateId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) {
      return { exists: true, hireDate: data.hire_date ?? undefined };
    }
    return { exists: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapHiring(row: any): Hiring {
    return {
      id: row.id,
      applicationId: row.application_id,
      jobId: row.job_id,
      candidateId: row.candidate_id,
      companyId: row.company_id,
      teamMemberId: row.team_member_id ?? null,
      departmentId: row.department_id,
      positionTitle: row.position_title,
      hireDate: row.hire_date,
      salary: row.salary ? Number(row.salary) : null,
      notes: row.notes ?? null,
      daysToFill: row.days_to_fill ?? null,
      daysInPipeline: row.days_in_pipeline ?? null,
      pipelineStagesCount: row.pipeline_stages_count ?? null,
      matchScore: row.match_score ?? null,
      gaugeProStatus: row.gauge_pro_status ?? null,
      hiredBy: row.hired_by,
      createdAt: row.created_at,
    };
  }
}
