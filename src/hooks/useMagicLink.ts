/**
 * Hook: useMagicLink
 * PRD-048: Teste por Vaga
 *
 * Validation of magic links for external candidates.
 * Now uses Supabase via React Query hooks.
 */

import { useJobAssessmentInviteByToken } from '@/hooks/useJobAssessmentsQuery';
import type { JobAssessmentInvite } from '@/types/assessment';

export interface UseMagicLinkReturn {
  invite: JobAssessmentInvite | null | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Validates a magic token and returns the associated invite.
 */
export function useMagicLink(token: string): UseMagicLinkReturn {
  const { data: invite, isLoading, isError } = useJobAssessmentInviteByToken(token);

  return {
    invite: invite ?? null,
    isLoading,
    isError,
  };
}
