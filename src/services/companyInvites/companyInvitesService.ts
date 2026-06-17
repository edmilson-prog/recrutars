/**
 * Company Invites Service
 * v1.15.0: Real team member invites via Supabase
 */

import { supabase } from '@/lib/supabase';
import type { CompanyUser, CompanyInvite, TeamMemberRole } from '@/types/company';

// ── Row types (snake_case from DB) ──

interface CompanyUserRow {
  id: string;
  company_id: string;
  profile_id: string;
  role: string;
  invited_by: string | null;
  created_at: string;
  profiles: {
    name: string;
    email: string;
    last_access_at: string | null;
    avatar_url: string | null;
  };
}

interface CompanyInviteRow {
  id: string;
  company_id: string;
  email: string;
  role: string;
  invited_by: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

// ── Converters ──

function rowToCompanyUser(row: CompanyUserRow): CompanyUser {
  return {
    id: row.id,
    companyId: row.company_id,
    profileId: row.profile_id,
    role: row.role as TeamMemberRole,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    name: row.profiles?.name ?? '',
    email: row.profiles?.email ?? '',
    lastAccessAt: row.profiles?.last_access_at ?? null,
    avatarUrl: row.profiles?.avatar_url ?? null,
  };
}

function rowToCompanyInvite(row: CompanyInviteRow): CompanyInvite {
  return {
    id: row.id,
    companyId: row.company_id,
    email: row.email,
    role: row.role as TeamMemberRole,
    invitedBy: row.invited_by,
    status: row.status as CompanyInvite['status'],
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  };
}

// ── Helpers ──

/**
 * Invoca a Edge Function invite-team-member e propaga a mensagem de erro REAL.
 *
 * Quando a function responde com status != 2xx, o supabase-js retorna um
 * FunctionsHttpError cujo `.message` é genérico ("...non-2xx status code"). O corpo
 * com a mensagem amigável ({ error }) fica em `.context` (a Response). Aqui extraímos
 * essa mensagem para que o toast exiba o motivo real (ex.: conta de candidato).
 */
async function invokeInviteFn(body: Record<string, unknown>): Promise<{ message?: string; note?: string }> {
  const { data, error } = await supabase.functions.invoke('invite-team-member', { body });

  if (error) {
    let message = error.message;
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      try {
        const parsed = await ctx.json();
        if (parsed?.error) message = parsed.error;
      } catch {
        // corpo não-JSON: mantém a mensagem genérica
      }
    }
    throw new Error(message);
  }

  if (data?.error) throw new Error(data.error);
  return data ?? {};
}

// ── Service Functions ──

export async function getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
  const { data, error } = await supabase
    .from('company_users')
    .select('*, profiles!company_users_profile_id_fkey(name, email, last_access_at, avatar_url)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((row: unknown) => rowToCompanyUser(row as CompanyUserRow));
}

export async function getCompanyInvites(companyId: string): Promise<CompanyInvite[]> {
  const { data, error } = await supabase
    .from('company_invites')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row: unknown) => rowToCompanyInvite(row as CompanyInviteRow));
}

export async function inviteMember(email: string, role: TeamMemberRole = 'member'): Promise<{ message: string }> {
  const data = await invokeInviteFn({
    action: 'invite',
    email,
    role,
    redirect_url: `${window.location.origin}/aceitar-convite`,
  });
  return { message: data?.message || 'Convite enviado' };
}

export async function resendInvite(inviteId: string): Promise<{ message: string }> {
  const data = await invokeInviteFn({
    action: 'resend',
    invite_id: inviteId,
    redirect_url: `${window.location.origin}/aceitar-convite`,
  });
  return { message: data?.message || 'Convite reenviado' };
}

export async function cancelInvite(inviteId: string): Promise<void> {
  await invokeInviteFn({ action: 'cancel', invite_id: inviteId });
}

export async function removeMember(profileId: string): Promise<void> {
  await invokeInviteFn({ action: 'remove_member', profile_id: profileId });
}

export async function updateMemberRole(profileId: string, role: TeamMemberRole): Promise<void> {
  await invokeInviteFn({ action: 'update_role', profile_id: profileId, role });
}
