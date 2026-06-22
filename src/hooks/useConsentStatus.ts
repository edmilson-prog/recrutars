/**
 * Consent status hook (company side).
 * Gates the "Contratar" button: the company can only hire once the candidate
 * has accepted the data disclosure for the application.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getConsentService } from '@/services/consent/consentService';
import type { DisclosureStatus } from '@/types/consent';

// --- Query Key Factory ---

export const consentKeys = {
  all: ['consent'] as const,
  disclosure: (applicationId: string) =>
    [...consentKeys.all, 'disclosure', applicationId] as const,
  byCandidate: (candidateId: string) =>
    [...consentKeys.all, 'byCandidate', candidateId] as const,
};

/**
 * Returns the disclosure status for an application (company view).
 * `data` is the disclosure status ('pending' | 'accepted' | 'refused' | 'revoked')
 * or `null` when no disclosure exists yet.
 */
export function useConsentStatus(
  applicationId: string,
): UseQueryResult<DisclosureStatus | null> {
  return useQuery<DisclosureStatus | null>({
    queryKey: consentKeys.disclosure(applicationId),
    queryFn: async () => {
      const service = await getConsentService();
      const disclosure = await service.getDisclosure(applicationId);
      return disclosure?.status ?? null;
    },
    enabled: !!applicationId,
  });
}
