/**
 * useTrialStatus Hook
 * PRD-074: Reestruturacao dos Planos de Empresas
 *
 * Computes the trial status for the current company user.
 * Returns trial info (days remaining, warning level, expiry state)
 * or a no-trial status if the user is not on a trial subscription.
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from './usePlansQuery';
import {
  calculateTrialStatus,
  getNoTrialStatus,
  type TrialStatus,
  type TrialWarningLevel,
} from '@/lib/trialRules';

interface UseTrialStatusReturn {
  trialStatus: TrialStatus;
  isLoading: boolean;
  isTrial: boolean;
  isExpired: boolean;
  /** True when the trial was never released by the admin (blocked, awaiting). */
  awaitingRelease: boolean;
  daysRemaining: number;
  warningLevel: TrialWarningLevel;
}

export function useTrialStatus(): UseTrialStatusReturn {
  const { user } = useAuth();
  const { data: subscription, isLoading } = useSubscription(user?.id);

  const trialStatus = useMemo<TrialStatus>(() => {
    if (!subscription || !subscription.isTrial) {
      return getNoTrialStatus();
    }

    if (!subscription.trialStartDate || !subscription.trialEndDate) {
      return getNoTrialStatus();
    }

    return calculateTrialStatus(
      subscription.trialStartDate,
      subscription.trialEndDate,
    );
  }, [subscription]);

  const awaitingRelease = Boolean(
    subscription?.isTrial && !subscription?.trialReleasedAt,
  );

  return {
    trialStatus,
    isLoading,
    isTrial: trialStatus.isTrial,
    isExpired: trialStatus.isExpired,
    awaitingRelease,
    daysRemaining: trialStatus.daysRemaining,
    warningLevel: trialStatus.warningLevel,
  };
}
