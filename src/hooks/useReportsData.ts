/**
 * Hook: useReportsData (PRD-071 Migration)
 *
 * Backward-compatible wrapper that delegates to useReportsQuery service hooks.
 * Preserves the same API surface: time filter, KPI computations, aggregations.
 *
 * Data now flows through the service layer (useDailyMetrics) instead of
 * importing mockDailyMetrics directly.
 */

import { useState, useMemo } from 'react';
import type {
  TimeFilter,
  WeeklyAggregate,
  MonthlyAggregate,
  CohortRow,
} from '@/types';
import { useDailyMetrics } from './useReportsQuery';
import {
  filterMetricsByPeriod,
  calculateMRR,
  calculateARR,
  calculateChurnRate,
  calculateLTV,
  calculateConversionRate,
  calculateGrowthRate,
  aggregateByWeek,
  aggregateByMonth,
  buildCohortTable,
  comparePeriods,
} from '@/lib/analytics';

// ---------------------------------------------------------------------------
// Helper: compute date range from a TimeFilter preset
// ---------------------------------------------------------------------------

function getDateRange(filter: TimeFilter): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (filter.preset === 'custom' && filter.startDate && filter.endDate) {
    return { dateFrom: filter.startDate, dateTo: filter.endDate };
  }

  const dateTo = formatDate(now);
  let dateFrom: string;

  switch (filter.preset) {
    case '7d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      dateFrom = formatDate(start);
      break;
    }
    case '30d': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      dateFrom = formatDate(start);
      break;
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFrom = formatDate(start);
      break;
    }
    case 'quarter': {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), quarterStart, 1);
      dateFrom = formatDate(start);
      break;
    }
    case 'year': {
      dateFrom = `${now.getFullYear()}-01-01`;
      break;
    }
    default: {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      dateFrom = formatDate(start);
    }
  }

  return { dateFrom, dateTo };
}

function getPreviousDateRange(filter: TimeFilter): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  switch (filter.preset) {
    case '7d': {
      const end = new Date(now);
      end.setDate(end.getDate() - 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return { dateFrom: formatDate(start), dateTo: formatDate(end) };
    }
    case '30d': {
      const end = new Date(now);
      end.setDate(end.getDate() - 30);
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      return { dateFrom: formatDate(start), dateTo: formatDate(end) };
    }
    case 'month': {
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
      return { dateFrom: formatDate(prevStart), dateTo: formatDate(prevEnd) };
    }
    case 'quarter': {
      const currentQStart = Math.floor(now.getMonth() / 3) * 3;
      const prevEnd = new Date(now.getFullYear(), currentQStart, 0);
      const prevQStart = Math.floor(prevEnd.getMonth() / 3) * 3;
      const prevStart = new Date(prevEnd.getFullYear(), prevQStart, 1);
      return { dateFrom: formatDate(prevStart), dateTo: formatDate(prevEnd) };
    }
    case 'year': {
      return {
        dateFrom: `${now.getFullYear() - 1}-01-01`,
        dateTo: `${now.getFullYear() - 1}-12-31`,
      };
    }
    case 'custom': {
      if (!filter.startDate || !filter.endDate) {
        return getDateRange(filter);
      }
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      const durationMs = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 86400000);
      const prevStart = new Date(prevEnd.getTime() - durationMs);
      return { dateFrom: formatDate(prevStart), dateTo: formatDate(prevEnd) };
    }
    default:
      return getDateRange(filter);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useReportsData() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>({ preset: '30d' });

  // Compute date ranges for current and previous periods
  const currentRange = useMemo(() => getDateRange(timeFilter), [timeFilter]);
  const previousRange = useMemo(() => getPreviousDateRange(timeFilter), [timeFilter]);

  // Fetch metrics via service layer
  const {
    data: allMetrics = [],
    isLoading: metricsLoading,
    error: metricsError,
  } = useDailyMetrics(currentRange.dateFrom, currentRange.dateTo);

  const {
    data: allPreviousMetrics = [],
    isLoading: prevLoading,
  } = useDailyMetrics(previousRange.dateFrom, previousRange.dateTo);

  const isLoading = metricsLoading || prevLoading;
  const error = metricsError;

  // Filter metrics for the selected period (service may return broader range)
  const filteredMetrics = useMemo(
    () => filterMetricsByPeriod(allMetrics, timeFilter),
    [allMetrics, timeFilter],
  );

  const previousPeriodFilter = useMemo<TimeFilter>(
    () => ({
      preset: 'custom',
      startDate: previousRange.dateFrom,
      endDate: previousRange.dateTo,
    }),
    [previousRange],
  );

  const previousMetrics = useMemo(
    () => filterMetricsByPeriod(allPreviousMetrics, previousPeriodFilter),
    [allPreviousMetrics, previousPeriodFilter],
  );

  // ---------------------------------------------------------------------------
  // Financial KPIs
  // ---------------------------------------------------------------------------
  const financialKPIs = useMemo(() => {
    const mrr = calculateMRR(filteredMetrics);
    const arr = calculateARR(mrr);
    const totalRevenue = filteredMetrics.reduce((s, m) => s + m.revenue, 0);
    const totalSubscriptions = filteredMetrics.reduce((s, m) => s + m.newSubscriptions, 0);
    const ticketMedio = totalSubscriptions > 0 ? totalRevenue / totalSubscriptions : 0;
    const churnRate = calculateChurnRate(filteredMetrics);
    const ltv = calculateLTV(ticketMedio > 0 ? ticketMedio : mrr * 0.8, churnRate);

    const totalCompanies = filteredMetrics.length > 0
      ? filteredMetrics[filteredMetrics.length - 1].totalCompanies
      : 0;
    const estimatedPaid = Math.round(totalCompanies * 0.3);
    const estimatedFree = totalCompanies - estimatedPaid;
    const conversionRate = calculateConversionRate(estimatedFree, estimatedPaid);

    return {
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      totalRevenue: Math.round(totalRevenue),
      ticketMedio: Math.round(ticketMedio),
      churnRate: Math.round(churnRate * 100) / 100,
      ltv: Math.round(ltv),
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }, [filteredMetrics]);

  // ---------------------------------------------------------------------------
  // Growth KPIs
  // ---------------------------------------------------------------------------
  const growthKPIs = useMemo(() => {
    const totalCandidates = filteredMetrics.length > 0
      ? filteredMetrics[filteredMetrics.length - 1].totalCandidates
      : 0;
    const totalCompanies = filteredMetrics.length > 0
      ? filteredMetrics[filteredMetrics.length - 1].totalCompanies
      : 0;
    const newCandidates = filteredMetrics.reduce((s, m) => s + m.newCandidates, 0);
    const newCompanies = filteredMetrics.reduce((s, m) => s + m.newCompanies, 0);
    const newJobs = filteredMetrics.reduce((s, m) => s + m.newJobs, 0);

    const prevCandidates = previousMetrics.reduce((s, m) => s + m.newCandidates, 0);
    const prevCompanies = previousMetrics.reduce((s, m) => s + m.newCompanies, 0);

    const candidateGrowth = calculateGrowthRate(newCandidates, prevCandidates);
    const companyGrowth = calculateGrowthRate(newCompanies, prevCompanies);

    return {
      totalCandidates,
      totalCompanies,
      newCandidates,
      newCompanies,
      newJobs,
      candidateGrowth: Math.round(candidateGrowth * 100) / 100,
      companyGrowth: Math.round(companyGrowth * 100) / 100,
    };
  }, [filteredMetrics, previousMetrics]);

  // ---------------------------------------------------------------------------
  // Operational KPIs
  // ---------------------------------------------------------------------------
  const operationalKPIs = useMemo(() => {
    const totalApplications = filteredMetrics.reduce((s, m) => s + m.applications, 0);
    const totalHires = filteredMetrics.reduce((s, m) => s + m.hires, 0);
    const totalInterviews = filteredMetrics.reduce((s, m) => s + m.interviewsDone, 0);
    const testsCompleted = filteredMetrics.reduce((s, m) => s + m.testsCompleted, 0);
    const conversionRate = totalApplications > 0
      ? Math.round((totalHires / totalApplications) * 10000) / 100
      : 0;

    return {
      totalApplications,
      totalHires,
      totalInterviews,
      testsCompleted,
      conversionRate,
    };
  }, [filteredMetrics]);

  // ---------------------------------------------------------------------------
  // Aggregated data for charts
  // ---------------------------------------------------------------------------
  const weeklyData = useMemo(
    () => aggregateByWeek(filteredMetrics),
    [filteredMetrics],
  );

  const monthlyData = useMemo(
    () => aggregateByMonth(filteredMetrics),
    [filteredMetrics],
  );

  const cohortData = useMemo(
    () => buildCohortTable(filteredMetrics),
    [filteredMetrics],
  );

  // ---------------------------------------------------------------------------
  // Period comparison
  // ---------------------------------------------------------------------------
  const comparison = useMemo(
    () => comparePeriods(filteredMetrics, previousMetrics),
    [filteredMetrics, previousMetrics],
  );

  return {
    timeFilter,
    setTimeFilter,
    filteredMetrics,
    previousMetrics,
    financialKPIs,
    growthKPIs,
    operationalKPIs,
    weeklyData,
    monthlyData,
    cohortData,
    comparison,
    isLoading,
    error,
  };
}
