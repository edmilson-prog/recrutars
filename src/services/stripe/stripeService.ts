/**
 * Stripe Service — Interface
 * PRD-075: Integração Stripe
 *
 * All Stripe operations go through Supabase Edge Functions.
 * The frontend never touches secret keys — only publishable keys.
 */

import type { StripeEnvironment, PlanPeriod } from '@/types/plans';

export interface SyncResult {
  success: boolean;
  productId?: string;
  priceIds?: Record<string, string>;
  error?: string;
}

export interface SyncAllResult {
  planId: string;
  planName: string;
  success: boolean;
  productId?: string;
  error?: string;
}

export interface CheckoutParams {
  userId: string;
  userType: 'candidate' | 'company';
  planId: string;
  period: PlanPeriod;
  environment: StripeEnvironment;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

export interface UpgradePreviewParams {
  subscriptionId: string;
  newPriceId: string;
  environment: StripeEnvironment;
}

export interface UpgradePreview {
  credit: number;
  newCost: number;
  amountDue: number;
  nextBillingDate: string | null;
  currency: string;
}

export interface ExecuteUpgradeParams {
  subscriptionId: string;
  newPriceId: string;
  environment: StripeEnvironment;
}

export interface ExecuteUpgradeResult {
  success: boolean;
  stripeSubscriptionId?: string;
  newStatus?: string;
  invoiceId?: string;
  amountDue?: number;
  error?: string;
}

export interface ScheduleDowngradeParams {
  subscriptionId: string;
  toPlanId: string;
  toPlanName?: string;
  environment: StripeEnvironment;
}

export interface ScheduleDowngradeResult {
  success: boolean;
  effectiveDate?: string;
  error?: string;
}

export interface CancelSubscriptionParams {
  subscriptionId: string;
  reason?: string;
  environment: StripeEnvironment;
}

export interface PackageCheckoutParams {
  packageId: string;
  companyId: string;
  userId: string;
  environment: StripeEnvironment;
  successUrl: string;
  cancelUrl: string;
}

export interface IStripeService {
  testConnection(environment: StripeEnvironment): Promise<{ success: boolean; error?: string }>;
  syncPlan(planId: string, environment: StripeEnvironment): Promise<SyncResult>;
  syncAllPlans(environment: StripeEnvironment): Promise<SyncAllResult[]>;
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  previewUpgrade(params: UpgradePreviewParams): Promise<UpgradePreview>;
  executeUpgrade(params: ExecuteUpgradeParams): Promise<ExecuteUpgradeResult>;
  scheduleDowngrade(params: ScheduleDowngradeParams): Promise<ScheduleDowngradeResult>;
  cancelDowngrade(subscriptionId: string, environment: StripeEnvironment): Promise<{ success: boolean; error?: string }>;
  cancelSubscription(params: CancelSubscriptionParams): Promise<{ success: boolean; error?: string }>;
  reactivateSubscription(subscriptionId: string, environment: StripeEnvironment): Promise<{ success: boolean; error?: string }>;
  // Test Packages
  syncPackage(packageId: string, environment: StripeEnvironment): Promise<SyncResult>;
  createPackageCheckout(params: PackageCheckoutParams): Promise<CheckoutResult>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IStripeService | null = null;

export async function getStripeService(): Promise<IStripeService> {
  if (_instance) return _instance;

  const { SupabaseStripeService } = await import('./stripeService.supabase');
  _instance = new SupabaseStripeService();
  return _instance;
}
