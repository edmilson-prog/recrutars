/**
 * Reports Service — Interface
 * PRD-066: Service Layer Pattern
 *
 * Manages platform metrics, activity feed, and report schedules.
 */

import type {
  PlatformMetricsDaily,
  ActivityFeedEvent,
  ReportSchedule,
} from '@/types/reports';

export interface CreateReportScheduleData {
  name: string;
  type: 'pdf' | 'excel';
  frequency: 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  recipients: string[];
}

export interface IReportsService {
  /** Get daily metrics for a date range. */
  getDailyMetrics(dateFrom: string, dateTo: string): Promise<PlatformMetricsDaily[]>;

  /** Get the most recent day's metrics. */
  getLatestMetrics(): Promise<PlatformMetricsDaily | null>;

  /** Get the activity feed, limited to N events. */
  getActivityFeed(limit?: number): Promise<ActivityFeedEvent[]>;

  /** List all report schedules. */
  getReportSchedules(): Promise<ReportSchedule[]>;

  /** Create a new report schedule. */
  createReportSchedule(data: CreateReportScheduleData): Promise<ReportSchedule>;

  /** Update an existing report schedule. */
  updateReportSchedule(id: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IReportsService | null = null;

export async function getReportsService(): Promise<IReportsService> {
  if (_instance) return _instance;

  const { SupabaseReportsService } = await import('./reportsService.supabase');
  _instance = new SupabaseReportsService();
  return _instance;
}
