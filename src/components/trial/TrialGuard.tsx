/**
 * TrialGuard Component
 * PRD-074: Route wrapper that blocks access for expired trial companies.
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

interface TrialGuardProps {
  children: ReactNode;
}

/** Routes accessible even when trial is expired */
const ALLOWED_EXPIRED_PATHS = ['/empresa/configuracoes'];

export function TrialGuard({ children }: TrialGuardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { isTrial, isExpired, isLoading } = useTrialStatus();

  // Only applies to company users
  if (!user || user.type !== 'company') {
    return <>{children}</>;
  }

  // While loading subscription data, show children (avoid flash)
  if (isLoading) {
    return <>{children}</>;
  }

  // If not on trial or trial is active, allow through
  if (!isTrial || !isExpired) {
    return <>{children}</>;
  }

  // Trial is expired — check if current path is allowed
  const isAllowedPath = ALLOWED_EXPIRED_PATHS.some(
    (path) => location.pathname.startsWith(path),
  );

  if (isAllowedPath) {
    return <>{children}</>;
  }

  // Render the conversion page
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <LazyTrialExpired />
    </Suspense>
  );
}
