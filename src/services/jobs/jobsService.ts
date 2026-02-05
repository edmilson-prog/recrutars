/**
 * Jobs Service — Interface + Factory
 * PRD-066: Service Layer Core
 */

import type { Job } from '@/types';
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
