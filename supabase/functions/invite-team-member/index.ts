import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Emails são armazenados em lowercase (o GoTrue normaliza no signup e a coluna é
// `text` case-sensitive). Normalizar a entrada evita lookups que erram o case e
// retornam "sucesso" sem vincular.
function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = any;

/**
 * Verifica se um profile pré-existente PODE ser vinculado como membro de uma empresa.
 * Retorna uma mensagem de erro se não puder, ou null se estiver elegível.
 *
 * - type != 'company': o AuthContext só carrega empresa para profiles company, então
 *   vincular candidato/admin criaria um estado inacessível.
 * - é DONO de uma empresa: o login resolve "owner-first" (companies.profile_id), então
 *   ele jamais carregaria a empresa que o convidou — ficaria preso na própria. Até
 *   existir suporte multi-empresa, bloqueamos com mensagem clara.
 */
async function checkMemberEligibility(
  supabase: SupabaseClient,
  profile: { id: string; type: string },
): Promise<string | null> {
  if (profile.type !== "company") {
    return "Este email pertence a uma conta que nao e do tipo empresa e nao pode ser adicionada como membro de equipe.";
  }

  const { data: ownsCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (ownsCompany) {
    return "Este email pertence ao proprietario de uma empresa e nao pode ser adicionado como membro de outra empresa.";
  }

  return null;
}

/**
 * Vincula um usuario que JA possui conta (profiles existente) a uma empresa.
 *
 * Motivo: o vinculo padrao de membro depende do trigger handle_new_user, que so
 * dispara na CRIACAO de um auth.users (via inviteUserByEmail). Quando o convidado
 * ja tem conta, inviteUserByEmail falha com "already registered", o trigger nao roda
 * e o usuario nunca entra em company_users. Aqui criamos o vinculo diretamente.
 *
 * Pré-condição: chamar checkMemberEligibility antes (o caller já validou type/dono).
 */
async function linkExistingMember(
  supabase: SupabaseClient,
  companyId: string,
  profile: { id: string; type: string },
  email: string,
  role: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  // Defesa em profundidade (o caller deve ter validado antes de criar o convite).
  const ineligible = await checkMemberEligibility(supabase, profile);
  if (ineligible) {
    return { status: 400, body: { error: ineligible } };
  }

  // Idempotente: clique duplo / concorrência não geram erro de chave duplicada.
  const { error: linkError } = await supabase
    .from("company_users")
    .upsert(
      { company_id: companyId, profile_id: profile.id, role },
      { onConflict: "company_id,profile_id", ignoreDuplicates: true },
    );

  if (linkError) {
    return { status: 500, body: { error: `Falha ao vincular membro: ${linkError.message}` } };
  }

  // Marca o convite como aceito DEPOIS do vínculo confirmado. O erro é registrado
  // mas não derruba a operação: o que dá acesso é a linha em company_users; um
  // convite preso em "pending" é recuperável, um accepted-sem-vínculo não.
  const { error: acceptError } = await supabase
    .from("company_invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("company_id", companyId)
    .eq("email", email)
    .eq("status", "pending");

  if (acceptError) {
    console.error("linkExistingMember: falha ao marcar convite como accepted:", acceptError.message);
  }

  return {
    status: 200,
    body: {
      success: true,
      message:
        "Este email ja possui conta na plataforma e foi vinculado a equipe. O usuario ja pode acessar a empresa ao fazer login.",
      note: "linked_existing_user",
    },
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract and verify JWT manually (verify_jwt is disabled)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Authorization header required", 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !caller) {
      return errorResponse("Invalid token", 401);
    }

    // Get caller's company_id and role
    const { data: companyRow } = await supabase
      .from("company_users")
      .select("company_id, role")
      .eq("profile_id", caller.id)
      .single();

    if (!companyRow) {
      // Caso tipico: admin do sistema executando durante impersonacao (o JWT e do
      // admin real, que nao pertence a nenhuma empresa). Mensagem explicita ajuda
      // a distinguir de uma falha de permissao real.
      return errorResponse(
        "Esta acao precisa ser feita pela conta da propria empresa. Se voce e um administrador visualizando como empresa (impersonacao), a operacao e somente leitura.",
        403,
      );
    }

    const callerCompanyId = companyRow.company_id;
    const callerRole = companyRow.role;

    // Parse request body
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "invite": {
        if (callerRole !== "admin") {
          return errorResponse("Only admins can invite members", 403);
        }

        const email = normalizeEmail(body.email);
        const { role = "member", redirect_url } = body;
        if (!email || !email.includes("@")) {
          return errorResponse("Valid email is required");
        }
        if (!["admin", "member"].includes(role)) {
          return errorResponse("Role must be 'admin' or 'member'");
        }

        // Profile já existente?
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, type")
          .eq("email", email)
          .maybeSingle();

        if (existingProfile) {
          const { data: existingMember } = await supabase
            .from("company_users")
            .select("id")
            .eq("company_id", callerCompanyId)
            .eq("profile_id", existingProfile.id)
            .maybeSingle();

          if (existingMember) {
            return errorResponse("Este usuario ja e membro desta empresa");
          }

          // Valida elegibilidade ANTES de criar/reativar o convite — assim um
          // candidato/dono não deixa um convite "pending" órfão para trás.
          const ineligible = await checkMemberEligibility(supabase, existingProfile);
          if (ineligible) {
            return errorResponse(ineligible);
          }
        }

        // Check if invite already exists
        const { data: existingInvite } = await supabase
          .from("company_invites")
          .select("id, status")
          .eq("company_id", callerCompanyId)
          .eq("email", email)
          .maybeSingle();

        if (existingInvite && existingInvite.status === "pending" && !existingProfile) {
          return errorResponse("Ja existe um convite pendente para este email");
        }

        // Create or re-activate invite record
        if (existingInvite) {
          await supabase
            .from("company_invites")
            .update({ status: "pending", role, invited_by: caller.id, created_at: new Date().toISOString(), accepted_at: null })
            .eq("id", existingInvite.id);
        } else {
          const { error: insertError } = await supabase
            .from("company_invites")
            .insert({
              company_id: callerCompanyId,
              email,
              role,
              invited_by: caller.id,
            });
          if (insertError) {
            return errorResponse(`Falha ao criar convite: ${insertError.message}`, 500);
          }
        }

        // ── Usuario JA existe (e elegível): vincular diretamente ──
        if (existingProfile) {
          const result = await linkExistingMember(supabase, callerCompanyId, existingProfile, email, role);
          return jsonResponse(result.body, result.status);
        }

        // ── Usuario novo: enviar convite por email (link de ativacao) ──
        const inviteOptions: Record<string, unknown> = {
          data: {
            type: "company",
            name: email.split("@")[0],
            invited_company_id: callerCompanyId,
            invited_role: role,
          },
        };
        if (redirect_url) {
          inviteOptions.redirectTo = redirect_url;
        }

        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, inviteOptions);

        if (inviteError) {
          // Corrida: usuario passou a existir entre a verificacao e o convite.
          if (inviteError.message?.includes("already")) {
            const { data: nowProfile } = await supabase
              .from("profiles")
              .select("id, type")
              .eq("email", email)
              .maybeSingle();
            if (nowProfile) {
              const result = await linkExistingMember(supabase, callerCompanyId, nowProfile, email, role);
              return jsonResponse(result.body, result.status);
            }
            return jsonResponse({
              success: true,
              message: `Convite criado para ${email}.`,
              note: "user_already_exists",
            });
          }
          return errorResponse(`Falha ao enviar convite: ${inviteError.message}`, 500);
        }

        const { data: companyData } = await supabase
          .from("companies")
          .select("name")
          .eq("id", callerCompanyId)
          .single();

        const companyName = companyData?.name || "Empresa";

        return jsonResponse({
          success: true,
          message: `Convite enviado para ${email} para a empresa ${companyName}`,
        });
      }

      case "resend": {
        if (callerRole !== "admin") {
          return errorResponse("Only admins can resend invites", 403);
        }

        const { invite_id, redirect_url } = body;
        if (!invite_id) {
          return errorResponse("invite_id is required");
        }

        // Get invite
        const { data: invite } = await supabase
          .from("company_invites")
          .select("*")
          .eq("id", invite_id)
          .eq("company_id", callerCompanyId)
          .eq("status", "pending")
          .single();

        if (!invite) {
          return errorResponse("Convite nao encontrado ou nao esta pendente");
        }

        const inviteEmail = normalizeEmail(invite.email);

        // ── Usuario JA existe: vincular diretamente em vez de reenviar link ──
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, type")
          .eq("email", inviteEmail)
          .maybeSingle();

        if (existingProfile) {
          const result = await linkExistingMember(supabase, callerCompanyId, existingProfile, inviteEmail, invite.role);
          return jsonResponse(result.body, result.status);
        }

        // ── Usuario novo: reenviar link de ativacao ──
        const resendOptions: Record<string, unknown> = {
          data: {
            type: "company",
            name: inviteEmail.split("@")[0],
            invited_company_id: callerCompanyId,
            invited_role: invite.role,
          },
        };
        if (redirect_url) {
          resendOptions.redirectTo = redirect_url;
        }

        const { error: resendError } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, resendOptions);

        if (resendError) {
          if (resendError.message?.includes("already")) {
            const { data: nowProfile } = await supabase
              .from("profiles")
              .select("id, type")
              .eq("email", inviteEmail)
              .maybeSingle();
            if (nowProfile) {
              const result = await linkExistingMember(supabase, callerCompanyId, nowProfile, inviteEmail, invite.role);
              return jsonResponse(result.body, result.status);
            }
            return jsonResponse({
              success: true,
              message: "O usuario ja possui conta. Peca para fazer login.",
              note: "user_already_exists",
            });
          }
          return errorResponse(`Falha ao reenviar: ${resendError.message}`, 500);
        }

        // Update created_at to track resend
        await supabase
          .from("company_invites")
          .update({ created_at: new Date().toISOString() })
          .eq("id", invite_id);

        return jsonResponse({ success: true, message: "Convite reenviado" });
      }

      case "cancel": {
        if (callerRole !== "admin") {
          return errorResponse("Only admins can cancel invites", 403);
        }

        const { invite_id: cancelId } = body;
        if (!cancelId) {
          return errorResponse("invite_id is required");
        }

        const { error: cancelError } = await supabase
          .from("company_invites")
          .update({ status: "cancelled" })
          .eq("id", cancelId)
          .eq("company_id", callerCompanyId)
          .eq("status", "pending");

        if (cancelError) {
          return errorResponse(`Falha ao cancelar: ${cancelError.message}`, 500);
        }

        return jsonResponse({ success: true, message: "Convite cancelado" });
      }

      case "remove_member": {
        if (callerRole !== "admin") {
          return errorResponse("Only admins can remove members", 403);
        }

        const { profile_id } = body;
        if (!profile_id) {
          return errorResponse("profile_id is required");
        }

        if (profile_id === caller.id) {
          return errorResponse("Voce nao pode remover a si mesmo");
        }

        // Check if the target is the company owner
        const { data: isOwner } = await supabase
          .from("companies")
          .select("id")
          .eq("id", callerCompanyId)
          .eq("profile_id", profile_id)
          .single();

        if (isOwner) {
          return errorResponse("Nao e possivel remover o proprietario da empresa");
        }

        const { error: removeError } = await supabase
          .from("company_users")
          .delete()
          .eq("company_id", callerCompanyId)
          .eq("profile_id", profile_id);

        if (removeError) {
          return errorResponse(`Falha ao remover: ${removeError.message}`, 500);
        }

        return jsonResponse({ success: true, message: "Membro removido" });
      }

      case "update_role": {
        if (callerRole !== "admin") {
          return errorResponse("Only admins can change roles", 403);
        }

        const { profile_id: targetId, role: newRole } = body;
        if (!targetId || !newRole) {
          return errorResponse("profile_id and role are required");
        }
        if (!["admin", "member"].includes(newRole)) {
          return errorResponse("Role must be 'admin' or 'member'");
        }

        if (targetId === caller.id) {
          return errorResponse("Voce nao pode alterar seu proprio cargo");
        }

        const { error: roleError } = await supabase
          .from("company_users")
          .update({ role: newRole })
          .eq("company_id", callerCompanyId)
          .eq("profile_id", targetId);

        if (roleError) {
          return errorResponse(`Falha ao atualizar cargo: ${roleError.message}`, 500);
        }

        return jsonResponse({ success: true, message: `Cargo atualizado para ${newRole}` });
      }

      default:
        return errorResponse(`Acao desconhecida: ${action}`);
    }
  } catch (err) {
    console.error("invite-team-member error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});
