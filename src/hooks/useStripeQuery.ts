/**
 * Stripe Query Hooks
 * PRD-075: React Query integration for Stripe operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getStripeService } from '@/services/stripe/stripeService';
import type { StripeEnvironment, PlanPeriod } from '@/types/plans';
import type {
  UpgradePreviewParams,
  ExecuteUpgradeParams,
  ScheduleDowngradeParams,
  CancelSubscriptionParams,
} from '@/services/stripe/stripeService';

const STRIPE_KEY = 'stripe';
const PLANS_KEY = 'plans';

export function useStripeTestConnection() {
  return useMutation({
    mutationKey: [STRIPE_KEY, 'test-connection'],
    mutationFn: async (environment: StripeEnvironment) => {
      const svc = await getStripeService();
      return svc.testConnection(environment);
    },
  });
}

export function useSyncPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [STRIPE_KEY, 'sync-plan'],
    mutationFn: async ({ planId, environment }: { planId: string; environment: StripeEnvironment }) => {
      const svc = await getStripeService();
      return svc.syncPlan(planId, environment);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLANS_KEY] });
    },
  });
}

export function useSyncAllPlans() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: [STRIPE_KEY, 'sync-all'],
    mutationFn: async (environment: StripeEnvironment) => {
      const svc = await getStripeService();
      return svc.syncAllPlans(environment);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PLANS_KEY] });
    },
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationKey: [STRIPE_KEY, 'checkout'],
    mutationFn: async (params: {
      userId: string;
      userType: 'candidate' | 'company';
      planId: string;
      period: PlanPeriod;
      environment: StripeEnvironment;
      successUrl: string;
      cancelUrl: string;
    }) => {
      const svc = await getStripeService();
      return svc.createCheckoutSession(params);
    },
  });
}

export function useUpgradePreview() {
  return useMutation({
    mutationKey: [STRIPE_KEY, 'preview-upgrade'],
    mutationFn: async (params: UpgradePreviewParams) => {
      const svc = await getStripeService();
      return svc.previewUpgrade(params);
    },
  });
}

export function useExecuteUpgrade() {
  return useMutation({
    mutationKey: [STRIPE_KEY, 'execute-upgrade'],
    mutationFn: async (params: ExecuteUpgradeParams) => {
      const svc = await getStripeService();
      return svc.executeUpgrade(params);
    },
  });
}

export function useScheduleDowngrade() {
  return useMutation({
    mutationKey: [STRIPE_KEY, 'schedule-downgrade'],
    mutationFn: async (params: ScheduleDowngradeParams) => {
      const svc = await getStripeService();
      return svc.scheduleDowngrade(params);
    },
  });
}

export function useCancelDowngrade() {
  return useMutation({
    mutationKey: [STRIPE_KEY, 'cancel-downgrade'],
    mutationFn: async ({ subscriptionId, environment }: { subscriptionId: string; environment: StripeEnvironment }) => {
      const svc = await getStripeService();
      return svc.cancelDowngrade(subscriptionId, environment);
    },
  });
}

export function useCancelSubscription() {
  return useMutation({
    mutationKey: [STRIPE_KEY, 'cancel-subscription'],
    mutationFn: async (params: CancelSubscriptionParams) => {
      const svc = await getStripeService();
      return svc.cancelSubscription(params);
    },
  });
}

export function useReactivateSubscription() {
  return useMutation({
    mutationKey: [STRIPE_KEY, 'reactivate'],
    mutationFn: async ({ subscriptionId, environment }: { subscriptionId: string; environment: StripeEnvironment }) => {
      const svc = await getStripeService();
      return svc.reactivateSubscription(subscriptionId, environment);
    },
  });
}
