/**
 * Types for Candidates
 * PRD-004: Tipos e Interfaces TypeScript
 * PRD-005: Experience e Education adicionadas
 */

import type { BehavioralTest } from './test';
import type { SalaryRange } from './job';

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear?: string;
}

// PRD-021: Status do candidato (admin view)
export type CandidateStatus = 'active' | 'inactive';

// PRD-021: Histórico de ações administrativas em candidatos
export interface CandidateAdminAction {
  id: string;
  candidateId: string;
  candidateName: string;
  action: 'activated' | 'deactivated' | 'test_reset' | 'notification_sent';
  performedBy: string;
  performedAt: string;
  details?: string;
}

export interface Candidate {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  title: string;
  location: string;
  experience: number;
  education: string;
  skills: string[];
  salary: SalaryRange;
  availability: string;
  profileCompletion: number;
  hasTest: boolean;
  testResult?: BehavioralTest;

  // PRD-021: Campos administrativos
  status: CandidateStatus;
  createdAt: string;
  deactivatedAt?: string;
  phone?: string;
  linkedin?: string;
}
