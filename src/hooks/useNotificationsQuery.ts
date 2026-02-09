/**
 * Notifications Query Hooks
 * PRD-067: Service Layer — Specialized Modules
 *
 * React Query hooks for user notifications.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationsService } from '@/services/notifications/notificationsService';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  all: (userId: string) => ['notifications', userId] as const,
  unreadCount: (userId: string) => ['notifications', 'unread', userId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all notifications for a user */
export function useNotifications(userId: string) {
  return useQuery({
    queryKey: KEYS.all(userId),
    queryFn: async () => {
      const service = await getNotificationsService();
      return service.getNotifications(userId);
    },
    enabled: !!userId,
    refetchInterval: 30_000, // poll every 30s
  });
}

/** Get count of unread notifications for a user */
export function useNotificationUnreadCount(userId: string) {
  return useQuery({
    queryKey: KEYS.unreadCount(userId),
    queryFn: async () => {
      const service = await getNotificationsService();
      return service.getUnreadCount(userId);
    },
    enabled: !!userId,
    refetchInterval: 30_000, // poll every 30s
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Mark a single notification as read */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      void userId; // used only for cache invalidation
      const service = await getNotificationsService();
      return service.markAsRead(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all(variables.userId) });
      queryClient.invalidateQueries({
        queryKey: KEYS.unreadCount(variables.userId),
      });
    },
  });
}

/** Mark all notifications as read for a user */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const service = await getNotificationsService();
      return service.markAllAsRead(userId);
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all(userId) });
      queryClient.invalidateQueries({ queryKey: KEYS.unreadCount(userId) });
    },
  });
}
