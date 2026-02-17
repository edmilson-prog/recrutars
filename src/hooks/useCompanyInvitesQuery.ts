/**
 * React Query hooks for Company Invites
 * v1.15.0: Real team member management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCompanyUsers,
  getCompanyInvites,
  inviteMember,
  resendInvite,
  cancelInvite,
  removeMember,
  updateMemberRole,
} from '@/services/companyInvites/companyInvitesService';
import type { TeamMemberRole } from '@/types/company';

// ── Query Keys ──

export const companyInviteKeys = {
  users: (companyId: string) => ['company-users', companyId] as const,
  invites: (companyId: string) => ['company-invites', companyId] as const,
};

// ── Queries ──

export function useCompanyUsers(companyId: string | undefined) {
  return useQuery({
    queryKey: companyInviteKeys.users(companyId || ''),
    queryFn: () => getCompanyUsers(companyId!),
    enabled: !!companyId,
  });
}

export function useCompanyInvites(companyId: string | undefined) {
  return useQuery({
    queryKey: companyInviteKeys.invites(companyId || ''),
    queryFn: () => getCompanyInvites(companyId!),
    enabled: !!companyId,
  });
}

// ── Mutations ──

export function useInviteMember(companyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: TeamMemberRole }) =>
      inviteMember(email, role),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyInviteKeys.invites(companyId) });
        queryClient.invalidateQueries({ queryKey: companyInviteKeys.users(companyId) });
      }
    },
  });
}

export function useResendInvite(companyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => resendInvite(inviteId),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyInviteKeys.invites(companyId) });
      }
    },
  });
}

export function useCancelInvite(companyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => cancelInvite(inviteId),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyInviteKeys.invites(companyId) });
      }
    },
  });
}

export function useRemoveMember(companyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => removeMember(profileId),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyInviteKeys.users(companyId) });
      }
    },
  });
}

export function useUpdateMemberRole(companyId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, role }: { profileId: string; role: TeamMemberRole }) =>
      updateMemberRole(profileId, role),
    onSuccess: () => {
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: companyInviteKeys.users(companyId) });
      }
    },
  });
}
