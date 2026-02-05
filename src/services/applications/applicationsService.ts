/**
 * Applications Service — Interface + Factory
 * PRD-066: Service Layer Core
 *
 * Provides a unified API for managing job applications, notes, and status history.
 */

import type { Application, ApplicationNote, ApplicationHistory, ApplicationStatus, TestRequestStatus } from '@/types';
import type { PaginatedResult, SortConfig, PaginationConfig } from '../types';

export interface ApplicationFilters {
  candidateId?: string;
  jobId?: string;
  companyId?: string;
  status?: ApplicationStatus;
  testStatus?: TestRequestStatus;
}

export interface CreateApplicationData {
  jobId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  message?: string;
}

export interface IApplicationsService {
  getApplications(
    filters?: ApplicationFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<Application>>;

  getApplication(id: string): Promise<Application | null>;

  getApplicationsByCandidate(candidateId: string): Promise<Application[]>;

  getApplicationsByJob(jobId: string): Promise<Application[]>;

  createApplication(data: CreateApplicationData): Promise<Application>;

  updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    reason?: string,
  ): Promise<Application>;

  getNotes(applicationId: string): Promise<ApplicationNote[]>;

  addNote(applicationId: string, content: string): Promise<ApplicationNote>;

  getHistory(applicationId: string): Promise<ApplicationHistory[]>;
}

let _instance: IApplicationsService | null = null;

export async function getApplicationsService(): Promise<IApplicationsService> {
  if (_instance) return _instance;

  const { ApplicationsServiceSupabase } = await import('./applicationsService.supabase');
  _instance = new ApplicationsServiceSupabase();
  return _instance;
}

// Reset instance (for testing or when switching sources)
export function resetApplicationsService(): void {
  _instance = null;
}
