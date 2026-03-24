/**
 * Edge Function: manage-team-lifecycle
 * Handles employee lifecycle management for team members.
 *
 * Actions:
 *   - terminate: Terminate or schedule termination of a team member
 *   - unlink: Unlink a team member (restore to talent pool)
 *   - reactivate: Reactivate a terminated team member
 *   - cancel_scheduled_termination: Cancel a scheduled termination
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
    visibility?: string;
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
      visibility: params.visibility || 'all_managers',
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[createEvent] Failed (non-blocking):', err);
  }
}

/** Cancel pending test invitations for a team member. */
async function cancelPendingInvitations(
  supabase: ReturnType<typeof createClient>,
  teamMemberId: string
): Promise<void> {
  try {
    await supabase
      .from('test_invitations')
      .update({ status: 'cancelled' })
      .eq('team_member_id', teamMemberId)
      .in('status', ['sent', 'viewed', 'started']);
  } catch (err) {
    console.error('[cancelPendingInvitations] Failed (non-blocking):', err);
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
    // BULK MODE: iterate over teamMemberIds array (terminate only)
    // -----------------------------------------------------------------------
    if (body.bulk === true && Array.isArray(body.teamMemberIds) && action === 'terminate') {
      const {
        terminationReason,
        terminationReasonDetail,
        terminationDate,
        terminationNotes,
        performedBy,
      } = body;
      const results: Array<{ teamMemberId: string; success: boolean; error?: string }> = [];

      for (const memberId of body.teamMemberIds) {
        try {
          const { data: member, error: fetchErr } = await supabase
            .from('team_members')
            .select('*')
            .eq('id', memberId)
            .single();

          if (fetchErr || !member) {
            results.push({ teamMemberId: memberId, success: false, error: 'Colaborador não encontrado' });
            continue;
          }

          if (member.status !== 'active' && member.status !== 'on_leave') {
            results.push({ teamMemberId: memberId, success: false, error: 'Status inválido: ' + member.status });
            continue;
          }

          await supabase
            .from('team_members')
            .update({
              status: 'terminated',
              is_active: false,
              termination_date: terminationDate,
              termination_reason: terminationReason,
              termination_reason_detail: terminationReasonDetail || null,
              termination_notes: terminationNotes || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', memberId);

          await cancelPendingInvitations(supabase, memberId);

          await createEvent(supabase, {
            teamMemberId: memberId,
            companyId: member.company_id,
            eventType: 'terminated',
            eventDate: terminationDate,
            description: 'Colaborador desligado (ação em lote)',
            performedBy,
            metadata: { reason: terminationReason, bulk: true },
          });

          results.push({ teamMemberId: memberId, success: true });
        } catch (err) {
          results.push({
            teamMemberId: memberId,
            success: false,
            error: err instanceof Error ? err.message : 'Erro interno',
          });
        }
      }
      return json({ success: true, results });
    }

    // -----------------------------------------------------------------------
    // ACTION: terminate
    // -----------------------------------------------------------------------
    if (action === 'terminate') {
      const {
        teamMemberId,
        terminationReason,
        terminationReasonDetail,
        terminationDate,
        terminationNotes,
        notifyCollaborator,
        offboardingItems,
        performedBy,
      } = body;

      if (!teamMemberId || !terminationReason || !terminationDate || !performedBy) {
        return json({ success: false, error: 'Campos obrigatorios: teamMemberId, terminationReason, terminationDate, performedBy.' }, 400);
      }

      // Fetch team member
      const { data: member, error: memberErr } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', teamMemberId)
        .maybeSingle();

      if (memberErr || !member) {
        return json({ success: false, error: 'Colaborador nao encontrado.' }, 404);
      }

      // Validate status
      if (member.status !== 'active' && member.status !== 'on_leave') {
        return json({ success: false, error: 'Colaborador deve estar ativo ou em licenca para ser desligado.' }, 400);
      }

      const terminationDateObj = new Date(terminationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      terminationDateObj.setHours(0, 0, 0, 0);

      // Future termination: schedule it
      if (terminationDateObj > today) {
        const { data: updated, error: updateErr } = await supabase
          .from('team_members')
          .update({
            termination_scheduled_date: terminationDate,
            termination_reason: terminationReason,
            termination_reason_detail: terminationReasonDetail || null,
            termination_notes: terminationNotes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', teamMemberId)
          .select()
          .single();

        if (updateErr) {
          return json({ success: false, error: 'Erro ao agendar desligamento: ' + updateErr.message }, 500);
        }

        await createEvent(supabase, {
          teamMemberId,
          companyId: member.company_id,
          eventType: 'scheduled_termination_set',
          eventDate: new Date().toISOString().slice(0, 10),
          description: `Desligamento agendado para ${terminationDate}`,
          performedBy,
          metadata: {
            termination_date: terminationDate,
            reason: terminationReason,
            reason_detail: terminationReasonDetail || null,
            notes: terminationNotes || null,
          },
        });

        return json({ success: true, data: updated });
      }

      // Immediate termination
      const { data: updated, error: updateErr } = await supabase
        .from('team_members')
        .update({
          status: 'terminated',
          is_active: false,
          termination_date: terminationDate,
          termination_reason: terminationReason,
          termination_reason_detail: terminationReasonDetail || null,
          termination_notes: terminationNotes || null,
          termination_scheduled_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamMemberId)
        .select()
        .single();

      if (updateErr) {
        return json({ success: false, error: 'Erro ao desligar colaborador: ' + updateErr.message }, 500);
      }

      // Cancel pending test invitations
      await cancelPendingInvitations(supabase, teamMemberId);

      // Create terminated event
      await createEvent(supabase, {
        teamMemberId,
        companyId: member.company_id,
        eventType: 'terminated',
        eventDate: terminationDate,
        description: `Colaborador desligado`,
        performedBy,
        metadata: {
          termination_date: terminationDate,
          reason: terminationReason,
          reason_detail: terminationReasonDetail || null,
          notes: terminationNotes || null,
        },
      });

      // Insert offboarding checklist items if provided
      if (offboardingItems && Array.isArray(offboardingItems) && offboardingItems.length > 0) {
        const companyId = member.company_id;
        const checklistRows = offboardingItems.map((item: string, index: number) => ({
          company_id: companyId,
          team_member_id: teamMemberId,
          item_label: item,
          is_completed: false,
          sort_order: index,
          created_at: new Date().toISOString(),
        }));

        const { error: checklistErr } = await supabase
          .from('offboarding_checklists')
          .insert(checklistRows);

        if (checklistErr) {
          console.error('[terminate] offboarding checklist insert error (non-blocking):', checklistErr.message);
        }
      }

      // Notify department manager if different from performer
      try {
        if (member.department_id) {
          const { data: dept } = await supabase
            .from('departments')
            .select('manager_id')
            .eq('id', member.department_id)
            .maybeSingle();

          if (dept?.manager_id && dept.manager_id !== performedBy) {
            await supabase.from('notifications').insert({
              user_id: dept.manager_id,
              type: 'team_update',
              title: `Colaborador desligado: ${member.name}`,
              description: `${member.name} foi desligado(a). Motivo: ${terminationReason}.`,
              action_url: `/empresa/equipes/membro/${teamMemberId}`,
              metadata: { teamMemberId, event: 'terminated', reason: terminationReason },
              read: false,
            });
          }
        }
      } catch (notifErr) {
        console.error('[terminate] manager notification error (non-blocking):', notifErr);
      }

      // Notify collaborator if requested and linked to a candidate
      try {
        if (notifyCollaborator && member.imported_from_candidate_id) {
          const { data: candidate } = await supabase
            .from('candidates')
            .select('profile_id')
            .eq('id', member.imported_from_candidate_id)
            .maybeSingle();

          if (candidate?.profile_id) {
            await supabase.from('notifications').insert({
              user_id: candidate.profile_id,
              type: 'team_update',
              title: 'Atualização de vínculo',
              description: 'Seu vínculo como colaborador foi encerrado. Entre em contato com a empresa para mais informações.',
              action_url: '/candidato/perfil',
              metadata: { teamMemberId, event: 'terminated' },
              read: false,
            });
          }
        }
      } catch (notifErr) {
        console.error('[terminate] collaborator notification error (non-blocking):', notifErr);
      }

      return json({ success: true, data: updated });
    }

    // -----------------------------------------------------------------------
    // ACTION: unlink
    // -----------------------------------------------------------------------
    if (action === 'unlink') {
      const { teamMemberId, unlinkReason, unlinkReasonDetail, performedBy } = body;

      if (!teamMemberId || !unlinkReason || !performedBy) {
        return json({ success: false, error: 'Campos obrigatorios: teamMemberId, unlinkReason, performedBy.' }, 400);
      }

      // Fetch team member
      const { data: member, error: memberErr } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', teamMemberId)
        .maybeSingle();

      if (memberErr || !member) {
        return json({ success: false, error: 'Colaborador nao encontrado.' }, 404);
      }

      // Validate not already terminated/unlinked
      if (member.status === 'terminated' || member.status === 'unlinked') {
        return json({ success: false, error: 'Colaborador ja esta desligado ou desvinculado.' }, 400);
      }

      // Update team member
      const { data: updated, error: updateErr } = await supabase
        .from('team_members')
        .update({
          status: 'unlinked',
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamMemberId)
        .select()
        .single();

      if (updateErr) {
        return json({ success: false, error: 'Erro ao desvincular colaborador: ' + updateErr.message }, 500);
      }

      // Cancel pending test invitations
      await cancelPendingInvitations(supabase, teamMemberId);

      // Restore candidate visibility to public (return to talent pool)
      if (member.imported_from_candidate_id) {
        const { error: candErr } = await supabase
          .from('candidates')
          .update({ visibility_mode: 'public' })
          .eq('id', member.imported_from_candidate_id);

        if (candErr) {
          console.error('[unlink] restore candidate visibility error (non-blocking):', candErr.message);
        }
      }

      // Create unlinked event
      await createEvent(supabase, {
        teamMemberId,
        companyId: member.company_id,
        eventType: 'unlinked',
        eventDate: new Date().toISOString().slice(0, 10),
        description: 'Colaborador desvinculado',
        performedBy,
        metadata: {
          reason: unlinkReason,
          reason_detail: unlinkReasonDetail || null,
        },
      });

      return json({ success: true, data: updated });
    }

    // -----------------------------------------------------------------------
    // ACTION: reactivate
    // -----------------------------------------------------------------------
    if (action === 'reactivate') {
      const {
        teamMemberId,
        hireDate,
        departmentId,
        positionId,
        notes,
        keepGaugeProfile,
        performedBy,
      } = body;

      if (!teamMemberId || !hireDate || !departmentId || !positionId || !performedBy) {
        return json({ success: false, error: 'Campos obrigatorios: teamMemberId, hireDate, departmentId, positionId, performedBy.' }, 400);
      }

      // Fetch team member
      const { data: member, error: memberErr } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', teamMemberId)
        .maybeSingle();

      if (memberErr || !member) {
        return json({ success: false, error: 'Colaborador nao encontrado.' }, 404);
      }

      // Validate status is terminated
      if (member.status !== 'terminated') {
        return json({ success: false, error: 'Apenas colaboradores desligados podem ser reativados.' }, 400);
      }

      // Build update payload
      const updatePayload: Record<string, unknown> = {
        status: 'active',
        is_active: true,
        hire_date: hireDate,
        department_id: departmentId,
        position_id: positionId,
        termination_date: null,
        termination_reason: null,
        termination_reason_detail: null,
        termination_notes: null,
        termination_scheduled_date: null,
        updated_at: new Date().toISOString(),
      };

      // Reset Gauge profile if not keeping it
      if (!keepGaugeProfile) {
        updatePayload.gauge_status = 'unmapped';
        updatePayload.gauge_scores = null;
        updatePayload.archetype = null;
      }

      const { data: updated, error: updateErr } = await supabase
        .from('team_members')
        .update(updatePayload)
        .eq('id', teamMemberId)
        .select()
        .single();

      if (updateErr) {
        return json({ success: false, error: 'Erro ao reativar colaborador: ' + updateErr.message }, 500);
      }

      // Create reactivated event
      await createEvent(supabase, {
        teamMemberId,
        companyId: member.company_id,
        eventType: 'reactivated',
        eventDate: hireDate,
        description: 'Colaborador recontratado',
        performedBy,
        metadata: {
          hire_date: hireDate,
          department_id: departmentId,
          position_id: positionId,
          notes: notes || null,
          kept_gauge_profile: !!keepGaugeProfile,
        },
      });

      return json({ success: true, data: updated });
    }

    // -----------------------------------------------------------------------
    // ACTION: cancel_scheduled_termination
    // -----------------------------------------------------------------------
    if (action === 'cancel_scheduled_termination') {
      const { teamMemberId, performedBy } = body;

      if (!teamMemberId || !performedBy) {
        return json({ success: false, error: 'Campos obrigatorios: teamMemberId, performedBy.' }, 400);
      }

      // Fetch team member
      const { data: member, error: memberErr } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', teamMemberId)
        .maybeSingle();

      if (memberErr || !member) {
        return json({ success: false, error: 'Colaborador nao encontrado.' }, 404);
      }

      // Validate has a scheduled termination
      if (!member.termination_scheduled_date) {
        return json({ success: false, error: 'Colaborador nao possui desligamento agendado.' }, 400);
      }

      // Clear termination fields
      const { data: updated, error: updateErr } = await supabase
        .from('team_members')
        .update({
          termination_scheduled_date: null,
          termination_reason: null,
          termination_reason_detail: null,
          termination_notes: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamMemberId)
        .select()
        .single();

      if (updateErr) {
        return json({ success: false, error: 'Erro ao cancelar desligamento agendado: ' + updateErr.message }, 500);
      }

      // Create event
      await createEvent(supabase, {
        teamMemberId,
        companyId: member.company_id,
        eventType: 'scheduled_termination_cancelled',
        eventDate: new Date().toISOString().slice(0, 10),
        description: 'Desligamento agendado cancelado',
        performedBy,
        metadata: {
          cancelled_date: member.termination_scheduled_date,
        },
      });

      return json({ success: true, data: updated });
    }

    return json({ success: false, error: 'Acao invalida: ' + action }, 400);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return json({ success: false, error: message }, 500);
  }
});
