/**
 * Job Assessments Service — Interface + Factory
 * PRD-048: Teste por Vaga
 */

import type {
  JobAssessment,
  JobAssessmentInvite,
  JobAssessmentResult,
  JobAssessmentStatus,
  RecruiterDecision,
} from '@/types/assessment';

export interface CreateJobAssessmentData {
  jobId: string;
  companyId: string;
  title: string;
  status: JobAssessmentStatus;
  competencies: JobAssessment['competencies'];
  questionsIds: string[];
  totalQuestions: number;
  estimatedMinutes: number;
  expirationDays: number;
  createdBy: string;
}

export interface CreateInviteData {
  jobAssessmentId: string;
  type: 'internal' | 'magic_link';
  candidateId?: string;
  externalName?: string;
  externalEmail?: string;
  expirationDays: number;
}

export interface IJobAssessmentsService {
  // Assessment CRUD
  getAssessmentByJobId(jobId: string): Promise<JobAssessment | null>;
  getAssessmentById(id: string): Promise<JobAssessment | null>;
  getAssessmentsByCompany(companyId: string): Promise<JobAssessment[]>;
  createAssessment(data: CreateJobAssessmentData): Promise<JobAssessment>;
  updateAssessment(id: string, updates: Partial<CreateJobAssessmentData>): Promise<JobAssessment>;
  publishAssessment(id: string): Promise<void>;
  archiveAssessment(id: string): Promise<void>;
  deleteAssessment(id: string): Promise<void>;

  // Invites
  getInvitesByAssessmentId(assessmentId: string): Promise<JobAssessmentInvite[]>;
  createInvite(data: CreateInviteData): Promise<JobAssessmentInvite>;
  createBulkInvites(invites: CreateInviteData[]): Promise<JobAssessmentInvite[]>;
  cancelInvite(inviteId: string): Promise<void>;
  resendInvite(inviteId: string): Promise<void>;
  getInviteByMagicToken(token: string): Promise<JobAssessmentInvite | null>;

  // Results
  getResultsByAssessmentId(assessmentId: string): Promise<JobAssessmentResult[]>;
  getResultByInviteId(inviteId: string): Promise<JobAssessmentResult | null>;
  updateRecruiterDecision(
    resultId: string,
    decision: RecruiterDecision,
    notes?: string,
  ): Promise<void>;
}

let _instance: IJobAssessmentsService | null = null;

export async function getJobAssessmentsService(): Promise<IJobAssessmentsService> {
  if (_instance) return _instance;

  const { JobAssessmentsServiceSupabase } = await import('./jobAssessmentsService.supabase');
  _instance = new JobAssessmentsServiceSupabase();
  return _instance;
}

export function resetJobAssessmentsService(): void {
  _instance = null;
}
