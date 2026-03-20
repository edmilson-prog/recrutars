/**
 * Teams Query Hooks
 * PRD-066: Service Layer Pattern
 *
 * React Query hooks for departments, positions, team members,
 * development plans, retest schedules, and evolution annotations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeamsService } from '@/services/teams/teamsService';
import type { TeamsFilters } from '@/services/teams/teamsService';
import type {
  Department,
  TeamMember,
  DevelopmentPlan,
  RetestSchedule,
  EvolutionAnnotation,
  Position,
} from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const teamKeys = {
  all: ['teams'] as const,
  departments: (companyId: string) => [...teamKeys.all, 'departments', companyId] as const,
  positions: (deptId: string) => [...teamKeys.all, 'positions', deptId] as const,
  members: (filters?: TeamsFilters) => [...teamKeys.all, 'members', filters] as const,
  member: (id: string) => [...teamKeys.all, 'member', id] as const,
  devPlan: (memberId: string) => [...teamKeys.all, 'devPlan', memberId] as const,
  retestSchedules: (companyId: string) => [...teamKeys.all, 'retest', companyId] as const,
  annotations: (memberId: string) => [...teamKeys.all, 'annotations', memberId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch departments for a company */
export function useDepartments(companyId: string | undefined) {
  return useQuery({
    queryKey: teamKeys.departments(companyId),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getDepartments(companyId);
    },
    enabled: !!companyId,
  });
}

/** Fetch positions for a department */
export function usePositions(departmentId: string) {
  return useQuery({
    queryKey: teamKeys.positions(departmentId),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getPositions(departmentId);
    },
    enabled: !!departmentId,
  });
}

/** Fetch team members with optional filters */
export function useTeamMembers(filters?: TeamsFilters) {
  return useQuery({
    queryKey: teamKeys.members(filters),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getTeamMembers(filters);
    },
  });
}

/** Fetch a single team member by ID */
export function useTeamMember(id: string) {
  return useQuery({
    queryKey: teamKeys.member(id),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getTeamMember(id);
    },
    enabled: !!id,
  });
}

/** Fetch development plan for a member */
export function useDevelopmentPlan(memberId: string) {
  return useQuery({
    queryKey: teamKeys.devPlan(memberId),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getDevelopmentPlan(memberId);
    },
    enabled: !!memberId,
  });
}

/** Fetch retest schedules for a company */
export function useRetestSchedules(companyId: string) {
  return useQuery({
    queryKey: teamKeys.retestSchedules(companyId),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getRetestSchedules(companyId);
    },
    enabled: !!companyId,
  });
}

/** Fetch evolution annotations for a member */
export function useAnnotations(memberId: string) {
  return useQuery({
    queryKey: teamKeys.annotations(memberId),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getAnnotations(memberId);
    },
    enabled: !!memberId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new team member */
export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<TeamMember, 'id'>) => {
      const service = await getTeamsService();
      return service.createTeamMember(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** Update an existing team member */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TeamMember> }) => {
      const service = await getTeamsService();
      return service.updateTeamMember(id, updates);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.member(id) });
      queryClient.invalidateQueries({ queryKey: [...teamKeys.all, 'members'] });
    },
  });
}

/** Create a new department */
export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, ...data }: { companyId: string } & Omit<Department, 'id' | 'createdAt'>) => {
      const service = await getTeamsService();
      return service.createDepartment(companyId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** Update an existing department */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Department> }) => {
      const service = await getTeamsService();
      return service.updateDepartment(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** Create a new position */
export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Position, 'id'>) => {
      const service = await getTeamsService();
      return service.createPosition(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** Update an existing position */
export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Position> }) => {
      const service = await getTeamsService();
      return service.updatePosition(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** Save (create or update) a development plan */
export function useSaveDevelopmentPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: DevelopmentPlan) => {
      const service = await getTeamsService();
      return service.saveDevelopmentPlan(plan);
    },
    onSuccess: (_, plan) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.devPlan(plan.memberId),
      });
    },
  });
}

/** Fetch retest schedule for a specific member */
export function useMemberRetestSchedule(memberId: string | undefined) {
  return useQuery<RetestSchedule | null>({
    queryKey: [...teamKeys.all, 'memberRetest', memberId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('retest_schedules')
        .select('*')
        .eq('member_id', memberId!)
        .order('next_date', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      if (!data) return null;
      return {
        id: data.id,
        memberId: data.member_id,
        frequency: data.frequency,
        nextDate: data.next_date,
        autoSend: data.auto_send,
        lastSentAt: data.last_sent_at ?? undefined,
        createdAt: data.created_at,
      } as RetestSchedule;
    },
    enabled: !!memberId,
  });
}

/** Save (create or update) a retest schedule */
export function useSaveRetestSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: RetestSchedule) => {
      const service = await getTeamsService();
      return service.saveRetestSchedule(schedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/** Create an evolution annotation */
export function useCreateAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<EvolutionAnnotation, 'id' | 'createdAt'>) => {
      const service = await getTeamsService();
      return service.createAnnotation(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.annotations(variables.memberId),
      });
    },
  });
}
