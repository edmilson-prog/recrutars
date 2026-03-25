/**
 * Edge Function: stripe-webhook
 * Receives and processes Stripe webhook events.
 *
 * Handles:
 *   - checkout.session.completed (test_package → credit fulfillment, plan → subscription activation)
 *   - Other events are saved with status='skipped'
 *
 * Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import Stripe from 'https://esm.sh/stripe@17?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

async function getWebhookSecret(
  admin: ReturnType<typeof getAdminClient>,
  livemode: boolean,
): Promise<string> {
  const keyName = livemode ? 'stripeLiveWebhookSecret' : 'stripeTestWebhookSecret';

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
  const secret = stripeSettings[keyName] as string | undefined;
  if (!secret) throw new Error(`Webhook secret "${keyName}" not configured in system_settings`);

  return secret;
}

async function getStripeKey(
  admin: ReturnType<typeof getAdminClient>,
  livemode: boolean,
): Promise<string> {
  const keyName = livemode ? 'stripeLiveSecretKey' : 'stripeTestSecretKey';

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

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

interface HandlerResult {
  action: string;
  reason?: string;
  details?: Record<string, unknown>;
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  admin: ReturnType<typeof getAdminClient>,
): Promise<HandlerResult> {
  const metadata = session.metadata ?? {};
  const recrutarsType = metadata.recrutars_type;

  if (recrutarsType === 'test_package') {
    return await handleTestPackagePurchase(session, metadata, admin);
  }

  if (recrutarsType === 'plan') {
    return await handlePlanSubscription(session, metadata, admin);
  }

  return { action: 'skipped', reason: `Unknown recrutars_type: ${recrutarsType}` };
}

async function handleTestPackagePurchase(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>,
  admin: ReturnType<typeof getAdminClient>,
): Promise<HandlerResult> {
  const { package_id, company_id, user_id, credits, slug } = metadata;
  const creditCount = parseInt(credits, 10);

  if (!package_id || !company_id || !user_id || isNaN(creditCount)) {
    return { action: 'failed', reason: 'Missing or invalid metadata for test_package' };
  }

  // Idempotency: check if credits were already granted for this session
  const { data: existing } = await admin
    .from('test_credits')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle();

  if (existing) {
    return { action: 'skipped', reason: 'Credits already granted for this session (idempotent)' };
  }

  // Insert test_credits
  const { data: credit, error: creditError } = await admin
    .from('test_credits')
    .insert({
      company_id,
      package_id,
      total_credits: creditCount,
      used_credits: 0,
      stripe_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
      status: 'active',
      origin: 'purchase',
    })
    .select('id')
    .single();

  if (creditError || !credit) {
    throw new Error(`Failed to insert test_credits: ${creditError?.message ?? 'unknown'}`);
  }

  // Insert audit transaction
  const { error: txError } = await admin
    .from('test_credit_transactions')
    .insert({
      company_id,
      credit_id: credit.id,
      type: 'purchase',
      amount: creditCount,
      description: `Compra do pacote ${slug ?? package_id} — ${creditCount} crédito(s)`,
      created_by: user_id,
    });

  if (txError) {
    console.error('Failed to insert test_credit_transaction:', txError);
    // Non-fatal: credits were already granted
  }

  return {
    action: 'credits_granted',
    details: { credit_id: credit.id, credits: creditCount, company_id, package_id },
  };
}

async function handlePlanSubscription(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>,
  admin: ReturnType<typeof getAdminClient>,
): Promise<HandlerResult> {
  const { plan_id, user_id, period, billing_model } = metadata;

  if (!plan_id || !user_id) {
    return { action: 'failed', reason: 'Missing metadata for plan subscription' };
  }

  const stripeCustomerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id ?? null;

  const stripeSubscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id ?? null;

  // Fetch the plan to get price
  const { data: plan } = await admin
    .from('plans')
    .select('name')
    .eq('id', plan_id)
    .single();

  // Check existing active subscription for this user
  const { data: existingSub } = await admin
    .from('subscriptions')
    .select('id')
    .eq('user_id', user_id)
    .eq('status', 'active')
    .maybeSingle();

  const subscriptionData = {
    user_id,
    plan_id,
    status: 'active',
    period: period ?? 'monthly',
    price_paid: (session.amount_total ?? 0) / 100,
    start_date: new Date().toISOString(),
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_price_id: session.metadata?.stripe_price_id ?? null,
    payment_method: 'stripe',
  };

  if (existingSub) {
    // Update existing subscription
    const { error } = await admin
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSub.id);

    if (error) throw new Error(`Failed to update subscription: ${error.message}`);

    return {
      action: 'subscription_updated',
      details: { subscription_id: existingSub.id, plan_id, plan_name: plan?.name },
    };
  } else {
    // Create new subscription
    const { data: newSub, error } = await admin
      .from('subscriptions')
      .insert(subscriptionData)
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create subscription: ${error.message}`);

    return {
      action: 'subscription_activated',
      details: { subscription_id: newSub?.id, plan_id, plan_name: plan?.name },
    };
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  const admin = getAdminClient();

  // 1. Read raw body (MUST be raw string for signature verification)
  const rawBody = await req.text();

  // 2. Extract Stripe signature header
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return jsonResponse({ success: false, error: 'Missing stripe-signature header' }, 400);
  }

  // 3. Determine environment by trying test secret first, then live
  //    We need to try both because we don't know livemode before verifying
  let event: Stripe.Event;
  let environment: 'test' | 'live';

  try {
    // Try test environment first (most common in development)
    const testSecret = await getWebhookSecret(admin, false).catch(() => null);
    const liveSecret = await getWebhookSecret(admin, true).catch(() => null);

    if (!testSecret && !liveSecret) {
      return jsonResponse({
        success: false,
        error: 'No webhook signing secret configured. Set stripeTestWebhookSecret or stripeLiveWebhookSecret in Configurações → Integrações → Stripe.',
      }, 500);
    }

    // Try test secret first
    let verified = false;
    if (testSecret) {
      try {
        // Use raw crypto verification since we may not have Stripe instance yet
        const stripe = new Stripe('dummy', { apiVersion: '2024-04-10' });
        event = await stripe.webhooks.constructEventAsync(rawBody, signature, testSecret);
        environment = 'test';
        verified = true;
      } catch {
        // Test secret didn't work, try live
      }
    }

    if (!verified && liveSecret) {
      try {
        const stripe = new Stripe('dummy', { apiVersion: '2024-04-10' });
        event = await stripe.webhooks.constructEventAsync(rawBody, signature, liveSecret);
        environment = 'live';
        verified = true;
      } catch {
        // Live secret didn't work either
      }
    }

    if (!verified!) {
      console.error('Webhook signature verification failed for both test and live secrets');
      return jsonResponse({ success: false, error: 'Invalid webhook signature' }, 400);
    }
  } catch (err) {
    console.error('Webhook verification error:', err);
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    return jsonResponse({ success: false, error: message }, 400);
  }

  // 4. Idempotency: check if event was already processed
  const { data: existingEvent } = await admin
    .from('stripe_webhook_events')
    .select('id, status')
    .eq('event_id', event!.id)
    .maybeSingle();

  if (existingEvent) {
    console.log(`Event ${event!.id} already exists with status=${existingEvent.status}, skipping`);
    return jsonResponse({ success: true, status: existingEvent.status, message: 'Already processed' });
  }

  // 5. Persist event with status='pending'
  const { data: webhookRecord, error: insertError } = await admin
    .from('stripe_webhook_events')
    .insert({
      event_id: event!.id,
      event_type: event!.type,
      environment: environment!,
      payload: event!.data.object as Record<string, unknown>,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) {
    // If insert fails due to UNIQUE constraint, it's a duplicate
    if (insertError.code === '23505') {
      return jsonResponse({ success: true, message: 'Duplicate event, already recorded' });
    }
    console.error('Failed to insert webhook event:', insertError);
    return jsonResponse({ success: false, error: 'Failed to persist event' }, 500);
  }

  // 6. Route event to handler
  let result: HandlerResult;
  let status: 'processed' | 'failed' | 'skipped' = 'skipped';
  let errorMessage: string | null = null;

  try {
    switch (event!.type) {
      case 'checkout.session.completed': {
        const session = event!.data.object as Stripe.Checkout.Session;
        result = await handleCheckoutCompleted(session, admin);
        status = result.action === 'failed' ? 'failed' : result.action === 'skipped' ? 'skipped' : 'processed';
        if (result.action === 'failed') errorMessage = result.reason ?? 'Handler returned failed';
        break;
      }
      default: {
        result = { action: 'skipped', reason: `Unhandled event type: ${event!.type}` };
        status = 'skipped';
        break;
      }
    }
  } catch (err) {
    console.error(`Error processing event ${event!.id}:`, err);
    const message = err instanceof Error ? err.message : 'Unknown processing error';
    result = { action: 'failed', reason: message };
    status = 'failed';
    errorMessage = message;
  }

  // 7. Update event status
  await admin
    .from('stripe_webhook_events')
    .update({
      status,
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq('id', webhookRecord!.id);

  console.log(`Webhook ${event!.id} (${event!.type}): status=${status}, action=${result!.action}`);

  // 8. Always return 200 to prevent Stripe retries
  return jsonResponse({
    success: true,
    event_id: event!.id,
    type: event!.type,
    status,
    action: result!.action,
  });
});
