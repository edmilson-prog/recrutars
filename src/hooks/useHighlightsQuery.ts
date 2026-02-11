/**
 * React Query hooks for Application Highlights
 * PRD-073: Destaques de candidatura customizável
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHighlightsService } from '@/services/highlights/highlightsService';
import type { ApplicationHighlights } from '@/types/applicationHighlight';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const highlightKeys = {
  all: ['highlights'] as const,
  byApplication: (applicationId: string) => [...highlightKeys.all, applicationId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch highlights for a specific application */
export function useApplicationHighlights(applicationId: string) {
  return useQuery({
    queryKey: highlightKeys.byApplication(applicationId),
    queryFn: async () => {
      const service = await getHighlightsService();
      return service.getHighlights(applicationId);
    },
    enabled: !!applicationId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Set (replace) highlights for an application */
export function useSetApplicationHighlights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, highlights }: {
      applicationId: string;
      highlights: ApplicationHighlights;
    }) => {
      const service = await getHighlightsService();
      return service.setHighlights(applicationId, highlights);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: highlightKeys.byApplication(applicationId) });
    },
  });
}
