/**
 * Edge Function: stripe-sync-plan
 * Syncs a plan to Stripe (creates/updates Product + Prices).
 * Supports both recurring and one_time billing models.
 *
 * Input: { planId: string, environment: 'test' | 'live' }
 * Output: { success: boolean, productId?: string, priceIds?: Record<string, string>, error?: string }
 *
 * Credentials are fetched from system_settings (panel=admin, category=integrations).
 * Deploy with: supabase functions deploy stripe-sync-plan --no-verify-jwt
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

/** Maps plan periods to Stripe recurring intervals */
const PERIOD_TO_STRIPE: Record<string, { interval: string; interval_count: number }> = {
  monthly: { interval: 'month', interval_count: 1 },
  quarterly: { interval: 'month', interval_count: 3 },
  semiannual: { interval: 'month', interval_count: 6 },
  annual: { interval: 'year', interval_count: 1 },
};

/**
 * Creates or updates a Stripe Price.
 * Stripe prices are immutable — if amount changed, archives old price and creates new one.
 */
async function syncStripePrice(
  stripe: Stripe,
  productId: string,
  existingPriceId: string | null,
  amountInCents: number,
  metadata: Record<string, string>,
  recurring?: { interval: string; interval_count: number },
): Promise<string> {
  if (existingPriceId) {
    const existingPrice = await stripe.prices.retrieve(existingPriceId);
    if (existingPrice.unit_amount === amountInCents) {
      return existingPriceId;
    }
    // Archive old price, create new one
    await stripe.prices.update(existingPriceId, { active: false });
  }

  const priceParams: Stripe.PriceCreateParams = {
    product: productId,
    unit_amount: amountInCents,
    currency: 'brl',
    metadata,
  };

  if (recurring) {
    priceParams.recurring = {
      interval: recurring.interval as Stripe.PriceCreateParams.Recurring.Interval,
      interval_count: recurring.interval_count,
    };
  }

  const newPrice = await stripe.prices.create(priceParams);
  return newPrice.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const { planId, environment } = await req.json();

    if (!planId || !environment) {
      return jsonResponse({ success: false, error: 'Missing planId or environment' }, 400);
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

    // 3. Determine existing Stripe IDs based on environment
    const productIdCol = environment === 'test' ? 'stripe_product_id_test' : 'stripe_product_id_live';
    const priceIdsCol = environment === 'test' ? 'stripe_price_ids_test' : 'stripe_price_ids_live';
    const syncedAtCol = environment === 'test' ? 'stripe_synced_at_test' : 'stripe_synced_at_live';

    const existingProductId = plan[productIdCol] as string | null;
    const existingPriceIds = (plan[priceIdsCol] as Record<string, string>) ?? {};
    const billingModel = (plan.billing_model as string) ?? 'recurring';
    const prices = plan.prices as Record<string, number>;

    const metadata = {
      recrutars_type: 'plan',
      plan_id: plan.id,
      slug: plan.slug,
      billing_model: billingModel,
      plan_type: plan.type,
    };

    // 4. Create or update Stripe Product
    let productId: string;

    if (existingProductId) {
      await stripe.products.update(existingProductId, {
        name: plan.name,
        description: plan.description || undefined,
        metadata,
      });
      productId = existingProductId;
    } else {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description || undefined,
        metadata,
      });
      productId = product.id;
    }

    // 5. Create or update Stripe Prices
    const newPriceIds: Record<string, string> = {};

    if (billingModel === 'one_time') {
      // One-time: single price without recurring
      const amount = Math.round(Number(prices.one_time ?? 0) * 100);
      if (amount > 0) {
        const priceId = await syncStripePrice(
          stripe,
          productId,
          existingPriceIds.one_time ?? null,
          amount,
          { ...metadata, period: 'one_time' },
        );
        newPriceIds.one_time = priceId;
      }
    } else {
      // Recurring: create price for each period with value > 0
      for (const [period, recurringConfig] of Object.entries(PERIOD_TO_STRIPE)) {
        const amount = Math.round(Number(prices[period] ?? 0) * 100);
        if (amount <= 0) continue;

        const priceId = await syncStripePrice(
          stripe,
          productId,
          existingPriceIds[period] ?? null,
          amount,
          { ...metadata, period },
          recurringConfig,
        );
        newPriceIds[period] = priceId;
      }
    }

    // 6. Update DB with Stripe IDs
    const { error: updateError } = await admin
      .from('plans')
      .update({
        [productIdCol]: productId,
        [priceIdsCol]: newPriceIds,
        [syncedAtCol]: new Date().toISOString(),
      })
      .eq('id', planId);

    if (updateError) {
      return jsonResponse({ success: false, error: `DB update failed: ${updateError.message}` }, 500);
    }

    return jsonResponse({
      success: true,
      productId,
      priceIds: newPriceIds,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonResponse({ success: false, error: message }, 500);
  }
});
