/**
 * usePlans Hook (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates to usePlansQuery service hooks.
 * Consumers can continue using the same API; data now flows through the service layer.
 */

import { useMemo, useCallback } from 'react';
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

  return {
    plans,
    candidatePlans,
    companyPlans,
    getPlanById,
    getPlanBySlug,
    isLoading,
    error,
  };
}
