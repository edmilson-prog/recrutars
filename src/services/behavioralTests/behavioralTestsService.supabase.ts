/**
 * Behavioral Tests Service — Supabase Implementation
 * PRD-066: Reads/writes from the behavioral_tests table
 */

import { supabase } from '@/lib/supabase';
import type { BehavioralTest, TestResult } from '@/types/test';
import type {
  IBehavioralTestsService,
  BehavioralTestFilters,
} from './behavioralTestsService';

// ---------------------------------------------------------------------------
// Row ↔ Domain mapping
// ---------------------------------------------------------------------------

interface BehavioralTestRow {
  id: string;
  candidate_id: string;
  candidate_name: string;
  company_id?: string;
  job_id?: string;
  status: string;
  sent_at: string;
  completed_at?: string;
  result?: Record<string, unknown>;
}

function rowToModel(row: BehavioralTestRow): BehavioralTest {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    candidateName: row.candidate_name,
    companyId: row.company_id,
    jobId: row.job_id,
    status: row.status as BehavioralTest['status'],
    sentAt: row.sent_at,
    completedAt: row.completed_at,
    result: row.result as TestResult | undefined,
  };
}

function modelToRow(
  model: Omit<BehavioralTest, 'id'>,
): Omit<BehavioralTestRow, 'id'> {
  return {
    candidate_id: model.candidateId,
    candidate_name: model.candidateName,
    company_id: model.companyId,
    job_id: model.jobId,
    status: model.status,
    sent_at: model.sentAt,
    completed_at: model.completedAt,
    result: model.result as Record<string, unknown> | undefined,
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

const TABLE = 'behavioral_tests';

export class SupabaseBehavioralTestsService implements IBehavioralTestsService {
  async getTests(filters?: BehavioralTestFilters): Promise<BehavioralTest[]> {
    let query = supabase.from(TABLE).select('*');

    if (filters?.candidateId) query = query.eq('candidate_id', filters.candidateId);
    if (filters?.companyId) query = query.eq('company_id', filters.companyId);
    if (filters?.jobId) query = query.eq('job_id', filters.jobId);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('sent_at', { ascending: false });
    if (error) throw error;
    return (data as BehavioralTestRow[]).map(rowToModel);
  }

  async getTest(id: string): Promise<BehavioralTest | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToModel(data as BehavioralTestRow) : null;
  }

  async getTestsByCandidate(candidateId: string): Promise<BehavioralTest[]> {
    return this.getTests({ candidateId });
  }

  async createTest(data: Omit<BehavioralTest, 'id'>): Promise<BehavioralTest> {
    const row = modelToRow(data);
    const { data: created, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return rowToModel(created as BehavioralTestRow);
  }

  async updateTest(
    id: string,
    updates: Partial<BehavioralTest>,
  ): Promise<BehavioralTest> {
    const partial: Record<string, unknown> = {};
    if (updates.candidateId !== undefined) partial.candidate_id = updates.candidateId;
    if (updates.candidateName !== undefined) partial.candidate_name = updates.candidateName;
    if (updates.companyId !== undefined) partial.company_id = updates.companyId;
    if (updates.jobId !== undefined) partial.job_id = updates.jobId;
    if (updates.status !== undefined) partial.status = updates.status;
    if (updates.sentAt !== undefined) partial.sent_at = updates.sentAt;
    if (updates.completedAt !== undefined) partial.completed_at = updates.completedAt;
    if (updates.result !== undefined) partial.result = updates.result;

    const { data, error } = await supabase
      .from(TABLE)
      .update(partial)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return rowToModel(data as BehavioralTestRow);
  }

  async completeTest(id: string, result: TestResult): Promise<BehavioralTest> {
    return this.updateTest(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      result,
    });
  }
}
