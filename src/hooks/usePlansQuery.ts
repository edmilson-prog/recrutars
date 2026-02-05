/**
 * Plans Query Hooks
 * PRD-066: Service Layer — React Query integration for Plans module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlansService } from '@/services/plans/plansService';
import type { SubscriptionFilters, CreateSubscriptionData } from '@/services/plans/plansService';

const PLANS_KEY = 'plans';
const CAPABILITIES_KEY = 'plan-capabilities';
const SUBSCRIPTIONS_KEY = 'subscriptions';

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export function usePlans(type?: 'candidate' | 'company') {
  return useQuery({
    queryKey: [PLANS_KEY, { type }],
    queryFn: async () => {
      const svc = await getPlansService();
      return svc.getPlans(type);
    },
  });
}

export function usePlan(id: string | undefined) {
  return useQuery({
    queryKey: [PLANS_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const svc = await getPlansService();
      return svc.getPlan(id);
    },
    enabled: !!id,
  });
}

export function usePlanBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: [PLANS_KEY, 'slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const svc = await getPlansService();
      return svc.getPlanBySlug(slug);
    },
    enabled: !!slug,
  });
}

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------

export function useCapabilities() {
  return useQuery({
    queryKey: [CAPABILITIES_KEY],
    queryFn: async () => {
      const svc = await getPlansService();
      return svc.getCapabilities();
    },
  });
}

export function useCapabilityAssignments(planId: string | undefined) {
  return useQuery({
    queryKey: [CAPABILITIES_KEY, 'assignments', planId],
    queryFn: async () => {
      if (!planId) return [];
      const svc = await getPlansService();
      return svc.getCapabilityAssignments(planId);
    },
    enabled: !!planId,
  });
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export function useSubscriptions(filters?: SubscriptionFilters) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_KEY, filters],
    queryFn: async () => {
      const svc = await getPlansService();
      return svc.getSubscriptions(filters);
    },
  });
}

export function useSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_KEY, 'user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const svc = await getPlansService();
      return svc.getSubscription(userId);
    },
    enabled: !!userId,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSubscriptionData) => {
      const svc = await getPlansService();
      return svc.createSubscription(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] });
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const svc = await getPlansService();
      return svc.cancelSubscription(id, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] });
    },
  });
}
