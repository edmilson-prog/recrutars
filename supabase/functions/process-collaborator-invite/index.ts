/**
 * Edge Function: process-collaborator-invite
 * Handles the collaborator test invitation flow.
 *
 * Actions:
 *   - get_invitation: Load invitation by token, return test + company info
 *   - verify_cpf: Verify CPF digits for pre-registered team members
 *   - identify: Identify/create user for public link invitations (legacy)
 *   - mark_started: Mark invitation as started
 *   - mark_completed: Mark invitation and team_member as completed
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
    // ACTION: get_invitation
    // -----------------------------------------------------------------------
    if (action === 'get_invitation') {
      const { token } = body;
      if (!token) return json({ error: 'Token obrigatorio.' }, 400);

      // Fetch invitation
      const { data: inv, error: invErr } = await supabase
        .from('test_invitations')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (invErr || !inv) {
        return json({ error: 'Convite nao encontrado ou invalido.' }, 404);
      }

      // Check expiration
      if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
        return json({ error: 'Este convite expirou. Solicite um novo a sua empresa.' }, 410);
      }

      // Fetch test info
      const { data: test } = await supabase
        .from('company_tests')
        .select('id, name, description, instructions, company_id')
        .eq('id', inv.test_id)
        .maybeSingle();

      // Fetch company name
      let companyName = '';
      if (test?.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', test.company_id)
          .maybeSingle();
        companyName = company?.name || '';
      }

      // Fetch departments for this company
      let departments: { id: string; name: string }[] = [];
      if (test?.company_id) {
        const { data: depts } = await supabase
          .from('departments')
          .select('id, name')
          .eq('company_id', test.company_id)
          .eq('is_active', true)
          .order('name');
        departments = depts || [];
      }

      // If team_member_id exists, fetch team member data for CPF verification
      let teamMember = null;
      if (inv.team_member_id) {
        const { data: tm } = await supabase
          .from('team_members')
          .select('id, name, cpf, email, phone')
          .eq('id', inv.team_member_id)
          .maybeSingle();
        if (tm) {
          // Mask CPF: show only first 3 digits of middle block (hide last 4 for verification)
          const cpfDigits = (tm.cpf || '').replace(/\D/g, '');
          const maskedCpf = cpfDigits.length === 11
            ? `***.${cpfDigits.slice(3, 6)}.***-**`
            : null;
          teamMember = {
            id: tm.id,
            name: tm.name,
            email: tm.email,
            maskedCpf,
            hasCpf: !!tm.cpf && cpfDigits.length === 11,
          };
        }
      }

      return json({
        invitation: inv,
        test: test ? { id: test.id, name: test.name, description: test.description, instructions: test.instructions } : null,
        companyName,
        departments,
        teamMember,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION: verify_cpf
    // -----------------------------------------------------------------------
    if (action === 'verify_cpf') {
      const { team_member_id, cpf_last3, cpf_last4 } = body;
      const cpfInput = cpf_last4 || cpf_last3; // Support both (backward compat)
      if (!team_member_id || !cpfInput) {
        return json({ error: 'Dados obrigatorios.' }, 400);
      }

      const { data: tm } = await supabase
        .from('team_members')
        .select('id, cpf, name, email, company_id')
        .eq('id', team_member_id)
        .maybeSingle();

      if (!tm || !tm.cpf) {
        return json({ error: 'Colaborador nao encontrado.' }, 404);
      }

      const cpfDigits = tm.cpf.replace(/\D/g, '');
      // Support 4-digit verification (preferred) or 3-digit (legacy)
      const expectedDigits = cpfInput.length === 4
        ? cpfDigits.slice(7, 11)  // last 4 digits
        : cpfDigits.slice(8, 11); // last 3 digits (legacy)

      if (cpfInput !== expectedDigits) {
        return json({ error: 'CPF nao confere. Verifique os digitos informados.', valid: false });
      }

      // Check if this is a collaborator-audience test (unified flow — no shadow candidate)
      const { data: activeInvite } = await supabase
        .from('test_invitations')
        .select('test_id')
        .eq('team_member_id', team_member_id)
        .in('status', ['sent', 'viewed', 'started'])
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let isCollaboratorTest = false;
      if (activeInvite?.test_id) {
        const { data: testData } = await supabase
          .from('company_tests')
          .select('target_audience')
          .eq('id', activeInvite.test_id)
          .maybeSingle();
        isCollaboratorTest = testData?.target_audience === 'collaborator';
      }

      if (isCollaboratorTest) {
        // Unified flow: CPF verified, no shadow candidate needed
        console.log('[verify_cpf] Unified flow — skipping shadow candidate for team_member:', team_member_id);
        return json({
          valid: true,
          teamMemberId: team_member_id,
          candidateId: null,
          profileId: null,
          isNewUser: false,
          tokenHash: null,
          skipAuth: true,
        });
      }

      // Legacy flow: create shadow candidate profile if needed
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('id, profile_id')
        .eq('email', tm.email)
        .maybeSingle();

      let candidateId = existingCandidate?.id || null;
      let profileId = existingCandidate?.profile_id || null;
      let isNewUser = false;
      let tokenHash = null;

      if (!existingCandidate) {
        // Create shadow auth user + candidate profile
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: tm.email,
          email_confirm: true,
          user_metadata: {
            type: 'candidate',
            name: tm.name,
            invited: true,
          },
        });

        if (authErr) {
          if (authErr.message?.includes('already been registered')) {
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const existingAuth = users?.find((u: { email?: string }) => u.email === tm.email);
            if (existingAuth) {
              profileId = existingAuth.id;
              const { data: cand } = await supabase
                .from('candidates')
                .select('id')
                .eq('profile_id', existingAuth.id)
                .maybeSingle();
              candidateId = cand?.id || null;
            }
          } else {
            return json({ error: 'Erro ao criar perfil: ' + authErr.message }, 500);
          }
        } else if (authUser?.user) {
          profileId = authUser.user.id;
          isNewUser = true;

          // Wait for trigger to create candidate row
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { data: newCand } = await supabase
            .from('candidates')
            .select('id')
            .eq('profile_id', authUser.user.id)
            .maybeSingle();
          candidateId = newCand?.id || null;

          // Set visibility to private (collaborator, not public candidate)
          if (candidateId) {
            await supabase
              .from('candidates')
              .update({ visibility_mode: 'private', visibility_locked: true })
              .eq('id', candidateId);
          }

          // Generate magic link for silent auth
          const { data: linkData } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: tm.email,
          });
          tokenHash = linkData?.properties?.hashed_token || null;
        }
      } else {
        // Existing candidate - ensure private visibility
        await supabase
          .from('candidates')
          .update({ visibility_mode: 'private', visibility_locked: true })
          .eq('id', existingCandidate.id);
      }

      // Link team_member to candidate
      if (candidateId) {
        await supabase
          .from('team_members')
          .update({ imported_from_candidate_id: candidateId })
          .eq('id', team_member_id);
      }

      return json({
        valid: true,
        candidateId,
        profileId,
        isNewUser,
        tokenHash,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION: identify (legacy - for non-team-member invitations)
    // -----------------------------------------------------------------------
    if (action === 'identify') {
      const { test_id, name, email, department_id, method } = body;
      if (!test_id || !name || !email) {
        return json({ error: 'Nome, email e test_id sao obrigatorios.' }, 400);
      }

      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('id, profile_id')
        .eq('email', email)
        .maybeSingle();

      let candidateId = existingCandidate?.id || null;
      let isNewUser = false;
      let needsLogin = false;
      let tokenHash = null;
      let invitationId = null;
      let invitationToken = null;

      if (existingCandidate) {
        needsLogin = true;
        candidateId = existingCandidate.id;
      } else {
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            type: 'candidate',
            name: name.toUpperCase(),
            invited: true,
          },
        });

        if (authErr) {
          if (authErr.message?.includes('already been registered')) {
            needsLogin = true;
          } else {
            return json({ error: 'Erro ao criar conta: ' + authErr.message }, 500);
          }
        } else if (authUser?.user) {
          isNewUser = true;
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { data: newCand } = await supabase
            .from('candidates')
            .select('id')
            .eq('profile_id', authUser.user.id)
            .maybeSingle();
          candidateId = newCand?.id || null;

          const { data: linkData } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
          });
          tokenHash = linkData?.properties?.hashed_token || null;
        }
      }

      if (candidateId || isNewUser) {
        const newToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { data: inv } = await supabase
          .from('test_invitations')
          .insert({
            test_id,
            candidate_id: candidateId,
            candidate_name: name.toUpperCase(),
            candidate_email: email,
            method: method || 'public_link',
            status: 'sent',
            token: newToken,
            sent_at: new Date().toISOString(),
            expires_at: expiresAt,
            department_id: department_id || null,
            invite_origin: 'public_link',
          })
          .select('id, token')
          .single();

        invitationId = inv?.id;
        invitationToken = inv?.token;
      }

      return json({
        candidateId,
        isNewUser,
        needsLogin,
        tokenHash,
        invitationId,
        invitationToken,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION: mark_started
    // -----------------------------------------------------------------------
    if (action === 'mark_started') {
      const { invitation_id } = body;
      if (!invitation_id) return json({ error: 'invitation_id obrigatorio.' }, 400);

      await supabase
        .from('test_invitations')
        .update({
          status: 'started',
          started_at: new Date().toISOString(),
        })
        .eq('id', invitation_id)
        .in('status', ['sent', 'viewed']);

      return json({ success: true });
    }

    // -----------------------------------------------------------------------
    // ACTION: mark_completed
    // -----------------------------------------------------------------------
    if (action === 'mark_completed') {
      const { invitation_id, team_member_id, archetype, gauge_scores, result_data } = body;
      if (!invitation_id) return json({ error: 'invitation_id obrigatorio.' }, 400);

      await supabase
        .from('test_invitations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', invitation_id);

      // Update team member if provided
      if (team_member_id) {
        const updates: Record<string, unknown> = {
          gauge_status: 'mapped',
          last_test_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (archetype) updates.archetype = archetype;
        if (gauge_scores) updates.gauge_scores = JSON.stringify(gauge_scores);

        await supabase
          .from('team_members')
          .update(updates)
          .eq('id', team_member_id);
      }

      // Persist assessment + result via service role (bypasses RLS)
      // Supports both: candidate_id (legacy) and team_member_id (unified flow PRD-088)
      const hasOwner = result_data && result_data.final_scores && (result_data.candidate_id || team_member_id);
      if (hasOwner) {
        const now = new Date().toISOString();
        const genAt = result_data.generated_at || now;

        // Build assessment row with appropriate owner
        const assessmentRow: Record<string, unknown> = {
          phase: 'completed',
          started_at: genAt,
          completed_at: now,
        };
        if (result_data.candidate_id) assessmentRow.candidate_id = result_data.candidate_id;
        if (team_member_id) assessmentRow.team_member_id = team_member_id;

        // Create assessment row
        const { data: assessmentRows, error: aErr } = await supabase
          .from('gauge_pro_assessments')
          .insert(assessmentRow)
          .select('id');

        const assessmentId = assessmentRows?.[0]?.id;
        console.log('[mark_completed] assessment insert:', { assessmentId, candidateId: result_data.candidate_id, teamMemberId: team_member_id, error: aErr?.message });

        if (assessmentId) {
          // Build result row with appropriate owner
          const resultRow: Record<string, unknown> = {
            assessment_id: assessmentId,
            final_scores: result_data.final_scores,
            part1_scores: result_data.part1_scores || null,
            part2_scores: result_data.part2_scores || null,
            archetype_id: result_data.archetype_id || null,
            primary_dimension: result_data.primary_dimension || null,
            secondary_dimension: result_data.secondary_dimension || null,
            strengths: result_data.strengths || null,
            development_areas: result_data.development_areas || null,
            career_recommendations: result_data.career_recommendations || null,
            xp_awarded: result_data.xp_awarded || 0,
            badge_awarded: result_data.badge_awarded || null,
            generated_at: genAt,
          };
          if (result_data.candidate_id) resultRow.candidate_id = result_data.candidate_id;
          if (team_member_id) resultRow.team_member_id = team_member_id;

          const { error: rErr } = await supabase
            .from('gauge_pro_results')
            .insert(resultRow);
          console.log('[mark_completed] result insert:', { assessmentId, error: rErr?.message });

          // Link assessment back to the invitation for full traceability
          const { error: linkErr } = await supabase
            .from('test_invitations')
            .update({ assessment_id: assessmentId })
            .eq('id', invitation_id);

          if (linkErr) {
            console.error('[mark_completed] failed to link assessment_id:', linkErr.message);
          } else {
            console.log('[mark_completed] linked assessment_id to invitation:', { invitation_id, assessmentId });
          }
        }
      }

      return json({ success: true, assessmentId: assessmentRows?.[0]?.id ?? null });
    }

    return json({ error: 'Acao invalida: ' + action }, 400);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return json({ error: message }, 500);
  }
});
