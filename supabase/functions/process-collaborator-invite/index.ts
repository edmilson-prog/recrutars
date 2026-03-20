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
 *
 * PRD-089: Added audit logging, viewed_at tracking, chain linking,
 *          in-app notifications, and WhatsApp opt-in notifications.
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

/** Fire-and-forget audit log. Never blocks the main flow (RNF-002). */
async function auditLog(
  supabase: ReturnType<typeof createClient>,
  params: {
    action: string;
    userId?: string | null;
    userName?: string | null;
    resourceType: string;
    resourceId: string;
    resourceName?: string | null;
    details?: string | null;
    companyId: string;
  }
): Promise<void> {
  try {
    await supabase.from('test_audit_logs').insert({
      action: params.action,
      user_id: params.userId ?? '00000000-0000-0000-0000-000000000000',
      user_name: params.userName ?? 'Sistema',
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      resource_name: params.resourceName ?? null,
      details: params.details ?? null,
      company_id: params.companyId,
    });
  } catch (err) {
    console.error('[auditLog] Failed (non-blocking):', err);
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

      // PRD-089: Track first view — set viewed_at + status if first access (RF-001)
      if (test?.company_id && inv.status === 'sent' && !inv.viewed_at) {
        await supabase
          .from('test_invitations')
          .update({ viewed_at: new Date().toISOString(), status: 'viewed' })
          .eq('id', inv.id)
          .eq('status', 'sent'); // Idempotent: only if still 'sent'

        auditLog(supabase, {
          action: 'invite_viewed',
          resourceType: 'invitation',
          resourceId: inv.id,
          resourceName: inv.candidate_name,
          details: `Primeiro acesso ao link - Teste: ${test.name}`,
          companyId: test.company_id,
        });
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
        // PRD-089: Audit CPF failure (RNF-004: never log actual CPF digits)
        if (tm.company_id) {
          auditLog(supabase, {
            action: 'cpf_failed',
            resourceType: 'team_member',
            resourceId: team_member_id,
            resourceName: tm.name,
            details: 'CPF nao confere',
            companyId: tm.company_id,
          });
        }
        return json({ error: 'CPF nao confere. Verifique os digitos informados.', valid: false });
      }

      // PRD-089: Audit CPF success (RNF-004: never log actual CPF digits)
      if (tm.company_id) {
        auditLog(supabase, {
          action: 'cpf_verified',
          resourceType: 'team_member',
          resourceId: team_member_id,
          resourceName: tm.name,
          details: 'CPF verificado com sucesso',
          companyId: tm.company_id,
        });
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

      // PRD-089: Audit test_started
      try {
        const { data: startedInv } = await supabase
          .from('test_invitations')
          .select('candidate_name, test_id')
          .eq('id', invitation_id)
          .maybeSingle();

        if (startedInv) {
          const { data: testData } = await supabase
            .from('company_tests')
            .select('company_id, name')
            .eq('id', startedInv.test_id)
            .maybeSingle();

          if (testData) {
            auditLog(supabase, {
              action: 'test_started',
              resourceType: 'assessment',
              resourceId: invitation_id,
              resourceName: startedInv.candidate_name,
              details: `Teste: ${testData.name}`,
              companyId: testData.company_id,
            });
          }
        }
      } catch (auditErr) {
        console.error('[mark_started] audit error (non-blocking):', auditErr);
      }

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
      let finalAssessmentId: string | null = null;
      const hasOwner = result_data && result_data.final_scores && (result_data.candidate_id || team_member_id);
      if (hasOwner) {
        const now = new Date().toISOString();
        const genAt = result_data.generated_at || now;

        // Build assessment row with appropriate owner + responses
        const assessmentRow: Record<string, unknown> = {
          phase: 'completed',
          started_at: genAt,
          completed_at: now,
        };
        if (result_data.candidate_id) assessmentRow.candidate_id = result_data.candidate_id;
        if (team_member_id) assessmentRow.team_member_id = team_member_id;
        // Include test responses if provided (collaborator unified flow)
        if (result_data.word_step_responses) assessmentRow.word_step_responses = result_data.word_step_responses;
        if (result_data.scenario_responses) assessmentRow.scenario_responses = result_data.scenario_responses;
        // Part timestamps for duration calculation in Respostas tab
        if (result_data.part1_started_at) assessmentRow.part1_started_at = result_data.part1_started_at;
        if (result_data.part1_completed_at) assessmentRow.part1_completed_at = result_data.part1_completed_at;
        if (result_data.part2_started_at) assessmentRow.part2_started_at = result_data.part2_started_at;
        if (result_data.part2_completed_at) assessmentRow.part2_completed_at = result_data.part2_completed_at;

        // Create assessment row
        const { data: assessmentRows, error: aErr } = await supabase
          .from('gauge_pro_assessments')
          .insert(assessmentRow)
          .select('id');

        finalAssessmentId = assessmentRows?.[0]?.id ?? null;
        console.log('[mark_completed] assessment insert:', { assessmentId: finalAssessmentId, candidateId: result_data.candidate_id, teamMemberId: team_member_id, error: aErr?.message });

        if (finalAssessmentId) {
          // Build result row with appropriate owner
          const resultRow: Record<string, unknown> = {
            assessment_id: finalAssessmentId,
            invitation_id, // PRD-089: chain linking (RF-005)
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
          console.log('[mark_completed] result insert:', { assessmentId: finalAssessmentId, error: rErr?.message });

          // Link assessment back to the invitation for full traceability
          const { error: linkErr } = await supabase
            .from('test_invitations')
            .update({ assessment_id: finalAssessmentId })
            .eq('id', invitation_id);

          if (linkErr) {
            console.error('[mark_completed] failed to link assessment_id:', linkErr.message);
          } else {
            console.log('[mark_completed] linked assessment_id to invitation:', { invitation_id, assessmentId: finalAssessmentId });
          }
        }
      }

      // PRD-089: Audit, notifications, WhatsApp (all fire-and-forget)
      try {
        const { data: completedInv } = await supabase
          .from('test_invitations')
          .select('candidate_name, test_id')
          .eq('id', invitation_id)
          .maybeSingle();

        if (completedInv) {
          const { data: testInfo } = await supabase
            .from('company_tests')
            .select('company_id, name')
            .eq('id', completedInv.test_id)
            .maybeSingle();

          if (testInfo) {
            const archetypeName = archetype || result_data?.archetype_id || 'N/A';
            const memberName = completedInv.candidate_name;

            // Audit: test_completed (RF-017)
            auditLog(supabase, {
              action: 'test_completed',
              resourceType: 'assessment',
              resourceId: finalAssessmentId || invitation_id,
              resourceName: memberName,
              details: `Teste: ${testInfo.name}, Arquetipo: ${archetypeName}`,
              companyId: testInfo.company_id,
            });

            // In-app notification for company admins (RF-022)
            try {
              const { data: companyAdmins } = await supabase
                .from('company_users')
                .select('profile_id')
                .eq('company_id', testInfo.company_id)
                .eq('role', 'admin');

              const { data: companyOwner } = await supabase
                .from('companies')
                .select('profile_id')
                .eq('id', testInfo.company_id)
                .maybeSingle();

              const adminIds = new Set<string>();
              (companyAdmins ?? []).forEach(a => adminIds.add(a.profile_id));
              if (companyOwner?.profile_id) adminIds.add(companyOwner.profile_id);

              const memberId = team_member_id || '';
              for (const adminId of adminIds) {
                await supabase.from('notifications').insert({
                  user_id: adminId,
                  type: 'test_request',
                  title: `${memberName} concluiu o teste`,
                  description: `${memberName} concluiu ${testInfo.name} — Arquetipo: ${archetypeName}`,
                  action_url: memberId ? `/empresa/equipes/membro/${memberId}` : '/empresa/testes',
                  metadata: { teamMemberId: memberId, testName: testInfo.name, archetype: archetypeName, event: 'test_completed' },
                  read: false,
                });
              }
              console.log('[mark_completed] notifications sent to', adminIds.size, 'admins');
            } catch (notifErr) {
              console.error('[mark_completed] notification error (non-blocking):', notifErr);
            }

            // WhatsApp notification — opt-in (RF-023)
            try {
              const { data: settings } = await supabase
                .from('system_settings')
                .select('values')
                .eq('panel', 'admin')
                .eq('category', 'integrations')
                .is('entity_id', null)
                .maybeSingle();

              const evolution = (settings?.values as Record<string, unknown>)?.evolution as Record<string, unknown> | undefined;
              const whatsappEnabled = evolution?.evolutionEnabled === true;
              const instanceName = evolution?.evolutionInstance as string | undefined;
              const apiUrl = evolution?.evolutionApiUrl as string | undefined;
              const apiKey = evolution?.evolutionApiKey as string | undefined;

              if (whatsappEnabled && instanceName && apiUrl && apiKey) {
                const { data: companyOwnerProfile } = await supabase
                  .from('companies')
                  .select('profile_id')
                  .eq('id', testInfo.company_id)
                  .maybeSingle();

                if (companyOwnerProfile?.profile_id) {
                  const { data: ownerProfile } = await supabase
                    .from('profiles')
                    .select('phone')
                    .eq('id', companyOwnerProfile.profile_id)
                    .maybeSingle();

                  if (ownerProfile?.phone) {
                    const phone = ownerProfile.phone.replace(/\D/g, '');
                    const normalizedPhone = phone.length <= 11 ? `55${phone}` : phone;
                    const text = `[RecrutaRS] ${memberName} concluiu o teste "${testInfo.name}" — Arquetipo: ${archetypeName}. Acesse a plataforma para ver o resultado completo.`;

                    await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', apikey: apiKey },
                      body: JSON.stringify({ number: normalizedPhone, text }),
                    });
                    console.log('[mark_completed] WhatsApp sent to owner');
                  }
                }
              }
            } catch (whatsappErr) {
              console.error('[mark_completed] WhatsApp error (non-blocking):', whatsappErr);
            }
          }
        }
      } catch (postErr) {
        console.error('[mark_completed] post-completion tasks error (non-blocking):', postErr);
      }

      return json({ success: true, assessmentId: finalAssessmentId });
    }

    return json({ error: 'Acao invalida: ' + action }, 400);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return json({ error: message }, 500);
  }
});
