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

    switch (action) {
      case "send_invitations": {
        const { test_id, invitations } = body;
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

        // Audit log
        if (callerId) {
          const { data: callerProfile } = await adminClient
            .from("profiles")
            .select("full_name")
            .eq("id", callerId)
            .single();

          for (const inv of created ?? []) {
            await adminClient.from("test_audit_logs").insert({
              action: "invite_sent",
              user_id: callerId,
              user_name: callerProfile?.full_name ?? "Usuario",
              resource_type: "invitation",
              resource_id: inv.id,
              resource_name: inv.candidate_name,
              details: `Teste: ${test.name}`,
              company_id: test.company_id,
            });
          }
        }

        return jsonResponse({ invitations: created });
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
            await adminClient.from("test_audit_logs").insert({
              action: "invite_resent",
              user_id: callerId,
              user_name: callerProfile?.full_name ?? "Usuario",
              resource_type: "invitation",
              resource_id: invitation_id,
              resource_name: updated.candidate_name,
              details: `Reenvio - Teste: ${test.name}`,
              company_id: test.company_id,
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

        const { error: cancelError } = await adminClient
          .from("test_invitations")
          .update({ status: "expired" })
          .eq("id", invitation_id);

        if (cancelError) {
          return jsonResponse({ error: cancelError.message }, 500);
        }

        if (callerId) {
          const { data: inv } = await adminClient
            .from("test_invitations")
            .select("candidate_name, test_id")
            .eq("id", invitation_id)
            .single();

          if (inv) {
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
              await adminClient.from("test_audit_logs").insert({
                action: "invite_cancelled",
                user_id: callerId,
                user_name: callerProfile?.full_name ?? "Usuario",
                resource_type: "invitation",
                resource_id: invitation_id,
                resource_name: inv.candidate_name,
                details: `Teste: ${test.name}`,
                company_id: test.company_id,
              });
            }
          }
        }

        return jsonResponse({ success: true });
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return jsonResponse({ error: message }, 500);
  }
});
