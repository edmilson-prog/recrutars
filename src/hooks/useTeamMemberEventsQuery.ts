/**
 * Team Member Events Query Hooks
 * PRD-090: Ciclo de Vida do Colaborador (Empresa)
 *
 * React Query hooks for lifecycle events (timeline), offboarding checklists,
 * offboarding templates, and data retention settings.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeamsService } from '@/services/teams/teamsService';
import type { EventsFilters } from '@/services/teams/teamsService';
import { teamKeys } from './useTeamsQuery';

// ---------------------------------------------------------------------------
// Query keys (extend teamKeys pattern)
// ---------------------------------------------------------------------------

export const lifecycleKeys = {
  events: (memberId: string, filters?: EventsFilters) =>
    [...teamKeys.all, 'events', memberId, filters] as const,
  offboardingChecklist: (memberId: string) =>
    [...teamKeys.all, 'offboarding-checklist', memberId] as const,
  offboardingTemplates: (companyId: string) =>
    [...teamKeys.all, 'offboarding-templates', companyId] as const,
  retentionSettings: (companyId: string) =>
    [...teamKeys.all, 'retention-settings', companyId] as const,
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function useTeamMemberEvents(memberId: string, filters?: EventsFilters) {
  return useQuery({
    queryKey: lifecycleKeys.events(memberId, filters),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getTeamMemberEvents(memberId, filters);
    },
    enabled: !!memberId,
  });
}

// ---------------------------------------------------------------------------
// Offboarding
// ---------------------------------------------------------------------------

export function useOffboardingChecklist(memberId: string) {
  return useQuery({
    queryKey: lifecycleKeys.offboardingChecklist(memberId),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getOffboardingChecklist(memberId);
    },
    enabled: !!memberId,
  });
}

export function useToggleOffboardingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isCompleted, completedBy }: { id: string; isCompleted: boolean; completedBy: string }) => {
      const service = await getTeamsService();
      return service.toggleOffboardingItem(id, isCompleted, completedBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useOffboardingTemplates(companyId: string | undefined) {
  return useQuery({
    queryKey: lifecycleKeys.offboardingTemplates(companyId!),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getOffboardingTemplates(companyId!);
    },
    enabled: !!companyId,
  });
}

export function useCreateOffboardingTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Parameters<Awaited<ReturnType<typeof getTeamsService>>['createOffboardingTemplate']>[0]) => {
      const service = await getTeamsService();
      return service.createOffboardingTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useUpdateOffboardingTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const service = await getTeamsService();
      return service.updateOffboardingTemplate(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Data Retention Settings (LGPD)
// ---------------------------------------------------------------------------

export function useDataRetentionSettings(companyId: string | undefined) {
  return useQuery({
    queryKey: lifecycleKeys.retentionSettings(companyId!),
    queryFn: async () => {
      const service = await getTeamsService();
      return service.getDataRetentionSettings(companyId!);
    },
    enabled: !!companyId,
  });
}

export function useSaveRetentionSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, retentionYears, updatedBy }: { companyId: string; retentionYears: number; updatedBy: string }) => {
      const service = await getTeamsService();
      return service.saveDataRetentionSettings(companyId, retentionYears, updatedBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
