import { useState, useMemo, useCallback } from 'react';
import type { Plan, PlanPeriod } from '@/types';
import { mockPlans } from '@/data/plansData';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>(mockPlans);

  // Filter plans by type
  const candidatePlans = useMemo(() => plans.filter(p => p.type === 'candidate').sort((a,b) => a.order - b.order), [plans]);
  const companyPlans = useMemo(() => plans.filter(p => p.type === 'company').sort((a,b) => a.order - b.order), [plans]);

  // Get plan by ID or slug
  const getPlanById = useCallback((id: string) => plans.find(p => p.id === id), [plans]);
  const getPlanBySlug = useCallback((slug: string) => plans.find(p => p.slug === slug), [plans]);

  // Update plan (mock - just updates state)
  const updatePlan = useCallback((id: string, updates: Partial<Plan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // Update plan prices
  const updatePrices = useCallback((id: string, prices: Record<PlanPeriod, number>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, prices } : p));
  }, []);

  // Toggle plan active status
  const togglePlanStatus = useCallback((id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  }, []);

  return { plans, candidatePlans, companyPlans, getPlanById, getPlanBySlug, updatePlan, updatePrices, togglePlanStatus };
}
