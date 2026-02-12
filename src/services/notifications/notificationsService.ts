/**
 * Notifications Service — Interface + Factory
 * PRD-067: Service Layer — Specialized Modules
 *
 * Manages user notifications (job matches, application updates, messages, etc.).
 */

import type { Notification } from '@/types/notifications';

export interface INotificationsService {
  /** Get all notifications for a user */
  getNotifications(userId: string): Promise<Notification[]>;

  /** Mark a single notification as read */
  markAsRead(id: string): Promise<void>;

  /** Mark all notifications for a user as read */
  markAllAsRead(userId: string): Promise<void>;

  /** Get count of unread notifications for a user */
  getUnreadCount(userId: string): Promise<number>;

  /** Create a notification for a user (PRD-077) */
  createNotification(params: {
    userId: string;
    type: string;
    title: string;
    description: string;
    actionUrl: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: INotificationsService | null = null;

export async function getNotificationsService(): Promise<INotificationsService> {
  if (_instance) return _instance;

  const { NotificationsServiceSupabase } = await import('./notificationsService.supabase');
  _instance = new NotificationsServiceSupabase();
  return _instance;
}

export function resetNotificationsService(): void {
  _instance = null;
}
