/**
 * Plans Query Hooks
 * PRD-066: Service Layer — React Query integration for Plans module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlansService } from '@/services/plans/plansService';
import type { SubscriptionFilters, CreateSubscriptionData } from '@/services/plans/plansService';
import type { Subscription, SubscriptionStatus } from '@/types';

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
    onError: (err) => {
      console.error('[Plans] updatePlan failed:', err);
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
    onError: (err) => {
      console.error('[Plans] createPlan failed:', err);
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
    onError: (err) => {
      console.error('[Plans] deletePlan failed:', err);
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
    onError: (err) => {
      console.error('[Plans] createCapability failed:', err);
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
    onError: (err) => {
      console.error('[Plans] deleteCapability failed:', err);
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
    onError: (err) => {
      console.error('[Plans] upsertAssignment failed:', err);
    },
  });
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

/** Normalizes a raw subscription row from snake_case to camelCase. */
function normalizeSubscription(raw: Record<string, unknown>): Subscription {
  return {
    id: (raw.id as string) ?? '',
    userId: (raw.userId ?? raw.user_id ?? '') as string,
    userType: (raw.userType ?? raw.user_type ?? 'company') as 'candidate' | 'company',
    userName: (raw.userName ?? raw.user_name ?? '') as string,
    planId: (raw.planId ?? raw.plan_id ?? '') as string,
    planSlug: (raw.planSlug ?? raw.plan_slug ?? '') as string,
    planName: (raw.planName ?? raw.plan_name ?? '') as string,
    status: (raw.status ?? 'pending') as SubscriptionStatus,
    period: (raw.period ?? 'monthly') as string,
    pricePaid: Number(raw.pricePaid ?? raw.price_paid ?? 0),
    startDate: (raw.startDate ?? raw.start_date ?? '') as string,
    endDate: (raw.endDate ?? raw.end_date ?? '') as string,
    renewalDate: (raw.renewalDate ?? raw.renewal_date ?? '') as string,
    isEarlyAdopter: Boolean(raw.isEarlyAdopter ?? raw.is_early_adopter ?? false),
    isTrial: Boolean(raw.isTrial ?? raw.is_trial ?? false),
    trialStartDate: (raw.trialStartDate ?? raw.trial_start_date) as string | undefined,
    trialEndDate: (raw.trialEndDate ?? raw.trial_end_date) as string | undefined,
    createdAt: (raw.createdAt ?? raw.created_at ?? '') as string,
    cancelledAt: (raw.cancelledAt ?? raw.cancelled_at) as string | undefined,
    cancellationReason: (raw.cancellationReason ?? raw.cancellation_reason) as string | undefined,
    stripeCustomerId: (raw.stripeCustomerId ?? raw.stripe_customer_id) as string | undefined,
    stripeSubscriptionId: (raw.stripeSubscriptionId ?? raw.stripe_subscription_id) as string | undefined,
  } as Subscription;
}

export function useSubscriptions(filters?: SubscriptionFilters) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_KEY, filters],
    queryFn: async () => {
      const svc = await getPlansService();
      const raw = await svc.getSubscriptions(filters);
      return (raw as unknown as Record<string, unknown>[]).map(normalizeSubscription);
    },
  });
}

export function useSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: [SUBSCRIPTIONS_KEY, 'user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const svc = await getPlansService();
      const raw = await svc.getSubscription(userId);
      if (!raw) return null;
      return normalizeSubscription(raw as unknown as Record<string, unknown>);
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
    onError: (err) => {
      console.error('[Plans] createSubscription failed:', err);
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
    onError: (err) => {
      console.error('[Plans] cancelSubscription failed:', err);
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
      const raw = await svc.getTrialSubscription(userId);
      if (!raw) return null;
      return normalizeSubscription(raw as unknown as Record<string, unknown>);
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
    onError: (err) => {
      console.error('[Plans] createTrialSubscription failed:', err);
    },
  });
}
