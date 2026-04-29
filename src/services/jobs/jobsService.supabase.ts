/**
 * Jobs Service — Supabase Implementation
 * PRD-066: Service Layer Core
 *
 * Queries the `jobs` table with a join on `companies` for name/logo.
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { Job } from '@/types';
import type { AdminJob, ModerationStatus, FinalizationReason } from '@/types/adminJobs';
import type { PaginatedResult, SortConfig, PaginationConfig } from '../types';
import type { IJobsService, JobFilters } from './jobsService';

type JobRow = Database['public']['Tables']['jobs']['Row'];

/** Formata salário para exibição no admin (ex: "R$ 3.000 - R$ 5.000"). */
function formatSalary(min: number | null, max: number | null): string | undefined {
  if (!min && !max) return undefined;
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `A partir de ${fmt(min)}`;
  if (max) return `Até ${fmt(max)}`;
  return undefined;
}

/** Maps a Supabase job row (with company + moderator join) to the AdminJob type used by the admin panel. */
function jobRowToAdminJob(
  row: JobRow & {
    companies?: { name: string; logo_url?: string | null; plan?: string | null } | null;
    moderator?: { name: string } | null;
  },
): AdminJob {
  return {
    id: row.id,
    title: row.title,
    companyId: row.company_id,
    companyName: row.companies?.name ?? '',
    companyLogo: row.companies?.logo_url ?? undefined,
    companyPlan: row.companies?.plan ?? 'Essencial Empresas',
    location: row.location ?? '',
    type: row.type,
    salary: formatSalary(Number(row.salary_min) || null, Number(row.salary_max) || null),
    area: row.area ?? '',
    status: row.status,
    moderationStatus: (row.moderation_status as ModerationStatus) ?? 'pending',
    moderatedBy: (row as Record<string, unknown>).moderator
      ? ((row as Record<string, unknown>).moderator as { name: string }).name
      : undefined,
    moderatedAt: row.moderated_at ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    correctionFields: (row.correction_fields as string[] | null) ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
    isAnonymous: (row as Record<string, unknown>).is_anonymous as boolean ?? false,
    isHighlighted: row.is_highlighted ?? false,
    highlightedUntil: row.highlighted_until ?? undefined,
    publishedAt: row.published_at ?? undefined,
    finalizedAt: row.finalized_at ?? undefined,
    finalizationReason: (row.finalization_reason as FinalizationReason | null) ?? undefined,
    applicationsCount: row.applications_count,
    createdAt: row.created_at,
  };
}

/** Maps a Supabase job row (with optional company join) to the app-level Job type. */
function jobRowToJob(
  row: JobRow & { companies?: { name: string; logo_url?: string | null } | null },
): Job {
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.companies?.name ?? '',
    companyLogo: row.companies?.logo_url ?? undefined,
    isAnonymous: (row as Record<string, unknown>).is_anonymous as boolean ?? false,
    title: row.title,
    description: row.description,
    requirements: row.requirements ?? [],
    benefits: row.benefits ?? [],
    location: row.location ?? '',
    city: ((row as Record<string, unknown>).city as string | null) ?? undefined,
    state: ((row as Record<string, unknown>).state as string | null) ?? undefined,
    type: row.type as Job['type'],
    level: row.level ?? '',
    salary: { min: Number(row.salary_min) || 0, max: Number(row.salary_max) || 0 },
    status: row.status as Job['status'],
    moderationStatus: (row.moderation_status as Job['moderationStatus']) ?? 'approved',
    applicationsCount: row.applications_count,
    positionsCount: (row as Record<string, unknown>).positions_count as number ?? 1,
    createdAt: row.created_at,
    area: row.area ?? '',
  };
}

/** Column name mapping from camelCase sort fields to snake_case DB columns. */
const SORT_FIELD_MAP: Record<string, string> = {
  title: 'title',
  createdAt: 'created_at',
  applicationsCount: 'applications_count',
  status: 'status',
  area: 'area',
  location: 'location',
  level: 'level',
  type: 'type',
  salaryMin: 'salary_min',
  salaryMax: 'salary_max',
};

export class JobsServiceSupabase implements IJobsService {
  async getJobs(
    filters?: JobFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<Job>> {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('jobs')
      .select('*, companies!jobs_company_id_fkey(name, logo_url)', { count: 'exact' });

    query = this.applyFilters(query, filters);

    // Sorting
    const sortColumn = sort ? (SORT_FIELD_MAP[sort.field] ?? sort.field) : 'created_at';
    const ascending = sort ? sort.direction === 'asc' : false;
    query = query.order(sortColumn, { ascending });

    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    const total = count ?? 0;

    return {
      data: (data ?? []).map(jobRowToJob),
      total,
      page,
      pageSize,
      hasMore: from + pageSize < total,
    };
  }

  async getJob(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, companies!jobs_company_id_fkey(name, logo_url)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    return data ? jobRowToJob(data) : null;
  }

  async getJobsByCompany(companyId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, companies!jobs_company_id_fkey(name, logo_url)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch jobs by company: ${error.message}`);
    }

    return (data ?? []).map(jobRowToJob);
  }

  async createJob(job: Partial<Job>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        company_id: job.companyId ?? '',
        title: job.title ?? '',
        description: job.description ?? '',
        requirements: job.requirements ?? [],
        benefits: job.benefits ?? [],
        location: job.location ?? '',
        city: job.city ?? null,
        state: job.state ?? null,
        type: job.type ?? 'remote',
        level: job.level ?? '',
        salary_min: job.salary?.min ?? 0,
        salary_max: job.salary?.max ?? 0,
        status: job.status ?? 'active',
        moderation_status: 'approved',
        area: job.area ?? '',
        positions_count: job.positionsCount ?? 1,
        is_anonymous: job.isAnonymous ?? false,
      })
      .select('*, companies!jobs_company_id_fkey(name, logo_url)')
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return jobRowToJob(data);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const updatePayload: Record<string, unknown> = {};

    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.requirements !== undefined) updatePayload.requirements = updates.requirements;
    if (updates.benefits !== undefined) updatePayload.benefits = updates.benefits;
    if (updates.location !== undefined) updatePayload.location = updates.location;
    if (updates.city !== undefined) updatePayload.city = updates.city ?? null;
    if (updates.state !== undefined) updatePayload.state = updates.state ?? null;
    if (updates.type !== undefined) updatePayload.type = updates.type;
    if (updates.level !== undefined) updatePayload.level = updates.level;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.area !== undefined) updatePayload.area = updates.area;
    if (updates.salary !== undefined) {
      updatePayload.salary_min = updates.salary.min;
      updatePayload.salary_max = updates.salary.max;
    }
    if (updates.positionsCount !== undefined) updatePayload.positions_count = updates.positionsCount;
    if (updates.isAnonymous !== undefined) updatePayload.is_anonymous = updates.isAnonymous;

    const { data, error } = await supabase
      .from('jobs')
      .update(updatePayload)
      .eq('id', id)
      .select('*, companies!jobs_company_id_fkey(name, logo_url)')
      .single();

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    return jobRowToJob(data);
  }

  async deleteJob(id: string): Promise<void> {
    const { error } = await supabase.from('jobs').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  async searchJobs(query: string, filters?: JobFilters): Promise<Job[]> {
    const pattern = `%${query}%`;

    let q = supabase
      .from('jobs')
      .select('*, companies!jobs_company_id_fkey(name, logo_url)')
      .or(`title.ilike.${pattern},description.ilike.${pattern},area.ilike.${pattern},location.ilike.${pattern}`);

    q = this.applyFilters(q, filters);
    q = q.order('created_at', { ascending: false }).limit(50);

    const { data, error } = await q;

    if (error) {
      throw new Error(`Failed to search jobs: ${error.message}`);
    }

    return (data ?? []).map(jobRowToJob);
  }

  // --- Admin moderation methods ---

  async getAdminJobs(): Promise<AdminJob[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, companies!jobs_company_id_fkey(name, logo_url, plan), moderator:profiles!jobs_moderated_by_fkey(name)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch admin jobs: ${error.message}`);
    }

    return (data ?? []).map((row) => jobRowToAdminJob(row as Parameters<typeof jobRowToAdminJob>[0]));
  }

  async approveJob(id: string, moderatedBy?: string): Promise<void> {
    const now = new Date().toISOString();
    const payload: Record<string, unknown> = {
      moderation_status: 'approved',
      status: 'active',
      moderated_at: now,
      published_at: now,
    };
    if (moderatedBy) payload.moderated_by = moderatedBy;

    const { error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to approve job: ${error.message}`);
    }
  }

  async rejectJob(id: string, reason: string, moderatedBy?: string): Promise<void> {
    const payload: Record<string, unknown> = {
      moderation_status: 'rejected',
      status: 'rejected',
      rejection_reason: reason,
      moderated_at: new Date().toISOString(),
    };
    if (moderatedBy) payload.moderated_by = moderatedBy;

    const { error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to reject job: ${error.message}`);
    }
  }

  async requestCorrectionJob(id: string, fields: string[], moderatedBy?: string): Promise<void> {
    const payload: Record<string, unknown> = {
      moderation_status: 'correction_requested',
      correction_fields: fields,
      moderated_at: new Date().toISOString(),
    };
    if (moderatedBy) payload.moderated_by = moderatedBy;

    const { error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to request correction: ${error.message}`);
    }
  }

  async toggleHighlight(id: string, isHighlighted: boolean, highlightedUntil?: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .update({
        is_highlighted: isHighlighted,
        highlighted_until: isHighlighted ? (highlightedUntil ?? null) : null,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to toggle highlight: ${error.message}`);
    }
  }

  async addAdminNote(id: string, note: string): Promise<void> {
    const { data: current, error: selectError } = await supabase
      .from('jobs')
      .select('admin_notes')
      .eq('id', id)
      .single();

    if (selectError) {
      throw new Error(`Failed to fetch current admin notes: ${selectError.message}`);
    }

    const existingNotes = current?.admin_notes ?? '';
    const timestamp = new Date().toLocaleString('pt-BR');
    const newNotes = existingNotes
      ? `${existingNotes}\n[${timestamp}] ${note}`
      : `[${timestamp}] ${note}`;

    const { error } = await supabase
      .from('jobs')
      .update({ admin_notes: newNotes })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to add admin note: ${error.message}`);
    }
  }

  // --- Filter helpers ---

  async getJobLocations(): Promise<string[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('location')
      .eq('status', 'active')
      .eq('moderation_status', 'approved')
      .not('location', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch job locations: ${error.message}`);
    }

    const unique = [...new Set(
      (data ?? []).map((row) => row.location).filter(Boolean) as string[]
    )];
    return unique.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  // --- Private helpers ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filters?: JobFilters): any {
    if (!filters) return query;

    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.area) {
      query = query.ilike('area', filters.area);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.level) {
      query = query.ilike('level', filters.level);
    }
    if (filters.moderationStatus) {
      query = query.eq('moderation_status', filters.moderationStatus);
    }
    if (filters.search) {
      const pattern = `%${filters.search}%`;
      query = query.or(
        `title.ilike.${pattern},description.ilike.${pattern},area.ilike.${pattern},location.ilike.${pattern}`,
      );
    }

    return query;
  }
}
