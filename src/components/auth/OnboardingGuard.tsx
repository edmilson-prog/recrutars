/**
 * OnboardingGuard
 * PRD-083: Route guard that redirects candidates to their pending onboarding step.
 * Existing candidates (onboarding_step === 'completed') pass through normally.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const ONBOARDING_ROUTES: Record<string, string> = {
  registration: '/cadastro',
  personal_profile: '/candidato/onboarding/perfil-pessoal',
  professional_profile: '/candidato/onboarding/perfil-profissional',
  gauge_pro_test: '/candidato/onboarding/teste-gauge-pro',
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { currentCandidate, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Only applies to candidates
  if (!user || user.type !== 'candidate') {
    return <>{children}</>;
  }

  // If no candidate record yet, let ProtectedRoute handle it
  if (!currentCandidate) {
    return <>{children}</>;
  }

  const step = currentCandidate.onboardingStep;

  // Completed or no step info — pass through
  if (!step || step === 'completed') {
    return <>{children}</>;
  }

  // Redirect to the appropriate onboarding step
  const redirectPath = ONBOARDING_ROUTES[step];
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
