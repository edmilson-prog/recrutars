/**
 * Applications Service — Supabase Implementation
 * PRD-066: Service Layer Core
 *
 * Queries the `applications` table with joins on `jobs` (for title),
 * `companies` (for name), and `candidates` (for name/avatar).
 * Also manages `application_notes` and `application_history` tables.
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type {
  Application,
  ApplicationNote,
  ApplicationHistory,
  ApplicationStatus,
  TestRequestStatus,
} from '@/types';
import type { PaginatedResult, SortConfig, PaginationConfig } from '../types';
import type {
  IApplicationsService,
  ApplicationFilters,
  CreateApplicationData,
} from './applicationsService';

type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type ApplicationNoteRow = Database['public']['Tables']['application_notes']['Row'];
type ApplicationHistoryRow = Database['public']['Tables']['application_history']['Row'];

// Shape of an application row with joined relations
type ApplicationWithJoins = ApplicationRow & {
  jobs?: {
    title: string;
    company_id: string;
    companies?: { name: string } | null;
  } | null;
  candidates?: {
    name: string;
    avatar_url: string | null;
  } | null;
};

// Shape of a note row with joined author profile
type NoteWithAuthor = ApplicationNoteRow & {
  profiles?: { name: string } | null;
};

// Shape of a history row with joined changed_by profile
type HistoryWithActor = ApplicationHistoryRow & {
  profiles?: { name: string } | null;
};

/** Maps a Supabase application row (with joins) to the app-level Application type. */
function applicationRowToApplication(row: ApplicationWithJoins): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    candidateId: row.candidate_id,
    candidateName: row.candidates?.name ?? '',
    candidateAvatar: row.candidates?.avatar_url ?? undefined,
    jobTitle: row.jobs?.title ?? '',
    companyName: row.jobs?.companies?.name ?? '',
    status: row.status as ApplicationStatus,
    message: row.message ?? undefined,
    appliedAt: row.applied_at,
    updatedAt: row.updated_at,
    testStatus: (row.test_status as TestRequestStatus) ?? 'nao_solicitado',
    testRequestedAt: row.test_requested_at ?? undefined,
    testDeadline: row.test_deadline ?? undefined,
  };
}

/** Maps a Supabase application_notes row to the app-level ApplicationNote type. */
function noteRowToNote(row: NoteWithAuthor): ApplicationNote {
  return {
    id: row.id,
    applicationId: row.application_id,
    content: row.content,
    author: row.profiles?.name ?? 'Desconhecido',
    createdAt: row.created_at,
  };
}

/** Maps a Supabase application_history row to the app-level ApplicationHistory type. */
function historyRowToHistory(row: HistoryWithActor): ApplicationHistory {
  return {
    id: row.id,
    applicationId: row.application_id,
    fromStatus: (row.from_status as ApplicationStatus) ?? null,
    toStatus: row.to_status as ApplicationStatus,
    changedBy: row.profiles?.name ?? 'Sistema',
    changedAt: row.changed_at,
    reason: row.reason ?? undefined,
  };
}

/** Select string for application queries with all necessary joins. */
const APPLICATION_SELECT = [
  '*',
  'jobs!applications_job_id_fkey(title, company_id, companies!jobs_company_id_fkey(name))',
  'candidates!applications_candidate_id_fkey(name, avatar_url)',
].join(', ');

/** Column name mapping from camelCase sort fields to snake_case DB columns. */
const SORT_FIELD_MAP: Record<string, string> = {
  appliedAt: 'applied_at',
  updatedAt: 'updated_at',
  status: 'status',
  testStatus: 'test_status',
  candidateName: 'candidate_id', // sorted at DB level by candidate_id, ideally by name via join
  jobTitle: 'job_id',
};

export class ApplicationsServiceSupabase implements IApplicationsService {
  async getApplications(
    filters?: ApplicationFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<Application>> {
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('applications')
      .select(APPLICATION_SELECT, { count: 'exact' });

    query = this.applyFilters(query, filters);

    // Sorting
    const sortColumn = sort ? (SORT_FIELD_MAP[sort.field] ?? sort.field) : 'applied_at';
    const ascending = sort ? sort.direction === 'asc' : false;
    query = query.order(sortColumn, { ascending });

    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    const total = count ?? 0;

    return {
      data: (data ?? []).map(applicationRowToApplication),
      total,
      page,
      pageSize,
      hasMore: from + pageSize < total,
    };
  }

  async getApplication(id: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch application: ${error.message}`);
    }

    return data ? applicationRowToApplication(data) : null;
  }

  async getApplicationsByCandidate(candidateId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('candidate_id', candidateId)
      .order('applied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch applications by candidate: ${error.message}`);
    }

    return (data ?? []).map(applicationRowToApplication);
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch applications by job: ${error.message}`);
    }

    return (data ?? []).map(applicationRowToApplication);
  }

  async createApplication(appData: CreateApplicationData): Promise<Application> {
    // Check if there's a withdrawn application for this job — reactivate instead of inserting
    const { data: existing } = await supabase
      .from('applications')
      .select(APPLICATION_SELECT)
      .eq('job_id', appData.jobId)
      .eq('candidate_id', appData.candidateId)
      .eq('status', 'withdrawn')
      .maybeSingle();

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? appData.candidateId;

    if (existing) {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'pending',
          message: appData.message ?? existing.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select(APPLICATION_SELECT)
        .single();

      if (error) throw new Error(`Failed to reactivate application: ${error.message}`);

      await supabase.from('application_history').insert({
        application_id: data.id,
        from_status: 'withdrawn',
        to_status: 'pending',
        changed_by: userId,
      });

      return applicationRowToApplication(data);
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        job_id: appData.jobId,
        candidate_id: appData.candidateId,
        message: appData.message ?? null,
        status: 'pending',
        test_status: 'nao_solicitado',
      })
      .select(APPLICATION_SELECT)
      .single();

    if (error) {
      throw new Error(`Failed to create application: ${error.message}`);
    }

    // Create initial history entry
    await supabase.from('application_history').insert({
      application_id: data.id,
      from_status: null,
      to_status: 'pending',
      changed_by: userId,
    });

    return applicationRowToApplication(data);
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    reason?: string,
  ): Promise<Application> {
    // Fetch current status for history tracking
    const { data: current, error: fetchError } = await supabase
      .from('applications')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch application for status update: ${fetchError.message}`);
    }

    const previousStatus = current.status;

    // Update the application status
    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(APPLICATION_SELECT)
      .single();

    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }

    // Record the status change in history
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('application_history').insert({
      application_id: id,
      from_status: previousStatus,
      to_status: status,
      changed_by: userData?.user?.id ?? '',
      reason: reason ?? null,
    });

    return applicationRowToApplication(data);
  }

  async getNotes(applicationId: string): Promise<ApplicationNote[]> {
    const { data, error } = await supabase
      .from('application_notes')
      .select('*, profiles!application_notes_author_id_fkey(name)')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch application notes: ${error.message}`);
    }

    return (data ?? []).map(noteRowToNote);
  }

  async addNote(applicationId: string, content: string): Promise<ApplicationNote> {
    const { data: userData } = await supabase.auth.getUser();
    const authorId = userData?.user?.id ?? '';

    const { data, error } = await supabase
      .from('application_notes')
      .insert({
        application_id: applicationId,
        content,
        author_id: authorId,
      })
      .select('*, profiles!application_notes_author_id_fkey(name)')
      .single();

    if (error) {
      throw new Error(`Failed to add application note: ${error.message}`);
    }

    return noteRowToNote(data);
  }

  async getHistory(applicationId: string): Promise<ApplicationHistory[]> {
    const { data, error } = await supabase
      .from('application_history')
      .select('*, profiles!application_history_changed_by_fkey(name)')
      .eq('application_id', applicationId)
      .order('changed_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch application history: ${error.message}`);
    }

    return (data ?? []).map(historyRowToHistory);
  }

  // --- Private helpers ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filters?: ApplicationFilters): any {
    if (!filters) return query;

    if (filters.candidateId) {
      query = query.eq('candidate_id', filters.candidateId);
    }
    if (filters.jobId) {
      query = query.eq('job_id', filters.jobId);
    }
    if (filters.companyId) {
      query = query.eq('jobs.company_id', filters.companyId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.testStatus) {
      query = query.eq('test_status', filters.testStatus);
    }

    return query;
  }
}
