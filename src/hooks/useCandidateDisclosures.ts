/**
 * Candidate disclosures hook.
 * Returns a map of applicationId -> DataDisclosure for the logged-in candidate,
 * so each application card can resolve its own consent state.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getConsentService } from '@/services/consent/consentService';
import { consentKeys } from '@/hooks/useConsentStatus';
import type { DataDisclosure } from '@/types/consent';

/**
 * Map of applicationId -> DataDisclosure for the given candidate.
 * Built from listDisclosuresByCandidate; empty object when none exist.
 */
export function useCandidateDisclosures(
  candidateId: string,
): UseQueryResult<Record<string, DataDisclosure>> {
  return useQuery<Record<string, DataDisclosure>>({
    queryKey: consentKeys.byCandidate(candidateId),
    queryFn: async () => {
      const service = await getConsentService();
      const disclosures = await service.listDisclosuresByCandidate(candidateId);
      return disclosures.reduce<Record<string, DataDisclosure>>(
        (map, disclosure) => {
          map[disclosure.applicationId] = disclosure;
          return map;
        },
        {},
      );
    },
    enabled: !!candidateId,
  });
}
