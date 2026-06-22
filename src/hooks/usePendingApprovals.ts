/**
 * Detects "blocking" approvals for the logged-in candidate: applications that
 * reached status 'offer' but whose data-disclosure consent is still 'pending'.
 * The candidate must resolve each one (accept / refuse data / decline job)
 * before the platform unlocks. Pure `selectPendingApprovals` is unit-tested;
 * the hook just wires the two existing queries together.
 */
import { useMemo } from 'react';
import { useApplicationsByCandidate } from '@/hooks/useApplicationsQuery';
import { useCandidateDisclosures } from '@/hooks/useCandidateDisclosures';
import type { Application } from '@/types';
import type { DataDisclosure } from '@/types/consent';

export interface PendingApproval {
  application: Application;
  disclosure: DataDisclosure;
}

export function selectPendingApprovals(
  applications: Application[],
  disclosures: Record<string, DataDisclosure>,
): PendingApproval[] {
  return applications
    .filter(
      (app) => app.status === 'offer' && disclosures[app.id]?.status === 'pending',
    )
    .map((app) => ({ application: app, disclosure: disclosures[app.id] }))
    .sort(
      (a, b) =>
        new Date(a.application.updatedAt).getTime() -
        new Date(b.application.updatedAt).getTime(),
    );
}

export function usePendingApprovals(candidateId: string): PendingApproval[] {
  const { data: applications = [] } = useApplicationsByCandidate(candidateId);
  const { data: disclosures = {} } = useCandidateDisclosures(candidateId);
  return useMemo(
    () => selectPendingApprovals(applications, disclosures),
    [applications, disclosures],
  );
}
