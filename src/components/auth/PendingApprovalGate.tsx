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
  const candidateId = currentCandidate?.id ?? '';
  const pending = usePendingApprovals(candidateId);

  // Bypass while auth resolves, during admin impersonation (read-only), and for
  // any non-candidate session.
  if (loading || isImpersonationActive) return null;
  if (!user || user.type !== 'candidate' || !currentCandidate) return null;
  if (pending.length === 0) return null;

  const current = pending[0];
  return (
    <ApprovalConsentModal
      open
      blocking
      application={current.application}
      disclosure={current.disclosure}
      queueIndex={1}
      queueTotal={pending.length}
    />
  );
}
