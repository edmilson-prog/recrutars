/**
 * Notification Sends Service — Supabase Implementation
 *
 * Queries the notification_sends table for admin notification management.
 * Table schema: notification_sends(id, title, description, action_url, category, priority,
 *   target_type, target_user_id, target_count, delivered_count, read_count, status,
 *   scheduled_at, sent_at, sent_by, template_id, created_at)
 */

import type {
  NotificationSend,
  NotificationSendsFilters,
  NotificationSendsStats,
  CreateNotificationParams,
} from '@/types/notificationSends';
import { supabase } from '@/lib/supabase';
import type { INotificationSendsService } from './notificationSendsService';

export class NotificationSendsServiceSupabase implements INotificationSendsService {
  async getNotificationSends(filters?: NotificationSendsFilters): Promise<NotificationSend[]> {
    let query = supabase
      .from('notification_sends')
      .select(`
        *,
        sender:profiles!notification_sends_sent_by_fkey(name),
        target_user:profiles!notification_sends_target_user_id_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data ?? []).map(this.mapNotificationSend);
  }

  async getStats(): Promise<NotificationSendsStats> {
    const { data, error } = await supabase
      .from('notification_sends')
      .select('status');

    if (error) throw error;

    const rows = data ?? [];

    return {
      total: rows.length,
      scheduled: rows.filter((r) => r.status === 'scheduled').length,
      successful: rows.filter((r) => r.status === 'sent').length,
      manual: rows.length,
    };
  }

  async sendNotification(params: CreateNotificationParams): Promise<{
    success: boolean;
    sendId?: string;
    targetCount?: number;
    error?: string;
  }> {
    const { data, error } = await supabase.rpc('send_manual_notification', {
      p_title: params.title,
      p_description: params.description,
      p_action_url: params.actionUrl ?? null,
      p_category: params.category,
      p_priority: params.priority,
      p_target_type: params.targetType,
      p_target_user_id: params.targetUserId ?? null,
      p_scheduled_at: params.scheduledAt ?? null,
      p_template_id: params.templateId ?? null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      sendId: data?.send_id ?? undefined,
      targetCount: data?.target_count ?? undefined,
    };
  }

  async cancelNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notification_sends')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('status', 'scheduled');

    if (error) throw error;
  }

  // ---------------------------------------------------------------------------
  // Mapper (snake_case DB -> camelCase TS)
  // ---------------------------------------------------------------------------

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapNotificationSend(row: any): NotificationSend {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      actionUrl: row.action_url,
      category: row.category,
      priority: row.priority,
      targetType: row.target_type,
      targetUserId: row.target_user_id,
      targetUserName: row.target_user?.name ?? undefined,
      targetCount: row.target_count ?? 0,
      deliveredCount: row.delivered_count ?? 0,
      readCount: row.read_count ?? 0,
      status: row.status,
      scheduledAt: row.scheduled_at,
      sentAt: row.sent_at,
      sentBy: row.sent_by,
      sentByName: row.sender?.name ?? undefined,
      templateId: row.template_id,
      createdAt: row.created_at,
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
