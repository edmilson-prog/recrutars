/**
 * CompanyTourProvider (Fase 4)
 * Holds tour state, auto-starts once on /empresa for first-time collaborators,
 * and exposes startTour() via useCompanyTour(). Renders the overlay when active.
 */

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_TOUR_STEPS } from '@/data/companyTourSteps';
import { useCompleteCompanyTour } from '@/hooks/useCompanyTourQuery';
import { CompanyTourOverlay } from './CompanyTourOverlay';

interface CompanyTourContextValue {
  startTour: () => void;
  isActive: boolean;
}

const CompanyTourContext = createContext<CompanyTourContextValue | null>(null);

export function useCompanyTour(): CompanyTourContextValue {
  const ctx = useContext(CompanyTourContext);
  if (!ctx) throw new Error('useCompanyTour must be used within CompanyTourProvider');
  return ctx;
}

export function CompanyTourProvider({ children }: { children: ReactNode }) {
  const { companyTourCompleted, companyOnboardingStep, isImpersonationActive } = useAuth();
  const location = useLocation();
  const reducedMotion = useReducedMotion() ?? false;
  const completeMutation = useCompleteCompanyTour();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const autoStartedRef = useRef(false);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const end = useCallback(() => {
    setActive(false);
    if (companyTourCompleted === false && !isImpersonationActive) {
      completeMutation.mutate();
    }
  }, [companyTourCompleted, isImpersonationActive, completeMutation]);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i >= COMPANY_TOUR_STEPS.length - 1) { end(); return i; }
      return i + 1;
    });
  }, [end]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Auto-start once on the dashboard for a first-time collaborator.
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (isImpersonationActive) return;
    if (location.pathname !== '/empresa') return;
    if (companyOnboardingStep !== 'completed') return;
    if (companyTourCompleted !== false) return;
    autoStartedRef.current = true;
    startTour();
  }, [location.pathname, companyOnboardingStep, companyTourCompleted, isImpersonationActive, startTour]);

  // Esc closes the tour.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') end(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, end]);

  return (
    <CompanyTourContext.Provider value={{ startTour, isActive: active }}>
      {children}
      {active && (
        <CompanyTourOverlay
          steps={COMPANY_TOUR_STEPS}
          stepIndex={stepIndex}
          onPrev={prev}
          onNext={next}
          onSkip={end}
          reducedMotion={reducedMotion}
        />
      )}
    </CompanyTourContext.Provider>
  );
}
