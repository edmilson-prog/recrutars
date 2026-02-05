/**
 * Reports Query Hooks
 * PRD-066: Service Layer — React Query integration for Reports module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportsService } from '@/services/reports/reportsService';
import type { CreateReportScheduleData } from '@/services/reports/reportsService';
import type { ReportSchedule } from '@/types/reports';

const METRICS_KEY = 'report-metrics';
const ACTIVITY_KEY = 'report-activity';
const SCHEDULES_KEY = 'report-schedules';

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export function useDailyMetrics(dateFrom: string | undefined, dateTo: string | undefined) {
  return useQuery({
    queryKey: [METRICS_KEY, dateFrom, dateTo],
    queryFn: async () => {
      if (!dateFrom || !dateTo) return [];
      const svc = await getReportsService();
      return svc.getDailyMetrics(dateFrom, dateTo);
    },
    enabled: !!dateFrom && !!dateTo,
  });
}

export function useLatestMetrics() {
  return useQuery({
    queryKey: [METRICS_KEY, 'latest'],
    queryFn: async () => {
      const svc = await getReportsService();
      return svc.getLatestMetrics();
    },
  });
}

// ---------------------------------------------------------------------------
// Activity Feed
// ---------------------------------------------------------------------------

export function useActivityFeed(limit?: number) {
  return useQuery({
    queryKey: [ACTIVITY_KEY, limit],
    queryFn: async () => {
      const svc = await getReportsService();
      return svc.getActivityFeed(limit);
    },
  });
}

// ---------------------------------------------------------------------------
// Schedules
// ---------------------------------------------------------------------------

export function useReportSchedules() {
  return useQuery({
    queryKey: [SCHEDULES_KEY],
    queryFn: async () => {
      const svc = await getReportsService();
      return svc.getReportSchedules();
    },
  });
}

export function useCreateReportSchedule() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReportScheduleData) => {
      const svc = await getReportsService();
      return svc.createReportSchedule(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SCHEDULES_KEY] });
    },
  });
}

export function useUpdateReportSchedule() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ReportSchedule>;
    }) => {
      const svc = await getReportsService();
      return svc.updateReportSchedule(id, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SCHEDULES_KEY] });
    },
  });
}
