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
  userId?: string;
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

  /** List ALL capability assignments across all plans. */
  getAllCapabilityAssignments(): Promise<PlanCapabilityAssignment[]>;

  /** Create a new capability. */
  createCapability(data: Omit<PlanCapability, 'id'>): Promise<PlanCapability>;

  /** Delete a capability by key. */
  deleteCapability(key: string): Promise<void>;

  /** Upsert a capability assignment (insert or update value). */
  upsertCapabilityAssignment(planId: string, capabilityKey: string, value: string | number | boolean): Promise<PlanCapabilityAssignment>;

  /** List subscriptions with optional filters. */
  getSubscriptions(filters?: SubscriptionFilters): Promise<Subscription[]>;

  /** Get a specific user's active subscription. */
  getSubscription(userId: string): Promise<Subscription | null>;

  /** Create a new subscription. */
  createSubscription(data: CreateSubscriptionData): Promise<Subscription>;

  /** Cancel a subscription. */
  cancelSubscription(id: string, reason?: string): Promise<Subscription>;

  /** Update a plan's fields (snake_case keys). */
  updatePlan(id: string, updates: Record<string, unknown>): Promise<Plan>;

  /** Create a new plan (snake_case keys). */
  createPlan(data: Record<string, unknown>): Promise<Plan>;

  /** Delete a plan by ID. Throws if has active subscriptions. */
  deletePlan(id: string): Promise<void>;

  /** PRD-074: Get the trial subscription for a company user. */
  getTrialSubscription(companyUserId: string): Promise<Subscription | null>;

  /** PRD-074: Create a trial subscription for a company. */
  createTrialSubscription(
    companyUserId: string,
    userName: string,
    planId: string,
  ): Promise<Subscription>;
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
