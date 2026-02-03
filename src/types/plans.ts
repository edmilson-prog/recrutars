/**
 * Types for Plans & Subscriptions
 * PRD-060: Gestão de Planos "Commerce"
 */

export type PlanPeriod = 'monthly' | 'quarterly' | 'semiannual' | 'annual';
export type PlanStatus = 'active' | 'inactive' | 'archived';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'suspended' | 'pending';

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
