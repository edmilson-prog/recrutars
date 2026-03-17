/**
 * Stripe Service — Supabase Implementation
 * PRD-075: Integração Stripe
 *
 * All operations invoke Supabase Edge Functions.
 */

import { supabase } from '@/lib/supabase';
import type {
  IStripeService,
  SyncResult,
  SyncAllResult,
  CheckoutParams,
  CheckoutResult,
  UpgradePreviewParams,
  UpgradePreview,
  ExecuteUpgradeParams,
  ExecuteUpgradeResult,
  ScheduleDowngradeParams,
  ScheduleDowngradeResult,
  CancelSubscriptionParams,
  PackageCheckoutParams,
} from './stripeService';
import type { StripeEnvironment } from '@/types/plans';

export class SupabaseStripeService implements IStripeService {
  async testConnection(environment: StripeEnvironment): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.functions.invoke('stripe-test-connection', {
      body: { environment },
    });

    if (error) return { success: false, error: error.message };
    return data as { success: boolean; error?: string };
  }

  async syncPlan(planId: string, environment: StripeEnvironment): Promise<SyncResult> {
    const { data, error } = await supabase.functions.invoke('stripe-sync-plan', {
      body: { planId, environment },
    });

    if (error) return { success: false, error: error.message };
    return data as SyncResult;
  }

  async syncAllPlans(environment: StripeEnvironment): Promise<SyncAllResult[]> {
    const { data, error } = await supabase.functions.invoke('stripe-sync-all', {
      body: { environment },
    });

    if (error) return [];
    return (data as { results: SyncAllResult[] })?.results ?? [];
  }

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
    const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
      body: params,
    });

    if (error) throw new Error(error.message);
    const result = data as { success: boolean; sessionId?: string; url?: string; error?: string };
    if (!result.success) throw new Error(result.error ?? 'Checkout failed');
    return { sessionId: result.sessionId!, url: result.url! };
  }

  async previewUpgrade(params: UpgradePreviewParams): Promise<UpgradePreview> {
    const { data, error } = await supabase.functions.invoke('stripe-preview-upgrade', {
      body: params,
    });

    if (error) throw new Error(error.message);
    const result = data as { success: boolean; error?: string } & UpgradePreview;
    if (!result.success) throw new Error(result.error ?? 'Preview failed');
    return {
      credit: result.credit,
      newCost: result.newCost,
      amountDue: result.amountDue,
      nextBillingDate: result.nextBillingDate,
      currency: result.currency,
    };
  }

  async executeUpgrade(params: ExecuteUpgradeParams): Promise<ExecuteUpgradeResult> {
    const { data, error } = await supabase.functions.invoke('stripe-execute-upgrade', {
      body: params,
    });

    if (error) return { success: false, error: error.message };
    return data as ExecuteUpgradeResult;
  }

  async scheduleDowngrade(params: ScheduleDowngradeParams): Promise<ScheduleDowngradeResult> {
    const { data, error } = await supabase.functions.invoke('stripe-schedule-downgrade', {
      body: params,
    });

    if (error) return { success: false, error: error.message };
    return data as ScheduleDowngradeResult;
  }

  async cancelDowngrade(subscriptionId: string, environment: StripeEnvironment): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.functions.invoke('stripe-cancel-downgrade', {
      body: { subscriptionId, environment },
    });

    if (error) return { success: false, error: error.message };
    return data as { success: boolean; error?: string };
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.functions.invoke('stripe-cancel-subscription', {
      body: params,
    });

    if (error) return { success: false, error: error.message };
    return data as { success: boolean; error?: string };
  }

  async reactivateSubscription(subscriptionId: string, environment: StripeEnvironment): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.functions.invoke('stripe-reactivate-subscription', {
      body: { subscriptionId, environment },
    });

    if (error) return { success: false, error: error.message };
    return data as { success: boolean; error?: string };
  }

  // ---------------------------------------------------------------------------
  // Test Packages
  // ---------------------------------------------------------------------------

  async syncPackage(packageId: string, environment: StripeEnvironment): Promise<SyncResult> {
    const { data, error } = await supabase.functions.invoke('stripe-sync-package', {
      body: { packageId, environment },
    });

    if (error) return { success: false, error: error.message };
    return data as SyncResult;
  }

  async createPackageCheckout(params: PackageCheckoutParams): Promise<CheckoutResult> {
    const { data, error } = await supabase.functions.invoke('stripe-package-checkout', {
      body: params,
    });

    if (error) throw new Error(error.message);
    const result = data as { success: boolean; sessionId?: string; url?: string; error?: string };
    if (!result.success) throw new Error(result.error ?? 'Package checkout failed');
    return { sessionId: result.sessionId!, url: result.url! };
  }
}
