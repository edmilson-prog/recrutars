/**
 * TrialGuard Component
 * PRD-074: Route wrapper that blocks access for expired trial companies.
 * Tasks 5+6: also handles the awaiting-release branch (trial never released
 * by admin), showing a welcoming AwaitingRelease page instead of the punitive
 * TrialExpired page.
 *
 * If the company's trial has expired, renders the TrialExpired page
 * instead of the children. Allows access to /empresa/configuracoes
 * so the company can manage basic account settings (RF-011).
 */

import { ReactNode, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useAuth } from '@/contexts/AuthContext';

const LazyTrialExpired = lazy(() => import('@/pages/empresa/TrialExpired'));
const LazyAwaitingRelease = lazy(() => import('@/pages/empresa/AwaitingRelease'));

interface TrialGuardProps {
  children: ReactNode;
}

/** Routes accessible even when trial is expired or awaiting release */
const ALLOWED_EXPIRED_PATHS = [
  '/empresa/configuracoes',
  '/empresa/meu-plano',
  '/empresa/checkout/sucesso',
  '/empresa/checkout/cancelado',
];

const guardFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

export function TrialGuard({ children }: TrialGuardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { isTrial, isExpired, isLoading, awaitingRelease } = useTrialStatus();

  // Only applies to company users
  if (!user || user.type !== 'company') {
    return <>{children}</>;
  }

  // While loading subscription data, show children (avoid flash)
  if (isLoading) {
    return <>{children}</>;
  }

  const isAllowedPath = ALLOWED_EXPIRED_PATHS.some(
    (path) => location.pathname.startsWith(path),
  );

  // Trial never released by the admin — welcoming "awaiting release" page.
  // Checked BEFORE isExpired: a just-created locked trial has end date = today,
  // which does not count as expired yet (daysRemaining = 0).
  if (isTrial && awaitingRelease) {
    if (isAllowedPath) return <>{children}</>;
    return (
      <Suspense fallback={guardFallback}>
        <LazyAwaitingRelease />
      </Suspense>
    );
  }

  // If not on trial or trial is active, allow through
  if (!isTrial || !isExpired) {
    return <>{children}</>;
  }

  if (isAllowedPath) {
    return <>{children}</>;
  }

  // Render the conversion page
  return (
    <Suspense fallback={guardFallback}>
      <LazyTrialExpired />
    </Suspense>
  );
}
