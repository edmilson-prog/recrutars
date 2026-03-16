/**
 * Notification Sends Service — Interface + Factory
 *
 * Manages admin notification sends (manual notifications to users/groups).
 */

import type {
  NotificationSend,
  NotificationSendsFilters,
  NotificationSendsStats,
  CreateNotificationParams,
} from '@/types/notificationSends';

export interface INotificationSendsService {
  /** List all sent notifications with optional filters */
  getNotificationSends(filters?: NotificationSendsFilters): Promise<NotificationSend[]>;

  /** Get stats: total, scheduled, successful, manual */
  getStats(): Promise<NotificationSendsStats>;

  /** Send a manual notification via RPC */
  sendNotification(params: CreateNotificationParams): Promise<{
    success: boolean;
    sendId?: string;
    targetCount?: number;
    error?: string;
  }>;

  /** Cancel a scheduled notification */
  cancelNotification(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: INotificationSendsService | null = null;

export async function getNotificationSendsService(): Promise<INotificationSendsService> {
  if (_instance) return _instance;

  const { NotificationSendsServiceSupabase } = await import('./notificationSendsService.supabase');
  _instance = new NotificationSendsServiceSupabase();
  return _instance;
}

export function resetNotificationSendsService(): void {
  _instance = null;
}
