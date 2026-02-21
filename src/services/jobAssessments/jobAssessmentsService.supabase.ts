/**
 * Job Assessments Service — Supabase Implementation
 * PRD-048: Teste por Vaga
 */

import { supabase } from '@/lib/supabase';
import type {
  JobAssessment,
  JobAssessmentInvite,
  JobAssessmentResult,
  JobAssessmentStatus,
  RecruiterDecision,
  SelectedCompetencies,
  AIAnalysis,
  RecruiterAdjustments,
  BehavioralRedFlag,
  BehavioralResponse,
  AIRecommendation,
} from '@/types/assessment';
import type {
  IJobAssessmentsService,
  CreateJobAssessmentData,
  CreateInviteData,
} from './jobAssessmentsService';

// ── Row mappers ──────────────────────────────────────────────

function assessmentRowToModel(row: Record<string, unknown>): JobAssessment {
  return {
    id: row.id as string,
    jobId: row.job_id as string,
    companyId: row.company_id as string,
    title: row.title as string,
    status: row.status as JobAssessmentStatus,
    competencies: (row.competencies ?? {}) as SelectedCompetencies,
    questionsIds: (row.questions_ids ?? []) as string[],
    totalQuestions: (row.total_questions ?? 0) as number,
    estimatedMinutes: (row.estimated_minutes ?? 20) as number,
    expirationDays: (row.expiration_days ?? 7) as number,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function inviteRowToModel(row: Record<string, unknown>): JobAssessmentInvite {
  return {
    id: row.id as string,
    jobAssessmentId: row.job_assessment_id as string,
    type: row.type as JobAssessmentInvite['type'],
    candidateId: (row.candidate_id as string) || undefined,
    externalName: (row.external_name as string) || undefined,
    externalEmail: (row.external_email as string) || undefined,
    magicToken: (row.magic_token as string) || undefined,
    status: row.status as JobAssessmentInvite['status'],
    sentAt: row.sent_at as string,
    startedAt: (row.started_at as string) || undefined,
    completedAt: (row.completed_at as string) || undefined,
    expiresAt: row.expires_at as string,
  };
}

function resultRowToModel(row: Record<string, unknown>): JobAssessmentResult {
  return {
    id: row.id as string,
    inviteId: row.invite_id as string,
    jobAssessmentId: row.job_assessment_id as string,
    candidateId: row.candidate_id as string,
    candidateName: (row.candidate_name as string) || undefined,
    candidateEmail: (row.candidate_email as string) || undefined,
    overallScore: Number(row.overall_score) || 0,
    competencyScores: (row.competency_scores ?? {}) as Record<string, number>,
    aiAnalysis: (row.ai_analysis ?? {}) as AIAnalysis,
    aiRecommendation: (row.ai_recommendation ?? 'evaluate') as AIRecommendation,
    recruiterAdjustments: (row.recruiter_adjustments as RecruiterAdjustments) || undefined,
    recruiterDecision: (row.recruiter_decision as RecruiterDecision) || undefined,
    recruiterNotes: (row.recruiter_notes as string) || undefined,
    redFlags: (row.red_flags ?? []) as BehavioralRedFlag[],
    responses: (row.responses ?? []) as BehavioralResponse[],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ── Service Implementation ───────────────────────────────────

export class JobAssessmentsServiceSupabase implements IJobAssessmentsService {
  // ── Assessment CRUD ──────────────────────────────────────

  async getAssessmentByJobId(jobId: string): Promise<JobAssessment | null> {
    const { data, error } = await supabase
      .from('job_assessments')
      .select('*')
      .eq('job_id', jobId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch assessment by job: ${error.message}`);
    }

    return data ? assessmentRowToModel(data as Record<string, unknown>) : null;
  }

  async getAssessmentById(id: string): Promise<JobAssessment | null> {
    const { data, error } = await supabase
      .from('job_assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch assessment: ${error.message}`);
    }

    return data ? assessmentRowToModel(data as Record<string, unknown>) : null;
  }

  async getAssessmentsByCompany(companyId: string): Promise<JobAssessment[]> {
    const { data, error } = await supabase
      .from('job_assessments')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch assessments: ${error.message}`);
    }

    return (data ?? []).map((row) => assessmentRowToModel(row as Record<string, unknown>));
  }

  async createAssessment(input: CreateJobAssessmentData): Promise<JobAssessment> {
    const { data, error } = await supabase
      .from('job_assessments')
      .insert({
        job_id: input.jobId,
        company_id: input.companyId,
        title: input.title,
        status: input.status,
        competencies: input.competencies,
        questions_ids: input.questionsIds,
        total_questions: input.totalQuestions,
        estimated_minutes: input.estimatedMinutes,
        expiration_days: input.expirationDays,
        created_by: input.createdBy,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create assessment: ${error.message}`);
    }

    return assessmentRowToModel(data as Record<string, unknown>);
  }

  async updateAssessment(
    id: string,
    updates: Partial<CreateJobAssessmentData>,
  ): Promise<JobAssessment> {
    const payload: Record<string, unknown> = {};

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.competencies !== undefined) payload.competencies = updates.competencies;
    if (updates.questionsIds !== undefined) payload.questions_ids = updates.questionsIds;
    if (updates.totalQuestions !== undefined) payload.total_questions = updates.totalQuestions;
    if (updates.estimatedMinutes !== undefined) payload.estimated_minutes = updates.estimatedMinutes;
    if (updates.expirationDays !== undefined) payload.expiration_days = updates.expirationDays;

    const { data, error } = await supabase
      .from('job_assessments')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update assessment: ${error.message}`);
    }

    return assessmentRowToModel(data as Record<string, unknown>);
  }

  async publishAssessment(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_assessments')
      .update({ status: 'published' })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to publish assessment: ${error.message}`);
    }
  }

  async archiveAssessment(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_assessments')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to archive assessment: ${error.message}`);
    }
  }

  async deleteAssessment(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_assessments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete assessment: ${error.message}`);
    }
  }

  // ── Invites ──────────────────────────────────────────────

  async getInvitesByAssessmentId(assessmentId: string): Promise<JobAssessmentInvite[]> {
    const { data, error } = await supabase
      .from('job_assessment_invites')
      .select('*')
      .eq('job_assessment_id', assessmentId)
      .order('sent_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch invites: ${error.message}`);
    }

    return (data ?? []).map((row) => inviteRowToModel(row as Record<string, unknown>));
  }

  async createInvite(input: CreateInviteData): Promise<JobAssessmentInvite> {
    const expiresAt = new Date(
      Date.now() + input.expirationDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    const payload: Record<string, unknown> = {
      job_assessment_id: input.jobAssessmentId,
      type: input.type,
      status: 'pending',
      expires_at: expiresAt,
    };

    if (input.type === 'internal' && input.candidateId) {
      payload.candidate_id = input.candidateId;
    }

    if (input.type === 'magic_link') {
      payload.magic_token = crypto.randomUUID();
      if (input.externalName) payload.external_name = input.externalName;
      if (input.externalEmail) payload.external_email = input.externalEmail;
    }

    const { data, error } = await supabase
      .from('job_assessment_invites')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create invite: ${error.message}`);
    }

    return inviteRowToModel(data as Record<string, unknown>);
  }

  async createBulkInvites(invites: CreateInviteData[]): Promise<JobAssessmentInvite[]> {
    const rows = invites.map((input) => {
      const expiresAt = new Date(
        Date.now() + input.expirationDays * 24 * 60 * 60 * 1000,
      ).toISOString();

      const payload: Record<string, unknown> = {
        job_assessment_id: input.jobAssessmentId,
        type: input.type,
        status: 'pending',
        expires_at: expiresAt,
      };

      if (input.type === 'internal' && input.candidateId) {
        payload.candidate_id = input.candidateId;
      }

      if (input.type === 'magic_link') {
        payload.magic_token = crypto.randomUUID();
        if (input.externalName) payload.external_name = input.externalName;
        if (input.externalEmail) payload.external_email = input.externalEmail;
      }

      return payload;
    });

    const { data, error } = await supabase
      .from('job_assessment_invites')
      .insert(rows)
      .select('*');

    if (error) {
      throw new Error(`Failed to create bulk invites: ${error.message}`);
    }

    return (data ?? []).map((row) => inviteRowToModel(row as Record<string, unknown>));
  }

  async cancelInvite(inviteId: string): Promise<void> {
    const { error } = await supabase
      .from('job_assessment_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId)
      .in('status', ['pending']);

    if (error) {
      throw new Error(`Failed to cancel invite: ${error.message}`);
    }
  }

  async resendInvite(inviteId: string): Promise<void> {
    const newExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error } = await supabase
      .from('job_assessment_invites')
      .update({
        status: 'pending',
        sent_at: new Date().toISOString(),
        expires_at: newExpiresAt,
      })
      .eq('id', inviteId);

    if (error) {
      throw new Error(`Failed to resend invite: ${error.message}`);
    }
  }

  async getInviteByMagicToken(token: string): Promise<JobAssessmentInvite | null> {
    const { data, error } = await supabase
      .from('job_assessment_invites')
      .select('*')
      .eq('magic_token', token)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch invite by token: ${error.message}`);
    }

    if (!data) return null;

    const invite = inviteRowToModel(data as Record<string, unknown>);

    // Check expiration
    if (new Date(invite.expiresAt) < new Date()) {
      return null;
    }

    return invite;
  }

  // ── Results ──────────────────────────────────────────────

  async getResultsByAssessmentId(assessmentId: string): Promise<JobAssessmentResult[]> {
    const { data, error } = await supabase
      .from('job_assessment_results')
      .select('*')
      .eq('job_assessment_id', assessmentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }

    return (data ?? []).map((row) => resultRowToModel(row as Record<string, unknown>));
  }

  async getResultByInviteId(inviteId: string): Promise<JobAssessmentResult | null> {
    const { data, error } = await supabase
      .from('job_assessment_results')
      .select('*')
      .eq('invite_id', inviteId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch result: ${error.message}`);
    }

    return data ? resultRowToModel(data as Record<string, unknown>) : null;
  }

  async updateRecruiterDecision(
    resultId: string,
    decision: RecruiterDecision,
    notes?: string,
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      recruiter_decision: decision,
    };
    if (notes !== undefined) {
      payload.recruiter_notes = notes;
    }

    const { error } = await supabase
      .from('job_assessment_results')
      .update(payload)
      .eq('id', resultId);

    if (error) {
      throw new Error(`Failed to update recruiter decision: ${error.message}`);
    }
  }
}
