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

export function useUpdatePlan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const svc = await getPlansService();
      return svc.updatePlan(id, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLANS_KEY] });
    },
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const svc = await getPlansService();
      return svc.createPlan(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLANS_KEY] });
    },
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getPlansService();
      return svc.deletePlan(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLANS_KEY] });
    },
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

export function useAllCapabilityAssignments() {
  return useQuery({
    queryKey: [CAPABILITIES_KEY, 'assignments', 'all'],
    queryFn: async () => {
      const svc = await getPlansService();
      return svc.getAllCapabilityAssignments();
    },
  });
}

export function useCreateCapability() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<import('@/types/plans').PlanCapability, 'id'>) => {
      const svc = await getPlansService();
      return svc.createCapability(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CAPABILITIES_KEY] });
    },
  });
}

export function useDeleteCapability() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const svc = await getPlansService();
      return svc.deleteCapability(key);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CAPABILITIES_KEY] });
    },
  });
}

export function useUpsertAssignment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, capabilityKey, value }: { planId: string; capabilityKey: string; value: string | number | boolean }) => {
      const svc = await getPlansService();
      return svc.upsertCapabilityAssignment(planId, capabilityKey, value);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CAPABILITIES_KEY] });
    },
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

// ---------------------------------------------------------------------------
// PRD-074: Trial Subscriptions
// ---------------------------------------------------------------------------

export function useTrialSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_KEY, 'trial', userId],
    queryFn: async () => {
      if (!userId) return null;
      const svc = await getPlansService();
      return svc.getTrialSubscription(userId);
    },
    enabled: !!userId,
  });
}

export function useCreateTrialSubscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyUserId,
      userName,
      planId,
    }: {
      companyUserId: string;
      userName: string;
      planId: string;
    }) => {
      const svc = await getPlansService();
      return svc.createTrialSubscription(companyUserId, userName, planId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] });
    },
  });
}
