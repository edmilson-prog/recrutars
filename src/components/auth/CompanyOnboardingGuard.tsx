/**
 * CompanyOnboardingGuard
 * Fase 2: redireciona colaboradores com onboarding pendente para o passo de perfil.
 * Donos (onboarding_step='completed') e impersonação passam direto.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyOnboardingGuardProps {
  children: React.ReactNode;
}

export function CompanyOnboardingGuard({ children }: CompanyOnboardingGuardProps) {
  const { user, companyOnboardingStep, loading, isImpersonationActive } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Impersonação bypassa o gate
  if (isImpersonationActive) {
    return <>{children}</>;
  }

  // Só se aplica a empresas
  if (!user || user.type !== 'company') {
    return <>{children}</>;
  }

  // Concluído ou sem info — passa
  if (!companyOnboardingStep || companyOnboardingStep === 'completed') {
    return <>{children}</>;
  }

  if (companyOnboardingStep === 'profile') {
    return <Navigate to="/empresa/onboarding/perfil" replace />;
  }

  return <>{children}</>;
}
