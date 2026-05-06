/**
 * Edge Function: stripe-cancel-subscription
 * Cancels a Stripe subscription at period end (or immediately) and updates
 * the local `subscriptions` + `subscription_history` tables.
 *
 * Input:  { subscriptionId, reason?, environment?, immediate? }
 * Output: { success, cancelAt?, error? }
 *
 * Deploy with: supabase functions deploy stripe-cancel-subscription --no-verify-jwt
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import Stripe from 'https://esm.sh/stripe@17?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key);
}

async function getStripeKey(
  admin: ReturnType<typeof getAdminClient>,
  environment: 'test' | 'live',
): Promise<string> {
  const keyName = environment === 'test' ? 'stripeTestSecretKey' : 'stripeLiveSecretKey';

  const { data, error } = await admin
    .from('system_settings')
    .select('values')
    .eq('panel', 'admin')
    .eq('category', 'integrations')
    .is('entity_id', null)
    .single();

  if (error || !data) throw new Error('Stripe credentials not found in system_settings');

  const values = data.values as Record<string, unknown>;
  const stripeSettings = (values['stripe'] as Record<string, unknown>) ?? {};
  const secretKey = stripeSettings[keyName] as string | undefined;
  if (!secretKey) throw new Error(`Stripe key "${keyName}" not configured`);

  return secretKey;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const {
      subscriptionId,
      reason,
      environment = 'test',
      immediate = false,
    } = body as {
      subscriptionId: string;
      reason?: string;
      environment?: 'test' | 'live';
      immediate?: boolean;
    };

    if (!subscriptionId) {
      return jsonResponse({ success: false, error: 'Missing subscriptionId' }, 400);
    }

    const admin = getAdminClient();

    // 1. Fetch the subscription from our DB
    const { data: subscription, error: subError } = await admin
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      return jsonResponse({ success: false, error: 'Subscription not found' }, 404);
    }

    if (subscription.status === 'cancelled') {
      return jsonResponse({ success: false, error: 'Subscription is already cancelled' }, 400);
    }

    const stripeSubId = subscription.stripe_subscription_id as string | null;
    let cancelAt: string | null = null;

    // 2. Cancel in Stripe if there's a linked subscription
    if (stripeSubId) {
      const stripeKey = await getStripeKey(admin, environment);
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });

      if (immediate) {
        // Cancel immediately
        await stripe.subscriptions.cancel(stripeSubId);
        cancelAt = new Date().toISOString();
      } else {
        // Cancel at period end (grace period)
        await stripe.subscriptions.update(stripeSubId, {
          cancel_at_period_end: true,
        });
        // Use the subscription's end_date as the effective cancel date
        cancelAt = subscription.end_date ?? new Date().toISOString();
      }
    } else {
      // No Stripe subscription (e.g. manual/test) — cancel immediately in DB
      cancelAt = new Date().toISOString();
    }

    // 3. Update subscription in our DB
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      status: 'cancelled',
      cancelled_at: now,
    };
    if (reason) {
      updateData.cancellation_reason = reason;
    }

    const { error: updateError } = await admin
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('Failed to update subscription status:', updateError);
      return jsonResponse({
        success: false,
        error: `Stripe cancelled but DB update failed: ${updateError.message}`,
      }, 500);
    }

    // 4. Insert subscription_history record
    const { error: historyError } = await admin
      .from('subscription_history')
      .insert({
        subscription_id: subscriptionId,
        action: 'cancelled',
        from_plan_id: subscription.plan_id,
        to_plan_id: null,
        notes: reason
          ? `Cancelamento solicitado pelo usuario. Motivo: ${reason}`
          : 'Cancelamento solicitado pelo usuario.',
      });

    if (historyError) {
      // Non-fatal: subscription was already cancelled, just log the error
      console.error('Failed to insert subscription_history:', historyError);
    }

    console.log(
      `Subscription ${subscriptionId} cancelled.`,
      stripeSubId ? `Stripe: ${stripeSubId}` : '(no Stripe sub)',
      `Reason: ${reason ?? 'not provided'}`,
    );

    return jsonResponse({
      success: true,
      cancelAt,
      stripeSubscriptionId: stripeSubId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('stripe-cancel-subscription error:', message);
    return jsonResponse({ success: false, error: message }, 500);
  }
});
