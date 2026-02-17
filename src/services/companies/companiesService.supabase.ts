/**
 * Companies Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 *
 * Reads/writes the `companies` table via the Supabase client
 * and converts rows with companyRowToCompany.
 */

import { supabase } from '@/lib/supabase';
import { companyRowToCompany } from '@/lib/supabaseConverters';
import type { Company } from '@/types/company';
import type { PaginatedResult, PaginationConfig, SortConfig } from '../types';
import type { CompanyFilters, ICompaniesService } from './companiesService';

// Map camelCase sort fields to snake_case DB columns
const SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  industry: 'industry',
  location: 'location',
  status: 'status',
  plan: 'plan',
  createdAt: 'created_at',
  activeJobs: 'active_jobs',
  totalCandidates: 'total_candidates',
  paymentStatus: 'payment_status',
};

export class CompaniesServiceSupabase implements ICompaniesService {
  // -----------------------------------------------------------------------
  // List with filters, pagination and sorting
  // -----------------------------------------------------------------------

  async getCompanies(
    filters?: CompanyFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<Company>> {
    let query = supabase.from('companies').select('*', { count: 'exact' });

    // --- Filters -----------------------------------------------------------

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      const term = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${term},cnpj.ilike.${term},industry.ilike.${term},description.ilike.${term}`,
      );
    }

    if (filters?.industry) {
      query = query.ilike('industry', `%${filters.industry}%`);
    }

    if (filters?.plan) {
      query = query.eq('plan', filters.plan);
    }

    if (filters?.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    // --- Sorting -----------------------------------------------------------

    if (sort) {
      const column = SORT_FIELD_MAP[sort.field] ?? sort.field;
      query = query.order(column, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // --- Pagination --------------------------------------------------------

    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // --- Execute -----------------------------------------------------------

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    const total = count ?? 0;
    const companies = (data ?? []).map(companyRowToCompany);

    return {
      data: companies,
      total,
      page,
      pageSize,
      hasMore: from + pageSize < total,
    };
  }

  // -----------------------------------------------------------------------
  // Single record by id
  // -----------------------------------------------------------------------

  async getCompany(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch company: ${error.message}`);
    }

    return data ? companyRowToCompany(data) : null;
  }

  // -----------------------------------------------------------------------
  // Single record by profile (user) id
  // -----------------------------------------------------------------------

  async getCompanyByProfileId(profileId: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch company by profile: ${error.message}`);
    }

    return data ? companyRowToCompany(data) : null;
  }

  // -----------------------------------------------------------------------
  // Update
  // -----------------------------------------------------------------------

  async updateCompany(
    id: string,
    updates: Partial<Company>,
  ): Promise<Company> {
    // Convert camelCase updates to snake_case DB columns
    const dbUpdates: Record<string, unknown> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.cnpj !== undefined) dbUpdates.cnpj = updates.cnpj;
    if (updates.logo !== undefined) dbUpdates.logo_url = updates.logo;
    if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
    if (updates.size !== undefined) dbUpdates.size = updates.size;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.linkedin !== undefined) dbUpdates.linkedin = updates.linkedin;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.activeJobs !== undefined) dbUpdates.active_jobs = updates.activeJobs;
    if (updates.totalCandidates !== undefined) dbUpdates.total_candidates = updates.totalCandidates;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
    if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
    if (updates.deactivatedAt !== undefined) dbUpdates.deactivated_at = updates.deactivatedAt;
    // PRD-078: Campos CNPJ / Minha Receita
    if (updates.razaoSocial !== undefined) dbUpdates.razao_social = updates.razaoSocial;
    if (updates.nomeFantasia !== undefined) dbUpdates.nome_fantasia = updates.nomeFantasia;
    if (updates.cep !== undefined) dbUpdates.cep = updates.cep;
    if (updates.logradouro !== undefined) dbUpdates.logradouro = updates.logradouro;
    if (updates.numero !== undefined) dbUpdates.numero = updates.numero;
    if (updates.complemento !== undefined) dbUpdates.complemento = updates.complemento;
    if (updates.bairro !== undefined) dbUpdates.bairro = updates.bairro;
    if (updates.situacaoCadastral !== undefined) dbUpdates.situacao_cadastral = updates.situacaoCadastral;

    const { data, error } = await supabase
      .from('companies')
      .update(dbUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update company: ${error.message}`);
    }

    return companyRowToCompany(data);
  }
}
