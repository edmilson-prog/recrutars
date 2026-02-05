/**
 * Hook: useReportExport (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates schedule management to
 * useReportsQuery service hooks. Export actions remain simulated.
 */

import { useCallback, useState } from 'react';
import type { ReportSchedule } from '@/types';
import {
  useReportSchedules,
  useCreateReportSchedule,
  useUpdateReportSchedule,
} from './useReportsQuery';

export function useReportExport() {
  const { data: schedules = [], isLoading, error } = useReportSchedules();
  const createScheduleMutation = useCreateReportSchedule();
  const updateScheduleMutation = useUpdateReportSchedule();
  const [isExporting, setIsExporting] = useState(false);

  // ---------------------------------------------------------------------------
  // Export actions (simulated)
  // ---------------------------------------------------------------------------

  const exportPDF = useCallback(async (data: Record<string, unknown>) => {
    setIsExporting(true);
    try {
      // Simulate export processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // In production: would use jspdf + jspdf-autotable to generate PDF
      console.log('[ReportExport] PDF exported with data:', data);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportExcel = useCallback(async (data: Record<string, unknown>) => {
    setIsExporting(true);
    try {
      // Simulate export processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // In production: would use xlsx/SheetJS to generate Excel file
      console.log('[ReportExport] Excel exported with data:', data);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Schedule CRUD — delegates to service layer via mutations
  // ---------------------------------------------------------------------------

  const updateSchedule = useCallback((id: string, updates: Partial<ReportSchedule>) => {
    updateScheduleMutation.mutate({ id, updates });
  }, [updateScheduleMutation]);

  const addSchedule = useCallback((schedule: Omit<ReportSchedule, 'id'>) => {
    createScheduleMutation.mutate({
      name: schedule.name,
      type: schedule.type as 'pdf' | 'excel',
      frequency: schedule.frequency as 'weekly' | 'monthly',
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      hour: schedule.hour,
      recipients: schedule.recipients,
    });
  }, [createScheduleMutation]);

  const removeSchedule = useCallback((_id: string) => {
    console.warn('[useReportExport] removeSchedule is not yet available via service layer.');
  }, []);

  const toggleSchedule = useCallback((id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      updateScheduleMutation.mutate({ id, updates: { isActive: !schedule.isActive } });
    }
  }, [schedules, updateScheduleMutation]);

  return {
    schedules,
    isExporting,
    exportPDF,
    exportExcel,
    updateSchedule,
    addSchedule,
    removeSchedule,
    toggleSchedule,
    isLoading,
    error,
  };
}
