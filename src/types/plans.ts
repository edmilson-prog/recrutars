/**
 * Types for Plans & Subscriptions
 * PRD-060: Gestão de Planos "Commerce"
 */

export type PlanPeriod = 'monthly' | 'quarterly' | 'semiannual' | 'annual';
export type PlanStatus = 'active' | 'inactive' | 'archived';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'suspended' | 'pending' | 'trial' | 'past_due';

/** PRD-075: Stripe environment toggle */
export type StripeEnvironment = 'test' | 'live';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  type: 'candidate' | 'company';
  description: string;
  descriptionShort: string;
  badge?: string;
  prices: Record<PlanPeriod, number>;
  launchPrices?: Record<PlanPeriod, number>;
  launchPriceEndDate?: string;
  isActive: boolean;
  isFree: boolean;
  order: number;
  features: string[];
  createdAt: string;
  /** PRD-074: Duration of trial in days (null = not a trial plan) */
  trialDurationDays?: number;
  /** PRD-074: Discount percentage for long-term subscriptions (e.g. 10) */
  discountPercentage?: number;
  /** PRD-074: Minimum period to qualify for discount (e.g. 'semiannual') */
  discountMinPeriod?: PlanPeriod;
  /** PRD-074: Bonus behavioral tests per period (e.g. { semiannual: 3, annual: 3 }) */
  bonusTests?: Partial<Record<PlanPeriod, number>>;
  /** PRD-075: Stripe Product ID for test environment */
  stripeProductIdTest?: string;
  /** PRD-075: Stripe Product ID for live environment */
  stripeProductIdLive?: string;
  /** PRD-075: Stripe Price IDs per period for test environment */
  stripePriceIdsTest?: Partial<Record<PlanPeriod, string>>;
  /** PRD-075: Stripe Price IDs per period for live environment */
  stripePriceIdsLive?: Partial<Record<PlanPeriod, string>>;
  /** PRD-075: Last Stripe sync timestamp for test */
  stripeSyncedAtTest?: string;
  /** PRD-075: Last Stripe sync timestamp for live */
  stripeSyncedAtLive?: string;
}

export interface PlanCapability {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  valueType: 'boolean' | 'number' | 'enum';
  possibleValues?: string[];
}

export interface PlanCapabilityAssignment {
  planId: string;
  capabilityKey: string;
  value: string | number | boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  userType: 'candidate' | 'company';
  userName: string;
  planId: string;
  planSlug: string;
  planName: string;
  period: PlanPeriod;
  pricePaid: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: SubscriptionStatus;
  isEarlyAdopter: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  /** PRD-074: Whether this is a trial subscription */
  isTrial?: boolean;
  /** PRD-074: Trial start date (ISO string) */
  trialStartDate?: string;
  /** PRD-074: Trial end date — after this, access is blocked */
  trialEndDate?: string;
  /** PRD-074: Remaining bonus behavioral test credits */
  bonusTestsRemaining?: number;
  /** PRD-074: Total bonus behavioral tests credited */
  bonusTestsTotal?: number;
  /** PRD-075: Stripe customer ID */
  stripeCustomerId?: string;
  /** PRD-075: Stripe subscription ID */
  stripeSubscriptionId?: string;
  /** PRD-075: Stripe price ID currently active */
  stripePriceId?: string;
  /** PRD-075: Payment method description (e.g. 'card ending 4242') */
  paymentMethod?: string;
  /** PRD-076: Scheduled plan change (downgrade) */
  scheduledPlanChange?: {
    toPlanId: string;
    toPlanName: string;
    effectiveDate: string;
  };
}

export type SubscriptionActionType = 'created' | 'upgraded' | 'downgraded' | 'cancelled' | 'reactivated' | 'renewed' | 'expired';

export interface SubscriptionHistory {
  id: string;
  subscriptionId: string;
  action: SubscriptionActionType;
  fromPlanId?: string;
  fromPlanName?: string;
  toPlanId?: string;
  toPlanName?: string;
  performedBy: string;
  notes?: string;
  createdAt: string;
}

export interface OneTimePurchase {
  id: string;
  userId: string;
  userName: string;
  capabilityKey: string;
  capabilityName: string;
  price: number;
  purchasedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'refunded';
}
