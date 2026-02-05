/**
 * Interviews Service — Supabase Implementation
 * PRD-067: Service Layer — Specialized Modules
 *
 * Queries the interviews table.
 */

import type { Interview } from '@/types/interview';
import { supabase } from '@/lib/supabase';
import type { IInterviewsService, InterviewFilters } from './interviewsService';

export class InterviewsServiceSupabase implements IInterviewsService {
  async getInterviews(filters?: InterviewFilters): Promise<Interview[]> {
    let query = supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.candidateId) {
      query = query.eq('candidate_id', filters.candidateId);
    }
    if (filters?.companyId) {
      query = query.eq('company_id', filters.companyId);
    }
    if (filters?.jobId) {
      query = query.eq('job_id', filters.jobId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data ?? []).map(this.mapInterview);
  }

  async getInterview(id: string): Promise<Interview | null> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? this.mapInterview(data) : null;
  }

  async getInterviewsByCandidate(candidateId: string): Promise<Interview[]> {
    return this.getInterviews({ candidateId });
  }

  async getInterviewsByCompany(companyId: string): Promise<Interview[]> {
    return this.getInterviews({ companyId });
  }

  async createInterview(data: Partial<Interview>): Promise<Interview> {
    const { data: row, error } = await supabase
      .from('interviews')
      .insert({
        application_id: data.applicationId,
        job_id: data.jobId,
        job_title: data.jobTitle,
        company_id: data.companyId,
        company_name: data.companyName,
        candidate_id: data.candidateId,
        title: data.title,
        type: data.type ?? 'video',
        status: data.status ?? 'pending_candidate',
        proposed_slots: data.proposedSlots ? JSON.stringify(data.proposedSlots) : null,
        duration: data.duration ?? 60,
        video_link: data.videoLink ?? null,
        phone_number: data.phoneNumber ?? null,
        address: data.address ?? null,
        map_link: data.mapLink ?? null,
        interviewer_name: data.interviewerName ?? null,
        interviewer_role: data.interviewerRole ?? null,
        notes: data.notes ?? null,
        response_deadline: data.responseDeadline ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapInterview(row);
  }

  async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
    const updatePayload: Record<string, unknown> = {};

    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.confirmedDatetime !== undefined) updatePayload.confirmed_datetime = updates.confirmedDatetime;
    if (updates.confirmedAt !== undefined) updatePayload.confirmed_at = updates.confirmedAt;
    if (updates.completedAt !== undefined) updatePayload.completed_at = updates.completedAt;
    if (updates.cancelledAt !== undefined) updatePayload.cancelled_at = updates.cancelledAt;
    if (updates.cancellationReason !== undefined) updatePayload.cancellation_reason = updates.cancellationReason;
    if (updates.cancellationDetails !== undefined) updatePayload.cancellation_details = updates.cancellationDetails;
    if (updates.suggestedSlots !== undefined) updatePayload.suggested_slots = JSON.stringify(updates.suggestedSlots);
    if (updates.suggestionReason !== undefined) updatePayload.suggestion_reason = updates.suggestionReason;
    if (updates.proposedSlots !== undefined) updatePayload.proposed_slots = JSON.stringify(updates.proposedSlots);
    if (updates.videoLink !== undefined) updatePayload.video_link = updates.videoLink;
    if (updates.phoneNumber !== undefined) updatePayload.phone_number = updates.phoneNumber;
    if (updates.address !== undefined) updatePayload.address = updates.address;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.duration !== undefined) updatePayload.duration = updates.duration;

    const { data, error } = await supabase
      .from('interviews')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.mapInterview(data);
  }

  async confirmInterview(id: string, datetime: string): Promise<Interview> {
    return this.updateInterview(id, {
      status: 'confirmed',
      confirmedDatetime: datetime,
      confirmedAt: new Date().toISOString(),
    });
  }

  async cancelInterview(id: string, reason: string, details?: string): Promise<Interview> {
    const status = reason.startsWith('company:')
      ? 'cancelled_by_company' as const
      : 'cancelled_by_candidate' as const;

    const cleanReason = reason.replace(/^(company|candidate):/, '');

    return this.updateInterview(id, {
      status,
      cancellationReason: cleanReason,
      cancellationDetails: details,
      cancelledAt: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------------------------
  // Mapper (snake_case DB -> camelCase TS)
  // ---------------------------------------------------------------------------

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapInterview(row: any): Interview {
    return {
      id: row.id,
      applicationId: row.application_id,
      jobId: row.job_id,
      jobTitle: row.job_title,
      companyId: row.company_id,
      companyName: row.company_name,
      candidateId: row.candidate_id,
      title: row.title,
      type: row.type,
      status: row.status,
      proposedSlots: row.proposed_slots ? JSON.parse(row.proposed_slots) : undefined,
      suggestedSlots: row.suggested_slots ? JSON.parse(row.suggested_slots) : undefined,
      suggestionReason: row.suggestion_reason ?? undefined,
      confirmedDatetime: row.confirmed_datetime ?? undefined,
      duration: row.duration,
      videoLink: row.video_link ?? undefined,
      phoneNumber: row.phone_number ?? undefined,
      address: row.address ?? undefined,
      mapLink: row.map_link ?? undefined,
      interviewerName: row.interviewer_name ?? undefined,
      interviewerRole: row.interviewer_role ?? undefined,
      notes: row.notes ?? undefined,
      responseDeadline: row.response_deadline ?? undefined,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at ?? undefined,
      completedAt: row.completed_at ?? undefined,
      cancelledAt: row.cancelled_at ?? undefined,
      cancellationReason: row.cancellation_reason ?? undefined,
      cancellationDetails: row.cancellation_details ?? undefined,
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
