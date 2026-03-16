/**
 * Edge Function: send-whatsapp
 * Proxies WhatsApp messages via the Evolution API.
 *
 * Actions: send_text, send_bulk, check_numbers, get_connection_status
 *
 * Credentials are fetched from system_settings (panel=admin, category=integrations).
 * Caller must be an authenticated admin user (verified via profiles table).
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

interface SendTextBody {
  action: 'send_text';
  phone: string;
  text: string;
  recipientId?: string;
  recipientType?: 'candidate' | 'company';
  templateId?: string;
  sentBy?: string;
}

interface BulkRecipient {
  phone: string;
  name: string;
  id: string;
  type: 'candidate' | 'company';
}

interface SendBulkBody {
  action: 'send_bulk';
  recipients: BulkRecipient[];
  text: string;
  templateId?: string;
  campaignId: string;
  sentBy?: string;
}

interface CheckNumbersBody {
  action: 'check_numbers';
  numbers: string[];
}

interface GetConnectionStatusBody {
  action: 'get_connection_status';
}

type RequestBody = SendTextBody | SendBulkBody | CheckNumbersBody | GetConnectionStatusBody;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400): Response {
  console.error(`[send-whatsapp] Error: ${message}`);
  return jsonResponse({ success: false, error: message }, status);
}

/** Random delay between min and max ms (inclusive). */
function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Supabase admin client (service role — bypasses RLS)
// ---------------------------------------------------------------------------

function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  }
  return createClient(url, key);
}

// ---------------------------------------------------------------------------
// Auth: verify caller is an admin
// ---------------------------------------------------------------------------

async function verifyAdmin(
  supabase: ReturnType<typeof createClient>,
  authHeader: string | null,
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  if (!authHeader) {
    return { valid: false, error: 'Missing authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { valid: false, error: 'Invalid or expired token' };
  }

  // Check profile type
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, type')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { valid: false, error: 'User profile not found' };
  }

  if (profile.type !== 'admin') {
    return { valid: false, error: 'Admin access required' };
  }

  return { valid: true, userId: profile.id };
}

// ---------------------------------------------------------------------------
// Fetch Evolution API credentials from system_settings
// ---------------------------------------------------------------------------

async function getEvolutionConfig(
  supabase: ReturnType<typeof createClient>,
): Promise<EvolutionConfig> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('values')
    .eq('panel', 'admin')
    .eq('category', 'integrations')
    .is('entity_id', null)
    .single();

  if (error || !data) {
    throw new Error('Integration settings not found in system_settings');
  }

  const values = data.values as Record<string, Record<string, unknown>>;
  const evolution = values?.evolution;

  if (!evolution) {
    throw new Error('Evolution API settings not configured');
  }

  const enabled = evolution.evolutionEnabled as boolean;
  const apiUrl = evolution.evolutionApiUrl as string;
  const apiKey = evolution.evolutionApiKey as string;
  const instanceName = evolution.evolutionInstanceName as string;

  if (!enabled) {
    throw new Error('WhatsApp integration is disabled. Enable it in Settings > Integrations.');
  }

  if (!apiUrl || !apiKey || !instanceName) {
    throw new Error(
      'Evolution API is not fully configured. Please fill in API URL, API Key, and Instance Name in Settings > Integrations.',
    );
  }

  return {
    apiUrl: apiUrl.replace(/\/+$/, ''), // strip trailing slashes
    apiKey,
    instanceName,
  };
}

// ---------------------------------------------------------------------------
// Evolution API callers
// ---------------------------------------------------------------------------

async function evolutionPost(
  config: EvolutionConfig,
  path: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const url = `${config.apiUrl}${path}`;
  console.log(`[send-whatsapp] POST ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.apiKey,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Evolution API returned non-JSON response: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(
      `Evolution API error (${res.status}): ${json?.message || json?.error || text.slice(0, 200)}`,
    );
  }

  return json;
}

async function evolutionGet(
  config: EvolutionConfig,
  path: string,
): Promise<Record<string, unknown>> {
  const url = `${config.apiUrl}${path}`;
  console.log(`[send-whatsapp] GET ${url}`);

  const res = await fetch(url, {
    method: 'GET',
    headers: { apikey: config.apiKey },
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Evolution API returned non-JSON response: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(
      `Evolution API error (${res.status}): ${json?.message || json?.error || text.slice(0, 200)}`,
    );
  }

  return json;
}

// ---------------------------------------------------------------------------
// Record message in whatsapp_messages table
// ---------------------------------------------------------------------------

async function recordMessage(
  supabase: ReturnType<typeof createClient>,
  params: {
    phone: string;
    text: string;
    recipientId?: string;
    recipientName?: string;
    recipientType?: string;
    templateId?: string;
    campaignId?: string;
    sentBy?: string;
    status: 'sent' | 'failed';
    whatsappMessageId?: string;
    errorMessage?: string;
  },
): Promise<string | null> {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .insert({
      recipient_phone: params.phone,
      recipient_name: params.recipientName || null,
      recipient_type: params.recipientType || null,
      recipient_id: params.recipientId || null,
      message_text: params.text,
      template_id: params.templateId || null,
      campaign_id: params.campaignId || null,
      sent_by: params.sentBy || null,
      status: params.status,
      whatsapp_message_id: params.whatsappMessageId || null,
      error_message: params.errorMessage || null,
      sent_at: params.status === 'sent' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error(`[send-whatsapp] Failed to record message: ${error.message}`);
    return null;
  }

  return data?.id || null;
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

async function handleSendText(
  supabase: ReturnType<typeof createClient>,
  config: EvolutionConfig,
  body: SendTextBody,
): Promise<Response> {
  const { phone, text, recipientId, recipientType, templateId, sentBy } = body;

  if (!phone || !text) {
    return errorResponse('Missing required fields: phone, text');
  }

  console.log(`[send-whatsapp] === send_text START === phone=${phone}, textLen=${text.length}`);

  // Step 1: Call Evolution API
  let evolutionResult: Record<string, unknown> | null = null;
  let evolutionError: string | null = null;

  try {
    console.log('[send-whatsapp] Step 1: Calling Evolution API...');
    evolutionResult = await evolutionPost(config, `/message/sendText/${config.instanceName}`, {
      number: phone,
      text,
      delay: 1000,
      linkPreview: true,
    });
    console.log(`[send-whatsapp] Step 1 OK: ${JSON.stringify(evolutionResult).slice(0, 300)}`);
  } catch (err) {
    evolutionError = err instanceof Error ? err.message : String(err);
    console.error(`[send-whatsapp] Step 1 FAILED: ${evolutionError}`);
  }

  // Step 2: Extract message ID (safe)
  let whatsappMessageId: string | null = null;
  if (evolutionResult) {
    try {
      const keyObj = evolutionResult?.key;
      if (keyObj && typeof keyObj === 'object') {
        whatsappMessageId = (keyObj as Record<string, unknown>).id as string || null;
      }
      if (!whatsappMessageId && typeof evolutionResult?.messageId === 'string') {
        whatsappMessageId = evolutionResult.messageId as string;
      }
      console.log(`[send-whatsapp] Step 2: messageId=${whatsappMessageId}`);
    } catch (parseErr) {
      console.error(`[send-whatsapp] Step 2 parse error: ${parseErr}`);
    }
  }

  // Step 3: Record in database
  console.log('[send-whatsapp] Step 3: Recording in DB...');
  const recordId = await recordMessage(supabase, {
    phone,
    text,
    recipientId: recipientId || undefined,
    recipientType: recipientType || undefined,
    templateId: templateId || undefined,
    sentBy: sentBy || undefined,
    status: evolutionError ? 'failed' : 'sent',
    whatsappMessageId: whatsappMessageId || undefined,
    errorMessage: evolutionError || undefined,
  });
  console.log(`[send-whatsapp] Step 3 done: recordId=${recordId}`);

  // Step 4: Return response
  if (evolutionError) {
    console.log(`[send-whatsapp] === send_text END (FAILED) ===`);
    return errorResponse(`Falha ao enviar mensagem: ${evolutionError}`, 200);
  }

  console.log(`[send-whatsapp] === send_text END (OK) ===`);
  return jsonResponse({
    success: true,
    messageId: recordId,
    whatsappMessageId,
  });
}

async function handleSendBulk(
  supabase: ReturnType<typeof createClient>,
  config: EvolutionConfig,
  body: SendBulkBody,
): Promise<Response> {
  const { recipients, text, templateId, campaignId, sentBy } = body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return errorResponse('Missing or empty recipients array');
  }

  if (!text) {
    return errorResponse('Missing required field: text');
  }

  if (!campaignId) {
    return errorResponse('Missing required field: campaignId');
  }

  let sent = 0;
  let failed = 0;

  console.log(`[send-whatsapp] Starting bulk send — campaign ${campaignId}, ${recipients.length} recipients`);

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const personalizedText = text.replace(/\{\{nome\}\}/g, recipient.name || '');

    try {
      const result = await evolutionPost(config, `/message/sendText/${config.instanceName}`, {
        number: recipient.phone,
        text: personalizedText,
        delay: 1000,
        linkPreview: true,
      });

      const whatsappMessageId = (result?.key as Record<string, unknown>)?.id as string ||
        result?.messageId as string ||
        null;

      await recordMessage(supabase, {
        phone: recipient.phone,
        text: personalizedText,
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientType: recipient.type,
        templateId,
        campaignId,
        sentBy,
        status: 'sent',
        whatsappMessageId: whatsappMessageId || undefined,
      });

      sent++;
      console.log(`[send-whatsapp] Bulk [${i + 1}/${recipients.length}] sent to ${recipient.phone}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);

      await recordMessage(supabase, {
        phone: recipient.phone,
        text: personalizedText,
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientType: recipient.type,
        templateId,
        campaignId,
        sentBy,
        status: 'failed',
        errorMessage: errMsg,
      });

      failed++;
      console.error(`[send-whatsapp] Bulk [${i + 1}/${recipients.length}] failed for ${recipient.phone}: ${errMsg}`);
    }

    // Random delay between sends (except after the last one)
    if (i < recipients.length - 1) {
      await randomDelay(1000, 3000);
    }
  }

  console.log(`[send-whatsapp] Bulk complete — campaign ${campaignId}: ${sent} sent, ${failed} failed`);

  return jsonResponse({
    success: true,
    total: recipients.length,
    sent,
    failed,
    campaignId,
  });
}

async function handleCheckNumbers(
  config: EvolutionConfig,
  body: CheckNumbersBody,
): Promise<Response> {
  const { numbers } = body;

  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return errorResponse('Missing or empty numbers array');
  }

  try {
    const result = await evolutionPost(config, `/chat/whatsappNumbers/${config.instanceName}`, {
      numbers,
    });

    return jsonResponse({
      success: true,
      results: result,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return errorResponse(`Failed to check numbers: ${errMsg}`, 200);
  }
}

async function handleGetConnectionStatus(config: EvolutionConfig): Promise<Response> {
  try {
    const result = await evolutionGet(config, `/instance/connectionState/${config.instanceName}`);

    const state = (result?.instance as Record<string, unknown>)?.state as string ||
      result?.state as string ||
      'unknown';

    return jsonResponse({
      success: true,
      connected: state === 'open',
      state,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return errorResponse(`Failed to get connection status: ${errMsg}`, 200);
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed. Use POST.', 405);
  }

  try {
    const supabase = getAdminClient();

    // Verify the caller is an admin
    const authHeader = req.headers.get('authorization');
    const auth = await verifyAdmin(supabase, authHeader);
    if (!auth.valid) {
      return errorResponse(auth.error || 'Unauthorized', 401);
    }

    // Parse request body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid JSON body');
    }

    if (!body.action) {
      return errorResponse('Missing required field: action');
    }

    console.log(`[send-whatsapp] Action: ${body.action}`);

    // Fetch Evolution API credentials
    let config: EvolutionConfig;
    try {
      config = await getEvolutionConfig(supabase);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return errorResponse(errMsg);
    }

    // Route to action handler
    let result: Response;
    try {
      switch (body.action) {
        case 'send_text':
          result = await handleSendText(supabase, config, body as SendTextBody);
          break;

        case 'send_bulk':
          result = await handleSendBulk(supabase, config, body as SendBulkBody);
          break;

        case 'check_numbers':
          result = await handleCheckNumbers(config, body as CheckNumbersBody);
          break;

        case 'get_connection_status':
          result = await handleGetConnectionStatus(config);
          break;

        default:
          result = errorResponse(
            `Unknown action: ${(body as Record<string, unknown>).action}. Valid actions: send_text, send_bulk, check_numbers, get_connection_status`,
          );
      }
    } catch (handlerErr) {
      const msg = handlerErr instanceof Error ? handlerErr.message : String(handlerErr);
      const stack = handlerErr instanceof Error ? handlerErr.stack : '';
      console.error(`[send-whatsapp] Handler crash for ${body.action}: ${msg}\n${stack}`);
      result = errorResponse(`Handler error: ${msg}`, 500);
    }

    return result;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    console.error(`[send-whatsapp] Unhandled error: ${errMsg}\n${stack}`);
    return errorResponse(`Internal server error: ${errMsg}`, 500);
  }
});
