/**
 * Edge Function: manage-team-anonymization
 * PRD-090 Phase 7: LGPD anonymization of team member personal data.
 *
 * Actions:
 *   - request_anonymization: Anonymize personal data for a terminated/unlinked member
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Create a lifecycle event in the team_member_events table. */
async function createEvent(
  supabase: ReturnType<typeof createClient>,
  params: {
    teamMemberId: string;
    companyId: string;
    eventType: string;
    eventDate?: string;
    description?: string;
    performedBy: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await supabase.from('team_member_events').insert({
      team_member_id: params.teamMemberId,
      company_id: params.companyId,
      event_type: params.eventType,
      event_date: params.eventDate || new Date().toISOString().slice(0, 10),
      description: params.description || null,
      performed_by: params.performedBy,
      metadata: params.metadata || {},
      visibility: 'all_managers',
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[createEvent] Failed (non-blocking):', err);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // -----------------------------------------------------------------------
    // ACTION: request_anonymization
    // -----------------------------------------------------------------------
    if (action === 'request_anonymization') {
      const { teamMemberId, performedBy, justification, forceOverride } = body;

      if (!teamMemberId || !performedBy) {
        return json(
          { success: false, error: 'Campos obrigatórios: teamMemberId, performedBy.' },
          400,
        );
      }

      // 1. Fetch team member and validate status
      const { data: member, error: memberErr } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', teamMemberId)
        .maybeSingle();

      if (memberErr || !member) {
        return json({ success: false, error: 'Colaborador não encontrado.' }, 404);
      }

      if (member.status !== 'terminated' && member.status !== 'unlinked') {
        return json(
          {
            success: false,
            error: 'Apenas colaboradores desligados ou desvinculados podem ser anonimizados.',
          },
          400,
        );
      }

      if (member.anonymized) {
        return json(
          { success: false, error: 'Colaborador já foi anonimizado.' },
          400,
        );
      }

      // 2. Get company's data retention settings (default 5 years)
      const { data: retentionRow } = await supabase
        .from('data_retention_settings')
        .select('retention_years')
        .eq('company_id', member.company_id)
        .maybeSingle();

      const retentionYears = retentionRow?.retention_years ?? 5;

      // 3. Calculate if retention period has passed
      const terminationDate = member.termination_date || member.updated_at;
      const retentionEnd = new Date(terminationDate);
      retentionEnd.setFullYear(retentionEnd.getFullYear() + retentionYears);

      const now = new Date();
      const withinRetention = retentionEnd > now;

      // 4. Validate retention period / force override
      if (withinRetention && !forceOverride) {
        return json({
          success: false,
          error: 'retention_not_met',
          retentionEndDate: retentionEnd.toISOString(),
        });
      }

      if (withinRetention && forceOverride && !justification) {
        return json(
          {
            success: false,
            error: 'Justificativa obrigatória para anonimização antes do período de retenção.',
          },
          400,
        );
      }

      // 5. Execute anonymization
      const hash = crypto.randomUUID().slice(0, 8);
      const anonymizedName = `COLABORADOR ANONIMIZADO #${hash}`;

      const { data: updated, error: updateErr } = await supabase
        .from('team_members')
        .update({
          name: anonymizedName,
          email: `anon-${hash}@anonimizado.local`,
          cpf: null,
          phone: null,
          avatar_url: null,
          termination_notes: null,
          anonymized: true,
          anonymized_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamMemberId)
        .select()
        .single();

      if (updateErr) {
        return json(
          { success: false, error: 'Erro ao anonimizar colaborador: ' + updateErr.message },
          500,
        );
      }

      // 6. Create anonymized event
      await createEvent(supabase, {
        teamMemberId,
        companyId: member.company_id,
        eventType: 'anonymized',
        eventDate: new Date().toISOString().slice(0, 10),
        description: 'Dados pessoais anonimizados (LGPD)',
        performedBy,
        metadata: {
          performedBy,
          justification: justification || null,
          forceOverride: !!forceOverride,
        },
      });

      return json({ success: true, data: { anonymizedName } });
    }

    return json({ success: false, error: 'Ação inválida: ' + action }, 400);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return json({ success: false, error: message }, 500);
  }
});
