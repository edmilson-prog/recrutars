/**
 * Edge Function: send-email
 * Sends transactional emails via the Resend REST API.
 *
 * Actions: send_invitation_email, send_activation_email, test_connection
 *
 * Credentials are fetched from system_settings (panel=admin, category=integrations).
 * This is a server-to-server function — no user auth check needed.
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

interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface SendInvitationBody {
  action: 'send_invitation_email';
  to: string;
  candidateName: string;
  companyName: string;
  testName: string;
  inviteLink: string;
  expiresIn?: string;
}

interface SendActivationBody {
  action: 'send_activation_email';
  to: string;
  candidateName: string;
  activationLink: string;
}

interface TestConnectionBody {
  action: 'test_connection';
  to?: string;
}

type RequestBody = SendInvitationBody | SendActivationBody | TestConnectionBody;

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
  console.error(`[send-email] Error: ${message}`);
  return jsonResponse({ success: false, error: message }, status);
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
// Fetch Resend config from system_settings
// ---------------------------------------------------------------------------

async function getResendConfig(
  supabase: ReturnType<typeof createClient>,
): Promise<ResendConfig> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('values')
    .eq('panel', 'admin')
    .eq('category', 'integrations')
    .is('entity_id', null)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Configurações de integração não encontradas em system_settings');
  }

  const resend = (data.values as Record<string, unknown>)?.resend as Record<string, unknown> | undefined;

  if (!resend) {
    throw new Error('Serviço de email não está configurado.');
  }

  const resendEnabled = resend?.resendEnabled === true;
  const resendApiKey = resend?.resendApiKey as string | undefined;
  const resendFromEmail = resend?.resendFromEmail as string | undefined;
  const resendFromName = resend?.resendFromName as string | undefined;

  if (!resendEnabled) {
    throw new Error('Serviço de email não está habilitado.');
  }

  if (!resendApiKey) {
    throw new Error('Chave de API do Resend não configurada.');
  }

  if (!resendFromEmail) {
    throw new Error('Email remetente do Resend não configurado.');
  }

  return {
    apiKey: resendApiKey,
    fromEmail: resendFromEmail,
    fromName: resendFromName || 'RecrutaRS',
  };
}

// ---------------------------------------------------------------------------
// Resend API caller
// ---------------------------------------------------------------------------

async function sendEmail(
  config: ResendConfig,
  params: {
    to: string;
    subject: string;
    html: string;
  },
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = 'https://api.resend.com/emails';
  console.log(`[send-email] Sending to ${params.to}, subject="${params.subject}"`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    const text = await response.text();
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Resend API retornou resposta não-JSON: ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      const errorMsg = json?.message || json?.error || json?.name || text.slice(0, 200);
      throw new Error(`Resend API erro (${response.status}): ${errorMsg}`);
    }

    const messageId = json?.id as string || null;
    console.log(`[send-email] Sent successfully, messageId=${messageId}`);

    return { success: true, messageId: messageId ?? undefined };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[send-email] Send failed: ${errMsg}`);
    return { success: false, error: errMsg };
  }
}

// ---------------------------------------------------------------------------
// HTML Email Templates
// ---------------------------------------------------------------------------

function buildInvitationEmailHtml(params: {
  candidateName: string;
  companyName: string;
  testName: string;
  inviteLink: string;
  expiresIn: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para Teste Comportamental</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #06b6d4; letter-spacing: 1px;">RecrutaRS</h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">Recrutamento Inteligente</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 8px; font-size: 22px; color: #0f172a;">Olá, ${escapeHtml(params.candidateName)}!</h2>
              <p style="margin: 0 0 24px; font-size: 16px; color: #475569; line-height: 1.6;">
                Você foi convidado(a)${params.companyName ? ` pela <strong style="color: #0f172a;">${escapeHtml(params.companyName)}</strong>` : ''} para realizar o teste comportamental <strong style="color: #0f172a;">${escapeHtml(params.testName)}</strong>.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; color: #475569; line-height: 1.6;">
                O teste é rápido e simples. Clique no botão abaixo para começar:
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(params.inviteLink)}" target="_blank" style="display: inline-block; background-color: #06b6d4; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 8px; letter-spacing: 0.3px;">
                      Iniciar Teste
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Expiration Warning -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 6px 6px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
                      <strong>Atenção:</strong> Este link expira em <strong>${escapeHtml(params.expiresIn)}</strong>.
                    </p>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin: 32px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <a href="${escapeHtml(params.inviteLink)}" style="color: #06b6d4; word-break: break-all;">${escapeHtml(params.inviteLink)}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                <strong style="color: #64748b;">RecrutaRS</strong> — Recrutamento Inteligente
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #cbd5e1;">
                Este é um email automático. Por favor, não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildActivationEmailHtml(params: {
  candidateName: string;
  activationLink: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ative sua Conta — RecrutaRS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #06b6d4; letter-spacing: 1px;">RecrutaRS</h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">Recrutamento Inteligente</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 8px; font-size: 22px; color: #0f172a;">Olá, ${escapeHtml(params.candidateName)}!</h2>
              <p style="margin: 0 0 24px; font-size: 16px; color: #475569; line-height: 1.6;">
                Seu teste foi concluído com sucesso! Ative sua conta para acessar seus resultados e aproveitar todas as funcionalidades da plataforma.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; color: #475569; line-height: 1.6;">
                Clique no botão abaixo para criar sua senha e ativar seu acesso:
              </p>
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(params.activationLink)}" target="_blank" style="display: inline-block; background-color: #06b6d4; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 8px; letter-spacing: 0.3px;">
                      Ativar Conta
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Validity Note -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 6px 6px 0;">
                    <p style="margin: 0; font-size: 14px; color: #065f46; line-height: 1.5;">
                      <strong>Importante:</strong> Este link é válido por <strong>72 horas</strong>.
                    </p>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin: 32px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <a href="${escapeHtml(params.activationLink)}" style="color: #06b6d4; word-break: break-all;">${escapeHtml(params.activationLink)}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                <strong style="color: #64748b;">RecrutaRS</strong> — Recrutamento Inteligente
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #cbd5e1;">
                Este é um email automático. Por favor, não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildTestEmailHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teste de Conexão — RecrutaRS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #06b6d4; letter-spacing: 1px;">RecrutaRS</h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">Recrutamento Inteligente</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="display: inline-block; background-color: #ecfdf5; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px; margin-bottom: 16px;">
                &#10003;
              </div>
              <h2 style="margin: 0 0 16px; font-size: 22px; color: #0f172a;">Conexão Verificada!</h2>
              <p style="margin: 0 0 8px; font-size: 16px; color: #475569; line-height: 1.6;">
                O serviço de email está configurado corretamente e funcionando.
              </p>
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                Enviado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                <strong style="color: #64748b;">RecrutaRS</strong> — Recrutamento Inteligente
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #cbd5e1;">
                Este é um email de teste. Nenhuma ação é necessária.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Escape HTML special characters to prevent XSS in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

async function handleSendInvitationEmail(
  config: ResendConfig,
  body: SendInvitationBody,
): Promise<Response> {
  const { to, candidateName, companyName, testName, inviteLink, expiresIn } = body;

  if (!to || typeof to !== 'string' || !to.trim()) {
    return errorResponse('Campo obrigatório ausente: to (email do destinatário)');
  }
  if (!candidateName) {
    return errorResponse('Campo obrigatório ausente: candidateName');
  }
  if (!testName) {
    return errorResponse('Campo obrigatório ausente: testName');
  }
  if (!inviteLink) {
    return errorResponse('Campo obrigatório ausente: inviteLink');
  }

  console.log(`[send-email] === send_invitation_email START === to=${to}, test=${testName}`);

  const html = buildInvitationEmailHtml({
    candidateName,
    companyName,
    testName,
    inviteLink,
    expiresIn: expiresIn || '24 horas',
  });

  const result = await sendEmail(config, {
    to,
    subject: companyName ? `Convite para Teste Comportamental — ${companyName}` : 'Convite para Teste Comportamental — RecrutaRS',
    html,
  });

  if (!result.success) {
    console.log('[send-email] === send_invitation_email END (FAILED) ===');
    return jsonResponse({ success: false, error: result.error }, 200);
  }

  console.log('[send-email] === send_invitation_email END (OK) ===');
  return jsonResponse({ success: true, messageId: result.messageId });
}

async function handleSendActivationEmail(
  config: ResendConfig,
  body: SendActivationBody,
): Promise<Response> {
  const { to, candidateName, activationLink } = body;

  if (!to || typeof to !== 'string' || !to.trim()) {
    return errorResponse('Campo obrigatório ausente: to (email do destinatário)');
  }
  if (!candidateName) {
    return errorResponse('Campo obrigatório ausente: candidateName');
  }
  if (!activationLink) {
    return errorResponse('Campo obrigatório ausente: activationLink');
  }

  console.log(`[send-email] === send_activation_email START === to=${to}`);

  const html = buildActivationEmailHtml({
    candidateName,
    activationLink,
  });

  const result = await sendEmail(config, {
    to,
    subject: 'Ative sua Conta — RecrutaRS',
    html,
  });

  if (!result.success) {
    console.log('[send-email] === send_activation_email END (FAILED) ===');
    return jsonResponse({ success: false, error: result.error }, 200);
  }

  console.log('[send-email] === send_activation_email END (OK) ===');
  return jsonResponse({ success: true, messageId: result.messageId });
}

async function handleTestConnection(
  config: ResendConfig,
  body: TestConnectionBody,
): Promise<Response> {
  console.log(`[send-email] === test_connection START === to=${body.to || '(validation only)'}`);

  // If no recipient provided, just validate the API key by listing domains
  if (!body.to) {
    try {
      const response = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        let json: Record<string, unknown>;
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error(`Resend API retornou resposta não-JSON: ${text.slice(0, 200)}`);
        }
        const errorMsg = json?.message || json?.error || text.slice(0, 200);
        throw new Error(`Resend API erro (${response.status}): ${errorMsg}`);
      }

      console.log('[send-email] === test_connection END (OK, validation only) ===');
      return jsonResponse({ success: true, connected: true });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[send-email] Connection test failed: ${errMsg}`);
      return jsonResponse({ success: false, connected: false, error: errMsg }, 200);
    }
  }

  // Send a test email
  const html = buildTestEmailHtml();
  const result = await sendEmail(config, {
    to: body.to,
    subject: 'Teste de Conexão — RecrutaRS',
    html,
  });

  if (!result.success) {
    console.log('[send-email] === test_connection END (FAILED) ===');
    return jsonResponse({ success: false, connected: false, error: result.error }, 200);
  }

  console.log('[send-email] === test_connection END (OK) ===');
  return jsonResponse({ success: true, connected: true, messageId: result.messageId });
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

    // Parse request body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return errorResponse('JSON inválido no corpo da requisição');
    }

    if (!body.action) {
      return errorResponse('Campo obrigatório ausente: action');
    }

    console.log(`[send-email] Action: ${body.action}`);

    // Fetch Resend config from system_settings
    let config: ResendConfig;
    try {
      config = await getResendConfig(supabase);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return errorResponse(errMsg);
    }

    // Route to action handler
    let result: Response;
    try {
      switch (body.action) {
        case 'send_invitation_email':
          result = await handleSendInvitationEmail(config, body as SendInvitationBody);
          break;

        case 'send_activation_email':
          result = await handleSendActivationEmail(config, body as SendActivationBody);
          break;

        case 'test_connection':
          result = await handleTestConnection(config, body as TestConnectionBody);
          break;

        default:
          result = errorResponse(
            `Ação desconhecida: ${(body as Record<string, unknown>).action}. Ações válidas: send_invitation_email, send_activation_email, test_connection`,
          );
      }
    } catch (handlerErr) {
      const msg = handlerErr instanceof Error ? handlerErr.message : String(handlerErr);
      const stack = handlerErr instanceof Error ? handlerErr.stack : '';
      console.error(`[send-email] Handler crash for ${body.action}: ${msg}\n${stack}`);
      result = errorResponse(`Erro interno: ${msg}`, 500);
    }

    return result;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    console.error(`[send-email] Unhandled error: ${errMsg}\n${stack}`);
    return errorResponse(`Erro interno do servidor: ${errMsg}`, 500);
  }
});
