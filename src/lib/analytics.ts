/**
 * Analytics computation library
 * PRD-059: Relatorios "Radar"
 *
 * Pure functions for filtering, aggregating, and computing KPIs
 * from PlatformMetricsDaily data.
 */

import type {
  PlatformMetricsDaily,
  TimeFilter,
  WeeklyAggregate,
  MonthlyAggregate,
  CohortRow,
  FunnelStage,
} from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a YYYY-MM-DD string into a Date (local timezone). */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date as YYYY-MM-DD. */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Get ISO week number for a date. */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Get the Monday of the ISO week for a given date. */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7; // Convert Sunday (0) to 7
  d.setDate(d.getDate() - day + 1); // Set to Monday
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get the Sunday of the ISO week for a given date. */
function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

// ---------------------------------------------------------------------------
// Filter metrics by time period
// ---------------------------------------------------------------------------

export function filterMetricsByPeriod(
  metrics: PlatformMetricsDaily[],
  filter: TimeFilter,
): PlatformMetricsDaily[] {
  if (metrics.length === 0) return [];

  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (filter.preset) {
    case '7d': {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      break;
    }
    case '30d': {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      break;
    }
    case 'month': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month
      break;
    }
    case 'quarter': {
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1);
      endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
      break;
    }
    case 'year': {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    }
    case 'custom': {
      if (!filter.startDate || !filter.endDate) return metrics;
      startDate = parseDate(filter.startDate);
      endDate = parseDate(filter.endDate);
      break;
    }
    default:
      return metrics;
  }

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  return metrics.filter((m) => m.metricDate >= startStr && m.metricDate <= endStr);
}

// ---------------------------------------------------------------------------
// Financial calculations
// ---------------------------------------------------------------------------

/** Latest day's MRR value. */
export function calculateMRR(metrics: PlatformMetricsDaily[]): number {
  if (metrics.length === 0) return 0;
  return metrics[metrics.length - 1].mrr;
}

/** ARR = MRR * 12. */
export function calculateARR(mrr: number): number {
  return mrr * 12;
}

/** Churn rate as percentage: cancellations / (newSubscriptions + estimated active start). */
export function calculateChurnRate(metrics: PlatformMetricsDaily[]): number {
  if (metrics.length === 0) return 0;

  const totalCancellations = metrics.reduce((sum, m) => sum + m.cancellations, 0);
  const totalNewSubscriptions = metrics.reduce((sum, m) => sum + m.newSubscriptions, 0);

  // Estimate active subscriptions at start from the first day's data
  // Using totalCompanies as a proxy for active subscriptions
  const activeStart = metrics[0].totalCompanies;
  const denominator = activeStart + totalNewSubscriptions;

  if (denominator === 0) return 0;
  return (totalCancellations / denominator) * 100;
}

/** LTV = ticketMedio / churnRate. If churnRate is 0, assume 24-month lifetime. */
export function calculateLTV(ticketMedio: number, churnRate: number): number {
  if (churnRate <= 0) return ticketMedio * 24;
  return ticketMedio / (churnRate / 100); // churnRate is in percentage
}

/** Conversion rate: totalPaid / (totalFree + totalPaid) * 100. */
export function calculateConversionRate(totalFree: number, totalPaid: number): number {
  const total = totalFree + totalPaid;
  if (total === 0) return 0;
  return (totalPaid / total) * 100;
}

/** Growth rate: ((current - previous) / previous) * 100. */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100; // from zero to something = 100% growth
  }
  return ((current - previous) / previous) * 100;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/** Group metrics by ISO week and sum relevant fields. */
export function aggregateByWeek(metrics: PlatformMetricsDaily[]): WeeklyAggregate[] {
  if (metrics.length === 0) return [];

  const weekMap = new Map<string, {
    weekStart: Date;
    weekEnd: Date;
    newCandidates: number;
    newCompanies: number;
    newJobs: number;
    applications: number;
    hires: number;
    revenue: number;
  }>();

  for (const m of metrics) {
    const date = parseDate(m.metricDate);
    const ws = getWeekStart(date);
    const key = formatDate(ws);

    if (!weekMap.has(key)) {
      weekMap.set(key, {
        weekStart: ws,
        weekEnd: getWeekEnd(date),
        newCandidates: 0,
        newCompanies: 0,
        newJobs: 0,
        applications: 0,
        hires: 0,
        revenue: 0,
      });
    }

    const agg = weekMap.get(key)!;
    agg.newCandidates += m.newCandidates;
    agg.newCompanies += m.newCompanies;
    agg.newJobs += m.newJobs;
    agg.applications += m.applications;
    agg.hires += m.hires;
    agg.revenue += m.revenue;
  }

  return Array.from(weekMap.values())
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .map((w) => ({
      weekStart: formatDate(w.weekStart),
      weekEnd: formatDate(w.weekEnd),
      newCandidates: w.newCandidates,
      newCompanies: w.newCompanies,
      newJobs: w.newJobs,
      applications: w.applications,
      hires: w.hires,
      revenue: Math.round(w.revenue),
    }));
}

/** Group metrics by year-month, sum relevant fields, calculate churnRate per month. */
export function aggregateByMonth(metrics: PlatformMetricsDaily[]): MonthlyAggregate[] {
  if (metrics.length === 0) return [];

  const monthMap = new Map<string, {
    month: string;
    year: number;
    newCandidates: number;
    newCompanies: number;
    newJobs: number;
    applications: number;
    hires: number;
    revenue: number;
    lastMRR: number;
    cancellations: number;
    newSubscriptions: number;
    firstCompanies: number;
  }>();

  for (const m of metrics) {
    const date = parseDate(m.metricDate);
    const year = date.getFullYear();
    const monthNum = date.getMonth() + 1;
    const monthStr = String(monthNum).padStart(2, '0');
    const key = `${year}-${monthStr}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        month: monthStr,
        year,
        newCandidates: 0,
        newCompanies: 0,
        newJobs: 0,
        applications: 0,
        hires: 0,
        revenue: 0,
        lastMRR: 0,
        cancellations: 0,
        newSubscriptions: 0,
        firstCompanies: m.totalCompanies,
      });
    }

    const agg = monthMap.get(key)!;
    agg.newCandidates += m.newCandidates;
    agg.newCompanies += m.newCompanies;
    agg.newJobs += m.newJobs;
    agg.applications += m.applications;
    agg.hires += m.hires;
    agg.revenue += m.revenue;
    agg.lastMRR = m.mrr; // last day of month
    agg.cancellations += m.cancellations;
    agg.newSubscriptions += m.newSubscriptions;
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => {
      const denominator = v.firstCompanies + v.newSubscriptions;
      const churnRate = denominator > 0 ? (v.cancellations / denominator) * 100 : 0;

      return {
        month: v.month,
        year: v.year,
        newCandidates: v.newCandidates,
        newCompanies: v.newCompanies,
        newJobs: v.newJobs,
        applications: v.applications,
        hires: v.hires,
        revenue: Math.round(v.revenue),
        mrr: v.lastMRR,
        churnRate: Math.round(churnRate * 100) / 100,
      };
    });
}

// ---------------------------------------------------------------------------
// Advanced analytics
// ---------------------------------------------------------------------------

/**
 * Build a cohort retention table based on monthly signups.
 * Cohort size = newCandidates + newCompanies per month.
 * Retention is simulated with decay: ~85% month 1, ~70% month 2, ~60% month 3, etc.
 * A deterministic seeded RNG provides slight variation.
 */
export function buildCohortTable(metrics: PlatformMetricsDaily[]): CohortRow[] {
  const monthlyData = aggregateByMonth(metrics);
  if (monthlyData.length === 0) return [];

  // Simple seeded RNG for deterministic cohort retention noise
  let seed = 12345;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Base retention curve (percentage retained after N months)
  const baseRetention = [100, 85, 70, 60, 52, 46, 41, 37, 34, 31, 29, 27, 25];

  return monthlyData.map((monthData, monthIdx) => {
    const totalUsers = monthData.newCandidates + monthData.newCompanies;
    const monthsRemaining = monthlyData.length - monthIdx;
    const maxRetentionMonths = Math.min(monthsRemaining, baseRetention.length);

    const retentionByMonth: number[] = [];
    for (let r = 0; r < maxRetentionMonths; r++) {
      const base = baseRetention[r];
      // Add slight noise: +-5 percentage points
      const noise = (rng() - 0.5) * 10;
      const retention = Math.max(0, Math.min(100, Math.round(base + noise)));
      retentionByMonth.push(retention);
    }

    return {
      cohortMonth: `${monthData.year}-${monthData.month}`,
      totalUsers,
      retentionByMonth,
    };
  });
}

/**
 * Build a funnel with conversion rates relative to the first stage.
 */
export function buildFunnel(stages: { name: string; value: number }[]): FunnelStage[] {
  if (stages.length === 0) return [];

  const firstValue = stages[0].value;

  return stages.map((stage) => ({
    name: stage.name,
    value: stage.value,
    conversionRate: firstValue > 0 ? Math.round((stage.value / firstValue) * 10000) / 100 : 0,
  }));
}

// ---------------------------------------------------------------------------
// Period comparison
// ---------------------------------------------------------------------------

/**
 * Compare sums of key metrics between two periods.
 * Returns an array of metric comparisons with absolute and percentage change.
 */
export function comparePeriods(
  current: PlatformMetricsDaily[],
  previous: PlatformMetricsDaily[],
): {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}[] {
  const sumField = (
    data: PlatformMetricsDaily[],
    field: keyof PlatformMetricsDaily,
  ): number => data.reduce((sum, m) => sum + (m[field] as number), 0);

  const lastValue = (
    data: PlatformMetricsDaily[],
    field: keyof PlatformMetricsDaily,
  ): number => (data.length > 0 ? (data[data.length - 1][field] as number) : 0);

  const metricsToCompare: {
    label: string;
    field: keyof PlatformMetricsDaily;
    mode: 'sum' | 'last';
  }[] = [
    { label: 'Novos Candidatos', field: 'newCandidates', mode: 'sum' },
    { label: 'Novas Empresas', field: 'newCompanies', mode: 'sum' },
    { label: 'Novas Vagas', field: 'newJobs', mode: 'sum' },
    { label: 'Candidaturas', field: 'applications', mode: 'sum' },
    { label: 'Contratacoes', field: 'hires', mode: 'sum' },
    { label: 'Entrevistas Realizadas', field: 'interviewsDone', mode: 'sum' },
    { label: 'Testes Completados', field: 'testsCompleted', mode: 'sum' },
    { label: 'Receita', field: 'revenue', mode: 'sum' },
    { label: 'MRR', field: 'mrr', mode: 'last' },
    { label: 'Total Candidatos', field: 'totalCandidates', mode: 'last' },
    { label: 'Total Empresas', field: 'totalCompanies', mode: 'last' },
    { label: 'Vagas Ativas', field: 'activeJobs', mode: 'last' },
    { label: 'Novas Assinaturas', field: 'newSubscriptions', mode: 'sum' },
    { label: 'Cancelamentos', field: 'cancellations', mode: 'sum' },
  ];

  return metricsToCompare.map(({ label, field, mode }) => {
    const curr = mode === 'sum' ? sumField(current, field) : lastValue(current, field);
    const prev = mode === 'sum' ? sumField(previous, field) : lastValue(previous, field);
    const change = curr - prev;
    const changePercent = calculateGrowthRate(curr, prev);

    return {
      metric: label,
      current: Math.round(curr),
      previous: Math.round(prev),
      change: Math.round(change),
      changePercent: Math.round(changePercent * 100) / 100,
    };
  });
}
