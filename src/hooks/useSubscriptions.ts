/**
 * useSubscriptions Hook (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates to usePlansQuery service hooks.
 * Consumers can continue using the same API; data now flows through the service layer.
 */

import { useMemo, useCallback } from 'react';
import type { Subscription, SubscriptionStatus } from '@/types';
import {
  useSubscriptions as useSubscriptionsQuery,
  useCancelSubscription,
} from './usePlansQuery';

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

export function useSubscriptions() {
  const { data: rawSubscriptions = [], isLoading, error } = useSubscriptionsQuery();

  // Normalize snake_case -> camelCase for all subscriptions
  const subscriptions = useMemo(
    () => rawSubscriptions.map((s) => normalizeSubscription(s as unknown as Record<string, unknown>)),
    [rawSubscriptions],
  );
  const cancelMutation = useCancelSubscription();

  // Stats
  const stats = useMemo(() => ({
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    earlyAdopters: subscriptions.filter(s => s.isEarlyAdopter).length,
    byPlan: subscriptions.reduce((acc, s) => {
      acc[s.planName] = (acc[s.planName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPeriod: subscriptions.reduce((acc, s) => {
      acc[s.period] = (acc[s.period] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalRevenue: subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.pricePaid, 0),
  }), [subscriptions]);

  // Filter subscriptions
  const filterSubscriptions = useCallback((filters: {
    status?: SubscriptionStatus;
    planSlug?: string;
    userType?: 'candidate' | 'company';
    isEarlyAdopter?: boolean;
    search?: string;
  }) => {
    return subscriptions.filter(s => {
      if (filters.status && s.status !== filters.status) return false;
      if (filters.planSlug && s.planSlug !== filters.planSlug) return false;
      if (filters.userType && s.userType !== filters.userType) return false;
      if (filters.isEarlyAdopter !== undefined && s.isEarlyAdopter !== filters.isEarlyAdopter) return false;
      if (filters.search && !s.userName.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [subscriptions]);

  // Get subscription by ID
  const getSubscriptionById = useCallback(
    (id: string) => subscriptions.find(s => s.id === id),
    [subscriptions],
  );

  // Get history for subscription (placeholder — not yet in service layer)
  const getHistoryForSubscription = useCallback((_subscriptionId: string) => {
    return [] as Array<{ id: string; subscriptionId: string; action: string; performedBy: string; notes?: string; createdAt: string }>;
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback((id: string, reason: string) => {
    cancelMutation.mutate({ id, reason });
  }, [cancelMutation]);

  // Reactivate subscription (placeholder — no reactivate endpoint yet)
  const reactivateSubscription = useCallback((_id: string) => {
    console.warn('[useSubscriptions] reactivateSubscription is not yet available via the service layer.');
  }, []);

  return {
    subscriptions,
    stats,
    filterSubscriptions,
    getSubscriptionById,
    getHistoryForSubscription,
    cancelSubscription,
    reactivateSubscription,
    history: [],
    purchases: [],
    isLoading,
    error,
  };
}
