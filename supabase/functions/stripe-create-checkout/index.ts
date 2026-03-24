/**
 * Edge Function: stripe-create-checkout
 * Creates a Stripe Checkout Session for plan subscriptions (recurring or one-time).
 *
 * Input: { planId, period, userId, userType, environment, successUrl, cancelUrl }
 * Output: { success, sessionId, url } or { success: false, error }
 *
 * Deploy with: supabase functions deploy stripe-create-checkout --no-verify-jwt
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
    const { planId, period, userId, userType, environment, successUrl, cancelUrl } = await req.json();

    if (!planId || !period || !userId || !userType || !environment || !successUrl || !cancelUrl) {
      return jsonResponse({ success: false, error: 'Missing required parameters' }, 400);
    }

    if (environment !== 'test' && environment !== 'live') {
      return jsonResponse({ success: false, error: 'Environment must be "test" or "live"' }, 400);
    }

    const admin = getAdminClient();

    // 1. Get Stripe API key
    const stripeKey = await getStripeKey(admin, environment);
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });

    // 2. Fetch the plan
    const { data: plan, error: planError } = await admin
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return jsonResponse({ success: false, error: 'Plan not found' }, 404);
    }

    // 3. Get Stripe Price ID for the requested period
    const priceIdsCol = environment === 'test' ? 'stripe_price_ids_test' : 'stripe_price_ids_live';
    const priceIds = (plan[priceIdsCol] as Record<string, string>) ?? {};
    const billingModel = (plan.billing_model as string) ?? 'recurring';

    // For one-time plans, always use 'one_time' period
    const effectivePeriod = billingModel === 'one_time' ? 'one_time' : period;
    const priceId = priceIds[effectivePeriod];

    if (!priceId) {
      return jsonResponse({
        success: false,
        error: `Plan not synced with Stripe for period "${effectivePeriod}". Please sync first in the admin panel.`,
      }, 400);
    }

    // 4. Create Stripe Checkout Session
    const mode = billingModel === 'one_time' ? 'payment' : 'subscription';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        recrutars_type: 'plan',
        plan_id: planId,
        user_id: userId,
        user_type: userType,
        period: effectivePeriod,
        slug: plan.slug,
        billing_model: billingModel,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return jsonResponse({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonResponse({ success: false, error: message }, 500);
  }
});
