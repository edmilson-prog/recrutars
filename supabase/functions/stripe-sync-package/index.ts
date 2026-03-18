/**
 * Edge Function: stripe-sync-package
 * Syncs a test package to Stripe (creates/updates Product + Price).
 *
 * Input: { packageId: string, environment: 'test' | 'live' }
 * Output: { success: boolean, productId?: string, priceIds?: Record<string, string>, error?: string }
 *
 * Credentials are fetched from system_settings (panel=admin, category=integrations).
 * Deploy with: supabase functions deploy stripe-sync-package --no-verify-jwt
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
  const secretKey = values[keyName] as string | undefined;
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
    const { packageId, environment } = await req.json();

    if (!packageId || !environment) {
      return jsonResponse({ success: false, error: 'Missing packageId or environment' }, 400);
    }

    if (environment !== 'test' && environment !== 'live') {
      return jsonResponse({ success: false, error: 'Environment must be "test" or "live"' }, 400);
    }

    const admin = getAdminClient();

    // 1. Get Stripe API key
    const stripeKey = await getStripeKey(admin, environment);
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });

    // 2. Fetch the package
    const { data: pkg, error: pkgError } = await admin
      .from('test_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg) {
      return jsonResponse({ success: false, error: 'Package not found' }, 404);
    }

    // 3. Determine existing Stripe IDs based on environment
    const productIdCol = environment === 'test' ? 'stripe_product_id_test' : 'stripe_product_id_live';
    const priceIdCol = environment === 'test' ? 'stripe_price_id_test' : 'stripe_price_id_live';
    const syncedAtCol = environment === 'test' ? 'stripe_synced_at_test' : 'stripe_synced_at_live';

    const existingProductId = pkg[productIdCol] as string | null;
    const existingPriceId = pkg[priceIdCol] as string | null;

    const metadata = {
      recrutars_type: 'test_package',
      package_id: pkg.id,
      slug: pkg.slug,
      credits: String(pkg.credits),
    };

    // 4. Create or update Stripe Product
    let productId: string;

    if (existingProductId) {
      await stripe.products.update(existingProductId, {
        name: pkg.name,
        description: pkg.description || undefined,
        metadata,
      });
      productId = existingProductId;
    } else {
      const product = await stripe.products.create({
        name: pkg.name,
        description: pkg.description || undefined,
        metadata,
      });
      productId = product.id;
    }

    // 5. Create or update Stripe Price (one_time)
    const priceInCents = Math.round(Number(pkg.price) * 100);
    let priceId: string;

    if (existingPriceId) {
      // Stripe prices are immutable — check if amount changed
      const existingPrice = await stripe.prices.retrieve(existingPriceId);
      if (existingPrice.unit_amount === priceInCents) {
        priceId = existingPriceId;
      } else {
        // Archive old price, create new one
        await stripe.prices.update(existingPriceId, { active: false });
        const newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: priceInCents,
          currency: 'brl',
          metadata,
        });
        priceId = newPrice.id;
      }
    } else {
      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: priceInCents,
        currency: 'brl',
        metadata,
      });
      priceId = newPrice.id;
    }

    // 6. Update DB with Stripe IDs
    const { error: updateError } = await admin
      .from('test_packages')
      .update({
        [productIdCol]: productId,
        [priceIdCol]: priceId,
        [syncedAtCol]: new Date().toISOString(),
      })
      .eq('id', packageId);

    if (updateError) {
      return jsonResponse({ success: false, error: `DB update failed: ${updateError.message}` }, 500);
    }

    return jsonResponse({
      success: true,
      productId,
      priceIds: { default: priceId },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonResponse({ success: false, error: message }, 500);
  }
});
