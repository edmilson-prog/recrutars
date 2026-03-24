/**
 * Teams Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 *
 * Queries: departments, positions, team_members, development_plans,
 *          development_objectives, retest_schedules, evolution_annotations.
 */

import { supabase } from '@/lib/supabase';
import type {
  Department,
  Position,
  TeamMember,
  DevelopmentPlan,
  DevelopmentObjective,
  RetestSchedule,
  EvolutionAnnotation,
  TeamMemberEvent,
  OffboardingChecklist,
  OffboardingTemplate,
  DataRetentionSettings,
} from '@/types/teamManagement';
import type { ITeamsService, TeamsFilters, EventsFilters } from './teamsService';

export class TeamsServiceSupabase implements ITeamsService {
  // ---------------------------------------------------------------------------
  // Departments
  // ---------------------------------------------------------------------------

  async getDepartments(companyId: string): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch departments: ${error.message}`);

    return (data ?? []).map(this.mapDepartment);
  }

  async createDepartment(companyId: string, input: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert({
        company_id: companyId,
        name: input.name,
        description: input.description ?? null,
        manager_id: input.managerId ?? null,
        is_active: input.isActive,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create department: ${error.message}`);

    return this.mapDepartment(data);
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    const payload: Record<string, unknown> = {};

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.managerId !== undefined) payload.manager_id = updates.managerId;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('departments')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update department: ${error.message}`);

    return this.mapDepartment(data);
  }

  // ---------------------------------------------------------------------------
  // Positions
  // ---------------------------------------------------------------------------

  async getPositions(departmentId: string, companyId?: string): Promise<Position[]> {
    let query = supabase
      .from('positions')
      .select('*')
      .order('title', { ascending: true });

    if (departmentId && departmentId !== 'all') {
      query = query.eq('department_id', departmentId);
    } else if (companyId) {
      const { data: depts } = await supabase
        .from('departments')
        .select('id')
        .eq('company_id', companyId);
      const deptIds = (depts ?? []).map((d: { id: string }) => d.id);
      if (deptIds.length === 0) return [];
      query = query.in('department_id', deptIds);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch positions: ${error.message}`);

    return (data ?? []).map(this.mapPosition);
  }

  async createPosition(input: Omit<Position, 'id'>): Promise<Position> {
    const { data, error } = await supabase
      .from('positions')
      .insert({
        department_id: input.departmentId,
        title: input.title,
        level: input.level,
        is_active: input.isActive,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create position: ${error.message}`);

    return this.mapPosition(data);
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    const payload: Record<string, unknown> = {};

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.departmentId !== undefined) payload.department_id = updates.departmentId;
    if (updates.level !== undefined) payload.level = updates.level;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('positions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update position: ${error.message}`);

    return this.mapPosition(data);
  }

  // ---------------------------------------------------------------------------
  // Team Members
  // ---------------------------------------------------------------------------

  async getTeamMembers(filters?: TeamsFilters): Promise<TeamMember[]> {
    let query = supabase
      .from('team_members')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.companyId) {
      query = query.eq('company_id', filters.companyId);
    }
    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId);
    }
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    } else if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.gaugeStatus) {
      query = query.eq('gauge_status', filters.gaugeStatus);
    }
    if (filters?.search) {
      const pattern = `%${filters.search}%`;
      query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch team members: ${error.message}`);

    return (data ?? []).map(this.mapTeamMember);
  }

  async getTeamMember(id: string): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch team member: ${error.message}`);

    return data ? this.mapTeamMember(data) : null;
  }

  async createTeamMember(input: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        company_id: input.companyId,
        name: input.name?.toUpperCase().trim() ?? input.name,
        cpf: input.cpf ?? null,
        email: input.email,
        phone: input.phone ?? null,
        avatar_url: input.avatar ?? null,
        department_id: input.departmentId,
        position_id: input.positionId,
        hire_date: input.hireDate,
        gauge_status: input.gaugeStatus,
        gauge_scores: input.gaugeScores ? JSON.stringify(input.gaugeScores) : null,
        archetype: input.archetype ?? null,
        is_active: input.isActive,
        imported_from_candidate_id: input.importedFromCandidateId ?? null,
        last_test_date: input.lastTestDate ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create team member: ${error.message}`);

    return this.mapTeamMember(data);
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const payload: Record<string, unknown> = {};

    if (updates.name !== undefined) payload.name = updates.name.toUpperCase().trim();
    if (updates.cpf !== undefined) payload.cpf = updates.cpf;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;
    if (updates.departmentId !== undefined) payload.department_id = updates.departmentId;
    if (updates.positionId !== undefined) payload.position_id = updates.positionId;
    if (updates.hireDate !== undefined) payload.hire_date = updates.hireDate;
    if (updates.gaugeStatus !== undefined) payload.gauge_status = updates.gaugeStatus;
    if (updates.gaugeScores !== undefined) payload.gauge_scores = JSON.stringify(updates.gaugeScores);
    if (updates.archetype !== undefined) payload.archetype = updates.archetype;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.lastTestDate !== undefined) payload.last_test_date = updates.lastTestDate;
    if (updates.importedFromCandidateId !== undefined) {
      payload.imported_from_candidate_id = updates.importedFromCandidateId;
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('team_members')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update team member: ${error.message}`);

    return this.mapTeamMember(data);
  }

  // ---------------------------------------------------------------------------
  // Development Plans
  // ---------------------------------------------------------------------------

  async getDevelopmentPlan(memberId: string): Promise<DevelopmentPlan | null> {
    const { data, error } = await supabase
      .from('development_plans')
      .select('*, development_objectives(*)')
      .eq('member_id', memberId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch development plan: ${error.message}`);

    return data ? this.mapDevelopmentPlan(data) : null;
  }

  async saveDevelopmentPlan(plan: DevelopmentPlan): Promise<DevelopmentPlan> {
    // Upsert the plan itself
    const { data: planData, error: planError } = await supabase
      .from('development_plans')
      .upsert({
        id: plan.id,
        member_id: plan.memberId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (planError) throw new Error(`Failed to save development plan: ${planError.message}`);

    // Delete existing objectives and re-insert
    await supabase
      .from('development_objectives')
      .delete()
      .eq('plan_id', planData.id);

    if (plan.objectives.length > 0) {
      const objectiveRows = plan.objectives.map((obj) => ({
        id: obj.id,
        plan_id: planData.id,
        dimension: obj.dimension,
        title: obj.title,
        description: obj.description ?? null,
        status: obj.status,
        priority: obj.priority,
        due_date: obj.dueDate ?? null,
        notes: obj.notes ?? null,
        created_at: obj.createdAt,
      }));

      const { error: objError } = await supabase
        .from('development_objectives')
        .insert(objectiveRows);

      if (objError) throw new Error(`Failed to save objectives: ${objError.message}`);
    }

    // Re-fetch the full plan with objectives
    return (await this.getDevelopmentPlan(plan.memberId))!;
  }

  // ---------------------------------------------------------------------------
  // Retest Schedules
  // ---------------------------------------------------------------------------

  async getRetestSchedules(companyId: string): Promise<RetestSchedule[]> {
    // Join through team_members to filter by company
    const { data, error } = await supabase
      .from('retest_schedules')
      .select('*, team_members!inner(company_id)')
      .eq('team_members.company_id', companyId)
      .order('next_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch retest schedules: ${error.message}`);

    return (data ?? []).map(this.mapRetestSchedule);
  }

  async saveRetestSchedule(schedule: RetestSchedule): Promise<RetestSchedule> {
    const { data, error } = await supabase
      .from('retest_schedules')
      .upsert({
        id: schedule.id,
        member_id: schedule.memberId,
        frequency: schedule.frequency,
        next_date: schedule.nextDate,
        auto_send: schedule.autoSend,
        last_sent_at: schedule.lastSentAt ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save retest schedule: ${error.message}`);

    return this.mapRetestSchedule(data);
  }

  // ---------------------------------------------------------------------------
  // Evolution Annotations
  // ---------------------------------------------------------------------------

  async getAnnotations(memberId: string): Promise<EvolutionAnnotation[]> {
    const { data, error } = await supabase
      .from('evolution_annotations')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false });

    if (error) throw new Error(`Failed to fetch annotations: ${error.message}`);

    return (data ?? []).map(this.mapAnnotation);
  }

  async createAnnotation(
    input: Omit<EvolutionAnnotation, 'id' | 'createdAt'>,
  ): Promise<EvolutionAnnotation> {
    const { data, error } = await supabase
      .from('evolution_annotations')
      .insert({
        member_id: input.memberId,
        text: input.text,
        type: input.type,
        date: input.date,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create annotation: ${error.message}`);

    return this.mapAnnotation(data);
  }

  // ---------------------------------------------------------------------------
  // PRD-090 — Lifecycle Events
  // ---------------------------------------------------------------------------

  async getTeamMemberEvents(teamMemberId: string, filters?: EventsFilters): Promise<TeamMemberEvent[]> {
    let query = supabase
      .from('team_member_events')
      .select('*, profiles:performed_by(name)')
      .eq('team_member_id', teamMemberId)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters?.startDate) {
      query = query.gte('event_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('event_date', filters.endDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch events: ${error.message}`);

    return (data ?? []).map(this.mapEvent);
  }

  async createTeamMemberEvent(input: Omit<TeamMemberEvent, 'id' | 'createdAt'>): Promise<TeamMemberEvent> {
    const { data, error } = await supabase
      .from('team_member_events')
      .insert({
        team_member_id: input.teamMemberId,
        company_id: input.companyId,
        event_type: input.eventType,
        event_date: input.eventDate,
        description: input.description ?? null,
        metadata: input.metadata ?? {},
        performed_by: input.performedBy ?? null,
        visibility: input.visibility ?? 'all_managers',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create event: ${error.message}`);

    return this.mapEvent(data);
  }

  // ---------------------------------------------------------------------------
  // PRD-090 — Offboarding
  // ---------------------------------------------------------------------------

  async getOffboardingChecklist(teamMemberId: string): Promise<OffboardingChecklist[]> {
    const { data, error } = await supabase
      .from('offboarding_checklists')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch offboarding checklist: ${error.message}`);

    return (data ?? []).map(this.mapOffboardingChecklist);
  }

  async toggleOffboardingItem(id: string, isCompleted: boolean, completedBy: string): Promise<OffboardingChecklist> {
    const { data, error } = await supabase
      .from('offboarding_checklists')
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        completed_by: isCompleted ? completedBy : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle offboarding item: ${error.message}`);

    return this.mapOffboardingChecklist(data);
  }

  async getOffboardingTemplates(companyId: string): Promise<OffboardingTemplate[]> {
    const { data, error } = await supabase
      .from('offboarding_templates')
      .select('*')
      .or(`company_id.eq.${companyId},company_id.is.null`)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch offboarding templates: ${error.message}`);

    return (data ?? []).map(this.mapOffboardingTemplate);
  }

  async createOffboardingTemplate(input: Omit<OffboardingTemplate, 'id' | 'createdAt'>): Promise<OffboardingTemplate> {
    const { data, error } = await supabase
      .from('offboarding_templates')
      .insert({
        company_id: input.companyId,
        item_label: input.itemLabel,
        is_default: input.isDefault ?? false,
        sort_order: input.sortOrder ?? 0,
        is_active: input.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create offboarding template: ${error.message}`);

    return this.mapOffboardingTemplate(data);
  }

  async updateOffboardingTemplate(id: string, updates: Partial<OffboardingTemplate>): Promise<OffboardingTemplate> {
    const payload: Record<string, unknown> = {};
    if (updates.itemLabel !== undefined) payload.item_label = updates.itemLabel;
    if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;
    if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('offboarding_templates')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update offboarding template: ${error.message}`);

    return this.mapOffboardingTemplate(data);
  }

  // ---------------------------------------------------------------------------
  // PRD-090 — Data Retention Settings (LGPD)
  // ---------------------------------------------------------------------------

  async getDataRetentionSettings(companyId: string): Promise<DataRetentionSettings | null> {
    const { data, error } = await supabase
      .from('data_retention_settings')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch retention settings: ${error.message}`);

    return data ? this.mapRetentionSettings(data) : null;
  }

  async saveDataRetentionSettings(companyId: string, retentionYears: number, updatedBy: string): Promise<DataRetentionSettings> {
    const { data, error } = await supabase
      .from('data_retention_settings')
      .upsert({
        company_id: companyId,
        retention_years: retentionYears,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      }, { onConflict: 'company_id' })
      .select()
      .single();

    if (error) throw new Error(`Failed to save retention settings: ${error.message}`);

    return this.mapRetentionSettings(data);
  }

  // ---------------------------------------------------------------------------
  // Mappers (snake_case DB -> camelCase TS)
  // ---------------------------------------------------------------------------

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapDepartment(row: any): Department {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      managerId: row.manager_id ?? undefined,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  private mapPosition(row: any): Position {
    return {
      id: row.id,
      departmentId: row.department_id,
      title: row.title,
      level: row.level,
      isActive: row.is_active,
    };
  }

  private mapTeamMember(row: any): TeamMember {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      cpf: row.cpf ?? undefined,
      email: row.email,
      phone: row.phone ?? undefined,
      avatar: row.avatar_url ?? undefined,
      departmentId: row.department_id,
      positionId: row.position_id,
      hireDate: row.hire_date,
      gaugeStatus: row.gauge_status,
      gaugeScores: row.gauge_scores
        ? (typeof row.gauge_scores === 'string'
            ? JSON.parse(row.gauge_scores)
            : row.gauge_scores)
        : undefined,
      archetype: row.archetype ?? undefined,
      isActive: row.is_active,
      importedFromCandidateId: row.imported_from_candidate_id ?? undefined,
      lastTestDate: row.last_test_date ?? undefined,
      // PRD-090 lifecycle fields
      status: row.status ?? (row.is_active ? 'active' : 'inactive'),
      terminationDate: row.termination_date ?? undefined,
      terminationReason: row.termination_reason ?? undefined,
      terminationReasonDetail: row.termination_reason_detail ?? undefined,
      terminationNotes: row.termination_notes ?? undefined,
      terminationScheduledDate: row.termination_scheduled_date ?? undefined,
      leaveType: row.leave_type ?? undefined,
      leaveStartDate: row.leave_start_date ?? undefined,
      leaveExpectedReturn: row.leave_expected_return ?? undefined,
      leaveIncludeMetrics: row.leave_include_metrics ?? false,
      previousTeamMemberId: row.previous_team_member_id ?? undefined,
      anonymized: row.anonymized ?? false,
      anonymizedAt: row.anonymized_at ?? undefined,
    };
  }

  private mapDevelopmentPlan(row: any): DevelopmentPlan {
    const objectives: DevelopmentObjective[] = (row.development_objectives ?? []).map(
      (obj: any) => ({
        id: obj.id,
        planId: obj.plan_id,
        dimension: obj.dimension,
        title: obj.title,
        description: obj.description ?? undefined,
        status: obj.status,
        priority: obj.priority,
        dueDate: obj.due_date ?? undefined,
        notes: obj.notes ?? undefined,
        createdAt: obj.created_at,
      }),
    );

    return {
      id: row.id,
      memberId: row.member_id,
      objectives,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapRetestSchedule(row: any): RetestSchedule {
    return {
      id: row.id,
      memberId: row.member_id,
      frequency: row.frequency,
      nextDate: row.next_date,
      autoSend: row.auto_send,
      lastSentAt: row.last_sent_at ?? undefined,
      createdAt: row.created_at,
    };
  }

  private mapAnnotation(row: any): EvolutionAnnotation {
    return {
      id: row.id,
      memberId: row.member_id,
      text: row.text,
      type: row.type,
      date: row.date,
      createdAt: row.created_at,
    };
  }

  private mapEvent(row: any): TeamMemberEvent {
    return {
      id: row.id,
      teamMemberId: row.team_member_id,
      companyId: row.company_id,
      eventType: row.event_type,
      eventDate: row.event_date,
      description: row.description ?? undefined,
      metadata: row.metadata ?? {},
      performedBy: row.performed_by ?? undefined,
      performedByName: row.profiles?.name ?? undefined,
      visibility: row.visibility,
      createdAt: row.created_at,
    };
  }

  private mapOffboardingChecklist(row: any): OffboardingChecklist {
    return {
      id: row.id,
      companyId: row.company_id,
      teamMemberId: row.team_member_id,
      itemLabel: row.item_label,
      isCompleted: row.is_completed,
      completedAt: row.completed_at ?? undefined,
      completedBy: row.completed_by ?? undefined,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    };
  }

  private mapOffboardingTemplate(row: any): OffboardingTemplate {
    return {
      id: row.id,
      companyId: row.company_id,
      itemLabel: row.item_label,
      isDefault: row.is_default,
      sortOrder: row.sort_order,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  private mapRetentionSettings(row: any): DataRetentionSettings {
    return {
      id: row.id,
      companyId: row.company_id,
      retentionYears: row.retention_years,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by ?? undefined,
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
