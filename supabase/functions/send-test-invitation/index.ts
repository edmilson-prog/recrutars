/**
 * Edge Function: send-test-invitation
 * Handles batch sending, resending, and cancelling test invitations.
 *
 * PRD-089: Added credit consumption on send, credit refund on cancel,
 *          and enhanced audit logging.
 * FIX: Added WhatsApp delivery via Evolution API when channel === 'whatsapp'.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    await supabase.from("test_audit_logs").insert({
      action: params.action,
      user_id: params.userId ?? "00000000-0000-0000-0000-000000000000",
      user_name: params.userName ?? "Sistema",
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      resource_name: params.resourceName ?? null,
      details: params.details ?? null,
      company_id: params.companyId,
    });
  } catch (err) {
    console.error("[auditLog] Failed (non-blocking):", err);
  }
}

// ---------------------------------------------------------------------------
// WhatsApp via Evolution API
// ---------------------------------------------------------------------------

interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

/** Normalize phone to include country code 55 for Brazil. */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 11) return "55" + digits;
  return digits;
}

/** Fetch Evolution API credentials from system_settings. */
async function getEvolutionConfig(
  supabase: ReturnType<typeof createClient>,
): Promise<EvolutionConfig | null> {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("values")
      .eq("panel", "admin")
      .eq("category", "integrations")
      .is("entity_id", null)
      .maybeSingle();

    if (error || !data) return null;

    const values = data.values as Record<string, Record<string, unknown>>;
    const evolution = values?.evolution;
    if (!evolution) return null;

    const enabled = evolution.evolutionEnabled as boolean;
    const apiUrl = evolution.evolutionApiUrl as string;
    const apiKey = evolution.evolutionApiKey as string;
    const instanceName = evolution.evolutionInstanceName as string;

    if (!enabled || !apiUrl || !apiKey || !instanceName) return null;

    return {
      apiUrl: apiUrl.replace(/\/+$/, ""),
      apiKey,
      instanceName,
    };
  } catch {
    console.error("[send-test-invitation] Failed to load Evolution config");
    return null;
  }
}

/** Send a WhatsApp text message via Evolution API. */
async function sendWhatsAppMessage(
  config: EvolutionConfig,
  phone: string,
  text: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `${config.apiUrl}/message/sendText/${config.instanceName}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.apiKey,
      },
      body: JSON.stringify({
        number: normalizePhone(phone),
        text,
        delay: 1000,
        linkPreview: true,
      }),
    });

    const responseText = await res.text();
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(responseText);
    } catch {
      throw new Error(`Non-JSON response: ${responseText.slice(0, 200)}`);
    }

    if (!res.ok) {
      throw new Error(
        `Evolution API error (${res.status}): ${json?.message || json?.error || responseText.slice(0, 200)}`,
      );
    }

    // Extract message ID
    let messageId: string | null = null;
    const keyObj = json?.key;
    if (keyObj && typeof keyObj === "object") {
      messageId = (keyObj as Record<string, unknown>).id as string || null;
    }
    if (!messageId && typeof json?.messageId === "string") {
      messageId = json.messageId as string;
    }

    return { success: true, messageId: messageId ?? undefined };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[send-test-invitation] WhatsApp send failed for ${phone}: ${errMsg}`);
    return { success: false, error: errMsg };
  }
}

/** Record a WhatsApp message in the whatsapp_messages table. */
async function recordWhatsAppMessage(
  supabase: ReturnType<typeof createClient>,
  params: {
    phone: string;
    text: string;
    recipientId?: string;
    recipientName?: string;
    sentBy?: string;
    status: "sent" | "failed";
    whatsappMessageId?: string;
    errorMessage?: string;
  },
): Promise<void> {
  try {
    await supabase.from("whatsapp_messages").insert({
      recipient_phone: params.phone,
      recipient_name: params.recipientName || null,
      recipient_type: "candidate",
      recipient_id: params.recipientId || null,
      message_text: params.text,
      sent_by: params.sentBy || null,
      status: params.status,
      whatsapp_message_id: params.whatsappMessageId || null,
      error_message: params.errorMessage || null,
      sent_at: params.status === "sent" ? new Date().toISOString() : null,
    });
  } catch (err) {
    console.error("[send-test-invitation] Failed to record WhatsApp message:", err);
  }
}

/** Random delay to avoid Evolution API rate limiting. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Extract caller from Authorization header
    const authHeader = req.headers.get("Authorization");
    let callerId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data: { user } } = await anonClient.auth.getUser(token);
      callerId = user?.id ?? null;
    }

    const body = await req.json();
    const { action } = body;

    // Extract origin for building invitation links
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "";

    switch (action) {
      case "send_invitations": {
        const { test_id, invitations, channel } = body;
        if (!test_id || !invitations?.length) {
          return jsonResponse({ error: "test_id and invitations are required" }, 400);
        }

        // Verify test exists and caller has access
        const { data: test, error: testError } = await adminClient
          .from("company_tests")
          .select("id, company_id, name")
          .eq("id", test_id)
          .single();

        if (testError || !test) {
          return jsonResponse({ error: "Test not found" }, 404);
        }

        // Verify caller belongs to the company
        if (callerId) {
          const { data: membership } = await adminClient
            .from("company_users")
            .select("id")
            .eq("company_id", test.company_id)
            .eq("profile_id", callerId)
            .single();

          if (!membership) {
            const { data: company } = await adminClient
              .from("companies")
              .select("id")
              .eq("id", test.company_id)
              .eq("profile_id", callerId)
              .single();

            if (!company) {
              const { data: profile } = await adminClient
                .from("profiles")
                .select("user_type")
                .eq("id", callerId)
                .single();

              if (profile?.user_type !== "admin") {
                return jsonResponse({ error: "Unauthorized" }, 403);
              }
            }
          }
        }

        // PRD-089: Check credit balance before sending (RF-013)
        const invitationCount = invitations.length;
        const { data: balance } = await adminClient.rpc("get_company_credit_balance", {
          p_company_id: test.company_id,
        });

        if ((balance ?? 0) < invitationCount) {
          return jsonResponse({
            error: `Creditos insuficientes. Disponivel: ${balance ?? 0}, Necessario: ${invitationCount}`,
            insufficientCredits: true,
            available: balance ?? 0,
            required: invitationCount,
          }, 400);
        }

        // Create invitations
        // PRD-088: Added teamMemberId support for collaborator tests
        const rows = invitations.map((inv: { candidateId?: string; teamMemberId?: string; candidateName: string; candidateEmail: string; method: string; expiresInDays?: number }) => {
          const expiresInDays = inv.expiresInDays ?? 30;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + expiresInDays);

          // PRD-081: Determine invite_origin from method
          let inviteOrigin: string | null = null;
          if (inv.method === "public_link") inviteOrigin = "invite_link";
          else if (inv.method === "email") inviteOrigin = "invite_email";
          else if (inv.method === "internal") inviteOrigin = "invite_base";

          return {
            test_id,
            candidate_id: inv.candidateId ?? null,
            team_member_id: inv.teamMemberId ?? null,
            candidate_name: inv.candidateName,
            candidate_email: inv.candidateEmail,
            method: inv.method || "email",
            status: "sent",
            expires_at: expiresAt.toISOString(),
            sent_by: callerId,
            invite_origin: inviteOrigin,
          };
        });

        const { data: created, error: insertError } = await adminClient
          .from("test_invitations")
          .insert(rows)
          .select();

        if (insertError) {
          return jsonResponse({ error: insertError.message }, 500);
        }

        // Fetch caller name for audit logs
        let callerName = "Usuario";
        if (callerId) {
          const { data: callerProfile } = await adminClient
            .from("profiles")
            .select("full_name")
            .eq("id", callerId)
            .single();
          callerName = callerProfile?.full_name ?? "Usuario";
        }

        // Audit + Credit consumption for each invitation (RF-012, RF-016)
        for (const inv of created ?? []) {
          const memberName = inv.candidate_name || "Colaborador";

          // Audit: invite_sent
          if (callerId) {
            auditLog(adminClient, {
              action: "invite_sent",
              userId: callerId,
              userName: callerName,
              resourceType: "invitation",
              resourceId: inv.id,
              resourceName: memberName,
              details: `Teste: ${test.name}`,
              companyId: test.company_id,
            });
          }

          // PRD-089: Consume credit (RF-012)
          try {
            await adminClient.rpc("consume_test_credit", {
              p_company_id: test.company_id,
              p_invitation_id: inv.id,
              p_description: `Teste "${test.name}" - ${memberName}`,
              p_created_by: callerId,
            });

            // Audit: credit_consumed
            if (callerId) {
              auditLog(adminClient, {
                action: "credit_consumed",
                userId: callerId,
                userName: callerName,
                resourceType: "credit_transaction",
                resourceId: inv.id,
                resourceName: memberName,
                details: `1 credito consumido - Teste: ${test.name}`,
                companyId: test.company_id,
              });
            }
          } catch (creditErr) {
            console.error("[send_invitations] credit consume error (non-blocking):", creditErr);
          }
        }

        // WhatsApp delivery (when channel === 'whatsapp')
        let whatsappResults: { sent: number; failed: number; errors: string[] } | undefined;

        if (channel === "whatsapp" && origin) {
          const evolutionConfig = await getEvolutionConfig(adminClient);

          if (!evolutionConfig) {
            console.error("[send_invitations] WhatsApp channel requested but Evolution API not configured");
            whatsappResults = {
              sent: 0,
              failed: (created ?? []).length,
              errors: ["WhatsApp nao configurado. Verifique Configuracoes > Integracoes."],
            };
          } else {
            whatsappResults = { sent: 0, failed: 0, errors: [] };

            for (const inv of created ?? []) {
              // Look up phone from team_members table
              let phone: string | null = null;
              if (inv.team_member_id) {
                const { data: member } = await adminClient
                  .from("team_members")
                  .select("phone")
                  .eq("id", inv.team_member_id)
                  .single();
                phone = member?.phone ?? null;
              }

              if (!phone) {
                console.warn(`[send_invitations] No phone for member ${inv.team_member_id}, skipping WhatsApp`);
                whatsappResults.failed++;
                whatsappResults.errors.push(`${inv.candidate_name}: telefone nao cadastrado`);
                continue;
              }

              const link = `${origin}/convite/teste/${inv.token}`;
              const messageText = `Ola ${inv.candidate_name}! Voce foi convidado(a) para realizar o teste comportamental Gauge-Pro pela empresa. Acesse o link para iniciar: ${link}\n\nEste link expira em 24 horas.`;

              const result = await sendWhatsAppMessage(evolutionConfig, phone, messageText);

              // Record in whatsapp_messages
              await recordWhatsAppMessage(adminClient, {
                phone,
                text: messageText,
                recipientId: inv.team_member_id ?? undefined,
                recipientName: inv.candidate_name ?? undefined,
                sentBy: callerId ?? undefined,
                status: result.success ? "sent" : "failed",
                whatsappMessageId: result.messageId,
                errorMessage: result.error,
              });

              if (result.success) {
                whatsappResults.sent++;
              } else {
                whatsappResults.failed++;
                whatsappResults.errors.push(`${inv.candidate_name}: ${result.error}`);
              }

              // Delay between sends to avoid rate limiting
              if ((created ?? []).indexOf(inv) < (created ?? []).length - 1) {
                await delay(1500);
              }
            }

            console.log(`[send_invitations] WhatsApp results: sent=${whatsappResults.sent}, failed=${whatsappResults.failed}`);
          }
        }

        return jsonResponse({ invitations: created, whatsappResults });
      }

      case "resend": {
        const { invitation_id } = body;
        if (!invitation_id) {
          return jsonResponse({ error: "invitation_id is required" }, 400);
        }

        const { data: updated, error: updateError } = await adminClient
          .from("test_invitations")
          .update({
            sent_at: new Date().toISOString(),
            status: "sent",
            viewed_at: null,
            started_at: null,
          })
          .eq("id", invitation_id)
          .select()
          .single();

        if (updateError) {
          return jsonResponse({ error: updateError.message }, 500);
        }

        if (callerId && updated) {
          const { data: test } = await adminClient
            .from("company_tests")
            .select("company_id, name")
            .eq("id", updated.test_id)
            .single();

          const { data: callerProfile } = await adminClient
            .from("profiles")
            .select("full_name")
            .eq("id", callerId)
            .single();

          if (test) {
            auditLog(adminClient, {
              action: "invite_resent",
              userId: callerId,
              userName: callerProfile?.full_name ?? "Usuario",
              resourceType: "invitation",
              resourceId: invitation_id,
              resourceName: updated.candidate_name,
              details: `Reenvio - Teste: ${test.name}`,
              companyId: test.company_id,
            });
          }
        }

        return jsonResponse({ invitation: updated });
      }

      case "cancel": {
        const { invitation_id } = body;
        if (!invitation_id) {
          return jsonResponse({ error: "invitation_id is required" }, 400);
        }

        // PRD-089: Read invitation BEFORE update to know original status (RF-014)
        const { data: inv } = await adminClient
          .from("test_invitations")
          .select("candidate_name, test_id, status")
          .eq("id", invitation_id)
          .single();

        const originalStatus = inv?.status;

        // Update status to cancelled
        const { error: cancelError } = await adminClient
          .from("test_invitations")
          .update({ status: "cancelled" })
          .eq("id", invitation_id);

        if (cancelError) {
          return jsonResponse({ error: cancelError.message }, 500);
        }

        if (inv) {
          const { data: test } = await adminClient
            .from("company_tests")
            .select("company_id, name")
            .eq("id", inv.test_id)
            .single();

          let callerName = "Usuario";
          if (callerId) {
            const { data: callerProfile } = await adminClient
              .from("profiles")
              .select("full_name")
              .eq("id", callerId)
              .single();
            callerName = callerProfile?.full_name ?? "Usuario";
          }

          if (test) {
            // Audit: invite_cancelled
            if (callerId) {
              auditLog(adminClient, {
                action: "invite_cancelled",
                userId: callerId,
                userName: callerName,
                resourceType: "invitation",
                resourceId: invitation_id,
                resourceName: inv.candidate_name,
                details: `Teste: ${test.name}`,
                companyId: test.company_id,
              });
            }

            // PRD-089: Refund credit if invitation was not yet started (RF-014)
            if (originalStatus && ["sent", "viewed"].includes(originalStatus)) {
              try {
                await adminClient.rpc("refund_test_credit", {
                  p_company_id: test.company_id,
                  p_invitation_id: invitation_id,
                  p_description: `Cancelamento - ${inv.candidate_name}`,
                });

                // Audit: credit_refunded
                if (callerId) {
                  auditLog(adminClient, {
                    action: "credit_refunded",
                    userId: callerId,
                    userName: callerName,
                    resourceType: "credit_transaction",
                    resourceId: invitation_id,
                    resourceName: inv.candidate_name,
                    details: `Credito estornado - Convite cancelado`,
                    companyId: test.company_id,
                  });
                }

                console.log("[cancel] credit refunded for invitation:", invitation_id);
              } catch (refundErr) {
                console.error("[cancel] refund error (non-blocking):", refundErr);
              }
            }
          }
        }

        return jsonResponse({ success: true });
      }

      case "extend_deadline": {
        const { invitation_id, new_expires_at } = body;
        if (!invitation_id || !new_expires_at) {
          return jsonResponse({ error: "invitation_id and new_expires_at are required" }, 400);
        }

        const { data: inv, error: fetchErr } = await adminClient
          .from("test_invitations")
          .select("id, candidate_name, test_id, status")
          .eq("id", invitation_id)
          .single();

        if (fetchErr || !inv) {
          return jsonResponse({ error: "Invitation not found" }, 404);
        }

        if (["completed", "cancelled", "abandoned"].includes(inv.status)) {
          return jsonResponse({ error: `Cannot extend deadline for invitation with status '${inv.status}'` }, 400);
        }

        if (new Date(new_expires_at) <= new Date()) {
          return jsonResponse({ error: "new_expires_at must be in the future" }, 400);
        }

        const { data: extUpdated, error: extError } = await adminClient
          .from("test_invitations")
          .update({ expires_at: new_expires_at })
          .eq("id", invitation_id)
          .select()
          .single();

        if (extError) {
          return jsonResponse({ error: extError.message }, 500);
        }

        if (callerId) {
          const { data: test } = await adminClient
            .from("company_tests")
            .select("company_id, name")
            .eq("id", inv.test_id)
            .single();

          const { data: callerProfile } = await adminClient
            .from("profiles")
            .select("full_name")
            .eq("id", callerId)
            .single();

          if (test) {
            auditLog(adminClient, {
              action: "invite_extended",
              userId: callerId,
              userName: callerProfile?.full_name ?? "Usuario",
              resourceType: "invitation",
              resourceId: invitation_id,
              resourceName: inv.candidate_name,
              details: `Prazo estendido até ${new_expires_at} - Teste: ${test.name}`,
              companyId: test.company_id,
            });
          }
        }

        return jsonResponse({ invitation: extUpdated });
      }

      case "update_recipient": {
        const { invitation_id, candidate_name: newName, candidate_email: newEmail } = body;
        if (!invitation_id) {
          return jsonResponse({ error: "invitation_id is required" }, 400);
        }
        if (!newName && !newEmail) {
          return jsonResponse({ error: "At least candidate_name or candidate_email is required" }, 400);
        }

        const { data: inv, error: fetchErr } = await adminClient
          .from("test_invitations")
          .select("id, candidate_name, candidate_email, test_id, status")
          .eq("id", invitation_id)
          .single();

        if (fetchErr || !inv) {
          return jsonResponse({ error: "Invitation not found" }, 404);
        }

        if (!["sent", "viewed"].includes(inv.status)) {
          return jsonResponse({ error: `Cannot update recipient for invitation with status '${inv.status}'. Only 'sent' or 'viewed' invitations can be edited.` }, 400);
        }

        const updates: Record<string, string> = {};
        if (newName) updates.candidate_name = newName;
        if (newEmail) updates.candidate_email = newEmail;

        const { data: recUpdated, error: recError } = await adminClient
          .from("test_invitations")
          .update(updates)
          .eq("id", invitation_id)
          .select()
          .single();

        if (recError) {
          return jsonResponse({ error: recError.message }, 500);
        }

        if (callerId) {
          const { data: test } = await adminClient
            .from("company_tests")
            .select("company_id, name")
            .eq("id", inv.test_id)
            .single();

          const { data: callerProfile } = await adminClient
            .from("profiles")
            .select("full_name")
            .eq("id", callerId)
            .single();

          if (test) {
            const changes: string[] = [];
            if (newName && newName !== inv.candidate_name) changes.push(`Nome: ${inv.candidate_name} → ${newName}`);
            if (newEmail && newEmail !== inv.candidate_email) changes.push(`Email: ${inv.candidate_email} → ${newEmail}`);

            auditLog(adminClient, {
              action: "invite_updated",
              userId: callerId,
              userName: callerProfile?.full_name ?? "Usuario",
              resourceType: "invitation",
              resourceId: invitation_id,
              resourceName: newName ?? inv.candidate_name,
              details: `${changes.join('; ')} - Teste: ${test.name}`,
              companyId: test.company_id,
            });
          }
        }

        return jsonResponse({ invitation: recUpdated });
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return jsonResponse({ error: message }, 500);
  }
});
