/**
 * Company Tests Service — Supabase Implementation
 * Hub de Testes Comportamentais (company-side)
 */

import { supabase } from '@/lib/supabase';
import type {
  CompanyTest,
  TestInvitation,
  CompanyTestResult,
  AuditLog,
  HubDashboardKPIs,
  CompanyCandidate,
  CompanyTeamMemberForInvite,
  EnhancedAuditLogFilters,
  InvitationManagerFilters,
  TestMetrics,
} from '@/types/companyTest';
import type { ICompanyTestsService, CompanyTestFilters, AuditLogFilters } from './companyTestsService';
import { ARCHETYPE_PROFILES } from '@/data/gaugeProArchetypes';

// ============================================================
// Row ↔ Model converters
// ============================================================

function companyTestRowToModel(row: Record<string, unknown>): CompanyTest {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    templateId: row.template_id as string,
    weights: (row.weights as Record<string, number>) ?? {},
    status: row.status as CompanyTest['status'],
    targetAudience: (row.target_audience as CompanyTest['targetAudience']) ?? 'candidate',
    jobId: row.job_id as string | undefined,
    jobTitle: row.job_title as string | undefined,
    deadline: row.deadline as string | undefined,
    instructions: row.instructions as string | undefined,
    publicLinkSlug: row.public_link_slug as string | undefined,
    publicLinkActive: row.public_link_active as boolean | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    activatedAt: row.activated_at as string | undefined,
    closedAt: row.closed_at as string | undefined,
    archivedAt: row.archived_at as string | undefined,
  };
}

function invitationRowToModel(row: Record<string, unknown>): TestInvitation {
  return {
    id: row.id as string,
    testId: row.test_id as string,
    candidateId: row.candidate_id as string | undefined,
    teamMemberId: row.team_member_id as string | undefined,
    candidateName: row.candidate_name as string,
    candidateEmail: row.candidate_email as string,
    method: row.method as TestInvitation['method'],
    status: row.status as TestInvitation['status'],
    token: row.token as string | undefined,
    assessmentId: row.assessment_id as string | undefined,
    sentAt: row.sent_at as string,
    viewedAt: row.viewed_at as string | undefined,
    startedAt: row.started_at as string | undefined,
    completedAt: row.completed_at as string | undefined,
    expiresAt: row.expires_at as string,
    sentBy: row.sent_by as string | undefined,
  };
}

function resultRowToModel(row: Record<string, unknown>): CompanyTestResult {
  const archetypeId = row.archetype_id as string;
  const archetype = ARCHETYPE_PROFILES.find(a => a.id === archetypeId) ?? ARCHETYPE_PROFILES[0];

  return {
    id: row.id as string,
    testId: row.test_id as string,
    candidateId: row.candidate_id as string,
    candidateName: row.candidate_name as string,
    candidateEmail: row.candidate_email as string,
    invitationId: row.invitation_id as string,
    scores: (row.scores as Record<string, number>) ?? {},
    archetype,
    archetypeId,
    primaryDimension: row.primary_dimension as string,
    secondaryDimension: row.secondary_dimension as string,
    strengths: (row.strengths as string[]) ?? [],
    developmentAreas: (row.development_areas as string[]) ?? [],
    fitScore: row.fit_score ? Number(row.fit_score) : undefined,
    fitClassification: row.fit_classification as CompanyTestResult['fitClassification'],
    aiAnalysis: row.ai_analysis as string | undefined,
    shortlisted: row.shortlisted as boolean | undefined,
    shortlistNotes: row.shortlist_notes as string | undefined,
    completedAt: row.completed_at as string,
  } as unknown as CompanyTestResult;
}

function auditLogRowToModel(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    action: row.action as AuditLog['action'],
    userId: row.user_id as string,
    userName: row.user_name as string,
    resourceType: row.resource_type as AuditLog['resourceType'],
    resourceId: row.resource_id as string,
    resourceName: row.resource_name as string | undefined,
    details: row.details as string | undefined,
    companyId: row.company_id as string | undefined,
    timestamp: row.created_at as string,
  };
}

// ============================================================
// Service Implementation
// ============================================================

export class CompanyTestsServiceSupabase implements ICompanyTestsService {

  // ----------------------------------------------------------
  // Tests CRUD
  // ----------------------------------------------------------

  async getTests(companyId: string, filters?: CompanyTestFilters): Promise<CompanyTest[]> {
    let query = supabase
      .from('company_tests')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters?.jobId) {
      query = query.eq('job_id', filters.jobId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(row => companyTestRowToModel(row as Record<string, unknown>));
  }

  async getTest(id: string): Promise<CompanyTest | null> {
    const { data, error } = await supabase
      .from('company_tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return companyTestRowToModel(data as Record<string, unknown>);
  }

  async createTest(input: Partial<CompanyTest> & { companyId: string; name: string; templateId: string }): Promise<CompanyTest> {
    const { data, error } = await supabase
      .from('company_tests')
      .insert({
        company_id: input.companyId,
        name: input.name,
        description: input.description ?? '',
        template_id: input.templateId,
        weights: input.weights ?? {},
        status: input.status ?? 'draft',
        job_id: input.jobId ?? null,
        job_title: input.jobTitle ?? null,
        deadline: input.deadline ?? null,
        instructions: input.instructions ?? null,
        target_audience: input.targetAudience ?? 'candidate',
        created_by: input.createdAt ? undefined : undefined, // Will be set from auth context
      })
      .select()
      .single();

    if (error) throw error;
    return companyTestRowToModel(data as Record<string, unknown>);
  }

  async updateTest(id: string, updates: Partial<CompanyTest>): Promise<CompanyTest> {
    const row: Record<string, unknown> = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.templateId !== undefined) row.template_id = updates.templateId;
    if (updates.weights !== undefined) row.weights = updates.weights;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.jobId !== undefined) row.job_id = updates.jobId;
    if (updates.jobTitle !== undefined) row.job_title = updates.jobTitle;
    if (updates.deadline !== undefined) row.deadline = updates.deadline;
    if (updates.instructions !== undefined) row.instructions = updates.instructions;
    if (updates.targetAudience !== undefined) row.target_audience = updates.targetAudience;
    if (updates.publicLinkSlug !== undefined) row.public_link_slug = updates.publicLinkSlug;
    if (updates.publicLinkActive !== undefined) row.public_link_active = updates.publicLinkActive;
    if (updates.activatedAt !== undefined) row.activated_at = updates.activatedAt;
    if (updates.closedAt !== undefined) row.closed_at = updates.closedAt;
    if (updates.archivedAt !== undefined) row.archived_at = updates.archivedAt;

    const { data, error } = await supabase
      .from('company_tests')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return companyTestRowToModel(data as Record<string, unknown>);
  }

  // ----------------------------------------------------------
  // Invitations
  // ----------------------------------------------------------

  async getInvitations(testId: string): Promise<TestInvitation[]> {
    const { data, error } = await supabase
      .from('test_invitations')
      .select('*')
      .eq('test_id', testId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(row => invitationRowToModel(row as Record<string, unknown>));
  }

  async getInvitationByToken(token: string): Promise<TestInvitation | null> {
    const { data, error } = await supabase
      .from('test_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return invitationRowToModel(data as Record<string, unknown>);
  }

  async updateInvitationStatus(id: string, status: string, timestamps?: Record<string, string>): Promise<void> {
    const row: Record<string, unknown> = { status };
    if (timestamps) {
      Object.entries(timestamps).forEach(([key, value]) => {
        // Convert camelCase to snake_case for common timestamp fields
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        row[snakeKey] = value;
      });
    }

    const { error } = await supabase
      .from('test_invitations')
      .update(row)
      .eq('id', id);

    if (error) throw error;
  }

  // ----------------------------------------------------------
  // Public Links
  // ----------------------------------------------------------

  async updatePublicLink(testId: string, slug: string, active: boolean): Promise<CompanyTest> {
    const { data, error } = await supabase
      .from('company_tests')
      .update({
        public_link_slug: slug || null,
        public_link_active: active,
      })
      .eq('id', testId)
      .select()
      .single();

    if (error) throw error;
    return companyTestRowToModel(data as Record<string, unknown>);
  }

  async getTestBySlug(slug: string): Promise<CompanyTest | null> {
    const { data, error } = await supabase
      .from('company_tests')
      .select('*')
      .eq('public_link_slug', slug)
      .eq('public_link_active', true)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return companyTestRowToModel(data as Record<string, unknown>);
  }

  // ----------------------------------------------------------
  // Results
  // ----------------------------------------------------------

  async getResults(testId: string): Promise<CompanyTestResult[]> {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_id', testId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(row => resultRowToModel(row as Record<string, unknown>));
  }

  async getResult(id: string): Promise<CompanyTestResult | null> {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return resultRowToModel(data as Record<string, unknown>);
  }

  async updateShortlist(resultId: string, shortlisted: boolean, notes?: string): Promise<void> {
    const row: Record<string, unknown> = { shortlisted };
    if (notes !== undefined) row.shortlist_notes = notes;

    const { error } = await supabase
      .from('test_results')
      .update(row)
      .eq('id', resultId);

    if (error) throw error;
  }

  // ----------------------------------------------------------
  // Company Candidates (for "Da Base" tab)
  // ----------------------------------------------------------

  async getCompanyCandidates(companyId: string, search?: string): Promise<CompanyCandidate[]> {
    // Get candidates who applied to this company's jobs
    let query = supabase
      .from('candidates')
      .select(`
        id,
        current_title,
        profiles!candidates_profile_id_fkey (
          full_name,
          email,
          avatar_url
        )
      `)
      .in('id', supabase
        .from('applications')
        .select('candidate_id')
        .in('job_id', supabase
          .from('jobs')
          .select('id')
          .eq('company_id', companyId)
        )
      );

    const { data, error } = await query;
    if (error) throw error;

    let candidates = (data ?? []).map((row: Record<string, unknown>) => {
      const profile = row.profiles as Record<string, unknown> | null;
      return {
        id: row.id as string,
        name: (profile?.full_name as string) ?? '',
        email: (profile?.email as string) ?? '',
        title: row.current_title as string | undefined,
        avatarUrl: (profile?.avatar_url as string) ?? undefined,
      };
    });

    // Client-side search filter (for simplicity with nested joins)
    if (search) {
      const term = search.toLowerCase();
      candidates = candidates.filter(
        c => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
      );
    }

    return candidates;
  }

  async getCompanyTeamMembers(companyId: string, search?: string): Promise<CompanyTeamMemberForInvite[]> {
    let query = supabase
      .from('team_members')
      .select('id, name, email, phone, department_id, gauge_status, archetype')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      phone: (row.phone as string) ?? undefined,
      departmentId: row.department_id as string | undefined,
      gaugeStatus: (row.gauge_status as string) ?? 'unmapped',
      archetype: row.archetype as string | undefined,
    }));
  }

  // ----------------------------------------------------------
  // Audit
  // ----------------------------------------------------------

  async addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('test_audit_logs')
      .insert({
        action: log.action,
        user_id: log.userId,
        user_name: log.userName,
        resource_type: log.resourceType,
        resource_id: log.resourceId,
        resource_name: log.resourceName ?? null,
        details: log.details ?? null,
        company_id: log.companyId,
      });

    if (error) throw error;
  }

  async getAuditLogs(companyId: string, filters?: AuditLogFilters): Promise<AuditLog[]> {
    let query = supabase
      .from('test_audit_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(row => auditLogRowToModel(row as Record<string, unknown>));
  }

  // ----------------------------------------------------------
  // Dashboard
  // ----------------------------------------------------------

  async getStats(companyId: string): Promise<HubDashboardKPIs> {
    // Get all tests for the company
    const { data: tests, error: testsError } = await supabase
      .from('company_tests')
      .select('id, status')
      .eq('company_id', companyId);

    if (testsError) throw testsError;

    const testIds = (tests ?? []).map(t => (t as Record<string, unknown>).id as string);
    const activeTests = (tests ?? []).filter(t => (t as Record<string, unknown>).status === 'active').length;

    if (testIds.length === 0) {
      return { totalTests: 0, activeTests: 0, pendingInvites: 0, completionRate: 0, avgCompletionTime: 0, abandonRate: 0, mappedMembers: 0, totalMembers: 0, creditsUsed: 0, creditsAvailable: 0, pendingRetests: 0 };
    }

    // Get invitations for all company tests
    const { data: invitations, error: invError } = await supabase
      .from('test_invitations')
      .select('status, sent_at, completed_at')
      .in('test_id', testIds);

    if (invError) throw invError;

    const allInvites = invitations ?? [];
    const pending = allInvites.filter(i => (i as Record<string, unknown>).status === 'sent').length;
    const completed = allInvites.filter(i => (i as Record<string, unknown>).status === 'completed');
    const completionRate = allInvites.length > 0
      ? Math.round((completed.length / allInvites.length) * 100)
      : 0;

    // Average completion time in days
    let avgCompletionTime = 0;
    if (completed.length > 0) {
      const totalMs = completed.reduce((sum, inv) => {
        const row = inv as Record<string, unknown>;
        const sent = new Date(row.sent_at as string).getTime();
        const done = new Date(row.completed_at as string).getTime();
        return sum + (done - sent);
      }, 0);
      avgCompletionTime = Math.round((totalMs / completed.length) / (1000 * 60 * 60 * 24) * 10) / 10;
    }

    return {
      totalTests: (tests ?? []).length,
      activeTests,
      pendingInvites: pending,
      completionRate,
      avgCompletionTime,
      abandonRate: 0,
      mappedMembers: 0,
      totalMembers: 0,
      creditsUsed: 0,
      creditsAvailable: 0,
      pendingRetests: 0,
    };
  }

  // ----------------------------------------------------------
  // PRD-089: Enhanced metrics via RPC
  // ----------------------------------------------------------

  async getTestMetrics(companyId: string, from?: string, to?: string): Promise<TestMetrics> {
    const { data, error } = await supabase.rpc('get_test_metrics', {
      p_company_id: companyId,
      p_from: from ?? null,
      p_to: to ?? null,
    });

    if (error) throw error;

    const metrics = data as TestMetrics;
    return {
      totalInvitations: metrics?.totalInvitations ?? 0,
      completed: metrics?.completed ?? 0,
      abandoned: metrics?.abandoned ?? 0,
      pending: metrics?.pending ?? 0,
      started: metrics?.started ?? 0,
      viewed: metrics?.viewed ?? 0,
      completionRate: metrics?.completionRate ?? 0,
      abandonRate: metrics?.abandonRate ?? 0,
      avgCompletionHours: metrics?.avgCompletionHours ?? 0,
      mappedMembers: metrics?.mappedMembers ?? 0,
      totalMembers: metrics?.totalMembers ?? 0,
      creditsUsed: metrics?.creditsUsed ?? 0,
      creditsAvailable: metrics?.creditsAvailable ?? 0,
      pendingRetests: metrics?.pendingRetests ?? 0,
    };
  }

  async detectAbandonment(companyId: string): Promise<number> {
    const { data, error } = await supabase.rpc('detect_abandoned_invitations', {
      p_company_id: companyId,
    });

    if (error) {
      console.error('[detectAbandonment] error:', error.message);
      return 0;
    }
    return (data as number) ?? 0;
  }

  async getAuditLogsPaginated(companyId: string, filters?: EnhancedAuditLogFilters): Promise<{ logs: AuditLog[]; total: number }> {
    const page = filters?.page ?? 0;
    const pageSize = filters?.pageSize ?? 25;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('test_audit_logs')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.search) {
      query = query.or(`resource_name.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%,details.ilike.%${filters.search}%`);
    }
    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }
    if (filters?.period && filters.period !== 'all' && filters.period !== 'custom') {
      const days = filters.period === '7d' ? 7 : filters.period === '30d' ? 30 : 90;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', since);
    }

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      logs: (data ?? []).map(row => auditLogRowToModel(row as Record<string, unknown>)),
      total: count ?? 0,
    };
  }

  // --- Invitation Management (company-wide) ---

  async getCompanyInvitations(
    companyId: string,
    filters?: InvitationManagerFilters
  ): Promise<{ invitations: TestInvitation[]; total: number }> {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 25;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('test_invitations')
      .select(`
        *,
        company_tests!inner(company_id, name)
      `, { count: 'exact' })
      .eq('company_tests.company_id', companyId);

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.method && filters.method.length > 0) {
      query = query.in('method', filters.method);
    }
    if (filters?.search) {
      query = query.or(`candidate_name.ilike.%${filters.search}%,candidate_email.ilike.%${filters.search}%`);
    }
    if (filters?.testId) {
      query = query.eq('test_id', filters.testId);
    }
    if (filters?.dateFrom) {
      query = query.gte('sent_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('sent_at', filters.dateTo);
    }

    const sortColumn = filters?.sortBy
      ? { sentAt: 'sent_at', expiresAt: 'expires_at', status: 'status', candidateName: 'candidate_name' }[filters.sortBy]
      : 'sent_at';
    const ascending = filters?.sortDir === 'asc';
    query = query.order(sortColumn!, { ascending });

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[getCompanyInvitations] Error:', error);
      return { invitations: [], total: 0 };
    }

    const invitations: TestInvitation[] = (data ?? []).map((row: any) => ({
      id: row.id,
      testId: row.test_id,
      candidateId: row.candidate_id,
      teamMemberId: row.team_member_id,
      candidateName: row.candidate_name,
      candidateEmail: row.candidate_email,
      method: row.method,
      status: row.status,
      token: row.token,
      assessmentId: row.assessment_id,
      sentAt: row.sent_at,
      viewedAt: row.viewed_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      expiresAt: row.expires_at,
      sentBy: row.sent_by,
      inviteOrigin: row.invite_origin,
      departmentId: row.department_id,
      testName: row.company_tests?.name ?? '',
    }));

    return { invitations, total: count ?? 0 };
  }

  async getInvitationAuditLogs(invitationId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('test_audit_logs')
      .select('*')
      .eq('resource_id', invitationId)
      .eq('resource_type', 'invitation')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[getInvitationAuditLogs] Error:', error);
      return [];
    }

    return (data ?? []).map((row: any) => auditLogRowToModel(row as Record<string, unknown>));
  }
}
