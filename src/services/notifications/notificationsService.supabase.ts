/**
 * Notifications Service — Supabase Implementation
 * PRD-067: Service Layer — Specialized Modules
 *
 * Queries the notifications table.
 * Table schema: notifications(id, user_id, type, title, description, read, created_at, action_url, metadata)
 */

import type { Notification } from '@/types/notifications';
import { supabase } from '@/lib/supabase';
import type { INotificationsService } from './notificationsService';

export class NotificationsServiceSupabase implements INotificationsService {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(this.mapNotification);
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return count ?? 0;
  }

  // ---------------------------------------------------------------------------
  // Mapper (snake_case DB -> camelCase TS)
  // ---------------------------------------------------------------------------

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapNotification(row: any): Notification {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      read: row.read,
      createdAt: row.created_at,
      actionUrl: row.action_url,
      metadata: typeof row.metadata === 'string'
        ? JSON.parse(row.metadata)
        : (row.metadata ?? {}),
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
