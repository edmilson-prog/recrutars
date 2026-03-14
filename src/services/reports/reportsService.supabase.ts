/**
 * Reports Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 */

import { supabase } from '@/lib/supabase';
import type {
  PlatformMetricsDaily,
  ActivityFeedEvent,
  ReportSchedule,
} from '@/types/reports';
import type { Database } from '@/types/database';
import type {
  IReportsService,
  CreateReportScheduleData,
} from './reportsService';

type MetricsRow = Database['public']['Tables']['platform_metrics_daily']['Row'];

function convertMetricsRow(row: MetricsRow): PlatformMetricsDaily {
  return {
    id: row.id,
    metricDate: row.metric_date,
    totalCandidates: row.total_candidates,
    totalCompanies: row.total_companies,
    newCandidates: row.new_candidates,
    newCompanies: row.new_companies,
    activeJobs: row.active_jobs,
    newJobs: row.new_jobs,
    applications: row.applications,
    interviewsScheduled: row.interviews_scheduled,
    interviewsDone: row.interviews_done,
    hires: row.hires,
    testsStarted: row.tests_started,
    testsCompleted: row.tests_completed,
    mrr: row.mrr,
    newSubscriptions: row.new_subscriptions,
    cancellations: row.cancellations,
    revenue: row.revenue,
  };
}

export class SupabaseReportsService implements IReportsService {
  async getDailyMetrics(
    dateFrom: string,
    dateTo: string,
  ): Promise<PlatformMetricsDaily[]> {
    const { data, error } = await supabase
      .from('platform_metrics_daily')
      .select('*')
      .gte('metric_date', dateFrom)
      .lte('metric_date', dateTo)
      .order('metric_date', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(convertMetricsRow);
  }

  async getLatestMetrics(): Promise<PlatformMetricsDaily | null> {
    const { data, error } = await supabase
      .from('platform_metrics_daily')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? convertMetricsRow(data) : null;
  }

  async getActivityFeed(limit = 50): Promise<ActivityFeedEvent[]> {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as unknown as ActivityFeedEvent[];
  }

  async getReportSchedules(): Promise<ReportSchedule[]> {
    const { data, error } = await supabase
      .from('report_schedules')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data ?? []) as unknown as ReportSchedule[];
  }

  async createReportSchedule(
    input: CreateReportScheduleData,
  ): Promise<ReportSchedule> {
    const { data, error } = await supabase
      .from('report_schedules')
      .insert({
        name: input.name,
        type: input.type,
        frequency: input.frequency,
        day_of_week: input.dayOfWeek,
        day_of_month: input.dayOfMonth,
        hour: input.hour,
        recipients: input.recipients,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as ReportSchedule;
  }

  async updateReportSchedule(
    id: string,
    updates: Partial<ReportSchedule>,
  ): Promise<ReportSchedule> {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.frequency !== undefined) payload.frequency = updates.frequency;
    if (updates.dayOfWeek !== undefined) payload.day_of_week = updates.dayOfWeek;
    if (updates.dayOfMonth !== undefined) payload.day_of_month = updates.dayOfMonth;
    if (updates.hour !== undefined) payload.hour = updates.hour;
    if (updates.recipients !== undefined) payload.recipients = updates.recipients;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('report_schedules')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as ReportSchedule;
  }
}
