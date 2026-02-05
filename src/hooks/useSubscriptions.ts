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

export function useSubscriptions() {
  const { data: subscriptions = [], isLoading, error } = useSubscriptionsQuery();
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
