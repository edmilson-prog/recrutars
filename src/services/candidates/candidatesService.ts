/**
 * Candidates Service — Interface & Factory
 * PRD-066: Service Layer Pattern
 *
 * Provides CRUD operations for candidate data with
 * transparent switching between mock and Supabase backends.
 */

import type { Candidate } from '@/types/candidate';
import type { PaginatedResult, PaginationConfig, SortConfig } from '../types';

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface CandidateFilters {
  status?: Candidate['status'];
  search?: string;
  skills?: string[];
  location?: string;
  hasTest?: boolean;
  plan?: Candidate['plan'];
}

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface ICandidatesService {
  getCandidates(
    filters?: CandidateFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<Candidate>>;

  getCandidate(id: string): Promise<Candidate | null>;

  getCandidateByProfileId(profileId: string): Promise<Candidate | null>;

  updateCandidate(
    id: string,
    updates: Partial<Candidate>,
  ): Promise<Candidate>;
}

// ---------------------------------------------------------------------------
// Singleton Factory
// ---------------------------------------------------------------------------

let _instance: ICandidatesService | null = null;

export async function getCandidatesService(): Promise<ICandidatesService> {
  if (_instance) return _instance;

  const { CandidatesServiceSupabase } = await import(
    './candidatesService.supabase'
  );
  _instance = new CandidatesServiceSupabase();
  return _instance;
}

export function resetCandidatesService(): void {
  _instance = null;
}
