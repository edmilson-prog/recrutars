/**
 * Types for Job Applications
 * PRD-004: Tipos e Interfaces TypeScript
 * PRD-007: Adicionado campo message
 * PRD-009: Adicionado status 'withdrawn' para desistência
 * PRD-015: Adicionado ApplicationNote e ApplicationHistory
 * PRD-016: Adicionado TestRequestStatus e campos de solicitação de teste
 */

export type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'hired' | 'withdrawn';

export type TestRequestStatus = 'nao_solicitado' | 'solicitado' | 'realizado';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  message?: string;
  appliedAt: string;
  updatedAt: string;
  testStatus: TestRequestStatus;
  testRequestedAt?: string;
  testDeadline?: string;
}

export interface ApplicationNote {
  id: string;
  applicationId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface ApplicationHistory {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}
