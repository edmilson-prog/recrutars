/**
 * PendingApprovalGate
 * Global gate (mounted once in App). When the logged-in candidate has an
 * approval whose data consent is still pending, it renders a BLOCKING modal
 * that locks the rest of the platform until they accept, refuse the data, or
 * decline the job. Mirrors OnboardingGuard's bypass rules (loading /
 * impersonation / non-candidate). Resolving one pending item reveals the next
 * (queue), since React Query refetches and re-evaluates after each action.
 */
import { useAuth } from '@/contexts/AuthContext';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { ApprovalConsentModal } from '@/components/consent/ApprovalConsentModal';

export function PendingApprovalGate() {
  const { user, currentCandidate, loading, isImpersonationActive } = useAuth();
  // Only an active (non-impersonated) candidate session drives the gate. Gating
  // candidateId here keeps both queries disabled (enabled: !!candidateId) while
  // auth resolves, during admin impersonation (read-only), and for non-candidate
  // sessions — so no wasted fetch happens before the early return below.
  const isActiveCandidate =
    !loading && !isImpersonationActive && user?.type === 'candidate';
  const candidateId = isActiveCandidate ? currentCandidate?.id ?? '' : '';
  const pending = usePendingApprovals(candidateId);

  if (!isActiveCandidate || !currentCandidate) return null;
  if (pending.length === 0) return null;

  const current = pending[0];
  return (
    <ApprovalConsentModal
      // Remount per application so internal state (consent checkbox, decline
      // confirmation) never leaks from one queued approval to the next.
      key={current.application.id}
      open
      blocking
      application={current.application}
      disclosure={current.disclosure}
      queueTotal={pending.length}
    />
  );
}
