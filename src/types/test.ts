/**
 * Types for Behavioral Tests (Gauge-Pro)
 * PRD-004: Tipos e Interfaces TypeScript
 */

export type TestStatus = 'sent' | 'in_progress' | 'completed';

export interface TestResult {
  dominance: number;
  influence: number;
  steadiness: number;
  compliance: number;
  profile: string;
  strengths: string[];
  watchPoints: string[];
}

export interface BehavioralTest {
  id: string;
  candidateId: string;
  candidateName: string;
  companyId?: string;
  jobId?: string;
  status: TestStatus;
  sentAt: string;
  completedAt?: string;
  result?: TestResult;
}
