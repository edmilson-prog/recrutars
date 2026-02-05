/**
 * usePlans Hook (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates to usePlansQuery service hooks.
 * Consumers can continue using the same API; data now flows through the service layer.
 */

import { useMemo, useCallback } from 'react';
import type { Plan, PlanPeriod } from '@/types';
import { usePlans as usePlansQuery } from './usePlansQuery';

export function usePlans() {
  const { data: plans = [], isLoading, error } = usePlansQuery();

  // Filter plans by type
  const candidatePlans = useMemo(
    () => plans.filter(p => p.type === 'candidate').sort((a, b) => a.order - b.order),
    [plans],
  );
  const companyPlans = useMemo(
    () => plans.filter(p => p.type === 'company').sort((a, b) => a.order - b.order),
    [plans],
  );

  // Get plan by ID or slug
  const getPlanById = useCallback(
    (id: string) => plans.find(p => p.id === id),
    [plans],
  );
  const getPlanBySlug = useCallback(
    (slug: string) => plans.find(p => p.slug === slug),
    [plans],
  );

  // Update plan (no-op placeholder — mutations are handled by usePlansQuery mutators)
  const updatePlan = useCallback((_id: string, _updates: Partial<Plan>) => {
    console.warn('[usePlans] updatePlan is a no-op wrapper. Use useUpdatePlan() mutation from usePlansQuery instead.');
  }, []);

  // Update plan prices (no-op placeholder)
  const updatePrices = useCallback((_id: string, _prices: Record<PlanPeriod, number>) => {
    console.warn('[usePlans] updatePrices is a no-op wrapper. Use useUpdatePlan() mutation from usePlansQuery instead.');
  }, []);

  // Toggle plan active status (no-op placeholder)
  const togglePlanStatus = useCallback((_id: string) => {
    console.warn('[usePlans] togglePlanStatus is a no-op wrapper. Use useUpdatePlan() mutation from usePlansQuery instead.');
  }, []);

  return {
    plans,
    candidatePlans,
    companyPlans,
    getPlanById,
    getPlanBySlug,
    updatePlan,
    updatePrices,
    togglePlanStatus,
    isLoading,
    error,
  };
}
