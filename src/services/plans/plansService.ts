/**
 * Plans Service — Interface
 * PRD-066: Service Layer Pattern
 *
 * Manages plans, capabilities, and subscriptions.
 */

import type {
  Plan,
  PlanCapability,
  PlanCapabilityAssignment,
  Subscription,
  SubscriptionStatus,
} from '@/types/plans';

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  userType?: 'candidate' | 'company';
  planId?: string;
}

export interface CreateSubscriptionData {
  userId: string;
  userType: 'candidate' | 'company';
  userName: string;
  planId: string;
  planSlug: string;
  planName: string;
  period: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  pricePaid: number;
}

export interface IPlansService {
  /** List all plans, optionally filtered by type. */
  getPlans(type?: 'candidate' | 'company'): Promise<Plan[]>;

  /** Get a single plan by ID. */
  getPlan(id: string): Promise<Plan | null>;

  /** Get a single plan by slug. */
  getPlanBySlug(slug: string): Promise<Plan | null>;

  /** List all plan capabilities. */
  getCapabilities(): Promise<PlanCapability[]>;

  /** List capability assignments for a specific plan. */
  getCapabilityAssignments(planId: string): Promise<PlanCapabilityAssignment[]>;

  /** List subscriptions with optional filters. */
  getSubscriptions(filters?: SubscriptionFilters): Promise<Subscription[]>;

  /** Get a specific user's active subscription. */
  getSubscription(userId: string): Promise<Subscription | null>;

  /** Create a new subscription. */
  createSubscription(data: CreateSubscriptionData): Promise<Subscription>;

  /** Cancel a subscription. */
  cancelSubscription(id: string, reason?: string): Promise<Subscription>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IPlansService | null = null;

export async function getPlansService(): Promise<IPlansService> {
  if (_instance) return _instance;

  const { SupabasePlansService } = await import('./plansService.supabase');
  _instance = new SupabasePlansService();
  return _instance;
}
