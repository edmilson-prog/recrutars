/**
 * Edge Function: manage-data-consent
 * LGPD: manage candidate_data_disclosures lifecycle for per-application×company consent.
 *
 * Actions:
 *   - notify_request: company side — ensure a 'pending' disclosure exists for an
 *     application in 'offer', notify the candidate (in-app + email).
 *   - accept:  candidate side — disclosure -> 'accepted' (records term_version/hash,
 *     ip, user_agent); audit consent_granted; notify the company.
 *   - refuse:  candidate side — disclosure -> 'refused'; notify the company.
 *   - revoke:  candidate side — disclosure -> 'revoked' (records revoked_at);
 *     audit consent_revoked; notify the company.
 *
 * verify_jwt = false (config.toml). The caller JWT is validated manually via
 * supabase.auth.getUser(token). Writes use the service role (bypasses RLS).
 *
 * Response shape (consumed by consentService.supabase.ts invokeConsent):
 *   Success: { success: true, disclosure: <candidate_data_disclosures row> }
 *   Error:   { success: false, error: string } with appropriate HTTP status code.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400): Response {
  console.error(`[manage-data-consent] Error (${status}): ${message}`);
  return json({ success: false, error: message }, status);
}

/** Extract the first client IP from x-forwarded-for. */
function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip');
}

/** Best-effort audit log; never blocks the main flow. resource_type is always 'consent'. */
async function writeAudit(
  supabase: ReturnType<typeof createClient>,
  params: {
    action: 'consent_granted' | 'consent_revoked' | 'sensitive_data_revealed';
    companyId: string;
    userId: string;
    userName: string;
    resourceId: string;
    resourceName?: string | null;
    details?: string | null;
  },
): Promise<void> {
  try {
    await supabase.from('test_audit_logs').insert({
      action: params.action,
      resource_type: 'consent',
      resource_id: params.resourceId,
      resource_name: params.resourceName ?? null,
      company_id: params.companyId,
      user_id: params.userId,
      user_name: params.userName,
      details: params.details ?? null,
    });
  } catch (err) {
    console.error('[manage-data-consent] writeAudit failed (non-blocking):', err);
  }
}

/** Best-effort in-app notification; never blocks the main flow. */
async function notify(
  supabase: ReturnType<typeof createClient>,
  params: {
    userId: string;
    type: string;
    title: string;
    description: string;
    actionUrl: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      description: params.description,
      action_url: params.actionUrl,
      metadata: params.metadata ?? null,
    });
  } catch (err) {
    console.error('[manage-data-consent] notify failed (non-blocking):', err);
  }
}

interface ResolvedContext {
  application: { id: string; candidate_id: string; job_id: string; status: string };
  candidate: { id: string; profile_id: string; name: string; email: string };
  company: { id: string; profile_id: string; name: string };
  job: { id: string; company_id: string; title: string };
}

/** Resolve application -> candidate, job, company (applications has no company_id column). */
async function resolveContext(
  supabase: ReturnType<typeof createClient>,
  applicationId: string,
): Promise<ResolvedContext | null> {
  const { data: application } = await supabase
    .from('applications')
    .select('id, candidate_id, job_id, status')
    .eq('id', applicationId)
    .maybeSingle();
  if (!application) return null;

  const { data: job } = await supabase
    .from('jobs')
    .select('id, company_id, title')
    .eq('id', application.job_id)
    .maybeSingle();
  if (!job) return null;

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, profile_id, name, email')
    .eq('id', application.candidate_id)
    .maybeSingle();
  if (!candidate) return null;

  const { data: company } = await supabase
    .from('companies')
    .select('id, profile_id, name')
    .eq('id', job.company_id)
    .maybeSingle();
  if (!company) return null;

  return {
    application: application as ResolvedContext['application'],
    candidate: candidate as ResolvedContext['candidate'],
    company: company as ResolvedContext['company'],
    job: job as ResolvedContext['job'],
  };
}

// Columns returned in disclosure rows — matches consentService.supabase.ts DISCLOSURE_COLUMNS
const DISCLOSURE_SELECT =
  'id, application_id, candidate_id, company_id, status, term_version, term_hash, accepted_at, revoked_at, ip, user_agent, created_at';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return errorResponse('Método não permitido. Use POST.', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return errorResponse('Variáveis de ambiente ausentes (SUPABASE_URL / SERVICE_ROLE_KEY).', 500);
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // --- Manual JWT validation (verify_jwt is disabled in config.toml) ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse('Cabeçalho Authorization obrigatório.', 401);
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !caller) {
    return errorResponse('Token inválido.', 401);
  }

  let body: { action?: string; applicationId?: string; termVersion?: string; termHash?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse('JSON inválido no corpo da requisição.');
  }

  const { action, applicationId } = body;
  if (!action) return errorResponse('Campo obrigatório ausente: action.');
  if (!applicationId) return errorResponse('Campo obrigatório ausente: applicationId.');

  console.log(`[manage-data-consent] action=${action} applicationId=${applicationId} caller=${caller.id}`);

  const ctx = await resolveContext(supabase, applicationId);
  if (!ctx) {
    return errorResponse('Candidatura, vaga, candidato ou empresa não encontrados.', 404);
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent');
  const nowIso = new Date().toISOString();

  try {
    switch (action) {
      // ------------------------------------------------------------------
      // notify_request (company side): ensure a pending disclosure + notify
      // ------------------------------------------------------------------
      case 'notify_request': {
        // Idempotent upsert on the unique (application_id, company_id) pair.
        const { data: existing } = await supabase
          .from('candidate_data_disclosures')
          .select(DISCLOSURE_SELECT)
          .eq('application_id', ctx.application.id)
          .eq('company_id', ctx.company.id)
          .maybeSingle();

        let disclosure = existing;

        if (!existing) {
          const { data: inserted, error: insertErr } = await supabase
            .from('candidate_data_disclosures')
            .insert({
              application_id: ctx.application.id,
              candidate_id: ctx.candidate.id,
              company_id: ctx.company.id,
              status: 'pending',
            })
            .select(DISCLOSURE_SELECT)
            .maybeSingle();

          // Unique violation = trigger create_disclosure_on_offer already created it: tolerate.
          if (insertErr) {
            if (String(insertErr.message).includes('duplicate') || insertErr.code === '23505') {
              // Re-fetch the row created by the trigger.
              const { data: refetched } = await supabase
                .from('candidate_data_disclosures')
                .select(DISCLOSURE_SELECT)
                .eq('application_id', ctx.application.id)
                .eq('company_id', ctx.company.id)
                .maybeSingle();
              disclosure = refetched;
            } else {
              return errorResponse('Erro ao registrar solicitação: ' + insertErr.message, 500);
            }
          } else {
            disclosure = inserted;
          }
        } else if (existing.status === 'refused' || existing.status === 'revoked') {
          // Re-request: reset to pending.
          const { data: reset } = await supabase
            .from('candidate_data_disclosures')
            .update({ status: 'pending', accepted_at: null, revoked_at: null, updated_at: nowIso })
            .eq('id', existing.id)
            .select(DISCLOSURE_SELECT)
            .maybeSingle();
          disclosure = reset;
        }

        // In-app notification to the candidate.
        await notify(supabase, {
          userId: ctx.candidate.profile_id,
          type: 'consent_request',
          title: 'Você foi aprovado — autorize o compartilhamento',
          description: `A empresa ${ctx.company.name} solicitou autorização para acessar seus dados de contato na vaga "${ctx.job.title}".`,
          actionUrl: '/candidato/candidaturas',
          metadata: { applicationId: ctx.application.id, companyId: ctx.company.id },
        });

        // Email notification (best-effort — non-2xx from send-email is logged, not thrown).
        try {
          const emailResp = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'send_consent_request_email',
              to: ctx.candidate.email,
              candidateName: ctx.candidate.name,
              companyName: ctx.company.name,
              jobTitle: ctx.job.title,
              actionLink: 'https://recrutars.com/candidato/candidaturas',
            }),
          });
          const emailResult = await emailResp.json().catch(() => ({}));
          if (!emailResp.ok || emailResult?.error) {
            console.error('[manage-data-consent] send-email failed:', emailResult?.error || emailResp.status);
          }
        } catch (err) {
          console.error('[manage-data-consent] send-email fetch failed (non-blocking):', err);
        }

        return json({ success: true, disclosure });
      }

      // ------------------------------------------------------------------
      // accept (candidate side)
      // ------------------------------------------------------------------
      case 'accept': {
        const { data: disclosure, error: updErr } = await supabase
          .from('candidate_data_disclosures')
          .update({
            status: 'accepted',
            accepted_at: nowIso,
            revoked_at: null,
            term_version: body.termVersion ?? null,
            term_hash: body.termHash ?? null,
            ip,
            user_agent: userAgent,
            updated_at: nowIso,
          })
          .eq('application_id', ctx.application.id)
          .eq('company_id', ctx.company.id)
          .select(DISCLOSURE_SELECT)
          .maybeSingle();

        if (updErr) return errorResponse('Erro ao registrar aceite: ' + updErr.message, 500);
        if (!disclosure) return errorResponse('Nenhuma solicitação de consentimento encontrada para aceitar.', 404);

        await writeAudit(supabase, {
          action: 'consent_granted',
          companyId: ctx.company.id,
          userId: ctx.candidate.profile_id,
          userName: ctx.candidate.name,
          resourceId: ctx.application.id,
          resourceName: ctx.job.title,
          details: `Consentimento concedido por ${ctx.candidate.name} (versão ${body.termVersion ?? '?'}).`,
        });

        await notify(supabase, {
          userId: ctx.company.profile_id,
          type: 'consent_granted',
          title: 'Consentimento concedido',
          description: `${ctx.candidate.name} autorizou o compartilhamento dos dados na vaga "${ctx.job.title}".`,
          actionUrl: '/empresa/candidatos',
          metadata: { applicationId: ctx.application.id, candidateId: ctx.candidate.id },
        });

        return json({ success: true, disclosure });
      }

      // ------------------------------------------------------------------
      // refuse (candidate side)
      // ------------------------------------------------------------------
      case 'refuse': {
        const { data: disclosure, error: updErr } = await supabase
          .from('candidate_data_disclosures')
          .update({ status: 'refused', updated_at: nowIso })
          .eq('application_id', ctx.application.id)
          .eq('company_id', ctx.company.id)
          .select(DISCLOSURE_SELECT)
          .maybeSingle();

        if (updErr) return errorResponse('Erro ao registrar recusa: ' + updErr.message, 500);
        if (!disclosure) return errorResponse('Nenhuma solicitação de consentimento encontrada para recusar.', 404);

        await notify(supabase, {
          userId: ctx.company.profile_id,
          type: 'consent_refused',
          title: 'Consentimento não autorizado',
          description: `${ctx.candidate.name} não autorizou o compartilhamento dos dados na vaga "${ctx.job.title}".`,
          actionUrl: '/empresa/candidatos',
          metadata: { applicationId: ctx.application.id, candidateId: ctx.candidate.id },
        });

        return json({ success: true, disclosure });
      }

      // ------------------------------------------------------------------
      // revoke (candidate side, from accepted)
      // ------------------------------------------------------------------
      case 'revoke': {
        const { data: disclosure, error: updErr } = await supabase
          .from('candidate_data_disclosures')
          .update({ status: 'revoked', revoked_at: nowIso, updated_at: nowIso })
          .eq('application_id', ctx.application.id)
          .eq('company_id', ctx.company.id)
          .select(DISCLOSURE_SELECT)
          .maybeSingle();

        if (updErr) return errorResponse('Erro ao registrar revogação: ' + updErr.message, 500);
        if (!disclosure) return errorResponse('Nenhuma solicitação de consentimento encontrada para revogar.', 404);

        await writeAudit(supabase, {
          action: 'consent_revoked',
          companyId: ctx.company.id,
          userId: ctx.candidate.profile_id,
          userName: ctx.candidate.name,
          resourceId: ctx.application.id,
          resourceName: ctx.job.title,
          details: `Consentimento revogado por ${ctx.candidate.name}.`,
        });

        await notify(supabase, {
          userId: ctx.company.profile_id,
          type: 'consent_revoked',
          title: 'Consentimento revogado',
          description: `${ctx.candidate.name} revogou o compartilhamento dos dados na vaga "${ctx.job.title}". Os dados foram ocultados novamente.`,
          actionUrl: '/empresa/candidatos',
          metadata: { applicationId: ctx.application.id, candidateId: ctx.candidate.id },
        });

        return json({ success: true, disclosure });
      }

      default:
        return errorResponse(
          `Ação desconhecida: ${action}. Ações válidas: notify_request, accept, refuse, revoke.`,
        );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[manage-data-consent] Handler crash for ${action}: ${msg}`);
    return errorResponse(`Erro interno: ${msg}`, 500);
  }
});
