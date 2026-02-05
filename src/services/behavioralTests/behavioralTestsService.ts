/**
 * Behavioral Tests Service — Interface
 * PRD-066: Service Layer for legacy DISC behavioral tests
 *
 * Manages the original BehavioralTest entities (DISC-based)
 * that are sent to candidates by companies.
 */

import type { BehavioralTest, TestResult, TestStatus } from '@/types/test';

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface BehavioralTestFilters {
  candidateId?: string;
  companyId?: string;
  jobId?: string;
  status?: TestStatus;
}

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface IBehavioralTestsService {
  /** List tests with optional filters */
  getTests(filters?: BehavioralTestFilters): Promise<BehavioralTest[]>;

  /** Get a single test by id */
  getTest(id: string): Promise<BehavioralTest | null>;

  /** Get all tests for a specific candidate */
  getTestsByCandidate(candidateId: string): Promise<BehavioralTest[]>;

  /** Create a new behavioral test assignment */
  createTest(data: Omit<BehavioralTest, 'id'>): Promise<BehavioralTest>;

  /** Update fields on an existing test */
  updateTest(id: string, updates: Partial<BehavioralTest>): Promise<BehavioralTest>;

  /** Mark a test as completed and attach the result */
  completeTest(id: string, result: TestResult): Promise<BehavioralTest>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IBehavioralTestsService | null = null;

export async function getBehavioralTestsService(): Promise<IBehavioralTestsService> {
  if (_instance) return _instance;

  const { SupabaseBehavioralTestsService } = await import(
    './behavioralTestsService.supabase'
  );
  _instance = new SupabaseBehavioralTestsService();
  return _instance;
}
