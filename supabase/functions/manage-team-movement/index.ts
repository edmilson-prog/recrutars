/**
 * Edge Function: manage-team-movement
 * Handles leave management and internal movements for team members.
 *
 * Actions:
 *   - start_leave: Put a team member on leave
 *   - return_from_leave: Return a team member from leave
 *   - promote: Promote a team member to a new position
 *   - transfer_department: Transfer a team member to another department
 *   - change_position: Change a team member's position
 *   - add_note: Add a note to a team member's timeline
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
    eventDate: string;
    description?: string;
    performedBy: string;
    metadata?: Record<string, unknown>;
    visibility?: string;
  }
) {
  const { data, error } = await supabase.from('team_member_events').insert({
    team_member_id: params.teamMemberId,
    company_id: params.companyId,
    event_type: params.eventType,
    event_date: params.eventDate,
    description: params.description || null,
    performed_by: params.performedBy,
    metadata: params.metadata || {},
    visibility: params.visibility || 'all_managers',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error('[createEvent] Failed:', error);
  }

  return { data, error };
}

/** Fetch a team member by ID, returning the member or an error response. */
async function fetchMember(supabase: ReturnType<typeof createClient>, teamMemberId: string) {
  const { data: member, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', teamMemberId)
    .maybeSingle();

  if (error || !member) {
    return { member: null, errorResponse: json({ success: false, error: 'Colaborador nao encontrado.' }, 404) };
  }

  return { member, errorResponse: null };
}

/** Fetch position title by ID. */
async function getPositionTitle(supabase: ReturnType<typeof createClient>, positionId: string): Promise<string | null> {
  const { data } = await supabase
    .from('positions')
    .select('title')
    .eq('id', positionId)
    .maybeSingle();
  return data?.title || null;
}

/** Fetch department name by ID. */
async function getDepartmentName(supabase: ReturnType<typeof createClient>, departmentId: string): Promise<string | null> {
  const { data } = await supabase
    .from('departments')
    .select('name')
    .eq('id', departmentId)
    .maybeSingle();
  return data?.name || null;
}

/** Process a single action for one team member. Returns { success, data?, error?, warning? }. */
async function processAction(
  supabase: ReturnType<typeof createClient>,
  action: string,
  teamMemberId: string,
  body: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string; warning?: string }> {

  // -----------------------------------------------------------------------
  // ACTION: start_leave
  // -----------------------------------------------------------------------
  if (action === 'start_leave') {
    const {
      leaveType,
      leaveStartDate,
      leaveExpectedReturn,
      leaveIncludeMetrics,
      notes,
      performedBy,
    } = body as {
      leaveType: string;
      leaveStartDate: string;
      leaveExpectedReturn?: string;
      leaveIncludeMetrics: boolean;
      notes?: string;
      performedBy: string;
    };

    if (!teamMemberId || !leaveType || !leaveStartDate || leaveIncludeMetrics === undefined || !performedBy) {
      return { success: false, error: 'Campos obrigatorios: teamMemberId, leaveType, leaveStartDate, leaveIncludeMetrics, performedBy.' };
    }

    const { member, errorResponse } = await fetchMember(supabase, teamMemberId);
    if (!member) return { success: false, error: 'Colaborador nao encontrado.' };

    if (member.status !== 'active') {
      return { success: false, error: 'Colaborador deve estar ativo para iniciar licenca.' };
    }

    // Check for scheduled termination — warn but do not block
    let warning: string | undefined;
    if (member.termination_scheduled_date) {
      warning = `Colaborador possui desligamento agendado para ${member.termination_scheduled_date}.`;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('team_members')
      .update({
        status: 'on_leave',
        leave_type: leaveType,
        leave_start_date: leaveStartDate,
        leave_expected_return: leaveExpectedReturn || null,
        leave_include_metrics: !!leaveIncludeMetrics,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamMemberId)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: 'Erro ao iniciar licenca: ' + updateErr.message };
    }

    await createEvent(supabase, {
      teamMemberId,
      companyId: member.company_id,
      eventType: 'leave_started',
      eventDate: leaveStartDate,
      description: `Licenca iniciada: ${leaveType}`,
      performedBy: performedBy as string,
      metadata: {
        leaveType,
        expectedReturn: leaveExpectedReturn || null,
        includeMetrics: !!leaveIncludeMetrics,
        notes: notes || null,
      },
    });

    return { success: true, data: updated, ...(warning ? { warning } : {}) };
  }

  // -----------------------------------------------------------------------
  // ACTION: return_from_leave
  // -----------------------------------------------------------------------
  if (action === 'return_from_leave') {
    const { returnDate, notes, performedBy } = body as {
      returnDate: string;
      notes?: string;
      performedBy: string;
    };

    if (!teamMemberId || !returnDate || !performedBy) {
      return { success: false, error: 'Campos obrigatorios: teamMemberId, returnDate, performedBy.' };
    }

    const { member } = await fetchMember(supabase, teamMemberId);
    if (!member) return { success: false, error: 'Colaborador nao encontrado.' };

    if (member.status !== 'on_leave') {
      return { success: false, error: 'Colaborador deve estar em licenca para retornar.' };
    }

    // Calculate leave duration in days
    let leaveDuration: number | null = null;
    if (member.leave_start_date) {
      const start = new Date(member.leave_start_date);
      const end = new Date(returnDate);
      leaveDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    const { data: updated, error: updateErr } = await supabase
      .from('team_members')
      .update({
        status: 'active',
        leave_type: null,
        leave_start_date: null,
        leave_expected_return: null,
        leave_include_metrics: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamMemberId)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: 'Erro ao retornar de licenca: ' + updateErr.message };
    }

    await createEvent(supabase, {
      teamMemberId,
      companyId: member.company_id,
      eventType: 'leave_returned',
      eventDate: returnDate,
      description: 'Retorno de licenca',
      performedBy: performedBy as string,
      metadata: {
        returnDate,
        leaveDuration,
        notes: notes || null,
      },
    });

    return { success: true, data: updated };
  }

  // -----------------------------------------------------------------------
  // ACTION: promote
  // -----------------------------------------------------------------------
  if (action === 'promote') {
    const {
      newPositionId,
      newDepartmentId,
      effectiveDate,
      justification,
      performedBy,
    } = body as {
      newPositionId: string;
      newDepartmentId?: string;
      effectiveDate: string;
      justification?: string;
      performedBy: string;
    };

    if (!teamMemberId || !newPositionId || !effectiveDate || !performedBy) {
      return { success: false, error: 'Campos obrigatorios: teamMemberId, newPositionId, effectiveDate, performedBy.' };
    }

    const { member } = await fetchMember(supabase, teamMemberId);
    if (!member) return { success: false, error: 'Colaborador nao encontrado.' };

    if (member.status !== 'active') {
      return { success: false, error: 'Colaborador deve estar ativo para ser promovido.' };
    }

    // Read current position and department
    const previousPositionId = member.position_id;
    const previousDepartmentId = member.department_id;

    // Fetch position titles in parallel
    const [previousPositionTitle, newPositionTitle] = await Promise.all([
      previousPositionId ? getPositionTitle(supabase, previousPositionId) : Promise.resolve(null),
      getPositionTitle(supabase, newPositionId),
    ]);

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      position_id: newPositionId,
      updated_at: new Date().toISOString(),
    };
    if (newDepartmentId) {
      updatePayload.department_id = newDepartmentId;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('team_members')
      .update(updatePayload)
      .eq('id', teamMemberId)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: 'Erro ao promover colaborador: ' + updateErr.message };
    }

    const description = `Promovido de ${previousPositionTitle || 'N/A'} para ${newPositionTitle || 'N/A'}`;

    const metadata: Record<string, unknown> = {
      previousPositionId,
      previousPositionTitle,
      newPositionId,
      newPositionTitle,
      justification: justification || null,
    };
    if (previousDepartmentId || newDepartmentId) {
      metadata.previousDepartmentId = previousDepartmentId || null;
      metadata.newDepartmentId = newDepartmentId || null;
    }

    await createEvent(supabase, {
      teamMemberId,
      companyId: member.company_id,
      eventType: 'promoted',
      eventDate: effectiveDate,
      description,
      performedBy: performedBy as string,
      metadata,
    });

    return { success: true, data: updated };
  }

  // -----------------------------------------------------------------------
  // ACTION: transfer_department
  // -----------------------------------------------------------------------
  if (action === 'transfer_department') {
    const {
      newDepartmentId,
      newPositionId,
      effectiveDate,
      reason,
      performedBy,
    } = body as {
      newDepartmentId: string;
      newPositionId?: string;
      effectiveDate: string;
      reason?: string;
      performedBy: string;
    };

    if (!teamMemberId || !newDepartmentId || !effectiveDate || !performedBy) {
      return { success: false, error: 'Campos obrigatorios: teamMemberId, newDepartmentId, effectiveDate, performedBy.' };
    }

    const { member } = await fetchMember(supabase, teamMemberId);
    if (!member) return { success: false, error: 'Colaborador nao encontrado.' };

    if (member.status !== 'active') {
      return { success: false, error: 'Colaborador deve estar ativo para ser transferido.' };
    }

    // Read current department and position
    const previousDepartmentId = member.department_id;
    const previousPositionId = member.position_id;

    // Fetch department names in parallel
    const [previousDepartmentName, newDepartmentName] = await Promise.all([
      previousDepartmentId ? getDepartmentName(supabase, previousDepartmentId) : Promise.resolve(null),
      getDepartmentName(supabase, newDepartmentId),
    ]);

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      department_id: newDepartmentId,
      updated_at: new Date().toISOString(),
    };
    if (newPositionId) {
      updatePayload.position_id = newPositionId;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('team_members')
      .update(updatePayload)
      .eq('id', teamMemberId)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: 'Erro ao transferir colaborador: ' + updateErr.message };
    }

    const description = `Transferido de ${previousDepartmentName || 'N/A'} para ${newDepartmentName || 'N/A'}`;

    const metadata: Record<string, unknown> = {
      previousDepartmentId: previousDepartmentId || null,
      previousDepartmentName: previousDepartmentName || null,
      newDepartmentId,
      newDepartmentName,
      reason: reason || null,
    };
    if (previousPositionId || newPositionId) {
      metadata.previousPositionId = previousPositionId || null;
      metadata.newPositionId = newPositionId || null;
    }

    await createEvent(supabase, {
      teamMemberId,
      companyId: member.company_id,
      eventType: 'department_transferred',
      eventDate: effectiveDate,
      description,
      performedBy: performedBy as string,
      metadata,
    });

    return { success: true, data: updated };
  }

  // -----------------------------------------------------------------------
  // ACTION: change_position
  // -----------------------------------------------------------------------
  if (action === 'change_position') {
    const {
      newPositionId,
      effectiveDate,
      reason,
      performedBy,
    } = body as {
      newPositionId: string;
      effectiveDate: string;
      reason?: string;
      performedBy: string;
    };

    if (!teamMemberId || !newPositionId || !effectiveDate || !performedBy) {
      return { success: false, error: 'Campos obrigatorios: teamMemberId, newPositionId, effectiveDate, performedBy.' };
    }

    const { member } = await fetchMember(supabase, teamMemberId);
    if (!member) return { success: false, error: 'Colaborador nao encontrado.' };

    if (member.status !== 'active') {
      return { success: false, error: 'Colaborador deve estar ativo para alterar cargo.' };
    }

    // Read current position
    const previousPositionId = member.position_id;

    // Fetch position titles in parallel
    const [previousPositionTitle, newPositionTitle] = await Promise.all([
      previousPositionId ? getPositionTitle(supabase, previousPositionId) : Promise.resolve(null),
      getPositionTitle(supabase, newPositionId),
    ]);

    const { data: updated, error: updateErr } = await supabase
      .from('team_members')
      .update({
        position_id: newPositionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamMemberId)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: 'Erro ao alterar cargo: ' + updateErr.message };
    }

    const description = `Cargo alterado de ${previousPositionTitle || 'N/A'} para ${newPositionTitle || 'N/A'}`;

    await createEvent(supabase, {
      teamMemberId,
      companyId: member.company_id,
      eventType: 'position_changed',
      eventDate: effectiveDate,
      description,
      performedBy: performedBy as string,
      metadata: {
        previousPositionId,
        previousPositionTitle,
        newPositionId,
        newPositionTitle,
        reason: reason || null,
      },
    });

    return { success: true, data: updated };
  }

  // -----------------------------------------------------------------------
  // ACTION: add_note
  // -----------------------------------------------------------------------
  if (action === 'add_note') {
    const { text, visibility, performedBy } = body as {
      text: string;
      visibility: string;
      performedBy: string;
    };

    if (!teamMemberId || !text || !visibility || !performedBy) {
      return { success: false, error: 'Campos obrigatorios: teamMemberId, text, visibility, performedBy.' };
    }

    const { member } = await fetchMember(supabase, teamMemberId);
    if (!member) return { success: false, error: 'Colaborador nao encontrado.' };

    const description = text.length > 100 ? text.substring(0, 100) : text;

    const { data: event, error: eventErr } = await createEvent(supabase, {
      teamMemberId,
      companyId: member.company_id,
      eventType: 'note_added',
      eventDate: new Date().toISOString().split('T')[0],
      description,
      performedBy: performedBy as string,
      metadata: { text },
      visibility,
    });

    if (eventErr) {
      return { success: false, error: 'Erro ao adicionar nota: ' + eventErr.message };
    }

    return { success: true, data: event };
  }

  return { success: false, error: 'Acao invalida: ' + action };
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
    // BULK MODE: process multiple team members for the same action
    // -----------------------------------------------------------------------
    if (body.bulk === true && Array.isArray(body.teamMemberIds)) {
      const results: Array<{ teamMemberId: string; success: boolean; data?: unknown; error?: string; warning?: string }> = [];

      for (const memberId of body.teamMemberIds) {
        try {
          const result = await processAction(supabase, action, memberId, { ...body, teamMemberId: memberId });
          results.push({ teamMemberId: memberId, ...result });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro interno.';
          results.push({ teamMemberId: memberId, success: false, error: message });
        }
      }

      return json({ success: true, results });
    }

    // -----------------------------------------------------------------------
    // SINGLE MODE: process one team member
    // -----------------------------------------------------------------------
    const { teamMemberId } = body;

    if (!action) {
      return json({ success: false, error: 'Parametro obrigatorio: action.' }, 400);
    }

    const result = await processAction(supabase, action, teamMemberId, body);

    if (!result.success) {
      const status = result.error?.includes('nao encontrado') ? 404 : 400;
      return json(result, status);
    }

    return json(result);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return json({ success: false, error: message }, 500);
  }
});
