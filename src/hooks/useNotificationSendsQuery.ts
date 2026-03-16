/**
 * Notification Sends Query Hooks
 *
 * React Query hooks for admin notification management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getNotificationSendsService } from '@/services/notifications/notificationSendsService';
import type { NotificationSendsFilters, CreateNotificationParams } from '@/types/notificationSends';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  all: ['notification-sends'] as const,
  list: (filters?: NotificationSendsFilters) => ['notification-sends', 'list', filters] as const,
  stats: ['notification-sends', 'stats'] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch sent notifications list with optional filters */
export function useNotificationSends(filters?: NotificationSendsFilters) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: async () => {
      const service = await getNotificationSendsService();
      return service.getNotificationSends(filters);
    },
  });
}

/** Get notification sends stats (total, scheduled, successful, manual) */
export function useNotificationSendsStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: async () => {
      const service = await getNotificationSendsService();
      return service.getStats();
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Send a manual notification */
export function useSendManualNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateNotificationParams) => {
      const service = await getNotificationSendsService();
      return service.sendNotification(params);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Notificação enviada com sucesso', {
          description: result.targetCount
            ? `Enviada para ${result.targetCount} usuário(s)`
            : undefined,
        });
      } else {
        toast.error('Erro ao enviar notificação', {
          description: result.error,
        });
      }
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar notificação', {
        description: error.message,
      });
    },
  });
}

/** Cancel a scheduled notification */
export function useCancelNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const service = await getNotificationSendsService();
      return service.cancelNotification(id);
    },
    onSuccess: () => {
      toast.success('Notificação cancelada com sucesso');
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
    onError: (error: Error) => {
      toast.error('Erro ao cancelar notificação', {
        description: error.message,
      });
    },
  });
}
