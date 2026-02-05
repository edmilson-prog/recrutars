/**
 * Companies Service — Interface & Factory
 * PRD-066: Service Layer Pattern
 *
 * Provides CRUD operations for company data with
 * transparent switching between mock and Supabase backends.
 */

import type { Company } from '@/types/company';
import type { PaginatedResult, PaginationConfig, SortConfig } from '../types';

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface CompanyFilters {
  status?: Company['status'];
  search?: string;
  industry?: string;
  plan?: Company['plan'];
  paymentStatus?: Company['paymentStatus'];
}

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface ICompaniesService {
  getCompanies(
    filters?: CompanyFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<Company>>;

  getCompany(id: string): Promise<Company | null>;

  getCompanyByProfileId(profileId: string): Promise<Company | null>;

  updateCompany(
    id: string,
    updates: Partial<Company>,
  ): Promise<Company>;
}

// ---------------------------------------------------------------------------
// Singleton Factory
// ---------------------------------------------------------------------------

let _instance: ICompaniesService | null = null;

export async function getCompaniesService(): Promise<ICompaniesService> {
  if (_instance) return _instance;

  const { CompaniesServiceSupabase } = await import(
    './companiesService.supabase'
  );
  _instance = new CompaniesServiceSupabase();
  return _instance;
}

export function resetCompaniesService(): void {
  _instance = null;
}
