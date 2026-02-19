/**
 * Jobs Service — Interface + Factory
 * PRD-066: Service Layer Core
 */

import type { Job } from '@/types';
import type { AdminJob } from '@/types/adminJobs';
import type { PaginatedResult, SortConfig, PaginationConfig } from '../types';

export interface JobFilters {
  companyId?: string;
  status?: string;
  area?: string;
  type?: string;
  level?: string;
  search?: string;
  moderationStatus?: string;
  includeModeration?: boolean;
}

export interface IJobsService {
  getJobs(filters?: JobFilters, pagination?: PaginationConfig, sort?: SortConfig): Promise<PaginatedResult<Job>>;
  getJob(id: string): Promise<Job | null>;
  getJobsByCompany(companyId: string): Promise<Job[]>;
  createJob(job: Partial<Job>): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  searchJobs(query: string, filters?: JobFilters): Promise<Job[]>;
  // Admin moderation methods
  getAdminJobs(): Promise<AdminJob[]>;
  approveJob(id: string, moderatedBy?: string): Promise<void>;
  rejectJob(id: string, reason: string, moderatedBy?: string): Promise<void>;
  requestCorrectionJob(id: string, fields: string[], moderatedBy?: string): Promise<void>;
  toggleHighlight(id: string, isHighlighted: boolean, highlightedUntil?: string): Promise<void>;
  addAdminNote(id: string, note: string): Promise<void>;
  // Filter helpers
  getJobLocations(): Promise<string[]>;
}

let _instance: IJobsService | null = null;

export async function getJobsService(): Promise<IJobsService> {
  if (_instance) return _instance;

  const { JobsServiceSupabase } = await import('./jobsService.supabase');
  _instance = new JobsServiceSupabase();
  return _instance;
}

// Reset instance (for testing or when switching sources)
export function resetJobsService(): void {
  _instance = null;
}
