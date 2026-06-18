/**
 * Collaborator Preferences Query Hooks (Fase 3)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCollaboratorPreferencesService,
  type SaveCollaboratorPreferencesParams,
} from '@/services/collaboratorPreferences/collaboratorPreferencesService';

const KEYS = {
  byCollaborator: (companyId: string, profileId: string) =>
    ['collaboratorPreferences', companyId, profileId] as const,
};

/** Fetch a collaborator's notification preferences (defaults if no row yet). */
export function useCollaboratorPreferences(companyId?: string, profileId?: string) {
  return useQuery({
    queryKey: KEYS.byCollaborator(companyId ?? '', profileId ?? ''),
    queryFn: async () => {
      const service = await getCollaboratorPreferencesService();
      return service.getPreferences(companyId as string, profileId as string);
    },
    enabled: !!companyId && !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Save (upsert) a collaborator's notification preferences. */
export function useSaveCollaboratorPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveCollaboratorPreferencesParams) => {
      const service = await getCollaboratorPreferencesService();
      return service.savePreferences(params);
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({
        queryKey: KEYS.byCollaborator(params.companyId, params.profileId),
      });
    },
  });
}
