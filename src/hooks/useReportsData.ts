/**
 * Hook: useReportsData
 * PRD-059: Relatorios "Radar"
 *
 * Central hook that provides filtered metrics, financial/growth/operational KPIs,
 * weekly/monthly aggregations, cohort data, and period comparisons.
 */

import { useState, useMemo, useCallback } from 'react';
import type {
  TimeFilter,
  PlatformMetricsDaily,
  WeeklyAggregate,
  MonthlyAggregate,
  CohortRow,
} from '@/types';
import { mockDailyMetrics } from '@/data/reportsData';
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
  buildFunnel,
  comparePeriods,
} from '@/lib/analytics';

// ---------------------------------------------------------------------------
// Helper: compute the "previous" period of the same length
// ---------------------------------------------------------------------------

function getPreviousPeriodFilter(filter: TimeFilter): TimeFilter {
  const now = new Date();

  switch (filter.preset) {
    case '7d': {
      const end = new Date(now);
      end.setDate(end.getDate() - 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return {
        preset: 'custom',
        startDate: formatDate(start),
        endDate: formatDate(end),
      };
    }
    case '30d': {
      const end = new Date(now);
      end.setDate(end.getDate() - 30);
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      return {
        preset: 'custom',
        startDate: formatDate(start),
        endDate: formatDate(end),
      };
    }
    case 'month': {
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
      return {
        preset: 'custom',
        startDate: formatDate(prevMonthStart),
        endDate: formatDate(prevMonthEnd),
      };
    }
    case 'quarter': {
      const currentQuarterStart = Math.floor(now.getMonth() / 3) * 3;
      const prevQuarterEnd = new Date(now.getFullYear(), currentQuarterStart, 0);
      const prevQuarterStartMonth = Math.floor(prevQuarterEnd.getMonth() / 3) * 3;
      const prevQuarterStart = new Date(prevQuarterEnd.getFullYear(), prevQuarterStartMonth, 1);
      return {
        preset: 'custom',
        startDate: formatDate(prevQuarterStart),
        endDate: formatDate(prevQuarterEnd),
      };
    }
    case 'year': {
      return {
        preset: 'custom',
        startDate: `${now.getFullYear() - 1}-01-01`,
        endDate: `${now.getFullYear() - 1}-12-31`,
      };
    }
    case 'custom': {
      if (!filter.startDate || !filter.endDate) return filter;
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      const durationMs = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 86400000); // day before start
      const prevStart = new Date(prevEnd.getTime() - durationMs);
      return {
        preset: 'custom',
        startDate: formatDate(prevStart),
        endDate: formatDate(prevEnd),
      };
    }
    default:
      return filter;
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useReportsData() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>({ preset: '30d' });

  // Filtered metrics for the selected period
  const filteredMetrics = useMemo(
    () => filterMetricsByPeriod(mockDailyMetrics, timeFilter),
    [timeFilter],
  );

  // Previous period metrics for comparison
  const previousPeriodFilter = useMemo(() => getPreviousPeriodFilter(timeFilter), [timeFilter]);
  const previousMetrics = useMemo(
    () => filterMetricsByPeriod(mockDailyMetrics, previousPeriodFilter),
    [previousPeriodFilter],
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

    // Free vs paid: estimate ~70% of companies are free tier
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

    // Previous period values for growth calculation
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
  };
}
