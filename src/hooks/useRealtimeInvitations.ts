import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { invitationManagerKeys } from './useInvitationManagerQuery';

/**
 * Escuta mudanças em tempo real na tabela test_invitations
 * e invalida o cache do React Query para refetch automático.
 *
 * Mesmo padrão de useRealtimeNotifications.ts
 */
export function useRealtimeInvitations(companyId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`invitations:${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_invitations',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: invitationManagerKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, queryClient]);
}
