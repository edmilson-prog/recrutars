/**
 * Company Tests Service — Interface + Factory
 * Hub de Testes Comportamentais (company-side)
 */

import type {
  CompanyTest,
  CompanyTestStatus,
  TestInvitation,
  CompanyTestResult,
  AuditLog,
  AuditAction,
  HubDashboardKPIs,
  CompanyCandidate,
  CompanyTeamMemberForInvite,
  CreateInvitationInput,
} from '@/types/companyTest';

export interface CompanyTestFilters {
  companyId?: string;
  status?: CompanyTestStatus;
  search?: string;
  jobId?: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  limit?: number;
}

export interface ICompanyTestsService {
  // Tests CRUD
  getTests(companyId: string, filters?: CompanyTestFilters): Promise<CompanyTest[]>;
  getTest(id: string): Promise<CompanyTest | null>;
  createTest(data: Partial<CompanyTest> & { companyId: string; name: string; templateId: string }): Promise<CompanyTest>;
  updateTest(id: string, updates: Partial<CompanyTest>): Promise<CompanyTest>;

  // Invitations
  getInvitations(testId: string): Promise<TestInvitation[]>;
  getInvitationByToken(token: string): Promise<TestInvitation | null>;
  updateInvitationStatus(id: string, status: string, timestamps?: Record<string, string>): Promise<void>;

  // Public Links
  updatePublicLink(testId: string, slug: string, active: boolean): Promise<CompanyTest>;
  getTestBySlug(slug: string): Promise<CompanyTest | null>;

  // Results
  getResults(testId: string): Promise<CompanyTestResult[]>;
  getResult(id: string): Promise<CompanyTestResult | null>;
  updateShortlist(resultId: string, shortlisted: boolean, notes?: string): Promise<void>;

  // Company Candidates (for "Da Base" tab)
  getCompanyCandidates(companyId: string, search?: string): Promise<CompanyCandidate[]>;
  getCompanyTeamMembers(companyId: string, search?: string): Promise<CompanyTeamMemberForInvite[]>;

  // Audit
  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void>;
  getAuditLogs(companyId: string, filters?: AuditLogFilters): Promise<AuditLog[]>;

  // Dashboard
  getStats(companyId: string): Promise<HubDashboardKPIs>;
}

let _instance: ICompanyTestsService | null = null;

export async function getCompanyTestsService(): Promise<ICompanyTestsService> {
  if (_instance) return _instance;

  const { CompanyTestsServiceSupabase } = await import('./companyTestsService.supabase');
  _instance = new CompanyTestsServiceSupabase();
  return _instance;
}

export function resetCompanyTestsService(): void {
  _instance = null;
}
