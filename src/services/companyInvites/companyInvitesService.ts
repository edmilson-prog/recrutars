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
  const { data, error } = await supabase.functions.invoke('invite-team-member', {
    body: {
      action: 'invite',
      email,
      role,
      redirect_url: `${window.location.origin}/aceitar-convite`,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { message: data?.message || 'Convite enviado' };
}

export async function resendInvite(inviteId: string): Promise<{ message: string }> {
  const { data, error } = await supabase.functions.invoke('invite-team-member', {
    body: {
      action: 'resend',
      invite_id: inviteId,
      redirect_url: `${window.location.origin}/aceitar-convite`,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { message: data?.message || 'Convite reenviado' };
}

export async function cancelInvite(inviteId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('invite-team-member', {
    body: { action: 'cancel', invite_id: inviteId },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}

export async function removeMember(profileId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('invite-team-member', {
    body: { action: 'remove_member', profile_id: profileId },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}

export async function updateMemberRole(profileId: string, role: TeamMemberRole): Promise<void> {
  const { data, error } = await supabase.functions.invoke('invite-team-member', {
    body: { action: 'update_role', profile_id: profileId, role },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}
