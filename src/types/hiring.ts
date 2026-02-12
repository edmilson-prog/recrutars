/**
 * Types for Hiring Flow
 * PRD-077: Fluxo de Contratacao e Transicao para Gestao de Equipes
 */

export interface Hiring {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  teamMemberId: string | null;
  departmentId: string;
  positionTitle: string;
  hireDate: string;
  salary: number | null;
  notes: string | null;
  daysToFill: number | null;
  daysInPipeline: number | null;
  pipelineStagesCount: number | null;
  matchScore: number | null;
  gaugeProStatus: string | null;
  hiredBy: string;
  createdAt: string;
}

export interface HireResult {
  hiringId: string;
  teamMemberId: string;
  hiredCount: number;
  positionsCount: number;
  allPositionsFilled: boolean;
  jobId: string;
  jobTitle: string;
  candidateName: string;
}

export interface CloseJobResult {
  jobId: string;
  action: 'talent_pool' | 'reject' | 'keep_active';
  affectedApplications: number;
  jobClosed: boolean;
}

export interface HireCandidateData {
  applicationId: string;
  departmentId: string;
  positionTitle: string;
  hireDate: string;
  salary?: number;
  notes?: string;
}

export interface CloseJobData {
  jobId: string;
  action: 'talent_pool' | 'reject' | 'keep_active';
  notify: boolean;
}
