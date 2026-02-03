import { useState, useMemo, useCallback } from 'react';
import type { Subscription, SubscriptionHistory, OneTimePurchase, SubscriptionStatus } from '@/types';
import { mockSubscriptions, mockSubscriptionHistory, mockOneTimePurchases } from '@/data/plansData';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [history, setHistory] = useState<SubscriptionHistory[]>(mockSubscriptionHistory);
  const [purchases, setPurchases] = useState<OneTimePurchase[]>(mockOneTimePurchases);

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
  const getSubscriptionById = useCallback((id: string) => subscriptions.find(s => s.id === id), [subscriptions]);

  // Get history for subscription
  const getHistoryForSubscription = useCallback((subscriptionId: string) =>
    history.filter(h => h.subscriptionId === subscriptionId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  [history]);

  // Cancel subscription
  const cancelSubscription = useCallback((id: string, reason: string) => {
    const now = new Date().toISOString();
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' as SubscriptionStatus, cancelledAt: now, cancellationReason: reason } : s));
    setHistory(prev => [...prev, {
      id: `sh-cancel-${Date.now()}`,
      subscriptionId: id,
      action: 'cancelled' as const,
      performedBy: 'admin',
      notes: reason,
      createdAt: now,
    }]);
  }, []);

  // Reactivate subscription
  const reactivateSubscription = useCallback((id: string) => {
    const now = new Date().toISOString();
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'active' as SubscriptionStatus, cancelledAt: undefined, cancellationReason: undefined } : s));
    setHistory(prev => [...prev, {
      id: `sh-react-${Date.now()}`,
      subscriptionId: id,
      action: 'reactivated' as const,
      performedBy: 'admin',
      createdAt: now,
    }]);
  }, []);

  return { subscriptions, stats, filterSubscriptions, getSubscriptionById, getHistoryForSubscription, cancelSubscription, reactivateSubscription, history, purchases };
}
