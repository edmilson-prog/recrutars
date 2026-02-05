/**
 * Interviews Service — Interface + Factory
 * PRD-067: Service Layer — Specialized Modules
 *
 * Manages interview scheduling between candidates and companies.
 */

import type { Interview, InterviewStatus } from '@/types/interview';

export interface InterviewFilters {
  candidateId?: string;
  companyId?: string;
  jobId?: string;
  status?: InterviewStatus;
}

export interface IInterviewsService {
  /** List interviews with optional filters */
  getInterviews(filters?: InterviewFilters): Promise<Interview[]>;

  /** Get a single interview by ID */
  getInterview(id: string): Promise<Interview | null>;

  /** Get all interviews for a candidate */
  getInterviewsByCandidate(candidateId: string): Promise<Interview[]>;

  /** Get all interviews for a company */
  getInterviewsByCompany(companyId: string): Promise<Interview[]>;

  /** Create a new interview */
  createInterview(data: Partial<Interview>): Promise<Interview>;

  /** Update an existing interview */
  updateInterview(id: string, updates: Partial<Interview>): Promise<Interview>;

  /** Confirm an interview with a chosen datetime */
  confirmInterview(id: string, datetime: string): Promise<Interview>;

  /** Cancel an interview with reason and optional details */
  cancelInterview(id: string, reason: string, details?: string): Promise<Interview>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: IInterviewsService | null = null;

export async function getInterviewsService(): Promise<IInterviewsService> {
  if (_instance) return _instance;

  const { InterviewsServiceSupabase } = await import('./interviewsService.supabase');
  _instance = new InterviewsServiceSupabase();
  return _instance;
}

export function resetInterviewsService(): void {
  _instance = null;
}
