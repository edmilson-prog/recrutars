/**
 * Settings React Query Hooks
 * Persistência de configurações do sistema via Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettingsService } from '@/services/settings/settingsService';
import type { ConfigPanel } from '@/types/settings';
import type { SaveSectionParams } from '@/services/settings/settingsService';

export const settingsKeys = {
  all: ['settings'] as const,
  panel: (panel: ConfigPanel, entityId?: string) =>
    [...settingsKeys.all, panel, entityId ?? 'global'] as const,
  history: (panel: ConfigPanel, entityId?: string) =>
    [...settingsKeys.all, 'history', panel, entityId ?? 'global'] as const,
};

export function useSettingsData(panel: ConfigPanel, entityId?: string) {
  return useQuery({
    queryKey: settingsKeys.panel(panel, entityId),
    queryFn: async () => {
      const service = await getSettingsService();
      return service.getSettings({ panel, entityId });
    },
    staleTime: 5 * 60 * 1000, // 5 min — settings don't change frequently
  });
}

export function useSettingsHistory(panel: ConfigPanel, entityId?: string) {
  return useQuery({
    queryKey: settingsKeys.history(panel, entityId),
    queryFn: async () => {
      const service = await getSettingsService();
      return service.getHistory({ panel, entityId });
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: SaveSectionParams) => {
      const service = await getSettingsService();
      return service.saveSection(params);
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.panel(params.panel, params.entityId),
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.history(params.panel, params.entityId),
      });
    },
  });
}

export function useMigrateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      panel: ConfigPanel;
      values: Record<string, Record<string, Record<string, unknown>>>;
      entityId?: string;
      userId?: string;
    }) => {
      const service = await getSettingsService();
      return service.migrateFromLocalStorage(
        params.panel,
        params.values,
        params.entityId,
        params.userId,
      );
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.panel(params.panel, params.entityId),
      });
    },
  });
}
