/**
 * Realtime Notifications Hook
 *
 * Subscribes to Supabase Realtime for instant notification updates.
 * Shows a toast via Sonner when a new notification arrives.
 * Falls back to polling (300s) in useNotificationsQuery.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Invalidate queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', userId] });

          // Show toast with notification title
          const record = payload.new as { title?: string; description?: string };
          if (record.title) {
            toast(record.title, {
              description: record.description ?? undefined,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
