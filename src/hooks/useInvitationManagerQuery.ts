/**
 * React Query hooks for Invitation Manager
 * Company-wide invitation management with filters, pagination, and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanyTestsService } from '@/services/companyTests/companyTestsService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { InvitationManagerFilters } from '@/types/companyTest';

// Query key factory
export const invitationManagerKeys = {
  all: ['invitationManager'] as const,
  companyInvitations: (companyId: string, filters?: InvitationManagerFilters) =>
    [...invitationManagerKeys.all, 'companyInvitations', companyId, filters ?? {}] as const,
  auditLogs: (invitationId: string) =>
    [...invitationManagerKeys.all, 'auditLogs', invitationId] as const,
};

// --- Queries ---

export function useCompanyInvitations(
  companyId: string | undefined,
  filters?: InvitationManagerFilters
) {
  return useQuery({
    queryKey: invitationManagerKeys.companyInvitations(companyId ?? '', filters),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getCompanyInvitations(companyId!, filters);
    },
    enabled: !!companyId,
    staleTime: 30_000,
  });
}

export function useInvitationAuditLogs(invitationId: string | undefined) {
  return useQuery({
    queryKey: invitationManagerKeys.auditLogs(invitationId ?? ''),
    queryFn: async () => {
      const service = await getCompanyTestsService();
      return service.getInvitationAuditLogs(invitationId!);
    },
    enabled: !!invitationId,
  });
}

// --- Mutations ---

export function useExtendDeadline() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ invitationId, newExpiresAt }: { invitationId: string; newExpiresAt: string }) => {
      const { data, error } = await supabase.functions.invoke('send-test-invitation', {
        body: { action: 'extend_deadline', invitation_id: invitationId, new_expires_at: newExpiresAt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationManagerKeys.all });
      toast({ title: 'Prazo estendido com sucesso' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao estender prazo', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateRecipient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ invitationId, candidateName, candidateEmail }: { invitationId: string; candidateName?: string; candidateEmail?: string }) => {
      const { data, error } = await supabase.functions.invoke('send-test-invitation', {
        body: { action: 'update_recipient', invitation_id: invitationId, candidate_name: candidateName, candidate_email: candidateEmail },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationManagerKeys.all });
      toast({ title: 'Destinatário atualizado com sucesso' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar destinatário', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.functions.invoke('send-test-invitation', {
        body: { action: 'cancel', invitation_id: invitationId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationManagerKeys.all });
      toast({ title: 'Convite cancelado com sucesso' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao cancelar convite', description: error.message, variant: 'destructive' });
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.functions.invoke('send-test-invitation', {
        body: { action: 'resend', invitation_id: invitationId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationManagerKeys.all });
      toast({ title: 'Convite reenviado com sucesso' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao reenviar convite', description: error.message, variant: 'destructive' });
    },
  });
}

export function useBulkCancelInvitations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitationIds: string[]) => {
      const results = await Promise.allSettled(
        invitationIds.map(id =>
          supabase.functions.invoke('send-test-invitation', {
            body: { action: 'cancel', invitation_id: id },
          })
        )
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      return { succeeded, failed, total: invitationIds.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: invitationManagerKeys.all });
      toast({
        title: `${result.succeeded} convite(s) cancelado(s)`,
        description: result.failed > 0 ? `${result.failed} falharam` : undefined,
        variant: result.failed > 0 ? 'destructive' : 'default',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao cancelar convites', description: error.message, variant: 'destructive' });
    },
  });
}

export function useBulkResendInvitations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitationIds: string[]) => {
      const results = await Promise.allSettled(
        invitationIds.map(id =>
          supabase.functions.invoke('send-test-invitation', {
            body: { action: 'resend', invitation_id: id },
          })
        )
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      return { succeeded, failed, total: invitationIds.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: invitationManagerKeys.all });
      toast({
        title: `${result.succeeded} convite(s) reenviado(s)`,
        description: result.failed > 0 ? `${result.failed} falharam` : undefined,
        variant: result.failed > 0 ? 'destructive' : 'default',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao reenviar convites', description: error.message, variant: 'destructive' });
    },
  });
}
